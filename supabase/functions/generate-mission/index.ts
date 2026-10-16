import { createClient } from 'npm:@supabase/supabase-js@2.118.0';
import { createHandler } from './handler.mjs';

const url=Deno.env.get('SUPABASE_URL');
const secret=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const admin=url && secret ? createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}}) : null;
Deno.serve(createHandler(admin,Deno.env.get('GEMINI_API_KEY')));
