/**
 * femictec controller
 */

import { factories } from '@strapi/strapi';

const DATE_PATTERN = /(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})/;

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

export default factories.createCoreController('api::femictec.femictec', ({ strapi }) => ({
  async currentEvent(ctx) {
    const feira = await strapi.entityService.findMany('api::feira.feira', {
      fields: ['edicaoTitulo', 'dataRealizacao', 'cronogramaItens'],
      publicationState: 'live',
      limit: 1,
    });

    const activeEdition = feira?.edicaoTitulo ?? null;
    const dates = feira?.dataRealizacao ?? null;
    const submissionDeadline = feira?.cronogramaItens ?? null;
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
    const projetoUid = 'api::projeto.projeto';
    const where = { publishedAt: { $notNull: true } };

    const totalProjects = await strapi.db.query(projetoUid).count({ where });
    const rows = await strapi.db.query(projetoUid).findMany({
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
        totalProjects,
        totalSchools: schools.size,
        totalParticipants: participants,
        totalAreas: areas.size,
      },
    };
  },
}));
