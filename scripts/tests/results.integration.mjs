import assert from 'node:assert/strict';

const baseUrl = process.env.API_BASE_URL ?? 'http://127.0.0.1:1337';
const endpoint = `${baseUrl}/api/public/femictec/results?page=1&pageSize=5&sort=publishedAt:desc`;

async function run() {
  let response;
  try {
    response = await fetch(endpoint);
  } catch (error) {
    console.error(`FAIL request ${endpoint}`);
    console.error(
      'Could not connect to API. Start Strapi first (ex: `npm run develop`) or set `API_BASE_URL`.',
    );
    throw error;
  }

  assert.equal(response.status, 200, `Expected 200 from ${endpoint}, received ${response.status}`);

  const body = await response.json();

  assert.ok(body && typeof body === 'object', 'Response body must be an object');
  assert.deepEqual(Object.keys(body).sort(), ['data', 'meta'], 'Response must expose `data` and `meta`');
  assert.ok(Array.isArray(body.data), '`data` must be an array');
  assert.ok(body.meta && typeof body.meta === 'object', '`meta` must be an object');
  assert.ok(body.meta.pagination && typeof body.meta.pagination === 'object', '`meta.pagination` must be an object');

  const allowedKeys = new Set([
    'id',
    'documentId',
    'titulo',
    'descricao',
    'edicao',
    'categoria',
    'imagem',
    'arquivo',
  ]);

  for (const item of body.data) {
    assert.ok(item && typeof item === 'object', 'Each result item must be an object');
    for (const key of Object.keys(item)) {
      assert.ok(allowedKeys.has(key), `Unexpected result field "${key}"`);
    }
  }

  console.log(`PASS results integration (${endpoint})`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
