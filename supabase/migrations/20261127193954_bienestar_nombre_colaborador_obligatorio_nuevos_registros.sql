-- Rechaza respuestas nuevas sin nombre, sin alterar las dos evaluaciones históricas.
-- NOT VALID conserva filas antiguas nulas; PostgreSQL comprueba todas las inserciones nuevas.
alter table public.valoraciones
  add constraint valoraciones_nombre_colaborador_requerido
  check (
    nombre_colaborador is not null
    and char_length(btrim(nombre_colaborador)) between 2 and 120
  ) not valid;
comment on constraint valoraciones_nombre_colaborador_requerido on public.valoraciones
  is 'Nombre obligatorio en nuevas valoraciones; filas históricas sin nombre permanecen intactas';
