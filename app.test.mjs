import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { createHandler, parseMission } from './supabase/functions/generate-mission/handler.mjs';
import { PGlite } from '@electric-sql/pglite';

const migration=await fs.readFile('supabase/migrations/202610160001_daily_spark.sql','utf8');
const mission={t:'창문을 열고 쉬기',c:'힐링',e:'🌿',m:'약 5분',ai:false};
const alice='11111111-1111-4111-8111-111111111111', bob='22222222-2222-4222-8222-222222222222';

test('실제 PostgreSQL 함수: 저장·권한·하루 3회·동시 요청·한국 시간 초기화',async()=>{
  const db=new PGlite();
  try {
    await db.exec(`create schema auth; create role anon; create role authenticated; create role service_role;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as
        $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      grant usage on schema auth to authenticated,anon;
      grant execute on function auth.uid() to authenticated,anon;`);
    await db.query('insert into auth.users values ($1),($2)',[alice,bob]);
    await db.exec(migration);
    const identity=uid=>db.query("select set_config('request.jwt.claim.sub',$1,false)",[uid]);
    const call=async(action,m=mission)=>(await db.query('select public.daily_spark_action($1,$2::jsonb) as state',[action,JSON.stringify(m)])).rows[0].state;
    await identity(alice);
    const first=await call('get');
    const date=(await db.query("select (statement_timestamp() at time zone 'Asia/Seoul')::date::text as day")).rows[0].day;
    assert.equal(first.tKey,date);
    assert.equal(first.refreshCount,0);
    assert.deepEqual((await call('get',{...mission,t:'새로고침 시 무시할 후보'})).tMission,mission);
    const results=await Promise.allSettled(Array.from({length:5},(_,i)=>call('refresh',{...mission,t:`미션 ${i}`})));
    assert.equal(results.filter(r=>r.status==='fulfilled').length,3);
    assert.equal(results.filter(r=>r.status==='rejected' && r.reason.message.includes('DAILY_LIMIT')).length,2);
    const saved=await call('get');
    assert.equal(saved.refreshCount,3);
    await assert.rejects(call('complete',mission),/MISSION_CHANGED/);
    const completed=await call('complete',saved.tMission);
    assert.equal(completed.tDone,true);
    assert.equal(completed.hist.length,1);
    assert.deepEqual((await call('get')).tMission,saved.tMission);
    await assert.rejects(call('complete',saved.tMission),/ALREADY_DONE/);
    await db.exec('set role authenticated');
    await assert.rejects(db.query('update public.daily_spark_users set refresh_count=0'),/permission denied/);
    await assert.rejects(db.query('delete from public.daily_spark_users'),/permission denied/);
    assert.equal((await db.query('select * from public.daily_spark_users')).rows.length,1);
    await identity(bob);
    assert.equal((await db.query('select * from public.daily_spark_users')).rows.length,0);
    assert.equal((await call('get')).refreshCount,0);
    await db.exec('reset role');
    await identity(alice);
    await db.query("update public.daily_spark_users set day=day-1 where user_id=$1",[alice]);
    const next=await call('get');
    assert.equal(next.refreshCount,0);
    assert.equal(next.tDone,false);
    assert.deepEqual(next.tMission,saved.tMission);
    assert.equal((await call('refresh',mission)).refreshCount,1);
    await assert.rejects(call('refresh',{...mission,t:5}),/INVALID_MISSION/);
    await db.exec('set role authenticated');
    await assert.rejects(db.query("select public.daily_spark_ai($1,'reserve')",[alice]),/permission denied/);
    await db.exec('reset role');
    const ai=async(action,request=null,day=null,m=null)=>(await db.query(
      'select public.daily_spark_ai($1,$2,$3,$4,$5::jsonb) as result',[alice,action,request,day,JSON.stringify(m)]
    )).rows[0].result;
    const reserve=await ai('reserve');
    assert.equal((await call('get')).refreshCount,2);
    assert.deepEqual((await call('get')).tMission,mission);
    const generated={...mission,t:'하늘의 색을 적기',ai:true};
    assert.deepEqual((await ai('commit',reserve.request,reserve.day,generated)).tMission,generated);
    await assert.rejects(ai('commit',reserve.request,reserve.day,generated),/STALE_REQUEST/);
    await ai('reserve'); // A failed provider request still consumes its reserved attempt.
    await assert.rejects(ai('reserve'),/DAILY_LIMIT/);
    await assert.rejects(call('refresh',mission),/DAILY_LIMIT/);
    assert.equal((await call('get')).refreshCount,3);
    assert.deepEqual((await call('get')).tMission,generated);
    await db.query("update public.daily_spark_users set day=day-1 where user_id=$1",[alice]);
    const old=await ai('reserve');
    await call('refresh',mission);
    await assert.rejects(ai('commit',old.request,old.day,generated),/STALE_REQUEST/);
    const midnight=await ai('reserve');
    await assert.rejects(ai('commit',midnight.request,'2020-01-01',generated),/STALE_REQUEST/);
    await identity('');
    await assert.rejects(call('get'),/LOGIN_REQUIRED/);
    await db.exec('set role anon');
    await assert.rejects(call('get'),/permission denied/);
  } finally { await db.close(); }
});

