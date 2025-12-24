import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, onSnapshot, updateDoc, deleteDoc, deleteField } from 'firebase/firestore';
import { Users, ChevronRight, Check, X, Clock, Trophy, RotateCcw, Zap, Award, Crown, Wifi, WifiOff, Copy, LogOut, Play } from 'lucide-react';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAeJ_aa7TlPdTSpRpur3fCIoQKJtkP_1O4",
  authDomain: "christmas-quiz-d3d58.firebaseapp.com",
  projectId: "christmas-quiz-d3d58",
  storageBucket: "christmas-quiz-d3d58.firebasestorage.app",
  messagingSenderId: "536444120586",
  appId: "1:536444120586:web:c94e176cb1f9cec56b39f3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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

// Questions database
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
    { id: 't11', question: "In Iceland, how many 'Yule Lads' visit children before Christmas?", options: ["7", "9", "13", "24"], answer: "13" },
    { id: 't12', question: "What do they call Santa Claus in France?", options: ["Papa Noël", "Père Noël", "Saint Nicolas", "Le Père Froid"], answer: "Père Noël" },
    { id: 't13', question: "How many points does a traditional snowflake have?", options: ["4", "5", "6", "8"], answer: "6" },
    { id: 't14', question: "What is Boxing Day?", options: ["A fighting holiday", "The day after Christmas", "A packing holiday", "December 24th"], answer: "The day after Christmas" },
    { id: 't15', question: "What is Advent?", options: ["Christmas Eve", "The 4 weeks before Christmas", "Christmas morning", "New Year's Eve"], answer: "The 4 weeks before Christmas" },
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
    { id: 'mov11', question: "What does Buddy the Elf call the fake Santa?", options: ["An imposter", "A fake", "A liar", "He sits on a throne of lies"], answer: "He sits on a throne of lies" },
    { id: 'mov12', question: "In 'The Nightmare Before Christmas', what is Jack's title?", options: ["Pumpkin King", "Halloween King", "Skeleton King", "Nightmare King"], answer: "Pumpkin King" },
    { id: 'mov13', question: "What does Kevin use to burn Harry's hand in 'Home Alone'?", options: ["A lighter", "A heated doorknob", "Hot water", "A blowtorch"], answer: "A heated doorknob" },
    { id: 'mov14', question: "What is the Grinch's mountain called?", options: ["Mount Crumpit", "Mount Grinch", "Mount Whoville", "Mount Christmas"], answer: "Mount Crumpit" },
    { id: 'mov15', question: "What year was 'Home Alone' released?", options: ["1988", "1990", "1992", "1994"], answer: "1990" },
  ],
  nineties: [
    { id: '90s1', question: "Who sang 'All I Want for Christmas Is You' in 1994?", options: ["Whitney Houston", "Mariah Carey", "Celine Dion", "Madonna"], answer: "Mariah Carey" },
    { id: '90s2', question: "What year did Mariah Carey release 'All I Want for Christmas Is You'?", options: ["1992", "1994", "1996", "1998"], answer: "1994" },
    { id: '90s3', question: "Which boy band released 'Merry Christmas, Happy Holidays' in 1998?", options: ["Backstreet Boys", "*NSYNC", "98 Degrees", "New Kids on the Block"], answer: "*NSYNC" },
    { id: '90s4', question: "What British band released 'Stay Another Day' in 1994?", options: ["Take That", "Oasis", "East 17", "Blur"], answer: "East 17" },
    { id: '90s5', question: "Which 1990 movie's soundtrack made 'Somewhere in My Memory' famous?", options: ["Edward Scissorhands", "Home Alone", "Goodfellas", "Pretty Woman"], answer: "Home Alone" },
    { id: '90s6', question: "Who sang 'Christmas Eve/Sarajevo 12/24' in 1996?", options: ["Mannheim Steamroller", "Trans-Siberian Orchestra", "Enya", "Yanni"], answer: "Trans-Siberian Orchestra" },
    { id: '90s7', question: "What 90s R&B group released 'This Christmas' in 1993?", options: ["Boyz II Men", "TLC", "En Vogue", "SWV"], answer: "Boyz II Men" },
    { id: '90s8', question: "Who released 'Where Are You Christmas?' from the Grinch movie?", options: ["Celine Dion", "Faith Hill", "Mariah Carey", "LeAnn Rimes"], answer: "Faith Hill" },
    { id: '90s9', question: "What band performed 'Christmas in Hollis' featured in Die Hard?", options: ["Run-DMC", "Beastie Boys", "Public Enemy", "LL Cool J"], answer: "Run-DMC" },
    { id: '90s10', question: "What Hanson holiday song was released in 1997?", options: ["MMMBop Christmas", "Snowed In", "At Christmas", "Merry Christmas Baby"], answer: "At Christmas" },
  ],
  music: [
    { id: 'm1', question: "Who originally sang 'White Christmas'?", options: ["Frank Sinatra", "Bing Crosby", "Elvis Presley", "Dean Martin"], answer: "Bing Crosby" },
    { id: 'm2', question: "In 'Frosty the Snowman', what made Frosty come to life?", options: ["Magic snow", "An old silk hat", "Christmas spirit", "A child's wish"], answer: "An old silk hat" },
    { id: 'm3', question: "Who sang 'Last Christmas'?", options: ["Wham!", "Duran Duran", "Culture Club", "Spandau Ballet"], answer: "Wham!" },
    { id: 'm4', question: "Complete: 'Deck the halls with boughs of ___'", options: ["mistletoe", "holly", "ivy", "pine"], answer: "holly" },
    { id: 'm5', question: "Who released 'Rockin' Around the Christmas Tree' in 1958?", options: ["Brenda Lee", "Connie Francis", "Patsy Cline", "Peggy Lee"], answer: "Brenda Lee" },
    { id: 'm6', question: "What Christmas song was originally written for Thanksgiving?", options: ["White Christmas", "Jingle Bells", "Winter Wonderland", "Silver Bells"], answer: "Jingle Bells" },
    { id: 'm7', question: "Who sang 'Blue Christmas'?", options: ["Frank Sinatra", "Dean Martin", "Elvis Presley", "Johnny Cash"], answer: "Elvis Presley" },
    { id: 'm8', question: "What song mentions 'five golden rings'?", options: ["Jingle Bells", "Deck the Halls", "The Twelve Days of Christmas", "We Wish You a Merry Christmas"], answer: "The Twelve Days of Christmas" },
    { id: 'm9', question: "Who recorded 'Feliz Navidad'?", options: ["José Feliciano", "Julio Iglesias", "Luis Miguel", "Enrique Iglesias"], answer: "José Feliciano" },
    { id: 'm10', question: "Complete: 'Grandma got run over by a ___'", options: ["sleigh", "reindeer", "snowplow", "car"], answer: "reindeer" },
  ],
  visual: [
    { id: 'v1', question: "What color are traditional Christmas stockings?", options: ["Blue", "Red", "Green", "White"], answer: "Red", emoji: "🧦" },
    { id: 'v2', question: "What shape is a traditional Christmas tree?", options: ["Round", "Square", "Triangle/Cone", "Oval"], answer: "Triangle/Cone", emoji: "🎄" },
    { id: 'v3', question: "What sits on top of most Christmas trees?", options: ["Snowflake", "Star or Angel", "Bell", "Candle"], answer: "Star or Angel", emoji: "⭐" },
    { id: 'v4', question: "What color is Rudolph's famous nose?", options: ["Orange", "Pink", "Red", "Yellow"], answer: "Red", emoji: "🔴" },
    { id: 'v5', question: "What shape is a candy cane?", options: ["Straight line", "Circle", "J-shape/Hook", "Spiral"], answer: "J-shape/Hook", emoji: "🍬" },
    { id: 'v6', question: "What color is the Grinch?", options: ["Red", "Blue", "Green", "Purple"], answer: "Green", emoji: "💚" },
    { id: 'v7', question: "What does a snowman traditionally use for a nose?", options: ["Stick", "Button", "Carrot", "Coal"], answer: "Carrot", emoji: "⛄" },
    { id: 'v8', question: "What color is Santa's belt?", options: ["Brown", "Red", "Black", "Gold"], answer: "Black", emoji: "🎅" },
  ],
  general: [
    { id: 'g1', question: "What is the largest planet in our solar system?", options: ["Saturn", "Jupiter", "Neptune", "Uranus"], answer: "Jupiter" },
    { id: 'g2', question: "In what year did World War II end?", options: ["1943", "1944", "1945", "1946"], answer: "1945" },
    { id: 'g3', question: "What is the capital of Australia?", options: ["Sydney", "Melbourne", "Canberra", "Perth"], answer: "Canberra" },
    { id: 'g4', question: "How many sides does a hexagon have?", options: ["5", "6", "7", "8"], answer: "6" },
    { id: 'g5', question: "What is the chemical symbol for gold?", options: ["Go", "Gd", "Au", "Ag"], answer: "Au" },
    { id: 'g6', question: "Who painted the Mona Lisa?", options: ["Michelangelo", "Leonardo da Vinci", "Raphael", "Donatello"], answer: "Leonardo da Vinci" },
    { id: 'g7', question: "What is the smallest country in the world?", options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"], answer: "Vatican City" },
    { id: 'g8', question: "What year did the Titanic sink?", options: ["1910", "1911", "1912", "1913"], answer: "1912" },
    { id: 'g9', question: "What is the hardest natural substance on Earth?", options: ["Gold", "Iron", "Diamond", "Platinum"], answer: "Diamond" },
    { id: 'g10', question: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Mercury"], answer: "Mars" },
    { id: 'g11', question: "What is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], answer: "Pacific" },
    { id: 'g12', question: "Who wrote 'Romeo and Juliet'?", options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"], answer: "William Shakespeare" },
  ],
  science: [
    { id: 's1', question: "What is the chemical formula for water?", options: ["HO2", "H2O", "OH2", "H2O2"], answer: "H2O" },
    { id: 's2', question: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi body"], answer: "Mitochondria" },
    { id: 's3', question: "What element does 'O' represent on the periodic table?", options: ["Gold", "Osmium", "Oxygen", "Oganesson"], answer: "Oxygen" },
    { id: 's4', question: "How many teeth does an adult human typically have?", options: ["28", "30", "32", "34"], answer: "32" },
    { id: 's5', question: "What is the nearest star to Earth?", options: ["Proxima Centauri", "Alpha Centauri", "The Sun", "Sirius"], answer: "The Sun" },
    { id: 's6', question: "What gas makes up most of Earth's atmosphere?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"], answer: "Nitrogen" },
    { id: 's7', question: "What force keeps us on the ground?", options: ["Magnetism", "Friction", "Gravity", "Inertia"], answer: "Gravity" },
    { id: 's8', question: "What is the boiling point of water in Celsius?", options: ["90°C", "100°C", "110°C", "120°C"], answer: "100°C" },
    { id: 's9', question: "How many chromosomes do humans have?", options: ["23", "46", "48", "64"], answer: "46" },
    { id: 's10', question: "What planet has the most moons?", options: ["Jupiter", "Saturn", "Uranus", "Neptune"], answer: "Saturn" },
  ],
  geography: [
    { id: 'geo1', question: "What is the capital of Canada?", options: ["Toronto", "Vancouver", "Ottawa", "Montreal"], answer: "Ottawa" },
    { id: 'geo2', question: "Which country has the largest population?", options: ["USA", "India", "China", "Indonesia"], answer: "India" },
    { id: 'geo3', question: "What is the tallest mountain in the world?", options: ["K2", "Kangchenjunga", "Mount Everest", "Lhotse"], answer: "Mount Everest" },
    { id: 'geo4', question: "Which river flows through London?", options: ["Seine", "Thames", "Danube", "Rhine"], answer: "Thames" },
    { id: 'geo5', question: "What country is known as the Land of the Rising Sun?", options: ["China", "Korea", "Japan", "Thailand"], answer: "Japan" },
    { id: 'geo6', question: "What is the largest desert in the world?", options: ["Sahara", "Arabian", "Gobi", "Antarctic"], answer: "Antarctic" },
    { id: 'geo7', question: "Which US state is the largest by area?", options: ["Texas", "California", "Alaska", "Montana"], answer: "Alaska" },
    { id: 'geo8', question: "What is the capital of Brazil?", options: ["Rio de Janeiro", "São Paulo", "Brasília", "Salvador"], answer: "Brasília" },
    { id: 'geo9', question: "What sea lies between Europe and Africa?", options: ["Red Sea", "Black Sea", "Mediterranean Sea", "Caspian Sea"], answer: "Mediterranean Sea" },
    { id: 'geo10', question: "What is the smallest US state by area?", options: ["Delaware", "Rhode Island", "Connecticut", "New Jersey"], answer: "Rhode Island" },
  ],
  food: [
    { id: 'f1', question: "What country does sushi originate from?", options: ["China", "Korea", "Japan", "Thailand"], answer: "Japan" },
    { id: 'f2', question: "What is the main ingredient in guacamole?", options: ["Tomato", "Avocado", "Pepper", "Onion"], answer: "Avocado" },
    { id: 'f3', question: "What type of pasta is shaped like bow ties?", options: ["Penne", "Fusilli", "Farfalle", "Rigatoni"], answer: "Farfalle" },
    { id: 'f4', question: "What is the most consumed beverage in the world after water?", options: ["Coffee", "Tea", "Beer", "Soft drinks"], answer: "Tea" },
    { id: 'f5', question: "What country does feta cheese come from?", options: ["Italy", "France", "Greece", "Spain"], answer: "Greece" },
    { id: 'f6', question: "What vegetable is used to make pickles?", options: ["Zucchini", "Cucumber", "Squash", "Eggplant"], answer: "Cucumber" },
    { id: 'f7', question: "What nut is used to make marzipan?", options: ["Walnut", "Hazelnut", "Almond", "Cashew"], answer: "Almond" },
    { id: 'f8', question: "What country is Parmesan cheese from?", options: ["France", "Switzerland", "Italy", "Spain"], answer: "Italy" },
    { id: 'f9', question: "What is the main ingredient in hummus?", options: ["Lentils", "Chickpeas", "Black beans", "Kidney beans"], answer: "Chickpeas" },
    { id: 'f10', question: "What country does paella originate from?", options: ["Mexico", "Italy", "Spain", "Portugal"], answer: "Spain" },
  ],
};

// Generate room code
const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

// Snowflakes background
const Snowflakes = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    {Array.from({ length: 15 }, (_, i) => (
      <div key={i} className="absolute text-white/20" style={{ left: `${Math.random()*100}%`, animation: `fall ${5+Math.random()*10}s linear infinite`, animationDelay: `${Math.random()*5}s`, fontSize: `${10+Math.random()*15}px` }}>❄</div>
    ))}
    <style>{`@keyframes fall { 0% { transform: translateY(-10vh); } 100% { transform: translateY(110vh); } }`}</style>
  </div>
);

// Main App
export default function App() {
  const [connected, setConnected] = useState(true);
  const [screen, setScreen] = useState('home');
  const [isHost, setIsHost] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [roomData, setRoomData] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [localTimer, setLocalTimer] = useState(30);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // Generate player ID on mount
  useEffect(() => {
    let id = localStorage.getItem('xmas-playerId');
    if (!id) {
      id = 'p_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('xmas-playerId', id);
    }
    setPlayerId(id);
    const savedName = localStorage.getItem('xmas-playerName');
    if (savedName) setPlayerName(savedName);
  }, []);

  // Listen to room changes
  useEffect(() => {
    if (!roomCode) return;
    
    const roomRef = doc(db, 'rooms', roomCode);
    const unsub = onSnapshot(roomRef, (snap) => {
      if (snap.exists()) {
        setRoomData(snap.data());
        setConnected(true);
      } else if (!isHost) {
        alert('Game ended by host');
        leaveGame();
      }
    }, (err) => {
      console.error('Firestore error:', err);
      setConnected(false);
    });
    
    return () => unsub();
  }, [roomCode, isHost]);

  // Timer sync
  useEffect(() => {
    if (!roomData?.game?.timerEnd) return;
    
    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((roomData.game.timerEnd - Date.now()) / 1000));
      setLocalTimer(remaining);
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 100);
    return () => clearInterval(interval);
  }, [roomData?.game?.timerEnd]);

  // Reset answer state on new question
  useEffect(() => {
    if (roomData?.game?.questionIndex !== undefined) {
      setSelectedAnswer(null);
      setHasAnswered(false);
    }
  }, [roomData?.game?.questionIndex]);

  // Create game (Host)
  const createGame = async () => {
    if (!playerName.trim()) { setError('Enter your name'); return; }
    setError('');
    
    try {
      const code = generateRoomCode();
      const roomRef = doc(db, 'rooms', code);
      
      await setDoc(roomRef, {
        host: playerId,
        hostName: playerName.trim(),
        createdAt: Date.now(),
        game: { status: 'lobby' },
        players: {
          [playerId]: { name: playerName.trim(), score: 0, isHost: true }
        }
      });
      
      localStorage.setItem('xmas-playerName', playerName.trim());
      setRoomCode(code);
      setIsHost(true);
      setScreen('lobby');
    } catch (err) {
      console.error(err);
      setError('Failed to create game. Check Firebase rules.');
    }
  };

  // Join game (Player)
  const joinGame = async () => {
    if (!playerName.trim()) { setError('Enter your name'); return; }
    if (!joinCode.trim() || joinCode.length !== 4) { setError('Enter 4-letter room code'); return; }
    setError('');
    
    const code = joinCode.toUpperCase();
    
    try {
      const roomRef = doc(db, 'rooms', code);
      const snap = await getDoc(roomRef);
      
      if (!snap.exists()) { setError('Room not found'); return; }
      
      const data = snap.data();
      const updatedPlayers = {
        ...data.players,
        [playerId]: { name: playerName.trim(), score: 0, isHost: false }
      };
      
      await updateDoc(roomRef, { players: updatedPlayers });
      
      localStorage.setItem('xmas-playerName', playerName.trim());
      setRoomCode(code);
      setIsHost(false);
      setScreen('lobby');
    } catch (err) {
      console.error(err);
      setError('Failed to join. Try again.');
    }
  };

  // Leave game
  const leaveGame = async () => {
    if (roomCode) {
      try {
        if (isHost) {
          await deleteDoc(doc(db, 'rooms', roomCode));
        } else {
          const roomRef = doc(db, 'rooms', roomCode);
          const snap = await getDoc(roomRef);
          if (snap.exists()) {
            const data = snap.data();
            const { [playerId]: removed, ...rest } = data.players;
            await updateDoc(roomRef, { players: rest });
          }
        }
      } catch (err) { console.error(err); }
    }
    setRoomCode('');
    setRoomData(null);
    setIsHost(false);
    setScreen('home');
  };

  // Start round (Host only)
  const startRound = async (category) => {
    const qs = [...allQuestions[category]].sort(() => Math.random() - 0.5).slice(0, 5);
    
    try {
      await updateDoc(doc(db, 'rooms', roomCode), {
        game: {
          status: 'playing',
          category,
          questions: qs,
          questionIndex: 0,
          currentQuestion: qs[0],
          phase: 'buzzer',
          buzzedPlayer: null,
          timerEnd: Date.now() + 30000,
          answers: {}
        }
      });
    } catch (err) { console.error(err); }
  };

  // Buzz in
  const buzzIn = async () => {
    if (roomData?.game?.phase !== 'buzzer' || roomData?.game?.buzzedPlayer) return;
    
    try {
      await updateDoc(doc(db, 'rooms', roomCode), {
        'game.buzzedPlayer': playerId,
        'game.phase': 'answering',
        'game.timerEnd': Date.now() + 15000
      });
    } catch (err) { console.error(err); }
  };

  // Submit answer
  const submitAnswer = async (answer) => {
    if (hasAnswered) return;
    
    setSelectedAnswer(answer);
    setHasAnswered(true);
    
    const correct = answer === roomData.game.currentQuestion.answer;
    const timeBonus = Math.max(0, localTimer * 3);
    const points = correct ? 100 + timeBonus : 0;
    
    try {
      const updates = {
        [`game.answers.${playerId}`]: { answer, correct, points }
      };
      
      if (correct) {
        const currentScore = roomData.players[playerId]?.score || 0;
        updates[`players.${playerId}.score`] = currentScore + points;
      }
      
      await updateDoc(doc(db, 'rooms', roomCode), updates);
      
      // Reveal after short delay
      setTimeout(async () => {
        try {
          await updateDoc(doc(db, 'rooms', roomCode), { 'game.phase': 'reveal' });
        } catch (err) {}
      }, 500);
    } catch (err) { console.error(err); }
  };

  // Next question (Host only)
  const nextQuestion = async () => {
    const nextIdx = roomData.game.questionIndex + 1;
    
    try {
      if (nextIdx >= roomData.game.questions.length) {
        await updateDoc(doc(db, 'rooms', roomCode), {
          'game.status': 'roundEnd',
          'game.phase': null
        });
      } else {
        await updateDoc(doc(db, 'rooms', roomCode), {
          'game.questionIndex': nextIdx,
          'game.currentQuestion': roomData.game.questions[nextIdx],
          'game.phase': 'buzzer',
          'game.buzzedPlayer': null,
          'game.timerEnd': Date.now() + 30000,
          'game.answers': {}
        });
      }
    } catch (err) { console.error(err); }
  };

  // Back to lobby
  const backToLobby = async () => {
    try {
      await updateDoc(doc(db, 'rooms', roomCode), {
        game: { status: 'lobby' }
      });
    } catch (err) { console.error(err); }
  };

  // Copy room code
  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Get sorted players
  const players = roomData?.players || {};
  const sortedPlayers = Object.entries(players)
    .map(([id, p]) => ({ id, ...p }))
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  const gameState = roomData?.game;

  // RENDER: Home
  const renderHome = () => (
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-red-800 to-green-900 p-4 relative">
      <Snowflakes />
      <div className="max-w-md mx-auto relative z-10 pt-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🎄</div>
          <h1 className="text-4xl font-bold text-white mb-1">Christmas Quiz</h1>
          <p className="text-green-200">Multi-Device Edition</p>
        </div>

        <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-6">
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Your name"
            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 text-lg text-center font-medium"
            maxLength={15}
          />
        </div>

        {error && <p className="text-red-300 text-center mb-4">{error}</p>}

        <div className="space-y-3">
          <button onClick={createGame} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-between shadow-lg">
            <span className="flex items-center gap-3"><Crown className="w-6 h-6" />Host New Game</span>
            <ChevronRight />
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/20"></div></div>
            <div className="relative flex justify-center"><span className="bg-transparent px-4 text-white/60 text-sm">or join</span></div>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 4))}
              placeholder="ROOM CODE"
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 text-2xl text-center font-mono tracking-widest uppercase"
              maxLength={4}
            />
            <button onClick={joinGame} disabled={joinCode.length !== 4} className="w-full mt-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg">
              Join Game
            </button>
          </div>
        </div>

        <p className="text-center text-white/40 text-sm mt-8">
          {Object.values(allQuestions).reduce((s, c) => s + c.length, 0)} questions • {Object.keys(allQuestions).length} categories
        </p>
      </div>
    </div>
  );

  // RENDER: Lobby
  const renderLobby = () => (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-800 p-4">
      <Snowflakes />
      <div className="max-w-md mx-auto relative z-10">
        <div className="flex justify-between items-center mb-6">
          <button onClick={leaveGame} className="text-white/70 flex items-center gap-1"><LogOut className="w-4 h-4" />Leave</button>
          <div className={`flex items-center gap-1 ${connected ? 'text-green-400' : 'text-red-400'}`}>
            {connected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          </div>
        </div>

        <div className="text-center mb-6">
          <p className="text-green-200 mb-1">Room Code</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-5xl font-mono font-bold text-white tracking-widest">{roomCode}</span>
            <button onClick={copyCode} className="text-white/70 hover:text-white"><Copy className="w-6 h-6" /></button>
          </div>
          {copied && <p className="text-green-400 text-sm mt-1">Copied!</p>}
          <p className="text-white/60 text-sm mt-2">Share this code with players</p>
        </div>

        <div className="bg-white/10 rounded-xl p-4 mb-6">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Users className="w-5 h-5" /> Players ({sortedPlayers.length})
          </h3>
          <div className="space-y-2">
            {sortedPlayers.map((p) => (
              <div key={p.id} className="flex items-center justify-between bg-white/10 rounded-lg px-3 py-2">
                <span className="text-white flex items-center gap-2">
                  {p.isHost && <Crown className="w-4 h-4 text-yellow-400" />}
                  {p.name}
                  {p.id === playerId && <span className="text-white/40 text-xs">(you)</span>}
                </span>
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
                <button key={key} onClick={() => startRound(key)} className={`bg-gradient-to-r ${meta.color} text-white font-bold py-3 px-3 rounded-xl flex items-center gap-2`}>
                  <span className="text-xl">{meta.icon}</span>
                  <span className="text-sm">{meta.name}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-6xl mb-3">⏳</div>
            <p className="text-white text-lg">Waiting for host to start...</p>
          </div>
        )}
      </div>
    </div>
  );

  // RENDER: Playing
  const renderPlaying = () => {
    const meta = categoryMeta[gameState?.category] || {};
    const q = gameState?.currentQuestion;
    const phase = gameState?.phase;
    const buzzedPlayer = gameState?.buzzedPlayer;
    const isBuzzedPlayer = buzzedPlayer === playerId;
    const answers = gameState?.answers || {};
    const myAnswer = answers[playerId];

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4">
        <div className="max-w-lg mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{meta.icon}</span>
              <span className="text-white">{meta.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/60">Q{(gameState?.questionIndex || 0) + 1}/5</span>
              <div className={`px-3 py-1 rounded-full text-white flex items-center gap-1 ${localTimer <= 5 ? 'bg-red-500 animate-pulse' : 'bg-white/20'}`}>
                <Clock className="w-4 h-4" />{localTimer}s
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 mb-4 shadow-lg">
            {q?.emoji && <div className="text-5xl text-center mb-3">{q.emoji}</div>}
            <h3 className="text-lg font-bold text-gray-800">{q?.question}</h3>
          </div>

          {phase === 'buzzer' && !buzzedPlayer && (
            <div className="mb-4">
              <button onClick={buzzIn} className="w-full bg-red-500 hover:bg-red-400 active:scale-95 text-white font-bold py-8 rounded-2xl text-2xl shadow-lg transition-transform animate-pulse">
                🔔 BUZZ!
              </button>
              <p className="text-center text-white/60 mt-2">First to buzz answers!</p>
            </div>
          )}

          {phase === 'answering' && buzzedPlayer && (
            <div className="mb-4">
              <p className="text-center text-yellow-400 mb-3 font-bold text-xl">🔔 {players[buzzedPlayer]?.name} buzzed!</p>
              
              {isBuzzedPlayer ? (
                <div className="space-y-2">
                  {q?.options.map((opt, i) => (
                    <button key={i} onClick={() => submitAnswer(opt)} disabled={hasAnswered}
                      className={`w-full py-3 px-4 rounded-xl font-medium text-left transition-all ${selectedAnswer === opt ? 'bg-blue-500 text-white' : 'bg-white/90 text-gray-800 hover:bg-white'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center text-white">
                  <div className="text-4xl mb-2">👀</div>
                  <p>Waiting for their answer...</p>
                </div>
              )}
            </div>
          )}

          {phase === 'reveal' && (
            <div className="mb-4">
              <div className="space-y-2 mb-4">
                {q?.options.map((opt, i) => (
                  <div key={i} className={`w-full py-3 px-4 rounded-xl font-medium flex items-center gap-2 ${
                    opt === q.answer ? 'bg-green-500 text-white' :
                    myAnswer?.answer === opt && !myAnswer?.correct ? 'bg-red-500 text-white' :
                    'bg-white/20 text-white/60'
                  }`}>
                    {opt === q.answer && <Check className="w-5 h-5" />}
                    {myAnswer?.answer === opt && !myAnswer?.correct && <X className="w-5 h-5" />}
                    {opt}
                  </div>
                ))}
              </div>

              {buzzedPlayer && answers[buzzedPlayer] && (
                <p className={`text-center font-bold mb-4 ${answers[buzzedPlayer]?.correct ? 'text-green-400' : 'text-red-400'}`}>
                  {players[buzzedPlayer]?.name}: {answers[buzzedPlayer]?.correct ? `✓ +${answers[buzzedPlayer]?.points}` : '✗ Wrong!'}
                </p>
              )}

              {isHost && (
                <button onClick={nextQuestion} className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                  {(gameState?.questionIndex || 0) < 4 ? 'Next Question' : 'See Results'} <ChevronRight />
                </button>
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

  // RENDER: Round End
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
              <div key={p.id} className={`rounded-xl p-4 flex items-center gap-4 ${
                i === 0 ? 'bg-yellow-300 text-yellow-900' :
                i === 1 ? 'bg-gray-200 text-gray-800' :
                i === 2 ? 'bg-orange-300 text-orange-900' :
                'bg-white/80 text-gray-800'
              }`}>
                <div className="text-2xl font-bold w-10">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</div>
                <div className="flex-1 font-bold flex items-center gap-2">
                  {p.name}
                  {p.id === playerId && <span className="text-xs opacity-60">(you)</span>}
                </div>
                <div className="text-2xl font-bold">{p.score}</div>
              </div>
            ))}
          </div>

          {isHost ? (
            <div className="space-y-2">
              <button onClick={backToLobby} className="w-full bg-white text-green-800 font-bold py-3 rounded-xl">Play Another Round</button>
              <button onClick={leaveGame} className="w-full bg-white/20 text-white font-bold py-3 rounded-xl">End Game</button>
            </div>
          ) : (
            <div className="text-center text-white"><p>Waiting for host...</p></div>
          )}
        </div>
      </div>
    );
  };

  // Main render
  if (screen === 'home') return renderHome();
  if (screen === 'lobby') {
    if (gameState?.status === 'playing') return renderPlaying();
    if (gameState?.status === 'roundEnd') return renderRoundEnd();
    return renderLobby();
  }
  return renderHome();
}
