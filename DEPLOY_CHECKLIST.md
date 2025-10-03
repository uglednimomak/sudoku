# ✅ DEPLOYMENT CHECKLIST - Vercel with Backend

## 🎯 What We Built

A **full-stack Metal Sudoku game** with:
- ✅ Backend API (serverless functions)
- ✅ Cloud database (Vercel Postgres)
- ✅ Global leaderboards
- ✅ User sessions
- ✅ Game history

---

## 📋 Deploy Steps (IN ORDER)

### 1️⃣ Create Vercel Postgres Database

```bash
# Login to Vercel
vercel login

# Link your project
vercel link

# Create Postgres database
vercel postgres create metal-sudoku-db
```

**OR** use Vercel Dashboard:
- Go to https://vercel.com/dashboard
- Click your project → Storage → Create Database → Postgres

---

### 2️⃣ Initialize Database Schema

**In Vercel Dashboard:**
1. Go to Storage → Your Postgres Database
2. Click "Query" or ".sql" tab
3. Copy ALL contents from `database/schema-postgres.sql`
4. Paste and click "Run Query"

**Verify tables created:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

Should show: `users`, `sessions`, `games`

---

### 3️⃣ Deploy to Vercel

```bash
vercel --prod
```

That's it! Vercel will:
- Build your project
- Deploy API functions
- Connect to Postgres database
- Serve frontend files

---

### 4️⃣ Test Your Deployment

1. **Open deployed URL** (Vercel will show it after deploy)
2. **Check welcome modal** appears
3. **Enter username** (e.g., "TestPlayer")
4. **Play a game** - select difficulty and complete it
5. **Check history** - click "SHOW HISTORY" button
6. **Check leaderboards** - click "SHOW LEADERBOARDS"

---

## 🧪 Test API Endpoints

Replace `YOUR_URL` with your Vercel deployment URL:

```bash
# Test session endpoint
curl "https://YOUR_URL.vercel.app/api/session?sessionId=test123"

# Should return:
# {"sessionId":"test123","hasUser":false,"username":null,"userId":null}
```

---

## 🔍 Troubleshooting

### ❌ "Failed to initialize session"

**Check:**
1. Is Postgres database created?
2. Did you run the schema SQL?
3. Is database connected to your Vercel project?

**Fix:**
```bash
vercel env pull
cat .env.local  # Should show POSTGRES_URL
```

---

### ❌ "Table does not exist"

**Fix:** Run `database/schema-postgres.sql` in Vercel Postgres dashboard

---

### ❌ "CORS error"

**Fix:** Already handled in API files. Clear browser cache and try again.

---

### ❌ "Function timeout"

**Fix:** Vercel free tier has 10s timeout. Upgrade plan if needed.

---

## 🎮 Local Development

```bash
# Install dependencies
npm install

# Initialize local SQLite database
npm run init-db

# Start server
npm start

# Open http://localhost:3000
```

**Note:** Local uses SQLite, production uses Postgres (automatic switching in `lib/db.js`)

---

## 📊 Monitor Your Deployment

**Vercel Dashboard:**
- Functions → See API call logs
- Storage → Monitor database usage
- Analytics → Track visitors

---

## 🚀 You're Live!

Your game is now deployed with:
- ✅ Full backend API
- ✅ Cloud Postgres database
- ✅ Global leaderboards
- ✅ User sessions
- ✅ Game history

**Share your URL and let people play!** 🎸🤘
