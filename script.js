(() => {
"use strict";
const $ = id => document.getElementById(id);
const canvas=$("arena"),ctx=canvas.getContext("2d");
const SAVE="orbitArcade.v2";
const ATLAS_SAVE="orbitAtlas.v1";
const RECORDS_SAVE="orbitRecords.v1";
const SKIN_SAVE="orbitSkin.v1";
const SKINS=[{id:"nova",name:"نوفا",main:"#f0ffff",edge:"#76e4e4",glow:"#76e4e4",cost:0},{id:"coral",name:"مرجان",main:"#fff0f3",edge:"#ff8eaa",glow:"#ff8eaa",cost:0},{id:"nebula",name:"سديم",main:"#f4eaff",edge:"#b99aff",glow:"#b99aff",cost:0},{id:"solar",name:"شمسي",main:"#fff4c9",edge:"#ffc85c",glow:"#ffc85c",cost:0},{id:"aurora",name:"الشفق",main:"#eafff7",edge:"#54e6bd",glow:"#8affd2",cost:180},{id:"eclipse",name:"كسوف",main:"#f4e9ff",edge:"#8b6cff",glow:"#c39aff",cost:300},{id:"comet",name:"مذنب",main:"#fff1dc",edge:"#ffad63",glow:"#ffd078",cost:450},{id:"deepblue",name:"عمق أزرق",main:"#e7f2ff",edge:"#4d8dff",glow:"#74caff",cost:600}];
const ACHIEVEMENTS=[
 {id:"first-flight",icon:"🚀",name:"أول إقلاع",desc:"ابدئي رحلتك الأولى."},
 {id:"first-star",icon:"✦",name:"جامع الضوء",desc:"التقطي أول نجمة."},
 {id:"mission-20",icon:"◎",name:"مهمة مكتملة",desc:"اجمعي 20 نجمة في رحلة واحدة."},
 {id:"first-discovery",icon:"⌕",name:"فضول كوني",desc:"افتحي أول معلومة في دفتر الاكتشافات."},
 {id:"minute-survivor",icon:"◷",name:"دقيقة في المدار",desc:"استمري في رحلة واحدة لمدة 60 ثانية."},
 {id:"hundred-stars",icon:"✧",name:"مطر النجوم",desc:"اجمعي 100 نجمة عبر جميع الرحلات."},
 {id:"all-sectors",icon:"◉",name:"رحّالة المجرة",desc:"زوري المناطق الفضائية الأربع."},
 {id:"atlas-master",icon:"✧",name:"موسوعة مكتملة",desc:"اجمعي الاكتشافات الفضائية الستة عشر كلها."}
];
const STAGES=[{name:"مدار الأرض",hint:"نجوم زرقاء وهواء هادئ",bg:"#10264a",glow:"#275b83",rock:"#63829b"},{name:"سهول المريخ",hint:"غبار أحمر وصخور أكثر",bg:"#3a1d2a",glow:"#a34c45",rock:"#bd7864"},{name:"حلقات زحل",hint:"غبار ذهبي وحلقات لامعة",bg:"#352b20",glow:"#a17a42",rock:"#b89a6c"},{name:"حافة السديم",hint:"سحب بنفسجية وثقوب سوداء",bg:"#251b45",glow:"#7654a8",rock:"#8c79b7"}];
const MISSIONS=[
 {id:"stars",title:"اجمعي 20 نجمة",target:20,unit:"نجمة",reward:150,starReward:15},
 {id:"survive",title:"ابقي 45 ثانية في المدار",target:45,unit:"ث",reward:180,starReward:18},
 {id:"near",title:"ناوري الصخور عن قرب",target:4,unit:"/ 4",reward:200,starReward:20},
 {id:"sector",title:"اكتشفي منطقة جديدة",target:1,unit:"/ 1",reward:180,starReward:18},
 {id:"mars",title:"وصلي إلى سهول المريخ",target:1,unit:"/ 1",reward:220,starReward:22},
 {id:"saturn",title:"زوري حلقات زحل",target:1,unit:"/ 1",reward:260,starReward:26}
];
const PROGRESS_SAVE="orbitProgress.v1";
const clampLevel=n=>Number.isInteger(n)?Math.max(0,Math.min(3,n)):0;
const safeReadProgress=()=>{
 try{
  const v=JSON.parse(localStorage.getItem(PROGRESS_SAVE)||"{}");
  return {stars:Number.isFinite(v.stars)?Math.max(0,v.stars):0,bank:Number.isFinite(v.bank)?Math.max(0,v.bank):(Number.isFinite(v.stars)?Math.max(0,v.stars):0),ownedSkins:Array.isArray(v.ownedSkins)?[...new Set(v.ownedSkins.filter(id=>SKINS.some(s=>s.id===id)))]:SKINS.filter(s=>!s.cost).map(s=>s.id),sectors:Array.isArray(v.sectors)?[...new Set(v.sectors.filter(n=>Number.isInteger(n)&&n>=0&&n<STAGES.length))]:[],unlocked:Array.isArray(v.unlocked)?[...new Set(v.unlocked.filter(id=>ACHIEVEMENTS.some(a=>a.id===id)))]:[],upgrades:{engine:clampLevel(v.upgrades?.engine),shield:clampLevel(v.upgrades?.shield),magnet:clampLevel(v.upgrades?.magnet)},secrets:Array.isArray(v.secrets)?[...new Set(v.secrets.filter(id=>["aurora","eclipse","supernova","meteor"].includes(id)))]:[],stats:{runs:Math.max(0,Number(v.stats?.runs)||0),totalScore:Math.max(0,Number(v.stats?.totalScore)||0),longest:Math.max(0,Number(v.stats?.longest)||0),blackHoles:Math.max(0,Number(v.stats?.blackHoles)||0),missions:Math.max(0,Number(v.stats?.missions)||0),stars:Math.max(0,Number(v.stats?.stars)||0)}};
 }catch(_){return{stars:0,bank:0,ownedSkins:SKINS.filter(s=>!s.cost).map(s=>s.id),sectors:[],unlocked:[],upgrades:{engine:0,shield:0,magnet:0},secrets:[],stats:{runs:0,totalScore:0,longest:0,blackHoles:0,missions:0,stars:0}};}
};
let progress=safeReadProgress(),survivedMinute=false,activeEvent=null,nextEventAt=32,eventSpawnClock=0,runStatsSaved=false,runBlackHoles=0;
let selectedMission=MISSIONS[0],lastMissionId="",nearMisses=0,starMilestoneAwarded=false,missionDone=false,missionShownProgress=-1,timeDilation=1,lastMusicDilation=1;
let selectedSkin=(()=>{try{const saved=localStorage.getItem(SKIN_SAVE)||"nova";return SKINS.some(s=>s.id===saved&&(!s.cost||progress.ownedSkins.includes(s.id)))?saved:"nova";}catch(_){return"nova";}})();
let records=(()=>{try{const v=JSON.parse(localStorage.getItem(RECORDS_SAVE)||"[]");return Array.isArray(v)?v.filter(x=>x&&typeof x.name==="string"&&Number.isFinite(x.score)).sort((a,b)=>b.score-a.score).slice(0,10):[];}catch(_){return[];}})();
const FACTS=[
 {tag:"THE SUN",title:"ثماني دقائق من الماضي",body:"ضوء الشمس يحتاج نحو 8 دقائق و20 ثانية ليصل إلى الأرض. عندما تنظرين إليها، فأنت ترينها كما كانت قبل دقائق."},
 {tag:"VENUS",title:"يوم أطول من سنة",body:"الزهرة يدور حول محوره في نحو 243 يومًا أرضيًا، بينما يكمل دورته حول الشمس في نحو 225 يومًا."},
 {tag:"MARS",title:"غروب أزرق",body:"بسبب طريقة تشتت الضوء في غلافه الجوي المغبر، يظهر الغروب على المريخ بلون أزرق قرب قرص الشمس."},
 {tag:"EUROPA",title:"محيط تحت الجليد",body:"تشير الأدلة إلى أن قمر المشتري أوروبا يخفي محيطًا مالحًا واسعًا تحت قشرته الجليدية."},
 {tag:"SATURN",title:"حلقات من الجليد",body:"حلقات زحل تتكون أساسًا من جليد مائي، مع كميات أقل من المواد الصخرية والغبار."},
 {tag:"THE MOON",title:"القمر يبتعد ببطء",body:"القمر يبتعد عن الأرض بمعدل يقارب 3.8 سنتيمتر كل سنة، وقد قيس ذلك باستخدام عواكس الليزر."},
 {tag:"BLACK HOLE",title:"لا شيء يفلت من الأفق",body:"الثقب الأسود مكان تسحب جاذبيته بقوة كبيرة. إذا تجاوز الضوء حدًا حوله، فلن يستطيع الخروج. لكنه لا يسحب كل شيء من بعيد."},
 {tag:"JUPITER",title:"عملاق له عواصف",body:"المشتري أكبر كواكب مجموعتنا الشمسية. فيه عاصفة ضخمة اسمها البقعة الحمراء العظيمة، وهي مستمرة منذ زمن طويل."},
 {tag:"MERCURY",title:"سنة سريعة",body:"عطارد أقرب كوكب إلى الشمس. يكمل دورة حولها في 88 يومًا من أيام الأرض."},
 {tag:"NEUTRON STAR",title:"نجمة شديدة الكثافة",body:"النجم النيوتروني صغير جدًا مقارنة بالشمس، لكن مادته مضغوطة بشكل هائل. ملعقة صغيرة من مادته ستكون ثقيلة بصورة لا نتخيلها."},
 {tag:"MILKY WAY",title:"بيتنا في الفضاء",body:"الشمس والأرض جزء من مجرة درب التبانة، وهي تجمع هائل من النجوم والغاز والغبار."},
 {tag:"LIGHT YEAR",title:"السنة الضوئية مسافة",body:"السنة الضوئية ليست وقتًا، بل مسافة يقطعها الضوء خلال سنة كاملة: نحو 9.46 تريليون كيلومتر."},
 {tag:"COMET",title:"ذيل لا يسبق المذنب",body:"عندما يقترب المذنب من الشمس، يسخن الجليد فيه ويخرج منه غاز وغبار. لذلك يظهر له ذيل يتجه بعيدًا عن الشمس."},
 {tag:"EXOPLANET",title:"عوالم حول نجوم أخرى",body:"الكواكب الخارجية تدور حول نجوم غير الشمس. اكتشف العلماء آلافًا منها، وبعضها قد تكون لديه ظروف مناسبة للماء."},
 {tag:"URANUS",title:"كوكب يدور على جانبه",body:"يميل محور أورانوس كثيرًا، لذلك يبدو كأنه يتدحرج حول الشمس بدل أن يدور مثل معظم الكواكب."},
 {tag:"PLUTO",title:"عالم جليدي صغير",body:"بلوتو كوكب قزم بعيد، ويحتاج نحو 248 سنة أرضية ليكمل دورة واحدة حول الشمس."}
];
const safeReadAtlas=()=>{try{const v=JSON.parse(localStorage.getItem(ATLAS_SAVE)||"[]");return Array.isArray(v)?[...new Set(v.filter(n=>Number.isInteger(n)&&n>=0&&n<FACTS.length))]:[];}catch(_){return[];}};
const safeSaveAtlas=()=>{try{localStorage.setItem(ATLAS_SAVE,JSON.stringify(discovered));}catch(_){}};
const safeReadBest=()=>{try{return Number(localStorage.getItem(SAVE)||localStorage.getItem("orbitArcade.v1")||0)||0;}catch(_){return 0;}};
const safeSaveBest=value=>{try{localStorage.setItem(SAVE,String(value));}catch(_){}};
let best=safeReadBest(),discovered=safeReadAtlas(),score=0,lives=3,level=1,combo=1,comboTime=0;
let state="menu",last=0,elapsed=0,spawnClock=0,stars=[],rocks=[],blackHoles=[],pickups=[],artifacts=[],particles=[],backgroundStars=[];
let discoveryToastTime=0,stageIndex=0,firstRockPending=false;
let shieldTime=0,magnetTime=0,collected=0,shake=0;
let width=0,height=0,dpr=1,player={x:0,y:0,targetX:0,targetY:0,r:13,invulnerable:0};
let pointerDown=false,muted=false,audio=null,runId=0,musicOn=false,musicNodes=[],musicTimer=null;
const rand=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function format(n){return String(Math.floor(n)).padStart(6,"0")}
function setBest(){ $("best").textContent=format(best);$("menuBest").textContent=format(best); }
function updateAtlasButton(){
 const count=discovered.length;
 $("atlasCount").textContent=count+" / "+FACTS.length;
 $("atlasProgressText").textContent=count+" من "+FACTS.length+" اكتشافات";
 $("atlasProgressFill").style.width=(count/FACTS.length*100)+"%";
}
function renderAtlas(){
 $("atlasGrid").innerHTML=FACTS.map((fact,index)=>{
   const unlocked=discovered.includes(index);
   return '<article class="atlas-entry '+(unlocked?"unlocked":"locked")+'"><span>'+(unlocked?"✦":"?")+'</span><div><small>'+fact.tag+'</small><strong>'+(unlocked?fact.title:"إشارة غير مكتشفة")+'</strong><p>'+(unlocked?fact.body:"التقطي شارة بيانات أثناء الرحلة لفتح هذه المعلومة.")+'</p></div></article>';
 }).join("");
 updateAtlasButton();
}
function openAtlas(){renderAtlas();$("atlasModal").hidden=false;}
function saveRecords(){try{localStorage.setItem(RECORDS_SAVE,JSON.stringify(records));}catch(_){}}
function saveProgress(){try{localStorage.setItem(PROGRESS_SAVE,JSON.stringify(progress));}catch(_){}}
function renderAchievements(){
 const host=$("achievementGrid"),count=progress.unlocked.length;
 $("achievementSummary").textContent=count+" من "+ACHIEVEMENTS.length+" إنجازات مفتوحة";
 host.innerHTML=ACHIEVEMENTS.map(a=>{
  const unlocked=progress.unlocked.includes(a.id);
  return '<article class="achievement-card '+(unlocked?"unlocked":"locked")+'"><span class="achievement-icon">'+(unlocked?a.icon:"?")+'</span><div class="achievement-copy"><strong>'+a.name+'</strong><p>'+a.desc+'</p><small class="achievement-state">'+(unlocked?"تم فتح الإنجاز":"لم يُفتح بعد")+'</small></div></article>';
 }).join("");
}
function awardAchievement(id){
 if(progress.unlocked.includes(id))return;
 progress.unlocked.push(id);saveProgress();
 const achievement=ACHIEVEMENTS.find(a=>a.id===id);
 if(achievement){sound(880,.13,"triangle");}
}
function markSector(index){
 if(!progress.sectors.includes(index)){
  progress.sectors.push(index);saveProgress();
  if(progress.sectors.length===STAGES.length)awardAchievement("all-sectors");
 }
}
function addLifetimeStar(){
 progress.stars++;progress.bank++;progress.stats.stars++;saveProgress();
 if(progress.stars>=100)awardAchievement("hundred-stars");
}
function renderRecords(){
 const host=$("recordsList");
 if(!records.length){host.innerHTML="<p class=\"empty-records\">لا توجد رحلات مسجلة بعد. ابدئي أول محاولة واصنعي رقمك!</p>";return;}
 host.innerHTML=records.map((r,i)=>{
   const date=Number.isFinite(r.when)?new Date(r.when).toLocaleDateString("ar",{day:"numeric",month:"short"}):"رحلة سابقة";
   const rankClass=i===0?"leader-first":i===1?"leader-second":i===2?"leader-third":"";
   return "<div class=\"record-row "+rankClass+"\"><b>"+String(i+1).padStart(2,"0")+"</b><span class=\"record-player\"><strong>"+escapeText(r.name)+"</strong><small>"+date+"</small></span><strong>"+format(r.score)+"</strong></div>";
 }).join("");
}
function escapeText(value){return value.replace(/[&<>\"]/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[ch]));}
const UPGRADE_DEFS=[
 {id:"engine",name:"محرك الانسياب",desc:"استجابة أسرع لحركة المركبة",costs:[120,240,420],icon:"↗"},
 {id:"shield",name:"درع ممتد",desc:"ثوانٍ إضافية من الحماية",costs:[140,260,440],icon:"◎"},
 {id:"magnet",name:"مغناطيس أوسع",desc:"يجذب النجوم من مسافة أبعد",costs:[130,250,430],icon:"⌁"}
];
function renderWorkshop(){
 $("upgradeGrid").innerHTML=UPGRADE_DEFS.map(u=>{
  const level=progress.upgrades[u.id]||0,price=u.costs[level],max=level>=3;
  return '<article class="upgrade-card"><div class="upgrade-top"><i>'+u.icon+'</i><span>المستوى '+level+' / 3</span></div><strong>'+u.name+'</strong><p>'+u.desc+'</p><div class="upgrade-track"><i style="width:'+(level/3*100)+'%"></i></div><button type="button" data-upgrade="'+u.id+'" '+(max||progress.bank<price?"disabled":"")+'>'+(max?"اكتملت الترقية": "تطوير · "+price+" ✦")+'</button></article>';
 }).join("");
 $("upgradeGrid").querySelectorAll("[data-upgrade]").forEach(button=>button.addEventListener("click",()=>{
  const item=UPGRADE_DEFS.find(u=>u.id===button.dataset.upgrade);if(!item)return;
  const level=progress.upgrades[item.id]||0,price=item.costs[level];
  if(level>=3||progress.bank<price)return;
  progress.bank-=price;progress.upgrades[item.id]=level+1;saveProgress();
  $("skinShopNotice").textContent="تم تطوير "+item.name+" إلى المستوى "+(level+1)+".";
  sound(980,.18,"triangle");renderWorkshop();renderSkins();
 }));
}
function renderJourneyStats(){
 const st=progress.stats;
 $("journeyStats").innerHTML=[
  ["الرحلات",st.runs],["مجموع النقاط",format(st.totalScore)],["أطول نجاة",Math.floor(st.longest)+" ث"],["ثقوب سوداء",st.blackHoles],["مهمات مكتملة",st.missions],["نجوم جُمعت",st.stars]
 ].map(x=>'<div class="journey-stat"><small>'+x[0]+'</small><strong>'+x[1]+'</strong></div>').join("");
 const labels={aurora:"الشفق القطبي",meteor:"زخة النيازك",eclipse:"الكسوف",supernova:"الانفجار النجمي"};
 $("secretList").innerHTML=Object.entries(labels).map(([id,name])=>'<span class="secret-chip '+(progress.secrets.includes(id)?"found":"")+'">'+(progress.secrets.includes(id)?"✦ ":"? ")+name+'</span>').join("");
}
function unlockSecret(id){
 if(progress.secrets.includes(id))return;
 progress.secrets.push(id);saveProgress();renderJourneyStats();
 const names={aurora:"الشفق القطبي",meteor:"زخة النيازك",eclipse:"الكسوف",supernova:"الانفجار النجمي"};
 $("discoveryTitle").textContent="اكتشاف سري: "+names[id];
 $("discoveryFact").textContent="رصدتِ حدثًا نادرًا في الفضاء. عاد هذا الاكتشاف إلى سجل رحلاتك.";
 $("discoveryToast").hidden=false;$("discoveryToast").classList.remove("show");
 requestAnimationFrame(()=>$("discoveryToast").classList.add("show"));discoveryToastTime=4.2;
}
function renderSkins(){
 $("starBalance").textContent=String(progress.bank);
 $("skinGrid").innerHTML=SKINS.map(s=>{
  const owned=!s.cost||progress.ownedSkins.includes(s.id),selected=s.id===selectedSkin;
  const action=selected?"مستخدمة":owned?"اختاريها":"شراء · "+s.cost+" ✦";
  return "<button type=\"button\" class=\"skin-option "+(selected?"selected":"")+(owned?"":" locked-skin")+"\" data-skin=\""+s.id+"\"><i style=\"--skin-main:"+s.main+";--skin-edge:"+s.edge+";--skin-glow:"+s.glow+"\"></i><span>"+s.name+"</span><small>"+action+"</small></button>";
 }).join("");
 $("skinGrid").querySelectorAll("[data-skin]").forEach(button=>button.addEventListener("click",()=>{
  const skin=SKINS.find(s=>s.id===button.dataset.skin);if(!skin)return;
  if(skin.cost&&!progress.ownedSkins.includes(skin.id)){
   if(progress.bank<skin.cost){$("skinShopNotice").textContent="تحتاجين "+(skin.cost-progress.bank)+" نجمة إضافية لفتح "+skin.name+".";sound(180,.12,"sawtooth");return;}
   progress.bank-=skin.cost;progress.ownedSkins.push(skin.id);saveProgress();
   $("skinShopNotice").textContent="تم فتح "+skin.name+"! صارت ملكك.";sound(1040,.16,"triangle");
  }else{$("skinShopNotice").textContent="";}
  selectedSkin=skin.id;try{localStorage.setItem(SKIN_SAVE,selectedSkin);}catch(_){}renderSkins();
 }));
}
function openHangar(){renderSkins();renderWorkshop();renderJourneyStats();renderRecords();renderAchievements();try{$("pilotNameInput").value=localStorage.getItem("orbitPilotName")||"";}catch(_){}$("hangarModal").hidden=false;}
function closeHangar(){$("hangarModal").hidden=true;}
function saveRunRecord(){
 let name="رحّالة";try{name=(localStorage.getItem("orbitPilotName")||"رحّالة").trim().slice(0,16)||"رحّالة";}catch(_){}
 records.push({name,score,when:Date.now()});records.sort((a,b)=>b.score-a.score);records=records.slice(0,10);saveRecords();
}
function closeAtlas(){$("atlasModal").hidden=true;}
function showDiscovery(index){
 const fact=FACTS[index],toast=$("discoveryToast");
 $("discoveryTitle").textContent=fact.title;$("discoveryFact").textContent=fact.body;
 toast.hidden=false;toast.classList.remove("show");
 requestAnimationFrame(()=>toast.classList.add("show"));
 discoveryToastTime=5.2;
}
function resize(){
 const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;
 dpr=Math.min(window.devicePixelRatio||1,2);width=rect.width;height=rect.height;
 canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
 player.x=clamp(player.x||width/2,20,width-20);player.targetX=clamp(player.targetX||width/2,20,width-20);
 player.y=height*.78;player.targetY=player.y;
 backgroundStars=Array.from({length:Math.max(45,Math.round(width*height/6500))},()=>({x:rand(0,width),y:rand(0,height),r:rand(.4,1.7),a:rand(.2,.8),phase:rand(0,6)}));
}
function reset(){
 runStatsSaved=false;runBlackHoles=0;activeEvent=null;eventSpawnClock=0;nextEventAt=rand(27,39);$("eventBanner").hidden=true;
 score=0;lives=3;level=1;stageIndex=0;combo=1;comboTime=0;elapsed=0;spawnClock=0;stars=[];rocks=[];blackHoles=[];pickups=[];artifacts=[];particles=[];firstRockPending=true;
 shieldTime=0;magnetTime=0;collected=0;missionDone=false;nearMisses=0;starMilestoneAwarded=false;missionShownProgress=-1;timeDilation=1;lastMusicDilation=1;shake=0;discoveryToastTime=0;survivedMinute=false;
 const choices=MISSIONS.filter(m=>m.id!==lastMissionId);selectedMission=choices[Math.floor(Math.random()*choices.length)]||MISSIONS[0];lastMissionId=selectedMission.id;markSector(0);
 $("discoveryToast").hidden=true;$("discoveryToast").classList.remove("show");
 player={x:width/2,y:height*.78,targetX:width/2,targetY:height*.78,r:12,invulnerable:1.5};
 updateHUD();runId++;
}
function updateHUD(){
 $("score").textContent=format(score);$("best").textContent=format(best);$("level").textContent=String(level).padStart(2,"0");
 $("stageName").textContent=STAGES[stageIndex].name;$("stageHint").textContent=STAGES[stageIndex].hint;
 $("lives").querySelectorAll("i").forEach((el,i)=>el.classList.toggle("off",i>=lives));
 $("comboLabel").textContent="COMBO ×"+combo;
 $("runAtlasCount").textContent=discovered.length+" / "+FACTS.length;
 const missionProgress=Math.floor(missionValue());
 const count=Math.min(missionProgress,selectedMission.target),fill=$("missionFill");
 fill.style.width=(count/selectedMission.target*100)+"%";
 $("missionCount").textContent=selectedMission.id==="survive"?count+" / "+selectedMission.target+" ث":count+" / "+selectedMission.target;
 $("missionText").textContent=missionDone?"اكتملت! +"+selectedMission.starReward+" ✦":selectedMission.title;
 $("missionTrack").setAttribute("aria-valuemax",String(selectedMission.target));
 $("missionTrack").setAttribute("aria-valuenow",String(count));
 missionShownProgress=count;
 const active=shieldTime>0||magnetTime>0;
 $("powerState").hidden=!active;
 $("powerState").classList.toggle("magnet",magnetTime>0);
 if(active){
   $("powerIcon").textContent=magnetTime>0?"⌁":"◎";
   $("powerText").textContent=magnetTime>0?"مغناطيس نشط":"درع نشط";
   $("powerTimer").style.width=(Math.max(shieldTime,magnetTime)/7*30)+"px";
 }
}
function showMessage(title,body,buttonText="متابعة الرحلة"){
 $("messageTitle").textContent=title;$("messageText").textContent=body;
 $("resumeButton").innerHTML=buttonText+' <b>↗</b>';$("arenaMessage").hidden=false;
}
function start(){
 awardAchievement("first-flight");
 $("intro").hidden=true;$("features").hidden=true;$("gamePanel").hidden=false;
 state="starting";$("arenaMessage").hidden=true;$("exitButton").hidden=true;$("pauseButton").textContent="Ⅱ";
 $("arenaHint").style.opacity="1";
 // Wait for the newly revealed game panel to receive its real layout size.
 requestAnimationFrame(()=>{
   resize();
   if(!width||!height){
     const rect=canvas.getBoundingClientRect(),parent=canvas.parentElement;
     width=Math.max(320,rect.width||parent.clientWidth||window.innerWidth-24);
     height=Math.max(350,rect.height||parent.clientHeight||Math.min(window.innerHeight*.64,620));
     dpr=Math.min(window.devicePixelRatio||1,2);
     canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
     ctx.setTransform(dpr,0,0,dpr,0,0);
   }
   reset();
   // Seed visible objects so the arena is never empty at launch.
   stars.push({x:width*.5,y:height*.22,r:9,vy:100,spin:0,pulse:0});
   rocks.push(makeRock());firstRockPending=false;
   state="running";
   last=performance.now();draw(last);requestAnimationFrame(loop);
 });
}
function pause(){
 if(state!=="running")return;state="paused";$("pauseButton").textContent="▶";$("exitButton").hidden=false;
 showMessage("استراحة في المدار","النتيجة الحالية: "+format(score),"متابعة الرحلة");
}
function resume(){
 if(state!=="paused")return;state="running";$("arenaMessage").hidden=true;$("pauseButton").textContent="Ⅱ";last=performance.now();requestAnimationFrame(loop);
}
function endGame(){
 state="over";if(!runStatsSaved){runStatsSaved=true;progress.stats.runs++;progress.stats.totalScore+=score;progress.stats.longest=Math.max(progress.stats.longest,elapsed);progress.stats.blackHoles+=runBlackHoles;if(missionDone)progress.stats.missions++;saveProgress();renderJourneyStats();}saveRunRecord();const newRecord=score>best;if(newRecord){best=score;safeSaveBest(best);setBest();}
 $("pauseButton").textContent="↻";showMessage("انتهت الرحلة","نتيجتك "+format(score)+" · "+(newRecord?"رقم قياسي جديد!":"حاولي تجاوز رقمك القياسي"),"رحلة جديدة");
 $("exitButton").hidden=false;
}
function backToMenu(){
 state="menu";$("gamePanel").hidden=true;$("intro").hidden=false;$("features").hidden=false;
 $("resumeButton").onclick=null;$("exitButton").hidden=true;setBest();
}
function sound(freq=620,duration=.07,type="sine"){
 if(muted)return;
 try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();if(audio.state==="suspended")audio.resume();const osc=audio.createOscillator(),gain=audio.createGain();osc.type=type;osc.frequency.value=freq;gain.gain.setValueAtTime(.045,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+duration);}catch(_){}
}
async function startAmbient(){
 if(musicOn)return;
 try{
   audio=audio||new(window.AudioContext||window.webkitAudioContext)();
   if(audio.state!=="running")await audio.resume();
   if(audio.state!=="running")throw new Error("Audio context is not running");
   const master=audio.createGain(),filter=audio.createBiquadFilter();
   filter.type="lowpass";filter.frequency.value=1500;filter.Q.value=.35;
   master.gain.setValueAtTime(.0001,audio.currentTime);
   master.gain.linearRampToValueAtTime(.72,audio.currentTime+1.4);
   filter.connect(master);master.connect(audio.destination);
   const chordProgression=[
     [146.83,220,261.63,293.66],
     [116.54,174.61,233.08,261.63],
     [130.81,196,261.63,329.63],
     [98,164.81,196,246.94]
   ];
   const pads=chordProgression[0].map((frequency,index)=>{
     const osc=audio.createOscillator(),gain=audio.createGain();
     osc.type=index===3?"triangle":"sine";osc.frequency.value=frequency;
     gain.gain.value=[.34,.25,.18,.11][index];
     osc.connect(gain);gain.connect(filter);osc.start();return osc;
   });
   const lfo=audio.createOscillator(),lfoGain=audio.createGain();
   lfo.type="sine";lfo.frequency.value=.07;lfoGain.gain.value=180;
   lfo.connect(lfoGain);lfoGain.connect(filter.frequency);lfo.start();
   musicNodes=[master,filter,...pads,lfo];
   const melody=[587.33,698.46,880,783.99,698.46,587.33,523.25,659.25];
   let step=0,chord=0;
   musicOn=true;
   const playBell=()=>{
     if(!musicOn||audio.state!=="running")return;
     const now=audio.currentTime,osc=audio.createOscillator(),gain=audio.createGain();
     osc.type="sine";osc.frequency.setValueAtTime(melody[step%melody.length],now);
     gain.gain.setValueAtTime(.0001,now);
     gain.gain.linearRampToValueAtTime(.28,now+.12);
     gain.gain.exponentialRampToValueAtTime(.0001,now+1.8);
     osc.connect(gain);gain.connect(filter);osc.start(now);osc.stop(now+1.9);
     step++;
     if(step%4===0){
       chord=(chord+1)%chordProgression.length;
       pads.forEach((pad,index)=>pad.frequency.setTargetAtTime(chordProgression[chord][index],audio.currentTime,1.4));
     }
   };
   playBell();musicTimer=setInterval(playBell,900);
   $("musicButton").textContent="♫";
   $("musicButton").setAttribute("aria-pressed","true");
   $("musicButton").setAttribute("aria-label","إيقاف موسيقى الفضاء");
 }catch(error){
   musicOn=false;
   if(musicTimer){clearInterval(musicTimer);musicTimer=null;}
   musicNodes=[];
   $("musicButton").textContent="♪";
   $("musicButton").setAttribute("aria-pressed","false");
   $("musicButton").setAttribute("aria-label","تعذر تشغيل الموسيقى، اضغطي للمحاولة مجددًا");
   console.warn("Orbit ambient audio:",error);
 }
}
function stopAmbient(){
 if(musicTimer){clearInterval(musicTimer);musicTimer=null;}
 if(!musicNodes.length){musicOn=false;return;}
 const nodes=musicNodes.slice(),master=nodes[0],filter=nodes[1];
 try{
   master.gain.cancelScheduledValues(audio.currentTime);
   master.gain.setTargetAtTime(.0001,audio.currentTime,.22);
   setTimeout(()=>{
     nodes.slice(2).forEach(n=>{try{n.stop();}catch(_){}});
     try{filter.disconnect();master.disconnect();}catch(_){}
   },1400);
 }catch(_){}
 musicNodes=[];musicOn=false;
 $("musicButton").textContent="♪";$("musicButton").setAttribute("aria-pressed","false");
 $("musicButton").setAttribute("aria-label","تشغيل موسيقى الفضاء");
}
function burst(x,y,color,count=10){
 for(let i=0;i<count;i++){const a=rand(0,Math.PI*2),speed=rand(35,180);particles.push({x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:rand(.25,.65),max:.65,size:rand(1,3),color});}
}
function makeRock(){
 return {x:rand(22,Math.max(23,width-22)),y:-25,r:rand(14,22),vy:rand(115,175)+level*12,vx:rand(-18,18),rot:rand(0,6),spin:rand(-2,2),sides:Math.floor(rand(7,10)),seed:rand(0,100),nearMiss:false};
}
function spawn(){
 const x=rand(22,Math.max(23,width-22)),roll=Math.random();
 if(firstRockPending){firstRockPending=false;rocks.push(makeRock());return;}
 const pending=artifacts.map(a=>a.id);
 const available=FACTS.map((_,i)=>i).filter(i=>!discovered.includes(i)&&!pending.includes(i));
 if(roll<.035&&available.length){
   artifacts.push({x,y:-20,r:12,vy:rand(82,108)+level*3,spin:0,id:available[Math.floor(Math.random()*available.length)]});
   return;
 }
 if(roll<.065&&!blackHoles.length){
   runBlackHoles++;blackHoles.push({x,y:rand(height*.2,height*.58),r:24,life:7.5,age:0,spin:rand(0,6),seed:rand(0,Math.PI*2)});
   sound(115,.24,"sine");
   return;
 }
 if(roll<.12){
   pickups.push({x,y:-18,r:11,vy:rand(88,112)+level*4,spin:0,kind:Math.random()<.52?"shield":"magnet"});
   return;
 }
 if(Math.random()<.48)stars.push({x,y:-15,r:8,vy:rand(95,145)+level*7,spin:rand(0,6),pulse:rand(0,6)});
 else rocks.push(makeRock());
}
function triggerCosmicEvent(){
 const types=["aurora","meteor","eclipse","supernova"];
 const type=types[Math.floor(Math.random()*types.length)];
 activeEvent={type,time:0,duration:type==="supernova"?5.5:9};
 const data={
  aurora:["الشفق القطبي","النجوم تمنح نقاطًا مضاعفة"],
  meteor:["زخة النيازك","موجة صخور إضافية، تحركي بحذر"],
  eclipse:["الكسوف","يخفت الضوء قليلًا ويتغير صوت الفضاء"],
  supernova:["انفجار نجمي","تجمّع نجوم نادر ظهر أمامك"]
 }[type];
 $("eventBanner").textContent="حدث نادر · "+data[0]+" · "+data[1];$("eventBanner").hidden=false;
 if(type==="supernova"){
  for(let i=0;i<9;i++)stars.push({x:rand(24,width-24),y:rand(height*.12,height*.52),r:9,vy:rand(55,85),spin:rand(0,6),pulse:rand(0,6)});
  burst(width*.5,height*.3,"#ffd77a",55);
 }
 sound(type==="meteor"?260:type==="eclipse"?180:880,.2,type==="meteor"?"sawtooth":"sine");
}
function circleHit(a,b){const dx=a.x-b.x,dy=a.y-b.y,rr=a.r+b.r;return dx*dx+dy*dy<rr*rr;}
function missionValue(){
 if(selectedMission.id==="stars")return collected;
 if(selectedMission.id==="survive")return elapsed;
 if(selectedMission.id==="near")return nearMisses;
 if(selectedMission.id==="mars")return stageIndex>=1?1:0;
 if(selectedMission.id==="saturn")return stageIndex>=2?1:0;
 return stageIndex>0?1:0;
}
function checkMission(){
 if(missionDone)return;
 if(missionValue()>=selectedMission.target){
  missionDone=true;score+=selectedMission.reward;progress.bank+=selectedMission.starReward;progress.stats.missions++;saveProgress();
  burst(player.x,player.y,"#76e4e4",30);sound(980,.24,"triangle");updateHUD();
 }
}
function collectStar(s){
 score+=(activeEvent?.type==="aurora"?20:10)*combo;combo=Math.min(8,combo+1);comboTime=2.2;collected++;addLifetimeStar();awardAchievement("first-star");checkMission();
 burst(s.x,s.y,"#ffd77a",12);sound(720+combo*55,.065,"triangle");
 if(collected>=20&&!starMilestoneAwarded){starMilestoneAwarded=true;awardAchievement("mission-20");}
 updateHUD();
}
function collectPickup(p){
 if(p.kind==="shield"){shieldTime=6+(progress.upgrades.shield||0)*1.25;magnetTime=0;burst(p.x,p.y,"#76e4e4",22);sound(840,.13,"sine");}
 else{magnetTime=7+(progress.upgrades.magnet||0)*1.3;shieldTime=0;burst(p.x,p.y,"#a99bff",22);sound(920,.13,"triangle");}
 updateHUD();
}
function collectArtifact(a){
 if(discovered.includes(a.id))return;
 discovered.push(a.id);safeSaveAtlas();score+=80;awardAchievement("first-discovery");if(discovered.length===FACTS.length)awardAchievement("atlas-master");
 burst(a.x,a.y,"#a99bff",26);sound(1040,.2,"triangle");
 showDiscovery(a.id);updateHUD();updateAtlasButton();
}
function hitRock(r){
 if(player.invulnerable>0)return;
 lives--;player.invulnerable=1.35;combo=1;comboTime=0;shake=9;
 burst(player.x,player.y,"#ff9fcb",20);sound(150,.2,"sawtooth");updateHUD();
 if(lives<=0)endGame();
}
function update(dt){
 let nearest=Infinity;
 for(const hole of blackHoles){
  const appear=clamp(hole.age/.65,0,1),fade=clamp(hole.life/1.15,0,1),influence=appear*fade;
  if(influence>.01)nearest=Math.min(nearest,Math.hypot(hole.x-player.x,hole.y-player.y)/Math.max(.35,influence));
 }
 timeDilation=nearest<180?.34+.66*(nearest/180):1;
 if(musicOn&&musicNodes.length>1&&Math.abs(timeDilation-lastMusicDilation)>.04){
  try{
   musicNodes[1].frequency.setTargetAtTime(650+850*timeDilation,audio.currentTime,.25);
   musicNodes[0].gain.setTargetAtTime(.72*(.35+.65*timeDilation),audio.currentTime,.4);
   lastMusicDilation=timeDilation;
  }catch(_){}
 }
 const step=dt*timeDilation;
 elapsed+=step;const nextLevel=1+Math.floor(elapsed/18);if(nextLevel!==level){level=nextLevel;updateHUD();}
 const nextStage=Math.floor(elapsed/35)%STAGES.length;
 if(nextStage!==stageIndex){stageIndex=nextStage;markSector(stageIndex);checkMission();updateHUD();sound(360,.16,"sine");}
 if(elapsed>=60&&!survivedMinute){survivedMinute=true;awardAchievement("minute-survivor");}spawnClock+=step;
 if(selectedMission.id==="survive"&&Math.floor(elapsed)!==missionShownProgress){updateHUD();checkMission();}
 if(!activeEvent&&elapsed>=nextEventAt)triggerCosmicEvent();
 if(activeEvent){
  activeEvent.time+=step;
  if(activeEvent.type==="meteor"){eventSpawnClock+=step;while(eventSpawnClock>.48){eventSpawnClock-=.48;const rock=makeRock();rock.vy*=1.25;rocks.push(rock);}}
  if(activeEvent.time>=activeEvent.duration){unlockSecret(activeEvent.type);activeEvent=null;$("eventBanner").hidden=true;nextEventAt=elapsed+rand(43,62);}
 }
 const interval=Math.max(.28,.88-level*.055);
 while(spawnClock>interval){spawnClock-=interval;spawn();}

 player.x+=(player.targetX-player.x)*Math.min(1,step*(13+(progress.upgrades.engine||0)*2.4));
 player.y+=(player.targetY-player.y)*Math.min(1,step*(13+(progress.upgrades.engine||0)*2.4));
 player.x=clamp(player.x,player.r+7,width-player.r-7);player.y=clamp(player.y,height*.42,height-28);
 player.invulnerable=Math.max(0,player.invulnerable-step);
 if(comboTime>0){comboTime-=step;if(comboTime<=0){combo=1;updateHUD();}}
 const hadPower=shieldTime>0||magnetTime>0;
 shieldTime=Math.max(0,shieldTime-step);magnetTime=Math.max(0,magnetTime-step);shake=Math.max(0,shake-step*24);
 if(hadPower&&!shieldTime&&!magnetTime)updateHUD();
 if(shieldTime>0||magnetTime>0)$("powerTimer").style.width=(Math.max(shieldTime,magnetTime)/7*30)+"px";
 if(discoveryToastTime>0){
   discoveryToastTime-=step;
   if(discoveryToastTime<=0){$("discoveryToast").classList.remove("show");$("discoveryToast").hidden=true;}
 }
 if(magnetTime>0){
   for(const s of stars){const dx=player.x-s.x,dy=player.y-s.y,d=Math.hypot(dx,dy);if(d<175+(progress.upgrades.magnet||0)*35&&d>1){const range=175+(progress.upgrades.magnet||0)*35;const pull=(1-d/range)*420;s.x+=dx/d*pull*step;s.y+=dy/d*pull*step;}}
 }
 for(let i=blackHoles.length-1;i>=0;i--){
   const b=blackHoles[i];b.age+=step;b.life-=step;b.spin+=step*.7;
   const appear=clamp(b.age/.65,0,1),fade=clamp(b.life/1.15,0,1);
   const dx=b.x-player.x,dy=b.y-player.y,d=Math.hypot(dx,dy);
   if(!b.collapsing&&appear>.25&&fade>.25&&d<180&&d>1){
     const pull=(1-d/180)*118*appear*fade;
     player.x+=dx/d*pull*step;player.y+=dy/d*pull*step;
     player.targetX=clamp(player.targetX+dx/d*pull*step*.55,player.r+7,width-player.r-7);
     player.targetY=clamp(player.targetY+dy/d*pull*step*.55,height*.42,height-28);
   }
   if(!b.collapsing&&appear>.7&&d<b.r+player.r*.72&&player.invulnerable<=0){
     b.collapsing=true;b.life=Math.min(b.life,.8);
     if(shieldTime>0){
       shieldTime=0;score+=120;burst(b.x,b.y,"#c9aaff",34);sound(430,.24,"triangle");updateHUD();
     }else{hitRock(b);if(state!=="running")return;}
     continue;
   }
   if(b.life<=0)blackHoles.splice(i,1);
 }
 for(let i=artifacts.length-1;i>=0;i--){
   const a=artifacts[i];a.y+=a.vy*step;a.spin+=step*1.8;
   if(circleHit(player,a)){collectArtifact(a);artifacts.splice(i,1);continue;}
   if(a.y>height+25)artifacts.splice(i,1);
 }
 for(let i=stars.length-1;i>=0;i--){const s=stars[i];s.y+=s.vy*step;s.spin+=step*2.4;s.pulse+=step*4;if(circleHit(player,s)){collectStar(s);stars.splice(i,1);updateHUD();continue;}if(s.y>height+25)stars.splice(i,1);}
 for(let i=pickups.length-1;i>=0;i--){const p=pickups[i];p.y+=p.vy*step;p.spin+=step*2.8;if(circleHit(player,p)){collectPickup(p);pickups.splice(i,1);continue;}if(p.y>height+25)pickups.splice(i,1);}
 for(let i=rocks.length-1;i>=0;i--){const r=rocks[i];r.x+=r.vx*step;r.y+=r.vy*step;r.rot+=r.spin*step;if(r.x<r.r||r.x>width-r.r)r.vx*=-1;
   const dx=player.x-r.x,dy=player.y-r.y,d=Math.hypot(dx,dy);
   if(!r.nearMiss&&d<player.r+r.r+18&&d>player.r+r.r*.83){r.nearMiss=true;nearMisses++;checkMission();score+=5;burst(r.x,r.y,"#a99bff",5);updateHUD();}
   if(circleHit(player,{...r,r:r.r*.83})){rocks.splice(i,1);if(shieldTime>0){shieldTime=0;player.invulnerable=.65;burst(r.x,r.y,"#76e4e4",24);sound(520,.16,"triangle");updateHUD();}else hitRock(r);if(state!=="running")return;continue;}
   if(r.y>height+35)rocks.splice(i,1);
 }
 for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx*step;p.y+=p.vy*step;p.vx*=.985;p.vy*=.985;p.life-=step;if(p.life<=0)particles.splice(i,1);}
}
function drawBackground(t){
 const stage=STAGES[stageIndex];
 ctx.fillStyle=stage.bg;ctx.fillRect(0,0,width,height);
 const glow=ctx.createRadialGradient(width*.5,height*.38,5,width*.5,height*.38,width*.7);glow.addColorStop(0,stage.glow+"66");glow.addColorStop(1,stage.bg+"00");ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
 for(const s of backgroundStars){const alpha=s.a*(.65+.35*Math.sin(t*.001+s.phase));ctx.globalAlpha=alpha;ctx.fillStyle="#c9dcff";ctx.fillRect(s.x,s.y,s.r,s.r);}ctx.globalAlpha=1;
 ctx.strokeStyle="#8ca8d00c";ctx.lineWidth=1;
 for(let y=height*.6;y<height;y+=38){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y);ctx.stroke();}
 if(stageIndex===0){ctx.strokeStyle="#8de7ff22";ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(width*.76,height*.23,width*.25,18,-.25,0,Math.PI*2);ctx.stroke();}
 if(stageIndex===1){ctx.save();ctx.globalAlpha=.16;for(let i=0;i<9;i++){const x=(i*97+elapsed*22)%(width+80)-40,y=(i*61+30)%height;ctx.strokeStyle="#ffc19b";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+rand(12,34),y-2);ctx.stroke();}ctx.restore();}
 if(stageIndex===2){ctx.save();ctx.translate(width*.76,height*.22);ctx.rotate(-.22);ctx.strokeStyle="#f4d69a55";ctx.lineWidth=9;ctx.beginPath();ctx.ellipse(0,0,65,19,0,0,Math.PI*2);ctx.stroke();ctx.fillStyle="#c9a56b55";ctx.beginPath();ctx.arc(0,0,24,0,Math.PI*2);ctx.fill();ctx.restore();}
 if(activeEvent?.type==="aurora"){ctx.save();ctx.globalAlpha=.2+.12*Math.sin(t*.002);const aurora=ctx.createLinearGradient(0,height*.12,width,height*.55);aurora.addColorStop(0,"#67f4d000");aurora.addColorStop(.45,"#67f4d055");aurora.addColorStop(1,"#b28cff00");ctx.fillStyle=aurora;ctx.fillRect(0,0,width,height);ctx.restore();}
 if(activeEvent?.type==="eclipse"){ctx.fillStyle="#05030b88";ctx.fillRect(0,0,width,height);}
 if(stageIndex===3){ctx.save();for(let i=0;i<4;i++){const x=width*(.18+i*.21),y=height*(.18+(i%2)*.2),cloud=ctx.createRadialGradient(x,y,3,x,y,65);cloud.addColorStop(0,"#bda0ff22");cloud.addColorStop(1,"#bda0ff00");ctx.fillStyle=cloud;ctx.fillRect(x-65,y-65,130,130);}ctx.restore();}
}
function drawStar(s){
 ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.spin);const pulse=1+Math.sin(s.pulse)*.13;
 ctx.scale(pulse,pulse);ctx.shadowBlur=18;ctx.shadowColor="#ffd77a";
 ctx.fillStyle="#ffe39a";ctx.beginPath();
 for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2===0?s.r:s.r*.42;const x=Math.cos(a)*r,y=Math.sin(a)*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}
 ctx.closePath();ctx.fill();ctx.restore();
}
function drawArtifact(a){
 ctx.save();ctx.translate(a.x,a.y);ctx.rotate(a.spin);
 ctx.shadowBlur=22;ctx.shadowColor="#a99bff";
 ctx.fillStyle="#171b3b";ctx.strokeStyle="#c8bcff";ctx.lineWidth=2;
 ctx.beginPath();ctx.moveTo(0,-a.r);ctx.lineTo(a.r*.82,0);ctx.lineTo(0,a.r);ctx.lineTo(-a.r*.82,0);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.fillStyle="#f1eaff";ctx.font="bold 13px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText("✧",0,1);
 ctx.restore();
}
function drawRock(r){
 ctx.save();ctx.translate(r.x,r.y);ctx.rotate(r.rot);ctx.beginPath();
 for(let i=0;i<r.sides;i++){const a=i/r.sides*Math.PI*2,rr=r.r*(.78+.22*Math.sin(i*13+r.seed));const x=Math.cos(a)*rr,y=Math.sin(a)*rr;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}
 ctx.closePath();const rockColor=STAGES[stageIndex].rock;
 const g=ctx.createLinearGradient(-r.r,-r.r,r.r,r.r);g.addColorStop(0,"#e4c5a0");g.addColorStop(.55,rockColor);g.addColorStop(1,"#333c60");ctx.fillStyle=g;ctx.shadowBlur=13;ctx.shadowColor="#d58eaf55";ctx.fill();ctx.strokeStyle="#f0b7d655";ctx.lineWidth=1;ctx.stroke();
 ctx.fillStyle="#27304c88";ctx.beginPath();ctx.arc(-r.r*.2,-r.r*.12,r.r*.2,0,Math.PI*2);ctx.fill();ctx.restore();
}
function drawBlackHole(b,t){
 const distance=Math.hypot(player.x-b.x,player.y-b.y);
 const lens=clamp(1-distance/230,0,1);
 const appear=clamp(b.age/.65,0,1);
 const fade=clamp(b.life/1.15,0,1);
 const alpha=appear*fade;
 const pulse=1+Math.sin(t*.0024+(b.seed||0))*.035;
 ctx.save();ctx.globalAlpha=alpha;ctx.translate(b.x,b.y);ctx.rotate(b.spin);

 // A wide, soft halo makes the hole feel like a distortion in space.
 const halo=ctx.createRadialGradient(0,0,b.r*.35,0,0,b.r*3.1);
 halo.addColorStop(0,"#05030b00");halo.addColorStop(.28,"#09061500");
 halo.addColorStop(.48,"#9d79ff30");halo.addColorStop(.68,"#65dce51c");halo.addColorStop(1,"#9d79ff00");
 ctx.fillStyle=halo;ctx.beginPath();ctx.arc(0,0,b.r*3.1,0,Math.PI*2);ctx.fill();

 // Layered accretion disk: bright inner ring and cooler outer stream.
 ctx.save();ctx.globalAlpha*=.62+lens*.25;
 ctx.shadowBlur=24;ctx.shadowColor="#b58cff";
 const disk=ctx.createLinearGradient(-b.r*2,-b.r*.2,b.r*2,b.r*.2);
 disk.addColorStop(0,"#7c69ff22");disk.addColorStop(.25,"#8deaf0");disk.addColorStop(.48,"#fff0d4");
 disk.addColorStop(.7,"#b18aff");disk.addColorStop(1,"#6fdce422");
 ctx.strokeStyle=disk;ctx.lineWidth=5.5;
 ctx.beginPath();ctx.ellipse(0,0,b.r*1.95*pulse,b.r*.67,-.12,0,Math.PI*2);ctx.stroke();
 ctx.shadowBlur=12;ctx.strokeStyle="#77dfe9";ctx.lineWidth=1.5;ctx.globalAlpha*=.85;
 ctx.beginPath();ctx.ellipse(0,0,b.r*2.28,b.r*.78,-.12,.08,Math.PI-.08);ctx.stroke();
 ctx.strokeStyle="#d7b6ff";ctx.lineWidth=2;
 ctx.beginPath();ctx.ellipse(0,0,b.r*1.48,b.r*.48,.12,Math.PI+.15,Math.PI*2-.15);ctx.stroke();
 ctx.restore();

 // Gravitational lensing arcs brighten as the ship approaches.
 ctx.save();ctx.globalAlpha*=.16+lens*.48;
 const lensGlow=ctx.createLinearGradient(-b.r*2.8,0,b.r*2.8,0);
 lensGlow.addColorStop(0,"#79dfe8");lensGlow.addColorStop(.48,"#fff0e2");lensGlow.addColorStop(1,"#bd91ff");
 ctx.strokeStyle=lensGlow;ctx.lineWidth=1.5+lens*1.4;ctx.shadowBlur=14+lens*18;ctx.shadowColor="#c9aaff";
 ctx.beginPath();ctx.ellipse(0,0,b.r*2.5,b.r*1.35,-.08,Math.PI*.1,Math.PI*.9);ctx.stroke();
 ctx.beginPath();ctx.ellipse(0,0,b.r*2.5,b.r*1.35,-.08,Math.PI*1.1,Math.PI*1.9);ctx.stroke();
 ctx.restore();

 // Tiny orbiting sparks add motion without cluttering the play field.
 for(let i=0;i<7;i++){
  const a=t*.00055*(i%2?1:-1)+i*Math.PI*2/7+(b.seed||0);
  const rx=b.r*(1.85+(i%3)*.24),ry=b.r*(.54+(i%3)*.1);
  const sx=Math.cos(a)*rx,sy=Math.sin(a)*ry;
  ctx.globalAlpha=alpha*(.35+.45*(.5+.5*Math.sin(a*2)));
  ctx.fillStyle=i%2?"#a9f5f2":"#e6caff";ctx.shadowBlur=8;ctx.shadowColor=ctx.fillStyle;
  ctx.beginPath();ctx.arc(sx,sy,i%3===0?1.7:1.1,0,Math.PI*2);ctx.fill();
 }

 // The event horizon stays almost perfectly black.
 ctx.globalAlpha=alpha;ctx.shadowBlur=25;ctx.shadowColor="#05020d";
 const core=ctx.createRadialGradient(-b.r*.22,-b.r*.25,1,0,0,b.r*.94);
 core.addColorStop(0,"#020108");core.addColorStop(.72,"#03020a");core.addColorStop(1,"#171025");
 ctx.fillStyle=core;ctx.beginPath();ctx.arc(0,0,b.r*.86,0,Math.PI*2);ctx.fill();
 ctx.shadowBlur=0;ctx.strokeStyle="#d9c5ff";ctx.globalAlpha=alpha*(.42+lens*.35);ctx.lineWidth=1;
 ctx.beginPath();ctx.arc(0,0,b.r*.91,0,Math.PI*2);ctx.stroke();
 ctx.restore();
}
function drawPlayer(t){
 ctx.save();ctx.translate(player.x,player.y);
 if(player.invulnerable>0&&Math.floor(t/90)%2===0)ctx.globalAlpha=.35;
 if(shieldTime>0||magnetTime>0){ctx.save();ctx.globalAlpha=.7;ctx.strokeStyle=shieldTime>0?"#76e4e4":"#a99bff";ctx.lineWidth=2;ctx.shadowBlur=18;ctx.shadowColor=ctx.strokeStyle;ctx.beginPath();ctx.arc(0,0,player.r+10+Math.sin(t*.009)*2,0,Math.PI*2);ctx.stroke();ctx.restore();}
 const skin=SKINS.find(s=>s.id===selectedSkin)||SKINS[0];
 ctx.shadowBlur=23;ctx.shadowColor=skin.glow+"aa";
 const flame=rand(10,18);const fg=ctx.createLinearGradient(0,8,0,flame+17);fg.addColorStop(0,"#fff0b1");fg.addColorStop(.4,skin.edge);fg.addColorStop(1,skin.glow+"00");ctx.fillStyle=fg;ctx.beginPath();ctx.moveTo(-5,8);ctx.lineTo(0,flame+17);ctx.lineTo(5,8);ctx.fill();
 ctx.beginPath();ctx.moveTo(0,-17);ctx.lineTo(13,12);ctx.lineTo(0,8);ctx.lineTo(-13,12);ctx.closePath();const g=ctx.createLinearGradient(-12,0,12,0);g.addColorStop(0,skin.edge);g.addColorStop(.5,skin.main);g.addColorStop(1,skin.glow);ctx.fillStyle=g;ctx.fill();ctx.strokeStyle="#d9ffff";ctx.lineWidth=1;ctx.stroke();
 ctx.fillStyle="#192c4b";ctx.beginPath();ctx.ellipse(0,-4,4,7,0,0,Math.PI*2);ctx.fill();
 ctx.restore();
}
function drawPickup(p){
 ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.spin);
 const color=p.kind==="shield"?"#76e4e4":"#a99bff";
 ctx.shadowBlur=20;ctx.shadowColor=color;ctx.fillStyle="#111b34";ctx.strokeStyle=color;ctx.lineWidth=2;
 ctx.beginPath();ctx.arc(0,0,p.r,0,Math.PI*2);ctx.fill();ctx.stroke();
 ctx.rotate(-p.spin);ctx.fillStyle=color;ctx.font="bold 15px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(p.kind==="shield"?"◎":"⌁",0,1);ctx.restore();
}
function draw(t){
 ctx.save();
 if(shake>0)ctx.translate(rand(-shake,shake),rand(-shake,shake));
 drawBackground(t);stars.forEach(drawStar);pickups.forEach(drawPickup);artifacts.forEach(drawArtifact);rocks.forEach(drawRock);blackHoles.forEach(b=>drawBlackHole(b,t));
 for(const p of particles){ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.color;ctx.shadowBlur=9;ctx.shadowColor=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;ctx.shadowBlur=0;
 if(state!=="menu")drawPlayer(t);
 ctx.restore();
}
function loop(now){
 if(state!=="running")return;
 const dt=Math.min((now-last)/1000,.033);last=now;update(dt);draw(now);
 if(state==="running")requestAnimationFrame(loop);
}
function moveTo(clientX,clientY){
 const rect=canvas.getBoundingClientRect();player.targetX=clamp(clientX-rect.left,18,width-18);player.targetY=clamp(clientY-rect.top,height*.43,height-27);
 $("arenaHint").style.opacity="0";
}
canvas.addEventListener("pointerdown",e=>{if(state!=="running")return;pointerDown=true;canvas.setPointerCapture(e.pointerId);moveTo(e.clientX,e.clientY);});
canvas.addEventListener("pointermove",e=>{if(pointerDown&&state==="running")moveTo(e.clientX,e.clientY);});
canvas.addEventListener("pointerup",()=>pointerDown=false);canvas.addEventListener("pointercancel",()=>pointerDown=false);
window.addEventListener("keydown",e=>{
 const key=e.key.toLowerCase();if(["arrowleft","arrowright","arrowup","arrowdown"," "].includes(key))e.preventDefault();
 if(key==="escape"||key==="p"){state==="running"?pause():state==="paused"?resume():null;return;}
 if(state!=="running")return;const step=width*.08;
 if(key==="arrowleft"||key==="a")player.targetX-=step;if(key==="arrowright"||key==="d")player.targetX+=step;
 if(key==="arrowup"||key==="w")player.targetY-=step;if(key==="arrowdown"||key==="s")player.targetY+=step;
 player.targetX=clamp(player.targetX,18,width-18);player.targetY=clamp(player.targetY,height*.43,height-27);
});
$("startButton").addEventListener("click",start);
$("atlasButton").addEventListener("click",openAtlas);
$("hangarButton").addEventListener("click",openHangar);
$("closeHangar").addEventListener("click",closeHangar);
$("savePilotName").addEventListener("click",()=>{const name=$("pilotNameInput").value.trim().slice(0,16)||"رحّالة";try{localStorage.setItem("orbitPilotName",name);}catch(_){}$("pilotNameInput").value=name;renderRecords();});
$("hangarModal").addEventListener("click",e=>{if(e.target===$("hangarModal"))closeHangar();});
$("closeAtlas").addEventListener("click",closeAtlas);
$("atlasModal").addEventListener("click",e=>{if(e.target===$("atlasModal"))closeAtlas();});
window.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("atlasModal").hidden)closeAtlas();if(e.key==="Escape"&&!$("hangarModal").hidden)closeHangar();});
$("pauseButton").addEventListener("click",()=>state==="running"?pause():state==="over"?start():null);
$("resumeButton").addEventListener("click",()=>{if(state==="paused")resume();else if(state==="over")start();});
$("exitButton").addEventListener("click",backToMenu);
$("soundButton").addEventListener("click",()=>{muted=!muted;$("soundButton").textContent=muted?"♪̸":"♫";$("soundButton").setAttribute("aria-label",muted?"تشغيل المؤثرات":"إيقاف المؤثرات");if(!muted)sound();});
$("musicButton").addEventListener("click",()=>musicOn?stopAmbient():startAmbient());
window.addEventListener("resize",()=>{if(!$("gamePanel").hidden){resize();if(state==="running"||state==="paused")draw(performance.now());}});
if("ResizeObserver" in window){
 const arenaObserver=new ResizeObserver(()=>{if(!$("gamePanel").hidden){resize();if(state==="running"||state==="paused")draw(performance.now());}});
 arenaObserver.observe(canvas.parentElement);
}
document.addEventListener("visibilitychange",()=>{if(document.hidden&&state==="running")pause();});
$("exitButton").hidden=true;setBest();updateAtlasButton();renderAtlas();renderSkins();renderRecords();renderAchievements();resize();draw(0);
})();