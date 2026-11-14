# calorie-tracker
Persoonlijke calorie-tracker PWA met barcodescanner. Zie [REQUIREMENTS.md](REQUIREMENTS.md).

Live: https://bklerkx.github.io/calorie-tracker/

## Techniek
Svelte 5 + Vite + TypeScript, Dexie.js (IndexedDB), vite-plugin-pwa. Hash-routing (`#/vandaag`) zodat de app
op het GitHub Pages-subpad en offline werkt.

## Ontwikkelen
```bash
npm install
npm run dev      # lokale server
npm run check    # typecheck
npm test         # unit tests
npm run build    # productiebuild in dist/
npm run icons    # PNG-iconen opnieuw genereren uit scripts/icon.svg
```

## Publiceren
Elke push naar `main` wordt via `.github/workflows/deploy.yml` gebouwd en op GitHub Pages gezet.
Pull requests naar `main` draaien typecheck, tests en build (`ci.yml`).
