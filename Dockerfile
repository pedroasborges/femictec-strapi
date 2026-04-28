FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache build-base python3

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 1337

CMD ["npm", "run", "start"]
