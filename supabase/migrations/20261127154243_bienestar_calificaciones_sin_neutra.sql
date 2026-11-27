
-- Las futuras evaluaciones solo admiten 1 (Mala), 2 (Regular), 4 (Buena), 5 (Excelente).
-- No se borran ni se reescriben evaluaciones anteriores.
alter table public.valoraciones
  add constraint valoraciones_sin_calificacion_neutra
  check (calificacion in (1,2,4,5));

