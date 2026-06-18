import 'dotenv/config';
import assert from 'node:assert/strict';

const baseUrl = process.env.EXTERNAL_PROJECTS_API_URL;
const token = process.env.EXTERNAL_PROJECTS_API_TOKEN;
const configuredMethod = (process.env.EXTERNAL_PROJECTS_API_METHOD || 'AUTO').trim().toUpperCase();
const methodPlan = configuredMethod === 'GET' || configuredMethod === 'POST' ? [configuredMethod] : ['POST', 'GET'];

if (!baseUrl) {
  throw new Error(
    'Falta o URL da API EXTERNAL_PROJECTS_API. Defina-o para o URL base da Plataforma Conecta antes de executar este teste.',
  );
}

if (!token) {
  throw new Error(
    'O token EXTERNAL_PROJECTS_API_TOKEN está ausente. Defina-o com o token de integração da Plataforma Conecta antes de executar este teste.',
  );
}

const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
const endpoint = new URL('integrations/projects', normalizedBaseUrl);
const requestBody = {
  page: 1,
  page_size: 5,
  project_name: 'robotica',
  event_id: 1,
  event_name: 'femictec',
  edition_id: 11,
  edition_name: '2026',
  advisor_name: 'maria',
  participant_name: 'joao',
  research_area: 'tecnologia',
  result_score_min: 8.0,
  result_score_max: 10.0,
  result_concept: 'ouro',
  evaluator_name: 'carlos',
};

async function requestWithMethod(method) {
  const init = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  if (method === 'POST') {
    init.headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(requestBody);
  }

  return fetch(endpoint, init);
}

async function parseResponseBody(response) {
  const contentType = response.headers.get('content-type') || '';
  const rawBody = await response.text();

  if (!rawBody.trim()) {
    return { contentType, rawBody, body: null };
  }

  if (!contentType.includes('application/json')) {
    return { contentType, rawBody, body: null };
  }

  try {
    return { contentType, rawBody, body: JSON.parse(rawBody) };
  } catch (error) {
    throw new Error(
      `Resposta com content-type JSON, mas corpo invalido. Content-Type: ${contentType}. Trecho: ${rawBody.slice(0, 200)}`,
      { cause: error },
    );
  }
}

async function run() {
  let response;
  let lastError = null;

  for (const method of methodPlan) {
    try {
      response = await requestWithMethod(method);
      if (response.ok) {
        break;
      }

      const errorText = await response.text();
      lastError = new Error(
        `Falha ao consultar a API externa via ${method} (${response.status} ${response.statusText}): ${errorText}`,
      );
    } catch (error) {
      lastError = error;
    }
  }

  if (!response || !response.ok) {
    console.error(`FAIL request ${endpoint}`);
    console.error(
      'Não foi possível conectar à API externa. Verifique EXTERNAL_PROJECTS_API_URL, o acesso à rede e o token de portador.',
    );
    throw lastError || new Error('Falha ao consultar integracao externa.');
  }

  assert.equal(response.status, 200, `Expected 200 from ${endpoint}, received ${response.status}`);

  const parsed = await parseResponseBody(response);
  if (!parsed.body) {
    throw new Error(
      `A API externa respondeu com content-type "${parsed.contentType}" em vez de JSON. Trecho da resposta: ${parsed.rawBody.slice(0, 200)}`,
    );
  }

  const body = parsed.body;

  assert.ok(body && typeof body === 'object', 'Response body must be an object');
  assert.deepEqual(
    Object.keys(body).sort(),
    ['items', 'page', 'page_size', 'total'],
    'Response must expose exactly `items`, `page`, `page_size`, and `total`',
  );

  assert.ok(Array.isArray(body.items), '`items` must be an array');
  assert.equal(typeof body.page, 'number', '`page` must be a number');
  assert.equal(typeof body.page_size, 'number', '`page_size` must be a number');
  assert.equal(typeof body.total, 'number', '`total` must be a number');

  const allowedItemKeys = new Set([
    'project_id',
    'title',
    'research_area',
    'summary',
    'status',
    'school_name',
    'advisor_name',
    'participant_names',
    'evaluator_names',
    'event',
    'edition',
    'final_result_score',
    'final_result_concept',
    'submitted_at',
  ]);

  for (const item of body.items) {
    assert.ok(item && typeof item === 'object', 'Each item must be an object');
    for (const key of Object.keys(item)) {
      assert.ok(allowedItemKeys.has(key), `Unexpected item field "${key}"`);
    }

    assert.equal(typeof item.project_id, 'number', '`project_id` must be a number');
    assert.equal(typeof item.title, 'string', '`title` must be a string');
    assert.equal(typeof item.research_area, 'string', '`research_area` must be a string');
    assert.equal(typeof item.summary, 'string', '`summary` must be a string');
    assert.equal(typeof item.status, 'string', '`status` must be a string');
    assert.equal(typeof item.school_name, 'string', '`school_name` must be a string');
    assert.equal(typeof item.advisor_name, 'string', '`advisor_name` must be a string');
    assert.ok(Array.isArray(item.participant_names), '`participant_names` must be an array');
    assert.ok(Array.isArray(item.evaluator_names), '`evaluator_names` must be an array');
    assert.ok(item.event && typeof item.event === 'object', '`event` must be an object');
    assert.ok(item.edition && typeof item.edition === 'object', '`edition` must be an object');
    assert.ok(
      item.final_result_score === null || typeof item.final_result_score === 'number',
      '`final_result_score` must be a number or null',
    );
    assert.ok(
      item.final_result_concept === null || typeof item.final_result_concept === 'string',
      '`final_result_concept` must be a string or null',
    );
    assert.equal(typeof item.submitted_at, 'string', '`submitted_at` must be a string');

    assert.deepEqual(
      Object.keys(item.event).sort(),
      ['id', 'name', 'slug'],
      'Unexpected keys in `event` object',
    );
    assert.deepEqual(
      Object.keys(item.edition).sort(),
      ['id', 'name', 'slug'],
      'Unexpected keys in `edition` object',
    );

    assert.equal(typeof item.event.id, 'number', '`event.id` must be a number');
    assert.equal(typeof item.event.name, 'string', '`event.name` must be a string');
    assert.equal(typeof item.event.slug, 'string', '`event.slug` must be a string');
    assert.equal(typeof item.edition.id, 'number', '`edition.id` must be a number');
    assert.equal(typeof item.edition.name, 'string', '`edition.name` must be a string');
    assert.equal(typeof item.edition.slug, 'string', '`edition.slug` must be a string');
  }

  console.log(`PASS external projects integration (${endpoint})`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
