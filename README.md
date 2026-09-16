# Frontend — Svelte + Vite

Aplicación cliente independiente, sin SvelteKit.

```powershell
copy .env.example .env
npm install
npm run dev
```

Configura `VITE_API_URL` con la URL pública de la API de Render, sin barra final. Para preparar el despliegue estático ejecuta `npm run build`; el resultado se genera en `dist/`.
