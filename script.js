const SAVE_KEY = "potatoPetSave_v2";
const today = () => new Date().toLocaleDateString("en-CA");

const freshState = () => ({
  food: 76, happy: 72, energy: 82, coins: 20, xp: 0, level: 1,
  room: "lounge", skin: "skin-blue", accessory: "",
  inventory: {}, quests: { feed: 0, play: 0, pet: 0 }, questPaid: [],
  rewardDate: "", lastTick: Date.now()
});

let state = freshState();
try {
  const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
  if (saved && typeof saved === "object") {
    state = { ...freshState(), ...saved };
    state.inventory = saved.inventory && typeof saved.inventory === "object" ? saved.inventory : {};
    state.quests = saved.quests && saved.questDate === today() ? saved.quests : { feed: 0, play: 0, pet: 0 };
    state.questPaid = saved.questDate === today() && Array.isArray(saved.questPaid) ? saved.questPaid : [];
    if (saved.questDate !== today()) state.questDate = today();
  }
} catch (error) {
  console.warn("تعذر تحميل الحفظ السابق:", error);
}

const $ = id => document.getElementById(id);
const pet = $("pet");
const room = $("room");
const speech = $("speech");
const toastBox = $("toast");
const modalBackdrop = $("modalBackdrop");
const modalTitle = $("modalTitle");
const modalContent = $("modalContent");

const rooms = {
  lounge: { name: "غرفة الجلوس", icon: "🛋️", action: "pet", button: "داعبي لوزة ♡", welcome: "تعالي نجلس معًا قليلًا.", hint: "اضغطي على لوزة لتسمعي خرخرتها" },
  kitchen: { name: "المطبخ", icon: "🍳", action: "feed", button: "قدّمي لها وجبة 🍎", welcome: "مياو! هل أحضرتِ شيئًا لذيذًا؟", hint: "لوزة تنتظر وجبتها" },
  playroom: { name: "غرفة اللعب", icon: "🧸", action: "play", button: "ابدئي اللعب 🧶", welcome: "أحضرتِ الخيط؟ هيا نلعب!", hint: "اللعب يرفع السعادة ويستهلك الطاقة" },
  bedroom: { name: "غرفة النوم", icon: "🛏️", action: "sleep", button: "وقت الراحة ☾", welcome: "بدأ النعاس… أريد سريري.", hint: "الراحة تعيد طاقة لوزة" }
};

const items = {
  fish: { name: "سمكة طازجة", icon: "🐟", price: 8, description: "ترفع الشبع 30 نقطة.", type: "food", amount: 30 },
  milk: { name: "وعاء حليب", icon: "🥛", price: 6, description: "وجبة خفيفة ترفع الشبع 20 نقطة.", type: "food", amount: 20 },
  yarn: { name: "كرة خيط", icon: "🧶", price: 12, description: "لعبة جديدة ترفع السعادة 25 نقطة.", type: "toy", amount: 25 },
  hat: { name: "قبعة وردية", icon: "🎩", price: 25, description: "زينة لطيفة تلبسها لوزة.", type: "accessory" },
  bow: { name: "ربطة لطيفة", icon: "🎀", price: 22, description: "ربطة شعر وردية للوزة.", type: "accessory" },
  star: { name: "نجمة ذهبية", icon: "⭐", price: 30, description: "نجمة صغيرة تزين رأس لوزة.", type: "accessory" }
};

const skins = ["skin-blue", "skin-cream", "skin-orange", "skin-lilac"];
let toastTimer;
let speechTimer;
let saveTimer;
let butterflyTimer = null;
let butterflyActive = false;
let butterflySeconds = 12;
let butterflyScore = 0;

function saveGame() {
  state.lastTick = Date.now();
  state.questDate = today();
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    $("saveStatus").textContent = "تم الحفظ ✓";
  } catch (error) {
    $("saveStatus").textContent = "تعذر الحفظ";
  }
}

function showToast(message) {
  toastBox.textContent = message;
  toastBox.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastBox.classList.remove("show"), 2300);
}

