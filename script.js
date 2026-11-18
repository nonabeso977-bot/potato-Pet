const state = { food: 76, happy: 72, energy: 82, coins: 0 };

const pet = document.getElementById("pet");
const speech = document.getElementById("speech");
const coins = document.getElementById("coins");
const room = document.getElementById("room");
const roomName = document.getElementById("roomName");
const roomIllustration = document.getElementById("roomIllustration");
const roomAction = document.getElementById("roomAction");
const petName = document.getElementById("petName");

const rooms = {
  kitchen: {
    name: "المطبخ", icon: "🍳", className: "room-kitchen",
    action: "feed", button: "قدّمي لها الطعام 🍎",
    welcome: "مياو! جعت؟ المطبخ مكاني المفضل.",
    done: "مممم… لذيذ! شكرًا على الطعام ♡"
  },
  playroom: {
    name: "غرفة اللعب", icon: "🧸", className: "room-playroom",
    action: "play", button: "العبي معها 🧶",
    welcome: "أحضرتِ الخيط؟ هيا نلعب!",
    done: "يا لها من لعبة ممتعة! مرة ثانية!"
  },
  bedroom: {
    name: "غرفة النوم", icon: "🛏️", className: "room-bedroom",
    action: "sleep", button: "دعِيها تنام ☾",
    welcome: "بدأ النعاس… أريد سريري.",
    done: "تصبحين على خير… ززز"
  },
  lounge: {
    name: "غرفة الجلوس", icon: "🛋️", className: "room-lounge",
    action: "pet", button: "داعبي لوزة ♡",
    welcome: "تعالي اجلسي معي قليلًا.",
    done: "خرخرةةة… أحب المداعبة ♡"
  }
};

const skins = [
  { className: "skin-blue", name: "لوزة الزرقاء" },
  { className: "skin-cream", name: "لوزة الكريمية" },
  { className: "skin-orange", name: "لوزة المشمش" },
  { className: "skin-lilac", name: "لوزة البنفسجية" }
];

let currentRoom = "kitchen";
let skinIndex = 0;

function updateBars() {
  document.getElementById("foodBar").style.width = state.food + "%";
  document.getElementById("happyBar").style.width = state.happy + "%";
  document.getElementById("energyBar").style.width = state.energy + "%";
  coins.textContent = state.coins;
}

let speechTimer;
function talk(message) {
  speech.textContent = message;
  speech.classList.remove("hide");
  clearTimeout(speechTimer);
  speechTimer = setTimeout(() => speech.classList.add("hide"), 2400);
}

function animatePet(className) {
  pet.classList.remove("playing", "sleeping");
  void pet.offsetWidth;
  if (className) pet.classList.add(className);
}

function goToRoom(roomId) {
  const nextRoom = rooms[roomId];
  if (!nextRoom) return;

  currentRoom = roomId;
  room.classList.remove(...Object.values(rooms).map(item => item.className));
  room.classList.add(nextRoom.className);
  roomName.textContent = nextRoom.name;
  roomIllustration.textContent = nextRoom.icon;
  roomAction.textContent = nextRoom.button;
  animatePet("");
  talk(nextRoom.welcome);

  document.querySelectorAll("[data-room]").forEach(button => {
    const selected = button.dataset.room === roomId;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

function changeLook() {
  skinIndex = (skinIndex + 1) % skins.length;
  pet.classList.remove(...skins.map(item => item.className));
  pet.classList.add(skins[skinIndex].className);
  petName.textContent = skins[skinIndex].name;
  talk("كيف صار شكلي؟ ✿");
}

function performRoomAction() {
  const action = rooms[currentRoom].action;

  if (action === "feed") {
    if (state.food >= 96) return talk("أنا شبعانة! شكرًا ♡");
    state.food = Math.min(100, state.food + 24);
    state.happy = Math.min(100, state.happy + 4);
    state.coins += 2;
    animatePet("playing");
  } else if (action === "play") {
    if (state.energy < 18) return talk("تعبانة شوي… خليني أرتاح ☾");
    state.happy = Math.min(100, state.happy + 19);
    state.energy = Math.max(0, state.energy - 16);
    state.food = Math.max(0, state.food - 7);
    state.coins += 3;
    animatePet("playing");
  } else if (action === "sleep") {
    if (state.energy >= 96) return talk("أنا مرتاحة ومليانة طاقة!");
    state.energy = Math.min(100, state.energy + 27);
    animatePet("sleeping");
  } else if (action === "pet") {
    state.happy = Math.min(100, state.happy + 12);
    state.coins += 1;
    animatePet("playing");
  }

  updateBars();
  talk(rooms[currentRoom].done);
}

document.querySelectorAll("[data-room]").forEach(button => {
  button.addEventListener("click", () => goToRoom(button.dataset.room));
});

document.getElementById("homeButton").addEventListener("click", () => goToRoom("lounge"));
document.getElementById("lookButton").addEventListener("click", changeLook);
roomAction.addEventListener("click", performRoomAction);

pet.addEventListener("click", () => {
  state.happy = Math.min(100, state.happy + 5);
  updateBars();
  animatePet("playing");
  talk("مياااو! انتبهي لي ♡");
});

setInterval(() => {
  state.food = Math.max(0, state.food - 1);
  state.energy = Math.max(0, state.energy - 0.5);
  if (state.food < 20) state.happy = Math.max(0, state.happy - 1);
  updateBars();
}, 15000);

goToRoom("kitchen");
updateBars();
