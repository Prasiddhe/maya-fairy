/* ============================================================
   MAYA – THE MYSTICAL SITE FAIRY  v2.0
   ============================================================
   Drop this file into your GitHub repo (Prasiddhe/maya-fairy)
   then load via Wix Custom Code:
   <script src="https://cdn.jsdelivr.net/gh/Prasiddhe/maya-fairy@main/maya-fairy.js"></script>

   Place in: Body – All Pages
   ============================================================ */

(function () {
  'use strict';

  /* ── SECTION MESSAGES ──────────────────────────────────── */
  const SECTION_MESSAGES = {
    hero:     ["Psst… welcome ✨ I've been waiting~", "Oh! A visitor! Hello hello hello~", "You found me! I'm Maya… your little guide 🌟"],
    about:    ["So you want to know more? Hehe~ curious one!", "This is my favourite part… the story ✨", "I love this section~ it has such warm energy 🌸"],
    services: ["Ooh, looking at what we do? Good choice~", "These are some of my favourite things! ✨", "Pick something… I'll cheer you on! 🌟"],
    portfolio:["Pretty things! I helped make some of these~", "Wooow so much creativity here! 🌸", "I get so proud when people look at this part ✨"],
    contact:  ["Oh! Are you going to say hello? Please do~", "Don't be shy! I'm not… well, sometimes I am 🙈", "Go on, send a message! I'll deliver it myself~ ✉️✨"],
    default:  ["Hmm, interesting spot you picked~", "I like it here… it's cozy 🌸", "You're exploring! That makes me happy ✨", "Shhh… I'm resting but I saw you 👀~"]
  };

  /* ── IDLE FAIRY THOUGHTS (shown when she yawns/stretches) ─ */
  const IDLE_THOUGHTS = [
    "zZz… 💤", "*yawns* so peaceful~", "la la la~ ♪", "*stretches wings*",
    "I wonder what's beyond this page…", "✨ sparkle sparkle ✨", "*hums softly*"
  ];

  /* ── STATE ──────────────────────────────────────────────── */
  const state = {
    x: window.innerWidth * 0.8,
    y: window.innerHeight * 0.3,
    vx: 0, vy: 0,
    targetX: window.innerWidth * 0.8,
    targetY: window.innerHeight * 0.3,
    phase: 'wandering',   // wandering | approaching | talking | sleeping | leaving
    wingAngle: 0,
    bodyBob: 0,
    glowPulse: 0,
    trailPoints: [],
    lastMoveTime: Date.now(),
    sectionTimer: null,
    currentSection: null,
    hasGreeted: false,
    sleepTimer: null,
    idleTimer: null,
    chatVisible: false,
    mouseX: window.innerWidth / 2,
    mouseY: window.innerHeight / 2,
    blinkTimer: 0,
    isBlinking: false,
    emotion: 'happy',     // happy | shy | sleepy | excited
    dustParticles: [],
    glowBed: null,
    frame: 0
  };

  /* ── CREATE CANVAS ──────────────────────────────────────── */
  const canvas = document.createElement('canvas');
  canvas.id = 'maya-fairy-canvas';
  canvas.style.cssText = `
    position: fixed; top: 0; left: 0;
    width: 100%; height: 100%;
    pointer-events: none;
    z-index: 99998;
  `;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  /* ── CHAT BUBBLE ────────────────────────────────────────── */
  const bubble = document.createElement('div');
  bubble.id = 'maya-bubble';
  bubble.style.cssText = `
    position: fixed;
    background: rgba(255,245,255,0.97);
    border: 1.5px solid rgba(200,160,255,0.5);
    border-radius: 18px 18px 18px 4px;
    padding: 10px 16px;
    font-family: 'Georgia', serif;
    font-size: 13px;
    color: #6a3d8f;
    max-width: 220px;
    line-height: 1.5;
    box-shadow: 0 4px 20px rgba(160,100,255,0.25), 0 0 30px rgba(200,160,255,0.15);
    z-index: 99999;
    pointer-events: none;
    opacity: 0;
    transform: scale(0.8) translateY(6px);
    transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
    backdrop-filter: blur(8px);
  `;
  document.body.appendChild(bubble);

  function showBubble(text, x, y) {
    bubble.textContent = text;
    const bx = Math.min(x + 20, window.innerWidth - 240);
    const by = Math.max(y - 60, 10);
    bubble.style.left = bx + 'px';
    bubble.style.top  = by + 'px';
    bubble.style.opacity = '1';
    bubble.style.transform = 'scale(1) translateY(0)';
    state.chatVisible = true;
  }

  function hideBubble(delay) {
    setTimeout(() => {
      bubble.style.opacity = '0';
      bubble.style.transform = 'scale(0.8) translateY(6px)';
      state.chatVisible = false;
    }, delay || 0);
  }

  /* ── DUST PARTICLE ──────────────────────────────────────── */
  function spawnDust(x, y, color) {
    for (let i = 0; i < 3; i++) {
      state.dustParticles.push({
        x, y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2 - 1,
        life: 1,
        size: Math.random() * 3 + 1,
        color: color || `hsl(${270 + Math.random() * 60}, 80%, 75%)`
      });
    }
  }

  /* ── DRAW FAIRY ─────────────────────────────────────────── */
  function drawFairy(x, y, t) {
    const bob = Math.sin(t * 0.04) * 4;
    const bobY = y + bob;
    const wing = Math.sin(t * 0.25) * 0.4; // wing flap angle
    const glow = 0.5 + 0.5 * Math.sin(t * 0.03);
    const isSleeping = state.phase === 'sleeping';
    const isExcited  = state.emotion === 'excited';

    ctx.save();

    /* ── outer glow ── */
    const grad = ctx.createRadialGradient(x, bobY, 0, x, bobY, 55);
    grad.addColorStop(0, `rgba(220,170,255,${0.18 * glow})`);
    grad.addColorStop(0.5, `rgba(180,120,255,${0.08 * glow})`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(x, bobY, 55, 55, 0, 0, Math.PI * 2);
    ctx.fill();

    /* ── WINGS ── (fast flap, translucent) */
    ctx.save();
    ctx.translate(x, bobY - 2);

    // upper left wing
    ctx.save();
    ctx.rotate(-0.3 + wing * (isExcited ? 2 : 1));
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-30, -28, -50, -10, -34, 8);
    ctx.bezierCurveTo(-22, 18, -6, 10, 0, 0);
    const wg1 = ctx.createLinearGradient(-40, -20, 0, 10);
    wg1.addColorStop(0, `rgba(220,190,255,${0.55 + 0.15*glow})`);
    wg1.addColorStop(1, `rgba(200,160,255,${0.2})`);
    ctx.fillStyle = wg1;
    ctx.fill();
    ctx.strokeStyle = `rgba(180,140,255,0.3)`;
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.restore();

    // upper right wing
    ctx.save();
    ctx.rotate(0.3 - wing * (isExcited ? 2 : 1));
    ctx.scale(-1, 1);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-30, -28, -50, -10, -34, 8);
    ctx.bezierCurveTo(-22, 18, -6, 10, 0, 0);
    const wg2 = ctx.createLinearGradient(-40, -20, 0, 10);
    wg2.addColorStop(0, `rgba(220,190,255,${0.55 + 0.15*glow})`);
    wg2.addColorStop(1, `rgba(200,160,255,${0.2})`);
    ctx.fillStyle = wg2;
    ctx.fill();
    ctx.strokeStyle = `rgba(180,140,255,0.3)`;
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.restore();

    // lower left wing (smaller)
    ctx.save();
    ctx.rotate(-0.1 + wing * 0.6);
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.bezierCurveTo(-18, 4, -28, 20, -16, 24);
    ctx.bezierCurveTo(-8, 26, -2, 18, 0, 2);
    ctx.fillStyle = `rgba(210,175,255,${0.35 + 0.1*glow})`;
    ctx.fill();
    ctx.restore();

    // lower right wing
    ctx.save();
    ctx.rotate(0.1 - wing * 0.6);
    ctx.scale(-1, 1);
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.bezierCurveTo(-18, 4, -28, 20, -16, 24);
    ctx.bezierCurveTo(-8, 26, -2, 18, 0, 2);
    ctx.fillStyle = `rgba(210,175,255,${0.35 + 0.1*glow})`;
    ctx.fill();
    ctx.restore();

    ctx.restore();

    /* ── BODY ── */
    ctx.save();
    ctx.translate(x, bobY);

    // dress / body (small, slender)
    const bodyGrad = ctx.createLinearGradient(0, -14, 0, 18);
    bodyGrad.addColorStop(0, '#e8c6ff');
    bodyGrad.addColorStop(0.5, '#d4a0ff');
    bodyGrad.addColorStop(1, '#b87cff');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, 4, 6, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // dress skirt flare
    ctx.beginPath();
    ctx.moveTo(-6, 8);
    ctx.bezierCurveTo(-10, 14, -8, 20, 0, 20);
    ctx.bezierCurveTo(8, 20, 10, 14, 6, 8);
    ctx.closePath();
    ctx.fillStyle = `rgba(200, 150, 255, 0.8)`;
    ctx.fill();

    // tiny sparkle on dress
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.arc(1, 2, 1.2, 0, Math.PI * 2);
    ctx.fill();

    /* ── HEAD ── */
    ctx.fillStyle = '#fce4d8';
    ctx.beginPath();
    ctx.ellipse(0, -16, 7, 7.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // tiny rosy cheeks
    ctx.fillStyle = 'rgba(255,170,170,0.45)';
    ctx.beginPath(); ctx.ellipse(-4, -13, 2.5, 1.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse( 4, -13, 2.5, 1.5, 0, 0, Math.PI * 2); ctx.fill();

    // EYES
    if (!isSleeping) {
      if (state.isBlinking) {
        // blink – draw a tiny line
        ctx.strokeStyle = '#5a2d82'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(-3.5, -16.5); ctx.lineTo(-1.5, -16.5); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(1.5, -16.5);  ctx.lineTo(3.5, -16.5);  ctx.stroke();
      } else {
        ctx.fillStyle = '#5a2d82';
        ctx.beginPath(); ctx.ellipse(-2.5, -17, 1.8, 2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse( 2.5, -17, 1.8, 2, 0, 0, Math.PI * 2); ctx.fill();
        // eye shine
        ctx.fillStyle = 'white';
        ctx.beginPath(); ctx.arc(-3.2, -18, 0.7, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc( 1.8, -18, 0.7, 0, Math.PI * 2); ctx.fill();
      }
    } else {
      // sleeping eyes – curved lines
      ctx.strokeStyle = '#a07abd'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(-2.5, -16, 2, Math.PI, 0); ctx.stroke();
      ctx.beginPath(); ctx.arc( 2.5, -16, 2, Math.PI, 0); ctx.stroke();
    }

    // tiny smile
    ctx.strokeStyle = '#c47ab8'; ctx.lineWidth = 1;
    ctx.beginPath();
    if (isSleeping) {
      ctx.arc(0, -12, 2, 0.2, Math.PI - 0.2);
    } else if (isExcited) {
      ctx.arc(0, -13, 2.5, 0.1, Math.PI - 0.1);
    } else {
      ctx.arc(0, -13, 2, 0.2, Math.PI - 0.2);
    }
    ctx.stroke();

    /* ── HAIR ── */
    ctx.fillStyle = '#c97bff';
    // left
    ctx.beginPath();
    ctx.ellipse(-5, -20, 4, 5, -0.5, 0, Math.PI * 2);
    ctx.fill();
    // right
    ctx.beginPath();
    ctx.ellipse( 5, -20, 4, 5, 0.5, 0, Math.PI * 2);
    ctx.fill();
    // top bun / wisp
    ctx.beginPath();
    ctx.ellipse(0, -23, 3.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    /* ── TINY WAND ── */
    if (!isSleeping) {
      ctx.save();
      ctx.rotate(0.3 + Math.sin(t * 0.05) * 0.1);
      ctx.strokeStyle = '#e0b0ff'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(6, -10); ctx.lineTo(18, -22); ctx.stroke();
      // star on wand tip
      const sx = 18, sy = -22, sr = 3;
      ctx.fillStyle = `rgba(255, 240, 100, ${0.7 + 0.3 * glow})`;
      for (let i = 0; i < 5; i++) {
        const a1 = (i * 4 * Math.PI / 5) - Math.PI / 2;
        const a2 = (i * 4 * Math.PI / 5 + 2 * Math.PI / 5) - Math.PI / 2;
        if (i === 0) ctx.beginPath();
        ctx.lineTo(sx + sr * Math.cos(a1), sy + sr * Math.sin(a1));
        ctx.lineTo(sx + sr * 0.4 * Math.cos(a2), sy + sr * 0.4 * Math.sin(a2));
      }
      ctx.closePath(); ctx.fill();
      // wand glow
      const wg = ctx.createRadialGradient(sx, sy, 0, sx, sy, 8);
      wg.addColorStop(0, `rgba(255,240,100,${0.4 * glow})`);
      wg.addColorStop(1, 'transparent');
      ctx.fillStyle = wg;
      ctx.beginPath(); ctx.arc(sx, sy, 8, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    ctx.restore(); // end body group

    /* ── SLEEPING GLOW BED ── */
    if (isSleeping) {
      const bg = ctx.createRadialGradient(x, bobY + 15, 0, x, bobY + 15, 40);
      bg.addColorStop(0, `rgba(200,150,255,${0.15 * glow})`);
      bg.addColorStop(0.6, `rgba(220,170,255,${0.06 * glow})`);
      bg.addColorStop(1, 'transparent');
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.ellipse(x, bobY + 15, 40, 18, 0, 0, Math.PI * 2); ctx.fill();
      // Z's
      const za = 0.5 + 0.5 * Math.sin(t * 0.06);
      ctx.fillStyle = `rgba(180,130,255,${0.6 * za})`;
      ctx.font = `bold ${10 + za * 3}px Georgia`;
      ctx.fillText('z', x + 18, bobY - 28 - za * 6);
      ctx.font = `bold ${7 + za * 2}px Georgia`;
      ctx.fillText('z', x + 26, bobY - 36 - za * 4);
    }
  }

  /* ── DRAW TRAIL ─────────────────────────────────────────── */
  function drawTrail() {
    if (state.trailPoints.length < 2) return;
    for (let i = 1; i < state.trailPoints.length; i++) {
      const p = state.trailPoints[i];
      const alpha = (p.life / 1) * 0.4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(210, 170, 255, ${alpha})`;
      ctx.fill();
    }
  }

  /* ── DRAW DUST ──────────────────────────────────────────── */
  function drawDust() {
    state.dustParticles.forEach(d => {
      ctx.globalAlpha = d.life * 0.8;
      ctx.fillStyle = d.color;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.size * d.life, 0, Math.PI * 2);
      ctx.fill();
      // small cross sparkle
      ctx.strokeStyle = d.color;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(d.x - d.size * 1.5, d.y);
      ctx.lineTo(d.x + d.size * 1.5, d.y);
      ctx.moveTo(d.x, d.y - d.size * 1.5);
      ctx.lineTo(d.x, d.y + d.size * 1.5);
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
  }

  /* ── SECTION DETECTION ──────────────────────────────────── */
  function detectSection() {
    const midY = window.innerHeight / 2;
    const els = document.querySelectorAll('section, [data-section], [class*="section"], [id*="about"], [id*="services"], [id*="contact"], [id*="portfolio"], [id*="hero"], .hero, .about, .services, .portfolio, .contact');
    let found = null;
    let foundKey = 'default';

    els.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top <= midY && r.bottom >= midY) {
        found = el;
        const id = (el.id + ' ' + el.className).toLowerCase();
        if (id.includes('hero') || id.includes('banner') || id.includes('intro')) foundKey = 'hero';
        else if (id.includes('about')) foundKey = 'about';
        else if (id.includes('service')) foundKey = 'services';
        else if (id.includes('portfolio') || id.includes('work') || id.includes('project')) foundKey = 'portfolio';
        else if (id.includes('contact')) foundKey = 'contact';
        else foundKey = 'default';
      }
    });

    return { el: found, key: foundKey };
  }

  /* ── PICK RANDOM MESSAGE ────────────────────────────────── */
  function pickMsg(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /* ── MOVE TOWARD TARGET (soft, organic) ────────────────── */
  function moveToTarget() {
    const dx = state.targetX - state.x;
    const dy = state.targetY - state.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 2) return;

    const speed = state.phase === 'approaching' ? 0.04 : 0.018;
    state.vx += dx * speed;
    state.vy += dy * speed;

    // damping
    const damping = 0.82;
    state.vx *= damping;
    state.vy *= damping;

    // clamp max speed
    const maxSpeed = state.phase === 'approaching' ? 7 : 3;
    const sv = Math.sqrt(state.vx * state.vx + state.vy * state.vy);
    if (sv > maxSpeed) { state.vx = state.vx / sv * maxSpeed; state.vy = state.vy / sv * maxSpeed; }

    state.x += state.vx;
    state.y += state.vy;

    // keep on screen
    state.x = Math.max(30, Math.min(canvas.width - 30, state.x));
    state.y = Math.max(40, Math.min(canvas.height - 40, state.y));
  }

  /* ── WANDER LOGIC ──────────────────────────────────────── */
  let wanderChangeTimer = 0;
  function doWander() {
    wanderChangeTimer--;
    if (wanderChangeTimer <= 0) {
      const margin = 80;
      state.targetX = margin + Math.random() * (canvas.width - margin * 2);
      state.targetY = margin + Math.random() * (canvas.height - margin * 2);
      wanderChangeTimer = 180 + Math.random() * 240; // 3–7 sec at 60fps
    }
    moveToTarget();
  }

  /* ── SECTION TIMER & APPROACH ───────────────────────────── */
  let sectionStayTimer = null;
  let lastSection = null;

  function checkSectionDwell() {
    const { el, key } = detectSection();
    const label = el ? el.id || el.className.split(' ')[0] : 'none';

    if (label !== lastSection) {
      lastSection = label;
      clearTimeout(sectionStayTimer);
      sectionStayTimer = setTimeout(() => {
        if (state.phase === 'sleeping') {
          state.phase = 'wandering';
          state.emotion = 'happy';
        }
        startApproach(key, el);
      }, 3000);
    }
  }

  function startApproach(sectionKey, el) {
    if (state.phase === 'talking') return;
    state.phase = 'approaching';
    state.emotion = 'excited';

    // Target = center of screen, close to that section
    let tx = canvas.width * 0.5 + (Math.random() - 0.5) * 100;
    let ty = canvas.height * 0.45;

    if (el) {
      const r = el.getBoundingClientRect();
      ty = Math.max(60, Math.min(canvas.height - 60, r.top + r.height * 0.3));
      tx = Math.random() > 0.5 ? canvas.width * 0.8 : canvas.width * 0.2;
    }

    state.targetX = tx;
    state.targetY = ty;

    // After arriving (~2s), talk
    setTimeout(() => {
      if (state.phase !== 'approaching') return;
      state.phase = 'talking';
      state.emotion = 'happy';
      const msgs = SECTION_MESSAGES[sectionKey] || SECTION_MESSAGES.default;
      const msg  = pickMsg(msgs);
      showBubble(msg, state.x, state.y);
      spawnDust(state.x, state.y, '#e0b0ff');
      // hide bubble and leave after 4.5s
      hideBubble(4500);
      setTimeout(() => {
        state.phase = 'leaving';
        state.emotion = 'happy';
        // fly to edge/corner
        const corners = [
          [canvas.width - 60, 60],
          [60, 60],
          [canvas.width - 60, canvas.height - 60],
          [60, canvas.height - 60]
        ];
        const [cx, cy] = corners[Math.floor(Math.random() * corners.length)];
        state.targetX = cx;
        state.targetY = cy;
        setTimeout(() => {
          state.phase = 'wandering';
          scheduleSleep();
        }, 3000);
      }, 5000);
    }, 2200);
  }

  /* ── SLEEP ──────────────────────────────────────────────── */
  function scheduleSleep() {
    clearTimeout(state.sleepTimer);
    state.sleepTimer = setTimeout(() => {
      if (state.phase === 'wandering') {
        state.phase = 'sleeping';
        state.emotion = 'sleepy';
        state.targetX = state.x;
        state.targetY = state.y;
      }
    }, 20000 + Math.random() * 15000); // sleep after 20–35s idle
  }
  scheduleSleep();

  /* ── IDLE THOUGHT BUBBLE ────────────────────────────────── */
  function scheduleIdleThought() {
    clearTimeout(state.idleTimer);
    state.idleTimer = setTimeout(() => {
      if (state.phase === 'wandering' && !state.chatVisible) {
        showBubble(pickMsg(IDLE_THOUGHTS), state.x, state.y);
        hideBubble(2500);
      }
      scheduleIdleThought();
    }, 15000 + Math.random() * 20000);
  }
  scheduleIdleThought();

  /* ── BLINK ──────────────────────────────────────────────── */
  function scheduleBlink() {
    const delay = 3000 + Math.random() * 5000;
    setTimeout(() => {
      if (state.phase !== 'sleeping') {
        state.isBlinking = true;
        setTimeout(() => { state.isBlinking = false; }, 120);
      }
      scheduleBlink();
    }, delay);
  }
  scheduleBlink();

  /* ── SCROLL SECTION CHECK ───────────────────────────────── */
  window.addEventListener('scroll', checkSectionDwell, { passive: true });
  setInterval(checkSectionDwell, 1000);

  /* ── MOUSE (she is NOT cursor-tracking, just section-aware) */
  document.addEventListener('mousemove', e => {
    state.mouseX = e.clientX;
    state.mouseY = e.clientY;
  }, { passive: true });

  /* ── MAIN LOOP ──────────────────────────────────────────── */
  let t = 0;
  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    t++;
    state.frame = t;

    /* update trail */
    if (state.phase !== 'sleeping') {
      const speed = Math.sqrt(state.vx * state.vx + state.vy * state.vy);
      if (speed > 0.5) {
        state.trailPoints.push({ x: state.x, y: state.y, life: 1, size: 4 + speed * 0.5 });
        if (Math.random() > 0.5) spawnDust(state.x + (Math.random()-0.5)*8, state.y + (Math.random()-0.5)*8);
      }
    }

    // age trail
    state.trailPoints = state.trailPoints
      .map(p => ({ ...p, life: p.life - 0.03 }))
      .filter(p => p.life > 0);

    // age dust
    state.dustParticles = state.dustParticles
      .map(d => ({ ...d, x: d.x + d.vx, y: d.y + d.vy, vy: d.vy - 0.05, life: d.life - 0.025 }))
      .filter(d => d.life > 0);

    /* movement */
    if (state.phase === 'wandering') doWander();
    else if (state.phase === 'approaching') moveToTarget();
    else if (state.phase === 'leaving') moveToTarget();
    else if (state.phase === 'sleeping') {
      // gentle float in place
      state.targetX = state.x + Math.sin(t * 0.01) * 0.3;
      state.targetY = state.y + Math.cos(t * 0.007) * 0.3;
    } else if (state.phase === 'talking') {
      // hover gently
      state.x += Math.sin(t * 0.03) * 0.3;
      state.y += Math.cos(t * 0.025) * 0.2;
    }

    /* update bubble position if visible */
    if (state.chatVisible) {
      const bx = Math.min(state.x + 22, window.innerWidth - 240);
      const by = Math.max(state.y - 65, 10);
      bubble.style.left = bx + 'px';
      bubble.style.top  = by + 'px';
    }

    /* draw */
    drawTrail();
    drawDust();
    drawFairy(state.x, state.y, t);

    requestAnimationFrame(loop);
  }

  loop();

  /* ── WAKE ON SCROLL / INTERACTION ──────────────────────── */
  function wakeUp() {
    if (state.phase === 'sleeping') {
      state.phase = 'wandering';
      state.emotion = 'happy';
      clearTimeout(state.sleepTimer);
      scheduleSleep();
    }
  }
  window.addEventListener('scroll', wakeUp, { passive: true });
  document.addEventListener('click', wakeUp);

  /* ── INITIAL GREETING (after 3s) ───────────────────────── */
  setTimeout(() => {
    if (!state.hasGreeted) {
      state.hasGreeted = true;
      showBubble("Psst! I'm Maya~ I'll visit when you linger somewhere ✨", state.x, state.y);
      hideBubble(4000);
    }
  }, 3000);

})();
