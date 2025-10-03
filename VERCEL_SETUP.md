# 🚀 Vercel Deployment with Database - COMPLETE GUIDE

## ✅ What This Setup Does

- **Backend API**: Serverless functions in `/api/` folder
- **Database**: Vercel Postgres (cloud database)
- **Frontend**: Static HTML/CSS/JS files
- **Features**: Global leaderboards, user sessions, game history

---

## 📋 Prerequisites

1. Vercel account (free tier works)
2. GitHub repository with your code
3. Vercel CLI installed: `npm i -g vercel`

---

## 🗄️ Step 1: Set Up Vercel Postgres Database

### Option A: Using Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Click on your project (or create new one)
3. Go to **Storage** tab
4. Click **Create Database**
5. Select **Postgres**
6. Choose a name (e.g., "metal-sudoku-db")
7. Click **Create**

### Option B: Using Vercel CLI

```bash
vercel link
vercel postgres create metal-sudoku-db
```

---

## 🔧 Step 2: Initialize Database Schema

After creating the database:

1. In Vercel Dashboard, go to your Postgres database
2. Click on **Query** tab or **.sql** tab
3. Copy and paste the contents of `database/schema-postgres.sql`
4. Click **Run Query** or **Execute**

This creates all tables, indexes, and views.

---

## 🌐 Step 3: Deploy to Vercel

### Using Vercel CLI:

```bash
# Link your project
vercel link

# Deploy
vercel --prod
```

### Using GitHub Integration:

1. Push code to GitHub
2. Go to https://vercel.com/new
3. Import your repository
4. Click **Deploy**

Vercel will automatically:
- Detect the API functions in `/api/` folder
- Connect to your Postgres database
- Deploy your frontend files

---

## ✅ Step 4: Verify Deployment

1. Open your deployed URL (e.g., `https://your-app.vercel.app`)
2. You should see the welcome modal
3. Enter a username
4. Play and complete a game
5. Check history and leaderboards

### Test API Endpoints:

```bash
# Replace YOUR_URL with your Vercel URL
curl https://YOUR_URL.vercel.app/api/session?sessionId=test123
```

Should return JSON with session data.

---

## 🔍 Troubleshooting

### Error: "Database connection failed"

**Solution**: Make sure Vercel Postgres is connected to your project
```bash
vercel env pull
```

This downloads environment variables including `POSTGRES_URL`.

### Error: "Table does not exist"

**Solution**: Run the schema SQL in your Vercel Postgres dashboard

1. Go to Storage → Your Database → Query
2. Paste `database/schema-postgres.sql`
3. Execute

### Error: "CORS policy blocked"

**Solution**: Already handled in API files with CORS headers. If still seeing errors, check browser console for specific endpoint.

---

## 🧪 Local Development

For local development, the app uses SQLite automatically:

```bash
# Install dependencies
npm install

# Initialize local SQLite database
npm run init-db

# Start local server
npm start
```

The `lib/db.js` file automatically switches between:
- **PostgreSQL** when `POSTGRES_URL` environment variable exists (Vercel)
- **SQLite** for local development

---

## 📊 Database Environment Variables

Vercel automatically sets these when you create a Postgres database:

- `POSTGRES_URL` - Full connection string
- `POSTGRES_PRISMA_URL` - Prisma-compatible URL
- `POSTGRES_URL_NON_POOLING` - Direct connection

You don't need to set these manually!

---

## 🎮 Features After Deployment

✅ **Global Leaderboards** - All players compete  
✅ **User Sessions** - Automatic session management  
✅ **Game History** - Persistent across devices  
✅ **Username Registration** - One-time setup  
✅ **Reset Button** - Restart current puzzle  
✅ **Responsive Design** - Works on mobile  

---

## 🚀 Quick Deploy Checklist

- [ ] Create Vercel Postgres database
- [ ] Run `database/schema-postgres.sql` in database
- [ ] Run `vercel --prod` or connect GitHub
- [ ] Test deployed URL
- [ ] Verify username registration works
- [ ] Play a game and check leaderboards

---

## 💡 Tips

1. **Free Tier Limits**: Vercel Postgres free tier has limits. Monitor usage in dashboard.
2. **Database Backups**: Vercel handles backups automatically.
3. **Scaling**: If you get lots of users, upgrade Postgres plan in Vercel dashboard.
4. **Monitoring**: Check Vercel dashboard for function logs and errors.

---

## 🎸 You're Done!

Your Metal Sudoku game is now live with:
- Full backend API
- Cloud database
- Global leaderboards
- User sessions

Rock on! 🤘
