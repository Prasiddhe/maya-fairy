/* ===========================================================
   MAYA — THE SITE FAIRY (standalone script)
   ===========================================================
   This file is loaded by a tiny loader snippet placed in your
   Wix Custom Code box. It injects Maya's styles, markup, and
   behavior directly into your live page.

   Update FAIRY_CHAT_ENDPOINT inside this file to point to your
   Velo backend function. See backend notes at the very bottom.
   =========================================================== */

(function(){

  var style = document.createElement('style');
  style.textContent = `
  :root{
    --midnight:#1a1530;
    --twilight:#4a3a72;
    --moonlight:#e8e3f5;
    --gold:#f4c869;
    --rose:#d98a9c;
    --forest:#1e2a1f;
  }

  *{ box-sizing:border-box; }

  @font-face{
    font-family:'Cinzel';
    src: local('Cinzel');
  }

  /* ============ FAIRY LAYER ============ */
  #fairy-overlay{
    position:fixed; inset:0;
    width:100vw; height:100vh;
    pointer-events:none;
    z-index:999999;
  }

  #trail-canvas{
    position:fixed; inset:0;
    width:100vw; height:100vh;
    pointer-events:none;
  }

  #fairy{
    position:fixed;
    top:0; left:0;
    width:56px; height:56px;
    transform:translate(-50%,-50%);
    pointer-events:auto;
    cursor:pointer;
    z-index:2;
    filter:drop-shadow(0 0 4px var(--gold));
    transition: filter 0.3s ease;
  }
  #fairy:hover{ filter:drop-shadow(0 0 16px var(--gold)); }

  #fairy svg{ width:100%; height:100%; display:block; }

  .wing{
    fill:var(--moonlight);
    opacity:0.8;
    transform-origin:center;
    animation:flap 0.12s ease-in-out infinite alternate;
  }
  .wing.right{ animation-delay:0.04s; }
  @keyframes flap{
    from{ transform:scaleX(1) rotate(0deg); }
    to{ transform:scaleX(0.55) rotate(-12deg); }
  }

  #fairy-body{
    animation: bob 2.4s ease-in-out infinite;
    transform-origin:center;
  }
  @keyframes bob{
    0%, 100%{ transform:translateY(0) rotate(0deg); }
    50%{ transform:translateY(-3px) rotate(2deg); }
  }

  /* ============ SPEECH BUBBLE ============ */
  #speech-bubble{
    position:fixed;
    top:0; left:0;
    max-width:220px;
    background:rgba(26,21,48,0.92);
    border:1px solid var(--gold);
    border-radius:14px;
    color:var(--moonlight);
    font-size:13px;
    line-height:1.4;
    padding:10px 14px;
    pointer-events:auto;
    cursor:pointer;
    box-shadow:0 4px 20px rgba(0,0,0,0.4);
    opacity:0;
    transition:opacity 0.4s ease, transform 0.4s ease;
    z-index:3;
    font-family:'Quicksand', sans-serif;
  }
  #speech-bubble.show{ opacity:1; }
  #speech-bubble .name{
    font-family:'Cinzel', serif;
    color:var(--gold);
    display:block;
    margin-bottom:4px;
    font-size:12px;
    letter-spacing:1px;
  }

  /* ============ CHAT PANEL ============ */
  #chat-panel{
    position:fixed;
    bottom:24px; right:24px;
    width:280px;
    max-height:360px;
    background:linear-gradient(160deg, rgba(26,21,48,0.97), rgba(74,58,114,0.92));
    border:1px solid var(--twilight);
    border-radius:18px;
    box-shadow:0 8px 30px rgba(0,0,0,0.5);
    display:none;
    flex-direction:column;
    overflow:hidden;
    pointer-events:auto;
    z-index:4;
    font-family:'Quicksand', sans-serif;
  }
  #chat-panel.open{ display:flex; }

  #chat-header{
    padding:12px 14px;
    font-family:'Cinzel', serif;
    color:var(--gold);
    letter-spacing:1px;
    font-size:14px;
    border-bottom:1px solid rgba(244,200,105,0.25);
    display:flex; justify-content:space-between; align-items:center;
  }
  #chat-close{
    cursor:pointer; color:var(--moonlight); opacity:0.6; font-size:16px;
  }
  #chat-close:hover{ opacity:1; }

  #chat-messages{
    flex:1;
    overflow-y:auto;
    padding:10px 14px;
    display:flex; flex-direction:column; gap:8px;
    color:var(--moonlight);
    font-size:13px;
  }
  .msg{
    padding:8px 10px;
    border-radius:10px;
    max-width:85%;
    line-height:1.4;
  }
  .msg.fairy{
    background:rgba(244,200,105,0.12);
    border:1px solid rgba(244,200,105,0.25);
    align-self:flex-start;
  }
  .msg.user{
    background:rgba(216,138,156,0.18);
    border:1px solid rgba(216,138,156,0.3);
    align-self:flex-end;
  }

  #chat-input-row{
    display:flex; border-top:1px solid rgba(244,200,105,0.2);
  }
  #chat-input{
    flex:1; border:none; background:transparent;
    color:var(--moonlight); padding:10px 12px; font-size:13px;
    outline:none; font-family:'Quicksand', sans-serif;
  }
  #chat-send{
    background:none; border:none; color:var(--gold);
    padding:0 14px; cursor:pointer; font-size:16px;
  }

  /* ============ PORTAL TRANSITION ============ */
  #portal{
    position:fixed; inset:0;
    width:100vw; height:100vh;
    pointer-events:none;
    z-index:9999998;
  }
  #rune-circle{
    position:absolute;
    top:0; left:0;
    width:40px; height:40px;
    border-radius:50%;
    background:radial-gradient(circle, #ffffff 0%, #fff8e6 30%, var(--gold) 65%, transparent 100%);
    box-shadow:0 0 60px 30px rgba(255,255,255,0.9);
    transform:translate(-50%,-50%) scale(0);
    transition:transform 1s cubic-bezier(.2,.8,.2,1);
    pointer-events:none;
  }
  #rune-circle.expand{ transform:translate(-50%,-50%) scale(70); }

  #white-flash{
    position:fixed; inset:0;
    width:100vw; height:100vh;
    background:#ffffff;
    opacity:0;
    pointer-events:none;
    z-index:9999999;
    transition:opacity 0.4s ease;
  }
  #white-flash.flash{ opacity:1; }

  /* ============ RITUAL WORLD (SECOND LAYER) ============ */
  #ritual-world{
    position:fixed; inset:0;
    width:100vw; height:100vh;
    background:radial-gradient(ellipse at 50% 70%, var(--twilight) 0%, var(--midnight) 60%, #0d0a18 100%);
    opacity:0;
    pointer-events:none;
    transition:opacity 0.6s ease;
    z-index:9999997;
    overflow:hidden;
    font-family:'Quicksand', sans-serif;
  }
  #ritual-world.visible{ opacity:1; pointer-events:auto; }

  #ritual-close{
    position:absolute; top:20px; right:24px;
    color:var(--moonlight); font-size:28px; cursor:pointer;
    opacity:0.7; z-index:5; font-family:'Cinzel', serif;
  }
  #ritual-close:hover{ opacity:1; }

  .moon{
    position:absolute; top:8%; left:50%; transform:translateX(-50%);
    width:90px; height:90px; border-radius:50%;
    background:radial-gradient(circle at 35% 35%, #fff, var(--gold) 60%, transparent 100%);
    box-shadow:0 0 60px 20px rgba(244,200,105,0.35);
  }

  .tree{
    position:absolute; bottom:0;
    width:120px; height:55%;
    opacity:0.55;
    fill:var(--forest);
  }
  .tree.left{ left:-10px; }
  .tree.right{ right:-10px; transform:scaleX(-1); }

  .candle{
    position:absolute; bottom:6%;
    width:10px; height:46px;
    background:linear-gradient(var(--gold), #b88a3a);
    border-radius:2px;
  }
  .candle::before{
    content:'';
    position:absolute; top:-14px; left:50%;
    transform:translateX(-50%);
    width:8px; height:14px;
    border-radius:50% 50% 50% 50%/60% 60% 40% 40%;
    background:var(--gold);
    box-shadow:0 0 18px 6px rgba(244,200,105,0.7);
    animation:flicker 1.4s ease-in-out infinite alternate;
  }
  @keyframes flicker{
    from{ opacity:0.85; transform:translateX(-50%) scale(1); }
    to{ opacity:1; transform:translateX(-50%) scale(1.15) rotate(3deg); }
  }

  #ritual-title{
    position:absolute; top:24%; left:50%; transform:translateX(-50%);
    text-align:center; color:var(--moonlight);
    font-family:'Cinzel', serif;
    letter-spacing:3px;
    text-shadow:0 0 12px rgba(244,200,105,0.5);
  }
  #ritual-title .big{ font-size:22px; color:var(--gold); display:block; }
  #ritual-title .small{ font-size:12px; opacity:0.7; margin-top:6px; display:block; }

  #cards-row{
    position:absolute; bottom:14%; left:50%; transform:translateX(-50%);
    display:flex; gap:24px;
  }
  .tarot-card{
    width:90px; height:140px;
    border-radius:10px;
    background:linear-gradient(160deg, var(--twilight), var(--midnight));
    border:1px solid var(--gold);
    box-shadow:0 0 18px rgba(244,200,105,0.25);
    display:flex; align-items:center; justify-content:center;
    color:var(--gold); font-size:30px;
    cursor:pointer;
    transition:transform 0.4s ease, box-shadow 0.4s ease;
    position:relative;
    perspective:600px;
  }
  .tarot-card:hover{ transform:translateY(-10px); box-shadow:0 8px 26px rgba(244,200,105,0.4); }
  .tarot-card .face{
    position:absolute; inset:0;
    display:flex; align-items:center; justify-content:center;
    backface-visibility:hidden;
    border-radius:10px;
  }
  .tarot-card .front{ background:transparent; }
  .tarot-card .back{
    background:rgba(244,200,105,0.08);
    transform:rotateY(180deg);
    flex-direction:column; padding:10px; text-align:center;
    color:var(--moonlight); font-size:11px; line-height:1.4;
    font-family:'Quicksand', sans-serif;
  }
  .tarot-card .inner{
    width:100%; height:100%;
    position:relative;
    transition:transform 0.6s;
    transform-style:preserve-3d;
  }
  .tarot-card.flipped .inner{ transform:rotateY(180deg); }
  .tarot-card .back .label{
    font-family:'Cinzel', serif; color:var(--gold);
    font-size:12px; margin-bottom:6px; letter-spacing:1px;
  }

  #fairy-test-badge{
    position:fixed;
    bottom:24px; left:24px;
    background:rgba(26,21,48,0.85);
    border:1px solid var(--gold);
    color:var(--moonlight);
    font-size:11px; font-family:'Quicksand', sans-serif;
    padding:6px 10px; border-radius:8px;
    pointer-events:none;
    z-index:5;
    opacity:0.85;
  }

  #book-buttons{
    position:absolute; top:38%; left:50%; transform:translateX(-50%);
    display:flex; gap:14px; flex-wrap:wrap; justify-content:center;
  }
  .book-btn{
    background:rgba(244,200,105,0.12);
    border:1px solid var(--gold);
    color:var(--moonlight);
    font-family:'Cinzel', serif;
    font-size:12px; letter-spacing:1px;
    padding:10px 18px; border-radius:30px;
    cursor:pointer; transition:background 0.3s ease;
  }
  .book-btn:hover{ background:rgba(244,200,105,0.28); }
`;
  document.head.appendChild(style);

  var wrapper = document.createElement('div');
  wrapper.innerHTML = `<div id="fairy-overlay">
  <canvas id="trail-canvas"></canvas>

  <div id="speech-bubble"><span class="name">Maya ✦</span><span id="bubble-text"></span></div>

  <div id="fairy" title="Click to talk to Maya">
    <svg viewBox="0 0 60 60">
      <!-- wings -->
      <ellipse class="wing left"  cx="11" cy="28" rx="13" ry="19" />
      <ellipse class="wing right" cx="49" cy="28" rx="13" ry="19" />

      <g id="fairy-body">
        <!-- wand -->
        <line x1="40" y1="38" x2="50" y2="50" stroke="var(--gold)" stroke-width="2" stroke-linecap="round"/>
        <circle cx="50" cy="50" r="2.5" fill="var(--gold)"/>

        <!-- dress / body -->
        <path d="M30 27 C23 27, 19 42, 25 49 L35 49 C41 42, 37 27, 30 27 Z" fill="var(--rose)"/>

        <!-- arms -->
        <path d="M23 31 C18 33, 16 38, 18 41" stroke="#f7d9c4" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M37 31 C42 33, 45 38, 43 41" stroke="#f7d9c4" stroke-width="3" fill="none" stroke-linecap="round"/>

        <!-- hair back -->
        <path d="M18 18 C18 30, 22 34, 22 34 L20 34 C16 28, 16 18, 18 18 Z" fill="#caa6e8"/>
        <path d="M42 18 C42 30, 38 34, 38 34 L40 34 C44 28, 44 18, 42 18 Z" fill="#caa6e8"/>

        <!-- head -->
        <circle cx="30" cy="19" r="10" fill="#f7d9c4"/>

        <!-- hair top -->
        <path d="M19.5 17 C19.5 8, 40.5 8, 40.5 17 C40.5 12, 19.5 12, 19.5 17 Z" fill="#caa6e8"/>

        <!-- face -->
        <circle cx="26.5" cy="19" r="1.3" fill="#3a2d52"/>
        <circle cx="33.5" cy="19" r="1.3" fill="#3a2d52"/>
        <path d="M26.5 23 Q30 26 33.5 23" stroke="#3a2d52" stroke-width="1.2" fill="none" stroke-linecap="round"/>
        <circle cx="24" cy="21" r="1.6" fill="var(--rose)" opacity="0.6"/>
        <circle cx="36" cy="21" r="1.6" fill="var(--rose)" opacity="0.6"/>

        <!-- sparkle -->
        <circle cx="48" cy="44" r="1.5" fill="#fff" opacity="0.9"/>
      </g>
    </svg>
  </div>

  <div id="fairy-test-badge">✦ Maya overlay active — page underneath should still be clickable</div>

  <div id="chat-panel">
    <div id="chat-header">Maya the Fairy <span id="chat-close">✕</span></div>
    <div id="chat-messages"></div>
    <div id="chat-input-row">
      <input id="chat-input" type="text" placeholder="Ask Maya anything..." />
      <button id="chat-send">➤</button>
    </div>
  </div>
</div>

<div id="portal">
  <div id="rune-circle"></div>
</div>
<div id="white-flash"></div>

<div id="ritual-world">
  <div id="ritual-close">✕</div>
  <div class="moon"></div>

  <svg class="tree left" viewBox="0 0 120 200" preserveAspectRatio="none">
    <path d="M60 200 L60 100 L40 80 L60 70 L20 50 L55 55 L30 20 L60 35 L60 0 L70 0 L70 200 Z"/>
  </svg>
  <svg class="tree right" viewBox="0 0 120 200" preserveAspectRatio="none">
    <path d="M60 200 L60 100 L40 80 L60 70 L20 50 L55 55 L30 20 L60 35 L60 0 L70 0 L70 200 Z"/>
  </svg>

  <div id="ritual-title">
    <span class="big">A Quiet Circle of Light</span>
    <span class="small">Maya has opened a space for you. Choose a card, or choose your path.</span>
  </div>

  <div id="book-buttons">
    <div class="book-btn" data-action="tarot">Book a Tarot Reading ?</div>
    <div class="book-btn" data-action="healing">Book a Healing Session ?</div>
    <div class="book-btn" data-action="consult">Book a Consultation ?</div>
  </div>

  <div class="candle" style="left:18%"></div>
  <div class="candle" style="left:30%"></div>
  <div class="candle" style="right:30%"></div>
  <div class="candle" style="right:18%"></div>

  <div id="cards-row"></div>
</div>`;
  document.body.appendChild(wrapper);

  /* =========================================================
     CONFIG — point this at your Velo backend (see bottom notes)
  ========================================================= */
  var FAIRY_CHAT_ENDPOINT = "/_functions/fairyChat"; // <-- update to your Wix backend web module

  /* =========================================================
     ELEMENTS
  ========================================================= */
  var fairy       = document.getElementById('fairy');
  var bubble      = document.getElementById('speech-bubble');
  var bubbleText  = document.getElementById('bubble-text');
  var chatPanel   = document.getElementById('chat-panel');
  var chatClose   = document.getElementById('chat-close');
  var chatMsgs    = document.getElementById('chat-messages');
  var chatInput   = document.getElementById('chat-input');
  var chatSend    = document.getElementById('chat-send');
  var runeCircle  = document.getElementById('rune-circle');
  var ritual      = document.getElementById('ritual-world');
  var ritualClose = document.getElementById('ritual-close');
  var canvas      = document.getElementById('trail-canvas');
  var ctx         = canvas.getContext('2d');

  function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  /* =========================================================
     FAIRY MOVEMENT — wanders randomly, stays aware of where
     you are, and playfully flits away if your cursor/finger
     gets close (without literally chasing or following it)
  ========================================================= */
  var pos = { x: window.innerWidth*0.8, y: window.innerHeight*0.3 };
  var target = { x: pos.x, y: pos.y };
  var particles = [];

  var cursor = { x: -9999, y: -9999 };
  var FLEE_RADIUS = 170; // if you get this close, she flits away
  var lastInputTime = Date.now();

  window.addEventListener('mousemove', function(e){
    cursor.x = e.clientX;
    cursor.y = e.clientY;
    lastInputTime = Date.now();
  }, { passive: true });

  window.addEventListener('touchstart', function(e){
    if(e.touches && e.touches[0]){
      cursor.x = e.touches[0].clientX;
      cursor.y = e.touches[0].clientY;
      lastInputTime = Date.now();
    }
  }, { passive: true });

  window.addEventListener('touchmove', function(e){
    if(e.touches && e.touches[0]){
      cursor.x = e.touches[0].clientX;
      cursor.y = e.touches[0].clientY;
      lastInputTime = Date.now();
    }
  }, { passive: true });

  function pickNewTarget(){
    var margin = 60;
    target.x = margin + Math.random() * (window.innerWidth  - margin*2);
    target.y = margin + Math.random() * (window.innerHeight * 0.75 - margin);
  }
  pickNewTarget();

  // wander to a new random spot every 5-9 seconds
  function scheduleWander(){
    var delay = 5000 + Math.random() * 4000;
    setTimeout(function(){
      pickNewTarget();
      scheduleWander();
    }, delay);
  }
  scheduleWander();

  var fleeing = false;

  function animate(){
    // if the cursor/finger gets close, flit away in the opposite direction
    var dx = pos.x - cursor.x;
    var dy = pos.y - cursor.y;
    var dist = Math.sqrt(dx*dx + dy*dy);

    if(dist < FLEE_RADIUS){
      var angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.6; // a little randomness, feels alive
      var fleeDist = 130;
      var margin = 40;
      target.x = Math.min(Math.max(pos.x + Math.cos(angle) * fleeDist, margin), window.innerWidth - margin);
      target.y = Math.min(Math.max(pos.y + Math.sin(angle) * fleeDist, margin), window.innerHeight * 0.85);
      fleeing = true;
    } else if(fleeing && dist > FLEE_RADIUS + 60){
      // settled at a safe distance — pick a fresh spot to continue wandering
      fleeing = false;
      pickNewTarget();
    }

    // ease toward target
    pos.x += (target.x - pos.x) * 0.05;
    pos.y += (target.y - pos.y) * 0.05;

    fairy.style.left = pos.x + 'px';
    fairy.style.top  = pos.y + 'px';
    bubble.style.left = Math.min(pos.x + 36, window.innerWidth - 230) + 'px';
    bubble.style.top  = Math.max(pos.y - 20, 10) + 'px';

    // spawn trail particle
    particles.push({ x: pos.x, y: pos.y, life: 1, r: 2 + Math.random()*3 });

    // draw trail
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(var i = particles.length - 1; i >= 0; i--){
      var p = particles[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(244,200,105,' + (p.life*0.6) + ')';
      ctx.fill();
      p.life -= 0.02;
      if(p.life <= 0) particles.splice(i,1);
    }

    requestAnimationFrame(animate);
  }
  animate();

  /* =========================================================
     SPEECH BUBBLE PROMPTS
  ========================================================= */
  var testBadge = document.getElementById('fairy-test-badge');
  setTimeout(function(){
    if(testBadge){ testBadge.style.transition = 'opacity 0.6s ease'; testBadge.style.opacity = '0'; }
  }, 8000);

  var prompts = [
    "Lost? Ask me anything ✦",
    "Book a Tarot Reading ?",
    "Need Healing ?",
    "Curious what the cards say ?",
    "I can guide you, just ask ✦",
    "Hi there ✦",
    "The cards are calling ✦",
    "Need a sign ?",
    "I'm here if you need me ✦"
  ];

  function showRandomPrompt(){
    var msg = prompts[Math.floor(Math.random() * prompts.length)];
    bubbleText.textContent = msg;
    bubble.classList.add('show');
    setTimeout(function(){ bubble.classList.remove('show'); }, 4500);
    scheduleRandomPrompt();
  }
  function scheduleRandomPrompt(){
    var delay = 9000 + Math.random() * 12000; // every 9-21 seconds
    setTimeout(showRandomPrompt, delay);
  }
  scheduleRandomPrompt();

  /* ---------------------------------------------------------
     SCROLL AWARENESS — Maya reacts to where you are on the page
     (only works when injected directly into the page via
     Custom Code, not inside an iframe widget)
  --------------------------------------------------------- */
  var scrollPrompts = {
    top:    ["Welcome ✦ I'm Maya, your guide here.", "New here? Ask me anything ✦"],
    middle: ["Still exploring? I'm right here ✦", "Want a Tarot Reading while you browse ?"],
    bottom: ["Found something you like? I can help you book it ✦", "Ready to take the next step ?"]
  };
  var lastZone = '';
  var scrollPromptQueued = false;

  function getScrollZone(){
    var doc = document.documentElement;
    var scrollTop = window.scrollY || doc.scrollTop;
    var maxScroll = (doc.scrollHeight - window.innerHeight) || 1;
    var pct = scrollTop / maxScroll;
    if(pct < 0.2) return 'top';
    if(pct > 0.75) return 'bottom';
    return 'middle';
  }

  window.addEventListener('scroll', function(){
    var zone = getScrollZone();
    if(zone !== lastZone && !scrollPromptQueued){
      lastZone = zone;
      scrollPromptQueued = true;
      // give Maya a moment to "notice", then speak
      setTimeout(function(){
        var options = scrollPrompts[zone];
        bubbleText.textContent = options[Math.floor(Math.random()*options.length)];
        bubble.classList.add('show');
        setTimeout(function(){ bubble.classList.remove('show'); }, 5000);
        scrollPromptQueued = false;
      }, 600);
    }
  });

  // clicking the bubble opens chat too
  bubble.addEventListener('click', openChat);

  /* =========================================================
     CHAT PANEL
  ========================================================= */
  function openChat(){
    chatPanel.classList.add('open');
    if(chatMsgs.children.length === 0){
      addMessage('fairy', "Hello, traveler. I'm Maya — ask me anything about this site, or tell me what's on your mind. ✦");
    }
  }
  chatClose.addEventListener('click', function(){ chatPanel.classList.remove('open'); });

  function addMessage(who, text){
    var div = document.createElement('div');
    div.className = 'msg ' + who;
    div.textContent = text;
    chatMsgs.appendChild(div);
    chatMsgs.scrollTop = chatMsgs.scrollHeight;
  }

  function sendChat(){
    var text = chatInput.value.trim();
    if(!text) return;
    addMessage('user', text);
    chatInput.value = '';
    addMessage('fairy', '...'); // placeholder while thinking
    var placeholder = chatMsgs.lastChild;

    fetch(FAIRY_CHAT_ENDPOINT, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ message: text })
    })
    .then(function(r){ return r.json(); })
    .then(function(data){
      placeholder.textContent = data.reply || "Hmm, the threads are tangled right now — try again in a moment.";
    })
    .catch(function(){
      placeholder.textContent = "I can't reach my magic right now. (Backend not connected yet.)";
    });
  }
  chatSend.addEventListener('click', sendChat);
  chatInput.addEventListener('keydown', function(e){ if(e.key === 'Enter') sendChat(); });

  /* =========================================================
     PORTAL TRANSITION → RITUAL WORLD
  ========================================================= */
  var TAROT_DATA = [
    { symbol:'☉', name:'The Sun',  text:'Clarity is coming. A good moment to move forward with confidence.' },
    { symbol:'☽', name:'The Moon', text:'Trust your intuition — something unseen is guiding this chapter.' },
    { symbol:'★', name:'The Star', text:'Hope renews. A small step now leads somewhere meaningful.' }
  ];

  function buildCards(){
    var row = document.getElementById('cards-row');
    row.innerHTML = '';
    TAROT_DATA.forEach(function(card){
      var el = document.createElement('div');
      el.className = 'tarot-card';
      el.innerHTML =
        '<div class="inner">' +
          '<div class="face front">' + card.symbol + '</div>' +
          '<div class="face back"><div class="label">' + card.name + '</div>' + card.text + '</div>' +
        '</div>';
      el.addEventListener('click', function(){ el.classList.toggle('flipped'); });
      row.appendChild(el);
    });
  }

  var whiteFlash = document.getElementById('white-flash');

  fairy.addEventListener('click', function(){
    runeCircle.style.left = pos.x + 'px';
    runeCircle.style.top  = pos.y + 'px';
    runeCircle.classList.add('expand');

    // bright heavenly flash as the circle reaches full size
    setTimeout(function(){
      whiteFlash.classList.add('flash');
    }, 650);

    setTimeout(function(){
      buildCards();
      ritual.classList.add('visible');
    }, 850);

    setTimeout(function(){
      whiteFlash.classList.remove('flash');
      runeCircle.classList.remove('expand');
    }, 1500);
  });

  ritualClose.addEventListener('click', function(){
    ritual.classList.remove('visible');
  });

  document.querySelectorAll('.book-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      var action = btn.getAttribute('data-action');
      // Hook these up to your Wix booking pages / lightboxes.
      // Example: window.parent.postMessage({ fairyAction: action }, '*');
      addMessage && openChat();
      addMessage('fairy', "Wonderful — let's get that " + action + " booked. (Connect this button to your booking page.)");
      ritual.classList.remove('visible');
      chatPanel.classList.add('open');
    });
  });

})();

/* ===========================================================
   BACKEND NOTES (Wix Velo)
   ===========================================================
   Create a backend file, e.g. backend/fairy.web.js, with:

   import { fetch } from 'wix-fetch';
   import { getSecret } from 'wix-secrets-backend';

   export async function post_fairyChat(request) {
     const body = await request.body.json();
     const apiKey = await getSecret('OPENAI_API_KEY');

     const response = await fetch('https://api.openai.com/v1/chat/completions', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': 'Bearer ' + apiKey
       },
       body: JSON.stringify({
         model: 'gpt-4o-mini',
         messages: [
           { role: 'system', content: 'You are Maya, a warm, mystical site fairy who gently guides visitors and offers tarot/healing/consultation bookings.' },
           { role: 'user', content: body.message }
         ]
       })
     });

     const data = await response.json();
     return {
       status: 200,
       headers: { 'Content-Type': 'application/json' },
       body: { reply: data.choices[0].message.content }
     };
   }

   Store your real key in Wix Secrets Manager under the name
   OPENAI_API_KEY — never paste it into any front-end file.
   =========================================================== */
