# Calificaciones Bienestar

Encuesta anónima de satisfacción para Bienestar Institucional del Club Campestre de Pereira.

## Tecnología
- Web estática en HTML, CSS y JavaScript, compatible con GitHub Pages.
- Base de datos PostgreSQL y función Edge en Supabase.
- Panel administrativo con acceso protegido y descarga de Excel (.xlsx).

## Recursos exclusivos
- GitHub: https://github.com/MrProgramer1997/Calificaciones-Bienestar
- Supabase ID: `wcubfrmfylvrdwweothd`
- Función: `calificaciones-bienestar`
- Código backend: `supabase/functions/calificaciones-bienestar/index.ts`

## Publicación
Cada commit a la rama **main** ejecuta automáticamente el workflow `.github/workflows/deploy.yml` de GitHub Actions.
El último despliegue comprobado en Actions terminó correctamente. URL prevista del sitio:
https://mrprogramer1997.github.io/Calificaciones-Bienestar/

El acceso administrativo está en:
https://mrprogramer1997.github.io/Calificaciones-Bienestar/#admin

Si Pages se deshabilita, configurar en GitHub **Settings → Pages → Source: GitHub Actions**.

Los seis enlaces públicos usan `?cargo=<slug>`. Se pueden obtener los QR desde el dashboard o desde el paquete entregado aparte. Verificar cada código antes de imprimir.

## Indicadores
- Evaluaciones totales, promedio (1-5), distribución de respuestas y porcentaje de satisfacción.
- Satisfacción = (calificaciones de 4 o 5 / evaluaciones recibidas) * 100.
- Filtros por cargo, área y fechas; observaciones; exportación Excel.
- Dashboard web refresca cada 60 segundos. Excel descargado es una instantánea, no un archivo sincronizado en tiempo real.

## Seguridad
- Encuesta sin nombre ni inicio de sesión.
- La recepción pública usa una función Edge que valida cargo, área, calificación y longitud de comentarios.
- Tablas protegidas por RLS; el frontend no tiene credenciales de servicio.
- Acceso administrativo con contraseña bcrypt (hash), token temporal y bloqueo de intentos.
- La función Edge se despliega con `verify_jwt = false` porque implementa autorización internamente.
- No introducir datos personales en los comentarios.

## Pendientes antes de producción
1. Verificar funcionamiento de GitHub Pages, carga de cargos y áreas, envío de una evaluación de prueba, acceso administrativo y exportación.
2. Implementar limitación de envíos por IP o mecanismo anti-abuso en el perímetro de la función pública.
3. Rotar la contraseña inicial compartida durante la configuración.
4. Si se necesita un Excel siempre sincronizado, integrar almacenamiento en OneDrive/SharePoint con proceso de actualización, en lugar del archivo descargado.
5. La plantilla exportada presenta indicadores y datos filtrables, pero los gráficos interactivos se muestran en el dashboard web.
