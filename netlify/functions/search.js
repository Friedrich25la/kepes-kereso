// netlify/functions/search.js
const fs = require('fs');
const path = require('path');

let CACHE = null;
let CACHE_TS = 0;
const CACHE_TTL = 1000 * 60 * 5; // 5 perc cache
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 500; // Biztonsági korlát: ne engedj túl nagy lekérést egyszerre

function normalize(s = '') {
  try {
    let t = s.toString().toLowerCase();
    // egyszerű diakritika-eltávolítás (ékezetek)
    t = t.normalize ? t.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : t;
    return t;
  } catch (e) { return (s || '').toString().toLowerCase(); }
}

exports.handler = async (event) => {
  // ----------------------------------------------------------------
  // 1. BIZTONSÁG & CORS (Kik hívhatják meg a keresőt?)
  // ----------------------------------------------------------------
  const origin = event.headers.origin || event.headers.Origin;

  // Itt sorold fel azokat a címeket, ahonnan engedélyezed a keresést:
  const allowedOrigins = [
    'https://aquamarine-cactus-d0f609.netlify.app', // A te Netlify oldalad
    'https://www.trinexus.hu',                      // A céges weboldal (ha beágyazod)
    'http://localhost:8000',                        // Helyi teszteléshez (python server)
    'http://127.0.0.1:8000',                        // Helyi tesztelés alternatív IP
    'http://localhost:5500',                        // Live Server (VS Code) gyakori port
    'http://127.0.0.1:5500'
  ];

  // Ha a hívó rajta van a listán, akkor engedjük. Ha nincs, akkor az elsőt (vagy null-t) adjuk vissza.
  // (Ez megakadályozza, hogy idegen weboldalak használják a szerveredet)
  const allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  // Közös header beállítások
  const headers = {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    // Query paraméterek olvasása
    const qRaw = (event.queryStringParameters?.q || '').trim();
    const page = Math.max(1, Number(event.queryStringParameters?.page) || 1);
    let limit = Math.max(1, Number(event.queryStringParameters?.limit) || DEFAULT_LIMIT);
    if (limit > MAX_LIMIT) limit = MAX_LIMIT;

    // Ha nincs keresőszó
    if (!qRaw || qRaw.length < 1) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Query param "q" required (min length 1).' }),
      };
    }

    // ----------------------------------------------------------------
    // 2. ADATBÁZIS BETÖLTÉSE (Cache-elve a gyorsaságért)
    // ----------------------------------------------------------------
    if (!CACHE || (Date.now() - CACHE_TS) > CACHE_TTL) {
      // Fontos: A netlify.toml-ben beállított included_files miatt ez a fájl ott lesz.
      const filePath = path.join(__dirname, '_assets', 'products_with_status_min.json');

      if (!fs.existsSync(filePath)) {
        throw new Error(`Database file not found at ${filePath}`);
      }

      const raw = fs.readFileSync(filePath, 'utf-8');
      CACHE = JSON.parse(raw);
      CACHE_TS = Date.now();
    }
    const data = CACHE || [];

    // ----------------------------------------------------------------
    // 3. KERESÉSI LOGIKA
    // ----------------------------------------------------------------
    const qnorm = normalize(qRaw);
    const tokens = qnorm.split(/\s+/).filter(Boolean);

    // Filter: minden tokennek (szótöredéknek) szerepelnie kell a névben VAGY cikkszámban (AND kapcsolat)
    const matches = [];
    for (let i = 0; i < data.length; i++) {
      const p = data[i];
      // Összefűzzük a nevet és cikkszámot a kereséshez
      // Hozzáadjuk a kategóriát (p.category) is a keresési "szénakazalhoz"
      const hay = normalize((p.name || '') + ' ' + (p.sku || '') + ' ' + (p.category || ''));
      let ok = true;
      for (let t of tokens) {
        if (!hay.includes(t)) { ok = false; break; }
      }
      if (ok) matches.push(p);
    }

    const total = matches.length;

    // ----------------------------------------------------------------
    // 4. LAPOZÁS ÉS VÁLASZ FORMÁZÁSA
    // ----------------------------------------------------------------
    const start = (page - 1) * limit;
    const end = start + limit;

    // Itt válogatjuk ki, milyen adatokat küldünk vissza a kliensnek (Security Whitelist)
    const pageResults = matches.slice(start, end).map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      price: p.price,
      thumb: p.thumb,
      url: p.url,
      img: p.img  // FONTOS: Ez kellett ahhoz, hogy a képek megjelenjenek!
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        q: qRaw,
        page,
        limit,
        total_count: total,
        results: pageResults
      })
    };

  } catch (err) {
    console.error('search error', err);
    return {
      statusCode: 500,
      headers, // Hiba esetén is küldjük a CORS fejlécet, különben a hibaüzenet se látszik
      body: JSON.stringify({ error: err.message || String(err) })
    };
  }
};
