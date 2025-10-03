# 🚀 Metal Sudoku Deployment Guide

## 🎯 **The Problem You Encountered**

The errors you saw happen when the frontend tries to connect to the backend API, but the backend server isn't running or accessible. The game now has **automatic fallback** to localStorage when the backend is unavailable.

## 🔧 **Two Deployment Options**

### Option 1: **Full Backend Deployment** (Recommended)
Deploy both frontend and backend together for full functionality including global leaderboards.

### Option 2: **Static Frontend Only** (Fallback)
Deploy just the HTML/CSS/JS files - the game will automatically use localStorage instead of the database.

---

## 🌐 **Option 1: Full Backend Deployment**

### **For Vercel/Netlify with Node.js Support:**

1. **Create `vercel.json` (for Vercel):**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ]
}
```

2. **Deploy Steps:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### **For Railway/Render/Heroku:**

1. **Add start script to package.json** (already done)
2. **Set environment variables:**
   - `NODE_ENV=production`
   - `PORT=3000` (or let platform set it)

3. **Deploy:**
   - Connect your GitHub repo
   - Platform will automatically run `npm install` and `npm start`

### **For VPS/Server:**

```bash
# Install dependencies
npm install

# Initialize database
npm run init-db

# Install PM2 for process management
npm install -g pm2

# Start with PM2
pm2 start server.js --name "metal-sudoku"

# Setup nginx reverse proxy (optional)
# Point domain to localhost:3000
```

---

## 📁 **Option 2: Static Frontend Only**

If you just want to deploy the frontend files (HTML/CSS/JS), the game will automatically work with localStorage:

### **For GitHub Pages/Netlify/Vercel Static:**

1. **Deploy these files only:**
   - `index.html`
   - `app.js`
   - `style.css`

2. **The game will automatically:**
   - Show the username modal
   - Store user data in localStorage
   - Save game history locally
   - Show personal leaderboards (not global)

### **Static Deployment Commands:**

```bash
# For Netlify
netlify deploy --prod --dir .

# For Vercel (static)
vercel --prod

# For GitHub Pages
# Just push to gh-pages branch
```

---

## 🔍 **How the Fallback Works**

The game now intelligently detects if the backend is available:

1. **Tries to connect to `/api/session`**
2. **If successful:** Uses database features
3. **If fails:** Automatically switches to localStorage
4. **User experience:** Seamless - they won't notice the difference

### **Features Available in Each Mode:**

| Feature | With Backend | localStorage Only |
|---------|-------------|-------------------|
| User Registration | ✅ Global | ✅ Local |
| Game History | ✅ Persistent | ✅ Browser Only |
| Personal Stats | ✅ | ✅ |
| Global Leaderboards | ✅ | ❌ (Personal Only) |
| Cross-device Sync | ✅ | ❌ |

---

## 🐛 **Troubleshooting**

### **If you see API errors:**
- The game will automatically fallback to localStorage
- Check browser console for "falling back to localStorage" messages
- All core functionality will still work

### **For backend deployment issues:**
1. Ensure `npm install` runs successfully
2. Check that `npm run init-db` creates the database
3. Verify `npm start` runs without errors
4. Check server logs for specific error messages

### **Database issues:**
```bash
# Recreate database
rm -f database/metal_sudoku.db
npm run init-db
```

---

## 🎮 **Testing Your Deployment**

1. **Open the deployed URL**
2. **Check browser console** - should see either:
   - "Connected to backend" (full mode)
   - "falling back to localStorage" (static mode)
3. **Complete a game** - verify history saves
4. **Check leaderboards** - should show data

---

## 🚀 **Quick Deploy Commands**

```bash
# Option 1: Full backend (Vercel)
vercel --prod

# Option 2: Static only (Netlify)
netlify deploy --prod --dir .

# Option 3: VPS
npm install && npm run init-db && npm start
```

The game is now **bulletproof** - it works whether you deploy the full backend or just the static files! 🎸
