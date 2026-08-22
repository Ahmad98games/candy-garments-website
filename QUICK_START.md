# 🚀 Quick Start Guide - Run Both Servers Together

## The Problem You Had

When you tried to use the frontend, it said "Cannot connect to server" because:

1. Backend wasn't running
2. You had to start frontend and backend separately in different terminals

## ✅ The Solution - One Command to Rule Them All

I've set up your project so **one command starts everything**!

---

## 🎯 Option 1: With In-Memory MongoDB (FASTEST - Recommended for Quick Start)

This starts both servers AND uses temporary MongoDB (no installation needed):

```powershell
npm run dev:memory
```

**What happens:**

- ✅ Backend starts with in-memory MongoDB on port 3001
- ✅ Frontend starts on port 5173
- ✅ Both run together in one terminal
- ⚠️ Data won't persist after restart (temporary database)

**When to use:** Quick testing, development, when you don't have MongoDB installed

---

## 🎯 Option 2: With Real MongoDB

If you've set up MongoDB (local or Atlas), use:

```powershell
npm run dev
```

**What happens:**

- ✅ Backend starts and connects to your MongoDB (from .env)
- ✅ Frontend starts on port 5173
- ✅ Both run together in one terminal
- ✅ Data persists in real database

**When to use:** After you've set up MongoDB Atlas or installed MongoDB locally

---

## 📋 Step-by-Step Instructions

### First Time Setup

1. **Open PowerShell in the root folder** (`E-Commerce Website (Full)`)

2. **Make sure dependencies are installed:**

   ```powershell
   npm run install:all
   ```

   This installs packages for root, frontend, AND backend.

3. **Choose your startup method:**

   **For Quick Testing (No MongoDB needed):**

   ```powershell
   npm run dev:memory
   ```

   **For Production Setup (MongoDB required):**

   ```powershell
   npm run dev
   ```

4. **Wait for both servers to start** (takes 10-30 seconds)

5. **Open your browser:**
   - Frontend: <http://localhost:5173>
   - Backend API: <http://localhost:3001/api/health>

---

## 🎨 What You'll See

When you run `npm run dev:memory`, you'll see output like this:

```
[0] > backend@1.0.0 dev
[0] > nodemon server.js
[1] > frontend@0.0.1 dev
[1] > vite

[0] Starting system bootstrap...
[0] ✅ In-memory MongoDB connected successfully
[0] System bootstrap completed { mode: 'READY' }
[0] Server running on port 3001

[1] VITE v5.2.0  ready in 1234 ms
[1] ➜  Local:   http://localhost:5173/
[1] ➜  Network: use --host to expose
```

**Legend:**

- `[0]` = Backend messages
- `[1]` = Frontend messages

---

## 🛑 How to Stop Both Servers

Press `Ctrl + C` in the terminal - it will stop both servers at once!

---

## 🔧 Available Commands

| Command | What It Does |
|---------|-------------|
| `npm run dev:memory` | Start both servers with temporary in-memory MongoDB |
| `npm run dev` | Start both servers with real MongoDB (from .env) |
| `npm run install:all` | Install all dependencies (root, frontend, backend) |
| `npm run build` | Build frontend for production |
| `npm start` | Start only backend in production mode |

---

## 🐛 Troubleshooting

### "Cannot connect to server" error in browser

**Check:**

1. Did both servers start? Look for `[0]` and `[1]` in terminal
2. Is backend on port 3001? Check terminal output
3. Is frontend on port 5173? Check terminal output

**Fix:**

- Stop servers (Ctrl+C)
- Run `npm run dev:memory` again

### "Port already in use" error

**Fix:**

```powershell
# Kill processes on port 3001 (backend)
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess -Force

# Kill processes on port 5173 (frontend)
Stop-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess -Force

# Then start again
npm run dev:memory
```

### Backend shows "SYSTEM_DEGRADED"

**If using `npm run dev`:**

- You need MongoDB! Either:
  - Use `npm run dev:memory` instead (temporary DB)
  - Or set up MongoDB (see MONGODB_SETUP.md)

**If using `npm run dev:memory`:**

- This shouldn't happen. Check backend logs for errors.

### Frontend can't reach backend API

**Check backend .env file has:**

```
PORT=3001
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173
```

---

## 📁 Project Structure

```
E-Commerce Website (Full)/
├── package.json          ← Root package (runs both servers)
├── frontend/
│   ├── package.json      ← Frontend dependencies
│   └── src/              ← React app
└── backend/
    ├── package.json      ← Backend dependencies
    ├── server.js         ← Express server
    └── .env              ← Configuration (PORT, MongoDB, etc.)
```

---

## ✨ Summary

**Before:** Had to run frontend and backend in separate terminals  
**After:** One command starts everything!

**Quick Start:**

```powershell
cd "c:\E-Commerce Website (Full)"
npm run dev:memory
```

**Then open:** <http://localhost:5173>

That's it! 🎉
