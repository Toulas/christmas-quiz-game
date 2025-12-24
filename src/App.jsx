import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, off, update, remove, query, orderByChild, endAt, get } from 'firebase/database';
import { Users, ChevronRight, Check, X, Clock, Crown, Wifi, WifiOff, Copy, LogOut, Volume2, VolumeX, Lock, Shuffle } from 'lucide-react';

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

// Room expiry time (2 hours in milliseconds)
const ROOM_EXPIRY_MS = 2 * 60 * 60 * 1000;

// Sound Manager
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

// Categories with metadata
const categoryMeta = {
  caribbean: { name: "Caribbean Christmas", icon: "🌴", color: "from-yellow-500 to-orange-500" },
  trivia: { name: "Christmas Trivia", icon: "🎄", color: "from-red-500 to-red-600" },
  movies: { name: "Christmas Movies", icon: "🎬", color: "from-purple-500 to-pink-500" },
  music: { name: "Christmas Music", icon: "🎵", color: "from-green-500 to-emerald-500" },
  rnb: { name: "R&B Music", icon: "🎤", color: "from-pink-500 to-rose-500" },
  afrobeats: { name: "Afrobeats", icon: "🥁", color: "from-amber-500 to-yellow-500" },
  reggae: { name: "Reggae", icon: "🇯🇲", color: "from-green-600 to-yellow-500" },
  popculture: { name: "Pop Culture", icon: "📱", color: "from-violet-500 to-purple-500" },
  children: { name: "Children's Round", icon: "👶", color: "from-sky-400 to-blue-500" },
  bible: { name: "Bible", icon: "📖", color: "from-indigo-500 to-blue-600" },
  food: { name: "Food & Drink", icon: "🍕", color: "from-orange-500 to-red-500" },
  geography: { name: "Geography", icon: "🌍", color: "from-green-600 to-teal-500" },
  anagram: { name: "Anagrams", icon: "🔤", color: "from-cyan-500 to-blue-500", type: "anagram" },
  riddles: { name: "Riddles", icon: "🧩", color: "from-fuchsia-500 to-pink-500", type: "riddle" },
};

