# Быстрый старт

## Вариант 1: Локальная разработка (рекомендуется)

### Шаг 1: Установка зависимостей

```bash
# В корне проекта
cd advert-master-server
npm install

# Установить зависимости для всех сервисов
npm run install:all
```

### Шаг 2: Настройка переменных окружения

Создайте `.env` файлы для каждого сервиса на основе `.env.example`:

```bash
# Для каждого сервиса
cd services/auth-service
cp .env.example .env
# Отредактируйте .env с вашими настройками
```

Или используйте переменные из `docker-compose.yml` (они будут подхвачены автоматически).

### Шаг 3: Запуск баз данных

```bash
# Запустить только базы данных через Docker
docker-compose up -d postgres-auth postgres-user mongodb-adverts mongodb-search mongodb-archive redis
```

### Шаг 4: Запуск сервисов

```bash
# Запустить все сервисы одновременно в режиме watch
npm run start:dev
```

Это запустит все 6 сервисов параллельно:
- Auth Service (порт 3001)
- Adverts Service (порт 3002)
- User Service (порт 3003)
- Search Service (порт 3004)
- Payments Service (порт 3005)
- Archive Service (порт 3006)

## Вариант 2: Полный Docker

```bash
# Запустить все через Docker Compose
docker-compose up -d

# Посмотреть логи
docker-compose logs -f

# Остановить
docker-compose down
```

## Проверка работы

После запуска сервисы будут доступны:

- **Auth Service**: http://localhost:3001
- **Auth Service**: http://localhost:3001
- **Adverts Service**: http://localhost:3002
- **User Service**: http://localhost:3003
- **Search Service**: http://localhost:3004
- **Payments Service**: http://localhost:3005
- **Archive Service**: http://localhost:3006

## Устранение проблем

### Ошибка "concurrently: command not found"

```bash
npm install
```

### Ошибка "nest: command not found"

Убедитесь, что в каждом сервисе установлены зависимости:
```bash
npm run install:all
```

### Ошибка подключения к базе данных

Убедитесь, что базы данных запущены:
```bash
docker-compose ps
```

Если не запущены:
```bash
docker-compose up -d postgres-auth postgres-user mongodb-adverts mongodb-search mongodb-archive redis
```

### Порт уже занят

Измените порты в `.env` файлах или `docker-compose.yml`.
