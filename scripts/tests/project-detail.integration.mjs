import assert from 'node:assert/strict';

const baseUrl = process.env.API_BASE_URL ?? 'http://127.0.0.1:1337';
const endpoint = `${baseUrl}/api/public/femictec/projects/999999999`;

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

  assert.equal(response.status, 404, `Expected 404 from ${endpoint}, received ${response.status}`);

  const body = await response.json();
  assert.ok(body && typeof body === 'object', 'Response body must be an object');
  assert.ok(body.error && typeof body.error === 'object', 'Error payload must be present');

  console.log(`PASS project-detail integration (${endpoint})`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
