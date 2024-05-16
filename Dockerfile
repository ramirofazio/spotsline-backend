FROM node:alpine

WORKDIR /app

COPY package*.json ./

COPY prisma ./prisma/

COPY .env ./

COPY tsconfig.json ./

COPY start.sh ./

COPY . .

RUN npm install

RUN npm run build

EXPOSE 3000

CMD npm run start:prod