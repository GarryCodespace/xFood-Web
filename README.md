# xFood Community Baking Platform - Backend API

A comprehensive FastAPI backend for the xFood Community Baking Platform, providing robust APIs for user management, recipe sharing, baking communities, and social interactions.

## 🚀 Features

### Core Functionality
- **User Authentication & Authorization** - JWT-based auth with role-based access control
- **User Management** - Profile management, avatar uploads, user search
- **Recipe Management** - Create, read, update, delete recipes with ratings and reviews
- **Baking Posts (Bakes)** - Share baking achievements with photos and descriptions
- **Community Circles** - Join baking communities and participate in discussions
- **Social Features** - Likes, comments, reviews, and direct messaging
- **File Upload** - Image uploads with optimization and S3 integration

### Technical Features
- **FastAPI Framework** - Modern, fast web framework with automatic API documentation
- **SQLAlchemy ORM** - Database abstraction and management
- **PostgreSQL Database** - Robust relational database
- **Redis Integration** - Caching and session management
- **Celery** - Background task processing
- **AWS S3 Integration** - Scalable file storage
- **Image Processing** - Automatic image optimization and resizing
- **CORS Support** - Cross-origin resource sharing
- **Rate Limiting** - API protection and abuse prevention

## 🏗️ Architecture

```
xfood-backend/
├── app/
│   ├── api/                    # API endpoints
│   │   ├── auth/              # Authentication endpoints
│   │   ├── users/             # User management endpoints
│   │   ├── recipes/           # Recipe endpoints
│   │   ├── bakes/             # Baking post endpoints
│   │   ├── circles/           # Community circle endpoints
│   │   ├── comments/          # Comment endpoints
│   │   ├── likes/             # Like/unlike endpoints
│   │   ├── reviews/           # Recipe review endpoints
│   │   ├── messages/          # Direct messaging endpoints
│   │   └── upload/            # File upload endpoints
│   ├── core/                  # Core configuration and utilities
│   │   ├── config.py          # Application configuration
│   │   ├── deps.py            # Dependency injection
│   │   └── security.py        # Security utilities
│   ├── db/                    # Database configuration
│   │   └── database.py        # Database connection and session
│   ├── models/                # SQLAlchemy models
│   ├── schemas/               # Pydantic schemas
│   └── services/              # Business logic services
├── requirements.txt            # Python dependencies
├── alembic.ini                # Database migration configuration
└── main.py                    # FastAPI application entry point
```

## 🛠️ Installation

### Prerequisites
- Python 3.8+
- PostgreSQL 12+
- Redis 6+
- AWS S3 account (optional, for file storage)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd xfood-backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment configuration**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

5. **Database setup**
   ```bash
   # Create PostgreSQL database
   createdb xfood_db
   
   # Run migrations
   alembic upgrade head
   ```

6. **Start the application**
   ```bash
   python -m app.main
   ```

## ⚙️ Configuration

### Environment Variables

```env
# Application
APP_NAME=xFood Community Baking Platform
VERSION=1.0.0
DEBUG=true
API_PREFIX=/api/v1

# Database
DATABASE_URL=postgresql://user:password@localhost/xfood_db

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Redis
REDIS_URL=redis://localhost:6379

# AWS S3 (optional)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
AWS_S3_ENDPOINT_URL=https://s3.amazonaws.com

# File Upload
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_IMAGE_TYPES=["image/jpeg", "image/png", "image/webp"]

# CORS
CORS_ORIGINS=["http://localhost:3000", "https://yourdomain.com"]
```

## 📚 API Documentation

Once the application is running, you can access:

- **Interactive API Docs**: `http://localhost:8000/docs` (Swagger UI)
- **Alternative API Docs**: `http://localhost:8000/redoc` (ReDoc)
- **OpenAPI Schema**: `http://localhost:8000/openapi.json`

### API Endpoints Overview

#### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout

