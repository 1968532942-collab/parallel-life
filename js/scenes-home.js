/* =========================================================
   scenes-home.js — 家乡线五幕 + 点灯人结局
   色彩：暖米白、桂花淡金、樱花浅粉、秋日暖灰、夜晚灰蓝、柔和暖黄灯光
   ========================================================= */
(function () {
  'use strict';
  const U = window.SCN, F = window.FIG;
  const fam = {
    mom: o => F.fig(Object.assign({ hs: 'bob', hair: '#3a3634', coat: '#8c6f62', coat2: '#775c50', pants: '#3d3a40' }, o)),
    dad: o => F.fig(Object.assign({ hs: 'short', hair: '#2b2a2c', coat: '#4d5a66', coat2: '#3f4a55', pants: '#2c3038', s: 1.06 }, o))
  };
  const student = (o, i) => F.fig(Object.assign({ hs: ['short', 'bob', 'pony', 'short', 'long', 'short'][i % 6], hair: '#24272f', coat: i % 2 ? '#3d5f92' : '#e9e6df', coat2: i % 2 ? '#2e4a75' : '#c9c6bf', inner: '#3d5f92', pants: '#2c3a59', bag: 'backpack', bagColor: ['#7b5a4f', '#4f6b7a', '#8a6f4a', '#5b5f7a'][i % 4], shoe: '#e9e4dc' }, o));

  /* 老街两侧的房屋（透视） */
  function oldStreet(dark) {
    const wall = dark ? '#6d6670' : '#c9b49a', wall2 = dark ? '#5a5560' : '#b49e86', roof = dark ? '#2f3340' : '#4a4d55', win = dark ? '#ffd796' : '#f6d6a0';
    return `
      <path d="M0 210L170 330V440L0 560Z" fill="${wall}"/>
      <path d="M0 196L178 322L172 334L0 214Z" fill="${roof}"/>
      <g fill="${win}">${[[24, 300, 30, 52], [80, 330, 22, 40], [124, 352, 14, 30], [150, 368, 9, 20]].map(([x, y, w, h]) => `<path d="M${x} ${y}h${w}v${h}h-${w}Z" opacity=".85"/><path d="M${x} ${y + h / 2}h${w}M${x + w / 2} ${y}v${h}" stroke="#7a5a3f" stroke-width="1.2" opacity=".5"/>`).join('')}</g>
      <path d="M0 470L60 438V500L0 528Z" fill="${wall2}"/><rect x="10" y="456" width="34" height="52" fill="#5a4a40" transform="skewY(-26)" opacity=".7"/>
      <path d="M400 214L232 330V440L400 560Z" fill="${wall2}"/>
      <path d="M400 198L224 322L230 334L400 216Z" fill="${roof}"/>
      <g fill="${win}">${[[346, 300, 30, 52], [298, 330, 22, 40], [262, 352, 14, 30], [238, 368, 9, 20]].map(([x, y, w, h]) => `<path d="M${x} ${y}h${w}v${h}h-${w}Z" opacity=".85"/>`).join('')}</g>
      <path d="M170 330L200 316L232 330V440H170Z" fill="${dark ? '#4b4c5c' : '#a6927f'}"/>
      <path d="M150 300L200 268L250 300Z" fill="${roof}"/>
      <rect x="190" y="352" width="20" height="26" fill="${win}" opacity=".9"/>`;
  }

  /* ---------------- 第一幕 桂花 ---------------- */
  SCENES.osmanthus = {
    build() {
      const art = U.svg(`<defs>${U.lg('oSky', [[0, '#7f93a6'], [.35, '#d9bf9c'], [.55, '#efd2a6'], [1, '#d7b58c']])}${U.lampGlowDef}${U.lg('oRoad', [[0, '#b8a28c'], [1, '#6f6460']])}${U.rg('oSun', [[0, '#fff0c8', .9], [1, '#ffe2a8', 0]])}</defs>
        <rect width="400" height="780" fill="url(#oSky)"/>
        <circle cx="200" cy="300" r="120" fill="url(#oSun)"/>
        ${oldStreet(false)}
        <path d="M40 780L186 440H214L360 780Z" fill="url(#oRoad)"/>
        <path d="M0 560L170 440H186L40 780H0Z" fill="#9c8a7a"/><path d="M400 560L232 440H214L360 780H400Z" fill="#9c8a7a"/>
        <path d="M200 780V450" stroke="#e9dccb" stroke-width="2" stroke-dasharray="14 20" opacity=".45"/>
        ${U.lamp(150, 456, .45)}${U.lamp(266, 452, .42)}
        <g opacity=".75">${F.fig({ x: 206, y: 452, s: .16, view: 'back', walk: true, coat: '#6b5a52', hs: 'short' })}${F.fig({ x: 188, y: 448, s: .14, view: 'front', walk: true, coat: '#8a7466', hs: 'bob' })}</g>
        ${U.tree(36, 640, 1.75, 'osm')}${U.tree(374, 628, 1.6, 'osm')}
        <circle data-hit="blossom" cx="200" cy="360" r="46" fill="transparent"/>`);
      const fall = U.fall('osm', 30, { x0: 4, x1: 96, t0: 7, t1: 11, s0: 5, s1: 8 }) + U.fall('osm', 22, { x0: 0, x1: 100, t0: 6, t1: 9, s0: 5, s1: 8, cls: 'windy' });
      const palm = `<div class="palm"><svg viewBox="0 0 220 340" aria-hidden="true">${F.palmSvg().replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '').replace('M58 240L66 158H156L166 240Z', 'M52 340L66 158H156L172 340Z')}</svg><span class="caught"></span></div>`;
      return { cam: U.shot('s', art, fall), fp: palm };
    }
  };

  /* ---------------- 第二幕 晚风、校门、闪回 ---------------- */
  SCENES.walk = {
    build() {
      const walkArt = U.svg(`<defs>${U.lg('wSky', [[0, '#26375a'], [.45, '#5b5d82'], [.7, '#b28a92'], [1, '#d7a88c']])}${U.lampGlowDef}${U.lg('wRoad', [[0, '#7f7a86'], [1, '#3b3e4c']])}</defs>
        <rect width="400" height="780" fill="url(#wSky)"/>
        <circle cx="300" cy="170" r="20" fill="#f6ead2" opacity=".9"/><circle cx="300" cy="170" r="46" fill="#f6ead2" opacity=".12"/>
        <g class="walk-bg">
          <g fill="#4a4d66"><rect x="0" y="250" width="70" height="230"/><rect x="62" y="300" width="70" height="170"/><rect x="290" y="240" width="74" height="240"/><rect x="350" y="290" width="60" height="190"/></g>
          <g fill="#ffd8a0" opacity=".85">${Array.from({ length: 30 }, (_, i) => `<rect class="twinkle" style="--d:-${i * .3}s" x="${i < 15 ? 8 + (i * 17) % 110 : 298 + (i * 19) % 96}" y="${262 + (i * 23) % 190}" width="7" height="8"/>`).join('')}</g>
          <path d="M0 470L170 420H230L400 470V780H0Z" fill="#555a6c"/>
          <path d="M60 780L186 424H214L340 780Z" fill="url(#wRoad)"/>
          <path d="M0 520L150 432L150 444L0 540Z" fill="#6f6a76"/><path d="M400 520L250 432L250 444L400 540Z" fill="#6f6a76"/>
          ${U.lamp(118, 470, .55)}${U.lamp(292, 466, .52)}${U.lamp(160, 430, .26)}${U.lamp(242, 428, .24)}
          ${U.tree(66, 520, .9, 'dusk')}${U.tree(334, 516, .86, 'dusk')}${U.tree(140, 446, .42, 'dusk')}${U.tree(262, 444, .4, 'dusk')}
        </g>
        ${U.tree(-6, 700, 1.5, 'dusk')}${U.tree(412, 690, 1.4, 'dusk')}
        <g class="family">${fam.dad({ x: 176, y: 590, s: 1.12, view: 'back', walk: true })}${fam.mom({ x: 232, y: 594, s: 1.06, view: 'back', walk: true, delay: -.4 })}</g>`);
      const leaves = U.fall('leaf', 9, { x0: 0, x1: 100, t0: 11, t1: 17, s0: 9, s1: 14 });

      const gateBase = (past) => `
        <rect width="400" height="780" fill="url(#${past ? 'gPast' : 'gSky'})"/>
        <path d="M30 380V230H370V380Z" fill="${past ? '#c9a88a' : '#3e4560'}"/>
        <path d="M20 236L200 196L380 236Z" fill="${past ? '#9c7e66' : '#2d3349'}"/>
        <g fill="${past ? '#f3dcb4' : '#ffe0a8'}">${Array.from({ length: 24 }, (_, i) => `<rect class="${past ? '' : 'twinkle'}" style="--d:-${i * .2}s" x="${48 + (i % 8) * 40}" y="${252 + Math.floor(i / 8) * 40}" width="22" height="24" opacity="${past ? .5 : .9}"/>`).join('')}</g>
        <path d="M0 420H400V780H0Z" fill="${past ? '#b49a7f' : '#4c5064'}"/>
        <path d="M70 780L170 430H230L330 780Z" fill="${past ? '#c9ae92' : '#5d6074'}"/>
        <rect x="96" y="300" width="34" height="140" fill="${past ? '#a88a70' : '#393f55'}"/><rect x="270" y="300" width="34" height="140" fill="${past ? '#a88a70' : '#393f55'}"/>
        <rect x="88" y="288" width="50" height="16" fill="${past ? '#8f735c' : '#2c3246'}"/><rect x="262" y="288" width="50" height="16" fill="${past ? '#8f735c' : '#2c3246'}"/>
        <rect x="130" y="306" width="140" height="24" fill="${past ? '#8a6f5a' : '#5a3f3c'}"/>
        <text x="200" y="324" text-anchor="middle" font-size="15" letter-spacing="6" fill="${past ? '#f3e2c4' : '#f1d39b'}" font-family="STSong,Songti SC,serif">城南中学</text>
        <path d="M30 440V400H96V440ZM304 440V400H370V440Z" fill="${past ? '#a08670' : '#3f4459'}"/>
        <path d="M138 440V436H170V440ZM230 440V436H262V440Z" fill="#888"/>`;
      const gateArt = U.svg(`<defs>${U.lg('gSky', [[0, '#1b2846'], [.6, '#3e4466'], [1, '#6a6278']])}${U.lampGlowDef}</defs>
        ${gateBase(false)}${U.stars(30, 200)}
        <g class="bell-waves"><path d="M200 200q20 -10 0 -24M212 206q32 -18 0 -40M188 200q-20 -10 0 -24M176 206q-32 -18 0 -40" stroke="#f6dca8" stroke-width="2" fill="none"/></g>
        ${U.lamp(60, 444, .6)}${U.lamp(340, 444, .6)}
        <rect data-hit="gate" x="132" y="330" width="136" height="110" fill="transparent"/>
        <g class="students">
          ${[['-110', '160', 'side', true], ['-60', '210', 'front', false], ['90', '170', 'side', false], ['130', '240', 'front', false], ['-150', '260', 'side', true], ['40', '250', 'side', false]].map(([dx, dy, view, flip], i) => `<g class="stu" style="--dx:${dx}px;--dy:${dy}px;--dl:${i * .35}s">${student({ x: 200 + (i % 3 - 1) * 14, y: 448, s: .5 + (i % 2) * .04, view, flip, walk: true, talk: i % 2 === 0, delay: -i * .2 }, i)}</g>`).join('')}
          <g class="stu bikeStu" style="--dx:150px;--dy:200px;--dl:.5s">${F.bike({ x: 214, y: 450, s: .5, color: '#6a8290' })}${student({ x: 196, y: 450, s: .5, view: 'side', arm: 'push', walk: true }, 7)}</g>
        </g>
        ${fam.dad({ x: 64, y: 700, s: 1.25, view: 'back' })}${fam.mom({ x: 122, y: 706, s: 1.2, view: 'back' })}`);
      const flashArt = U.svg(`<defs>${U.lg('gPast', [[0, '#e9cfa3'], [.6, '#e5bf94'], [1, '#c99f7c']])}${U.rg('leak', [[0, '#fff1d0', .8], [1, '#ffd9a0', 0]])}</defs>
        ${gateBase(true)}
        <circle cx="330" cy="150" r="200" fill="url(#leak)"/>
        ${U.tree(40, 470, .9, 'green')}${U.tree(366, 470, .86, 'green')}
        <g class="past-walk">
          ${student({ x: 236, y: 560, s: .9, view: 'side', walk: true, talk: true }, 1)}
          ${F.youngSelf({ x: 180, y: 566, s: .94, talk: true, delay: -.3 })}
          ${student({ x: 124, y: 572, s: .92, view: 'side', walk: true, delay: -.6 }, 3)}
        </g>
        <rect width="400" height="780" fill="#7a5a3a" opacity=".12"/>`);
      return { cam: U.shot('walk', walkArt, leaves) + U.shot('gate', gateArt, U.fall('leaf', 5, { t0: 13, t1: 18, s0: 8, s1: 12 })) + U.shot('flash', flashArt, '<div class="flash-frame"></div>' + U.fall('glow', 14, { t0: 12, t1: 18, s0: 2, s1: 5 })) };
    }
  };

  /* ---------------- 第三幕 面馆 ---------------- */
  SCENES.noodle = {
    build() {
      const ext = U.svg(`<defs>${U.lg('nSky', [[0, '#121e33'], [1, '#2f3c58']])}${U.rg('nWarm', [[0, '#ffcf8a', .85], [1, '#ffb066', 0]])}${U.lampGlowDef}</defs>
        <rect width="400" height="780" fill="url(#nSky)"/>
        <rect x="0" y="120" width="400" height="460" fill="#3a3f52"/>
        <path d="M0 120H400V150H0Z" fill="#262a38"/>
        <g fill="#5a5f74">${[0, 1, 2, 3].map(i => `<rect x="${30 + i * 92}" y="160" width="60" height="50"/>`).join('')}</g>
        <rect x="60" y="232" width="280" height="44" fill="#6b3b32"/><rect x="66" y="238" width="268" height="32" fill="none" stroke="#d9a964" stroke-width="1.5"/>
        <text x="200" y="262" text-anchor="middle" font-size="20" letter-spacing="10" fill="#f6d9a2" font-family="STSong,Songti SC,serif">老街面馆</text>
        <rect x="40" y="296" width="320" height="250" fill="#2a2a34"/>
        <rect x="52" y="312" width="96" height="150" fill="#f2b46f" opacity=".85"/><rect x="252" y="312" width="96" height="150" fill="#f2b46f" opacity=".85"/>
        <g opacity=".55" fill="#fff4e0">${Array.from({ length: 16 }, (_, i) => `<circle cx="${60 + (i * 23) % 84 + (i > 7 ? 200 : 0)}" cy="${320 + (i * 37) % 136}" r="${3 + i % 4}"/>`).join('')}</g>
        ${F.fig({ x: 92, y: 462, s: .55, view: 'front', half: true, coat: '#3d5f92', hs: 'short', talk: true })}${F.fig({ x: 300, y: 462, s: .55, view: 'front', half: true, coat: '#6c5a50', hs: 'grey', apron: '#e8e0d2', nod: true })}
        <circle cx="200" cy="420" r="110" fill="url(#nWarm)" class="door-light"/>
        <g class="door-l"><rect x="150" y="312" width="50" height="234" fill="#7a4d36"/><rect x="158" y="322" width="34" height="150" fill="#f5c785" opacity=".9"/><rect x="188" y="410" width="5" height="26" fill="#d9b06f"/></g>
        <g class="door-r"><rect x="200" y="312" width="50" height="234" fill="#6f4631"/><rect x="208" y="322" width="34" height="150" fill="#f5c785" opacity=".9"/><rect x="207" y="410" width="5" height="26" fill="#d9b06f"/></g>
        <path d="M150 312h100v40h-100z" fill="#c5413a" opacity=".9"/><text x="200" y="340" text-anchor="middle" font-size="18" fill="#fbe9cf" font-family="STSong,Songti SC,serif">面</text>
        <rect data-hit="door" x="150" y="330" width="100" height="160" fill="transparent"/>
        <path d="M0 546H400V780H0Z" fill="#2a3040"/><path d="M0 546H400V556H0Z" fill="#454b5c"/>
        <path d="M0 560Q200 590 400 560" stroke="#ffc98a33" stroke-width="40" fill="none"/>
        ${U.lamp(24, 556, .7)}
        <path d="M0 560h400" stroke="#6a7286" stroke-width="2" opacity=".5"/>`);
      const int = U.svg(`<defs>${U.lg('iWall', [[0, '#8a5a40'], [1, '#c48a5a']])}${U.rg('iLamp', [[0, '#ffe2a8', .9], [1, '#ffcf8a', 0]])}${U.lg('bowl', [[0, '#f4ead8'], [1, '#c9b8a0']], 0, 1)}</defs>
        <rect width="400" height="780" fill="url(#iWall)"/>
        <circle cx="120" cy="120" r="120" fill="url(#iLamp)"/><circle cx="300" cy="110" r="110" fill="url(#iLamp)"/>
        <path d="M110 40v40M300 40v36" stroke="#3a2a22" stroke-width="2"/><path d="M96 80h28l-6 14h-16zM286 76h28l-6 14h-16z" fill="#3a2a22"/>
        <g font-family="STSong,Songti SC,serif" font-size="13" fill="#f6e2c2">
          ${[['牛肉面', 66], ['阳春面', 120], ['炸酱面', 174], ['小馄饨', 228]].map(([t, x]) => `<rect x="${x}" y="128" width="46" height="70" fill="#5a3a2a"/><text x="${x + 23}" y="150" text-anchor="middle" writing-mode="tb" letter-spacing="2">${t}</text>`).join('')}
        </g>
        <rect x="0" y="250" width="400" height="120" fill="#6d4630"/><rect x="0" y="250" width="400" height="10" fill="#4f3222"/>
        ${F.fig({ x: 300, y: 318, s: .78, view: 'front', half: true, hs: 'grey', coat: '#7a6656', apron: '#ece4d6', nod: true })}
        <path d="M250 260h100v-20q-10 -14 -50 -14t-50 14z" fill="#8f8a84"/>
        <g class="steam idle"><path class="wisp" d="M282 224q-10 -20 4 -40t-2 -40" stroke="#fff7ea" stroke-width="10"/><path class="wisp" d="M312 222q12 -22 -2 -44t6 -40" stroke="#fff7ea" stroke-width="10"/></g>
        <path d="M0 370H400V780H0Z" fill="#4a3428"/>
        <path d="M20 340H170V362H20Z" fill="#8a6a4a"/><path d="M28 362V420M162 362V420" stroke="#6a4f36" stroke-width="5"/>
        ${student({ x: 50, y: 352, s: .62, view: 'side', half: true, talk: true }, 1)}${student({ x: 96, y: 348, s: .64, view: 'front', half: true, talk: true, delay: -1 }, 2)}${student({ x: 144, y: 352, s: .62, view: 'side', half: true, flip: true, nod: true }, 4)}
        <ellipse cx="70" cy="340" rx="12" ry="4" fill="#eee2cc"/><ellipse cx="124" cy="340" rx="12" ry="4" fill="#eee2cc"/>
        <path d="M-10 470Q200 440 410 470L420 780H-20Z" fill="#9a6e4c"/><path d="M-10 470Q200 440 410 470" stroke="#c89a6c" stroke-width="3" fill="none"/>
        <g class="bowl-g" data-hit="bowl">
          <ellipse cx="200" cy="476" rx="98" ry="22" fill="#00000033"/>
          <path d="M102 448Q104 520 200 530Q296 520 298 448Z" fill="url(#bowl)"/>
          <path d="M120 470Q200 482 280 470" stroke="#7a9cc2" stroke-width="3" fill="none" opacity=".6"/>
          <ellipse cx="200" cy="448" rx="98" ry="24" fill="#d9a36a"/><ellipse cx="200" cy="448" rx="88" ry="18" fill="#e7b57a"/>
          <path d="M136 448q20 -12 40 0t40 0t40 0" stroke="#f6dfb0" stroke-width="5" fill="none"/>
          <path d="M150 440q22 -10 44 0t44 0" stroke="#f3d39a" stroke-width="4" fill="none"/>
          <circle cx="230" cy="442" r="8" fill="#7e9a5a"/><circle cx="170" cy="446" r="6" fill="#86a462"/><ellipse cx="206" cy="440" rx="14" ry="6" fill="#b5724e"/>
          <path d="M256 400L330 470M266 396L338 462" stroke="#c9a072" stroke-width="5" stroke-linecap="round"/>
        </g>
        <g class="steam big"><path class="wisp" d="M160 430q-14 -30 4 -60t-4 -60" stroke="#fff8ec" stroke-width="16"/><path class="wisp" d="M200 426q14 -34 -4 -66t6 -60" stroke="#fff8ec" stroke-width="18"/><path class="wisp" d="M240 430q-12 -30 4 -62t-2 -56" stroke="#fff8ec" stroke-width="16"/></g>`);
      return { cam: U.shot('ext', ext, U.fall('snow', 26, { t0: 9, t1: 15, s0: 2, s1: 5 })) + U.shot('int', int) };
    }
  };


  /* 樱花树：枝干 + 花簇（小圆点叠色，模拟水彩晕染），只有树冠摆动 */
  const PINK = ['#f7dfdb', '#efc8ca', '#fbece8', '#e8b9be', '#f4d4d2'];
  function blossom(cx, cy, r, n, rnd) {
    let h = `<ellipse cx="${cx}" cy="${cy}" rx="${r * 1.05}" ry="${r * .8}" fill="#f3d6d4" opacity=".55"/>`;
    for (let i = 0; i < n; i++) {
      const a = rnd() * 6.283, d = Math.sqrt(rnd()) * r;
      h += `<circle cx="${(cx + Math.cos(a) * d).toFixed(1)}" cy="${(cy + Math.sin(a) * d * .78).toFixed(1)}" r="${(r * .16 + rnd() * r * .22).toFixed(1)}" fill="${PINK[Math.floor(rnd() * PINK.length)]}" opacity="${(.78 + rnd() * .22).toFixed(2)}"/>`;
    }
    for (let i = 0; i < n / 3; i++) { const a = rnd() * 6.283, d = rnd() * r; h += `<circle cx="${(cx + Math.cos(a) * d).toFixed(1)}" cy="${(cy + Math.sin(a) * d * .7).toFixed(1)}" r="1.3" fill="#fffaf6"/>`; }
    return h;
  }
  function seeded(seed) { let s = seed * 9301 + 49297; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
  function cherryTree(x, gy, sc, seed, big) {
    const rnd = seeded(seed);
    const br = [[0, -112, -112, -176, -54, -150], [3, -140, -64, -246, -26, -206], [8, -150, 54, -252, 32, -210], [10, -122, 122, -168, 66, -148], [6, -150, 6, -274, 0, -220]];
    let branches = '', clusters = '';
    br.forEach(([x0, y0, x1, y1, qx, qy]) => {
      branches += `<path d="M${x0} ${y0}Q${qx} ${qy} ${x1} ${y1}" stroke="#4d3b3b" stroke-width="6" fill="none" stroke-linecap="round"/>`;
      branches += `<path d="M${(x0 + x1) / 2} ${(y0 + y1) / 2}q${(x1 - x0) * .3} ${-20 - rnd() * 20} ${(x1 - x0) * .55} ${-12 - rnd() * 20}" stroke="#4d3b3b" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
      [[.55, 30], [.85, 38], [1, 34]].forEach(([t, r]) => {
        const cx = x0 + (x1 - x0) * t + (rnd() - .5) * 16, cy = y0 + (y1 - y0) * t + (rnd() - .5) * 14;
        clusters += blossom(cx, cy, r, big ? 22 : 16, rnd);
      });
    });
    clusters += blossom(0, -230, 46, 26, rnd);
    return `<g transform="translate(${x} ${gy}) scale(${sc})">
      <path d="M-11 0Q-14 -62 -4 -112Q0 -132 5 -152L13 -150Q9 -122 12 -62Q12 -22 15 0Z" fill="#4a3838"/>
      <g class="canopy" style="animation-delay:-${(seed * 1.3).toFixed(1)}s">${branches}${clusters}</g></g>`;
  }
  /* 抬头时看到的满天枝桠 */
  function skyBranches() {
    const rnd = seeded(11);
    let h = '';
    [[-10, 250, 210, 40, 70, 160], [410, 230, 190, 30, 330, 150], [-10, 90, 150, -10, 60, 40], [410, 110, 260, 0, 350, 60]].forEach(([x0, y0, x1, y1, qx, qy]) => {
      h += `<path d="M${x0} ${y0}Q${qx} ${qy} ${x1} ${y1}" stroke="#4d3b3b" stroke-width="7" fill="none" stroke-linecap="round"/>`;
      for (let k = 1; k <= 5; k++) { const t = k / 5; const cx = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * qx + t * t * x1, cy = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * qy + t * t * y1; h += `<path d="M${cx} ${cy}l${(rnd() - .5) * 50} ${-10 - rnd() * 30}" stroke="#4d3b3b" stroke-width="2.4" stroke-linecap="round"/>` + blossom(cx + (rnd() - .5) * 30, cy - 10 - rnd() * 20, 26 + rnd() * 14, 18, rnd); }
    });
    return h;
  }

  /* ---------------- 第四幕 樱花 ---------------- */
  SCENES.cherry = {
    build() {
      const far = [[150, 470, .3], [250, 468, .3], [118, 492, .44], [282, 490, .44], [80, 520, .6], [322, 518, .6]];
      const art = U.svg(`<defs>${U.lg('cSky', [[0, '#c8d6dc'], [.5, '#efe3d6'], [1, '#f2e2d6']])}${U.lg('cRoad', [[0, '#d9c9bb'], [1, '#a8988c']])}${U.rg('cSun', [[0, '#fff8ea', .9], [1, '#fff2dc', 0]])}</defs>
        <rect width="400" height="780" fill="url(#cSky)"/>
        <circle cx="200" cy="420" r="160" fill="url(#cSun)"/>
        <path d="M0 470H400V780H0Z" fill="#a9b59c"/>
        <path d="M0 520Q100 500 180 490H220Q300 500 400 520V780H0Z" fill="#94a48a"/>
        <path d="M60 780L190 474H210L340 780Z" fill="url(#cRoad)"/>
        <path d="M200 780V480" stroke="#efe4d6" stroke-width="2" stroke-dasharray="10 18" opacity=".6"/>
        ${far.map(([x, y, sc], i) => cherryTree(x, y, sc, i + 3)).join('')}
        <g opacity=".7">${F.fig({ x: 214, y: 488, s: .14, view: 'back', walk: true, coat: '#8d7a86', hs: 'long' })}${F.fig({ x: 190, y: 496, s: .16, view: 'front', walk: true, coat: '#6f7f90', hs: 'short' })}</g>
        ${cherryTree(30, 664, 1.75, 1)}
        <g data-hit="tree">${cherryTree(372, 656, 1.85, 2, true)}</g>
        <g class="canopy" style="animation-delay:-2s">${skyBranches()}</g>
        <ellipse data-hit="canopy" cx="200" cy="150" rx="110" ry="70" fill="transparent"/>`);
      const fall = U.fall('petal', 10, { t0: 12, t1: 18, s0: 7, s1: 10 }) + U.fall('petal', 26, { t0: 8, t1: 13, s0: 7, s1: 11, cls: 'windy' });
      return { cam: U.shot('c', art, fall + '<i class="follow-petal"></i>') };
    }
  };

  /* ---------------- 第五幕 生活蒙太奇 ---------------- */
  SCENES.montage = {
    build() {
      const shelves = side => Array.from({ length: 5 }, (_, r) => Array.from({ length: 6 }, (_, c) => {
        const x = side ? 400 - 20 - c * 22 : 20 + c * 22, y = 240 + r * 52 + c * (side ? -4 : 4);
        return `<rect x="${x - 8}" y="${y}" width="16" height="22" fill="${['#c98c6a', '#8fae9c', '#e2c57d', '#9fb3c9', '#d7a6a0', '#efe2c8'][(r + c) % 6]}" opacity=".9"/>`;
      }).join('')).join('');
      const market = U.svg(`<defs>${U.lg('mk', [[0, '#e8e4dc'], [1, '#cfc8bc']])}</defs>
        <rect width="400" height="780" fill="url(#mk)"/>
        ${[0, 1, 2, 3].map(i => `<rect x="${130 + i * 10}" y="${120 + i * 26}" width="${140 - i * 20}" height="6" fill="#fffaf0" opacity=".9"/>`).join('')}
        <path d="M0 200L150 330V470L0 560Z" fill="#b9b0a2"/><path d="M400 200L250 330V470L400 560Z" fill="#b2a99b"/>
        <g>${shelves(false)}</g><g>${shelves(true)}</g>
        <path d="M0 560L150 470H250L400 560V780H0Z" fill="#d9d3c8"/><path d="M200 470V780" stroke="#fff" stroke-width="30" opacity=".18"/>
        ${fam.mom({ x: 168, y: 600, s: 1.15, view: 'side', arm: 'push', walk: true })}
        <g transform="translate(236 600)"><path d="M-30 -96H60L52 -40H-22Z" fill="none" stroke="#8b939c" stroke-width="3"/><path d="M-26 -88h80M-24 -72h76M-22 -56h72" stroke="#8b939c" stroke-width="1.5"/><path d="M-30 -96L-44 -112" stroke="#8b939c" stroke-width="3"/><circle cx="-14" cy="-6" r="6" fill="#4a4f58"/><circle cx="44" cy="-6" r="6" fill="#4a4f58"/><path d="M-22 -40L-14 -12H44L52 -40" fill="none" stroke="#8b939c" stroke-width="3"/><rect x="-14" y="-110" width="18" height="22" fill="#e2c57d"/><circle cx="20" cy="-102" r="10" fill="#d9844f"/><rect x="34" y="-116" width="12" height="28" fill="#8fae9c"/></g>
        ${fam.dad({ x: 320, y: 560, s: .95, view: 'front', arm: 'up' })}`);
      const tidy = U.svg(`<defs>${U.lg('td', [[0, '#efe4d2'], [1, '#d9c8b0']])}${U.lg('beam', [[0, '#fff6dc', .7], [1, '#fff6dc', 0]], 1, 1)}</defs>
        <rect width="400" height="780" fill="url(#td)"/>
        <rect x="200" y="120" width="160" height="210" fill="#cfe0e6"/><rect x="200" y="120" width="160" height="210" fill="none" stroke="#b49a7c" stroke-width="8"/><path d="M280 120V330M200 225H360" stroke="#b49a7c" stroke-width="4"/>
        <path d="M188 112Q176 220 196 340L210 340Q196 220 206 112Z" fill="#c98f74"/><path d="M372 112Q384 220 364 340L350 340Q364 220 354 112Z" fill="#c98f74"/>
        <path d="M200 330L60 780H330L360 330Z" fill="url(#beam)" opacity=".5"/>
        <path d="M0 450H400V780H0Z" fill="#c7b296"/>
        <path d="M20 400Q20 380 40 380H230Q250 380 250 400V470H20Z" fill="#8a9a8a"/><rect x="10" y="440" width="250" height="60" rx="10" fill="#7d8d7e"/>
        <g><rect x="60" y="414" width="60" height="12" fill="#efe6d8"/><rect x="62" y="402" width="56" height="12" fill="#c9d6de"/><rect x="64" y="390" width="52" height="12" fill="#e8c9b8"/></g>
        ${fam.mom({ x: 180, y: 520, s: .95, view: 'front', arm: 'up' })}
        <path d="M296 500q10 -60 -10 -100q30 30 20 100Z M316 500q20 -50 4 -90q24 40 6 90Z" fill="#6f8f6a"/><rect x="290" y="496" width="36" height="34" fill="#b8805e"/>`);
      const kitchen = U.svg(`<defs>${U.lg('kt', [[0, '#e6c9a4'], [1, '#c99e74']])}${U.rg('kl', [[0, '#ffe6b0', .8], [1, '#ffe6b0', 0]])}</defs>
        <rect width="400" height="780" fill="url(#kt)"/>
        <circle cx="200" cy="140" r="160" fill="url(#kl)"/><path d="M200 40v50" stroke="#5a4a3a" stroke-width="2"/><path d="M180 90h40l-6 12h-28z" fill="#5a4a3a"/>
        <rect x="30" y="150" width="140" height="90" fill="#b98b62"/><rect x="230" y="150" width="140" height="90" fill="#b98b62"/><path d="M100 150v90M300 150v90" stroke="#a07650"/>
        <rect x="260" y="260" width="90" height="70" fill="#5a6f86"/><rect x="266" y="266" width="78" height="58" fill="#e7a87a" opacity=".85"/>
        <rect x="0" y="380" width="400" height="30" fill="#e8ddcc"/><rect x="0" y="410" width="400" height="140" fill="#8f6a4c"/>
        <rect x="70" y="360" width="90" height="22" fill="#3a3a40"/><path d="M80 360q-4 -40 44 -40t44 40" fill="#7d8790"/>
        <g class="steam"><path class="wisp" d="M110 316q-10 -24 4 -48t-4 -44" stroke="#fffaf0" stroke-width="12"/><path class="wisp" d="M134 314q12 -26 -2 -50t6 -40" stroke="#fffaf0" stroke-width="12"/></g>
        ${fam.mom({ x: 130, y: 470, s: .95, view: 'side', arm: 'push' })}
        ${F.fig({ x: 300, y: 470, s: .95, view: 'side', flip: true, hs: 'bob', hair: F.HERO.hair, coat: '#6f87a6', coat2: '#5a7290', pants: '#2b3447', arm: 'push' })}
        <path d="M0 550H400V780H0Z" fill="#6e5a4a"/>`);
      const sofa = U.svg(`<defs>${U.lg('sf', [[0, '#2a3046'], [1, '#3b3a4c']])}${U.rg('sl', [[0, '#ffd99a', .6], [1, '#ffd99a', 0]])}</defs>
        <rect width="400" height="780" fill="url(#sf)"/>
        <rect x="60" y="150" width="130" height="170" fill="#1c2438"/><rect x="66" y="156" width="118" height="158" fill="#24314e"/>${U.stars(14, 150).replace(/cx="(\d+)"/g, (m, x) => `cx="${70 + (+x % 110)}"`).replace(/cy="(\d+)"/g, (m, y) => `cy="${160 + (+y % 140)}"`)}
        <circle cx="330" cy="260" r="120" fill="url(#sl)"/><path d="M330 220v120" stroke="#5a4a3a" stroke-width="4"/><path d="M304 220h52l-10 -40h-32z" fill="#e9c88f"/>
        <rect x="210" y="300" width="90" height="56" fill="#141822"/><rect x="190" y="356" width="130" height="40" fill="#5a4636"/>
        <path d="M0 420H400V780H0Z" fill="#4a3f42"/>
        <path d="M40 560Q200 520 360 560L370 600H30Z" fill="#7d6250"/><ellipse cx="200" cy="560" rx="150" ry="18" fill="#8c705c"/>
        <rect x="150" y="536" width="30" height="20" rx="4" fill="#e8dccb"/><circle cx="240" cy="544" r="12" fill="#d9844f"/>`);
      const screen = `<div class="feed"><div class="feed-bar">附近 · 推荐</div>
        <div class="post p0"><div class="ph"></div><div class="tx"></div><div class="tx s"></div></div>
        <div class="post p1"><div class="ph city">${miniCity()}</div><div class="pcap">另一座城市的夜晚</div></div>
        <div class="post p2"><div class="ph hall">${miniHall()}</div><div class="pcap">今晚的音乐会</div></div>
        <div class="post p3"><div class="ph gal">${miniGallery()}</div><div class="pcap">周末去了美术馆</div></div></div>`;
      return {
        cam: U.shot('market', market) + U.shot('tidy', tidy, U.fall('glow', 12, { t0: 14, t1: 20, s0: 2, s1: 3 })) + U.shot('kitchen', kitchen) + U.shot('sofa', sofa),
        fp: `<div class="fp-phone" data-hit="phone">${F.phoneHand(screen)}</div>`
      };
    }
  };
  function miniCity() { return `<svg viewBox="0 0 120 80" preserveAspectRatio="xMidYMid slice"><rect width="120" height="80" fill="#1b2b4a"/><circle cx="90" cy="18" r="8" fill="#f6e2b8"/><g fill="#33476a">${[[0, 30, 14], [16, 20, 12], [30, 36, 16], [48, 14, 14], [64, 28, 12], [78, 22, 16], [96, 34, 14], [110, 26, 10]].map(([x, y, w]) => `<rect x="${x}" y="${y}" width="${w}" height="${80 - y}"/>`).join('')}</g><g fill="#ffd59a">${Array.from({ length: 30 }, (_, i) => `<rect x="${(i * 13) % 118}" y="${30 + (i * 7) % 46}" width="2" height="2.5"/>`).join('')}</g><path d="M0 70h120" stroke="#f3b27a" stroke-width="3" opacity=".6"/></svg>`; }
  function miniHall() { return `<svg viewBox="0 0 120 80" preserveAspectRatio="xMidYMid slice"><rect width="120" height="80" fill="#2a1a2e"/><path d="M10 10Q60 -6 110 10L100 56H20Z" fill="#6a4050"/><path d="M40 10L20 60H100L80 10Z" fill="#f3d6a4" opacity=".3"/><ellipse cx="60" cy="56" rx="40" ry="6" fill="#8c6a5a"/><g fill="#1a1420">${Array.from({ length: 12 }, (_, i) => `<circle cx="${6 + i * 10}" cy="${70 + (i % 2) * 4}" r="5"/>`).join('')}</g></svg>`; }
  function miniGallery() { return `<svg viewBox="0 0 120 80" preserveAspectRatio="xMidYMid slice"><rect width="120" height="80" fill="#e8e2d6"/><rect x="34" y="12" width="52" height="40" fill="#2c4a74"/><path d="M34 40q14 -16 26 -6t26 -8v26H34z" fill="#8fb1c6"/><circle cx="72" cy="24" r="5" fill="#f2d6ae"/><rect x="0" y="62" width="120" height="18" fill="#c9c0b0"/><g fill="#4a4f5c"><rect x="16" y="46" width="6" height="18"/><circle cx="19" cy="43" r="4"/><rect x="96" y="44" width="6" height="20"/><circle cx="99" cy="41" r="4"/></g></svg>`; }
  window.MINI = { miniCity, miniHall, miniGallery };

  /* ---------------- 结局：点灯人 ---------------- */
  SCENES.endHome = {
    build() {
      const art = homeNight(true);
      return { cam: U.shot('e', art, U.fall('osm', 14, { t0: 10, t1: 15, s0: 4, s1: 7, to: 60 })) };
    }
  };
  function homeNight(withHero) {
    return U.svg(`<defs>${U.lg('ehSky', [[0, '#16233c'], [.5, '#37405e'], [.8, '#6f6274'], [1, '#8d7470']])}${U.lampGlowDef}${U.lg('ehRoad', [[0, '#8f7f7a'], [1, '#3b3a46']])}${U.rg('ehWarm', [[0, '#ffd99a', .45], [1, '#ffd99a', 0]])}</defs>
      <rect width="400" height="780" fill="url(#ehSky)"/>${U.stars(36, 230)}
      <circle cx="200" cy="420" r="170" fill="url(#ehWarm)"/>
      ${oldStreet(true)}
      <path d="M40 780L186 440H214L360 780Z" fill="url(#ehRoad)"/>
      <path d="M0 560L170 440H186L40 780H0Z" fill="#5a5458"/><path d="M400 560L232 440H214L360 780H400Z" fill="#5a5458"/>
      ${U.lamp(150, 456, .45)}${U.lamp(266, 452, .42)}${U.lamp(96, 520, .8)}${U.lamp(312, 516, .76)}
      ${U.tree(20, 640, 1.5, 'osm')}${U.tree(390, 630, 1.4, 'osm')}
      ${withHero ? F.heroineBack({ x: 200, y: 586, s: .5, walk: true }) : ''}`);
  }
  window.HOME_NIGHT = homeNight;
})();
