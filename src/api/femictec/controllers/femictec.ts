/**
 * femictec controller
 */

import { factories } from '@strapi/strapi';
import {
  syncExternalProjects,
  type ExternalProjectsIntegrationFilters,
} from '../utils/external-sync';

const DATE_PATTERN = /(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})/;
const PROJECT_UID = 'api::projeto.projeto';
const RESULT_UID = 'api::resultado.resultado';
const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 50;

const parseDateFromText = (value?: string | null): Date | null => {
  if (!value) {
    return null;
  }

  const match = value.match(DATE_PATTERN);
  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day, 23, 59, 59));

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

const resolveStatus = (submissionDeadline?: string | null) => {
  if (!submissionDeadline) {
    return 'active';
  }

  const parsed = parseDateFromText(submissionDeadline);
  if (!parsed) {
    return 'active';
  }

  return new Date() > parsed ? 'submission_closed' : 'submission_open';
};

const normalizeText = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

const normalizeInteger = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isInteger(value) && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const normalized = Number.parseInt(value, 10);
  return Number.isInteger(normalized) && Number.isFinite(normalized) ? normalized : null;
};

const normalizeDecimal = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const normalized = Number.parseFloat(value);
  return Number.isFinite(normalized) ? normalized : null;
};

const escapeSearch = (value: string) => value.trim();

const sanitizeMedia = (value: unknown) => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const media = value as {
    url?: unknown;
    alternativeText?: unknown;
    caption?: unknown;
    name?: unknown;
    mime?: unknown;
    width?: unknown;
    height?: unknown;
    size?: unknown;
  };

  return {
    url: normalizeText(media.url) ?? null,
    alternativeText: normalizeText(media.alternativeText),
    caption: normalizeText(media.caption),
    name: normalizeText(media.name),
    mime: normalizeText(media.mime),
    width: typeof media.width === 'number' ? media.width : null,
    height: typeof media.height === 'number' ? media.height : null,
    size: typeof media.size === 'number' ? media.size : null,
  };
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

const buildPagination = (query: Record<string, unknown>) => {
  const requestedPage = normalizeInteger(query.page) ?? 1;
  const requestedPageSize = normalizeInteger(query.pageSize) ?? DEFAULT_PAGE_SIZE;
  const page = Math.max(1, requestedPage);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, requestedPageSize));

  return {
    page,
    pageSize,
    start: (page - 1) * pageSize,
    limit: pageSize,
  };
};

const buildTextSearchFilter = (fields: string[], value: string) => ({
  $or: fields.map((field) => ({
    [field]: {
      $containsi: value,
    },
  })),
});

const buildProjectsFilters = (query: Record<string, unknown>) => {
  const filters: Record<string, unknown> = {
    publishedAt: {
      $notNull: true,
    },
    publico: {
      $eq: true,
    },
  };

  const clauses: Record<string, unknown>[] = [];
  const search = normalizeText(query.q);
  const escola = normalizeText(query.escola);
  const area = normalizeText(query.area);
  const participantesMin = normalizeInteger(query.participantesMin);
  const participantesMax = normalizeInteger(query.participantesMax);

  if (search) {
    clauses.push(
      buildTextSearchFilter(
        ['titulo', 'resumo', 'escola', 'area', 'orientador', 'eventoNome', 'edicaoNome'],
        escapeSearch(search)
      )
    );
  }

  if (escola) {
    clauses.push({
      escola: {
        $containsi: escola,
      },
    });
  }

  if (area) {
    clauses.push({
      area: {
        $containsi: area,
      },
    });
  }

  if (participantesMin !== null || participantesMax !== null) {
    clauses.push({
      participantes: {
        ...(participantesMin !== null ? { $gte: participantesMin } : {}),
        ...(participantesMax !== null ? { $lte: participantesMax } : {}),
      },
    });
  }

  if (clauses.length > 0) {
    filters.$and = clauses;
  }

  return filters;
};

