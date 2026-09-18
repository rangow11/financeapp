(() => {
  'use strict';

  const pages = Array.from(document.querySelectorAll('.page'));
  const navItems = Array.from(document.querySelectorAll('.nav-item'));
  const viewport = document.getElementById('viewport');
  const themeToggle = document.getElementById('themeToggle');

  // All feature overlays live directly under app-shell, exactly like the
  // Dashboard > مدیریت دسته‌بندی modal. This keeps one independent overlay
  // layer above the bottom navigation and prevents touch/scroll leakage.
  const appShell = document.querySelector('.app-shell');
  if (appShell) {
    document.querySelectorAll('.car-modal, .loan-modal').forEach(modal => {
      if (modal.parentElement !== appShell) appShell.appendChild(modal);
    });
  }

  // Normalize vehicle/loan overlays to the same scroll architecture used by
  // Dashboard > مدیریت دسته‌بندی: the header stays fixed and exactly one
  // dedicated body element performs native touch scrolling. This is done once
  // at startup so old nested overflow rules cannot compete with the new one.
  if (appShell) {
    document.querySelectorAll('.car-modal .car-sheet, .loan-modal .loan-sheet').forEach(sheet => {
      if (sheet.querySelector(':scope > .modal-scroll-body')) return;
      const header = sheet.querySelector(':scope > .sheet-header');
      if (!header) return;
      const body = document.createElement('div');
      body.className = 'modal-scroll-body';
      Array.from(sheet.children).forEach(child => {
        if (child !== header) body.appendChild(child);
      });
      sheet.appendChild(body);
    });
  }

  // This is the single source of truth for navigation.
  // Left -> right: Settings, Calendar, Dashboard, Car, Loan.
  const order = ['settings', 'calendar', 'dashboard', 'car', 'loan'];
  let currentIndex = order.indexOf('dashboard');
  let isAnimating = false;

  function pageFor(name) {
    return document.querySelector(`.page[data-page="${name}"]`);
  }

  function syncSelection() {
    navItems.forEach(item => {
      item.classList.toggle('active', item.dataset.target === order[currentIndex]);
    });
  }

  function goToIndex(nextIndex, direction) {
    if (isAnimating) return;

    // Normalize index for infinite looping.
    nextIndex = (nextIndex + order.length) % order.length;
    if (nextIndex === currentIndex) return;

    const oldPage = pageFor(order[currentIndex]);
    const newPage = pageFor(order[nextIndex]);
    if (!oldPage || !newPage) return;

    // Every tab always opens from its top, even if it was previously scrolled.
    newPage.scrollTop = 0;

    isAnimating = true;

    // direction = 1 means left swipe: new page enters from right -> left.
    // direction = -1 means right swipe: new page enters from left -> right.
    const start = direction > 0 ? 100 : -100;
    const finish = direction > 0 ? -100 : 100;

    // Disable CSS transitions only while positioning the incoming page.
    newPage.classList.add('active');
    newPage.style.transition = 'none';
    newPage.style.opacity = '1';
    newPage.style.transform = `translate3d(${start}%, 0, 0)`;

    oldPage.style.transition = 'transform 360ms cubic-bezier(.22,.8,.25,1), opacity 260ms ease';
    newPage.style.transition = 'transform 360ms cubic-bezier(.22,.8,.25,1), opacity 260ms ease';

    // Force the browser to commit the starting position before moving.
    void newPage.offsetWidth;

    requestAnimationFrame(() => {
      oldPage.style.transform = `translate3d(${finish}%, 0, 0)`;
      oldPage.style.opacity = '0';
      newPage.style.transform = 'translate3d(0, 0, 0)';
    });

    window.setTimeout(() => {
      oldPage.classList.remove('active');
      oldPage.style.transition = '';
      oldPage.style.transform = '';
      oldPage.style.opacity = '';

      newPage.style.transition = '';
      newPage.style.transform = '';
      newPage.style.opacity = '';

      currentIndex = nextIndex;
      syncSelection();
      window.dispatchEvent(new CustomEvent('finance-tab-changed',{detail:{name:order[currentIndex]}}));
      isAnimating = false;
    }, 380);
  }

  function goTo(name) {
    const nextIndex = order.indexOf(name);
    if (nextIndex === -1 || nextIndex === currentIndex || isAnimating) return;

    // For a tap, use the shortest circular direction.
    const forward = (nextIndex - currentIndex + order.length) % order.length;
    const backward = (currentIndex - nextIndex + order.length) % order.length;
    goToIndex(nextIndex, forward <= backward ? 1 : -1);
  }

  navItems.forEach(item => {
    item.addEventListener('click', event => {
      event.preventDefault();
      goTo(item.dataset.target);
    });
  });

  // Horizontal tab swiping is disabled globally. Loan cards keep their own horizontal gesture.

  // Theme.
  const savedTheme = localStorage.getItem('finance-theme');
  if (savedTheme === 'light') document.documentElement.classList.add('light');

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.documentElement.classList.toggle('light');
      localStorage.setItem(
        'finance-theme',
        document.documentElement.classList.contains('light') ? 'light' : 'dark'
      );
    });
  }

  // Service worker.
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }

  syncSelection();
  // The dashboard is the default tab; make its page visible immediately on first load.
  pageFor('dashboard')?.classList.add('active');
})();


/* Jalali calendar */
(()=>{const grid=document.getElementById('calendarGrid');if(!grid)return;
const names=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'],types={payment:'پرداخت',income:'دریافت',installment:'سررسید قسط',reminder:'یادآوری',trade:'خرید/فروش'};
const div=(a,b)=>Math.floor(a/b);
function g2j(gy,gm,gd){let gdm=[0,31,59,90,120,151,181,212,243,273,304,334],gy2=gm>2?gy+1:gy,days=355666+365*gy+div(gy2+3,4)-div(gy2+99,100)+div(gy2+399,400)+gd+gdm[gm-1],jy=-1595+33*div(days,12053);days%=12053;jy+=4*div(days,1461);days%=1461;if(days>365){jy+=div(days-1,365);days=(days-1)%365}let jm=days<186?1+div(days,31):7+div(days-186,30),jd=1+(days<186?days%31:(days-186)%30);return[jy,jm,jd]}
function j2g(jy,jm,jd){let j=jy+1595,days=-355668+365*j+div(j,33)*8+div(j%33+3,4)+jd+(jm<7?(jm-1)*31:(jm-7)*30+186),gy=400*div(days,146097);days%=146097;if(days>36524){gy+=100*div(--days,36524);days%=36524;if(days>=365)days++}gy+=4*div(days,1461);days%=1461;if(days>365){gy+=div(days-1,365);days=(days-1)%365}let gd=days+1,ml=[0,31,(gy%4===0&&gy%100!==0)||gy%400===0?29:28,31,30,31,30,31,31,30,31,30,31],gm=0;while(gd>ml[gm]){gd-=ml[gm];gm++}return[gy,gm,gd]}
const pad=n=>String(n).padStart(2,'0'),key=(y,m,d)=>`${y}-${pad(m)}-${pad(d)}`;
const now=new Date(),tj=g2j(now.getFullYear(),now.getMonth()+1,now.getDate());let y=tj[0],m=tj[1],selected=key(...tj);
let events;function reloadEvents(){try{events=JSON.parse(localStorage.getItem('finance-events')||'[]')}catch{events=[]}}
reloadEvents();
if(!events.length){events=[{date:key(tj[0],tj[1],tj[2]),type:'income',title:'دریافت حقوق',description:'واریز حقوق ماهانه',amount:42000000,source:'درآمد'},{date:key(tj[0],tj[1],Math.min(tj[2]+2,29)),type:'installment',title:'سررسید قسط وام',description:'قسط ماهانه وام خودرو',amount:7600000,source:'وام'},{date:key(tj[0],tj[1],Math.min(tj[2]+5,29)),type:'trade',title:'خرید طلا',description:'خرید برای سرمایه‌گذاری',amount:18500000,source:'سرمایه‌گذاری'},{date:key(tj[0],tj[1],Math.min(tj[2]+8,29)),type:'payment',title:'پرداخت بیمه خودرو',description:'تمدید بیمه‌نامه',amount:3400000,source:'خودرو'},{date:key(tj[0],tj[1],Math.min(tj[2]+10,29)),type:'reminder',title:'یادآوری سرویس خودرو',description:'سرویس دوره‌ای',amount:0,source:'خودرو'}];localStorage.setItem('finance-events',JSON.stringify(events))}
function len(y,m){if(m<7)return 31;if(m<12)return 30;let g=j2g(y,m,30),b=g2j(...g);return b[2]===30?30:29}
function first(y,m){let g=j2g(y,m,1);return(new Date(g[0],g[1]-1,g[2]).getDay()+1)%7}
function renderCal(){document.getElementById('monthTitle').textContent=names[m-1]+' '+y;grid.innerHTML='';for(let i=0;i<first(y,m);i++)grid.appendChild(Object.assign(document.createElement('div'),{className:'day muted'}));for(let d=1;d<=len(y,m);d++){let k=key(y,m,d),b=document.createElement('button');b.className='day'+(k===key(...tj)?' today':'')+(k===selected?' selected':'');b.innerHTML=`<span>${d}</span><span class="event-dots"></span>`;[...new Set(events.filter(e=>e.date===k).map(e=>e.type))].slice(0,4).forEach(t=>{let z=document.createElement('i');z.className='dot '+t;b.querySelector('.event-dots').appendChild(z)});b.onclick=()=>{selected=k;renderCal();let e=events.filter(e=>e.date===k)[0];if(e)open(e)};grid.appendChild(b)}}
let filter='all',sort='date-desc';const list=document.getElementById('eventsList'),search=document.getElementById('eventSearch'),empty=document.getElementById('emptyEvents');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
function renderList(){let q=search.value.trim().toLowerCase(),a=events.filter(e=>(filter==='all'||e.type===filter)&&(!q||`${e.title} ${e.description} ${e.source} ${e.date} ${types[e.type]}`.toLowerCase().includes(q)));a.sort((x,z)=>sort==='amount-desc'?(z.amount||0)-(x.amount||0):sort==='date-asc'?x.date.localeCompare(z.date):z.date.localeCompare(x.date));list.innerHTML='';empty.hidden=!!a.length;a.forEach(e=>{let [yy,mm,dd]=e.date.split('-').map(Number),el=document.createElement('article');el.className='event-item';el.innerHTML=`<div class="event-marker ${e.type}"></div><div class="event-main"><div class="event-title">${esc(e.title)}</div><div class="event-meta">${types[e.type]} · ${esc(e.source||'')} · ${esc(e.description||'')}</div></div><div class="event-value"><div class="event-amount">${e.amount?new Intl.NumberFormat('fa-IR').format(e.amount)+' تومان':'—'}</div><div class="event-date">${dd} ${names[mm-1]} ${yy}</div></div>`;el.onclick=()=>open(e);list.appendChild(el)})}
function open(e){let modal=document.getElementById('eventModal');if(!modal){modal=document.createElement('div');modal.id='eventModal';modal.className='event-modal';modal.innerHTML=`<div class="event-sheet"><div class="sheet-top"><span class="sheet-type" id="sheetType"></span><button class="sheet-close">×</button></div><h3 class="sheet-title" id="sheetTitle"></h3><div id="sheetDetails"></div></div>`;document.body.appendChild(modal);modal.onclick=x=>{if(x.target===modal)close()};modal.querySelector('.sheet-close').onclick=close}modal.querySelector('#sheetType').textContent=types[e.type];modal.querySelector('#sheetTitle').textContent=e.title;modal.querySelector('#sheetDetails').innerHTML=`<div class="detail-row"><span>تاریخ</span><span>${e.date}</span></div><div class="detail-row"><span>مبلغ</span><span>${e.amount?new Intl.NumberFormat('fa-IR').format(e.amount)+' تومان':'—'}</span></div><div class="detail-row"><span>دسته‌بندی</span><span>${esc(e.source||'—')}</span></div><div class="detail-row"><span>توضیحات</span><span>${esc(e.description||'—')}</span></div>`;modal.classList.add('open')}
function close(){document.getElementById('eventModal')?.classList.remove('open')}
document.getElementById('prevMonth').onclick=()=>{m--;if(m<1){m=12;y--}renderCal()};document.getElementById('nextMonth').onclick=()=>{m++;if(m>12){m=1;y++}renderCal()};document.getElementById('todayBtn').onclick=()=>{y=tj[0];m=tj[1];selected=key(...tj);renderCal();renderList()};search.oninput=renderList;document.getElementById('filterToggle').onclick=()=>document.getElementById('filters').classList.toggle('closed');
document.querySelectorAll('[data-filter]').forEach(c=>c.onclick=()=>{filter=c.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x===c));renderList()});window.addEventListener('finance-events-updated',()=>{reloadEvents();renderCal();renderList()});document.querySelectorAll('[data-sort]').forEach(c=>c.onclick=()=>{sort=c.dataset.sort;document.querySelectorAll('[data-sort]').forEach(x=>x.classList.toggle('active',x===c));renderList()});renderCal();renderList()})();