test('웹앱: 새로고침 복원, 서버 AI 호출, 오류 시 미션 유지',async()=>{
  let saved={tKey:'2026-10-16',refreshCount:0,tMission:mission,tDone:false,hist:[]};
  let fail=false;
  const rpc=async(name,args)=>{
    if(fail) return {error:{message:'DAILY_LIMIT'}};
    if(args.p_action==='refresh') saved={...saved,tMission:args.p_mission,refreshCount:saved.refreshCount+1};
    return {data:structuredClone(saved)};
  };
  const elements=new Map(), storage=new Map(), alerts=[];
  const element=id=>{
    if(!elements.has(id)) elements.set(id,{classList:{add(){},remove(){},toggle(){}},style:{},value:'',textContent:'',disabled:false,focus(){}});
    return elements.get(id);
  };
  let anonymousStarts=0;
  const client={rpc,functions:{invoke:async()=>({data:{...saved,tMission:{...mission,t:'서버 AI 미션',ai:true},refreshCount:1}})},auth:{onAuthStateChange(){},getSession:async()=>({data:{session:null}}),signInAnonymously:async()=>{anonymousStarts++;return{data:{user:{id:alice,is_anonymous:true}}};}}};
  class Clock extends Date { constructor(...args){ super(...(args.length?args:['2026-10-16T04:00:00Z'])); } static now(){return new Clock().getTime();} }
  const context={Date:Clock,console,Response,sessionStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},
    document:{getElementById:element,addEventListener(){}},setTimeout,clearTimeout,setInterval(){},
    addEventListener(){},alert:msg=>alerts.push(msg),createClient:()=>client,SUPABASE_URL:'https://test.supabase.co',SUPABASE_PUBLISHABLE_KEY:'public-test'};
  context.window=context;
  let source=await fs.readFile('app.js','utf8');
  source=source.replace(/^import .*;\n/gm,'');
  source+='\nwindow.test={boot,enterApp,escapeHtml,action,getState:()=>st};';
  source=source.replace('boot().catch(', 'window.testReady=boot().catch(');
  vm.runInNewContext(source,context);
  const app=context.test;
  await context.testReady;
  assert.equal(anonymousStarts,1);
  assert.equal(app.getState().tMission.t,mission.t);
  client.auth.getSession=async()=>({data:{session:{user:{id:alice,is_anonymous:true}}}});
  await app.boot();
  assert.equal(anonymousStarts,1); // Reload reuses the saved anonymous session.
  await app.enterApp({id:alice});
  await app.enterApp({id:alice});
  assert.equal(JSON.stringify(app.getState().tMission),JSON.stringify(mission));
  await app.enterApp({id:bob});
  fail=true;
  await context.drawRandom();
  assert.equal(app.getState().refreshCount,0);
  assert.equal(JSON.stringify(app.getState().tMission),JSON.stringify(mission));
  assert.equal(alerts.length,1);
  const pending=[];
  client.rpc=()=>new Promise(resolve=>pending.push(resolve));
  const oldRead=app.action('get'), newRefresh=app.action('refresh',mission);
  pending[1]({data:{...saved,refreshCount:2}});
  await newRefresh;
  pending[0]({data:{...saved,refreshCount:0}});
  await oldRead;
  assert.equal(app.getState().refreshCount,2); // Late reads cannot undo newer results.

  client.rpc=rpc; fail=false;
  await context.generateAiMission();
  assert.equal(app.getState().tMission.t,'서버 AI 미션');
  assert.equal(app.getState().refreshCount,1);
  assert.ok(!source.includes('generativelanguage.googleapis.com'));
  assert.ok(!source.includes('getApiKey'));
  assert.equal(app.escapeHtml('<img onerror="x">'),'&lt;img onerror=&quot;x&quot;&gt;');
});


