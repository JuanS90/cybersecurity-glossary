# Publicación del sitio

## Decisión para la etapa actual

Usar **GitHub Pages para la página estática del curso y del glosario público**. El sitio seguirá funcionando desde `index.html`; la compilación de Vite genera el contenido publicable en `dist/`. La configuración `base: "./"` de `vite.config.ts` mantiene las rutas de recursos relativas cuando GitHub Pages sirve el proyecto bajo una ruta como `/glossary/`.

GitHub Pages está disponible en repositorios públicos con GitHub Free. Sus condiciones indican que no debe usarse para transacciones sensibles, como enviar contraseñas. Antes de habilitar inicio de sesión o formularios que transmitan contraseñas, la institución debe aprobar por escrito el uso previsto de Pages o elegir un hosting institucional adecuado. La autenticación y los datos de estudiantes todavía no están conectados.

Vercel Hobby no se selecciona: sus condiciones limitan ese plan al uso personal o no comercial. Vercel Pro puede evaluarse si el instituto autoriza y financia ese plan.

Fuentes: [GitHub Pages quickstart](https://docs.github.com/en/pages/quickstart), [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits), [Vercel Hobby plan](https://vercel.com/docs/plans/hobby).

## Publicar cuando exista el repositorio remoto

El repositorio local correcto es la carpeta `glossary`, pero todavía no hay un remoto GitHub para este proyecto. Antes de publicar, crear o seleccionar el repositorio institucional y verificar que sea público y que contenga solo los archivos del proyecto. No subir `.env.local`, exportaciones de bases, cuentas reales ni información personal.

1. En GitHub, abrir **Settings → Pages** y elegir **GitHub Actions** como origen de publicación.
2. En la rama principal, ejecutar `npm ci` y `npm run build` con Node.js 22.
3. Publicar el directorio `dist/` como artefacto de Pages.
4. Confirmar que el sitio carga desde su URL `github.io`, incluyendo los archivos CSS y JavaScript.

La configuración pública de Supabase (URL y clave `anon`/publishable) se agregará únicamente cuando corresponda, mediante variables de entorno del proceso de compilación. Son valores visibles para el navegador y no sustituyen RLS. No almacenar `service_role` ni otra clave administrativa en Git, en variables `VITE_` o en el cliente.

## Comprobación local previa

```text
npm ci
npm run build
npm run preview
```

El sitio público existente no requiere variables de Supabase para cargar. No desplegar hasta que el remoto y los permisos de publicación estén bajo control institucional.
