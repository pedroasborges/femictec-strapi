# Endpoints Existentes - API FEMICTEC

Documento de referencia dos endpoints expostos pelo backend e do contrato publico usado pelo frontend.

## 1. Endpoints publicos customizados

Definidos manualmente na rota `public-femictec` e implementados no controller `femictec`.

| Metodo | Endpoint | Arquivos de origem |
| --- | --- | --- |
| GET | `/api/public/femictec/current-event` | `src/api/femictec/routes/public-femictec.ts`, `src/api/femictec/controllers/femictec.ts` |
| GET | `/api/public/femictec/stats` | `src/api/femictec/routes/public-femictec.ts`, `src/api/femictec/controllers/femictec.ts` |
| GET | `/api/public/femictec/projects` | `src/api/femictec/routes/public-femictec.ts`, `src/api/femictec/controllers/femictec.ts` |
| GET | `/api/public/femictec/projects/:id` | `src/api/femictec/routes/public-femictec.ts`, `src/api/femictec/controllers/femictec.ts` |
| GET | `/api/public/femictec/results` | `src/api/femictec/routes/public-femictec.ts`, `src/api/femictec/controllers/femictec.ts` |
| GET | `/api/public/femictec/schedule` | `src/api/femictec/routes/public-femictec.ts`, `src/api/femictec/controllers/femictec.ts` |

### Estrutura de resposta

#### GET `/api/public/femictec/current-event`

```json
{
  "data": {
    "activeEdition": null,
    "dates": null,
    "status": "active",
    "submissionDeadline": null
  }
}
```

#### GET `/api/public/femictec/stats`

```json
{
  "data": {
    "totalProjects": 0,
    "totalSchools": 0,
    "totalParticipants": 0,
    "totalAreas": 0
  }
}
```

#### GET `/api/public/femictec/projects`

```json
{
  "data": [],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 12,
      "pageCount": 0,
      "total": 0
    }
  }
}
```

#### GET `/api/public/femictec/projects/:id`

```json
{
  "data": {
    "id": 1,
    "documentId": "example-document-id",
    "titulo": "Projeto exemplo",
    "descricao": [],
    "escola": null,
    "area": null,
    "participantes": 0,
    "imagem": null
  }
}
```

#### GET `/api/public/femictec/results`

```json
{
  "data": [],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 12,
      "pageCount": 0,
      "total": 0
    }
  }
}
```

#### GET `/api/public/femictec/schedule`

```json
{
  "data": {
    "activeEdition": null,
    "programacaoTitulo": null,
    "programacaoDias": []
  }
}
```

## 2. Endpoints padrao do Strapi

Gerados automaticamente por `createCoreRouter(...)`.

| Recurso | Tipo de conteudo | Endpoint base | Arquivos de configuracao |
| --- | --- | --- | --- |
| banner | Collection | `/api/banners` | `src/api/banner/routes/banner.ts`, `src/api/banner/content-types/banner/schema.json` |
| contato | Single | `/api/contato` | `src/api/contato/routes/contato.ts`, `src/api/contato/content-types/contato/schema.json` |
| dado-institucional | Single | `/api/dado-institucional` | `src/api/dado-institucional/routes/dado-institucional.ts`, `src/api/dado-institucional/content-types/dado-institucional/schema.json` |
| edicao-galeria | Collection | `/api/edicao-galerias` | `src/api/edicao-galeria/routes/edicao-galeria.ts`, `src/api/edicao-galeria/content-types/edicao-galeria/schema.json` |
| eventos-feira | Collection | `/api/eventos-feiras` | `src/api/eventos-feira/routes/eventos-feira.ts`, `src/api/eventos-feira/content-types/eventos-feira/schema.json` |
| faq | Single | `/api/faq` | `src/api/faq/routes/faq.ts`, `src/api/faq/content-types/faq/schema.json` |
| feira | Single | `/api/feira` | `src/api/feira/routes/feira.ts`, `src/api/feira/content-types/feira/schema.json` |
| femictec | Single | `/api/femictec` | `src/api/femictec/routes/femictec.ts`, `src/api/femictec/content-types/femictec/schema.json` |
| footer | Single | `/api/footer` | `src/api/footer/routes/footer.ts`, `src/api/footer/content-types/footer/schema.json` |
| home-data | Single | `/api/home-data` | `src/api/home-data/routes/home-data.ts`, `src/api/home-data/content-types/home-data/schema.json` |
| localizacao | Single | `/api/localizacao` | `src/api/localizacao/routes/localizacao.ts`, `src/api/localizacao/content-types/localizacao/schema.json` |
| mensagens-contato | Collection | `/api/mensagens-contatos` | `src/api/mensagens-contato/routes/mensagens-contato.ts`, `src/api/mensagens-contato/content-types/mensagens-contato/schema.json` |
| navbar | Single | `/api/navbar` | `src/api/navbar/routes/navbar.ts`, `src/api/navbar/content-types/navbar/schema.json` |
| noticia | Collection | `/api/noticias` | `src/api/noticia/routes/noticia.ts`, `src/api/noticia/content-types/noticia/schema.json` |
| projeto | Collection | `/api/projetos` | `src/api/projeto/routes/projeto.ts`, `src/api/projeto/content-types/projeto/schema.json` |
| resultado | Collection | `/api/resultados` | `src/api/resultado/routes/resultado.ts`, `src/api/resultado/content-types/resultado/schema.json` |
| politica-de-privacidade | Single | `/api/politica-de-privacidade` | `src/api/politica-de-privacidade/routes/politica-de-privacidade.ts`, `src/api/politica-de-privacidade/content-types/politica-de-privacidade/schema.json` |
| regulamento | Single | `/api/regulamento` | `src/api/regulamento/routes/regulamento.ts`, `src/api/regulamento/content-types/regulamento/schema.json` |
| termo-de-uso | Single | `/api/termo-de-uso` | `src/api/termo-de-uso/routes/termo-de-uso.ts`, `src/api/termo-de-uso/content-types/termo-de-uso/schema.json` |

