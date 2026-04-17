/**
 * banner controller
 */

import { factories } from '@strapi/strapi';

type BannerEntity = {
  Imagem?: unknown;
  imagem?: unknown;
  [key: string]: unknown;
};

const ensureMediaPopulate = (query: Record<string, unknown>) => {
  if (query.populate == null) {
    query.populate = { Imagem: true };
    return;
  }

  if (query.populate === '*') {
    return;
  }

  if (Array.isArray(query.populate)) {
    if (!query.populate.includes('Imagem')) {
      query.populate.push('Imagem');
    }
    return;
  }

  if (typeof query.populate === 'object') {
    query.populate = {
      ...(query.populate as Record<string, unknown>),
      Imagem: true,
    };
  }
};

const withImagemAlias = (entry: BannerEntity | null | undefined): BannerEntity | null | undefined => {
  if (!entry || typeof entry !== 'object') {
    return entry;
  }

  if (entry.imagem == null && entry.Imagem != null) {
    return { ...entry, imagem: entry.Imagem };
  }

  return entry;
};

export default factories.createCoreController('api::banner.banner', () => ({
  async find(ctx) {
    ensureMediaPopulate(ctx.query as Record<string, unknown>);

    const response = await super.find(ctx);

    if (Array.isArray(response?.data)) {
      response.data = response.data.map((entry) => withImagemAlias(entry as BannerEntity));
    }

    return response;
  },

  async findOne(ctx) {
    ensureMediaPopulate(ctx.query as Record<string, unknown>);

    const response = await super.findOne(ctx);

    if (response?.data) {
      response.data = withImagemAlias(response.data as BannerEntity);
    }

    return response;
  },
}));
