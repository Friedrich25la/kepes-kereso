const fs = require('fs');
const path = require('path');

let CACHE = null;
let CACHE_TS = 0;
const CACHE_TTL = 1000 * 60 * 5; // 5 perc cache
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 500; // Biztonsági korlát

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
  // 1. BIZTONSÁG & CORS
  // ----------------------------------------------------------------
  const origin = event.headers.origin || event.headers.Origin;

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
    const qRaw = (event.queryStringParameters?.q || '').trim();
    const page = Math.max(1, Number(event.queryStringParameters?.page) || 1);
    let limit = Math.max(1, Number(event.queryStringParameters?.limit) || DEFAULT_LIMIT);
    if (limit > MAX_LIMIT) limit = MAX_LIMIT;

    if (!qRaw || qRaw.length < 1) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Query param "q" required (min length 1).' }),
      };
    }

    // ----------------------------------------------------------------
    // 2. ADATBÁZIS BETÖLTÉSE
    // ----------------------------------------------------------------
    if (!CACHE || (Date.now() - CACHE_TS) > CACHE_TTL) {
      // FONTOS: Ellenőrizd, hogy a json fájl neve itt helyes-e!
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

    const matches = [];
    for (let i = 0; i < data.length; i++) {
      const p = data[i];
      
      // JAVÍTÁS 1: A rövid leírást is belevesszük a keresésbe!
      // Így ha valaki a leírásban lévő szóra keres, azt is megtalálja.
      const searchStr = (p.name || '') + ' ' + (p.sku || '') + ' ' + (p.category || '') + ' ' + (p.short_description || '');
      const hay = normalize(searchStr);
      
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

    // JAVÍTÁS 2: ITT VOLT A HIBA!
    // Hozzáadtam az új mezőket (sale_*, short_description), hogy a szerver visszaküldje őket.
    const pageResults = matches.slice(start, end).map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      price: p.price,
      thumb: p.thumb,
      url: p.url,
      img: p.img,
      category: p.category,
      
      // --- ÚJ MEZŐK ---
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
