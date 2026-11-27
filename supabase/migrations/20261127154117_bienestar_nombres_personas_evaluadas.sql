-- Nombres visibles de las seis personas evaluadas. Los cargos y slugs de los QR permanecen intactos.
alter table public.cargos_bienestar
  add column if not exists persona_nombre text;

update public.cargos_bienestar as c
set persona_nombre = p.persona_nombre
from (values
  ('seguridad-salud-trabajo', 'Natalia Santana'),
  ('analista-bienestar', 'Vanessa Ocampo Lopez'),
  ('analista-nomina', 'Ivan Leonardo Perez'),
  ('analista-asuntos-legales', 'Jhonier Cardona'),
  ('analista-calidad', 'Evelyn Muñoz Rodas'),
  ('directora-bienestar', 'Carolina Cardona Sanchez')
) as p(slug, persona_nombre)
where c.slug = p.slug;

do $$
begin
  if (select count(*) from public.cargos_bienestar where activo) <> 6
     or exists (select 1 from public.cargos_bienestar where activo and nullif(btrim(persona_nombre),'') is null)
  then
    raise exception 'El catálogo de seis personas evaluadas no está completo';
  end if;
end $$;

-- Capturará el nombre al crear cada nueva calificación.
-- Los registros anteriores quedan en NULL, sin atribuir retroactivamente personas.
alter table public.valoraciones
  add column if not exists persona_evaluada text;

comment on column public.cargos_bienestar.persona_nombre is 'Nombre actual de la persona asociada a cada cargo y código QR';
comment on column public.valoraciones.persona_evaluada is 'Nombre de la persona evaluada al registrar la respuesta; NULL en valoraciones anteriores al cambio';

