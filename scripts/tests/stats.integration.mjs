import assert from 'node:assert/strict';

const baseUrl = process.env.API_BASE_URL ?? 'http://127.0.0.1:1337';
const endpoint = `${baseUrl}/api/public/femictec/stats`;

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

  assert.equal(
    response.status,
    200,
    `Expected 200 from ${endpoint}, received ${response.status}`,
  );

  const body = await response.json();

  assert.ok(body && typeof body === 'object', 'Response body must be an object');
  assert.ok(body.data && typeof body.data === 'object', 'Response must contain `data` object');

  const { totalProjects, totalSchools, totalParticipants, totalAreas } = body.data;

  const numberFields = {
    totalProjects,
    totalSchools,
    totalParticipants,
    totalAreas,
  };

  for (const [key, value] of Object.entries(numberFields)) {
    assert.equal(typeof value, 'number', `\`data.${key}\` must be a number`);
    assert.ok(Number.isFinite(value), `\`data.${key}\` must be finite`);
    assert.ok(value >= 0, `\`data.${key}\` must be >= 0`);
  }

  console.log(`PASS stats integration (${endpoint})`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
