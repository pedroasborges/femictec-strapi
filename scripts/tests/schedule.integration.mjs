import assert from 'node:assert/strict';

const baseUrl = process.env.API_BASE_URL ?? 'http://127.0.0.1:1337';
const endpoint = `${baseUrl}/api/public/femictec/schedule`;

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
    ['activeEdition', 'programacaoDias', 'programacaoTitulo'],
    'Unexpected keys in `data`',
  );

  const { activeEdition, programacaoTitulo, programacaoDias } = body.data;

  assert.ok(
    activeEdition === null || typeof activeEdition === 'string',
    '`data.activeEdition` must be string or null',
  );
  assert.ok(
    programacaoTitulo === null || typeof programacaoTitulo === 'string',
    '`data.programacaoTitulo` must be string or null',
  );
  assert.ok(Array.isArray(programacaoDias), '`data.programacaoDias` must be an array');

  for (const day of programacaoDias) {
    assert.ok(day && typeof day === 'object', 'Each schedule day must be an object');
    assert.deepEqual(
      Object.keys(day).sort(),
      ['atividades', 'data', 'dia'],
      'Unexpected keys in schedule day',
    );
    assert.ok(day.dia === null || typeof day.dia === 'string', '`day.dia` must be string or null');
    assert.ok(
      day.data === null || typeof day.data === 'string',
      '`day.data` must be string or null',
    );
    assert.ok(Array.isArray(day.atividades), '`day.atividades` must be an array');

    for (const activity of day.atividades) {
      assert.ok(activity && typeof activity === 'object', 'Each activity must be an object');
      assert.deepEqual(
        Object.keys(activity).sort(),
        ['horario', 'titulo'],
        'Unexpected keys in activity',
      );
      assert.ok(
        activity.horario === null || typeof activity.horario === 'string',
        '`activity.horario` must be string or null',
      );
      assert.ok(
        activity.titulo === null || typeof activity.titulo === 'string',
        '`activity.titulo` must be string or null',
      );
    }
  }

  console.log(`PASS schedule integration (${endpoint})`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
