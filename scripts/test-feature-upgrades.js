"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const read = relativePath => fs.readFileSync(path.join(root, relativePath), "utf8");

const index = read("index.html");
for (const voice of ["Homer Simpson", "Donald Trump", "Gerry Scotti", "Maria De Filippi", "Goku"]) {
  assert.match(index, new RegExp(voice), `Il pool principale deve includere ${voice}`);
}
assert.equal((index.match(/weight: 18, favorite: true/g) || []).length, 5, "Devono esserci cinque voci principali con lo stesso peso");
assert.match(index, /favoriteProbability: 0\.9/, "Le voci principali devono coprire il 90% delle estrazioni");
assert.match(index, /id="meteor-overlay"/, "La homepage deve includere lo strato meteoriti");
assert.match(index, /meteoriti-spazio\.gif/, "La homepage deve caricare la GIF trasparente dei meteoriti");
assert.match(index, /meteoriti-spazio-static\.png/, "La homepage deve avere il fallback meteoriti a movimento ridotto");
assert.match(index, /innerMaterial[\s\S]*wireframe:\s*false/, "Il cubo bianco interno deve essere pieno");
assert.match(index, /miniMat[\s\S]*wireframe:\s*false/, "I mini-cubi della legenda devono essere pieni");
assert.match(index, /firstBeat[\s\S]*secondBeat/, "Il cubo bianco deve avere un battito doppio");
assert.match(index, /window\.IndexCubeEffects/, "Gli effetti della homepage devono esporre lo stato diagnostico");
for (const asset of ["static/meteoriti-spazio.gif", "static/meteoriti-spazio-static.png"]) {
  assert.ok(fs.statSync(path.join(root, asset)).size > 0, `${asset} deve esistere e non essere vuoto`);
}

const round1 = read("Face4Round1.html");
assert.match(round1, /JAILBREAK_CHORD_MS\s*=\s*1200/, "DELO deve accettare un accordo rapido per tastiere con rollover limitato");
assert.match(round1, /getJailbreakLetter/, "DELO deve usare KeyboardEvent.code e key");
assert.match(round1, /window\.Round1Jailbreak/, "Il Round1 deve esporre lo stato diagnostico dell'easter egg");
assert.match(round1, /overlay\.setAttribute\("aria-hidden", "false"\)/, "L'overlay DELO deve diventare accessibile quando attivo");

const face2 = read("face2.html");
for (const role of ["cameraman", "steadycam", "regista", "assistente", "audio", "luci"]) {
  assert.match(face2, new RegExp(`data-role="${role}"`), `Face2 deve includere il ruolo ${role}`);
}
assert.match(face2, /\.film-crew[\s\S]*pointer-events:\s*none/, "La troupe non deve intercettare i click");
assert.match(face2, /IlmioFilmCrew/, "Face2 deve esporre lo stato diagnostico della troupe");

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
assert.match(demo1, /class="demo-return-mobile">Indietro</, "Il ritorno della demo 1 deve essere chiaro su mobile");

const demo2 = read("examples/esempio-2/index.html");
assert.match(demo2, /Costruiamo il futuro digitale della tua azienda\./);
assert.match(demo2, /class="demo-return" href="\/face5"/, "La demo 2 deve permettere di tornare a Face5");
assert.match(demo2, /class="demo-return-mobile">Indietro</, "Il ritorno della demo 2 deve essere chiaro su mobile");
for (const phrase of ["Strategie digitali", "Automazioni intelligenti", "Campagne che convertono"]) {
  assert.match(demo2, new RegExp(phrase));
}
assert.equal((demo2.match(/class="agency-card"/g) || []).length, 6, "La demo AI deve avere sei servizi");

const demo3 = read("examples/esempio-3/index.html");
assert.match(demo3, /class="demo-return" href="\/face5"/, "La demo 3 deve permettere di tornare a Face5");
assert.match(demo3, /class="demo-return-mobile">Indietro</, "Il ritorno della demo 3 deve essere chiaro su mobile");
assert.match(demo3, /Esperienze digitali che lasciano il segno/);
assert.match(demo3, /id="collaborazioni"/);
assert.match(demo3, /Parliamo del progetto/);

const face1 = read("face1.html");
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

for (const face of ["face1", "face2", "face5"]) {
  assert.equal(read(`${face}.html`), read(`${face}/index.html`), `${face}.html e ${face}/index.html devono restare sincronizzati`);
}

console.log("Funzioni Face1, Face2, Face5 e demo verificate.");
