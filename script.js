(() => {
"use strict";
const $ = id => document.getElementById(id);
const canvas=$("arena"),ctx=canvas.getContext("2d");
const SAVE="orbitArcade.v2";
const ATLAS_SAVE="orbitAtlas.v1";
const RECORDS_SAVE="orbitRecords.v1";
const SKIN_SAVE="orbitSkin.v1";
const SKINS=[{id:"nova",name:"نوفا",main:"#f0ffff",edge:"#76e4e4",glow:"#76e4e4"},{id:"coral",name:"مرجان",main:"#fff0f3",edge:"#ff8eaa",glow:"#ff8eaa"},{id:"nebula",name:"سديم",main:"#f4eaff",edge:"#b99aff",glow:"#b99aff"},{id:"solar",name:"شمسي",main:"#fff4c9",edge:"#ffc85c",glow:"#ffc85c"}];
const STAGES=[{name:"مدار الأرض",hint:"نجوم زرقاء وهواء هادئ",bg:"#10264a",glow:"#275b83",rock:"#63829b"},{name:"سهول المريخ",hint:"غبار أحمر وصخور أكثر",bg:"#3a1d2a",glow:"#a34c45",rock:"#bd7864"},{name:"حلقات زحل",hint:"غبار ذهبي وحلقات لامعة",bg:"#352b20",glow:"#a17a42",rock:"#b89a6c"},{name:"حافة السديم",hint:"سحب بنفسجية وثقوب سوداء",bg:"#251b45",glow:"#7654a8",rock:"#8c79b7"}];
let selectedSkin=(()=>{try{return localStorage.getItem(SKIN_SAVE)||"nova";}catch(_){return"nova";}})();
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
let shieldTime=0,magnetTime=0,collected=0,missionDone=false,shake=0;
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
function renderSkins(){
 $("skinGrid").innerHTML=SKINS.map(s=>"<button type=\"button\" class=\"skin-option "+(s.id===selectedSkin?"selected":"")+"\" data-skin=\""+s.id+"\"><i style=\"--skin-main:"+s.main+";--skin-edge:"+s.edge+";--skin-glow:"+s.glow+"\"></i><span>"+s.name+"</span>"+(s.id===selectedSkin?"<small>محدد</small>":"")+"</button>").join("");
 $("skinGrid").querySelectorAll("[data-skin]").forEach(button=>button.addEventListener("click",()=>{selectedSkin=button.dataset.skin;try{localStorage.setItem(SKIN_SAVE,selectedSkin);}catch(_){}renderSkins();}));
}
function openHangar(){renderSkins();renderRecords();try{$("pilotNameInput").value=localStorage.getItem("orbitPilotName")||"";}catch(_){}$("hangarModal").hidden=false;}
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
 score=0;lives=3;level=1;stageIndex=0;combo=1;comboTime=0;elapsed=0;spawnClock=0;stars=[];rocks=[];blackHoles=[];pickups=[];artifacts=[];particles=[];firstRockPending=true;
 shieldTime=0;magnetTime=0;collected=0;missionDone=false;shake=0;discoveryToastTime=0;
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
 const count=Math.min(collected,20),fill=$("missionFill");
 fill.style.width=(count/20*100)+"%";
 $("missionCount").textContent=count+" / 20";
 $("missionText").textContent=missionDone?"اكتملت المهمة! +150":"اجمعي 20 نجمة";
 $("missionTrack").setAttribute("aria-valuenow",String(count));
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
 state="over";saveRunRecord();const newRecord=score>best;if(newRecord){best=score;safeSaveBest(best);setBest();}
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
function startAmbient(){
 if(musicOn)return;
 try{
   audio=audio||new(window.AudioContext||window.webkitAudioContext)();
   if(audio.state==="suspended")audio.resume();
   const master=audio.createGain(),filter=audio.createBiquadFilter();
   filter.type="lowpass";filter.frequency.value=1120;filter.Q.value=.42;
   master.gain.setValueAtTime(.0001,audio.currentTime);
   master.gain.exponentialRampToValueAtTime(.055,audio.currentTime+3.5);
   filter.connect(master);master.connect(audio.destination);
   const chordProgression=[
     [73.42,110,130.81,164.81],
     [58.27,116.54,146.83,174.61],
     [87.31,130.81,174.61,220],
     [65.41,130.81,146.83,196]
   ];
   const padLevels=[.12,.075,.052,.026];
   const pads=chordProgression[0].map((frequency,index)=>{
     const osc=audio.createOscillator(),gain=audio.createGain();
     osc.type="sine";osc.frequency.value=frequency;gain.gain.value=padLevels[index];
     osc.connect(gain);gain.connect(filter);osc.start();return osc;
   });
   const lfo=audio.createOscillator(),lfoGain=audio.createGain();
   lfo.type="sine";lfo.frequency.value=.055;lfoGain.gain.value=260;
   lfo.connect(lfoGain);lfoGain.connect(filter.frequency);lfo.start();
   musicNodes=[master,filter,...pads,lfo];
   const melody=[587.33,698.46,880,1046.5,880,698.46,659.25,587.33];
   let step=0,chord=0;
   const playBell=()=>{
     if(!musicOn)return;
     const now=audio.currentTime,osc=audio.createOscillator(),gain=audio.createGain();
     osc.type="sine";osc.frequency.setValueAtTime(melody[step%melody.length],now);
     gain.gain.setValueAtTime(.0001,now);
     gain.gain.exponentialRampToValueAtTime(.032,now+.22);
     gain.gain.exponentialRampToValueAtTime(.0001,now+3.1);
     osc.connect(gain);gain.connect(filter);osc.start(now);osc.stop(now+3.2);
     step++;
     if(step%4===0){
       chord=(chord+1)%chordProgression.length;
       pads.forEach((pad,index)=>pad.frequency.setTargetAtTime(chordProgression[chord][index],audio.currentTime,2.2));
     }
   };
   musicOn=true;playBell();musicTimer=setInterval(playBell,2800);
   $("musicButton").textContent="♫";$("musicButton").setAttribute("aria-pressed","true");
   $("musicButton").setAttribute("aria-label","إيقاف موسيقى الفضاء");
 }catch(_){
   musicOn=false;if(musicTimer){clearInterval(musicTimer);musicTimer=null;}
   $("musicButton").setAttribute("aria-pressed","false");
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
   blackHoles.push({x,y:rand(height*.2,height*.58),r:24,life:7.5,spin:rand(0,6)});
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
function circleHit(a,b){const dx=a.x-b.x,dy=a.y-b.y,rr=a.r+b.r;return dx*dx+dy*dy<rr*rr;}
function collectStar(s){
 score+=10*combo;combo=Math.min(8,combo+1);comboTime=2.2;collected++;
 burst(s.x,s.y,"#ffd77a",12);sound(720+combo*55,.065,"triangle");
 if(collected>=20&&!missionDone){missionDone=true;score+=150;burst(player.x,player.y,"#76e4e4",28);sound(980,.22,"triangle");}
 updateHUD();
}
function collectPickup(p){
 if(p.kind==="shield"){shieldTime=6;magnetTime=0;burst(p.x,p.y,"#76e4e4",22);sound(840,.13,"sine");}
 else{magnetTime=7;shieldTime=0;burst(p.x,p.y,"#a99bff",22);sound(920,.13,"triangle");}
 updateHUD();
}
function collectArtifact(a){
 if(discovered.includes(a.id))return;
 discovered.push(a.id);safeSaveAtlas();score+=80;
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
 elapsed+=dt;const nextLevel=1+Math.floor(elapsed/18);if(nextLevel!==level){level=nextLevel;updateHUD();}
 const nextStage=Math.floor(elapsed/35)%STAGES.length;
 if(nextStage!==stageIndex){stageIndex=nextStage;updateHUD();sound(360,.16,"sine");}spawnClock+=dt;
 const interval=Math.max(.28,.88-level*.055);
 while(spawnClock>interval){spawnClock-=interval;spawn();}
 player.x+=(player.targetX-player.x)*Math.min(1,dt*13);
 player.y+=(player.targetY-player.y)*Math.min(1,dt*13);
 player.x=clamp(player.x,player.r+7,width-player.r-7);player.y=clamp(player.y,height*.42,height-28);
 player.invulnerable=Math.max(0,player.invulnerable-dt);
 if(comboTime>0){comboTime-=dt;if(comboTime<=0){combo=1;updateHUD();}}
 const hadPower=shieldTime>0||magnetTime>0;
 shieldTime=Math.max(0,shieldTime-dt);magnetTime=Math.max(0,magnetTime-dt);shake=Math.max(0,shake-dt*24);
 if(hadPower&&!shieldTime&&!magnetTime)updateHUD();
 if(shieldTime>0||magnetTime>0)$("powerTimer").style.width=(Math.max(shieldTime,magnetTime)/7*30)+"px";
 if(discoveryToastTime>0){
   discoveryToastTime-=dt;
   if(discoveryToastTime<=0){$("discoveryToast").classList.remove("show");$("discoveryToast").hidden=true;}
 }
 if(magnetTime>0){
   for(const s of stars){const dx=player.x-s.x,dy=player.y-s.y,d=Math.hypot(dx,dy);if(d<175&&d>1){const pull=(1-d/175)*420;s.x+=dx/d*pull*dt;s.y+=dy/d*pull*dt;}}
 }
 for(let i=blackHoles.length-1;i>=0;i--){
   const b=blackHoles[i];b.life-=dt;b.spin+=dt*.7;
   const dx=b.x-player.x,dy=b.y-player.y,d=Math.hypot(dx,dy);
   if(d<180&&d>1){
     const pull=(1-d/180)*118;
     player.x+=dx/d*pull*dt;player.y+=dy/d*pull*dt;
     player.targetX=clamp(player.targetX+dx/d*pull*dt*.55,player.r+7,width-player.r-7);
     player.targetY=clamp(player.targetY+dy/d*pull*dt*.55,height*.42,height-28);
   }
   if(d<b.r+player.r*.72&&player.invulnerable<=0){
     blackHoles.splice(i,1);
     if(shieldTime>0){
       shieldTime=0;score+=120;burst(b.x,b.y,"#c9aaff",34);sound(430,.24,"triangle");updateHUD();
     }else{hitRock(b);if(state!=="running")return;}
     continue;
   }
   if(b.life<=0)blackHoles.splice(i,1);
 }
 for(let i=artifacts.length-1;i>=0;i--){
   const a=artifacts[i];a.y+=a.vy*dt;a.spin+=dt*1.8;
   if(circleHit(player,a)){collectArtifact(a);artifacts.splice(i,1);continue;}
   if(a.y>height+25)artifacts.splice(i,1);
 }
 for(let i=stars.length-1;i>=0;i--){const s=stars[i];s.y+=s.vy*dt;s.spin+=dt*2.4;s.pulse+=dt*4;if(circleHit(player,s)){collectStar(s);stars.splice(i,1);updateHUD();continue;}if(s.y>height+25)stars.splice(i,1);}
 for(let i=pickups.length-1;i>=0;i--){const p=pickups[i];p.y+=p.vy*dt;p.spin+=dt*2.8;if(circleHit(player,p)){collectPickup(p);pickups.splice(i,1);continue;}if(p.y>height+25)pickups.splice(i,1);}
 for(let i=rocks.length-1;i>=0;i--){const r=rocks[i];r.x+=r.vx*dt;r.y+=r.vy*dt;r.rot+=r.spin*dt;if(r.x<r.r||r.x>width-r.r)r.vx*=-1;
   const dx=player.x-r.x,dy=player.y-r.y,d=Math.hypot(dx,dy);
   if(!r.nearMiss&&d<player.r+r.r+18&&d>player.r+r.r*.83){r.nearMiss=true;score+=5;burst(r.x,r.y,"#a99bff",5);updateHUD();}
   if(circleHit(player,{...r,r:r.r*.83})){rocks.splice(i,1);if(shieldTime>0){shieldTime=0;player.invulnerable=.65;burst(r.x,r.y,"#76e4e4",24);sound(520,.16,"triangle");updateHUD();}else hitRock(r);if(state!=="running")return;continue;}
   if(r.y>height+35)rocks.splice(i,1);
 }
 for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.985;p.vy*=.985;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
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
 ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.spin);
 const glow=ctx.createRadialGradient(0,0,b.r*.45,0,0,b.r*2.5);
 glow.addColorStop(0,"#08061200");glow.addColorStop(.48,"#9f78ff22");glow.addColorStop(1,"#9f78ff00");
 ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,b.r*2.5,0,Math.PI*2);ctx.fill();
 ctx.shadowBlur=22;ctx.shadowColor="#bd91ff";ctx.strokeStyle="#d4b7ff";ctx.lineWidth=5;
 ctx.beginPath();ctx.ellipse(0,0,b.r*1.8,b.r*.58,-.12,0,Math.PI*2);ctx.stroke();
 ctx.strokeStyle="#79dfe8";ctx.lineWidth=2;ctx.globalAlpha=.8;
 ctx.beginPath();ctx.ellipse(0,0,b.r*1.48,b.r*.43,.16,0,Math.PI*2);ctx.stroke();
 ctx.globalAlpha=1;ctx.shadowBlur=18;ctx.shadowColor="#05030a";ctx.fillStyle="#020208";
 ctx.beginPath();ctx.arc(0,0,b.r*.82,0,Math.PI*2);ctx.fill();
 ctx.shadowBlur=0;ctx.fillStyle="#e3d6ff";ctx.globalAlpha=.8;
 ctx.font="bold 7px Space Grotesk, sans-serif";ctx.textAlign="center";ctx.fillText("EVENT HORIZON",0,b.r+17);
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
$("exitButton").hidden=true;setBest();updateAtlasButton();renderAtlas();renderSkins();renderRecords();resize();draw(0);
})();