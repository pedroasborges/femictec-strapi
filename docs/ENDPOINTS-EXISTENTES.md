Com certeza! Ajustei a visualização do seu documento técnico. O foco foi aumentar o contraste visual, simplificar os links repetitivos e destacar os métodos HTTP e tipos de recursos para tornar a leitura muito mais rápida.
Assumi que você vai manter este arquivo no formato Markdown dentro do próprio repositório Git, vinculando os caminhos diretamente.
------------------------------
## Endpoints Existentes — API FEMICTEC
Documento de referência dos endpoints expostos pelo backend e seu mapeamento no código-fonte.
## 1. Endpoints Públicos Customizados
Definidos manualmente na rota public-femictec e implementados no controller femictec.

| Método | Endpoint | Arquivos de Origem |
|---|---|---|
| GET | /api/public/femictec/current-event | routes/public-femictec.ts controllers/femictec.ts |
| GET | /api/public/femictec/stats | routes/public-femictec.ts controllers/femictec.ts |
| GET | /api/public/femictec/schedule | routes/public-femictec.ts controllers/femictec.ts |

## Estrutura de Resposta (Custom)

▶ GET /api/public/femictec/current-event

{
  "data": {
    "activeEdition": null,
    "dates": null,
    "status": "active",
    "submissionDeadline": null
  }
}


▶ GET /api/public/femictec/stats

{
  "data": {
    "totalProjects": 0,
    "totalSchools": 0,
    "totalParticipants": 0,
    "totalAreas": 0
  }
}


▶ GET /api/public/femictec/schedule

{
  "data": {
    "activeEdition": null,
    "programacaoTitulo": null,
    "programacaoDias": []
  }
}

------------------------------
## 2. Endpoints Padrão do Strapi
Gerados automaticamente via createCoreRouter(...). O caminho base segue as convenções nativas do Strapi v4+.

| Recurso | Tipo de Conteúdo | Endpoint Base | Arquivos de Configuração |
|---|---|---|---|
| banner | Collection | /api/banners | banner (routes | schema.json) |
| contato | Single | /api/contato | contato (routes | schema.json) |
| dado-institucional | Single | /api/dado-institucional | dado-institucional (routes | schema.json) |
| edicao-galeria | Collection | /api/edicao-galerias | edicao-galeria (routes | schema.json) |
| eventos-feira | Collection | /api/eventos-feiras | eventos-feira (routes | schema.json) |
| faq | Single | /api/faq | faq (routes | schema.json) |
| feira | Single | /api/feira | feira (routes | schema.json) |
| femictec | Single | /api/femictec | femictec (routes | schema.json) |
| footer | Single | /api/footer | footer (routes | schema.json) |
| home-data | Single | /api/home-data | home-data (routes | schema.json) |
| localizacao | Single | /api/localizacao | localizacao (routes | schema.json) |
| mensagens-contato | Collection | /api/mensagens-contatos | mensagens-contato (routes | schema.json) |
| navbar | Single | /api/navbar | navbar (routes | schema.json) |
| noticia | Collection | /api/noticias | noticia (routes | schema.json) |
| politica-de-privacidade | Single | /api/politica-de-privacidade | politica-de-privacidade (routes | schema.json) |
| regulamento | Single | /api/regulamento | regulamento (routes | schema.json) |
| termo-de-uso | Single | /api/termo-de-uso | termo-de-uso (routes | schema.json) |

## Estrutura de Resposta (Padrão)

▶ Esquema para Collection Types (Listagem/Arrays)

{
  "data": [
    {
      "id": 1,
      "documentId": "example-document-id",
      "createdAt": "2026-06-11T12:00:00.000Z",
      "updatedAt": "2026-06-11T12:00:00.000Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 1
    }
  }
}


▶ Esquema para Single Types (Objeto Único)

{
  "data": {
    "id": 1,
    "documentId": "example-document-id",
    "createdAt": "2026-06-11T12:00:00.000Z",
    "updatedAt": "2026-06-11T12:00:00.000Z"
  },
  "meta": {}
}

------------------------------
## Notas Importantes

* Escopo de Rotas: Os caminhos listados acima servem como o ponto de entrada principal de cada recurso técnico.
* Operações Automáticas: Para collection types, o Strapi gera automaticamente os métodos padrão de CRUD (GET id/lista, POST, PUT, DELETE).
* Instâncias Únicas: Para single types, o endpoint retorna estritamente o único registro configurado no painel administrativo.
* Isolamento de Negócio: As rotas sob /api/public/femictec/* ignoram o fluxo básico do Strapi, permitindo customizações otimizadas de consultas para a aplicação cliente.

------------------------------
Para deixar esse documento ainda mais completo para sua equipe, me conta:

* Deseja adicionar uma coluna informando quais dessas rotas exigem autenticação via Token (Bearer) e quais estão liberadas no painel de permissões?
* Seria útil incluir os métodos permitidos (POST, PUT, DELETE) explicitamente na tabela de tabelas do Strapi?
* Quer detalhar os parâmetros de query aceitos (como populate=* ou filtros comuns do Strapi)?


