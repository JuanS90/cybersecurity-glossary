# Cyber Basics glossary

Public educational site for the Cyber Basics course and its cybersecurity glossary.

## Development

- Node.js 22 or newer
- `npm install`
- `npm run dev` to open the local development server
- `npm run build` to produce the static site in `dist/`
- `npm run preview` to preview that build locally

The existing course remains in `index.html`. New frontend functionality belongs in `src/`; the Supabase client is prepared in `src/lib/supabase.ts`.

## Supabase configuration

Copy `.env.example` to `.env.local` and set the project URL and public anon/publishable key when the Supabase project is ready. The frontend key is not an administrative secret; database Row Level Security must protect every operation. Never put a `service_role` key in this project or in a `VITE_` variable.

No Supabase credentials or student information belong in this repository. The public glossary continues to work without backend configuration while backend tasks are being implemented.

## Project decisions and task plan

The product requirements are in the separate implementation specification; the ordered development tasks are in [docs/IMPLEMENTATION_TASKS.md](docs/IMPLEMENTATION_TASKS.md). Before adding student accounts, proposals, or live data, confirm that this directory has its own correctly configured Git repository and remote.

See [docs/PUBLISHING.md](docs/PUBLISHING.md) for the current GitHub Pages recommendation, its limits for future password flows, and the publication procedure. This local project does not yet have a GitHub remote.