/* Loan manager */
(()=>{
  const list=document.getElementById('loansList'); if(!list)return;
  const empty=document.getElementById('loanEmpty'), summary=document.getElementById('loanSummary');
  const fmt=n=>new Intl.NumberFormat('fa-IR').format(Math.round(Number(n)||0));
  const money=n=>fmt(n)+' تومان';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const toNum=s=>{const v=String(s??'').replace(/[۰-۹]/g,d=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g,d=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[,٬\s]/g,'');return Number(v)||0};
  const g2jDate=d=>{if(!d)return'—';const x=new Date(d+'T12:00:00');if(Number.isNaN(x.getTime()))return d;let gy=x.getFullYear(),gm=x.getMonth()+1,gd=x.getDate(),gdm=[0,31,59,90,120,151,181,212,243,273,304,334],gy2=gm>2?gy+1:gy,div=(a,b)=>Math.floor(a/b),days=355666+365*gy+div(gy2+3,4)-div(gy2+99,100)+div(gy2+399,400)+gd+gdm[gm-1],jy=-1595+33*div(days,12053);days%=12053;jy+=4*div(days,1461);days%=1461;if(days>365){jy+=div(days-1,365);days=(days-1)%365}let jm=days<186?1+div(days,31):7+div(days-186,30),jd=1+(days<186?days%31:(days-186)%30);return `${fmt(jd)} ${['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'][jm-1]}`};
  const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
  let loans=[];try{loans=JSON.parse(localStorage.getItem('finance-loans')||'[]')}catch{loans=[]}
  function persist(){localStorage.setItem('finance-loans',JSON.stringify(loans));}
  function activeLoans(){return loans.filter(x=>x.active!==false)}
  function progress(l){return Math.max(0,Math.min(100,(Number(l.paid)||0)/(Number(l.count)||1)*100))}
  function copy(text){if(!text)return;if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text).catch(()=>{});else{const t=document.createElement('textarea');t.value=text;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove()}}
  function renderSummary(){const a=activeLoans(), total=a.reduce((s,x)=>s+toNum(x.total),0), overdue=a.reduce((s,x)=>s+toNum(x.overdueAmount),0), monthly=a.reduce((s,x)=>s+toNum(x.installment),0);summary.innerHTML=`<div><span>وام فعال</span><b>${fmt(a.length)}</b></div><div><span>مجموع وام</span><b>${money(total)}</b></div><div><span>مجموع قسط‌های این ماه</span><b>${money(monthly)}</b></div><div><span>مجموع معوقه</span><b>${money(overdue)}</b></div>`;}
  function actionHtml(l){return `<div class="loan-actions" data-actions="${l.id}" aria-label="عملیات وام"><button class="loan-act edit" data-act="edit" title="ویرایش" aria-label="ویرایش"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m4 16.8-.7 3.8 3.8-.7L18.5 8.5a2.1 2.1 0 0 1-3-3L4 16.8Z" stroke="currentColor" stroke-width="1.7"/><path d="m14.5 7.5 2 2" stroke="currentColor" stroke-width="1.7"/></svg></button><button class="loan-act note" data-act="note" title="یادداشت" aria-label="یادداشت"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 4.8h12a1.5 1.5 0 0 1 1.5 1.5v9.9L15 20H6A1.5 1.5 0 0 1 4.5 18.5v-12A1.5 1.5 0 0 1 6 4.8Z" stroke="currentColor" stroke-width="1.7"/><path d="M8 9h8M8 13h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></button><button class="loan-act delete" data-act="delete" title="حذف" aria-label="حذف"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 7h14M9 7V4.8h6V7M8 10v7M12 10v7M16 10v7M6.5 7l.7 13h9.6l.7-13" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>`}
  // Loan-local Jalali date helpers. Do not depend on the Car manager's private scope.
  function jToday(){
    const d=new Date();
    const [jy,jm,jd]=g2jParts(d.getFullYear(),d.getMonth()+1,d.getDate());
    return `${jy}-${String(jm).padStart(2,'0')}-${String(jd).padStart(2,'0')}`;
  }
  function jText(v){
    if(!v)return '—';
    const [y,m,d]=String(v).split('-').map(Number);
    const months=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
    return Number.isFinite(y)&&Number.isFinite(m)&&Number.isFinite(d) ? `${fmt(d)} ${months[m-1]||''} ${fmt(y)}` : String(v);
  }
  function localToday(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
  function dueInfo(l){const overdueCount=Math.max(0,Number(l.overdueCount)||0);if(overdueCount>0){const days=l.nextDue?Math.round((new Date(l.nextDue+'T12:00:00')-new Date(localToday()+'T12:00:00'))/86400000):null;return{status:'overdue',days,label:`${fmt(overdueCount)} قسط معوقه`}}if(!l.nextDue)return{status:'ok',days:null,label:'سررسید ثبت نشده'};const today=new Date(localToday()+'T12:00:00'),due=new Date(l.nextDue+'T12:00:00'),days=Math.round((due-today)/86400000);if(days<=0)return{status:'overdue',days,label:days===0?'سررسید امروز':`${fmt(Math.abs(days))} روز گذشته`};if(days<=3)return{status:'soon',days,label:`${fmt(days)} روز تا سررسید`};return{status:'ok',days,label:'سررسید در موعد'}}
  let loanStatusFilter='all';
  let loanSortMode='due';

  function sortLoans(a,b){
    const da=dueInfo(a),db=dueInfo(b);
    if(loanSortMode==='installmentDesc') return toNum(b.installment)-toNum(a.installment);
    if(loanSortMode==='installmentAsc') return toNum(a.installment)-toNum(b.installment);
    if(loanSortMode==='totalDesc') return toNum(b.total)-toNum(a.total);
    if(loanSortMode==='totalAsc') return toNum(a.total)-toNum(b.total);
    if(loanSortMode==='overdueDesc') return toNum(b.overdueAmount)-toNum(a.overdueAmount) || toNum(b.overdueCount)-toNum(a.overdueCount);
    if(loanSortMode==='paidDesc') return toNum(b.paid)-toNum(a.paid);
    if(da.days===null)return 1;
    if(db.days===null)return -1;
    return da.days-db.days;
  }

  function filteredLoans(){
    return activeLoans().filter(l=>{
      if(loanStatusFilter==='all')return true;
      return dueInfo(l).status===loanStatusFilter;
    });
  }

  function updateLoanBadge(a){
    const badge=document.getElementById('loanNavBadge');
    if(!badge)return;
    const n=a.filter(l=>dueInfo(l).status==='overdue').length;
    badge.hidden=!n;
    badge.textContent=n>9?'۹+':fmt(n);
  }

  function render(){
    const a=filteredLoans().slice().sort(sortLoans);
    const allActive=activeLoans();
    renderSummary();
    updateLoanBadge(allActive);

    const countEl=document.getElementById('loanViewCount');
    if(countEl){
      countEl.textContent=a.length===allActive.length
        ? `${fmt(a.length)} وام فعال`
        : `${fmt(a.length)} وام از ${fmt(allActive.length)} وام فعال`;
    }

    list.innerHTML='';
    empty.hidden=!!a.length;

    if(!a.length){
      list.innerHTML='<div class="loan-filter-empty">برای این فیلتر وام فعالی پیدا نشد.</div>';
      checkLoanNotifications(allActive);
      return;
    }

    a.forEach(l=>{
      const p=progress(l),info=dueInfo(l),wrap=document.createElement('div');
      wrap.className=`loan-swipe due-${info.status}`;
      wrap.dataset.id=l.id;
      wrap.innerHTML=actionHtml(l)+`<article class="loan-card"><div class="loan-card-status"><button class="loan-paid-btn" data-act="paid" ${Number(l.count||0)>0&&Number(l.paid||0)>=Number(l.count||0)?'disabled':''}>✓ پرداخت شد</button><div class="loan-card-names"><span class="loan-bank">${esc(l.bank)}</span><i class="name-divider" aria-hidden="true"></i><h3>${esc(l.borrower)}</h3></div><div class="loan-status-info"><span>${info.status==='overdue'?'معوقه':info.status==='soon'?'نزدیک به سررسید':'در موعد'}</span><small>${info.label}</small></div><button class="details-btn" data-act="details" title="جزئیات" aria-label="جزئیات"></button></div><div class="loan-card-top"><div class="loan-main-stats"><div><span>قسط ماهانه</span><b>${money(l.installment)}</b></div></div><div class="loan-main-stats"><div><span>سررسید بعدی</span><b>${g2jDate(l.nextDue)}</b></div></div></div><div class="loan-bottom"><div class="loan-overdue-row"><span>معوقه <b>${fmt(l.overdueCount||0)} قسط</b></span><strong>${money(l.overdueAmount||0)}</strong></div><div class="loan-progress"><div style="width:${p}%"></div></div><div class="loan-progress-meta"><span>${fmt(p)}٪ پرداخت شده</span><span>${fmt(l.paid||0)} از ${fmt(l.count||0)} قسط</span></div></div></article>`;
      list.appendChild(wrap);
      bindSwipe(wrap);
    });
    checkLoanNotifications(allActive);
  }
  function bindSwipe(wrap){
    let startX=0,startY=0,drag=false,open=false;
    const card=wrap.querySelector('.loan-card'),actions=wrap.querySelector('.loan-actions');
    const width=()=>Math.min(150,Math.max(138,actions.offsetWidth||150));
    function set(x,animate=true){card.style.transition=animate?'transform .42s cubic-bezier(.22,.75,.25,1)':'none';card.style.transform=`translate3d(${x}px,0,0)`;open=x<0;actions.classList.toggle('visible',open);actions.setAttribute('aria-hidden',String(!open))}
    function close(){set(0,true)}
    function finish(dx){set(dx<-45?-width():0,true)}
    card.addEventListener('touchstart',e=>{if(e.touches.length!==1)return;startX=e.touches[0].clientX;startY=e.touches[0].clientY;drag=true},{passive:true});
    card.addEventListener('touchmove',e=>{if(!drag)return;const x=e.touches[0].clientX-startX,y=e.touches[0].clientY-startY;if(Math.abs(y)>Math.abs(x)*1.05){drag=false;return}if(Math.abs(x)>8){e.preventDefault();const cur=open?-width():0;set(Math.max(-width(),Math.min(0,cur+x)),false)}},{passive:false});
    card.addEventListener('touchend',e=>{if(!drag)return;drag=false;finish(e.changedTouches[0].clientX-startX)});
    card.addEventListener('click',e=>{if(Math.abs(e.clientX-startX)>15)return;const b=e.target.closest('button');if(b){handleAction(wrap.dataset.id,b.dataset.act);return}if(open)close()});
    let down=false;
    card.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')return;down=true;startX=e.clientX;startY=e.clientY});
    card.addEventListener('pointerup',e=>{if(!down)return;down=false;const dx=e.clientX-startX,dy=e.clientY-startY;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.05)finish(dx)});
    actions.addEventListener('click',e=>{const b=e.target.closest('button');if(b){e.stopPropagation();handleAction(wrap.dataset.id,b.dataset.act);close()}});
  }
  function get(id){return loans.find(x=>String(x.id)===String(id))}
  function jalaliMonthKey(y,m){return `${y}-${String(m).padStart(2,'0')}`;}
  function jalaliMonthTitle(key){const [y,m]=key.split('-').map(Number);return `${fmt(m)} ${['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'][m-1]} ${fmt(y)}`;}
  function shiftJalaliMonth(y,m,delta){let n=(y*12+(m-1))+delta,ny=Math.floor(n/12),nm=((n%12)+12)%12+1;return [ny,nm];}
  function g2jParts(gy,gm,gd){const gdm=[0,31,59,90,120,151,181,212,243,273,304,334],gy2=gm>2?gy+1:gy,div=(a,b)=>Math.floor(a/b);let days=355666+365*gy+div(gy2+3,4)-div(gy2+99,100)+div(gy2+399,400)+gd+gdm[gm-1],jy=-1595+33*div(days,12053);days%=12053;jy+=4*div(days,1461);days%=1461;if(days>365){jy+=div(days-1,365);days=(days-1)%365}return[jy,days<186?1+div(days,31):7+div(days-186,30),1+(days<186?days%31:(days-186)%30)]}
  function j2gParts(jy,jm,jd){const div=(a,b)=>Math.floor(a/b),j=jy+1595;let days=-355668+365*j+div(j,33)*8+div(j%33+3,4)+jd+(jm<7?(jm-1)*31:(jm-7)*30+186),gy=400*div(days,146097);days%=146097;if(days>36524){gy+=100*div(--days,36524);days%=36524;if(days>=365)days++}gy+=4*div(days,1461);days%=1461;if(days>365){gy+=div(days-1,365);days=(days-1)%365}let gd=days+1,ml=[31,(gy%4===0&&gy%100!==0)||gy%400===0?29:28,31,30,31,30,31,31,30,31,30,31],gm=0;while(gd>ml[gm]){gd-=ml[gm++]}return[gy,gm+1,gd]}
  function monthKeyFromDate(date){if(!date)return'';const d=new Date(date+'T12:00:00');if(Number.isNaN(d.getTime()))return'';const j=g2jParts(d.getFullYear(),d.getMonth()+1,d.getDate());return jalaliMonthKey(j[0],j[1]);}
  function openPaidModal(l){payingLoan=l;$('loanPaidModalTitle').textContent=`ثبت پرداخت · ${l.bank}`;$('loanPaidMonthHint').textContent=`قسط ماهانه: ${money(l.installment)} · معوقه فعلی: ${money(l.overdueAmount||0)}`;$('loanPaymentAmount').value='';openModal(paidModal);setTimeout(()=>$('loanPaymentAmount')?.focus(),120)}
  function advanceNextDue(l,count){let date=l.nextDue||localToday();for(let i=0;i<count;i++){const base=new Date(date+'T12:00:00');const j=g2jParts(base.getFullYear(),base.getMonth()+1,base.getDate()),[ny,nm]=shiftJalaliMonth(j[0],j[1],1),day=Math.min(j[2],nm<7?31:30),g=j2gParts(ny,nm,day);date=`${g[0]}-${String(g[1]).padStart(2,'0')}-${String(g[2]).padStart(2,'0')}`}l.nextDue=date}
  let payingLoan=null;
  let paymentSubmitting=false;

  function confirmPaid(){
    if(paymentSubmitting || !payingLoan)return;

    const loan=payingLoan;
    const input=$('loanPaymentAmount');
    const confirmBtn=$('loanPaidConfirm');
    const amount=toNum(input?.value);
    if(amount<=0){
      alert('مبلغ پرداختی را وارد کن.');
      input?.focus();
      return;
    }

    const installment=Math.max(0,toNum(loan.installment));
    const totalCount=Math.max(0,Number(loan.count)||0);
    const paidBefore=Math.max(0,Number(loan.paid)||0);
    const overdueBefore=Math.max(0,Number(loan.overdueCount)||0);
    const overdueAmountBefore=Math.max(0,toNum(loan.overdueAmount));
    const partialBefore=Math.max(0,toNum(loan.currentInstallmentPaid));

    if(!installment){
      alert('مبلغ قسط این وام ثبت نشده است. ابتدا اطلاعات وام را اصلاح کن.');
      return;
    }
    if(totalCount>0 && paidBefore>=totalCount){
      alert('تمام اقساط این وام قبلاً پرداخت شده‌اند.');
      closeModal(paidModal);
      payingLoan=null;
      render();
      return;
    }

    paymentSubmitting=true;
    if(confirmBtn)confirmBtn.disabled=true;

    try{
      // A payment is one atomic operation. Calculate the complete new state first,
      // then persist it once, then render once. This prevents partial UI/data updates.
      const remainingBefore=totalCount>0?Math.max(0,totalCount-paidBefore):Infinity;
      let fullInstallments=Math.floor(amount/installment);
      let remainder=amount-(fullInstallments*installment);

      // Carry a previously recorded partial payment into the current payment.
      const combinedPartial=partialBefore+remainder;
      const extraFromPartial=Math.floor((combinedPartial+1e-9)/installment);
      fullInstallments+=extraFromPartial;
      let newPartial=combinedPartial-(extraFromPartial*installment);

      fullInstallments=Math.max(0,Math.min(fullInstallments,remainingBefore));

      // If the loan has no remaining installments, never manufacture extra paid installments.
      if(totalCount>0 && paidBefore+fullInstallments>=totalCount){
        fullInstallments=remainingBefore;
        newPartial=0;
      }

      const overduePaid=Math.min(overdueBefore,fullInstallments);
      const currentPaid=Math.max(0,fullInstallments-overduePaid);
      const newOverdueCount=Math.max(0,overdueBefore-overduePaid);

      // Partial payments must reduce the overdue money too. Full overdue installments
      // reduce it by installment amount; any leftover amount reduces the remaining overdue.
      let newOverdueAmount=Math.max(0,overdueAmountBefore-(amount));
      if(newOverdueCount===0)newOverdueAmount=0;
      else if(overdueAmountBefore<=0)newOverdueAmount=newOverdueCount*installment;

      loan.overdueCount=newOverdueCount;
      loan.overdueAmount=newOverdueAmount;
      loan.paid=Math.min(totalCount>0?totalCount:paidBefore+fullInstallments,paidBefore+fullInstallments);
      loan.currentInstallmentPaid=Math.max(0,newPartial);

      if(fullInstallments>0)advanceNextDue(loan,fullInstallments);

      if(totalCount>0 && loan.paid>=totalCount){
        loan.paid=totalCount;
        loan.currentInstallmentPaid=0;
        loan.overdueCount=0;
        loan.overdueAmount=0;
      }

      const tx=Array.isArray(loan.transactions)?loan.transactions.slice():[];
      const stateBefore={paid:paidBefore,currentInstallmentPaid:partialBefore,overdueCount:overdueBefore,overdueAmount:overdueAmountBefore,nextDue:loan.nextDue||''};
      const txItem={id:uid(),type:'payment',amount,date:jToday(),description:fullInstallments?`پرداخت ${fullInstallments} قسط`:'پرداخت بخشی از قسط',installmentCount:fullInstallments,overdueApplied:overduePaid,createdAt:Date.now(),stateBefore};
      txItem.stateAfter={paid:loan.paid,currentInstallmentPaid:loan.currentInstallmentPaid,overdueCount:loan.overdueCount,overdueAmount:loan.overdueAmount,nextDue:loan.nextDue||''};
      tx.push(txItem); loan.transactions=tx;
      if(!loan.transactionBaseState) loan.transactionBaseState={...stateBefore};

      // Persist the loan state first. Calendar sync is secondary and must never
      // prevent the loan card from updating.
      persist();
      try{ addCalendarEvent(loan); }catch(calendarError){ console.warn('Loan calendar sync failed:',calendarError); }

      closeModal(paidModal);
      payingLoan=null;
      render();
    }catch(error){
      console.error('Loan payment failed:',error);
      alert(`ثبت پرداخت انجام نشد.\n${error?.message||error}`);
    }finally{
      paymentSubmitting=false;
      if(confirmBtn)confirmBtn.disabled=false;
    }
  }

  function handleAction(id,act){const l=get(id);if(!l)return;if(act==='edit'){openForm(l);return}if(act==='note'){openNote(l);return}if(act==='paid'){openPaidModal(l);return}if(act==='delete'){if(!confirm(`وام «${l.bank}» حذف شود؟`))return;loans=loans.filter(x=>x.id!==id);persist();try{let events=JSON.parse(localStorage.getItem('finance-events')||'[]');events=events.filter(e=>e.loanId!==id);localStorage.setItem('finance-events',JSON.stringify(events))}catch{}render();return}if(act==='details')openDetails(l)}
  async function enableLoanNotifications(){if(!('Notification' in window)){alert('مرورگر این دستگاه از اعلان پشتیبانی نمی‌کند.');return false}if(Notification.permission==='granted')return true;if(Notification.permission==='denied'){alert('اعلان‌ها برای این سایت مسدود شده‌اند. از تنظیمات مرورگر اجازه اعلان را فعال کن.');return false}try{return(await Notification.requestPermission())==='granted'}catch{return false}}
  function checkLoanNotifications(a){if(!('Notification' in window)||Notification.permission!=='granted')return;const today=localToday();a.forEach(l=>{const info=dueInfo(l);if(info.status==='ok')return;const key=`finance-loan-notified-${l.id}`;if(localStorage.getItem(key)===today)return;const title=info.status==='overdue'?`قسط وام ${l.bank} معوق شده`:`سررسید وام ${l.bank} نزدیک است`;const body=`${info.label} · مبلغ قسط ${money(l.installment)}`;if(navigator.serviceWorker?.controller)navigator.serviceWorker.controller.postMessage({type:'loan-notification',title,body,loanId:l.id});else new Notification(title,{body,tag:`loan-${l.id}`});localStorage.setItem(key,today)})}
  document.getElementById('loanNotifyBtn')?.addEventListener('click',async()=>{const ok=await enableLoanNotifications();if(ok){checkLoanNotifications(activeLoans());alert('اعلان وام‌ها فعال شد.')}});
  const formModal=document.getElementById('loanFormModal'), form=document.getElementById('loanForm');
  const fields=['loanId','loanBank','loanBorrower','loanTotal','loanInstallment','loanCount','loanPaid','loanNextDue','loanOverdueCount','loanOverdueAmount','loanRate','loanTerm','loanCard','loanIban','loanAccount','loanNotes','showCard','showIban','showAccount','loanActive'];
  const $=id=>document.getElementById(id);
  const paidModal=$('loanPaidModal');
  function openModal(m){m.classList.add('open');m.setAttribute('aria-hidden','false')};function closeModal(m){m.classList.remove('open');m.setAttribute('aria-hidden','true')}
  function openForm(l=null){
    form.reset();
    $('loanFormTitle').textContent=l?'ویرایش وام':'وام جدید';
    $('loanFormKicker').textContent=l?'ویرایش اطلاعات':'ثبت اطلاعات';

    // در حالت ویرایش، تمام اطلاعات همان وام مستقیماً داخل فیلدها قرار می‌گیرد.
    // این بخش عمداً صریح است تا reset فرم یا تغییر نام فیلدها باعث خالی ماندن اطلاعات نشود.
    if(l){
      $('loanId').value=String(l.id??'');
      $('loanBank').value=l.bank??'';
      $('loanBorrower').value=l.borrower??'';
      $('loanTotal').value=l.total!=null?fmt(toNum(l.total)):'';
      $('loanInstallment').value=l.installment!=null?fmt(toNum(l.installment)):'';
      $('loanCount').value=l.count!=null?String(l.count):'';
      $('loanPaid').value=l.paid!=null?String(l.paid):'0';
      $('loanNextDue').value=l.nextDue??'';
      $('loanNextDueDisplay').value=l.nextDue?g2jDate(l.nextDue):'';
      $('loanOverdueCount').value=l.overdueCount!=null?String(l.overdueCount):'0';
      $('loanOverdueAmount').value=l.overdueAmount!=null?fmt(toNum(l.overdueAmount)):'';
      $('loanRate').value=l.rate??'';
      $('loanTerm').value=l.term??'';
      $('loanCard').value=l.card??'';
      $('loanIban').value=l.iban??'';
      $('loanAccount').value=l.account??'';
      $('loanNotes').value=l.notes??'';
    }else{
      $('loanId').value='';
      $('loanNextDue').value='';
      $('loanNextDueDisplay').value='';
    }

    $('showCard').checked=l?l.showCard!==false:true;
    $('showIban').checked=l?l.showIban!==false:true;
    $('showAccount').checked=l?l.showAccount!==false:true;
    $('loanActive').checked=l?l.active!==false:true;
    openModal(formModal);
    setTimeout(()=>$('loanBank').focus(),120);
  }
  function addCalendarEvent(l){let events=[];try{events=JSON.parse(localStorage.getItem('finance-events')||'[]')}catch{events=[]}events=events.filter(e=>!(e.source==='وام'&&e.loanId===l.id));if(l.nextDue){events.push({date:(()=>{const d=new Date(l.nextDue+'T12:00:00');const gy=d.getFullYear(),gm=d.getMonth()+1,gd=d.getDate(),gdm=[0,31,59,90,120,151,181,212,243,273,304,334],div=(a,b)=>Math.floor(a/b),gy2=gm>2?gy+1:gy,days=355666+365*gy+div(gy2+3,4)-div(gy2+99,100)+div(gy2+399,400)+gd+gdm[gm-1];let jy=-1595+33*div(days,12053),r=days%12053;jy+=4*div(r,1461);r%=1461;if(r>365){jy+=div(r-1,365);r=(r-1)%365}let jm=r<186?1+div(r,31):7+div(r-186,30),jd=1+(r<186?r%31:(r-186)%30);return `${jy}-${String(jm).padStart(2,'0')}-${String(jd).padStart(2,'0')}`})(),type:'installment',title:`سررسید قسط ${l.bank}`,description:`قسط ${l.borrower}`,amount:toNum(l.installment),source:'وام',loanId:l.id})}localStorage.setItem('finance-events',JSON.stringify(events))}
  form.addEventListener('submit',e=>{e.preventDefault();if(!$('loanNextDue').value){alert('لطفاً سررسید بعدی را انتخاب کن.');openJPicker();return}const id=$('loanId').value||uid(), old=get(id), l={id,bank:$('loanBank').value.trim(),borrower:$('loanBorrower').value.trim(),total:toNum($('loanTotal').value),installment:toNum($('loanInstallment').value),count:Math.max(0,toNum($('loanCount').value)),paid:Math.max(0,toNum($('loanPaid').value)),nextDue:$('loanNextDue').value,overdueCount:Math.max(0,toNum($('loanOverdueCount').value)),overdueAmount:toNum($('loanOverdueAmount').value),rate:$('loanRate').value,term:$('loanTerm').value.trim(),card:$('loanCard').value.trim(),iban:$('loanIban').value.trim(),account:$('loanAccount').value.trim(),showCard:$('showCard').checked,showIban:$('showIban').checked,showAccount:$('showAccount').checked,notes:$('loanNotes').value.trim(),active:$('loanActive').checked,createdAt:old?.createdAt||Date.now()};const i=loans.findIndex(x=>x.id===id);if(i>=0)loans[i]=l;else loans.unshift(l);persist();addCalendarEvent(l);closeModal(formModal);render()});
  function loanTransactionsHtml(l){
    const tx=[...(Array.isArray(l.transactions)?l.transactions:[])].filter(x=>x.type==='payment').sort((a,b)=>Number(b.createdAt||0)-Number(a.createdAt||0));
    const total=tx.reduce((sum,x)=>sum+toNum(x.amount),0);
    return `<div class="loan-tx-summary"><div><span>مجموع پرداخت‌ها</span><b>${money(total)}</b></div><div><span>تعداد تراکنش</span><b>${fmt(tx.length)}</b></div></div><div class="loan-tx-list">${tx.length?tx.map(x=>`<div class="loan-tx-row" data-tx-id="${esc(x.id)}"><div class="loan-tx-icon">✓</div><div class="loan-tx-main"><b>پرداخت وام</b><span>${jText(x.date)} · ${esc(x.description||'پرداخت')}</span></div><strong>${money(x.amount)}</strong><div class="loan-tx-actions"><button type="button" data-tx-action="edit" title="ویرایش">✎</button><button type="button" data-tx-action="delete" title="حذف">×</button></div></div>`).join(''):'<div class="detail-empty">هنوز پرداختی برای این وام ثبت نشده است.</div>'}</div>`;
  }
  function snapshotLoanState(l){return {paid:Number(l.paid)||0,currentInstallmentPaid:toNum(l.currentInstallmentPaid),overdueCount:Number(l.overdueCount)||0,overdueAmount:toNum(l.overdueAmount),nextDue:l.nextDue||''};}
  function applyPaymentFromState(state,amount,installment,totalCount){
    const before={...state}; const remaining=totalCount>0?Math.max(0,totalCount-before.paid):Infinity;
    let full=Math.floor(amount/installment), remainder=amount-full*installment;
    const combined=before.currentInstallmentPaid+remainder, extra=Math.floor((combined+1e-9)/installment); full+=extra; let partial=combined-extra*installment;
    full=Math.max(0,Math.min(full,remaining)); if(totalCount>0&&before.paid+full>=totalCount){full=remaining;partial=0}
    const overduePaid=Math.min(before.overdueCount,full), overdueCount=Math.max(0,before.overdueCount-overduePaid);
    let overdueAmount=Math.max(0,before.overdueAmount-amount); if(overdueCount===0)overdueAmount=0; else if(before.overdueAmount<=0)overdueAmount=overdueCount*installment;
    const next={...before,paid:Math.min(totalCount>0?totalCount:before.paid+full,before.paid+full),currentInstallmentPaid:Math.max(0,partial),overdueCount,overdueAmount};
    if(full>0){const temp={nextDue:before.nextDue||localToday()};advanceNextDue(temp,full);next.nextDue=temp.nextDue}
    if(totalCount>0&&next.paid>=totalCount){next.paid=totalCount;next.currentInstallmentPaid=0;next.overdueCount=0;next.overdueAmount=0}
    return {state:next,installmentCount:full,overdueApplied:overduePaid};
  }
  function rebuildLoanFromTransactions(l,transactions){
    const txs=[...(transactions||[])].filter(x=>x.type==='payment').sort((a,b)=>Number(a.createdAt||0)-Number(b.createdAt||0));
    let base=l.transactionBaseState; if(!base&&txs[0]?.stateBefore)base={...txs[0].stateBefore};
    if(!base){base=snapshotLoanState(l);const full=txs.reduce((n,x)=>n+(Number(x.installmentCount)||0),0);base.paid=Math.max(0,base.paid-full);base.overdueCount=Math.max(0,base.overdueCount-txs.reduce((n,x)=>n+(Number(x.overdueApplied)||0),0));base.overdueAmount=Math.max(0,base.overdueAmount+txs.reduce((n,x)=>n+toNum(x.amount),0));}
    let state={...base}; const installment=Math.max(1,toNum(l.installment)),count=Math.max(0,Number(l.count)||0);
    for(const x of txs){const r=applyPaymentFromState(state,toNum(x.amount),installment,count);x.installmentCount=r.installmentCount;x.overdueApplied=r.overdueApplied;x.stateBefore={...state};state=r.state;x.stateAfter={...state}}
    Object.assign(l,state);l.transactions=transactions||[];l.transactionBaseState={...base};
  }
  function editLoanTransaction(l,txId){const tx=(l.transactions||[]).find(x=>String(x.id)===String(txId));if(!tx)return;const raw=prompt('مبلغ جدید تراکنش را به تومان وارد کن:',String(tx.amount||''));if(raw===null)return;const amount=toNum(raw);if(amount<=0){alert('مبلغ معتبر نیست.');return}tx.amount=amount;tx.description='ویرایش پرداخت';tx.editedAt=Date.now();rebuildLoanFromTransactions(l,l.transactions);persist();try{addCalendarEvent(l)}catch{}render();openDetails(l,'transactions')}
  function deleteLoanTransaction(l,txId){const tx=(l.transactions||[]).find(x=>String(x.id)===String(txId));if(!tx)return;if(!confirm(`تراکنش ${money(tx.amount)} حذف شود؟\nوضعیت وام هم بر اساس تراکنش‌های باقی‌مانده محاسبه می‌شود.`))return;l.transactions=l.transactions.filter(x=>String(x.id)!==String(txId));rebuildLoanFromTransactions(l,l.transactions);persist();try{addCalendarEvent(l)}catch{}render();openDetails(l,'transactions')}
  function openDetails(l,activeTab='overview'){
    $('detailLoanTitle').textContent=l.bank;
    const p=progress(l);
    const pay=(label,val,copyable=false,show=true)=>!show?'':`<div class="loan-detail-row"><span>${label}</span><strong>${esc(val||'—')}</strong>${copyable&&val?`<button class="mini-copy" data-copy="${esc(val)}">کپی</button>`:''}</div>`;
    const tabs=`<div class="loan-detail-tabs"><button class="${activeTab==='overview'?'active':''}" data-loan-tab="overview">خلاصه</button><button class="${activeTab==='transactions'?'active':''}" data-loan-tab="transactions">تراکنش‌ها</button></div>`;
    let content='';
    if(activeTab==='transactions'){
      content=loanTransactionsHtml(l);
    }else{
      content=`<div class="detail-progress"><div><b>${fmt(p)}٪</b><span>پیشرفت پرداخت</span></div><div class="big-progress"><i style="width:${p}%"></i></div></div><div class="detail-grid">${pay('نام وام‌گیرنده',l.borrower)}${pay('مبلغ کل وام',money(l.total))}${pay('مبلغ هر قسط',money(l.installment))}${pay('تعداد کل اقساط',fmt(l.count))}${pay('اقساط پرداخت‌شده',fmt(l.paid))}${pay('اقساط باقی‌مانده',fmt(Math.max(0,l.count-l.paid)))}${pay('مبلغ پرداختی به قسط جاری',money(l.currentInstallmentPaid||0))}${pay('سررسید بعدی',g2jDate(l.nextDue))}${pay('اقساط معوقه',fmt(l.overdueCount))}${pay('مبلغ معوقه',money(l.overdueAmount))}${pay('نرخ سود سالانه',l.rate?esc(l.rate)+'٪':'—')}${pay('مدت وام',l.term||'—')}</div><div class="payment-details"><h3>اطلاعات پرداخت</h3>${pay('شماره کارت',l.card,true,l.showCard)}${pay('شماره شبا',l.iban,true,l.showIban)}${pay('شماره حساب',l.account,true,l.showAccount)}</div><div class="loan-notes"><h3>یادداشت</h3><p>${esc(l.notes||'یادداشتی ثبت نشده است.')}</p></div>`;
    }
    $('loanDetailsBody').innerHTML=tabs+content;
    $('loanDetailsBody').querySelectorAll('.mini-copy').forEach(b=>b.onclick=()=>{copy(b.dataset.copy);b.textContent='کپی شد';setTimeout(()=>b.textContent='کپی',1000)});
    $('loanDetailsBody').querySelectorAll('[data-loan-tab]').forEach(b=>b.onclick=()=>openDetails(l,b.dataset.loanTab));
    $('loanDetailsBody').querySelectorAll('[data-tx-action]').forEach(b=>b.onclick=e=>{e.stopPropagation();const row=b.closest('[data-tx-id]');if(!row)return;const act=b.dataset.txAction;act==='edit'?editLoanTransaction(l,row.dataset.txId):deleteLoanTransaction(l,row.dataset.txId)});
    openModal($('loanDetailModal'));
  }
  let noteLoan=null;function openNote(l){noteLoan=l;$('noteLoanTitle').textContent=l.bank;$('noteInput').value=l.notes||'';openModal($('loanNoteModal'));setTimeout(()=>$('noteInput').focus(),120)}$('noteSave').onclick=()=>{if(!noteLoan)return;noteLoan.notes=$('noteInput').value.trim();persist();closeModal($('loanNoteModal'));render()};$('noteCancel').onclick=()=>closeModal($('loanNoteModal'));
  $('addLoanBtn').onclick=()=>openForm();$('loanEmptyAdd').onclick=()=>openForm();$('loanFormClose').onclick=()=>closeModal(formModal);$('loanCancel').onclick=()=>closeModal(formModal);$('loanDetailClose').onclick=()=>closeModal($('loanDetailModal'));$('loanNoteClose').onclick=()=>closeModal($('loanNoteModal'));$('loanPaidClose').onclick=()=>{closeModal(paidModal);payingLoan=null};$('loanPaidCancel').onclick=()=>{closeModal(paidModal);payingLoan=null};$('loanPaidConfirm').onclick=confirmPaid;
  document.querySelectorAll('.loan-modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)closeModal(m)}));
  // Loan list filter / sort controls.
  const loanStatusSelect=document.getElementById('loanStatusFilter');
  const loanSortSelect=document.getElementById('loanSort');
  loanStatusSelect?.addEventListener('change',e=>{loanStatusFilter=e.target.value;render()});
  loanSortSelect?.addEventListener('change',e=>{loanSortMode=e.target.value;render()});

  // Calculator
  const calcModal=$('calcModal');$('loanCalculatorBtn').onclick=()=>{openModal(calcModal);calc();};$('calcClose').onclick=()=>closeModal(calcModal);document.querySelectorAll('.calc-tabs button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.calc-tabs button').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('.calc-panel').forEach(x=>x.classList.toggle('active',x.dataset.panel===b.dataset.calc));calc()});document.querySelectorAll('.calc-input').forEach(x=>x.addEventListener('input',calc));
  function monthlyPayment(P,annual,years){const r=(Number(annual)||0)/100/12,n=(Number(years)||0)*12;if(!P||!n)return 0;if(!r)return P/n;return P*r/(1-Math.pow(1+r,-n))}
  function maxPrincipal(payment,annual,years){const r=(Number(annual)||0)/100/12,n=(Number(years)||0)*12;if(!payment||!n)return 0;if(!r)return payment*n;return payment*(1-Math.pow(1+r,-n))/r}
  function calc(){const p=toNum($('calcPrincipal').value),r=$('calcRate').value,y=toNum($('calcYears').value);$('calcInstallmentResult').textContent='مبلغ قسط ماهانه: '+(monthlyPayment(p,r,y)?money(monthlyPayment(p,r,y)):'—');const dep=toNum($('depositAmount').value),ratio=toNum($('depositRatio').value),dr=$('depositRate').value,dy=toNum($('depositYears').value),cap=dep*ratio/100;$('calcDepositResult').textContent=`سقف وام: ${cap?money(cap):'—'} · قسط تقریبی: ${monthlyPayment(cap,dr,dy)?money(monthlyPayment(cap,dr,dy)):'—'}`;const payment=toNum($('capacityPayment').value),cr=$('capacityRate').value,maxY=toNum($('capacityYears').value),box=$('capacityResults');box.innerHTML='';for(let yr=1;yr<=maxY;yr++){const val=maxPrincipal(payment,cr,yr);const row=document.createElement('div');row.innerHTML=`<span>${fmt(yr)} ساله</span><b>${val?money(val):'—'}</b>`;box.appendChild(row)}}
  // Amount-only inputs: live 3-digit grouping without losing Persian/Arabic digits or the caret.
  const amountIds=['loanTotal','loanInstallment','loanOverdueAmount','loanPaymentAmount','calcPrincipal','depositAmount','capacityPayment'];
  const normalizeDigits=s=>String(s??'').replace(/[۰-۹]/g,d=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g,d=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
  function formatAmountInput(el){const before=normalizeDigits(el.value),caret=el.selectionStart??before.length,digitsBefore=before.slice(0,caret).replace(/\D/g,'').length,raw=before.replace(/\D/g,'');if(!raw){el.value='';return}const formatted=fmt(raw);el.value=formatted;let seen=0,pos=formatted.length;for(let i=0;i<formatted.length;i++){if(/\d/.test(normalizeDigits(formatted[i]))){seen++;if(seen===digitsBefore){pos=i+1;break}}}try{el.setSelectionRange(pos,pos)}catch{}}
  amountIds.forEach(id=>{const el=$(id);if(!el)return;el.addEventListener('input',()=>formatAmountInput(el));el.addEventListener('blur',()=>{const n=toNum(el.value);el.value=n?fmt(n):''})});

  // Clean Jalali date picker: absolute overlay, so the form layout never moves.
  const jpMonths=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
  const jpWeek=['ش','ی','د','س','چ','پ','ج'];
  const jpGrid=$('jpGrid'),jpTitle=$('jpTitle'),jpPicker=$('loanJalaliPicker'),jpDisplay=$('loanNextDueDisplay'),jpHidden=$('loanNextDue');
  const jDiv=(a,b)=>Math.floor(a/b),jPad=n=>String(n).padStart(2,'0');
  function gToJ(gy,gm,gd){const gdm=[0,31,59,90,120,151,181,212,243,273,304,334],gy2=gm>2?gy+1:gy;let days=355666+365*gy+jDiv(gy2+3,4)-jDiv(gy2+99,100)+jDiv(gy2+399,400)+gd+gdm[gm-1],jy=-1595+33*jDiv(days,12053);days%=12053;jy+=4*jDiv(days,1461);days%=1461;if(days>365){jy+=jDiv(days-1,365);days=(days-1)%365}const jm=days<186?1+jDiv(days,31):7+jDiv(days-186,30),jd=1+(days<186?days%31:(days-186)%30);return[jy,jm,jd]}
  function jToG(jy,jm,jd){const j=jy+1595;let days=-355668+365*j+jDiv(j,33)*8+jDiv(j%33+3,4)+jd+(jm<7?(jm-1)*31:(jm-7)*30+186),gy=400*jDiv(days,146097);days%=146097;if(days>36524){gy+=100*jDiv(--days,36524);days%=36524;if(days>=365)days++}gy+=4*jDiv(days,1461);days%=1461;if(days>365){gy+=jDiv(days-1,365);days=(days-1)%365}let gd=days+1,ml=[31,(gy%4===0&&gy%100!==0)||gy%400===0?29:28,31,30,31,30,31,31,30,31,30,31],gm=0;while(gd>ml[gm]){gd-=ml[gm];gm++}return[gy,gm+1,gd]}
  function jpLen(y,m){if(m<7)return 31;if(m<12)return 30;const g=jToG(y,m,30),back=gToJ(...g);return back[2]===30?30:29}
  const today=new Date(),jNow=gToJ(today.getFullYear(),today.getMonth()+1,today.getDate());
  let jpY=jNow[0],jpM=jNow[1],jpSelected=jNow[2];
  function setPickerMonthFromField(){if(!jpHidden.value)return;const d=new Date(jpHidden.value+'T12:00:00');if(Number.isNaN(d.getTime()))return;[jpY,jpM,jpSelected]=gToJ(d.getFullYear(),d.getMonth()+1,d.getDate())}
  function openJPicker(){setPickerMonthFromField();renderJPicker();const r=jpDisplay.getBoundingClientRect();jpPicker.style.left='40px';jpPicker.style.right='auto';jpPicker.style.top=`${Math.round(r.bottom+8)}px`;jpPicker.hidden=false}
  function renderJPicker(){jpTitle.textContent=`${jpMonths[jpM-1]} ${jPad(jpY)}`;jpGrid.innerHTML='';const [gy,gm,gd]=jToG(jpY,jpM,1),first=(new Date(gy,gm-1,gd).getDay()+1)%7;for(let i=0;i<first;i++){const blank=document.createElement('span');blank.className='jp-empty';jpGrid.appendChild(blank)}for(let d=1;d<=jpLen(jpY,jpM);d++){const b=document.createElement('button');b.type='button';b.className='jp-day';if(jpY===jNow[0]&&jpM===jNow[1]&&d===jNow[2])b.classList.add('today');if(jpY===jpY&&d===jpSelected&&jpHidden.value){const [sy,sm,sd]=(()=>{const x=new Date(jpHidden.value+'T12:00:00');return Number.isNaN(x.getTime())?[]:gToJ(x.getFullYear(),x.getMonth()+1,x.getDate())})();if(sy===jpY&&sm===jpM&&sd===d)b.classList.add('selected')}b.textContent=jPad(d);b.onclick=()=>{const g=jToG(jpY,jpM,d);jpHidden.value=`${g[0]}-${jPad(g[1])}-${jPad(g[2])}`;jpDisplay.value=`${jPad(d)} ${jpMonths[jpM-1]}`;jpSelected=d;jpPicker.hidden=true};jpGrid.appendChild(b)}}
  $('loanDatePickerBtn')?.addEventListener('click',e=>{e.stopPropagation();jpPicker.hidden?openJPicker():jpPicker.hidden=true});
  jpDisplay?.addEventListener('click',e=>{e.stopPropagation();openJPicker()});
  $('jpPrev')?.addEventListener('click',e=>{e.stopPropagation();jpM--;if(jpM<1){jpM=12;jpY--}jpSelected=null;renderJPicker()});
  $('jpNext')?.addEventListener('click',e=>{e.stopPropagation();jpM++;if(jpM>12){jpM=1;jpY++}jpSelected=null;renderJPicker()});
  jpPicker?.addEventListener('click',e=>e.stopPropagation());
  document.addEventListener('click',()=>{if(jpPicker&&!jpPicker.hidden)jpPicker.hidden=true});

  render();
})();


