# Cyber Basics

Cyber Basics es una aplicación educativa para aprender conceptos básicos de ciberseguridad. Reúne un curso interactivo en inglés sencillo y un glosario de amenazas y herramientas de seguridad con traducciones al español.

## Qué ofrece

- Siete lecciones con explicaciones, ejemplos y actividades breves.
- Un glosario alfabético con búsqueda en inglés y español.
- Definiciones claras para acompañar el aprendizaje de vocabulario de ciberseguridad.
- Una experiencia pública de consulta que no requiere una cuenta.

El contenido educativo se encuentra principalmente en `index.html`. La aplicación también contempla cuentas para estudiantes y docentes, propuestas de cambios y revisión docente. La integración con Supabase está en desarrollo y todavía no está conectada a un proyecto real.

## Tecnologías

- **HTML, CSS y JavaScript** para la experiencia web y el contenido educativo.
- **TypeScript** para las nuevas funciones del cliente.
- **Vite** para el servidor de desarrollo y la compilación del sitio.
- **Supabase Auth, PostgreSQL, Row Level Security y Edge Functions** como backend previsto para cuentas y futuras propuestas. La configuración y validación de ese backend siguen pendientes.

## Ejecutar localmente

Se necesita Node.js 22 o posterior.

```bash
npm install
npm run dev
```

Para generar una versión estática en `dist/`:

```bash
npm run build
```
