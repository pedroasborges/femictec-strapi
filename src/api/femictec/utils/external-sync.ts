const DEFAULT_PAGE_SIZE = 50;
const MIN_PAGE_SIZE = 1;
const MAX_PAGE_SIZE = 200;
const DEFAULT_EXTERNAL_METHOD = 'AUTO';
const EXTERNAL_PROJECTS_PATH = 'integrations/projects';

const PROJECT_UID = 'api::projeto.projeto';
const RESULT_UID = 'api::resultado.resultado';

const normalizeText = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeInteger = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isInteger(value) && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && Number.isFinite(parsed) ? parsed : null;
};

const normalizeDecimal = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeJson = (value: unknown) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (value && typeof value === 'object') {
    return value;
  }

  return null;
};

export type ExternalProjectsIntegrationFilters = {
  project_name?: string;
  event_id?: number;
  event_name?: string;
  edition_id?: number;
  edition_name?: string;
  advisor_name?: string;
  participant_name?: string;
  research_area?: string;
  result_score_min?: number;
  result_score_max?: number;
  result_concept?: string;
  evaluator_name?: string;
};

export type ExternalProjectsIntegrationEvent = {
  id?: number;
  name?: string;
  slug?: string;
};

export type ExternalProjectsIntegrationEdition = {
  id?: number;
  name?: string;
  slug?: string;
};

export type ExternalProjectsIntegrationItem = {
  project_id?: number;
  title?: string;
  research_area?: string;
  summary?: string;
  status?: string;
  school_name?: string;
  advisor_name?: string;
  participant_names?: unknown;
  evaluator_names?: unknown;
  event?: ExternalProjectsIntegrationEvent;
  edition?: ExternalProjectsIntegrationEdition;
  final_result_score?: number | string;
  final_result_concept?: string;
  submitted_at?: string;
};

export type ExternalProjectsIntegrationResponse = {
  items?: ExternalProjectsIntegrationItem[];
  page?: number;
  page_size?: number;
  total?: number;
};

const extractText = (value: unknown): string | null => {
  if (typeof value === 'string') {
    return normalizeText(value);
  }

  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  return (
    normalizeText(record.name) ??
    normalizeText(record.title) ??
    normalizeText(record.label) ??
    normalizeText(record.titulo) ??
    normalizeText(record.value)
  );
};

const normalizeStringList = (value: unknown): string[] | null => {
  if (Array.isArray(value)) {
    const items = value
      .map((item) => extractText(item))
      .filter((item): item is string => Boolean(item));

    return items.length > 0 ? items : null;
  }

  if (typeof value === 'string') {
    const items = value
      .split(/[,;|]/)
      .map((item) => item.trim())
      .filter(Boolean);

    return items.length > 0 ? items : null;
  }

  const text = extractText(value);
  return text ? [text] : null;
};

const buildBaseProjectData = (item: Record<string, unknown>) => {
  const participantNames = normalizeStringList(item.participant_names);
  const event = item.event && typeof item.event === 'object' ? (item.event as Record<string, unknown>) : null;
  const edition = item.edition && typeof item.edition === 'object' ? (item.edition as Record<string, unknown>) : null;
  const finalResultScore = normalizeDecimal(item.final_result_score);
  const finalResultConcept = normalizeText(item.final_result_concept);

  return {
    origemId: normalizeInteger(item.project_id),
    titulo: normalizeText(item.title),
    resumo: normalizeText(item.summary),
    escola: normalizeText(item.school_name),
    area: normalizeText(item.research_area),
    orientador: normalizeText(item.advisor_name),
    participantesNomes: participantNames,
    participantes: participantNames?.length ?? 0,
    eventoNome: normalizeText(event?.name),
    eventoSlug: normalizeText(event?.slug),
    edicaoNome: normalizeText(edition?.name),
    edicaoSlug: normalizeText(edition?.slug),
    statusExterno: normalizeText(item.status),
    notaFinal: finalResultScore,
    conceitoFinal: finalResultConcept,
    dataSubmissao: normalizeText(item.submitted_at),
    fontePayload: item,
  };
};