/* MOBILE KEYBOARD — keep the focused field visible above the virtual keyboard */
(function initMobileKeyboardHandling() {
  const vv = window.visualViewport;
  let focusedField = null;
  let rafId = 0;
  let touchActive = false;

  const isTextField = (el) =>
    el &&
    el.matches &&
    el.matches('input:not([type="hidden"]), textarea, [contenteditable="true"]');

  function keepFieldVisible() {
    if (!focusedField || !document.body.contains(focusedField)) return;
    // Only ever correct while the field genuinely has focus (the user tapped
    // in to type/select). Never touch scroll position outside that case —
    // that's what made ordinary flicking/scrolling jump around.
    if (document.activeElement !== focusedField) return;
    // Never fight a scroll/selection gesture the user is actively performing:
    // this is what made scrolling feel "stuck" until the finger was released.
    if (touchActive) return;

    const viewportHeight = vv ? vv.height : window.innerHeight;
    const viewportTop = vv ? vv.offsetTop : 0;
    const rect = focusedField.getBoundingClientRect();
    const safeTop = viewportTop + 18;
    const safeBottom = viewportTop + viewportHeight - 18;

    // Only adjust the nearest modal/page scroll surface when the field is
    // actually obscured. Do not use scrollIntoView(): it can choose an
    // ancestor outside the modal and move the app page during normal scroll.
    const modal = focusedField.closest('.loan-modal.open, .car-modal.open, .fm-modal.open');
    const scroller = modal?.querySelector('.modal-scroll-body, .fm-modal-body') || focusedField.closest('.page');
    if (!scroller || scroller.scrollHeight <= scroller.clientHeight) return;

    const scrollerRect = scroller.getBoundingClientRect();
    const top = Math.max(safeTop, scrollerRect.top + 12);
    const bottom = Math.min(safeBottom, scrollerRect.bottom - 18);
    let delta = 0;
    if (rect.bottom > bottom) delta = rect.bottom - bottom;
    else if (rect.top < top) delta = rect.top - top;
    // Smooth is fine here: this only ever runs right after the keyboard
    // opens for a field the user just tapped, never mid-scroll (guarded
    // above), so there is nothing left for it to fight.
    if (Math.abs(delta) > 1) scroller.scrollBy({top: delta, behavior: 'smooth'});
  }

  function scheduleKeepVisible() {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(keepFieldVisible);
  }

  // Track whether a finger is currently on the screen, purely so
  // keepFieldVisible can avoid running mid-gesture. Touch end must NOT
  // itself trigger a correction — that fired after every ordinary scroll
  // flick too (not just after editing a field) and caused the page to jump.
  document.addEventListener('touchstart', () => { touchActive = true; }, { passive: true });
  document.addEventListener('touchend', () => { touchActive = false; }, { passive: true });
  document.addEventListener('touchcancel', () => { touchActive = false; }, { passive: true });

  document.addEventListener('focusin', (event) => {
    if (!isTextField(event.target)) return;
    focusedField = event.target;

    // Let the browser finish opening/animating the keyboard first.
    setTimeout(scheduleKeepVisible, 80);
    setTimeout(scheduleKeepVisible, 250);
    setTimeout(scheduleKeepVisible, 500);
  }, { passive: true });

  document.addEventListener('focusout', (event) => {
    if (event.target === focusedField) {
      setTimeout(() => {
        if (document.activeElement !== focusedField) focusedField = null;
      }, 150);
    }
  }, { passive: true });

  // visualViewport's own 'scroll' event fires as a side effect of iOS's
  // native "scroll the focused field into view" behavior (including while
  // selecting text in a field). Reacting to it here re-triggered our own
  // corrective scroll on top of the native one — a feedback loop that is
  // the main reason scrolling turned janky again right after a selection.
  // 'resize' (keyboard opening/closing) is still handled, but only ever
  // acts while a field has real focus (checked inside keepFieldVisible),
  // so it stays silent during normal page scrolling.
  if (vv) {
    vv.addEventListener('resize', scheduleKeepVisible, { passive: true });
  }

  window.addEventListener('resize', scheduleKeepVisible, { passive: true });
})();
 /* MOBILE KEYBOARD END */

