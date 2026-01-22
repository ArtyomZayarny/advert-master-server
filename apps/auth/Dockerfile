FROM node:20

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Install NestJS CLI
RUN npm install -g @nestjs/cli

# Copy source code
COPY . .

# Build the application
RUN npm run build

EXPOSE 3001

CMD ["node", "dist/main.js"]