const buildResultsFilters = (query: Record<string, unknown>) => {
  const filters: Record<string, unknown> = {
    publishedAt: {
      $notNull: true,
    },
  };

  const clauses: Record<string, unknown>[] = [];
  const search = normalizeText(query.q);
  const edicao = normalizeText(query.edicao);
  const categoria = normalizeText(query.categoria);

  if (search) {
    clauses.push(
      buildTextSearchFilter(
        ['titulo', 'resumo', 'edicao', 'categoria', 'escola', 'area', 'orientador', 'conceitoFinal'],
        escapeSearch(search)
      )
    );
  }

  if (edicao) {
    clauses.push({
      edicao: {
        $containsi: edicao,
      },
    });
  }

  if (categoria) {
    clauses.push({
      categoria: {
        $containsi: categoria,
      },
    });
  }

  if (clauses.length > 0) {
    filters.$and = clauses;
  }

  return filters;
};

const normalizePublicProject = (item: unknown) => {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const project = item as {
    id?: unknown;
    documentId?: unknown;
    titulo?: unknown;
    descricao?: unknown;
    escola?: unknown;
    area?: unknown;
    participantes?: unknown;
    imagem?: unknown;
  };

  return {
    id: normalizeInteger(project.id),
    documentId: normalizeText(project.documentId),
    titulo: normalizeText(project.titulo),
    descricao: Array.isArray(project.descricao) ? project.descricao : [],
    escola: normalizeText(project.escola),
    area: normalizeText(project.area),
    participantes: normalizeInteger(project.participantes),
    imagem: sanitizeMedia(project.imagem),
  };
};

const normalizeResult = (item: unknown) => {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const result = item as {
    id?: unknown;
    documentId?: unknown;
    origemId?: unknown;
    titulo?: unknown;
    resumo?: unknown;
    descricao?: unknown;
    escola?: unknown;
    area?: unknown;
    orientador?: unknown;
    participantes?: unknown;
    participantesNomes?: unknown;
    edicao?: unknown;
    edicaoNome?: unknown;
    edicaoSlug?: unknown;
    categoria?: unknown;
    statusExterno?: unknown;
    avaliadoresNomes?: unknown;
    notaFinal?: unknown;
    conceitoFinal?: unknown;
    dataSubmissao?: unknown;
    fontePayload?: unknown;
    imagem?: unknown;
    arquivo?: unknown;
  };

  return {
    id: normalizeInteger(result.id),
    documentId: normalizeText(result.documentId),
    origemId: normalizeInteger(result.origemId),
    titulo: normalizeText(result.titulo),
    resumo: normalizeText(result.resumo),
    descricao: Array.isArray(result.descricao) ? result.descricao : [],
    escola: normalizeText(result.escola),
    area: normalizeText(result.area),
    orientador: normalizeText(result.orientador),
    participantes: normalizeInteger(result.participantes),
    participantesNomes: normalizeJson(result.participantesNomes),
    edicao: normalizeText(result.edicao),
    edicaoNome: normalizeText(result.edicaoNome),
    edicaoSlug: normalizeText(result.edicaoSlug),
    categoria: normalizeText(result.categoria),
    statusExterno: normalizeText(result.statusExterno),
    avaliadoresNomes: normalizeJson(result.avaliadoresNomes),
    notaFinal: normalizeDecimal(result.notaFinal),
    conceitoFinal: normalizeText(result.conceitoFinal),
    dataSubmissao: normalizeText(result.dataSubmissao),
    fontePayload: normalizeJson(result.fontePayload),
    imagem: sanitizeMedia(result.imagem),
    arquivo: sanitizeMedia(result.arquivo),
  };
};

const normalizeSort = (value: unknown, fallback: string) => {
  const sortValue = normalizeText(value);
  if (!sortValue) {
    return fallback;
  }

  const allowedFields = new Set([
    'publishedAt',
    'titulo',
    'origemId',
    'escola',
    'area',
    'participantes',
    'notaFinal',
    'dataSubmissao',
    'edicao',
    'categoria',
  ]);

  const [field, direction] = sortValue.split(':');
  if (!field || !allowedFields.has(field)) {
    return fallback;
  }

  const normalizedDirection = direction?.toLowerCase() === 'asc' ? 'asc' : 'desc';
  return `${field}:${normalizedDirection}`;
};

