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
  ],
};
