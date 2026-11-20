(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const PROFILE_KEY = "orbitPilotProfile.preview.v1";
  const NAME_KEY = "orbitPilotName";

  function makeLocalId() {
    let token = "";
    try {
      if (window.crypto && typeof window.crypto.randomUUID === "function") {
        token = window.crypto.randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase();
      }
    } catch (_) {}
    if (!token) {
      const bytes = new Uint8Array(6);
      try {
        if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(bytes);
        else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
      } catch (_) {
        for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
      }
      token = Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
    }
    return "LOCAL-" + token;
  }

  function readProfile() {
    try {
      const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
      if (saved && typeof saved === "object" && typeof saved.id === "string" && /^LOCAL-[A-F0-9]{12}$/.test(saved.id)) {
        return { id: saved.id, name: typeof saved.name === "string" ? saved.name.slice(0, 16) : "" };
      }
    } catch (_) {}
    let name = "";
    try { name = (localStorage.getItem(NAME_KEY) || "").trim().slice(0, 16); } catch (_) {}
    const profile = { id: makeLocalId(), name };
    writeProfile(profile);
    return profile;
  }

  function writeProfile(profile) {
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch (_) {}
  }

  let profile = readProfile();
  const nameInput = $("profileUsername");
  const idOutput = $("profilePlayerId");
  const status = $("profileStatus");
  if (!nameInput || !idOutput || !status) return;

  nameInput.value = profile.name;
  idOutput.textContent = profile.id;

  $("saveProfileName").addEventListener("click", () => {
    const name = nameInput.value.trim().slice(0, 16);
    if (!name) {
      status.textContent = "اكتبي اسماً للاعب أولاً.";
      status.classList.add("error");
      nameInput.focus();
      return;
    }
    profile = { ...profile, name };
    writeProfile(profile);
    try { localStorage.setItem(NAME_KEY, name); } catch (_) {}
    const legacyName = $("pilotNameInput");
    if (legacyName) legacyName.value = name;
    status.classList.remove("error");
    status.textContent = "حُفظ الاسم على هذا الجهاز. لم يُنشأ حساب متصل بعد.";
    document.dispatchEvent(new CustomEvent("orbit:pilot-profile-updated", { detail: { name, id: profile.id } }));
  });

  $("copyProfileId").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(profile.id);
      status.classList.remove("error");
      status.textContent = "تم نسخ معرّف المعاينة المحلي.";
    } catch (_) {
      status.classList.add("error");
      status.textContent = "تعذّر النسخ تلقائياً. يمكنك تحديد المعرّف ونسخه يدوياً.";
    }
  });
})();