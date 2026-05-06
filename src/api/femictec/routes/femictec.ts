/**
 * femictec router
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/public/femictec/current-event',
      handler: 'femictec.currentEvent',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/public/femictec/stats',
      handler: 'femictec.stats',
      config: {
        auth: false,
      },
    },
  ],
};
