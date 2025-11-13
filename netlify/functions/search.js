// netlify/functions/search.js
// Node 16/18 compatible Netlify Function (CommonJS)
// Reads JSON from S3 (if configured), caches in memory, and serves search requests.
// ENV required: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET, S3_KEY, AWS_REGION, ALLOWED_ORIGIN
const AWS = require('aws-sdk');

const MAX_RESULTS = 50;
const CACHE_TTL_MS = Number(process.env.FN_CACHE_TTL_MS || 5 * 60 * 1000); // 5 minutes default

let cache = { ts: 0, data: null, error: null };

const s3Key = process.env.S3_KEY || 'products_with_status_min.json';
const bucket = process.env.S3_BUCKET || '';
const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';

// helper: strip diacritics basic
function stripDiacriticsSimple(s) {
  if (!s) return '';
  const map = { 'á': 'a', 'Á': 'A', 'é': 'e', 'É': 'E', 'í': 'i', 'Í': 'I', 'ó': 'o', 'Ó': 'O', 'ö': 'o', 'Ö': 'O', 'ő': 'o', 'Ő': 'O', 'ú': 'u', 'Ú': 'U', 'ü': 'u', 'Ü': 'U', 'ű': 'u', 'Ű': 'U' };
  return s.replace(/[ÁáÉéÍíÓóÖöŐőÚúÜüŰű]/g, ch => map[ch] || ch);
}

function normalizeText(s) {
  if (!s) return '';
  try {
    let n = stripDiacriticsSimple(String(s));
    n = n.normalize ? n.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : n;
    return n.toLowerCase().replace(/[^a-z0-9]+/gi, ' ').trim();
  } catch (e) {
    return String(s).toLowerCase();
  }
}

// load data (from S3 if configured)
async function loadData() {
  const now = Date.now();
  if (cache.data && (now - cache.ts) < CACHE_TTL_MS) {
    return cache.data;
  }

  if (bucket) {
    try {
      const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || undefined,
      });
      const params = { Bucket: bucket, Key: s3Key };
      const res = await s3.getObject(params).promise();
      const raw = res.Body.toString('utf8');
      const parsed = JSON.parse(raw);
      parsed.forEach(p => {
        p.__norm_name = normalizeText(p.name || '');
        p.__norm_sku = (stripDiacriticsSimple(String(p.sku || ''))).toLowerCase().replace(/[^a-z0-9]+/g, '');
        p.__name_words = (p.__norm_name || '').split(/\s+/).filter(Boolean);
        p.__status = (typeof p.status !== 'undefined') ? ((p.status === '0' || p.status === 0) ? 0 : Number(p.status) || 1) : null;
      });
      cache = { ts: now, data: parsed, error: null };
      return parsed;
    } catch (err) {
      cache = { ts: now, data: null, error: err.toString() };
      throw err;
    }
  }

  throw new Error('No S3 bucket configured (set S3_BUCKET env).');
}

function simpleMatches(product, q) {
  if (!q) return false;
  const MIN_TOKEN_LEN = 3;
  let nq = stripDiacriticsSimple(q);
  nq = nq.normalize ? nq.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : nq;
  nq = nq.toLowerCase();
  const tokens = nq.split(/\s+/).map(t => t.trim()).filter(Boolean);
  if (!tokens.length) return false;

  const name = product.__norm_name || (product.name || '').toString().toLowerCase();
  const sku = product.__norm_sku || (product.sku || '').toString().toLowerCase();

  return tokens.every(tk => {
    if (tk.length < MIN_TOKEN_LEN) return false;
    return name.indexOf(tk) !== -1 || sku.indexOf(tk.replace(/[^a-z0-9]+/g, '')) !== -1;
  });
}

function scoreForRelevance(p, q) {
  const tokens = (q || '').toString().toLowerCase().split(/\s+/).filter(Boolean);
  let score = 0;
  const nameWords = p.__name_words || ((p.__norm_name || '').split(/\s+/).filter(Boolean));
  const sku = p.__norm_sku || '';
  tokens.forEach(tk => {
    if (!tk || tk.length < 3) return;
    for (let w = 0; w < nameWords.length; w++) {
      if (nameWords[w] === tk) score += 50;
      else if (nameWords[w].indexOf(tk) === 0) score += 30;
      else if (nameWords[w].indexOf(tk) !== -1) score += 15;
    }
    if (sku && sku.indexOf(tk.replace(/[^a-z0-9]+/g, '')) !== -1) score += 20;
  });
  score += Math.max(0, 10 - (nameWords.length || 0));
  return score;
}

exports.handler = async function (event, context) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  const params = (event.queryStringParameters) ? event.queryStringParameters : {};
  const q = (params.q || '').trim();
  const sort = (params.sort || 'relevance');
  const imgOnly = (params.imgOnly === '1' || params.imgOnly === 'true' || params.imgOnly === 'yes');
  const limit = Math.min(Number(params.limit) || MAX_RESULTS, 250);

  if (!q || q.length < 3) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Query parameter "q" required (min length 3).' }),
    };
  }

  let data;
  try {
    data = await loadData();
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to load product data', detail: (cache && cache.error) || err.toString() }),
    };
  }

  let matches = (data || []).filter(p => {
    if (p.__status === 0) return false;
    if (typeof p.status !== 'undefined' && (p.status === 0 || p.status === '0')) return false;
    if (!simpleMatches(p, q)) return false;
    if (imgOnly) {
      const imgField = p.img || p.images || p.photo || '';
      const imgs = ('' + (imgField || '')).split(/\||,|;|\n/).map(x => x.trim()).filter(Boolean);
      if (!imgs.length) return false;
    }
    return true;
  });

  if (sort === 'relevance') {
    matches = matches.map(p => { p.__score = scoreForRelevance(p, q); return p; });
    matches.sort((a, b) => (b.__score || 0) - (a.__score || 0));
  } else if (sort === 'price_asc' || sort === 'price_desc') {
    matches.sort((a, b) => {
      const na = Number(a.price) || 0, nb = Number(b.price) || 0;
      return sort === 'price_asc' ? (na - nb) : (nb - na);
    });
  } else if (sort === 'name_asc' || sort === 'name_desc') {
    matches.sort((a, b) => {
      const na = (a.name || '').toLowerCase(), nb = (b.name || '').toLowerCase();
      if (na < nb) return sort === 'name_asc' ? -1 : 1;
      if (na > nb) return sort === 'name_asc' ? 1 : -1;
      return 0;
    });
  }

  matches = matches.slice(0, Math.min(limit, MAX_RESULTS)).map(p => ({
    id: p.id || p.sku || null,
    name: p.name || '',
    sku: p.sku || '',
    price: p.price || '',
    img: p.img || p.images || '',
    url: p.url || p.product_url || '',
    __score: p.__score || 0
  }));

  return { statusCode: 200, headers, body: JSON.stringify({ count: matches.length, results: matches }) };
};
