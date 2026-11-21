
create table if not exists public.bienestar_acceso_admin (
 id bigint generated always as identity primary key,
 usuario text not null unique,
 clave_hash text not null,
 activo boolean not null default true,
 intentos smallint not null default 0,
 bloqueado_hasta timestamptz,
 creado_en timestamptz not null default now()
);
create table if not exists public.bienestar_sesiones (
 token_hash text primary key,
 admin_id bigint not null references public.bienestar_acceso_admin(id) on delete cascade,
 vence_en timestamptz not null,
 creado_en timestamptz not null default now()
);
alter table public.bienestar_acceso_admin enable row level security;
alter table public.bienestar_sesiones enable row level security;
revoke all on public.bienestar_acceso_admin, public.bienestar_sesiones from anon, authenticated;
drop policy if exists valoraciones_insertar on public.valoraciones;
revoke insert on public.valoraciones from anon, authenticated;
create or replace function public.bienestar_validar_acceso(p_usuario text,p_clave text)
returns bigint language plpgsql security definer set search_path = '' as $$
declare v public.bienestar_acceso_admin%rowtype;
begin
 select * into v from public.bienestar_acceso_admin where lower(usuario)=lower(trim(p_usuario)) for update;
 if not found then return null; end if;
 if v.bloqueado_hasta is not null and v.bloqueado_hasta > now() then return null; end if;
 if v.activo and v.clave_hash = extensions.crypt(p_clave,v.clave_hash) then
   update public.bienestar_acceso_admin set intentos=0,bloqueado_hasta=null where id=v.id;
   return v.id;
 end if;
 update public.bienestar_acceso_admin set
  intentos=case when intentos >= 4 then 0 else intentos+1 end,
  bloqueado_hasta=case when intentos>=4 then now()+interval '15 minutes' else null end
 where id=v.id;
 return null;
end $$;
revoke all on function public.bienestar_validar_acceso(text,text) from public,anon,authenticated;
grant execute on function public.bienestar_validar_acceso(text,text) to service_role;

