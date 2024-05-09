FROM node:alpine

WORKDIR /app

COPY package*.json ./

COPY prisma ./prisma/

COPY .env ./

COPY tsconfig.json ./

COPY start.sh ./

COPY . .

RUN npm install

EXPOSE 3000

CMD ["./start.sh"]




