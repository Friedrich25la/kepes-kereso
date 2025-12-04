const fs = require('fs');
const path = require('path');

let CACHE = null;
let CACHE_TS = 0;
const CACHE_TTL = 1000 * 60 * 5; // 5 perc cache
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 500;

function normalize(s = '') {
  try {
    let t = s.toString().toLowerCase();
    // Ékezetek eltávolítása (diakritika)
    t = t.normalize ? t.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : t;
    return t;
  } catch (e) { return (s || '').toString().toLowerCase(); }
}

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin;

  // Engedélyezett domainek
  const allowedOrigins = [
    'https://aquamarine-cactus-d0f609.netlify.app',
    'https://www.trinexus.hu',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    'http://localhost:5500',
    'http://127.0.0.1:5500'
  ];

  const allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  const headers = {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    // 1. Paraméterek beolvasása
    const qRaw = (event.queryStringParameters?.q || '').trim();
    const page = Math.max(1, Number(event.queryStringParameters?.page) || 1);

    // Leírásban keresés kapcsoló
    const searchInDesc = event.queryStringParameters?.desc === 'true';

    // --- ÚJ: Kategóriában keresés kapcsoló ---
    const searchInCat = event.queryStringParameters?.cat === 'true';

    let limit = Math.max(1, Number(event.queryStringParameters?.limit) || DEFAULT_LIMIT);
    if (limit > MAX_LIMIT) limit = MAX_LIMIT;

    if (!qRaw || qRaw.length < 1) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Query param "q" required.' }),
      };
    }

    // --- ADATBÁZIS BETÖLTÉSE ---
    if (!CACHE || (Date.now() - CACHE_TS) > CACHE_TTL) {
      const filePath = path.join(__dirname, '_assets', 'products_with_status_min.json');
      if (!fs.existsSync(filePath)) throw new Error(`Database file not found at ${filePath}`);
      const raw = fs.readFileSync(filePath, 'utf-8');
      CACHE = JSON.parse(raw);
      CACHE_TS = Date.now();
    }
    const data = CACHE || [];

    // --- KERESÉSI LOGIKA ---
    const qnorm = normalize(qRaw);
    const tokens = qnorm.split(/\s+/).filter(Boolean); // A keresett szavak

    const matches = [];
    for (let i = 0; i < data.length; i++) {
      const p = data[i];

      /* --- STÁTUSZ SZŰRÉS (Megmaradt) --- */
      if (p.status == 0) {
        continue;
      }

      // Alap keresési string: NÉV + CIKKSZÁM
      let searchStr = (p.name || '') + ' ' + (p.sku || '');

      // HA a felhasználó kérte a leírásban keresést, hozzáfűzzük azt is
      if (searchInDesc) {
        searchStr += ' ' + (p.short_description || '');
      }

      // --- ÚJ: HA a felhasználó kérte a kategória keresést, hozzáfűzzük azt is ---
      if (searchInCat) {
        searchStr += ' ' + (p.category || '');
      }

      const hay = normalize(searchStr);

      // "ÉS" kapcsolat ellenőrzése
      let ok = true;
      for (let t of tokens) {
        if (!hay.includes(t)) { ok = false; break; }
      }

      if (ok) matches.push(p);
    }

    const total = matches.length;

    // --- LAPOZÁS ÉS VÁLASZ ---
    const start = (page - 1) * limit;
    const end = start + limit;

    const pageResults = matches.slice(start, end).map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      price: p.price,
      thumb: p.thumb,
      url: p.url,
      img: p.img,
      category: p.category,
      sale_price: p.sale_price,
      sale_start: p.sale_start,
      sale_end: p.sale_end,
      short_description: p.short_description,
      status: p.status
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        q: qRaw,
        desc_search: searchInDesc,
        cat_search: searchInCat, // Visszajelezzük debug célból
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
      headers,
      body: JSON.stringify({ error: err.message || String(err) })
    };
  }
};
