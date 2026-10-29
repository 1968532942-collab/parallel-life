/* =========================================================
   poster.js — 1080×1920 结局海报（本地 Canvas 绘制，离线可用）
   背景直接复用结局场景的 SVG（主角背影 + 家乡夜街 / 城市夜景），再叠加文字
   ========================================================= */
(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  let url = null, route = null;
  const SERIF = '"Songti SC","STSong","Noto Serif SC","Source Han Serif SC","SimSun",serif';

  function svgImage(svg, w, h) {
    const s = svg.replace('<svg class="art ', `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" class="art `);
    return new Promise((res, rej) => { const img = new Image(); img.onload = () => res(img); img.onerror = rej; img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s); });
  }

  async function draw(r) {
    const E = STORY.endings[r];
    const c = document.createElement('canvas'); c.width = 1080; c.height = 1920;
    const g = c.getContext('2d');
    g.fillStyle = '#0a1322'; g.fillRect(0, 0, 1080, 1920);
    try {
      if (window.POSTER_ART && !window.POSTER_ART_BLOCKED) {
        // 插画版：按 cover 方式裁进上方 1300px
        const img = await new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = window.POSTER_ART[r]; });
        const sw = img.naturalWidth, sh = img.naturalWidth * 1300 / 1080;
        g.drawImage(img, 0, Math.max(0, (img.naturalHeight - sh) * .35), sw, Math.min(sh, img.naturalHeight), 0, 0, 1080, 1300);
        // 本地直接双击打开（file://）时浏览器不允许导出插画，退回矢量背景
        try { g.getImageData(0, 0, 1, 1); } catch (e) { window.POSTER_ART_BLOCKED = true; return draw(r); }
      }
      if (!window.POSTER_ART || window.POSTER_ART_BLOCKED) {
        const art = r === 'home' ? window.HOME_NIGHT(true) : window.CITY_NIGHT(true);
        const img = await svgImage(art, 1080, 1300);
        g.drawImage(img, 0, 0, 1080, 1300);
      }
    } catch (e) { /* 背景绘制失败时保留纯色底，文字照常输出 */ }
    // 飘落的桂花 / 城市微光（少量点缀）
    let seed = r === 'home' ? 3 : 9; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 46; i++) { g.fillStyle = r === 'home' ? `rgba(246,199,102,${.4 + rnd() * .5})` : `rgba(255,226,170,${.25 + rnd() * .4})`; g.beginPath(); g.arc(rnd() * 1080, rnd() * 1150, 2 + rnd() * 4, 0, 7); g.fill(); }
    const fade = g.createLinearGradient(0, 860, 0, 1290); fade.addColorStop(0, 'rgba(10,19,34,0)'); fade.addColorStop(1, 'rgba(10,19,34,1)');
    g.fillStyle = fade; g.fillRect(0, 860, 1080, 432);
    g.fillStyle = '#0a1322'; g.fillRect(0, 1290, 1080, 630);
    // 细边框
    g.strokeStyle = 'rgba(230,198,144,.45)'; g.lineWidth = 2; g.strokeRect(44, 44, 992, 1832);
    g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.fillStyle = 'rgba(240,222,190,.9)'; g.font = `30px ${SERIF}`;
    g.fillText('如 果 那 天 ， 我 选 择 了 另 一 条 路', 540, 128);
    g.fillStyle = '#e6c690'; g.font = '26px Georgia, serif';
    g.fillText(STORY.routes[r].en.split('').join(String.fromCharCode(8202)), 540, 1400);
    g.fillStyle = '#fbf1df'; g.font = `500 120px ${SERIF}`;
    spaced(g, E.title, 540, 1548, 40);
    g.fillStyle = 'rgba(230,198,144,.85)'; g.font = '26px Georgia, serif';
    g.fillText(E.en, 540, 1606);
    g.fillStyle = '#f1d3a0'; g.font = `40px ${SERIF}`;
    g.fillText(E.sub, 540, 1690);
    g.fillStyle = 'rgba(230,226,217,.88)'; g.font = `32px ${SERIF}`;
    E.poster.forEach((l, i) => g.fillText(l, 540, 1764 + i * 50));
    return c;
  }
  function spaced(g, text, cx, y, sp) {
    const chars = text.split(''); const ws = chars.map(ch => g.measureText(ch).width);
    const total = ws.reduce((a, b) => a + b, 0) + sp * (chars.length - 1);
    let x = cx - total / 2; g.textAlign = 'left';
    chars.forEach((ch, i) => { g.fillText(ch, x, y); x += ws[i] + sp; });
    g.textAlign = 'center';
  }

  async function open(r) {
    route = r;
    const m = $('#posterModal'), im = $('#posterImg');
    im.removeAttribute('src');
    m.classList.add('open');
    try {
      const c = await draw(r);
      c.toBlob(b => {
        if (!b) { im.src = c.toDataURL('image/png'); return; }
        if (url) URL.revokeObjectURL(url);
        url = URL.createObjectURL(b); im.src = url;
      }, 'image/png');
    } catch (e) { ENGINE.toast('海报生成失败，请换用较新的浏览器再试'); close(); }
  }
  function close() { $('#posterModal').classList.remove('open'); }
  $('#closePoster').onclick = close;
  $('#posterModal').addEventListener('click', e => { if (e.target.id === 'posterModal') close(); });
  $('#savePoster').onclick = () => {
    const src = $('#posterImg').getAttribute('src'); if (!src) return;
    const a = document.createElement('a'); a.href = src; a.download = `我的平行人生-${STORY.endings[route].title}.png`;
    document.body.appendChild(a); a.click(); a.remove();
    ENGINE.toast('已开始下载；若没有反应，请长按图片保存');
  };
  window.POSTER = { open, close, draw };
})();
