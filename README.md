# FEMICTEC Strapi

Backend CMS da FEMICTEC em Strapi 5, responsavel pelos conteudos institucionais e pelas APIs consumidas pelo projeto `femictec_app`.

## Visao geral

O projeto usa o padrao nativo do Strapi para:

- `collection types` para listas e itens repetiveis;
- `single types` para paginas e blocos unicos;
- componentes para agrupar campos relacionados;
- rotas publicas customizadas para contratos especificos do frontend.

## Como executar

### Desenvolvimento local

```bash
npm install
npm run develop
```

Por padrao, o ambiente local usa SQLite, configurado em `.env` / `.env.example`.

### Build de producao

```bash
npm run build
npm run start
```

## Configuracoes de ambiente

Arquivos principais:

- `.env.example`: referencia para desenvolvimento local
- `.env.production.example`: referencia para Docker / producao

Variaveis importantes:

- `APP_KEYS`
- `API_TOKEN_SALT`
- `ADMIN_JWT_SECRET`
- `TRANSFER_TOKEN_SALT`
- `JWT_SECRET`
- `ENCRYPTION_KEY`
- `EMAIL_PROVIDER` para o envio de e-mails pelo Strapi
- `EMAIL_DEFAULT_FROM` para o remetente padrao
- `EMAIL_DEFAULT_REPLY_TO` para a resposta padrao
- `DATABASE_CLIENT_LOCAL` para desenvolvimento
- `DATABASE_CLIENT` para producao
- `EXTERNAL_PROJECTS_API_URL` para integracao externa
- `EXTERNAL_PROJECTS_API_TOKEN` para autenticacao na plataforma externa
- `EXTERNAL_PROJECTS_API_METHOD` para forcar `POST`, `GET` ou deixar `AUTO`
- `FEMICTEC_SYNC_SECRET` para proteger a sincronizacao manual interna

Onde o token deve ser adicionado:

- no Strapi local, em `.env` como `EXTERNAL_PROJECTS_API_TOKEN`
- em producao, no segredo de ambiente do servidor, com o mesmo nome
- no teste de integracao externo, via variavel de ambiente do terminal antes de executar `npm run test:integration:external-projects`
- nunca dentro do codigo-fonte ou de arquivos versionados

Bloco de exemplo para o `.env`:

```env
EXTERNAL_PROJECTS_API_URL=https://plataforma-external.example.com
EXTERNAL_PROJECTS_API_TOKEN=coloque_o_token_aqui
EMAIL_PROVIDER=nodemailer
EMAIL_SMTP_HOST=127.0.0.1
EMAIL_SMTP_PORT=25
EMAIL_SMTP_SECURE=false
EMAIL_SMTP_IGNORE_TLS=true
EMAIL_DEFAULT_FROM=nao-responder@femictec.com.br
EMAIL_DEFAULT_REPLY_TO=nao-responder@femictec.com.br
EXTERNAL_PROJECTS_API_METHOD=AUTO
FEMICTEC_SYNC_SECRET=coloque_o_segredo_de_sync_aqui
```

Bloco de exemplo para producao:

```env
EXTERNAL_PROJECTS_API_URL=https://plataforma-external.example.com
EXTERNAL_PROJECTS_API_TOKEN=troque_no_servidor
EMAIL_PROVIDER=nodemailer
EMAIL_SMTP_HOST=mail.suaempresa.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_SECURE=false
EMAIL_SMTP_IGNORE_TLS=false
EMAIL_DEFAULT_FROM=nao-responder@femictec.com.br
EMAIL_DEFAULT_REPLY_TO=nao-responder@femictec.com.br
EXTERNAL_PROJECTS_API_METHOD=AUTO
FEMICTEC_SYNC_SECRET=troque_no_servidor
```

Guia passo a passo da integracao externa:

- veja [docs/INTEGRACAO-EXTERNA-PLATAFORMA-CONNECTA.md](./docs/INTEGRACAO-EXTERNA-PLATAFORMA-CONNECTA.md)
- guia de e-mail de producao: [docs/CONFIGURACAO-EMAIL-PRODUCAO-STRAPI.md](./docs/CONFIGURACAO-EMAIL-PRODUCAO-STRAPI.md)

No desenvolvimento, o projeto usa `sqlite` por padrao. Em producao, o padrao e `postgres`.

## Conteudos principais

### APIs de conteudo

