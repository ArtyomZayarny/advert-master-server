# Health Check Endpoints

Все сервисы имеют health check эндпоинты для мониторинга работоспособности.

## Эндпоинты

### Auth Service
- **URL:** `GET /health` (прямой доступ: `http://localhost:3001/health`)
- **Проверяет:** PostgreSQL и Redis подключения
- **Ответ:**
```json
{
  "status": "ok",
  "service": "auth-service",
  "timestamp": "2026-01-22T19:00:00.000Z",
  "uptime": 3600,
  "database": {
    "status": "connected"
  }
}
```

### Adverts Service
- **URL:** `GET /health` (прямой доступ: `http://localhost:3002/health`)
- **Проверяет:** MongoDB подключение
- **Ответ:**
```json
{
  "status": "ok",
  "service": "adverts-service",
  "timestamp": "2026-01-22T19:00:00.000Z",
  "uptime": 3600,
  "database": {
    "status": "connected"
  }
}
```

### User Service
- **URL:** `GET /health` (прямой доступ: `http://localhost:3003/health`)
- **Проверяет:** PostgreSQL и MongoDB подключения
- **Ответ:**
```json
{
  "status": "ok",
  "service": "user-service",
  "timestamp": "2026-01-22T19:00:00.000Z",
  "uptime": 3600,
  "database": {
    "status": "connected"
  }
}
```

### Search Service
- **URL:** `GET /health` (прямой доступ: `http://localhost:3004/health`)
- **Проверяет:** MongoDB подключение
- **Ответ:**
```json
{
  "status": "ok",
  "service": "search-service",
  "timestamp": "2026-01-22T19:00:00.000Z",
  "uptime": 3600,
  "database": {
    "status": "connected"
  }
}
```

### Payments Service
- **URL:** `GET /health` (прямой доступ: `http://localhost:3005/health`)
- **Проверяет:** Статус сервиса (stateless, без БД)
- **Ответ:**
```json
{
  "status": "ok",
  "service": "payments-service",
  "timestamp": "2026-01-22T19:00:00.000Z",
  "uptime": 3600
}
```

### Archive Service
- **URL:** `GET /health` (прямой доступ: `http://localhost:3006/health`)
- **Проверяет:** MongoDB подключение
- **Ответ:**
```json
{
  "status": "ok",
  "service": "archive-service",
  "timestamp": "2026-01-22T19:00:00.000Z",
  "uptime": 3600,
  "database": {
    "status": "connected"
  }
}
```

## Использование

### Проверка сервисов
```bash
# Auth Service
curl http://localhost:3001/health

# Adverts Service
curl http://localhost:3002/health

# User Service
curl http://localhost:3003/health

# Search Service
curl http://localhost:3004/health

# Payments Service
curl http://localhost:3005/health

# Archive Service
curl http://localhost:3006/health
```

### Мониторинг всех сервисов
```bash
# Скрипт для проверки всех сервисов
for port in 3000 3001 3002 3003 3004 3005 3006; do
  echo "Checking service on port $port..."
  curl -s http://localhost:$port/health | jq .
  echo ""
done
```

## Статусы

- **`ok`** - Сервис работает, все подключения активны
- **`error`** - Сервис работает, но есть проблемы с подключениями к БД

## Docker Health Checks

В `docker-compose.yml` настроены health checks для баз данных:
- PostgreSQL: `pg_isready`
- MongoDB: `mongosh --eval "db.adminCommand('ping')"`
- Redis: `redis-cli ping`

Сервисы автоматически проверяют подключения к БД при каждом запросе к `/health`.
