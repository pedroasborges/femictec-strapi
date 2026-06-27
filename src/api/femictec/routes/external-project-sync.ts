export default {
  routes: [
    {
      method: 'POST',
      path: '/femictec/external-projects/sync',
      handler: 'femictec.syncExternalProjects',
      config: {
        auth: false,
      },
    },
  ],
};
