# ilmionegozio.com - versione originale preservata per Vercel

Questa cartella ripristina il sito partendo dai template e dagli asset originali.
La priorita e preservare identita visiva, cubo centrale, occhi animati, sfondo/pattern e dinamiche esistenti.

## Struttura

- `index.html` - homepage originale con cubo 3D, occhi animati, particelle e sfondo `static/background.webp`
- `face1.html` ... `face6.html` - pagine originali delle sei facce
- `Face4Round1.html` - round giocabile originale
- `static/` - asset originali copiati integralmente
- `api/book_appointment.js` - funzione Vercel compatibile con il form appuntamenti
- `vercel.json` - clean URL, rewrite delle vecchie route e cache asset

## Deploy GitHub + Vercel

1. Crea un repository GitHub vuoto.
2. Da questa cartella esegui:

```powershell
git add .
git commit -m "Restore original ilmionegozio site for Vercel"
git remote add origin https://github.com/TUO-UTENTE/TUO-REPO.git
git push -u origin main
```

3. In Vercel importa il repository GitHub.
4. Framework: `Other`.
5. Build Command: vuoto.
6. Output Directory: vuoto/root.

## Appuntamenti e Twilio

Il vecchio `app.py` conteneva credenziali Twilio hardcoded e non e stato copiato.
La funzione Vercel usa variabili ambiente:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_FROM`
- `TWILIO_WHATSAPP_TO`
- `BOOKING_WHATSAPP_TO`

Se le variabili Twilio non sono configurate, il form apre un messaggio WhatsApp manuale.

## Note

I file `venv/`, `__pycache__/` e il vecchio Flask con credenziali non fanno parte della build GitHub/Vercel.
