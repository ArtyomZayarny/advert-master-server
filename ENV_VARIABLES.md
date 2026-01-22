# Переменные окружения

## Общие переменные

### PORT
**Используется:** Во всех сервисах через `process.env.PORT`

**Значения по умолчанию:**
- `auth-service`: 3001
- `adverts-service`: 3002
- `user-service`: 3003
- `search-service`: 3004
- `payments-service`: 3005
- `archive-service`: 3006

---

## Базы данных

### POSTGRES_URL
**Формат:** `postgresql://user:password@host:port/database`

**Примеры:**
- `postgresql://advert:advert123@localhost:5432/advert_auth`
- `postgresql://user:pass@postgres-auth:5432/advert_auth`

**Используется в:**
- `auth-service` - для подключения к PostgreSQL
- `user-service` - для подключения к PostgreSQL

**Fallback:** Если `POSTGRES_URL` не указан, используются отдельные переменные:
- `POSTGRES_HOST`
- `POSTGRES_PORT`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`

### MONGODB_URL
**Формат:** `mongodb://user:password@host:port/database?authSource=admin`

**Примеры:**
- `mongodb://advert:advert123@localhost:27017/advert_adverts?authSource=admin`
- `mongodb://user:pass@mongodb-adverts:27017/advert_adverts?authSource=admin`

**Используется в:**
- `adverts-service` - для подключения к MongoDB
- `user-service` - для подключения к MongoDB (избранное)
- `search-service` - для подключения к MongoDB
- `archive-service` - для подключения к MongoDB

**Дополнительно:** `MONGODB_DB_NAME` - имя базы данных (если не указано в URL)

### Redis переменные
**Используются отдельные переменные:**
- `REDIS_HOST` - хост Redis (по умолчанию: localhost)
- `REDIS_PORT` - порт Redis (по умолчанию: 6379)
- `REDIS_USER` - пользователь Redis (опционально)
- `REDIS_PASSWORD` - пароль Redis

**Примеры:**
- `REDIS_HOST=localhost`
- `REDIS_PORT=6379`
- `REDIS_USER=advert` (опционально)
- `REDIS_PASSWORD=advert123`

**Используется в:**
- `auth-service` - для кеша OTP кодов и сессий

---

## AWS S3

**Используются в:** `auth-service` и `adverts-service`

### auth-service/src/file/file.service.ts:
- ✅ `AWS_ACCESS_KEY_ID` - AWS Access Key
- ✅ `AWS_SECRET_ACCESS_KEY` - AWS Secret Key
- ✅ `AWS_REGION` - AWS Region (по умолчанию: us-east-1)
- ✅ `AWS_BUCKET_NAME` - используется с суффиксом `.avatars` (или `AWS_BUCKET_AVATARS` как fallback)

**Логика:**
```typescript
const bucketName = this.configService.get('AWS_BUCKET_NAME');
this.bucketAvatars = bucketName 
  ? `${bucketName}.avatars`
  : this.configService.get('AWS_BUCKET_AVATARS') || 'kibtop.avatars';
```

### adverts-service/src/file/file.service.ts:
- ✅ `AWS_ACCESS_KEY_ID` - AWS Access Key
- ✅ `AWS_SECRET_ACCESS_KEY` - AWS Secret Key
- ✅ `AWS_REGION` - AWS Region (по умолчанию: us-east-1)
- ✅ `AWS_BUCKET_NAME` - используется с суффиксом `.adverts` (или `AWS_BUCKET_ADVERTS` как fallback)

**Логика:**
```typescript
const bucketName = this.configService.get('AWS_BUCKET_NAME');
this.bucketAdverts = bucketName 
  ? `${bucketName}.adverts`
  : this.configService.get('AWS_BUCKET_ADVERTS') || 'kibtop.adverts';
```

---

## JWT Authentication

### SECRET
**Используется:** Во всех сервисах с JWT (auth, adverts, user, payments)
- JWT secret key для подписи токенов

### REFRESH_SECRET
**Используется:** Только в `auth-service`
- Secret key для refresh токенов

---

## Платежи

### STRIPE_KEY
**Используется:** В `payments-service`
- Stripe API ключ
- **Обязательная переменная** (выбрасывает ошибку если не указана)

---

## OAuth

### GOOGLE_CLIENT_ID
**Используется:** В `auth-service`
- Google OAuth Client ID для социальной аутентификации

---

## Другие

### WEBSOCKET_CHAT
**Статус:** Добавлена в docker-compose.yml для auth-service
- В оригинале код закомментирован
- Переменная готова к использованию, если будет реализован WebSocket чат

### ADVERTS_SERVICE_URL
**Используется:** В `user-service`, `search-service`, `archive-service`
- URL для межсервисного взаимодействия с adverts-service
- По умолчанию: `http://localhost:3002`

---

## Пример .env файла

```env
# Ports
PORT=3001

# PostgreSQL
POSTGRES_URL=postgresql://advert:advert123@localhost:5432/advert_auth
# Или отдельные переменные:
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=advert
POSTGRES_PASSWORD=advert123
POSTGRES_DB=advert_auth

# MongoDB
MONGODB_URL=mongodb://advert:advert123@localhost:27017/advert_adverts?authSource=admin
MONGODB_DB_NAME=advert_adverts

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=advert123

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=kibtop

# JWT
SECRET=your-jwt-secret-key
REFRESH_SECRET=your-refresh-secret-key

# Stripe
STRIPE_KEY=your-stripe-key

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id

# Services
ADVERTS_SERVICE_URL=http://localhost:3002
```

---

## Docker Compose

Все переменные настроены в `docker-compose.yml` и передаются в контейнеры сервисов.
