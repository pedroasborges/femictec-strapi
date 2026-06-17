const NOTICIA_UID = 'api::noticia.noticia';

const toIsoNow = () => new Date().toISOString();

const normalizeId = (value: unknown) => {
  if (typeof value === 'number' && Number.isInteger(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) ? parsed : null;
  }

  return null;
};

const slugify = (value: unknown) => {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized.length > 0 ? normalized : null;
};

const getPersistedNotice = async (strapi: any, id: unknown) => {
  const normalizedId = normalizeId(id);
  if (!strapi || normalizedId === null) {
    return null;
  }

  return strapi.db.query(NOTICIA_UID).findOne({
    where: { id: normalizedId },
    select: ['id', 'dataPublicacao', 'dataUltimaEdicao'],
  });
};

const syncPublicationDates = async (
  strapi: any,
  event: { params?: { data?: Record<string, unknown>; where?: { id?: unknown } } },
) => {
  const data = event.params?.data ?? {};
  const persisted = await getPersistedNotice(strapi, event.params?.where?.id);
  const now = toIsoNow();

  data.dataPublicacao = persisted?.dataPublicacao ?? data.dataPublicacao ?? now;
  data.dataUltimaEdicao = now;
};

const generateNoticeSlug = (event: { params?: { data?: Record<string, unknown> } }) => {
  const data = event.params?.data ?? {};
  if (typeof data.slug === 'string' && data.slug.trim().length > 0) {
    return;
  }

  const generated = slugify(data.titulo);
  if (generated) {
    data.slug = generated;
  }
};

const backfillNoticeDates = async (strapi: any) => {
  if (!strapi) {
    return 0;
  }

  const notices = await strapi.db.query(NOTICIA_UID).findMany({
    where: {
      dataPublicacao: {
        $null: true,
      },
    },
    select: ['id', 'createdAt', 'updatedAt'],
  });

  if (!Array.isArray(notices) || notices.length === 0) {
    return 0;
  }

  for (const notice of notices) {
    if (!notice || typeof notice !== 'object' || !('id' in notice) || typeof notice.id !== 'number') {
      continue;
    }

    const createdAt = notice.createdAt instanceof Date ? notice.createdAt : new Date(String(notice.createdAt));
    const updatedAt = notice.updatedAt instanceof Date ? notice.updatedAt : new Date(String(notice.updatedAt));
    const createdIso = Number.isNaN(createdAt.getTime()) ? toIsoNow() : createdAt.toISOString();
    const updatedIso = Number.isNaN(updatedAt.getTime()) ? createdIso : updatedAt.toISOString();

    await strapi.db.query(NOTICIA_UID).update({
      where: { id: notice.id },
      data: {
        dataPublicacao: createdIso,
        dataUltimaEdicao: updatedIso,
      },
    });
  }

  return notices.length;
};

const backfillNoticeSlugs = async (strapi: any) => {
  if (!strapi) {
    return 0;
  }

  const notices = await strapi.db.query(NOTICIA_UID).findMany({
    where: {
      slug: {
        $null: true,
      },
    },
    select: ['id', 'titulo'],
  });

  if (!Array.isArray(notices) || notices.length === 0) {
    return 0;
  }

  const usedSlugs = new Set<string>();

  for (const notice of notices) {
    if (!notice || typeof notice !== 'object' || !('id' in notice) || typeof notice.id !== 'number') {
      continue;
    }

    const baseSlug = slugify((notice as { titulo?: unknown }).titulo) ?? `noticia-${notice.id}`;
    let candidate = baseSlug;
    let suffix = 2;

    while (usedSlugs.has(candidate)) {
      candidate = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    usedSlugs.add(candidate);

    await strapi.db.query(NOTICIA_UID).update({
      where: { id: notice.id },
      data: {
        slug: candidate,
      },
    });
  }

  return notices.length;
};

export { backfillNoticeDates, backfillNoticeSlugs, generateNoticeSlug, syncPublicationDates };
