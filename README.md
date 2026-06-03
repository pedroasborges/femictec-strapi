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

- `Banner` - collection type - endpoint `/api/banners`
- `Feira` - single type - endpoint `/api/feira`
- `Footer` - single type - endpoint `/api/footer`
- `Datas da Home` - single type - endpoint `/api/home-data`
- `Eventos_Feira` - collection type - endpoint `/api/eventos-feiras`
- `Noticia` - collection type - endpoint `/api/noticias`
- `Termo de Uso` - single type - endpoint `/api/termo-de-uso`
- `Regulamento` - single type - endpoint `/api/regulamento`
- `Politica de Privacidade` - single type - endpoint `/api/politica-de-privacidade`
- `Localizacao` - single type - endpoint `/api/localizacao`
- `Dado Institucional` - single type - endpoint `/api/dado-institucional`
- `Contato` - single type - endpoint `/api/contato`
- `Mensagens de Contato` - collection type - endpoint `/api/mensagens-contatos`
- `Edicao Galeria` - collection type - endpoint `/api/edicao-galerias`

### Estrutura da Home

O conteudo `Datas da Home` foi modelado para edicao simples no Strapi:

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

## Permissoes necessarias no Public

No Strapi Admin:

`Settings -> Users & Permissions Plugin -> Roles -> Public`

Habilitar no minimo:

- `api::banner.banner.find`
- `api::banner.banner.findOne`
- `api::footer.footer.find`
- `api::footer.footer.findOne`

Se o frontend consumir outros conteudos publicos, libere tambem as permissoes correspondentes.

## Validacao rapida

```bash
curl "http://127.0.0.1:1337/api/banners?populate=*"
curl "http://127.0.0.1:1337/api/feira"
curl "http://127.0.0.1:1337/api/footer"
curl "http://127.0.0.1:1337/api/home-data"
curl "http://127.0.0.1:1337/api/public/femictec/current-event"
curl "http://127.0.0.1:1337/api/public/femictec/stats"
```

Esperado:

- `banners`: `200` com a imagem preenchida.
- `feira`: `200` com os componentes da feira.
- `footer`: `200` se o registro estiver publicado.
- `home-data`: `200` com os campos da home.
- `current-event`: `200` com o contrato publico esperado.
- `stats`: `200` com os totais agregados.

## Testes

Scripts disponiveis:

- `npm run test:scripts`
- `npm run test:integration:current-event`
- `npm run test:integration:stats`
- `npm run test:all`

Observacao:

- Os testes de integracao exigem a API Strapi rodando localmente ou `API_BASE_URL` apontando para um backend ativo.

## Deploy com Docker

Veja o guia completo em [DEPLOY-DOCKER.md](./DEPLOY-DOCKER.md).

## Documentacao de uso

Para orientacao de edicao e operacao do CMS, consulte:

- [Guia de Usabilidade do Strapi](./docs/USABILIDADE-STRAPI.md)
- [Registro de Testes Operacionais](./docs/OPERACOES-STRAPI.md)