// Questions Database
const allQuestions = {
  caribbean: [
    // Trinidad & Tobago
    { id: 'car1', question: "What is the traditional Christmas music of Trinidad & Tobago, with Spanish-influenced folk songs?", options: ["Calypso", "Parang", "Soca", "Reggae"], answer: "Parang" },
    { id: 'car2', question: "What creamy rum drink is Trinidad's version of eggnog, made with Angostura bitters?", options: ["Sorrel", "Ponche de Crème", "Ginger Beer", "Mauby"], answer: "Ponche de Crème" },
    { id: 'car3', question: "Pastelles are a Trinidadian Christmas dish. What are they wrapped in?", options: ["Corn husk", "Banana leaves", "Foil", "Pastry"], answer: "Banana leaves" },
    { id: 'car4', question: "What is pastelles filled with?", options: ["Rice and beans", "Seasoned meat in cornmeal", "Vegetables", "Fish"], answer: "Seasoned meat in cornmeal" },
    { id: 'car5', question: "Which country did parang music originally come from to Trinidad?", options: ["Spain", "Venezuela", "Portugal", "Colombia"], answer: "Venezuela" },
    // Guyana
    { id: 'car6', question: "What is Guyana's national dish, traditionally eaten on Christmas morning?", options: ["Jerk Chicken", "Pepperpot", "Curry Goat", "Jug Jug"], answer: "Pepperpot" },
    { id: 'car7', question: "What special ingredient in pepperpot acts as a preservative, made from cassava?", options: ["Molasses", "Cassareep", "Tamarind", "Coconut milk"], answer: "Cassareep" },
    { id: 'car8', question: "Garlic pork is a Guyanese Christmas dish brought by which European settlers?", options: ["British", "Dutch", "Portuguese", "French"], answer: "Portuguese" },
    { id: 'car9', question: "What bread is traditionally eaten with Guyanese pepperpot?", options: ["Roti", "Plait bread", "Bake", "Hard dough bread"], answer: "Plait bread" },
    { id: 'car10', question: "Which indigenous people of Guyana created pepperpot?", options: ["Taino", "Amerindians", "Arawak", "Caribs"], answer: "Amerindians" },
    // Barbados
    { id: 'car11', question: "What is the traditional Barbadian Christmas dish influenced by Scottish haggis?", options: ["Cou Cou", "Jug Jug", "Pepperpot", "Pudding and Souse"], answer: "Jug Jug" },
    { id: 'car12', question: "Jug Jug is made with pigeon peas and what type of flour?", options: ["Wheat flour", "Cornmeal", "Guinea corn flour", "Cassava flour"], answer: "Guinea corn flour" },
    { id: 'car13', question: "What is 'Great Cake' in Barbados?", options: ["A type of bread", "Rum-soaked fruitcake", "Coconut cake", "Sponge cake"], answer: "Rum-soaked fruitcake" },
    { id: 'car14', question: "Where do Bajans traditionally gather on Christmas morning?", options: ["Oistins", "Queen's Park", "Holetown", "Bathsheba"], answer: "Queen's Park" },
    { id: 'car15', question: "What event happens at Garrison Savannah on Boxing Day in Barbados?", options: ["Cricket match", "Horse racing", "Carnival", "Beach party"], answer: "Horse racing" },
    // Jamaica
    { id: 'car16', question: "What peas are traditionally used in Jamaican Christmas rice and peas?", options: ["Black-eyed peas", "Gungo peas", "Red kidney beans", "Chickpeas"], answer: "Gungo peas" },
    { id: 'car17', question: "What is the red Christmas drink made from hibiscus flowers called in Jamaica?", options: ["Punch", "Sorrel", "Ginger beer", "Sky juice"], answer: "Sorrel" },
    { id: 'car18', question: "Which meat is most associated with Jamaican Christmas dinner?", options: ["Jerk chicken", "Curry goat", "Oxtail", "All of these"], answer: "All of these" },
    { id: 'car19', question: "What is Jamaican Christmas cake also known as?", options: ["Fruit cake", "Black cake", "Rum cake", "All of these"], answer: "All of these" },
    // General Caribbean
    { id: 'car20', question: "Which Caribbean island is Christmas celebrated in summer?", options: ["None - all are tropical", "Trinidad", "Jamaica", "Barbados"], answer: "None - all are tropical" },
    { id: 'car21', question: "Sorrel drink is made from which flower?", options: ["Rose", "Hibiscus", "Poinsettia", "Jasmine"], answer: "Hibiscus" },
    { id: 'car22', question: "What spice is commonly added to Caribbean sorrel drink?", options: ["Cinnamon", "Ginger", "Cloves", "All of these"], answer: "All of these" },
    { id: 'car23', question: "In which Caribbean country might you eat 'conkies' wrapped in banana leaves?", options: ["Jamaica", "Barbados", "Trinidad", "Guyana"], answer: "Barbados" },
    { id: 'car24', question: "What is the main fish in Barbados' national dish?", options: ["Snapper", "Flying fish", "Mahi mahi", "Salmon"], answer: "Flying fish" },
    { id: 'car25', question: "Which Caribbean country is known for having KFC as a Christmas tradition (like Japan)?", options: ["None - that's only Japan", "Trinidad", "Barbados", "Jamaica"], answer: "None - that's only Japan" },
  ],
  trivia: [
    { id: 't1', question: "In which country did the tradition of putting up a Christmas tree originate?", options: ["England", "Germany", "USA", "France"], answer: "Germany" },
    { id: 't2', question: "What is the name of the main character in 'A Christmas Carol'?", options: ["Bob Cratchit", "Ebenezer Scrooge", "Tiny Tim", "Jacob Marley"], answer: "Ebenezer Scrooge" },
    { id: 't3', question: "How many gifts are given in total in 'The Twelve Days of Christmas'?", options: ["12", "78", "364", "144"], answer: "364" },
    { id: 't4', question: "What plant is traditionally hung for kissing underneath?", options: ["Holly", "Ivy", "Mistletoe", "Poinsettia"], answer: "Mistletoe" },
    { id: 't5', question: "How many ghosts appear in 'A Christmas Carol'?", options: ["3", "4", "5", "6"], answer: "4" },
    { id: 't6', question: "What country did St. Nicholas originally come from?", options: ["Finland", "Turkey", "Greece", "Russia"], answer: "Turkey" },
    { id: 't7', question: "In which country is it tradition to eat KFC for Christmas?", options: ["USA", "UK", "Japan", "Australia"], answer: "Japan" },
    { id: 't8', question: "How many points does a snowflake traditionally have?", options: ["4", "5", "6", "8"], answer: "6" },
    { id: 't9', question: "Which country gives Britain a Christmas tree each year for Trafalgar Square?", options: ["Sweden", "Norway", "Finland", "Denmark"], answer: "Norway" },
    { id: 't10', question: "What do they call Santa Claus in France?", options: ["Papa Noël", "Père Noël", "Saint Nicolas", "Le Père Froid"], answer: "Père Noël" },
  ],
  movies: [
    { id: 'mov1', question: "In 'Home Alone', where are the McCallisters going on vacation?", options: ["London", "Paris", "Rome", "Miami"], answer: "Paris" },
    { id: 'mov2', question: "What is the name of the Grinch's dog?", options: ["Spot", "Max", "Buddy", "Rex"], answer: "Max" },
    { id: 'mov3', question: "In 'Elf', what does Buddy put in his spaghetti?", options: ["Chocolate chips", "Maple syrup", "Marshmallows", "All of the above"], answer: "All of the above" },
    { id: 'mov4', question: "What movie features the line 'You'll shoot your eye out!'?", options: ["Elf", "A Christmas Story", "Home Alone", "Jingle All the Way"], answer: "A Christmas Story" },
    { id: 'mov5', question: "What toy is the father trying to get in 'Jingle All the Way'?", options: ["Tickle Me Elmo", "Turbo Man", "Power Rangers", "Buzz Lightyear"], answer: "Turbo Man" },
    { id: 'mov6', question: "What is the name of the angel in 'It's a Wonderful Life'?", options: ["Gabriel", "Michael", "Clarence", "George"], answer: "Clarence" },
    { id: 'mov7', question: "In 'Die Hard', what building does the action take place in?", options: ["Empire State Building", "Nakatomi Plaza", "Sears Tower", "Trump Tower"], answer: "Nakatomi Plaza" },
    { id: 'mov8', question: "In 'The Nightmare Before Christmas', what is Jack's title?", options: ["Pumpkin King", "Halloween King", "Skeleton King", "Nightmare King"], answer: "Pumpkin King" },
    { id: 'mov9', question: "What year was 'Home Alone' released?", options: ["1988", "1990", "1992", "1994"], answer: "1990" },
    { id: 'mov10', question: "What is the Grinch's mountain called?", options: ["Mount Crumpit", "Mount Grinch", "Mount Whoville", "Mount Christmas"], answer: "Mount Crumpit" },
  ],
  music: [
    { id: 'm1', question: "Who originally sang 'White Christmas'?", options: ["Frank Sinatra", "Bing Crosby", "Elvis Presley", "Dean Martin"], answer: "Bing Crosby" },
    { id: 'm2', question: "Who sang 'All I Want for Christmas Is You'?", options: ["Whitney Houston", "Mariah Carey", "Celine Dion", "Madonna"], answer: "Mariah Carey" },
    { id: 'm3', question: "Who sang 'Last Christmas'?", options: ["Wham!", "Duran Duran", "Culture Club", "Spandau Ballet"], answer: "Wham!" },
    { id: 'm4', question: "What Christmas song was originally written for Thanksgiving?", options: ["White Christmas", "Jingle Bells", "Winter Wonderland", "Silver Bells"], answer: "Jingle Bells" },
    { id: 'm5', question: "Who sang 'Blue Christmas'?", options: ["Frank Sinatra", "Dean Martin", "Elvis Presley", "Johnny Cash"], answer: "Elvis Presley" },
    { id: 'm6', question: "Who recorded 'Feliz Navidad'?", options: ["José Feliciano", "Julio Iglesias", "Luis Miguel", "Enrique Iglesias"], answer: "José Feliciano" },
    { id: 'm7', question: "What collective had a hit in 1984 with 'Do They Know It's Christmas?'", options: ["USA for Africa", "Band Aid", "Live Aid", "We Are the World"], answer: "Band Aid" },
    { id: 'm8', question: "Who had a hit with 'Step Into Christmas'?", options: ["George Michael", "Elton John", "Freddie Mercury", "David Bowie"], answer: "Elton John" },
    { id: 'm9', question: "The Pogues sang about a Fairytale of which city?", options: ["London", "Dublin", "New York", "Paris"], answer: "New York" },
    { id: 'm10', question: "Who released 'Rockin' Around the Christmas Tree' in 1958?", options: ["Brenda Lee", "Connie Francis", "Patsy Cline", "Peggy Lee"], answer: "Brenda Lee" },
  ],
  rnb: [
    { id: 'rnb1', question: "Which R&B group released 'This Christmas' in 1993?", options: ["Boyz II Men", "New Edition", "Jodeci", "Blackstreet"], answer: "Boyz II Men" },
    { id: 'rnb2', question: "Who sang 'Santa Baby' originally in 1953?", options: ["Etta James", "Eartha Kitt", "Ella Fitzgerald", "Nina Simone"], answer: "Eartha Kitt" },
    { id: 'rnb3', question: "Donny Hathaway's 'This Christmas' was released in which year?", options: ["1970", "1975", "1980", "1985"], answer: "1970" },
    { id: 'rnb4', question: "Which artist released '8 Days of Christmas'?", options: ["Destiny's Child", "TLC", "En Vogue", "SWV"], answer: "Destiny's Child" },
    { id: 'rnb5', question: "Who performed 'Give Love on Christmas Day' with The Jackson 5?", options: ["Michael Jackson", "Jermaine Jackson", "Jackie Jackson", "All of them"], answer: "All of them" },
    { id: 'rnb6', question: "Which R&B legend released 'Someday at Christmas'?", options: ["Marvin Gaye", "Stevie Wonder", "Smokey Robinson", "Lionel Richie"], answer: "Stevie Wonder" },
    { id: 'rnb7', question: "Who sang 'Christmas in Hollis'?", options: ["Run-DMC", "Beastie Boys", "Public Enemy", "LL Cool J"], answer: "Run-DMC" },
    { id: 'rnb8', question: "Which female artist released 'All I Want for Christmas Is You' in 1994?", options: ["Whitney Houston", "Mariah Carey", "Janet Jackson", "Mary J. Blige"], answer: "Mariah Carey" },
    { id: 'rnb9', question: "What boy band released 'Merry Christmas, Happy Holidays'?", options: ["Backstreet Boys", "*NSYNC", "98 Degrees", "New Kids"], answer: "*NSYNC" },
    { id: 'rnb10', question: "Who released 'Under the Mistletoe' album in 2011?", options: ["Chris Brown", "Justin Bieber", "Usher", "Ne-Yo"], answer: "Justin Bieber" },
  ],
  afrobeats: [
    { id: 'afro1', question: "Which Nigerian artist is known as 'Starboy'?", options: ["Davido", "Wizkid", "Burna Boy", "Olamide"], answer: "Wizkid" },
    { id: 'afro2', question: "Who won the Grammy for Best Global Music Album in 2021?", options: ["Wizkid", "Burna Boy", "Davido", "Tiwa Savage"], answer: "Burna Boy" },
    { id: 'afro3', question: "What is Davido's real first name?", options: ["Daniel", "David", "Damola", "Dele"], answer: "David" },
    { id: 'afro4', question: "Which country is Burna Boy from?", options: ["Ghana", "Nigeria", "Kenya", "South Africa"], answer: "Nigeria" },
    { id: 'afro5', question: "Who collaborated with Beyoncé on 'Brown Skin Girl'?", options: ["Burna Boy", "Wizkid", "Davido", "Mr Eazi"], answer: "Wizkid" },
    { id: 'afro6', question: "What is the name of Wizkid's hit song with Drake?", options: ["One Dance", "Controlla", "Hotline Bling", "God's Plan"], answer: "One Dance" },
    { id: 'afro7', question: "Which female Afrobeats artist is known as 'Mama Africa'?", options: ["Yemi Alade", "Tiwa Savage", "Simi", "Tems"], answer: "Yemi Alade" },
    { id: 'afro8', question: "Who sang 'Essence' featuring Justin Bieber?", options: ["Davido", "Wizkid", "Burna Boy", "CKay"], answer: "Wizkid" },
    { id: 'afro9', question: "What genre is often fused with Afrobeats?", options: ["Dancehall", "Reggae", "Hip-Hop", "All of these"], answer: "All of these" },
    { id: 'afro10', question: "Which song by CKay went viral on TikTok?", options: ["Love Nwantiti", "Finesse", "Fall", "Soco"], answer: "Love Nwantiti" },
  ],
  reggae: [
    { id: 'reg1', question: "Who is known as the 'King of Reggae'?", options: ["Peter Tosh", "Bob Marley", "Jimmy Cliff", "Toots Hibbert"], answer: "Bob Marley" },
    { id: 'reg2', question: "What is the name of Bob Marley's band?", options: ["The Wailers", "The Melodians", "Third World", "Inner Circle"], answer: "The Wailers" },
    { id: 'reg3', question: "Which Jamaican city is considered the birthplace of reggae?", options: ["Montego Bay", "Kingston", "Ocho Rios", "Negril"], answer: "Kingston" },
    { id: 'reg4', question: "What religion is closely associated with reggae music?", options: ["Christianity", "Islam", "Rastafari", "Buddhism"], answer: "Rastafari" },
    { id: 'reg5', question: "Who sang 'I Can See Clearly Now'?", options: ["Bob Marley", "Jimmy Cliff", "Johnny Nash", "Peter Tosh"], answer: "Johnny Nash" },
    { id: 'reg6', question: "What is Sean Paul's music genre primarily?", options: ["Reggae", "Dancehall", "Ska", "Rocksteady"], answer: "Dancehall" },
    { id: 'reg7', question: "Which reggae artist sang 'It Wasn't Me'?", options: ["Sean Paul", "Shaggy", "Beenie Man", "Buju Banton"], answer: "Shaggy" },
    { id: 'reg8', question: "What Bob Marley song includes 'Every little thing gonna be alright'?", options: ["No Woman No Cry", "Three Little Birds", "One Love", "Redemption Song"], answer: "Three Little Birds" },
    { id: 'reg9', question: "UB40 had a hit cover of which reggae classic?", options: ["One Love", "Red Red Wine", "Buffalo Soldier", "Stir It Up"], answer: "Red Red Wine" },
    { id: 'reg10', question: "Which country, after Jamaica, has the largest reggae scene?", options: ["USA", "UK", "Japan", "Brazil"], answer: "UK" },
  ],
  popculture: [
    { id: 'pop1', question: "What social media platform is known for short videos and went viral in 2020?", options: ["Instagram", "TikTok", "Snapchat", "Twitter"], answer: "TikTok" },
    { id: 'pop2', question: "Which streaming service released 'Squid Game'?", options: ["Amazon Prime", "Netflix", "Disney+", "Hulu"], answer: "Netflix" },
    { id: 'pop3', question: "What is Taylor Swift's 2024 concert tour called?", options: ["Reputation Tour", "Eras Tour", "1989 Tour", "Lover Tour"], answer: "Eras Tour" },
    { id: 'pop4', question: "Which artist released 'Anti-Hero' in 2022?", options: ["Beyoncé", "Taylor Swift", "Dua Lipa", "Adele"], answer: "Taylor Swift" },
    { id: 'pop5', question: "What Marvel movie was the highest-grossing film of 2019?", options: ["Infinity War", "Endgame", "Far From Home", "Captain Marvel"], answer: "Endgame" },
    { id: 'pop6', question: "What is the name of the viral AI chatbot released by OpenAI?", options: ["Siri", "Alexa", "ChatGPT", "Cortana"], answer: "ChatGPT" },
    { id: 'pop7', question: "Which song by Miley Cyrus went viral in 2023?", options: ["Wrecking Ball", "Flowers", "Midnight Sky", "Party in the USA"], answer: "Flowers" },
    { id: 'pop8', question: "What is the name of Beyoncé's 2022 album?", options: ["Lemonade", "Renaissance", "4", "Beyoncé"], answer: "Renaissance" },
    { id: 'pop9', question: "Which animated movie features a song 'We Don't Talk About Bruno'?", options: ["Coco", "Encanto", "Moana", "Frozen"], answer: "Encanto" },
    { id: 'pop10', question: "What video game character says 'It's-a me!'?", options: ["Sonic", "Mario", "Link", "Pikachu"], answer: "Mario" },
  ],
  children: [
    { id: 'ch1', question: "What color is Rudolph's nose?", options: ["Blue", "Green", "Red", "Yellow"], answer: "Red", emoji: "🔴" },
    { id: 'ch2', question: "How many reindeer pull Santa's sleigh (including Rudolph)?", options: ["7", "8", "9", "10"], answer: "9" },
    { id: 'ch3', question: "What do we leave out for Santa on Christmas Eve?", options: ["Pizza", "Cookies and milk", "Cake", "Ice cream"], answer: "Cookies and milk" },
    { id: 'ch4', question: "What do Santa's helpers make?", options: ["Cars", "Toys", "Houses", "Computers"], answer: "Toys" },
    { id: 'ch5', question: "What does Santa say?", options: ["Yo yo yo!", "Ho ho ho!", "Hey hey hey!", "Ha ha ha!"], answer: "Ho ho ho!" },
    { id: 'ch6', question: "Where does Santa live?", options: ["South Pole", "North Pole", "Iceland", "Moon"], answer: "North Pole" },
    { id: 'ch7', question: "What do you put on top of a Christmas tree?", options: ["Hat", "Star or Angel", "Balloon", "Candle"], answer: "Star or Angel", emoji: "⭐" },
    { id: 'ch8', question: "What cold person has a carrot nose?", options: ["Ice man", "Snowman", "Frost boy", "Winter wizard"], answer: "Snowman", emoji: "⛄" },
    { id: 'ch9', question: "What shape is a candy cane?", options: ["Circle", "Square", "Hook shape", "Triangle"], answer: "Hook shape", emoji: "🍬" },
    { id: 'ch10', question: "In 'Frozen', what is the snowman's name?", options: ["Oscar", "Oliver", "Olaf", "Oreo"], answer: "Olaf" },
  ],
  bible: [
    { id: 'bib1', question: "In what town was Jesus born?", options: ["Jerusalem", "Nazareth", "Bethlehem", "Galilee"], answer: "Bethlehem" },
    { id: 'bib2', question: "What gifts did the Three Wise Men bring?", options: ["Food, clothes, toys", "Gold, frankincense, myrrh", "Money, jewels, silk", "Bread, wine, oil"], answer: "Gold, frankincense, myrrh" },
    { id: 'bib3', question: "Where did Mary and Joseph stay when Jesus was born?", options: ["An inn", "A stable/manger", "A tent", "Their home"], answer: "A stable/manger" },
    { id: 'bib4', question: "Who told Mary she would have a baby?", options: ["Joseph", "Gabriel", "Michael", "Peter"], answer: "Gabriel" },
    { id: 'bib5', question: "What was Jesus laid in after he was born?", options: ["A bed", "A basket", "A manger", "A cradle"], answer: "A manger" },
    { id: 'bib6', question: "Who was the king that tried to find baby Jesus?", options: ["David", "Solomon", "Herod", "Caesar"], answer: "Herod" },
    { id: 'bib7', question: "What guided the Wise Men to Jesus?", options: ["A map", "An angel", "A star", "A vision"], answer: "A star" },
    { id: 'bib8', question: "Who were the first visitors to see baby Jesus?", options: ["Kings", "Shepherds", "Soldiers", "Priests"], answer: "Shepherds" },
    { id: 'bib9', question: "What did the angels tell the shepherds?", options: ["Run away", "Good news of great joy", "Be afraid", "Stay home"], answer: "Good news of great joy" },
    { id: 'bib10', question: "What does 'Emmanuel' mean?", options: ["Son of David", "Prince of Peace", "God with us", "Mighty King"], answer: "God with us" },
    { id: 'bib11', question: "Which Gospel has the most detailed birth narrative?", options: ["Matthew", "Mark", "Luke", "John"], answer: "Luke" },
    { id: 'bib12', question: "What was Joseph's occupation?", options: ["Fisherman", "Carpenter", "Tax collector", "Shepherd"], answer: "Carpenter" },
  ],
  food: [
    { id: 'f1', question: "What country does sushi originate from?", options: ["China", "Korea", "Japan", "Thailand"], answer: "Japan" },
    { id: 'f2', question: "What is the main ingredient in guacamole?", options: ["Tomato", "Avocado", "Pepper", "Onion"], answer: "Avocado" },
    { id: 'f3', question: "What type of pasta is shaped like bow ties?", options: ["Penne", "Fusilli", "Farfalle", "Rigatoni"], answer: "Farfalle" },
    { id: 'f4', question: "What is the most consumed beverage after water?", options: ["Coffee", "Tea", "Beer", "Soft drinks"], answer: "Tea" },
    { id: 'f5', question: "What country does paella originate from?", options: ["Mexico", "Italy", "Spain", "Portugal"], answer: "Spain" },
  ],
  geography: [
    { id: 'geo1', question: "What is the capital of Canada?", options: ["Toronto", "Vancouver", "Ottawa", "Montreal"], answer: "Ottawa" },
    { id: 'geo2', question: "What is the tallest mountain in the world?", options: ["K2", "Kangchenjunga", "Mount Everest", "Lhotse"], answer: "Mount Everest" },
    { id: 'geo3', question: "What is the largest desert in the world?", options: ["Sahara", "Arabian", "Gobi", "Antarctic"], answer: "Antarctic" },
    { id: 'geo4', question: "What country is known as the Land of the Rising Sun?", options: ["China", "Korea", "Japan", "Thailand"], answer: "Japan" },
    { id: 'geo5', question: "Which river flows through London?", options: ["Seine", "Thames", "Danube", "Rhine"], answer: "Thames" },
  ],
  anagram: [
    { id: 'ana1', scrambled: "TANSA SLAUC", answer: "SANTA CLAUS", hint: "The big man himself 🎅" },
    { id: 'ana2', scrambled: "NEDIREER", answer: "REINDEER", hint: "Santa's transport animals 🦌" },
    { id: 'ana3', scrambled: "WONS KEFLSA", answer: "SNOWFLAKES", hint: "Frozen water from the sky ❄️" },
    { id: 'ana4', scrambled: "GOCKINTS", answer: "STOCKINGS", hint: "Hung by the fireplace 🧦" },
    { id: 'ana5', scrambled: "SLINTE", answer: "TINSEL", hint: "Sparkly tree decoration ✨" },
    { id: 'ana6', scrambled: "LORAC SNIGESR", answer: "CAROL SINGERS", hint: "Door-to-door performers 🎶" },
    { id: 'ana7', scrambled: "DRE NOSE", answer: "RED NOSE", hint: "Rudolph's famous feature 🔴" },
    { id: 'ana8', scrambled: "YIVNTITA", answer: "NATIVITY", hint: "Scene of Jesus' birth 🌟" },
    { id: 'ana9', scrambled: "LOJLY", answer: "JOLLY", hint: "Happy and cheerful 😊" },
    { id: 'ana10', scrambled: "SLEB JIENLG", answer: "JINGLE BELLS", hint: "Famous Christmas song 🔔" },
  ],
  riddles: [
    { id: 'rid1', question: "I'm tall when I'm young, short when I'm old. Every Christmas I stand in the corner. What am I?", answer: "A candle", options: ["A candle", "A Christmas tree", "An elf", "A snowman"] },
    { id: 'rid2', question: "I have a head but no body, a heart but no blood. What am I?", answer: "A lettuce", options: ["A snowman", "A lettuce", "A cabbage", "A carrot"] },
    { id: 'rid3', question: "What has hands but can't clap?", answer: "A clock", options: ["A clock", "A snowman", "A toy", "A glove"] },
    { id: 'rid4', question: "I fall but never get hurt. What am I?", answer: "Snow", options: ["Rain", "Snow", "A leaf", "Night"] },
    { id: 'rid5', question: "What can you catch but not throw?", answer: "A cold", options: ["A ball", "A cold", "A fish", "A bus"] },
    { id: 'rid6', question: "I have branches but no leaves. What am I?", answer: "A bank", options: ["A bank", "A dead tree", "A river", "A family"] },
    { id: 'rid7', question: "What gets wetter the more it dries?", answer: "A towel", options: ["Ice", "A towel", "A sponge", "Snow"] },
    { id: 'rid8', question: "What has a thumb and four fingers but isn't alive?", answer: "A glove", options: ["A hand", "A mitten", "A glove", "A robot"] },
    { id: 'rid9', question: "What has keys but no locks?", answer: "A piano", options: ["A map", "A keyboard", "A piano", "A car"] },
    { id: 'rid10', question: "What goes up but never comes down?", answer: "Your age", options: ["A balloon", "Your age", "Smoke", "A plane"] },
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

// Family access code - change this to your own secret code!
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

  // Initialize
  useEffect(() => {
    // Check if already has access
    const savedAccess = localStorage.getItem('familyAccess');
    if (savedAccess === FAMILY_ACCESS_CODE) {
      setHasAccess(true);
    }
    
    let id = localStorage.getItem('playerId');
    if (!id) { id = 'p_' + Math.random().toString(36).substr(2, 9); localStorage.setItem('playerId', id); }
    setPlayerId(id);
    const savedName = localStorage.getItem('playerName');
    if (savedName) setPlayerName(savedName);
    document.addEventListener('click', () => soundManager.init(), { once: true });
    
    // Cleanup expired rooms (run once on load for hosts)
    cleanupExpiredRooms();
  }, []);

  // Cleanup expired rooms
  const cleanupExpiredRooms = async () => {
    const expireTime = Date.now() - ROOM_EXPIRY_MS;
    const roomsRef = ref(db, 'rooms');
    const snapshot = await get(roomsRef);
    if (snapshot.exists()) {
      const rooms = snapshot.val();
      Object.entries(rooms).forEach(([code, room]) => {
        if (room.createdAt < expireTime) {
          remove(ref(db, `rooms/${code}`));
        }
      });
    }
  };

  // Connection monitor
  useEffect(() => {
    const connRef = ref(db, '.info/connected');
    onValue(connRef, (snap) => setConnected(snap.val() === true));
    return () => off(connRef);
  }, []);

  // Room listener
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

  // Timer
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

  // Reset on new question
  useEffect(() => {
    if (gameState?.questionIndex !== undefined) {
      setSelectedAnswer(null);
      setTypedAnswer('');
      setHasAnswered(false);
      lastTickRef.current = null;
      timerExpiredRef.current = false;
    }
  }, [gameState?.questionIndex]);

  // Buzzer sound
  useEffect(() => {
    if (gameState?.buzzedPlayer && gameState?.phase === 'answering') soundManager.playBuzzer();
  }, [gameState?.buzzedPlayer, gameState?.phase]);

  const handleTimeUp = async () => {
    if (!isHost) return;
    await update(ref(db, `rooms/${roomCode}/game`), { phase: 'reveal' });
  };

  const createGame = async () => {
    if (!playerName.trim()) return alert('Enter your name');
    if (usePassword && roomPassword.length < 4) return alert('Password must be at least 4 characters');
    soundManager.playClick();
    const code = generateRoomCode();
    await set(ref(db, `rooms/${code}`), {
      host: playerId,
      hostName: playerName.trim(),
      createdAt: Date.now(),
      password: usePassword ? roomPassword : null,
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
    soundManager.playClick();
    const code = joinCode.toUpperCase();
    const checkRoom = await new Promise(resolve => {
      onValue(ref(db, `rooms/${code}`), (snap) => resolve(snap.val()), { onlyOnce: true });
    });
    if (!checkRoom) return alert('Room not found');
    if (checkRoom.password && checkRoom.password !== joinPassword) return alert('Incorrect password');
    await set(ref(db, `rooms/${code}/players/${playerId}`), { name: playerName.trim(), score: 0, isHost: false, joinedAt: Date.now() });
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
    setRoomCode(''); setGameState(null); setPlayers({}); setIsHost(false); setScreen('home');
  };

  const startRound = async (category) => {
    soundManager.playClick();
    const meta = categoryMeta[category];
    let qs;
    if (meta.type === 'anagram') {
      qs = [...allQuestions.anagram].sort(() => Math.random() - 0.5).slice(0, 5);
    } else if (meta.type === 'riddle') {
      qs = [...allQuestions.riddles].sort(() => Math.random() - 0.5).slice(0, 5);
    } else {
      qs = [...allQuestions[category]].sort(() => Math.random() - 0.5).slice(0, 5);
    }
    await update(ref(db, `rooms/${roomCode}/game`), {
      status: 'playing', category, roundType: meta.type || 'standard',
      questions: qs, questionIndex: 0, currentQuestion: qs[0],
      phase: 'buzzer', buzzedPlayer: null, timerEnd: Date.now() + 30000, answers: {}
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
    
    const q = gameState.currentQuestion;
    const roundType = gameState.roundType;
    let correct = false;
    
    if (roundType === 'anagram') {
      correct = answer.toUpperCase().replace(/\s/g, '') === q.answer.toUpperCase().replace(/\s/g, '');
    } else {
      correct = answer === q.answer;
    }
    
    const points = correct ? 100 + Math.max(0, localTimer * 3) : 0;
    if (correct) soundManager.playCorrect(); else soundManager.playWrong();
    
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

  const copyCode = () => { navigator.clipboard.writeText(roomCode); setCopied(true); soundManager.playClick(); setTimeout(() => setCopied(false), 2000); };
  const toggleSound = () => setSoundEnabled(soundManager.toggle());
  const sortedPlayers = Object.entries(players).map(([id, p]) => ({ id, ...p })).sort((a, b) => (b.score || 0) - (a.score || 0));

  // Verify family access code
  const verifyAccess = () => {
    if (accessCode.toUpperCase().trim() === FAMILY_ACCESS_CODE) {
      localStorage.setItem('familyAccess', FAMILY_ACCESS_CODE);
      setHasAccess(true);
      setAccessError('');
      soundManager.init();
      soundManager.playCorrect();
    } else {
      setAccessError('Incorrect access code. Ask your host for the family code!');
      soundManager.init();
      soundManager.playWrong();
    }
  };

  // GATE SCREEN
  const renderGate = () => (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-red-900 to-green-900 p-4 relative flex items-center justify-center">
      <Snowflakes />
      <div className="max-w-sm mx-auto relative z-10 text-center">
        <div className="text-6xl mb-4">🎄🔒</div>
        <h1 className="text-3xl font-bold text-white mb-2">Family Christmas Quiz</h1>
        <p className="text-white/60 mb-6">This is a private family event.<br/>Enter your access code to continue.</p>
        
        <div className="bg-white/10 backdrop-blur rounded-xl p-6">
          <label className="text-white/70 text-xs uppercase tracking-wide mb-2 block">Family Access Code</label>
          <input 
            type="text" 
            value={accessCode} 
            onChange={(e) => setAccessCode(e.target.value.toUpperCase())} 
            onKeyDown={(e) => e.key === 'Enter' && verifyAccess()}
            placeholder="Enter code" 
            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/40 text-2xl text-center font-mono tracking-widest uppercase border border-white/20 mb-3" 
            maxLength={20}
            autoFocus
          />
          {accessError && (
            <p className="text-red-400 text-sm mb-3">{accessError}</p>
          )}
          <button 
            onClick={verifyAccess} 
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl active:scale-95 transition-transform"
          >
            Enter Quiz
          </button>
        </div>
        
        <p className="text-white/30 text-xs mt-6">Don't have a code? Contact the quiz host.</p>
      </div>
    </div>
  );

  // HOME
  const renderHome = () => (
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-red-800 to-green-900 p-4 relative">
      <Snowflakes />
      <div className="max-w-md mx-auto relative z-10 pt-6">
        <button onClick={toggleSound} className="absolute top-2 right-2 text-white/60 hover:text-white p-2">
          {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🎄</div>
          <h1 className="text-3xl font-bold text-white mb-1">Christmas Quiz</h1>
          <p className="text-green-200 text-sm">Multi-Device Edition</p>
          <div className={`flex items-center justify-center gap-2 mt-2 ${connected ? 'text-green-400' : 'text-red-400'}`}>
            {connected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span className="text-xs">{connected ? 'Connected' : 'Connecting...'}</span>
          </div>
        </div>
        
        {/* Your Name */}
        <div className="bg-white/10 backdrop-blur rounded-xl p-3 mb-4">
          <label className="text-white/70 text-xs uppercase tracking-wide mb-1 block">Your Name</label>
          <input type="text" value={playerName} onChange={(e) => setPlayerName(e.target.value)} placeholder="Enter your name" className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/50 text-lg text-center font-medium" maxLength={15} />
        </div>

        {/* HOST A GAME */}
        <div className="bg-green-800/50 backdrop-blur rounded-xl p-4 mb-3 border border-green-600/30">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-5 h-5 text-yellow-400" />
            <h2 className="text-white font-bold">HOST A GAME</h2>
          </div>
          
          <div className="bg-white/10 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <input type="checkbox" id="usePass" checked={usePassword} onChange={(e) => setUsePassword(e.target.checked)} className="w-4 h-4 accent-green-500" />
              <label htmlFor="usePass" className="text-white text-sm flex items-center gap-1">
                <Lock className="w-4 h-4" /> Require password to join
              </label>
            </div>
            {usePassword && (
              <input 
                type="text" 
                value={roomPassword} 
                onChange={(e) => setRoomPassword(e.target.value)} 
                placeholder="Create a password for your room" 
                className="w-full px-3 py-2 rounded-lg bg-white/20 text-white placeholder-white/50 text-sm mt-2 border border-white/20" 
                maxLength={20} 
              />
            )}
            {usePassword && roomPassword && (
              <p className="text-green-300 text-xs mt-1">✓ Players will need this password + room code</p>
            )}
          </div>
          
          <button onClick={createGame} disabled={!connected || (usePassword && roomPassword.length < 4)} className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <Crown className="w-5 h-5" />
            Create Game Room
          </button>
        </div>

        {/* DIVIDER */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/20"></div></div>
          <div className="relative flex justify-center"><span className="bg-red-800 px-4 text-white/60 text-sm">or</span></div>
        </div>

        {/* JOIN A GAME */}
        <div className="bg-blue-800/50 backdrop-blur rounded-xl p-4 border border-blue-600/30">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-blue-300" />
            <h2 className="text-white font-bold">JOIN A GAME</h2>
          </div>
          
          <div className="space-y-2">
            <div>
              <label className="text-white/70 text-xs uppercase tracking-wide mb-1 block">Room Code</label>
              <input type="text" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 4))} placeholder="XXXX" className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/40 text-xl text-center font-mono tracking-widest uppercase border border-white/20" maxLength={4} />
            </div>
            <div>
              <label className="text-white/70 text-xs uppercase tracking-wide mb-1 block">Room Password</label>
              <input type="text" value={joinPassword} onChange={(e) => setJoinPassword(e.target.value)} placeholder="Enter if host set one" className="w-full px-3 py-2 rounded-lg bg-white/20 text-white placeholder-white/40 text-sm border border-white/20" />
            </div>
          </div>
          
          <button onClick={joinGame} disabled={!connected || joinCode.length !== 4} className="w-full mt-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white font-bold py-3 rounded-xl active:scale-95 transition-transform">
            Join Game
          </button>
        </div>

        <p className="text-center text-white/40 text-xs mt-4">{Object.values(allQuestions).reduce((s, c) => s + c.length, 0)} questions • {Object.keys(categoryMeta).length} categories</p>
      </div>
    </div>
  );

  // LOBBY
  const renderLobby = () => (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-800 p-4">
      <Snowflakes />
      <div className="max-w-md mx-auto relative z-10">
        <div className="flex justify-between items-center mb-4">
          <button onClick={leaveGame} className="text-white/70 flex items-center gap-1 text-sm"><LogOut className="w-4 h-4" />Leave</button>
          <div className="flex items-center gap-2">
            <button onClick={toggleSound} className="text-white/60 hover:text-white">{soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}</button>
            {connected ? <Wifi className="w-4 h-4 text-green-400" /> : <WifiOff className="w-4 h-4 text-red-400" />}
          </div>
        </div>
        <div className="text-center mb-4">
          <p className="text-green-200 text-sm">Room Code</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl font-mono font-bold text-white tracking-widest">{roomCode}</span>
            <button onClick={copyCode} className="text-white/70 hover:text-white"><Copy className="w-5 h-5" /></button>
          </div>
          {copied && <p className="text-green-400 text-xs">Copied!</p>}
        </div>
        <div className="bg-white/10 rounded-xl p-3 mb-4">
          <h3 className="text-white font-bold mb-2 flex items-center gap-2 text-sm"><Users className="w-4 h-4" /> Players ({Object.keys(players).length})</h3>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {sortedPlayers.map((p) => (
              <div key={p.id} className="flex items-center justify-between bg-white/10 rounded px-2 py-1 text-sm">
                <span className="text-white flex items-center gap-1">{p.isHost && <Crown className="w-3 h-3 text-yellow-400" />}{p.name}{p.id === playerId && <span className="text-white/40 text-xs">(you)</span>}</span>
                <span className="text-green-300 font-bold">{p.score || 0}</span>
              </div>
            ))}
          </div>
        </div>
        {isHost ? (
          <div>
            <p className="text-white text-center mb-2 text-sm font-medium">Choose category:</p>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {Object.entries(categoryMeta).map(([key, meta]) => (
                <button key={key} onClick={() => startRound(key)} className={`bg-gradient-to-r ${meta.color} text-white font-bold py-2 px-2 rounded-lg flex items-center gap-1 active:scale-95 transition-transform text-xs`}>
                  <span className="text-lg">{meta.icon}</span><span className="truncate">{meta.name}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center"><div className="text-5xl mb-2">⏳</div><p className="text-white">Waiting for host...</p></div>
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
    const roundType = gameState?.roundType || 'standard';

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4">
        <div className="max-w-lg mx-auto">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-1"><span className="text-xl">{meta.icon}</span><span className="text-white text-sm">{meta.name}</span></div>
            <div className="flex items-center gap-2">
              <button onClick={toggleSound} className="text-white/60">{soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}</button>
              <span className="text-white/60 text-sm">Q{(gameState?.questionIndex || 0) + 1}/5</span>
              <div className={`px-2 py-1 rounded-full text-white flex items-center gap-1 text-sm ${localTimer <= 5 ? 'bg-red-500 animate-pulse' : 'bg-white/20'}`}><Clock className="w-3 h-3" />{localTimer}s</div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-xl p-4 mb-3 shadow-lg">
            {roundType === 'anagram' ? (
              <>
                <div className="flex items-center gap-2 mb-2"><Shuffle className="w-5 h-5 text-blue-500" /><span className="text-sm text-gray-500">Unscramble the letters:</span></div>
                <h3 className="text-2xl font-bold text-gray-800 text-center tracking-widest">{q?.scrambled}</h3>
                {q?.hint && <p className="text-center text-gray-500 text-sm mt-2">{q.hint}</p>}
              </>
            ) : (
              <>
                {q?.emoji && <div className="text-4xl text-center mb-2">{q.emoji}</div>}
                <h3 className="text-lg font-bold text-gray-800">{q?.question}</h3>
              </>
            )}
          </div>

          {/* Buzzer Phase */}
          {phase === 'buzzer' && !buzzedPlayer && (
            <div className="mb-3">
              <button onClick={buzzIn} disabled={timeUp} className={`w-full text-white font-bold py-6 rounded-2xl text-xl shadow-lg transition-all ${timeUp ? 'bg-gray-500' : 'bg-red-500 hover:bg-red-400 active:scale-95 animate-pulse'}`}>
                {timeUp ? "⏱️ TIME'S UP!" : "🔔 BUZZ!"}
              </button>
            </div>
          )}

          {/* Answering Phase */}
          {phase === 'answering' && buzzedPlayer && (
            <div className="mb-3">
              <p className="text-center text-yellow-400 mb-2 font-bold">🔔 {players[buzzedPlayer]?.name} buzzed!</p>
              {isBuzzedPlayer ? (
                roundType === 'anagram' ? (
                  <div>
                    <input type="text" value={typedAnswer} onChange={(e) => setTypedAnswer(e.target.value.toUpperCase())} placeholder="Type your answer..." className="w-full px-4 py-3 rounded-xl text-lg text-center font-bold uppercase tracking-widest border-2 border-gray-300 focus:border-blue-500 outline-none mb-2" autoFocus disabled={hasAnswered || timeUp} />
                    <button onClick={() => submitAnswer(typedAnswer)} disabled={hasAnswered || timeUp || !typedAnswer.trim()} className="w-full bg-green-500 hover:bg-green-400 disabled:bg-gray-400 text-white font-bold py-3 rounded-xl">Submit Answer</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {q?.options?.map((opt, i) => (
                      <button key={i} onClick={() => submitAnswer(opt)} disabled={hasAnswered || timeUp}
                        className={`w-full py-2 px-3 rounded-xl font-medium text-left transition-all ${hasAnswered || timeUp ? 'opacity-50' : 'hover:bg-white active:scale-98'} ${selectedAnswer === opt ? 'bg-blue-500 text-white' : 'bg-white/90 text-gray-800'}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                )
              ) : (
                <div className="text-center text-white"><div className="text-3xl mb-1">👀</div><p>{timeUp ? "Time ran out!" : "Waiting..."}</p></div>
              )}
            </div>
          )}

          {/* Reveal Phase */}
          {phase === 'reveal' && (
            <div className="mb-3">
              {roundType === 'anagram' ? (
                <div className="bg-green-500 text-white rounded-xl p-4 text-center mb-3">
                  <p className="text-sm opacity-80">Answer:</p>
                  <p className="text-2xl font-bold">{q?.answer}</p>
                </div>
              ) : (
                <div className="space-y-1 mb-3">
                  {q?.options?.map((opt, i) => (
                    <div key={i} className={`w-full py-2 px-3 rounded-xl font-medium flex items-center gap-2 text-sm ${opt === q.answer ? 'bg-green-500 text-white' : answers[playerId]?.answer === opt && !answers[playerId]?.correct ? 'bg-red-500 text-white' : 'bg-white/20 text-white/60'}`}>
                      {opt === q.answer && <Check className="w-4 h-4" />}
                      {answers[playerId]?.answer === opt && !answers[playerId]?.correct && <X className="w-4 h-4" />}
                      {opt}
                    </div>
                  ))}
                </div>
              )}
              {buzzedPlayer ? (
                <p className={`text-center font-bold mb-3 ${answers[buzzedPlayer]?.correct ? 'text-green-400' : 'text-red-400'}`}>
                  {players[buzzedPlayer]?.name}: {answers[buzzedPlayer]?.correct ? `✓ +${answers[buzzedPlayer]?.points}` : '✗ Wrong!'}
                </p>
              ) : (
                <p className="text-center text-yellow-400 font-bold mb-3">⏱️ No one buzzed!</p>
              )}
              {isHost && (
                <button onClick={nextQuestion} className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-2 rounded-xl flex items-center justify-center gap-2 active:scale-95">
                  {(gameState?.questionIndex || 0) < 4 ? 'Next Question' : 'See Results'} <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Scores */}
          <div className="bg-white/10 rounded-xl p-2">
            <div className="grid grid-cols-3 gap-1">
              {sortedPlayers.slice(0, 6).map((p, i) => (
                <div key={p.id} className={`text-center py-1 px-1 rounded ${p.id === playerId ? 'bg-white/20' : ''}`}>
                  <div className="text-white text-xs truncate">{i === 0 && '👑'}{p.name}</div>
                  <div className="text-green-300 font-bold text-sm">{p.score}</div>
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
        <div className="max-w-md mx-auto relative z-10 pt-6">
          <div className="text-center mb-4">
            <div className="text-5xl mb-2">🎉</div>
            <h2 className="text-2xl font-bold text-white">Round Complete!</h2>
            <p className="text-green-200">{meta.icon} {meta.name}</p>
          </div>
          <div className="space-y-2 mb-4">
            {sortedPlayers.map((p, i) => (
              <div key={p.id} className={`rounded-xl p-3 flex items-center gap-3 ${i === 0 ? 'bg-yellow-300 text-yellow-900' : i === 1 ? 'bg-gray-200 text-gray-800' : i === 2 ? 'bg-orange-300 text-orange-900' : 'bg-white/80 text-gray-800'}`}>
                <div className="text-xl font-bold w-8">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</div>
                <div className="flex-1 font-bold">{p.name}{p.id === playerId && <span className="text-xs opacity-60 ml-1">(you)</span>}</div>
                <div className="text-xl font-bold">{p.score}</div>
              </div>
            ))}
          </div>
          {isHost ? (
            <div className="space-y-2">
              <button onClick={backToLobby} className="w-full bg-white text-green-800 font-bold py-3 rounded-xl active:scale-95">Play Another Round</button>
              <button onClick={leaveGame} className="w-full bg-white/20 text-white font-bold py-3 rounded-xl active:scale-95">End Game</button>
            </div>
          ) : (
            <p className="text-center text-white">Waiting for host...</p>
          )}
        </div>
      </div>
    );
  };

  const getScreen = () => {
    // Show gate first if no access
    if (!hasAccess) return renderGate();
    
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
