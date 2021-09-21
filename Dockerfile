FROM node:14 AS builder

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

COPY . .

RUN npm run build

RUN npm install --production

FROM node:14

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules

COPY ["package.json", "package-lock.json*", "./"]

COPY --from=builder /app/dist ./dist

CMD [ "node", "./dist/server.js" ]