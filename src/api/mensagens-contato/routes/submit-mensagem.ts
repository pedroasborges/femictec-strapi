export default {
  routes: [
    {
      method: 'POST',
      path: '/mensagens-contatos/submit',
      handler: 'mensagens-contato.submit',
      config: {
        auth: false,
      },
    },
  ],
};
