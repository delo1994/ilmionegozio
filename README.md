# ilmionegozio.com

Versione statica del sito originale, preservata e ottimizzata per GitHub e Vercel.
Il progetto mantiene cubo centrale, occhi animati, sfondi, giochi, video, suoni e dinamiche 3D.

## Architettura

- `index.html`: homepage con cubo 3D, occhi, particelle e navigazione alle sei facce.
- `face1.html` ... `face6.html`: esperienze principali.
- `Face4Round1.html`: round giocabile.
- `examples/`: tre demo professionali collegate a Face5.
- `static/`: modelli 3D, immagini, audio, video e utility condivise.
- `static/media-optimizer.js`: sblocco audio mobile, pool Web Audio e preparazione video.
- `static/site-foundation.css`: focus, skip link e supporto reduced motion.
- `static/site-foundation.js`: lazy media, link sicuri e accessibilita condivisa.
- `api/book_appointment.js`: endpoint Vercel per validare e inoltrare appuntamenti.
- `vercel.json`: route, redirect, cache e header di sicurezza.

Le copie `faceN/index.html` esistono per compatibilita con le route storiche e devono restare sincronizzate con i rispettivi file root.

## Sviluppo locale

Con Python:

```powershell
python -m http.server 8080
```

Aprire `http://localhost:8080`.

Con Vercel CLI:

```powershell
npm run dev
```

## Controlli qualita

Il repository include un validatore senza dipendenze esterne:

```powershell
npm run check
```

Controlla HTML, metadati, JavaScript inline, JSON, sitemap, robots e sincronizzazione delle pagine duplicate. La stessa verifica viene eseguita da GitHub Actions ad ogni push e pull request.

## Deploy GitHub + Vercel

1. Importare il repository GitHub in Vercel.
2. Framework Preset: `Other`.
3. Build Command: vuoto.
4. Output Directory: vuoto, usando la root del repository.
5. Pubblicare il branch `main`.

## Appuntamenti e WhatsApp

L'endpoint accetta solo JSON validato e applica limiti, honeypot e timeout. Variabili ambiente opzionali:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_FROM`
- `TWILIO_WHATSAPP_TO`
- `BOOKING_WHATSAPP_TO`

Senza credenziali Twilio, il form restituisce un collegamento WhatsApp manuale gia compilato.

## Media pesanti

Gli asset originali non sono stati eliminati. I file principali da considerare per una futura transcodifica CDN sono:

- `static/capcut1.mp4`: circa 90 MB, caricato solo su richiesta.
- `static/Round1.mp4`: circa 19 MB.
- `static/exBackgroundRound1.mp4`: circa 16 MB.
- `static/charizard_flying_animation.glb`: circa 14 MB.
- `static/Backgroundvideoface1.mp4`: circa 13 MB.

Per ridurre ulteriormente i tempi globali, mantenendo la stessa resa, questi file possono essere convertiti in varianti WebM/AV1 e serviti tramite CDN video.

## Sicurezza e privacy

- Nessuna credenziale e inclusa nel repository.
- Analytics viene caricato solo dopo consenso esplicito.
- I link esterni in nuova scheda usano `noopener noreferrer`.
- Vercel applica header `nosniff`, `SAMEORIGIN`, `Referrer-Policy` e `Permissions-Policy`.
- Le risposte dell'API appuntamenti non vengono memorizzate in cache.
