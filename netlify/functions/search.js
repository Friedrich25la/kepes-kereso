// netlify/functions/search.js

// 1. Az fs és path modulok importálása már nem szükséges.

// 2. Az adatbázis azonnali betöltése a require() segítségével.
// Ez biztosítja, hogy a Netlify beépítse a JSON-t a függvény csomagjába.
const CACHE = require('./_assets/products_with_status_min.json');

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 500; // ne engedj túl nagy lekérést egyszerre

function normalize(s = '') {
  try {
    let t = s.toString().toLowerCase();
    // egyszerű diakritika-eltávolítás
    t = t.normalize ? t.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : t;
    return t;
  } catch (e) { return (s||'').toString().toLowerCase(); }
}

exports.handler = async (event) => {
  try {
    const qRaw = (event.queryStringParameters?.q || '').trim();
    const page = Math.max(1, Number(event.queryStringParameters?.page) || 1);
    let limit = Math.max(1, Number(event.queryStringParameters?.limit) || DEFAULT_LIMIT);
    if (limit > MAX_LIMIT) limit = MAX_LIMIT;

    if (!qRaw || qRaw.length < 1) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Query param "q" required (min length 1).' }),
      };
    }

    // A cache beolvasás (fs.readFileSync) már nem szükséges,
    // mivel a CACHE az induláskor már betöltődött.
    const data = CACHE || [];

    const qnorm = normalize(qRaw);
    const tokens = qnorm.split(/\s+/).filter(Boolean);

    // filter: minden token szerepeljen a name vagy sku mezőben (AND)
    const matches = [];
    for (let i = 0; i < data.length; i++) {
      const p = data[i];
      const hay = normalize((p.name || '') + ' ' + (p.sku || ''));
      let ok = true;
      for (let t of tokens) {
        if (!hay.includes(t)) { ok = false; break; }
      }
      if (ok) matches.push(p);
    }

    const total = matches.length;

    // sort: lehetőség (relevancia vagy név) - itt alapból marad a találati sorrend
    const start = (page - 1) * limit;
    const end = start + limit;
    const pageResults = matches.slice(start, end).map(p => ({
      id: p.id, name: p.name, sku: p.sku, price: p.price, thumb: p.thumb, url: p.url
    }));

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
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
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message || String(err) })
    };
  }
};
