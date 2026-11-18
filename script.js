const state = { food: 76, happy: 72, energy: 82, coins: 0 };

const pet = document.getElementById("pet");
const speech = document.getElementById("speech");
const coins = document.getElementById("coins");
const room = document.getElementById("room");
const roomName = document.getElementById("roomName");

const rooms = [
  { className: "room-sky", name: "غرفة الغيوم", message: "يبدو الجو لطيفًا هنا ☁" },
  { className: "room-garden", name: "غرفة الحديقة", message: "أحب النباتات والهواء المنعش!" },
  { className: "room-night", name: "غرفة النجوم", message: "ليلة هادئة تحت النجوم ✦" },
  { className: "room-candy", name: "غرفة الحلوى", message: "كل شيء هنا بلون الحلوى!" }
];
const skins = [
  { className: "skin-blue", name: "لوزة الزرقاء" },
  { className: "skin-cream", name: "لوزة الكريمية" },
  { className: "skin-orange", name: "لوزة المشمش" },
  { className: "skin-lilac", name: "لوزة البنفسجية" }
];
let roomIndex = 0;
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
  speechTimer = setTimeout(() => speech.classList.add("hide"), 2200);
}

function animatePet(className) {
  pet.classList.remove("playing", "sleeping");
  void pet.offsetWidth;
  if (className) pet.classList.add(className);
}

function changeRoom() {
  roomIndex = (roomIndex + 1) % rooms.length;
  room.classList.remove(...rooms.map(item => item.className));
  room.classList.add(rooms[roomIndex].className);
  roomName.textContent = rooms[roomIndex].name;
  talk(rooms[roomIndex].message);
}

function changeLook() {
  skinIndex = (skinIndex + 1) % skins.length;
  pet.classList.remove(...skins.map(item => item.className));
  pet.classList.add(skins[skinIndex].className);
  document.getElementById("petName").textContent = skins[skinIndex].name;
  talk("كيف صار شكلي؟ ✿");
}

function doAction(action) {
  if (action === "feed") {
    if (state.food >= 96) return talk("أنا شبعانة! شكرًا ♡");
    state.food = Math.min(100, state.food + 24);
    state.happy = Math.min(100, state.happy + 4);
    state.coins += 2;
    animatePet("");
    talk("مممم… لذيذ! 🍎");
  } else if (action === "play") {
    if (state.energy < 18) return talk("تعبانة شوي… خليني أرتاح ☾");
    state.happy = Math.min(100, state.happy + 19);
    state.energy = Math.max(0, state.energy - 16);
    state.food = Math.max(0, state.food - 7);
    state.coins += 3;
    animatePet("playing");
    talk("امسكي الخيط! 🧶");
  } else if (action === "sleep") {
    state.energy = Math.min(100, state.energy + 27);
    animatePet("sleeping");
    talk("تصبحين على خير… zZ");
  } else if (action === "pet") {
    state.happy = Math.min(100, state.happy + 12);
    state.coins += 1;
    animatePet("");
    talk("خرخرةةة… أحب المداعبة ♡");
  }
  updateBars();
}

document.querySelectorAll("[data-action]").forEach(button => {
  button.addEventListener("click", () => doAction(button.dataset.action));
});
document.getElementById("roomButton").addEventListener("click", changeRoom);
document.getElementById("lookButton").addEventListener("click", changeLook);

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

updateBars();
