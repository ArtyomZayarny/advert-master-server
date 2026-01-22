# 📚 API Documentation

## Overview

All microservices have automatically generated API documentation via **ReDoc** - a modern, beautiful documentation interface.

## Access to Documentation

### Service Documentation

#### Auth Service (port 3001)
- **ReDoc**: http://localhost:3001/api/docs
- **OpenAPI JSON**: http://localhost:3001/api/swagger-json

#### Adverts Service (port 3002)
- **ReDoc**: http://localhost:3002/api/docs
- **OpenAPI JSON**: http://localhost:3002/api/swagger-json

#### User Service (port 3003)
- **ReDoc**: http://localhost:3003/api/docs
- **OpenAPI JSON**: http://localhost:3003/api/swagger-json

#### Search Service (port 3004)
- **ReDoc**: http://localhost:3004/api/docs
- **OpenAPI JSON**: http://localhost:3004/api/swagger-json

#### Payments Service (port 3005)
- **ReDoc**: http://localhost:3005/api/docs
- **OpenAPI JSON**: http://localhost:3005/api/swagger-json

#### Archive Service (port 3006)
- **ReDoc**: http://localhost:3006/api/docs
- **OpenAPI JSON**: http://localhost:3006/api/swagger-json

## ReDoc Features

- ✅ **Modern Design** - beautiful, minimalist interface
- ✅ **Better for Reading** - perfect for studying the API
- ✅ **Responsive** - works great on mobile devices
- ✅ **Dark Theme** - dark theme support (in settings)
- ✅ **Search** - built-in search functionality
- ✅ **Code Samples** - automatically generated code examples

## Usage

### 1. Authentication

Most endpoints require a JWT token. To authenticate:

1. Get token via `/auth/jwt/create`
2. Use the token in your API requests with header: `Authorization: Bearer YOUR_TOKEN_HERE`
3. For testing, use Postman, Insomnia, or curl

### 2. Testing API

ReDoc is designed for reading and understanding the API. For testing:

- Use **Postman** or **Insomnia** for interactive testing
- Use **curl** commands (examples below)
- Use the **OpenAPI JSON** endpoint to import into your favorite API client

### 3. Request Examples

#### Authentication
```bash
curl -X POST http://localhost:3001/auth/jwt/create \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user@example.com",
    "password": "password123"
  }'
```

#### Create Advert
```bash
curl -X POST http://localhost:3002/realty/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Beautiful Apartment" \
  -F "description=3 bedroom apartment" \
  -F "price=50000" \
  -F "currency=EUR" \
  -F "address=Kyrenia" \
  -F "city=Kyrenia" \
  -F "upload=@photo.jpg"
```

## Documentation Structure

### Tags
Endpoints are grouped by tags:
- `auth` - Authentication
- `users` - Users
- `adverts` - Adverts
- `search` - Search
- `payments` - Payments
- `archive` - Archive
- `health` - Health check

### Data Models
All DTO classes are automatically documented with:
- Data types
- Required fields
- Example values
- Validation

## Customization

### Changing ReDoc Theme

Edit the file `shared/swagger/redoc.setup.ts`:

```typescript
setupReDoc(app, config, {
  theme: {
    colors: {
      primary: {
        main: '#667eea', // Your color
      },
    },
  },
});
```

### Adding New Endpoints

1. Add decorators to controller:
```typescript
@ApiTags('your-tag')
@ApiOperation({ summary: 'Description', description: 'Details' })
@ApiResponse({ status: 200, description: 'Success' })
```

2. Add `@ApiProperty` to DTO:
```typescript
@ApiProperty({ description: 'Field description', example: 'Example' })
field: string;
```

## Troubleshooting

### Documentation Not Opening
- Make sure the service is running
- Check the port in console
- Check CORS settings

### Import Errors
- Make sure `@nestjs/swagger` is installed
- Check import paths in `tsconfig.json`

### ReDoc Not Loading
- Check browser console for errors
- Make sure `/api/swagger-json` is accessible
- Check internet connection (ReDoc loads from CDN)

## Useful Links

- [ReDoc Documentation](https://github.com/Redocly/redoc)
- [OpenAPI Specification](https://swagger.io/specification/)
- [NestJS Swagger Module](https://docs.nestjs.com/openapi/introduction)
