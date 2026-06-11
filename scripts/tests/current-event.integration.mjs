import assert from 'node:assert/strict';

const baseUrl = process.env.API_BASE_URL ?? 'http://127.0.0.1:1337';
const endpoint = `${baseUrl}/api/public/femictec/current-event`;

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
  assert.deepEqual(Object.keys(body).sort(), ['data'], 'Response must expose only `data`');
  assert.ok(body.data && typeof body.data === 'object', 'Response must contain `data` object');
  assert.deepEqual(
    Object.keys(body.data).sort(),
    ['activeEdition', 'dates', 'status', 'submissionDeadline'],
    'Unexpected keys in `data`',
  );

  const { activeEdition, dates, status, submissionDeadline } = body.data;

  const allowedStatuses = ['active', 'submission_open', 'submission_closed'];
  assert.equal(
    typeof status,
    'string',
    '`data.status` must be a string',
  );
  assert.ok(
    allowedStatuses.includes(status),
    `Unexpected status "${status}". Allowed: ${allowedStatuses.join(', ')}`,
  );

  assert.ok(
    activeEdition === null || typeof activeEdition === 'string',
    '`data.activeEdition` must be string or null',
  );
  assert.ok(
    dates === null || typeof dates === 'string',
    '`data.dates` must be string or null',
  );
  assert.ok(
    submissionDeadline === null || typeof submissionDeadline === 'string',
    '`data.submissionDeadline` must be string or null',
  );

  console.log(`PASS current-event integration (${endpoint})`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