#### Users
- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update current user profile
- `GET /api/v1/users/{user_id}` - Get user profile by ID
- `GET /api/v1/users/search` - Search users

#### Recipes
- `POST /api/v1/recipes/` - Create new recipe
- `GET /api/v1/recipes/` - List recipes with filtering
- `GET /api/v1/recipes/{recipe_id}` - Get recipe by ID
- `PUT /api/v1/recipes/{recipe_id}` - Update recipe
- `DELETE /api/v1/recipes/{recipe_id}` - Delete recipe
- `POST /api/v1/recipes/{recipe_id}/favorite` - Favorite recipe
- `GET /api/v1/recipes/popular` - Get popular recipes
- `GET /api/v1/recipes/quick` - Get quick recipes

#### Bakes
- `POST /api/v1/bakes/` - Create new bake post
- `GET /api/v1/bakes/` - List bakes with filtering
- `GET /api/v1/bakes/{bake_id}` - Get bake by ID
- `PUT /api/v1/bakes/{bake_id}` - Update bake
- `DELETE /api/v1/bakes/{bake_id}` - Delete bake
- `POST /api/v1/bakes/{bake_id}/like` - Like bake
- `GET /api/v1/bakes/trending` - Get trending bakes

#### Circles
- `POST /api/v1/circles/` - Create new circle
- `GET /api/v1/circles/` - List circles
- `GET /api/v1/circles/{circle_id}` - Get circle by ID
- `PUT /api/v1/circles/{circle_id}` - Update circle
- `DELETE /api/v1/circles/{circle_id}` - Delete circle
- `POST /api/v1/circles/{circle_id}/join` - Join circle
- `POST /api/v1/circles/{circle_id}/leave` - Leave circle

#### Social Features
- `POST /api/v1/comments/bake/{bake_id}` - Comment on bake
- `POST /api/v1/comments/recipe/{recipe_id}` - Comment on recipe
- `POST /api/v1/likes/bake/{bake_id}` - Like bake
- `POST /api/v1/likes/recipe/{recipe_id}` - Like recipe
- `POST /api/v1/reviews/recipe/{recipe_id}` - Review recipe

#### Messaging
- `POST /api/v1/messages/` - Send message
- `GET /api/v1/messages/inbox` - Get received messages
- `GET /api/v1/messages/sent` - Get sent messages
- `GET /api/v1/messages/conversation/{user_id}` - Get conversation

#### File Upload
- `POST /api/v1/upload/image` - Upload image
- `POST /api/v1/upload/avatar` - Upload avatar
- `GET /api/v1/upload/images/{filename}` - Get image
- `GET /api/v1/upload/avatars/{filename}` - Get avatar

## 🗄️ Database Models

### Core Entities
- **User** - User accounts and profiles
- **Recipe** - Cooking recipes with ingredients and instructions
- **Bake** - Baking achievement posts
- **Circle** - Community groups
- **Comment** - Comments on bakes and recipes
- **Like** - User likes on content
- **Review** - Recipe ratings and reviews
- **Message** - Direct messages between users

### Relationships
- Users can create multiple recipes, bakes, and circles
- Users can join multiple circles
- Content can have multiple comments, likes, and reviews
- Users can send/receive messages

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt password encryption
- **Role-Based Access Control** - User roles and permissions
- **Input Validation** - Pydantic schema validation
- **SQL Injection Protection** - SQLAlchemy ORM protection
- **File Upload Security** - File type and size validation
- **CORS Protection** - Cross-origin request handling

## 🚀 Deployment

### Development
```bash
python -m app.main
```

### Production
```bash
# Using uvicorn
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4

# Using gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Docker
```bash
docker build -t xfood-backend .
docker run -p 8000:8000 xfood-backend
```

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_auth.py
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation at `/docs`

## 🔄 Changelog

### Version 1.0.0
- Initial release
- Complete API implementation
- User authentication and management
- Recipe and bake management
- Community features
- Social interactions
- File upload system
- Comprehensive documentation
