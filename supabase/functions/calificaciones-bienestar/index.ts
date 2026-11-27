import { createClient } from "npm:@supabase/supabase-js@2.57.4";
const url = Deno.env.get("SUPABASE_URL")!;
const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const db = createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"content-type,authorization,apikey","Access-Control-Allow-Methods":"GET,POST,OPTIONS","Cache-Control":"no-store"};
const reply=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{...cors,"Content-Type":"application/json; charset=utf-8"}});
const hash=async(v:string)=>Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(v)))).map(x=>x.toString(16).padStart(2,"0")).join("");
async function admin(req:Request){
 const token=(req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");
 if(!/^[a-f0-9]{64}$/.test(token)) return false;
 const {data}=await db.from("bienestar_sesiones").select("admin_id,vence_en").eq("token_hash",await hash(token)).maybeSingle();
 if(!data||new Date(data.vence_en).getTime()<Date.now()) return false;
 const {data:user}=await db.from("bienestar_acceso_admin").select("activo").eq("id",data.admin_id).maybeSingle();
 return !!user?.activo;
}
Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response(null,{headers:cors});
 try {
  const parsed=new URL(req.url);const action=parsed.searchParams.get("action")||"catalog";
  if(req.method==="GET"&&action==="catalog"){
   const [a,b]=await Promise.all([db.from("cargos_bienestar").select("id,slug,nombre,persona_nombre").eq("activo",true).order("orden"),db.from("areas_colaboradores").select("id,nombre").eq("activo",true).order("nombre")]);
   if(a.error||b.error)return reply({error:"No se pudo cargar el formulario"},500);
   return reply({cargos:a.data,areas:b.data});
  }
  if(req.method==="POST"&&action==="submit"){
   const v=await req.json(); if(v.website)return reply({ok:true});
   const area=Number(v.area_id),cargo=Number(v.cargo_id),rating=Number(v.calificacion);
   const comentario=typeof v.comentario==="string"?v.comentario.trim():"";
   if(!Number.isInteger(area)||!Number.isInteger(cargo)||!Number.isInteger(rating)||![1,2,4,5].includes(rating)||comentario.length>2000)return reply({error:"Datos de evaluación inválidos"},400);
   const [a,b]=await Promise.all([db.from("cargos_bienestar").select("id,persona_nombre").eq("id",cargo).eq("activo",true).maybeSingle(),db.from("areas_colaboradores").select("id").eq("id",area).eq("activo",true).maybeSingle()]);
   if(!a.data?.persona_nombre||!b.data)return reply({error:"Persona o área no disponibles"},400);
   const {error}=await db.from("valoraciones").insert({cargo_id:cargo,area_id:area,persona_evaluada:a.data.persona_nombre,calificacion:rating,comentario:comentario||null});
   if(error)return reply({error:"No se pudo guardar la evaluación"},500);
   return reply({ok:true});
  }
  if(req.method==="POST"&&action==="login"){
   const v=await req.json(); const usuario=String(v.usuario||"").trim().slice(0,80),clave=String(v.clave||"");
   if(!usuario||!clave||clave.length>200)return reply({error:"Credenciales inválidas"},401);
   const {data,error}=await db.rpc("bienestar_validar_acceso",{p_usuario:usuario,p_clave:clave});
   if(error||!data)return reply({error:"Credenciales incorrectas o acceso temporalmente bloqueado"},401);
   const token=Array.from(crypto.getRandomValues(new Uint8Array(32))).map(x=>x.toString(16).padStart(2,"0")).join("");
   const {error:e}=await db.from("bienestar_sesiones").insert({token_hash:await hash(token),admin_id:data,vence_en:new Date(Date.now()+8*3600*1000).toISOString()});
   if(e)return reply({error:"No fue posible iniciar sesión"},500);
   return reply({token,expira_en:new Date(Date.now()+8*3600*1000).toISOString()});
  }
  if(action==="logout"&&req.method==="POST"){
   const token=(req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");
   if(token)await db.from("bienestar_sesiones").delete().eq("token_hash",await hash(token));
   return reply({ok:true});
  }
  if(action==="results"&&req.method==="GET"){
   if(!await admin(req))return reply({error:"Acceso no autorizado"},401);
   const rows=[];let offset=0;
   while(true){
    const {data,error}=await db.from("valoraciones").select("id,cargo_id,area_id,persona_evaluada,calificacion,comentario,creado_en").order("creado_en",{ascending:false}).range(offset,offset+999);
    if(error)return reply({error:"No se pudieron consultar los resultados"},500);
    rows.push(...(data||[]));if((data||[]).length<1000)break;offset+=1000;if(offset>100000)return reply({error:"Superado límite de consulta"},413);
   }
   return reply({resultados:rows});
  }
  return reply({error:"Ruta no encontrada"},404);
 }catch(e){console.error("bienestar api error",e);return reply({error:"Ocurrió un error al procesar la solicitud"},500);}
});