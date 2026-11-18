const state = {
  food: 76,
  happy: 72,
  energy: 82,
  coins: 0
};

const pet = document.getElementById("pet");
const speech = document.getElementById("speech");
const coins = document.getElementById("coins");

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
  speechTimer = setTimeout(() => speech.classList.add("hide"), 1900);
}

function animatePet(className) {
  pet.classList.remove("playing", "sleeping");
  // Restart the CSS animation so repeated taps still animate.
  void pet.offsetWidth;
  if (className) pet.classList.add(className);
}

function doAction(action) {
  if (action === "feed") {
    if (state.food >= 96) {
      talk("أنا شبعانة! شكرًا ♡");
      return;
    }
    state.food = Math.min(100, state.food + 24);
    state.happy = Math.min(100, state.happy + 4);
    state.coins += 2;
    animatePet("");
    talk("مممم… لذيذ! 🍎");
  }

  if (action === "play") {
    if (state.energy < 18) {
      talk("تعبانة شوي… خليني أرتاح ☾");
      return;
    }
    state.happy = Math.min(100, state.happy + 19);
    state.energy = Math.max(0, state.energy - 16);
    state.food = Math.max(0, state.food - 7);
    state.coins += 3;
    animatePet("playing");
    talk("امسكي الخيط! 🧶");
  }

  if (action === "sleep") {
    state.energy = Math.min(100, state.energy + 27);
    animatePet("sleeping");
    talk("تصبحين على خير… zZ");
  }

  if (action === "pet") {
    state.happy = Math.min(100, state.happy + 12);
    state.coins += 1;
    animatePet("");
    talk("خرخرةةة… أحب المداعبة ♡");
  }

  updateBars();
}

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => doAction(button.dataset.action));
});

pet.addEventListener("click", () => {
  state.happy = Math.min(100, state.happy + 5);
  updateBars();
  animatePet("playing");
  talk("مياااو! انتبهي لي ♡");
});

// Needs slowly change while the page is open.
setInterval(() => {
  state.food = Math.max(0, state.food - 1);
  state.energy = Math.max(0, state.energy - 0.5);
  if (state.food < 20) {
    state.happy = Math.max(0, state.happy - 1);
  }
  updateBars();
}, 15000);

updateBars();
