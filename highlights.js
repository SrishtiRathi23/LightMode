/* =========================================================
   HIGHLIGHTS v2 — data-driven render + scroll-to-stack engine
   ========================================================= */
(function(){
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));

  /* ---------------- DATA (edit freely) ---------------- */
  const HL = {
    certifications: {
      num:'01', eyebrow:'Credentials & Recognitions', title:'CERTIFICATIONS',
      desc:'Certifications and programs that validate my skills and commitment to continuous learning.',
      badge:'FEATURED CERTIFICATION', kicker:'Certificate of Completion',
      metaLabels:['Issuer','Issued','Credential Type'],
      btn1:'View Credential', btn2:'Verify Credential', next:'Hackathons',
      items:[
        {name:'Google Cloud Gen AI Academy — APAC, Cohort 1', issuer:'Google Cloud', date:'Apr 2026', m3:'Certificate of Completion', recipient:'Srishti Rathi', credId:'GENAI-APAC-26-C1', logo:{t:'G',c:'#4285F4'}, desc:'Selected for Cohort 1 of the Google Cloud Gen AI Academy APAC; built and deployed Stratify with MCP integration on Cloud Run.'},
        {name:"NCC 'C' Certificate", issuer:'National Cadet Corps', date:'2025', m3:'Certification', recipient:'Srishti Rathi', credId:'NCC-C-CERT', logo:{t:'NCC',c:'#2A6F3B'}, desc:"Earned the NCC 'C' Certificate as Corporal and Discipline In-Charge — reflecting leadership, accountability and disciplined teamwork."},
      ]
    },
    hackathons: {
      num:'02', eyebrow:'Build Sprints & Wins', title:'HACKATHONS',
      desc:'Late nights, fast prototypes and a few results I am genuinely proud of.',
      badge:'FEATURED WIN', kicker:'Hackathon',
      metaLabels:['Event','Date','Result'],
      btn1:'View Project', btn2:'Watch Demo', next:'Achievements',
      items:[
        {name:'Google Solution Challenge 2026', issuer:'Google', date:'2026', m3:'Top 106 of 85,000+ registrations', recipient:'SportsGuard AI', credId:'GSC-2026', logo:{t:'G',c:'#EA4335'}, desc:'SportsGuard AI was selected in the Top 106 out of 85,000+ registrations and 6,700+ prototype submissions (India), advancing to Round 2.'},
        {name:'IBM Bob Dev Day Hackathon 2026', issuer:'IBM', date:'2026', m3:'CodeCompass deployed', recipient:'Srishti Rathi', credId:'IBM-BDD-26', logo:{t:'IBM',c:'#1F70C1'}, desc:'Built and deployed CodeCompass, an AI repository intelligence platform powered by IBM watsonx.ai Granite 3 on IBM Cloud Code Engine.'},
      ]
    },
    achievements: {
      num:'03', eyebrow:'Milestones & Moments', title:'ACHIEVEMENTS',
      desc:'A handful of milestones along the way that mean a lot to me.',
      badge:'FEATURED MILESTONE', kicker:'Milestone',
      metaLabels:['Where','When','Detail'],
      btn1:'See More', btn2:'Share', next:'Certifications',
      items:[
        {name:'Academic Excellence — University Rank 3', issuer:'MAIT, Delhi', date:'2026', m3:'College Rank 2 · 9.43 CGPA', recipient:'Srishti Rathi', credId:'ACAD-R3', logo:{t:'★',c:'#e08a5c'}, desc:'University Rank 3 and College Rank 2 with a 9.43 CGPA — consistently top-performing across mathematics, statistics, ML and data analysis.'},
        {name:'Research Paper — Primary Author', issuer:'WinTechCon 2026 (IEEE)', date:'2026', m3:'Paper ID 396 · Submitted', recipient:'Srishti Rathi', credId:'WTC-396', logo:{t:'IEEE',c:'#00629B'}, desc:'Primary author of "Sensor-Economical Tamper Detection in Smart Energy Meters", submitted to WinTechCon 2026 (IEEE); results expected Sep 2026, presentation Nov 2026.'},
        {name:'Corporal & Discipline In-Charge', issuer:'National Cadet Corps', date:'2023 — Present', m3:'Leadership role', recipient:'Srishti Rathi', credId:'NCC-LEAD', logo:{t:'NCC',c:'#2A6F3B'}, desc:'Served as Corporal and Discipline In-Charge in the NCC — demonstrating leadership, accountability and disciplined execution in team environments.'},
      ]
    }
  };

  /* ---------------- ICONS ---------------- */
  const IC = {
    building:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21 h18"/><path d="M5 21 V8 l7 -4 7 4 v13"/><path d="M9 21 v-4 h6 v4"/><path d="M9 11 h0 M12 11 h0 M15 11 h0"/></svg>',
    calendar:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9 h18 M8 3 v4 M16 3 v4"/></svg>',
    tag:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11 V4 h7 l11 11 -7 7 Z"/><circle cx="7.5" cy="7.5" r="1.3"/></svg>',
    ext:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4 h6 v6"/><path d="M20 4 L11 13"/><path d="M18 14 v4 a2 2 0 0 1 -2 2 H6 a2 2 0 0 1 -2 -2 V8 a2 2 0 0 1 2 -2 h4"/></svg>',
    check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12 l3 3 5 -6"/></svg>',
    star:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3 l2.5 5.6 L20.5 9 l-4.3 3.8 L17.5 19 L12 15.8 L6.5 19 l1.3 -6.2 L3.5 9 l6 -.4 Z"/></svg>'
  };

  /* ---------------- RENDER ---------------- */
  const els = {};
  function $(id){ return document.getElementById(id); }

  function metaIcon(i){ return [IC.building, IC.calendar, IC.tag][i] || IC.tag; }

  function renderFeatured(tab, item){
    const d = HL[tab];
    const year = (item.date.match(/\d{4}/)||['2024'])[0];
    els.featured.innerHTML = `
      <div class="cert-paper">
        <div class="cert-topbar">
          <span class="cert-issuer" style="color:${item.logo.c}">${item.issuer}</span>
          <span class="cert-tag">${item.issuer}<br>Certificate</span>
        </div>
        <div class="cert-kicker">${d.kicker}</div>
        <div class="cert-title">${item.name}</div>
        <div class="cert-recip">${item.recipient||''}</div>
        <div class="cert-line">has successfully completed the requirements to be recognized for the ${item.name}.</div>
        <div class="cert-footrow">
          <div class="cert-sign">Verified<small>${item.issuer}</small></div>
          <div class="cert-seal">${year}<small>VERIFIED</small></div>
        </div>
        <div class="cert-id">${d.metaLabels[1]}: ${item.date} · ID: ${item.credId||'—'}</div>
      </div>
      <div class="hl2-fdet">
        <span class="hl2-fbadge">${IC.star} ${d.badge}</span>
        <h3 class="hl2-fname">${item.name}</h3>
        <div class="hl2-fmeta">
          <div class="hl2-fmeta-row"><span class="mi">${metaIcon(0)}</span><span class="mk">${d.metaLabels[0]}</span><span class="mv">${item.issuer}</span></div>
          <div class="hl2-fmeta-row"><span class="mi">${metaIcon(1)}</span><span class="mk">${d.metaLabels[1]}</span><span class="mv">${item.date}</span></div>
          <div class="hl2-fmeta-row"><span class="mi">${metaIcon(2)}</span><span class="mk">${d.metaLabels[2]}</span><span class="mv">${item.m3}</span></div>
        </div>
        <p class="hl2-fdesc">${item.desc}</p>
        <div class="hl2-fbtns">
          <a class="hl2-btn hl2-btn-solid" href="#" onclick="return false">${d.btn1} ${IC.ext}</a>
          <a class="hl2-btn hl2-btn-ghost" href="#" onclick="return false">${d.btn2} ${IC.check}</a>
        </div>
      </div>`;
  }

  function renderList(tab, activeIdx){
    const d = HL[tab];
    els.list.innerHTML = '';
    d.items.forEach((item,i)=>{
      if(i === activeIdx) return; // featured one is shown above
      const row = document.createElement('div');
      row.className = 'hl2-row r-rise';
      row.innerHTML = `
        <div class="hl2-rlogo" style="background:${item.logo.c}">${item.logo.t}</div>
        <div class="hl2-rname">${item.name}</div>
        <div class="hl2-rmeta">${IC.building}${item.issuer}</div>
        <div class="hl2-rmeta">${IC.calendar}${item.date}</div>
        <a class="hl2-rlink">${d.btn1} ${IC.ext}</a>`;
      row.addEventListener('click', ()=> setFeatured(i, true));
      els.list.appendChild(row);
    });
    // staggered rise-in
    const rows = els.list.querySelectorAll('.hl2-row');
    rows.forEach((r,i)=>{
      if(reduce){ r.classList.add('in'); return; }
      setTimeout(()=> r.classList.add('in'), 60 + i*70);
    });
  }

  /* ---------------- STATE ---------------- */
  let curTab = 'certifications';
  let curIdx = 0;
  let lockScroll = false; // when true, scroll engine won't override (after manual click)

  function setFeatured(idx, swap){
    const d = HL[curTab];
    idx = clamp(idx, 0, d.items.length-1);
    if(idx === curIdx && els.featured.children.length) return;
    curIdx = idx;
    if(swap && !reduce){
      els.featured.classList.add('swap');
      setTimeout(()=>{
        renderFeatured(curTab, d.items[curIdx]);
        renderList(curTab, curIdx);
        requestAnimationFrame(()=> els.featured.classList.remove('swap'));
      }, 220);
    } else {
      renderFeatured(curTab, d.items[curIdx]);
      renderList(curTab, curIdx);
    }
  }

  function setTab(tab){
    if(!HL[tab]) return;
    curTab = tab; curIdx = 0;
    const d = HL[tab];
    // els.num.textContent = d.num;
    // els.eyebrow.textContent = d.eyebrow;
    els.title.textContent = d.title;
    // els.desc.textContent = d.desc;
    if(els.topWhat) els.topWhat.textContent = d.title.toLowerCase();
    if(els.nextWhat) els.nextWhat.textContent = d.next;
    // tabs ui
    els.tabs.forEach(b=> b.classList.toggle('active', b.dataset.tab===tab));
    movePill();
    renderFeatured(tab, d.items[0]);
    renderList(tab, 0);
    sizeRunway();
  }

  function movePill(){
    const active = els.tabsWrap.querySelector('.hl2-tab.active');
    if(active && els.pill){
      els.pill.style.left = active.offsetLeft + 'px';
      els.pill.style.width = active.offsetWidth + 'px';
    }
  }

  /* ---------------- SCROLL ENGINE (pin + cycle) ---------------- */
  const mq = window.matchMedia('(max-width:760px)');
  function pinDisabled(){ return reduce || mq.matches; }

  function sizeRunway(){
    const runway = els.runway, panel = els.panel;
    if(!runway || !panel) return;
    if(pinDisabled()){ runway.style.height = ''; return; }
    const n = HL[curTab].items.length;
    const h = Math.max(window.innerHeight * 2.2, panel.offsetHeight + n * window.innerHeight * 0.5);
    runway.style.height = h + 'px';
  }

  function setupScroll(){
    const runway = els.runway, panel = els.panel;
    if(!runway || !panel) return;
    sizeRunway();
    let raf=null;
    function frame(){
      raf=null;
      if(pinDisabled()) return;
      const d = HL[curTab];
      const rect = runway.getBoundingClientRect();
      const travel = runway.offsetHeight - panel.offsetHeight;
      const p = clamp((60 - rect.top) / Math.max(1, travel), 0, 1);
      // scroll indicator
      if(els.indDot) els.indDot.style.top = (p*100) + '%';
      // left steps (thirds)
      const step = p < .34 ? 0 : (p < .7 ? 1 : 2);
      els.steps.forEach((s,i)=> s.classList.toggle('on', i===step));
      // active item from progress
      if(!lockScroll){
        const n = d.items.length;
        const idx = clamp(Math.round(p*(n-1)), 0, n-1);
        if(idx !== curIdx) setFeatured(idx, true);
      }
    }
    function sched(){ if(raf==null) raf=requestAnimationFrame(frame); }
    window.addEventListener('scroll', sched, {passive:true});
    window.addEventListener('resize', ()=>{ sizeRunway(); movePill(); sched(); });
    frame();
  }

  /* ---------------- INIT ---------------- */
  function init(){
    els.panel   = $('hl2Panel');
    els.runway  = $('hl2Runway');
    els.featured= $('hl2Featured');
    els.list    = $('hl2List');
    // els.num     = $('hl2Num');
    // els.eyebrow = $('hl2Eyebrow');
    els.title   = $('hl2Title');
    // els.desc    = $('hl2Desc');
    els.topWhat = $('hl2TopWhat');
    els.nextWhat= $('hl2NextWhat');
    els.pill    = document.querySelector('.hl2-pill');
    els.tabsWrap= document.querySelector('.hl2-tabs');
    els.tabs    = Array.from(document.querySelectorAll('.hl2-tab'));
    els.steps   = Array.from(document.querySelectorAll('.hl2-step'));
    els.indDot  = document.querySelector('.hl2-scrollind .dot');
    if(!els.panel) return;

    setTab('certifications');
    movePill();

    els.tabs.forEach(b=> b.addEventListener('click', ()=>{
      lockScroll = true;
      setTab(b.dataset.tab);
      // briefly release lock so scroll can resume after a pause
      clearTimeout(window.__hlLock);
      window.__hlLock = setTimeout(()=> lockScroll=false, 1200);
    }));

    const bottom = document.querySelector('.hl2-bothint');
    if(bottom) bottom.addEventListener('click', ()=>{
      const order = ['certifications','hackathons','achievements'];
      const nextTab = order[(order.indexOf(curTab)+1)%order.length];
      lockScroll = true; setTab(nextTab);
      clearTimeout(window.__hlLock); window.__hlLock = setTimeout(()=> lockScroll=false, 1200);
    });

    // reveal panel
    const io = new IntersectionObserver((es)=>{
      es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in-view'); io.unobserve(e.target); } });
    },{threshold:.12});
    io.observe(els.panel);

    setupScroll();
  }
  if(document.readyState!=='loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
