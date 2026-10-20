# Tareas de desarrollo — Glosario Cyber Basics

Documento de trabajo para continuar la implementación en Codex. Cada tarea debe abordarse en un cambio pequeño y revisable. No desplegar ni cargar datos reales de estudiantes hasta que la profesora/institución controle las cuentas y credenciales.

## Decisiones del producto

- Mantener el curso y el glosario públicos para cualquier visitante.
- No habilitar registro abierto ni envío de emails. La profesora confirma identidad y crea las cuentas.
- Roles: `superadmin` crea/revoca profesoras; `teacher` (profesora) gestiona estudiantes, restablece sus contraseñas y revisa propuestas; `student` propone altas y ediciones.
- Altas y ediciones quedan pendientes. Solo una aprobación docente modifica el glosario público.
- Conservar quién propuso, quién revisó, cuándo y el contenido anterior/nuevo. No borrar entradas ni auditoría en v1.
- Definiciones del glosario en inglés sencillo, claro y natural.
- Una aplicación modular: Vite + TypeScript en el cliente, Supabase Auth/PostgreSQL/RLS y Edge Function para operaciones privilegiadas. Nunca exponer `service_role`.
- Mantener opciones gratuitas y confirmar las condiciones de hosting institucional antes de publicar.

## Lote 0 — Preparación del proyecto

### T0.1 — Preparar Vite + TypeScript conservando la página existente

**Estado:** completado como scaffold inicial. La página original sigue siendo `index.html`.

- Añadir scripts de desarrollo, compilación y vista previa.
- Configurar TypeScript estricto y rutas relativas para poder publicar bajo una ruta de Pages.
- Añadir entrada TypeScript sin migrar todavía el contenido educativo.
- Ignorar archivos locales y secretos; documentar variables públicas de Supabase.

**Aceptación:** el HTML sigue siendo la entrada principal y conserva su curso, estilos, navegación y actividades; el cliente no contiene secretos administrativos. La compilación inicial se completó correctamente.

### T0.2 — Confirmar Git y publicación

**Estado:** preparado localmente; el remoto institucional aún no existe o no está conectado.

- La raíz Git ahora es la carpeta del proyecto. No hay archivos staged ni commits.
- GitHub Pages queda recomendado para la etapa estática pública. Antes de transmitir contraseñas, la institución debe confirmar que el uso cumple sus condiciones o elegir otro hosting.
- Vercel Hobby se descarta para uso institucional; revisar un plan autorizado antes de usar Vercel.
- La ruta relativa `base: "./"` está configurada y las variables públicas de Supabase están documentadas en `.env.example`.
- Procedimiento y límites: [PUBLISHING.md](PUBLISHING.md).

- Confirmar que el directorio correcto es el repositorio Git previsto y que su raíz no incluye archivos personales del equipo.
- Confirmar GitHub Pages o Vercel según las condiciones de uso institucional vigentes.
- Configurar la ruta base del sitio y variables de entorno de producción sin guardarlas en Git.

**Aceptación:** el repositorio contiene solo el proyecto; existe procedimiento de publicación y no se suben secretos ni copias con información personal.

## Lote 1 — Datos y controles de acceso

### T1.1 — Definir migración inicial de PostgreSQL

**Estado:** implementado en `supabase/migrations/20261020000000_initial_schema.sql`.

- Crear tablas `profiles`, `glossary_entries`, `change_proposals` y `entry_revisions`.
- Definir claves, restricciones, fechas del servidor e índices de términos normalizados.
- Prevenir propuestas duplicadas pendientes cuando corresponda.
- Mantener auditoría de propuestas rechazadas y aprobadas.

**Aceptación:** migración versionada, repetible en un proyecto Supabase nuevo y con integridad referencial.

### T1.2 — Aplicar RLS de mínimo privilegio

**Estado:** base de RLS implementada localmente en `supabase/migrations/20261020010000_rls_least_privilege.sql`; la autorización de operaciones administrativas y de revisión queda pendiente de T2.2 y T3.2.

- Visitante: leer únicamente entradas publicadas.
- Estudiante: enviar propuestas; no cambiar roles, estados, revisiones ni entradas publicadas directamente.
- Profesora: consultar propuestas y gestionar estudiantes; aprobar/rechazar propuestas.
- Superadmin: crear y revocar profesoras.
- No permitir cambios de rol por metadatos editables por el cliente.

Las tablas no conceden escritura directa de perfiles a los roles de cliente: el alta y la administración de cuentas quedan para la Edge Function autorizada de T2.2. Propuestas y revisiones no se pueden editar/borrar desde el cliente. La publicación se mantiene bloqueada hasta que T3.2 incorpore una operación de base de datos que cambie la entrada, escriba la revisión y cierre la propuesta atómicamente. Por eso todavía no están disponibles la gestión de cuentas ni la aprobación/rechazo docente; este lote dejó esas mutaciones cerradas para evitar saltar los controles.

**Aceptación:** cada permiso se hace cumplir en PostgreSQL aunque alguien llame a la API sin usar la interfaz.

