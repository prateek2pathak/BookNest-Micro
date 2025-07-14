# BookNest Microservices Architecture

This directory contains the microservices implementation of BookNest, a book management and community platform.

## Architecture Overview

The application is split into the following microservices:

- **API Gateway** (Port 5000) - Routes requests to appropriate services and handles cross-cutting concerns
- **Auth Service** (Port 5001) - User authentication and authorization
- **Book Service** (Port 5002) - Book management and metadata
- **Comment Service** (Port 5003) - Book reviews and comments
- **Chat Service** (Port 5004) - Real-time chat for book discussions

## Services Description

### 🔐 Auth Service
- User registration and login
- JWT token generation and validation
- User profile management
- Password hashing and security

### 📚 Book Service
- CRUD operations for books
- Image upload via Cloudinary
- Book search and filtering
- Book metadata management

### 💬 Comment Service
- Add comments/reviews to books
- Get comments for specific books
- Delete comments (with proper authorization)
- Comment moderation capabilities

### 🗨️ Chat Service
- Real-time messaging using Socket.IO
- Book-specific chat rooms
- Message persistence
- Typing indicators
- User presence

### 🌐 API Gateway
- Request routing to microservices
- Rate limiting and security
- Service health monitoring
- Load balancing
- CORS handling

## Quick Start

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- MongoDB (or use Docker setup)

### Option 1: Docker Setup (Recommended)

1. **Start all services with Docker Compose:**
   ```bash
   cd microservices
   docker-compose up -d
   ```

2. **Check service status:**
   ```bash
   docker-compose ps
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f [service-name]
   ```

4. **Stop all services:**
   ```bash
   docker-compose down
   ```

### Option 2: Local Development

1. **Install dependencies for each service:**
   ```bash
   # Install dependencies for all services
   cd auth-service && npm install && cd ..
   cd book-service && npm install && cd ..
   cd comment-service && npm install && cd ..
   cd chat-service && npm install && cd ..
   cd api-gateway && npm install && cd ..
   ```

2. **Set up environment variables:**
   Copy `.env.example` to `.env` in each service directory and configure:
   ```bash
   cp auth-service/.env.example auth-service/.env
   cp book-service/.env.example book-service/.env
   cp comment-service/.env.example comment-service/.env
   cp chat-service/.env.example chat-service/.env
   cp api-gateway/src/.env.example api-gateway/src/.env
   ```

3. **Start MongoDB:**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7
   
   # Or install locally and start
   mongod
   ```

4. **Start each service:**
   ```bash
   # Terminal 1 - Auth Service
   cd auth-service && npm run dev
   
   # Terminal 2 - Book Service
   cd book-service && npm run dev
   
   # Terminal 3 - Comment Service
   cd comment-service && npm run dev
   
   # Terminal 4 - Chat Service
   cd chat-service && npm run dev
   
   # Terminal 5 - API Gateway
   cd api-gateway && npm run dev
   ```

## API Endpoints

All requests go through the API Gateway at `http://localhost:5000`

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/validate` - Validate JWT token
- `GET /api/auth/profile` - Get user profile

### Books
- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get book by ID
- `POST /api/books` - Create new book (requires auth)
- `PUT /api/books/:id` - Update book (requires auth)
- `DELETE /api/books/:id` - Delete book (requires auth)

### Comments
- `GET /api/comments/book/:bookId` - Get comments for a book
- `POST /api/comments` - Add comment (requires auth)
- `DELETE /api/comments/:commentId` - Delete comment (requires auth)

### Chat
- `GET /api/chat/book/:bookId` - Get chat messages for a book
- `GET /api/chat/book/:bookId/recent` - Get recent messages
- `DELETE /api/chat/:messageId` - Delete message (requires auth)

### System
- `GET /api/status` - Service health status
- `GET /health` - Gateway health check

## WebSocket Events (Chat)

Connect to `http://localhost:5000/socket.io` or directly to chat service at `http://localhost:5004/socket.io`

### Client Events
- `join_book_chat` - Join chat room for specific book
- `leave_book_chat` - Leave chat room
- `send_message` - Send message to book chat
- `typing` - Indicate user is typing
- `stop_typing` - Stop typing indicator

### Server Events
- `receive_message` - Receive new message
- `user_typing` - User started typing
- `user_stop_typing` - User stopped typing
- `error` - Error occurred

## Environment Variables

### Common Variables
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/booknest_service
NODE_ENV=development
```

### Auth Service
```env
JWT_SECRET=your-super-secret-jwt-key
```

### Book Service
```env
AUTH_SERVICE_URL=http://localhost:5001
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### Comment Service
```env
AUTH_SERVICE_URL=http://localhost:5001
```

### Chat Service
```env
CLIENT_URL=http://localhost:3000
```

### API Gateway
```env
AUTH_SERVICE_URL=http://localhost:5001
BOOK_SERVICE_URL=http://localhost:5002
COMMENT_SERVICE_URL=http://localhost:5003
CHAT_SERVICE_URL=http://localhost:5004
CLIENT_URL=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Database Setup

Each service uses its own MongoDB database:
- `booknest_auth` - User data
- `booknest_books` - Book data
- `booknest_comments` - Comment data
- `booknest_chat` - Chat messages

## Testing

### Manual Testing
1. Start all services
2. Use Postman or curl to test endpoints
3. Check logs for any errors

### Health Checks
```bash
# Check gateway health
curl http://localhost:5000/health

# Check service status
curl http://localhost:5000/api/status

# Check individual service health
curl http://localhost:5001/health  # Auth
curl http://localhost:5002/health  # Books
curl http://localhost:5003/health  # Comments
curl http://localhost:5004/health  # Chat
```

## Monitoring and Logging

- All services log to console
- API Gateway logs all proxy requests
- Health checks run every 30 seconds
- Rate limiting prevents abuse

## Security Features

- JWT-based authentication
- Rate limiting (100 requests per 15 minutes)
- CORS configuration
- Input validation
- Helmet.js security headers
- Service-to-service authentication

## Deployment

### Production Considerations
1. Use environment-specific `.env` files
2. Set up proper MongoDB clusters
3. Configure reverse proxy (nginx)
4. Set up SSL certificates
5. Use proper secret management
6. Set up monitoring and alerting
7. Configure log aggregation

### Scaling
- Each service can be scaled independently
- Use load balancers for high availability
- Consider using Kubernetes for orchestration
- Implement service mesh for advanced networking

## Troubleshooting

### Common Issues
1. **Service not starting**: Check environment variables and dependencies
2. **Database connection failed**: Verify MongoDB is running and connection string
3. **Authentication errors**: Check JWT secret consistency across services
4. **CORS errors**: Verify CLIENT_URL configuration

### Debug Mode
Set `NODE_ENV=development` and check console logs for detailed error information.

## Development

### Adding New Endpoints
1. Add route in respective service
2. Update API Gateway if needed
3. Update this documentation

### Adding New Services
1. Create new service directory
2. Follow existing service structure
3. Add to docker-compose.yml
4. Register in API Gateway
5. Update documentation

## Contributing

1. Follow existing code structure
2. Add proper error handling
3. Include logging
4. Update documentation
5. Test thoroughly before deployment
