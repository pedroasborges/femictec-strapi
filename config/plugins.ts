import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  email: {
    config: {
      provider: env('EMAIL_PROVIDER', 'nodemailer'),
      providerOptions: {
        ...(env('EMAIL_PROVIDER', 'nodemailer') === 'nodemailer'
          ? {
              host: env('EMAIL_SMTP_HOST', 'localhost'),
              port: env.int('EMAIL_SMTP_PORT', 25),
              secure: env.bool('EMAIL_SMTP_SECURE', false),
              ignoreTLS: env.bool('EMAIL_SMTP_IGNORE_TLS', true),
              auth:
                env('EMAIL_SMTP_USER') && env('EMAIL_SMTP_PASS')
                  ? {
                      user: env('EMAIL_SMTP_USER'),
                      pass: env('EMAIL_SMTP_PASS'),
                    }
                  : undefined,
              rejectUnauthorized: env.bool('EMAIL_SMTP_REJECT_UNAUTHORIZED', true),
            }
          : {
              sendmail: true,
              newline: 'unix',
              path: env('EMAIL_SENDMAIL_PATH', '/usr/sbin/sendmail'),
            }),
      },
      settings: {
        defaultFrom: env('EMAIL_DEFAULT_FROM', env('EMAIL_FROM', 'nao-responder@femictec.com.br')),
        defaultReplyTo: env('EMAIL_DEFAULT_REPLY_TO', env('EMAIL_FROM', 'nao-responder@femictec.com.br')),
      },
    },
  },
});

export default config;
