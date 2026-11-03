// 页面上有哪些标签、每个标签放哪些视频，都在这一个文件里。
// 改顺序就挪行；layout: "stack" = 视频上下排，"switch" = 视频上方一排小按钮切换。
// poster = 封面图：页面先显示封面，点了播放才开始下载视频。
window.SITE = {
  tabs: [
    {id: "grass", title: "草风交互", videos: [
      {src: "assets/grass-interaction.mp4", poster: "assets/grass-interaction.jpg"}
    ]},
    {id: "water", title: "水体渲染", layout: "stack", videos: [
      {src: "assets/water-showcase.mp4", poster: "assets/water-showcase.jpg", label: "展示"},
      {src: "assets/water-debug.mp4", poster: "assets/water-debug.jpg", label: "调试界面"}
    ]},
    {id: "nodes", title: "水体节点图", type: "nodes"},
    {id: "postfx", title: "后处理效果", layout: "stack", videos: [
      {src: "assets/postfx-showcase.mp4", poster: "assets/postfx-showcase.jpg", label: "展示"},
      {src: "assets/postfx-tuning.mp4", poster: "assets/postfx-tuning.jpg", label: "调参过程"}
    ]},
    {id: "tools", title: "工具展示", videos: [
      {src: "assets/tools-showcase.mp4", poster: "assets/tools-showcase.jpg"}
    ]}
  ],
  aliases: {video: "water"}  // 以前发出去的 #video 链接还能打开水体
};
