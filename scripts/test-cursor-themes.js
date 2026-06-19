"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "..", "static", "site-foundation.js"), "utf8");
const windowMock = {
  location: { pathname: "/" },
  matchMedia: () => ({ matches: false }),
  addEventListener: () => {},
  requestAnimationFrame: (callback) => callback()
};
const documentMock = {
  readyState: "loading",
  documentElement: { classList: { add: () => {} }, dataset: {} },
  addEventListener: () => {}
};

vm.runInNewContext(source, {
  window: windowMock,
  document: documentMock,
  IntersectionObserver: function () {}
});

const cases = [
  ["/", "nave", true],
  ["/index.html", "nave", true],
  ["/face1.html", "ambienti"],
  ["/face2.html", "video"],
  ["/face3.html", "appuntamenti"],
  ["/face4.html", "giochi"],
  ["/face4round1.html", "round"],
  ["/face5.html", "analisi"],
  ["/face6.html", "scanner"],
  ["/pages/esempio-1.html", "gridline"],
  ["/pages/esempio-2.html", "pixzen"],
  ["/pages/esempio-3.html", "zedian"],
  ["/privacy.html", "privacy"],
  ["/cookie-policy.html", "cookie"],
  ["/termini.html", "termini"],
  ["/accessibilita.html", "accessibilita"],
  ["/pagina-sconosciuta.html", "documento"]
];

for (const [pathname, expectedName, expectedDirectional = false] of cases) {
  windowMock.location.pathname = pathname;
  const theme = windowMock.IlmioCursor.themeForPath();
  assert.equal(theme.name, expectedName, `${pathname} deve usare il cursore ${expectedName}`);
  assert.equal(Boolean(theme.directional), expectedDirectional, `${pathname} ha una direzione errata`);
  assert.match(theme.html, /^(&#\d+;|&[a-z]+;)$/i, `${pathname} deve usare un'entita HTML valida`);
}

const css = fs.readFileSync(path.join(__dirname, "..", "static", "site-foundation.css"), "utf8");
assert.match(css, /\(hover:\s*hover\)\s*and\s*\(pointer:\s*fine\)/, "Il cursore deve essere limitato ai puntatori precisi");
assert.match(css, /input[\s\S]*cursor:\s*auto\s*!important/, "I campi devono mantenere il cursore nativo");

console.log(`Cursor test: ${cases.length} percorsi verificati.`);
