# Integracao Externa da Plataforma Conecta

Este guia descreve como a rota externa de consulta de projetos foi integrada ao Strapi da FEMICTEC.
O objetivo e registrar o contrato usado, onde configurar o token e como validar a importacao ponta a ponta.

## 1. Visao geral

A integracao consulta a Plataforma Conecta em:

- `POST /api/integrations/projects`
- `GET /api/integrations/projects`

O Strapi usa esse retorno para importar:

- `Projeto`
- `Resultado`

A importacao e feita por sincronizacao manual interna no endpoint:

```http
POST /api/femictec/external-projects/sync
```

## 2. Onde o token entra

O token nao deve ser gravado no codigo-fonte.

Ele entra como variavel de ambiente:

- no desenvolvimento local, em `.env`
- em producao, no segredo de ambiente do servidor
- no teste de integracao, na variavel `EXTERNAL_PROJECTS_API_TOKEN` antes de executar o script

Variavel usada pelo Strapi:

- `EXTERNAL_PROJECTS_API_TOKEN`

Variavel de protecao da sincronizacao interna:

- `FEMICTEC_SYNC_SECRET`

Variavel para definir o metodo de consulta da API externa:

- `EXTERNAL_PROJECTS_API_METHOD`

Valores aceitos para o metodo:

- `POST`
- `GET`
- `AUTO`

### Bloco de exemplo para o `.env`

```env
EXTERNAL_PROJECTS_API_URL=https://plataforma-external.example.com
EXTERNAL_PROJECTS_API_TOKEN=coloque_o_token_aqui
EXTERNAL_PROJECTS_API_METHOD=AUTO
FEMICTEC_SYNC_SECRET=coloque_o_segredo_de_sync_aqui
```

### Bloco de exemplo para producao

```env
EXTERNAL_PROJECTS_API_URL=https://plataforma-external.example.com
EXTERNAL_PROJECTS_API_TOKEN=troque_no_servidor
EXTERNAL_PROJECTS_API_METHOD=AUTO
FEMICTEC_SYNC_SECRET=troque_no_servidor
```

## 3. Contrato da consulta externa

### URL canonica

```http
POST /integrations/projects
```

### URL legada

```http
GET /integrations/projects
```

### Autenticacao

Header obrigatorio:

```http
Authorization: Bearer <EXTERNAL_PROJECTS_API_TOKEN>
```

### Corpo do `POST`

```json
{
  "page": 1,
  "page_size": 20,
  "project_name": "robotica",
  "event_id": 1,
  "event_name": "femictec",
  "edition_id": 11,
  "edition_name": "2026",
  "advisor_name": "maria",
  "participant_name": "joao",
  "research_area": "tecnologia",
  "result_score_min": 8.0,
  "result_score_max": 10.0,
  "result_concept": "ouro",
  "evaluator_name": "carlos"
}
```

### Campos aceitos

- `page`: inteiro maior ou igual a `1`
- `page_size`: inteiro entre `1` e `200`
- `project_name`: filtro parcial case-insensitive por titulo
- `event_id`: filtro exato por id do evento
- `event_name`: filtro parcial case-insensitive por nome do evento
- `edition_id`: filtro exato por id da edicao
- `edition_name`: filtro parcial case-insensitive por nome da edicao
- `advisor_name`: filtro parcial case-insensitive por orientador
- `participant_name`: filtro parcial case-insensitive por autor participante
- `research_area`: filtro parcial case-insensitive por area de pesquisa
- `result_score_min`: nota minima
- `result_score_max`: nota maxima
- `result_concept`: filtro parcial case-insensitive por conceito final
- `evaluator_name`: filtro parcial case-insensitive por avaliador

### Resposta esperada

```json
{
  "items": [
    {
      "project_id": 99,
      "title": "Projeto publico",
      "research_area": "Robotica",
      "summary": "Resumo publico",
      "status": "FINAL_RESULT_PUBLISHED",
      "school_name": "Escola Municipal",
      "advisor_name": "Orientador",
      "participant_names": ["Ana", "Bruno"],
      "evaluator_names": ["Avaliador 1"],
      "event": {
        "id": 1,
        "name": "FEMICTEC",
        "slug": "femictec"
      },
      "edition": {
        "id": 11,
        "name": "FEMICTEC 2026",
        "slug": "femictec-2026"
      },
      "final_result_score": 9.8,
      "final_result_concept": "Ouro",
      "submitted_at": "2026-06-16T12:00:00Z"
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 1
}
```

