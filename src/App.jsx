import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, off, update, remove, get } from 'firebase/database';
import { Users, ChevronRight, Clock, Crown, Wifi, WifiOff, Copy, LogOut, Volume2, VolumeX, Lock, Shuffle, Trophy, Star, Play, Image } from 'lucide-react';

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
const ROOM_EXPIRY_MS = 2 * 60 * 60 * 1000;

class SoundManager {
  constructor() { this.audioContext = null; this.enabled = true; }
  init() {
    if (!this.audioContext) this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (this.audioContext.state === 'suspended') this.audioContext.resume();
  }
  playTone(freq, dur, type = 'sine', vol = 0.3) {
    if (!this.enabled || !this.audioContext) return;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.connect(gain); gain.connect(this.audioContext.destination);
    osc.frequency.value = freq; osc.type = type;
    gain.gain.setValueAtTime(vol, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + dur);
    osc.start(); osc.stop(this.audioContext.currentTime + dur);
  }
  playBuzzer() { this.init(); this.playTone(880, 0.1, 'square', 0.4); setTimeout(() => this.playTone(1320, 0.15, 'square', 0.4), 150); }
  playCorrect() { this.init(); this.playTone(523, 0.15); setTimeout(() => this.playTone(659, 0.15), 150); setTimeout(() => this.playTone(1047, 0.3), 300); }
  playWrong() { this.init(); this.playTone(400, 0.15, 'sawtooth'); setTimeout(() => this.playTone(200, 0.3, 'sawtooth'), 150); }
  playTick() { this.init(); this.playTone(800, 0.05, 'sine', 0.2); }
  playTimeUp() { this.init(); for(let i=0;i<3;i++) setTimeout(() => { this.playTone(600, 0.1, 'square'); setTimeout(() => this.playTone(400, 0.1, 'square'), 100); }, i * 250); }
  playVictory() { this.init(); [523,659,784,1047].forEach((n,i) => setTimeout(() => this.playTone(n, 0.2), i * 150)); }
  playClick() { this.init(); this.playTone(600, 0.05, 'sine', 0.15); }
  toggle() { this.enabled = !this.enabled; return this.enabled; }
}
const soundManager = new SoundManager();

const categoryMeta = {
  currentaffairs: { name: "Current Affairs 2025", icon: "📰", color: "from-slate-500 to-zinc-600" },
  twenty25: { name: "2025 Entertainment", icon: "🔥", color: "from-rose-500 to-orange-500" },
  tv: { name: "TV Shows", icon: "📺", color: "from-purple-600 to-indigo-600" },
  history: { name: "History", icon: "🏛️", color: "from-amber-700 to-yellow-600" },
  caribbean: { name: "Caribbean Christmas", icon: "🌴", color: "from-yellow-500 to-orange-500" },
  trivia: { name: "Christmas Trivia", icon: "🎄", color: "from-red-500 to-red-600" },
  movies: { name: "Christmas Movies", icon: "🎬", color: "from-purple-500 to-pink-500" },
  music: { name: "Christmas Music", icon: "🎵", color: "from-green-500 to-emerald-500" },
  rnb: { name: "R&B Music", icon: "🎤", color: "from-pink-500 to-rose-500" },
  afrobeats: { name: "Afrobeats", icon: "🥁", color: "from-amber-500 to-yellow-500" },
  reggae: { name: "Reggae", icon: "🇯🇲", color: "from-green-600 to-yellow-500" },
  popculture: { name: "Pop Culture", icon: "📱", color: "from-violet-500 to-purple-500" },
  children: { name: "Children's Round", icon: "👶", color: "from-sky-400 to-blue-500" },
  bible: { name: "Bible & Nativity", icon: "📖", color: "from-indigo-500 to-blue-600" },
  food: { name: "Food & Drink", icon: "🍕", color: "from-orange-500 to-red-500" },
  geography: { name: "Geography", icon: "🌍", color: "from-green-600 to-teal-500" },
  anagram: { name: "Anagrams", icon: "🔤", color: "from-cyan-500 to-blue-500", type: "anagram" },
  riddles: { name: "Riddles", icon: "🧩", color: "from-fuchsia-500 to-pink-500", type: "riddle" },
  pictures: { name: "Picture Round", icon: "🖼️", color: "from-teal-500 to-cyan-500", type: "picture" },
};

