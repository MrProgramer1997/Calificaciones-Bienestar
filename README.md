# Calificaciones Bienestar

Encuesta de satisfacción para Bienestar Institucional del Club Campestre de Pereira. El nombre completo del colaborador es obligatorio en cada nueva evaluación.

## Tecnología
- Web estática en HTML, CSS y JavaScript, compatible con GitHub Pages.
- Base de datos PostgreSQL y función Edge en Supabase.
- Panel administrativo con acceso protegido y descarga de Excel (.xlsx). Los nombres de los colaboradores solo aparecen en vistas administrativas y exportaciones con sesión autorizada.
- Interfaz visual animada con SVG nativo y CSS. Incluye caritas interactivas, iconos flotantes y animación de indicadores; respeta `prefers-reduced-motion` y no carga logos ajenos.

## Recursos exclusivos
- GitHub: https://github.com/MrProgramer1997/Calificaciones-Bienestar
- Supabase ID: `wcubfrmfylvrdwweothd`
- Función: `calificaciones-bienestar`
- Código backend: `supabase/functions/calificaciones-bienestar/index.ts`

## Publicación
La aplicación se publica automáticamente mediante **GitHub Pages (publicación desde main)**. El workflow `.github/workflows/deploy.yml` verifica la sintaxis JavaScript, los 6 cargos, las 20 áreas y los permisos de la API antes de dar por válidas las pruebas.
Sitio web:
https://mrprogramer1997.github.io/Calificaciones-Bienestar/

Los seis QR conservan sus enlaces por cargo, pero el formulario muestra las seis personas por nombre, preselecciona a la persona del QR y después permite elegir el área del colaborador.

El acceso administrativo está en:
https://mrprogramer1997.github.io/Calificaciones-Bienestar/#admin

Si Pages se deshabilita, comprobar en GitHub **Settings → Pages → Deploy from a branch → main / (root)**.

Los seis enlaces públicos usan `?cargo=<slug>`. El dashboard identifica cada QR con su cargo en pantalla y permite imprimir el cartel **sin mostrar ese cargo**. También se entregaron seis carteles PNG independientes con los códigos QR verificados, sin logotipo ficticio ni nombres impresos.

## Indicadores
- Opciones nuevas: Mala (1), Regular (2), Buena (4), Excelente (5). Se retiró Neutra (3) de nuevas evaluaciones y de los indicadores visibles.
- Se conserva el valor numérico original para no alterar datos históricos. En caso de valores 3 anteriores, se reconocen como registros históricos en la exportación.
- Cada nueva valoración almacena también el nombre de la persona al momento de responder, sin modificar respuestas previas. Las calificaciones antiguas sin persona registrada siguen en el consolidado general, pero no se atribuyen a empleados actuales en los indicadores por persona.
- Evaluaciones totales, promedio (1-5), distribución de respuestas y porcentaje de satisfacción.
- Satisfacción = (calificaciones de 4 o 5 / evaluaciones recibidas) * 100.
- Filtros por persona evaluada, área y fechas; observaciones; comparación de áreas con mayor volumen, mayor satisfacción y menor satisfacción.
- Exportación Excel (.xlsx) con hojas Valoraciones, Indicadores, Por cargo, Por área y Comentarios; exporta todos los registros filtrados.
- Dashboard web refresca cada 60 segundos. Excel descargado es una instantánea, no un archivo sincronizado en tiempo real.

## Seguridad
- Encuesta sin inicio de sesión, pero con nombre completo del colaborador obligatorio para cada nuevo envío. Las valoraciones históricas sin nombre se conservan intactas.
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
5. El Excel exportado incluye hojas de resumen y datos filtrables; los gráficos interactivos se visualizan en el dashboard web.

## Confidencialidad de las respuestas
La interfaz identifica la **encuesta como confidencial**, no como anónima. El nombre es obligatorio y las respuestas pueden ser vistas en el panel administrativo y exportadas en Excel por administradores autorizados. Debe controlarse también el uso y la distribución de los Excel exportados. No se modificaron permisos, datos o autenticación con este cambio de presentación.

## Nombre obligatorio del colaborador
El nombre completo se solicita siempre antes de enviar la evaluación (2 a 120 caracteres). Se eliminó el control opcional. La función Edge valida el nombre y rechaza solicitudes que lo omitan. Una restricción SQL `CHECK ... NOT VALID` impide nuevas valoraciones sin nombre y preserva las evaluaciones anteriores que no lo registraron. El dato aparece en el panel administrativo y en los Excel autorizados. La captura del nombre no garantiza por sí misma la identidad de quien responde.
