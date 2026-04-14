# Scripts de automacao

Este diretorio contem scripts para acelerar fluxo local + nuvem sem alterar codigo da aplicacao.

## Comandos disponiveis
- `npm run ops:pull`: atualiza branch e sobe Docker (`build + up -d + ps`).
- `npm run ops:push -- --message "..."`: faz `git add/commit/push`.
- `npm run ops:deploy -- --host ... --user ... --repo ...`: faz deploy remoto por SSH.
- `npm run ops:push-deploy -- --message "..." --host ... --user ... --repo ...`: fluxo completo.
- `npm run test:scripts`: testa a montagem dos fluxos.

## Exemplos
Atualizar servidor/local:
```bash
npm run ops:pull -- --branch main --deploy-env-file .env.production
```

Enviar alteracoes para git:
```bash
npm run ops:push -- --message "chore: atualiza deploy scripts"
```

Deploy em nuvem OSI:
```bash
npm run ops:deploy -- --host 10.13.33.13 --user deploy --repo git@github.com:org/femictec.git --branch main --deploy-env-file .env.production --path /opt/femictec
```

Fluxo completo:
```bash
npm run ops:push-deploy -- --message "chore: release" --host 10.13.33.13 --user deploy --repo git@github.com:org/femictec.git --branch main --deploy-env-file .env.production --path /opt/femictec
```

## Modo de seguranca
Use `--dry-run` em qualquer script para ver os comandos sem executar.

