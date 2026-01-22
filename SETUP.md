# Setup Guide for Advert Master Server

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL (или используйте Docker)
- MongoDB (или используйте Docker)
- Redis (или используйте Docker)
- AWS S3 credentials (для загрузки файлов)

## Quick Start

### 1. Clone and Setup

```bash
cd advert-master-server
```

### 2. Environment Variables

Создайте `.env` файлы для каждого сервиса на основе `.env.example`:

```bash
# В корне проекта
cp docker-compose.yml.example docker-compose.yml

# Переменные окружения настраиваются в docker-compose.yml
# Или создайте .env файл в корне проекта
```

### 3. Start with Docker Compose

```bash
# Запустить все сервисы
docker-compose up -d

# Посмотреть логи
docker-compose logs -f

# Остановить все сервисы
docker-compose down
```

### 4. Local Development

Если хотите запускать сервисы локально (без Docker):

```bash
# 1. Запустить базы данных через Docker
docker-compose up -d postgres-auth postgres-user mongodb-adverts mongodb-search mongodb-archive redis

# 2. Установить зависимости и запустить все сервисы
npm install
npm run start:dev
```

## Service URLs

После запуска сервисы будут доступны:

- **Auth Service**: http://localhost:3001
- **Adverts Service**: http://localhost:3002
- **User Service**: http://localhost:3003
- **Search Service**: http://localhost:3004
- **Payments Service**: http://localhost:3005
- **Archive Service**: http://localhost:3006

## Database Setup

### PostgreSQL

Таблицы создаются автоматически при первом запуске сервисов.

### MongoDB

Коллекции создаются автоматически при первом использовании.

## Testing

```bash
# В каждом сервисе
cd services/auth-service
npm test
```

## Troubleshooting

### Port already in use

Измените порты в `docker-compose.yml` или `.env` файлах.

### Database connection errors

Убедитесь, что базы данных запущены и доступны:
```bash
docker-compose ps
```

### Redis connection errors

Проверьте пароль Redis в `.env` файлах.

## Production Deployment

1. Установите все переменные окружения
2. Используйте `docker-compose.prod.yml` (создайте на основе `docker-compose.yml`)
3. Настройте reverse proxy (Nginx/Traefik)
4. Включите SSL/TLS
5. Настройте мониторинг и логирование
