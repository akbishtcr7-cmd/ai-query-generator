# AI Query Generator & Database Assistant 🚀

A production-ready full-stack MERN application that converts plain English into optimized database queries using **Google Gemini AI**.

---

## ✨ Features

- 🤖 **AI Query Generation** — Convert English to MySQL, PostgreSQL, MongoDB, SQLite, Oracle SQL, SQL Server
- 🔐 **JWT Authentication** — Access tokens + Refresh tokens + Role-based access control
- 🛡️ **Enterprise Security** — Risk analysis engine, prompt injection protection, SQL injection detection
- 📋 **Admin Approval System** — CRITICAL queries require admin review before use
- 📊 **Dashboard & Analytics** — Charts, stats, query trends
- 💬 **AI Chat Assistant** — Ask anything about queries and databases
- 📝 **Query History & Favorites** — Save, organize, and revisit queries
- 📤 **Export System** — Export as SQL, TXT, JSON
- 🎨 **Dark Glassmorphism UI** — Purple + Blue neon theme

---

## 🏗️ Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS, Framer Motion, Recharts |
| Backend   | Node.js, Express.js               |
| Database  | MongoDB + Mongoose                |
| AI        | Google Gemini 1.5 Flash           |
| Auth      | JWT (Access + Refresh tokens)     |
| Deploy    | Vercel (frontend) + Render (backend) + MongoDB Atlas |

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account (free tier works)
- Google Gemini API key (free at [aistudio.google.com](https://aistudio.google.com))

---

### 1. Clone & Setup

```bash
git clone <your-repo-url>
cd ai-query-generator
```

### 2. Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Fill in your .env values (see below)
npm run dev
```

**Backend `.env`:**
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/ai-query-generator
JWT_SECRET=your_super_secret_jwt_key_minimum_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_minimum_32_chars
GEMINI_API_KEY=your_gemini_api_key_here
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Frontend Setup

```bash
cd client
npm install
cp .env.example .env
# .env: VITE_API_URL=http://localhost:5000/api
npm run dev
```

Visit `http://localhost:5173`

---

## 📁 Project Structure

```
ai-query-generator/
├── server/                   # Express.js backend
│   └── src/
│       ├── config/           # DB + Gemini config
│       ├── controllers/      # Auth, Query, History, Admin
│       ├── middleware/        # Auth, Role, Error middleware
│       ├── models/           # User, QueryHistory, FavoriteQuery, PendingQuery, AuditLog
│       ├── routes/           # API routes
│       ├── services/         # Gemini, Risk Engine, Query Formatter
│       └── utils/            # Token utils, Response handler
│
└── client/                   # React + Vite frontend
    └── src/
        ├── components/       # Reusable UI components
        ├── pages/            # Page components
        ├── context/          # Auth + Query context
        ├── services/         # API services
        ├── routes/           # Protected routing
        └── utils/            # Helper utilities
```

---

## 🔐 Security Features

### Query Risk Levels

| Level    | Commands                    | Action                  |
|----------|-----------------------------|-------------------------|
| SAFE     | SELECT, SHOW, DESCRIBE      | ✅ Allowed immediately  |
| WARNING  | INSERT, UPDATE              | ⚠️ Requires confirmation |
| CRITICAL | DELETE, DROP, ALTER, CREATE | 🔴 Admin approval needed |

### Blocked Commands (Always)
`CREATE USER`, `DROP USER`, `GRANT`, `REVOKE`, `DROP DATABASE`, `SUPERUSER`, `ROOT ACCESS`, `PRIVILEGE ESCALATION`

---

## 🌐 Deployment

### Frontend → Vercel
1. Push `client/` to GitHub
2. Import in Vercel
3. Set `VITE_API_URL=https://your-backend.onrender.com/api`
4. Deploy

### Backend → Render
1. Push `server/` to GitHub
2. Create new Web Service on Render
3. Add all environment variables
4. Deploy

### Database → MongoDB Atlas
1. Create free cluster
2. Whitelist `0.0.0.0/0` for Render
3. Copy connection string to `MONGO_URI`

---

## 🎯 API Endpoints

### Auth
| Method | Endpoint               | Description        |
|--------|------------------------|--------------------|
| POST   | /api/auth/register     | Register user      |
| POST   | /api/auth/login        | Login              |
| POST   | /api/auth/logout       | Logout             |
| POST   | /api/auth/refresh      | Refresh token      |
| GET    | /api/auth/me           | Get current user   |
| PUT    | /api/auth/profile      | Update profile     |
| PUT    | /api/auth/change-password | Change password |

### Query
| Method | Endpoint               | Description        |
|--------|------------------------|--------------------|
| POST   | /api/query/generate    | Generate AI query  |
| POST   | /api/query/format      | Format/minify query|
| POST   | /api/query/chat        | AI chat assistant  |
| GET    | /api/query/dashboard   | Dashboard stats    |

### History
| Method | Endpoint                    | Description      |
|--------|-----------------------------|------------------|
| GET    | /api/history                | Get history      |
| GET    | /api/history/:id            | Get single query |
| DELETE | /api/history/:id            | Delete query     |
| POST   | /api/history/:id/favorite   | Add to favorites |
| DELETE | /api/history/:id/favorite   | Remove favorite  |
| GET    | /api/history/favorites      | Get favorites    |

### Admin (requires admin/superadmin role)
| Method | Endpoint                      | Description        |
|--------|-------------------------------|--------------------|
| GET    | /api/admin/stats              | Admin statistics   |
| GET    | /api/admin/pending            | Pending queries    |
| PUT    | /api/admin/pending/:id/review | Review query       |
| GET    | /api/admin/audit-logs         | Audit logs         |
| GET    | /api/admin/users              | All users          |
| PUT    | /api/admin/users/:id/role     | Update user role   |
| PUT    | /api/admin/users/:id/toggle   | Toggle user status |

---

## 📝 User Roles

| Role       | Permissions                                     |
|------------|-------------------------------------------------|
| user       | Generate queries, view history, favorites, chat |
| admin      | All user perms + approve/reject pending queries, view audit logs, manage users |
| superadmin | All admin perms + change user roles            |

---

## 🎨 UI Theme

- **Background:** Deep dark `#080812`
- **Glass cards:** `rgba(255,255,255,0.05)` with backdrop blur
- **Primary accent:** Purple `#8b5cf6`
- **Secondary accent:** Blue `#3b82f6`
- **Neon glow:** Box shadows on interactive elements

---

## 📄 License

MIT License — feel free to use and modify.

---

Built with ❤️ using React, Node.js, MongoDB & Google Gemini AI