/* Vehicle investment manager */
(()=>{
  const root=document.querySelector('.car-page'); if(!root)return;
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const digits=s=>String(s??'').replace(/[۰-۹]/g,d=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g,d=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
  const toNum=s=>{const n=digits(s).replace(/[,٬\s]/g,'').replace(/٪/g,'');return Number(n)||0};
  const fmt=n=>new Intl.NumberFormat('fa-IR').format(Math.round(Number(n)||0));
  const money=n=>fmt(n)+' تومان';
  const pct=n=>`${Number(n||0).toLocaleString('fa-IR',{maximumFractionDigits:2})}٪`;
  const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
  const months=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
  const jDiv=(a,b)=>Math.floor(a/b), pad=n=>String(n).padStart(2,'0');
  function g2j(gy,gm,gd){const gdm=[0,31,59,90,120,151,181,212,243,273,304,334],gy2=gm>2?gy+1:gy;let days=355666+365*gy+jDiv(gy2+3,4)-jDiv(gy2+99,100)+jDiv(gy2+399,400)+gd+gdm[gm-1],jy=-1595+33*jDiv(days,12053);days%=12053;jy+=4*jDiv(days,1461);days%=1461;if(days>365){jy+=jDiv(days-1,365);days=(days-1)%365}return[jy,days<186?1+jDiv(days,31):7+jDiv(days-186,30),1+(days<186?days%31:(days-186)%30)]}
  function j2g(jy,jm,jd){const j=jy+1595;let days=-355668+365*j+jDiv(j,33)*8+jDiv(j%33+3,4)+jd+(jm<7?(jm-1)*31:(jm-7)*30+186),gy=400*jDiv(days,146097);days%=146097;if(days>36524){gy+=100*jDiv(--days,36524);days%=36524;if(days>=365)days++}gy+=4*jDiv(days,1461);days%=1461;if(days>365){gy+=jDiv(days-1,365);days=(days-1)%365}let gd=days+1,ml=[31,(gy%4===0&&gy%100!==0)||gy%400===0?29:28,31,30,31,30,31,31,30,31,30,31],gm=0;while(gd>ml[gm]){gd-=ml[gm++]}return[gy,gm+1,gd]}
  function jToday(){const d=new Date(),j=g2j(d.getFullYear(),d.getMonth()+1,d.getDate());return `${j[0]}-${pad(j[1])}-${pad(j[2])}`}
  function jText(v){if(!v)return '—';const a=String(v).split('-').map(Number);return `${pad(a[2])} ${months[a[1]-1]} ${a[0]}`}
  function jDateDiff(a,b){if(!a||!b)return 0;const x=j2g(...a.split('-').map(Number)),y=j2g(...b.split('-').map(Number));return Math.max(0,Math.round((Date.UTC(y[0],y[1]-1,y[2])-Date.UTC(x[0],x[1]-1,x[2]))/86400000));}
  function formatAmount(el){const raw=digits(el.value), before=(el.selectionStart??raw.length), digitsBefore=raw.slice(0,before).replace(/\D/g,'').length, clean=raw.replace(/\D/g,'');if(!clean){el.value='';return}const f=fmt(clean);el.value=f;let seen=0,pos=f.length;for(let i=0;i<f.length;i++){if(/\d/.test(digits(f[i]))){seen++;if(seen===digitsBefore){pos=i+1;break}}}try{el.setSelectionRange(pos,pos)}catch{}}

  let cars=[];try{cars=JSON.parse(localStorage.getItem('finance-cars-v1')||'[]')}catch{cars=[]}
  const save=()=>localStorage.setItem('finance-cars-v1',JSON.stringify(cars));
  const defaultPartner=()=>({id:uid(),name:'من',isMe:true});
  const getCar=id=>cars.find(c=>c.id===id);
  const CAPITAL_CATEGORIES=new Set(['خرید حواله','تکمیل وجه']);
  const isCapitalTx=t=>CAPITAL_CATEGORIES.has(t?.category||'')||(t?.kind==='capital'&&t?.category==='آورده شریک');
  const totals=car=>{
    const tx=car.transactions||[];
    const capital=tx.filter(isCapitalTx).reduce((s,t)=>s+(Number(t.amount)||0),0);
    const costs=tx.filter(t=>t.kind==='payment'&&!isCapitalTx(t)).reduce((s,t)=>s+(Number(t.amount)||0),0);
    const income=tx.filter(t=>t.kind==='income').reduce((s,t)=>s+(Number(t.amount)||0),0);
    const profit=income-capital-costs;
    const saleIncome=tx.filter(t=>t.category==='فروش'&&t.kind==='income').reduce((s,t)=>s+t.amount,0);
    const delayIncome=tx.filter(t=>t.category==='جریمه تأخیر'&&t.kind==='income').reduce((s,t)=>s+t.amount,0);
    const partnerCaps={}, partnerCosts={};
    tx.filter(isCapitalTx).forEach(t=>{if(t.partnerId)partnerCaps[t.partnerId]=(partnerCaps[t.partnerId]||0)+t.amount});
    tx.filter(t=>t.kind==='payment'&&!isCapitalTx(t)).forEach(t=>{const k=t.partnerId||t.party||'unknown';partnerCosts[k]=(partnerCosts[k]||0)+t.amount});
    const totalCapital=Object.values(partnerCaps).reduce((a,b)=>a+b,0)||capital;
    return {capital, costs, payments:costs, income, profit, saleIncome, delayIncome, partnerCaps, partnerCosts, totalCapital, totalCost:capital+costs};
  };
  const userShare=(car)=>{const t=totals(car),list=car.partners||[],mine=list.find(p=>p.isMe||p.name==='من'),mineCap=mine?(t.partnerCaps[mine.id]||0):0,totalCap=t.totalCapital||t.capital,share=totalCap?mineCap/totalCap:(mine?1:0);return {share,mineCap,profit:t.profit*share,costCredit:mine?((t.partnerCosts[mine.id]||0)):0,settlement:mineCap+(mine?(t.partnerCosts[mine.id]||0):0)+t.profit*share};};
  const profitPotential=car=>{const t=totals(car),market=toNum(car.marketPrice);if(!market)return 0;const expectedIncome=t.income+(market-t.saleIncome);return expectedIncome-t.capital-t.costs;};
  const delayCalc=car=>{if(!car.deliveryDate||!car.delayRate)return {days:0,amount:0};const end=car.deliveryActual||((car.status==='sold'&&car.saleDate)?car.saleDate:jToday()),days=jDateDiff(car.deliveryDate,end),base=car.delayBase==='payments'?totals(car).capital:car.delayBase==='custom'?toNum(car.delayCustom):toNum(car.factoryPrice);return {days,amount:base*(toNum(car.delayRate)/100)*(days/30)};};
  function syncDelay(car){const d=delayCalc(car);car.delayDays=d.days;car.delayProfit=d.amount;}
  function shareRows(car){const t=totals(car),total=t.totalCapital;const partners=(car.partners||[]);return partners.map(p=>{const inv=t.partnerCaps[p.id]||0,sh=total?inv/total:0,cost=t.partnerCosts[p.id]||0;return {...p,investment:inv,share:sh,costCredit:cost,profit:t.profit*sh,settlement:inv+cost+t.profit*sh};});}

  let activeCarTab='active';
  function render(){
    const q=($('carSearch')?.value||'').trim().toLowerCase();
    const match=c=>!q||`${c.name} ${c.company} ${c.ownerName} ${c.nationalId} ${c.requestNo} ${c.admissionNo} ${c.saleType}`.toLowerCase().includes(q);
    const active=cars.filter(c=>c.status!=='sold'&&match(c));const sold=cars.filter(c=>c.status==='sold'&&match(c));
    $('activeCarCount').textContent=fmt(active.length);$('soldCarCount').textContent=fmt(sold.length);
    $('activeCarEmpty').hidden=!!active.length;$('soldCarEmpty').hidden=!!sold.length;
    $('activeCarsList').innerHTML=active.map(carCard).join('');$('soldCarsList').innerHTML=sold.map(carCard).join('');
    $('activeCarSection').hidden=activeCarTab!=='active';$('soldCarSection').hidden=activeCarTab!=='sold';
    document.querySelectorAll('.car-status-tab').forEach(b=>{const on=b.dataset.carStatusTab===activeCarTab;b.classList.toggle('active',on);b.setAttribute('aria-selected',on?'true':'false')});
    bindCards($('activeCarsList'));bindCards($('soldCarsList'));renderKpis();
  }
  function renderKpis(){const active=cars.filter(c=>c.status!=='sold'),sold=cars.filter(c=>c.status==='sold');const realized=sold.reduce((s,c)=>s+userShare(c).profit,0),potential=active.reduce((s,c)=>s+profitPotential(c)*userShare(c).share,0);$('carKpis').innerHTML=`<div class="car-profit-kpi realized"><span>سود محقق‌شده من</span><b>${money(realized)}</b><small>معاملات فروخته‌شده</small></div><div class="car-profit-kpi potential"><span>سود بالقوه من</span><b>${money(potential)}</b><small>معاملات فعال</small></div>`;}
  function carProfitPeriod(c){
    if(!c.registerDate)return {days:0,months:0,endDate:''};
    const endDate=c.status==='sold'?(c.deliveryActual||c.saleDate||c.deliveryDate):c.deliveryDate;
    if(!endDate)return {days:0,months:0,endDate:''};
    const days=Math.max(0,jDateDiff(c.registerDate,endDate));
    return {days,months:days/30,endDate};
  }
  function carCard(c){
    syncDelay(c);
    const t=totals(c),u=userShare(c),pot=profitPotential(c),period=carProfitPeriod(c);
    const profit=c.status==='sold'?u.profit:pot*u.share;
    // Profit percentage is based on MY capital, not the whole deal's capital.
    const rate=u.mineCap?profit/u.mineCap*100:0;
    const monthlyProfit=period.months>0?profit/period.months:0;
    const monthlyRate=period.months>0?rate/period.months:0;
    const durationMonths=period.months;
    const durationLabel=durationMonths>0?Number(durationMonths.toFixed(1)).toLocaleString('fa-IR')+' ماه':'—';
    const deliveryLabel=c.status==='sold'?(c.deliveryActual||c.saleDate||c.deliveryDate):c.deliveryDate;
    return `<div class="car-swipe" data-id="${c.id}"><div class="car-actions"><button data-act="edit" class="car-edit" aria-label="ویرایش"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/></svg></button><button data-act="delete" class="car-delete" aria-label="حذف"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m-9 0 1 13h8l1-13M10 11v5m4-5v5"/></svg></button><button data-act="note" class="car-note" aria-label="یادداشت"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5"/></svg></button></div><article class="car-card"><div class="car-card-top"><div class="car-card-title"><strong>${esc(c.name||'خودرو')}</strong><small>${esc(c.company||'')}</small></div><span class="car-status-badge ${c.status==='sold'?'sold':'active'}">${c.status==='sold'?'فروخته شده':'فعال'}</span><button class="car-details-btn" data-act="details" aria-label="جزئیات">⋮</button></div><div class="car-highlight"><div><span>مالک / ثبت‌نام‌کننده</span><b>${esc(c.ownerName||'—')}</b><small>${esc(c.nationalId||'—')}</small></div><div><span>سود من</span><b class="${profit>=0?'positive':'negative'}">${money(profit)}</b><small>${pct(rate)}</small></div></div><div class="car-main-grid"><div><span>نوع فروش</span><b>${esc(c.saleType||'—')}</b></div><div><span>قیمت کارخانه</span><b>${money(c.factoryPrice)}</b></div><div><span>سود سرانه ماهانه</span><b>${money(monthlyProfit)} <small class="monthly-rate">(${pct(monthlyRate)})</small></b></div><div><span>${c.status==='sold'?'سود محقق‌شده':'سود بالقوه'}</span><b class="${profit>=0?'positive':'negative'}">${money(profit)}</b></div></div><div class="car-card-bottom"><span>مدت تحویل: ${durationLabel}</span><span>تاریخ ثبت‌نام: ${jText(c.registerDate)}</span><span>تاریخ تحویل: ${jText(deliveryLabel)}</span><span>تأخیر: ${fmt(c.delayDays||0)} روز · ${money(c.delayProfit||0)}</span></div></article></div>`
  }
  function bindCards(container){
    container.querySelectorAll('.car-swipe').forEach(w=>{
      let startX=0,startY=0,dx=0,dragging=false;
      const close=()=>w.classList.remove('swiped');
      const open=()=>{container.querySelectorAll('.car-swipe.swiped').forEach(x=>{if(x!==w)x.classList.remove('swiped')});w.classList.add('swiped')};
      w.addEventListener('pointerdown',e=>{
        if(e.button!==undefined && e.button!==0)return;
        if(e.target.closest('button'))return;
        startX=e.clientX;startY=e.clientY;dx=0;dragging=true;
        w.setPointerCapture?.(e.pointerId);
      });
      w.addEventListener('pointermove',e=>{
        if(!dragging)return;
        const moveX=e.clientX-startX,moveY=e.clientY-startY;
        if(Math.abs(moveY)>Math.abs(moveX)+8){dragging=false;return;}
        dx=moveX;
        if(Math.abs(dx)>10)e.preventDefault();
      });
      w.addEventListener('pointerup',e=>{
        if(!dragging)return;dragging=false;
        if(dx<-32){open();}else if(dx>32){close();}
      });
      w.addEventListener('pointercancel',()=>{dragging=false});
      w.addEventListener('click',e=>{
        const b=e.target.closest('button');if(!b)return;e.stopPropagation();
        const id=w.dataset.id,act=b.dataset.act;
        if(act==='details')openDetails(id);
        else if(act==='edit')openForm(getCar(id));
        else if(act==='note')openQuickNote(getCar(id));
        else if(act==='delete')deleteCar(getCar(id));
        else if(b.dataset.copy){const text=b.dataset.copy;const done=()=>toast('کپی شد');const fallback=()=>{const t=document.createElement('textarea');t.value=text;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();try{document.execCommand('copy');done()}catch{}t.remove()};if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text).then(done).catch(fallback);else fallback()}
      });
    });
  }
  function openModal(m){
    if(!m)return;
    if(m.classList.contains('open'))return;
    m.classList.add('open');m.setAttribute('aria-hidden','false');
    m.dataset.historyManaged='true';
    history.pushState({financeTab:document.querySelector('.nav-item.active')?.dataset.target||'dashboard',modalId:m.id},'',location.href);
  }
  function closeModal(m){
    if(!m)return;
    const managed=m.dataset.historyManaged==='true';
    const isCurrent=history.state?.modalId===m.id;
    m.classList.remove('open');m.setAttribute('aria-hidden','true');delete m.dataset.historyManaged;
    if(managed&&isCurrent){history.back()}
  };
  function resetForm(c){$('carForm').reset();$('carId').value=c?.id||'';$('carFormKicker').textContent=c?'ویرایش اطلاعات':'ثبت اطلاعات';$('carFormTitle').textContent=c?'ویرایش خودرو':'خودرو جدید';$('carName').value=c?.name||'';$('carCompany').value=c?.company||'';$('carSaleType').value=c?.saleType||'فوری';$('carFactoryPrice').value=c?.factoryPrice?fmt(c.factoryPrice):'';$('carOwnerName').value=c?.ownerName||'';$('carNationalId').value=c?.nationalId||'';$('carRequestNo').value=c?.requestNo||'';$('carAdmissionNo').value=c?.admissionNo||'';$('carRegisterDate').value=c?.registerDate||jToday();$('carDeliveryDate').value=c?.deliveryDate||'';$('carDelayRate').value=c?.delayRate??'';$('carDelayDays').value=c?.delayDays?fmt(c.delayDays):'';$('carDelayProfit').value=c?.delayProfit?fmt(c.delayProfit):'';$('carDelayBase').value=c?.delayBase||'factory';$('carDelayCustom').value=c?.delayCustom?fmt(c.delayCustom):'';$('carStatus').value=c?.status||'active';$('carMarketPrice').value=c?.marketPrice?fmt(c.marketPrice):'';$('carDeliveryActual').value=c?.deliveryActual||'';$('carSaleDate').value=c?.saleDate||'';$('carNotes').value=c?.notes||'';renderPartnersEditor(c?.partners||[defaultPartner()]);toggleCustomDelay();syncFormDelay();}
  function openForm(c=null){resetForm(c);openModal($('carFormModal'));setTimeout(()=>$('carName').focus(),100)}
  function renderPartnersEditor(list){const box=$('carPartnersEditor');box.innerHTML='';(list.length?list:[defaultPartner()]).forEach((p,i)=>{const row=document.createElement('div');row.className='partner-edit-row';row.dataset.pid=p.id;row.innerHTML=`<input class="partner-name" value="${esc(p.name||'')}" placeholder="نام شریک"><label class="partner-me"><input type="checkbox" class="partner-is-me" ${p.isMe?'checked':''}> سهم من</label>${i?'<button type="button" class="remove-partner">×</button>':''}`;box.appendChild(row)});}
  $('addPartnerBtn').onclick=()=>{const list=[];$('carPartnersEditor').querySelectorAll('.partner-edit-row').forEach(r=>list.push({id:r.dataset.pid,name:r.querySelector('.partner-name').value,isMe:r.querySelector('.partner-is-me').checked}));list.push({id:uid(),name:'شریک جدید'});renderPartnersEditor(list)};
  $('carPartnersEditor').addEventListener('click',e=>{if(e.target.closest('.remove-partner'))e.target.closest('.partner-edit-row').remove()});
  $('carPartnersEditor').addEventListener('change',e=>{if(e.target.classList.contains('partner-is-me')&&e.target.checked)$('carPartnersEditor').querySelectorAll('.partner-is-me').forEach(x=>{if(x!==e.target)x.checked=false})});
  function collectPartners(){return [...$('carPartnersEditor').querySelectorAll('.partner-edit-row')].map(r=>({id:r.dataset.pid||uid(),name:r.querySelector('.partner-name').value.trim()||'شریک',isMe:r.querySelector('.partner-is-me').checked}));}
  function toggleCustomDelay(){$('carDelayCustomWrap').hidden=$('carDelayBase').value!=='custom'}
  function syncFormDelay(){const delivery=$('carDeliveryDate').value,actual=$('carDeliveryActual').value,rate=toNum($('carDelayRate').value);if(!delivery){$('carDelayDays').value='';$('carDelayProfit').value='';return}const end=actual||jToday(),days=jDateDiff(delivery,end),base=$('carDelayBase').value==='payments'?0:$('carDelayBase').value==='custom'?toNum($('carDelayCustom').value):toNum($('carFactoryPrice').value);$('carDelayDays').value=fmt(days);$('carDelayProfit').value=base&&rate?fmt(base*(rate/100)*(days/30)):''}
  ['carDeliveryDate','carDeliveryActual','carDelayRate','carDelayCustom','carFactoryPrice'].forEach(id=>$(id)?.addEventListener('input',syncFormDelay));$('carDelayBase').addEventListener('change',()=>{toggleCustomDelay();syncFormDelay()});$('carStatus').addEventListener('change',()=>{$('carSaleDate').required=$('carStatus').value==='sold';syncFormDelay()});
  $('carForm').addEventListener('submit',e=>{e.preventDefault();let c=getCar($('carId').value)||{id:uid(),transactions:[]};Object.assign(c,{name:$('carName').value.trim(),company:$('carCompany').value.trim(),saleType:$('carSaleType').value,factoryPrice:toNum($('carFactoryPrice').value),ownerName:$('carOwnerName').value.trim(),nationalId:digits($('carNationalId').value),requestNo:$('carRequestNo').value.trim(),admissionNo:$('carAdmissionNo').value.trim(),registerDate:$('carRegisterDate').value,deliveryDate:$('carDeliveryDate').value,delayRate:toNum($('carDelayRate').value),delayBase:$('carDelayBase').value,delayCustom:toNum($('carDelayCustom').value),status:$('carStatus').value,marketPrice:toNum($('carMarketPrice').value),deliveryActual:$('carDeliveryActual').value,saleDate:$('carSaleDate').value,partners:collectPartners(),notes:$('carNotes').value.trim()});syncDelay(c);if(!cars.some(x=>x.id===c.id))cars.push(c);save();syncCarEvents(c);closeModal($('carFormModal'));render();});
  $('carFormClose').onclick=()=>closeModal($('carFormModal'));$('carCancel').onclick=()=>closeModal($('carFormModal'));$('carDetailClose').onclick=()=>closeModal($('carDetailModal'));$('carCumulativeClose').onclick=()=>closeModal($('carCumulativeModal'));$('carWeightedClose').onclick=()=>closeModal($('carWeightedModal'));$('receiptClose').onclick=()=>closeModal($('carReceiptModal'));$('carNoteClose').onclick=()=>closeModal($('carNoteModal'));$('carNoteCancel').onclick=()=>closeModal($('carNoteModal'));$('carNoteSave').onclick=()=>{const id=$('carNoteModal').dataset.carId,c=getCar(id);if(!c)return;c.notes=$('carNoteInput').value.trim();save();closeModal($('carNoteModal'));render();};
  document.querySelectorAll('.car-modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)closeModal(m)}));
  $('addCarBtn').onclick=()=>openForm();$('carSearch').addEventListener('input',render);$('carSearchClear').onclick=()=>{$('carSearch').value='';render();$('carSearch').focus()};

  function syncCarEvents(c){let events=[];try{events=JSON.parse(localStorage.getItem('finance-events')||'[]')}catch{}events=events.filter(e=>e.carId!==c.id);(c.transactions||[]).forEach(t=>{if(!t.date)return;events.push({date:t.date,type:t.kind==='income'?'income':'payment',title:`${c.name} · ${t.category}`,description:t.description||t.party||'خودرو',amount:t.amount,source:'خودرو',carId:c.id,transactionId:t.id})});if(c.saleDate)events.push({date:c.saleDate,type:'trade',title:`فروش ${c.name}`,description:`فروش خودرو · ${c.ownerName||''}`,amount:totals(c).saleIncome,source:'خودرو',carId:c.id});localStorage.setItem('finance-events',JSON.stringify(events));}

  function transactionForm(c,edit){
    const partners=c.partners||[];
    const t=edit||{id:uid(),kind:'payment',category:'هزینه معامله',date:jToday(),amount:0,partyId:'',party:'',description:'',receiptData:'',receiptName:''};
    const partyOptions=partners.map(p=>`<option value="${esc(p.id)}" ${t.partnerId===p.id?'selected':''}>${esc(p.name||'شریک')}</option>`).join('');
    const oldParty=t.party&&!partners.some(p=>p.id===t.partnerId)?`<option value="__other" selected>${esc(t.party||'سایر')}</option>`:'';
    return `<div class="transaction-form" data-tid="${t.id}">
      <div class="accounting-note">خرید حواله و تکمیل وجه <b>آورده سرمایه</b> محسوب می‌شوند؛ سایر پرداخت‌ها هزینه معامله‌اند و از سود کم می‌شوند.</div>
      <div class="form-grid three">
        <label><span>نوع</span><select class="tx-kind"><option value="payment" ${t.kind==='payment'?'selected':''}>پرداخت / هزینه</option><option value="income" ${t.kind==='income'?'selected':''}>دریافت / درآمد</option><option value="capital" ${t.kind==='capital'?'selected':''}>آورده سرمایه</option></select></label>
        <label><span>دسته</span><select class="tx-category"><option ${t.category==='هزینه معامله'?'selected':''}>هزینه معامله</option><option ${t.category==='خرید حواله'?'selected':''}>خرید حواله</option><option ${t.category==='تکمیل وجه'?'selected':''}>تکمیل وجه</option><option ${t.category==='فروش'?'selected':''}>فروش</option><option ${t.category==='جریمه تأخیر'?'selected':''}>جریمه تأخیر</option><option ${t.category==='مابه‌التفاوت'?'selected':''}>مابه‌التفاوت</option><option ${t.category==='تخفیف'?'selected':''}>تخفیف</option><option ${t.category==='تعویض پلاک'?'selected':''}>تعویض پلاک</option><option ${t.category==='وکالت'?'selected':''}>وکالت</option><option ${t.category==='پارکینگ'?'selected':''}>پارکینگ</option><option ${t.category==='کمیسیون'?'selected':''}>کمیسیون</option><option ${t.category==='راننده'?'selected':''}>راننده</option><option ${t.category==='کفی'?'selected':''}>کفی</option><option ${t.category==='سایر'?'selected':''}>سایر</option></select></label>
        <label><span>مبلغ</span><input class="tx-amount amount-input" inputmode="numeric" value="${t.amount?fmt(t.amount):''}" placeholder="تومان"></label>
      </div>
      <div class="form-grid two">
        <label class="jalali-car-date"><span>تاریخ</span><div class="car-date-wrap"><input class="tx-date" readonly value="${esc(t.date||'')}"><button type="button" class="tx-date-btn">▦</button></div></label>
        <label><span>نام شریک / پرداخت‌کننده</span><select class="tx-party-select"><option value="">انتخاب شخص</option>${partyOptions}${oldParty}</select></label>
      </div>
      <label class="full-label"><span>توضیحات</span><input class="tx-desc" value="${esc(t.description||'')}" placeholder="شرح پرداخت یا دریافت"></label>
      <div class="receipt-upload"><label class="receipt-label"><span>رسید تصویر</span><input class="tx-receipt" type="file" accept="image/*"><small>${esc(t.receiptName||'بدون رسید')}</small></label>${t.receiptData?'<button type="button" class="receipt-preview-btn">مشاهده رسید</button>':''}</div>
      <div class="tx-form-actions"><button type="button" class="secondary-action tx-cancel">انصراف</button><button type="button" class="primary-action tx-save">ثبت تراکنش</button></div>
    </div>`
  }
  function detailHtml(c,activeTab='overview'){const t=totals(c),u=userShare(c),shares=shareRows(c),pot=profitPotential(c),profit=c.status==='sold'?u.profit:pot*u.share;return `<div class="car-detail-tabs"><button class="${activeTab==='overview'?'active':''}" data-tab="overview">خلاصه</button><button class="${activeTab==='ledger'?'active':''}" data-tab="ledger">دفتر حساب</button><button class="${activeTab==='tx'?'active':''}" data-tab="tx">تراکنش‌ها</button><button class="${activeTab==='partners'?'active':''}" data-tab="partners">شرکا</button></div><div class="car-detail-content">${activeTab==='overview'?`<div class="detail-kpi-grid"><div><span>کل آورده</span><b>${money(t.capital)}</b></div><div><span>کل هزینه</span><b>${money(t.payments)}</b></div><div><span>کل دریافتی</span><b>${money(t.income)}</b></div><div><span>سود ${c.status==='sold'?'محقق‌شده':'بالقوه'}</span><b class="${profit>=0?'positive':'negative'}">${money(profit)}</b></div><div><span>سود من</span><b>${money(u.profit)}</b></div><div><span>درصد سود من</span><b>${pct(u.mineCap?u.profit/u.mineCap*100:0)}</b></div></div><div class="info-table">${infoRow('نام خودرو',c.name)}${infoRow('مالک / ثبت‌نام‌کننده',c.ownerName)}${infoRow('کد ملی',c.nationalId,true)}${infoRow('شماره درخواست',c.requestNo,true)}${infoRow('شماره پذیرش',c.admissionNo,true)}${infoRow('نوع فروش',c.saleType)}${infoRow('تاریخ ثبت‌نام',jText(c.registerDate))}${infoRow('موعد تحویل',jText(c.deliveryDate))}${infoRow('مدت تأخیر',fmt(c.delayDays||0)+' روز')}${infoRow('جریمه تأخیر',money(c.delayProfit||0))}</div>`:activeTab==='ledger'?ledgerHtml(c):activeTab==='tx'?transactionsHtml(c):partnersHtml(c,shares)}</div>`}
  function infoRow(k,v,copy=false){return `<div class="info-row"><span>${k}</span><b ${copy&&v?`class="copyable-detail-value" data-copy-value="${esc(v)}" title="برای کپی لمس کنید"`:''}>${esc(v||'—')}</b>${copy&&v?`<button type="button" class="copy-inline" data-copy="${esc(v)}">کپی</button>`:''}</div>`}
  function ledgerHtml(c){const t=totals(c),tx=[...(c.transactions||[])].sort((a,b)=>a.date.localeCompare(b.date));let balance=0;const rows=tx.map(x=>{const sign=isCapitalTx(x)?0:(x.kind==='payment'?-x.amount:x.kind==='income'?x.amount:0);if(sign)balance+=sign;const nature=isCapitalTx(x)?'آورده سرمایه':x.kind==='payment'?'هزینه':'دریافت';return `<div class="ledger-row"><div><b>${esc(x.category)}</b><small>${jText(x.date)} · ${esc(x.party||'—')} · ${nature}</small></div><strong class="${sign<0?'negative':'positive'}">${sign===0?'—':(sign<0?'−':'+')+money(Math.abs(sign))}</strong><span>${money(balance)}</span></div>`}).join('');return `<div class="ledger-head"><span>شرح</span><span>اثر بر سود</span><span>مانده</span></div><div class="ledger-list">${rows||'<div class="detail-empty">هنوز تراکنشی ثبت نشده است.</div>'}</div><div class="ledger-total"><span>کل آورده</span><b>${money(t.capital)}</b><span>کل هزینه قابل کسر</span><b>${money(t.costs)}</b><span>کل دریافتی</span><b>${money(t.income)}</b><span>سود خالص معامله</span><b class="${t.profit>=0?'positive':'negative'}">${money(t.profit)}</b></div>`}
  function transactionsHtml(c){const cats=[...new Set((c.transactions||[]).map(x=>x.category).filter(Boolean))];const rows=[...(c.transactions||[])].sort((a,b)=>b.date.localeCompare(a.date)).map(x=>`<div class="tx-row" data-tx-search="${esc(`${x.category||''} ${x.party||''} ${x.description||''}`.toLowerCase())}" data-tx-kind="${isCapitalTx(x)?'capital':x.kind}"><div class="tx-icon ${x.kind}">${x.kind==='payment'?'−':x.kind==='income'?'+':'↔'}</div><div class="tx-main"><b class="tx-person-name">${esc(x.party||'بدون شخص')}</b><span class="tx-category-label">${esc(x.category||'بدون دسته')}</span><small>${jText(x.date)}</small><p>${esc(x.description||'')}</p></div><strong>${money(x.amount)}</strong><div class="tx-row-actions">${x.receiptData?`<button data-receipt="${x.id}">رسید</button>`:''}<button data-edit-tx="${x.id}">ویرایش</button><button data-delete-tx="${x.id}">حذف</button></div></div>`).join('');return `<div class="detail-toolbar"><span>دفتر تراکنش و رسیدها</span><button class="primary-action add-tx-btn">＋ افزودن تراکنش</button></div><div class="tx-tools"><div class="tx-search-wrap"><span class="tx-search-icon">⌕</span><input class="tx-search" type="search" placeholder="جستجوی شخص، دسته یا توضیحات..." autocomplete="off"><button type="button" class="tx-search-clear" aria-label="پاک کردن جستجو">×</button></div><div class="tx-filter-row"><label><span>نوع</span><select class="tx-kind-filter"><option value="all">همه تراکنش‌ها</option><option value="capital">خرید / آورده سرمایه</option><option value="payment">هزینه / پرداخت</option><option value="income">دریافت / درآمد</option></select></label><label><span>دسته</span><select class="tx-category-filter"><option value="all">همه دسته‌ها</option>${cats.map(cat=>`<option value="${esc(cat)}">${esc(cat)}</option>`).join('')}</select></label></div><div class="tx-filter-summary"><span class="tx-result-count">${fmt((c.transactions||[]).length)} تراکنش</span><button type="button" class="tx-clear-filters">حذف فیلترها</button></div></div><div class="tx-list">${rows||'<div class="detail-empty">تراکنشی ثبت نشده است.</div>'}</div>`}
  function partnersHtml(c,shares){const t=totals(c);return `<div class="partners-summary">${shares.map(p=>{const costs=(c.transactions||[]).filter(x=>x.kind==='payment'&&!isCapitalTx(x)&&(x.partnerId===p.id||(!x.partnerId&&x.party===p.name))).sort((a,b)=>a.date.localeCompare(b.date));return `<div class="partner-card"><div class="partner-head"><div><b>${esc(p.name)}</b><small>سهم از آورده: ${pct(p.share)}</small></div><div class="partner-profit"><span>سود سهم شریک</span><strong>${money(p.profit)}</strong></div></div><div class="partner-metrics"><div><span>آورده سرمایه</span><b>${money(p.investment)}</b></div><div><span>هزینه پرداخت‌شده</span><b>${money(p.costCredit)}</b></div><div><span>بازپرداخت هزینه</span><b>${money(p.costCredit)}</b></div><div><span>بازگشت آورده</span><b>${money(p.investment)}</b></div></div><b class="settlement-total">جمع دریافتی نهایی: ${money(p.settlement)}</b><div class="partner-cost-list">${costs.length?costs.map(x=>`<div><span>${jText(x.date)} · ${esc(x.category)}</span><b>${money(x.amount)}</b></div>`).join(''):'<small>هزینه‌ای به نام این شریک ثبت نشده است.</small>'}</div></div>`}).join('')||'<div class="detail-empty">شریکی ثبت نشده است.</div>'}<div class="partners-total"><span>هزینه‌های قابل بازپرداخت به اشخاص</span><b>${money(Object.values(t.partnerCosts).reduce((a,b)=>a+b,0))}</b></div></div>`}
  function openDetails(id,tab='overview'){const c=getCar(id);if(!c)return;syncDelay(c);$('carDetailTitle').textContent=c.name;$('carDetailBody').innerHTML=detailHtml(c,tab);openModal($('carDetailModal'));bindDetail(c)}
  function bindDetail(c){$('carDetailBody').querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{openDetails(c.id,b.dataset.tab)});const copyValue=text=>{const value=String(text??'');if(!value)return;const done=()=>toast('کپی شد');const fallback=()=>{const t=document.createElement('textarea');t.value=value;t.style.position='fixed';t.style.left='-9999px';t.style.opacity='0';document.body.appendChild(t);t.focus();t.select();try{document.execCommand('copy');done()}catch{}t.remove()};if(navigator.clipboard?.writeText)navigator.clipboard.writeText(value).then(done).catch(fallback);else fallback()};$('carDetailBody').querySelectorAll('.copy-inline').forEach(b=>b.onclick=e=>{e.stopPropagation();copyValue(b.dataset.copy)});$('carDetailBody').querySelectorAll('[data-copy-value]').forEach(b=>b.onclick=e=>{e.stopPropagation();copyValue(b.dataset.copyValue)});$('carDetailBody').querySelector('.add-tx-btn')?.addEventListener('click',()=>showTxEditor(c));$('carDetailBody').querySelectorAll('[data-receipt]').forEach(b=>b.onclick=()=>showReceipt(c,(c.transactions||[]).find(t=>t.id===b.dataset.receipt)));$('carDetailBody').querySelectorAll('[data-edit-tx]').forEach(b=>b.onclick=()=>showTxEditor(c,(c.transactions||[]).find(t=>t.id===b.dataset.editTx)));$('carDetailBody').querySelectorAll('[data-delete-tx]').forEach(b=>b.onclick=()=>{const t=(c.transactions||[]).find(t=>t.id===b.dataset.deleteTx);if(t&&confirm('این تراکنش حذف شود؟')){c.transactions=c.transactions.filter(x=>x.id!==t.id);save();syncCarEvents(c);openDetails(c.id,'tx');render()}});const body=$('carDetailBody'),search=body.querySelector('.tx-search'),kind=body.querySelector('.tx-kind-filter'),cat=body.querySelector('.tx-category-filter'),clear=body.querySelector('.tx-clear-filters'),clearSearch=body.querySelector('.tx-search-clear');const apply=()=>{const q=(search?.value||'').trim().toLowerCase(),k=kind?.value||'all',ct=cat?.value||'all';let n=0;body.querySelectorAll('.tx-row').forEach(row=>{const text=row.dataset.txSearch||'',matchQ=!q||text.includes(q),matchK=k==='all'||row.dataset.txKind===k,matchC=ct==='all'||row.querySelector('.tx-category-label')?.textContent===ct;const show=matchQ&&matchK&&matchC;row.hidden=!show;if(show)n++});const count=body.querySelector('.tx-result-count');if(count)count.textContent=`${fmt(n)} تراکنش`;};search?.addEventListener('input',apply);kind?.addEventListener('change',apply);cat?.addEventListener('change',apply);clearSearch?.addEventListener('click',()=>{if(search){search.value='';apply();search.focus()}});clear?.addEventListener('click',()=>{if(search)search.value='';if(kind)kind.value='all';if(cat)cat.value='all';apply()})}
  function showTxEditor(c,edit){const host=$('carDetailBody');host.innerHTML=`<div class="back-to-detail"><button id="txBack">‹ بازگشت به دفتر تراکنش</button></div>${transactionForm(c,edit)}`;const form=host.querySelector('.transaction-form');form.querySelectorAll('.amount-input').forEach(el=>el.addEventListener('input',()=>formatAmount(el)));form.querySelector('.tx-cancel').onclick=()=>openDetails(c.id,'tx');form.querySelector('.tx-save').onclick=()=>saveTx(c,form,edit);const dateBtn=form.querySelector('.tx-date-btn');dateBtn.onclick=()=>openCarDatePicker(dateBtn,form.querySelector('.tx-date'));form.querySelector('.tx-receipt-preview-btn')?.addEventListener('click',()=>{});form.querySelector('.tx-receipt').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{form.dataset.receiptData=r.result;form.querySelector('.receipt-label small').textContent=f.name};r.readAsDataURL(f)};host.querySelector('#txBack').onclick=()=>openDetails(c.id,'tx')}
  function saveTx(c,form,old){const receipt=old?.receiptData||form.dataset.receiptData||'',fileName=old?.receiptName||form.querySelector('.tx-receipt')?.files?.[0]?.name||'',t=old||{id:uid()};const category=form.querySelector('.tx-category').value;const selected=form.querySelector('.tx-party-select');const partnerId=selected.value&&selected.value!=='__other'?selected.value:'';const party=partnerId?(c.partners||[]).find(p=>p.id===partnerId)?.name||'':(selected.selectedOptions[0]?.textContent||'').trim();const kind=CAPITAL_CATEGORIES.has(category)?'capital':form.querySelector('.tx-kind').value;if(CAPITAL_CATEGORIES.has(category)&&!partnerId){alert('برای خرید حواله یا تکمیل وجه، شریک پرداخت‌کننده را انتخاب کن.');return}Object.assign(t,{kind,category,amount:toNum(form.querySelector('.tx-amount').value),date:form.querySelector('.tx-date').value,partnerId,party,description:form.querySelector('.tx-desc').value.trim(),receiptData:receipt,receiptName:fileName});if(!t.amount){alert('مبلغ را وارد کن.');return}if(!c.transactions)c.transactions=[];if(!old)c.transactions.push(t);save();syncCarEvents(c);openDetails(c.id,'tx');render()}
  function showReceipt(c,t){if(!t?.receiptData)return;$('receiptTitle').textContent=t.category;$('receiptBody').innerHTML=`<div class="receipt-meta"><span>${jText(t.date)}</span><b>${money(t.amount)}</b></div><img class="receipt-image" src="${t.receiptData}" alt="رسید ${esc(t.category)}">`;openModal($('carReceiptModal'))}
  function openQuickNote(c){if(!c)return;$('carNoteTitle').textContent=c.name||'یادداشت خودرو';$('carNoteInput').value=c.notes||'';$('carNoteModal').dataset.carId=c.id;openModal($('carNoteModal'));setTimeout(()=>$('carNoteInput').focus(),120)}
  function deleteCar(c){if(!c||!confirm(`خودروی «${c.name}» حذف شود؟`))return;cars=cars.filter(x=>x.id!==c.id);save();let events=[];try{events=JSON.parse(localStorage.getItem('finance-events')||'[]')}catch{}localStorage.setItem('finance-events',JSON.stringify(events.filter(e=>e.carId!==c.id)));render()}


  function weightedCalculator(){
    const modal=$('carWeightedModal'),sel=$('weightedCarSelect');
    sel.innerHTML='<option value="">بدون اتصال به خودرو</option>'+cars.map(c=>`<option value="${c.id}">${esc(c.name||'خودرو')} · ${esc(c.ownerName||'')}</option>`).join('');
    $('weightedDeliveryDate').value=jToday();$('weightedStages').innerHTML='';addWeightedStage();addWeightedStage();recalcWeighted();openModal(modal);
  }
  function addWeightedStage(){const box=$('weightedStages'),row=document.createElement('div');row.className='weighted-stage';row.innerHTML=`<label><span>مبلغ پرداخت</span><input class="amount-input ws-amount" inputmode="numeric" placeholder="تومان"></label><label class="jalali-car-date"><span>تاریخ پرداخت</span><div class="car-date-wrap"><input class="ws-date" readonly value="${jToday()}"><button type="button" class="weighted-date-btn">▦</button></div></label><button type="button" class="weighted-remove" aria-label="حذف مرحله">×</button>`;box.appendChild(row);row.querySelector('.ws-amount').addEventListener('input',()=>{formatAmount(row.querySelector('.ws-amount'));recalcWeighted()});row.querySelector('.ws-date').addEventListener('input',recalcWeighted);row.querySelector('.weighted-date-btn').onclick=()=>openCarDatePicker(row.querySelector('.weighted-date-btn'),row.querySelector('.ws-date'));row.querySelector('.weighted-remove').onclick=()=>{row.remove();recalcWeighted()};}
  function recalcWeighted(){const delivery=$('weightedDeliveryDate')?.value,stages=[...document.querySelectorAll('.weighted-stage')].map(r=>({amount:toNum(r.querySelector('.ws-amount').value),date:r.querySelector('.ws-date').value})).filter(x=>x.amount&&x.date&&delivery),total=stages.reduce((s,x)=>s+x.amount,0),weightedSum=stages.reduce((s,x)=>s+x.amount*jDateDiff(x.date,delivery),0),first=stages.map(x=>x.date).sort()[0],days=first?jDateDiff(first,delivery):0,weighted=days?weightedSum/days:0;$('weightedTotal').textContent=money(total);$('weightedDays').textContent=fmt(days)+' روز';$('weightedAverage').textContent=money(weighted);$('weightedFormula').textContent=stages.length?stages.map(x=>`${fmt(x.amount)} × ${fmt(jDateDiff(x.date,delivery))} روز`).join(' + ')+' ÷ '+fmt(days||1):'—';const c=getCar($('weightedCarSelect')?.value),t=c?totals(c):null,box=$('weightedPartners');if(!box)return;if(c&&t?.totalCapital){box.innerHTML='<div class="weighted-partner-title">محاسبه سهم وزنی شرکا</div>'+shareRows(c).map(p=>`<div class="weighted-partner-row"><span>${esc(p.name)}</span><b>${pct(p.share)}</b><strong>${money(weighted*p.share)}</strong></div>`).join('')}else box.innerHTML='';}
  $('weightedCarSelect').addEventListener('change',recalcWeighted);
  $('carWeightedBtn').onclick=weightedCalculator;
  $('weightedAddStage').onclick=addWeightedStage;
  $('weightedDeliveryDate').addEventListener('input',recalcWeighted);
  function cumulative(){const sold=cars.filter(c=>c.status==='sold');const deals=sold.length,starts=sold.map(c=>c.registerDate).filter(Boolean).sort(),capital=sold.reduce((s,c)=>s+userShare(c).mineCap,0),profit=sold.reduce((s,c)=>s+userShare(c).profit,0),avgRate=capital?profit/capital*100:0;$('cumulativeBody').innerHTML=`<div class="cumulative-grid"><div><span>تعداد معاملات</span><b>${fmt(deals)}</b></div><div><span>شروع اولین معامله</span><b>${starts.length?jText(starts[0]):'—'}</b></div><div><span>آورده من</span><b>${money(capital)}</b></div><div><span>سود تجمعی من</span><b class="${profit>=0?'positive':'negative'}">${money(profit)}</b></div><div><span>بازده تجمعی</span><b>${pct(avgRate)}</b></div><div><span>میانگین سود هر معامله</span><b>${money(deals?profit/deals:0)}</b></div></div><div class="cumulative-list">${sold.map(c=>{const u=userShare(c);return `<div><span>${esc(c.name)}</span><b>${money(u.profit)}</b><small>${jText(c.saleDate)}</small></div>`}).join('')||'<p class="detail-empty">هنوز معامله فروخته‌شده‌ای ندارید.</p>'}</div>`;openModal($('carCumulativeModal'))}
  $('carCumulativeBtn').onclick=cumulative;
  root.querySelectorAll('.car-status-tab').forEach(b=>b.addEventListener('click',()=>{activeCarTab=b.dataset.carStatusTab;render()}));

  // One Jalali picker for all four vehicle-form dates. This is the only
  // vehicle date-picker binding; use delegation so the buttons keep working
  // even when the form/modal is opened or re-rendered.
  const picker=$('carDatePicker'),grid=$('carDateGrid'),title=$('carDateTitle');let pickerY=0,pickerM=0,targetInput=null;
  if(picker && picker.parentElement!==document.body) document.body.appendChild(picker);
  function openCarDatePicker(btn,input){
    if(!picker||!input)return;
    targetInput=input;
    const v=/^\d{4}-\d{2}-\d{2}$/.test(input.value)?input.value:jToday(),a=v.split('-').map(Number);
    pickerY=a[0];pickerM=a[1];renderCarDatePicker();
    const r=btn.getBoundingClientRect(),w=Math.min(300,window.innerWidth-20),h=Math.min(360,window.innerHeight-20);
    let left=Math.max(10,Math.min(window.innerWidth-w-10,r.left));
    let top=r.bottom+6;
    if(top+h>window.innerHeight-10) top=Math.max(10,r.top-h-6);
    picker.style.width=w+'px';picker.style.left=left+'px';picker.style.top=top+'px';picker.style.right='auto';picker.hidden=false;
  }
  function renderCarDatePicker(){title.textContent=`${months[pickerM-1]} ${pickerY}`;grid.innerHTML='';const [gy,gm,gd]=j2g(pickerY,pickerM,1),first=(new Date(gy,gm-1,gd).getDay()+1)%7;for(let i=0;i<first;i++)grid.appendChild(document.createElement('span'));let len=pickerM<7?31:pickerM<12?30:((()=>{const g=j2g(pickerY,pickerM,30),b=g2j(...g);return b[2]===30?30:29})());for(let d=1;d<=len;d++){const b=document.createElement('button');b.type='button';b.textContent=pad(d);if(targetInput?.value===`${pickerY}-${pad(pickerM)}-${pad(d)}`)b.classList.add('selected');b.onclick=e=>{e.stopPropagation();targetInput.value=`${pickerY}-${pad(pickerM)}-${pad(d)}`;picker.hidden=true;targetInput.dispatchEvent(new Event('input',{bubbles:true}))};grid.appendChild(b)}}
  $('carDatePrev').onclick=e=>{e.preventDefault();e.stopPropagation();pickerM--;if(pickerM<1){pickerM=12;pickerY--}renderCarDatePicker()};$('carDateNext').onclick=e=>{e.preventDefault();e.stopPropagation();pickerM++;if(pickerM>12){pickerM=1;pickerY++}renderCarDatePicker()};
  picker.addEventListener('click',e=>e.stopPropagation());
  document.addEventListener('click',e=>{
    const btn=e.target.closest?.('[data-date-target]');
    if(btn){e.preventDefault();e.stopPropagation();const input=$(btn.dataset.dateTarget);if(input)openCarDatePicker(btn,input);return;}
    if(!e.target.closest?.('.car-date-pop,.tx-date-btn,.weighted-date-btn'))picker.hidden=true;
  },true);

  // Global amount formatting for vehicle forms; no maxlength is ever applied.
  root.addEventListener('input',e=>{if(e.target.classList.contains('amount-input'))formatAmount(e.target)});
  root.querySelectorAll('[data-copy-input]').forEach(btn=>btn.addEventListener('click',()=>{const v=$(btn.dataset.copyInput).value;navigator.clipboard?.writeText(v).then(()=>{const old=btn.textContent;btn.textContent='کپی شد';setTimeout(()=>btn.textContent=old,900)}).catch(()=>{})}));
  root.querySelectorAll('#carNationalId,#carRequestNo,#carAdmissionNo').forEach(i=>i.addEventListener('click',()=>{if(i.value)navigator.clipboard?.writeText(i.value)}));

  render();
})();

