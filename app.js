
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './config.js';


  /* ─────────────────── 미션 풀 (30+) ─────────────────── */
  const POOL = [
    { t:'창밖을 보며 5분간 천천히 심호흡하기',           c:'힐링', e:'🌿', m:'약 5분' },
    { t:'좋아하는 음악 한 곡을 눈 감고 집중해서 듣기',   c:'힐링', e:'🎵', m:'약 5분' },
    { t:'따뜻한 차 한 잔을 천천히 음미하며 마시기',       c:'힐링', e:'🍵', m:'약 10분' },
    { t:'하늘 사진 찍고 감상 한 줄 적어보기',             c:'힐링', e:'🌤️', m:'약 5분' },
    { t:'5분 동안 아무 생각 없이 명상하기',               c:'힐링', e:'🧘', m:'약 5분' },
    { t:'좋아하는 향기 맡으며 잠시 쉬어가기',             c:'힐링', e:'🕯️', m:'약 5분' },
    { t:'오늘 본 가장 예쁜 것 하나 떠올려보기',           c:'힐링', e:'🌸', m:'약 3분' },

    { t:'오랫동안 연락 못 한 친구에게 안부 문자 보내기',  c:'소통', e:'💛', m:'약 5분' },
    { t:'가족에게 "고마워" 한마디 전하기',                c:'소통', e:'🏠', m:'약 3분' },
    { t:'옆 사람에게 진심 어린 칭찬 한마디 건네기',       c:'소통', e:'💬', m:'약 3분' },
    { t:'감사한 사람에게 짧은 감사 메시지 보내기',        c:'소통', e:'💌', m:'약 5분' },
    { t:'모르는 사람에게 먼저 미소 짓기',                 c:'소통', e:'😊', m:'약 1분' },

    { t:'책상 위 한 칸만 깔끔하게 정리하기',              c:'정리', e:'✨', m:'약 5분' },
    { t:'스마트폰 알림 설정 정리하기',                    c:'정리', e:'📱', m:'약 5분' },
    { t:'지갑 속 필요 없는 영수증 정리하기',              c:'정리', e:'👛', m:'약 3분' },
    { t:'이메일 읽지 않은 메일 5개만 정리하기',           c:'정리', e:'📧', m:'약 5분' },
    { t:'사진첩에서 흐릿한 사진 10장 지우기',             c:'정리', e:'📸', m:'약 5분' },
    { t:'서랍 하나만 열어서 정리하기',                    c:'정리', e:'🗄️', m:'약 10분' },

    { t:'오늘 감사한 일 3가지 적어보기',                  c:'성장', e:'🌱', m:'약 5분' },
    { t:'새로운 단어 하나 배워보기',                      c:'성장', e:'📖', m:'약 5분' },
    { t:'관심 분야 아티클 하나 읽기',                     c:'성장', e:'📰', m:'약 10분' },
    { t:'내일 할 일 3가지만 미리 적어놓기',               c:'성장', e:'📝', m:'약 5분' },
    { t:'오늘 하루를 한 문장으로 요약해보기',              c:'성장', e:'✏️', m:'약 3분' },
    { t:'인상적인 문장 하나 필사하기',                    c:'성장', e:'📚', m:'약 5분' },

    { t:'제자리에서 스트레칭 5분 하기',                   c:'활력', e:'💪', m:'약 5분' },
    { t:'물 한 잔 마시고 잠깐 걷기',                      c:'활력', e:'🚶', m:'약 5분' },
    { t:'좋아하는 노래에 맞춰 1분 춤추기',                c:'활력', e:'💃', m:'약 3분' },
    { t:'바깥 공기 마시며 5분 산책하기',                   c:'활력', e:'🌳', m:'약 5분' },
    { t:'계단으로 한 층 오르내리기',                      c:'활력', e:'🏃', m:'약 3분' },

    { t:'눈에 보이는 물건 하나 30초 스케치',              c:'창의', e:'🎨', m:'약 5분' },
    { t:'오늘의 기분을 색깔로 표현해보기',                c:'창의', e:'🖍️', m:'약 3분' },
    { t:'짧은 하이쿠 한 편 지어보기',                    c:'창의', e:'🖊️', m:'약 5분' },

    { t:'카페 직원에게 밝게 인사하기',                    c:'친절', e:'☕', m:'약 1분' },
    { t:'주변 쓰레기 하나 주워서 버리기',                 c:'친절', e:'🗑️', m:'약 1분' },
    { t:'엘리베이터에서 문 잡아주기',                     c:'친절', e:'🤗', m:'약 1분' },
  ];

  const QUOTES = [
    '"작은 행동이 큰 변화를 만들어요 💜"',
    '"오늘 하루도 당신은 충분히 멋져요 ✨"',
    '"시작이 반이에요! 이미 절반 왔어요 🌟"',
    '"매일 1%의 성장이 기적을 만들어요 🌱"',
    '"완벽하지 않아도 괜찮아요. 해냈다는 게 중요해요 💪"',
    '"잠깐이라도 쉬어가는 것도 용기예요 ☕"',
  ];

  /* ─────────────────── 유틸 ─────────────────── */
  const $ = id => document.getElementById(id);
  const S  = n => String(n).padStart(2,'0');
  function todayKey() { return new Date(Date.now()+9*60*60*1000).toISOString().slice(0,10); }

  const client = SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, { auth: { flowType: 'pkce' } }) : null;
  let currentUser=null, st=null, cur=null, generating=false;
  let calDate=new Date();
  let activeTab='mission', requestSequence=0;

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function showError(error) {
    const messages={DAILY_LIMIT:'오늘 새 퀘스트 3회를 모두 사용했어요. 한국 시간 자정에 초기화돼요.',
      ALREADY_DONE:'오늘의 미션은 이미 완료했어요.', MISSION_CHANGED:'다른 탭에서 미션이 바뀌었어요. 현재 미션을 확인해주세요.',
      SAME_MISSION:'같은 미션이 나왔어요. 다시 시도해주세요.',
      AI_QUOTA:'AI 서비스의 사용량 한도에 도달했어요. 잠시 후 다시 시도해주세요.',
      AI_FAILED:'AI 생성에 실패했어요. 기존 미션은 유지되며 요청 횟수는 1회 사용됐어요.',
      SERVER_NOT_READY:'AI 서버를 준비 중이에요. 잠시 후 다시 시도해주세요.',
      LOGIN_REQUIRED:'연결이 만료됐어요. 페이지를 새로고침해주세요.',
      STALE_REQUEST:'다른 요청으로 미션이 바뀌었어요. 현재 미션을 확인해주세요.'};
    alert(messages[error.message] || '요청에 실패했어요. 잠시 후 다시 시도해주세요.');
  }
  async function action(kind, mission=pick()) {
    const uid=currentUser, sequence=++requestSequence;
    if(!uid || !client) throw new Error('LOGIN_REQUIRED');
    const {data,error}=await client.rpc('daily_spark_action',{p_action:kind,p_mission:mission});
    if(error) throw error;
    if(currentUser!==uid || sequence!==requestSequence) return null;
    st=data; cur=st.tMission;
    renderApp();
    return data;
  }
  function renderQuota() {
    const count=st.tKey===todayKey() ? st.refreshCount : 0;
    const done=st.tKey===todayKey() && st.tDone;
    const remaining=Math.max(0,3-count);
    $('refreshQuota').textContent=`오늘 새 퀘스트 받기 ${remaining}/3회 남음 · 한국 시간 자정 초기화`;
    ['btnRandom','btnAi','btnDone'].forEach(id=>{
      const disabled=generating || done || (id!=='btnDone' && remaining===0);
      $(id).disabled=disabled;
      $(id).classList.toggle('opacity-50',disabled);
      $(id).classList.toggle('cursor-not-allowed',disabled);
    });
  }
  async function enterApp(user) {
    if(currentUser!==user.id) {
        currentUser=user.id; st=null; cur=null;
    }
    $('elUser').textContent='나의 미션';
    try {
      await action('get');
      if(currentUser!==user.id) return;
      $('authScreen').classList.add('hidden');
      $('appScreen').classList.remove('hidden');
    } catch(error) {
      if(currentUser===user.id) $('authError').textContent='미션을 불러오지 못했어요. 연결 상태를 확인하고 새로고침해주세요.';
    }
  }

  /* ─────────────────── 앱 로직 ─────────────────── */
  function pick(exclude) {
    let p = POOL.filter(m => m.t !== exclude);
    if (!p.length) p = POOL;
    return {...p[Math.floor(Math.random()*p.length)],ai:false};
  }

  function renderDate() {
    const d=new Date(todayKey()+'T12:00:00'), dn=['일','월','화','수','목','금','토'];
    $('elDate').textContent = `${d.getMonth()+1}월 ${d.getDate()}일 (${dn[d.getDay()]})`;
  }

  function renderCard(m, done) {
    $('mText').textContent  = m.t;
    $('mEmoji').textContent = m.e;
    $('mCat').textContent   = m.c;
    $('mTime').textContent  = m.m;
    $('mAiBadge').classList.toggle('hidden', !m.ai);

    const card=$('missionCard'), ov=$('doneOverlay'), btns=[$('btnDone'),$('btnRandom'),$('btnAi')];
    if (done) {
      card.classList.remove('card-grad'); card.classList.add('card-done');
      ov.classList.remove('hidden');
      btns.forEach(b=>{ b.disabled=true; b.classList.add('opacity-50','cursor-not-allowed'); });
    } else {
      card.classList.remove('card-done'); card.classList.add('card-grad');
      ov.classList.add('hidden');
      btns.forEach(b=>{ b.disabled=false; b.classList.remove('opacity-50','cursor-not-allowed'); });
    }
    renderQuota();
  }

  function renderQuote() { $('elQuote').textContent = QUOTES[Math.floor(Math.random()*QUOTES.length)]; }

  function renderWeek() {
    const today=new Date(todayKey()+'T12:00:00'), dow=(today.getDay()+6)%7, mon=new Date(today);
    mon.setDate(today.getDate()-dow); mon.setHours(0,0,0,0);
    const labels=['월','화','수','목','금','토','일'];
    let cnt=0, html='';
    labels.forEach((l,i) => {
      const d=new Date(mon); d.setDate(mon.getDate()+i);
      const k=`${d.getFullYear()}-${S(d.getMonth()+1)}-${S(d.getDate())}`;
      const done=st.hist.some(h=>h.date===k), isT=k===todayKey();
      if(done) cnt++;
      let cls='w-6 h-6 rounded-full mx-auto flex items-center justify-center text-[10px] font-bold ';
      if(done) cls+='bg-gradient-to-br from-green-400 to-emerald-500 text-white';
      else if(isT) cls+='bg-violet-100 ring-2 ring-violet-300 ring-offset-1 text-violet-500';
      else cls+='bg-gray-100 text-gray-300';
      html+=`<span class="text-center"><span class="block text-[10px] text-gray-400 mb-1">${l}</span><span class="${cls}">${done?'✓':''}</span></span>`;
    });
    $('weekDots').innerHTML=html;
    $('weekLabel').textContent=`${cnt} / 7`;
    $('weekBar').style.width=`${Math.round(cnt/7*100)}%`;
  }

  async function runBusy(task) {
    if(!currentUser || !st || generating) return;
    generating=true;
    renderQuota();
    try { await task(); } catch(error) {
      if(error.name!=='AbortError') showError(error);
    } finally {
      generating=false;
      $('mLoading').classList.add('hidden');
      if(st) renderApp();
    }
  }
  window.drawRandom=()=>runBusy(async()=>{
    await action('refresh',pick(cur.t));
    renderQuote();
  });
  window.completeMission=()=>runBusy(async()=>{
    await action('complete',cur);
    confetti();
  });
  window.generateAiMission=()=>runBusy(async()=>{
    const uid=currentUser, sequence=++requestSequence;
    $('mLoading').classList.remove('hidden');
    const {data,error}=await client.functions.invoke('generate-mission',{body:{}});
    if(error) {
      let code='AI_FAILED';
      if(error.context instanceof Response) {
        const payload=await error.context.json().catch(()=>null);
        if(payload?.error) code=payload.error;
      }
      if(currentUser===uid) await action('get').catch(()=>{});
      throw new Error(code);
    }
    if(currentUser!==uid || sequence!==requestSequence) return;
    st=data; cur=st.tMission; renderApp();
  });

  /* ─────── 컨페티 ─────── */
  function confetti() {
    const box=$('confettiBox'); box.classList.remove('hidden'); box.innerHTML='';
    const cols=['#8B5CF6','#EC4899','#F59E0B','#22C55E','#3B82F6','#EF4444','#14B8A6','#F472B6'];
    for(let i=0;i<80;i++){
      const p=document.createElement('div'); p.classList.add('confetti-p');
      Object.assign(p.style,{
        left:Math.random()*100+'%', top:'-12px',
        width:(Math.random()*8+4)+'px', height:(Math.random()*8+4)+'px',
        backgroundColor:cols[Math.floor(Math.random()*cols.length)],
        borderRadius:Math.random()>.5?'50%':'2px',
        '--dur':(Math.random()*1.4+1)+'s',
        animationDelay:(Math.random()*.5)+'s',
      });
      box.appendChild(p);
    }
    setTimeout(()=>{ box.classList.add('hidden'); box.innerHTML=''; },3200);
  }

  /* ─────── 탭 ─────── */
  window.setTab = t => {
    activeTab=t;
    const on='tab-on', off='bg-white/50 text-gray-500 hover:bg-white/70';
    if(t==='mission') {
      $('secMission').classList.remove('hidden'); $('secHistory').classList.add('hidden');
      $('tabMission').className=`tab flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 ${on}`;
      $('tabHistory').className=`tab flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 ${off}`;
    } else {
      $('secMission').classList.add('hidden'); $('secHistory').classList.remove('hidden');
      $('tabHistory').className=`tab flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 ${on}`;
      $('tabMission').className=`tab flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 ${off}`;
      renderCal(); renderHist(); renderStats();
    }
  };

  /* ─────── 캘린더 ─────── */
  window.calNav = d => { calDate.setMonth(calDate.getMonth()+d); renderCal(); };
  function renderCal() {
    const y=calDate.getFullYear(), m=calDate.getMonth();
    $('calTitle').textContent=`${y}년 ${m+1}월`;
    const g=$('calGrid'); g.innerHTML='';
    const first=new Date(y,m,1), last=new Date(y,m+1,0), off=(first.getDay()+6)%7;
    for(let i=0;i<off;i++) g.innerHTML+='<span></span>';
    const tk=todayKey();
    for(let d=1;d<=last.getDate();d++){
      const k=`${y}-${S(m+1)}-${S(d)}`;
      const done=st.hist.some(h=>h.date===k), isT=k===tk;
      let c='w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center mx-auto text-xs font-medium transition-all hover:scale-110 cursor-default ';
      if(done) c+='bg-gradient-to-br from-green-400 to-emerald-500 text-white font-bold shadow-sm';
      else if(isT) c+='bg-violet-100 text-violet-600 font-bold ring-2 ring-violet-300';
      else c+='text-gray-400 hover:bg-gray-100';
      const tip=done?(st.hist.find(h=>h.date===k)?.mission||''):'';
      g.innerHTML+=`<span class="${c}" title="${escapeHtml(tip)}">${d}</span>`;
    }
  }

  /* ─────── 히스토리 ─────── */
  function renderHist() {
    const sorted=[...st.hist].sort((a,b)=>b.date.localeCompare(a.date));
    if(!sorted.length){ $('histList').innerHTML=''; $('histEmpty').classList.remove('hidden'); return; }
    $('histEmpty').classList.add('hidden');
    const dn=['일','월','화','수','목','금','토'];
    $('histList').innerHTML = sorted.slice(0,30).map(h=>{
      const [y,m,d]=h.date.split('-'); const dt=new Date(+y,+m-1,+d);
      return `<div class="flex items-center gap-3 px-5 py-3 hover:bg-violet-50/40 transition">
        <span class="text-2xl flex-shrink-0">${escapeHtml(h.emoji||'✨')}</span>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-gray-700 truncate">${escapeHtml(h.mission)}</p>
          <p class="text-xs text-gray-400 mt-0.5">${+m}월 ${+d}일 (${dn[dt.getDay()]})${h.ai?' · 🤖 AI':''}</p>
        </div>
        <span class="text-green-500 flex-shrink-0 text-lg">✓</span>
      </div>`;
    }).join('');
  }

  /* ─────── 통계 ─────── */
  function renderStats() {
    $('sTotal').textContent = st.hist.length;
    let streak=0; const today=new Date(todayKey()+'T12:00:00'); today.setHours(0,0,0,0);
    for(let i=0;i<365;i++){
      const d=new Date(today); d.setDate(today.getDate()-i);
      const k=`${d.getFullYear()}-${S(d.getMonth()+1)}-${S(d.getDate())}`;
      if(st.hist.some(h=>h.date===k)) streak++;
      else { if(i===0) continue; break; }
    }
    $('sStreak').textContent = streak;
    const dow=(today.getDay()+6)%7, mon=new Date(today); mon.setDate(today.getDate()-dow); mon.setHours(0,0,0,0);
    let wc=0;
    for(let i=0;i<7;i++){
      const d=new Date(mon); d.setDate(mon.getDate()+i);
      const k=`${d.getFullYear()}-${S(d.getMonth()+1)}-${S(d.getDate())}`;
      if(st.hist.some(h=>h.date===k)) wc++;
    }
    $('sWeek').textContent = wc;
  }

  function renderApp() {
    if(!st || !cur) return;
    renderDate();
    renderCard(cur,st.tKey===todayKey() && st.tDone);
    renderWeek();
    if(activeTab==='history') { renderCal(); renderHist(); renderStats(); }
  }
  async function boot() {
    renderQuote();
    if(!client) {
      $('authError').textContent='서비스를 준비하고 있어요. 잠시 후 다시 방문해주세요.';
      return;
    }
    const {data,error}=await client.auth.getSession();
    if(error) throw error;
    let user=data.session?.user;
    if(!user) {
      const result=await client.auth.signInAnonymously();
      if(result.error) throw result.error;
      user=result.data.user;
    }
    await enterApp(user);
    const sync=()=>{ if(currentUser && st && !generating) action('get').catch(()=>{ if(st) $('refreshQuota').textContent='동기화에 실패했어요. 연결 상태를 확인해주세요.'; }); };
    window.addEventListener('focus',sync);
    document.addEventListener('visibilitychange',()=>{ if(!document.hidden) sync(); });
    setInterval(()=>{ if(st) renderApp(); },1000);
  }
  boot().catch(()=>{ $('authError').textContent='앱을 시작하지 못했어요. 새로고침 후 다시 시도해주세요.'; });