## 3. Regras publicas importantes

- Os projetos so sao exibidos publicamente quando estiverem publicados e marcados como `publico` pela administracao da FEMICTEC.
- Os totais de `stats` usam o mesmo critério de visibilidade: apenas projetos publicados e `publico=true`.
- Os resultados so sao exibidos publicamente apos publicacao administrativa explicita.
- As rotas publicas customizadas usam `auth: false`.
- O frontend deve consumir `/api/public/femictec/*` quando precisar do contrato enxuto e controlado.

## 4. Projeto e Resultado: origem externa

Os conteudos de `Projeto` e `Resultado` sao alimentados a partir da plataforma externa informada nesta conversa.
`Resultado` pode ser formado a partir do mesmo payload de `Projeto`, priorizando apenas os itens que tragam `final_result_score` ou `final_result_concept`.

O passo a passo completo da construcao e configuracao da integracao esta em:

- [docs/INTEGRACAO-EXTERNA-PLATAFORMA-CONNECTA.md](./INTEGRACAO-EXTERNA-PLATAFORMA-CONNECTA.md)

### Fonte externa

- URL canonica: `POST /integrations/projects`
- URL legada: `GET /integrations/projects`
- autenticacao: `Authorization: Bearer <EXTERNAL_PROJECTS_API_TOKEN>`
- em desenvolvimento local, a API externa fica disponivel em `http://localhost:8000/integrations/projects`

### Filtros aceitos

- `page`
- `page_size`
- `project_name`
- `event_id`
- `event_name`
- `edition_id`
- `edition_name`
- `advisor_name`
- `participant_name`
- `research_area`
- `result_score_min`
- `result_score_max`
- `result_concept`
- `evaluator_name`

### Mapeamento para `Projeto`

| Campo Strapi | Origem externa | Observacao |
| --- | --- | --- |
| `origemId` | `project_id` | Identificador unico da origem |
| `titulo` | `title` | Titulo publico do projeto |
| `resumo` | `summary` | Resumo padrao importado da plataforma |
| `escola` | `school_name` | Nome da escola |
| `area` | `research_area` | Area de pesquisa |
| `orientador` | `advisor_name` | Nome do orientador |
| `participantesNomes` | `participant_names` | Lista de participantes |
| `participantes` | derivado de `participant_names` | Quantidade total de participantes |
| `eventoNome` | `event.name` | Nome do evento |
| `eventoSlug` | `event.slug` | Slug do evento |
| `edicaoNome` | `edition.name` | Nome da edicao |
| `edicaoSlug` | `edition.slug` | Slug da edicao |
| `statusExterno` | `status` | Status informado pela plataforma |
| `notaFinal` | `final_result_score` | Nota final consolidada |
| `conceitoFinal` | `final_result_concept` | Conceito final consolidado |
| `dataSubmissao` | `submitted_at` | Data/hora da submissao |
| `fontePayload` | payload bruto | Guarda a resposta original para auditoria e reimportacao |
| `publico` | flag editorial local | Controla se o projeto pode aparecer nas rotas publicas |