/* ================= Finance Dashboard / Portfolio ================= */
(()=>{
  const $=id=>document.getElementById(id); if(!$('fmAssetsList')) return;
  const APP_VERSION='2.8.1';
  const STORE='finance-portfolio-v1',CAT='finance-asset-categories-v1',SET='finance-dashboard-settings-v1',SNAP='finance-portfolio-snapshots-v1',MARKET='finance-market-v1',TX='finance-portfolio-transactions-v1',ASSET_DEF='finance-asset-definitions-v1';
  const marketDefs=[{"name":"دلار","key":"USD","keyword":"USD","category":"ارزها","enabled":true},{"name":"طلای 18 عیار","key":"GOLD18","keyword":"IR_GOLD_18K","category":"طلا و سکه","enabled":true},{"name":"طلای 24 عیار","key":"GOLD24","keyword":"IR_GOLD_24K","category":"طلا و سکه","enabled":true},{"name":"سکه امامی","key":"EMAMI","keyword":"IR_COIN_EMAMI","category":"طلا و سکه","enabled":true},{"name":"سکه بهار آزادی","key":"BAHAR","keyword":"IR_COIN_BAHAR","category":"طلا و سکه","enabled":true},{"name":"نیم سکه","key":"HALF","keyword":"IR_COIN_HALF","category":"طلا و سکه","enabled":true},{"name":"ربع سکه","key":"QUARTER","keyword":"IR_COIN_QUARTER","category":"طلا و سکه","enabled":true},{"name":"انس طلا","key":"XAU","keyword":"XAUUSD","category":"فلزات گران‌بها","enabled":true},{"name":"انس نقره","key":"XAG","keyword":"XAGUSD","category":"فلزات گران‌بها","enabled":true},{"name":"مس","key":"COPPER","keyword":"Cu","category":"فلزات پایه","enabled":true},{"name":"نفت برنت","key":"BRENT","keyword":"BRENT","category":"انرژی","enabled":true},{"name":"تتر","key":"USDT","keyword":"USDT","category":"رمزارزها","enabled":true},{"name":"بیت‌کوین","key":"BTC","keyword":"BTC","category":"رمزارزها","enabled":true},{"name":"اتریوم","key":"ETH","keyword":"ETH","category":"رمزارزها","enabled":true},{"name":"سولانا","key":"SOL","keyword":"SOL","category":"رمزارزها","enabled":true},{"name":"انس پلاتین","key":"XPTUSD","keyword":"XPTUSD","category":"فلزات گران‌بها","enabled":true},{"name":"انس پالادیوم","key":"XPDUSD","keyword":"XPDUSD","category":"فلزات گران‌بها","enabled":true},{"name":"آلومینیوم","key":"Al","keyword":"Al","category":"فلزات پایه","enabled":true},{"name":"روی","key":"Zn","keyword":"Zn","category":"فلزات پایه","enabled":true},{"name":"سرب","key":"Pb","keyword":"Pb","category":"فلزات پایه","enabled":true},{"name":"قلع","key":"Sn","keyword":"Sn","category":"فلزات پایه","enabled":true},{"name":"نیکل","key":"Ni","keyword":"Ni","category":"فلزات پایه","enabled":true},{"name":"نفت سبک","key":"WTI","keyword":"WTI","category":"انرژی","enabled":true},{"name":"گاز طبیعی","key":"GAS","keyword":"GAS","category":"انرژی","enabled":true},{"name":"بنزین","key":"RBOB","keyword":"RBOB","category":"انرژی","enabled":true},{"name":"گازوییل","key":"GASOIL","keyword":"GASOIL","category":"انرژی","enabled":true},{"name":"طلای آب‌شده نقدی","key":"IR_GOLD_MELTED","keyword":"IR_GOLD_MELTED","category":"طلا و سکه","enabled":true},{"name":"سکه یک گرمی","key":"IR_COIN_1G","keyword":"IR_COIN_1G","category":"طلا و سکه","enabled":true},{"name":"دلار تتر","key":"USDT_IRT","keyword":"USDT_IRT","category":"ارزها","enabled":true},{"name":"یورو","key":"EUR","keyword":"EUR","category":"ارزها","enabled":true},{"name":"درهم امارات","key":"AED","keyword":"AED","category":"ارزها","enabled":true},{"name":"پوند","key":"GBP","keyword":"GBP","category":"ارزها","enabled":true},{"name":"یکصد ین ژاپن","key":"JPY","keyword":"JPY","category":"ارزها","enabled":true},{"name":"دینار کویت","key":"KWD","keyword":"KWD","category":"ارزها","enabled":true},{"name":"دلار استرالیا","key":"AUD","keyword":"AUD","category":"ارزها","enabled":true},{"name":"دلار کانادا","key":"CAD","keyword":"CAD","category":"ارزها","enabled":true},{"name":"یوآن چین","key":"CNY","keyword":"CNY","category":"ارزها","enabled":true},{"name":"لیر ترکیه","key":"TRY","keyword":"TRY","category":"ارزها","enabled":true},{"name":"ریال عربستان","key":"SAR","keyword":"SAR","category":"ارزها","enabled":true},{"name":"فرانک سوئیس","key":"CHF","keyword":"CHF","category":"ارزها","enabled":true},{"name":"روپیه هند","key":"INR","keyword":"INR","category":"ارزها","enabled":true},{"name":"روپیه پاکستان","key":"PKR","keyword":"PKR","category":"ارزها","enabled":true},{"name":"دینار عراق","key":"IQD","keyword":"IQD","category":"ارزها","enabled":true},{"name":"لیر سوریه","key":"SYP","keyword":"SYP","category":"ارزها","enabled":true},{"name":"کرون سوئد","key":"SEK","keyword":"SEK","category":"ارزها","enabled":true},{"name":"ریال قطر","key":"QAR","keyword":"QAR","category":"ارزها","enabled":true},{"name":"ریال عمان","key":"OMR","keyword":"OMR","category":"ارزها","enabled":true},{"name":"دینار بحرین","key":"BHD","keyword":"BHD","category":"ارزها","enabled":true},{"name":"افغانی","key":"AFN","keyword":"AFN","category":"ارزها","enabled":true},{"name":"رینگیت مالزی","key":"MYR","keyword":"MYR","category":"ارزها","enabled":true},{"name":"بات تایلند","key":"THB","keyword":"THB","category":"ارزها","enabled":true},{"name":"روبل روسیه","key":"RUB","keyword":"RUB","category":"ارزها","enabled":true},{"name":"منات آذربایجان","key":"AZN","keyword":"AZN","category":"ارزها","enabled":true},{"name":"درام ارمنستان","key":"AMD","keyword":"AMD","category":"ارزها","enabled":true},{"name":"لاری گرجستان","key":"GEL","keyword":"GEL","category":"ارزها","enabled":true},{"name":"ایکس‌آر‌پی","key":"XRP","keyword":"XRP","category":"رمزارزها","enabled":true},{"name":"بی‌ان‌بی","key":"BNB","keyword":"BNB","category":"رمزارزها","enabled":true},{"name":"یواس‌دی کوین","key":"USDC","keyword":"USDC","category":"رمزارزها","enabled":true},{"name":"دوج‌کوین","key":"DOGE","keyword":"DOGE","category":"رمزارزها","enabled":true},{"name":"کاردانو","key":"ADA","keyword":"ADA","category":"رمزارزها","enabled":true},{"name":"ترون","key":"TRX","keyword":"TRX","category":"رمزارزها","enabled":true},{"name":"چین‌لینک","key":"LINK","keyword":"LINK","category":"رمزارزها","enabled":true},{"name":"آوالانچ","key":"AVAX","keyword":"AVAX","category":"رمزارزها","enabled":true},{"name":"استلار","key":"XLM","keyword":"XLM","category":"رمزارزها","enabled":true},{"name":"شیبا اینو","key":"SHIB","keyword":"SHIB","category":"رمزارزها","enabled":true},{"name":"پولکادات","key":"DOT","keyword":"DOT","category":"رمزارزها","enabled":true},{"name":"لایت‌کوین","key":"LTC","keyword":"LTC","category":"رمزارزها","enabled":true},{"name":"یونی‌سواپ","key":"UNI","keyword":"UNI","category":"رمزارزها","enabled":true},{"name":"فایل‌کوین","key":"FIL","keyword":"FIL","category":"رمزارزها","enabled":true},{"name":"کازماس","key":"ATOM","keyword":"ATOM","category":"رمزارزها","enabled":true}];
  const defaultCats=[{id:'gold',name:'طلا',icon:'🪙',color:'#c59b35'},{id:'crypto',name:'ارز دیجیتال',icon:'₿',color:'#8b78e6'},{id:'currency',name:'ارز',icon:'💵',color:'#2b9d78'},{id:'coin',name:'سکه',icon:'🟡',color:'#d37b3b'},{id:'stock',name:'بورس',icon:'📈',color:'#3d8ed8'},{id:'cash',name:'نقدینگی',icon:'💳',color:'#5c879f'}];
  const emojis=['🪙','💰','💵','💶','🟡','₿','Ξ','◎','📈','📊','🏠','🚗','💳','🏦','💎','📦','🛢️','🔩','🌐','⭐','💼','🎯','🧾','🔑','🥇','🥈','🥉','🪙','🧿','🖥️','📱','⚙️','🎮','🚘','🏢','🌱','🪵','🧱','🔋','⚡'];
  const palette=['#c59b35','#8b78e6','#2b9d78','#d37b3b','#3d8ed8','#5c879f','#b75a77','#5c70c9','#2f9c95','#7b6f5a','#d45b5b','#e08a35','#3d7fd6','#7a58b8','#238b8b','#8a6a42','#4f9d69','#ad5d9e','#63758c','#a65f3f'];
  let assets=read(STORE,[]),categories=read(CAT,null)||defaultCats.map(x=>({...x})),settings=read(SET,{refreshHours:1,apiUrl:'https://brsapi.ir',apiKey:'B5nkrcZaHTwxR29G4w2CqhqXdKeWnE5r',apiPriceUnit:'toman'}),snapshots=read(SNAP,[]),market=read(MARKET,{}),transactions=read(TX,[]),assetDefinitions=read(ASSET_DEF,[]);
  if(!settings.apiUrl)settings.apiUrl='https://brsapi.ir';
  if(!settings.apiKey)settings.apiKey='B5nkrcZaHTwxR29G4w2CqhqXdKeWnE5r';
  if(!categories.some(c=>String(c.id)==='vehicle')){categories.push({id:'vehicle',name:'خودرو',icon:'🚗',color:'#3d8ed8',locked:true});write(CAT,categories)}
  assets.forEach(a=>{if(a.initialQuantity==null){const net=transactions.filter(t=>String(t.assetId)===String(a.id)).reduce((n,t)=>n+(t.type==='buy'?1:-1)*(Number(t.quantity)||0),0);a.initialQuantity=Math.max(0,(Number(a.quantity)||0)-net);a.initialBuyPrice=Number(a.buyPrice)||0;}});
  const savedDefs=Array.isArray(settings.marketDefs)?settings.marketDefs:[];
  const firstApiKeywordMigration=settings.marketDefsVersion!==2;
  const mergedMarketDefs=marketDefs.map(base=>{const saved=savedDefs.find(x=>String(x.key)===String(base.key));if(!saved)return {...base};return firstApiKeywordMigration?{...base,name:saved.name||base.name,key:saved.key||base.key,enabled:saved.enabled!==false,category:base.category}:{...base,...saved,category:saved.category||base.category}});
  const savedCustomMarketDefs=savedDefs.filter(x=>!marketDefs.some(b=>String(b.key)===String(x.key))).map(x=>({...x,category:x.category||'سفارشی'}));
  if(firstApiKeywordMigration || !savedDefs.length || savedDefs.length!==mergedMarketDefs.length+savedCustomMarketDefs.length){settings.marketDefs=[...mergedMarketDefs,...savedCustomMarketDefs];settings.marketDefsVersion=2;write(SET,settings)}
  const ui=Object.assign({numberMode:'exact',assetsView:'list',assetSort:'value-desc',pnlPeriod:'daily',chartUnit:'toman',privacy:false,searchToolsCollapsed:false,chartCollapsed:false},settings.ui||{});
  let numberMode=ui.numberMode,assetsView=ui.assetsView,assetSort=ui.assetSort,pnlPeriod=ui.pnlPeriod,chartUnit=ui.chartUnit,privacy=!!ui.privacy,timer=null,swipeState={};
  function saveUi(){settings.ui={...(settings.ui||{}),numberMode,assetsView,assetSort,pnlPeriod,chartUnit,privacy};write(SET,settings)}
  function applyDashboardUi(){
    const tools=$('fmDashboardTools'),chart=$('fmChartCard');
    if(tools)tools.classList.toggle('is-collapsed',!!settings.ui?.searchToolsCollapsed);
    if(chart)chart.classList.toggle('is-collapsed',!!settings.ui?.chartCollapsed);
    const searchBtn=$('fmDashboardToolsToggle'),chartBtn=$('fmChartToggle');
    if(searchBtn)searchBtn.setAttribute('aria-label',settings.ui?.searchToolsCollapsed?'نمایش جستجو و فیلتر':'مخفی کردن جستجو و فیلتر');
    if(chartBtn)chartBtn.setAttribute('aria-label',settings.ui?.chartCollapsed?'نمایش نمودار':'مخفی کردن نمودار');
  }
  function syncDashboardSelections(){
    const groups=[['fmNumberTabs','numberMode'],['fmViewTabs','assetsView'],['fmPnlTabs','pnlPeriod'],['fmChartTabs','chartUnit']];
    groups.forEach(([id,key])=>{const root=$(id);if(!root)return;root.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset[key]===({'numberMode':numberMode,'assetsView':assetsView,'pnlPeriod':pnlPeriod,'chartUnit':chartUnit}[key])))});
  }
  const fmt=n=>new Intl.NumberFormat('fa-IR',{maximumFractionDigits:2}).format(Number(n)||0);
  const norm=s=>String(s??'').toLowerCase().replace(/[۰-۹]/g,d=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g,d=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[\s_\-ـ]/g,'').trim();
  const num=s=>Number(norm(s).replace(/[,٬,]/g,''))||0;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
  function read(k,d){try{return JSON.parse(localStorage.getItem(k)||'null')??d}catch{return d}} function write(k,v){localStorage.setItem(k,JSON.stringify(v))}
  function assetDefKey(name,unit=''){return `${norm(name)}|${norm(unit||'واحد')}`}
  function ensureAssetDefinitions(){let changed=false;const defs=Array.isArray(assetDefinitions)?assetDefinitions:[];for(const a of assets){if(a.definitionId&&defs.some(d=>String(d.id)===String(a.definitionId)))continue;const key=assetDefKey(a.name,a.unit);let d=defs.find(x=>assetDefKey(x.name,x.unit)===key);if(!d){d={id:uid(),name:String(a.name||'دارایی'),category:a.category||categories[0]?.id||'',unit:a.unit||'واحد',priceMode:a.priceMode||'manual',keyword:a.keyword||'',icon:a.icon||'◌',createdAt:Date.now()};defs.push(d)}a.definitionId=d.id;changed=true}assetDefinitions=defs;if(changed){write(ASSET_DEF,assetDefinitions);write(STORE,assets)}}
  ensureAssetDefinitions();
  function toast(t){let x=$('fmToast');if(!x){x=document.createElement('div');x.id='fmToast';x.className='fm-toast';document.body.appendChild(x)}x.textContent=t;x.classList.add('show');clearTimeout(x._t);x._t=setTimeout(()=>x.classList.remove('show'),1900)}
  function cat(id){return categories.find(c=>String(c.id)===String(id))||{id:'other',name:'بدون دسته',icon:'◌',color:'#667'}}
  function carAssets(){
    try{
      const cars=JSON.parse(localStorage.getItem('finance-cars-v1')||'[]');
      return cars.filter(c=>c.status!=='sold').map(c=>{
        const tx=c.transactions||[], capital=tx.filter(t=>CAPITAL_CATEGORIES_LOCAL.has(t.category)||t.kind==='capital').reduce((s,t)=>s+(Number(t.amount)||0),0);
        const costs=tx.filter(t=>t.kind==='payment'&&!CAPITAL_CATEGORIES_LOCAL.has(t.category)).reduce((s,t)=>s+(Number(t.amount)||0),0);
        const market=Number(c.marketPrice)||0;
        const totalCost=capital+costs;
        const saleIncome=tx.filter(t=>t.category==='فروش'&&t.kind==='income').reduce((s,t)=>s+(Number(t.amount)||0),0);
        const income=tx.filter(t=>t.kind==='income').reduce((s,t)=>s+(Number(t.amount)||0),0);
        const potential=Math.max(0,(income+(market-saleIncome))-totalCost);
        const mine=(c.partners||[]).find(p=>p.isMe||p.name==='من');
        const caps={};tx.filter(t=>CAPITAL_CATEGORIES_LOCAL.has(t.category)||t.kind==='capital').forEach(t=>{if(t.partnerId)caps[t.partnerId]=(caps[t.partnerId]||0)+(Number(t.amount)||0)});
        const totalCap=Object.values(caps).reduce((s,v)=>s+v,0)||capital;
        const mineCap=mine?(caps[mine.id]||0):0,share=totalCap?mineCap/totalCap:(mine?1:0);
        const userCapital=totalCost*share, userPotential=potential*share;
        const start=c.registerDate,end=c.deliveryDate;
        let elapsed=0,totalDays=0;
        if(start&&end){
          const j2g=(jy,jm,jd)=>{const d=(a,b)=>Math.floor(a/b),j=jy+1595;let days=-355668+365*j+d(j,33)*8+d(j%33+3,4)+jd+(jm<7?(jm-1)*31:(jm-7)*30+186),gy=400*d(days,146097);days%=146097;if(days>36524){gy+=100*d(--days,36524);days%=36524;if(days>=365)days++}gy+=4*d(days,1461);days%=1461;if(days>365){gy+=d(days-1,365);days=(days-1)%365}let gd=days+1,ml=[31,(gy%4===0&&gy%100!==0)||gy%400===0?29:28,31,30,31,30,31,31,31,30,31,30,31],gm=0;while(gd>ml[gm])gd-=ml[gm++];return[gy,gm+1,gd]};
          const today=(()=>{const d=new Date(),g=[d.getFullYear(),d.getMonth()+1,d.getDate()];const div=(a,b)=>Math.floor(a/b),gdm=[0,31,59,90,120,151,181,212,243,273,304,334],gy2=g[1]>2?g[0]+1:g[0],days=355666+365*g[0]+div(gy2+3,4)-div(gy2+99,100)+div(gy2+399,400)+g[2]+gdm[g[1]-1],jy=-1595+33*div(days,12053);let r=days%12053;const yy=jy+4*div(r,1461);r%=1461;const yyy=r>365?yy+div(r-1,365):yy,dd=r>365?(r-1)%365:r;return [yyy,dd<186?1+div(dd,31):7+div(dd-186,30),1+(dd<186?dd%31:(dd-186)%30)]})();
          const a=j2g(...start.split('-').map(Number)),b=j2g(...end.split('-').map(Number)),n=j2g(...today);
          totalDays=Math.max(0,Math.round((Date.UTC(b[0],b[1]-1,b[2])-Date.UTC(a[0],a[1]-1,a[2]))/86400000));
          elapsed=Math.max(0,Math.min(totalDays,Math.round((Date.UTC(n[0],n[1]-1,n[2])-Date.UTC(a[0],a[1]-1,a[2]))/86400000)));
        }
        const accrued=totalDays?userPotential*(elapsed/totalDays):0;
        return {id:`vehicle:${c.id}`,vehicleId:c.id,isVehicle:true,name:c.name||'خودرو',category:'vehicle',icon:'🚗',unit:'دستگاه',quantity:1,buyPrice:userCapital,currentPrice:userCapital+accrued,pnl:accrued,vehicle:c};
      });
    }catch{return []}
  }
  const CAPITAL_CATEGORIES_LOCAL=new Set(['خرید حواله','تکمیل وجه']);
  function portfolioAssets(){return [...assets,...carAssets()]}
  function totalAsset(a){return a.isVehicle?Math.max(0,Number(a.currentPrice)||0):Math.max(0,Number(a.quantity)||0)*(Number(a.currentPrice)||0)}
  function buyValue(a){return a.isVehicle?Math.max(0,Number(a.buyPrice)||0):Math.max(0,Number(a.quantity)||0)*(Number(a.buyPrice)||0)}
  function assetPosition(a){
    if(a?.isVehicle)return {qty:1,cost:a.buyPrice||0,avgCost:a.buyPrice||0,currentValue:a.currentPrice||0,realized:0,unrealized:a.pnl||0,totalPnl:a.pnl||0,pnlPercent:a.buyPrice?((a.pnl||0)/a.buyPrice*100):0,totalBought:a.buyPrice||0,buyCount:1,sellCount:0};

    const txs=txList(a.id).slice().sort((x,y)=>String(x.date).localeCompare(String(y.date))||(Number(x.createdAt)||0)-(Number(y.createdAt)||0));
    let qty=Math.max(0,Number(a.initialQuantity??a.quantity)||0),cost=Math.max(0,qty*Number(a.initialBuyPrice??a.buyPrice)||0);
    let realized=0,totalBought=cost,buyCount=0,sellCount=0;
    txs.forEach(t=>{
      const q=Math.max(0,Number(t.quantity)||0),p=Math.max(0,Number(t.price)||0);
      if(!q||!p)return;
      if(t.type==='buy'){cost+=q*p;qty+=q;totalBought+=q*p;buyCount++}
      else if(t.type==='sell'&&qty>0){
        const avg=cost/qty;
        const sold=Math.min(q,qty);
        realized+=sold*(p-avg);
        cost=Math.max(0,cost-sold*avg);
        qty=Math.max(0,qty-sold);
        sellCount++;
      }
    });
    const avgCost=qty>0?cost/qty:0,currentValue=qty*Math.max(0,Number(a.currentPrice)||0);
    const unrealized=currentValue-cost,totalPnl=realized+unrealized;
    const pnlBase=totalBought>0?totalBought:(cost>0?cost:0);
    return {qty,cost,avgCost,currentValue,realized,unrealized,totalPnl,pnlPercent:pnlBase?totalPnl/pnlBase*100:0,totalBought,buyCount,sellCount};
  }
  function totalPortfolio(){return portfolioAssets().reduce((s,a)=>s+totalAsset(a),0)}
  function totalCost(){return portfolioAssets().reduce((s,a)=>s+buyValue(a),0)}
  function pnl(){return portfolioAssets().reduce((s,a)=>s+assetPosition(a).totalPnl,0)}
  function rebuildAsset(a){
    if(!a)return;
    const p=assetPosition(a);
    a.quantity=p.qty;
    a.buyPrice=p.avgCost;
    write(STORE,assets);
    return p;
  }
  function snapshot(){const now=Date.now(),t=totalPortfolio();snapshots=snapshots.filter(x=>now-x.t<370*864e5);snapshots.push({t,v:t,usd:Number(market.USD?.price)||0,gold:Number(market.GOLD18?.price)||0});write(SNAP,snapshots.slice(-500));return t}
  function priorSnapshot(days){const target=Date.now()-days*864e5;let best=null,d=Infinity;snapshots.forEach(x=>{const dd=Math.abs(x.t-target);if(dd<d){d=dd;best=x}});return best}
  function periodPnl(period){const cur=totalPortfolio();if(period==='cumulative')return pnl();const s=priorSnapshot(period==='daily'?1:30);return cur-(s?.v??cur)}
  function percent(v,b){return b?100*v/b:0}
  function money(n){if(numberMode==='million'){const m=(Number(n)||0)/1e6;return `${m.toFixed(m>=100?0:1).replace(/\.0$/,'')}M`}return `${fmt(n)} تومان`}
  function masked(text='') { return privacy?'••••••':text }
  function renderSummary(){const t=totalPortfolio(),usd=Number(market.USD?.price)||0,gold=Number(market.GOLD18?.price)||0;$('fmTotalToman').textContent=masked(money(t));$('fmTotalDollar').textContent=masked(usd?`${fmt(t/usd)} $`:'—');$('fmTotalGold').textContent=masked(gold?`${fmt(t/gold)} گرم`:'—');const p=periodPnl(pnlPeriod),base=pnlPeriod==='cumulative'?totalCost():(priorSnapshot(pnlPeriod==='daily'?1:30)?.v??t);$('fmPnlValue').textContent=masked(`${p>=0?'+':''}${money(Math.abs(p))}`);$('fmPnlValue').className=p>=0?'fm-up':'fm-down';$('fmPnlRate').textContent=masked(`${p>=0?'▲':'▼'} ${Math.abs(percent(p,base)).toFixed(2)}٪`);$('fmPnlRate').className=p>=0?'fm-up':'fm-down';$('fmPrivacyToggle').innerHTML=privacy?'<svg viewBox="0 0 24 24"><path d="M3 3l18 18M10.6 10.6a2.7 2.7 0 003.8 3.8M9.9 5.2A9.8 9.8 0 0112 6c6.1 0 9.8 6 9.8 6a15.7 15.7 0 01-3.2 3.7M6.4 6.4C3.8 8.2 2.2 12 2.2 12s3.7 6 9.8 6c.7 0 1.4-.1 2-.2"/></svg>':'<svg viewBox="0 0 24 24"><path d="M2.2 12s3.7-6 9.8-6 9.8 6 9.8 6-3.7 6-9.8 6-9.8-6-9.8-6Z"/><circle cx="12" cy="12" r="2.7"/></svg>'}
  function renderMarket(){const track=$('fmMarketTrack');const defs=(settings.marketDefs?.length?settings.marketDefs:marketDefs.map(x=>({name:x.name,key:x.key,keyword:x.keyword,category:x.category,enabled:true}))).filter(x=>x.enabled!==false);const set=()=>`<div class="fm-market-set">${defs.map(x=>{const v=market[x.key]||{},p=Number(v.price)||0,ch=Number(v.change)||0;return `<article class="fm-market-card"><div class="fm-market-name"><b>${esc(x.name)}</b><span>${esc(x.key)}</span></div><div class="fm-market-price ${ch>0?'fm-up':ch<0?'fm-down':'fm-neutral'}">${p?fmt(p):'—'} <span>(${ch>0?'+':''}${ch?ch.toFixed(2):'۰'}٪)</span></div></article>`}).join('')}</div>`;track.innerHTML=set()+set()}
  function renderFilters(){$('fmCategoryFilter').innerHTML='<option value="all">همه دسته‌ها</option>'+categories.map(c=>`<option value="${esc(c.id)}">${esc(c.icon)} ${esc(c.name)}</option>`).join('')}
  function filteredAssets(){const q=norm($('fmAssetSearch').value),cf=$('fmCategoryFilter').value,sf=$('fmSourceFilter').value;let a=portfolioAssets().filter(x=>((x.isVehicle||totalAsset(x)>0||((x.priceMode||'manual')==='api'&&Number(x.quantity)>0)))&&(!q||norm(`${x.name} ${x.keyword} ${cat(x.category).name}`).includes(q))&&(cf==='all'||String(x.category)===cf)&&(sf==='all'||(x.priceMode||'manual')===sf));a.sort((x,y)=>assetSort==='value-asc'?totalAsset(x)-totalAsset(y):assetSort==='name'?String(x.name).localeCompare(String(y.name),'fa'):assetSort==='category'?cat(x.category).name.localeCompare(cat(y.category).name,'fa'):totalAsset(y)-totalAsset(x));return a}
  function renderAssets(){const list=$('fmAssetsList'),donut=$('fmDonutView'),visible=filteredAssets(),by={};visible.forEach(a=>(by[a.category]??=[]).push(a));const allBy={};portfolioAssets().forEach(a=>(allBy[a.category]??=[]).push(a));const fullGrand=totalPortfolio();const groups=Object.entries(by).map(([id,arr])=>({c:cat(id),arr,total:arr.reduce((s,a)=>s+totalAsset(a),0),fullTotal:(allBy[id]||[]).reduce((s,a)=>s+totalAsset(a),0)})).sort((a,b)=>b.total-a.total);list.innerHTML=groups.length?groups.map(g=>`<section class="fm-category"><div class="fm-category-head" style="--fm-cat:${g.c.color}"><div class="fm-category-name">${esc(g.c.icon)} ${esc(g.c.name)} <span>(${fullGrand?(g.fullTotal/fullGrand*100).toFixed(1):'0'}٪)</span></div><div class="fm-category-total">${money(g.total)}</div></div><div class="fm-category-assets">${g.arr.map(a=>{const share=g.fullTotal?totalAsset(a)/g.fullTotal*100:0;return assetCard(a,share)}).join('')}</div></section>`).join(''):'<div class="fm-history-placeholder">هنوز دارایی‌ای ثبت نشده است. از «افزودن دارایی» شروع کن.</div>';if(assetsView==='donut'){list.hidden=true;donut.hidden=false;renderDonut(fullGrand)}else{list.hidden=false;donut.hidden=true}bindSwipes()}
  function assetCard(a,share){
    const p=assetPosition(a), pnlClass=p.totalPnl>0?'positive':p.totalPnl<0?'negative':'neutral';
    const right=`<div class="fm-swipe-actions right"><button class="buy" data-buy="${a.id}" aria-label="خرید"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></button><button class="sell" data-sell="${a.id}" aria-label="فروش"><svg viewBox="0 0 24 24"><path d="M5 12h14"/></svg></button><button class="ledger" data-ledger="${a.id}" aria-label="دفتر خرید و فروش"><svg viewBox="0 0 24 24"><path d="M6 4h12v16H6zM9 8h6M9 12h6M9 16h4"/></svg></button></div>`,
    left=`<div class="fm-swipe-actions left"><button class="edit" data-fm-edit="${a.id}" aria-label="ویرایش"><svg viewBox="0 0 24 24"><path d="M4 20l4.2-.9L19 8.3a2 2 0 00-3-3L5.2 16.1 4 20Z"/></svg></button><button class="delete" data-fm-delete="${a.id}" aria-label="حذف"><svg viewBox="0 0 24 24"><path d="M5 7h14M10 11v6M14 11v6M8 7l1-3h6l1 3M7 7l1 14h8l1-14"/></svg></button><button class="note" data-note="${a.id}" aria-label="یادداشت"><svg viewBox="0 0 24 24"><path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5"/></svg></button></div>`;
    return `<article class="fm-asset-shell${a.isVehicle?' fm-vehicle-asset':''}" data-asset-id="${a.id}" ${a.isVehicle?`data-vehicle-id="${esc(a.vehicleId)}"`:''}>${a.isVehicle?'':left}<div class="fm-asset-card">
      <button type="button" class="fm-asset-details-btn" data-details="${a.id}" aria-label="جزئیات دارایی">${a.isVehicle?'↗':'⋮'}</button>
      <div class="fm-asset-pnl ${pnlClass}"><span>سود و زیان دارایی</span><b>(${money(p.totalPnl)} · ${p.pnlPercent.toFixed(2)}٪)</b></div>
      <div class="fm-asset-icon">${esc(a.icon||'◌')}</div>
      <div class="fm-asset-main"><div class="fm-asset-name">${esc(a.name)}</div><div class="fm-asset-meta"><span>مقدار: ${fmt(p.qty)} ${esc(a.unit||'واحد')}</span><span>ارزش فعلی: ${money(a.currentPrice)}</span><span>${a.isVehicle?'اتصال به خودرو':(a.priceMode==='api'?'API':'دستی')}</span></div>${a.note?`<div class="fm-asset-note">یادداشت: ${esc(a.note)}</div>`:''}</div>
      <div class="fm-asset-values"><div class="fm-asset-total">${money(p.currentValue)}</div><div class="fm-asset-share">${share.toFixed(1)}٪ از دسته</div></div>
    </div>${right}</article>`;
  }
  function renderDonut(grand){
    const allBy={};portfolioAssets().forEach(a=>(allBy[a.category]??=[]).push(a));
    const groups=Object.entries(allBy).map(([id,arr])=>({c:cat(id),id,total:arr.reduce((s,a)=>s+totalAsset(a),0),arr})).sort((a,b)=>b.total-a.total).filter(g=>g.total>0);
    const build=(items,total,title)=>{let acc=0;const stops=items.map(g=>{const st=acc;acc+=total?(g.total/total*100):0;return `${g.c.color} ${st}% ${acc}%`}).join(', ');return `<div class="fm-donut-block"><div class="fm-donut" style="background:conic-gradient(${stops})"><div class="fm-donut-center"><b>${privacy?'••••••':money(total)}</b><span>${esc(title)}</span></div></div><div class="fm-donut-legend">${items.map(g=>`<button type="button" class="fm-legend-row" data-donut-cat="${esc(g.id)}"><i class="fm-legend-dot" style="background:${g.c.color}"></i><div>${esc(g.c.icon)} ${esc(g.c.name)}<small>${privacy?'••••••':money(g.total)}</small></div><b>${total?(g.total/total*100).toFixed(1):0}٪</b></button>`).join('')}</div></div>`};
    if(!groups.length){$('fmDonutView').innerHTML='<div class="fm-history-placeholder">برای نمایش نمودار، ابتدا دارایی ثبت کن.</div>';return}
    $('fmDonutView').innerHTML=`<div class="fm-donut-main">${build(groups,grand,'کل پرتفوی')}</div><div id="fmCategoryDonutDetails"></div>`;
    $('fmDonutView').querySelectorAll('[data-donut-cat]').forEach(btn=>btn.onclick=()=>{const g=groups.find(x=>String(x.id)===String(btn.dataset.donutCat));if(!g)return;const el=$('fmCategoryDonutDetails');const total=g.total;el.innerHTML=build(g.arr.map(a=>({id:a.id,c:{name:a.name,icon:a.icon||'◌',color:palette[g.arr.indexOf(a)%palette.length]},total:totalAsset(a)})),total,`دارایی‌های ${g.c.name}`);el.classList.remove('fm-donut-detail-in');requestAnimationFrame(()=>el.classList.add('fm-donut-detail-in'));el.querySelectorAll('[data-donut-cat]').forEach(x=>x.disabled=true)})
  }
  function renderChart(){const canvas=$('fmGrowthChart'),empty=$('fmChartEmpty');if(!canvas)return;const ctx=canvas.getContext('2d'),r=canvas.getBoundingClientRect(),d=devicePixelRatio||1;canvas.width=Math.max(1,r.width*d);canvas.height=Math.max(1,r.height*d);ctx.setTransform(d,0,0,d,0,0);ctx.clearRect(0,0,r.width,r.height);let data=snapshots.slice(-30).map(x=>{let v=x.v;if(chartUnit==='dollar'&&x.usd)v=v/x.usd;if(chartUnit==='gold'&&x.gold)v=v/x.gold;return {...x,v}}).filter(x=>Number.isFinite(x.v));if(data.length<2){empty.hidden=false;return}empty.hidden=true;const vals=data.map(x=>x.v),max=Math.max(...vals),min=Math.min(...vals),pad=18,w=r.width,h=r.height,range=Math.max(1,max-min),accent=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();ctx.beginPath();data.forEach((x,i)=>{const px=pad+i*(w-pad*2)/Math.max(1,data.length-1),py=h-pad-((x.v-min)/range)*(h-pad*2);i?ctx.lineTo(px,py):ctx.moveTo(px,py)});ctx.lineWidth=2;ctx.strokeStyle=accent;ctx.stroke();ctx.lineTo(w-pad,h-pad);ctx.lineTo(pad,h-pad);ctx.closePath();ctx.globalAlpha=.08;ctx.fillStyle=accent;ctx.fill();ctx.globalAlpha=1;ctx.beginPath();data.forEach((x,i)=>{const px=pad+i*(w-pad*2)/Math.max(1,data.length-1),py=h-pad-((x.v-min)/range)*(h-pad*2);i?ctx.lineTo(px,py):ctx.moveTo(px,py)});ctx.strokeStyle=accent;ctx.stroke()}
  function render(){renderFilters();renderSummary();renderMarket();renderAssets();renderChart();syncDashboardSelections();applyDashboardUi();$('fmRefreshHours').value=settings.refreshHours??1;$('fmApiUrl').value=settings.apiUrl||'https://brsapi.ir';$('fmApiKey').value=settings.apiKey||'B5nkrcZaHTwxR29G4w2CqhqXdKeWnE5r';const last=localStorage.getItem('finance-market-updated-at');if(last)$('fmLastUpdate').textContent='آخرین بروزرسانی: '+new Date(Number(last)).toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit'});}
  function ensureModal(id,title,body=''){let m=$(id);if(m)return m;m=document.createElement('div');m.id=id;m.className='fm-modal';m.innerHTML=`<div class="fm-sheet"><div class="fm-sheet-head"><div><span class="section-kicker">مدیریت پرتفوی</span><h2>${title}</h2></div><button class="fm-close" type="button">×</button></div><div class="fm-modal-body">${body}</div></div>`;document.querySelector('.app-shell').appendChild(m);m.addEventListener('click',e=>{if(e.target===m||e.target.closest('.fm-close'))m.classList.remove('open')});return m}
  function emojiPicker(current,onPick){const m=ensureModal('fmEmojiPicker','انتخاب آیکون','');m.querySelector('.fm-modal-body').innerHTML=`<label class="fm-setting-field"><span>ایموجی دلخواه گوشی</span><input id="fmEmojiCustom" maxlength="8" placeholder="مثلاً 🏆"></label><button class="fm-save-setting" id="fmEmojiUse">استفاده از این ایموجی</button><div class="fm-emoji-grid">${emojis.map(e=>`<button type="button" class="fm-emoji ${e===current?'active':''}" data-pick-emoji="${e}">${e}</button>`).join('')}</div>`;m.querySelector('#fmEmojiCustom').value=current||'';m.querySelector('#fmEmojiUse').onclick=()=>{const v=m.querySelector('#fmEmojiCustom').value.trim();if(v){onPick(v);m.classList.remove('open')}};m.querySelectorAll('[data-pick-emoji]').forEach(b=>b.onclick=()=>{onPick(b.dataset.pickEmoji);m.classList.remove('open')});m.classList.add('open')}
  function categoryModal(edit){
    const m=ensureModal('fmCategoryModal','مدیریت دسته‌بندی','');m.classList.add('fm-fixed-content');
    const renderCategoryTab=()=>{
      let c=edit?cat(edit):null,icon=c?.icon||'🪙',color=c?.color||palette[0];
      m.querySelector('.fm-modal-body').innerHTML=`<div class="fm-manage-tabs"><button type="button" class="active" data-manage-tab="categories">مدیریت دسته‌بندی</button><button type="button" data-manage-tab="assets">مدیریت دارایی‌ها</button></div><div class="fm-form-grid"><label><span>نام دسته</span><input id="fmCatName" placeholder="مثلاً طلا"></label><label><span>رنگ دسته</span><div class="fm-color-picker"><input id="fmCatColor" type="color" value="${color}"><div>${palette.map(x=>`<button type="button" style="background:${x}" data-cat-color="${x}" aria-label="رنگ ${x}"></button>`).join('')}</div></div></label></div><label class="fm-full"><span>آیکون</span><div class="fm-icon-field"><input id="fmCatIcon" value="${esc(icon)}" maxlength="8" placeholder="ایموجی گوشی"><button type="button" id="fmCatIconBtn">انتخاب آماده</button></div></label><div class="fm-form-actions"><button id="fmCatCancel">انصراف</button><button class="save" id="fmCatSave">${edit?'ذخیره تغییرات':'ثبت دسته'}</button></div><div class="fm-cat-editor-list">${categories.map(x=>{const used=assets.some(a=>String(a.category)===String(x.id)),locked=x.locked||String(x.id)==='vehicle';return `<div class="fm-cat-editor"><div class="fm-cat-editor-main"><span>${esc(x.icon)}</span><b>${esc(x.name)}</b>${used?'<small>دارای دارایی</small>':''}</div><div class="fm-cat-editor-actions">${locked?'<small class="fm-cat-locked">اتصال خودکار</small>':`<button type="button" data-edit-cat="${x.id}">ویرایش</button><button type="button" class="danger" data-delete-cat="${x.id}">حذف</button>`}</div></div>`}).join('')}</div>`;
      m.querySelector('#fmCatName').value=c?.name||'';m.querySelector('#fmCatColor').value=color;
      m.querySelectorAll('[data-cat-color]').forEach(b=>b.onclick=()=>{color=b.dataset.catColor;m.querySelector('#fmCatColor').value=color});
      m.querySelector('#fmCatIconBtn').onclick=()=>emojiPicker(m.querySelector('#fmCatIcon').value,v=>m.querySelector('#fmCatIcon').value=v);
      m.querySelector('#fmCatCancel').onclick=()=>m.classList.remove('open');
      m.querySelector('#fmCatSave').onclick=()=>{const name=m.querySelector('#fmCatName').value.trim();if(!name){toast('نام دسته را وارد کن');return}const icon=m.querySelector('#fmCatIcon').value.trim()||'◌';if(edit)Object.assign(c,{name,icon,color:m.querySelector('#fmCatColor').value});else categories.push({id:uid(),name,icon,color:m.querySelector('#fmCatColor').value});write(CAT,categories);m.classList.remove('open');render();toast(edit?'دسته ویرایش شد':'دسته ثبت شد')};
      m.querySelectorAll('[data-edit-cat]').forEach(b=>b.onclick=()=>{m.classList.remove('open');categoryModal(b.dataset.editCat)});
      m.querySelectorAll('[data-delete-cat]').forEach(b=>b.onclick=()=>{const id=b.dataset.deleteCat;if(assets.some(a=>String(a.category)===String(id))){toast('برای حذف دسته ابتدا دارایی‌های مربوط به آن را جابجا کنید');return}const target=categories.find(x=>String(x.id)===String(id));if(!target)return;if(!confirm(`دسته «${target.name}» حذف شود؟`))return;categories=categories.filter(x=>String(x.id)!==String(id));write(CAT,categories);categoryModal(edit&&String(edit)===String(id)?null:edit);render();toast('دسته حذف شد')});
      m.querySelector('[data-manage-tab="assets"]').onclick=()=>renderAssetDefinitionsTab();
    };
    const renderAssetDefinitionsTab=()=>{
      m.querySelector('.fm-modal-body').innerHTML=`<div class="fm-manage-tabs"><button type="button" data-manage-tab="categories">مدیریت دسته‌بندی</button><button type="button" class="active" data-manage-tab="assets">مدیریت دارایی‌ها</button></div><div class="fm-definition-intro"><b>تعریف دارایی</b><small>هر دارایی را فقط یک‌بار تعریف کن؛ فاصله‌های اضافی در نام نادیده گرفته می‌شوند.</small></div><div class="fm-form-grid"><label><span>نام دارایی</span><input id="fmDefName" placeholder="مثلاً ربع سکه"></label><label><span>دسته‌بندی</span><select id="fmDefCat">${categories.map(c=>`<option value="${c.id}">${esc(c.icon)} ${esc(c.name)}</option>`).join('')}</select></label></div><div class="fm-form-grid three"><label><span>واحد</span><input id="fmDefUnit" placeholder="عدد، گرم، دلار..."></label><label><span>روش قیمت‌گذاری</span><div class="fm-toggle"><button type="button" class="active" data-def-mode="manual">دستی</button><button type="button" data-def-mode="api">API</button></div></label><label><span>کلمه کلیدی API</span><input id="fmDefKeyword" list="fmApiKeywordListDef" placeholder="ربع سکه"><datalist id="fmApiKeywordListDef">${marketDefs.map(x=>`<option value="${esc(x.keyword)}">${esc(x.name)}</option>`).join('')}</datalist></label></div><label class="fm-full"><span>آیکون دارایی</span><div class="fm-icon-field"><input id="fmDefIcon" value="🪙" maxlength="8"><button type="button" id="fmDefIconBtn">انتخاب آماده</button></div></label><div class="fm-form-actions"><button id="fmDefCancel">انصراف</button><button class="save" id="fmDefSave">ثبت دارایی</button></div><div class="fm-cat-editor-list">${assetDefinitions.map(d=>`<div class="fm-cat-editor"><div class="fm-cat-editor-main"><span>${esc(d.icon||'◌')}</span><b>${esc(d.name)}</b><small>${esc(cat(d.category).name)} · ${esc(d.unit||'واحد')} · ${d.priceMode==='api'?'API':'دستی'}</small></div><div class="fm-cat-editor-actions"><button type="button" data-edit-def="${d.id}">ویرایش</button><button type="button" class="danger" data-delete-def="${d.id}">حذف</button></div></div>`).join('')}</div>`;
      let mode='manual',editingId=null;
      const sync=()=>{const k=m.querySelector('#fmDefKeyword');k.disabled=mode!=='api';m.querySelectorAll('[data-def-mode]').forEach(b=>b.classList.toggle('active',b.dataset.defMode===mode))};
      m.querySelectorAll('[data-def-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.defMode;sync()});sync();
      m.querySelector('#fmDefIconBtn').onclick=()=>emojiPicker(m.querySelector('#fmDefIcon').value,v=>m.querySelector('#fmDefIcon').value=v);
      m.querySelector('#fmDefCancel').onclick=()=>{editingId=null;renderAssetDefinitionsTab()};
      m.querySelector('#fmDefSave').onclick=()=>{const name=m.querySelector('#fmDefName').value.trim(),unit=m.querySelector('#fmDefUnit').value.trim()||'واحد';if(!name){toast('نام دارایی را وارد کن');return}const duplicate=assetDefinitions.find(d=>assetDefKey(d.name,d.unit)===assetDefKey(name,unit)&&String(d.id)!==String(editingId));if(duplicate){toast('این دارایی قبلاً تعریف شده است');return}const obj=editingId?assetDefinitions.find(d=>String(d.id)===String(editingId)):{id:uid(),createdAt:Date.now()};Object.assign(obj,{name,category:m.querySelector('#fmDefCat').value,unit,priceMode:mode,keyword:m.querySelector('#fmDefKeyword').value.trim(),icon:m.querySelector('#fmDefIcon').value.trim()||'◌'});if(!editingId)assetDefinitions.push(obj);write(ASSET_DEF,assetDefinitions);editingId=null;renderAssetDefinitionsTab();toast('دارایی تعریف شد')};
      m.querySelectorAll('[data-edit-def]').forEach(b=>b.onclick=()=>{const d=assetDefinitions.find(x=>String(x.id)===String(b.dataset.editDef));if(!d)return;editingId=d.id;m.querySelector('#fmDefName').value=d.name||'';m.querySelector('#fmDefCat').value=d.category||categories[0]?.id||'';m.querySelector('#fmDefUnit').value=d.unit||'واحد';m.querySelector('#fmDefKeyword').value=d.keyword||'';m.querySelector('#fmDefIcon').value=d.icon||'◌';mode=d.priceMode||'manual';sync();m.querySelector('#fmDefSave').textContent='ذخیره تغییرات';m.querySelector('#fmDefCancel').textContent='انصراف'});
      m.querySelectorAll('[data-delete-def]').forEach(b=>b.onclick=()=>{const id=b.dataset.deleteDef;if(assets.some(a=>String(a.definitionId)===String(id))){toast('این دارایی سابقه دارد و قابل حذف نیست؛ آن را غیرفعال کن یا نگه دار');return}if(!confirm('این تعریف دارایی حذف شود؟'))return;assetDefinitions=assetDefinitions.filter(d=>String(d.id)!==String(id));write(ASSET_DEF,assetDefinitions);renderAssetDefinitionsTab();toast('تعریف دارایی حذف شد')});
      m.querySelector('[data-manage-tab="categories"]').onclick=()=>renderCategoryTab();
    };
    renderCategoryTab();m.classList.add('open')
  }
  function assetModal(id){
    const a=id?assets.find(x=>String(x.id)===String(id)):null;
    if(a?.category==='vehicle'){toast('دارایی‌های خودرو از تب خودرو مدیریت می‌شوند');return}
    if(!categories.length){toast('ابتدا یک دسته تعریف کن');return}
    const m=ensureModal('fmAssetModal','افزودن دارایی','');
    if(a){
      let icon=a.icon||'🪙',mode=a.priceMode||'manual';
      m.querySelector('.fm-modal-body').innerHTML=`<div class="fm-form-grid"><label><span>نام دارایی</span><input id="fmAName"></label><label><span>دسته‌بندی</span><select id="fmACat">${categories.map(c=>`<option value="${c.id}">${esc(c.icon)} ${esc(c.name)}</option>`).join('')}</select></label></div><div class="fm-form-grid three"><label><span>موجودی فعلی</span><input id="fmAQty" inputmode="decimal"></label><label><span>قیمت خرید هر واحد</span><input id="fmABuy" inputmode="numeric"></label><label><span>قیمت روز هر واحد</span><input id="fmACurrent" inputmode="numeric"></label></div><div class="fm-form-grid three"><label><span>واحد</span><input id="fmAUnit"></label><label><span>روش بروزرسانی</span><div class="fm-toggle"><button type="button" data-price-mode="manual">دستی</button><button type="button" data-price-mode="api">API</button></div></label><label><span>کلمه کلیدی API</span><input id="fmAKeyword" list="fmApiKeywordListAsset"><datalist id="fmApiKeywordListAsset">${marketDefs.map(x=>`<option value="${esc(x.keyword)}">${esc(x.name)}</option>`).join('')}</datalist></label></div><div class="fm-form-actions"><button id="fmAssetDelete" class="danger" type="button">حذف دارایی</button><button id="fmAssetCancel">انصراف</button><button class="save" id="fmAssetSave">ذخیره تغییرات</button></div>`;
      m.querySelector('#fmAName').value=a.name||'';m.querySelector('#fmACat').value=a.category||categories[0].id;m.querySelector('#fmAQty').value=a.quantity??'';m.querySelector('#fmABuy').value=a.buyPrice??'';m.querySelector('#fmACurrent').value=a.currentPrice??'';m.querySelector('#fmAUnit').value=a.unit||'واحد';m.querySelector('#fmAKeyword').value=a.keyword||'';
      const sync=()=>{m.querySelector('#fmACurrent').disabled=mode==='api';m.querySelector('#fmAKeyword').disabled=mode!=='api';m.querySelectorAll('[data-price-mode]').forEach(b=>b.classList.toggle('active',b.dataset.priceMode===mode))};m.querySelectorAll('[data-price-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.priceMode;if(mode==='api')m.querySelector('#fmACurrent').value='';sync()});sync();m.querySelector('#fmAssetCancel').onclick=()=>m.classList.remove('open');m.querySelector('#fmAssetDelete').onclick=()=>{const hasTx=transactions.some(t=>String(t.assetId)===String(a.id));const msg=hasTx?`دارایی «${a.name}» دارای سابقه معاملات است.\nآیا از حذف مطمئنید؟\nبا تأیید، خود دارایی و همه تراکنش‌های مربوط به آن حذف می‌شوند.`:`دارایی «${a.name}» حذف شود؟`;if(!confirm(msg))return;assets=assets.filter(x=>String(x.id)!==String(a.id));transactions=transactions.filter(t=>String(t.assetId)!==String(a.id));write(STORE,assets);write(TX,transactions);syncPortfolioEvents();snapshot();m.classList.remove('open');render();toast('دارایی و تراکنش‌های مربوط به آن حذف شد')};m.querySelector('#fmAssetSave').onclick=()=>{const quantity=num(m.querySelector('#fmAQty').value),buy=num(m.querySelector('#fmABuy').value),current=num(m.querySelector('#fmACurrent').value);if(quantity<0){toast('موجودی نامعتبر است');return}a.initialQuantity=quantity;a.initialBuyPrice=buy;Object.assign(a,{name:m.querySelector('#fmAName').value.trim()||a.name,category:m.querySelector('#fmACat').value,quantity,buyPrice:buy,currentPrice:mode==='manual'?current:(Number(a.currentPrice)||0),priceMode:mode,keyword:m.querySelector('#fmAKeyword').value.trim(),unit:m.querySelector('#fmAUnit').value.trim()||'واحد'});write(STORE,assets);snapshot();m.classList.remove('open');render();if(mode==='api'&&settings.apiUrl)setTimeout(refreshPrices,0);toast('دارایی ویرایش شد')};
    }else{
      let mode='manual';
      m.querySelector('.fm-modal-body').innerHTML=`<div class="fm-definition-select-wrap"><label class="fm-full"><span>جستجو در دارایی‌ها</span><input id="fmAssetDefinitionSearch" placeholder="نام دارایی را جستجو کن..." autocomplete="off"></label><label class="fm-full"><span>انتخاب دارایی</span><select id="fmAssetDefinition"><option value="">انتخاب کن...</option>${assetDefinitions.map(d=>`<option value="${d.id}">${esc(d.icon||'◌')} ${esc(d.name)} · ${esc(cat(d.category).name)}</option>`).join('')}</select></label><div id="fmAssetDefInfo" class="fm-definition-info">ابتدا دارایی را از «مدیریت دارایی‌ها» تعریف کن.</div></div><div class="fm-form-grid three"><label><span>مقدار خرید</span><input id="fmBuyQty" inputmode="decimal" placeholder="مثلاً 2"></label><label><span>قیمت خرید هر واحد</span><input id="fmBuyPrice" inputmode="numeric" placeholder="تومان"></label><label><span>تاریخ خرید</span><input id="fmBuyDate" readonly></label></div><label class="fm-full"><span>یادداشت</span><input id="fmBuyNote" placeholder="اختیاری"></label><div class="fm-form-actions"><button id="fmAssetCancel">انصراف</button><button class="save" id="fmAssetSave">ثبت خرید و افزودن دارایی</button></div>`;
      const sel=m.querySelector('#fmAssetDefinition'),info=m.querySelector('#fmAssetDefInfo'),date=m.querySelector('#fmBuyDate'),search=m.querySelector('#fmAssetDefinitionSearch');date.value=jTextDash(gDateToJ(new Date().toISOString().slice(0,10)));
      search.oninput=()=>{const q=norm(search.value);const current=sel.value;sel.innerHTML='<option value="">انتخاب کن...</option>'+assetDefinitions.filter(d=>!q||norm(`${d.name} ${cat(d.category).name}`).includes(q)).map(d=>`<option value="${d.id}">${esc(d.icon||'◌')} ${esc(d.name)} · ${esc(cat(d.category).name)}</option>`).join('');if(assetDefinitions.some(d=>String(d.id)===String(current)&&(!q||norm(`${d.name} ${cat(d.category).name}`).includes(q))))sel.value=current};sel.onchange=()=>{const d=assetDefinitions.find(x=>String(x.id)===String(sel.value));if(!d){info.textContent='ابتدا دارایی را از «مدیریت دارایی‌ها» تعریف کن.';return}mode=d.priceMode||'manual';info.innerHTML=`<b>${esc(d.name)}</b><span>واحد: ${esc(d.unit||'واحد')} · قیمت‌گذاری: ${mode==='api'?'API':'دستی'}${mode==='api'&&d.keyword?' · کلید: '+esc(d.keyword):''}</span>`};
      m.querySelector('#fmAssetCancel').onclick=()=>m.classList.remove('open');m.querySelector('#fmAssetSave').onclick=()=>{const d=assetDefinitions.find(x=>String(x.id)===String(sel.value)),q=num(m.querySelector('#fmBuyQty').value),price=num(m.querySelector('#fmBuyPrice').value);if(!d){toast('ابتدا یک دارایی انتخاب کن');return}if(q<=0||price<=0){toast('مقدار و قیمت خرید را وارد کن');return}let a=assets.find(x=>String(x.definitionId)===String(d.id));if(a){a.initialQuantity=Number(a.initialQuantity)||0;a.initialBuyPrice=Number(a.initialBuyPrice)||0;transactions.push({id:uid(),assetId:a.id,type:'buy',quantity:q,price,date:new Date().toISOString().slice(0,10),unit:d.unit||'واحد',note:m.querySelector('#fmBuyNote').value.trim(),createdAt:Date.now()});a.name=d.name;a.category=d.category;a.unit=d.unit;a.icon=d.icon;a.priceMode=d.priceMode;a.keyword=d.keyword}else{a={id:uid(),createdAt:Date.now(),definitionId:d.id,name:d.name,category:d.category,unit:d.unit||'واحد',icon:d.icon||'◌',priceMode:d.priceMode||'manual',keyword:d.keyword||'',quantity:0,buyPrice:0,currentPrice:d.priceMode==='api'?0:price,initialQuantity:0,initialBuyPrice:0};assets.push(a);transactions.push({id:uid(),assetId:a.id,type:'buy',quantity:q,price,date:new Date().toISOString().slice(0,10),unit:d.unit||'واحد',note:m.querySelector('#fmBuyNote').value.trim(),createdAt:Date.now()})}rebuildAsset(a);write(STORE,assets);write(TX,transactions);snapshot();m.classList.remove('open');render();if(a.priceMode==='api'&&settings.apiUrl)setTimeout(refreshPrices,0);toast('خرید ثبت شد و دارایی فعال شد')};
    }
    m.classList.add('open')
  }
  function txList(assetId){return transactions.filter(t=>String(t.assetId)===String(assetId)).sort((a,b)=>String(b.date).localeCompare(String(a.date)))}
  function assetDetailsModal(assetId){
    const a=assets.find(x=>String(x.id)===String(assetId));if(!a)return;
    const p=assetPosition(a),m=ensureModal('fmAssetDetailsModal','جزئیات دارایی','');
    const cls=p.totalPnl>0?'positive':p.totalPnl<0?'negative':'neutral';
    const rows=[
      ['مقدار موجود',''+fmt(p.qty)+' '+(a.unit||'واحد')],
      ['نقطه سر به سری',money(p.avgCost)],
      ['قیمت روز',money(a.currentPrice)],
      ['ارزش روز',money(p.currentValue)],
      ['ارزش تمام‌شده فعلی',money(p.cost)],
      ['سود تحقق‌یافته',money(p.realized)],
      ['سود/زیان تحقق‌نیافته',money(p.unrealized)],
      ['سود و زیان کل',`<strong class="fm-detail-pnl ${cls}">${money(p.totalPnl)} (${p.pnlPercent.toFixed(2)}٪)</strong>`],
      ['تعداد خرید',fmt(p.buyCount)],
      ['تعداد فروش',fmt(p.sellCount)]
    ];
    m.querySelector('.fm-modal-body').innerHTML=`<div class="fm-asset-detail-hero"><div class="fm-asset-detail-icon">${esc(a.icon||'◌')}</div><div><span>${esc(cat(a.category).name)}</span><h3>${esc(a.name)}</h3><small>${esc(a.unit||'واحد')}</small></div></div><div class="fm-detail-highlight"><div><span>ارزش روز</span><b>${money(p.currentValue)}</b></div><div class="${cls}"><span>سود و زیان کل</span><b>${money(p.totalPnl)}</b><small>${p.pnlPercent.toFixed(2)}٪</small></div></div><div class="fm-detail-grid">${rows.map(r=>`<div><span>${r[0]}</span><b>${r[1]}</b></div>`).join('')}</div><div class="fm-detail-actions"><button data-detail-buy="${a.id}">＋ خرید</button><button data-detail-sell="${a.id}">− فروش</button><button data-detail-ledger="${a.id}">دفتر خرید و فروش</button><button data-detail-edit="${a.id}">ویرایش دارایی</button></div>`;
    m.querySelector('[data-detail-buy]').onclick=()=>{m.classList.remove('open');tradeModal(a.id,'buy')};
    m.querySelector('[data-detail-sell]').onclick=()=>{m.classList.remove('open');tradeModal(a.id,'sell')};
    m.querySelector('[data-detail-ledger]').onclick=()=>{m.classList.remove('open');ledgerModal(a.id)};
    m.querySelector('[data-detail-edit]').onclick=()=>{m.classList.remove('open');assetModal(a.id)};
    m.classList.add('open')
  }

  function ledgerModal(assetId){
    const a=assets.find(x=>String(x.id)===String(assetId));if(!a)return;
    const m=ensureModal('fmLedgerModal','دفتر خرید و فروش','');
    function draw(){
      const q=norm(m.querySelector('#fmLedgerSearch')?.value||''),kind=m.querySelector('#fmLedgerFilter')?.value||'all',sort=m.querySelector('#fmLedgerSort')?.value||'new';
      let rows=txList(a.id).filter(t=>(!q||norm(`${t.type} ${t.note||''} ${t.unit||''} ${t.date}`).includes(q))&&(kind==='all'||t.type===kind));
      rows.sort((x,y)=>sort==='old'?String(x.date).localeCompare(String(y.date)):sort==='qty'?(y.quantity||0)-(x.quantity||0):String(y.date).localeCompare(String(x.date)));
      m.querySelector('#fmLedgerRows').innerHTML=rows.length?rows.map(t=>`<div class="fm-ledger-row"><div><b>${t.type==='buy'?'خرید':'فروش'} · ${fmt(t.quantity)} ${esc(t.unit||a.unit||'واحد')}</b><small>${esc(t.date)} · ${money(t.price)} ${t.note?'· '+esc(t.note):''}</small></div><div><strong>${money((t.quantity||0)*(t.price||0))}</strong><span>${t.type==='buy'?'افزایش موجودی':'کاهش موجودی'}</span></div><div class="fm-ledger-actions"><button data-tx-edit="${t.id}">ویرایش</button><button data-tx-del="${t.id}">حذف</button></div></div>`).join(''):'<div class="fm-history-placeholder">تراکنشی ثبت نشده است.</div>';
      m.querySelectorAll('[data-tx-edit]').forEach(b=>b.onclick=()=>{const t=transactions.find(x=>String(x.id)===String(b.dataset.txEdit));if(t)tradeModal(a.id,t.type,draw,t)});
      m.querySelectorAll('[data-tx-del]').forEach(b=>b.onclick=()=>{const t=transactions.find(x=>String(x.id)===String(b.dataset.txDel));if(!t)return;if(!confirm('این تراکنش حذف شود؟'))return;transactions=transactions.filter(x=>String(x.id)!==String(t.id));rebuildAsset(a);write(STORE,assets);write(TX,transactions);syncPortfolioEvents();snapshot();render();ledgerModal(a.id)});
    }
    m.querySelector('.fm-modal-body').innerHTML=`<div class="fm-ledger-toolbar"><div><b>${esc(a.name)}</b><small>موجودی فعلی: ${fmt(a.quantity)} ${esc(a.unit||'واحد')}</small></div><div class="fm-ledger-trade-actions"><button class="buy" id="fmLedgerBuy">＋ خرید</button><button class="sell" id="fmLedgerSell">− فروش</button></div></div><div class="fm-ledger-tools"><input id="fmLedgerSearch" placeholder="جستجوی دفتر..."><select id="fmLedgerFilter"><option value="all">همه</option><option value="buy">خرید</option><option value="sell">فروش</option></select><select id="fmLedgerSort"><option value="new">جدیدترین</option><option value="old">قدیمی‌ترین</option><option value="qty">مقدار بیشتر</option></select></div><div id="fmLedgerRows"></div>`;
    m.querySelector('#fmLedgerBuy').onclick=()=>tradeModal(a.id,'buy',draw);
    m.querySelector('#fmLedgerSell').onclick=()=>tradeModal(a.id,'sell',draw);
    m.querySelectorAll('#fmLedgerSearch,#fmLedgerFilter,#fmLedgerSort').forEach(x=>x.oninput=x.onchange=draw);
    draw();m.classList.add('open')
  }
  function gDateToJ(v){if(!v)return'';const d=new Date(v+'T12:00:00');if(Number.isNaN(d.getTime()))return'';const gdm=[0,31,59,90,120,151,181,212,243,273,304,334],div=(a,b)=>Math.floor(a/b),gy=d.getFullYear(),gm=d.getMonth()+1,gd=d.getDate(),gy2=gm>2?gy+1:gy;let days=355666+365*gy+div(gy2+3,4)-div(gy2+99,100)+div(gy2+399,400)+gd+gdm[gm-1],jy=-1595+33*div(days,12053);days%=12053;jy+=4*div(days,1461);days%=1461;if(days>365){jy+=div(days-1,365);days=(days-1)%365}return `${jy}-${String(days<186?1+div(days,31):7+div(days-186,30)).padStart(2,'0')}-${String(1+(days<186?days%31:(days-186)%30)).padStart(2,'0')}`;}
  function jToG(v){const [jy,jm,jd]=String(v).split('-').map(Number),div=(a,b)=>Math.floor(a/b),j=jy+1595;let days=-355668+365*j+div(j,33)*8+div(j%33+3,4)+jd+(jm<7?(jm-1)*31:(jm-7)*30+186),gy=400*div(days,146097);days%=146097;if(days>36524){gy+=100*div(--days,36524);days%=36524;if(days>=365)days++}gy+=4*div(days,1461);days%=1461;if(days>365){gy+=div(days-1,365);days=(days-1)%365}let gd=days+1,ml=[31,(gy%4===0&&gy%100!==0)||gy%400===0?29:28,31,30,31,30,31,31,31,30,31,30,31],gm=0;while(gd>ml[gm])gd-=ml[gm++];return `${gy}-${String(gm+1).padStart(2,'0')}-${String(gd).padStart(2,'0')}`;}
  function jTextDash(v){if(!v)return'—';const [y,m,d]=String(v).split('-').map(Number),names=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];return `${fmt(d)} ${names[m-1]||''} ${fmt(y)}`;}
  function ensurePortfolioDatePicker(){
    let p=$('fmJalaliPicker');if(p)return p;
    p=document.createElement('div');p.id='fmJalaliPicker';p.className='fm-jalali-picker';p.hidden=true;p.innerHTML='<div class="fm-jp-head"><button type="button" data-jp-prev>‹</button><strong></strong><button type="button" data-jp-next>›</button></div><div class="fm-jp-week"><span>ش</span><span>ی</span><span>د</span><span>س</span><span>چ</span><span>پ</span><span>ج</span></div><div class="fm-jp-grid"></div>';document.body.appendChild(p);
    p.addEventListener('click',e=>{if(e.target.matches('[data-jp-day]')){const j=e.target.dataset.jpDay;const hidden=p._input,display=p._display;if(hidden){hidden.value=jToG(j);if(display)display.value=jTextDash(j);p.hidden=true;hidden.dispatchEvent(new Event('change',{bubbles:true}))}}});
    p.querySelector('[data-jp-prev]').onclick=e=>{e.stopPropagation();p._m--;if(p._m<1){p._m=12;p._y--}drawPortfolioPicker(p)};
    p.querySelector('[data-jp-next]').onclick=e=>{e.stopPropagation();p._m++;if(p._m>12){p._m=1;p._y++}drawPortfolioPicker(p)};
    document.addEventListener('click',e=>{if(!p.hidden&&!p.contains(e.target)&&!e.target.closest('.fm-date-trigger'))p.hidden=true});
    return p;
  }
  function drawPortfolioPicker(p){const months=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];p.querySelector('strong').textContent=`${months[p._m-1]} ${fmt(p._y)}`;const grid=p.querySelector('.fm-jp-grid');grid.innerHTML='';const first=(d=>((new Date(d[0],d[1]-1,d[2]).getDay()+1)%7))(jToG(`${p._y}-${String(p._m).padStart(2,'0')}-01`).split('-').map(Number));for(let i=0;i<first;i++)grid.appendChild(document.createElement('span'));const len=p._m<7?31:p._m<12?30:(()=>{const g=jToG(`${p._y}-12-30`),d=new Date(g+'T12:00:00');return g2jParts(d.getFullYear(),d.getMonth()+1,d.getDate())[2]===30?30:29})();for(let d=1;d<=len;d++){const j=`${p._y}-${String(p._m).padStart(2,'0')}-${String(d).padStart(2,'0')}`,b=document.createElement('button');b.type='button';b.dataset.jpDay=j;b.textContent=fmt(d);if(p._input?.value===jToG(j))b.classList.add('selected');grid.appendChild(b)}}
  function openPortfolioDatePicker(btn,hidden,display){const p=ensurePortfolioDatePicker(),j=gDateToJ(hidden.value)||gDateToJ(new Date().toISOString().slice(0,10)),a=j.split('-').map(Number);p._input=hidden;p._display=display;p._y=a[0];p._m=a[1];drawPortfolioPicker(p);p.hidden=false;const r=btn.getBoundingClientRect(),w=Math.min(320,window.innerWidth-24),h=320;p.style.width=w+'px';p.style.left=Math.max(12,Math.min(window.innerWidth-w-12,r.left))+'px';p.style.top=(r.bottom+8+h>window.innerHeight?Math.max(8,r.top-h-8):r.bottom+8)+'px';}
  function syncPortfolioEvents(){
    let ev=[];try{ev=JSON.parse(localStorage.getItem('finance-events')||'[]')}catch{}
    ev=ev.filter(e=>!e.portfolioTxId);
    transactions.forEach(t=>{const a=assets.find(x=>String(x.id)===String(t.assetId));if(!a||!t.date)return;ev.push({date:gDateToJ(t.date),type:'trade',title:`${t.type==='buy'?'خرید':'فروش'} ${a.name}`,description:t.note||`${fmt(t.quantity)} ${a.unit||'واحد'}`,amount:(Number(t.quantity)||0)*(Number(t.price)||0),source:'خرید و فروش',portfolioTxId:String(t.id)})});
    localStorage.setItem('finance-events',JSON.stringify(ev));window.dispatchEvent(new Event('finance-events-updated'));
  }
  function tradeModal(assetId,type='buy',after,editTx=null){const a=assets.find(x=>String(x.id)===String(assetId));if(!a)return;const m=ensureModal('fmTradeModal',editTx?(editTx.type==='buy'?'ویرایش خرید':'ویرایش فروش'):(type==='buy'?'ثبت خرید':'ثبت فروش'),'');const t=editTx||{quantity:'',price:a.currentPrice||a.buyPrice||'',date:new Date().toISOString().slice(0,10),unit:a.unit||'واحد',note:''};let kind=t.type||type;m.querySelector('.fm-modal-body').innerHTML=`<div class="fm-form-grid"><label><span>نوع تراکنش</span><div class="fm-toggle"><button type="button" class="${kind==='buy'?'active':''}" data-trade-type="buy">خرید</button><button type="button" class="${kind==='sell'?'active':''}" data-trade-type="sell">فروش</button></div></label><label><span>تاریخ</span><div class="fm-date-trigger"><input id="fmTxDateDisplay" readonly value="${esc(jTextDash(gDateToJ(t.date)||gDateToJ(new Date().toISOString().slice(0,10))))}"><button type="button" class="fm-date-trigger-btn" aria-label="انتخاب تاریخ">▦</button></div><input id="fmTxDate" type="hidden" value="${esc(t.date||new Date().toISOString().slice(0,10))}"></label></div><div class="fm-form-grid three"><label><span>مقدار</span><input id="fmTxQty" inputmode="decimal"></label><label><span>قیمت هر واحد</span><input id="fmTxPrice" inputmode="numeric"></label><label><span>واحد</span><input id="fmTxUnit"></label></div><label class="fm-full"><span>یادداشت</span><input id="fmTxNote" placeholder="اختیاری"></label><div class="fm-form-actions"><button id="fmTxCancel">انصراف</button><button class="save" id="fmTxSave">${editTx?'ذخیره تغییر':'ثبت تراکنش'}</button></div>`;m.querySelector('#fmTxQty').value=t.quantity??'';m.querySelector('#fmTxPrice').value=t.price??'';m.querySelector('#fmTxUnit').value=t.unit||a.unit||'واحد';m.querySelector('#fmTxNote').value=t.note||'';m.querySelector('.fm-date-trigger-btn').onclick=()=>openPortfolioDatePicker(m.querySelector('.fm-date-trigger-btn'),m.querySelector('#fmTxDate'),m.querySelector('#fmTxDateDisplay'));m.querySelectorAll('[data-trade-type]').forEach(b=>b.onclick=()=>{kind=b.dataset.tradeType;m.querySelectorAll('[data-trade-type]').forEach(x=>x.classList.toggle('active',x===b))});m.querySelector('#fmTxCancel').onclick=()=>m.classList.remove('open');m.querySelector('#fmTxSave').onclick=()=>{const q=num(m.querySelector('#fmTxQty').value),price=num(m.querySelector('#fmTxPrice').value);if(!q||!price){toast('مقدار و قیمت را وارد کن');return}if(editTx){Object.assign(editTx,{type:kind,quantity:q,price,date:m.querySelector('#fmTxDate').value||t.date,unit:m.querySelector('#fmTxUnit').value.trim()||a.unit||'واحد',note:m.querySelector('#fmTxNote').value.trim()});rebuildAsset(a)}else{if(kind==='sell'&&q>a.quantity){toast('مقدار فروش بیشتر از موجودی است');return}transactions.push({id:uid(),assetId:a.id,type:kind,quantity:q,price,date:m.querySelector('#fmTxDate').value||t.date,unit:m.querySelector('#fmTxUnit').value.trim()||a.unit||'واحد',note:m.querySelector('#fmTxNote').value.trim(),createdAt:Date.now()});rebuildAsset(a)}write(STORE,assets);write(TX,transactions);syncPortfolioEvents();snapshot();m.classList.remove('open');render();after?.();toast(editTx?'تراکنش ویرایش شد':(kind==='buy'?'خرید ثبت شد':'فروش ثبت شد'))};m.classList.add('open')}
  function noteModal(id){const a=assets.find(x=>String(x.id)===String(id));if(!a)return;const m=ensureModal('fmAssetNoteModal','یادداشت دارایی','');m.querySelector('.fm-modal-body').innerHTML=`<div class="fm-note-editor"><div class="fm-note-target"><span>${esc(a.icon||'◌')}</span><div><b>${esc(a.name)}</b><small>یادداشت این دارایی</small></div></div><label class="fm-full"><span>متن یادداشت</span><textarea id="fmAssetNoteInput" rows=7 placeholder="یادداشت خود را اینجا بنویس..."></textarea></label><div class="fm-form-actions"><button id="fmAssetNoteCancel">انصراف</button><button class="save" id="fmAssetNoteSave">ذخیره یادداشت</button></div></div>`;m.querySelector('#fmAssetNoteInput').value=a.note||'';m.querySelector('#fmAssetNoteCancel').onclick=()=>m.classList.remove('open');m.querySelector('#fmAssetNoteSave').onclick=()=>{a.note=m.querySelector('#fmAssetNoteInput').value.trim();write(STORE,assets);m.classList.remove('open');render();toast('یادداشت ذخیره شد')};m.classList.add('open');setTimeout(()=>m.querySelector('#fmAssetNoteInput')?.focus(),120)}
  function portfolioTransactions(){const m=ensureModal('fmTxModal','تاریخچه معاملات','');m.classList.add('fm-fixed-content');const draw=()=>{const q=norm(m.querySelector('#fmTxSearch')?.value||''),kind=m.querySelector('#fmTxFilter')?.value||'all',sort=m.querySelector('#fmTxSort')?.value||'new';let rows=transactions.filter(t=>{const a=assets.find(x=>x.id===t.assetId);return (!q||norm(`${a?.name||''} ${t.type} ${t.note||''}`).includes(q))&&(kind==='all'||t.type===kind)});rows.sort((a,b)=>sort==='old'?String(a.date).localeCompare(String(b.date)):sort==='value'?(b.quantity*b.price)-(a.quantity*a.price):String(b.date).localeCompare(String(a.date)));m.querySelector('#fmTxRows').innerHTML=rows.length?rows.map(t=>{const a=assets.find(x=>String(x.id)===String(t.assetId));return `<div class="fm-ledger-row ${t.type==='buy'?'fm-tx-buy':'fm-tx-sell'}"><div><b>${esc(a?.name||'دارایی حذف‌شده')} · ${t.type==='buy'?'خرید':'فروش'}</b><small>${esc(t.date)} · ${fmt(t.quantity)} ${esc(t.unit||'')} · ${money(t.price)}</small></div><strong>${money(t.quantity*t.price)}</strong></div>`}).join(''):'<div class="fm-history-placeholder">تراکنشی ثبت نشده است.</div>'};m.querySelector('.fm-modal-body').innerHTML=`<div class="fm-ledger-tools"><input id="fmTxSearch" placeholder="جستجوی دارایی، نوع یا یادداشت..."><select id="fmTxFilter"><option value="all">همه</option><option value="buy">خرید</option><option value="sell">فروش</option></select><select id="fmTxSort"><option value="new">جدیدترین</option><option value="old">قدیمی‌ترین</option><option value="value">ارزش بیشتر</option></select></div><div id="fmTxRows"></div>`;m.querySelectorAll('#fmTxSearch,#fmTxFilter,#fmTxSort').forEach(x=>x.oninput=x.onchange=draw);draw();m.classList.add('open')}
  function marketSettings(){
    const m=ensureModal('fmMarketSettingsModal','مدیریت شاخص‌ها و کلمات کلیدی','');
    const defs=(settings.marketDefs?.length?settings.marketDefs:mergedMarketDefs.map(x=>({...x}))).map(x=>({...x}));
    const renderRows=(query='')=>{
      const q=norm(query),rows=defs.map((x,i)=>({...x,_i:i})).filter(x=>!q||norm(`${x.name} ${x.key} ${x.keyword} ${x.category||''}`).includes(q));
      m.querySelector('#fmMarketEditor').innerHTML=rows.length?rows.map(x=>`<div class="fm-market-edit-row" data-market-row="${x._i}"><label class="fm-market-check"><input type="checkbox" data-me-enabled="${x._i}" ${x.enabled!==false?'checked':''}><span>${esc(x.category||'شاخص')}</span></label><input data-me-name="${x._i}" value="${esc(x.name)}"><input data-me-key="${x._i}" value="${esc(x.key)}" placeholder="نماد"><input data-me-keyword="${x._i}" value="${esc(x.keyword||'')}" placeholder="کلمه کلیدی API"></div>`).join(''):'<div class="fm-history-placeholder">موردی مطابق جستجو پیدا نشد.</div>';
      m.querySelector('#fmMarketCount').textContent=`${rows.length} مورد`;
    };
    m.querySelector('.fm-modal-body').innerHTML=`<div class="fm-market-editor-note">فهرست کامل کلمات کلیدی از راهنمای API وارد شده است. با جستجو نام، نماد یا کلمه کلیدی را سریع پیدا کن. مقدار کلمه کلیدی همان مقداری است که برای API ارسال می‌شود.</div><div class="fm-market-search"><span>⌕</span><input id="fmMarketSearch" type="search" placeholder="جستجوی نام، نماد یا کلمه کلیدی..." autocomplete="off"></div><div class="fm-market-editor-head"><b>فهرست شاخص‌ها و قیمت‌ها</b><span id="fmMarketCount"></span></div><div id="fmMarketEditor"></div><button id="fmMarketAdd" class="fm-secondary-setting">＋ افزودن شاخص سفارشی</button><div class="fm-form-actions"><button id="fmMarketCancel">انصراف</button><button class="save" id="fmMarketSave">ذخیره شاخص‌ها</button></div>`;
    m.querySelector('#fmMarketSearch').oninput=e=>renderRows(e.target.value);
    m.querySelector('#fmMarketAdd').onclick=()=>{defs.push({name:'شاخص جدید',key:`CUSTOM_${Date.now()}`,keyword:'',category:'سفارشی',enabled:true});m.querySelector('#fmMarketSearch').value='';renderRows();m.querySelector('#fmMarketSearch').focus()};
    m.querySelector('#fmMarketCancel').onclick=()=>m.classList.remove('open');
    m.querySelector('#fmMarketSave').onclick=()=>{defs.forEach((x,i)=>{const row=m.querySelector(`[data-market-row="${i}"]`);if(!row)return;x.name=row.querySelector(`[data-me-name="${i}"]`).value.trim()||x.name;x.key=row.querySelector(`[data-me-key="${i}"]`).value.trim()||x.key;x.keyword=row.querySelector(`[data-me-keyword="${i}"]`).value.trim();x.enabled=row.querySelector(`[data-me-enabled="${i}"]`).checked});settings.marketDefs=defs.map(x=>({name:x.name,key:x.key,keyword:x.keyword,category:x.category||'سفارشی',enabled:x.enabled!==false}));write(SET,settings);m.classList.remove('open');render();toast('فهرست شاخص‌ها و کلمات کلیدی ذخیره شد')};
    renderRows();m.classList.add('open');
  }
  function brsNumber(v){
    if(v===null||v===undefined)return NaN;
    return Number(String(v).trim().replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٬،,]/g,''));
  }
  function flattenBrsItems(data,path=''){
    const out=[];
    if(!data||typeof data!=='object')return out;
    if(Array.isArray(data)){
      data.forEach((item,i)=>{if(item&&typeof item==='object')out.push({...item,__path:path+'/'+i});});
      return out;
    }
    Object.entries(data).forEach(([k,v])=>{
      if(Array.isArray(v))v.forEach((item,i)=>{if(item&&typeof item==='object')out.push({...item,__path:path+'/'+k+'/'+i,__category:k});});
      else if(v&&typeof v==='object'){
        if('price' in v || 'index' in v)out.push({...v,__path:path+'/'+k,__category:k});
        Object.assign(out,flattenBrsItems(v,path+'/'+k));
      }
    });
    return out;
  }
  function findBrsInstrument(data,instrument){
    const items=flattenBrsItems(data), kws=[instrument?.symbol].concat(instrument?.keywords||[]).map(norm).filter(Boolean);
    let best=null,bestScore=-1;
    for(const item of items){
      const sym=norm(item.symbol),name=norm(item.name),en=norm(item.name_en),hay=norm([item.symbol,item.name,item.name_en,item.__category,item.__path].join(' '));
      let score=-1;
      for(const kw of kws){
        if(sym===kw)score=Math.max(score,120);
        else if(name===kw||en===kw)score=Math.max(score,100);
        else if(hay.includes(kw))score=Math.max(score,60);
      }
      const raw=instrument?.id==='bourse'?(item.index??item.price):item.price;
      const price=brsNumber(raw);
      if(score>bestScore&&Number.isFinite(price)&&price>0)best={item,price,score};
    }
    return best;
  }
  function getBrsUsdRate(data){
    const f=findBrsInstrument(data,{symbol:'USD',keywords:['USD','دلار']});
    if(!f)return 0;
    return norm(f.item.unit)==='ریال'?f.price/10:f.price;
  }
  function findBrsQuote(data,keyword){
    if(!data||!keyword)return null;
    const k=norm(keyword);
    if(k==='usdt'||k==='تتر'||k==='usdt irt'){
      const f=findBrsInstrument(data,{symbol:'USDT_IRT',keywords:['USDT_IRT','دلار تتر']});
      return f?{toman:f.price,usd:null,item:f.item}:null;
    }
    const f=findBrsInstrument(data,{symbol:String(keyword).trim().toUpperCase(),keywords:[keyword]});
    if(!f)return null;
    const item=f.item,unit=norm(item.unit);
    let toman=f.price,usd=null;
    const pt=brsNumber(item.price_toman),pd=brsNumber(item.price);
    if(Number.isFinite(pt)&&pt>0&&item.price_toman!==undefined){
      toman=pt;usd=Number.isFinite(pd)&&pd>0?pd:null;
    }else{
      if(unit==='ریال')toman/=10;
      if(unit==='دلار'){
        usd=toman;
        const rate=getBrsUsdRate(data)||Number(settings.usdToTomanRate)||0;
        toman=rate>0?toman*rate:0;
      }
    }
    return {toman,usd,item};
  }
  function updateTickerFromBrsData(data){
    const rate=getBrsUsdRate(data)||Number(settings.usdToTomanRate)||0;
    const tickerDefs=settings.marketDefs?.length?settings.marketDefs:marketDefs;
    tickerDefs.forEach(t=>{
      const f=findBrsInstrument(data,{symbol:t.keyword||t.key,keywords:[t.keyword,t.name]});
      if(!f)return;
      const unit=norm(f.item.unit),raw=f.price;let toman=raw,usdVal=null;
      const pt=brsNumber(f.item.price_toman);
      if(Number.isFinite(pt)&&pt>0&&f.item.price_toman!==undefined){toman=pt;usdVal=brsNumber(f.item.price);}
      else if(unit==='دلار'){usdVal=raw;toman=rate>0?raw*rate:0;}
      else if(unit==='ریال')toman=raw/10;
      if(toman>0)market[t.key]={price:toman,change:brsNumber(f.item.change_percent)??0};
    });
  }
  async function fetchBrsApiData(){
    const key=(settings.apiKey||'').trim();
    if(!key)throw new Error('BRSAPI token missing');
    const base=(settings.apiUrl||'https://Api.BrsApi.ir').replace(/\/$/,'');
    const url=/Gold_Currency\.php/i.test(base)?`${base}${base.includes('?')?'&':'?'}key=${encodeURIComponent(key)}`:`${base}/Market/Gold_Currency.php?key=${encodeURIComponent(key)}`;
    const res=await fetch(url,{headers:{Accept:'application/json'},cache:'no-store'});
    if(!res.ok)throw new Error(`BRSAPI ${res.status}`);
    const data=await res.json();
    if(!data||typeof data!=='object')throw new Error('BRSAPI response is not JSON object');
    return data;
  }
  async function refreshPrices(){
    const btn=$('fmRefreshPrices');btn.classList.add('loading');
    try{
      const data=await fetchBrsApiData();
      const defs=(settings.marketDefs?.length?settings.marketDefs:marketDefs.map(x=>({...x}))).filter(x=>x.enabled!==false);
      let count=0;
      for(const d of defs){
        const q=findBrsQuote(data,d.keyword||d.key||d.name);
        if(q&&q.toman>0){market[d.key]={price:q.toman,change:brsNumber(q.item.change_percent)??0};count++;}
      }
      for(const a of assets.filter(x=>(x.priceMode||'manual')==='api'&&(x.keyword||x.name))){
        const q=findBrsQuote(data,a.keyword||a.name);
        if(q&&q.toman>0){a.currentPrice=Math.round(q.toman);if(q.usd!=null)a.apiUsdPrice=q.usd;else delete a.apiUsdPrice;}
      }
      updateTickerFromBrsData(data);
      write(STORE,assets);write(MARKET,market);localStorage.setItem('finance-market-updated-at',String(Date.now()));snapshot();render();
      toast(count?`${count} قیمت بروزرسانی شد`:'قیمت قابل تشخیص از BRSAPI دریافت نشد');
    }catch(e){
      console.error('BRSAPI refresh failed',e);
      toast('بروزرسانی BRSAPI انجام نشد؛ توکن یا دسترسی API را بررسی کن');
    }finally{btn.classList.remove('loading')}
  }
  function saveSettings(){settings.refreshHours=Math.max(.1,Number($('fmRefreshHours').value)||1);settings.apiUrl=$('fmApiUrl').value.trim().replace(/\/+$/,'')||'https://brsapi.ir';settings.apiKey=$('fmApiKey').value.trim()||'B5nkrcZaHTwxR29G4w2CqhqXdKeWnE5r';write(SET,settings);armTimer();toast('تنظیمات ذخیره شد')}
  function armTimer(){clearInterval(timer);timer=setInterval(refreshPrices,Math.max(.1,Number(settings.refreshHours)||1)*3600000)}
  function bindSwipes(){
    document.querySelectorAll('.fm-asset-shell:not(.fm-vehicle-asset)').forEach(el=>{
      if(el.classList.contains('fm-vehicle-asset')){el.style.removeProperty('--swipe-x');el.classList.remove('swiped-left','swiped-right');return}
      let sx=0,dx=0,drag=false,moved=false;
      const state=()=>el.classList.contains('swiped-left')?'left':el.classList.contains('swiped-right')?'right':'closed';
      const close=()=>{el.classList.remove('swiped-left','swiped-right');el.style.setProperty('--swipe-x','0px')};
      el.onpointerdown=e=>{if(e.pointerType==='mouse'&&e.button!==0)return;if(e.target.closest('button'))return;sx=e.clientX;dx=0;moved=false;drag=true;el.setPointerCapture?.(e.pointerId)};
      el.onpointermove=e=>{if(!drag)return;dx=e.clientX-sx;if(Math.abs(dx)>8)moved=true;if(Math.abs(dx)>6)e.preventDefault();const st=state();let base=st==='left'?-142:st==='right'?142:0;let x=base+dx;if(st==='left'&&dx>0)x=Math.min(0,base+dx);if(st==='right'&&dx<0)x=Math.max(0,base+dx);x=Math.max(-142,Math.min(142,x));el.style.setProperty('--swipe-x',x+'px')};
      el.onpointerup=()=>{if(!drag)return;drag=false;const st=state(),x=dx;if(st==='left'){if(x>25)close();else el.style.setProperty('--swipe-x','-142px');return}if(st==='right'){if(x<-25)close();else el.style.setProperty('--swipe-x','142px');return}if(Math.abs(x)>55){el.classList.toggle('swiped-left',x<0);el.classList.toggle('swiped-right',x>0);el.style.setProperty('--swipe-x',x<0?'-142px':'142px')}else el.style.setProperty('--swipe-x','0px')};
      el.onpointercancel=()=>{drag=false;el.style.setProperty('--swipe-x','0px')};
      el.onclick=e=>{if(moved)return;if(e.target.closest('.fm-swipe-actions')||e.target.closest('[data-details]'))return;if(state()!=='closed')close()};
    })
  }
  $('fmManageCategories').onclick=()=>categoryModal();$('fmAddAsset').onclick=()=>assetModal();$('fmTransactions').onclick=portfolioTransactions;$('fmRefreshPrices').onclick=refreshPrices;$('fmSaveSettings').onclick=saveSettings;$('fmMarketSettings').onclick=marketSettings;$('fmBackupExport').onclick=()=>{const data={version:3,exportedAt:new Date().toISOString(),assets,categories,assetDefinitions,settings,snapshots,market,transactions};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`finance-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)};$('fmBackupImport').onclick=()=>$('fmBackupFile').click();$('fmBackupFile').onchange=e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(Array.isArray(d.assets))assets=d.assets;if(Array.isArray(d.categories))categories=d.categories;if(Array.isArray(d.assetDefinitions))assetDefinitions=d.assetDefinitions;if(d.settings)settings={...settings,...d.settings};if(Array.isArray(d.snapshots))snapshots=d.snapshots;if(d.market)market=d.market;if(Array.isArray(d.transactions))transactions=d.transactions;write(STORE,assets);write(CAT,categories);write(ASSET_DEF,assetDefinitions);write(SET,settings);write(SNAP,snapshots);write(MARKET,market);write(TX,transactions);render();armTimer();toast('بکاپ با موفقیت وارد شد')}catch{toast('فایل بکاپ معتبر نیست')}};r.readAsText(f);e.target.value='' };
  $('fmPrivacyToggle').onclick=()=>{privacy=!privacy;saveUi();renderSummary();if(assetsView==='donut')renderDonut(totalPortfolio())};$('fmAssetSearch').oninput=renderAssets;$('fmAssetSearchClear').onclick=()=>{$('fmAssetSearch').value='';renderAssets();$('fmAssetSearch').focus()};$('fmCategoryFilter').onchange=renderAssets;$('fmSourceFilter').onchange=renderAssets;
  document.querySelectorAll('[data-sort-assets]').forEach(b=>b.onclick=()=>{assetSort=b.dataset.sortAssets;saveUi();document.querySelectorAll('[data-sort-assets]').forEach(x=>x.classList.toggle('active',x===b));$('fmSortPanel').hidden=true;renderAssets()});
  $('fmDashboardToolsToggle').onclick=()=>{settings.ui={...(settings.ui||{}),searchToolsCollapsed:!settings.ui?.searchToolsCollapsed};write(SET,settings);applyDashboardUi()};$('fmChartToggle').onclick=()=>{settings.ui={...(settings.ui||{}),chartCollapsed:!settings.ui?.chartCollapsed};write(SET,settings);applyDashboardUi();if(!settings.ui.chartCollapsed)requestAnimationFrame(renderChart)};$('fmNumberTabs').querySelectorAll('[data-number-mode]').forEach(b=>b.onclick=()=>{numberMode=b.dataset.numberMode;saveUi();syncDashboardSelections();render()});$('fmViewTabs').querySelectorAll('[data-assets-view]').forEach(b=>b.onclick=()=>{assetsView=b.dataset.assetsView;saveUi();syncDashboardSelections();renderAssets()});$('fmPnlTabs').querySelectorAll('[data-pnl-period]').forEach(b=>b.onclick=()=>{pnlPeriod=b.dataset.pnlPeriod;saveUi();syncDashboardSelections();renderSummary()});$('fmChartTabs').querySelectorAll('[data-chart-unit]').forEach(b=>b.onclick=()=>{chartUnit=b.dataset.chartUnit;saveUi();syncDashboardSelections();renderChart()});
  $('fmAssetsList').addEventListener('click',e=>{const shell=e.target.closest('.fm-asset-shell');if(!shell)return;const id=shell.dataset.assetId;if(shell.dataset.vehicleId){const carNav=document.querySelector('.nav-item[data-target="car"]');carNav?.click();return}if(e.target.closest('[data-buy]'))tradeModal(id,'buy');else if(e.target.closest('[data-sell]'))tradeModal(id,'sell');else if(e.target.closest('[data-ledger]'))ledgerModal(id);else if(e.target.closest('[data-details]'))assetDetailsModal(id);else if(e.target.closest('[data-fm-edit]'))assetModal(id);else if(e.target.closest('[data-fm-delete]')){const a=assets.find(x=>String(x.id)===String(id));if(a&&confirm(`دارایی «${a.name}» حذف شود؟`)){assets=assets.filter(x=>x!==a);transactions=transactions.filter(t=>String(t.assetId)!==String(id));write(STORE,assets);write(TX,transactions);snapshot();render();toast('دارایی حذف شد')}}else if(e.target.closest('[data-note]'))noteModal(id)});
  window.addEventListener('finance-tab-changed',e=>{if(e.detail?.name==='dashboard'){requestAnimationFrame(()=>{render();requestAnimationFrame(renderChart)})}});window.addEventListener('resize',()=>{if(document.querySelector('.dashboard-page.active'))renderChart()});window.addEventListener('storage',e=>{if([STORE,CAT,SET,SNAP,MARKET,TX,ASSET_DEF].includes(e.key)){assets=read(STORE,[]);categories=read(CAT,categories);settings=read(SET,settings);snapshots=read(SNAP,[]);market=read(MARKET,market);transactions=read(TX,[]);assetDefinitions=read(ASSET_DEF,assetDefinitions);render()}});syncPortfolioEvents();snapshot();render();armTimer();
})();

/* Mobile navigation history: overlays first, then previous tab. */
(()=>{const modalSelector='.car-modal.open,.loan-modal.open,.fm-modal.open,.event-modal.open';let internal=false;const currentTab=()=>document.querySelector('.nav-item.active')?.dataset.target||'dashboard';history.replaceState({financeTab:currentTab()},'',location.href);document.querySelectorAll('.nav-item').forEach(item=>item.addEventListener('click',()=>{if(internal)return;const target=item.dataset.target;if(target&&target!==currentTab())history.pushState({financeTab:target},'',location.href)}));window.addEventListener('popstate',e=>{
  const modals=[...document.querySelectorAll(modalSelector)];
  if(modals.length){
    const m=modals[modals.length-1];
    m.classList.remove('open');m.setAttribute('aria-hidden','true');delete m.dataset.historyManaged;
    return;
  }
  const target=e.state?.financeTab;
  if(target){
    const item=document.querySelector(`.nav-item[data-target="${target}"]`);
    if(item){internal=true;item.click();internal=false}
  }
});})();