const extractSubmissionDeadline = (items: unknown): string | null => {
  if (!Array.isArray(items)) {
    return null;
  }

  const parsedItems = items.filter(
    (item): item is { atividade?: unknown; data?: unknown } =>
      typeof item === 'object' && item !== null
  );

  if (parsedItems.length === 0) {
    return null;
  }

  const preferred = parsedItems.find((item) => {
    const activity = normalizeText(item.atividade);
    if (!activity) {
      return false;
    }

    const normalized = activity.toLowerCase();
    return normalized.includes('inscri') || normalized.includes('submiss');
  });

  return normalizeText(preferred?.data) ?? normalizeText(parsedItems[0].data);
};

const normalizeActivity = (item: unknown) => {
  if (!item || typeof item !== 'object') {
    return {
      horario: null,
      titulo: null,
    };
  }

  const activity = item as { horario?: unknown; titulo?: unknown };

  return {
    horario: normalizeText(activity.horario),
    titulo: normalizeText(activity.titulo),
  };
};

const normalizeProgramacaoDia = (item: unknown) => {
  if (!item || typeof item !== 'object') {
    return {
      dia: null,
      data: null,
      atividades: [],
    };
  }

  const day = item as {
    dia?: unknown;
    data?: unknown;
    atividades?: unknown;
  };

  return {
    dia: normalizeText(day.dia),
    data: normalizeText(day.data),
    atividades: Array.isArray(day.atividades) ? day.atividades.map(normalizeActivity) : [],
  };
};

const normalizeBoolean = (value: unknown) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'y'].includes(normalized)) {
      return true;
    }
    if (['false', '0', 'no', 'n'].includes(normalized)) {
      return false;
    }
  }

  return null;
};

const normalizeSyncFilters = (body: Record<string, unknown>) => {
  const explicitFilters = body.filters;
  const source =
    explicitFilters && typeof explicitFilters === 'object' && !Array.isArray(explicitFilters)
      ? (explicitFilters as Record<string, unknown>)
      : body;

  const filters: ExternalProjectsIntegrationFilters = {};

  if (typeof source.project_name === 'string' && source.project_name.trim()) {
    filters.project_name = source.project_name.trim();
  }

  if (typeof source.event_id === 'number' && Number.isInteger(source.event_id)) {
    filters.event_id = source.event_id;
  }

  if (typeof source.event_name === 'string' && source.event_name.trim()) {
    filters.event_name = source.event_name.trim();
  }

  if (typeof source.edition_id === 'number' && Number.isInteger(source.edition_id)) {
    filters.edition_id = source.edition_id;
  }

  if (typeof source.edition_name === 'string' && source.edition_name.trim()) {
    filters.edition_name = source.edition_name.trim();
  }

  if (typeof source.advisor_name === 'string' && source.advisor_name.trim()) {
    filters.advisor_name = source.advisor_name.trim();
  }

  if (typeof source.participant_name === 'string' && source.participant_name.trim()) {
    filters.participant_name = source.participant_name.trim();
  }

  if (typeof source.research_area === 'string' && source.research_area.trim()) {
    filters.research_area = source.research_area.trim();
  }

  if (typeof source.result_score_min === 'number' && Number.isFinite(source.result_score_min)) {
    filters.result_score_min = source.result_score_min;
  }

  if (typeof source.result_score_max === 'number' && Number.isFinite(source.result_score_max)) {
    filters.result_score_max = source.result_score_max;
  }

  if (typeof source.result_concept === 'string' && source.result_concept.trim()) {
    filters.result_concept = source.result_concept.trim();
  }

  if (typeof source.evaluator_name === 'string' && source.evaluator_name.trim()) {
    filters.evaluator_name = source.evaluator_name.trim();
  }

  return filters;
};

