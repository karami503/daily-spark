
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
  let calDate=new Date(), requestController=null;
  let activeTab='mission', requestSequence=0;

  function getApiKey() { return currentUser ? sessionStorage.getItem(`ds_key_${currentUser}`) || '' : ''; }
  function setApiKey(key) { sessionStorage.setItem(`ds_key_${currentUser}`,key); }
  function removeApiKey() { if(currentUser) sessionStorage.removeItem(`ds_key_${currentUser}`); }
  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function showError(error) {
    const messages={DAILY_LIMIT:'오늘 새 퀘스트 3회를 모두 사용했어요. 한국 시간 자정에 초기화돼요.',
      ALREADY_DONE:'오늘의 미션은 이미 완료했어요.', MISSION_CHANGED:'다른 탭에서 미션이 바뀌었어요. 현재 미션을 확인해주세요.',
      SAME_MISSION:'같은 미션이 나왔어요. 횟수는 차감되지 않았으니 다시 시도해주세요.'};
    const safeMessages=['API 키의 유효성과 Gemini API 사용 권한을 확인해주세요.','Gemini 사용량 한도에 도달했어요. 잠시 후 다시 시도해주세요.','Gemini 서버가 응답하지 않아요. 잠시 후 다시 시도해주세요.','Gemini 응답 시간이 초과됐어요. 미션과 남은 횟수는 유지돼요.','AI 응답 형식이 올바르지 않아요. 다시 시도해주세요.','AI 미션 내용을 확인할 수 없어요. 다시 시도해주세요.'];
    alert(messages[error.message] || (safeMessages.includes(error.message)?error.message:'요청에 실패했어요. 연결 상태와 설정을 확인한 뒤 다시 시도해주세요.'));
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
  window.authSubmit=async()=>{
    if(!client) return;
    $('authError').textContent='';
    const {error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+location.pathname}});
    if(error) $('authError').textContent='Google 로그인에 실패했어요. 잠시 후 다시 시도해주세요.';
  };
  window.logout=async()=>{
    if(generating) return;
    const {error}=await client.auth.signOut();
    if(error) { showError(error); return; }
    removeApiKey();
    currentUser=null; st=null; cur=null;
    $('inpKey').value='';
    closeSettings();
    $('appScreen').classList.add('hidden');
    $('authScreen').classList.remove('hidden');
  };
  async function enterApp(user) {
    if(currentUser!==user.id) {
      removeApiKey();
      requestController?.abort();
      currentUser=user.id; st=null; cur=null;
    }
    $('elUser').textContent=user.user_metadata?.full_name || user.email || '사용자';
    try {
      await action('get');
      if(currentUser!==user.id) return;
      $('authScreen').classList.add('hidden');
      $('appScreen').classList.remove('hidden');
      refreshAiHint();
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
    $('btnLogout').disabled=true;
    try { await task(); } catch(error) {
      if(error.name!=='AbortError') showError(error);
    } finally {
      generating=false;
      $('btnLogout').disabled=false;
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
  window.generateAiMission=()=>{
    if(!currentUser || generating || !st) return;
    const key=getApiKey();
    if(!key) { openSettings(); return; }
    return runBusy(async()=>{
      await action('get');
      if(st.tDone || st.refreshCount>=3) throw new Error(st.tDone?'ALREADY_DONE':'DAILY_LIMIT');
      const uid=currentUser;
      requestController=new AbortController();
      const timer=setTimeout(()=>requestController.abort(),45000);
      $('mLoading').classList.remove('hidden');
      try {
        const res=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',{
          method:'POST',signal:requestController.signal,
          headers:{'Content-Type':'application/json','x-goog-api-key':key},
          body:JSON.stringify({contents:[{parts:[{text:`일상에서 안전하게 혼자 실천할 수 있는 긍정적인 5~10분 미션 하나를 추천해줘. 돈을 쓰거나 위험한 행동은 제외해줘. 다음 미션과 다른 내용으로 작성해줘: ${cur.t}.` }]}],
            generationConfig:{temperature:0.95,maxOutputTokens:512,thinkingConfig:{thinkingBudget:0},responseMimeType:'application/json',
              responseSchema:{type:'OBJECT',properties:{mission:{type:'STRING'},category:{type:'STRING',enum:['힐링','소통','정리','성장','활력','창의','친절']},emoji:{type:'STRING'},time:{type:'STRING'}},required:['mission','category','emoji','time']}}})
        });
        if(!res.ok) {
          if(res.status===400 || res.status===403) throw new Error('API 키의 유효성과 Gemini API 사용 권한을 확인해주세요.');
          if(res.status===429) throw new Error('Gemini 사용량 한도에 도달했어요. 잠시 후 다시 시도해주세요.');
          throw new Error('Gemini 서버가 응답하지 않아요. 잠시 후 다시 시도해주세요.');
        }
        const data=await res.json();
        const raw=data.candidates?.[0]?.content?.parts?.filter(p=>p.text).map(p=>p.text).join('') || '';
        const mission=parseAi(raw);
        if(currentUser===uid) await action('refresh',mission);
      } catch(error) {
        if(error.name==='AbortError') throw new Error('Gemini 응답 시간이 초과됐어요. 미션과 남은 횟수는 유지돼요.');
        throw error;
      } finally { clearTimeout(timer); requestController=null; }
    });
  };
  function parseAi(raw) {
    let o;
    try { o=JSON.parse(raw); } catch { throw new Error('AI 응답 형식이 올바르지 않아요. 다시 시도해주세요.'); }
    const fields=[['mission',200],['emoji',32],['time',40]];
    if(fields.some(([key,max])=>typeof o[key]!=='string' || !o[key].trim() || [...o[key]].length>max)
      || !['힐링','소통','정리','성장','활력','창의','친절'].includes(o.category))
      throw new Error('AI 미션 내용을 확인할 수 없어요. 다시 시도해주세요.');
    return {t:o.mission.trim(),c:o.category,e:o.emoji.trim(),m:o.time.trim(),ai:true};
  }

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

  /* ─────── 설정 모달 ─────── */
  window.openSettings = () => {
    const bg=$('modalBg'), panel=$('modalPanel');
    bg.classList.remove('hidden');
    requestAnimationFrame(()=>{ bg.classList.remove('opacity-0'); panel.classList.remove('translate-y-8','opacity-0'); });
    $('inpKey').type='password';
    $('inpKey').value = getApiKey();
    $('inpKey').focus();
    refreshKeyUI();
  };
  window.closeSettings = (e) => {
    if(e && e.target!==e.currentTarget) return;
    const bg=$('modalBg'), panel=$('modalPanel');
    bg.classList.add('opacity-0'); panel.classList.add('translate-y-8','opacity-0');
    setTimeout(()=>bg.classList.add('hidden'),300);
  };
  window.toggleKeyVis = () => {
    const inp=$('inpKey');
    inp.type = inp.type==='password'?'text':'password';
    $('btnEye').textContent = inp.type==='password'?'👁':'🙈';
  };
  window.saveKey = () => {
    const k=$('inpKey').value.trim();
    if(!/^AIza[\w-]{35}$/.test(k)) { alert('올바른 Gemini API 키를 입력해주세요.'); return; }
    setApiKey(k);
    refreshKeyUI(); refreshAiHint();
    alert('✅ API 키가 저장되었습니다!');
  };
  window.removeKey = () => {
    removeApiKey();
    $('inpKey').value='';
    refreshKeyUI(); refreshAiHint();
    alert('🗑️ API 키가 삭제되었습니다.');
  };
  function refreshKeyUI() {
    const k=getApiKey(), s=$('keyStatus');
    if(k) {
      s.textContent=`✅ 키 설정됨: ${k.slice(0,8)}…${k.slice(-4)}`;
      s.className='text-xs text-green-500 mb-4';
    } else {
      s.textContent='키가 설정되지 않았습니다.';
      s.className='text-xs text-gray-400 mb-4';
    }
  }
  function refreshAiHint() {
    const k=getApiKey();
    $('aiKeyHint').textContent = k ? '(Gemini ✓)' : '(키 미설정)';
    $('aiKeyHint').className = k ? 'text-[10px] text-green-500 ml-1 font-semibold' : 'text-[10px] text-gray-400 ml-1';
  }

  function renderApp() {
    if(!st || !cur) return;
    renderDate();
    renderCard(cur,st.tKey===todayKey() && st.tDone);
    renderWeek();
    if(activeTab==='history') { renderCal(); renderHist(); renderStats(); }
    refreshAiHint();
  }
  async function boot() {
    renderQuote();
    if(!client) {
      $('authError').textContent='로그인 서비스 연결을 준비하고 있어요. 잠시 후 다시 방문해주세요.';
      return;
    }
    $('authBtn').disabled=false;
    client.auth.onAuthStateChange((event,session)=>{
      if(event==='SIGNED_OUT') {
        removeApiKey(); requestController?.abort(); currentUser=null; st=null; cur=null;
        $('inpKey').value=''; closeSettings();
        $('appScreen').classList.add('hidden'); $('authScreen').classList.remove('hidden');
      } else if(session && currentUser!==session.user.id) {
        // Auth callback 밖에서 DB 요청을 실행해 인증 잠금 대기를 피합니다.
        setTimeout(()=>enterApp(session.user),0);
      }
    });
    const {data,error}=await client.auth.getSession();
    if(error) $('authError').textContent='로그인 상태를 확인하지 못했어요. 다시 로그인해주세요.';
    else if(data.session) await enterApp(data.session.user);
    const sync=()=>{ if(currentUser && st && !generating) action('get').catch(()=>{ if(st) $('refreshQuota').textContent='동기화에 실패했어요. 연결 상태를 확인해주세요.'; }); };
    window.addEventListener('focus',sync);
    document.addEventListener('visibilitychange',()=>{ if(!document.hidden) sync(); });
    setInterval(()=>{ if(st) renderApp(); },1000);
  }
  document.addEventListener('keydown',event=>{ if(event.key==='Escape') closeSettings(); });
  boot().catch(()=>{ $('authError').textContent='앱을 시작하지 못했어요. 새로고침 후 다시 시도해주세요.'; });