- `Home - Banner` - collection type - endpoint `/api/banners`
- `Feira` - single type - endpoint `/api/feira`
- `Global - Footer` - single type - endpoint `/api/footer`
- `Home - Datas` - single type - endpoint `/api/home-data`
- `Eventos_Feira` - collection type - endpoint `/api/eventos-feiras`
- `Noticia` - collection type - endpoint `/api/noticias`
- `Projeto` - collection type - endpoint `/api/projetos`
- `Resultado` - collection type - endpoint `/api/resultados`
- `Termo de Uso` - single type - endpoint `/api/termo-de-uso`
- `Regulamento` - single type - endpoint `/api/regulamento`
- `Politica de Privacidade` - single type - endpoint `/api/politica-de-privacidade`
- `Localizacao` - single type - endpoint `/api/localizacao`
- `Home - Dado Institucional` - single type - endpoint `/api/dado-institucional`
- `Contato` - single type - endpoint `/api/contato`
- `Mensagens de Contato` - collection type - endpoint `/api/mensagens-contatos`
- `Edicao Galeria` - collection type - endpoint `/api/edicao-galerias`

### Noticia

Campos de data preparados no Strapi:

- `slug`: identificador publico usado no link da noticia;
- `dataPublicacao`: recebe a data de criacao da noticia e fica imutavel;
- `dataUltimaEdicao`: recebe a data da ultima edicao;

Observacao:

- o editor pode definir `dataPublicacao` apenas no primeiro salvamento;
- depois disso, a data fica fixa e nao sofre nova alteracao manual;
- se a noticia nunca for editada depois da criacao, `dataUltimaEdicao` fica igual a `dataPublicacao`;
- nao existe mais agendamento por campo proprio nesta noticia.

### Projeto e Resultado

Os conteudos de `Projeto` e `Resultado` sao sincronizados a partir da plataforma externa informada na integracao desta conversa.
`Resultado` pode ser derivado do mesmo retorno externo de projetos, filtrando apenas itens com `final_result_score` ou `final_result_concept`.

Sincronizacao manual interna:

- `POST /api/femictec/external-projects/sync`
- requer o header `x-femictec-sync-secret`
- aceita filtros como `project_name`, `event_name` e `edition_name`
- nao publica automaticamente os registros no site
- a integracao externa pode responder tanto em `POST` quanto em `GET`; por padrao o Strapi tenta `POST` e faz fallback para `GET` em modo `AUTO`

Teste de integracao dedicado:

- `npm run test:integration:external-projects`
- requer `EXTERNAL_PROJECTS_API_URL` e `EXTERNAL_PROJECTS_API_TOKEN`
- valida o contrato da Plataforma Conecta usado na importacao

### Contato e envio de mensagem

Fluxo de formulario do site:

- `POST /api/mensagens-contatos/submit`
- grava a mensagem em `Mensagens de Contato`
- envia um e-mail para os destinatarios configurados no `Contato`
- envia uma confirmacao para o e-mail informado pelo usuario

Campos esperados no `POST`:

- `nome`
- `email`
- `assunto`
- `mensagem`

Configuracao de e-mail:

- use `EMAIL_PROVIDER=nodemailer` para SMTP no Windows, apontando para o servidor local de teste ou o SMTP real do servidor;
- para testes locais com `smtp4dev`, use `EMAIL_SMTP_HOST=127.0.0.1`, `EMAIL_SMTP_PORT=25` e `EMAIL_SMTP_IGNORE_TLS=true`;
- `EMAIL_DEFAULT_FROM` e `EMAIL_DEFAULT_REPLY_TO` funcionam como fallback;
- o e-mail principal do `Contato` continua sendo a fonte de destinatarios e remetente principal.

Exemplo de consumo no `nextJs`:

```ts
await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/mensagens-contatos/submit`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    nome,
    email,
    assunto,
    mensagem,
  }),
});
```

No frontend:

- valide os campos antes do `fetch`;
- mostre uma mensagem de sucesso somente apos resposta `201`;
- em caso de erro, exiba o retorno vindo do Strapi;
- nao tente enviar e-mail direto do browser.

Resumo do modelo:

- `origemId`: id unico da fonte externa;
- `titulo` e `resumo`: dados base importados da plataforma;
- `escola`, `area`, `orientador` e `participantesNomes`: informacoes consolidadas do projeto;
- `eventoNome`, `eventoSlug`, `edicaoNome`, `edicaoSlug`: referencia da edicao de origem;
- `statusExterno`, `notaFinal`, `conceitoFinal`, `dataSubmissao` e `fontePayload`: rastreio e auditoria da importacao;
- `descricao`, `imagem`, `arquivo` e `categoria`: campos editoriais locais.

Regra de exibicao publica:

- o Strapi so envia para o site registros com `publishedAt` preenchido;
- o status externo nao substitui a publicacao administrativa;
- o registro pode ser importado da plataforma externa, mas continua controlado pelo fluxo editorial do CMS.

### Estrutura da Home

O conteudo `Home - Datas` foi modelado para edicao simples no Strapi:

- `tituloSecao`
- `etapa1Titulo` + `etapa1Data`
- `etapa2Titulo` + `etapa2Data`
- `etapa3Titulo` + `etapa3Data`

## Endpoints publicos customizados

### Current Event

```http
GET /api/public/femictec/current-event
```

Retorno em `data`:

- `activeEdition`: `string | null`
- `dates`: `string | null`
- `status`: `active | submission_open | submission_closed`
- `submissionDeadline`: `string | null`

### Schedule

```http
GET /api/public/femictec/schedule
```

Retorno em `data`:

- `activeEdition`: `string | null`
- `programacaoTitulo`: `string | null`
- `programacaoDias`: `array`

Cada item de `programacaoDias` contem:

- `dia`: `string | null`
- `data`: `string | null`
- `atividades`: `array`

Cada item de `atividades` contem:

- `horario`: `string | null`
- `titulo`: `string | null`

### Stats

```http
GET /api/public/femictec/stats
```

Retorno em `data`:

- `totalProjects`: `number`
- `totalSchools`: `number`
- `totalParticipants`: `number`
- `totalAreas`: `number`

Campos usados na agregacao de `Projeto`:

- `escola`
- `area`
- `participantes`

Regras de agregacao:

- `totalProjects`: total de projetos publicados
- `totalSchools`: quantidade de escolas distintas normalizadas em lowercase
- `totalParticipants`: soma de `participantes`
- `totalAreas`: quantidade de areas distintas normalizadas em lowercase

### Projects

```http
GET /api/public/femictec/projects
GET /api/public/femictec/projects/:id
```

Regras:

- lista apenas projetos publicados e liberados pela administracao da FEMICTEC;
- retorna paginação no formato `meta.pagination`;
- aceita filtros por `q`, `escola`, `area`, `participantesMin`, `participantesMax`;
- aceita ordenacao via `sort`, com `publishedAt:desc` como padrão;
- o detalhe retorna somente os campos permitidos para exibicao publica.

Campos publicos de projeto:

- `id`
- `documentId`
- `titulo`
- `descricao`
- `escola`
- `area`
- `participantes`
- `imagem`

### Results

```http
GET /api/public/femictec/results
```

Regras:

- lista apenas resultados apos publicacao administrativa explicita;
- retorna paginação no formato `meta.pagination`;
- aceita filtros por `q`, `edicao`, `categoria`;
- aceita ordenacao via `sort`, com `publishedAt:desc` como padrão;
- nao expõe conteudo fora do contrato publico.

Campos publicos de resultado:

- `id`
- `documentId`
- `titulo`
- `descricao`
- `edicao`
- `categoria`
- `imagem`
- `arquivo`

## Permissoes necessarias no Public

No Strapi Admin:

`Settings -> Users & Permissions Plugin -> Roles -> Public`

Habilitar no minimo:

- `api::banner.banner.find`
- `api::banner.banner.findOne`
- `api::footer.footer.find`
- `api::footer.footer.findOne`

Os endpoints customizados `public/femictec/*` usam `auth: false` e nao dependem da permissao padrão do plugin para serem consumidos.

## Validacao rapida

```bash
curl "http://127.0.0.1:1337/api/banners?populate=*"
curl "http://127.0.0.1:1337/api/feira"
curl "http://127.0.0.1:1337/api/footer"
curl "http://127.0.0.1:1337/api/home-data"
curl "http://127.0.0.1:1337/api/public/femictec/current-event"
curl "http://127.0.0.1:1337/api/public/femictec/schedule"
curl "http://127.0.0.1:1337/api/public/femictec/stats"
curl "http://127.0.0.1:1337/api/public/femictec/projects?page=1&pageSize=5"
curl "http://127.0.0.1:1337/api/public/femictec/projects/1"
curl "http://127.0.0.1:1337/api/public/femictec/results?page=1&pageSize=5"
```

Esperado:

- `banners`: `200` com a imagem preenchida.
- `feira`: `200` com os componentes da feira.
- `footer`: `200` se o registro estiver publicado.
- `home-data`: `200` com os campos da home.
- `current-event`: `200` com o contrato publico esperado.
- `schedule`: `200` com a programacao publica da edicao atual.
- `stats`: `200` com os totais agregados.
- `projects`: `200` com paginação e lista vazia ou itens publicados.
- `projects/:id`: `200` para um registro publicado ou `404` para id inexistente.
- `results`: `200` com paginação e lista vazia ou itens publicados.

## Testes

Scripts disponiveis:

- `npm run test:scripts`
- `npm run test:integration:current-event`
- `npm run test:integration:stats`
- `npm run test:integration:projects`
- `npm run test:integration:project-detail`
- `npm run test:integration:results`
- `npm run test:integration:schedule`
- `npm run test:all`

Observacao:

- Os testes de integracao exigem a API Strapi rodando localmente ou `API_BASE_URL` apontando para um backend ativo.

## Deploy com Docker

Veja o guia completo em [DEPLOY-DOCKER.md](./DEPLOY-DOCKER.md).

## Documentacao de uso

Para orientacao de edicao e operacao do CMS, consulte:

- [Guia de Usabilidade do Strapi](./docs/USABILIDADE-STRAPI.md)
- [Registro de Testes Operacionais](./docs/OPERACOES-STRAPI.md)




