(() => {
  "use strict";
  const KEY = "orbitFleetPreview.v1", REPAIR_KEY = "orbitShipRepair.v1", PROGRESS_KEY = "orbitProgress.v1";
  const $ = id => document.getElementById(id), GROUP_TARGET = 5000, GROUP_STEP = 100;
  const STAGES = [
    { at: 0, title: "هيكل المركبة", detail: "تم العثور على مركبة العودة. هيكلها متضرر وسجلاتها مشوشة." },
    { at: 1000, title: "تثبيت الهيكل", detail: "عادت الدعامات الأساسية إلى مكانها. أصبحت المركبة أكثر ثباتًا." },
    { at: 2500, title: "إعادة توزيع الطاقة", detail: "استعادت أنظمة الطاقة جزءًا كبيرًا من عملها. اقترب تشغيل المحركات." },
    { at: 4000, title: "تشغيل المحركات", detail: "بدأت المحركات تستجيب. بقيت الخطوة الأخيرة قبل رحلة العودة." },
    { at: 5000, title: "إشارة الأرض", detail: "اكتمل الإصلاح الجماعي. المركبة جاهزة لمواصلة الرحلة نحو الأرض." }
  ];
  function read(key){try{const v=JSON.parse(localStorage.getItem(key)||"{}");return v&&typeof v==="object"?v:{};}catch(_){return{};}}
  function wallet(){const v=read(PROGRESS_KEY);return {...v,bank:Math.max(0,Math.floor(Number(v.bank)||0))};}
  function saveWallet(v){try{localStorage.setItem(PROGRESS_KEY,JSON.stringify(v));}catch(_){}window.dispatchEvent(new CustomEvent("orbit:wallet-updated",{detail:{bank:v.bank}}));}
  function readFleet(){const v=read(KEY);return{points:Math.max(0,Math.min(GROUP_TARGET,Math.floor(Number(v.points)||0))),crew:Array.isArray(v.crew)?v.crew.filter(x=>x&&typeof x.name==="string").slice(0,30):[]};}
  function readRepair(){const v=read(REPAIR_KEY);return{soloRepaired:!!v.soloRepaired,groupRepaired:!!v.groupRepaired};}
  let fleet=readFleet(),repair=readRepair(),mode="solo";
  const escape=v=>String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function saveFleet(){try{localStorage.setItem(KEY,JSON.stringify(fleet));}catch(_){}}
  function saveRepair(){try{localStorage.setItem(REPAIR_KEY,JSON.stringify(repair));}catch(_){}}
  function name(){try{return(localStorage.getItem("orbitPilotName")||"مستكشف").trim().slice(0,16)||"مستكشف";}catch(_){return"مستكشف";}}
  function render(){
    const fill=$("fleetProgressFill"),amount=$("fleetProgressAmount"),title=$("fleetStageTitle"),detail=$("fleetStageDetail"),crew=$("fleetCrewList"),story=$("fleetStoryLog");
    if(!fill||!amount||!title||!detail||!crew||!story)return;
    const stage=[...STAGES].reverse().find(x=>fleet.points>=x.at)||STAGES[0];
    const done=mode==="solo"?repair.soloRepaired:repair.groupRepaired,target=mode==="solo"?1000:GROUP_TARGET,current=mode==="solo"?(done?1000:0):fleet.points;
    fill.style.width=(current/target*100)+"%";amount.textContent=current.toLocaleString("en")+" / "+target.toLocaleString("en")+" ✦";
    title.textContent=mode==="solo"?(done?"إصلاح المركبة الفردية":"هيكل المركبة"):stage.title;
    detail.textContent=mode==="solo"?(done?"تم الإصلاح. أصبحت المركبة أقوى، مع فرصة إضافية وسرعة استجابة أعلى.":"إصلاح المركبة الفردية يرفع قوتها ويساعد على مواصلة المراحل."):(repair.groupRepaired?"اكتمل الإصلاح الجماعي. أصبحت المركبة المشتركة أقوى وجاهزة لمواصلة الرحلة.":stage.detail);
    const status=$("fleetRepairStatus");
    if(status)status.textContent=mode==="solo"?(done?"تم الإصلاح بالفعل. تمت إضافة فرصة إضافية وتحسين سرعة استجابة المركبة.":"تكلفة الإصلاح الفردي 1000 نجمة. بعد الإصلاح تحصل المركبة على فرصة إضافية واستجابة أسرع."):(repair.groupRepaired?"اكتمل الإصلاح الجماعي. المركبة المشتركة أصبحت أقوى.":"الهدف الجماعي 5000 نجمة. يمكن تقسيم المساهمة بين أعضاء الطاقم.");
    crew.innerHTML=fleet.crew.length?fleet.crew.slice().sort((a,b)=>b.points-a.points).slice(0,5).map((p,i)=>'<div class="fleet-crew-row"><b>'+String(i+1).padStart(2,"0")+'</b><span>'+escape(p.name)+'</span><strong>+'+p.points.toLocaleString("en")+' ✦</strong></div>').join(""):'<p class="fleet-empty">لا توجد مساهمات مسجلة بعد.</p>';
    story.innerHTML=STAGES.filter(x=>x.at<=fleet.points).slice().reverse().map(x=>'<article class="fleet-log-entry"><small>RECOVERED LOG · '+String(x.at).padStart(4,"0")+'</small><strong>'+escape(x.title)+'</strong><p>'+escape(x.detail)+'</p></article>').join("");
    document.querySelectorAll("[data-fleet-mode]").forEach(b=>b.classList.toggle("active",b.dataset.fleetMode===mode));
    const button=$("fleetContribute");if(button){button.disabled=done;button.textContent=done?"اكتمل الإصلاح":mode==="solo"?"إصلاح المركبة · 1000 ✦":"المساهمة في الإصلاح · 100 ✦";}
    const balance=$("starBalance");if(balance)balance.textContent=String(wallet().bank);
  }
  function contribute(){
    const w=wallet();
    if(mode==="solo"){
      if(repair.soloRepaired)return;
      if(w.bank<1000){$("fleetRepairStatus").textContent="الرصيد غير كافٍ. يلزم جمع "+(1000-w.bank)+" نجمة إضافية.";return;}
      w.bank-=1000;repair.soloRepaired=true;saveRepair();saveWallet(w);render();return;
    }
    if(repair.groupRepaired||fleet.points>=GROUP_TARGET)return;
    if(w.bank<GROUP_STEP){$("fleetRepairStatus").textContent="الرصيد غير كافٍ للمساهمة. يلزم 100 نجمة على الأقل.";return;}
    w.bank-=GROUP_STEP;fleet.points=Math.min(GROUP_TARGET,fleet.points+GROUP_STEP);
    const pilot=name(),existing=fleet.crew.find(x=>x.name===pilot);if(existing)existing.points+=GROUP_STEP;else fleet.crew.push({name:pilot,points:GROUP_STEP});
    if(fleet.points>=GROUP_TARGET){repair.groupRepaired=true;saveRepair();}
    saveFleet();saveWallet(w);render();
  }
  document.querySelectorAll("[data-fleet-mode]").forEach(b=>b.addEventListener("click",()=>{mode=b.dataset.fleetMode==="group"?"group":"solo";render();}));
  $("fleetContribute")?.addEventListener("click",contribute);
  $("hangarButton")?.addEventListener("click",render);
  const finale=$("finaleScreen");if(finale&&typeof MutationObserver!=="undefined")new MutationObserver(()=>{if(finale.hidden)return;const host=$("fleetFinalCrew");if(host)host.textContent=fleet.crew.length?"طاقم المعاينة: "+fleet.crew.map(x=>x.name).join("، "):"سجل طاقم الإصلاح سيظهر بعد تفعيل اللعب الجماعي.";}).observe(finale,{attributes:true,attributeFilter:["hidden"]});
  render();
})();