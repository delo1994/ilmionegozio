const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const errors = [];
const warnings = [];
const redirectAliases = new Set(['example1.html', 'example2.html', 'example3.html']);

function walk(directory, extension, output = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(fullPath, extension, output);
    else if (entry.name.endsWith(extension)) output.push(fullPath);
  }
  return output;
}

function relative(file) {
  return path.relative(root, file).replace(/\\/g, '/');
}

function count(source, pattern) {
  return (source.match(pattern) || []).length;
}

function validateInlineScripts(file, html) {
  const scriptPattern = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
  for (const match of html.matchAll(scriptPattern)) {
    const attributes = match[1];
    const code = match[2];
    if (/\bsrc=/.test(attributes) || /application\/ld\+json|text\/plain|importmap/.test(attributes)) continue;
    try {
      new vm.Script(code, { filename: relative(file) });
    } catch (error) {
      errors.push(`${relative(file)}: JavaScript inline non valido: ${error.message}`);
    }
  }
}

function validateHtml(file) {
  const html = fs.readFileSync(file, 'utf8');
  const name = relative(file);
  if (!/<html[^>]+lang="it"/i.test(html)) warnings.push(`${name}: lang non impostato su it`);
  if (count(html, /<title>/gi) !== 1) errors.push(`${name}: deve contenere un solo <title>`);
  if (!/<meta name="description" content="[^"]{30,}"/i.test(html)) warnings.push(`${name}: meta description mancante o troppo breve`);
  if (!redirectAliases.has(name) && count(html, /<h1\b/gi) < 1) errors.push(`${name}: H1 mancante`);
  if (!redirectAliases.has(name) && !html.includes('/static/site-foundation.js')) errors.push(`${name}: fondazione condivisa non collegata`);
  validateInlineScripts(file, html);
}

function validateMirrors() {
  const pairs = [
    ['face1.html', 'face1/index.html'],
    ['face2.html', 'face2/index.html'],
    ['face3.html', 'face3/index.html'],
    ['face4.html', 'face4/index.html'],
    ['Face4Round1.html', 'face4Round1/index.html'],
    ['face5.html', 'face5/index.html'],
    ['face6.html', 'face6/index.html'],
    ['privacy-policy.html', 'privacy-policy/index.html'],
    ['cookie-policy.html', 'cookie-policy/index.html'],
    ['Accessibilita.html', 'Accessibilita/index.html'],
    ['Termini_Condizioni.html', 'Termini_Condizioni/index.html'],
    ['Termini_Condizioni.html', 'termini-condizioni/index.html']
  ];
  for (const [left, right] of pairs) {
    if (fs.readFileSync(path.join(root, left), 'utf8') !== fs.readFileSync(path.join(root, right), 'utf8')) {
      errors.push(`${left} e ${right} non sono sincronizzati`);
    }
  }
}

function validateJson(file) {
  try {
    JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  } catch (error) {
    errors.push(`${file}: JSON non valido: ${error.message}`);
  }
}

walk(root, '.html').forEach(validateHtml);
validateMirrors();
validateJson('package.json');
validateJson('vercel.json');

if (!fs.readFileSync(path.join(root, 'robots.txt'), 'utf8').includes('sitemap.xml')) {
  errors.push('robots.txt: riferimento alla sitemap mancante');
}
if (!fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8').includes('<urlset')) {
  errors.push('sitemap.xml: struttura urlset mancante');
}

warnings.forEach((warning) => console.warn(`AVVISO ${warning}`));
if (errors.length) {
  errors.forEach((error) => console.error(`ERRORE ${error}`));
  process.exit(1);
}

console.log(`Controllo completato: ${walk(root, '.html').length} file HTML validati, ${warnings.length} avvisi.`);
