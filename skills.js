/* =========================================================
   SKILLS STACK — interaction + scroll engine
   ========================================================= */
(function(){
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
  const lerp  = (a,b,t)=>a+(b-a)*t;
  const easeOut = t=>1-Math.pow(1-t,3);
  const easeInOut = t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;

  /* ---------- HERO word reveal ---------- */
  function heroReveal(){
    const words = document.querySelectorAll('.sk-title .w, .hero-reveal');
    words.forEach((w,i)=>{
      if (reduce){ w.style.opacity=1; w.style.transform='none'; return; }
      w.style.opacity=0;
      w.style.transform='translateY(40px) rotate(-2deg)';
      w.style.transition='opacity .8s cubic-bezier(.2,.7,.2,1), transform .8s cubic-bezier(.2,.7,.2,1)';
      setTimeout(()=>{ w.style.opacity='1'; w.style.transform='none'; }, 120 + i*110);
    });
    // character + note gentle entrance
    const char = document.querySelector('.hero-char');
    const note = document.querySelector('.hero-note');
    [char, note].forEach((el,i)=>{
      if(!el) return;
      if(reduce){ return; }
      el.style.opacity='0';
      el.style.transform = (el===char?'translateY(36px)':'translateY(20px) rotate(-4deg)');
      el.style.transition='opacity 1s ease, transform 1.1s cubic-bezier(.2,.7,.2,1)';
      setTimeout(()=>{ el.style.opacity='1'; el.style.transform=(el===char?'none':'rotate(-4deg)'); }, 260 + i*160);
    });
  }

  /* ---------- generic reveal-on-scroll ---------- */
  function setupReveals(){
    const io = new IntersectionObserver((ents)=>{
      ents.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in-view'); io.unobserve(e.target);} });
    },{threshold:.18, rootMargin:'0px 0px -8% 0px'});
    document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
  }

  /* ---------- progress rings ---------- */
  function setupRings(){
    const rings = document.querySelectorAll('.ring');
    const io = new IntersectionObserver((ents)=>{
      ents.forEach(e=>{
        if(!e.isIntersecting) return;
        const r = e.target;
        const pct = +r.dataset.pct;
        const bar = r.querySelector('.bar');
        const C = 251.3;
        if(reduce){ bar.style.strokeDashoffset = C*(1-pct/100); }
        else { requestAnimationFrame(()=>{ bar.style.strokeDashoffset = C*(1-pct/100); }); }
        // count up percentage text
        const out = r.querySelector('.pct');
        countTo(out, pct, '%', 1100);
        io.unobserve(r);
      });
    },{threshold:.4});
    rings.forEach(r=>io.observe(r));
  }

  /* ---------- count-up util ---------- */
  function countTo(el, target, suffix, dur){
    if(!el) return;
    if(reduce){ el.textContent = target + (suffix||''); return; }
    const start = performance.now();
    function step(now){
      const t = clamp((now-start)/dur,0,1);
      el.textContent = Math.round(target*easeOut(t)) + (suffix||'');
      if(t<1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- bars (learning, tools) on view ---------- */
  function setupBars(){
    const io = new IntersectionObserver((ents)=>{
      ents.forEach(e=>{
        if(!e.isIntersecting) return;
        const fill = e.target.querySelector('.fill');
        if(fill) fill.style.width = e.target.dataset.pct + '%';
        io.unobserve(e.target);
      });
    },{threshold:.5});
    document.querySelectorAll('.learn-bar').forEach(b=>io.observe(b));
  }

  /* ---------- count-up metrics ---------- */
  function setupMetrics(){
    const io = new IntersectionObserver((ents)=>{
      ents.forEach(e=>{
        if(!e.isIntersecting) return;
        const num = e.target.querySelector('.metric-num');
        const target = +num.dataset.val;
        const pre = num.dataset.pre||'';
        const suf = num.dataset.suf||'';
        if(reduce){ num.textContent = pre+target+suf; }
        else {
          const start = performance.now(), dur=1500;
          (function step(now){
            const t=clamp((now-start)/dur,0,1);
            num.textContent = pre + Math.round(target*easeOut(t)) + suf;
            if(t<1) requestAnimationFrame(step);
          })(performance.now());
        }
        io.unobserve(e.target);
      });
    },{threshold:.5});
    document.querySelectorAll('.metric-card').forEach(c=>io.observe(c));
  }

  /* ---------- CATEGORY NAV: pill + scroll-spy + click ---------- */
  function setupCatNav(){
    const nav = document.querySelector('.cat-nav');
    if(!nav) return;
    const pill = nav.querySelector('.cat-pill');
    const btns = Array.from(nav.querySelectorAll('.cat-btn'));
    const tints = {core:'var(--peach-bg)', tools:'var(--green-bg)', learn:'var(--lav-bg)', work:'var(--peach-bg)'};

    function movePill(btn){
      pill.style.left = btn.offsetLeft + 'px';
      pill.style.width = btn.offsetWidth + 'px';
      pill.style.background = tints[btn.dataset.target] || 'var(--peach-bg)';
    }
    function setActive(btn){
      btns.forEach(b=>b.classList.toggle('active', b===btn));
      movePill(btn);
    }
    // init
    setActive(btns[0]);
    window.addEventListener('resize', ()=>{ const a=nav.querySelector('.cat-btn.active'); if(a) movePill(a); });

    btns.forEach(b=>{
      b.addEventListener('click', ()=>{
        const sec = document.getElementById(b.dataset.target);
        if(sec){
          const y = sec.getBoundingClientRect().top + window.scrollY - 130;
          window.scrollTo({top:y, behavior: reduce?'auto':'smooth'});
        }
        setActive(b);
      });
    });

    // scroll-spy
    const map = {};
    btns.forEach(b=> map[b.dataset.target] = b);
    const ids = Object.keys(map);
    window.addEventListener('scroll', ()=>{
      let best=null, bestDist=Infinity;
      ids.forEach(id=>{
        const sec = document.getElementById(id);
        if(!sec) return;
        const d = Math.abs(sec.getBoundingClientRect().top - 150);
        if(d<bestDist){ bestDist=d; best=id; }
      });
      if(best && !map[best].classList.contains('active')) setActive(map[best]);
    }, {passive:true});
  }

  /* ---------- scroll-driven pins ---------- */
  function progressOf(wrap, pinTop){
    const rect = wrap.getBoundingClientRect();
    const pin = wrap.firstElementChild;
    const travel = wrap.offsetHeight - pin.offsetHeight;
    return clamp((pinTop - rect.top) / Math.max(1, travel), 0, 1);
  }

  // 01 CORE horizontal carousel
  function setupCore(){
    const wrap = document.getElementById('corePinWrap');
    if(!wrap) return;
    const track = document.getElementById('coreTrack');
    const cards = Array.from(track.children);
    const viewport = track.parentElement;
    let maxX = 0;
    function measure(){ maxX = Math.max(0, track.scrollWidth - viewport.clientWidth); }
    measure();
    window.addEventListener('resize', ()=>{ measure(); update(); });

    function update(){
      if(reduce){ track.style.transform='none'; return; }
      const p = progressOf(wrap, 120);
      const x = maxX * easeInOut(p);
      track.style.transform = 'translateX(' + (-x) + 'px)';
      // active card = closest to focus point (left third of viewport)
      const focus = viewport.getBoundingClientRect().left + viewport.clientWidth*0.22;
      let bi=0, bd=Infinity;
      cards.forEach((c,i)=>{
        const r=c.getBoundingClientRect();
        const cx=r.left+r.width/2;
        const d=Math.abs(cx-focus);
        if(d<bd){bd=d;bi=i;}
      });
      cards.forEach((c,i)=>c.classList.toggle('is-active', i===bi));
    }
    // arrows nudge the page scroll within the pin
    const prev = wrap.querySelector('.core-prev');
    const next = wrap.querySelector('.core-next');
    const step = ()=> wrap.offsetHeight / cards.length;
    if(prev) prev.addEventListener('click', ()=> window.scrollBy({top:-step(), behavior:'smooth'}));
    if(next) next.addEventListener('click', ()=> window.scrollBy({top: step(), behavior:'smooth'}));

    window.addEventListener('scroll', ()=>scheduler.add(update), {passive:true});
    update();
  }

  // 03 CURRENTLY LEARNING overlap -> spread
  function setupLearn(){
    const wrap = document.getElementById('learnPinWrap');
    if(!wrap) return;
    const cards = Array.from(wrap.querySelectorAll('.learn-card'));
    let active = 1;
    const SPREAD = 310;

    function render(){
      const p = reduce ? 1 : progressOf(wrap, 140);
      const spread = easeOut(clamp(p/0.55,0,1)); // spread completes in first 55%
      cards.forEach((c,i)=>{
        const slot = i - active;
        const x = slot * SPREAD * spread;
        const isC = slot===0;
        const scale = isC ? 1.06 : (0.9 - Math.min(Math.abs(slot)-1,2)*0.04);
        c.style.transform = 'translate(-50%,-50%) translateX('+x+'px) scale('+scale+')';
        c.style.left='50%'; c.style.top='50%';
        c.style.zIndex = isC?5:(3-Math.abs(slot));
        c.style.opacity = Math.abs(slot)>1 ? 0.4 : 1;
        c.classList.toggle('center', isC);
      });
    }
    const prev = wrap.querySelector('.learn-prev');
    const next = wrap.querySelector('.learn-next');
    if(prev) prev.addEventListener('click', ()=>{ active=clamp(active-1,0,cards.length-1); render(); });
    if(next) next.addEventListener('click', ()=>{ active=clamp(active+1,0,cards.length-1); render(); });

    window.addEventListener('scroll', ()=>scheduler.add(render), {passive:true});
    window.addEventListener('resize', render);
    render();
  }

  // 02 TOOLS slow drift + progress line
  function setupTools(){
    const sec = document.getElementById('tools');
    if(!sec) return;
    const row = sec.querySelector('.tools-row');
    const prog = sec.querySelector('.tools-progress .fill');
    function update(){
      const r = sec.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = clamp((vh - r.top) / (vh + r.height), 0, 1);
      if(prog) prog.style.width = (p*100).toFixed(1) + '%';
      if(row && !reduce){
        const drift = lerp(40, -40, p);   // gentle horizontal drift
        row.style.transform = 'translateX(' + drift + 'px)';
      }
    }
    window.addEventListener('scroll', ()=>scheduler.add(update), {passive:true});
    window.addEventListener('resize', update);
    update();

    // hover tilt
    sec.querySelectorAll('.tool-card').forEach(card=>{
      card.addEventListener('mousemove', (e)=>{
        if(reduce) return;
        const r=card.getBoundingClientRect();
        const dx=(e.clientX-r.left)/r.width-0.5;
        const dy=(e.clientY-r.top)/r.height-0.5;
        card.style.transform = 'perspective(600px) rotateY('+(dx*10)+'deg) rotateX('+(-dy*10)+'deg) translateY(-4px)';
      });
      card.addEventListener('mouseleave', ()=>{ card.style.transform=''; });
    });
  }

  // 04 HOW I WORK journey line draw + dots
  function setupWork(){
    const sec = document.getElementById('work');
    if(!sec) return;
    const draw = sec.querySelector('.work-line path.draw');
    const dots = Array.from(sec.querySelectorAll('.work-dot'));
    let len = 0;
    if(draw){ len = draw.getTotalLength(); draw.style.strokeDasharray=len; draw.style.strokeDashoffset=len; }
    function update(){
      const r = sec.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = clamp((vh*0.85 - r.top) / (r.height*0.7), 0, 1);
      if(draw) draw.style.strokeDashoffset = reduce ? 0 : len*(1-p);
      dots.forEach((d,i)=>{
        const thresh = (i+0.5)/dots.length;
        d.classList.toggle('on', reduce ? true : p>=thresh);
      });
    }
    window.addEventListener('scroll', ()=>scheduler.add(update), {passive:true});
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- rAF scheduler shared by scroll handlers ---------- */
  const scheduler = (function(){
    const fns = new Set(); let raf=null;
    function flush(){ raf=null; fns.forEach(f=>f()); fns.clear(); }
    return { add(fn){ fns.add(fn); if(raf==null) raf=requestAnimationFrame(flush); } };
  })();

  /* ---------- init ---------- */
  function init(){
    heroReveal();
    setupReveals();
    setupRings();
    setupBars();
    setupMetrics();
    setupCatNav();
    setupCore();
    setupLearn();
    setupTools();
    setupWork();
  }
  if(document.readyState!=='loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
