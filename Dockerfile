FROM node:20-alpine AS production

WORKDIR /app

COPY . .

RUN npm ci