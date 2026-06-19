"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const read = relativePath => fs.readFileSync(path.join(root, relativePath), "utf8");

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
assert.equal((face5.match(/<h1\b/g) || []).length, 1, "Face5 deve avere un solo H1");

const quantum = read("static/face5-quantum.js");
for (const feature of ["ShaderMaterial", "UnrealBloomPass", "OrbitControls", "uPulsePositions", "Raycaster"]) {
  assert.match(quantum, new RegExp(feature), `Face5 Quantum deve includere ${feature}`);
}

const demo1 = read("examples/esempio-1/index.html");
assert.match(demo1, /Dove le idee diventano esperienze digitali\./);
assert.match(demo1, /id="metodo"/);
assert.match(demo1, /id="testimonianze"/);

const demo2 = read("examples/esempio-2/index.html");
assert.match(demo2, /Costruiamo il futuro digitale della tua azienda\./);
for (const phrase of ["Strategie digitali", "Automazioni intelligenti", "Campagne che convertono"]) {
  assert.match(demo2, new RegExp(phrase));
}
assert.equal((demo2.match(/class="agency-card"/g) || []).length, 6, "La demo AI deve avere sei servizi");

const demo3 = read("examples/esempio-3/index.html");
assert.match(demo3, /Esperienze digitali che lasciano il segno/);
assert.match(demo3, /id="collaborazioni"/);
assert.match(demo3, /Parliamo del progetto/);

const face1 = read("face1.html");
for (const condition of ["crossedBoundary", "touchedDrive", "passedDriveLimit", "fallbackLimit"]) {
  assert.match(face1, new RegExp(condition), `Face1 deve controllare ${condition}`);
}
assert.match(face1, /Face1CoffeeDebug/);

for (const face of ["face1", "face2", "face5"]) {
  assert.equal(read(`${face}.html`), read(`${face}/index.html`), `${face}.html e ${face}/index.html devono restare sincronizzati`);
}

console.log("Funzioni Face1, Face2, Face5 e demo verificate.");
