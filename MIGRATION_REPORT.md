# Report ripristino originale

Cartella originale: `D:\python\sito_web\sito web - Copia\sito web pass\sito_web`
Cartella nuova: `C:\Users\Emanuele\Documents\Codex\2026-06-18\d-python-sito-web-sito-web\outputs\ilmionegozio-vercel-original-preserved`
File totali: 78
Dimensione totale: 230.41 MB

## Pagine originali ripristinate

- index.html -> index.html
- face1.html -> face1.html
- face2.html -> face2.html
- face3.html -> face3.html
- face4.html -> face4.html
- Face4Round1.html -> Face4Round1.html
- face5.html -> face5.html
- face6.html -> face6.html
- privacy-policy.html -> privacy-policy.html
- cookie-policy.html -> cookie-policy.html
- Termini&Condizioni.html -> Termini_Condizioni.html
- Accessibilità.html -> Accessibilita.html

## Asset copiati

- 45 file copiati in `static/`
- static/adobe_illustrator.png
- static/adobe_photoshop.png
- static/agh-zombies-hacked.swf
- static/animated_character.gif
- static/background..png
- static/background.webp
- static/backgroundFace1.webp
- static/backgroundFace4.webp
- static/BackgroundRound1.mp4
- static/Backgroundvideoface1.mp4
- static/basic_house_map.glb
- static/capcut.png
- static/capcut1.mp4
- static/cartoon-game-theme-loop.wav
- static/character_model.glb
- static/charizard_flying_animation.glb
- static/cyber_sword.glb
- static/da_vinci.png
- static/doh.wav
- static/exBackgroundRound1.mp4
- static/Extra Life 8 Bit.wav
- static/frozen-candy.swf
- static/model.fbx
- static/real_to_3d_experience.mp4
- static/Round1.mp4
- static/Round1.wav
- static/slice.wav
- static/spacedrive.glb
- static/super-mario-flash-2.swf
- static/surprise_facehugger_animated.glb
- static/Voce1.mp3
- static/Voce1.wav
- static/Voce10.wav
- static/Voce2.mp3
- static/Voce2.wav
- static/Voce3.mp3
- static/Voce4.wav
- static/Voce5.mp3
- static/Voce5.wav
- static/Voce6.wav
- static/Voce7.wav
- static/Voce8.wav
- static/Voce9.wav
- static/Welldone.wav
- static/vendor/fflate-umd.js

## Video enormi esclusi

- Nessuno. Ho copiato anche `static/capcut1.mp4` per preservare il pacchetto originale.

## File originali non copiati

- `venv/` e `__pycache__/`: ambiente locale/cache, non utili su Vercel.
- `app.py`: contiene credenziali Twilio hardcoded; sostituito da `api/book_appointment.js` con variabili ambiente.
- `app.txt` e `tdgfgb.txt`: bozze Flask locali, non necessarie al deploy statico/Vercel.

## File mancanti nel pacchetto originale

- /static/capcut1.jpg
- /static/capcut2.jpg
- /static/capcut2.mp4
- /static/capcut3.jpg
- /static/capcut3.mp4
- /static/cinema_background.jpg
- /static/davinci1.jpg
- /static/davinci1.mp4
- /static/davinci2.jpg
- /static/davinci2.mp4
- /static/davinci3.jpg
- /static/davinci3.mp4
- /static/illustrator1.jpg
- /static/illustrator1.mp4
- /static/illustrator2.jpg
- /static/illustrator2.mp4
- /static/illustrator3.jpg
- /static/illustrator3.mp4
- /static/photoshop1.jpg
- /static/photoshop1.mp4
- /static/photoshop2.jpg
- /static/photoshop2.mp4
- /static/photoshop3.jpg
- /static/photoshop3.mp4

## Path corretti

- /static/backgroundRound1.mp4 -> /static/BackgroundRound1.mp4
- /static/cinema_background.jpg mancante -> /static/background.webp
- Accessibilita.html: aggiunto H1 sr-only senza impatto visivo
- Accessibilita.html: creato documento HTML completo da frammento originale
- Face4Round1.html: aggiunto H1 sr-only senza impatto visivo
- face3.html: corretto overflow orizzontale con box-sizing
- face3.html: fallback WhatsApp se Twilio/env Vercel non sono configurati
- face4.html: aggiunto H1 sr-only senza impatto visivo
- face6.html: corretto overflow orizzontale con box-sizing
- https://cdn.jsdelivr.net/npm/fflate@0.6.9/fflate.min.js -> /static/vendor/fflate-umd.js
- index.html: aggiunto H1 sr-only senza impatto visivo
- index.html: aggiunto fallback WebGL senza cambiare cubo/occhi/sfondo
- index.html: rimossa seconda copia HTML duplicata dopo il primo </html>
- rimosso poster mancante /static/capcut1.jpg
- rimosso poster mancante /static/capcut2.jpg
- rimosso poster mancante /static/capcut3.jpg
- rimosso poster mancante /static/davinci1.jpg
- rimosso poster mancante /static/davinci2.jpg
- rimosso poster mancante /static/davinci3.jpg
- rimosso poster mancante /static/illustrator1.jpg
- rimosso poster mancante /static/illustrator2.jpg
- rimosso poster mancante /static/illustrator3.jpg
- rimosso poster mancante /static/photoshop1.jpg
- rimosso poster mancante /static/photoshop2.jpg
- rimosso poster mancante /static/photoshop3.jpg
- sostituito video mancante /static/capcut2.mp4 con nota testuale
- sostituito video mancante /static/capcut3.mp4 con nota testuale
- sostituito video mancante /static/davinci1.mp4 con nota testuale
- sostituito video mancante /static/davinci2.mp4 con nota testuale
- sostituito video mancante /static/davinci3.mp4 con nota testuale
- sostituito video mancante /static/illustrator1.mp4 con nota testuale
- sostituito video mancante /static/illustrator2.mp4 con nota testuale
- sostituito video mancante /static/illustrator3.mp4 con nota testuale
- sostituito video mancante /static/photoshop1.mp4 con nota testuale
- sostituito video mancante /static/photoshop2.mp4 con nota testuale
- sostituito video mancante /static/photoshop3.mp4 con nota testuale
- static/... relativo -> /static/... assoluto
- url_for('Accessibilità') -> /Accessibilita
- url_for('TerminiECondizioni') -> /Termini_Condizioni
- url_for('accessibilita') -> /Accessibilita
- url_for('cookie_policy') -> /cookie-policy
- url_for('face4Round1') -> /face4Round1
- url_for('index') -> /
- url_for('privacy_policy') -> /privacy-policy
- url_for('termini_condizioni') -> /Termini_Condizioni

## Audit finale riferimenti

- Nessun riferimento locale mancante rilevato.
