"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const read = relativePath => fs.readFileSync(path.join(root, relativePath), "utf8");

const foundationJs = read("static/site-foundation.js");
const foundationCss = read("static/site-foundation.css");
assert.match(foundationJs, /function setupWhatsAppChat/, "La fondazione deve creare la minichat WhatsApp globale");
assert.match(foundationJs, /phoneNumber = "393347992295"/, "La minichat deve usare il numero WhatsApp richiesto");
assert.match(foundationJs, /https:\/\/wa\.me\//, "L'invio deve aprire il collegamento ufficiale WhatsApp");
assert.match(foundationJs, /window\.IlmioWhatsApp/, "La minichat deve esporre uno stato diagnostico");
assert.match(foundationCss, /\.site-whatsapp__panel/, "La minichat deve avere un pannello responsive condiviso");

const index = read("index.html");
for (const voice of [1, 2, 4, 5, 6, 7, 8, 9, 10]) {
  assert.match(index, new RegExp(`Voce${voice}\\.wav`), `Il pool deve includere Voce${voice}.wav`);
}
assert.doesNotMatch(index, /Voce3\.(?:mp3|wav)/, "La homepage non deve usare Voce3");
assert.doesNotMatch(index, /Voce(?:1|2|4|5|6|7|8|9|10)\.mp3/, "La homepage deve usare esclusivamente WAV");
assert.match(index, /function playFileFromGesture[\s\S]*audio\.play\(\)/, "L'audio mobile deve partire direttamente dal gesto utente");
assert.match(index, /dataset\.indexPlayback = "playing"/, "La homepage deve esporre lo stato della riproduzione audio");
for (const voice of [1, 2, 4, 5, 6, 7, 8, 9, 10]) {
  assert.ok(fs.statSync(path.join(root, `static/Voce${voice}.wav`)).size > 0, `static/Voce${voice}.wav deve essere presente`);
}
assert.match(index, /id="meteor-overlay"/, "La homepage deve includere lo strato meteoriti");
assert.match(index, /data-meteor-count="38"/, "Lo sciame deve includere molti meteoriti piccoli");
assert.match(index, /meteoriti-spazio\.gif/, "La homepage deve caricare la GIF trasparente dei meteoriti");
assert.match(index, /meteoriti-spazio-static\.png/, "La homepage deve avere il fallback meteoriti a movimento ridotto");
assert.match(index, /drop-shadow\(0 0 4px/, "L'alone dei meteoriti deve restare piccolo e discreto");
assert.match(index, /innerMaterial[\s\S]*wireframe:\s*false/, "Il cubo bianco interno deve essere pieno");
assert.match(index, /hypercubePulseMaterials[\s\S]*THREE\.AdditiveBlending/, "Le diagonali colorate devono avere un alone pulsante");
assert.match(index, /hypercubePulse\.scale\.setScalar\(1\.006 \+ linePulse \* 0\.16\)/, "Il battito deve espandere il tracciato colorato");
assert.match(index, /material\.opacity = 0\.06 \+ linePulse \* 1\.15/, "Il battito deve aumentare la luminosita delle diagonali");
assert.match(index, /const electricBoltCount = isMobileViewport \? 8 : 18/, "Le scariche devono essere numerose su desktop e leggibili su mobile");
assert.match(index, /function refreshElectricBolt/, "Le scariche elettriche devono rigenerare il proprio percorso");
assert.match(index, /mainCube\.add\(electricDischargeGroup\)/, "Le scariche devono occupare lo spazio interno dell'ipercubo");
assert.match(index, /new THREE\.PointsMaterial/, "Le scariche devono avere nodi luminosi visibili su mobile");
assert.match(index, /viewport-fit=cover/, "La homepage deve coprire le aree di sicurezza in orizzontale");
assert.match(index, /viewport\.width > viewport\.height \? 1\.28 : 1/, "Il cubo deve restare leggibile con il telefono in orizzontale");
assert.match(index, /\.eyes-container\s*\{[\s\S]*?inset:\s*0;[\s\S]*?pointer-events:\s*none;/, "Gli occhi devono restare distribuiti nel viewport senza creare zone bianche in basso");
assert.match(index, /miniMat[\s\S]*wireframe:\s*false/, "I mini-cubi della legenda devono essere pieni");
assert.match(index, /miniMat\s*=\s*new THREE\.MeshStandardMaterial/, "I mini-cubi devono avere materiali illuminati tridimensionali");
assert.match(index, /new THREE\.EdgesGeometry\(miniGeo\)/, "I mini-cubi devono avere spigoli tridimensionali visibili");
assert.match(index, /firstBeat[\s\S]*secondBeat/, "Il cubo bianco deve avere un battito doppio");
assert.match(index, /window\.IndexCubeEffects/, "Gli effetti della homepage devono esporre lo stato diagnostico");
assert.match(index, /id="face-transition-overlay"/, "La homepage deve includere l'overlay di transizione delle facce");
for (const effect of ["fracture", "lightning", "data-grid", "pulverize", "analytics", "vortex"]) {
  assert.match(index, new RegExp(`name: "${effect}"`), `La homepage deve includere l'effetto ${effect}`);
}
assert.match(index, /const animationDuration = 1000/, "L'animazione storica del cubo deve conservare la durata originale");
assert.match(index, /elapsed >= animationDuration && !transitionEffectStarted[\s\S]*startFaceTransition/, "Gli effetti devono partire soltanto al termine dell'animazione originale");
assert.match(index, /function prefetchFace[\s\S]*rel = "prefetch"/, "La destinazione deve essere precaricata durante l'animazione del cubo");
assert.match(index, /window\.IndexFaceTransitions/, "Le sei transizioni devono esporre uno stato diagnostico");
for (const asset of ["static/meteoriti-spazio.gif", "static/meteoriti-spazio-static.png"]) {
  assert.ok(fs.statSync(path.join(root, asset)).size > 0, `${asset} deve esistere e non essere vuoto`);
}

const round1 = read("Face4Round1.html");
assert.match(round1, /JAILBREAK_CHORD_MS\s*=\s*1200/, "DELO deve accettare un accordo rapido per tastiere con rollover limitato");
assert.match(round1, /getJailbreakLetter/, "DELO deve usare KeyboardEvent.code e key");
assert.match(round1, /window\.Round1Jailbreak/, "Il Round1 deve esporre lo stato diagnostico dell'easter egg");
assert.match(round1, /overlay\.setAttribute\("aria-hidden", "false"\)/, "L'overlay DELO deve diventare accessibile quando attivo");
assert.doesNotMatch(round1, /<video[^>]*\bautoplay\b/, "Il video Round1 non deve partire prima del punteggio 20");
assert.match(round1, /score < 20 \|\| scoreVideoStarted/, "Il video Round1 deve avviarsi dal punteggio 20");
assert.match(round1, /function showRoundWin[\s\S]*textContent = "YOU WIN"/, "La vittoria Round1 deve mostrare YOU WIN");
assert.match(round1, /window\.Round1GameDebug/, "Round1 deve esporre lo stato diagnostico di video e vittoria");

const face2 = read("face2.html");
for (const role of ["cameraman", "steadycam", "regista", "assistente", "audio", "luci"]) {
  assert.match(face2, new RegExp(`data-role="${role}"`), `Face2 deve includere il ruolo ${role}`);
}
assert.match(face2, /\.film-crew[\s\S]*pointer-events:\s*none/, "La troupe non deve intercettare i click");
assert.match(face2, /IlmioFilmCrew/, "Face2 deve esporre lo stato diagnostico della troupe");
assert.match(face2, /class="curtain-valance"/, "Face2 deve avere una mantovana teatrale");
assert.match(face2, /repeating-linear-gradient\(90deg, #3c0209/, "Il sipario deve avere pieghe in velluto rosso");
assert.match(face2, /class="crew-skills"/, "Face2 deve presentare le competenze della troupe");
for (const skill of ["Fotografia professionale", "Videomaking e regia", "Riprese con droni", "Color grading"]) {
  assert.match(face2, new RegExp(skill), `Face2 deve includere ${skill}`);
}
assert.match(face2, /class="studio-drone"/, "Face2 deve includere il drone decorativo");
assert.match(face2, /legacy-green-particles-disabled/, "Il vecchio sfondo a particelle deve restare disattivato");

const face5 = read("face5.html");
for (const title of ["Studio Creativo Premium", "Agenzia AI &amp; Marketing", "Portfolio Professionale Tech"]) {
  assert.match(face5, new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `Face5 deve mostrare ${title}`);
}
assert.equal((face5.match(/>Dettagli</g) || []).length, 3, "Face5 deve avere tre collegamenti di approfondimento");
assert.match(face5, /id="quantum-network"/);
assert.match(face5, /id="report-panel"/);
assert.match(face5, /id="demos-panel"/);
assert.match(face5, /data-panel-open="resources-panel">Risorse</, "Risorse deve aprire il pannello interno");
assert.match(face5, /id="resources-panel"/, "Face5 deve conservare il pannello delle risorse storiche");
assert.doesNotMatch(face5, /href="\/privacy-policy">Risorse</, "Risorse non deve rimandare alla privacy policy");
assert.equal((face5.match(/class="demo-card /g) || []).length, 4, "Face5 deve mostrare quattro esperienze web");
for (const chart of ["geoChart", "clickChart", "demoChart"]) {
  assert.match(face5, new RegExp(`id="${chart}"`), `Face5 deve ripristinare il grafico ${chart}`);
}
assert.equal((face5.match(/<h1\b/g) || []).length, 1, "Face5 deve avere un solo H1");

const quantum = read("static/face5-quantum.js");
for (const feature of ["ShaderMaterial", "UnrealBloomPass", "OrbitControls", "uPulsePositions", "Raycaster"]) {
  assert.match(quantum, new RegExp(feature), `Face5 Quantum deve includere ${feature}`);
}
assert.match(quantum, /initializeResources/, "Face5 deve inizializzare le risorse su richiesta");
assert.match(quantum, /chart\.js@4\.4\.7/, "I grafici devono essere caricati in modo differito");

const demo1 = read("examples/esempio-1/index.html");
assert.match(demo1, /Dove le idee diventano esperienze digitali\./);
assert.match(demo1, /id="metodo"/);
assert.match(demo1, /id="testimonianze"/);
assert.match(demo1, /class="demo-return" href="\/face5"/, "La demo 1 deve permettere di tornare a Face5");
assert.match(demo1, /class="demo-return-mobile">Torna a Strategie</, "Il ritorno della demo 1 deve essere chiaro su mobile");

const demo2 = read("examples/esempio-2/index.html");
assert.match(demo2, /Costruiamo il futuro digitale della tua azienda\./);
assert.match(demo2, /class="demo-return" href="\/face5"/, "La demo 2 deve permettere di tornare a Face5");
assert.match(demo2, /class="demo-return-mobile">Torna a Strategie</, "Il ritorno della demo 2 deve essere chiaro su mobile");
for (const phrase of ["Strategie digitali", "Automazioni intelligenti", "Campagne che convertono"]) {
  assert.match(demo2, new RegExp(phrase));
}
assert.equal((demo2.match(/class="agency-card"/g) || []).length, 6, "La demo AI deve avere sei servizi");
assert.equal((demo2.match(/href="\/face3">Prenota una call</g) || []).length, 2, "Le call della demo AI devono aprire Face3");

const demo3 = read("examples/esempio-3/index.html");
assert.match(demo3, /class="demo-return" href="\/face5"/, "La demo 3 deve permettere di tornare a Face5");
assert.match(demo3, /class="demo-return-mobile">Torna a Strategie</, "Il ritorno della demo 3 deve essere chiaro su mobile");
assert.match(demo3, /Esperienze digitali che lasciano il segno/);
assert.match(demo3, /id="collaborazioni"/);
assert.match(demo3, /Parliamo del progetto/);

const face1 = read("face1.html");
assert.match(face1, /new THREE\.DodecahedronGeometry\(2, 0\)/, "Il solido giallo principale deve essere un dodecaedro");
assert.match(face1, /octahedron\.name = "dodecahedron"/, "Il dodecaedro deve essere riconosciuto dal raycaster");
assert.match(face1, /id="face1StoryBubble"/, "Face1 deve includere le nuvolette narrative");
assert.match(face1, /window\.Face1Story/, "Face1 deve esporre lo stato della missione staff");
for (const skill of ["Rhinoceros", "NURBS", "Blender", "Unity", "Unreal Engine"]) {
  assert.match(face1, new RegExp(skill), `La storia Face1 deve includere ${skill}`);
}
for (const condition of ["crossedBoundary", "touchedDrive", "passedDriveLimit", "fallbackLimit"]) {
  assert.match(face1, new RegExp(condition), `Face1 deve controllare ${condition}`);
}
assert.match(face1, /Face1CoffeeDebug/);
assert.match(face1, /id="face1Arcade"/, "Face1 deve includere l'arcade 3D");
assert.match(face1, /facehuggerClickCount\s*>=\s*5/, "Il Facehugger deve aprire il gioco dopo cinque tocchi");
assert.match(face1, /diamondClickCount\s*>=\s*5/, "Il diamante deve aprire il gioco dopo cinque tocchi");
assert.match(face1, /startFace1Arcade\("coffee"/, "Il caffe deve avviare il gioco tematico");

const face1Games = read("static/face1-games.js");
for (const title of ["Portale VR", "Prisma Quantico", "Barista Orbitale"]) {
  assert.match(face1Games, new RegExp(title), `L'arcade Face1 deve includere ${title}`);
}
assert.match(face1Games, /window\.Face1Arcade/, "L'arcade Face1 deve esporre lo stato diagnostico");

const face6 = read("face6.html");
assert.match(face6, /<video id="experienceVideo" autoplay muted loop preload="auto"/, "Face6 deve richiedere autoplay immediato");
assert.match(face6, /function startExperienceVideo[\s\S]*experienceVideo\.play\(\)/, "Face6 deve avere un avvio video immediato");
assert.match(face6, /prepareVideo\(experienceVideo[\s\S]*startExperienceVideo\(\)/, "Face6 deve avviare il video dopo la preparazione senza attendere un click");

for (const face of ["face1", "face2", "face5"]) {
  assert.equal(read(`${face}.html`), read(`${face}/index.html`), `${face}.html e ${face}/index.html devono restare sincronizzati`);
}
assert.equal(round1, read("face4Round1/index.html"), "Face4Round1 e la route devono restare sincronizzati");
assert.equal(face6, read("face6/index.html"), "face6.html e face6/index.html devono restare sincronizzati");

console.log("Funzioni Face1, Face2, Face5 e demo verificate.");
