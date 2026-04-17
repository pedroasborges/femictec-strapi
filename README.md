# FEMICTEC Strapi

Backend CMS da FEMICTEC em Strapi 5, com APIs consumidas pelo projeto `femictec_app`.

## Executar

```bash
npm install
npm run develop
```

Build de producao:

```bash
npm run build
npm run start
```

## Conteudos principais

- `Banner` (collection type): endpoint `/api/banners`
- `Footer` (single type): endpoint `/api/footer`
- `A Feira` (single type): endpoint `/api/a-feira`
- `Eventos_Feira` (collection type): endpoint `/api/eventos-feiras`
- `Noticia` (collection type): endpoint `/api/noticias`

## Ajustes recentes (banner e footer)

### Banner

- Campo de midia: `Imagem`
- `draftAndPublish` desativado em `src/api/banner/content-types/banner/schema.json`
- Controller customizado em `src/api/banner/controllers/banner.ts` para:
  - sempre incluir `populate` de `Imagem`;
  - retornar alias `imagem` para compatibilidade com consumidores legados.

### Footer

- Tipo: single type com `draftAndPublish` ativo
- Para exibir no frontend, o registro precisa estar publicado.

## Permissoes obrigatorias (Public)

No Strapi Admin:

`Settings -> Users & Permissions Plugin -> Roles -> Public`

Habilitar no minimo:

- `api::banner.banner.find`
- `api::banner.banner.findOne`
- `api::footer.footer.find`
- `api::footer.footer.findOne` (opcional, recomendado)

Sem permissao de `footer.find`, o frontend recebe `403 Forbidden` em `/api/footer`.

## Validacao rapida

```bash
curl "http://127.0.0.1:1337/api/banners?populate=*"
curl "http://127.0.0.1:1337/api/footer"
```

Esperado:

- `banners`: `200` com `Imagem` preenchida.
- `footer`: `200` (nao `403`).
