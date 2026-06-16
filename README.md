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
- `DATABASE_CLIENT_LOCAL` para desenvolvimento
- `DATABASE_CLIENT` para producao

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

- `dataPublicacao`: recebe a data de criacao da noticia e fica imutavel;
- `dataUltimaEdicao`: recebe a data da ultima edicao;

Observacao:

- o editor pode definir `dataPublicacao` apenas no primeiro salvamento;
- depois disso, a data fica fixa e nao sofre nova alteracao manual;
- se a noticia nunca for editada depois da criacao, `dataUltimaEdicao` fica igual a `dataPublicacao`;
- nao existe mais agendamento por campo proprio nesta noticia.

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




