# EPHEXA - Secure Real-Time Communication Platform

A production-ready, interest-based chat platform for verified adults (18+) with comprehensive safety and moderation features.

## 🎯 Features

- **Interest-Based Matching** - Connect with people who share your interests
- **Real-Time Messaging** - Powered by Socket.IO with typing indicators
- **18+ Age Verification** - Mandatory adult confirmation during signup
- **Profanity Filtering** - Automatic content moderation
- **Rate Limiting** - Anti-spam protection (10 messages/10 seconds)
- **Report & Block System** - User safety controls with auto-ban
- **Session-Based Data** - Messages auto-delete after 24 hours
- **Privacy First** - No real names, IP hashing, minimal data retention

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript + Vite
- Tailwind CSS
- React Router v6
- Zustand (state management)
- Socket.IO Client

### Backend
- Node.js + Express + TypeScript
- Socket.IO
- PostgreSQL + Prisma ORM
- Redis (sessions, rate limiting)
- JWT Authentication

## 📁 Project Structure

```
Ephexa/
├── ephexa-frontend/          # React frontend
│   ├── src/
│   │   ├── components/         # UI, chat, layout components
│   │   ├── pages/              # Route pages
│   │   ├── hooks/              # Custom React hooks
│   │   ├── stores/             # Zustand stores
│   │   ├── services/           # API & Socket services
│   │   └── types/              # TypeScript types
│   └── .env.example
│
└── ephexa-backend/           # Node.js backend
    ├── src/
    │   ├── config/             # Database & Redis config
    │   ├── controllers/        # Route handlers
    │   ├── middleware/         # Auth, error handling
    │   ├── routes/             # API routes
    │   ├── services/           # Business logic
    │   ├── socket/             # Socket.IO handlers
    │   └── utils/              # Helpers, profanity filter
    ├── prisma/
    │   ├── schema.prisma       # Database schema
    │   └── seed.ts             # Test data
    └── .env.example
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### 1. Clone & Install

```bash
# Frontend
cd ephexa-frontend
npm install
cp .env.example .env

# Backend
cd ../ephexa-backend
npm install
cp .env.example .env
```

### 2. Configure Environment

**Backend `.env`:**
```env
PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/ephexa
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
```

### 3. Setup Database

```bash
cd ephexa-backend
npx prisma generate
npx prisma db push
npm run seed
```

### 4. Start Development Servers

```bash
# Terminal 1 - Backend
cd ephexa-backend
npm run dev

# Terminal 2 - Frontend
cd ephexa-frontend
npm run dev
```

Open http://localhost:5173 in your browser.

## 📝 Test Accounts

After seeding, use these credentials:
- `alice@test.com` / `password123`
- `bob@test.com` / `password123`
- `carol@test.com` / `password123`

## 🔐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| DELETE | `/api/auth/account` | Delete account |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chats` | List user's chats |
| POST | `/api/chats` | Join/create chat |
| DELETE | `/api/chats/:id` | Leave chat |
| GET | `/api/chats/:id/messages` | Get messages |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get profile |
| POST | `/api/users/block/:id` | Block user |
| POST | `/api/users/report/:id` | Report user |

## 🔌 Socket Events

### Client → Server
- `join_room` - Join a chat room
- `leave_room` - Leave a chat room
- `send_message` - Send a message
- `typing` - Typing indicator

### Server → Client
- `message` - New message received
- `user_joined` / `user_left` - Room updates
- `typing_indicator` - Someone is typing
- `rate_limited` - Rate limit hit
- `moderation_action` - Mute/disconnect

## 🛡️ Safety Features

1. **Profanity Filter** - Real-time content filtering
2. **Rate Limiting** - 10 messages per 10 seconds
3. **Report System** - 5 reports = automatic 24h ban
4. **Block System** - Hide users from each other
5. **Session TTL** - Messages deleted after 24 hours
6. **IP Hashing** - Never store raw IP addresses

## 📄 License

ISC