### T1.3 — Importar el glosario actual

- Extraer términos, traducciones, definiciones, ejemplos y categorías del HTML actual.
- Revisar duplicados, campos vacíos y formato; mantener la página educativa intacta.
- Preparar un archivo de importación revisable antes de ejecutarlo en la base real.

**Aceptación:** todas las entradas existentes quedan representadas sin pérdida y pueden consultarse en el mismo orden/categorías.

## Lote 2 — Inicio de sesión y cuentas

### T2.1 — Conectar Supabase Auth

- Configurar cliente con URL y clave pública desde variables de entorno.
- Añadir inicio y cierre de sesión; no crear flujo de auto-registro.
- Mostrar el panel según sesión, estado activo y rol.

**Aceptación:** cuentas no activas o sin perfil válido no pueden proponer ni gestionar información.

### T2.2 — Crear cuentas y restablecer contraseñas de forma segura

- Añadir Edge Function que valide el rol de quien llama antes de usar la API administrativa.
- Permitir a la profesora crear/desactivar estudiantes y restablecer contraseña temporal.
- Permitir solo al superadmin crear/revocar profesoras.
- Forzar cambio de clave temporal en el próximo ingreso; permitir al usuario cambiar la propia desde sesión.
- No registrar claves temporales en logs ni guardarlas en texto plano.

**Aceptación:** cada operación rechaza usuarios con rol incorrecto y no expone `service_role` al navegador.

### T2.3 — Crear el primer superadmin de forma controlada

- Documentar el procedimiento de inicialización segura mediante consola/operación administrativa, no desde el cliente público.
- Evitar credenciales iniciales reales en el repositorio.

**Aceptación:** solo existe una ruta de bootstrap documentada y puede cerrarse o repetirse sin abrir privilegios al público.

## Lote 3 — Propuestas y aprobación

### T3.1 — Formularios de propuesta

- Listar entradas aprobadas desde PostgreSQL en el sitio público.
- Permitir al estudiante proponer una entrada o editar una existente.
- Mantener pendientes visibles solo en el panel autenticado, sin publicarlas.

**Aceptación:** enviar o editar una propuesta no cambia lo que ve un visitante.

### T3.2 — Cola docente de revisión

- Mostrar datos anteriores y propuestos, autor y fecha.
- Permitir aprobar/rechazar con nota opcional.
- Registrar autor, revisora, hora y ambas versiones de forma atómica.

**Aceptación:** una aprobación publica y registra una revisión; un rechazo conserva la entrada publicada y deja trazabilidad.

### T3.3 — Historial y seguimiento

- Mostrar al usuario el estado de sus propuestas.
- Dar a la profesora acceso al historial de cambios y a la autoría.
- No ofrecer edición ni borrado de revisiones.

**Aceptación:** alta, edición y rechazo quedan consultables por quienes tienen permisos, con fechas generadas por el servidor.

## Lote 4 — Publicación y mantenimiento

### T4.1 — Revisión final de accesibilidad y dispositivos

- Comprobar navegación por teclado, etiquetas de formularios, lectura móvil y mensajes de error.
- Mantener la página de consulta útil si el servicio de datos está temporalmente pausado, mostrando un aviso claro.

### T4.2 — Publicar y documentar operación

- Publicar solo después de elegir hosting y configurar secretos en su panel.
- Documentar alta de cuentas, recuperación, revisión de propuestas, exportación y restauración.
- Definir responsable institucional de la cuenta Supabase y frecuencia de exportación privada.

**Aceptación:** otra persona autorizada puede mantener el sitio y recuperar los datos usando documentación, sin depender de credenciales del desarrollador.

## Orden sugerido para Codex

1. Completar T0.1 y T0.2 sin alterar el contenido educativo.
2. Implementar T1.1 y T1.2 en migraciones, revisar el modelo antes de conectar datos.
3. Resolver y documentar T1.3 mediante un artefacto de importación revisable.
4. Implementar T2.1–T2.3.
5. Implementar T3.1–T3.3.
6. Cerrar con T4.1–T4.2; publicar solo con credenciales y hosting configurados por la institución.

## Prompt inicial para continuar en Codex

Lee `C:\Users\st_ju\Documents\Codex\2026-10-20\te\outputs\especificacion_glosario_colaborativo.md` y `C:\Users\st_ju\Documents\Codex\2026-10-20\te\outputs\tareas_desarrollo_glosario.md`. El código está en `C:\Users\st_ju\Documents\GitHub\glossary`. T0.1 ya está completada. Antes de avanzar, verifica y corrige la raíz Git: ahora Git detecta `C:\` como raíz, no el directorio del proyecto, y no muestra un remoto configurado. No stages ni commits cambios hasta que el repositorio quede bien identificado para evitar incluir archivos ajenos. Luego completa T0.2 y sigue con T1.1, manteniendo intacto el curso público. Mantén las definiciones en inglés sencillo, no expongas secretos y deja cada lote en un cambio revisable.
