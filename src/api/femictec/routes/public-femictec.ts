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
    {
      method: 'GET',
      path: '/public/femictec/projects',
      handler: 'femictec.projects',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/public/femictec/projects/:id',
      handler: 'femictec.project',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/public/femictec/results',
      handler: 'femictec.results',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/public/femictec/schedule',
      handler: 'femictec.schedule',
      config: {
        auth: false,
      },
    },
  ],
};
