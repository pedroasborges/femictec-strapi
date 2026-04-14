FROM node:22-bookworm-slim AS base

RUN apt-get update && apt-get install -y --no-install-recommends \
  build-essential \
  python3 \
  pkg-config \
  libvips-dev \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/app
ENV PATH=/opt/app/node_modules/.bin:$PATH

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:22-bookworm-slim AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends \
  libvips \
  ca-certificates \
  tini \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/app
ENV NODE_ENV=production
ENV PATH=/opt/app/node_modules/.bin:$PATH

COPY --from=build /opt/app ./

RUN mkdir -p /opt/app/public/uploads /opt/app/.tmp \
  && chown -R node:node /opt/app

USER node

EXPOSE 1337
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["npm", "run", "start"]
