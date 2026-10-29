/* 场景 → 背景音乐文件（music/ 目录，按用户提供的曲名对应）
   prologue 开场：来自平行时空的信
   h1 又是一年桂花香 · h2 下班后的晚风（高中回忆曲）· h3 街角的那家面馆 · h4 樱花开的时候 · h5 原来，我也在慢慢长大
   c1 终于有了自己的小房间 · c2 陌生城市的末班地铁 · c3 终于听到了那场音乐会 · c4 一个人的周末美术馆 · c5 这座城市，也有了我想见的人
   复用（见 music.js 的 ALIAS）：c6 与远方结局 = c1；家乡结局 = h2；终章 = h5
   某项留空则该场景退回程序合成的背景乐 */
window.MUSIC_FILES = {
  prologue: 'music/prologue.m4a',
  h1: 'music/h1.m4a', h2: 'music/h2.m4a', h3: 'music/h3.m4a', h4: 'music/h4.m4a', h5: 'music/h5.m4a',
  c1: 'music/c1.m4a', c2: 'music/c2.m4a', c3: 'music/c3.m4a', c4: 'music/c4.m4a', c5: 'music/c5.m4a'
};
