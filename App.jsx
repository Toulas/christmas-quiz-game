import React, { useState, useEffect } from 'react';
import { Gift, Music, Image, Grid, Hash, Plus, Play, Trophy, Users, ChevronRight, Check, X, Clock, Star, RotateCcw, Eye, EyeOff, Upload, Download, Share2, Zap, Award } from 'lucide-react';

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

// Question bank
const initialQuestions = {
  trivia: [
    { id: 't1', question: "In which country did the tradition of putting up a Christmas tree originate?", options: ["England", "Germany", "USA", "France"], answer: "Germany", contributor: "System" },
    { id: 't2', question: "What is the name of the main character in 'A Christmas Carol'?", options: ["Bob Cratchit", "Ebenezer Scrooge", "Tiny Tim", "Jacob Marley"], answer: "Ebenezer Scrooge", contributor: "System" },
    { id: 't3', question: "How many gifts are given in total in 'The Twelve Days of Christmas'?", options: ["12", "78", "364", "144"], answer: "364", contributor: "System" },
    { id: 't4', question: "What plant is traditionally hung for kissing underneath at Christmas?", options: ["Holly", "Ivy", "Mistletoe", "Poinsettia"], answer: "Mistletoe", contributor: "System" },
    { id: 't5', question: "Which reindeer shares its name with a famous mythological character?", options: ["Dasher", "Cupid", "Comet", "Blitzen"], answer: "Cupid", contributor: "System" },
    { id: 't6', question: "How many ghosts appear in 'A Christmas Carol'?", options: ["3", "4", "5", "6"], answer: "4", contributor: "System" },
    { id: 't7', question: "What country did St. Nicholas originally come from?", options: ["Finland", "Turkey", "Greece", "Russia"], answer: "Turkey", contributor: "System" },
    { id: 't8', question: "What is traditionally hidden inside a Christmas pudding?", options: ["A ring", "A coin", "A thimble", "All of these"], answer: "All of these", contributor: "System" },
    { id: 't9', question: "In which country is it tradition to eat KFC for Christmas dinner?", options: ["USA", "UK", "Japan", "Australia"], answer: "Japan", contributor: "System" },
    { id: 't10', question: "In Australia, Christmas falls during which season?", options: ["Spring", "Summer", "Fall", "Winter"], answer: "Summer", contributor: "System" },
    { id: 't11', question: "In Iceland, how many 'Yule Lads' visit children before Christmas?", options: ["7", "9", "13", "24"], answer: "13", contributor: "System" },
    { id: 't12', question: "What do they call Santa Claus in France?", options: ["Papa Noël", "Père Noël", "Saint Nicolas", "Le Père Froid"], answer: "Père Noël", contributor: "System" },
    { id: 't13', question: "How many points does a traditional snowflake have?", options: ["4", "5", "6", "8"], answer: "6", contributor: "System" },
    { id: 't14', question: "What is Boxing Day?", options: ["A fighting holiday", "The day after Christmas", "A packing holiday", "December 24th"], answer: "The day after Christmas", contributor: "System" },
    { id: 't15', question: "What is Advent?", options: ["Christmas Eve", "The 4 weeks before Christmas", "Christmas morning", "New Year's Eve"], answer: "The 4 weeks before Christmas", contributor: "System" },
  ],
  
  movies: [
    { id: 'mov1', question: "In 'Home Alone', where are the McCallisters going on vacation?", options: ["London", "Paris", "Rome", "Miami"], answer: "Paris", contributor: "System" },
    { id: 'mov2', question: "What is the name of the Grinch's dog?", options: ["Spot", "Max", "Buddy", "Rex"], answer: "Max", contributor: "System" },
    { id: 'mov3', question: "In 'Elf', what does Buddy put in his spaghetti?", options: ["Chocolate chips", "Maple syrup", "Marshmallows", "All of the above"], answer: "All of the above", contributor: "System" },
    { id: 'mov4', question: "What movie features the line 'You'll shoot your eye out!'?", options: ["Elf", "A Christmas Story", "Home Alone", "Jingle All the Way"], answer: "A Christmas Story", contributor: "System" },
    { id: 'mov5', question: "In 'How the Grinch Stole Christmas', what is too small for the Grinch?", options: ["His shoes", "His heart", "His house", "His sleigh"], answer: "His heart", contributor: "System" },
    { id: 'mov6', question: "What gift does Ralphie want in 'A Christmas Story'?", options: ["A bicycle", "A Red Ryder BB gun", "A train set", "A puppy"], answer: "A Red Ryder BB gun", contributor: "System" },
    { id: 'mov7', question: "What toy is the father trying to get in 'Jingle All the Way'?", options: ["Tickle Me Elmo", "Turbo Man", "Power Rangers", "Buzz Lightyear"], answer: "Turbo Man", contributor: "System" },
    { id: 'mov8', question: "In 'The Santa Clause', what happens when Scott puts on the suit?", options: ["He flies", "He gains weight and grows a beard", "He turns invisible", "He shrinks"], answer: "He gains weight and grows a beard", contributor: "System" },
    { id: 'mov9', question: "What is the name of the angel in 'It's a Wonderful Life'?", options: ["Gabriel", "Michael", "Clarence", "George"], answer: "Clarence", contributor: "System" },
    { id: 'mov10', question: "In 'Die Hard', what building does the action take place in?", options: ["Empire State Building", "Nakatomi Plaza", "Sears Tower", "Trump Tower"], answer: "Nakatomi Plaza", contributor: "System" },
    { id: 'mov11', question: "What does Buddy the Elf call the fake Santa?", options: ["An imposter", "A fake", "A liar", "He sits on a throne of lies"], answer: "He sits on a throne of lies", contributor: "System" },
    { id: 'mov12', question: "In 'The Nightmare Before Christmas', what is Jack's title?", options: ["Pumpkin King", "Halloween King", "Skeleton King", "Nightmare King"], answer: "Pumpkin King", contributor: "System" },
    { id: 'mov13', question: "What does Kevin use to burn Harry's hand in 'Home Alone'?", options: ["A lighter", "A heated doorknob", "Hot water", "A blowtorch"], answer: "A heated doorknob", contributor: "System" },
    { id: 'mov14', question: "What is the Grinch's mountain called?", options: ["Mount Crumpit", "Mount Grinch", "Mount Whoville", "Mount Christmas"], answer: "Mount Crumpit", contributor: "System" },
    { id: 'mov15', question: "What year was 'Home Alone' released?", options: ["1988", "1990", "1992", "1994"], answer: "1990", contributor: "System" },
  ],
  
  nineties: [
    { id: '90s1', question: "Who sang 'All I Want for Christmas Is You' in 1994?", options: ["Whitney Houston", "Mariah Carey", "Celine Dion", "Madonna"], answer: "Mariah Carey", contributor: "System" },
    { id: '90s2', question: "What year did Mariah Carey release 'All I Want for Christmas Is You'?", options: ["1992", "1994", "1996", "1998"], answer: "1994", contributor: "System" },
    { id: '90s3', question: "Which boy band released 'Merry Christmas, Happy Holidays' in 1998?", options: ["Backstreet Boys", "*NSYNC", "98 Degrees", "New Kids on the Block"], answer: "*NSYNC", contributor: "System" },
    { id: '90s4', question: "What British band released 'Stay Another Day' in 1994?", options: ["Take That", "Oasis", "East 17", "Blur"], answer: "East 17", contributor: "System" },
    { id: '90s5', question: "Which 1990 movie's soundtrack made 'Somewhere in My Memory' famous?", options: ["Edward Scissorhands", "Home Alone", "Goodfellas", "Pretty Woman"], answer: "Home Alone", contributor: "System" },
    { id: '90s6', question: "Who sang 'Christmas Eve/Sarajevo 12/24' in 1996?", options: ["Mannheim Steamroller", "Trans-Siberian Orchestra", "Enya", "Yanni"], answer: "Trans-Siberian Orchestra", contributor: "System" },
    { id: '90s7', question: "What 90s R&B group released 'This Christmas' in 1993?", options: ["Boyz II Men", "TLC", "En Vogue", "SWV"], answer: "Boyz II Men", contributor: "System" },
    { id: '90s8', question: "Who released 'Where Are You Christmas?' from the Grinch movie?", options: ["Celine Dion", "Faith Hill", "Mariah Carey", "LeAnn Rimes"], answer: "Faith Hill", contributor: "System" },
    { id: '90s9', question: "What band performed 'Christmas in Hollis' featured in Die Hard?", options: ["Run-DMC", "Beastie Boys", "Public Enemy", "LL Cool J"], answer: "Run-DMC", contributor: "System" },
    { id: '90s10', question: "What Hanson holiday song was released in 1997?", options: ["MMMBop Christmas", "Snowed In", "At Christmas", "Merry Christmas Baby"], answer: "At Christmas", contributor: "System" },
  ],
  
  music: [
    { id: 'm1', question: "Who originally sang 'White Christmas'?", options: ["Frank Sinatra", "Bing Crosby", "Elvis Presley", "Dean Martin"], answer: "Bing Crosby", contributor: "System" },
    { id: 'm2', question: "In 'Frosty the Snowman', what made Frosty come to life?", options: ["Magic snow", "An old silk hat", "Christmas spirit", "A child's wish"], answer: "An old silk hat", contributor: "System" },
    { id: 'm3', question: "Who sang 'Last Christmas'?", options: ["Wham!", "Duran Duran", "Culture Club", "Spandau Ballet"], answer: "Wham!", contributor: "System" },
    { id: 'm4', question: "Complete: 'Deck the halls with boughs of ___'", options: ["mistletoe", "holly", "ivy", "pine"], answer: "holly", contributor: "System" },
    { id: 'm5', question: "Who released 'Rockin' Around the Christmas Tree' in 1958?", options: ["Brenda Lee", "Connie Francis", "Patsy Cline", "Peggy Lee"], answer: "Brenda Lee", contributor: "System" },
    { id: 'm6', question: "What Christmas song was originally written for Thanksgiving?", options: ["White Christmas", "Jingle Bells", "Winter Wonderland", "Silver Bells"], answer: "Jingle Bells", contributor: "System" },
    { id: 'm7', question: "Who sang 'Blue Christmas'?", options: ["Frank Sinatra", "Dean Martin", "Elvis Presley", "Johnny Cash"], answer: "Elvis Presley", contributor: "System" },
    { id: 'm8', question: "What song mentions 'five golden rings'?", options: ["Jingle Bells", "Deck the Halls", "The Twelve Days of Christmas", "We Wish You a Merry Christmas"], answer: "The Twelve Days of Christmas", contributor: "System" },
    { id: 'm9', question: "Who recorded 'Feliz Navidad'?", options: ["José Feliciano", "Julio Iglesias", "Luis Miguel", "Enrique Iglesias"], answer: "José Feliciano", contributor: "System" },
    { id: 'm10', question: "Complete: 'Grandma got run over by a ___'", options: ["sleigh", "reindeer", "snowplow", "car"], answer: "reindeer", contributor: "System" },
  ],
  
  visual: [
    { id: 'v1', question: "What color are traditional Christmas stockings?", options: ["Blue", "Red", "Green", "White"], answer: "Red", emoji: "🧦", contributor: "System" },
    { id: 'v2', question: "What shape is a traditional Christmas tree?", options: ["Round", "Square", "Triangle/Cone", "Oval"], answer: "Triangle/Cone", emoji: "🎄", contributor: "System" },
    { id: 'v3', question: "What sits on top of most Christmas trees?", options: ["Snowflake", "Star or Angel", "Bell", "Candle"], answer: "Star or Angel", emoji: "⭐", contributor: "System" },
    { id: 'v4', question: "What color is Rudolph's famous nose?", options: ["Orange", "Pink", "Red", "Yellow"], answer: "Red", emoji: "🔴", contributor: "System" },
    { id: 'v5', question: "What shape is a candy cane?", options: ["Straight line", "Circle", "J-shape/Hook", "Spiral"], answer: "J-shape/Hook", emoji: "🍬", contributor: "System" },
    { id: 'v6', question: "What color is the Grinch?", options: ["Red", "Blue", "Green", "Purple"], answer: "Green", emoji: "💚", contributor: "System" },
    { id: 'v7', question: "What does a snowman traditionally use for a nose?", options: ["Stick", "Button", "Carrot", "Coal"], answer: "Carrot", emoji: "⛄", contributor: "System" },
    { id: 'v8', question: "What color is Santa's belt?", options: ["Brown", "Red", "Black", "Gold"], answer: "Black", emoji: "🎅", contributor: "System" },
  ],
  
  general: [
    { id: 'g1', question: "What is the largest planet in our solar system?", options: ["Saturn", "Jupiter", "Neptune", "Uranus"], answer: "Jupiter", contributor: "System" },
    { id: 'g2', question: "In what year did World War II end?", options: ["1943", "1944", "1945", "1946"], answer: "1945", contributor: "System" },
    { id: 'g3', question: "What is the capital of Australia?", options: ["Sydney", "Melbourne", "Canberra", "Perth"], answer: "Canberra", contributor: "System" },
    { id: 'g4', question: "How many sides does a hexagon have?", options: ["5", "6", "7", "8"], answer: "6", contributor: "System" },
    { id: 'g5', question: "What is the chemical symbol for gold?", options: ["Go", "Gd", "Au", "Ag"], answer: "Au", contributor: "System" },
    { id: 'g6', question: "Who painted the Mona Lisa?", options: ["Michelangelo", "Leonardo da Vinci", "Raphael", "Donatello"], answer: "Leonardo da Vinci", contributor: "System" },
    { id: 'g7', question: "What is the smallest country in the world?", options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"], answer: "Vatican City", contributor: "System" },
    { id: 'g8', question: "What year did the Titanic sink?", options: ["1910", "1911", "1912", "1913"], answer: "1912", contributor: "System" },
    { id: 'g9', question: "What is the hardest natural substance on Earth?", options: ["Gold", "Iron", "Diamond", "Platinum"], answer: "Diamond", contributor: "System" },
    { id: 'g10', question: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Mercury"], answer: "Mars", contributor: "System" },
    { id: 'g11', question: "What is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], answer: "Pacific", contributor: "System" },
    { id: 'g12', question: "Who wrote 'Romeo and Juliet'?", options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"], answer: "William Shakespeare", contributor: "System" },
    { id: 'g13', question: "What is the currency of Japan?", options: ["Yuan", "Won", "Yen", "Ringgit"], answer: "Yen", contributor: "System" },
    { id: 'g14', question: "How many continents are there?", options: ["5", "6", "7", "8"], answer: "7", contributor: "System" },
    { id: 'g15', question: "What is the largest mammal in the world?", options: ["Elephant", "Blue Whale", "Giraffe", "Hippopotamus"], answer: "Blue Whale", contributor: "System" },
  ],
  
  science: [
    { id: 's1', question: "What is the chemical formula for water?", options: ["HO2", "H2O", "OH2", "H2O2"], answer: "H2O", contributor: "System" },
    { id: 's2', question: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi body"], answer: "Mitochondria", contributor: "System" },
    { id: 's3', question: "What element does 'O' represent on the periodic table?", options: ["Gold", "Osmium", "Oxygen", "Oganesson"], answer: "Oxygen", contributor: "System" },
    { id: 's4', question: "How many teeth does an adult human typically have?", options: ["28", "30", "32", "34"], answer: "32", contributor: "System" },
    { id: 's5', question: "What is the nearest star to Earth?", options: ["Proxima Centauri", "Alpha Centauri", "The Sun", "Sirius"], answer: "The Sun", contributor: "System" },
    { id: 's6', question: "What gas makes up most of Earth's atmosphere?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"], answer: "Nitrogen", contributor: "System" },
    { id: 's7', question: "What force keeps us on the ground?", options: ["Magnetism", "Friction", "Gravity", "Inertia"], answer: "Gravity", contributor: "System" },
    { id: 's8', question: "What is the boiling point of water in Celsius?", options: ["90°C", "100°C", "110°C", "120°C"], answer: "100°C", contributor: "System" },
    { id: 's9', question: "How many chromosomes do humans have?", options: ["23", "46", "48", "64"], answer: "46", contributor: "System" },
    { id: 's10', question: "What planet has the most moons?", options: ["Jupiter", "Saturn", "Uranus", "Neptune"], answer: "Saturn", contributor: "System" },
  ],
  
  geography: [
    { id: 'geo1', question: "What is the capital of Canada?", options: ["Toronto", "Vancouver", "Ottawa", "Montreal"], answer: "Ottawa", contributor: "System" },
    { id: 'geo2', question: "Which country has the largest population?", options: ["USA", "India", "China", "Indonesia"], answer: "India", contributor: "System" },
    { id: 'geo3', question: "What is the tallest mountain in the world?", options: ["K2", "Kangchenjunga", "Mount Everest", "Lhotse"], answer: "Mount Everest", contributor: "System" },
    { id: 'geo4', question: "Which river flows through London?", options: ["Seine", "Thames", "Danube", "Rhine"], answer: "Thames", contributor: "System" },
    { id: 'geo5', question: "What country is known as the Land of the Rising Sun?", options: ["China", "Korea", "Japan", "Thailand"], answer: "Japan", contributor: "System" },
    { id: 'geo6', question: "What is the largest desert in the world?", options: ["Sahara", "Arabian", "Gobi", "Antarctic"], answer: "Antarctic", contributor: "System" },
    { id: 'geo7', question: "Which US state is the largest by area?", options: ["Texas", "California", "Alaska", "Montana"], answer: "Alaska", contributor: "System" },
    { id: 'geo8', question: "What is the capital of Brazil?", options: ["Rio de Janeiro", "São Paulo", "Brasília", "Salvador"], answer: "Brasília", contributor: "System" },
    { id: 'geo9', question: "What sea lies between Europe and Africa?", options: ["Red Sea", "Black Sea", "Mediterranean Sea", "Caspian Sea"], answer: "Mediterranean Sea", contributor: "System" },
    { id: 'geo10', question: "What is the smallest US state by area?", options: ["Delaware", "Rhode Island", "Connecticut", "New Jersey"], answer: "Rhode Island", contributor: "System" },
  ],
  
  food: [
    { id: 'f1', question: "What country does sushi originate from?", options: ["China", "Korea", "Japan", "Thailand"], answer: "Japan", contributor: "System" },
    { id: 'f2', question: "What is the main ingredient in guacamole?", options: ["Tomato", "Avocado", "Pepper", "Onion"], answer: "Avocado", contributor: "System" },
    { id: 'f3', question: "What type of pasta is shaped like bow ties?", options: ["Penne", "Fusilli", "Farfalle", "Rigatoni"], answer: "Farfalle", contributor: "System" },
    { id: 'f4', question: "What is the most consumed beverage in the world after water?", options: ["Coffee", "Tea", "Beer", "Soft drinks"], answer: "Tea", contributor: "System" },
    { id: 'f5', question: "What country does feta cheese come from?", options: ["Italy", "France", "Greece", "Spain"], answer: "Greece", contributor: "System" },
    { id: 'f6', question: "What vegetable is used to make pickles?", options: ["Zucchini", "Cucumber", "Squash", "Eggplant"], answer: "Cucumber", contributor: "System" },
    { id: 'f7', question: "What nut is used to make marzipan?", options: ["Walnut", "Hazelnut", "Almond", "Cashew"], answer: "Almond", contributor: "System" },
    { id: 'f8', question: "What country is Parmesan cheese from?", options: ["France", "Switzerland", "Italy", "Spain"], answer: "Italy", contributor: "System" },
    { id: 'f9', question: "What is the main ingredient in hummus?", options: ["Lentils", "Chickpeas", "Black beans", "Kidney beans"], answer: "Chickpeas", contributor: "System" },
    { id: 'f10', question: "What country does paella originate from?", options: ["Mexico", "Italy", "Spain", "Portugal"], answer: "Spain", contributor: "System" },
  ],
};

// Sudoku puzzles
const sudokuPuzzles = [
  { puzzle: [[1,0,0,4],[0,4,1,0],[0,1,4,0],[4,0,0,1]], solution: [[1,3,2,4],[2,4,1,3],[3,1,4,2],[4,2,3,1]] },
  { puzzle: [[0,2,0,1],[1,0,2,0],[0,1,0,2],[2,0,1,0]], solution: [[3,2,4,1],[1,4,2,3],[4,1,3,2],[2,3,1,4]] },
];

// Crossword
const crosswordPuzzles = [{
  grid: [['S','A','N','T','A'],['N',' ','O',' ','N'],['O',' ','E',' ','G'],['W','R','L','E','E'],[' ',' ',' ','L','L']],
  clues: { across: [{ num: 1, clue: "He brings presents (5)" },{ num: 4, clue: "Christmas song (4)" }], down: [{ num: 1, clue: "Winter precipitation (4)" },{ num: 2, clue: "Christmas messenger (5)" }] }
}];

// Snowflakes
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
  const [screen, setScreen] = useState('home');
  const [players, setPlayers] = useState([]);
  const [questions, setQuestions] = useState(initialQuestions);
  const [scores, setScores] = useState({});
  const [categoryStats, setCategoryStats] = useState({});
  const [newPlayerName, setNewPlayerName] = useState('');
  const [isTestMode, setIsTestMode] = useState(false);
  
  // Round state
  const [currentRound, setCurrentRound] = useState(null);
  const [gameQuestions, setGameQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [timer, setTimer] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  
  // Buzzer state
  const [buzzerPhase, setBuzzerPhase] = useState('waiting');
  const [buzzedPlayer, setBuzzedPlayer] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [roundScores, setRoundScores] = useState({});
  
  // Puzzles
  const [sudokuGrid, setSudokuGrid] = useState(null);
  const [crosswordGrid, setCrosswordGrid] = useState(null);
  
  // Add question
  const [newQuestion, setNewQuestion] = useState({ category: 'trivia', question: '', options: ['','','',''], answer: '', contributor: '' });
  const [showImportModal, setShowImportModal] = useState(false);
  const [importCode, setImportCode] = useState('');

  // Load data
  useEffect(() => {
    try {
      const p = localStorage.getItem('xmas-players');
      const s = localStorage.getItem('xmas-scores');
      const st = localStorage.getItem('xmas-stats');
      const uq = localStorage.getItem('xmas-user-questions');
      if (p) setPlayers(JSON.parse(p));
      if (s) setScores(JSON.parse(s));
      if (st) setCategoryStats(JSON.parse(st));
      if (uq) {
        const userQs = JSON.parse(uq);
        setQuestions(prev => {
          const m = { ...prev };
          Object.keys(userQs).forEach(c => { if (m[c]) m[c] = [...m[c], ...userQs[c]]; });
          return m;
        });
      }
    } catch(e) {}
  }, []);

  // Timer
  useEffect(() => {
    if (!timerActive || timer <= 0) return;
    const i = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(i);
  }, [timerActive]);

  useEffect(() => {
    if (timer === 0 && timerActive) {
      setTimerActive(false);
      if (!showAnswer) { setShowAnswer(true); setBuzzerPhase('answered'); }
    }
  }, [timer, timerActive, showAnswer]);

  const save = (k, d) => { try { localStorage.setItem(k, JSON.stringify(d)); } catch(e) {} };

  const addPlayer = () => {
    if (!newPlayerName.trim() || players.includes(newPlayerName.trim())) return;
    const up = [...players, newPlayerName.trim()];
    setPlayers(up);
    const us = { ...scores, [newPlayerName.trim()]: 0 };
    setScores(us);
    save('xmas-players', up);
    save('xmas-scores', us);
    setNewPlayerName('');
  };

  const removePlayer = (n) => {
    setPlayers(players.filter(p => p !== n));
    const { [n]: _, ...rest } = scores;
    setScores(rest);
    save('xmas-players', players.filter(p => p !== n));
    save('xmas-scores', rest);
  };

  const startRound = (type, test = false) => {
    setCurrentRound(type);
    setIsTestMode(test);
    setQuestionIndex(0);
    setShowAnswer(false);
    setSelectedAnswer(null);
    setBuzzerPhase('waiting');
    setBuzzedPlayer(null);
    setRoundScores({});
    
    if (type === 'sudoku') {
      const idx = Math.floor(Math.random() * sudokuPuzzles.length);
      setSudokuGrid({ grid: sudokuPuzzles[idx].puzzle.map(r => [...r]), idx });
      setTimer(180);
      setScreen('game');
      setTimerActive(true);
    } else if (type === 'crossword') {
      const p = JSON.parse(JSON.stringify(crosswordPuzzles[0]));
      p.userGrid = p.grid.map(r => r.map(c => c === ' ' ? ' ' : ''));
      setCrosswordGrid(p);
      setTimer(180);
      setScreen('game');
      setTimerActive(true);
    } else {
      const qs = [...questions[type]].sort(() => Math.random() - 0.5).slice(0, 5);
      setGameQuestions(qs);
      setCurrentQuestion(qs[0]);
      setTimer(30);
      setScreen('game');
      setTimerActive(true);
    }
  };

  const handleBuzzer = (p) => {
    if (buzzerPhase !== 'waiting' || showAnswer) return;
    setBuzzedPlayer(p);
    setBuzzerPhase('buzzed');
    setTimerActive(false);
    setTimer(15);
    setTimerActive(true);
  };

  const submitAnswer = () => {
    setTimerActive(false);
    setShowAnswer(true);
    setBuzzerPhase('answered');
    
    if (!isTestMode && buzzedPlayer) {
      const correct = selectedAnswer === currentQuestion.answer;
      const pts = correct ? 100 + timer * 3 : 0;
      
      if (correct) {
        setScores(prev => {
          const u = { ...prev, [buzzedPlayer]: (prev[buzzedPlayer] || 0) + pts };
          save('xmas-scores', u);
          return u;
        });
      }
      
      setCategoryStats(prev => {
        const ps = prev[buzzedPlayer] || {};
        const cs = ps[currentRound] || { correct: 0, total: 0 };
        const u = { ...prev, [buzzedPlayer]: { ...ps, [currentRound]: { correct: cs.correct + (correct ? 1 : 0), total: cs.total + 1 } } };
        save('xmas-stats', u);
        return u;
      });
      
      setRoundScores(prev => ({ ...prev, [questionIndex]: { player: buzzedPlayer, correct, pts } }));
    }
  };

  const nextQuestion = () => {
    if (questionIndex < gameQuestions.length - 1) {
      setQuestionIndex(prev => prev + 1);
      setCurrentQuestion(gameQuestions[questionIndex + 1]);
      setSelectedAnswer(null);
      setShowAnswer(false);
      setBuzzerPhase('waiting');
      setBuzzedPlayer(null);
      setTimer(30);
      setTimerActive(true);
    } else {
      setScreen('roundEnd');
    }
  };

  const getCategoryWinners = () => {
    const w = {};
    Object.keys(categoryMeta).forEach(cat => {
      let best = null, score = 0;
      players.forEach(p => {
        const s = categoryStats[p]?.[cat];
        if (s && s.correct > score) { score = s.correct; best = p; }
      });
      if (best) w[cat] = { player: best, correct: score };
    });
    return w;
  };

  const submitNewQuestion = () => {
    if (!newQuestion.question || !newQuestion.answer || !newQuestion.contributor) return alert('Fill all fields');
    const q = { id: `u_${Date.now()}`, ...newQuestion, options: newQuestion.options.filter(o => o) };
    setQuestions(prev => ({ ...prev, [newQuestion.category]: [...prev[newQuestion.category], q] }));
    const ex = JSON.parse(localStorage.getItem('xmas-user-questions') || '{}');
    if (!ex[newQuestion.category]) ex[newQuestion.category] = [];
    ex[newQuestion.category].push(q);
    save('xmas-user-questions', ex);
    setNewQuestion({ category: 'trivia', question: '', options: ['','','',''], answer: '', contributor: '' });
    alert('Added! 🎄');
  };

  const exportQs = () => {
    const uq = JSON.parse(localStorage.getItem('xmas-user-questions') || '{}');
    if (!Object.keys(uq).length) return alert('No custom questions');
    navigator.clipboard.writeText(btoa(JSON.stringify(uq))).then(() => alert('Copied!')).catch(() => prompt('Copy:', btoa(JSON.stringify(uq))));
  };

  const importQs = () => {
    try {
      const d = JSON.parse(atob(importCode.trim()));
      const ex = JSON.parse(localStorage.getItem('xmas-user-questions') || '{}');
      let c = 0;
      Object.keys(d).forEach(cat => {
        if (initialQuestions[cat]) {
          if (!ex[cat]) ex[cat] = [];
          d[cat].forEach(q => { if (!ex[cat].some(e => e.question === q.question)) { ex[cat].push(q); c++; } });
        }
      });
      save('xmas-user-questions', ex);
      setQuestions(prev => {
        const m = { ...initialQuestions };
        Object.keys(ex).forEach(c => { if (m[c]) m[c] = [...m[c], ...ex[c]]; });
        return m;
      });
      setShowImportModal(false);
      setImportCode('');
      alert(`Imported ${c}!`);
    } catch(e) { alert('Invalid'); }
  };

  const resetAll = () => {
    if (!confirm('Reset everything?')) return;
    const rs = {}; players.forEach(p => rs[p] = 0);
    setScores(rs);
    setCategoryStats({});
    save('xmas-scores', rs);
    save('xmas-stats', {});
  };

  // Sudoku
  const handleSudoku = (r, c, v) => {
    if (sudokuPuzzles[sudokuGrid.idx].puzzle[r][c] !== 0) return;
    const n = parseInt(v) || 0;
    if (n >= 0 && n <= 4) setSudokuGrid(p => ({ ...p, grid: p.grid.map((row, i) => i === r ? row.map((cell, j) => j === c ? n : cell) : row) }));
  };

  const checkSudoku = () => {
    setTimerActive(false);
    const ok = sudokuPuzzles[sudokuGrid.idx].solution.every((r, i) => r.every((c, j) => c === sudokuGrid.grid[i][j]));
    setRoundScores({ completed: ok, pts: ok ? 500 + timer * 2 : 0 });
    setScreen('roundEnd');
  };

  // Crossword
  const handleCrossword = (r, c, v) => {
    if (crosswordGrid.grid[r][c] === ' ') return;
    setCrosswordGrid(p => ({ ...p, userGrid: p.userGrid.map((row, i) => i === r ? row.map((cell, j) => j === c ? v.toUpperCase().slice(-1) : cell) : row) }));
  };

  const checkCrossword = () => {
    setTimerActive(false);
    const ok = crosswordGrid.grid.every((r, i) => r.every((c, j) => c === ' ' || c === crosswordGrid.userGrid[i][j]));
    setRoundScores({ completed: ok, pts: ok ? 500 + timer * 2 : 0 });
    setScreen('roundEnd');
  };

  // RENDERS
  const renderHome = () => (
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-red-800 to-green-900 p-4 relative">
      <Snowflakes />
      <div className="max-w-md mx-auto relative z-10">
        <div className="text-center mb-6 pt-6">
          <div className="text-6xl mb-2">🎄</div>
          <h1 className="text-4xl font-bold text-white">Christmas Quiz</h1>
          <p className="text-green-200">Family Game Night 2025</p>
        </div>
        <div className="space-y-3">
          <button onClick={() => setScreen('players')} className="w-full bg-white/90 text-green-800 font-bold py-4 px-6 rounded-xl flex items-center justify-between"><span className="flex items-center gap-3"><Users className="w-6 h-6" />Players ({players.length})</span><ChevronRight /></button>
          <button onClick={() => setScreen('rounds')} className="w-full bg-green-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-between"><span className="flex items-center gap-3"><Zap className="w-6 h-6" />Play (Buzzer Mode)</span><ChevronRight /></button>
          <button onClick={() => setScreen('testRounds')} className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-between"><span className="flex items-center gap-3"><Eye className="w-6 h-6" />Test Mode (Preview)</span><ChevronRight /></button>
          <button onClick={() => setScreen('addQuestion')} className="w-full bg-yellow-500 text-yellow-900 font-bold py-4 px-6 rounded-xl flex items-center justify-between"><span className="flex items-center gap-3"><Plus className="w-6 h-6" />Add Questions</span><ChevronRight /></button>
          <button onClick={() => setScreen('leaderboard')} className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900 font-bold py-4 px-6 rounded-xl flex items-center justify-between"><span className="flex items-center gap-3"><Trophy className="w-6 h-6" />Leaderboard & Stats</span><ChevronRight /></button>
        </div>
        <div className="mt-4 flex gap-2 justify-center">
          <button onClick={exportQs} className="text-white/70 text-sm flex items-center gap-1 bg-white/10 px-3 py-2 rounded-lg"><Share2 className="w-4 h-4" />Share</button>
          <button onClick={() => setShowImportModal(true)} className="text-white/70 text-sm flex items-center gap-1 bg-white/10 px-3 py-2 rounded-lg"><Download className="w-4 h-4" />Import</button>
        </div>
        <p className="text-center text-white/50 text-sm mt-3">{Object.values(questions).reduce((s,c) => s + c.length, 0)} questions • {Object.keys(questions).length} categories</p>
      </div>
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="font-bold text-xl mb-4">Import Questions</h3>
            <textarea value={importCode} onChange={e => setImportCode(e.target.value)} className="w-full border rounded-lg p-3 h-32 mb-4" placeholder="Paste code..." />
            <div className="flex gap-2"><button onClick={() => setShowImportModal(false)} className="flex-1 py-2 border rounded-lg">Cancel</button><button onClick={importQs} className="flex-1 py-2 bg-green-600 text-white rounded-lg">Import</button></div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPlayers = () => (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-800 p-4">
      <div className="max-w-md mx-auto">
        <button onClick={() => setScreen('home')} className="text-white mb-4">← Back</button>
        <h2 className="text-2xl font-bold text-white mb-4">Players</h2>
        <div className="bg-white/10 rounded-xl p-4 mb-4 flex gap-2">
          <input type="text" value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)} placeholder="Name" className="flex-1 px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/50" onKeyPress={e => e.key === 'Enter' && addPlayer()} />
          <button onClick={addPlayer} className="bg-green-500 text-white px-4 py-2 rounded-lg">Add</button>
        </div>
        <div className="space-y-2">
          {players.map(p => (
            <div key={p} className="bg-white/10 rounded-xl p-4 flex items-center justify-between">
              <span className="text-white font-medium">{p}</span>
              <div className="flex items-center gap-3">
                <span className="text-green-300 font-bold">{scores[p] || 0}</span>
                <button onClick={() => removePlayer(p)} className="text-red-400"><X className="w-5 h-5" /></button>
              </div>
            </div>
          ))}
        </div>
        {players.length < 2 && <p className="text-yellow-300 text-center mt-4 text-sm">Add 2+ players for buzzer mode</p>}
      </div>
    </div>
  );

  const renderRoundSelection = (test) => (
    <div className="min-h-screen bg-gradient-to-b from-red-900 to-red-800 p-4">
      <div className="max-w-md mx-auto">
        <button onClick={() => setScreen('home')} className="text-white mb-4">← Back</button>
        <h2 className="text-2xl font-bold text-white mb-2">{test ? '🔍 Test Mode' : '🎮 Choose Round'}</h2>
        {test && <p className="text-red-200 text-sm mb-4">Preview without scoring</p>}
        <div className="space-y-2">
          {Object.entries(categoryMeta).map(([k, m]) => questions[k] && (
            <button key={k} onClick={() => startRound(k, test)} className={`w-full bg-gradient-to-r ${m.color} text-white font-bold py-3 px-4 rounded-xl flex items-center gap-3`}>
              <span className="text-2xl">{m.icon}</span>
              <div className="text-left flex-1"><div>{m.name}</div><div className="text-xs opacity-80">{questions[k].length} Qs</div></div>
            </button>
          ))}
          <button onClick={() => startRound('sudoku', test)} className="w-full bg-gray-600 text-white font-bold py-3 px-4 rounded-xl flex items-center gap-3"><Grid className="w-6 h-6" /><div>Sudoku (4×4)</div></button>
          <button onClick={() => startRound('crossword', test)} className="w-full bg-amber-600 text-white font-bold py-3 px-4 rounded-xl flex items-center gap-3"><Hash className="w-6 h-6" /><div>Crossword</div></button>
        </div>
      </div>
    </div>
  );

  const renderGame = () => {
    if (currentRound === 'sudoku') {
      const pz = sudokuPuzzles[sudokuGrid?.idx || 0];
      return (
        <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-800 p-4">
          <div className="max-w-md mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Sudoku {isTestMode && '(Test)'}</h2>
              <div className="bg-white/20 px-3 py-1 rounded-full text-white"><Clock className="w-4 h-4 inline mr-1" />{Math.floor(timer/60)}:{String(timer%60).padStart(2,'0')}</div>
            </div>
            <div className="bg-white rounded-xl p-4 mb-4">
              <p className="text-gray-600 text-sm mb-3">Fill 1-4 in each row, column, 2×2 box</p>
              <div className="grid grid-cols-4 gap-1 max-w-xs mx-auto">
                {sudokuGrid?.grid.map((r, i) => r.map((c, j) => (
                  <input key={`${i}${j}`} type="text" inputMode="numeric" value={c || ''} onChange={e => handleSudoku(i, j, e.target.value)} disabled={pz.puzzle[i][j] !== 0} className={`w-12 h-12 text-center text-xl font-bold border-2 rounded ${pz.puzzle[i][j] ? 'bg-green-100' : ''} ${i%2===0?'border-t-green-800':''} ${j%2===0?'border-l-green-800':''}`} />
                )))}
              </div>
            </div>
            <button onClick={checkSudoku} className="w-full bg-green-500 text-white font-bold py-3 rounded-xl">Check</button>
          </div>
        </div>
      );
    }

    if (currentRound === 'crossword') {
      return (
        <div className="min-h-screen bg-gradient-to-b from-amber-700 to-amber-800 p-4">
          <div className="max-w-md mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Crossword {isTestMode && '(Test)'}</h2>
              <div className="bg-white/20 px-3 py-1 rounded-full text-white"><Clock className="w-4 h-4 inline mr-1" />{Math.floor(timer/60)}:{String(timer%60).padStart(2,'0')}</div>
            </div>
            <div className="bg-white rounded-xl p-4 mb-4">
              <div className="grid grid-cols-5 gap-1 max-w-xs mx-auto mb-3">
                {crosswordGrid?.userGrid.map((r, i) => r.map((c, j) => crosswordGrid.grid[i][j] === ' ' ? <div key={`${i}${j}`} className="w-9 h-9 bg-gray-800 rounded" /> : <input key={`${i}${j}`} value={c} onChange={e => handleCrossword(i, j, e.target.value)} className="w-9 h-9 text-center font-bold border rounded uppercase" maxLength={1} />))}
              </div>
              <div className="text-sm"><p className="font-bold">Across:</p>{crosswordGrid?.clues.across.map(c => <p key={c.num} className="ml-2">{c.num}. {c.clue}</p>)}<p className="font-bold mt-2">Down:</p>{crosswordGrid?.clues.down.map(c => <p key={c.num} className="ml-2">{c.num}. {c.clue}</p>)}</div>
            </div>
            <button onClick={checkCrossword} className="w-full bg-amber-500 text-white font-bold py-3 rounded-xl">Check</button>
          </div>
        </div>
      );
    }

    const meta = categoryMeta[currentRound] || {};
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4">
        <div className="max-w-lg mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2"><span className="text-2xl">{meta.icon}</span><span className="text-white">{meta.name} {isTestMode && '(Test)'}</span></div>
            <div className="flex items-center gap-2">
              <span className="text-white/60">Q{questionIndex+1}/{gameQuestions.length}</span>
              <div className={`px-3 py-1 rounded-full text-white ${timer <= 10 ? 'bg-red-500 animate-pulse' : 'bg-white/20'}`}><Clock className="w-4 h-4 inline mr-1" />{timer}s</div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 mb-4">
            {currentQuestion?.emoji && <div className="text-5xl text-center mb-3">{currentQuestion.emoji}</div>}
            <h3 className="text-lg font-bold text-gray-800">{currentQuestion?.question}</h3>
            {currentQuestion?.contributor !== 'System' && <p className="text-gray-400 text-xs mt-1">By: {currentQuestion.contributor}</p>}
          </div>

          {/* Buzzer */}
          {buzzerPhase === 'waiting' && !showAnswer && !isTestMode && players.length >= 2 && (
            <div className="mb-4">
              <p className="text-center text-white mb-3 font-bold">⚡ BUZZ IN!</p>
              <div className="grid grid-cols-3 gap-2">
                {players.map(p => <button key={p} onClick={() => handleBuzzer(p)} className="bg-red-500 hover:bg-red-400 active:scale-95 text-white font-bold py-4 rounded-xl transition-transform">{p}</button>)}
              </div>
            </div>
          )}

          {buzzerPhase === 'buzzed' && !showAnswer && <p className="text-center text-yellow-400 mb-3 font-bold text-lg">🔔 {buzzedPlayer} buzzed!</p>}

          {/* Answers */}
          {(buzzerPhase === 'buzzed' || isTestMode || players.length < 2) && (
            <div className="space-y-2 mb-4">
              {currentQuestion?.options.map((o, i) => (
                <button key={i} onClick={() => !showAnswer && setSelectedAnswer(o)} disabled={showAnswer} className={`w-full py-3 px-4 rounded-xl font-medium text-left transition-all ${showAnswer && o === currentQuestion.answer ? 'bg-green-500 text-white' : ''} ${showAnswer && o === selectedAnswer && o !== currentQuestion.answer ? 'bg-red-500 text-white' : ''} ${!showAnswer && selectedAnswer === o ? 'bg-blue-500 text-white' : ''} ${!showAnswer && selectedAnswer !== o ? 'bg-white/90 text-gray-800' : ''}`}>
                  {showAnswer && o === currentQuestion.answer && <Check className="w-5 h-5 inline mr-2" />}
                  {showAnswer && o === selectedAnswer && o !== currentQuestion.answer && <X className="w-5 h-5 inline mr-2" />}
                  {o}
                </button>
              ))}
            </div>
          )}

          {buzzerPhase === 'buzzed' && !showAnswer && <button onClick={submitAnswer} disabled={!selectedAnswer} className="w-full bg-yellow-500 disabled:bg-gray-500 text-white font-bold py-3 rounded-xl">Lock In</button>}
          
          {isTestMode && buzzerPhase === 'waiting' && !showAnswer && <button onClick={() => { setShowAnswer(true); setBuzzerPhase('answered'); }} className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl">Reveal Answer</button>}

          {showAnswer && (
            <div>
              {!isTestMode && buzzedPlayer && <p className={`text-center mb-3 font-bold ${selectedAnswer === currentQuestion.answer ? 'text-green-400' : 'text-red-400'}`}>{selectedAnswer === currentQuestion.answer ? `✓ ${buzzedPlayer} +${100 + timer * 3}` : '✗ Wrong!'}</p>}
              <button onClick={nextQuestion} className="w-full bg-green-500 text-white font-bold py-3 rounded-xl">{questionIndex < gameQuestions.length - 1 ? 'Next Question →' : 'See Results →'}</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRoundEnd = () => {
    const meta = categoryMeta[currentRound] || { icon: '🎯', name: currentRound };
    const sorted = [...players].sort((a, b) => (scores[b] || 0) - (scores[a] || 0));
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-700 to-green-900 p-4">
        <Snowflakes />
        <div className="max-w-md mx-auto relative z-10 pt-6">
          <div className="text-center mb-6">
            <div className="text-6xl mb-2">🎉</div>
            <h2 className="text-3xl font-bold text-white">Round Complete!</h2>
            <p className="text-green-200">{meta.icon} {meta.name}</p>
          </div>

          {!isTestMode && Object.keys(roundScores).length > 0 && (
            <div className="bg-white/10 rounded-xl p-4 mb-4">
              <h3 className="text-white font-bold mb-2">This Round:</h3>
              {Object.entries(roundScores).map(([i, d]) => d.player && (
                <div key={i} className={`flex justify-between text-sm ${d.correct ? 'text-green-300' : 'text-red-300'}`}>
                  <span>Q{parseInt(i)+1}: {d.player}</span><span>{d.correct ? `+${d.pts}` : 'Wrong'}</span>
                </div>
              ))}
            </div>
          )}

          {!isTestMode && players.length > 0 && (
            <div className="bg-white/10 rounded-xl p-4 mb-4">
              <h3 className="text-white font-bold mb-2">Standings:</h3>
              {sorted.map((p, i) => <div key={p} className="flex justify-between text-white"><span>{i === 0 ? '👑 ' : ''}{p}</span><span className="font-bold">{scores[p] || 0}</span></div>)}
            </div>
          )}

          <div className="space-y-2">
            <button onClick={() => setScreen('rounds')} className="w-full bg-white text-green-800 font-bold py-3 rounded-xl">Another Round</button>
            <button onClick={() => setScreen('leaderboard')} className="w-full bg-white/20 text-white font-bold py-3 rounded-xl">Leaderboard</button>
            <button onClick={() => setScreen('home')} className="w-full text-white/60 py-2">Home</button>
          </div>
        </div>
      </div>
    );
  };

  const renderLeaderboard = () => {
    const sorted = [...players].sort((a, b) => (scores[b] || 0) - (scores[a] || 0));
    const catWinners = getCategoryWinners();
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-600 to-yellow-700 p-4">
        <Snowflakes />
        <div className="max-w-md mx-auto relative z-10">
          <button onClick={() => setScreen('home')} className="text-white mb-4">← Back</button>
          <div className="text-center mb-6"><Trophy className="w-16 h-16 text-yellow-200 mx-auto mb-2" /><h2 className="text-3xl font-bold text-white">Leaderboard</h2></div>

          <div className="space-y-2 mb-6">
            {sorted.map((p, i) => (
              <div key={p} className={`rounded-xl p-4 flex items-center gap-4 ${i === 0 ? 'bg-yellow-300 text-yellow-900' : i === 1 ? 'bg-gray-200' : i === 2 ? 'bg-orange-300 text-orange-900' : 'bg-white/80'}`}>
                <div className="text-2xl font-bold w-10">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i+1}</div>
                <div className="flex-1 font-bold">{p}</div>
                <div className="text-2xl font-bold">{scores[p] || 0}</div>
              </div>
            ))}
          </div>

          {Object.keys(catWinners).length > 0 && (
            <div className="bg-white/10 rounded-xl p-4 mb-4">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2"><Award className="w-5 h-5" />Category Champions</h3>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(catWinners).map(([cat, d]) => (
                  <div key={cat} className="bg-white/10 rounded-lg p-2 text-center">
                    <div className="text-xl">{categoryMeta[cat]?.icon}</div>
                    <div className="text-white text-sm font-medium truncate">{d.player}</div>
                    <div className="text-white/60 text-xs">{d.correct} ✓</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={resetAll} className="w-full bg-white/20 text-white py-3 rounded-xl flex items-center justify-center gap-2"><RotateCcw className="w-4 h-4" />Reset All</button>
        </div>
      </div>
    );
  };

  const renderAddQuestion = () => (
    <div className="min-h-screen bg-gradient-to-b from-yellow-600 to-yellow-700 p-4">
      <div className="max-w-md mx-auto">
        <button onClick={() => setScreen('home')} className="text-white mb-4">← Back</button>
        <h2 className="text-2xl font-bold text-white mb-4">Add Question</h2>
        <div className="bg-white rounded-xl p-5 space-y-3">
          <input type="text" value={newQuestion.contributor} onChange={e => setNewQuestion({ ...newQuestion, contributor: e.target.value })} placeholder="Your name" className="w-full px-4 py-2 border rounded-lg" />
          <select value={newQuestion.category} onChange={e => setNewQuestion({ ...newQuestion, category: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
            {Object.entries(categoryMeta).map(([k, m]) => <option key={k} value={k}>{m.icon} {m.name}</option>)}
          </select>
          <textarea value={newQuestion.question} onChange={e => setNewQuestion({ ...newQuestion, question: e.target.value })} placeholder="Question" className="w-full px-4 py-2 border rounded-lg" rows={2} />
          {newQuestion.options.map((o, i) => <input key={i} value={o} onChange={e => { const ops = [...newQuestion.options]; ops[i] = e.target.value; setNewQuestion({ ...newQuestion, options: ops }); }} placeholder={`Option ${i+1}`} className="w-full px-4 py-2 border rounded-lg" />)}
          <select value={newQuestion.answer} onChange={e => setNewQuestion({ ...newQuestion, answer: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
            <option value="">Correct answer...</option>
            {newQuestion.options.filter(o => o).map((o, i) => <option key={i} value={o}>{o}</option>)}
          </select>
          <button onClick={submitNewQuestion} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl"><Upload className="w-5 h-5 inline mr-2" />Add Question</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="font-sans">
      {screen === 'home' && renderHome()}
      {screen === 'players' && renderPlayers()}
      {screen === 'rounds' && renderRoundSelection(false)}
      {screen === 'testRounds' && renderRoundSelection(true)}
      {screen === 'game' && renderGame()}
      {screen === 'roundEnd' && renderRoundEnd()}
      {screen === 'leaderboard' && renderLeaderboard()}
      {screen === 'addQuestion' && renderAddQuestion()}
    </div>
  );
}
