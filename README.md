# Advert Master Server

Микросервисная архитектура для платформы объявлений на базе NestJS.

## Архитектура

Проект состоит из 6 микросервисов:

- **auth-service** (порт 3001) - Аутентификация, OAuth, OTP
- **adverts-service** (порт 3002) - Объявления, категории
- **user-service** (порт 3003) - Профили пользователей, избранное
- **search-service** (порт 3004) - Поиск, рекомендации
- **payments-service** (порт 3005) - Платежи (Stripe)
- **archive-service** (порт 3006) - Архив объявлений

## Технологии

- **NestJS** - Framework для микросервисов
- **PostgreSQL** - База данных для пользователей (auth, user services)
- **MongoDB** - База данных для объявлений (adverts, search, archive services)
- **Redis** - Кеш, сессии, OTP
- **AWS S3** - Хранилище файлов
- **Docker Compose** - Оркестрация сервисов

## Быстрый старт

### Требования

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL
- MongoDB
- Redis

### Установка

```bash
# Клонировать репозиторий
git clone <repository-url>
cd advert-master-server

# 1. Установить зависимости в корне проекта
npm install

# 2. Установить зависимости для всех сервисов
npm run install:all

# 3. Создать .env файлы для каждого сервиса (см. .env.example в каждом сервисе)
# Или использовать переменные из docker-compose.yml

# 4. Запустить базы данных (если не используете Docker для сервисов)
docker-compose up -d postgres-auth postgres-user mongodb-adverts mongodb-search mongodb-archive redis

# 5. Запустить все сервисы локально в режиме разработки (watch mode)
npm run start:dev

# Или запустить через Docker Compose
npm run docker:up
# или
docker-compose up -d

# Или запустить отдельный сервис локально
npm run start:dev:auth       # Порт 3001
npm run start:dev:adverts    # Порт 3002
npm run start:dev:user       # Порт 3003
npm run start:dev:search     # Порт 3004
npm run start:dev:payments   # Порт 3005
npm run start:dev:archive    # Порт 3006
```

## Структура проекта

```
advert-master-server/
├── apps/                  # Микросервисы
│   ├── auth/
│   ├── adverts/
│   ├── user/
│   ├── search/
│   ├── payments/
│   └── archive/
├── libs/                   # Общие модули
│   └── common/
│       ├── dto/           # DTO для всех сервисов
│       ├── types/         # TypeScript типы
│       ├── utils/         # Утилиты
│       └── interfaces/    # Интерфейсы
└── docker-compose.yml     # Docker Compose конфигурация
```

## API Endpoints

Клиент обращается напрямую к сервисам:

- `http://localhost:3001/auth/*` - Аутентификация
- `http://localhost:3002/:cat/*` - Объявления
- `http://localhost:3003/user/*` - Пользователи
- `http://localhost:3004/search/*` - Поиск
- `http://localhost:3005/payments/*` - Платежи
- `http://localhost:3006/archive/*` - Архив

## Разработка

Каждый сервис - это отдельный NestJS проект с собственной базой данных.

### Доступные команды

```bash
# Установить зависимости для всех сервисов
npm run install:all

# Запустить все сервисы в режиме разработки (watch mode)
npm run start:dev

# Собрать все сервисы
npm run build:all

# Запустить через Docker
npm run docker:up
npm run docker:down
npm run docker:logs
npm run docker:restart

# Запустить отдельный сервис локально
npm run start:dev:auth
npm run start:dev:adverts
# и т.д.
```

### Добавление нового сервиса

1. Создать папку в `apps/`
2. Инициализировать NestJS проект
3. Добавить в `docker-compose.yml`
4. Добавить скрипты в корневой `package.json`
5. Обновить `nest-cli.json`

## Лицензия

UNLICENSED
