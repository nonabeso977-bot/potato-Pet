(() => {
  "use strict";
  const KEY = "orbitFleetPreview.v1";
  const $ = id => document.getElementById(id);
  const LIMIT = 100;
  const STAGES = [
    { at: 0, title: "هيكل المركبة", detail: "تم العثور على مركبة العودة. هيكلها متضرر وسجلاتها مشوشة." },
    { at: 20, title: "تثبيت الهيكل", detail: "عادت الدعامات الأساسية إلى مكانها. في سجل الصيانة إشارة إلى رحلة قديمة نحو الأرض." },
    { at: 50, title: "إعادة توزيع الطاقة", detail: "استعادت أنظمة الطاقة جزءاً من عملها. ظهر اسم المهمة القديمة: HOMEBOUND." },
    { at: 80, title: "تشغيل المحركات", detail: "بدأت المحركات تستجيب. آخر سجل محفوظ يقول: لا تتركوا أي مستكشف خلفكم." },
    { at: 100, title: "إشارة الأرض", detail: "التقطت المركبة إشارة زرقاء بعيدة. وجهة العودة مؤكدة: الأرض." }
  ];

  function read() {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) || "{}");
      return {
        points: Math.max(0, Math.min(LIMIT, Number(value.points) || 0)),
        crew: Array.isArray(value.crew) ? value.crew.filter(x => x && typeof x.name === "string").slice(0, 20) : []
      };
    } catch (_) {
      return { points: 0, crew: [] };
    }
  }

  let state = read();
  const currentStage = () => [...STAGES].reverse().find(stage => state.points >= stage.at) || STAGES[0];
  const escape = value => String(value).replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[ch]));

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {}
  }

  function render() {
    const fill = $("fleetProgressFill");
    const amount = $("fleetProgressAmount");
    const title = $("fleetStageTitle");
    const detail = $("fleetStageDetail");
    const crew = $("fleetCrewList");
    const story = $("fleetStoryLog");
    if (!fill || !amount || !title || !detail || !crew || !story) return;

    const stage = currentStage();
    fill.style.width = (state.points / LIMIT * 100) + "%";
    amount.textContent = state.points + " / " + LIMIT;
    title.textContent = stage.title;
    detail.textContent = stage.detail;

    if (!state.crew.length) {
      crew.innerHTML = '<p class="fleet-empty">لم تُسجّل مساهمات في هذه المعاينة بعد.</p>';
    } else {
      crew.innerHTML = state.crew.slice().sort((a, b) => b.points - a.points).slice(0, 5).map((pilot, index) =>
        '<div class="fleet-crew-row"><b>' + String(index + 1).padStart(2, "0") +
        '</b><span>' + escape(pilot.name) + '</span><strong>+' + pilot.points + '</strong></div>'
      ).join("");
    }

    story.innerHTML = STAGES.filter(item => item.at <= state.points).slice().reverse().map(item =>
      '<article class="fleet-log-entry"><small>RECOVERED LOG · ' + String(item.at).padStart(3, "0") +
      '</small><strong>' + escape(item.title) + '</strong><p>' + escape(item.detail) + '</p></article>'
    ).join("");

    const button = $("fleetContribute");
    if (button) {
      button.disabled = state.points >= LIMIT;
      button.textContent = state.points >= LIMIT ? "اكتملت معاينة الإصلاح" : "جرّبي المساهمة في الإصلاح +10";
    }
  }

  function contribute() {
    if (state.points >= LIMIT) return;
    let name = "مستكشف";
    try { name = (localStorage.getItem("orbitPilotName") || "مستكشف").trim().slice(0, 16) || "مستكشف"; } catch (_) {}
    state.points = Math.min(LIMIT, state.points + 10);
    const existing = state.crew.find(item => item.name === name);
    if (existing) existing.points += 10;
    else state.crew.push({ name, points: 10 });
    save();
    render();
  }

  const button = $("fleetContribute");
  if (button) button.addEventListener("click", contribute);
  const hangar = $("hangarButton");
  if (hangar) hangar.addEventListener("click", render);
  const finale = $("finaleScreen");
  if (finale && typeof MutationObserver !== "undefined") {
    new MutationObserver(() => {
      if (finale.hidden) return;
      const host = $("fleetFinalCrew");
      if (!host) return;
      host.textContent = state.crew.length
        ? "طاقم المعاينة: " + state.crew.map(item => item.name).join("، ")
        : "سيظهر سجل طاقم الإصلاح هنا بعد تفعيل المشروع الجماعي.";
    }).observe(finale, { attributes: true, attributeFilter: ["hidden"] });
  }

  render();
})();