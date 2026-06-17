/**
 * noticia controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::noticia.noticia', ({ strapi }) => ({
  async find(ctx) {
    ctx.query = {
      ...ctx.query,
      populate: {
        imagem: true,
      },
    };

    return super.find(ctx);
  },

  async findOne(ctx) {
    ctx.query = {
      ...ctx.query,
      populate: {
        imagem: true,
      },
    };

    return super.findOne(ctx);
  },
}));
