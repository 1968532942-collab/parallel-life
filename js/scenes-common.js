/* =========================================================
   scenes-common.js — 场景工具 + 标题页 / 序章 / 终章
   每个场景：SCENES[name] = { build(initFlags) => {cam, fp}, enter(root), flag(root,name,on), leave(root) }
   画布坐标统一为 400×780（9:16 竖屏），preserveAspectRatio=slice 保证铺满
   ========================================================= */
(function () {
  'use strict';
  const F = window.FIG;

  /* ---------- 纸张肌理：运行时用 Canvas 生成一次（离线可用） ---------- */
  (function paper() {
    try {
      const c = document.createElement('canvas'); c.width = c.height = 340;
      const g = c.getContext('2d');
      g.fillStyle = '#fbf6ee'; g.fillRect(0, 0, 340, 340);
      let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      for (let i = 0; i < 26; i++) { const x = rnd() * 340, y = rnd() * 340, r = 30 + rnd() * 90; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(200,180,150,${0.05 + rnd() * 0.06})`); gr.addColorStop(1, 'rgba(200,180,150,0)'); g.fillStyle = gr; g.fillRect(0, 0, 340, 340); }
      for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(120,100,80,${rnd() * 0.12})`; g.fillRect(rnd() * 340, rnd() * 340, 1, 1); }
      g.lineWidth = 0.6;
      for (let i = 0; i < 140; i++) { const x = rnd() * 340, y = rnd() * 340, a = rnd() * 6.3, l = 4 + rnd() * 12; g.strokeStyle = `rgba(150,130,105,${0.05 + rnd() * 0.08})`; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l / 2 + 2, y + Math.sin(a) * l / 2, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
      document.documentElement.style.setProperty('--paper-tex', `url(${c.toDataURL('image/png')})`);
    } catch (e) {}
  })();

  /* ---------- 工具 ---------- */
  const U = {};
  U.svg = (inner, vb, cls) => `<svg class="art ${cls || ''}" viewBox="${vb || '0 0 400 780'}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${inner}</svg>`;
  U.shot = (name, inner, extra) => `<div class="shot shot-${name}" data-shot="${name}">${inner}${extra || ''}</div>`;
  U.rand = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(42);
  U.lg = (id, stops, x2, y2) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2 == null ? 0 : x2}" y2="${y2 == null ? 1 : y2}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('')}</linearGradient>`;
  U.rg = (id, stops, cx, cy, r) => `<radialGradient id="${id}" cx="${cx || .5}" cy="${cy || .5}" r="${r || .5}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('')}</radialGradient>`;
  /* 飘落物：osm 桂花 / petal 樱花瓣 / leaf 树叶 / snow 雪 */
  U.fall = (kind, n, o) => {
    o = o || {};
    let h = '';
    for (let i = 0; i < n; i++) {
      const t = (o.t0 || 10) + ((i * 37) % 10) / 10 * ((o.t1 || 16) - (o.t0 || 10));
      const x = (o.x0 || 0) + ((i * 61 + 13) % 100) / 100 * ((o.x1 || 100) - (o.x0 || 0));
      const s = (o.s0 || 6) + ((i * 53) % 10) / 10 * ((o.s1 || 10) - (o.s0 || 6));
      const y = o.y != null ? o.y : -4;
      h += `<i class="${kind}" style="--x:${x.toFixed(1)}%;--y:${y}%;--t:${t.toFixed(1)}s;--d:-${((i * 2.7) % t).toFixed(1)}s;--sw:${(i % 2 ? 1 : -1) * (10 + (i * 7) % 22)}px;--s:${s.toFixed(1)}px;--to:${o.to || 80}vh"></i>`;
    }
    return `<div class="fall ${o.cls || ''}">${h}</div>`;
  };
  U.stars = (n, h) => { let s = ''; for (let i = 0; i < n; i++) { const x = (i * 97 + 31) % 400, y = (i * 53 + 11) % (h || 300); s += `<circle class="twinkle" style="--d:-${(i * .37) % 3}s" cx="${x}" cy="${y}" r="${.5 + (i % 3) * .45}" fill="#fff4dc"/>`; } return s; };
  /* 根部固定在地面的树：只有树冠 .canopy 摆动 */
  U.tree = (x, gy, s, kind) => {
    const K = {
      osm: { trunk: '#4a3f3a', c: ['#2f5146', '#3c6153', '#4f7563'], dot: '#efc25e' },
      cherry: { trunk: '#5a4644', c: ['#e8c3c4', '#f1d4d2', '#f8e6e2'], dot: '#ffffff' },
      green: { trunk: '#3f3b39', c: ['#2c4a45', '#365a52', '#46695e'], dot: null },
      dusk: { trunk: '#2e2c36', c: ['#2a3a48', '#33465a', '#3f5468'], dot: null },
      bare: { trunk: '#3a3434', c: ['#5d6b73', '#6f7c84', '#7f8b91'], dot: null }
    }[kind || 'green'];
    let dots = '';
    if (K.dot) for (let i = 0; i < 46; i++) { const a = i * 2.4, r = 20 + (i * 13) % 70; dots += `<circle cx="${(Math.cos(a) * r).toFixed(1)}" cy="${(-150 + Math.sin(a) * r * .62).toFixed(1)}" r="${kind === 'cherry' ? 2.4 : 1.6}" fill="${K.dot}" opacity="${kind === 'cherry' ? .55 : .9}"/>`; }
    return `<g transform="translate(${x} ${gy}) scale(${s})">
      <path d="M-9 0Q-6 -50 -7 -96Q-3 -104 0 -112Q4 -104 8 -96Q6 -50 10 0Z" fill="${K.trunk}"/>
      <path d="M-4 -60Q-24 -84 -40 -96M3 -74Q20 -96 36 -106" stroke="${K.trunk}" stroke-width="5" fill="none" stroke-linecap="round"/>
      <g class="canopy" style="animation-delay:-${(x % 5).toFixed(1)}s">
        <ellipse cx="-38" cy="-128" rx="52" ry="40" fill="${K.c[0]}"/><ellipse cx="34" cy="-136" rx="56" ry="42" fill="${K.c[0]}"/>
        <ellipse cx="0" cy="-166" rx="66" ry="48" fill="${K.c[1]}"/><ellipse cx="-30" cy="-176" rx="38" ry="30" fill="${K.c[2]}" opacity=".9"/>
        <ellipse cx="34" cy="-180" rx="30" ry="24" fill="${K.c[2]}" opacity=".75"/><ellipse cx="-56" cy="-150" rx="26" ry="20" fill="${K.c[1]}"/>
        <path d="M-80 -120Q-60 -100 -30 -98M10 -96Q50 -96 80 -116" stroke="${K.c[0]}" stroke-width="10" fill="none" stroke-linecap="round" opacity=".7"/>
        ${dots}
      </g></g>`;
  };
  /* 透视老街两侧房屋（家乡） */
  U.lamp = (x, gy, s, on) => `<g transform="translate(${x} ${gy}) scale(${s})"><path d="M-2 0V-118" stroke="#2f3540" stroke-width="4"/><path d="M-2 -116Q6 -126 16 -120" stroke="#2f3540" stroke-width="3" fill="none"/><path d="M10 -122h14l-3 8h-8z" fill="#2f3540"/><ellipse cx="17" cy="-112" rx="5" ry="3" fill="${on === false ? '#7b7466' : '#ffe2a6'}"/>${on === false ? '' : '<circle cx="17" cy="-108" r="34" fill="url(#lampGlow)" class="lampGlow"/>'}</g>`;
  U.lampGlowDef = U.rg('lampGlow', [[0, '#ffe2a6', .55], [1, '#ffd590', 0]]);
  window.SCN = U;
  window.SCENES = {};

  /* =========================================================
     标题页
     ========================================================= */
  SCENES.title = {
    build() {
      const art = U.svg(`<defs>${U.lg('tSky', [[0, '#0b1628'], [.55, '#1d3150'], [.8, '#5a5068'], [1, '#2a2f44']])}${U.rg('tGlow', [[0, '#f6d29b', .5], [1, '#f6d29b', 0]])}</defs>
        <rect width="400" height="780" fill="url(#tSky)"/>${U.stars(70, 380)}
        <circle cx="200" cy="470" r="240" fill="url(#tGlow)"/>
        <path d="M0 520Q90 470 170 492T400 480V780H0Z" fill="#1c2a40"/>
        <path d="M0 560Q120 520 230 548T400 540V780H0Z" fill="#141f33"/>
        <g opacity=".9">${Array.from({ length: 22 }, (_, i) => `<circle class="twinkle" style="--d:-${i * .3}s" cx="${20 + i * 17}" cy="${514 + (i * 7) % 18}" r="1.4" fill="#ffd9a0"/>`).join('')}</g>
        <path d="M150 780L192 560Q200 548 208 560L250 780Z" fill="#1d2a3d"/>`);
      const hero = `<img class="title-hero" src="${window.HEROINE_SRC}" alt="">`;
      return { cam: U.shot('t', art, hero + U.fall('glow', 14, { t0: 14, t1: 22, s0: 2, s1: 4 })) };
    }
  };

  /* =========================================================
     序章：信封 + 分岔路
     ========================================================= */
  SCENES.prologue = {
    build() {
      const night = U.svg(`<defs>${U.lg('pSky', [[0, '#081222'], [.6, '#122540'], [1, '#1e3150']])}${U.rg('pGlow', [[0, '#f3d3a0', .42], [1, '#f3d3a0', 0]])}</defs>
        <rect width="400" height="780" fill="url(#pSky)"/>${U.stars(90, 560)}
        <circle cx="200" cy="330" r="190" fill="url(#pGlow)"/>
        <path d="M0 640Q110 600 220 622T400 610V780H0Z" fill="#15233a"/>
        <path d="M0 690Q150 650 280 672T400 666V780H0Z" fill="#0e1828"/>
        ${Array.from({ length: 16 }, (_, i) => `<circle class="twinkle" style="--d:-${i * .4}s" cx="${12 + i * 25}" cy="${628 + (i * 5) % 14}" r="1.3" fill="#ffdca6"/>`).join('')}`);
      const letter = `<div class="envelope" data-hit="envelope"><div class="env-back"></div><div class="env-paper"></div><div class="env-front"></div><div class="env-flap"></div><div class="env-seal">✦</div></div>
        <article class="letter"><div class="lt-to">TO · 另一个时空的我</div>${STORY.letter.map((t, i) => `<p class="ln ln${i + 1}">${t}</p>`).join('')}<div class="lt-sign">—— 来自平行时空的我</div></article>`;
      const road = U.svg(`<defs>${U.lg('rSky', [[0, '#1a2c4c'], [.45, '#56577a'], [.62, '#c08f7e'], [.72, '#e8c39a'], [1, '#e8c39a']])}${U.lg('rRoad', [[0, '#c9a98c'], [1, '#4c4a55']])}${U.rg('rHome', [[0, '#ffd99b', .7], [1, '#ffd99b', 0]])}${U.rg('rCity', [[0, '#ffc89a', .7], [1, '#9fc3ff', 0]])}</defs>
        <rect width="400" height="780" fill="url(#rSky)"/>
        <circle cx="105" cy="350" r="110" fill="url(#rHome)" class="glowL"/><circle cx="300" cy="340" r="120" fill="url(#rCity)" class="glowR"/>
        <!-- 城市天际线（右） -->
        <g fill="#3d4766">${[[226, 262, 18], [246, 230, 16], [264, 286, 14], [280, 210, 22], [304, 250, 16], [322, 196, 20], [344, 270, 18], [364, 240, 22], [388, 280, 14]].map(([x, y, w]) => `<rect x="${x}" y="${y}" width="${w}" height="${360 - y}"/>`).join('')}</g>
        <g fill="#ffd9a6" opacity=".8">${Array.from({ length: 40 }, (_, i) => `<rect class="twinkle" style="--d:-${i * .23}s" x="${230 + (i * 37) % 160}" y="${220 + (i * 29) % 120}" width="2.2" height="3"/>`).join('')}</g>
        <!-- 家乡小城（左） -->
        <g fill="#5d5a64"><path d="M0 360V328L22 314L44 328V360Z"/><path d="M40 360V320L68 300L96 320V360Z"/><path d="M92 360V334L112 320L132 334V360Z"/><path d="M126 360V326L150 310L174 326V360Z"/></g>
        <g fill="#ffdca0">${[[12, 338], [56, 330], [76, 334], [106, 342], [140, 336], [158, 340]].map(([x, y]) => `<rect class="twinkle" style="--d:-${x % 3}s" x="${x}" y="${y}" width="5" height="6"/>`).join('')}</g>
        ${U.tree(30, 362, .32, 'osm')}${U.tree(176, 360, .26, 'osm')}
        <!-- 田野与道路 -->
        <path d="M0 360H400V780H0Z" fill="#46524f"/>
        <path d="M0 360Q100 380 200 372T400 366V420Q300 400 200 410T0 420Z" fill="#596459"/>
        <path d="M0 470Q120 440 200 452T400 450V780H0Z" fill="#3a4743"/>
        <path d="M0 600Q140 560 220 580T400 570V780H0Z" fill="#2c3836"/>
        <path class="road" d="M84 780L186 452Q200 436 214 452L316 780Z" fill="url(#rRoad)"/>
        <path class="roadL" d="M188 456Q160 410 120 384Q100 372 84 368L96 366Q122 370 146 382Q178 400 200 440Z" fill="#b39a86"/>
        <path class="roadR" d="M212 456Q240 410 280 384Q300 372 318 366L306 364Q278 370 254 382Q222 400 200 440Z" fill="#b39a86"/>
        <path class="laneL" d="M196 448Q160 400 104 372" stroke="#ffe6b8" stroke-width="2" fill="none" stroke-dasharray="6 8"/>
        <path class="laneR" d="M204 448Q240 400 296 370" stroke="#ffe6b8" stroke-width="2" fill="none" stroke-dasharray="6 8"/>
        <path d="M200 780V470" stroke="#f3dfbd" stroke-width="3" stroke-dasharray="22 26" opacity=".7"/>
        <path d="M0 780V700Q40 690 60 720L70 780Z M400 780V690Q352 684 336 716L330 780Z" fill="#1f2a29"/>
        ${[[30, 704], [372, 698], [52, 724], [356, 722]].map(([x, y]) => `<path d="M${x} ${y}q-4 -20 2 -36M${x + 5} ${y}q2 -18 9 -30M${x - 4} ${y}q-8 -14 -14 -22" stroke="#33423f" stroke-width="3" fill="none" class="grass"/>`).join('')}
      `);
      const roadLabels = `<div class="road-label l">家乡</div><div class="road-label r">远方</div>`;
      return { cam: U.shot('night', night, letter + U.fall('glow', 12, { t0: 14, t1: 22, s0: 2, s1: 4 })) + U.shot('road', road, roadLabels) };
    }
  };

  /* =========================================================
     终章：两条路在远处以光影呼应（左右对称，不偏向任何一边）
     ========================================================= */
  SCENES.finale = {
    build() {
      const art = U.svg(`<defs>${U.lg('fSky', [[0, '#0f1d36'], [.5, '#3c4467'], [.75, '#9a7f86'], [1, '#d9b48f']])}${U.rg('fL', [[0, '#ffd99b', .6], [1, '#ffd99b', 0]])}${U.rg('fR', [[0, '#ffd2a4', .6], [1, '#ffd2a4', 0]])}${U.rg('fDawn', [[0, '#ffe3b8', .7], [1, '#ffe3b8', 0]])}</defs>
        <rect width="400" height="780" fill="url(#fSky)"/>${U.stars(50, 300)}
        <circle class="dawn" cx="200" cy="470" r="230" fill="url(#fDawn)"/>
        <circle cx="96" cy="470" r="100" fill="url(#fL)"/><circle cx="304" cy="470" r="100" fill="url(#fR)"/>
        <g fill="#535468"><path d="M30 486V462L48 450L66 462V486Z"/><path d="M62 486V456L86 440L110 456V486Z"/><path d="M106 486V466L124 454L142 466V486Z"/></g>
        <g fill="#535468">${[[262, 430, 14], [278, 410, 16], [296, 440, 12], [310, 400, 18], [330, 428, 14], [346, 446, 12]].map(([x, y, w]) => `<rect x="${x}" y="${y}" width="${w}" height="${486 - y}"/>`).join('')}</g>
        <g fill="#ffdca0">${Array.from({ length: 18 }, (_, i) => `<rect class="twinkle" style="--d:-${i * .3}s" x="${i < 9 ? 38 + (i * 11) % 96 : 266 + (i * 13) % 90}" y="${i < 9 ? 466 + (i * 5) % 14 : 420 + (i * 17) % 56}" width="2.6" height="3.4"/>`).join('')}</g>
        <path d="M0 486H400V780H0Z" fill="#3d4652"/>
        <path d="M0 530Q200 500 400 530V780H0Z" fill="#323a46"/>
        <path d="M150 780L194 560Q200 550 206 560L250 780Z" fill="#a78f80"/>
        <path d="M194 562Q150 520 96 490L104 488Q156 512 200 552Z" fill="#9b8678"/>
        <path d="M206 562Q250 520 304 490L296 488Q244 512 200 552Z" fill="#9b8678"/>
        <path class="beamL" d="M198 556Q150 516 98 488" stroke="#ffe3b0" stroke-width="2" fill="none" stroke-dasharray="4 7"/>
        <path class="beamR" d="M202 556Q250 516 302 488" stroke="#ffe3b0" stroke-width="2" fill="none" stroke-dasharray="4 7"/>
        ${F.heroineBack({ x: 200, y: 668, s: .22, walk: false })}
        <path d="M0 780V720Q60 700 90 740L96 780ZM400 780V716Q344 700 312 738L306 780Z" fill="#232a33"/>`);
      return { cam: U.shot('f', art, U.fall('glow', 18, { t0: 16, t1: 24, s0: 2, s1: 4 })) };
    }
  };
})();
