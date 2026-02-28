# Agent Dashboard

Dashboard de gestión para el sistema RAG multi-tenant. Permite conectar/desconectar WhatsApp y ver estado de los canales.

## Stack
- **React** 18 + **Vite** 6 + **TypeScript** strict
- **Tailwind CSS** v4 (utility-first, `@import "tailwindcss"` + `@theme {}`)
- No CSS modules, no styled-components, no CSS-in-JS

## Comandos
```bash
npm run dev       # Development server en :5174
npm run build     # tsc + vite build (producción)
npm run preview   # Preview del build
```

## Source layout
```
src/
├── api/           → Fetch centralizado (channels.ts, auth.ts)
├── components/    → React components (WhatsAppPanel, Login)
├── hooks/         → Custom hooks (usePolling)
├── App.tsx        → Root component con sidebar + tabs
├── main.tsx       → Entry point
└── index.css      → Tailwind v4 + theme tokens
```

## Variables de entorno
- `VITE_API_URL` — URL base del backbone API (default: http://localhost:3000)

## Restricciones
- Componentes nuevos con Tailwind utilities, no CSS custom classes
- No `any` — tipos estrictos
- No class components — solo funcionales con hooks
- No `fetch` directo en componentes — centralizar en `src/api/`
