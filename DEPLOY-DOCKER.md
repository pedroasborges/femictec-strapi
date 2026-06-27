# Deploy Docker (Linux 9+)

## 1) Pre-requisitos no servidor
- Docker Engine 24+
- Docker Compose Plugin (`docker compose`)
- Porta `1337` liberada (ou a porta configurada no `.env.production`)

## 2) Subir codigo no servidor
```bash
git clone <SEU_REPOSITORIO>
cd femictec
```

## 3) Configurar ambiente
```bash
cp .env.production.example .env.production
```

Edite o `.env.production` com valores reais de producao, principalmente:
- `APP_KEYS`
- `API_TOKEN_SALT`
- `ADMIN_JWT_SECRET`
- `TRANSFER_TOKEN_SALT`
- `JWT_SECRET`
- `ENCRYPTION_KEY`
- `DATABASE_*`

## 4) Build e subida
```bash
ENV_FILE=.env.production docker compose build --no-cache
ENV_FILE=.env.production docker compose up -d
```

No Windows PowerShell:
```powershell
$env:ENV_FILE=".env.production"
docker compose build --no-cache
docker compose up -d
```

## 5) Verificar container
```bash
docker compose ps
docker compose logs -f strapi
```

## 6) Atualizacao de versao
```bash
git pull
ENV_FILE=.env.production docker compose build
ENV_FILE=.env.production docker compose up -d
```

## Observacoes
- No desenvolvimento local (`npm run develop`), o projeto usa SQLite por padrao (`DATABASE_CLIENT_LOCAL=sqlite`).
- Em producao (`NODE_ENV=production`), o projeto usa PostgreSQL via `DATABASE_CLIENT=postgres`.
- Uploads ficam persistidos no volume `strapi_uploads`.
- Se usar SQLite, o banco ficara no volume `strapi_tmp`.
- Para producao com estabilidade, prefira PostgreSQL gerenciado.
