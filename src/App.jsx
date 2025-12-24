import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, off, update, remove } from 'firebase/database';
import { Users, ChevronRight, Check, X, Clock, Trophy, Crown, Wifi, WifiOff, Copy, LogOut, Volume2, VolumeX } from 'lucide-react';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAeJ_aa7TlPdTSpRpur3fCIoQKJtkP_1O4",
  authDomain: "christmas-quiz-d3d58.firebaseapp.com",
  databaseURL: "https://christmas-quiz-d3d58-default-rtdb.firebaseio.com",
  projectId: "christmas-quiz-d3d58",
  storageBucket: "christmas-quiz-d3d58.firebasestorage.app",
  messagingSenderId: "536444120586",
  appId: "1:536444120586:web:c94e176cb1f9cec56b39f3"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// =====================
// SOUND EFFECTS SYSTEM
// =====================
class SoundManager {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
  }

  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  playTone(frequency, duration, type = 'sine', volume = 0.3) {
    if (!this.enabled || !this.audioContext) return;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  playBuzzer() {
    if (!this.enabled) return;
    this.init();
    this.playTone(880, 0.1, 'square', 0.4);
    setTimeout(() => this.playTone(1100, 0.1, 'square', 0.4), 100);
    setTimeout(() => this.playTone(1320, 0.15, 'square', 0.4), 200);
  }

  playCorrect() {
    if (!this.enabled) return;
    this.init();
    this.playTone(523, 0.15, 'sine', 0.3);
    setTimeout(() => this.playTone(659, 0.15, 'sine', 0.3), 150);
    setTimeout(() => this.playTone(784, 0.2, 'sine', 0.3), 300);
    setTimeout(() => this.playTone(1047, 0.3, 'sine', 0.3), 450);
  }

  playWrong() {
    if (!this.enabled) return;
    this.init();
    this.playTone(400, 0.15, 'sawtooth', 0.3);
    setTimeout(() => this.playTone(300, 0.15, 'sawtooth', 0.3), 150);
    setTimeout(() => this.playTone(200, 0.3, 'sawtooth', 0.3), 300);
  }

  playTick() {
    if (!this.enabled) return;
    this.init();
    this.playTone(800, 0.05, 'sine', 0.2);
  }

  playTimeUp() {
    if (!this.enabled) return;
    this.init();
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.playTone(600, 0.1, 'square', 0.3);
        setTimeout(() => this.playTone(400, 0.1, 'square', 0.3), 100);
      }, i * 250);
    }
  }

  playVictory() {
    if (!this.enabled) return;
    this.init();
    const notes = [523, 523, 523, 659, 784, 659, 784];
    const durations = [0.15, 0.15, 0.15, 0.15, 0.3, 0.15, 0.4];
    let time = 0;
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, durations[i], 'sine', 0.3), time);
      time += durations[i] * 800;
    });
  }

  playClick() {
    if (!this.enabled) return;
    this.init();
    this.playTone(600, 0.05, 'sine', 0.15);
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}

const soundManager = new SoundManager();

// Category metadata
const categoryMeta = {
  trivia: { name: "Christmas Trivia", icon: "🎄", color: "from-red-500 to-red-600" },
  movies: { name: "Movies", icon: "🎬", color: "from-purple-500 to-pink-500" },
  nineties: { name: "90's Songs", icon: "📻", color: "from-cyan-500 to-blue-500" },
  music: { name: "Music", icon: "🎵", color: "from-green-500 to-emerald-500" },
  visual: { name: "Visual", icon: "👀", color: "from-yellow-500 to-orange-500" },
  general: { name: "General Knowledge", icon: "🧠", color: "from-indigo-500 to-purple-500" },
  science: { name: "Science", icon: "🔬", color: "from-blue-500 to-cyan-500" },
  geography: { name: "Geography", icon: "🌍", color: "from-green-600 to-teal-500" },
  food: { name: "Food & Drink", icon: "🍕", color: "from-orange-500 to-red-500" },
};

