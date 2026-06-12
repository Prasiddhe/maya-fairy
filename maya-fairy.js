/* ============================================================
   MAYA — THE LIVING SITE FAIRY  v5.0  (full rewrite)
   ============================================================
   Upload to GitHub (Prasiddhe/maya-fairy) then load in Wix:
   <script src="https://cdn.jsdelivr.net/gh/Prasiddhe/maya-fairy@main/maya-fairy.js"></script>
   Place in: Body – All Pages

   What's new in v5:
   • Real behavior brain: drift → hover → dart → perch → nap,
     chosen with weighted randomness. No two visits feel the same.
   • She notices YOU: if you stay still on a part of the page for
     a few seconds, she flies into view, says one thing about that
     section, stays 4–6s, then leaves on her own.
   • Smaller, slimmer, cuter fairy (~30% smaller, softer face).
   • Click her → one big magic ripple. That's it.
   • Message bubble only above her head. No other UI.
   • Cooldowns so she never spams you.
   ============================================================ */

(function () {
  'use strict';
  if (window.__mayaFairyLoaded) return;
  window.__mayaFairyLoaded = true;

  /* ---------- messages ---------- */
  const MSG = {
    hero: ["Psst… welcome ✨ I've been waiting~", "Oh! A visitor! Hello hello~", "You found my home page 🌟"],
    about: ["Curious about us? Hehe, I like curious people~", "This part has the warmest energy 🌸", "Ooh the story page… my favourite ✨"],
    services: ["Looking at what we do? Good taste~", "Pick something! I'll cheer for you 🌟", "These are some of my favourite things ✨"],
    portfolio: ["Pretty things! I sprinkled magic on a few~", "Soooo much creativity here 🌸", "I get proud when people stop here ✨"],
    contact: ["Are you going to say hello? Please do~", "Send a message! I'll deliver it myself ✉️✨", "Don't be shy… okay I'm a little shy too 🙈"],
    default: ["You've been here a while… cozy, right? 🌸", "Hmm, interesting spot you picked~", "Exploring makes me happy ✨", "I saw you reading… 👀 hehe"]
  };
  const IDLE = ["la la la~ ♪", "*stretches wings*", "✨", "*hums softly*", "I wonder what's past the footer…", "🌸"];
  const SLEEPY = ["zZz… 💤", "*yawns*… five more minutes~"];
  const WAKE = ["*blinks* …oh! I dozed off 🙈", "Mm? I'm awake! I'm awake! ✨"];
  const CLICK = ["Eee~! Magic! ✨💜", "Hehe that tickles! ✨", "Wheee~! 💫"];

  let lastMsg = '';
  function pick(arr) {
    let m = arr[Math.floor(Math.random() * arr.length)];
    if (arr.length > 1) while (m === lastMsg) m = arr[Math.floor(Math.random() * arr.length)];
    lastMsg = m;
    return m;
  }
  const rand = (a, b) => a + Math.random() * (b - a);

  /* ---------- page helpers ---------- */
  const pageW = () => Math.max(document.body.scrollWidth, document.documentElement.scrollWidth, innerWidth);
  const pageH = () => Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, innerHeight);
  const sX = () => window.scrollX || 0;
  const sY = () => window.scrollY || 0;

  /* ---------- state (page-space coords) ---------- */
  const S = {
    x: sX() + innerWidth * 0.8, y: sY() + innerHeight * 0.3,
    vx: 0, vy: 0,
    tx: sX() + innerWidth * 0.8, ty: sY() + innerHeight * 0.3,
    mode: 'drift',          // drift | hover | dart | perch | nap | approach | talk | leave
    modeTimer: 0,
    facing: 1,
    blink: false, blinkT: 0,
    excited: 0,             // 0..1, decays — wings flap faster
    trail: [], dust: [], ripples: [],
    bubbleUntil: 0,
    lastVisit: 0,           // cooldown between her visits
    greeted: false
  };

  /* ---------- canvas ---------- */
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:99998;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
  resize();
  addEventListener('resize', resize);

  /* ---------- click target ---------- */
  const hit = document.createElement('div');
  hit.style.cssText = 'position:fixed;width:56px;height:56px;border-radius:50%;cursor:pointer;z-index:99999;transform:translate(-50%,-50%);background:transparent;';
  document.body.appendChild(hit);

  /* ---------- bubble (always above her head) ---------- */
  const bubble = document.createElement('div');
  bubble.style.cssText = [
    'position:fixed', 'transform:translate(-50%,-100%) scale(.8)', 'transform-origin:50% 100%',
    'background:rgba(255,246,255,.97)', 'border:1.5px solid rgba(205,165,255,.5)',
    'border-radius:16px', 'padding:8px 14px',
    "font-family:Georgia,serif", 'font-size:12.5px', 'color:#6a3d8f',
    'max-width:200px', 'line-height:1.5', 'text-align:center',
    'box-shadow:0 4px 18px rgba(160,100,255,.25)',
    'z-index:99999', 'pointer-events:none', 'opacity:0',
    'transition:opacity .35s ease,transform .35s cubic-bezier(.34,1.56,.64,1)',
    'backdrop-filter:blur(6px)', 'white-space:normal'
  ].join(';');
  document.body.appendChild(bubble);
  // little tail under the bubble
  const tail = document.createElement('div');
  tail.style.cssText = 'position:absolute;left:50%;bottom:-6px;transform:translateX(-50%) rotate(45deg);width:10px;height:10px;background:rgba(255,246,255,.97);border-right:1.5px solid rgba(205,165,255,.5);border-bottom:1.5px solid rgba(205,165,255,.5);';
  bubble.appendChild(tail);
  const bubbleText = document.createElement('span');
  bubble.insertBefore(bubbleText, tail);

  function say(text, ms) {
    bubbleText.textContent = text;
    S.bubbleUntil = performance.now() + (ms || 3000);
    bubble.style.opacity = '1';
    bubble.style.transform = 'translate(-50%,-100%) scale(1)';
  }
  function bubbleTick(now, vx, vy) {
    if (S.bubbleUntil && now > S.bubbleUntil) {
      S.bubbleUntil = 0;
      bubble.style.opacity = '0';
      bubble.style.transform = 'translate(-50%,-100%) scale(.8)';
    }
    if (S.bubbleUntil) {
      bubble.style.left = Math.max(110, Math.min(innerWidth - 110, vx)) + 'px';
      bubble.style.top = Math.max(58, vy - 34) + 'px';
    }
  }

  /* ---------- section detection ---------- */
  function detectSection() {
    const midY = innerHeight / 2;
    let key = 'default';
    document.querySelectorAll('section,[data-section],[class*="section"],[id],.hero,.about,.services,.portfolio,.contact').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.height < 50 || r.top > midY || r.bottom < midY) return;
      const id = (el.id + ' ' + el.className).toLowerCase();
      if (/hero|banner|intro/.test(id)) key = 'hero';
      else if (/about/.test(id)) key = 'about';
      else if (/service/.test(id)) key = 'services';
      else if (/portfolio|work|project|gallery/.test(id)) key = 'portfolio';
      else if (/contact/.test(id)) key = 'contact';
    });
    return key;
  }

  /* ---------- dwell watcher: "she knows you stayed" ---------- */
  let lastActivity = performance.now();
  let dwellSection = detectSection();
  function activity() {
    lastActivity = performance.now();
    const k = detectSection();
    if (k !== dwellSection) dwellSection = k;
    if (S.mode === 'nap') wake();
  }
  addEventListener('scroll', activity, { passive: true });
  addEventListener('mousemove', activity, { passive: true });
  addEventListener('touchstart', activity, { passive: true });

  function maybeVisit(now) {
    if (S.mode === 'approach' || S.mode === 'talk' || S.mode === 'leave') return;
    const still = now - lastActivity;
    const cooled = now - S.lastVisit > rand(20000, 35000);   // 20–35s between visits
    if (still > rand(3500, 6500) && cooled) startVisit();
  }

  function startVisit() {
    S.lastVisit = performance.now();
    S.mode = 'approach';
    S.excited = 1;
    // fly to a visible spot, slightly random
    S.tx = sX() + innerWidth * rand(0.35, 0.65);
    S.ty = sY() + innerHeight * rand(0.3, 0.5);
  }

  function wake() {
    S.mode = 'drift';
    S.modeTimer = 0;
    say(pick(WAKE), 2200);
  }

  /* ---------- behavior brain ---------- */
  function chooseIdleMode() {
    const r = Math.random();
    if (r < 0.40) {           // drift somewhere new on the full page
      S.mode = 'drift';
      const m = 70;
      S.tx = rand(m, pageW() - m);
      S.ty = rand(m, pageH() - m);
      S.modeTimer = rand(3000, 7000);
    } else if (r < 0.65) {    // hover in place, bobbing
      S.mode = 'hover';
      S.modeTimer = rand(1500, 4000);
      if (Math.random() < 0.3) say(pick(IDLE), 2200);
    } else if (r < 0.80) {    // quick curious dart nearby
      S.mode = 'dart';
      S.tx = S.x + rand(-260, 260);
      S.ty = S.y + rand(-180, 180);
      S.excited = Math.max(S.excited, 0.7);
      S.modeTimer = rand(700, 1300);
    } else if (r < 0.93) {    // perch: settle low and rest wings
      S.mode = 'perch';
      S.ty = S.y + rand(40, 120);
      S.tx = S.x + rand(-60, 60);
      S.modeTimer = rand(3000, 6000);
    } else {                  // nap
      S.mode = 'nap';
      S.modeTimer = rand(9000, 16000);
      if (Math.random() < 0.5) say(pick(SLEEPY), 2500);
    }
    // keep targets inside page
    const m = 60;
    S.tx = Math.max(m, Math.min(pageW() - m, S.tx));
    S.ty = Math.max(m, Math.min(pageH() - m, S.ty));
  }

  function physics(strength, maxSpd, damp) {
    const dx = S.tx - S.x, dy = S.ty - S.y;
    S.vx += dx * strength; S.vy += dy * strength;
    S.vx *= damp; S.vy *= damp;
    const sp = Math.hypot(S.vx, S.vy);
    if (sp > maxSpd) { S.vx = S.vx / sp * maxSpd; S.vy = S.vy / sp * maxSpd; }
    S.x += S.vx; S.y += S.vy;
    if (Math.abs(S.vx) > 0.3) S.facing = S.vx > 0 ? 1 : -1;
  }

  let talkPhase = 0;
  function brain(dt, now) {
    S.modeTimer -= dt;
    S.excited = Math.max(0, S.excited - dt / 2500);

    switch (S.mode) {
      case 'drift':
        physics(0.012, 2.2, 0.86);
        if (S.modeTimer <= 0 || Math.hypot(S.tx - S.x, S.ty - S.y) < 8) chooseIdleMode();
        break;
      case 'hover':
        S.x += Math.sin(now * 0.0017) * 0.35;
        S.y += Math.cos(now * 0.0013) * 0.3;
        if (S.modeTimer <= 0) chooseIdleMode();
        break;
      case 'dart':
        physics(0.06, 8, 0.82);
        if (S.modeTimer <= 0) chooseIdleMode();
        break;
      case 'perch':
        physics(0.02, 1.5, 0.8);
        if (S.modeTimer <= 0) chooseIdleMode();
        break;
      case 'nap':
        S.y += Math.sin(now * 0.0015) * 0.12;
        if (S.modeTimer <= 0) wake();
        break;
      case 'approach':
        physics(0.045, 7, 0.8);
        if (Math.hypot(S.tx - S.x, S.ty - S.y) < 14) {
          S.mode = 'talk';
          talkPhase = now + rand(4000, 6000);          // stays 4–6 s
          say(pick(MSG[dwellSection] || MSG.default), 4200);
          burstDust(S.x, S.y, 10);
        }
        break;
      case 'talk':
        S.x += Math.sin(now * 0.003) * 0.3;
        S.y += Math.cos(now * 0.0024) * 0.25;
        if (now > talkPhase) {
          S.mode = 'leave';
          // drift off toward a random far point on the page
          S.tx = Math.random() < 0.5 ? rand(60, pageW() * 0.25) : rand(pageW() * 0.75, pageW() - 60);
          S.ty = Math.max(60, Math.min(pageH() - 60, S.y + rand(-500, 500)));
        }
        break;
      case 'leave':
        physics(0.014, 3.2, 0.86);
        if (Math.hypot(S.tx - S.x, S.ty - S.y) < 20) chooseIdleMode();
        break;
    }
  }

  /* ---------- particles ---------- */
  function burstDust(x, y, n) {
    for (let i = 0; i < n; i++) S.dust.push({
      x, y, vx: rand(-1.6, 1.6), vy: rand(-2.4, 0.4),
      life: 1, size: rand(1, 3.2),
      color: `hsl(${275 + Math.random() * 55},85%,76%)`
    });
  }

  function bigRipple() {
    const cx = S.x - sX(), cy = S.y - sY();
    for (let i = 0; i < 5; i++) S.ripples.push({
      x: cx, y: cy, r: 0,
      maxR: Math.max(innerWidth, innerHeight) * (0.55 + i * 0.13),
      speed: 11 + i * 5, life: 1, delay: i * 90,
      color: ['rgba(220,170,255,', 'rgba(255,200,240,', 'rgba(180,130,255,', 'rgba(255,230,255,'][i % 4]
    });
    for (let i = 0; i < 36; i++) {
      const a = Math.PI * 2 * i / 36, sp = rand(2.5, 7);
      S.dust.push({ x: S.x, y: S.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, size: rand(2, 5), color: `hsl(${270 + Math.random() * 80},90%,75%)` });
    }
    S.excited = 1;
    say(pick(CLICK), 2300);
  }

  hit.addEventListener('click', () => {
    if (S.mode === 'nap') { wake(); }
    bigRipple();
  });

  /* ---------- drawing ---------- */
  function star(x, y, r, alpha, color) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a1 = i * 4 * Math.PI / 5 - Math.PI / 2;
      const a2 = a1 + 2 * Math.PI / 5;
      i ? ctx.lineTo(x + r * Math.cos(a1), y + r * Math.sin(a1)) : ctx.moveTo(x + r * Math.cos(a1), y + r * Math.sin(a1));
      ctx.lineTo(x + r * 0.4 * Math.cos(a2), y + r * 0.4 * Math.sin(a2));
    }
    ctx.closePath(); ctx.fill(); ctx.restore();
  }

  function drawRipples() {
    S.ripples = S.ripples.filter(r => r.life > 0);
    for (const r of S.ripples) {
      if (r.delay > 0) { r.delay -= 16; continue; }
      r.r += r.speed;
      r.life = Math.max(0, 1 - r.r / r.maxR);
      ctx.save();
      ctx.globalAlpha = r.life * 0.35;
      ctx.strokeStyle = r.color + '1)'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.stroke();
      if (r.r < r.maxR * 0.35) {
        const g = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, r.r);
        g.addColorStop(0, r.color + r.life * 0.12 + ')');
        g.addColorStop(1, r.color + '0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.fill();
      }
      for (let i = 0; i < 8; i++) {
        const a = Math.PI * 2 * i / 8 + r.r * 0.01;
        star(r.x + Math.cos(a) * r.r, r.y + Math.sin(a) * r.r, 3, r.life * 0.7, '#f5d0ff');
      }
      ctx.restore();
    }
  }

  function drawParticles() {
    S.trail = S.trail.filter(p => (p.life -= 0.03) > 0);
    for (const p of S.trail) {
      ctx.globalAlpha = p.life * 0.35;
      ctx.fillStyle = 'rgb(210,170,255)';
      ctx.beginPath(); ctx.arc(p.x - sX(), p.y - sY(), p.size * p.life, 0, Math.PI * 2); ctx.fill();
    }
    S.dust = S.dust.filter(d => (d.life -= 0.022) > 0);
    for (const d of S.dust) {
      d.x += d.vx; d.y += d.vy; d.vy -= 0.05;
      const cx = d.x - sX(), cy = d.y - sY();
      ctx.globalAlpha = d.life * 0.8; ctx.fillStyle = d.color;
      ctx.beginPath(); ctx.arc(cx, cy, d.size * d.life, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /* fairy ~30% smaller & slimmer, soft round face, drawn at scale F */
  const F = 0.72;
  function drawFairy(cx, cy, t) {
    const napping = S.mode === 'nap';
    const perched = S.mode === 'perch';
    const bob = Math.sin(t * 0.004) * (napping ? 1.2 : 3) * F;
    const y = cy + bob;
    const flapSpeed = napping || perched ? 0.06 : 0.28 + S.excited * 0.25;
    const wing = Math.sin(t * flapSpeed * 0.06) * (napping ? 0.08 : 0.45 + S.excited * 0.5);
    const glow = 0.5 + 0.5 * Math.sin(t * 0.002);

    ctx.save();
    ctx.translate(cx, y);
    ctx.scale(S.facing * F, F);

    // aura
    const aura = ctx.createRadialGradient(0, 0, 0, 0, 0, 46);
    aura.addColorStop(0, `rgba(220,170,255,${0.15 * glow})`);
    aura.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = aura;
    ctx.beginPath(); ctx.arc(0, 0, 46, 0, Math.PI * 2); ctx.fill();

    // wings (slim, four)
    ctx.save();
    ctx.translate(0, -4);
    for (const side of [-1, 1]) {
      // upper
      ctx.save();
      ctx.scale(side, 1);
      ctx.rotate(-0.22 + wing);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-20, -26, -40, -7, -26, 8);
      ctx.bezierCurveTo(-15, 16, -4, 8, 0, 0);
      const g1 = ctx.createLinearGradient(-34, -16, 0, 8);
      g1.addColorStop(0, `rgba(232,205,255,${0.6 + 0.15 * glow})`);
      g1.addColorStop(1, 'rgba(200,160,255,.18)');
      ctx.fillStyle = g1; ctx.fill();
      ctx.strokeStyle = 'rgba(190,150,255,.3)'; ctx.lineWidth = 0.5; ctx.stroke();
      ctx.restore();
      // lower
      ctx.save();
      ctx.scale(side, 1);
      ctx.rotate(-0.06 + wing * 0.5);
      ctx.beginPath();
      ctx.moveTo(0, 2);
      ctx.bezierCurveTo(-11, 2, -18, 14, -10, 19);
      ctx.bezierCurveTo(-4, 21, -1, 13, 0, 2);
      ctx.fillStyle = `rgba(215,180,255,${0.3 + 0.08 * glow})`;
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // slim body
    const bg = ctx.createLinearGradient(0, -10, 0, 12);
    bg.addColorStop(0, '#efd0ff'); bg.addColorStop(0.55, '#d8a8ff'); bg.addColorStop(1, '#c080ff');
    ctx.fillStyle = bg;
    ctx.beginPath(); ctx.ellipse(0, 2, 3.2, 8, 0, 0, Math.PI * 2); ctx.fill();

    // little flared skirt
    ctx.beginPath();
    ctx.moveTo(-3.2, 6.5);
    ctx.bezierCurveTo(-7, 12, -6.5, 17, 0, 18);
    ctx.bezierCurveTo(6.5, 17, 7, 12, 3.2, 6.5);
    ctx.closePath();
    ctx.fillStyle = 'rgba(200,145,255,.85)'; ctx.fill();
    ctx.fillStyle = 'rgba(245,220,255,.4)';
    ctx.beginPath(); ctx.ellipse(-1, 11.5, 1.5, 3.2, -0.3, 0, Math.PI * 2); ctx.fill();

    // thin arms
    ctx.strokeStyle = '#f0c8ff'; ctx.lineWidth = 1.1; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-3, 0); ctx.bezierCurveTo(-7, -1.5, -8.5, 2.5, -7.5, 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(3, 0); ctx.bezierCurveTo(7, -1.5, 8.5, 2.5, 7.5, 6); ctx.stroke();

    // head — bigger relative to body = cuter
    ctx.fillStyle = '#fdeae0';
    ctx.beginPath(); ctx.arc(0, -14, 6.2, 0, Math.PI * 2); ctx.fill();

    // blush
    ctx.fillStyle = 'rgba(255,160,170,.45)';
    ctx.beginPath(); ctx.ellipse(-3.4, -12, 1.9, 1.1, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(3.4, -12, 1.9, 1.1, 0, 0, Math.PI * 2); ctx.fill();

    // eyes — big and sparkly
    if (napping) {
      ctx.strokeStyle = '#b090d0'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(-2.1, -14, 1.6, Math.PI * 0.1, Math.PI * 0.9); ctx.stroke();
      ctx.beginPath(); ctx.arc(2.1, -14, 1.6, Math.PI * 0.1, Math.PI * 0.9); ctx.stroke();
    } else if (S.blink) {
      ctx.strokeStyle = '#5a2d82'; ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.moveTo(-3, -14); ctx.lineTo(-1.2, -14); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(1.2, -14); ctx.lineTo(3, -14); ctx.stroke();
    } else {
      ctx.fillStyle = '#5a2d82';
      ctx.beginPath(); ctx.ellipse(-2.1, -14.4, 1.6, 1.9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(2.1, -14.4, 1.6, 1.9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'white';
      ctx.beginPath(); ctx.arc(-2.7, -15.2, 0.6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(1.5, -15.2, 0.6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(-1.7, -13.6, 0.3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(2.5, -13.6, 0.3, 0, Math.PI * 2); ctx.fill();
    }

    // tiny smile
    ctx.strokeStyle = '#c47ab8'; ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.arc(0, -10.8, napping ? 1.3 : 1.6 + S.excited * 0.7, 0.25, Math.PI - 0.25);
    ctx.stroke();

    // hair — soft bob with a strand
    ctx.fillStyle = '#c070ff';
    ctx.beginPath(); ctx.ellipse(-4, -17, 3.2, 4.2, -0.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(4, -17, 3.2, 4.2, 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, -19.5, 2.8, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#d090ff'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-4, -19.5); ctx.bezierCurveTo(-6.5, -23.5, -3.5, -26, -1.8, -23.5); ctx.stroke();

    // wand (hidden while napping/perched)
    if (!napping && !perched) {
      ctx.save();
      ctx.rotate(0.28 + Math.sin(t * 0.004) * 0.12);
      ctx.strokeStyle = '#e0b8ff'; ctx.lineWidth = 0.9;
      ctx.beginPath(); ctx.moveTo(4, -8); ctx.lineTo(13, -18); ctx.stroke();
      star(13, -18, 2.6, 0.7 + 0.3 * glow, 'rgb(255,242,120)');
      ctx.restore();
    }
    ctx.restore();

    // zzz while napping
    if (napping) {
      const za = 0.5 + 0.5 * Math.sin(t * 0.005);
      ctx.fillStyle = `rgba(180,130,255,${0.65 * za})`;
      ctx.font = `bold ${(8 + za * 3) * F}px Georgia`;
      ctx.fillText('z', cx + 12 * F, y - 22 * F - za * 4);
      ctx.font = `bold ${(6 + za * 2) * F}px Georgia`;
      ctx.fillText('z', cx + 19 * F, y - 29 * F - za * 3);
    }
  }

  /* ---------- blink ---------- */
  (function blinkLoop() {
    setTimeout(() => {
      if (S.mode !== 'nap') { S.blink = true; setTimeout(() => S.blink = false, 130); }
      blinkLoop();
    }, rand(3000, 8000));
  })();

  /* ---------- greeting + first visit ---------- */
  setTimeout(() => {
    if (!S.greeted) { S.greeted = true; say("Psst! I'm Maya~ Click me for magic ✨", 3500); }
  }, 1500);
  setTimeout(startVisit, 6000);

  /* ---------- main loop ---------- */
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(50, now - last);
    last = now;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    brain(dt, now);
    maybeVisit(now);

    // sparkle trail while moving
    if (S.mode !== 'nap' && Math.hypot(S.vx, S.vy) > 0.7) {
      S.trail.push({ x: S.x, y: S.y, life: 1, size: 2.5 + Math.hypot(S.vx, S.vy) * 0.4 });
      if (Math.random() > 0.6) burstDust(S.x + rand(-5, 5), S.y + rand(-5, 5), 1);
    }

    // keep her on the page
    const m = 50;
    S.x = Math.max(m, Math.min(pageW() - m, S.x));
    S.y = Math.max(m, Math.min(pageH() - m, S.y));

    const vx = S.x - sX(), vy = S.y - sY();
    hit.style.left = vx + 'px';
    hit.style.top = vy + 'px';

    drawRipples();
    drawParticles();
    drawFairy(vx, vy, now);
    bubbleTick(now, vx, vy);

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
