/* =========================================================
   figures.js — 人物、手部、主角背影（纯 SVG 程序绘制）
   画风：与主角参考图一致的“无五官纸艺平涂”，所有人物同一套比例
   坐标约定：fig() 以脚底中心为 (0,0)，人高约 200 个单位
   ========================================================= */
(function () {
  'use strict';
  const SKIN = '#ecccab', SKIN_D = '#d4ad8b';
  const HERO = { hair: '#1d2b47', coat: '#22375a', coatD: '#18294a', dress: '#6f87a6', scarf: '#d8bc85', scarfD: '#bf9f68', boot: '#18233a' };

  /* 头发：front / back / side 三种视角 */
  function hairPath(style, view) {
    const H = {
      bob: {
        front: 'M-16 -168Q-18 -194 0 -193Q18 -194 16 -168L17 -150Q11 -147 9 -156L9 -177Q1 -186 -9 -177L-9 -156Q-11 -147 -17 -150Z',
        back: 'M-16 -170Q-18 -195 0 -194Q18 -195 16 -170L17 -150Q0 -144 -17 -150Z',
        side: 'M-13 -168Q-14 -195 4 -193Q19 -192 16 -172L10 -174Q8 -164 4 -160L5 -150Q-8 -146 -15 -152Z'
      },
      short: {
        front: 'M-13 -172Q-15 -192 0 -191Q15 -192 13 -172Q9 -182 0 -182Q-9 -182 -13 -172Z',
        back: 'M-13.5 -170Q-15 -192 0 -191Q15 -192 13.5 -170Q12 -160 0 -158Q-12 -160 -13.5 -170Z',
        side: 'M-12 -170Q-12 -192 3 -191Q16 -190 15 -176Q8 -182 2 -178Q0 -166 -6 -160Q-12 -162 -12 -170Z'
      },
      long: {
        front: 'M-16 -168Q-18 -195 0 -194Q18 -195 16 -168L19 -132Q12 -130 9 -146L9 -177Q1 -186 -9 -177L-9 -146Q-12 -130 -19 -132Z',
        back: 'M-16 -170Q-18 -196 0 -195Q18 -196 16 -170L19 -130Q0 -124 -19 -130Z',
        side: 'M-13 -168Q-14 -196 4 -194Q19 -192 16 -172L9 -174Q8 -164 3 -160Q-2 -140 -10 -128Q-18 -134 -16 -152Z'
      },
      pony: {
        front: 'M-13 -171Q-15 -193 0 -192Q15 -193 13 -171Q9 -183 0 -183Q-9 -183 -13 -171Z',
        back: 'M-13.5 -170Q-15 -193 0 -192Q15 -193 13.5 -170Q12 -162 0 -161Q-12 -162 -13.5 -170ZM-4 -176Q0 -150 2 -140Q6 -150 4 -176Z',
        side: 'M-12 -170Q-12 -193 3 -192Q16 -191 15 -176Q8 -183 2 -179Q0 -168 -6 -162Q-12 -164 -12 -170ZM-11 -180Q-26 -168 -22 -146Q-14 -160 -9 -172Z'
      },
      grey: null
    };
    const s = H[style === 'grey' ? 'short' : style] || H.short;
    return s[view] || s.front;
  }

  /**
   * 通用人物
   * o: {x,y,s,view:'front'|'back'|'side',coat,coat2,pants,hair,hs,walk,bag,scarf,flip,half,cls,arm:'swing'|'down'|'push'|'up', skirt, legColor}
   */
  function fig(o) {
    const x = o.x || 0, y = o.y || 0, s = o.s || 1, view = o.view || 'front';
    const coat = o.coat || '#4a5a74', coat2 = o.coat2 || shade(coat, -18), pants = o.pants || '#2b3447';
    const hair = o.hs === 'grey' ? '#b9b6ae' : (o.hair || '#262c38');
    const flip = o.flip ? ' scale(-1 1)' : '';
    const id = 'f' + Math.random().toString(36).slice(2, 7);
    let g = '';
    const walk = o.walk;
    const shoe = o.shoe || '#1f2433';
    if (o.sit) {
      const lc = o.legColor || pants;
      g += `<path d="M-15 -66H15L16 -46H-16Z" fill="${shade(lc, 8)}"/><path d="M-13 -48L-12 -6L-4 -6L-3 -48Z" fill="${lc}"/><path d="M3 -48L4 -6L12 -6L13 -48Z" fill="${shade(lc, -8)}"/><ellipse cx="-8" cy="-3.5" rx="6.5" ry="3.6" fill="${shoe}"/><ellipse cx="8" cy="-3.5" rx="6.5" ry="3.6" fill="${shoe}"/>`;
    } else if (!o.half) {
      if (view === 'side') {
        g += `<g class="${walk ? 'leg swA' : ''}"><path d="M-6 -64L-4 -6L6 -6L5 -64Z" fill="${shade(pants, -10)}"/><path d="M-6 -6Q-7 0 0 0L11 0Q12 -5 6 -7Z" fill="${shoe}"/></g>`;
        g += `<g class="${walk ? 'leg swB' : ''}"><path d="M-5 -64L-3 -6L7 -6L6 -64Z" fill="${pants}"/><path d="M-5 -6Q-6 0 1 0L12 0Q13 -5 7 -7Z" fill="${shoe}"/></g>`;
      } else {
        const lc = o.legColor || pants;
        g += `<g class="${walk ? 'leg upA' : ''}"><path d="M-12 -64L-11 -6L-3 -6L-2 -64Z" fill="${lc}"/><ellipse cx="-7" cy="-3.5" rx="6.5" ry="3.6" fill="${shoe}"/></g>`;
        g += `<g class="${walk ? 'leg upB' : ''}"><path d="M2 -64L3 -6L11 -6L12 -64Z" fill="${shade(lc, -8)}"/><ellipse cx="7" cy="-3.5" rx="6.5" ry="3.6" fill="${shoe}"/></g>`;
      }
    }
    // 躯干 / 外套
    const hem = o.long ? -40 : o.skirt ? -52 : -60;
    if (view === 'side') {
      if (o.bag === 'backpack') g += `<path d="M-22 -146Q-30 -140 -29 -108L-27 -96L-12 -98L-12 -146Z" fill="${o.bagColor || '#8a4f45'}"/>`;
      g += `<path d="M-12 -150Q2 -156 14 -149L19 ${hem}Q0 ${hem + 5} -16 ${hem}Z" fill="${coat}"/>`;
      g += `<path d="M2 -146Q-2 -120 2 -96" stroke="${coat2}" stroke-width="1.4" fill="none" opacity=".7"/>`;
      if (o.arm === 'push') {
        // 双手向前（推车 / 弹琴 / 做饭）：远侧手臂在身体后面，近侧在前
        g = `<path d="M-2 -144Q8 -122 22 -110" stroke="${shade(coat2, -14)}" stroke-width="8" stroke-linecap="round" fill="none"/><circle cx="24" cy="-109" r="3.8" fill="${SKIN_D}"/>` + g;
        g += `<path d="M2 -144Q12 -122 28 -108" stroke="${coat2}" stroke-width="8.5" stroke-linecap="round" fill="none"/><circle cx="30" cy="-107" r="4" fill="${SKIN}"/>`;
      } else {
        g += `<g class="${walk ? 'arm swB' : ''}"><path d="M1 -145Q-3 -122 -1 -100" stroke="${coat2}" stroke-width="8.5" stroke-linecap="round" fill="none"/><circle cx="-1" cy="-96" r="4" fill="${SKIN}"/></g>`;
      }
      if (o.scarf) g += `<path d="M-6 -152Q4 -146 14 -152L14 -144Q4 -139 -6 -145Z" fill="${o.scarf}"/><path d="M-8 -150Q-20 -142 -28 -130Q-18 -134 -6 -144Z" fill="${shade(o.scarf, -12)}" class="scarfTail"/>`;
      g += `<rect x="-1" y="-160" width="8" height="12" fill="${SKIN_D}"/>`;
      g += `<g class="${o.talk ? 'head talk' : 'head'}"><ellipse cx="3" cy="-172" rx="11.5" ry="14" fill="${SKIN}"/><path d="${hairPath(o.hs || 'short', 'side')}" fill="${hair}"/></g>`;
    } else {
      if (o.bag === 'backpack' && view === 'back') g += '';
      g += `<path d="M-20 -150Q0 -157 20 -150L27 ${hem}Q0 ${hem + 6} -27 ${hem}Z" fill="${coat}"/>`;
      if (view === 'front') g += `<path d="M0 -150L0 ${hem + 4}" stroke="${coat2}" stroke-width="1.6" opacity=".8"/><path d="M-9 -152L0 -132L9 -152" fill="${o.inner || shade(coat, 30)}"/>`;
      else g += `<path d="M0 -146L0 ${hem + 3}" stroke="${coat2}" stroke-width="1.2" opacity=".55"/>`;
      // 手臂：用描边绘制“肩—肘—手”，正背面行走时手臂是前后摆（画面上表现为轻微缩短），不是左右甩
      const arm = (pts, cls, col, extra) => `<g class="${cls || ''}"><path d="M${pts[0]} ${pts[1]}Q${pts[2]} ${pts[3]} ${pts[4]} ${pts[5]}" stroke="${col || coat2}" stroke-width="9" stroke-linecap="round" fill="none"/><circle cx="${pts[4]}" cy="${pts[5] + 3}" r="4.3" fill="${SKIN}"/>${extra || ''}</g>`;
      const L = [-19, -146, -27, -118, -24, -88], R = [19, -146, 27, -118, 24, -88];
      if (o.arm === 'up') {
        g += arm(L) + arm([19, -146, 34, -164, 36, -192]);
      } else if (o.arm === 'table') {
        g += arm([-19, -146, -26, -118, -8, -108]) + arm([19, -146, 26, -118, 8, -108]);
      } else if (o.arm === 'violin') {
        // 小提琴架在左肩，左手托琴颈，右手持弓在琴身上来回拉
        g += `<g transform="rotate(-28 -20 -146)"><ellipse cx="-20" cy="-146" rx="11" ry="6.5" fill="#9a5230"/><path d="M-31 -146H-58" stroke="#3a2416" stroke-width="2.4"/><circle cx="-59" cy="-146" r="2.4" fill="#3a2416"/></g>`;
        g += arm([-19, -146, -36, -120, -48, -132]);
        g += `<g class="bowArm">${arm([19, -146, 32, -124, 4, -124], '', null, '<path d="M4 -122L-34 -172" stroke="#efe4cc" stroke-width="1.6"/>')}</g>`;
      } else if (o.arm === 'cello') {
        // 大提琴立在两膝之间，左手按琴颈，右手横向运弓
        g += `<path d="M-2 -76L-8 -136" stroke="#3a2416" stroke-width="3"/><ellipse cx="0" cy="-52" rx="15" ry="25" fill="#8a4a2a"/><path d="M-6 -64h12M-6 -40h12" stroke="#5a2c18" stroke-width="1.4"/><path d="M0 -26V-2" stroke="#3a2416" stroke-width="2"/>`;
        g += arm([-19, -146, -32, -126, -9, -116]);
        g += `<g class="bowArm h">${arm([19, -146, 34, -104, 20, -70], '', null, '<path d="M22 -68L-30 -58" stroke="#efe4cc" stroke-width="1.6"/>')}</g>`;
      } else {
        g += arm(L, walk ? 'arm fbA' : '') + arm(R, walk ? 'arm fbB' : '');
      }
      if (o.bag === 'backpack' && view === 'back') g += `<path d="M-16 -146Q0 -150 16 -146L15 -100Q0 -96 -15 -100Z" fill="${o.bagColor || '#8a4f45'}"/><path d="M-13 -118L13 -118" stroke="#00000033"/>`;
      if (o.bag === 'backpack' && view === 'front') g += `<path d="M-17 -150L-14 -118M17 -150L14 -118" stroke="${o.bagColor || '#8a4f45'}" stroke-width="3.5"/>`;
      if (o.apron) g += `<path d="M-14 -138L14 -138L18 ${hem + 6}L-18 ${hem + 6}Z" fill="${o.apron}"/>`;
      if (o.scarf) g += `<path d="M-13 -153Q0 -146 13 -153L13 -145Q0 -138 -13 -145Z" fill="${o.scarf}"/>`;
      g += `<rect x="-4" y="-160" width="8" height="12" fill="${SKIN_D}"/>`;
      const face = view === 'back' ? '' : `<ellipse cx="0" cy="-172" rx="12" ry="14.5" fill="${SKIN}"/>`;
      const head = view === 'back' ? `<ellipse cx="0" cy="-172" rx="12.5" ry="14.5" fill="${hair}"/>` : '';
      g += `<g class="${o.talk ? 'head talk' : o.nod ? 'head nod' : 'head'}">${head}${face}<path d="${hairPath(o.hs || 'short', view)}" fill="${hair}"/>${o.glasses && view === 'front' ? '<path d="M-9 -172h6m6 0h6" stroke="#2a2a2a" stroke-width="1.4"/>' : ''}</g>`;
    }
    const cls = ['fig', o.cls || '', walk ? 'walking' : ''].join(' ');
    return `<g transform="translate(${x} ${y}) scale(${s})${flip}"><g class="${cls}" style="${o.delay ? `--d:${o.delay}s;` : ''}">${g}</g></g>`;
  }

  /* 自行车（侧面），车轮中心高度 22 */
  function bike(o) {
    const x = o.x || 0, y = o.y || 0, s = o.s || 1, c = o.color || '#5f7a8c', flip = o.flip ? ' scale(-1 1)' : '';
    return `<g transform="translate(${x} ${y}) scale(${s})${flip}"><g class="bike">
      <circle cx="-26" cy="-22" r="20" fill="none" stroke="#2c3240" stroke-width="3"/><circle cx="30" cy="-22" r="20" fill="none" stroke="#2c3240" stroke-width="3"/>
      <g class="spin" style="transform-origin:-26px -22px"><path d="M-26 -42V-2M-46 -22H-6" stroke="#2c324088" stroke-width="1"/></g>
      <g class="spin" style="transform-origin:30px -22px"><path d="M30 -42V-2M10 -22H50" stroke="#2c324088" stroke-width="1"/></g>
      <path d="M-26 -22L-2 -22L18 -52L-12 -52Z M-2 -22L-14 -60M18 -52L30 -22M18 -52L14 -66" fill="none" stroke="${c}" stroke-width="3.2" stroke-linejoin="round"/>
      <path d="M-22 -62h16" stroke="#2c3240" stroke-width="4" stroke-linecap="round"/><path d="M8 -68h12" stroke="#2c3240" stroke-width="3" stroke-linecap="round"/>
    </g></g>`;
  }

  /* 主角背影（精细版），脚底 (0,0)，身高约 430 */
  function heroineBack(o) {
    o = o || {};
    const x = o.x || 0, y = o.y || 0, s = o.s || 1;
    const H = HERO;
    return `<g transform="translate(${x} ${y}) scale(${s})"><g class="heroine ${o.walk ? 'walking' : ''}">
      <ellipse cx="0" cy="2" rx="70" ry="9" fill="#00000033"/>
      <g class="leg upA"><path d="M-27 -150L-24 -40L-10 -40L-8 -150Z" fill="#1c2943"/><path d="M-28 -64Q-30 -30 -27 -8L-29 0L-6 0L-6 -10Q-7 -40 -8 -64Z" fill="${H.boot}"/><path d="M-12 -6L-11 4L-7 4L-7 -6Z" fill="#0f1828"/></g>
      <g class="leg upB"><path d="M8 -150L10 -40L24 -40L27 -150Z" fill="#192640"/><path d="M8 -64Q7 -34 8 -10L6 0L29 0L29 -8Q30 -36 27 -64Z" fill="${H.boot}"/><path d="M23 -6L22 4L26 4L27 -6Z" fill="#0f1828"/></g>
      <path d="M-34 -150Q0 -144 34 -150L30 -128Q0 -122 -30 -128Z" fill="${H.dress}" opacity=".9"/>
      <path class="coatHem" d="M-46 -332Q0 -344 46 -332Q56 -270 64 -190Q70 -150 84 -118Q30 -104 -6 -108Q-46 -106 -80 -118Q-66 -160 -60 -204Q-56 -280 -46 -332Z" fill="${H.coat}"/>
      <path d="M-2 -330Q-4 -230 -6 -110" stroke="${H.coatD}" stroke-width="2.4" fill="none"/>
      <path d="M-30 -300Q-40 -220 -54 -140M30 -296Q40 -230 58 -150M10 -200Q30 -160 40 -112" stroke="${H.coatD}" stroke-width="2" fill="none" opacity=".75"/>
      <path d="M-46 -330Q-66 -300 -64 -230L-58 -186L-44 -190L-40 -250Z" fill="${H.coatD}"/>
      <path d="M46 -330Q66 -300 64 -230L58 -186L44 -190L40 -250Z" fill="${H.coatD}"/>
      <path d="M-30 -336Q0 -348 30 -336L26 -318Q0 -326 -26 -318Z" fill="#1a2c4c"/>
      <path d="M-30 -346Q0 -338 30 -346L32 -326Q0 -316 -32 -326Z" fill="${H.scarf}"/>
      <g class="scarfTail"><path d="M24 -342Q60 -350 92 -340Q120 -332 146 -346Q128 -320 96 -318Q62 -318 26 -326Z" fill="${H.scarf}"/><path d="M40 -330Q80 -326 120 -330" stroke="${H.scarfD}" stroke-width="1.6" fill="none"/></g>
      <path d="M-34 -372Q-42 -420 -2 -428Q40 -426 38 -380Q40 -352 30 -338Q0 -330 -32 -338Q-40 -352 -34 -372Z" fill="${H.hair}"/>
      <path d="M-26 -400Q-10 -420 14 -418M-20 -360Q-4 -350 20 -356" stroke="#2c3d60" stroke-width="2" fill="none" opacity=".8"/>
      <rect x="22" y="-398" width="14" height="4" rx="1.5" fill="#d8b56f" transform="rotate(-24 29 -396)"/>
    </g></g>`;
  }

  /* 年轻的自己：校服 + 同款短发 + 书包（侧面行走） */
  function youngSelf(o) {
    return fig(Object.assign({ view: 'side', hs: 'bob', hair: HERO.hair, coat: '#3d5f92', coat2: '#2e4a75', pants: '#2c3a59', bag: 'backpack', bagColor: '#a2614f', walk: true, shoe: '#e9e4dc' }, o));
  }

  /* 第一人称：摊开接物的手掌（掌心朝上，手腕在下） */
  function palmSvg() {
    return `<svg viewBox="0 0 220 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="pskin" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#efd2b4"/><stop offset="1" stop-color="#c6a184"/></linearGradient></defs>
      <path d="M58 240L66 158H156L166 240Z" fill="${HERO.coat}"/><path d="M60 170Q110 160 160 170L158 182Q110 174 62 182Z" fill="${HERO.coatD}"/>
      <path d="M50 100Q42 72 54 68Q65 66 70 88L74 98Q72 62 86 60Q99 60 100 86L102 94Q103 58 118 58Q132 59 131 90L132 96Q136 66 150 68Q162 71 158 102L156 114Q172 86 188 94Q198 102 184 122Q168 148 152 160H76Q54 142 50 100Z" fill="url(#pskin)" stroke="#a88570" stroke-width="1.6"/>
      <path d="M78 120Q110 138 148 120" fill="none" stroke="#a5826d" stroke-width="2.2" opacity=".55"/><path d="M86 134Q112 144 138 134" fill="none" stroke="#a5826d" stroke-width="1.8" opacity=".35"/></svg>`;
  }

  /* 第一人称：握着手机的手（HTML 容器里使用），手机屏幕由调用方放入 .screen */
  function phoneHand(screenHtml, extraCls) {
    return `<div class="phone-hand ${extraCls || ''}">
      <svg class="ph-back" viewBox="0 0 240 300" aria-hidden="true"><path d="M70 300L80 214Q60 196 56 160L52 120Q50 104 64 104Q74 106 76 124L80 150L170 150L178 120Q182 104 194 106Q206 110 202 128L196 168Q190 206 166 220L170 300Z" fill="#e2bf9f"/><path d="M68 300L76 236H170L176 300Z" fill="${HERO.coat}"/><path d="M74 246Q122 238 172 246" stroke="${HERO.coatD}" stroke-width="5" fill="none"/></svg>
      <div class="phone"><div class="notch"></div><div class="screen">${screenHtml}</div></div>
      <svg class="ph-front" viewBox="0 0 240 300" aria-hidden="true"><path d="M44 196Q30 170 38 150Q46 140 56 150L70 178Q72 196 60 204Z" fill="#ecccab" stroke="#c9a385" stroke-width="1.2"/><path d="M194 132Q206 128 208 140L206 160Q202 168 192 164Z M196 168Q208 166 208 178L204 194Q200 200 190 196Z M192 200Q204 200 202 212L196 222Q190 226 184 220Z" fill="#ecccab" stroke="#c9a385" stroke-width="1.2"/></svg>
    </div>`;
  }

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1, 7), 16);
    let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
    r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  window.FIG = { fig, bike, heroineBack, youngSelf, palmSvg, phoneHand, shade, HERO, SKIN };
})();
