/**
 * femictec controller
 */

import { factories } from '@strapi/strapi';

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
  };

  const clauses: Record<string, unknown>[] = [];
  const search = normalizeText(query.q);
  const escola = normalizeText(query.escola);
  const area = normalizeText(query.area);
  const participantesMin = normalizeInteger(query.participantesMin);
  const participantesMax = normalizeInteger(query.participantesMax);

  if (search) {
    clauses.push(buildTextSearchFilter(['titulo', 'escola', 'area'], escapeSearch(search)));
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
    clauses.push(buildTextSearchFilter(['titulo', 'edicao', 'categoria'], escapeSearch(search)));
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

const normalizeProject = (item: unknown) => {
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
    titulo?: unknown;
    descricao?: unknown;
    edicao?: unknown;
    categoria?: unknown;
    imagem?: unknown;
    arquivo?: unknown;
  };

  return {
    id: normalizeInteger(result.id),
    documentId: normalizeText(result.documentId),
    titulo: normalizeText(result.titulo),
    descricao: Array.isArray(result.descricao) ? result.descricao : [],
    edicao: normalizeText(result.edicao),
    categoria: normalizeText(result.categoria),
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
    'escola',
    'area',
    'participantes',
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

    const where = { publishedAt: { $notNull: true } };
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
      ? items.map(normalizeProject).filter((item): item is NonNullable<ReturnType<typeof normalizeProject>> => item !== null)
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
      data: normalizeProject(item),
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
}));
