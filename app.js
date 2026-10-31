const S=window.SITE||{tabs:[]},$=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// node graph viewer
const graph=$('graph'),canvas=$('canvas'),label=$('scale');let scale=1,fitting=true;
function apply(next,center=true){const x=(canvas.scrollLeft+canvas.clientWidth/2)/scale,y=(canvas.scrollTop+canvas.clientHeight/2)/scale;scale=Math.max(.03,Math.min(2,next));graph.style.width=`${graph.naturalWidth*scale}px`;graph.style.height=`${graph.naturalHeight*scale}px`;label.value=Math.round(scale*100)+'%';$('minus').disabled=scale<=.03;$('plus').disabled=scale>=2;if(center){canvas.scrollLeft=x*scale-canvas.clientWidth/2;canvas.scrollTop=y*scale-canvas.clientHeight/2;}}
function fit(){if(!graph.naturalWidth||!canvas.clientWidth)return;fitting=true;apply(Math.min((canvas.clientWidth-2)/graph.naturalWidth,(canvas.clientHeight-2)/graph.naturalHeight,1),false);canvas.scrollTo(0,0);}
$('fit').onclick=fit;$('actual').onclick=()=>{fitting=false;apply(1)};$('plus').onclick=()=>{fitting=false;apply(scale*1.5)};$('minus').onclick=()=>{fitting=false;apply(scale/1.5)};
graph.addEventListener('load',fit);if(graph.complete)fit();window.addEventListener('resize',()=>{if(fitting)fit()});canvas.addEventListener('dblclick',()=>{fitting=false;apply(scale<.8?1:scale*1.5)});
let drag=null;canvas.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;drag={x:e.clientX,y:e.clientY,left:canvas.scrollLeft,top:canvas.scrollTop};canvas.setPointerCapture(e.pointerId);canvas.classList.add('dragging')});canvas.addEventListener('pointermove',e=>{if(!drag)return;canvas.scrollLeft=drag.left-(e.clientX-drag.x);canvas.scrollTop=drag.top-(e.clientY-drag.y)});for(const evt of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(evt,()=>{drag=null;canvas.classList.remove('dragging')});

// tabs and video sections, built from data.js (a tab with no videos is not shown).
// Nothing heavy loads until its tab is opened: the node graph, the <video>s and B站 players are created on first visit,
// so on a slow line they don't all download at once.
const tabs=S.tabs.filter(t=>t.type==='nodes'||(t.videos&&t.videos.length)),media=$('media'),built={};
$('tabs').innerHTML=tabs.map(t=>`<a href="#${esc(t.id)}" data-view="${esc(t.id)}">${esc(t.title)}</a>`).join('');
const biliURL=id=>`https://player.bilibili.com/player.html?bvid=${encodeURIComponent(id)}&page=1&autoplay=0&danmaku=0&high_quality=1`;
const clipHTML=(v,i,caption)=>{const cap=caption&&v.label?`<figcaption>${esc(v.label)}</figcaption>`:'',src=v.src?esc(v.src):'';
  if(v.bilibili)return `<figure class="clip" data-i="${i}">${cap}<div class="bili"><iframe data-src="${esc(biliURL(v.bilibili))}" title="${esc(v.label||'视频')}" allowfullscreen allow="fullscreen" scrolling="no" frameborder="0"></iframe></div><div class="video-links"><a href="https://www.bilibili.com/video/${esc(v.bilibili)}" target="_blank" rel="noopener">在 B 站打开 ↗</a>${src?`<a href="${src}" download>下载视频 ↓</a>`:''}</div></figure>`;
  return `<figure class="clip" data-i="${i}">${cap}<video controls playsinline preload="metadata"><source src="${src}#t=0.1" type="video/mp4">浏览器暂不支持视频播放，请下载视频查看。</video><div class="video-links"><a href="${src}" target="_blank" rel="noopener">新窗口播放 ↗</a><a href="${src}" download>下载视频 ↓</a></div></figure>`};
// a B站 player can't be paused from here, so a player that goes out of sight is unloaded and comes back when shown
const wake=el=>el.querySelectorAll('iframe[data-src]').forEach(f=>{if(f.getAttribute('src')!==f.dataset.src)f.src=f.dataset.src});
const sleep=el=>{el.querySelectorAll('video').forEach(v=>v.pause());el.querySelectorAll('iframe[data-src]').forEach(f=>{if(f.getAttribute('src'))f.removeAttribute('src')})};
function build(t){const sec=document.createElement('section'),many=t.videos.length>1,sw=many&&t.layout==='switch';
  sec.id=t.id;sec.className='section media';sec.hidden=true;
  sec.innerHTML=`<div class="section-heading"><h2>${esc(t.title)}</h2></div>`+(sw?`<div class="seg">${t.videos.map((v,i)=>`<button type="button" data-i="${i}">${esc(v.label||'视频 '+(i+1))}</button>`).join('')}</div>`:'')+t.videos.map((v,i)=>clipHTML(v,i,many&&!sw)).join('');
  if(sw){const show=i=>{sec.querySelectorAll('.clip').forEach(c=>{const on=+c.dataset.i===i;c.hidden=!on;if(on)wake(c);else sleep(c)});sec.querySelectorAll('.seg button').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.i===i))};sec.querySelector('.seg').addEventListener('click',e=>{const b=e.target.closest('button');if(b)show(+b.dataset.i)});sec.showClip=show;}
  media.appendChild(sec);return sec;}
document.addEventListener('play',e=>{document.querySelectorAll('video').forEach(v=>{if(v!==e.target)v.pause()})},true);  // one video at a time

function currentView(){let h=location.hash.slice(1);h=(S.aliases&&S.aliases[h])||h;if(h==='details')return 'nodes';return tabs.some(t=>t.id===h)?h:(tabs[0]?tabs[0].id:'nodes');}
function switchView(){const view=currentView(),isNodes=view==='nodes';
  $('nodes').hidden=$('details').hidden=$('node-nav').hidden=!isNodes;
  if(isNodes&&!graph.getAttribute('src'))graph.src=graph.dataset.src;
  const t=tabs.find(x=>x.id===view);if(t&&t.type!=='nodes'&&!built[view]){built[view]=build(t);if(built[view].showClip)built[view].showClip(0);}
  media.querySelectorAll('section').forEach(s=>{s.hidden=s.id!==view;if(s.hidden)sleep(s);else if(!s.showClip)wake(s);else s.querySelectorAll('.clip:not([hidden])').forEach(wake)});
  document.querySelectorAll('[data-view]').forEach(a=>{if(a.dataset.view===view)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
  if(isNodes)requestAnimationFrame(()=>{if(fitting)fit();if(location.hash==='#details')$('details').scrollIntoView()});else window.scrollTo(0,0)}
window.addEventListener('hashchange',switchView);switchView();
window.addEventListener('load',()=>{if(location.hash!=='#details')setTimeout(()=>window.scrollTo(0,0),0)});  // the browser's own jump to #id on load would cut off the tabs
$('to-top').addEventListener('click',e=>{e.preventDefault();window.scrollTo({top:0,behavior:'smooth'})});  // don't touch the hash, or the page would jump back to the first tab
