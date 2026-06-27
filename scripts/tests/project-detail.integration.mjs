import assert from 'node:assert/strict';

const baseUrl = process.env.API_BASE_URL ?? 'http://127.0.0.1:1337';
const missingEndpoint = `${baseUrl}/api/public/femictec/projects/999999999`;
const listEndpoint = `${baseUrl}/api/public/femictec/projects?page=1&pageSize=1&sort=publishedAt:desc`;

const allowedKeys = new Set([
  'id',
  'documentId',
  'titulo',
  'descricao',
  'escola',
  'area',
  'participantes',
  'imagem',
]);

async function fetchJson(endpoint, expectedStatus = 200) {
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

  assert.equal(response.status, expectedStatus, `Expected ${expectedStatus} from ${endpoint}, received ${response.status}`);
  return response.json();
}

async function run() {
  const missingBody = await fetchJson(missingEndpoint, 404);
  assert.ok(missingBody && typeof missingBody === 'object', '404 response body must be an object');
  assert.ok(missingBody.error && typeof missingBody.error === 'object', '404 payload must expose `error`');

  const listBody = await fetchJson(listEndpoint, 200);
  assert.ok(listBody && typeof listBody === 'object', 'List response body must be an object');
  assert.ok(Array.isArray(listBody.data), '`data` must be an array');

  if (listBody.data.length === 0) {
    console.log(
      `SKIP project-detail integration (${listEndpoint}): no public projects available in this environment`,
    );
    return;
  }

  const sourceProject = listBody.data[0];
  assert.ok(sourceProject && typeof sourceProject === 'object', 'List item must be an object');
  assert.equal(typeof sourceProject.id, 'number', 'List item must expose a numeric `id`');

  const detailEndpoint = `${baseUrl}/api/public/femictec/projects/${sourceProject.id}`;
  const detailBody = await fetchJson(detailEndpoint, 200);

  assert.ok(detailBody && typeof detailBody === 'object', 'Detail response body must be an object');
  assert.ok(detailBody.data && typeof detailBody.data === 'object', 'Detail response must expose `data`');

  for (const key of Object.keys(detailBody.data)) {
    assert.ok(allowedKeys.has(key), `Unexpected project field "${key}"`);
  }

  assert.deepEqual(
    Object.keys(detailBody.data).sort(),
    Array.from(allowedKeys).sort(),
    'Detail response must expose only the allowed public project fields',
  );

  assert.equal(detailBody.data.id, sourceProject.id, 'Detail response id must match the list item id');

  console.log(`PASS project-detail integration (${detailEndpoint})`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
