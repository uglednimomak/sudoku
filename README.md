# 🎸 Metal Sudoku - Enhanced Edition

A heavy metal-themed Sudoku game with global leaderboards, user sessions, and SQLite database integration.

## 🚀 Features

### Game Features
- **5 Difficulty Levels**: From Beginner to Expert
- **Timer & Scoring System**: Track your performance with dynamic scoring
- **Reset Button**: Reset current puzzle without generating a new one
- **Hint System**: Get help when you're stuck
- **Real-time Validation**: Immediate feedback on moves

### Database & User Features
- **User Registration**: First-time visitors enter a username
- **Session Management**: Automatic session tracking
- **Game History**: Personal history of all completed games
- **Global Leaderboards**:
  - Fastest completion times across all users
  - Highest scores across all users
- **Persistent Data**: All data stored in SQLite database

### UI/UX Features
- **Metal Theme**: Dark theme with gold accents and metal styling
- **Responsive Design**: Works on desktop and mobile
- **Smooth Animations**: Victory animations and hover effects
- **Collapsible Sections**: Clean interface with expandable history/leaderboards

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Initialize Database**
   ```bash
   npm run init-db
   ```

3. **Start the Server**
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

4. **Access the Game**
   Open your browser and go to: `http://localhost:3000`

## 🗄️ Database Schema

The application uses SQLite with the following tables:

- **users**: Player information and statistics
- **games**: Individual game records
- **sessions**: Session management for user tracking

## 🎮 How to Play

1. **First Visit**: Enter your username when prompted
2. **Select Difficulty**: Choose from 5 difficulty levels
3. **Play**: Click cells and use number pad or keyboard to fill the grid
4. **Track Progress**: View your history and compete on global leaderboards

## 🏆 Scoring System

- **Base Points**: Vary by difficulty (100-800 points)
- **Speed Bonus**: Faster completion = higher score
- **Global Competition**: Compare with players worldwide

## 📁 Project Structure

```
metal-sudoku-improved/
├── index.html          # Main game interface
├── app.js              # Game logic and API integration
├── style.css           # Metal-themed styling
├── server.js           # Express server with API endpoints
├── package.json        # Dependencies and scripts
├── database/
│   ├── schema.sql      # Database schema
│   └── metal_sudoku.db # SQLite database (created after init)
└── scripts/
    └── init-db.js      # Database initialization script
```

## 🔧 API Endpoints

- `GET /api/session` - Get/create user session
- `POST /api/register` - Register new user
- `POST /api/game` - Save completed game
- `GET /api/history` - Get user's game history
- `GET /api/leaderboards` - Get global leaderboards
- `GET /api/user/stats` - Get user statistics

## 🎨 Customization

The metal theme can be customized by modifying CSS variables in `style.css`:

```css
:root {
  --metal-bg: #1a1a1a;
  --metal-surface: #262626;
  --metal-gold: #d4af37;
  --metal-silver: #c0c0c0;
  /* ... more variables */
}
```

## 🚀 Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use a process manager like PM2
3. Configure reverse proxy (nginx/Apache)
4. Enable HTTPS and update session security settings

## 🤘 Rock On!

Enjoy playing Metal Sudoku and competing with players worldwide! 🎸

A small, client-side web implementation of a Sudoku-like game ("Metal Sudoku").
The project is a static web app consisting of `index.html`, `style.css`, and `app.js`.

## What this repo contains

- `index.html` — main HTML file / entry point
- `style.css` — styles for the game UI
- `app.js` — game logic and UI interactions

## Features

- Browser-based Sudoku-style game
- Single-page, no backend required
- Easy to run locally or host as static files

## Prerequisites

- Any modern web browser (Chrome, Firefox, Safari, Edge)
- Optional: a small static file server for a proper local dev URL (recommended for some browsers)

## Run locally

Option 1 — Open directly (quickest):

- Double-click `index.html` or open it from your browser via File -> Open.

Option 2 — Serve with a simple HTTP server (recommended):

If you have Python 3 installed, run from the project root:

```bash
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

Or, if you prefer Node and have `npm`/`npx`:

```bash
npx http-server -c-1 .  # install-free http server; press Ctrl+C to stop
```

## Development

- Edit `index.html`, `style.css`, and `app.js` as needed.
- Reload the browser to see changes. Use a static server (above) if you run into CORS or file path issues.

## Add this project to a new GitHub repo

From the project root, run these commands to initialize a Git repo, commit, and push to GitHub. Replace `<your-repo-url>` with the URL of your GitHub repository.

```bash
# initialize and make the first commit
git init
git add .
git commit -m "Initial commit — metal-sudoku-improved"

# create a new remote and push (replace <your-repo-url> with your repo HTTPS or SSH URL)
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```

If you use the GitHub CLI (`gh`) you can also create the repo from the command line:

```bash
gh repo create username/metal-sudoku-improved --public --source=. --remote=origin --push
```

## Recommended .gitignore

If you don't already have one, consider ignoring OS and editor files. Example `.gitignore` entries:

```
.DS_Store
node_modules/
*.log
```

## License

This project does not include a license by default. If you want to make it permissive, add a `LICENSE` file. A common choice is the MIT license.

## Contributing

If you'd like help or want to collaborate, open an issue or send a pull request. Keep changes focused and add short notes in your PR explaining the rationale.

## Notes

If you'd like, I can also:
- Add a simple `LICENSE` file (MIT) and a `.gitignore`
- Create a GitHub Actions workflow to deploy to GitHub Pages
- Improve the README with screenshots or a demo link if you provide an image

---

Enjoy! If you want any changes to the README (more detail, screenshots, badges, or a specific license), tell me which and I'll update it.