### Mapeamento para `Resultado`

| Campo Strapi | Origem externa | Observacao |
| --- | --- | --- |
| `origemId` | `project_id` | Identificador unico da origem |
| `titulo` | `title` | Titulo publico do resultado |
| `resumo` | `summary` | Resumo importado da plataforma |
| `escola` | `school_name` | Nome da escola |
| `area` | `research_area` | Area de pesquisa |
| `orientador` | `advisor_name` | Nome do orientador |
| `participantesNomes` | `participant_names` | Lista de participantes |
| `participantes` | derivado de `participant_names` | Quantidade total de participantes |
| `edicaoNome` | `edition.name` | Nome da edicao |
| `edicaoSlug` | `edition.slug` | Slug da edicao |
| `statusExterno` | `status` | Status informado pela plataforma |
| `avaliadoresNomes` | `evaluator_names` | Lista de avaliadores |
| `notaFinal` | `final_result_score` | Nota final consolidada |
| `conceitoFinal` | `final_result_concept` | Conceito final consolidado |
| `dataSubmissao` | `submitted_at` | Data/hora da submissao |
| `fontePayload` | payload bruto | Guarda a resposta original para auditoria e reimportacao |

### Campos editoriais locais

Os campos abaixo continuam sob responsabilidade do time editorial do Strapi e nao dependem da API externa:

- `descricao`
- `imagem`
- `arquivo` no `Resultado`
- `categoria` no `Resultado`, se quiser classificacao editorial adicional

### Regra de publicacao

- o conteudo entra no Strapi como rascunho ou item controlado internamente;
- somente registros com `publishedAt` preenchido devem aparecer nas rotas publicas;
- a publicacao no site nao depende apenas do status externo, e sim da liberacao administrativa no Strapi.

### Sincronizacao manual interna

```http
POST /api/femictec/external-projects/sync
```

Headers obrigatorios:

- `x-femictec-sync-secret: <FEMICTEC_SYNC_SECRET>`

Corpo opcional:

```json
{
  "pageSize": 50,
  "maxPages": 1000,
  "syncResults": true,
  "project_name": "robotica",
  "event_name": "femictec",
  "edition_name": "2026"
}
```

Observacoes:

- os filtros do corpo sao repassados para a plataforma externa;
- quando `syncResults` estiver `true`, o Strapi tambem tenta sincronizar os registros de `Resultado` que ja tenham nota ou conceito final;
- o endpoint nao publica automaticamente os registros, apenas atualiza os dados internos;
- o conector suporta `POST` e `GET` na API externa, com `AUTO` como comportamento padrao;
- `descricao`, `imagem`, `arquivo` e outros campos editoriais continuam sob controle humano.
- `publico` e a flag editorial que libera o projeto para as rotas publicas.

## 5. Contato e envio de mensagem

O formulario publico do site deve enviar mensagens para:

```http
POST /api/mensagens-contatos/submit
```

Esse endpoint:

- grava o registro em `Mensagens de Contato`;
- envia um e-mail para o e-mail principal do `Contato` e para os destinatarios extras configurados em `destinatariosEvento`;
- envia uma confirmacao para o e-mail informado pelo usuario;
- usa `replyTo` com o e-mail do usuario, para facilitar a resposta direta pela equipe.

Campos aceitos:

- `nome`
- `email`
- `assunto`
- `mensagem`

Configuracao de e-mail:

- `EMAIL_PROVIDER`
- `EMAIL_DEFAULT_FROM`
- `EMAIL_DEFAULT_REPLY_TO`
- o e-mail principal do `Contato`

## 6. Noticia: datas editoriais

Campos preparados no content type `noticia`:

- `slug`: identificador publico usado no link da noticia;
- `dataPublicacao`: recebe a data de criacao da noticia e fica imutavel;
- `dataUltimaEdicao`: recebe a data da ultima edicao;
- `imagem`: e retornada populada por padrao nos endpoints `find` e `findOne`.

Observacao:

- o editor pode definir `dataPublicacao` apenas no primeiro salvamento;
- depois disso, a data fica fixa e nao sofre nova alteracao manual;
- se a noticia nunca for editada depois da criacao, `dataUltimaEdicao` fica igual a `dataPublicacao`;
- nao existe mais agendamento por campo proprio nesta noticia.