export default factories.createCoreController('api::femictec.femictec', ({ strapi }) => ({
  async currentEvent(ctx) {
    const feira = await strapi.entityService.findMany('api::feira.feira', {
      populate: {
        visaoGeral: {
          fields: ['edicaoTitulo'],
        },
        cronograma: {
          fields: ['dataRealizacao'],
          populate: {
            cronogramaItens: {
              fields: ['atividade', 'data'],
            },
          },
        },
      },
      publicationState: 'live',
      limit: 1,
    });

    const feiraData = feira as {
      visaoGeral?: { edicaoTitulo?: string | null } | null;
      cronograma?: {
        dataRealizacao?: string | null;
        cronogramaItens?: unknown;
      } | null;
    } | null;

    const activeEdition = feiraData?.visaoGeral?.edicaoTitulo ?? null;
    const dates = feiraData?.cronograma?.dataRealizacao ?? null;
    const submissionDeadline = extractSubmissionDeadline(feiraData?.cronograma?.cronogramaItens);
    const status = resolveStatus(submissionDeadline);

    ctx.body = {
      data: {
        activeEdition,
        dates,
        status,
        submissionDeadline,
      },
    };
  },

  async stats(ctx) {
    const contentTypes = (strapi as typeof strapi & {
      contentTypes?: Record<string, unknown>;
    }).contentTypes;

    if (!contentTypes?.[PROJECT_UID]) {
      ctx.body = {
        data: {
          totalProjects: 0,
          totalSchools: 0,
          totalParticipants: 0,
          totalAreas: 0,
        },
      };
      return;
    }

    const where = {
      publishedAt: { $notNull: true },
      publico: { $eq: true },
    };
    const rows = await strapi.db.query(PROJECT_UID).findMany({
      where,
      select: ['escola', 'area', 'participantes'],
    });

    const schools = new Set<string>();
    const areas = new Set<string>();
    let participants = 0;

    for (const row of rows as Record<string, unknown>[]) {
      const school = normalizeText(row.escola);
      if (school) {
        schools.add(school.toLowerCase());
      }

      const area = normalizeText(row.area);
      if (area) {
        areas.add(area.toLowerCase());
      }

      if (typeof row.participantes === 'number' && Number.isFinite(row.participantes) && row.participantes > 0) {
        participants += row.participantes;
      }
    }

    ctx.body = {
      data: {
        totalProjects: rows.length,
        totalSchools: schools.size,
        totalParticipants: participants,
        totalAreas: areas.size,
      },
    };
  },

  async projects(ctx) {
    const query = ctx.query as Record<string, unknown>;
    const pagination = buildPagination(query);
    const sort = normalizeSort(query.sort, 'publishedAt:desc');
    const filters = buildProjectsFilters(query);

    const [items, total] = await Promise.all([
      strapi.entityService.findMany(PROJECT_UID, {
        filters,
        populate: {
          imagem: true,
        },
        sort: sort as any,
        start: pagination.start,
        limit: pagination.limit,
      } as any),
      strapi.entityService.count(PROJECT_UID, {
        filters,
      } as any),
    ]);

    const data = Array.isArray(items)
      ? items
          .map(normalizePublicProject)
          .filter((item): item is NonNullable<ReturnType<typeof normalizePublicProject>> => item !== null)
      : [];

    ctx.body = {
      data,
      meta: {
        pagination: {
          page: pagination.page,
          pageSize: pagination.pageSize,
          pageCount: total === 0 ? 0 : Math.ceil(total / pagination.pageSize),
          total,
        },
      },
    };
  },

  async project(ctx) {
    const id = normalizeInteger(ctx.params.id);
    if (id === null) {
      ctx.status = 400;
      ctx.body = {
        error: {
          status: 400,
          name: 'ValidationError',
          message: 'ID invalido.',
        },
      };
      return;
    }

    const items = await strapi.entityService.findMany(PROJECT_UID, {
      filters: {
        id,
        publishedAt: {
          $notNull: true,
        },
        publico: {
          $eq: true,
        },
      },
      populate: {
        imagem: true,
      },
      limit: 1,
    } as any);

    const item = Array.isArray(items) ? items[0] : null;

    if (!item) {
      ctx.status = 404;
      ctx.body = {
        error: {
          status: 404,
          name: 'NotFoundError',
          message: 'Projeto nao encontrado.',
        },
      };
      return;
    }

    ctx.body = {
      data: normalizePublicProject(item),
    };
  },

  async results(ctx) {
    const query = ctx.query as Record<string, unknown>;
    const pagination = buildPagination(query);
    const sort = normalizeSort(query.sort, 'publishedAt:desc');
    const filters = buildResultsFilters(query);

    const [items, total] = await Promise.all([
      strapi.entityService.findMany(RESULT_UID, {
        filters,
        populate: {
          imagem: true,
          arquivo: true,
        },
        sort: sort as any,
        start: pagination.start,
        limit: pagination.limit,
      } as any),
      strapi.entityService.count(RESULT_UID, {
        filters,
      } as any),
    ]);

    const data = Array.isArray(items)
      ? items.map(normalizeResult).filter((item): item is NonNullable<ReturnType<typeof normalizeResult>> => item !== null)
      : [];

    ctx.body = {
      data,
      meta: {
        pagination: {
          page: pagination.page,
          pageSize: pagination.pageSize,
          pageCount: total === 0 ? 0 : Math.ceil(total / pagination.pageSize),
          total,
        },
      },
    };
  },

  async schedule(ctx) {
    const feira = await strapi.entityService.findMany('api::feira.feira', {
      populate: {
        visaoGeral: {
          fields: ['edicaoTitulo'],
        },
        programacao: {
          fields: ['programacaoTitulo'],
          populate: {
            programacaoDias: {
              fields: ['dia', 'data'],
              populate: {
                atividades: {
                  fields: ['horario', 'titulo'],
                },
              },
            },
          },
        },
      },
      publicationState: 'live',
      limit: 1,
    });

    const feiraData = feira as {
      visaoGeral?: { edicaoTitulo?: string | null } | null;
      programacao?: {
        programacaoTitulo?: string | null;
        programacaoDias?: unknown;
      } | null;
    } | null;

    const activeEdition = feiraData?.visaoGeral?.edicaoTitulo ?? null;
    const programacaoTitulo = feiraData?.programacao?.programacaoTitulo ?? null;
    const programacaoDias = Array.isArray(feiraData?.programacao?.programacaoDias)
      ? feiraData.programacao.programacaoDias.map(normalizeProgramacaoDia)
      : [];

    ctx.body = {
      data: {
        activeEdition,
        programacaoTitulo,
        programacaoDias,
      },
    };
  },

  async syncExternalProjects(ctx) {
    const expectedSecret = normalizeText(process.env.FEMICTEC_SYNC_SECRET);
    const providedSecret = normalizeText(
      (ctx.request.headers['x-femictec-sync-secret'] as string | undefined) ??
        (ctx.request.headers['x-sync-secret'] as string | undefined)
    );

    if (!expectedSecret) {
      ctx.status = 500;
      ctx.body = {
        error: {
          status: 500,
          name: 'ConfigurationError',
          message: 'FEMICTEC_SYNC_SECRET nao configurado.',
        },
      };
      return;
    }

    if (!providedSecret || providedSecret !== expectedSecret) {
      ctx.status = 401;
      ctx.body = {
        error: {
          status: 401,
          name: 'UnauthorizedError',
          message: 'Segredo invalido para sincronizacao.',
        },
      };
      return;
    }

    const requestBody = (ctx.request.body ?? {}) as Record<string, unknown>;
    const filters = normalizeSyncFilters(requestBody);
    const pageSize = normalizeInteger(requestBody.pageSize ?? requestBody.page_size) ?? undefined;
    const maxPages = normalizeInteger(requestBody.maxPages ?? requestBody.max_pages) ?? undefined;
    const syncResultsValue = normalizeBoolean(requestBody.syncResults ?? requestBody.sync_results);
    const syncResults = syncResultsValue !== null ? syncResultsValue : true;

    try {
      const summary = await syncExternalProjects(strapi, {
        filters,
        pageSize,
        maxPages,
        syncResults,
      });

      ctx.body = {
        data: {
          ...summary,
          syncResults,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao sincronizar dados externos.';
      ctx.status = 502;
      ctx.body = {
        error: {
          status: 502,
          name: 'BadGatewayError',
          message,
        },
      };
    }
  },
}));