// Questions
const allQuestions = {
  trivia: [
    { id: 't1', question: "In which country did the tradition of putting up a Christmas tree originate?", options: ["England", "Germany", "USA", "France"], answer: "Germany" },
    { id: 't2', question: "What is the name of the main character in 'A Christmas Carol'?", options: ["Bob Cratchit", "Ebenezer Scrooge", "Tiny Tim", "Jacob Marley"], answer: "Ebenezer Scrooge" },
    { id: 't3', question: "How many gifts are given in total in 'The Twelve Days of Christmas'?", options: ["12", "78", "364", "144"], answer: "364" },
    { id: 't4', question: "What plant is traditionally hung for kissing underneath at Christmas?", options: ["Holly", "Ivy", "Mistletoe", "Poinsettia"], answer: "Mistletoe" },
    { id: 't5', question: "Which reindeer shares its name with a famous mythological character?", options: ["Dasher", "Cupid", "Comet", "Blitzen"], answer: "Cupid" },
    { id: 't6', question: "How many ghosts appear in 'A Christmas Carol'?", options: ["3", "4", "5", "6"], answer: "4" },
    { id: 't7', question: "What country did St. Nicholas originally come from?", options: ["Finland", "Turkey", "Greece", "Russia"], answer: "Turkey" },
    { id: 't8', question: "What is traditionally hidden inside a Christmas pudding?", options: ["A ring", "A coin", "A thimble", "All of these"], answer: "All of these" },
    { id: 't9', question: "In which country is it tradition to eat KFC for Christmas dinner?", options: ["USA", "UK", "Japan", "Australia"], answer: "Japan" },
    { id: 't10', question: "In Australia, Christmas falls during which season?", options: ["Spring", "Summer", "Fall", "Winter"], answer: "Summer" },
  ],
  movies: [
    { id: 'mov1', question: "In 'Home Alone', where are the McCallisters going on vacation?", options: ["London", "Paris", "Rome", "Miami"], answer: "Paris" },
    { id: 'mov2', question: "What is the name of the Grinch's dog?", options: ["Spot", "Max", "Buddy", "Rex"], answer: "Max" },
    { id: 'mov3', question: "In 'Elf', what does Buddy put in his spaghetti?", options: ["Chocolate chips", "Maple syrup", "Marshmallows", "All of the above"], answer: "All of the above" },
    { id: 'mov4', question: "What movie features the line 'You'll shoot your eye out!'?", options: ["Elf", "A Christmas Story", "Home Alone", "Jingle All the Way"], answer: "A Christmas Story" },
    { id: 'mov5', question: "In 'How the Grinch Stole Christmas', what is too small for the Grinch?", options: ["His shoes", "His heart", "His house", "His sleigh"], answer: "His heart" },
    { id: 'mov6', question: "What gift does Ralphie want in 'A Christmas Story'?", options: ["A bicycle", "A Red Ryder BB gun", "A train set", "A puppy"], answer: "A Red Ryder BB gun" },
    { id: 'mov7', question: "What toy is the father trying to get in 'Jingle All the Way'?", options: ["Tickle Me Elmo", "Turbo Man", "Power Rangers", "Buzz Lightyear"], answer: "Turbo Man" },
    { id: 'mov8', question: "In 'The Santa Clause', what happens when Scott puts on the suit?", options: ["He flies", "He gains weight and grows a beard", "He turns invisible", "He shrinks"], answer: "He gains weight and grows a beard" },
    { id: 'mov9', question: "What is the name of the angel in 'It's a Wonderful Life'?", options: ["Gabriel", "Michael", "Clarence", "George"], answer: "Clarence" },
    { id: 'mov10', question: "In 'Die Hard', what building does the action take place in?", options: ["Empire State Building", "Nakatomi Plaza", "Sears Tower", "Trump Tower"], answer: "Nakatomi Plaza" },
  ],
  nineties: [
    { id: '90s1', question: "Who sang 'All I Want for Christmas Is You' in 1994?", options: ["Whitney Houston", "Mariah Carey", "Celine Dion", "Madonna"], answer: "Mariah Carey" },
    { id: '90s2', question: "Which boy band released 'Merry Christmas, Happy Holidays' in 1998?", options: ["Backstreet Boys", "*NSYNC", "98 Degrees", "New Kids on the Block"], answer: "*NSYNC" },
    { id: '90s3', question: "What British band released 'Stay Another Day' in 1994?", options: ["Take That", "Oasis", "East 17", "Blur"], answer: "East 17" },
    { id: '90s4', question: "Who sang 'Christmas Eve/Sarajevo 12/24' in 1996?", options: ["Mannheim Steamroller", "Trans-Siberian Orchestra", "Enya", "Yanni"], answer: "Trans-Siberian Orchestra" },
    { id: '90s5', question: "What 90s R&B group released 'This Christmas' in 1993?", options: ["Boyz II Men", "TLC", "En Vogue", "SWV"], answer: "Boyz II Men" },
  ],
  music: [
    { id: 'm1', question: "Who originally sang 'White Christmas'?", options: ["Frank Sinatra", "Bing Crosby", "Elvis Presley", "Dean Martin"], answer: "Bing Crosby" },
    { id: 'm2', question: "In 'Frosty the Snowman', what made Frosty come to life?", options: ["Magic snow", "An old silk hat", "Christmas spirit", "A child's wish"], answer: "An old silk hat" },
    { id: 'm3', question: "Who sang 'Last Christmas'?", options: ["Wham!", "Duran Duran", "Culture Club", "Spandau Ballet"], answer: "Wham!" },
    { id: 'm4', question: "Complete: 'Deck the halls with boughs of ___'", options: ["mistletoe", "holly", "ivy", "pine"], answer: "holly" },
    { id: 'm5', question: "Who released 'Rockin' Around the Christmas Tree' in 1958?", options: ["Brenda Lee", "Connie Francis", "Patsy Cline", "Peggy Lee"], answer: "Brenda Lee" },
  ],
  visual: [
    { id: 'v1', question: "What color are traditional Christmas stockings?", options: ["Blue", "Red", "Green", "White"], answer: "Red", emoji: "🧦" },
    { id: 'v2', question: "What shape is a traditional Christmas tree?", options: ["Round", "Square", "Triangle/Cone", "Oval"], answer: "Triangle/Cone", emoji: "🎄" },
    { id: 'v3', question: "What sits on top of most Christmas trees?", options: ["Snowflake", "Star or Angel", "Bell", "Candle"], answer: "Star or Angel", emoji: "⭐" },
    { id: 'v4', question: "What color is Rudolph's famous nose?", options: ["Orange", "Pink", "Red", "Yellow"], answer: "Red", emoji: "🔴" },
    { id: 'v5', question: "What color is the Grinch?", options: ["Red", "Blue", "Green", "Purple"], answer: "Green", emoji: "💚" },
  ],
  general: [
    { id: 'g1', question: "What is the largest planet in our solar system?", options: ["Saturn", "Jupiter", "Neptune", "Uranus"], answer: "Jupiter" },
    { id: 'g2', question: "In what year did World War II end?", options: ["1943", "1944", "1945", "1946"], answer: "1945" },
    { id: 'g3', question: "What is the capital of Australia?", options: ["Sydney", "Melbourne", "Canberra", "Perth"], answer: "Canberra" },
    { id: 'g4', question: "How many sides does a hexagon have?", options: ["5", "6", "7", "8"], answer: "6" },
    { id: 'g5', question: "What is the chemical symbol for gold?", options: ["Go", "Gd", "Au", "Ag"], answer: "Au" },
  ],
  science: [
    { id: 's1', question: "What is the chemical formula for water?", options: ["HO2", "H2O", "OH2", "H2O2"], answer: "H2O" },
    { id: 's2', question: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi body"], answer: "Mitochondria" },
    { id: 's3', question: "What element does 'O' represent on the periodic table?", options: ["Gold", "Osmium", "Oxygen", "Oganesson"], answer: "Oxygen" },
    { id: 's4', question: "What is the nearest star to Earth?", options: ["Proxima Centauri", "Alpha Centauri", "The Sun", "Sirius"], answer: "The Sun" },
    { id: 's5', question: "What force keeps us on the ground?", options: ["Magnetism", "Friction", "Gravity", "Inertia"], answer: "Gravity" },
  ],
  geography: [
    { id: 'geo1', question: "What is the capital of Canada?", options: ["Toronto", "Vancouver", "Ottawa", "Montreal"], answer: "Ottawa" },
    { id: 'geo2', question: "Which country has the largest population?", options: ["USA", "India", "China", "Indonesia"], answer: "India" },
    { id: 'geo3', question: "What is the tallest mountain in the world?", options: ["K2", "Kangchenjunga", "Mount Everest", "Lhotse"], answer: "Mount Everest" },
    { id: 'geo4', question: "Which river flows through London?", options: ["Seine", "Thames", "Danube", "Rhine"], answer: "Thames" },
    { id: 'geo5', question: "What is the largest desert in the world?", options: ["Sahara", "Arabian", "Gobi", "Antarctic"], answer: "Antarctic" },
  ],
  food: [
    { id: 'f1', question: "What country does sushi originate from?", options: ["China", "Korea", "Japan", "Thailand"], answer: "Japan" },
    { id: 'f2', question: "What is the main ingredient in guacamole?", options: ["Tomato", "Avocado", "Pepper", "Onion"], answer: "Avocado" },
    { id: 'f3', question: "What type of pasta is shaped like bow ties?", options: ["Penne", "Fusilli", "Farfalle", "Rigatoni"], answer: "Farfalle" },
    { id: 'f4', question: "What is the most consumed beverage in the world after water?", options: ["Coffee", "Tea", "Beer", "Soft drinks"], answer: "Tea" },
    { id: 'f5', question: "What country does feta cheese come from?", options: ["Italy", "France", "Greece", "Spain"], answer: "Greece" },
  ],
};

const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

const Snowflakes = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    {Array.from({ length: 15 }, (_, i) => (
      <div key={i} className="absolute text-white/20" style={{ left: `${Math.random()*100}%`, animation: `fall ${5+Math.random()*10}s linear infinite`, animationDelay: `${Math.random()*5}s`, fontSize: `${10+Math.random()*15}px` }}>❄</div>
    ))}
    <style>{`@keyframes fall { 0% { transform: translateY(-10vh); } 100% { transform: translateY(110vh); } }`}</style>
  </div>
);

