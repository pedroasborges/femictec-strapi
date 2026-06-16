# Testes Operacionais do Strapi FEMICTEC

Registro objetivo dos testes executados para validar o projeto depois da analise da plataforma.

## Contexto

Objetivo:

- validar os scripts de automacao do repositorio;
- validar o contrato dos endpoints publicos do Femictec;
- documentar o que foi verificado de forma operacional.

## Testes de scripts

Comando:

```bash
npm run test:scripts
```

Status:

- executado com sucesso;
- resultado: `All 9 tests passed`.

O que esse teste cobre:

- parse de argumentos de CLI;
- montagem dos fluxos de `pull`, `push` e `deploy`;
- composicao do fluxo `push-and-deploy`;
- checagens do script remoto de deploy.

## Testes de integracao

Os testes de integracao existentes no repositorio sao:

- `npm run test:integration:current-event`
- `npm run test:integration:stats`
- `npm run test:integration:projects`
- `npm run test:integration:project-detail`
- `npm run test:integration:results`
- `npm run test:integration:schedule`

Esses testes validam:

- resposta `200` nos endpoints publicos;
- formato do objeto `data`;
- campos esperados de cada contrato.

Resultados obtidos na validacao desta base:

- `current-event`: `PASS`
- `stats`: `PASS`
- `projects`: `PASS`
- `project-detail`: `PASS`
- `results`: `PASS`
- `schedule`: `PASS`

Nota tecnica:

- o endpoint `stats` foi ajustado para retornar totais zerados quando o content type de projetos nao existe nesta base, evitando `500` durante a validacao operacional.
- `projects` e `results` retornam apenas conteudo publicado, com paginação e campos publicos limitados.
- o endpoint `schedule` segue o mesmo padrao e retorna `200` com estrutura vazia quando nao ha publicacao.

## Endpoints verificados

### Current Event

```bash
GET /api/public/femictec/current-event
```

Valida:

- `activeEdition`
- `dates`
- `status`
- `submissionDeadline`

### Stats

```bash
GET /api/public/femictec/stats
```

Valida:

- `totalProjects`
- `totalSchools`
- `totalParticipants`
- `totalAreas`

Resultado observado na verificacao manual:

- `current-event`: `200` com `activeEdition` e `dates` nulos na base local sem publicacao;
- `schedule`: `200` com `programacaoDias` vazio na base local sem publicacao;
- `stats`: `200` com totais zerados na base local sem conteudo de projetos.

### Projects e Results

```bash
GET /api/public/femictec/projects?page=1&pageSize=5
GET /api/public/femictec/projects/999999999
GET /api/public/femictec/results?page=1&pageSize=5
```

Valida:

- `projects`: listagem publica paginada;
- `projects/:id`: detalhe publico com campos permitidos;
- `results`: listagem publica paginada;
- ambos respeitam a regra de exibicao apenas apos liberacao/publicacao administrativa.

## Verificacoes manuais adicionais

Na instancia local de desenvolvimento, os endpoints abaixo foram consultados:

- `GET /api/feira`
- `GET /api/home-data`

Resultado:

- `404 Not Found` quando nao existe registro publicado.

Esse comportamento e esperado para `single types` com `draftAndPublish` ativo e sem entrada publicada.

## Observacoes importantes

- Os testes de integracao precisam da API Strapi ativa.
- Se o backend nao estiver rodando, o teste falha por erro de conexao.
- Os contratos publicos foram desenhados para retorno simples e estavel.
- Em `single types` publicados, o endpoint so responde `200` apos existir uma versao publicada.

## Resultado sintetico esperado

Quando o ambiente esta pronto, o esperado e:

- `npm run test:scripts` concluir sem falhas;
- os seis testes de integracao retornarem `PASS`;
- os endpoints publicos responderem com `200` e objeto `data`.
