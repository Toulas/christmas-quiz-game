# 🎄 Christmas Quiz Game - Tournament Edition

A real-time multiplayer family quiz game with buzzer mechanics, tournament mode, **picture rounds with real images**, and extensive Bible content!

## ✨ Features

### Game Modes
- **Single Category** - Quick round with one category
- **Tournament Mode** - Select multiple categories, play back-to-back with cumulative scoring
- **Configurable Questions** - Choose 5, 10, 15, or 20 questions per category

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

**400 questions across 19 categories:**

| Category | Icon | Questions | Notes |
|----------|------|-----------|-------|
| Current Affairs 2025 | 📰 | 20 | Latest news & events |
| 2025 Entertainment | 🔥 | 20 | Music, movies, streaming |
| TV Shows | 📺 | 20 | Popular series |
| History | 🏛️ | 20 | World history |
| Caribbean Christmas | 🌴 | 20 | Regional traditions |
| Christmas Trivia | 🎄 | 20 | General knowledge |
| Christmas Movies | 🎬 | 20 | Holiday films |
| Christmas Music | 🎵 | 20 | Classic songs |
| R&B Music | 🎤 | 20 | Soul & R&B |
| Afrobeats | 🥁 | 20 | African music |
| Reggae | 🇯🇲 | 20 | Caribbean music |
| Pop Culture | 📱 | 20 | Trends & viral |
| Children's Round | 👶 | 20 | Family-friendly |
| **Bible & Nativity** | 📖 | **40** | **Extended for standalone play** |
| Food & Drink | 🍕 | 20 | Culinary trivia |
| Geography | 🌍 | 20 | World facts |
| Anagrams | 🔤 | 20 | Word scrambles |
| Riddles | 🧩 | 20 | Brain teasers |
| **Picture Round** | 🖼️ | **20** | **Real images from Unsplash** |

### 📖 Bible Section (40 Questions)
The Bible category is significantly expanded for families who want to play it as a standalone round:
- **Basic Nativity** (10 questions) - Where, who, what
- **Historical Context** (5 questions) - Census, prophecies, locations
- **Supporting Characters** (7 questions) - Elizabeth, Zechariah, Simeon, Anna
- **Myths vs Facts** (8 questions) - Common misconceptions corrected
- **Old Testament Prophecies** (5 questions) - Isaiah, Micah, Hosea
- **Deeper Details** (5 questions) - Magnificat, circumcision, offerings

### 🖼️ Picture Round (20 Questions with Real Images!)
Visual questions using actual photographs:
- **Source**: Unsplash (free, no attribution required)
- **Topics**: Christmas trees, snowmen, nativity, ornaments, winter activities
- **Fallback**: Emoji displayed if image fails to load
- **Examples**:
  - Christmas tree with star
  - Gingerbread house
  - Snowman in snow
  - Stockings by fireplace
  - Hot chocolate
  - Ice skating
  - Christmas wreath
  - Poinsettia flower

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
   - Find line ~530: `const FAMILY_ACCESS_CODE = "JACKSON2024";`
   - Change to your own family code
   - Push to GitHub (Vercel auto-rebuilds)

### Option 2: Direct Upload

1. Extract the zip file
2. Drag `christmas-quiz-game` folder to Vercel
3. Deploy

---

## 🔐 Security Setup

### Family Access Code
Located in `src/App.jsx` around line 530:
```javascript
const FAMILY_ACCESS_CODE = "JACKSON2024";
```
- Change this to your own secret code
- Share only with family members
- Code persists in browser after first entry

---

## 🎮 How to Play

### Hosting a Game
1. Enter the family access code
2. Enter your name
3. Click "Create Game"
4. Share room code with players
5. Choose Tournament Mode or single category
6. Select number of questions (5/10/15/20)
7. Start the game!

### During Play
1. **Buzzer Phase (30s)** - Read question, tap BUZZ when ready
2. **Answer Phase (15s)** - First buzzer selects answer
3. **Reveal Phase** - See correct answer, host advances
4. Repeat until round/tournament complete

### Picture Round
- Real photographs are displayed
- Players identify what's shown in the image
- Emoji fallback if image doesn't load
- Great for all ages!

### Bible-Only Mode
For a Bible-focused family quiz:
1. Create game
2. Select "Bible & Nativity" category
3. Choose 20 questions (or 40 via tournament with 2x selections)
4. Play through all difficulty levels

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
    └── App.jsx          # Main game (all logic + 400 questions + images)
```

---

## 🖼️ Image Sources

Picture round images are sourced from [Unsplash](https://unsplash.com):
- Free to use
- No attribution required
- High-quality photographs
- Loaded dynamically (requires internet)

If you want to use your own images:
1. Host images somewhere (e.g., Imgur, your own server)
2. Update the `image` URLs in the `pictures` array in `App.jsx`
3. Keep the `fallback` emoji for offline scenarios

---

## 🎅 Quick Start Checklist

- [ ] Deploy to Vercel
- [ ] Change `FAMILY_ACCESS_CODE` in App.jsx
- [ ] Push changes to GitHub
- [ ] Test picture round loads images
- [ ] Share URL with family
- [ ] Share access code with family only
- [ ] Have fun! 🎄

---

Made with ❤️ for family Christmas fun! 🎄🎅🎁

**Stats:** 400 questions • 19 categories • 40 Bible questions • 20 picture questions with real images