test('서버 AI: 인증·선차감·비밀 키 격리·오류 응답 정제',async()=>{
  let calls=[],providerCalls=0,deny=false,providerFails=false,limited=false;
  const admin={auth:{getUser:async token=>({data:{user:!deny && token==='valid'?{id:alice,is_anonymous:true}:null},error:null})},
    rpc:async(name,args)=>{calls.push(args); if(limited)return {error:{message:'DAILY_LIMIT'}};
      return {data:args.p_action==='reserve'?{request:'request-id',day:'2026-10-16',mission}:{tMission:args.p_mission,refreshCount:1}};}};
  const fetchApi=async(url,options)=>{
    providerCalls++;
    assert.equal(options.headers['x-goog-api-key'],'owner-secret');
    assert.equal(calls.at(-1).p_action,'reserve');
    if(providerFails) throw new Error('owner-secret');
    return Response.json({candidates:[{content:{parts:[{text:JSON.stringify({mission:'색깔 하나 적기',category:'창의',emoji:'🎨',time:'5분'})}]}}]});
  };
  const handler=createHandler(admin,'owner-secret',fetchApi);
  const request=token=>new Request('https://server.invalid/generate-mission',{method:'POST',headers:token?{authorization:`Bearer ${token}`}:{}});
  assert.equal((await handler(request())).status,401);
  deny=true;
  assert.equal((await handler(request('valid'))).status,401);
  assert.equal(providerCalls,0);
  deny=false; limited=true;
  assert.equal((await handler(request('valid'))).status,429);
  assert.equal(providerCalls,0);
  limited=false;
  const response=await handler(request('valid'));
  assert.equal(response.status,200);
  const body=await response.text();
  assert.ok(!body.includes('owner-secret'));
  assert.deepEqual(calls.slice(-2).map(c=>c.p_action),['reserve','commit']);
  const quotaHandler=createHandler(admin,'owner-secret',async()=>Response.json({error:{details:[{reason:'owner-secret'}]}},{status:429}));
  const quotaResponse=await quotaHandler(request('valid'));
  assert.deepEqual(await quotaResponse.json(),{error:'AI_QUOTA',upstreamStatus:429});
  providerFails=true;
  const failed=await handler(request('valid'));
  assert.equal(failed.status,502);
  assert.equal(await failed.text(),'{"error":"AI_FAILED"}');
  assert.equal(calls.at(-1).p_action,'reserve');
  assert.equal((await createHandler(admin,'')(request('valid'))).status,503);
  assert.throws(()=>parseMission('broken JSON'));
  assert.throws(()=>parseMission(JSON.stringify({mission:1,category:'힐링',emoji:'🌿',time:'5분'})));
});
