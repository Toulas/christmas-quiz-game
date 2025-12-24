# 🎄 Christmas Quiz Game - Tournament Edition

A real-time multiplayer family quiz game with buzzer mechanics, tournament mode, and category tracking!

## ✨ Features

### Game Modes
- **Single Category** - Quick round with one category
- **Tournament Mode** - Select multiple categories, play back-to-back with cumulative scoring
- **Configurable Questions** - Choose 5, 10, or 15 questions per category

### Real-Time Multiplayer
- **Live synchronization** via Firebase
- **Buzzer system** - First to buzz gets to answer
- **30-second buzzer phase** + **15-second answer phase**
- **Unlimited players** (tested with 7+)
- **Auto-expiring rooms** (2 hours)

### Security
- **Family Access Code** - Gate screen prevents random visitors
- **Optional Room Password** - Host can require password to join
- **Random Room Codes** - 4-character alphanumeric codes

### Scoring & Tracking
- **Speed bonus** - 100 points + (seconds remaining × 3)
- **Category performance tracking** - See who's best at each category
- **Live leaderboard** during play
- **Tournament end screen** with overall champion + category champions

---

## 📊 Content

**270 questions across 18 categories:**

| Category | Icon | Questions |
|----------|------|-----------|
| Current Affairs 2025 | 📰 | 15 |
| 2025 Entertainment | 🔥 | 15 |
| TV Shows | 📺 | 15 |
| History | 🏛️ | 15 |
| Caribbean Christmas | 🌴 | 15 |
| Christmas Trivia | 🎄 | 15 |
| Christmas Movies | 🎬 | 15 |
| Christmas Music | 🎵 | 15 |
| R&B Music | 🎤 | 15 |
| Afrobeats | 🥁 | 15 |
| Reggae | 🇯🇲 | 15 |
| Pop Culture | 📱 | 15 |
| Children's Round | 👶 | 15 |
| Bible (Nativity) | 📖 | 15 |
| Food & Drink | 🍕 | 15 |
| Geography | 🌍 | 15 |
| Anagrams | 🔤 | 15 |
| Riddles | 🧩 | 15 |

---

## 🚀 Deployment

### Option 1: GitHub + Vercel (Recommended)

1. **Create GitHub Repository**
   ```bash
   # Upload all files to a new GitHub repo
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Click "Deploy"

3. **Configure Access Code**
   - Edit `src/App.jsx`
   - Find line ~428: `const FAMILY_ACCESS_CODE = "JACKSON2024";`
   - Change to your own family code
   - Push to GitHub (Vercel auto-rebuilds)

### Option 2: Direct Upload

1. Extract the zip file
2. Drag `christmas-quiz-game` folder to Vercel
3. Deploy

---

## 🔐 Security Setup

### Family Access Code
Located in `src/App.jsx` around line 428:
```javascript
const FAMILY_ACCESS_CODE = "JACKSON2024";
```
- Change this to your own secret code
- Share only with family members
- Code persists in browser after first entry

### Room Passwords (Optional)
- Host can enable "Require password to join"
- Players need room code + password to enter

### Private Repository
For extra security, make your GitHub repo private:
- Settings → Danger Zone → Change visibility → Private

---

## 🎮 How to Play

### Hosting a Game
1. Enter the family access code
2. Enter your name
3. Click "Create Game"
4. Share room code with players
5. Choose Tournament Mode or single category
6. Select number of questions (5/10/15)
7. Start the game!

### Joining a Game
1. Enter the family access code
2. Enter your name
3. Enter the 4-letter room code
4. Enter room password (if required)
5. Click "Join Game"

### During Play
1. **Buzzer Phase (30s)** - Read question, tap BUZZ when ready
2. **Answer Phase (15s)** - First buzzer selects answer
3. **Reveal Phase** - See correct answer, host advances
4. Repeat until round/tournament complete

### Tournament Mode
1. Host clicks "Tournament Mode"
2. Select multiple categories
3. Choose questions per category
4. Play all categories consecutively
5. See final standings + category champions

---

## 🏆 Tournament End Screen

After a tournament, players see:
- **Overall Champion** - Highest total score
- **Final Standings** - All players ranked with medals
- **Category Champions** - Best performer in each category played

---

## 🔧 Local Development

```bash
cd christmas-quiz-game
npm install
npm run dev
```

Open http://localhost:5173

---

## 📁 Project Structure

```
christmas-quiz-game/
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── README.md
└── src/
    ├── main.jsx
    ├── index.css
    └── App.jsx          # Main game (all logic + questions)
```

---

## 🔥 Firebase Configuration

The game uses Firebase Realtime Database. Current config is included and ready to use.

If you want your own Firebase:
1. Create project at [firebase.google.com](https://firebase.google.com)
2. Enable Realtime Database
3. Set rules to allow read/write
4. Replace `firebaseConfig` in `App.jsx`

---

## ⚡ Technical Notes

### Timer Synchronization
- Uses Firebase server timestamp for sync
- Slight drift possible between devices (network latency)
- Buzzer events sync immediately

### Browser Support
- Works on all modern browsers
- Mobile-optimized UI
- Sound effects (can be toggled off)

### Data Persistence
- Player names saved to localStorage
- Family access saved to localStorage
- Room data stored in Firebase (auto-expires after 2 hours)

---

## 🎅 Quick Start Checklist

- [ ] Deploy to Vercel
- [ ] Change `FAMILY_ACCESS_CODE` in App.jsx
- [ ] Push changes to GitHub
- [ ] Share URL with family
- [ ] Share access code with family only
- [ ] Have fun! 🎄

---

## 📱 Live Demo

Your deployed URL: `https://your-project.vercel.app`

---

Made with ❤️ for family Christmas fun! 🎄🎅🎁