function talk(message) {
  speech.textContent = message;
  speech.classList.remove("hide");
  clearTimeout(speechTimer);
  speechTimer = setTimeout(() => speech.classList.add("hide"), 3000);
}

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function xpNeeded() {
  return 50 + (state.level - 1) * 20;
}

function addXP(amount) {
  state.xp += amount;
  let leveled = false;
  while (state.xp >= xpNeeded()) {
    state.xp -= xpNeeded();
    state.level += 1;
    state.coins += 10;
    leveled = true;
  }
  if (leveled) {
    showToast("وصلتِ للمستوى " + state.level + "! +10 عملات ✨");
    talk("أنا فخورة بكِ! صرنا مستوى " + state.level + " ♡");
  }
}

function updateUI() {
  $("foodBar").style.width = state.food + "%";
  $("happyBar").style.width = state.happy + "%";
  $("energyBar").style.width = state.energy + "%";
  $("foodValue").textContent = state.food + "%";
  $("happyValue").textContent = state.happy + "%";
  $("energyValue").textContent = state.energy + "%";
  $("coins").textContent = state.coins;
  $("level").textContent = state.level;
  $("xpText").textContent = state.xp;
  $("xpNeeded").textContent = xpNeeded();
  $("xpBar").style.width = (state.xp / xpNeeded() * 100) + "%";
  $("levelTitle").textContent = state.level < 3 ? "مبتدئة العناية" : state.level < 6 ? "صديقة الحيوانات" : state.level < 10 ? "خبيرة لوزة" : "أسطورة القطط";
  const bagCount = Object.values(state.inventory).reduce((sum, count) => sum + count, 0);
  $("bagCount").textContent = bagCount;
  $("rewardButton").classList.toggle("claimed", state.rewardDate === today());
  $("rewardButton").innerHTML = state.rewardDate === today() ? "<span>✓</span> استلمتِ الهدية" : "<span>🎁</span> هدية اليوم";
  pet.classList.remove(...skins);
  pet.classList.add(state.skin);
  $("accessory").className = "accessory" + (state.accessory ? " " + state.accessory : "");
  $("zzz").setAttribute("aria-hidden", state.room !== "bedroom" ? "true" : "false");
  renderQuests();
}

function renderQuests() {
  const questData = [
    { key: "feed", icon: "🍎", label: "أطعمي لوزة مرة", goal: 1 },
    { key: "play", icon: "🧶", label: "العبي معها مرة", goal: 1 },
    { key: "pet", icon: "♡", label: "دلّليها مرتين", goal: 2 }
  ];
  $("questList").innerHTML = questData.map(q => {
    const count = Math.min(state.quests[q.key] || 0, q.goal);
    const done = count >= q.goal;
    return '<div class="quest ' + (done ? "done" : "") + '"><span>' + q.icon + '</span><span>' + q.label + '</span><b>' + count + "/" + q.goal + (done ? " ✓" : "") + '</b></div>';
  }).join("");
}

function completeQuest(key) {
  const goals = { feed: 1, play: 1, pet: 2 };
  const rewards = { feed: 12, play: 12, pet: 12 };
  state.quests[key] = Math.min(goals[key], (state.quests[key] || 0) + 1);
  if (state.quests[key] >= goals[key] && !state.questPaid.includes(key)) {
    state.questPaid.push(key);
    state.coins += rewards[key];
    addXP(15);
    showToast("اكتملت المهمة! +12 عملة و+15 XP");
  }
}

function animatePet(kind) {
  pet.classList.remove("playing", "sleeping");
  room.classList.toggle("sleep-mode", kind === "sleeping");
  void pet.offsetWidth;
  if (kind) pet.classList.add(kind);
}

