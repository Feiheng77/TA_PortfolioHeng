const S=window.SITE||{tabs:[]},$=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// node graph viewer
const graph=$('graph'),canvas=$('canvas'),label=$('scale');let scale=1,fitting=true;
function apply(next,center=true){const x=(canvas.scrollLeft+canvas.clientWidth/2)/scale,y=(canvas.scrollTop+canvas.clientHeight/2)/scale;scale=Math.max(.03,Math.min(2,next));graph.style.width=`${graph.naturalWidth*scale}px`;graph.style.height=`${graph.naturalHeight*scale}px`;label.value=Math.round(scale*100)+'%';$('minus').disabled=scale<=.03;$('plus').disabled=scale>=2;if(center){canvas.scrollLeft=x*scale-canvas.clientWidth/2;canvas.scrollTop=y*scale-canvas.clientHeight/2;}}
function fit(){if(!graph.naturalWidth||!canvas.clientWidth)return;fitting=true;apply(Math.min((canvas.clientWidth-2)/graph.naturalWidth,(canvas.clientHeight-2)/graph.naturalHeight,1),false);canvas.scrollTo(0,0);}
$('fit').onclick=fit;$('actual').onclick=()=>{fitting=false;apply(1)};$('plus').onclick=()=>{fitting=false;apply(scale*1.5)};$('minus').onclick=()=>{fitting=false;apply(scale/1.5)};
graph.addEventListener('load',fit);if(graph.complete)fit();window.addEventListener('resize',()=>{if(fitting)fit()});canvas.addEventListener('dblclick',()=>{fitting=false;apply(scale<.8?1:scale*1.5)});
let drag=null;canvas.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;drag={x:e.clientX,y:e.clientY,left:canvas.scrollLeft,top:canvas.scrollTop};canvas.setPointerCapture(e.pointerId);canvas.classList.add('dragging')});canvas.addEventListener('pointermove',e=>{if(!drag)return;canvas.scrollLeft=drag.left-(e.clientX-drag.x);canvas.scrollTop=drag.top-(e.clientY-drag.y)});for(const evt of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(evt,()=>{drag=null;canvas.classList.remove('dragging')});

// tabs and video sections, built from data.js (a tab with no videos is not shown)
const tabs=S.tabs.filter(t=>t.type==='nodes'||(t.videos&&t.videos.length)),media=$('media');
$('tabs').innerHTML=tabs.map(t=>`<a href="#${esc(t.id)}" data-view="${esc(t.id)}">${esc(t.title)}</a>`).join('');
const clipHTML=(v,i,caption)=>{const src=esc(v.src);return `<figure class="clip" data-i="${i}">${caption&&v.label?`<figcaption>${esc(v.label)}</figcaption>`:''}<video controls playsinline preload="metadata"><source src="${src}#t=0.1" type="video/mp4">浏览器暂不支持视频播放，请下载视频查看。</video><div class="video-links"><a href="${src}" target="_blank" rel="noopener">新窗口播放 ↗</a><a href="${src}" download>下载视频 ↓</a></div></figure>`};
for(const t of tabs){if(t.type==='nodes')continue;
  const sec=document.createElement('section'),many=t.videos.length>1,sw=many&&t.layout==='switch';
  sec.id=t.id;sec.className='section media';sec.hidden=true;
  sec.innerHTML=`<div class="section-heading"><h2>${esc(t.title)}</h2></div>`+(sw?`<div class="seg">${t.videos.map((v,i)=>`<button type="button" data-i="${i}">${esc(v.label||'视频 '+(i+1))}</button>`).join('')}</div>`:'')+t.videos.map((v,i)=>clipHTML(v,i,many&&!sw)).join('');
  if(sw){const show=i=>{sec.querySelectorAll('.clip').forEach(c=>{const on=+c.dataset.i===i;c.hidden=!on;if(!on)c.querySelector('video').pause()});sec.querySelectorAll('.seg button').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.i===i))};sec.querySelector('.seg').addEventListener('click',e=>{const b=e.target.closest('button');if(b)show(+b.dataset.i)});show(0);}
  media.appendChild(sec);}
document.addEventListener('play',e=>{document.querySelectorAll('video').forEach(v=>{if(v!==e.target)v.pause()})},true);  // one video at a time

function currentView(){let h=location.hash.slice(1);h=(S.aliases&&S.aliases[h])||h;if(h==='details')return 'nodes';return tabs.some(t=>t.id===h)?h:(tabs[0]?tabs[0].id:'nodes');}
function switchView(){const view=currentView(),isNodes=view==='nodes';$('nodes').hidden=$('details').hidden=$('node-nav').hidden=!isNodes;media.querySelectorAll('section').forEach(s=>{s.hidden=s.id!==view;if(s.hidden)s.querySelectorAll('video').forEach(v=>v.pause())});document.querySelectorAll('[data-view]').forEach(a=>{if(a.dataset.view===view)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});if(isNodes)requestAnimationFrame(()=>{if(fitting)fit();if(location.hash==='#details')$('details').scrollIntoView()});else window.scrollTo(0,0)}
window.addEventListener('hashchange',switchView);switchView();
window.addEventListener('load',()=>{if(location.hash!=='#details')setTimeout(()=>window.scrollTo(0,0),0)});  // the browser's own jump to #id on load would cut off the tabs
$('to-top').addEventListener('click',e=>{e.preventDefault();window.scrollTo({top:0,behavior:'smooth'})});  // don't touch the hash, or the page would jump back to the first tab