const buildResultData = (item: Record<string, unknown>) => {
  const participantNames = normalizeStringList(item.participant_names);
  const evaluators = normalizeStringList(item.evaluator_names);
  const edition = item.edition && typeof item.edition === 'object' ? (item.edition as Record<string, unknown>) : null;

  return {
    origemId: normalizeInteger(item.project_id),
    titulo: normalizeText(item.title),
    resumo: normalizeText(item.summary),
    escola: normalizeText(item.school_name),
    area: normalizeText(item.research_area),
    orientador: normalizeText(item.advisor_name),
    participantesNomes: participantNames,
    participantes: participantNames?.length ?? 0,
    edicao: normalizeText(edition?.name) ?? normalizeText(edition?.slug),
    edicaoNome: normalizeText(edition?.name),
    edicaoSlug: normalizeText(edition?.slug),
    statusExterno: normalizeText(item.status),
    avaliadoresNomes: evaluators,
    notaFinal: normalizeDecimal(item.final_result_score),
    conceitoFinal: normalizeText(item.final_result_concept),
    dataSubmissao: normalizeText(item.submitted_at),
    fontePayload: item,
  };
};

const upsertByOrigemId = async (strapi: any, uid: string, origemId: number, data: Record<string, unknown>) => {
  const existing = await strapi.db.query(uid).findOne({
    where: { origemId },
    select: ['id'],
  });

  if (existing) {
    await strapi.entityService.update(uid, existing.id, {
      data,
    });
    return 'updated' as const;
  }

  await strapi.entityService.create(uid, {
    data,
  });
  return 'created' as const;
};

const parsePageSize = (value: unknown) => {
  const parsed = normalizeInteger(value);
  if (parsed === null) {
    return DEFAULT_PAGE_SIZE;
  }

  return Math.min(MAX_PAGE_SIZE, Math.max(MIN_PAGE_SIZE, parsed));
};

const buildRequestBody = (page: number, pageSize: number, filters: ExternalProjectsIntegrationFilters) => {
  const body: Record<string, unknown> = {
    page,
    page_size: pageSize,
  };

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      body[key] = value;
    }
  }

  return body;
};

type ExternalProjectsApiMethod = 'POST' | 'GET' | 'AUTO';

const normalizeExternalMethod = (value: unknown): ExternalProjectsApiMethod => {
  const method = normalizeText(value)?.toUpperCase();

  if (method === 'GET' || method === 'POST' || method === 'AUTO') {
    return method;
  }

  return DEFAULT_EXTERNAL_METHOD as ExternalProjectsApiMethod;
};

const getExternalMethodPlan = (): ExternalProjectsApiMethod[] => {
  const configuredMethod = normalizeExternalMethod(process.env.EXTERNAL_PROJECTS_API_METHOD);

  if (configuredMethod === 'AUTO') {
    return ['POST', 'GET'];
  }

  return [configuredMethod];
};

const buildExternalProjectsUrl = (
  baseUrl: string,
  page: number,
  pageSize: number,
  filters: ExternalProjectsIntegrationFilters
) => {
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const endpoint = new URL(EXTERNAL_PROJECTS_PATH, normalizedBaseUrl);
  endpoint.searchParams.set('page', String(page));
  endpoint.searchParams.set('page_size', String(pageSize));

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }

    endpoint.searchParams.set(key, typeof value === 'string' ? value : JSON.stringify(value));
  }

  return endpoint;
};

const parseExternalProjectsPayload = async (response: Response) => {
  const rawBody = await response.text();

  if (!rawBody.trim()) {
    return {} as ExternalProjectsIntegrationResponse;
  }

  try {
    return JSON.parse(rawBody) as ExternalProjectsIntegrationResponse;
  } catch {
    throw new Error(`Resposta externa invalida: ${rawBody}`);
  }
};

const extractExternalItems = (payload: ExternalProjectsIntegrationResponse) => payload.items ?? [];

const extractExternalPageSize = (payload: ExternalProjectsIntegrationResponse, fallback: number) =>
  normalizeInteger(payload.page_size) ?? fallback;

const extractExternalTotal = (payload: ExternalProjectsIntegrationResponse) =>
  normalizeInteger(payload.total);