export default function App() {
  const [connected, setConnected] = useState(false);
  const [screen, setScreen] = useState('home');
  const [isHost, setIsHost] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [gameState, setGameState] = useState(null);
  const [players, setPlayers] = useState({});
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [localTimer, setLocalTimer] = useState(30);
  const [copied, setCopied] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const lastTickRef = useRef(null);
  const timerExpiredRef = useRef(false);

  useEffect(() => {
    let id = localStorage.getItem('playerId');
    if (!id) {
      id = 'p_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('playerId', id);
    }
    setPlayerId(id);
    const savedName = localStorage.getItem('playerName');
    if (savedName) setPlayerName(savedName);
    
    const initSound = () => {
      soundManager.init();
      document.removeEventListener('click', initSound);
    };
    document.addEventListener('click', initSound);
    return () => document.removeEventListener('click', initSound);
  }, []);

  useEffect(() => {
    const connRef = ref(db, '.info/connected');
    onValue(connRef, (snap) => setConnected(snap.val() === true));
    return () => off(connRef);
  }, []);

  useEffect(() => {
    if (!roomCode) return;
    const roomRef = ref(db, `rooms/${roomCode}`);
    onValue(roomRef, (snap) => {
      const data = snap.val();
      if (data) {
        setGameState(data.game || null);
        setPlayers(data.players || {});
      } else if (!isHost) {
        alert('Game ended by host');
        leaveGame();
      }
    });
    return () => off(roomRef);
  }, [roomCode, isHost]);

  useEffect(() => {
    if (!gameState?.timerEnd) return;
    timerExpiredRef.current = false;
    
    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((gameState.timerEnd - Date.now()) / 1000));
      setLocalTimer(remaining);
      
      if (remaining <= 5 && remaining > 0 && remaining !== lastTickRef.current) {
        soundManager.playTick();
        lastTickRef.current = remaining;
      }
      
      if (remaining === 0 && !timerExpiredRef.current) {
        timerExpiredRef.current = true;
        soundManager.playTimeUp();
        if (isHost && gameState.phase !== 'reveal') handleTimeUp();
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 100);
    return () => clearInterval(interval);
  }, [gameState?.timerEnd, gameState?.phase, isHost]);

  useEffect(() => {
    if (gameState?.questionIndex !== undefined) {
      setSelectedAnswer(null);
      setHasAnswered(false);
      lastTickRef.current = null;
      timerExpiredRef.current = false;
    }
  }, [gameState?.questionIndex]);

  useEffect(() => {
    if (gameState?.buzzedPlayer && gameState?.phase === 'answering') {
      soundManager.playBuzzer();
    }
  }, [gameState?.buzzedPlayer, gameState?.phase]);

  const handleTimeUp = async () => {
    if (!isHost) return;
    await update(ref(db, `rooms/${roomCode}/game`), { phase: 'reveal' });
  };

  const createGame = async () => {
    if (!playerName.trim()) return alert('Enter your name');
    soundManager.init();
    soundManager.playClick();
    const code = generateRoomCode();
    await set(ref(db, `rooms/${code}`), {
      host: playerId,
      hostName: playerName.trim(),
      createdAt: Date.now(),
      game: { status: 'lobby' },
      players: { [playerId]: { name: playerName.trim(), score: 0, isHost: true, joinedAt: Date.now() } }
    });
    localStorage.setItem('playerName', playerName.trim());
    setRoomCode(code);
    setIsHost(true);
    setScreen('lobby');
  };

  const joinGame = async () => {
    if (!playerName.trim()) return alert('Enter your name');
    if (!joinCode.trim() || joinCode.length !== 4) return alert('Enter 4-letter room code');
    soundManager.init();
    soundManager.playClick();
    const code = joinCode.toUpperCase();
    const checkRoom = await new Promise(resolve => {
      onValue(ref(db, `rooms/${code}`), (snap) => resolve(snap.val()), { onlyOnce: true });
    });
    if (!checkRoom) return alert('Room not found');
    await set(ref(db, `rooms/${code}/players/${playerId}`), {
      name: playerName.trim(), score: 0, isHost: false, joinedAt: Date.now()
    });
    localStorage.setItem('playerName', playerName.trim());
    setRoomCode(code);
    setIsHost(false);
    setScreen('lobby');
  };

  const leaveGame = async () => {
    if (roomCode && playerId) {
      if (isHost) await remove(ref(db, `rooms/${roomCode}`));
      else await remove(ref(db, `rooms/${roomCode}/players/${playerId}`));
    }
    setRoomCode('');
    setGameState(null);
    setPlayers({});
    setIsHost(false);
    setScreen('home');
  };

  const startRound = async (category) => {
    soundManager.playClick();
    const qs = [...allQuestions[category]].sort(() => Math.random() - 0.5).slice(0, 5);
    await update(ref(db, `rooms/${roomCode}/game`), {
      status: 'playing', category, questions: qs, questionIndex: 0,
      currentQuestion: qs[0], phase: 'buzzer', buzzedPlayer: null,
      timerEnd: Date.now() + 30000, answers: {}
    });
  };

  const buzzIn = async () => {
    if (gameState?.phase !== 'buzzer' || gameState?.buzzedPlayer || localTimer === 0) return;
    await update(ref(db, `rooms/${roomCode}/game`), {
      buzzedPlayer: playerId, phase: 'answering', timerEnd: Date.now() + 15000
    });
  };

  const submitAnswer = async (answer) => {
    if (hasAnswered || localTimer === 0) return;
    soundManager.playClick();
    setSelectedAnswer(answer);
    setHasAnswered(true);
    
    const correct = answer === gameState.currentQuestion.answer;
    const points = correct ? 100 + Math.max(0, localTimer * 3) : 0;
    
    if (correct) soundManager.playCorrect();
    else soundManager.playWrong();
    
    await update(ref(db, `rooms/${roomCode}/game/answers/${playerId}`), { answer, correct, points, time: Date.now() });
    
    if (correct) {
      const currentScore = players[playerId]?.score || 0;
      await update(ref(db, `rooms/${roomCode}/players/${playerId}`), { score: currentScore + points });
    }
    
    setTimeout(() => update(ref(db, `rooms/${roomCode}/game`), { phase: 'reveal' }), 500);
  };

  const nextQuestion = async () => {
    soundManager.playClick();
    const nextIdx = gameState.questionIndex + 1;
    if (nextIdx >= gameState.questions.length) {
      soundManager.playVictory();
      await update(ref(db, `rooms/${roomCode}/game`), { status: 'roundEnd', phase: null });
    } else {
      await update(ref(db, `rooms/${roomCode}/game`), {
        questionIndex: nextIdx, currentQuestion: gameState.questions[nextIdx],
        phase: 'buzzer', buzzedPlayer: null, timerEnd: Date.now() + 30000, answers: {}
      });
    }
  };

  const backToLobby = async () => {
    soundManager.playClick();
    await update(ref(db, `rooms/${roomCode}/game`), { status: 'lobby', category: null, questions: null, currentQuestion: null, phase: null });
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    soundManager.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSound = () => setSoundEnabled(soundManager.toggle());

  const sortedPlayers = Object.entries(players).map(([id, p]) => ({ id, ...p })).sort((a, b) => (b.score || 0) - (a.score || 0));

  // HOME SCREEN
  const renderHome = () => (
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-red-800 to-green-900 p-4 relative">
      <Snowflakes />
      <div className="max-w-md mx-auto relative z-10 pt-8">
        <button onClick={toggleSound} className="absolute top-2 right-2 text-white/60 hover:text-white p-2">
          {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🎄</div>
          <h1 className="text-4xl font-bold text-white mb-1">Christmas Quiz</h1>
          <p className="text-green-200">Multi-Device Edition</p>
          <div className={`flex items-center justify-center gap-2 mt-2 ${connected ? 'text-green-400' : 'text-red-400'}`}>
            {connected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span className="text-sm">{connected ? 'Connected' : 'Connecting...'}</span>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-6">
          <input type="text" value={playerName} onChange={(e) => setPlayerName(e.target.value)} placeholder="Your name" className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 text-lg text-center font-medium" maxLength={15} />
        </div>
        <div className="space-y-3">
          <button onClick={createGame} disabled={!connected} className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-between shadow-lg active:scale-95 transition-transform">
            <span className="flex items-center gap-3"><Crown className="w-6 h-6" />Host New Game</span><ChevronRight />
          </button>
          <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/20"></div></div><div className="relative flex justify-center"><span className="px-4 text-white/60 text-sm">or</span></div></div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <input type="text" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 4))} placeholder="ROOM CODE" className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 text-2xl text-center font-mono tracking-widest uppercase" maxLength={4} />
            <button onClick={joinGame} disabled={!connected || joinCode.length !== 4} className="w-full mt-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg active:scale-95 transition-transform">Join Game</button>
          </div>
        </div>
        <p className="text-center text-white/40 text-sm mt-8">{Object.values(allQuestions).reduce((s, c) => s + c.length, 0)} questions • {Object.keys(allQuestions).length} categories</p>
      </div>
    </div>
  );

  // LOBBY
  const renderLobby = () => (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-800 p-4">
      <Snowflakes />
      <div className="max-w-md mx-auto relative z-10">
        <div className="flex justify-between items-center mb-6">
          <button onClick={leaveGame} className="text-white/70 flex items-center gap-1"><LogOut className="w-4 h-4" />Leave</button>
          <div className="flex items-center gap-3">
            <button onClick={toggleSound} className="text-white/60 hover:text-white">{soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}</button>
            <div className={`flex items-center gap-1 ${connected ? 'text-green-400' : 'text-red-400'}`}>{connected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}</div>
          </div>
        </div>
        <div className="text-center mb-6">
          <p className="text-green-200 mb-1">Room Code</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-5xl font-mono font-bold text-white tracking-widest">{roomCode}</span>
            <button onClick={copyCode} className="text-white/70 hover:text-white"><Copy className="w-6 h-6" /></button>
          </div>
          {copied && <p className="text-green-400 text-sm mt-1">Copied!</p>}
          <p className="text-white/60 text-sm mt-2">Share this code with other players</p>
        </div>
        <div className="bg-white/10 rounded-xl p-4 mb-6">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2"><Users className="w-5 h-5" /> Players ({Object.keys(players).length})</h3>
          <div className="space-y-2">
            {sortedPlayers.map((p) => (
              <div key={p.id} className="flex items-center justify-between bg-white/10 rounded-lg px-3 py-2">
                <span className="text-white flex items-center gap-2">{p.isHost && <Crown className="w-4 h-4 text-yellow-400" />}{p.name}{p.id === playerId && <span className="text-white/40 text-xs">(you)</span>}</span>
                <span className="text-green-300 font-bold">{p.score || 0}</span>
              </div>
            ))}
          </div>
        </div>
        {isHost ? (
          <div>
            <p className="text-white text-center mb-4 font-medium">Choose a category:</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(categoryMeta).map(([key, meta]) => (
                <button key={key} onClick={() => startRound(key)} className={`bg-gradient-to-r ${meta.color} text-white font-bold py-3 px-3 rounded-xl flex items-center gap-2 active:scale-95 transition-transform`}>
                  <span className="text-xl">{meta.icon}</span><span className="text-sm">{meta.name}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center"><div className="text-6xl mb-3">⏳</div><p className="text-white text-lg">Waiting for host...</p></div>
        )}
      </div>
    </div>
  );

  // PLAYING
  const renderPlaying = () => {
    const meta = categoryMeta[gameState?.category] || {};
    const q = gameState?.currentQuestion;
    const phase = gameState?.phase;
    const buzzedPlayer = gameState?.buzzedPlayer;
    const isBuzzedPlayer = buzzedPlayer === playerId;
    const answers = gameState?.answers || {};
    const timeUp = localTimer === 0;

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4">
        <div className="max-w-lg mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2"><span className="text-2xl">{meta.icon}</span><span className="text-white">{meta.name}</span></div>
            <div className="flex items-center gap-3">
              <button onClick={toggleSound} className="text-white/60 hover:text-white">{soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}</button>
              <span className="text-white/60">Q{(gameState?.questionIndex || 0) + 1}/5</span>
              <div className={`px-3 py-1 rounded-full text-white flex items-center gap-1 ${localTimer <= 5 ? 'bg-red-500 animate-pulse' : 'bg-white/20'}`}><Clock className="w-4 h-4" />{localTimer}s</div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 mb-4 shadow-lg">
            {q?.emoji && <div className="text-5xl text-center mb-3">{q.emoji}</div>}
            <h3 className="text-lg font-bold text-gray-800">{q?.question}</h3>
          </div>

          {phase === 'buzzer' && !buzzedPlayer && (
            <div className="mb-4">
              <button onClick={buzzIn} disabled={timeUp} className={`w-full text-white font-bold py-8 rounded-2xl text-2xl shadow-lg transition-all ${timeUp ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-500 hover:bg-red-400 active:scale-95 animate-pulse'}`}>
                {timeUp ? "⏱️ TIME'S UP!" : "🔔 BUZZ!"}
              </button>
              {!timeUp && <p className="text-center text-white/60 mt-2">First to buzz answers!</p>}
            </div>
          )}

          {phase === 'answering' && buzzedPlayer && (
            <div className="mb-4">
              <p className="text-center text-yellow-400 mb-3 font-bold text-xl">🔔 {players[buzzedPlayer]?.name} buzzed!</p>
              {isBuzzedPlayer ? (
                <div className="space-y-2">
                  {q?.options.map((opt, i) => (
                    <button key={i} onClick={() => submitAnswer(opt)} disabled={hasAnswered || timeUp}
                      className={`w-full py-3 px-4 rounded-xl font-medium text-left transition-all ${hasAnswered || timeUp ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white active:scale-98'} ${selectedAnswer === opt ? 'bg-blue-500 text-white' : 'bg-white/90 text-gray-800'}`}>
                      {opt}
                    </button>
                  ))}
                  {timeUp && !hasAnswered && <p className="text-center text-red-400 font-bold mt-2">⏱️ Too slow!</p>}
                </div>
              ) : (
                <div className="text-center text-white"><div className="text-4xl mb-2">👀</div><p>{timeUp ? "Time ran out!" : "Waiting for answer..."}</p></div>
              )}
            </div>
          )}

          {phase === 'reveal' && (
            <div className="mb-4">
              <div className="space-y-2 mb-4">
                {q?.options.map((opt, i) => (
                  <div key={i} className={`w-full py-3 px-4 rounded-xl font-medium flex items-center gap-2 ${opt === q.answer ? 'bg-green-500 text-white' : answers[playerId]?.answer === opt && !answers[playerId]?.correct ? 'bg-red-500 text-white' : 'bg-white/20 text-white/60'}`}>
                    {opt === q.answer && <Check className="w-5 h-5" />}
                    {answers[playerId]?.answer === opt && !answers[playerId]?.correct && <X className="w-5 h-5" />}
                    {opt}
                  </div>
                ))}
              </div>
              {buzzedPlayer ? (
                <p className={`text-center font-bold mb-4 ${answers[buzzedPlayer]?.correct ? 'text-green-400' : 'text-red-400'}`}>
                  {players[buzzedPlayer]?.name}: {answers[buzzedPlayer]?.correct ? `✓ +${answers[buzzedPlayer]?.points}` : '✗ Wrong!'}
                </p>
              ) : (
                <p className="text-center text-yellow-400 font-bold mb-4">⏱️ No one buzzed!</p>
              )}
              {isHost ? (
                <button onClick={nextQuestion} className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
                  {(gameState?.questionIndex || 0) < 4 ? 'Next Question' : 'See Results'} <ChevronRight />
                </button>
              ) : (
                <p className="text-center text-white/60">Waiting for host...</p>
              )}
            </div>
          )}

          <div className="bg-white/10 rounded-xl p-3">
            <div className="grid grid-cols-3 gap-2">
              {sortedPlayers.slice(0, 6).map((p, i) => (
                <div key={p.id} className={`text-center py-2 px-1 rounded-lg ${p.id === playerId ? 'bg-white/20' : ''}`}>
                  <div className="text-white text-sm truncate">{i === 0 && '👑'}{p.name}</div>
                  <div className="text-green-300 font-bold">{p.score}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ROUND END
  const renderRoundEnd = () => {
    const meta = categoryMeta[gameState?.category] || { icon: '🎯', name: 'Round' };
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-700 to-green-900 p-4">
        <Snowflakes />
        <div className="max-w-md mx-auto relative z-10 pt-8">
          <div className="text-center mb-6">
            <div className="text-6xl mb-3">🎉</div>
            <h2 className="text-3xl font-bold text-white">Round Complete!</h2>
            <p className="text-green-200">{meta.icon} {meta.name}</p>
          </div>
          <div className="space-y-2 mb-6">
            {sortedPlayers.map((p, i) => (
              <div key={p.id} className={`rounded-xl p-4 flex items-center gap-4 ${i === 0 ? 'bg-yellow-300 text-yellow-900' : i === 1 ? 'bg-gray-200 text-gray-800' : i === 2 ? 'bg-orange-300 text-orange-900' : 'bg-white/80 text-gray-800'}`}>
                <div className="text-2xl font-bold w-10">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</div>
                <div className="flex-1 font-bold flex items-center gap-2">{p.name}{p.id === playerId && <span className="text-xs opacity-60">(you)</span>}</div>
                <div className="text-2xl font-bold">{p.score}</div>
              </div>
            ))}
          </div>
          {isHost ? (
            <div className="space-y-2">
              <button onClick={backToLobby} className="w-full bg-white text-green-800 font-bold py-3 rounded-xl active:scale-95 transition-transform">Play Another Round</button>
              <button onClick={leaveGame} className="w-full bg-white/20 text-white font-bold py-3 rounded-xl active:scale-95 transition-transform">End Game</button>
            </div>
          ) : (
            <p className="text-center text-white">Waiting for host...</p>
          )}
        </div>
      </div>
    );
  };

  const getScreen = () => {
    if (screen === 'home') return renderHome();
    if (screen === 'lobby') {
      if (gameState?.status === 'playing') return renderPlaying();
      if (gameState?.status === 'roundEnd') return renderRoundEnd();
      return renderLobby();
    }
    return renderHome();
  };

  return <div className="font-sans">{getScreen()}</div>;
}
