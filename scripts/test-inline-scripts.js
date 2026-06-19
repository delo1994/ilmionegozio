"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const targets = [
  "face1.html",
  "face2.html",
  "face5.html",
  "examples/esempio-1/index.html",
  "examples/esempio-2/index.html",
  "examples/esempio-3/index.html"
];
let checked = 0;

for (const relativePath of targets) {
  const html = fs.readFileSync(path.join(root, relativePath), "utf8");
  const scripts = html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi);
  let index = 0;

  for (const match of scripts) {
    const attributes = match[1];
    const source = match[2].trim();
    index += 1;
    if (!source || /\bsrc\s*=/.test(attributes) || /application\/ld\+json/i.test(attributes)) continue;
    try {
      Function(source);
      checked += 1;
    } catch (error) {
      throw new Error(`${relativePath}, script inline ${index}: ${error.message}`);
    }
  }
}

console.log(`Script inline verificati: ${checked}.`);