const allQuestions = {
  currentaffairs: [
    { id: 'ca1', question: "Who became the first American Pope in 2025?", options: ["Cardinal Dolan", "Robert Prevost", "Sean O'Malley", "Blase Cupich"], answer: "Robert Prevost" },
    { id: 'ca2', question: "Which country elected its first female PM, Sanae Takaichi, in 2025?", options: ["South Korea", "Japan", "Taiwan", "Singapore"], answer: "Japan" },
    { id: 'ca3', question: "Who became Chancellor of Germany in 2025?", options: ["Olaf Scholz", "Friedrich Merz", "Annalena Baerbock", "Markus Söder"], answer: "Friedrich Merz" },
    { id: 'ca4', question: "Which South Korean president was removed from office in 2025?", options: ["Moon Jae-in", "Yoon Suk Yeol", "Park Geun-hye", "Lee Jae-myung"], answer: "Yoon Suk Yeol" },
    { id: 'ca5', question: "Who became the first female Archbishop of Canterbury?", options: ["Sarah Mullally", "Rose Hudson-Wilkin", "Rachel Treweek", "Libby Lane"], answer: "Sarah Mullally" },
    { id: 'ca6', question: "In January 2025, devastating wildfires hit which US city?", options: ["San Francisco", "Los Angeles", "San Diego", "Phoenix"], answer: "Los Angeles" },
    { id: 'ca7', question: "What was stolen from the Louvre Museum in 2025?", options: ["Mona Lisa", "Crown Jewels", "Venus de Milo", "Egyptian artifacts"], answer: "Crown Jewels" },
    { id: 'ca8', question: "Which company removed fact-checking from its platforms in 2025?", options: ["Twitter/X", "TikTok", "Meta", "Google"], answer: "Meta" },
    { id: 'ca9', question: "Carlo Acutis, canonized in 2025, is patron saint of what?", options: ["Youth", "The Internet", "Gamers", "Students"], answer: "The Internet" },
    { id: 'ca10', question: "Which species came off the endangered list in 2025?", options: ["Giant Panda", "Green Turtle", "Blue Whale", "Snow Leopard"], answer: "Green Turtle" },
    { id: 'ca11', question: "Which MLS team won the 2025 MLS Cup with Messi?", options: ["LA Galaxy", "Inter Miami", "LAFC", "Atlanta United"], answer: "Inter Miami" },
    { id: 'ca12', question: "Who performed at the 2025 Super Bowl halftime show?", options: ["Beyoncé", "Kendrick Lamar", "Taylor Swift", "Drake"], answer: "Kendrick Lamar" },
    { id: 'ca13', question: "Which film won Best Picture at the 2025 Oscars?", options: ["Wicked", "Anora", "The Brutalist", "Emilia Pérez"], answer: "Anora" },
    { id: 'ca14', question: "Beyoncé won Grammy AOTY in 2025 for which album?", options: ["Renaissance", "Lemonade", "Cowboy Carter", "4"], answer: "Cowboy Carter" },
    { id: 'ca15', question: "Taylor Swift got engaged to which NFL player?", options: ["Patrick Mahomes", "Travis Kelce", "Joe Burrow", "Josh Allen"], answer: "Travis Kelce" },
    { id: 'ca16', question: "Which country experienced a major earthquake in early 2025?", options: ["Turkey", "Myanmar", "Japan", "Nepal"], answer: "Myanmar" },
    { id: 'ca17', question: "What tech company became first to reach $4 trillion market cap?", options: ["Apple", "Microsoft", "Nvidia", "Amazon"], answer: "Apple" },
    { id: 'ca18', question: "TikTok was briefly banned in which country in January 2025?", options: ["India", "USA", "Australia", "UK"], answer: "USA" },
    { id: 'ca19', question: "Which streaming service merged with another platform in 2025?", options: ["Netflix", "Paramount+", "Peacock", "Max"], answer: "Paramount+" },
    { id: 'ca20', question: "Pope Leo XIV took which name as the new Pope?", options: ["Leo", "Francis II", "John Paul III", "Benedict XVII"], answer: "Leo" },
  ],
  twenty25: [
    { id: '25_1', question: "Whose song 'Ordinary' broke the US record for most weeks at #1?", options: ["Benson Boone", "Alex Warren", "Tate McRae", "Sombr"], answer: "Alex Warren" },
    { id: '25_2', question: "Kendrick & SZA's 'Luther' samples which R&B legend?", options: ["Marvin Gaye", "Luther Vandross", "Teddy Pendergrass", "Barry White"], answer: "Luther Vandross" },
    { id: '25_3', question: "Lady Gaga's 2025 album is called what?", options: ["Chromatica II", "MAYHEM", "Monster Ball", "ARTPOP 2"], answer: "MAYHEM" },
    { id: '25_4', question: "Which girl group's 'Golden' was first K-pop #1 since Destiny's Child?", options: ["BLACKPINK", "NewJeans", "Huntrix", "KATSEYE"], answer: "Huntrix" },
    { id: '25_5', question: "Tate McRae's hit '2 Hands' is from which album?", options: ["Think Later", "So Close To What", "Greedy", "Exes"], answer: "So Close To What" },
    { id: '25_6', question: "Which artist's 'Folded' was their first Top 10 in 2025?", options: ["Summer Walker", "Kehlani", "SZA", "Ravyn Lenae"], answer: "Kehlani" },
    { id: '25_7', question: "Sabrina Carpenter's 'Manchild' is from which album?", options: ["emails i can't send", "Short n' Sweet", "Man's Best Friend", "Singular"], answer: "Man's Best Friend" },
    { id: '25_8', question: "Which Bruno Mars & Lady Gaga song topped 2025 charts?", options: ["Shallow", "Die With A Smile", "Just Dance", "Uptown Funk"], answer: "Die With A Smile" },
    { id: '25_9', question: "Which animated film grossed over $2 billion in 2025?", options: ["Frozen 3", "Zootopia 2", "Ne Zha 2", "Inside Out 3"], answer: "Ne Zha 2" },
    { id: '25_10', question: "Which Disney remake was first to gross $1 billion?", options: ["Little Mermaid", "Moana", "Lilo & Stitch", "Snow White"], answer: "Lilo & Stitch" },
    { id: '25_11', question: "What's the 2025 Wicked sequel called?", options: ["Wicked: Part Two", "Wicked: For Good", "Wicked: Elphaba Rising", "Wicked Forever"], answer: "Wicked: For Good" },
    { id: '25_12', question: "Which anime became highest-grossing Japanese film ever?", options: ["One Piece: Final", "Demon Slayer: Infinity Castle", "My Hero Academia", "Jujutsu Kaisen"], answer: "Demon Slayer: Infinity Castle" },
    { id: '25_13', question: "The Conjuring: Last Rites broke what record?", options: ["Longest runtime", "Biggest horror opening", "Most sequels", "Best reviews"], answer: "Biggest horror opening" },
    { id: '25_14', question: "What's the third Avatar movie called?", options: ["The Seed Bearer", "Fire and Ash", "Pandora Rising", "Way of Fire"], answer: "Fire and Ash" },
    { id: '25_15', question: "Which superhero launched the new DCU in 2025?", options: ["Batman", "Superman", "Wonder Woman", "The Flash"], answer: "Superman" },
    { id: '25_16', question: "Which video game broke sales records in 2025?", options: ["GTA VI", "Elder Scrolls VI", "Zelda", "Mario"], answer: "GTA VI" },
    { id: '25_17', question: "Charli XCX's 2024 viral album was called what?", options: ["Crash", "Brat", "Pop 2", "Sucker"], answer: "Brat" },
    { id: '25_18', question: "Which reality show dominated ratings in early 2025?", options: ["Love Island", "Squid Game Reality", "The Traitors", "Survivor"], answer: "The Traitors" },
    { id: '25_19', question: "Billie Eilish's 2024 album was called?", options: ["Happier Than Ever", "Hit Me Hard and Soft", "When We Fall Asleep", "Blue"], answer: "Hit Me Hard and Soft" },
    { id: '25_20', question: "Which long-running series ended its final season in 2025?", options: ["Stranger Things", "The Crown", "Cobra Kai", "All of these"], answer: "All of these" },
  ],
  tv: [
    { id: 'tv1', question: "What is Netflix's most-watched English series ever?", options: ["Stranger Things", "Squid Game", "Wednesday", "Bridgerton"], answer: "Wednesday" },
    { id: 'tv2', question: "In The Office (US), what's the paper company?", options: ["Dunder Mifflin", "Wernham Hogg", "Sabre", "Michael Scott Paper"], answer: "Dunder Mifflin" },
    { id: 'tv3', question: "What was the prize money in Squid Game?", options: ["₩45.6 billion", "₩38.4 billion", "₩50 billion", "₩100 billion"], answer: "₩45.6 billion" },
    { id: 'tv4', question: "Which show features Sheldon Cooper?", options: ["Friends", "Big Bang Theory", "How I Met Your Mother", "Brooklyn Nine-Nine"], answer: "Big Bang Theory" },
    { id: 'tv5', question: "In Breaking Bad, what does Walter White teach?", options: ["Physics", "Chemistry", "Biology", "Mathematics"], answer: "Chemistry" },
    { id: 'tv6', question: "What's the coffee shop in Friends?", options: ["Central Perk", "Coffee Central", "The Grind", "Java Joe's"], answer: "Central Perk" },
    { id: 'tv7', question: "Which streaming service made The Crown?", options: ["Amazon Prime", "HBO Max", "Netflix", "Disney+"], answer: "Netflix" },
    { id: 'tv8', question: "In Game of Thrones, what's Daenerys's largest dragon?", options: ["Viserion", "Rhaegal", "Drogon", "Balerion"], answer: "Drogon" },
    { id: 'tv9', question: "Which British show features AC-12?", options: ["Broadchurch", "Line of Duty", "Luther", "Sherlock"], answer: "Line of Duty" },
    { id: 'tv10', question: "What year is Stranger Things Season 1 set?", options: ["1983", "1984", "1985", "1986"], answer: "1983" },
    { id: 'tv11', question: "In The Mandalorian, what's Baby Yoda's real name?", options: ["Yoda Jr", "Grogu", "Yaddle", "The Asset"], answer: "Grogu" },
    { id: 'tv12', question: "Which show has 'The tribe has spoken'?", options: ["Big Brother", "Amazing Race", "Survivor", "The Challenge"], answer: "Survivor" },
    { id: 'tv13', question: "What's the longest-running US animated show?", options: ["South Park", "Family Guy", "The Simpsons", "SpongeBob"], answer: "The Simpsons" },
    { id: 'tv14', question: "What show features Eleven with powers?", options: ["The 100", "Stranger Things", "Umbrella Academy", "The OA"], answer: "Stranger Things" },
    { id: 'tv15', question: "Who is the 'Mother of Dragons'?", options: ["Cersei", "Sansa", "Daenerys", "Arya"], answer: "Daenerys" },
    { id: 'tv16', question: "What show features the Pearson family across timelines?", options: ["Parenthood", "This Is Us", "Brothers & Sisters", "Modern Family"], answer: "This Is Us" },
    { id: 'tv17', question: "In Succession, what company does the Roy family own?", options: ["Waystar Royco", "Delos", "Hooli", "Prestige Worldwide"], answer: "Waystar Royco" },
    { id: 'tv18', question: "What HBO show features dragons returning to Westeros?", options: ["Game of Thrones", "House of the Dragon", "The Witcher", "Wheel of Time"], answer: "House of the Dragon" },
    { id: 'tv19', question: "Which sitcom is set in Pawnee, Indiana?", options: ["The Office", "Parks and Recreation", "Brooklyn Nine-Nine", "Schitt's Creek"], answer: "Parks and Recreation" },
    { id: 'tv20', question: "What show features a chemistry teacher turned drug lord?", options: ["Ozark", "Breaking Bad", "Narcos", "Better Call Saul"], answer: "Breaking Bad" },
  ],
  history: [
    { id: 'his1', question: "In which year did World War I begin?", options: ["1912", "1914", "1916", "1918"], answer: "1914" },
    { id: 'his2', question: "Who was first to walk on the moon?", options: ["Buzz Aldrin", "Neil Armstrong", "John Glenn", "Yuri Gagarin"], answer: "Neil Armstrong" },
    { id: 'his3', question: "The Berlin Wall fell in which year?", options: ["1987", "1989", "1991", "1993"], answer: "1989" },
    { id: 'his4', question: "Who was British PM during most of WWII?", options: ["Chamberlain", "Churchill", "Attlee", "Eden"], answer: "Churchill" },
    { id: 'his5', question: "The Titanic sank in which year?", options: ["1910", "1912", "1914", "1916"], answer: "1912" },
    { id: 'his6', question: "Which civilization built Machu Picchu?", options: ["Aztec", "Maya", "Inca", "Olmec"], answer: "Inca" },
    { id: 'his7', question: "When did the US declare independence?", options: ["1774", "1775", "1776", "1777"], answer: "1776" },
    { id: 'his8', question: "Who painted the Sistine Chapel ceiling?", options: ["Da Vinci", "Raphael", "Michelangelo", "Donatello"], answer: "Michelangelo" },
    { id: 'his9', question: "The French Revolution began in which year?", options: ["1776", "1789", "1799", "1804"], answer: "1789" },
    { id: 'his10', question: "Who was UK's first female Prime Minister?", options: ["Theresa May", "Margaret Thatcher", "Queen Victoria", "Elizabeth II"], answer: "Margaret Thatcher" },
    { id: 'his11', question: "Which volcano destroyed Pompeii?", options: ["Etna", "Vesuvius", "Stromboli", "Olympus"], answer: "Vesuvius" },
    { id: 'his12', question: "Which US war was North vs South?", options: ["Revolutionary", "1812", "Civil War", "Mexican-American"], answer: "Civil War" },
    { id: 'his13', question: "Who was called the 'Iron Lady'?", options: ["Elizabeth II", "Thatcher", "Merkel", "Gandhi"], answer: "Thatcher" },
    { id: 'his14', question: "The Great Fire of London occurred in?", options: ["1566", "1666", "1766", "1866"], answer: "1666" },
    { id: 'his15', question: "Who discovered penicillin?", options: ["Pasteur", "Fleming", "Lister", "Jenner"], answer: "Fleming" },
    { id: 'his16', question: "What year did the Roman Empire fall (Western)?", options: ["376 AD", "410 AD", "476 AD", "500 AD"], answer: "476 AD" },
    { id: 'his17', question: "Who was the first President of the United States?", options: ["John Adams", "Thomas Jefferson", "George Washington", "Benjamin Franklin"], answer: "George Washington" },
    { id: 'his18', question: "The Renaissance began in which country?", options: ["France", "England", "Italy", "Spain"], answer: "Italy" },
    { id: 'his19', question: "Who wrote the 'I Have a Dream' speech?", options: ["Malcolm X", "Martin Luther King Jr.", "Rosa Parks", "John Lewis"], answer: "Martin Luther King Jr." },
    { id: 'his20', question: "What empire was ruled by Genghis Khan?", options: ["Ottoman", "Roman", "Mongol", "Persian"], answer: "Mongol" },
  ],
  caribbean: [
    { id: 'car1', question: "What is Trinidad's traditional Christmas music?", options: ["Calypso", "Parang", "Soca", "Reggae"], answer: "Parang" },
    { id: 'car2', question: "What's Trinidad's rum eggnog called?", options: ["Sorrel", "Ponche de Crème", "Ginger Beer", "Mauby"], answer: "Ponche de Crème" },
    { id: 'car3', question: "Pastelles are wrapped in what?", options: ["Corn husk", "Banana leaves", "Foil", "Pastry"], answer: "Banana leaves" },
    { id: 'car4', question: "What is pastelles filled with?", options: ["Rice and beans", "Meat in cornmeal", "Vegetables", "Fish"], answer: "Meat in cornmeal" },
    { id: 'car5', question: "Where did parang music come from?", options: ["Spain", "Venezuela", "Portugal", "Colombia"], answer: "Venezuela" },
    { id: 'car6', question: "What's Guyana's national dish?", options: ["Jerk Chicken", "Pepperpot", "Curry Goat", "Jug Jug"], answer: "Pepperpot" },
    { id: 'car7', question: "Cassareep is made from what?", options: ["Molasses", "Cassava", "Tamarind", "Coconut"], answer: "Cassava" },
    { id: 'car8', question: "Which settlers brought garlic pork to Guyana?", options: ["British", "Dutch", "Portuguese", "French"], answer: "Portuguese" },
    { id: 'car9', question: "What bread goes with pepperpot?", options: ["Roti", "Plait bread", "Bake", "Hard dough"], answer: "Plait bread" },
    { id: 'car10', question: "Who created pepperpot?", options: ["Taino", "Amerindians", "Arawak", "Caribs"], answer: "Amerindians" },
    { id: 'car11', question: "Jug Jug is from which island?", options: ["Trinidad", "Barbados", "Jamaica", "Guyana"], answer: "Barbados" },
    { id: 'car12', question: "What's 'Great Cake' in Barbados?", options: ["Bread", "Rum fruitcake", "Coconut cake", "Sponge"], answer: "Rum fruitcake" },
    { id: 'car13', question: "Where do Bajans gather Christmas morning?", options: ["Oistins", "Queen's Park", "Holetown", "Bathsheba"], answer: "Queen's Park" },
    { id: 'car14', question: "What peas are in Jamaican rice and peas?", options: ["Black-eyed", "Gungo peas", "Kidney beans", "Chickpeas"], answer: "Gungo peas" },
    { id: 'car15', question: "Sorrel is made from which flower?", options: ["Rose", "Hibiscus", "Poinsettia", "Jasmine"], answer: "Hibiscus" },
    { id: 'car16', question: "What fruit is in Jamaican Christmas cake?", options: ["Mango", "Mixed dried fruits", "Coconut", "Banana"], answer: "Mixed dried fruits" },
    { id: 'car17', question: "Black cake is soaked in which spirits?", options: ["Vodka", "Rum and wine", "Whiskey", "Brandy only"], answer: "Rum and wine" },
    { id: 'car18', question: "What's Caribbean ham typically glazed with?", options: ["Honey mustard", "Pineapple and brown sugar", "Maple syrup", "BBQ sauce"], answer: "Pineapple and brown sugar" },
    { id: 'car19', question: "Jonkonnu is a Christmas tradition from which island?", options: ["Trinidad", "Barbados", "Jamaica", "Guyana"], answer: "Jamaica" },
    { id: 'car20', question: "What spice is essential in Caribbean Christmas drinks?", options: ["Cinnamon", "Nutmeg", "Cloves", "All of these"], answer: "All of these" },
  ],
  trivia: [
    { id: 't1', question: "What plant is hung for Christmas kisses?", options: ["Holly", "Ivy", "Mistletoe", "Poinsettia"], answer: "Mistletoe" },
    { id: 't2', question: "Which country started Christmas trees?", options: ["England", "Germany", "Norway", "Sweden"], answer: "Germany" },
    { id: 't3', question: "What's the day after Christmas in UK?", options: ["Second Christmas", "Boxing Day", "St. Stephen's Day", "Gift Day"], answer: "Boxing Day" },
    { id: 't4', question: "In the song, what's given on the 5th day?", options: ["Calling birds", "Gold rings", "French hens", "Geese a-laying"], answer: "Gold rings" },
    { id: 't5', question: "Which country gives London its tree each year?", options: ["Sweden", "Finland", "Norway", "Denmark"], answer: "Norway" },
    { id: 't6', question: "Best-selling Christmas single ever?", options: ["Last Christmas", "White Christmas", "All I Want for Christmas", "Silent Night"], answer: "White Christmas" },
    { id: 't7', question: "What color are mistletoe berries?", options: ["Red", "White", "Green", "Black"], answer: "White" },
    { id: 't8', question: "Which country eats KFC for Christmas?", options: ["USA", "Japan", "South Korea", "Philippines"], answer: "Japan" },
    { id: 't9', question: "What's hidden in Christmas pudding?", options: ["Carrot", "Coin", "Almond", "Bean"], answer: "Coin" },
    { id: 't10', question: "Which carol mentions 'figgy pudding'?", options: ["Deck the Halls", "We Wish You a Merry Christmas", "Jingle Bells", "Silent Night"], answer: "We Wish You a Merry Christmas" },
    { id: 't11', question: "What do Icelanders receive Christmas Eve?", options: ["Chocolate", "Books", "Ornaments", "Candles"], answer: "Books" },
    { id: 't12', question: "Who composed The Nutcracker?", options: ["Rachmaninoff", "Prokofiev", "Tchaikovsky", "Stravinsky"], answer: "Tchaikovsky" },
    { id: 't13', question: "Which reindeer has a mythological name?", options: ["Dasher", "Cupid", "Prancer", "Comet"], answer: "Cupid" },
    { id: 't14', question: "What are you supposed to do under mistletoe?", options: ["Shake hands", "Kiss", "Make a wish", "Sing"], answer: "Kiss" },
    { id: 't15', question: "Eggnog originated in which country?", options: ["USA", "Germany", "Britain", "France"], answer: "Britain" },
    { id: 't16', question: "What decoration was originally made from silver strands?", options: ["Garland", "Tinsel", "Ornaments", "Lights"], answer: "Tinsel" },
    { id: 't17', question: "Which president banned Christmas trees in the White House?", options: ["Lincoln", "Teddy Roosevelt", "Washington", "Jefferson"], answer: "Teddy Roosevelt" },
    { id: 't18', question: "Candy canes were originally what color?", options: ["Red", "White", "Green", "Striped"], answer: "White" },
    { id: 't19', question: "How many ghosts appear in A Christmas Carol?", options: ["3", "4", "5", "6"], answer: "4" },
    { id: 't20', question: "What Victorian monarch popularized Christmas trees in Britain?", options: ["Victoria", "George III", "Edward VII", "William IV"], answer: "Victoria" },
  ],
  movies: [
    { id: 'm1', question: "In Home Alone, where do the McCallisters go?", options: ["London", "Paris", "Rome", "Miami"], answer: "Paris" },
    { id: 'm2', question: "What's the main character's name in Elf?", options: ["Buddy", "Jack", "Will", "Santa Jr"], answer: "Buddy" },
    { id: 'm3', question: "In Polar Express, what's the first gift of Christmas?", options: ["A train", "A bell", "A toy", "A book"], answer: "A bell" },
    { id: 'm4', question: "Which movie has the Griswold family?", options: ["Home Alone", "Elf", "Christmas Vacation", "Jingle All the Way"], answer: "Christmas Vacation" },
    { id: 'm5', question: "What's the Grinch's dog's name?", options: ["Max", "Rex", "Spot", "Fido"], answer: "Max" },
    { id: 'm6', question: "In It's a Wonderful Life, who's the angel?", options: ["Michael", "Gabriel", "Clarence", "Raphael"], answer: "Clarence" },
    { id: 'm7', question: "Which Tim Burton film has Jack Skellington?", options: ["Corpse Bride", "Frankenweenie", "Nightmare Before Christmas", "Beetlejuice"], answer: "Nightmare Before Christmas" },
    { id: 'm8', question: "In Die Hard, what building is taken over?", options: ["Empire State", "Nakatomi Plaza", "Willis Tower", "One World Trade"], answer: "Nakatomi Plaza" },
    { id: 'm9', question: "What does Ralphie want in A Christmas Story?", options: ["Train set", "BB gun", "Bicycle", "Puppy"], answer: "BB gun" },
    { id: 'm10', question: "In Love Actually, what song is #1 at Christmas?", options: ["White Christmas", "Christmas Is All Around", "Last Christmas", "Santa Baby"], answer: "Christmas Is All Around" },
    { id: 'm11', question: "What year was Home Alone released?", options: ["1988", "1990", "1992", "1994"], answer: "1990" },
    { id: 'm12', question: "Who plays the Grinch in the 2000 film?", options: ["Jim Carrey", "Mike Myers", "Robin Williams", "Adam Sandler"], answer: "Jim Carrey" },
    { id: 'm13', question: "In The Santa Clause, what happens when Scott wears the suit?", options: ["He flies", "Gains weight", "Turns invisible", "Becomes immortal"], answer: "Gains weight" },
    { id: 'm14', question: "Which film has Will Ferrell raised by elves?", options: ["Santa Clause", "Elf", "Jingle All the Way", "Fred Claus"], answer: "Elf" },
    { id: 'm15', question: "What kind of tree does Charlie Brown pick?", options: ["Big and full", "Small and sparse", "Artificial", "Pine"], answer: "Small and sparse" },
    { id: 'm16', question: "What street is the miracle on in the classic film?", options: ["34th Street", "42nd Street", "5th Avenue", "Broadway"], answer: "34th Street" },
    { id: 'm17', question: "In Elf, what's the best way to spread Christmas cheer?", options: ["Giving gifts", "Singing loud", "Decorating", "Baking cookies"], answer: "Singing loud" },
    { id: 'm18', question: "What does Kevin use to hurt the burglars in Home Alone?", options: ["Paint cans", "All of these", "Ornaments", "Blowtorch"], answer: "All of these" },
    { id: 'm19', question: "How the Grinch Stole Christmas takes place in what town?", options: ["Whoville", "Christmas Town", "Holiday Village", "Santa's Workshop"], answer: "Whoville" },
    { id: 'm20', question: "In The Holiday, which two countries do the women swap homes?", options: ["USA & France", "UK & USA", "UK & Italy", "Canada & UK"], answer: "UK & USA" },
  ],
  music: [
    { id: 'mu1', question: "Who sings 'All I Want for Christmas Is You'?", options: ["Whitney Houston", "Mariah Carey", "Celine Dion", "Beyoncé"], answer: "Mariah Carey" },
    { id: 'mu2', question: "Which band sang 'Last Christmas'?", options: ["Duran Duran", "Wham!", "Culture Club", "Spandau Ballet"], answer: "Wham!" },
    { id: 'mu3', question: "Which song has 'chestnuts roasting'?", options: ["Winter Wonderland", "The Christmas Song", "White Christmas", "Let It Snow"], answer: "The Christmas Song" },
    { id: 'mu4', question: "Who sang the original 'White Christmas'?", options: ["Sinatra", "Dean Martin", "Bing Crosby", "Nat King Cole"], answer: "Bing Crosby" },
    { id: 'mu5', question: "What does Frosty have for a nose?", options: ["Carrot", "Button", "Coal", "Stick"], answer: "Button" },
    { id: 'mu6', question: "Who released 'Rockin' Around the Christmas Tree'?", options: ["Brenda Lee", "Connie Francis", "Patsy Cline", "Doris Day"], answer: "Brenda Lee" },
    { id: 'mu7', question: "What year was 'Do They Know It's Christmas?' released?", options: ["1982", "1984", "1986", "1988"], answer: "1984" },
    { id: 'mu8', question: "Who sang 'Blue Christmas'?", options: ["Johnny Cash", "Elvis Presley", "Roy Orbison", "Jerry Lee Lewis"], answer: "Elvis Presley" },
    { id: 'mu9', question: "In 'Jingle Bells', what sleigh is it?", options: ["One-horse open", "Two-horse closed", "Reindeer-pulled", "Magic flying"], answer: "One-horse open" },
    { id: 'mu10', question: "Who wrote 'Silent Night'?", options: ["Handel", "Bach", "Franz Gruber", "Mozart"], answer: "Franz Gruber" },
    { id: 'mu11', question: "Who sang 'Santa Baby' originally?", options: ["Marilyn Monroe", "Eartha Kitt", "Madonna", "Kylie"], answer: "Eartha Kitt" },
    { id: 'mu12', question: "What does 'Feliz Navidad' mean?", options: ["Happy Holidays", "Merry Christmas", "Happy New Year", "Good Tidings"], answer: "Merry Christmas" },
    { id: 'mu13', question: "Band Aid was organized by Bob Geldof and?", options: ["Bono", "Midge Ure", "Sting", "Phil Collins"], answer: "Midge Ure" },
    { id: 'mu14', question: "In Rudolph, who laughed and called him names?", options: ["Santa", "Other reindeer", "Elves", "Children"], answer: "Other reindeer" },
    { id: 'mu15', question: "Which song says 'Have yourself a merry little Christmas'?", options: ["Silver Bells", "Meet Me in St. Louis", "White Christmas", "The Christmas Song"], answer: "Meet Me in St. Louis" },
    { id: 'mu16', question: "Who sang 'Happy Xmas (War Is Over)'?", options: ["Paul McCartney", "John Lennon", "George Harrison", "Ringo Starr"], answer: "John Lennon" },
    { id: 'mu17', question: "Which artist recorded 'Christmas (Baby Please Come Home)'?", options: ["Mariah Carey", "Darlene Love", "Whitney Houston", "Celine Dion"], answer: "Darlene Love" },
    { id: 'mu18', question: "What song says 'simply having a wonderful Christmas time'?", options: ["Happy Xmas", "Wonderful Christmastime", "Jingle Bell Rock", "Holly Jolly Christmas"], answer: "Wonderful Christmastime" },
    { id: 'mu19', question: "Jose Feliciano recorded which bilingual Christmas hit?", options: ["Silent Night", "Feliz Navidad", "White Christmas", "Little Drummer Boy"], answer: "Feliz Navidad" },
    { id: 'mu20', question: "Which country does 'Silent Night' come from?", options: ["Germany", "Austria", "Switzerland", "Netherlands"], answer: "Austria" },
  ],
  rnb: [
    { id: 'rnb1', question: "Which group released 'This Christmas' in 1993?", options: ["Boyz II Men", "New Edition", "Jodeci", "Blackstreet"], answer: "Boyz II Men" },
    { id: 'rnb2', question: "Who sang 'Santa Baby' in 1953?", options: ["Etta James", "Eartha Kitt", "Ella Fitzgerald", "Nina Simone"], answer: "Eartha Kitt" },
    { id: 'rnb3', question: "Donny Hathaway's 'This Christmas' year?", options: ["1970", "1975", "1980", "1985"], answer: "1970" },
    { id: 'rnb4', question: "Who released '8 Days of Christmas'?", options: ["Destiny's Child", "TLC", "En Vogue", "SWV"], answer: "Destiny's Child" },
    { id: 'rnb5', question: "Who performed 'Give Love on Christmas Day'?", options: ["Temptations", "Jackson 5", "Four Tops", "O'Jays"], answer: "Jackson 5" },
    { id: 'rnb6', question: "Who released 'Someday at Christmas'?", options: ["Marvin Gaye", "Stevie Wonder", "Smokey Robinson", "Lionel Richie"], answer: "Stevie Wonder" },
    { id: 'rnb7', question: "Who sang 'Christmas in Hollis'?", options: ["Run-DMC", "Beastie Boys", "Public Enemy", "LL Cool J"], answer: "Run-DMC" },
    { id: 'rnb8', question: "Who released 'Merry Christmas, Happy Holidays'?", options: ["Backstreet Boys", "*NSYNC", "98 Degrees", "New Kids"], answer: "*NSYNC" },
    { id: 'rnb9', question: "Who released 'Under the Mistletoe' in 2011?", options: ["Chris Brown", "Justin Bieber", "Usher", "Ne-Yo"], answer: "Justin Bieber" },
    { id: 'rnb10', question: "Which Motown act recorded 'I Saw Mommy Kissing Santa'?", options: ["Diana Ross", "Jackson 5", "Stevie Wonder", "Marvin Gaye"], answer: "Jackson 5" },
    { id: 'rnb11', question: "Who sang 'The Christmas Song' (Chestnuts)?", options: ["Nat King Cole", "Sam Cooke", "Ray Charles", "Otis Redding"], answer: "Nat King Cole" },
    { id: 'rnb12', question: "Which Whitney Houston Christmas song was a hit?", options: ["Do You Hear What I Hear", "Joy to the World", "Silent Night", "O Holy Night"], answer: "Do You Hear What I Hear" },
    { id: 'rnb13', question: "Who had a 2007 hit remake of 'This Christmas'?", options: ["Chris Brown", "Usher", "Ne-Yo", "Trey Songz"], answer: "Chris Brown" },
    { id: 'rnb14', question: "TLC released which Christmas song?", options: ["Sleigh Ride", "All I Want for Christmas", "Santa Claus Is Coming", "Winter Wonderland"], answer: "Sleigh Ride" },
    { id: 'rnb15', question: "Which girl group sang 'Christmas Lullaby' in the 90s?", options: ["TLC", "En Vogue", "SWV", "Destiny's Child"], answer: "SWV" },
    { id: 'rnb16', question: "Who released 'Christmas Eve' with soulful vocals?", options: ["Luther Vandross", "Donny Hathaway", "Al Green", "Teddy Pendergrass"], answer: "Luther Vandross" },
    { id: 'rnb17', question: "Mary J. Blige released which Christmas album?", options: ["A Mary Christmas", "Christmas Album", "Soulful Christmas", "My Christmas"], answer: "A Mary Christmas" },
    { id: 'rnb18', question: "Which Temptations song is a Christmas classic?", options: ["My Girl", "Silent Night", "Rudolph the Red-Nosed Reindeer", "White Christmas"], answer: "Silent Night" },
    { id: 'rnb19', question: "Which R&B group sang 'Let It Snow'?", options: ["New Edition", "Boyz II Men", "Jodeci", "112"], answer: "Boyz II Men" },
    { id: 'rnb20', question: "Who released 'A Charlie Brown Christmas' jazz album?", options: ["Duke Ellington", "Vince Guaraldi", "Herbie Hancock", "Miles Davis"], answer: "Vince Guaraldi" },
  ],
  afrobeats: [
    { id: 'afro1', question: "Which Nigerian artist is 'Starboy'?", options: ["Davido", "Wizkid", "Burna Boy", "Olamide"], answer: "Wizkid" },
    { id: 'afro2', question: "Who won Grammy Best Global Music Album 2021?", options: ["Wizkid", "Burna Boy", "Davido", "Tiwa Savage"], answer: "Burna Boy" },
    { id: 'afro3', question: "What is Davido's real first name?", options: ["Daniel", "David", "Damola", "Dele"], answer: "David" },
    { id: 'afro4', question: "Which country is Burna Boy from?", options: ["Ghana", "Nigeria", "Kenya", "South Africa"], answer: "Nigeria" },
    { id: 'afro5', question: "Who's on Beyoncé's 'Brown Skin Girl'?", options: ["Burna Boy", "Wizkid", "Davido", "Mr Eazi"], answer: "Wizkid" },
    { id: 'afro6', question: "What's Wizkid's hit with Drake?", options: ["One Dance", "Controlla", "Hotline Bling", "God's Plan"], answer: "One Dance" },
    { id: 'afro7', question: "Who is called 'Mama Africa'?", options: ["Yemi Alade", "Tiwa Savage", "Simi", "Tems"], answer: "Yemi Alade" },
    { id: 'afro8', question: "Who sang 'Essence' ft. Justin Bieber?", options: ["Davido", "Wizkid", "Burna Boy", "CKay"], answer: "Wizkid" },
    { id: 'afro9', question: "Which CKay song went viral on TikTok?", options: ["Love Nwantiti", "Finesse", "Fall", "Soco"], answer: "Love Nwantiti" },
    { id: 'afro10', question: "What's Burna Boy's Grammy-winning album?", options: ["African Giant", "Twice as Tall", "Love, Damini", "Outside"], answer: "Twice as Tall" },
    { id: 'afro11', question: "Who is 'OBO' (Omo Baba Olowo)?", options: ["Wizkid", "Davido", "Burna Boy", "Olamide"], answer: "Davido" },
    { id: 'afro12', question: "Tems is from which country?", options: ["Ghana", "Nigeria", "Kenya", "South Africa"], answer: "Nigeria" },
    { id: 'afro13', question: "Who sang 'Ye'?", options: ["Wizkid", "Davido", "Burna Boy", "Mr Eazi"], answer: "Burna Boy" },
    { id: 'afro14', question: "Who featured on Drake's 'Fountains'?", options: ["Tems", "Tiwa Savage", "Simi", "Yemi Alade"], answer: "Tems" },
    { id: 'afro15', question: "What is Tiwa Savage known as?", options: ["African Bad Girl", "Queen of Afrobeats", "Mama Africa", "African Queen"], answer: "African Bad Girl" },
    { id: 'afro16', question: "Rema's viral hit 'Calm Down' featured which artist?", options: ["Beyoncé", "Selena Gomez", "Dua Lipa", "Rihanna"], answer: "Selena Gomez" },
    { id: 'afro17', question: "Which artist is known as 'African Giant'?", options: ["Wizkid", "Davido", "Burna Boy", "Olamide"], answer: "Burna Boy" },
    { id: 'afro18', question: "Ayra Starr is signed to which record label?", options: ["Davido Music", "Starboy", "Mavin Records", "Spaceship"], answer: "Mavin Records" },
    { id: 'afro19', question: "Which song features 'You don't need no other body'?", options: ["Essence", "Peru", "Love Nwantiti", "Finesse"], answer: "Essence" },
    { id: 'afro20', question: "Fireboy DML collaborated with Ed Sheeran on which song?", options: ["Peru", "Playboy", "Bandana", "Jealous"], answer: "Peru" },
  ],
  reggae: [
    { id: 'reg1', question: "Who is the 'King of Reggae'?", options: ["Peter Tosh", "Bob Marley", "Jimmy Cliff", "Toots Hibbert"], answer: "Bob Marley" },
    { id: 'reg2', question: "What's Bob Marley's band called?", options: ["The Wailers", "The Melodians", "Third World", "Inner Circle"], answer: "The Wailers" },
    { id: 'reg3', question: "Which city is reggae's birthplace?", options: ["Montego Bay", "Kingston", "Ocho Rios", "Negril"], answer: "Kingston" },
    { id: 'reg4', question: "What religion is associated with reggae?", options: ["Christianity", "Islam", "Rastafari", "Buddhism"], answer: "Rastafari" },
    { id: 'reg5', question: "Who sang 'I Can See Clearly Now'?", options: ["Bob Marley", "Jimmy Cliff", "Johnny Nash", "Peter Tosh"], answer: "Johnny Nash" },
    { id: 'reg6', question: "What's Sean Paul's genre primarily?", options: ["Reggae", "Dancehall", "Ska", "Rocksteady"], answer: "Dancehall" },
    { id: 'reg7', question: "Who sang 'It Wasn't Me'?", options: ["Sean Paul", "Shaggy", "Beenie Man", "Buju Banton"], answer: "Shaggy" },
    { id: 'reg8', question: "Which Marley song says 'Every little thing gonna be alright'?", options: ["No Woman No Cry", "Three Little Birds", "One Love", "Redemption Song"], answer: "Three Little Birds" },
    { id: 'reg9', question: "UB40 covered which song?", options: ["One Love", "Red Red Wine", "Buffalo Soldier", "Stir It Up"], answer: "Red Red Wine" },
    { id: 'reg10', question: "Biggest reggae scene after Jamaica?", options: ["USA", "UK", "Japan", "Brazil"], answer: "UK" },
    { id: 'reg11', question: "What year did Bob Marley die?", options: ["1979", "1981", "1983", "1985"], answer: "1981" },
    { id: 'reg12', question: "Which Marley album is considered his masterpiece?", options: ["Exodus", "Legend", "Kaya", "Uprising"], answer: "Exodus" },
    { id: 'reg13', question: "Who sang 'The Harder They Come'?", options: ["Bob Marley", "Jimmy Cliff", "Peter Tosh", "Bunny Wailer"], answer: "Jimmy Cliff" },
    { id: 'reg14', question: "What does 'Jah' mean in Rastafari?", options: ["Peace", "Love", "God", "King"], answer: "God" },
    { id: 'reg15', question: "Which Marley song is a freedom anthem?", options: ["Buffalo Soldier", "Redemption Song", "Jamming", "Stir It Up"], answer: "Redemption Song" },
    { id: 'reg16', question: "Who sang 'Many Rivers to Cross'?", options: ["Bob Marley", "Jimmy Cliff", "Peter Tosh", "Toots Hibbert"], answer: "Jimmy Cliff" },
    { id: 'reg17', question: "What is Bob Marley's wife's name?", options: ["Janet", "Rita", "Sharon", "Cedella"], answer: "Rita" },
    { id: 'reg18', question: "Which band had a hit with 'Pass the Dutchie'?", options: ["Black Uhuru", "Musical Youth", "Third World", "Steel Pulse"], answer: "Musical Youth" },
    { id: 'reg19', question: "Buju Banton is from which country?", options: ["Trinidad", "Barbados", "Jamaica", "Bahamas"], answer: "Jamaica" },
    { id: 'reg20', question: "What year was reggae added to UNESCO's cultural heritage?", options: ["2016", "2018", "2020", "2022"], answer: "2018" },
  ],
  popculture: [
    { id: 'pop1', question: "Which platform is known for short videos?", options: ["Instagram", "TikTok", "Snapchat", "Twitter"], answer: "TikTok" },
    { id: 'pop2', question: "Which service released Squid Game?", options: ["Amazon Prime", "Netflix", "Disney+", "Hulu"], answer: "Netflix" },
    { id: 'pop3', question: "What's Taylor Swift's 2024 tour called?", options: ["Reputation Tour", "Eras Tour", "1989 Tour", "Lover Tour"], answer: "Eras Tour" },
    { id: 'pop4', question: "Who released 'Anti-Hero' in 2022?", options: ["Beyoncé", "Taylor Swift", "Dua Lipa", "Adele"], answer: "Taylor Swift" },
    { id: 'pop5', question: "Highest-grossing Marvel film of 2019?", options: ["Infinity War", "Endgame", "Far From Home", "Captain Marvel"], answer: "Endgame" },
    { id: 'pop6', question: "What's OpenAI's chatbot called?", options: ["Siri", "Alexa", "ChatGPT", "Cortana"], answer: "ChatGPT" },
    { id: 'pop7', question: "Which Miley song went viral in 2023?", options: ["Wrecking Ball", "Flowers", "Midnight Sky", "Party in the USA"], answer: "Flowers" },
    { id: 'pop8', question: "What's Beyoncé's 2022 album?", options: ["Lemonade", "Renaissance", "4", "Beyoncé"], answer: "Renaissance" },
    { id: 'pop9', question: "Which movie has 'We Don't Talk About Bruno'?", options: ["Coco", "Encanto", "Moana", "Frozen"], answer: "Encanto" },
    { id: 'pop10', question: "Which game character says 'It's-a me!'?", options: ["Sonic", "Mario", "Link", "Pikachu"], answer: "Mario" },
    { id: 'pop11', question: "Most followed person on Instagram?", options: ["Kylie Jenner", "Cristiano Ronaldo", "Selena Gomez", "Kim Kardashian"], answer: "Cristiano Ronaldo" },
    { id: 'pop12', question: "What's Elon Musk's space company?", options: ["Blue Origin", "SpaceX", "Virgin Galactic", "NASA"], answer: "SpaceX" },
    { id: 'pop13', question: "Which K-pop group performed at 2022 Grammys?", options: ["BLACKPINK", "BTS", "EXO", "TWICE"], answer: "BTS" },
    { id: 'pop14', question: "Which social media did Musk acquire?", options: ["Facebook", "Instagram", "Twitter", "TikTok"], answer: "Twitter" },
    { id: 'pop15', question: "Which movie features the song 'Shallow'?", options: ["La La Land", "A Star Is Born", "Greatest Showman", "Bohemian Rhapsody"], answer: "A Star Is Born" },
    { id: 'pop16', question: "What AI image generator went viral in 2022?", options: ["ChatGPT", "DALL-E", "Siri", "Alexa"], answer: "DALL-E" },
    { id: 'pop17', question: "Which movie won Best Picture at the 2024 Oscars?", options: ["Barbie", "Oppenheimer", "Killers of the Flower Moon", "Poor Things"], answer: "Oppenheimer" },
    { id: 'pop18', question: "What was the top-grossing film of 2023?", options: ["Barbie", "Oppenheimer", "Avatar 2", "Super Mario Bros"], answer: "Barbie" },
    { id: 'pop19', question: "Which app became famous for BeReal moments?", options: ["TikTok", "BeReal", "Instagram", "Snapchat"], answer: "BeReal" },
    { id: 'pop20', question: "What metaverse company did Facebook rebrand to?", options: ["Meta", "Horizon", "Quest", "Reality Labs"], answer: "Meta" },
  ],
  children: [
    { id: 'ch1', question: "What color is Rudolph's nose?", options: ["Blue", "Green", "Red", "Yellow"], answer: "Red" },
    { id: 'ch2', question: "How many reindeer pull Santa's sleigh with Rudolph?", options: ["7", "8", "9", "10"], answer: "9" },
    { id: 'ch3', question: "What do we leave for Santa?", options: ["Pizza", "Cookies and milk", "Cake", "Ice cream"], answer: "Cookies and milk" },
    { id: 'ch4', question: "What do elves make?", options: ["Cars", "Toys", "Houses", "Computers"], answer: "Toys" },
    { id: 'ch5', question: "What does Santa say?", options: ["Yo yo yo!", "Ho ho ho!", "Hey hey hey!", "Ha ha ha!"], answer: "Ho ho ho!" },
    { id: 'ch6', question: "Where does Santa live?", options: ["South Pole", "North Pole", "Iceland", "Moon"], answer: "North Pole" },
    { id: 'ch7', question: "What goes on top of the tree?", options: ["Hat", "Star or Angel", "Balloon", "Candle"], answer: "Star or Angel" },
    { id: 'ch8', question: "What has a carrot nose?", options: ["Ice man", "Snowman", "Frost boy", "Winter wizard"], answer: "Snowman" },
    { id: 'ch9', question: "What shape is a candy cane?", options: ["Circle", "Square", "Hook shape", "Triangle"], answer: "Hook shape" },
    { id: 'ch10', question: "In Frozen, what's the snowman's name?", options: ["Oscar", "Oliver", "Olaf", "Oreo"], answer: "Olaf" },
    { id: 'ch11', question: "What color is Santa's suit?", options: ["Blue", "Green", "Red", "White"], answer: "Red" },
    { id: 'ch12', question: "What do elves have on their ears?", options: ["Earrings", "Points", "Fur", "Nothing"], answer: "Points" },
    { id: 'ch13', question: "What falls from the sky in winter?", options: ["Rain", "Leaves", "Snow", "Flowers"], answer: "Snow" },
    { id: 'ch14', question: "What do you hang for Santa to fill?", options: ["Pictures", "Stockings", "Hats", "Shoes"], answer: "Stockings" },
    { id: 'ch15', question: "Which song has 'Jingle bells, jingle bells'?", options: ["Silent Night", "Jingle Bells", "Rudolph", "Frosty"], answer: "Jingle Bells" },
    { id: 'ch16', question: "What do you put on top of a gingerbread house?", options: ["Star", "Candy", "Frosting", "All of these"], answer: "All of these" },
    { id: 'ch17', question: "What animal pulls Santa's sleigh?", options: ["Horses", "Dogs", "Reindeer", "Elves"], answer: "Reindeer" },
    { id: 'ch18', question: "What do elves wear on their heads?", options: ["Crowns", "Pointed hats", "Helmets", "Nothing"], answer: "Pointed hats" },
    { id: 'ch19', question: "What do you leave out for Santa's reindeer?", options: ["Cookies", "Carrots", "Milk", "Hay"], answer: "Carrots" },
    { id: 'ch20', question: "What holiday comes right after Christmas?", options: ["Easter", "New Year's", "Valentine's", "Halloween"], answer: "New Year's" },
  ],
  bible: [
    // BASIC NATIVITY - Questions 1-10
    { id: 'bib1', question: "Where was Jesus born?", options: ["Jerusalem", "Nazareth", "Bethlehem", "Galilee"], answer: "Bethlehem" },
    { id: 'bib2', question: "What gifts did the Wise Men bring?", options: ["Food, clothes", "Gold, frankincense, myrrh", "Money, jewels", "Bread, wine"], answer: "Gold, frankincense, myrrh" },
    { id: 'bib3', question: "Where was Jesus laid after birth?", options: ["A bed", "A basket", "A manger", "A cradle"], answer: "A manger" },
    { id: 'bib4', question: "Who told Mary she'd have a baby?", options: ["Joseph", "Gabriel", "Michael", "Peter"], answer: "Gabriel" },
    { id: 'bib5', question: "Who tried to harm baby Jesus?", options: ["David", "Solomon", "Herod", "Caesar"], answer: "Herod" },
    { id: 'bib6', question: "What guided the Wise Men?", options: ["A map", "An angel", "A star", "A vision"], answer: "A star" },
    { id: 'bib7', question: "Who first visited baby Jesus?", options: ["Kings", "Shepherds", "Soldiers", "Priests"], answer: "Shepherds" },
    { id: 'bib8', question: "What does 'Emmanuel' mean?", options: ["Son of David", "Prince of Peace", "God with us", "Mighty King"], answer: "God with us" },
    { id: 'bib9', question: "What was Joseph's job?", options: ["Fisherman", "Carpenter", "Tax collector", "Shepherd"], answer: "Carpenter" },
    { id: 'bib10', question: "Why did they go to Bethlehem?", options: ["Visit family", "For a census", "Escape Herod", "For Passover"], answer: "For a census" },
    // HISTORICAL CONTEXT - Questions 11-15
    { id: 'bib11', question: "Which Roman Emperor ordered the census?", options: ["Nero", "Augustus", "Tiberius", "Claudius"], answer: "Augustus" },
    { id: 'bib12', question: "Which prophet foretold Bethlehem as birthplace?", options: ["Isaiah", "Micah", "Jeremiah", "Daniel"], answer: "Micah" },
    { id: 'bib13', question: "Where did the family flee to escape Herod?", options: ["Nazareth", "Jerusalem", "Egypt", "Jordan"], answer: "Egypt" },
    { id: 'bib14', question: "What does 'Bethlehem' mean in Hebrew?", options: ["City of David", "House of Bread", "Place of Peace", "God's Dwelling"], answer: "House of Bread" },
    { id: 'bib15', question: "Which Gospel has the most birth details?", options: ["Matthew", "Mark", "Luke", "John"], answer: "Luke" },
    // SUPPORTING CHARACTERS - Questions 16-22
    { id: 'bib16', question: "Who was John the Baptist's mother?", options: ["Mary", "Elizabeth", "Anna", "Martha"], answer: "Elizabeth" },
    { id: 'bib17', question: "Who was John the Baptist's father?", options: ["Joseph", "Zechariah", "Simeon", "Jacob"], answer: "Zechariah" },
    { id: 'bib18', question: "What happened to Zechariah when told about John?", options: ["He rejoiced", "He couldn't speak", "He ran away", "He fainted"], answer: "He couldn't speak" },
    { id: 'bib19', question: "Who recognized Jesus as Messiah in the Temple?", options: ["Herod", "Simeon", "The priests", "The scribes"], answer: "Simeon" },
    { id: 'bib20', question: "Anna the prophetess was from which tribe?", options: ["Judah", "Benjamin", "Asher", "Levi"], answer: "Asher" },
    { id: 'bib21', question: "How was Elizabeth related to Mary?", options: ["Sister", "Cousin", "Aunt", "Mother-in-law"], answer: "Cousin" },
    { id: 'bib22', question: "How old was Anna when she saw Jesus?", options: ["About 50", "About 65", "About 84", "About 100"], answer: "About 84" },
    // MYTHS VS FACTS - Questions 23-30
    { id: 'bib23', question: "How many Wise Men does the Bible say visited?", options: ["Three", "Two", "Twelve", "It doesn't say"], answer: "It doesn't say" },
    { id: 'bib24', question: "Did the Wise Men visit Jesus in the manger?", options: ["Yes", "No, in a house", "Yes, that night", "The Bible doesn't say"], answer: "No, in a house" },
    { id: 'bib25', question: "What animals does the Bible say were at the birth?", options: ["Donkey and ox", "Sheep and goats", "Camels", "None specified"], answer: "None specified" },
    { id: 'bib26', question: "Did Mary ride a donkey to Bethlehem?", options: ["Yes", "No, she walked", "The Bible doesn't say", "She rode a cart"], answer: "The Bible doesn't say" },
    { id: 'bib27', question: "What did the innkeeper say to Mary and Joseph?", options: ["No room at the inn", "Use my stable", "Come back later", "No innkeeper is mentioned"], answer: "No innkeeper is mentioned" },
    { id: 'bib28', question: "Did the angels 'sing' to the shepherds?", options: ["Yes, they sang", "No, they 'said' or 'praised'", "They played harps", "They were silent"], answer: "No, they 'said' or 'praised'" },
    { id: 'bib29', question: "Were the Wise Men kings?", options: ["Yes, three kings", "No, they were Magi", "Yes, from Persia", "The Bible calls them kings"], answer: "No, they were Magi" },
    { id: 'bib30', question: "How old was Jesus when the Magi arrived?", options: ["Newborn", "Up to 2 years old", "Exactly 12 days", "One month"], answer: "Up to 2 years old" },
    // OLD TESTAMENT PROPHECIES - Questions 31-35
    { id: 'bib31', question: "Isaiah 7:14 says a virgin will bear a son called?", options: ["Jesus", "Emmanuel", "Wonderful", "Messiah"], answer: "Emmanuel" },
    { id: 'bib32', question: "Isaiah 9:6 calls the child 'Wonderful Counselor' and?", options: ["Son of Man", "Mighty God", "Holy One", "Lamb of God"], answer: "Mighty God" },
    { id: 'bib33', question: "Which prophet said 'Out of Egypt I called my son'?", options: ["Isaiah", "Micah", "Hosea", "Jeremiah"], answer: "Hosea" },
    { id: 'bib34', question: "Jeremiah prophesied weeping in Ramah for children. Who fulfilled this?", options: ["Pharaoh", "Herod", "Caesar", "Pilate"], answer: "Herod" },
    { id: 'bib35', question: "What did Isaiah say the Messiah would be called? (Isaiah 9:6)", options: ["Son of David", "Prince of Peace", "King of Kings", "Lord of Lords"], answer: "Prince of Peace" },
    // DEEPER DETAILS - Questions 36-40
    { id: 'bib36', question: "What song did Mary sing when visiting Elizabeth?", options: ["The Benedictus", "The Magnificat", "The Gloria", "The Nunc Dimittis"], answer: "The Magnificat" },
    { id: 'bib37', question: "What song did Zechariah sing when John was born?", options: ["The Magnificat", "The Benedictus", "The Gloria", "Psalm 23"], answer: "The Benedictus" },
    { id: 'bib38', question: "On which day was Jesus circumcised and named?", options: ["1st day", "7th day", "8th day", "40th day"], answer: "8th day" },
    { id: 'bib39', question: "What offering did Mary and Joseph bring to the Temple?", options: ["A lamb", "Two doves/pigeons", "Gold coins", "Grain"], answer: "Two doves/pigeons" },
    { id: 'bib40', question: "The offering of doves indicates Joseph and Mary were?", options: ["Wealthy", "Poor", "Priests", "Romans"], answer: "Poor" },
  ],
  food: [
    { id: 'f1', question: "Where does sushi come from?", options: ["China", "Korea", "Japan", "Thailand"], answer: "Japan" },
    { id: 'f2', question: "Main ingredient in guacamole?", options: ["Tomato", "Avocado", "Pepper", "Onion"], answer: "Avocado" },
    { id: 'f3', question: "What pasta is bow tie shaped?", options: ["Penne", "Fusilli", "Farfalle", "Rigatoni"], answer: "Farfalle" },
    { id: 'f4', question: "Most consumed beverage after water?", options: ["Coffee", "Tea", "Beer", "Soft drinks"], answer: "Tea" },
    { id: 'f5', question: "Where does paella come from?", options: ["Mexico", "Italy", "Spain", "Portugal"], answer: "Spain" },
    { id: 'f6', question: "Traditional pizza cheese?", options: ["Cheddar", "Mozzarella", "Parmesan", "Gouda"], answer: "Mozzarella" },
    { id: 'f7', question: "Main ingredient in hummus?", options: ["Lentils", "Chickpeas", "Black beans", "Fava beans"], answer: "Chickpeas" },
    { id: 'f8', question: "Which is the 'king of fruits'?", options: ["Mango", "Durian", "Jackfruit", "Pineapple"], answer: "Durian" },
    { id: 'f9', question: "What is tofu made from?", options: ["Rice", "Wheat", "Soybeans", "Corn"], answer: "Soybeans" },
    { id: 'f10', question: "What pastry is used for croissants?", options: ["Shortcrust", "Puff pastry", "Filo", "Choux"], answer: "Puff pastry" },
    { id: 'f11', question: "Which country invented pizza?", options: ["USA", "Greece", "Italy", "France"], answer: "Italy" },
    { id: 'f12', question: "What gives bread its holes?", options: ["Baking soda", "Yeast", "Salt", "Sugar"], answer: "Yeast" },
    { id: 'f13', question: "What nut makes marzipan?", options: ["Walnut", "Cashew", "Almond", "Pistachio"], answer: "Almond" },
    { id: 'f14', question: "Hottest chili pepper (2024)?", options: ["Ghost Pepper", "Carolina Reaper", "Pepper X", "Trinidad Scorpion"], answer: "Pepper X" },
    { id: 'f15', question: "Where is Gouda cheese from?", options: ["France", "Switzerland", "Netherlands", "Germany"], answer: "Netherlands" },
    { id: 'f16', question: "Main ingredient in traditional Christmas pudding?", options: ["Chocolate", "Dried fruits", "Cream", "Nuts"], answer: "Dried fruits" },
    { id: 'f17', question: "Panettone is a Christmas bread from which country?", options: ["France", "Italy", "Spain", "Germany"], answer: "Italy" },
    { id: 'f18', question: "What nut is most associated with Christmas?", options: ["Peanut", "Walnut", "Chestnut", "Almond"], answer: "Chestnut" },
    { id: 'f19', question: "Mulled wine is served at what temperature?", options: ["Cold", "Room temperature", "Warm/Hot", "Frozen"], answer: "Warm/Hot" },
    { id: 'f20', question: "What herb is traditionally used in Christmas stuffing?", options: ["Basil", "Sage", "Oregano", "Thyme"], answer: "Sage" },
  ],
  geography: [
    { id: 'g1', question: "Largest country by area?", options: ["China", "USA", "Canada", "Russia"], answer: "Russia" },
    { id: 'g2', question: "Smallest country in the world?", options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"], answer: "Vatican City" },
    { id: 'g3', question: "Longest river?", options: ["Amazon", "Nile", "Yangtze", "Mississippi"], answer: "Nile" },
    { id: 'g4', question: "Capital of Australia?", options: ["Sydney", "Melbourne", "Canberra", "Perth"], answer: "Canberra" },
    { id: 'g5', question: "Country with most people?", options: ["USA", "India", "China", "Indonesia"], answer: "India" },
    { id: 'g6', question: "Highest mountain?", options: ["K2", "Kangchenjunga", "Everest", "Lhotse"], answer: "Everest" },
    { id: 'g7', question: "Largest ocean?", options: ["Atlantic", "Indian", "Pacific", "Arctic"], answer: "Pacific" },
    { id: 'g8', question: "Capital of Canada?", options: ["Toronto", "Vancouver", "Montreal", "Ottawa"], answer: "Ottawa" },
    { id: 'g9', question: "Largest hot desert?", options: ["Gobi", "Sahara", "Arabian", "Kalahari"], answer: "Sahara" },
    { id: 'g10', question: "Capital of Japan?", options: ["Osaka", "Kyoto", "Tokyo", "Yokohama"], answer: "Tokyo" },
    { id: 'g11', question: "Country with most islands?", options: ["Indonesia", "Philippines", "Sweden", "Finland"], answer: "Sweden" },
    { id: 'g12', question: "Longest European river?", options: ["Danube", "Rhine", "Volga", "Seine"], answer: "Volga" },
    { id: 'g13', question: "Which African country was never colonized?", options: ["Nigeria", "Kenya", "Ethiopia", "Ghana"], answer: "Ethiopia" },
    { id: 'g14', question: "Strait between Europe and Africa?", options: ["Bosphorus", "Gibraltar", "Hormuz", "Malacca"], answer: "Gibraltar" },
    { id: 'g15', question: "Capital of Brazil?", options: ["Rio", "São Paulo", "Brasília", "Salvador"], answer: "Brasília" },
    { id: 'g16', question: "What country has the most time zones?", options: ["USA", "Russia", "France", "China"], answer: "France" },
    { id: 'g17', question: "Which is the only continent without a desert?", options: ["Europe", "Antarctica", "Both", "Neither"], answer: "Europe" },
    { id: 'g18', question: "What is the deepest ocean trench?", options: ["Mariana Trench", "Puerto Rico Trench", "Java Trench", "Philippine Trench"], answer: "Mariana Trench" },
    { id: 'g19', question: "Which river flows through the most countries?", options: ["Nile", "Amazon", "Danube", "Mekong"], answer: "Danube" },
    { id: 'g20', question: "What is the largest island in the world?", options: ["Madagascar", "Greenland", "New Guinea", "Borneo"], answer: "Greenland" },
  ],
  anagram: [
    { id: 'ana1', scrambled: "TANSA SLAUC", answer: "SANTA CLAUS", hint: "The big man himself" },
    { id: 'ana2', scrambled: "NEDIREER", answer: "REINDEER", hint: "Pulls the sleigh" },
    { id: 'ana3', scrambled: "WONS KEFLSA", answer: "SNOWFLAKES", hint: "Fall from winter sky" },
    { id: 'ana4', scrambled: "LORAC", answer: "CAROL", hint: "Christmas song" },
    { id: 'ana5', scrambled: "HOTCNGSKI", answer: "STOCKING", hint: "Hung by fireplace" },
    { id: 'ana6', scrambled: "LEGNA", answer: "ANGEL", hint: "Top of tree" },
    { id: 'ana7', scrambled: "ROTFSY", answer: "FROSTY", hint: "The Snowman" },
    { id: 'ana8', scrambled: "PRETNSES", answer: "PRESENTS", hint: "Under the tree" },
    { id: 'ana9', scrambled: "GLIHES", answer: "SLEIGH", hint: "Santa's transport" },
    { id: 'ana10', scrambled: "CNAELD", answer: "CANDLE", hint: "Gives light and warmth" },
    { id: 'ana11', scrambled: "HTAREW", answer: "WREATH", hint: "Hung on doors" },
    { id: 'ana12', scrambled: "BRIBNO", answer: "RIBBON", hint: "Decorates gifts" },
    { id: 'ana13', scrambled: "LOLYH", answer: "HOLLY", hint: "Red berries, green leaves" },
    { id: 'ana14', scrambled: "CHMEYNI", answer: "CHIMNEY", hint: "Santa's entrance" },
    { id: 'ana15', scrambled: "SLITEMEN", answer: "MISTLETOE", hint: "Kiss underneath" },
    { id: 'ana16', scrambled: "REWINT", answer: "WINTER", hint: "Cold season" },
    { id: 'ana17', scrambled: "CEJOIRE", answer: "REJOICE", hint: "Be joyful" },
    { id: 'ana18', scrambled: "TYITVINA", answer: "NATIVITY", hint: "Birth scene" },
    { id: 'ana19', scrambled: "LEBSL", answer: "BELLS", hint: "Ring at Christmas" },
    { id: 'ana20', scrambled: "RAWSP", answer: "WRAPS", hint: "Cover gifts" },
  ],
  riddles: [
    { id: 'rid1', question: "I'm tall when young, short when old. I stand in corners at Christmas. What am I?", answer: "A candle", options: ["A candle", "Christmas tree", "An elf", "Snowman"] },
    { id: 'rid2', question: "What has hands but can't clap?", answer: "A clock", options: ["A clock", "A snowman", "A toy", "A glove"] },
    { id: 'rid3', question: "I fall but never get hurt. What am I?", answer: "Snow", options: ["Rain", "Snow", "A leaf", "Night"] },
    { id: 'rid4', question: "What can you catch but not throw?", answer: "A cold", options: ["A ball", "A cold", "A fish", "A bus"] },
    { id: 'rid5', question: "What gets wetter the more it dries?", answer: "A towel", options: ["Ice", "A towel", "A sponge", "Snow"] },
    { id: 'rid6', question: "What has four fingers and a thumb but isn't alive?", answer: "A glove", options: ["A hand", "A mitten", "A glove", "A robot"] },
    { id: 'rid7', question: "What has keys but no locks?", answer: "A piano", options: ["A map", "A keyboard", "A piano", "A car"] },
    { id: 'rid8', question: "What goes up but never comes down?", answer: "Your age", options: ["A balloon", "Your age", "Smoke", "A plane"] },
    { id: 'rid9', question: "What has a head and tail but no body?", answer: "A coin", options: ["A snake", "A coin", "A comet", "A fish"] },
    { id: 'rid10', question: "What comes once in a minute, twice in a moment, never in a thousand years?", answer: "The letter M", options: ["Time", "The letter M", "A second", "A breath"] },
    { id: 'rid11', question: "What travels around the world but stays in a corner?", answer: "A stamp", options: ["A stamp", "A globe", "The internet", "A passport"] },
    { id: 'rid12', question: "What has many teeth but cannot bite?", answer: "A comb", options: ["A saw", "A comb", "A zipper", "A gear"] },
    { id: 'rid13', question: "What building has the most stories?", answer: "A library", options: ["Skyscraper", "A library", "A hotel", "A museum"] },
    { id: 'rid14', question: "What can you hold without touching?", answer: "Your breath", options: ["A thought", "Your breath", "Conversation", "A promise"] },
    { id: 'rid15', question: "What runs but never walks?", answer: "Water", options: ["Time", "Water", "A nose", "A refrigerator"] },
    { id: 'rid16', question: "I have needles but I don't sew. What am I?", answer: "Christmas tree", options: ["Pine cone", "Christmas tree", "Hedgehog", "Cactus"] },
    { id: 'rid17', question: "I'm red and white and go down chimneys. What am I?", answer: "Santa Claus", options: ["Candy cane", "Santa Claus", "Stocking", "Fireplace"] },
    { id: 'rid18', question: "I have wings but I'm not a bird. I sit on top of trees. What am I?", answer: "An angel", options: ["A fairy", "An angel", "A star", "A butterfly"] },
    { id: 'rid19', question: "I'm wrapped but I'm not a mummy. What am I?", answer: "A present", options: ["A gift", "A present", "A burrito", "A bandage"] },
    { id: 'rid20', question: "I crackle and pop and keep you warm. What am I?", answer: "A fire", options: ["Popcorn", "A fire", "A radiator", "Hot chocolate"] },
  ],
  pictures: [
    { id: 'pic1', question: "What goes on top of the tree?", options: ["Bell", "Star", "Bow", "Candy"], answer: "Star", image: "https://images.unsplash.com/photo-1512389142860-9c449e58a814?w=400&h=300&fit=crop", fallback: "🎄⭐" },
    { id: 'pic2', question: "What is this Christmas character?", options: ["Frosty", "Santa", "Rudolph", "Elf"], answer: "Rudolph", image: "https://images.unsplash.com/photo-1516476892398-bdcab4c8dab8?w=400&h=300&fit=crop", fallback: "🦌" },
    { id: 'pic3', question: "What is this festive creation?", options: ["Bakery", "Gingerbread house", "Candy store", "Cookie jar"], answer: "Gingerbread house", image: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400&h=300&fit=crop", fallback: "🏠🍬" },
    { id: 'pic4', question: "What winter figure is this?", options: ["Ice sculpture", "Snowman", "Penguin", "Polar bear"], answer: "Snowman", image: "https://images.unsplash.com/photo-1610973499406-69fdb3b3dedc?w=400&h=300&fit=crop", fallback: "⛄" },
    { id: 'pic5', question: "What is this Christmas scene?", options: ["Zoo visit", "Santa's sleigh", "Farm", "Parade"], answer: "Santa's sleigh", image: "https://images.unsplash.com/photo-1545622783-b3e021430fee?w=400&h=300&fit=crop", fallback: "🛷🎅" },
    { id: 'pic6', question: "What is this decoration?", options: ["Bird", "Angel", "Fairy", "Star"], answer: "Angel", image: "https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=400&h=300&fit=crop", fallback: "👼" },
    { id: 'pic7', question: "What are these under the tree?", options: ["Boxes", "Presents", "Decorations", "Toys"], answer: "Presents", image: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=400&h=300&fit=crop", fallback: "🎁" },
    { id: 'pic8', question: "What makes this Christmas sound?", options: ["Drum", "Bell", "Whistle", "Horn"], answer: "Bell", image: "https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=400&h=300&fit=crop", fallback: "🔔" },
    { id: 'pic9', question: "What weather is shown here?", options: ["Rain", "Snow", "Hail", "Fog"], answer: "Snow", image: "https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=400&h=300&fit=crop", fallback: "❄️" },
    { id: 'pic10', question: "Where are these hung?", options: ["Door", "Window", "Fireplace", "Tree"], answer: "Fireplace", image: "https://images.unsplash.com/photo-1543934638-bd2e138430c4?w=400&h=300&fit=crop", fallback: "🧦" },
    { id: 'pic11', question: "What are these candles for?", options: ["Birthday", "Advent", "Halloween", "Dinner"], answer: "Advent", image: "https://images.unsplash.com/photo-1545622783-b3e021430fee?w=400&h=300&fit=crop", fallback: "🕯️" },
    { id: 'pic12', question: "What Bible scene is this?", options: ["Last Supper", "Nativity", "Baptism", "Sermon"], answer: "Nativity", image: "https://images.unsplash.com/photo-1545042679-7bb40793ba84?w=400&h=300&fit=crop", fallback: "👶⭐" },
    { id: 'pic13', question: "Who are these treats left for?", options: ["Elves", "Reindeer", "Santa", "Children"], answer: "Santa", image: "https://images.unsplash.com/photo-1481391243133-f96216dcb5d2?w=400&h=300&fit=crop", fallback: "🍪🥛" },
    { id: 'pic14', question: "What is this red Christmas flower?", options: ["Rose", "Poinsettia", "Tulip", "Carnation"], answer: "Poinsettia", image: "https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=400&h=300&fit=crop", fallback: "🌺" },
    { id: 'pic15', question: "What are these on the tree?", options: ["Lights", "Ornaments", "Candy", "Stars"], answer: "Ornaments", image: "https://images.unsplash.com/photo-1514803530614-3d9a818cab10?w=400&h=300&fit=crop", fallback: "🔴🟡" },
    { id: 'pic16', question: "What type of tree is this?", options: ["Oak", "Christmas tree", "Palm", "Maple"], answer: "Christmas tree", image: "https://images.unsplash.com/photo-1545622783-b3e021430fee?w=400&h=300&fit=crop", fallback: "🎄" },
    { id: 'pic17', question: "What do people do under this plant?", options: ["Pray", "Kiss", "Dance", "Eat"], answer: "Kiss", image: "https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?w=400&h=300&fit=crop", fallback: "🌿💋" },
    { id: 'pic18', question: "What is this winter activity?", options: ["Skiing", "Ice skating", "Sledding", "Snowboarding"], answer: "Ice skating", image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop", fallback: "⛸️" },
    { id: 'pic19', question: "What is this Christmas decoration?", options: ["Garland", "Wreath", "Ribbon", "Tinsel"], answer: "Wreath", image: "https://images.unsplash.com/photo-1512474932049-9de05fd1a953?w=400&h=300&fit=crop", fallback: "🎄🔴" },
    { id: 'pic20', question: "What festive drink is this?", options: ["Coffee", "Hot chocolate", "Tea", "Eggnog"], answer: "Hot chocolate", image: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400&h=300&fit=crop", fallback: "☕🎄" },
  ],
};

const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const Snowflakes = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    {Array.from({ length: 15 }, (_, i) => (
      <div key={i} className="absolute text-white/20" style={{ left: `${Math.random()*100}%`, animation: `fall ${5+Math.random()*10}s linear infinite`, animationDelay: `${Math.random()*5}s`, fontSize: `${10+Math.random()*15}px` }}>❄</div>
    ))}
    <style>{`@keyframes fall { 0% { transform: translateY(-10vh); } 100% { transform: translateY(110vh); } }`}</style>
  </div>
);

const FAMILY_ACCESS_CODE = "JACK2025";

export default function App() {
  const [connected, setConnected] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [accessError, setAccessError] = useState('');
  const [screen, setScreen] = useState('home');
  const [isHost, setIsHost] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [usePassword, setUsePassword] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [players, setPlayers] = useState({});
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [localTimer, setLocalTimer] = useState(30);
  const [copied, setCopied] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const lastTickRef = useRef(null);
  const timerExpiredRef = useRef(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [questionsPerCategory, setQuestionsPerCategory] = useState(5);
  const [showTournamentSetup, setShowTournamentSetup] = useState(false);

  useEffect(() => {
    const savedAccess = localStorage.getItem('familyAccess');
    if (savedAccess === FAMILY_ACCESS_CODE) setHasAccess(true);
    let id = localStorage.getItem('playerId');
    if (!id) { id = 'p_' + Math.random().toString(36).substr(2, 9); localStorage.setItem('playerId', id); }
    setPlayerId(id);
    const savedName = localStorage.getItem('playerName');
    if (savedName) setPlayerName(savedName);
    document.addEventListener('click', () => soundManager.init(), { once: true });
    cleanupExpiredRooms();
  }, []);

  const cleanupExpiredRooms = async () => {
    const expireTime = Date.now() - ROOM_EXPIRY_MS;
    const snapshot = await get(ref(db, 'rooms'));
    if (snapshot.exists()) {
      Object.entries(snapshot.val()).forEach(([code, room]) => {
        if (room.createdAt < expireTime) remove(ref(db, `rooms/${code}`));
      });
    }
  };

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
      if (data) { setGameState(data.game || null); setPlayers(data.players || {}); }
      else if (!isHost) { alert('Game ended'); leaveGame(); }
    });
    return () => off(roomRef);
  }, [roomCode, isHost]);

  useEffect(() => {
    if (!gameState?.timerEnd) return;
    timerExpiredRef.current = false;
    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((gameState.timerEnd - Date.now()) / 1000));
      setLocalTimer(remaining);
      if (remaining <= 5 && remaining > 0 && remaining !== lastTickRef.current) { soundManager.playTick(); lastTickRef.current = remaining; }
      if (remaining === 0 && !timerExpiredRef.current) { timerExpiredRef.current = true; soundManager.playTimeUp(); if (isHost && gameState.phase !== 'reveal') handleTimeUp(); }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 100);
    return () => clearInterval(interval);
  }, [gameState?.timerEnd, gameState?.phase, isHost]);

  useEffect(() => {
    if (gameState?.questionIndex !== undefined) { setSelectedAnswer(null); setTypedAnswer(''); setHasAnswered(false); lastTickRef.current = null; timerExpiredRef.current = false; }
  }, [gameState?.questionIndex]);

  useEffect(() => {
    if (gameState?.buzzedPlayer && gameState?.phase === 'answering') soundManager.playBuzzer();
  }, [gameState?.buzzedPlayer, gameState?.phase]);

  const handleTimeUp = async () => { if (isHost) await update(ref(db, `rooms/${roomCode}/game`), { phase: 'reveal' }); };

  const createGame = async () => {
    if (!playerName.trim()) return alert('Enter your name');
    if (usePassword && roomPassword.length < 4) return alert('Password must be at least 4 characters');
    soundManager.playClick();
    const code = generateRoomCode();
    await set(ref(db, `rooms/${code}`), {
      host: playerId, hostName: playerName.trim(), createdAt: Date.now(), password: usePassword ? roomPassword : null,
      game: { status: 'lobby' }, players: { [playerId]: { name: playerName.trim(), score: 0, isHost: true, joinedAt: Date.now(), categoryScores: {} } }
    });
    localStorage.setItem('playerName', playerName.trim());
    setRoomCode(code); setIsHost(true); setScreen('lobby');
  };

  const joinGame = async () => {
    if (!playerName.trim()) return alert('Enter your name');
    if (!joinCode.trim() || joinCode.length !== 4) return alert('Enter 4-letter room code');
    soundManager.playClick();
    const code = joinCode.toUpperCase();
    const checkRoom = await new Promise(resolve => { onValue(ref(db, `rooms/${code}`), (snap) => resolve(snap.val()), { onlyOnce: true }); });
    if (!checkRoom) return alert('Room not found');
    if (checkRoom.password && checkRoom.password !== joinPassword) return alert('Incorrect password');
    await set(ref(db, `rooms/${code}/players/${playerId}`), { name: playerName.trim(), score: 0, isHost: false, joinedAt: Date.now(), categoryScores: {} });
    localStorage.setItem('playerName', playerName.trim());
    setRoomCode(code); setIsHost(false); setScreen('lobby');
  };

  const leaveGame = async () => {
    if (roomCode && playerId) { if (isHost) await remove(ref(db, `rooms/${roomCode}`)); else await remove(ref(db, `rooms/${roomCode}/players/${playerId}`)); }
    setRoomCode(''); setGameState(null); setPlayers({}); setIsHost(false); setScreen('home'); setSelectedCategories([]); setShowTournamentSetup(false);
  };

  const startRound = async (category) => {
    soundManager.playClick();
    const meta = categoryMeta[category];
    let qs = meta.type === 'anagram' ? [...allQuestions.anagram] : meta.type === 'riddle' ? [...allQuestions.riddles] : meta.type === 'picture' ? [...allQuestions.pictures] : [...allQuestions[category]];
    qs = qs.sort(() => Math.random() - 0.5).slice(0, questionsPerCategory);
    await update(ref(db, `rooms/${roomCode}/game`), {
      status: 'playing', category, roundType: meta.type || 'standard', questions: qs, questionIndex: 0, currentQuestion: qs[0],
      phase: 'buzzer', buzzedPlayer: null, timerEnd: Date.now() + 30000, answers: {}, tournament: null
    });
  };

  const startTournament = async () => {
    if (selectedCategories.length === 0) return alert('Select at least one category');
    soundManager.playClick();
    const tournamentData = selectedCategories.map(cat => {
      const meta = categoryMeta[cat];
      let qs = meta.type === 'anagram' ? [...allQuestions.anagram] : meta.type === 'riddle' ? [...allQuestions.riddles] : meta.type === 'picture' ? [...allQuestions.pictures] : [...allQuestions[cat]];
      return { category: cat, questions: qs.sort(() => Math.random() - 0.5).slice(0, questionsPerCategory) };
    });
    const firstCat = tournamentData[0];
    const meta = categoryMeta[firstCat.category];
    await update(ref(db, `rooms/${roomCode}/game`), {
      status: 'playing', category: firstCat.category, roundType: meta.type || 'standard', questions: firstCat.questions, questionIndex: 0, currentQuestion: firstCat.questions[0],
      phase: 'buzzer', buzzedPlayer: null, timerEnd: Date.now() + 30000, answers: {},
      tournament: { categories: selectedCategories, categoryData: tournamentData, currentCategoryIndex: 0, totalCategories: selectedCategories.length, questionsPerCategory }
    });
    setShowTournamentSetup(false);
  };

  const toggleCategory = (cat) => setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);

  const buzzIn = async () => {
    if (gameState?.phase !== 'buzzer' || gameState?.buzzedPlayer || localTimer === 0) return;
    await update(ref(db, `rooms/${roomCode}/game`), { buzzedPlayer: playerId, phase: 'answering', timerEnd: Date.now() + 15000 });
  };

  const submitAnswer = async (answer) => {
    if (hasAnswered || localTimer === 0) return;
    soundManager.playClick(); setSelectedAnswer(answer); setHasAnswered(true);
    const q = gameState.currentQuestion;
    const correct = gameState.roundType === 'anagram' ? answer.toUpperCase().replace(/\s/g, '') === q.answer.toUpperCase().replace(/\s/g, '') : answer === q.answer;
    const points = correct ? 100 + Math.max(0, localTimer * 3) : 0;
    if (correct) soundManager.playCorrect(); else soundManager.playWrong();
    await update(ref(db, `rooms/${roomCode}/game/answers/${playerId}`), { answer, correct, points, time: Date.now() });
    if (correct) {
      const cat = gameState.category;
      await update(ref(db, `rooms/${roomCode}/players/${playerId}`), { score: (players[playerId]?.score || 0) + points, [`categoryScores/${cat}`]: (players[playerId]?.categoryScores?.[cat] || 0) + points });
    }
    setTimeout(() => update(ref(db, `rooms/${roomCode}/game`), { phase: 'reveal' }), 500);
  };

  const nextQuestion = async () => {
    soundManager.playClick();
    const nextIdx = gameState.questionIndex + 1;
    const t = gameState.tournament;
    if (nextIdx >= gameState.questions.length) {
      if (t && t.currentCategoryIndex < t.totalCategories - 1) {
        const nextCatIdx = t.currentCategoryIndex + 1;
        const nextCat = t.categoryData[nextCatIdx];
        const meta = categoryMeta[nextCat.category];
        await update(ref(db, `rooms/${roomCode}/game`), { category: nextCat.category, roundType: meta.type || 'standard', questions: nextCat.questions, questionIndex: 0, currentQuestion: nextCat.questions[0], phase: 'buzzer', buzzedPlayer: null, timerEnd: Date.now() + 30000, answers: {}, 'tournament/currentCategoryIndex': nextCatIdx });
      } else { soundManager.playVictory(); await update(ref(db, `rooms/${roomCode}/game`), { status: t ? 'tournamentEnd' : 'roundEnd', phase: null }); }
    } else {
      await update(ref(db, `rooms/${roomCode}/game`), { questionIndex: nextIdx, currentQuestion: gameState.questions[nextIdx], phase: 'buzzer', buzzedPlayer: null, timerEnd: Date.now() + 30000, answers: {} });
    }
  };

  const backToLobby = async () => {
    soundManager.playClick();
    const resetPlayers = {}; Object.keys(players).forEach(id => { resetPlayers[`players/${id}/score`] = 0; resetPlayers[`players/${id}/categoryScores`] = {}; });
    await update(ref(db, `rooms/${roomCode}`), resetPlayers);
    await update(ref(db, `rooms/${roomCode}/game`), { status: 'lobby', category: null, questions: null, currentQuestion: null, phase: null, tournament: null });
    setSelectedCategories([]);
  };

  const copyCode = () => { navigator.clipboard.writeText(roomCode); setCopied(true); soundManager.playClick(); setTimeout(() => setCopied(false), 2000); };
  const toggleSound = () => setSoundEnabled(soundManager.toggle());
  const sortedPlayers = Object.entries(players).map(([id, p]) => ({ id, ...p })).sort((a, b) => (b.score || 0) - (a.score || 0));

  const verifyAccess = () => {
    if (accessCode.toUpperCase().trim() === FAMILY_ACCESS_CODE) { localStorage.setItem('familyAccess', FAMILY_ACCESS_CODE); setHasAccess(true); setAccessError(''); soundManager.init(); soundManager.playCorrect(); }
    else { setAccessError('Incorrect code'); soundManager.init(); soundManager.playWrong(); }
  };

  // Calculate total questions
  const totalQuestions = Object.values(allQuestions).reduce((sum, cat) => sum + cat.length, 0);

  const renderGate = () => (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-red-900 to-green-900 p-4 relative flex items-center justify-center">
      <Snowflakes />
      <div className="max-w-sm mx-auto relative z-10 text-center">
        <div className="text-6xl mb-4">🎄🔒</div>
        <h1 className="text-3xl font-bold text-white mb-2">Family Christmas Quiz</h1>
        <p className="text-white/60 mb-6">Enter your family access code</p>
        <div className="bg-white/10 backdrop-blur rounded-xl p-6">
          <input type="text" value={accessCode} onChange={(e) => setAccessCode(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === 'Enter' && verifyAccess()} placeholder="ACCESS CODE" className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/40 text-2xl text-center font-mono tracking-widest uppercase border border-white/20 mb-3" maxLength={20} autoFocus />
          {accessError && <p className="text-red-400 text-sm mb-3">{accessError}</p>}
          <button onClick={verifyAccess} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl">Enter Quiz</button>
        </div>
      </div>
    </div>
  );

  const renderHome = () => (
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-red-800 to-green-900 p-4 relative">
      <Snowflakes />
      <div className="max-w-md mx-auto relative z-10 pt-6">
        <button onClick={toggleSound} className="absolute top-2 right-2 text-white/60 hover:text-white p-2">{soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}</button>
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🎄</div>
          <h1 className="text-3xl font-bold text-white mb-1">Christmas Quiz</h1>
          <p className="text-green-200 text-sm">Tournament Edition</p>
          <div className={`flex items-center justify-center gap-2 mt-2 ${connected ? 'text-green-400' : 'text-red-400'}`}>{connected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}<span className="text-xs">{connected ? 'Connected' : 'Connecting...'}</span></div>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-xl p-3 mb-4">
          <label className="text-white/70 text-xs uppercase mb-1 block">Your Name</label>
          <input type="text" value={playerName} onChange={(e) => setPlayerName(e.target.value)} placeholder="Enter your name" className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/50 text-lg text-center font-medium" maxLength={15} />
        </div>
        <div className="bg-green-800/50 backdrop-blur rounded-xl p-4 mb-3 border border-green-600/30">
          <div className="flex items-center gap-2 mb-3"><Crown className="w-5 h-5 text-yellow-400" /><h2 className="text-white font-bold">HOST A GAME</h2></div>
          <div className="bg-white/10 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <input type="checkbox" id="usePass" checked={usePassword} onChange={(e) => setUsePassword(e.target.checked)} className="w-4 h-4 accent-green-500" />
              <label htmlFor="usePass" className="text-white text-sm flex items-center gap-1"><Lock className="w-4 h-4" /> Require password</label>
            </div>
            {usePassword && <input type="text" value={roomPassword} onChange={(e) => setRoomPassword(e.target.value)} placeholder="Create password" className="w-full px-3 py-2 rounded-lg bg-white/20 text-white placeholder-white/50 text-sm mt-2 border border-white/20" maxLength={20} />}
          </div>
          <button onClick={createGame} disabled={!connected || (usePassword && roomPassword.length < 4)} className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 active:scale-95"><Crown className="w-5 h-5" />Create Game</button>
        </div>
        <div className="relative my-4"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/20"></div></div><div className="relative flex justify-center"><span className="bg-red-800 px-4 text-white/60 text-sm">or</span></div></div>
        <div className="bg-blue-800/50 backdrop-blur rounded-xl p-4 border border-blue-600/30">
          <div className="flex items-center gap-2 mb-3"><Users className="w-5 h-5 text-blue-300" /><h2 className="text-white font-bold">JOIN A GAME</h2></div>
          <div className="space-y-2">
            <input type="text" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 4))} placeholder="ROOM CODE" className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/40 text-xl text-center font-mono tracking-widest uppercase border border-white/20" maxLength={4} />
            <input type="text" value={joinPassword} onChange={(e) => setJoinPassword(e.target.value)} placeholder="Password (if required)" className="w-full px-3 py-2 rounded-lg bg-white/20 text-white placeholder-white/40 text-sm border border-white/20" />
          </div>
          <button onClick={joinGame} disabled={!connected || joinCode.length !== 4} className="w-full mt-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white font-bold py-3 rounded-xl">Join Game</button>
        </div>
        <p className="text-center text-white/40 text-xs mt-4">{totalQuestions} questions • {Object.keys(categoryMeta).length} categories</p>
      </div>
    </div>
  );

  const renderLobby = () => (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-800 p-4">
      <Snowflakes />
      <div className="max-w-md mx-auto relative z-10">
        <div className="flex justify-between items-center mb-4">
          <button onClick={leaveGame} className="text-white/70 flex items-center gap-1 text-sm"><LogOut className="w-4 h-4" />Leave</button>
          <div className="flex items-center gap-2"><button onClick={toggleSound} className="text-white/60">{soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}</button>{connected ? <Wifi className="w-4 h-4 text-green-400" /> : <WifiOff className="w-4 h-4 text-red-400" />}</div>
        </div>
        <div className="text-center mb-4">
          <p className="text-green-200 text-sm">Room Code</p>
          <div className="flex items-center justify-center gap-2"><span className="text-4xl font-mono font-bold text-white tracking-widest">{roomCode}</span><button onClick={copyCode} className="text-white/70 hover:text-white"><Copy className="w-5 h-5" /></button></div>
          {copied && <p className="text-green-400 text-xs">Copied!</p>}
        </div>
        <div className="bg-white/10 rounded-xl p-3 mb-4">
          <h3 className="text-white font-bold mb-2 flex items-center gap-2 text-sm"><Users className="w-4 h-4" /> Players ({Object.keys(players).length})</h3>
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {sortedPlayers.map((p) => (
              <div key={p.id} className="flex items-center justify-between bg-white/10 rounded px-2 py-1 text-sm">
                <span className="text-white flex items-center gap-1">{p.isHost && <Crown className="w-3 h-3 text-yellow-400" />}{p.name}{p.id === playerId && <span className="text-white/40 text-xs">(you)</span>}</span>
                <span className="text-green-300 font-bold">{p.score || 0}</span>
              </div>
            ))}
          </div>
        </div>
        {isHost ? (
          showTournamentSetup ? (
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3"><h3 className="text-white font-bold flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-400" />Tournament</h3><button onClick={() => setShowTournamentSetup(false)} className="text-white/60 text-sm">Cancel</button></div>
              <div className="mb-3">
                <label className="text-white/70 text-xs uppercase mb-1 block">Questions per category</label>
                <div className="flex gap-2">{[5, 10, 15, 20].map(n => (<button key={n} onClick={() => setQuestionsPerCategory(n)} className={`flex-1 py-2 rounded-lg font-bold ${questionsPerCategory === n ? 'bg-yellow-500 text-black' : 'bg-white/20 text-white'}`}>{n}</button>))}</div>
              </div>
              <div className="mb-3">
                <label className="text-white/70 text-xs uppercase mb-1 block">Select categories ({selectedCategories.length})</label>
                <div className="grid grid-cols-3 gap-1 max-h-40 overflow-y-auto">
                  {Object.entries(categoryMeta).map(([key, meta]) => (<button key={key} onClick={() => toggleCategory(key)} className={`py-1 px-2 rounded text-xs font-medium flex items-center gap-1 ${selectedCategories.includes(key) ? 'bg-green-500 text-white' : 'bg-white/20 text-white/70'}`}><span>{meta.icon}</span><span className="truncate">{meta.name.split(' ')[0]}</span></button>))}
                </div>
              </div>
              <button onClick={startTournament} disabled={selectedCategories.length === 0} className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-600 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2"><Play className="w-5 h-5" />Start ({selectedCategories.length * questionsPerCategory} Qs)</button>
            </div>
          ) : (
            <div>
              <button onClick={() => setShowTournamentSetup(true)} className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 mb-3"><Trophy className="w-4 h-4" />Tournament Mode</button>
              <p className="text-white text-center mb-2 text-sm">Or single category:</p>
              <div className="flex gap-2 mb-2 items-center justify-center"><span className="text-white/70 text-xs">Qs:</span>{[5, 10, 15, 20].map(n => (<button key={n} onClick={() => setQuestionsPerCategory(n)} className={`px-2 py-1 rounded text-xs font-bold ${questionsPerCategory === n ? 'bg-green-500 text-white' : 'bg-white/20 text-white'}`}>{n}</button>))}</div>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {Object.entries(categoryMeta).map(([key, meta]) => (<button key={key} onClick={() => startRound(key)} className={`bg-gradient-to-r ${meta.color} text-white font-bold py-2 px-2 rounded-lg flex items-center gap-1 active:scale-95 text-xs`}><span className="text-lg">{meta.icon}</span><span className="truncate">{meta.name}</span></button>))}
              </div>
            </div>
          )
        ) : (<div className="text-center"><div className="text-5xl mb-2">⏳</div><p className="text-white">Waiting for host...</p></div>)}
      </div>
    </div>
  );

  const renderPlaying = () => {
    const meta = categoryMeta[gameState?.category] || {};
    const q = gameState?.currentQuestion;
    const phase = gameState?.phase;
    const buzzed = gameState?.buzzedPlayer;
    const isBuzzed = buzzed === playerId;
    const timeUp = localTimer === 0;
    const roundType = gameState?.roundType || 'standard';
    const t = gameState?.tournament;

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4">
        <div className="max-w-lg mx-auto">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-1"><span className="text-xl">{meta.icon}</span><span className="text-white text-sm truncate max-w-20">{meta.name}</span></div>
            <div className="flex items-center gap-2">
              <button onClick={toggleSound} className="text-white/60">{soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}</button>
              {t && <span className="text-yellow-400 text-xs">Cat {t.currentCategoryIndex + 1}/{t.totalCategories}</span>}
              <span className="text-white/60 text-sm">Q{(gameState?.questionIndex || 0) + 1}/{gameState?.questions?.length}</span>
              <div className={`px-2 py-1 rounded-full text-white flex items-center gap-1 text-sm ${localTimer <= 5 ? 'bg-red-500 animate-pulse' : 'bg-white/20'}`}><Clock className="w-3 h-3" />{localTimer}s</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 mb-3 shadow-lg">
            {roundType === 'anagram' ? (
              <>
                <div className="flex items-center gap-2 mb-2"><Shuffle className="w-5 h-5 text-blue-500" /><span className="text-sm text-gray-500">Unscramble:</span></div>
                <h3 className="text-2xl font-bold text-gray-800 text-center tracking-widest">{q?.scrambled}</h3>
                {q?.hint && <p className="text-center text-gray-500 text-sm mt-2">{q.hint}</p>}
              </>
            ) : roundType === 'picture' ? (
              <>
                <div className="flex items-center gap-2 mb-2"><Image className="w-5 h-5 text-teal-500" /><span className="text-sm text-gray-500">Picture Round:</span></div>
                {q?.image ? (
                  <div className="relative w-full h-48 mb-3 rounded-lg overflow-hidden bg-gray-100">
                    <img 
                      src={q.image} 
                      alt="Quiz image" 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                    <div className="absolute inset-0 items-center justify-center text-6xl bg-gray-100" style={{display: 'none'}}>{q?.fallback || '🖼️'}</div>
                  </div>
                ) : (
                  <div className="text-6xl text-center my-4">{q?.fallback || '🖼️'}</div>
                )}
                <h3 className="text-lg font-bold text-gray-800 text-center">{q?.question}</h3>
              </>
            ) : (
              <h3 className="text-lg font-bold text-gray-800">{q?.question}</h3>
            )}
          </div>
          {phase === 'buzzer' && !buzzed && (<button onClick={buzzIn} disabled={timeUp} className={`w-full text-white font-bold py-6 rounded-2xl text-xl shadow-lg mb-3 ${timeUp ? 'bg-gray-500' : 'bg-red-500 hover:bg-red-400 active:scale-95 animate-pulse'}`}>{timeUp ? "⏱️ TIME'S UP!" : "🔔 BUZZ!"}</button>)}
          {phase === 'answering' && buzzed && (
            <div className="mb-3">
              <p className="text-center text-yellow-400 mb-2 font-bold">🔔 {players[buzzed]?.name} buzzed!</p>
              {isBuzzed ? (roundType === 'anagram' ? (
                <div>
                  <input type="text" value={typedAnswer} onChange={(e) => setTypedAnswer(e.target.value.toUpperCase())} placeholder="Type answer..." className="w-full px-4 py-3 rounded-xl text-lg text-center font-bold uppercase tracking-widest border-2 border-gray-300 focus:border-blue-500 outline-none mb-2" autoFocus disabled={hasAnswered || timeUp} />
                  <button onClick={() => submitAnswer(typedAnswer)} disabled={hasAnswered || timeUp || !typedAnswer.trim()} className="w-full bg-green-500 hover:bg-green-400 disabled:bg-gray-400 text-white font-bold py-3 rounded-xl">Submit</button>
                </div>
              ) : (
                <div className="space-y-2">{q?.options?.map((opt, i) => (<button key={i} onClick={() => submitAnswer(opt)} disabled={hasAnswered || timeUp} className={`w-full py-2 px-3 rounded-xl font-medium text-left ${hasAnswered || timeUp ? 'opacity-50' : 'hover:bg-white active:scale-98'} ${selectedAnswer === opt ? 'bg-blue-500 text-white' : 'bg-white/90 text-gray-800'}`}>{opt}</button>))}</div>
              )) : (<div className="text-center text-white"><div className="text-3xl mb-1">👀</div><p>{timeUp ? "Time ran out!" : "Waiting..."}</p></div>)}
            </div>
          )}
          {phase === 'reveal' && (
            <div className="mb-3">
              <div className="bg-green-500 text-white rounded-xl p-4 text-center mb-3">
                <p className="text-sm opacity-80">Answer:</p>
                <p className="text-2xl font-bold">{q?.answer}</p>
              </div>
              {isHost && <button onClick={nextQuestion} className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"><ChevronRight className="w-5 h-5" />Next</button>}
            </div>
          )}
          <div className="bg-white/10 rounded-xl p-2"><div className="grid grid-cols-3 gap-1">{sortedPlayers.slice(0, 6).map((p, i) => (<div key={p.id} className="bg-white/10 rounded px-2 py-1 text-center"><p className="text-white text-xs truncate">{i === 0 && '👑'}{p.name}</p><p className="text-green-400 font-bold text-sm">{p.score}</p></div>))}</div></div>
        </div>
      </div>
    );
  };

  const renderRoundEnd = () => (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-800 p-4 flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold text-white mb-4">Round Complete!</h2>
        <div className="bg-white/10 rounded-xl p-4 mb-4">
          <h3 className="text-white font-bold mb-2">Scores</h3>
          {sortedPlayers.map((p, i) => (<div key={p.id} className={`flex items-center justify-between py-2 px-3 rounded-lg mb-1 ${i === 0 ? 'bg-yellow-500/30' : 'bg-white/10'}`}><span className="text-white flex items-center gap-2">{i === 0 && '🏆'}{i === 1 && '🥈'}{i === 2 && '🥉'}{p.name}</span><span className="text-green-300 font-bold">{p.score}</span></div>))}
        </div>
        {isHost && <button onClick={backToLobby} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl">Back to Lobby</button>}
      </div>
    </div>
  );

  const renderTournamentEnd = () => {
    const t = gameState?.tournament;
    const categories = t?.categories || [];
    const categoryWinners = categories.map(cat => {
      const meta = categoryMeta[cat];
      let bestPlayer = null, bestScore = 0;
      Object.entries(players).forEach(([id, p]) => {
        const catScore = p.categoryScores?.[cat] || 0;
        if (catScore > bestScore) { bestScore = catScore; bestPlayer = { id, name: p.name, score: catScore }; }
      });
      return { category: cat, meta, winner: bestPlayer };
    });

    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-red-900 to-green-900 p-4">
        <Snowflakes />
        <div className="max-w-md mx-auto relative z-10">
          <div className="text-center mb-4">
            <div className="text-6xl mb-2">🏆</div>
            <h2 className="text-3xl font-bold text-white mb-1">Tournament Complete!</h2>
            <p className="text-white/60">{categories.length} categories • {categories.length * (t?.questionsPerCategory || 5)} questions</p>
          </div>
          <div className="bg-yellow-500/20 border-2 border-yellow-500 rounded-xl p-4 mb-4">
            <h3 className="text-yellow-400 font-bold text-center mb-2">🎄 Overall Champion 🎄</h3>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{sortedPlayers[0]?.name}</p>
              <p className="text-yellow-400 text-2xl font-bold">{sortedPlayers[0]?.score} points</p>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 mb-4">
            <h3 className="text-white font-bold mb-2 flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-400" />Final Standings</h3>
            {sortedPlayers.map((p, i) => (
              <div key={p.id} className={`flex items-center justify-between py-2 px-3 rounded-lg mb-1 ${i === 0 ? 'bg-yellow-500/30' : i === 1 ? 'bg-gray-400/20' : i === 2 ? 'bg-orange-700/20' : 'bg-white/5'}`}>
                <span className="text-white flex items-center gap-2">{i === 0 && '🥇'}{i === 1 && '🥈'}{i === 2 && '🥉'}{i > 2 && <span className="w-5 text-center text-white/50">{i + 1}</span>}{p.name}</span>
                <span className="text-green-300 font-bold">{p.score}</span>
              </div>
            ))}
          </div>
          <div className="bg-white/10 rounded-xl p-4 mb-4">
            <h3 className="text-white font-bold mb-2 flex items-center gap-2"><Star className="w-5 h-5 text-yellow-400" />Category Champions</h3>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {categoryWinners.map(({ category, meta, winner }) => (
                <div key={category} className="flex items-center justify-between bg-white/5 rounded px-2 py-1">
                  <span className="text-white flex items-center gap-1 text-sm"><span>{meta.icon}</span><span className="truncate max-w-20">{meta.name}</span></span>
                  {winner ? <span className="text-green-400 text-sm font-medium">{winner.name} ({winner.score})</span> : <span className="text-white/40 text-sm">-</span>}
                </div>
              ))}
            </div>
          </div>
          {isHost && <button onClick={backToLobby} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"><Play className="w-5 h-5" />Play Again</button>}
        </div>
      </div>
    );
  };

  const getScreen = () => {
    if (!hasAccess) return renderGate();
    if (screen === 'home') return renderHome();
    if (screen === 'lobby') {
      if (gameState?.status === 'playing') return renderPlaying();
      if (gameState?.status === 'roundEnd') return renderRoundEnd();
      if (gameState?.status === 'tournamentEnd') return renderTournamentEnd();
      return renderLobby();
    }
    return renderHome();
  };

  return getScreen();
}
