FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm ci

RUN npm install -g @nestjs/cli

COPY . .

RUN npm run build

EXPOSE 3002

CMD ["node", "dist/main.js"]