## 4. Passo a passo da construcao

### Passo 1. Definir as variaveis de ambiente

No `.env` local:

```env
EXTERNAL_PROJECTS_API_URL=https://plataforma-external.example.com
EXTERNAL_PROJECTS_API_TOKEN=seu_token_aqui
EXTERNAL_PROJECTS_API_METHOD=AUTO
FEMICTEC_SYNC_SECRET=um_segredo_para_sync
```

Em producao, use os mesmos nomes no gerenciador de segredos do servidor.

### Passo 2. Configurar a origem externa

Garanta que a plataforma externa esteja expondo:

- `POST /integrations/projects`
- `GET /integrations/projects`

Garanta que a autenticao por bearer token esteja ativa.

### Passo 3. Sincronizar no Strapi

Chame o endpoint interno do Strapi:

```http
POST /api/femictec/external-projects/sync
```

Header obrigatorio:

```http
x-femictec-sync-secret: <FEMICTEC_SYNC_SECRET>
```

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

### Passo 4. Validar os registros importados

Depois da sincronizacao, confira:

- `Projeto` em `/api/projetos`
- `Resultado` em `/api/resultados`

O Strapi so exibe publicamente os itens que estiverem publicados.

### Passo 5. Publicar editorialmente

A importacao nao publica os registros automaticamente.

O time editorial precisa liberar os itens no Strapi para que aparecam nas rotas publicas.

## 5. Mapeamento de dados

### Projeto

| Campo Strapi | Origem externa |
| --- | --- |
| `origemId` | `project_id` |
| `titulo` | `title` |
| `resumo` | `summary` |
| `escola` | `school_name` |
| `area` | `research_area` |
| `orientador` | `advisor_name` |
| `participantesNomes` | `participant_names` |
| `participantes` | derivado de `participant_names` |
| `eventoNome` | `event.name` |
| `eventoSlug` | `event.slug` |
| `edicaoNome` | `edition.name` |
| `edicaoSlug` | `edition.slug` |
| `statusExterno` | `status` |
| `notaFinal` | `final_result_score` |
| `conceitoFinal` | `final_result_concept` |
| `dataSubmissao` | `submitted_at` |
| `fontePayload` | payload bruto |

### Resultado

| Campo Strapi | Origem externa |
| --- | --- |
| `origemId` | `project_id` |
| `titulo` | `title` |
| `resumo` | `summary` |
| `escola` | `school_name` |
| `area` | `research_area` |
| `orientador` | `advisor_name` |
| `participantesNomes` | `participant_names` |
| `participantes` | derivado de `participant_names` |
| `edicaoNome` | `edition.name` |
| `edicaoSlug` | `edition.slug` |
| `statusExterno` | `status` |
| `avaliadoresNomes` | `evaluator_names` |
| `notaFinal` | `final_result_score` |
| `conceitoFinal` | `final_result_concept` |
| `dataSubmissao` | `submitted_at` |
| `fontePayload` | payload bruto |

## 6. Teste de integracao

Existe um teste dedicado para validar o contrato externo:

```bash
npm run test:integration:external-projects
```

Ele exige:

- `EXTERNAL_PROJECTS_API_URL`
- `EXTERNAL_PROJECTS_API_TOKEN`

O teste valida:

- autenticacao por bearer token
- formato da resposta
- chaves permitidas em `items`
- estrutura de `event` e `edition`

## 7. Erros mais comuns

- `401 Unauthorized`: token ausente ou invalido
- `422 Unprocessable Entity`: payload invalido, por exemplo `page=0` ou `page_size` fora do intervalo
- `503 Service Unavailable`: token nao configurado no backend externo
- `502 Bad Gateway` no Strapi: a API externa rejeitou a consulta ou respondeu com erro

## 8. Comandos uteis

```bash
npm run test:integration:external-projects
npm run build
```

## 9. Resumo rapido

- o token vai em `EXTERNAL_PROJECTS_API_TOKEN`
- o segredo interno da sincronizacao vai em `FEMICTEC_SYNC_SECRET`
- a fonte externa usa `/integrations/projects`
- o Strapi importa com `POST /api/femictec/external-projects/sync`
- a publicacao continua manual no CMS
