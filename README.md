# 🎄 Christmas Quiz Game 2025

A fun family quiz game with trivia, music, movies, sudoku, and crossword puzzles!

## Features
- **138 built-in questions** across 5 categories
- **Movies Only** round (30 questions)
- **90's Christmas Songs** round (20 questions)
- General Trivia, Music (All Eras), Visual rounds
- Mini Sudoku & Crossword puzzles
- Player scoring with leaderboard
- **Add your own questions** - family can contribute
- **Share questions** via copy/paste codes
- Works on phones, tablets, and laptops

---

## 🚀 Deploy to Vercel (5 minutes)

### Option 1: Drag & Drop (Easiest)
1. Extract the zip file
2. Go to [vercel.com](https://vercel.com) and sign up/login
3. Click "Add New" → "Project"
4. Drag the `christmas-quiz-game` folder onto the page
5. Click "Deploy"
6. Done! Share the URL with your family

### Option 2: GitHub + Vercel
1. Create a new GitHub repo
2. Upload all files from the `christmas-quiz-game` folder
3. Connect to Vercel and deploy

---

## 📱 How Participants Add Questions

1. Open the game link on any device
2. Tap **"Add Questions"** on the home screen
3. Fill in:
   - Your name
   - Category (Trivia, Movies, 90s Songs, etc.)
   - The question
   - 4 answer options
   - Which one is correct
4. Tap **Submit**

### Sharing Questions Between Players

Since each person's phone stores questions locally, use the **Share/Import** feature:

1. **After adding questions:** Go to home screen → tap **"Share Questions"**
2. A code is copied to your clipboard
3. **Send the code** to other players (text, email, etc.)
4. **They import it:** Home screen → **"Import"** → paste the code

Now everyone has the same questions!

---

## 🎮 How to Play

1. **Add Players** - Everyone enters their name
2. **Select a Player** - Tap to highlight who's answering
3. **Pick a Round** - Choose from 7 round types
4. **Answer Questions** - 30 seconds per question
5. **Score Points** - Faster correct answers = more points
6. **View Leaderboard** - See who's winning!

### Scoring
- Correct answer: **100 + (seconds remaining × 3)**
- Sudoku/Crossword: **500 + (seconds remaining × 2)**

---

## 🔧 Running Locally (for testing)

```bash
cd christmas-quiz-game
npm install
npm run dev
```

Open http://localhost:5173

---

## Files Included
```
christmas-quiz-game/
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── index.html
└── src/
    ├── main.jsx
    ├── index.css
    └── App.jsx
```

---

Have fun! 🎅🎄🎁
