/* ============================================================
   MAYA — THE LIVING SITE FAIRY  v6.0
   ============================================================
   A shy, cute, alive fairy who flies across your whole site,
   notices which page/section you're on, drifts in when you
   linger, and whispers a little floating message above her head.

   LOAD IN WIX:
   Settings → Custom Code → Add Custom Code → Body, all pages:
   <script src="https://cdn.jsdelivr.net/gh/Prasiddhe/maya-fairy@main/maya-fairy.js"></script>

   v6 changes:
   • Cuter, smaller fairy — bigger head, fast-flapping little wings,
     head tilts and turns toward where she's going (alive feel).
   • Real shy behavior: peeks in, hesitates, comes close, delivers
     one line, gets bashful, then flits away on her own.
   • Knows the page + section; lots of varied, alive lines.
   • Gentle suggestion lines (tarot / horoscope / guidance) woven in.
   • Continuous magical dust trail behind her.
   • Cooldowns so she's never spammy.
   ============================================================ */

(function () {
  'use strict';
  if (window.__mayaFairyLoaded) return;
  window.__mayaFairyLoaded = true;

  var rand = function (a, b) { return a + Math.random() * (b - a); };
  var pick = function (arr) {
    var m = arr[Math.floor(Math.random() * arr.length)];
    if (arr.length > 1) { var guard = 0; while (m === lastMsg && guard++ < 6) m = arr[Math.floor(Math.random() * arr.length)]; }
    lastMsg = m; return m;
  };
  var lastMsg = '';

  /* ---------- her voice: lots of alive, shy, interactive lines ---------- */
  var MSG = {
    greet: [
      "Oh!\u2026 h-hello there ✨", "Eep! You saw me 🙈", "Psst\u2026 hi~ I'm Maya ✨",
      "A visitor! *hides behind wing* hehe", "You\u2019re here\u2026 I\u2019m so happy 🌸"
    ],
    hero: [
      "Welcome to Pranjal\u2019s little world of magic ✨", "I\u2019ve been waiting for you~ 🌙",
      "Feel that? The air is lighter here 🌸", "This is where every journey begins\u2026"
    ],
    about: [
      "Pranjal has the warmest soul, you\u2019ll see 🌸", "Curious about us? I like curious hearts~",
      "She\u2019s helped so many people heal ✨", "Stay a while\u2026 get to know us 🙈"
    ],
    services: [
      "Confused which path to pick? I can help~ ✨", "Psst\u2026 a tarot session might bring clarity 🔮",
      "So many ways to heal here\u2026 take your time 🌸", "Tap something! I\u2019ll cheer you on 💜"
    ],
    tarot: [
      "The cards whisper\u2026 shall we listen? 🔮", "A tarot reading could light your way ✨",
      "Confused? One question, one card, one answer~ 🌙", "I love the tarot page\u2026 it hums with magic 💫"
    ],
    horoscope: [
      "Have you read your stars today? 🌟", "Tap your zodiac\u2026 the sky has a message ✨",
      "Your daily horoscope is waiting up there~ 🌙", "The stars know something about today\u2026 👀"
    ],
    numerology: [
      "Your numbers hold secrets\u2026 want to know? 🔢✨", "Names and numbers carry destiny~ 🌸",
      "Curious what your life path number says? 💫"
    ],
    shop: [
      "Ooh, pretty crystals\u2026 I want them all 🔮", "A bracelet to hold your intentions ✨",
      "The Love Oil smells like roses and magic 🌹", "Take a treasure home with you~ 🌸"
    ],
    courses: [
      "Want to learn real magic? Lilith\u2019s course is special ✨", "You could become the healer one day 🌙",
      "So much to learn here\u2026 it excites me! 💜"
    ],
    contact: [
      "Say hello to Pranjal\u2026 don\u2019t be shy 🙈", "I\u2019ll carry your message myself ✉️✨",
      "One little message\u2026 it could change everything 🌸"
    ],
    testimonials: [
      "So many happy hearts\u2026 it makes me glow ✨", "These stories\u2026 they\u2019re all real 💜"
    ],
    'default': [
      "Take your time\u2026 I\u2019ll keep you company 🌸", "Hmm, cozy spot you found~ ✨",
      "Confused about anything? Just ask the cards 🔮", "I saw you reading\u2026 👀 hehe",
      "Need guidance? Tarot, stars, numbers\u2026 I\u2019m here 🌙", "Exploring makes me happy ✨"
    ]
  };
  var IDLE = ["la la la~ ♪", "*flutters softly*", "✨", "*hums a tiny tune*", "🌸", "*twirls*"];
  var SHY = ["*peeks*\u2026 hi 🙈", "oh! you\u2019re looking at me~", "*hides face* hehe ✨"];
  var CLICK = ["Eee~! Magic! ✨💜", "Hehe that tickles! ✨", "Wheee~! 💫", "*giggles* again! again!"];

  /* ---------- page + section detection ---------- */
  function detectPage() {
    var p = (location.pathname + ' ' + location.href).toLowerCase();
    if (/tarot|about-1/.test(p)) return 'tarot';
    if (/horoscope|zodiac/.test(p)) return 'horoscope';
    if (/numerolog|about-3-1/.test(p)) return 'numerology';
    if (/product|shop|store|bracelet|oil/.test(p)) return 'shop';
    if (/course|workshop|lilith|hekate|akashic/.test(p)) return 'courses';
    if (/about/.test(p)) return 'about';
    if (/contact/.test(p)) return 'contact';
    return null; // unknown → fall back to on-screen section
  }
  function detectSection() {
    var fromUrl = detectPage();
    if (fromUrl) return fromUrl;
    var midY = innerHeight / 2, key = 'default';
    var els = document.querySelectorAll('section,[data-section],[class*="section"],[id]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i], r = el.getBoundingClientRect();
      if (r.height < 50 || r.top > midY || r.bottom < midY) continue;
      var id = (el.id + ' ' + el.className).toLowerCase();
      if (/hero|banner|intro/.test(id)) key = 'hero';
      else if (/tarot/.test(id)) key = 'tarot';
      else if (/horoscope|zodiac/.test(id)) key = 'horoscope';
      else if (/numerolog/.test(id)) key = 'numerology';
      else if (/about/.test(id)) key = 'about';
      else if (/service/.test(id)) key = 'services';
      else if (/product|shop|gallery|store/.test(id)) key = 'shop';
      else if (/course|workshop/.test(id)) key = 'courses';
      else if (/testimonial|review/.test(id)) key = 'testimonials';
      else if (/contact|footer/.test(id)) key = 'contact';
    }
    return key;
  }

  /* ---------- state (page-space coords) ---------- */
  var sX = function () { return window.scrollX || 0; };
  var sY = function () { return window.scrollY || 0; };
  var pageW = function () { return Math.max(document.body.scrollWidth, document.documentElement.scrollWidth, innerWidth); };
  var pageH = function () { return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, innerHeight); };

  var S = {
    x: sX() + innerWidth * 0.85, y: sY() + innerHeight * 0.35,
    vx: 0, vy: 0,
    tx: sX() + innerWidth * 0.85, ty: sY() + innerHeight * 0.35,
    mode: 'drift', modeTimer: 0,
    facing: 1, headTilt: 0,
    blink: false, excited: 0, shyness: 0,
    bubbleUntil: 0, lastVisit: 0, greeted: false
  };

  /* ---------- canvas ---------- */
  var canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:99998;';
  document.body.appendChild(canvas);
  var ctx = canvas.getContext('2d');
  function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
  resize(); addEventListener('resize', resize);

  /* ---------- click target ---------- */
  var hit = document.createElement('div');
  hit.style.cssText = 'position:fixed;width:54px;height:54px;border-radius:50%;cursor:pointer;z-index:99999;transform:translate(-50%,-50%);background:transparent;';
  document.body.appendChild(hit);

  /* ---------- floating message bubble (above her head) ---------- */
  var bubble = document.createElement('div');
  bubble.style.cssText = [
    'position:fixed', 'transform:translate(-50%,-100%) scale(.8)', 'transform-origin:50% 100%',
    'background:rgba(255,247,255,.97)', 'border:1.5px solid rgba(205,165,255,.55)',
    'border-radius:16px', 'padding:8px 14px',
    'font-family:Georgia,serif', 'font-size:12.5px', 'color:#6a3d8f',
    'max-width:210px', 'line-height:1.5', 'text-align:center',
    'box-shadow:0 6px 22px rgba(160,100,255,.28)', 'z-index:99999',
    'pointer-events:none', 'opacity:0',
    'transition:opacity .35s ease,transform .35s cubic-bezier(.34,1.56,.64,1)',
    'backdrop-filter:blur(6px)', 'white-space:normal'
  ].join(';');
  document.body.appendChild(bubble);
  var tail = document.createElement('div');
  tail.style.cssText = 'position:absolute;left:50%;bottom:-6px;transform:translateX(-50%) rotate(45deg);width:10px;height:10px;background:rgba(255,247,255,.97);border-right:1.5px solid rgba(205,165,255,.55);border-bottom:1.5px solid rgba(205,165,255,.55);';
  bubble.appendChild(tail);
  var bubbleText = document.createElement('span');
  bubble.insertBefore(bubbleText, tail);

  function say(text, ms) {
    bubbleText.textContent = text;
    S.bubbleUntil = performance.now() + (ms || 3400);
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
      bubble.style.left = Math.max(115, Math.min(innerWidth - 115, vx)) + 'px';
      bubble.style.top = Math.max(60, vy - 36) + 'px';
    }
  }

  /* ---------- dwell watcher: she notices you lingering ---------- */
  var lastActivity = performance.now();
  var dwellSection = detectSection();
  function activity() {
    lastActivity = performance.now();
    var k = detectSection();
    if (k !== dwellSection) dwellSection = k;
  }
  addEventListener('scroll', activity, { passive: true });
  addEventListener('mousemove', activity, { passive: true });
  addEventListener('touchstart', activity, { passive: true });

  function maybeVisit(now) {
    if (S.mode === 'approach' || S.mode === 'talk' || S.mode === 'leave' || S.mode === 'shy') return;
    var still = now - lastActivity;
    var cooled = now - S.lastVisit > rand(16000, 28000);
    if (still > rand(3000, 4500) && cooled) startVisit();   // ~3s of lingering
  }
  function startVisit() {
    S.lastVisit = performance.now();
    S.mode = 'approach';
    S.excited = 0.8;
    S.tx = sX() + innerWidth * rand(0.35, 0.62);
    S.ty = sY() + innerHeight * rand(0.30, 0.48);
  }

  /* ---------- behavior brain ---------- */
  function chooseIdleMode() {
    var r = Math.random();
    var m = 70;
    if (r < 0.42) {                 // drift somewhere new across the page
      S.mode = 'drift';
      S.tx = rand(m, pageW() - m); S.ty = sY() + rand(m, innerHeight - m);
      S.modeTimer = rand(2800, 6000);
    } else if (r < 0.66) {          // hover & bob
      S.mode = 'hover'; S.modeTimer = rand(1400, 3400);
      if (Math.random() < 0.28) say(pick(IDLE), 2000);
    } else if (r < 0.82) {          // curious dart
      S.mode = 'dart';
      S.tx = S.x + rand(-240, 240); S.ty = S.y + rand(-150, 150);
      S.excited = Math.max(S.excited, 0.7); S.modeTimer = rand(600, 1200);
    } else if (r < 0.94) {          // perch & rest
      S.mode = 'perch'; S.tx = S.x + rand(-50, 50); S.ty = S.y + rand(30, 90);
      S.modeTimer = rand(2600, 5200);
    } else {                        // shy peek
      S.mode = 'shy'; S.modeTimer = rand(1600, 2600);
      say(pick(SHY), 2200); S.shyness = 1;
    }
    S.tx = Math.max(m, Math.min(pageW() - m, S.tx));
    S.ty = Math.max(sY() + m, Math.min(sY() + innerHeight - m, S.ty));
  }

  function physics(strength, maxSpd, damp) {
    var dx = S.tx - S.x, dy = S.ty - S.y;
    S.vx += dx * strength; S.vy += dy * strength;
    S.vx *= damp; S.vy *= damp;
    var sp = Math.hypot(S.vx, S.vy);
    if (sp > maxSpd) { S.vx = S.vx / sp * maxSpd; S.vy = S.vy / sp * maxSpd; }
    S.x += S.vx; S.y += S.vy;
    if (Math.abs(S.vx) > 0.25) S.facing = S.vx > 0 ? 1 : -1;
    // head tilts toward motion — alive feel
    S.headTilt += (Math.max(-0.4, Math.min(0.4, S.vx * 0.04)) - S.headTilt) * 0.1;
  }

  var talkPhase = 0;
  function brain(dt, now) {
    S.modeTimer -= dt;
    S.excited = Math.max(0, S.excited - dt / 2400);
    S.shyness = Math.max(0, S.shyness - dt / 3000);

    switch (S.mode) {
      case 'drift': physics(0.012, 2.2, 0.86);
        if (S.modeTimer <= 0 || Math.hypot(S.tx - S.x, S.ty - S.y) < 8) chooseIdleMode(); break;
      case 'hover':
        S.x += Math.sin(now * 0.0017) * 0.35; S.y += Math.cos(now * 0.0013) * 0.3;
        if (S.modeTimer <= 0) chooseIdleMode(); break;
      case 'dart': physics(0.06, 8, 0.82);
        if (S.modeTimer <= 0) chooseIdleMode(); break;
      case 'perch': physics(0.02, 1.5, 0.8);
        if (S.modeTimer <= 0) chooseIdleMode(); break;
      case 'shy':
        S.x += Math.sin(now * 0.004) * 0.5; S.y += Math.cos(now * 0.003) * 0.3;
        if (S.modeTimer <= 0) chooseIdleMode(); break;
      case 'approach': physics(0.045, 7, 0.8);
        if (Math.hypot(S.tx - S.x, S.ty - S.y) < 14) {
          S.mode = 'talk'; talkPhase = now + rand(4200, 6200);
          say(pick(MSG[dwellSection] || MSG['default']), 4400);
          burstDust(S.x, S.y, 12); S.shyness = 0.6;
        } break;
      case 'talk':
        S.x += Math.sin(now * 0.003) * 0.3; S.y += Math.cos(now * 0.0024) * 0.25;
        if (now > talkPhase) {
          S.mode = 'leave';
          S.tx = Math.random() < 0.5 ? rand(60, pageW() * 0.22) : rand(pageW() * 0.78, pageW() - 60);
          S.ty = sY() + rand(60, innerHeight - 60); S.shyness = 0.8;
        } break;
      case 'leave': physics(0.014, 3.4, 0.86);
        if (Math.hypot(S.tx - S.x, S.ty - S.y) < 20) chooseIdleMode(); break;
    }
  }

  /* ---------- particles ---------- */
  function burstDust(x, y, n) {
    for (var i = 0; i < n; i++) S.dust.push({
      x: x, y: y, vx: rand(-1.6, 1.6), vy: rand(-2.4, 0.4),
      life: 1, size: rand(1, 3.2), color: 'hsl(' + (275 + Math.random() * 55) + ',85%,76%)'
    });
  }
  S.trail = []; S.dust = []; S.ripples = [];

  function bigRipple() {
    var cx = S.x - sX(), cy = S.y - sY();
    for (var i = 0; i < 5; i++) S.ripples.push({
      x: cx, y: cy, r: 0, maxR: Math.max(innerWidth, innerHeight) * (0.5 + i * 0.12),
      speed: 10 + i * 5, life: 1, delay: i * 90,
      color: ['rgba(220,170,255,', 'rgba(255,200,240,', 'rgba(180,130,255,', 'rgba(255,230,255,'][i % 4]
    });
    for (var j = 0; j < 34; j++) {
      var a = Math.PI * 2 * j / 34, sp = rand(2.5, 7);
      S.dust.push({ x: S.x, y: S.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, size: rand(2, 5), color: 'hsl(' + (270 + Math.random() * 80) + ',90%,75%)' });
    }
    S.excited = 1; say(pick(CLICK), 2200);
  }
  hit.addEventListener('click', bigRipple);

  /* ---------- drawing helpers ---------- */
  function star(x, y, r, alpha, color) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.beginPath();
    for (var i = 0; i < 5; i++) {
      var a1 = i * 4 * Math.PI / 5 - Math.PI / 2, a2 = a1 + 2 * Math.PI / 5;
      i ? ctx.lineTo(x + r * Math.cos(a1), y + r * Math.sin(a1)) : ctx.moveTo(x + r * Math.cos(a1), y + r * Math.sin(a1));
      ctx.lineTo(x + r * 0.4 * Math.cos(a2), y + r * 0.4 * Math.sin(a2));
    }
    ctx.closePath(); ctx.fill(); ctx.restore();
  }
  function drawRipples() {
    S.ripples = S.ripples.filter(function (r) { return r.life > 0; });
    for (var k = 0; k < S.ripples.length; k++) {
      var r = S.ripples[k];
      if (r.delay > 0) { r.delay -= 16; continue; }
      r.r += r.speed; r.life = Math.max(0, 1 - r.r / r.maxR);
      ctx.save(); ctx.globalAlpha = r.life * 0.35;
      ctx.strokeStyle = r.color + '1)'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.stroke();
      for (var i = 0; i < 8; i++) {
        var a = Math.PI * 2 * i / 8 + r.r * 0.01;
        star(r.x + Math.cos(a) * r.r, r.y + Math.sin(a) * r.r, 3, r.life * 0.7, '#f5d0ff');
      }
      ctx.restore();
    }
  }
  function drawParticles() {
    S.trail = S.trail.filter(function (p) { return (p.life -= 0.03) > 0; });
    for (var t = 0; t < S.trail.length; t++) {
      var p = S.trail[t];
      ctx.globalAlpha = p.life * 0.38; ctx.fillStyle = 'rgb(210,170,255)';
      ctx.beginPath(); ctx.arc(p.x - sX(), p.y - sY(), p.size * p.life, 0, Math.PI * 2); ctx.fill();
    }
    S.dust = S.dust.filter(function (d) { return (d.life -= 0.022) > 0; });
    for (var i = 0; i < S.dust.length; i++) {
      var d = S.dust[i]; d.x += d.vx; d.y += d.vy; d.vy -= 0.05;
      ctx.globalAlpha = d.life * 0.8; ctx.fillStyle = d.color;
      ctx.beginPath(); ctx.arc(d.x - sX(), d.y - sY(), d.size * d.life, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- the fairy — cute, small, fast wings, movable head ---------- */
  var F = 0.74;
  function drawFairy(cx, cy, t) {
    var perched = S.mode === 'perch';
    var shy = S.mode === 'shy' || S.shyness > 0.5;
    var bob = Math.sin(t * 0.004) * 3 * F;
    var y = cy + bob;
    // fast little wing flap, faster when excited
    var flap = Math.sin(t * (0.045 + S.excited * 0.03)) * (0.5 + S.excited * 0.5);
    var glow = 0.5 + 0.5 * Math.sin(t * 0.002);

    ctx.save();
    ctx.translate(cx, y);
    ctx.scale(S.facing * F, F);

    // aura
    var aura = ctx.createRadialGradient(0, 0, 0, 0, 0, 44);
    aura.addColorStop(0, 'rgba(220,170,255,' + (0.16 * glow) + ')');
    aura.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = aura; ctx.beginPath(); ctx.arc(0, 0, 44, 0, Math.PI * 2); ctx.fill();

    // wings — four, slim, fast
    ctx.save(); ctx.translate(0, -3);
    for (var s = -1; s <= 1; s += 2) {
      ctx.save(); ctx.scale(s, 1); ctx.rotate(-0.20 + flap);
      ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-18, -24, -36, -6, -23, 7);
      ctx.bezierCurveTo(-13, 14, -3, 7, 0, 0);
      var g1 = ctx.createLinearGradient(-30, -14, 0, 7);
      g1.addColorStop(0, 'rgba(232,205,255,' + (0.62 + 0.15 * glow) + ')');
      g1.addColorStop(1, 'rgba(200,160,255,.18)');
      ctx.fillStyle = g1; ctx.fill();
      ctx.strokeStyle = 'rgba(190,150,255,.3)'; ctx.lineWidth = 0.5; ctx.stroke();
      ctx.restore();
      ctx.save(); ctx.scale(s, 1); ctx.rotate(-0.05 + flap * 0.5);
      ctx.beginPath(); ctx.moveTo(0, 2);
      ctx.bezierCurveTo(-10, 2, -16, 13, -9, 17);
      ctx.bezierCurveTo(-3, 19, -1, 12, 0, 2);
      ctx.fillStyle = 'rgba(215,180,255,' + (0.3 + 0.08 * glow) + ')'; ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // slim body
    var bg = ctx.createLinearGradient(0, -8, 0, 11);
    bg.addColorStop(0, '#efd0ff'); bg.addColorStop(0.55, '#d8a8ff'); bg.addColorStop(1, '#c080ff');
    ctx.fillStyle = bg; ctx.beginPath(); ctx.ellipse(0, 2, 3, 7.5, 0, 0, Math.PI * 2); ctx.fill();

    // little skirt
    ctx.beginPath(); ctx.moveTo(-3, 6); ctx.bezierCurveTo(-6.5, 11, -6, 16, 0, 17);
    ctx.bezierCurveTo(6, 16, 6.5, 11, 3, 6); ctx.closePath();
    ctx.fillStyle = 'rgba(200,145,255,.85)'; ctx.fill();

    // thin arms — covers face a bit when shy
    ctx.strokeStyle = '#f0c8ff'; ctx.lineWidth = 1.1; ctx.lineCap = 'round';
    if (shy) {
      ctx.beginPath(); ctx.moveTo(-3, -1); ctx.bezierCurveTo(-5, -8, -3, -12, -1.5, -12.5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(3, -1); ctx.bezierCurveTo(5, -8, 3, -12, 1.5, -12.5); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.moveTo(-3, 0); ctx.bezierCurveTo(-7, -1.5, -8, 2.5, -7, 5.5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(3, 0); ctx.bezierCurveTo(7, -1.5, 8, 2.5, 7, 5.5); ctx.stroke();
    }

    // HEAD — movable: tilts toward motion. big & cute.
    ctx.save();
    ctx.translate(0, -13);
    ctx.rotate(S.headTilt * S.facing);

    ctx.fillStyle = '#fdeae0';
    ctx.beginPath(); ctx.arc(0, -1, 6.3, 0, Math.PI * 2); ctx.fill();

    // blush
    ctx.fillStyle = 'rgba(255,160,170,' + (shy ? 0.7 : 0.45) + ')';
    ctx.beginPath(); ctx.ellipse(-3.4, 1, 1.9, 1.1, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(3.4, 1, 1.9, 1.1, 0, 0, Math.PI * 2); ctx.fill();

    // eyes
    if (S.blink) {
      ctx.strokeStyle = '#5a2d82'; ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.moveTo(-3, -1); ctx.lineTo(-1.2, -1); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(1.2, -1); ctx.lineTo(3, -1); ctx.stroke();
    } else {
      ctx.fillStyle = '#5a2d82';
      ctx.beginPath(); ctx.ellipse(-2.1, -1.4, 1.6, 1.95, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(2.1, -1.4, 1.6, 1.95, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'white';
      ctx.beginPath(); ctx.arc(-2.7, -2.2, 0.6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(1.5, -2.2, 0.6, 0, Math.PI * 2); ctx.fill();
    }

    // smile
    ctx.strokeStyle = '#c47ab8'; ctx.lineWidth = 0.9;
    ctx.beginPath(); ctx.arc(0, 2.2, 1.5 + S.excited * 0.6, 0.25, Math.PI - 0.25); ctx.stroke();

    // hair — soft bob + strand
    ctx.fillStyle = '#c070ff';
    ctx.beginPath(); ctx.ellipse(-4, -4, 3.2, 4.2, -0.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(4, -4, 3.2, 4.2, 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, -6.5, 2.8, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#d090ff'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-4, -6.5); ctx.bezierCurveTo(-6.5, -10.5, -3.5, -13, -1.8, -10.5); ctx.stroke();
    ctx.restore(); // head

    // wand (not while perched/shy)
    if (!perched && !shy) {
      ctx.save(); ctx.rotate(0.28 + Math.sin(t * 0.004) * 0.12);
      ctx.strokeStyle = '#e0b8ff'; ctx.lineWidth = 0.9;
      ctx.beginPath(); ctx.moveTo(4, -7); ctx.lineTo(13, -17); ctx.stroke();
      star(13, -17, 2.6, 0.7 + 0.3 * glow, 'rgb(255,242,120)');
      ctx.restore();
    }
    ctx.restore();
  }

  /* ---------- blink loop ---------- */
  (function blinkLoop() {
    setTimeout(function () {
      S.blink = true; setTimeout(function () { S.blink = false; }, 130);
      blinkLoop();
    }, rand(2800, 7000));
  })();

  /* ---------- greeting + first visit ---------- */
  setTimeout(function () { if (!S.greeted) { S.greeted = true; say(pick(MSG.greet), 3600); } }, 1400);
  setTimeout(startVisit, 6500);

  /* ---------- main loop ---------- */
  var last = performance.now();
  function loop(now) {
    var dt = Math.min(50, now - last); last = now;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    brain(dt, now);
    maybeVisit(now);

    // continuous magical dust trail while moving
    if (Math.hypot(S.vx, S.vy) > 0.6) {
      S.trail.push({ x: S.x, y: S.y, life: 1, size: 2.4 + Math.hypot(S.vx, S.vy) * 0.4 });
      if (Math.random() > 0.55) burstDust(S.x + rand(-4, 4), S.y + rand(-4, 4), 1);
    }

    // keep her within the page bounds
    var m = 50;
    S.x = Math.max(m, Math.min(pageW() - m, S.x));
    S.y = Math.max(sY() + m, Math.min(sY() + pageH() - m, S.y));

    var vx = S.x - sX(), vy = S.y - sY();
    hit.style.left = vx + 'px'; hit.style.top = vy + 'px';

    drawRipples();
    drawParticles();
    drawFairy(vx, vy, now);
    bubbleTick(now, vx, vy);

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
