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
├── api/
│   ├── http.ts        → HTTP client centralizado (apiRequest, apiRequestNullable, apiUpload)
│   ├── auth.ts        → Login, getMe, logout (funciones)
│   ├── admin.ts       → Users + Organizations CRUD
│   ├── catalog.ts     → Catalogs + Items CRUD
│   ├── channels.ts    → WhatsApp status/enable/disconnect
│   ├── google.ts      → Google OAuth status/connect/disconnect
│   └── knowledge.ts   → Documents list/upload/delete
├── types.ts           → TODOS los tipos de dominio (único punto de verdad)
├── context/
│   └── AppContext.tsx  → AuthState + ActiveView + Toasts
├── hooks/
│   ├── usePolling.ts  → Polling genérico (interval + visibilitychange)
│   ├── useAuth.ts     → Wrapper de api/auth con loading/error
│   ├── useChannels.ts → WhatsApp status via usePolling
│   ├── useDocuments.ts → Documents via usePolling
│   ├── useGoogleConnection.ts → Google OAuth via usePolling
│   ├── useCatalogs.ts → Catalogs + Items con estado optimista
│   ├── useUsers.ts    → Users con estado optimista
│   └── useOrganizations.ts → Organizations con estado optimista
├── components/
│   ├── pages/         → Páginas (una por ActiveView)
│   └── ui/            → Primitivos (Button, Modal, Input, Badge, Card, etc.)
├── App.tsx            → Root: AuthState machine (loading → authenticated|unauthenticated)
├── main.tsx           → Entry point
└── index.css          → Tailwind v4 + theme tokens
```

## Arquitectura por capas

```
Pages → Hooks → API functions → http.ts (apiRequest)
  ↓        ↓         ↓
types.ts ← ← ← ← ← ← (todos importan tipos de aquí)
```

- **types.ts**: Único punto de verdad para interfaces de dominio. Los API files re-exportan tipos para compatibilidad.
- **http.ts**: Centraliza BASE_URL, auth headers, error parsing (`{ message }` y `{ error }`). Nunca hacer `fetch()` directo.
- **Hooks**: Cada hook encapsula un dominio. Usan `usePolling` para datos que cambian (channels, documents, google).
- **Pages**: Solo orquestación y UI. No importan de `api/` directamente — usan hooks.

## Patrón de referencia

`WhatsAppPage.tsx` + `useChannels.ts` + `api/channels.ts` — cada capa hace exactamente una cosa. Replicar en todo componente nuevo.

## Variables de entorno
- `VITE_API_URL` — URL base del backbone API (default: http://localhost:3000)
- `VITE_AUTH_STRATEGY` — `"password"` (default) o `"firebase"`

## Restricciones
- Componentes nuevos con Tailwind utilities, no CSS custom classes
- No `any` — tipos estrictos
- No class components — solo funcionales con hooks
- No `fetch` directo en componentes ni en API files — usar `apiRequest`/`apiUpload` de `http.ts`
- Tipos de dominio solo en `types.ts` — API files los re-exportan
- No `window.confirm()` — usar modales estilizados (patrón `ConfirmDeleteModal`)
