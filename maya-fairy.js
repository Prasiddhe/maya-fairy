/* ============================================================
   MAYA – THE MYSTICAL SITE FAIRY  v3.0
   ============================================================
   Drop this file into your GitHub repo (Prasiddhe/maya-fairy)
   then load via Wix Custom Code:
   <script src="https://cdn.jsdelivr.net/gh/Prasiddhe/maya-fairy@main/maya-fairy.js"></script>

   Place in: Body – All Pages

   v3 changes:
   • Slimmer, more delicate fairy body
   • Approaches to greet after 3s page dwell (no scroll needed)
   • Click on fairy → full-screen magical ripple burst
   • No cursor-fleeing behaviour
   ============================================================ */

(function () {
  'use strict';

  /* ── SECTION MESSAGES ──────────────────────────────────── */
  const SECTION_MESSAGES = {
    hero:      ["Psst… welcome ✨ I've been waiting~", "Oh! A visitor! Hello hello hello~", "You found me! I'm Maya… your little guide 🌟"],
    about:     ["So you want to know more? Hehe~ curious one!", "This is my favourite part… the story ✨", "I love this section~ it has such warm energy 🌸"],
    services:  ["Ooh, looking at what we do? Good choice~", "These are some of my favourite things! ✨", "Pick something… I'll cheer you on! 🌟"],
    portfolio: ["Pretty things! I helped make some of these~", "Wooow so much creativity here! 🌸", "I get so proud when people look at this part ✨"],
    contact:   ["Oh! Are you going to say hello? Please do~", "Don't be shy! I'm not… well, sometimes I am 🙈", "Go on, send a message! I'll deliver it myself~ ✉️✨"],
    default:   ["Hmm, interesting spot you picked~", "I like it here… it's cozy 🌸", "You're exploring! That makes me happy ✨", "Shhh… I'm resting but I saw you 👀~"]
  };

  const IDLE_THOUGHTS = [
    "zZz… 💤", "*yawns* so peaceful~", "la la la~ ♪", "*stretches wings*",
    "I wonder what's beyond this page…", "✨ sparkle sparkle ✨", "*hums softly*"
  ];

  /* ── STATE ──────────────────────────────────────────────── */
  const state = {
    x: window.innerWidth * 0.82,
    y: window.innerHeight * 0.25,
    vx: 0, vy: 0,
    targetX: window.innerWidth * 0.82,
    targetY: window.innerHeight * 0.25,
    phase: 'wandering',
    trailPoints: [],
    lastSection: null,
    sectionStayTimer: null,
    hasGreeted: false,
    sleepTimer: null,
    idleTimer: null,
    chatVisible: false,
    isBlinking: false,
    emotion: 'happy',
    dustParticles: [],
    ripples: [],
    frame: 0
  };

  /* ── CREATE CANVAS ──────────────────────────────────────── */
  const canvas = document.createElement('canvas');
  canvas.id = 'maya-fairy-canvas';
  canvas.style.cssText = `
    position:fixed;top:0;left:0;
    width:100%;height:100%;
    pointer-events:none;
    z-index:99998;
  `;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  /* ── HIT TEST CANVAS ELEMENT ──────────────────────────── */
  // We need a tiny transparent click-capturing element over the fairy
  const hitEl = document.createElement('div');
  hitEl.style.cssText = `
    position:fixed;width:70px;height:70px;
    border-radius:50%;cursor:pointer;
    z-index:99999;pointer-events:auto;
    transform:translate(-50%,-50%);
    background:transparent;
  `;
  document.body.appendChild(hitEl);

  /* ── CHAT BUBBLE ────────────────────────────────────────── */
  const bubble = document.createElement('div');
  bubble.style.cssText = `
    position:fixed;
    background:rgba(255,245,255,0.97);
    border:1.5px solid rgba(200,160,255,0.5);
    border-radius:18px 18px 18px 4px;
    padding:10px 16px;
    font-family:'Georgia',serif;
    font-size:13px;color:#6a3d8f;
    max-width:220px;line-height:1.6;
    box-shadow:0 4px 20px rgba(160,100,255,0.25),0 0 30px rgba(200,160,255,0.15);
    z-index:99999;pointer-events:none;
    opacity:0;
    transform:scale(0.8) translateY(6px);
    transition:opacity 0.4s ease,transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
    backdrop-filter:blur(8px);
  `;
  document.body.appendChild(bubble);

  function showBubble(text, x, y) {
    bubble.textContent = text;
    const bx = Math.min(x + 22, window.innerWidth - 240);
    const by = Math.max(y - 65, 10);
    bubble.style.left  = bx + 'px';
    bubble.style.top   = by + 'px';
    bubble.style.opacity   = '1';
    bubble.style.transform = 'scale(1) translateY(0)';
    state.chatVisible = true;
  }
  function hideBubble(delay) {
    setTimeout(() => {
      bubble.style.opacity   = '0';
      bubble.style.transform = 'scale(0.8) translateY(6px)';
      state.chatVisible = false;
    }, delay || 0);
  }

  /* ── DUST PARTICLES ─────────────────────────────────────── */
  function spawnDust(x, y, color, count) {
    const n = count || 4;
    for (let i = 0; i < n; i++) {
      state.dustParticles.push({
        x, y,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3 - 1,
        life: 1,
        size: Math.random() * 3 + 1,
        color: color || `hsl(${270 + Math.random() * 60},80%,75%)`
      });
    }
  }

  /* ── MAGIC RIPPLE (on click) ────────────────────────────── */
  function triggerMagicRipple(cx, cy) {
    // Multiple expanding rings + star bursts
    const colors = ['rgba(220,170,255,', 'rgba(255,200,240,', 'rgba(180,130,255,', 'rgba(255,230,255,'];
    for (let i = 0; i < 5; i++) {
      state.ripples.push({
        x: cx, y: cy,
        r: 0,
        maxR: Math.max(canvas.width, canvas.height) * (0.5 + i * 0.12),
        speed: 12 + i * 5,
        life: 1,
        color: colors[i % colors.length],
        delay: i * 80
      });
    }
    // Burst of sparkle dust from fairy
    for (let i = 0; i < 40; i++) {
      const angle = (Math.PI * 2 * i) / 40;
      const speed = 3 + Math.random() * 5;
      state.dustParticles.push({
        x: state.x, y: state.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        size: Math.random() * 4 + 2,
        color: `hsl(${270 + Math.random() * 80},90%,75%)`
      });
    }
    // Show a cute reaction
    state.emotion = 'excited';
    showBubble('Eee~! You found me! ✨💜', state.x, state.y);
    hideBubble(2500);
  }

  function drawRipples() {
    const now = Date.now();
    state.ripples = state.ripples.filter(rip => rip.life > 0);
    state.ripples.forEach(rip => {
      if (rip.delay > 0) { rip.delay -= 16; return; }
      rip.r += rip.speed;
      rip.life = 1 - rip.r / rip.maxR;
      if (rip.life < 0) { rip.life = 0; return; }

      // Outer ring
      ctx.save();
      ctx.globalAlpha = rip.life * 0.35;
      ctx.strokeStyle = rip.color + '1)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
      ctx.stroke();

      // Soft fill glow near centre
      if (rip.r < rip.maxR * 0.35) {
        const grad = ctx.createRadialGradient(rip.x, rip.y, 0, rip.x, rip.y, rip.r);
        grad.addColorStop(0, rip.color + (rip.life * 0.12) + ')');
        grad.addColorStop(1, rip.color + '0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Scattered stars along the ring edge
      const numStars = 8;
      for (let i = 0; i < numStars; i++) {
        const a = (Math.PI * 2 * i) / numStars + rip.r * 0.01;
        const sx = rip.x + Math.cos(a) * rip.r;
        const sy = rip.y + Math.sin(a) * rip.r;
        drawStar(ctx, sx, sy, 3, rip.life * 0.7, '#f5d0ff');
      }
      ctx.restore();
    });
  }

  function drawStar(ctx, x, y, r, alpha, color) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a1 = (i * 4 * Math.PI / 5) - Math.PI / 2;
      const a2 = (i * 4 * Math.PI / 5 + 2 * Math.PI / 5) - Math.PI / 2;
      i === 0 ? ctx.moveTo(x + r * Math.cos(a1), y + r * Math.sin(a1))
              : ctx.lineTo(x + r * Math.cos(a1), y + r * Math.sin(a1));
      ctx.lineTo(x + r * 0.4 * Math.cos(a2), y + r * 0.4 * Math.sin(a2));
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /* ── DRAW FAIRY (slim & delicate) ──────────────────────── */
  function drawFairy(x, y, t) {
    const bob    = Math.sin(t * 0.04) * 3.5;
    const bobY   = y + bob;
    const wing   = Math.sin(t * 0.28) * 0.45;
    const glow   = 0.5 + 0.5 * Math.sin(t * 0.03);
    const isSleeping = state.phase === 'sleeping';
    const isExcited  = state.emotion === 'excited';

    ctx.save();

    /* outer aura */
    const aura = ctx.createRadialGradient(x, bobY, 0, x, bobY, 52);
    aura.addColorStop(0, `rgba(220,170,255,${0.16 * glow})`);
    aura.addColorStop(0.5, `rgba(180,120,255,${0.07 * glow})`);
    aura.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.ellipse(x, bobY, 52, 52, 0, 0, Math.PI * 2);
    ctx.fill();

    /* ── WINGS ── */
    ctx.save();
    ctx.translate(x, bobY - 4);

    const flapMult = isExcited ? 2.2 : 1;

    // upper-left
    ctx.save();
    ctx.rotate(-0.25 + wing * flapMult);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-26, -30, -48, -8, -32, 10);
    ctx.bezierCurveTo(-20, 20, -5, 10, 0, 0);
    const wg1 = ctx.createLinearGradient(-42, -18, 0, 10);
    wg1.addColorStop(0, `rgba(230,200,255,${0.6 + 0.15*glow})`);
    wg1.addColorStop(1, `rgba(200,160,255,0.18)`);
    ctx.fillStyle = wg1;
    ctx.fill();
    ctx.strokeStyle = 'rgba(190,150,255,0.28)';
    ctx.lineWidth = 0.6;
    ctx.stroke();
    ctx.restore();

    // upper-right (mirror)
    ctx.save();
    ctx.rotate(0.25 - wing * flapMult);
    ctx.scale(-1, 1);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-26, -30, -48, -8, -32, 10);
    ctx.bezierCurveTo(-20, 20, -5, 10, 0, 0);
    const wg2 = ctx.createLinearGradient(-42, -18, 0, 10);
    wg2.addColorStop(0, `rgba(230,200,255,${0.6 + 0.15*glow})`);
    wg2.addColorStop(1, `rgba(200,160,255,0.18)`);
    ctx.fillStyle = wg2;
    ctx.fill();
    ctx.strokeStyle = 'rgba(190,150,255,0.28)';
    ctx.lineWidth = 0.6;
    ctx.stroke();
    ctx.restore();

    // lower-left (small)
    ctx.save();
    ctx.rotate(-0.08 + wing * 0.5);
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.bezierCurveTo(-14, 2, -24, 18, -13, 24);
    ctx.bezierCurveTo(-5, 27, -1, 16, 0, 2);
    ctx.fillStyle = `rgba(215,180,255,${0.32 + 0.08*glow})`;
    ctx.fill();
    ctx.restore();

    // lower-right
    ctx.save();
    ctx.rotate(0.08 - wing * 0.5);
    ctx.scale(-1, 1);
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.bezierCurveTo(-14, 2, -24, 18, -13, 24);
    ctx.bezierCurveTo(-5, 27, -1, 16, 0, 2);
    ctx.fillStyle = `rgba(215,180,255,${0.32 + 0.08*glow})`;
    ctx.fill();
    ctx.restore();

    ctx.restore(); // end wings

    /* ── BODY (slim) ── */
    ctx.save();
    ctx.translate(x, bobY);

    // torso — slender oval
    const bodyGrad = ctx.createLinearGradient(0, -12, 0, 14);
    bodyGrad.addColorStop(0, '#efd0ff');
    bodyGrad.addColorStop(0.5, '#d8a8ff');
    bodyGrad.addColorStop(1, '#c080ff');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, 2, 4.5, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // waist cinch
    ctx.fillStyle = 'rgba(180,100,255,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 3, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // skirt flare — wider at bottom, slim at waist
    ctx.beginPath();
    ctx.moveTo(-4.5, 7);
    ctx.bezierCurveTo(-10, 13, -9, 20, 0, 21);
    ctx.bezierCurveTo(9, 20, 10, 13, 4.5, 7);
    ctx.closePath();
    ctx.fillStyle = `rgba(200,145,255,0.82)`;
    ctx.fill();
    // skirt highlight
    ctx.fillStyle = 'rgba(240,210,255,0.35)';
    ctx.beginPath();
    ctx.ellipse(-1.5, 13, 2, 4, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // dress sparkle
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.beginPath(); ctx.arc(0.5, 1, 1, 0, Math.PI * 2); ctx.fill();

    /* ── TINY ARMS ── */
    ctx.strokeStyle = '#f0c8ff';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    // left arm
    ctx.beginPath();
    ctx.moveTo(-4, 0);
    ctx.bezierCurveTo(-9, -2, -11, 3, -10, 7);
    ctx.stroke();
    // right arm
    ctx.beginPath();
    ctx.moveTo(4, 0);
    ctx.bezierCurveTo(9, -2, 11, 3, 10, 7);
    ctx.stroke();

    /* ── HEAD ── */
    ctx.fillStyle = '#fce8de';
    ctx.beginPath();
    ctx.ellipse(0, -15, 6.5, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // cheeks
    ctx.fillStyle = 'rgba(255,165,165,0.42)';
    ctx.beginPath(); ctx.ellipse(-3.8, -12.5, 2.3, 1.4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse( 3.8, -12.5, 2.3, 1.4, 0, 0, Math.PI * 2); ctx.fill();

    // EYES
    if (!isSleeping) {
      if (state.isBlinking) {
        ctx.strokeStyle = '#5a2d82'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(-3.2, -15.5); ctx.lineTo(-1.4, -15.5); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(1.4, -15.5);  ctx.lineTo(3.2, -15.5);  ctx.stroke();
      } else {
        ctx.fillStyle = '#5a2d82';
        ctx.beginPath(); ctx.ellipse(-2.2, -16, 1.7, 1.9, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse( 2.2, -16, 1.7, 1.9, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'white';
        ctx.beginPath(); ctx.arc(-2.9, -17, 0.65, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc( 1.5, -17, 0.65, 0, Math.PI * 2); ctx.fill();
      }
    } else {
      ctx.strokeStyle = '#b090d0'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(-2.2, -15.5, 1.8, Math.PI, 0); ctx.stroke();
      ctx.beginPath(); ctx.arc( 2.2, -15.5, 1.8, Math.PI, 0); ctx.stroke();
    }

    // smile
    ctx.strokeStyle = '#c47ab8'; ctx.lineWidth = 1;
    ctx.beginPath();
    if (isSleeping) {
      ctx.arc(0, -11.5, 1.8, 0.2, Math.PI - 0.2);
    } else if (isExcited) {
      ctx.arc(0, -11.5, 2.4, 0.1, Math.PI - 0.1);
    } else {
      ctx.arc(0, -11.5, 2, 0.2, Math.PI - 0.2);
    }
    ctx.stroke();

    /* ── HAIR ── */
    ctx.fillStyle = '#c070ff';
    ctx.beginPath(); ctx.ellipse(-4.8, -19, 3.8, 5, -0.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse( 4.8, -19, 3.8, 5, 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, -22, 3.2, 4.2, 0, 0, Math.PI * 2); ctx.fill();
    // hair wisp
    ctx.strokeStyle = '#d090ff'; ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-5, -22);
    ctx.bezierCurveTo(-8, -27, -4, -30, -2, -27);
    ctx.stroke();

    /* ── WAND ── */
    if (!isSleeping) {
      ctx.save();
      ctx.rotate(0.28 + Math.sin(t * 0.05) * 0.12);
      ctx.strokeStyle = '#e0b8ff'; ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.moveTo(5, -9); ctx.lineTo(16, -21); ctx.stroke();
      // star tip
      const sx = 16, sy = -21, sr = 3;
      ctx.fillStyle = `rgba(255,242,120,${0.72 + 0.28 * glow})`;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a1 = (i * 4 * Math.PI / 5) - Math.PI / 2;
        const a2 = (i * 4 * Math.PI / 5 + 2 * Math.PI / 5) - Math.PI / 2;
        i === 0 ? ctx.moveTo(sx + sr * Math.cos(a1), sy + sr * Math.sin(a1))
                : ctx.lineTo(sx + sr * Math.cos(a1), sy + sr * Math.sin(a1));
        ctx.lineTo(sx + sr * 0.4 * Math.cos(a2), sy + sr * 0.4 * Math.sin(a2));
      }
      ctx.closePath(); ctx.fill();
      const wg = ctx.createRadialGradient(sx, sy, 0, sx, sy, 8);
      wg.addColorStop(0, `rgba(255,242,120,${0.35 * glow})`);
      wg.addColorStop(1, 'transparent');
      ctx.fillStyle = wg;
      ctx.beginPath(); ctx.arc(sx, sy, 8, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    ctx.restore(); // end body

    /* ── SLEEP CLOUD ── */
    if (isSleeping) {
      const bg = ctx.createRadialGradient(x, bobY + 14, 0, x, bobY + 14, 38);
      bg.addColorStop(0, `rgba(200,150,255,${0.13 * glow})`);
      bg.addColorStop(1, 'transparent');
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.ellipse(x, bobY + 14, 38, 16, 0, 0, Math.PI * 2); ctx.fill();

      const za = 0.5 + 0.5 * Math.sin(t * 0.06);
      ctx.fillStyle = `rgba(180,130,255,${0.65 * za})`;
      ctx.font = `bold ${10 + za * 3}px Georgia`;
      ctx.fillText('z', x + 16, bobY - 26 - za * 5);
      ctx.font = `bold ${7 + za * 2}px Georgia`;
      ctx.fillText('z', x + 24, bobY - 34 - za * 3);
    }
  }

  /* ── DRAW TRAIL ─────────────────────────────────────────── */
  function drawTrail() {
    state.trailPoints.forEach(p => {
      ctx.globalAlpha = p.life * 0.38;
      ctx.fillStyle = 'rgba(210,170,255,1)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  /* ── DRAW DUST ──────────────────────────────────────────── */
  function drawDust() {
    state.dustParticles.forEach(d => {
      ctx.globalAlpha = d.life * 0.82;
      ctx.fillStyle = d.color;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.size * d.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = d.color;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(d.x - d.size * 1.4, d.y);
      ctx.lineTo(d.x + d.size * 1.4, d.y);
      ctx.moveTo(d.x, d.y - d.size * 1.4);
      ctx.lineTo(d.x, d.y + d.size * 1.4);
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
  }

  /* ── SECTION DETECTION ──────────────────────────────────── */
  function detectSection() {
    const midY = window.innerHeight / 2;
    const els  = document.querySelectorAll([
      'section','[data-section]','[class*="section"]',
      '[id*="about"]','[id*="services"]','[id*="contact"]',
      '[id*="portfolio"]','[id*="hero"]',
      '.hero','.about','.services','.portfolio','.contact'
    ].join(','));

    let foundKey = 'default';
    els.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top <= midY && r.bottom >= midY) {
        const id = (el.id + ' ' + el.className).toLowerCase();
        if      (id.includes('hero') || id.includes('banner') || id.includes('intro')) foundKey = 'hero';
        else if (id.includes('about'))     foundKey = 'about';
        else if (id.includes('service'))   foundKey = 'services';
        else if (id.includes('portfolio') || id.includes('work') || id.includes('project')) foundKey = 'portfolio';
        else if (id.includes('contact'))   foundKey = 'contact';
        else foundKey = 'default';
      }
    });
    return foundKey;
  }

  function pickMsg(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  /* ── MOVEMENT ───────────────────────────────────────────── */
  function moveToTarget() {
    const dx   = state.targetX - state.x;
    const dy   = state.targetY - state.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 2) return;

    const speed  = state.phase === 'approaching' ? 0.045 : 0.02;
    state.vx += dx * speed;
    state.vy += dy * speed;
    state.vx *= 0.80;
    state.vy *= 0.80;

    const maxSpeed = state.phase === 'approaching' ? 7 : 3;
    const sv = Math.sqrt(state.vx * state.vx + state.vy * state.vy);
    if (sv > maxSpeed) { state.vx = state.vx / sv * maxSpeed; state.vy = state.vy / sv * maxSpeed; }

    state.x += state.vx;
    state.y += state.vy;
    state.x = Math.max(35, Math.min(canvas.width - 35, state.x));
    state.y = Math.max(50, Math.min(canvas.height - 50, state.y));
  }

  let wanderTimer = 0;
  function doWander() {
    wanderTimer--;
    if (wanderTimer <= 0) {
      const m = 90;
      state.targetX = m + Math.random() * (canvas.width - m * 2);
      state.targetY = m + Math.random() * (canvas.height - m * 2);
      wanderTimer = 200 + Math.random() * 260;
    }
    moveToTarget();
  }

  /* ── PAGE DWELL APPROACH (fires after 3s on page, not scroll) ─ */
  function startApproach(sectionKey) {
    if (state.phase === 'talking' || state.phase === 'approaching') return;
    state.phase = 'approaching';
    state.emotion = 'excited';

    const tx = canvas.width * 0.5 + (Math.random() - 0.5) * 80;
    const ty = canvas.height * 0.42 + (Math.random() - 0.5) * 60;
    state.targetX = tx;
    state.targetY = ty;

    setTimeout(() => {
      if (state.phase !== 'approaching') return;
      state.phase = 'talking';
      state.emotion = 'happy';
      const msg = pickMsg(SECTION_MESSAGES[sectionKey] || SECTION_MESSAGES.default);
      showBubble(msg, state.x, state.y);
      spawnDust(state.x, state.y, '#e0b0ff', 8);

      hideBubble(4500);
      setTimeout(() => {
        state.phase = 'leaving';
        const corners = [
          [canvas.width - 65, 65], [65, 65],
          [canvas.width - 65, canvas.height - 65], [65, canvas.height - 65]
        ];
        const [cx, cy] = corners[Math.floor(Math.random() * corners.length)];
        state.targetX = cx;
        state.targetY = cy;
        setTimeout(() => {
          state.phase = 'wandering';
          state.emotion = 'happy';
          scheduleSleep();
        }, 3000);
      }, 5200);
    }, 2200);
  }

  /* ── DWELL CHECK ────────────────────────────────────────── */
  // Triggers 3 seconds after page is loaded / user is here
  let dwellFired = false;
  setTimeout(() => {
    if (!dwellFired) {
      dwellFired = true;
      const key = detectSection();
      startApproach(key);
    }
  }, 3000);

  // Also re-trigger after scrolling and staying in a new section for 3s
  let sectionChangeTimer = null;
  let lastSectionKey = null;
  function checkSectionDwell() {
    const key = detectSection();
    if (key !== lastSectionKey) {
      lastSectionKey = key;
      clearTimeout(sectionChangeTimer);
      sectionChangeTimer = setTimeout(() => {
        if (state.phase === 'sleeping') {
          state.phase = 'wandering';
          state.emotion = 'happy';
        }
        if (state.phase === 'wandering') startApproach(key);
      }, 3000);
    }
  }
  window.addEventListener('scroll', checkSectionDwell, { passive: true });
  setInterval(checkSectionDwell, 1200);

  /* ── SLEEP ──────────────────────────────────────────────── */
  function scheduleSleep() {
    clearTimeout(state.sleepTimer);
    state.sleepTimer = setTimeout(() => {
      if (state.phase === 'wandering') {
        state.phase   = 'sleeping';
        state.emotion = 'sleepy';
        state.targetX = state.x;
        state.targetY = state.y;
      }
    }, 22000 + Math.random() * 12000);
  }
  scheduleSleep();

  /* ── IDLE THOUGHTS ──────────────────────────────────────── */
  function scheduleIdleThought() {
    clearTimeout(state.idleTimer);
    state.idleTimer = setTimeout(() => {
      if (state.phase === 'wandering' && !state.chatVisible) {
        showBubble(pickMsg(IDLE_THOUGHTS), state.x, state.y);
        hideBubble(2500);
      }
      scheduleIdleThought();
    }, 16000 + Math.random() * 20000);
  }
  scheduleIdleThought();

  /* ── BLINK ──────────────────────────────────────────────── */
  function scheduleBlink() {
    setTimeout(() => {
      if (state.phase !== 'sleeping') {
        state.isBlinking = true;
        setTimeout(() => { state.isBlinking = false; }, 130);
      }
      scheduleBlink();
    }, 3500 + Math.random() * 5000);
  }
  scheduleBlink();

  /* ── CLICK ON FAIRY → MAGIC RIPPLE ─────────────────────── */
  hitEl.addEventListener('click', () => {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    triggerMagicRipple(cx, cy);
    if (state.phase === 'sleeping') {
      state.phase = 'wandering';
      state.emotion = 'happy';
      scheduleSleep();
    }
  });

  /* ── WAKE ON SCROLL / CLICK ─────────────────────────────── */
  function wakeUp() {
    if (state.phase === 'sleeping') {
      state.phase = 'wandering';
      state.emotion = 'happy';
      clearTimeout(state.sleepTimer);
      scheduleSleep();
    }
  }
  window.addEventListener('scroll', wakeUp, { passive: true });
  document.addEventListener('click', e => {
    // wake up regardless of where clicked
    wakeUp();
  });

  /* ── INITIAL GREETING (1.5s) ────────────────────────────── */
  setTimeout(() => {
    if (!state.hasGreeted) {
      state.hasGreeted = true;
      showBubble("Psst! I'm Maya~ Click me for magic! ✨", state.x, state.y);
      hideBubble(3800);
    }
  }, 1500);

  /* ── MAIN LOOP ──────────────────────────────────────────── */
  let t = 0;
  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    t++;

    // trail spawn
    if (state.phase !== 'sleeping') {
      const sp = Math.sqrt(state.vx * state.vx + state.vy * state.vy);
      if (sp > 0.6) {
        state.trailPoints.push({ x: state.x, y: state.y, life: 1, size: 3.5 + sp * 0.5 });
        if (Math.random() > 0.55) spawnDust(
          state.x + (Math.random() - 0.5) * 7,
          state.y + (Math.random() - 0.5) * 7, null, 1
        );
      }
    }

    // age trail & dust
    state.trailPoints = state.trailPoints.map(p => ({ ...p, life: p.life - 0.03 })).filter(p => p.life > 0);
    state.dustParticles = state.dustParticles.map(d => ({ ...d, x: d.x + d.vx, y: d.y + d.vy, vy: d.vy - 0.05, life: d.life - 0.022 })).filter(d => d.life > 0);

    // movement
    if      (state.phase === 'wandering')  doWander();
    else if (state.phase === 'approaching') moveToTarget();
    else if (state.phase === 'leaving')     moveToTarget();
    else if (state.phase === 'sleeping') {
      state.targetX = state.x + Math.sin(t * 0.01) * 0.3;
      state.targetY = state.y + Math.cos(t * 0.007) * 0.3;
    } else if (state.phase === 'talking') {
      state.x += Math.sin(t * 0.03) * 0.3;
      state.y += Math.cos(t * 0.025) * 0.25;
    }

    // update hit element position
    hitEl.style.left = state.x + 'px';
    hitEl.style.top  = state.y + 'px';

    // update bubble position
    if (state.chatVisible) {
      bubble.style.left = Math.min(state.x + 22, window.innerWidth - 240) + 'px';
      bubble.style.top  = Math.max(state.y - 65, 10) + 'px';
    }

    // draw layers
    drawRipples();
    drawTrail();
    drawDust();
    drawFairy(state.x, state.y, t);

    requestAnimationFrame(loop);
  }

  loop();

})();
