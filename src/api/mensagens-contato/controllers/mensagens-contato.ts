/**
 * mensagens-contato controller
 */

import { factories } from '@strapi/strapi';
import { submitContactMessage } from '../utils/notification-mail';

export default factories.createCoreController('api::mensagens-contato.mensagens-contato', ({ strapi }) => ({
  async submit(ctx) {
    try {
      const result = await submitContactMessage(strapi, (ctx.request.body ?? {}) as Record<string, unknown>);

      if (result.error) {
        ctx.status = result.status;
        ctx.body = {
          error: {
            status: result.status,
            name: result.status === 400 ? 'ValidationError' : 'ApplicationError',
            message: result.error,
          },
        };
        return;
      }

      ctx.status = result.status;
      ctx.body = {
        data: {
          id: (result.data as { id?: number } | null)?.id ?? null,
          nome: (result.data as { nome?: string } | null)?.nome ?? null,
          email: (result.data as { email?: string } | null)?.email ?? null,
          assunto: (result.data as { assunto?: string } | null)?.assunto ?? null,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao enviar mensagem de contato.';
      strapi.log.error(`[mensagens-contato] ${message}`);
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
