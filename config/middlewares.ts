import type { Core } from '@strapi/strapi';
// config/middlewares.js
module.exports = [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', 'res.cloudinary.com', 'localhost:1337', '127.0.0.1:1337'],
          // DIRETIVAS ESSENCIAIS PARA O IFRAME DO YOUTUBE:
          'frame-src': ["'self'", 'https://www.youtube.com', 'https://youtube.com'],
          'child-src': ["'self'", 'https://www.youtube.com', 'https://youtube.com'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];