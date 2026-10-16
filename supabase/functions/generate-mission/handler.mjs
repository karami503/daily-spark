const cors={
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods':'POST, OPTIONS'
};
const categories=['힐링','소통','정리','성장','활력','창의','친절'];
export function parseMission(raw) {
  const o=JSON.parse(raw);
  if([['mission',200],['emoji',32],['time',40]].some(([k,max])=>typeof o[k]!=='string' || !o[k].trim() || [...o[k]].length>max)
    || !categories.includes(o.category)) throw new Error('INVALID_MISSION');
  return {t:o.mission.trim(),c:o.category,e:o.emoji.trim(),m:o.time.trim(),ai:true};
}
export function createHandler(admin,geminiKey,fetchApi=fetch) {
  const reply=(body,status=200)=>Response.json(body,{status,headers:{...cors,'Cache-Control':'no-store'}});
  return async req=>{
    if(req.method==='OPTIONS') return new Response(null,{status:204,headers:cors});
    if(req.method!=='POST') return reply({error:'METHOD_NOT_ALLOWED'},405);
    if(!admin || !geminiKey) return reply({error:'SERVER_NOT_READY'},503);
    const token=req.headers.get('authorization')?.match(/^Bearer (\S+)$/i)?.[1];
    if(!token) return reply({error:'LOGIN_REQUIRED'},401);
    try {
      const {data:auth,error:authError}=await admin.auth.getUser(token);
      if(authError || !auth.user || auth.user.is_anonymous) return reply({error:'LOGIN_REQUIRED'},401);
      const uid=auth.user.id;
      const {data:reservation,error:reserveError}=await admin.rpc('daily_spark_ai',{p_uid:uid,p_action:'reserve'});
      if(reserveError) {
        const code=['DAILY_LIMIT','ALREADY_DONE','LOAD_FIRST'].find(c=>reserveError.message===c);
        return reply({error:code || 'SERVER_NOT_READY'},code==='DAILY_LIMIT'?429:409);
      }
      const response=await fetchApi('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',{
        method:'POST',signal:AbortSignal.timeout(40000),headers:{'Content-Type':'application/json','x-goog-api-key':geminiKey},
        body:JSON.stringify({contents:[{parts:[{text:`일상에서 안전하게 혼자 실천할 수 있는 긍정적인 5~10분 미션 하나를 추천해줘. 돈을 쓰거나 위험한 행동은 제외해줘. 다음 미션과 다른 내용으로 작성해줘: ${reservation.mission.t}.`}]}],
          generationConfig:{temperature:0.95,maxOutputTokens:512,thinkingConfig:{thinkingBudget:0},responseMimeType:'application/json',
            responseSchema:{type:'OBJECT',properties:{mission:{type:'STRING'},category:{type:'STRING',enum:categories},emoji:{type:'STRING'},time:{type:'STRING'}},required:['mission','category','emoji','time']}}})
      });
      if(!response.ok) return reply({error:'AI_FAILED'},502);
      const payload=await response.json();
      const raw=payload.candidates?.[0]?.content?.parts?.filter(p=>p.text && !p.thought).map(p=>p.text).join('') || '';
      const mission=parseMission(raw);
      const {data,error}=await admin.rpc('daily_spark_ai',{
        p_uid:uid,p_action:'commit',p_request:reservation.request,p_day:reservation.day,p_mission:mission
      });
      if(error) return reply({error:error.message==='STALE_REQUEST'?'STALE_REQUEST':'AI_FAILED'},409);
      return reply(data);
    } catch {
      // Provider responses and exception messages can contain secrets; never return or log them.
      return reply({error:'AI_FAILED'},502);
    }
  };
}
