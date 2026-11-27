-- El nombre del colaborador es voluntario. Los registros existentes se conservan sin nombre.
alter table public.valoraciones
  add column if not exists nombre_colaborador text;

alter table public.valoraciones
  add constraint valoraciones_nombre_colaborador_longitud
  check (nombre_colaborador is null or (
    char_length(btrim(nombre_colaborador)) between 2 and 120
    and nombre_colaborador !~ '[[:cntrl:]]'
  ));

comment on column public.valoraciones.nombre_colaborador is
  'Nombre opcional del colaborador que evalúa; NULL significa que no proporcionó nombre. Acceso privado mediante servicio administrativo.';

