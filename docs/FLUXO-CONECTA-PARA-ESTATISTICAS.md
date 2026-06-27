# Fluxo Conecta -> Strapi -> Publicacao -> Stats

Este documento resume o caminho dos dados da Plataforma Conecta ate os totais publicos exibidos no FEMICTEC.

## Visao geral

O fluxo completo e:

1. a Plataforma Conecta expoe os projetos e resultados;
2. o Strapi consulta essa fonte externa por meio da rotina de sincronizacao;
3. o Strapi grava os dados importados como conteudo interno;
4. a equipe editorial marca os itens que podem ir ao ar;
5. as rotas publicas leem somente o conteudo liberado;
6. a rota `stats` soma apenas o que esta publicado e marcado como `publico`.

## 1. Origem dos dados

A origem externa fica na Plataforma Conecta, consultada pelo contrato:

```http
POST /api/integrations/projects
```

Em ambiente legada ou compatibilidade, a API tambem aceita:

```http
GET /api/integrations/projects
```

O Strapi usa esse retorno para importar:

- `Projeto`
- `Resultado`

## 2. Sincronizacao no Strapi

A importacao acontece por uma rota interna do Strapi:

```http
POST /api/femictec/external-projects/sync
```

Essa rota:

- exige o header `x-femictec-sync-secret`;
- usa `EXTERNAL_PROJECTS_API_URL` e `EXTERNAL_PROJECTS_API_TOKEN`;
- pode sincronizar projetos e, opcionalmente, resultados.

O processo nao publica automaticamente os registros.

## 3. Publicacao editorial

Depois da sincronizacao, o conteudo fica no CMS para revisao humana.

Para aparecer no site:

- o registro precisa estar publicado no Strapi;
- no caso de `Projeto`, tambem precisa estar com `publico=true`.

Isso vale para:

- listagem publica de projetos;
- detalhe publico de projetos;
- agregados de `stats`.

## 4. Consumo publico

As rotas publicas usadas pelo frontend sao:

```http
GET /api/public/femictec/projects
GET /api/public/femictec/projects/:id
GET /api/public/femictec/results
GET /api/public/femictec/stats
```

Regras importantes:

- `projects` e `projects/:id` retornam apenas campos permitidos para exibicao publica;
- `stats` retorna apenas totais agregados;
- nenhum desses endpoints expoe o payload bruto da Conecta.

## 5. O que o `stats` conta

A rota `stats` soma apenas projetos que:

- estao publicados;
- estao marcados como `publico=true`.

Os totais exibidos sao:

- total de projetos;
- total de escolas;
- total de participantes;
- total de areas.

## 6. Checklist rapido

Antes de esperar os totais aparecerem no frontend, confirme:

- a Conecta esta acessivel;
- a sincronizacao rodou com sucesso;
- os projetos foram publicados no CMS;
- os projetos relevantes estao com `publico=true`;
- o frontend esta consumindo as rotas publicas do Strapi.