function goToRoom(id) {
  const next = rooms[id];
  if (!next) return;
  state.room = id;
  room.classList.remove("room-lounge", "room-kitchen", "room-playroom", "room-bedroom");
  room.classList.add("room-" + id);
  $("roomName").textContent = next.name;
  $("roomProp").textContent = next.icon;
  $("roomAction").textContent = next.button;
  $("roomHint").textContent = next.hint;
  $("weatherChip").textContent = id === "bedroom" ? "🌙 وقت الهدوء" : id === "playroom" ? "🎈 وقت المرح" : id === "kitchen" ? "🍓 وقت الوجبة" : "☀️ نهار لطيف";
  document.querySelectorAll("[data-room]").forEach(button => {
    const active = button.dataset.room === id;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  animatePet("");
  talk(next.welcome);
  saveGame();
}

function changeLook() {
  const current = skins.indexOf(state.skin);
  state.skin = skins[(current + 1) % skins.length];
  updateUI();
  talk("كيف صار لوني الجديد؟ ✿");
  saveGame();
}

function addCoins(amount) {
  state.coins += amount;
}

function performRoomAction() {
  const action = rooms[state.room].action;
  if (action === "feed") {
    if (state.food >= 96) return talk("أنا شبعانة جدًا، شكرًا ♡");
    state.food = clamp(state.food + 24);
    state.happy = clamp(state.happy + 4);
    addCoins(2); addXP(5); completeQuest("feed");
    animatePet("playing");
    talk("مممم… وجبة لذيذة! شكرًا ♡");
  } else if (action === "play") {
    if (state.energy < 18) return talk("طاقتي خلصت تقريبًا… أحتاج راحة ☾");
    state.happy = clamp(state.happy + 19);
    state.energy = clamp(state.energy - 16);
    state.food = clamp(state.food - 7);
    addCoins(3); addXP(8); completeQuest("play");
    animatePet("playing");
    talk("يا لها من لعبة ممتعة! مرة ثانية!");
  } else if (action === "sleep") {
    if (state.energy >= 96) return talk("أنا مرتاحة ومليانة طاقة!");
    state.energy = clamp(state.energy + 28);
    state.happy = clamp(state.happy + 3);
    addXP(4);
    animatePet("sleeping");
    talk("تصبحين على خير… ززز");
  } else {
    state.happy = clamp(state.happy + 12);
    addCoins(1); addXP(3); completeQuest("pet");
    animatePet("playing");
    talk("خرخرةةة… أحب المداعبة ♡");
  }
  updateUI();
  saveGame();
}

function petTap() {
  if (state.room === "bedroom" && pet.classList.contains("sleeping")) {
    talk("ششش… لوزة نائمة الآن ☾");
    return;
  }
  state.happy = clamp(state.happy + 5);
  addXP(1);
  completeQuest("pet");
  animatePet("playing");
  updateUI();
  talk(["مياااو! انتبهي لي ♡", "خررر… هذا لطيف!", "أحب لما تلعبين معي!", "نونو! مرة ثانية!"][Math.floor(Math.random() * 4)]);
  saveGame();
}

function openModal(title, html) {
  modalTitle.textContent = title;
  modalContent.innerHTML = html;
  modalBackdrop.hidden = false;
  $("closeModal").focus();
}

function closeModal() {
  modalBackdrop.hidden = true;
  if (butterflyTimer) clearInterval(butterflyTimer);
  butterflyTimer = null;
  butterflyActive = false;
}

function openShop() {
  const html = '<div class="shop-grid">' + Object.entries(items).map(([id, item]) => {
    const owned = state.inventory[id] || 0;
    const equipped = state.accessory === id;
    return '<article class="shop-item"><div class="item-art">' + item.icon + '</div><h3>' + item.name + '</h3><p>' + item.description + '</p><div class="item-price"><span>✦ ' + item.price + '</span><span>' + (owned ? "لديكِ " + owned : "") + '</span></div><button class="item-buy" data-buy="' + id + '" ' + (state.coins < item.price || equipped ? "disabled" : "") + '>' + (equipped ? "تُلبسها لوزة" : "شراء") + '</button></article>';
  }).join("") + '</div>';
  openModal("متجر لوزة", html);
}

function openBag() {
  const owned = Object.entries(state.inventory).filter(([, count]) => count > 0);
  if (!owned.length && !state.accessory) {
    openModal("حقيبة لوزة", '<div class="empty-state"><span>🎒</span>الحقيبة فارغة حاليًا.<br>زوري المتجر وأحضري شيئًا للوزة!</div>');
    return;
  }
  let html = '<div class="bag-grid">' + owned.map(([id, count]) => {
    const item = items[id];
    const isAccessory = item.type === "accessory";
    return '<article class="bag-item"><div class="item-art">' + item.icon + '</div><h3>' + item.name + '</h3><p>' + item.description + '<br>الكمية: ' + count + '</p><button class="use-item" data-use="' + id + '">' + (isAccessory ? "ارتديها" : "استخدمي") + '</button></article>';
  }).join("") + '</div>';
  if (state.accessory) html += '<button class="settings-action" data-remove-accessory="true" style="margin-top:10px">إزالة الزينة الحالية</button>';
  openModal("حقيبة لوزة", html);
}

function buyItem(id) {
  const item = items[id];
  if (!item || state.coins < item.price) return showToast("عملاتك لا تكفي لهذه القطعة.");
  if (item.type === "accessory" && state.accessory === id) return;
  state.coins -= item.price;
  state.inventory[id] = (state.inventory[id] || 0) + 1;
  updateUI(); saveGame(); openShop();
  showToast("أضفتِ " + item.name + " إلى الحقيبة!");
}

function useItem(id) {
  const item = items[id];
  if (!item || !state.inventory[id]) return;
  if (item.type === "food") {
    if (state.food >= 98) return showToast("لوزة شبعانة، احتفظي بها لوقت لاحق.");
    state.food = clamp(state.food + item.amount);
    talk("يا سلام! أحب هذا الطعام 🐟");
  } else if (item.type === "toy") {
    if (state.energy < 12) return showToast("لوزة متعبة وتحتاج إلى النوم.");
    state.happy = clamp(state.happy + item.amount);
    state.energy = clamp(state.energy - 7);
    talk("هذه لعبتي الجديدة! لنلعب!");
    animatePet("playing");
  } else if (item.type === "accessory") {
    state.accessory = id === "hat" ? "hat" : id;
    talk("كيف أبدو بهذه الزينة؟ ✨");
  }
  state.inventory[id] -= 1;
  if (!state.inventory[id]) delete state.inventory[id];
  addXP(4);
  updateUI(); saveGame(); openBag();
}


function openButterflyGame() {
  openModal("صيد الفراشات", '<div class="game-intro"><span class="game-hero">🦋</span><h3>لعبة لوزة الصغيرة</h3><p>التقطي أكبر عدد من الفراشات خلال 12 ثانية. كل فراشة تمنحك عملات وخبرة!</p><div class="game-rule">⏱️ 12 ثانية · ✦ عملات · XP خبرة</div><button class="game-start" data-start-game="true" type="button">ابدئي اللعب</button></div>');
}

function moveButterfly() {
  const target = modalContent.querySelector("[data-catch-butterfly]");
  if (!target) return;
  target.style.left = (8 + Math.random() * 78) + "%";
  target.style.top = (8 + Math.random() * 66) + "%";
  target.style.transform = "rotate(" + Math.round(Math.random() * 30 - 15) + "deg)";
}

function startButterflyRound() {
  if (butterflyTimer) clearInterval(butterflyTimer);
  butterflyActive = true;
  butterflySeconds = 12;
  butterflyScore = 0;
  modalContent.innerHTML = '<div class="game-stats"><span>الوقت: <b id="gameTime">12</b></span><span>الفراشات: <b id="gameScore">0</b></span></div><div class="game-arena"><span class="game-flower flower-one">✿</span><span class="game-flower flower-two">✿</span><button class="butterfly-target" data-catch-butterfly="true" type="button" aria-label="التقطي الفراشة">🦋</button></div><p class="game-help">المسي الفراشة كلما ظهرت في مكان جديد!</p>';
  moveButterfly();
  butterflyTimer = setInterval(() => {
    butterflySeconds -= 1;
    const timeLabel = $("gameTime");
    if (timeLabel) timeLabel.textContent = butterflySeconds;
    if (butterflySeconds <= 0) finishButterflyRound();
  }, 1000);
}

function finishButterflyRound() {
  if (butterflyTimer) clearInterval(butterflyTimer);
  butterflyTimer = null;
  butterflyActive = false;
  const reward = 3 + butterflyScore * 2;
  state.coins += reward;
  addXP(Math.min(12, butterflyScore));
  updateUI();
  saveGame();
  talk("كانت مطاردة ممتعة! 🦋");
  modalContent.innerHTML = '<div class="game-result"><span>🏆</span><h3>انتهى التحدي!</h3><p>التقطتِ <b>' + butterflyScore + '</b> فراشة</p><div class="game-prize">✦ +' + reward + ' عملة · +' + Math.min(12, butterflyScore) + ' XP</div><button class="game-start" data-start-game="true" type="button">العبِي مرة أخرى</button></div>';
}

function claimDailyReward() {
  if (state.rewardDate === today()) return showToast("هدية اليوم استلمتيها بالفعل. عودي غدًا!");
  state.rewardDate = today();
  state.coins += 15;
  addXP(10);
  updateUI(); saveGame();
  talk("هدية؟ لي أنا؟ شكرًااا! ♡");
  showToast("هدية اليوم: +15 عملة و+10 XP 🎁");
}

function openSettings() {
  openModal("إعدادات اللعبة", '<div class="settings-list"><button class="settings-action" data-change-look="true">🎨 تغيير لون لوزة</button><button class="settings-action" data-go-home="true">⌂ العودة لغرفة الجلوس</button><button class="settings-action" data-reset="true">↻ بدء لعبة جديدة ومسح الحفظ</button></div><p class="settings-note">تُحفظ العملات والمستوى والحقيبة وحالة لوزة تلقائيًا على هذا المتصفح في هذا الجهاز.</p>');
}

function applyOfflineTime() {
  const elapsed = Math.max(0, Math.min(4 * 60 * 60, Date.now() - (state.lastTick || Date.now())));
  const minutes = elapsed / 60000;
  state.food = clamp(state.food - minutes * 0.35);
  state.energy = clamp(state.energy - minutes * 0.2);
  if (state.food < 20) state.happy = clamp(state.happy - minutes * 0.12);
}

document.querySelectorAll("[data-room]").forEach(button => button.addEventListener("click", () => goToRoom(button.dataset.room)));
$("roomAction").addEventListener("click", performRoomAction);
pet.addEventListener("click", petTap);
$("shopButton").addEventListener("click", openShop);
$("bagButton").addEventListener("click", openBag);
$("rewardButton").addEventListener("click", claimDailyReward);
$("butterflyButton").addEventListener("click", openButterflyGame);
$("settingsButton").addEventListener("click", openSettings);
$("closeModal").addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", event => { if (event.target === modalBackdrop) closeModal(); });
document.addEventListener("keydown", event => { if (event.key === "Escape" && !modalBackdrop.hidden) closeModal(); });
modalContent.addEventListener("click", event => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.startGame) startButterflyRound();
  if (button.dataset.catchButterfly && butterflyActive) { butterflyScore += 1; const score = $("gameScore"); if (score) score.textContent = butterflyScore; moveButterfly(); }
  if (button.dataset.buy) buyItem(button.dataset.buy);
  if (button.dataset.use) useItem(button.dataset.use);
  if (button.dataset.removeAccessory) { state.accessory = ""; updateUI(); saveGame(); openBag(); showToast("أزلنا الزينة."); }
  if (button.dataset.changeLook) { changeLook(); closeModal(); }
  if (button.dataset.goHome) { goToRoom("lounge"); closeModal(); }
  if (button.dataset.reset && confirm("هل أنتِ متأكدة؟ سيُمسح تقدم Potato Pet من هذا المتصفح.")) {
    localStorage.removeItem(SAVE_KEY);
    state = freshState();
    updateUI(); goToRoom("lounge"); closeModal();
    showToast("بدأت مغامرة جديدة مع لوزة!");
  }
});

applyOfflineTime();
updateUI();
goToRoom(rooms[state.room] ? state.room : "lounge");
setInterval(() => {
  state.food = clamp(state.food - 0.35);
  state.energy = clamp(state.energy - (state.room === "bedroom" ? -0.25 : 0.2));
  if (state.food < 20) state.happy = clamp(state.happy - 0.2);
  updateUI();
  saveGame();
}, 60000);
window.addEventListener("beforeunload", saveGame);
saveGame();