const requestExternalProjectsPage = async (
  baseUrl: string,
  token: string,
  page: number,
  pageSize: number,
  filters: ExternalProjectsIntegrationFilters,
  method: ExternalProjectsApiMethod
) => {
  const endpoint = buildExternalProjectsUrl(baseUrl, page, pageSize, filters);
  const requestInit: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  if (method === 'POST') {
    requestInit.headers = {
      ...requestInit.headers,
      'Content-Type': 'application/json',
    };
    requestInit.body = JSON.stringify(buildRequestBody(page, pageSize, filters));
  }

  const response = await fetch(endpoint, requestInit);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Falha ao consultar integracao externa via ${method} (${response.status} ${response.statusText}): ${errorText}`
    );
  }

  return parseExternalProjectsPayload(response);
};

const fetchExternalProjectsPage = async (
  page: number,
  pageSize: number,
  filters: ExternalProjectsIntegrationFilters
) => {
  const baseUrl = normalizeText(process.env.EXTERNAL_PROJECTS_API_URL);
  const token = normalizeText(process.env.EXTERNAL_PROJECTS_API_TOKEN);

  if (!baseUrl) {
    throw new Error('EXTERNAL_PROJECTS_API_URL nao configurada.');
  }

  if (!token) {
    throw new Error('EXTERNAL_PROJECTS_API_TOKEN nao configurado.');
  }

  const methods = getExternalMethodPlan();
  let lastError: Error | null = null;

  for (const method of methods) {
    try {
      return await requestExternalProjectsPage(baseUrl, token, page, pageSize, filters, method);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Falha desconhecida na integracao externa.');
    }
  }

  throw lastError ?? new Error('Falha ao consultar integracao externa.');
};

export type ExternalProjectSyncOptions = {
  filters?: ExternalProjectsIntegrationFilters;
  pageSize?: number;
  maxPages?: number;
  syncResults?: boolean;
};

export type ExternalProjectSyncSummary = {
  pagesFetched: number;
  totalSourceItems: number;
  projectsCreated: number;
  projectsUpdated: number;
  projectsSkipped: number;
  resultsCreated: number;
  resultsUpdated: number;
  resultsSkipped: number;
};

export const syncExternalProjects = async (
  strapi: any,
  options: ExternalProjectSyncOptions = {}
): Promise<ExternalProjectSyncSummary> => {
  const pageSize = parsePageSize(options.pageSize);
  const maxPages = Math.max(1, options.maxPages ?? 1000);
  const syncResults = options.syncResults !== false;
  const filters = options.filters ?? {};

  const summary: ExternalProjectSyncSummary = {
    pagesFetched: 0,
    totalSourceItems: 0,
    projectsCreated: 0,
    projectsUpdated: 0,
    projectsSkipped: 0,
    resultsCreated: 0,
    resultsUpdated: 0,
    resultsSkipped: 0,
  };

  let currentPage = 1;
  let total = 0;

  while (currentPage <= maxPages) {
    const payload = await fetchExternalProjectsPage(currentPage, pageSize, filters);
    const items = extractExternalItems(payload);
    const responsePageSize = extractExternalPageSize(payload, pageSize);
    const responseTotal = extractExternalTotal(payload);

    if (responseTotal !== null) {
      total = responseTotal;
      summary.totalSourceItems = responseTotal;
    } else {
      summary.totalSourceItems += items.length;
    }

    summary.pagesFetched += 1;

    for (const rawItem of items) {
      if (!rawItem || typeof rawItem !== 'object') {
        summary.projectsSkipped += 1;
        continue;
      }

      const item = rawItem as Record<string, unknown>;
      const projectData = buildBaseProjectData(item);

      if (projectData.origemId === null || projectData.titulo === null) {
        summary.projectsSkipped += 1;
        continue;
      }

      const projectAction = await upsertByOrigemId(strapi, PROJECT_UID, projectData.origemId, projectData);
      if (projectAction === 'created') {
        summary.projectsCreated += 1;
      } else {
        summary.projectsUpdated += 1;
      }

      const shouldSyncResult =
        syncResults &&
        (projectData.notaFinal !== null || projectData.conceitoFinal !== null);

      if (!shouldSyncResult) {
        summary.resultsSkipped += 1;
        continue;
      }

      const resultData = buildResultData(item);
      if (resultData.origemId === null || resultData.titulo === null) {
        summary.resultsSkipped += 1;
        continue;
      }

      const resultAction = await upsertByOrigemId(strapi, RESULT_UID, resultData.origemId, resultData);
      if (resultAction === 'created') {
        summary.resultsCreated += 1;
      } else {
        summary.resultsUpdated += 1;
      }
    }

    const isLastPage =
      (total > 0 && currentPage * responsePageSize >= total) || items.length < responsePageSize;

    if (isLastPage) {
      break;
    }

    currentPage += 1;
  }

  return summary;
};
