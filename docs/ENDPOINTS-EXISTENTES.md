# Endpoints Existentes - API FEMICTEC

Documento de referencia dos endpoints expostos pelo backend e do contrato publico usado pelo frontend.

## 1. Endpoints Publicos Customizados

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

## 2. Endpoints Padrão do Strapi

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

## 3. Regras Publicas Importantes

- Os projetos so sao exibidos publicamente quando estiverem publicados e liberados pela administracao da FEMICTEC.
- Os resultados so sao exibidos publicamente apos publicacao administrativa explicita.
- As rotas publicas customizadas usam `auth: false`.
- O frontend deve consumir `/api/public/femictec/*` quando precisar do contrato enxuto e controlado.
