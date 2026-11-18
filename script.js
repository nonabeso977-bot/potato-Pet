(() => {
"use strict";
const $ = id => document.getElementById(id);
const canvas=$("arena"),ctx=canvas.getContext("2d");
const SAVE="orbitArcade.v1";
let best=Number(localStorage.getItem(SAVE)||0),score=0,lives=3,level=1,combo=1,comboTime=0;
let state="menu",last=0,elapsed=0,spawnClock=0,stars=[],rocks=[],particles=[],backgroundStars=[];
let width=0,height=0,dpr=1,player={x:0,y:0,targetX:0,targetY:0,r:13,invulnerable:0};
let pointerDown=false,muted=false,audio=null,runId=0;
const rand=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function format(n){return String(Math.floor(n)).padStart(6,"0")}
function setBest(){ $("best").textContent=format(best);$("menuBest").textContent=format(best); }
function resize(){
 const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;
 dpr=Math.min(window.devicePixelRatio||1,2);width=rect.width;height=rect.height;
 canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
 player.x=clamp(player.x||width/2,20,width-20);player.targetX=clamp(player.targetX||width/2,20,width-20);
 player.y=height*.78;player.targetY=player.y;
 backgroundStars=Array.from({length:Math.max(45,Math.round(width*height/6500))},()=>({x:rand(0,width),y:rand(0,height),r:rand(.4,1.7),a:rand(.2,.8),phase:rand(0,6)}));
}
function reset(){
 score=0;lives=3;level=1;combo=1;comboTime=0;elapsed=0;spawnClock=0;stars=[];rocks=[];particles=[];
 player={x:width/2,y:height*.78,targetX:width/2,targetY:height*.78,r:12,invulnerable:1.5};
 updateHUD();runId++;
}
function updateHUD(){
 $("score").textContent=format(score);$("best").textContent=format(best);$("level").textContent=String(level).padStart(2,"0");
 $("lives").querySelectorAll("i").forEach((el,i)=>el.classList.toggle("off",i>=lives));
 $("comboLabel").textContent="COMBO ×"+combo;
}
function showMessage(title,body,buttonText="متابعة الرحلة"){
 $("messageTitle").textContent=title;$("messageText").textContent=body;
 $("resumeButton").innerHTML=buttonText+' <b>↗</b>';$("arenaMessage").hidden=false;
}
function start(){
 $("intro").hidden=true;$("features").hidden=true;$("gamePanel").hidden=false;
 resize();reset();state="running";$("arenaMessage").hidden=true;$("pauseButton").textContent="Ⅱ";
 $("arenaHint").style.opacity="1";last=performance.now();requestAnimationFrame(loop);
}
function pause(){
 if(state!=="running")return;state="paused";$("pauseButton").textContent="▶";
 showMessage("استراحة في المدار","النتيجة الحالية: "+format(score),"متابعة الرحلة");
}
function resume(){
 if(state!=="paused")return;state="running";$("arenaMessage").hidden=true;$("pauseButton").textContent="Ⅱ";last=performance.now();requestAnimationFrame(loop);
}
function endGame(){
 state="over";if(score>best){best=score;localStorage.setItem(SAVE,String(best));setBest();}
 $("pauseButton").textContent="↻";showMessage("انتهت الرحلة","نتيجتك "+format(score)+" · "+(score>=best?"رقم قياسي جديد!":"حاولي تجاوز رقمك القياسي"),"رحلة جديدة");
 $("resumeButton").onclick=()=>{ $("resumeButton").onclick=null;start(); };
 $("exitButton").hidden=false;
}
function backToMenu(){
 state="menu";$("gamePanel").hidden=true;$("intro").hidden=false;$("features").hidden=false;
 $("resumeButton").onclick=null;$("exitButton").hidden=true;setBest();
}
function sound(freq=620,duration=.07,type="sine"){
 if(muted)return;
 try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();const osc=audio.createOscillator(),gain=audio.createGain();osc.type=type;osc.frequency.value=freq;gain.gain.setValueAtTime(.045,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+duration);}catch(_){}
}
function burst(x,y,color,count=10){
 for(let i=0;i<count;i++){const a=rand(0,Math.PI*2),speed=rand(35,180);particles.push({x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:rand(.25,.65),max:.65,size:rand(1,3),color});}
}
function spawn(){
 const x=rand(22,width-22);
 if(Math.random()<.56)stars.push({x,y:-15,r:8,vy:rand(95,145)+level*7,spin:rand(0,6),pulse:rand(0,6)});
 else rocks.push({x,y:-25,r:rand(11,20),vy:rand(115,175)+level*12,vx:rand(-18,18),rot:rand(0,6),spin:rand(-2,2),sides:Math.floor(rand(7,10)),seed:rand(0,100)});
}
function circleHit(a,b){const dx=a.x-b.x,dy=a.y-b.y,rr=a.r+b.r;return dx*dx+dy*dy<rr*rr;}
function collectStar(s){
 score+=10*combo;combo=Math.min(8,combo+1);comboTime=2.2;burst(s.x,s.y,"#ffd77a",12);sound(720+combo*55,.065,"triangle");
}
function hitRock(r){
 if(player.invulnerable>0)return;
 lives--;player.invulnerable=1.35;combo=1;comboTime=0;burst(player.x,player.y,"#ff9fcb",20);sound(150,.2,"sawtooth");updateHUD();
 if(lives<=0)endGame();
}
function update(dt){
 elapsed+=dt;level=1+Math.floor(elapsed/18);spawnClock+=dt;
 const interval=Math.max(.28,.88-level*.055);
 while(spawnClock>interval){spawnClock-=interval;spawn();}
 player.x+=(player.targetX-player.x)*Math.min(1,dt*13);
 player.y+=(player.targetY-player.y)*Math.min(1,dt*13);
 player.x=clamp(player.x,player.r+7,width-player.r-7);player.y=clamp(player.y,height*.42,height-28);
 player.invulnerable=Math.max(0,player.invulnerable-dt);
 if(comboTime>0){comboTime-=dt;if(comboTime<=0){combo=1;updateHUD();}}
 for(let i=stars.length-1;i>=0;i--){const s=stars[i];s.y+=s.vy*dt;s.spin+=dt*2.4;s.pulse+=dt*4;if(circleHit(player,s)){collectStar(s);stars.splice(i,1);updateHUD();continue;}if(s.y>height+25)stars.splice(i,1);}
 for(let i=rocks.length-1;i>=0;i--){const r=rocks[i];r.x+=r.vx*dt;r.y+=r.vy*dt;r.rot+=r.spin*dt;if(r.x<r.r||r.x>width-r.r)r.vx*=-1;if(circleHit(player,{...r,r:r.r*.83})){rocks.splice(i,1);hitRock(r);if(state!=="running")return;continue;}if(r.y>height+35)rocks.splice(i,1);}
 for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.985;p.vy*=.985;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
 updateHUD();
}
function drawBackground(t){
 ctx.fillStyle="#080f24";ctx.fillRect(0,0,width,height);
 const glow=ctx.createRadialGradient(width*.5,height*.38,5,width*.5,height*.38,width*.7);glow.addColorStop(0,"#1b2a4b55");glow.addColorStop(1,"#080f2400");ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
 for(const s of backgroundStars){const alpha=s.a*(.65+.35*Math.sin(t*.001+s.phase));ctx.globalAlpha=alpha;ctx.fillStyle="#c9dcff";ctx.fillRect(s.x,s.y,s.r,s.r);}ctx.globalAlpha=1;
 ctx.strokeStyle="#8ca8d00c";ctx.lineWidth=1;
 for(let y=height*.6;y<height;y+=38){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y);ctx.stroke();}
}
function drawStar(s){
 ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.spin);const pulse=1+Math.sin(s.pulse)*.13;
 ctx.scale(pulse,pulse);ctx.shadowBlur=18;ctx.shadowColor="#ffd77a";
 ctx.fillStyle="#ffe39a";ctx.beginPath();
 for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2===0?s.r:s.r*.42;const x=Math.cos(a)*r,y=Math.sin(a)*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}
 ctx.closePath();ctx.fill();ctx.restore();
}
function drawRock(r){
 ctx.save();ctx.translate(r.x,r.y);ctx.rotate(r.rot);ctx.beginPath();
 for(let i=0;i<r.sides;i++){const a=i/r.sides*Math.PI*2,rr=r.r*(.78+.22*Math.sin(i*13+r.seed));const x=Math.cos(a)*rr,y=Math.sin(a)*rr;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}
 ctx.closePath();const g=ctx.createLinearGradient(-r.r,-r.r,r.r,r.r);g.addColorStop(0,"#c18ca8");g.addColorStop(.55,"#6c668d");g.addColorStop(1,"#333c60");ctx.fillStyle=g;ctx.shadowBlur=13;ctx.shadowColor="#d58eaf55";ctx.fill();ctx.strokeStyle="#f0b7d655";ctx.lineWidth=1;ctx.stroke();
 ctx.fillStyle="#27304c88";ctx.beginPath();ctx.arc(-r.r*.2,-r.r*.12,r.r*.2,0,Math.PI*2);ctx.fill();ctx.restore();
}
function drawPlayer(t){
 ctx.save();ctx.translate(player.x,player.y);
 if(player.invulnerable>0&&Math.floor(t/90)%2===0)ctx.globalAlpha=.35;
 ctx.shadowBlur=23;ctx.shadowColor="#76e4e4aa";
 const flame=rand(10,18);const fg=ctx.createLinearGradient(0,8,0,flame+17);fg.addColorStop(0,"#fff0b1");fg.addColorStop(.4,"#76e4e4");fg.addColorStop(1,"#a99bff00");ctx.fillStyle=fg;ctx.beginPath();ctx.moveTo(-5,8);ctx.lineTo(0,flame+17);ctx.lineTo(5,8);ctx.fill();
 ctx.beginPath();ctx.moveTo(0,-17);ctx.lineTo(13,12);ctx.lineTo(0,8);ctx.lineTo(-13,12);ctx.closePath();const g=ctx.createLinearGradient(-12,0,12,0);g.addColorStop(0,"#68bfcf");g.addColorStop(.5,"#f0ffff");g.addColorStop(1,"#a99bff");ctx.fillStyle=g;ctx.fill();ctx.strokeStyle="#d9ffff";ctx.lineWidth=1;ctx.stroke();
 ctx.fillStyle="#192c4b";ctx.beginPath();ctx.ellipse(0,-4,4,7,0,0,Math.PI*2);ctx.fill();
 ctx.restore();
}
function draw(t){
 drawBackground(t);stars.forEach(drawStar);rocks.forEach(drawRock);
 for(const p of particles){ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.color;ctx.shadowBlur=9;ctx.shadowColor=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;ctx.shadowBlur=0;
 if(state!=="menu")drawPlayer(t);
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
$("pauseButton").addEventListener("click",()=>state==="running"?pause():state==="over"?start():null);
$("resumeButton").addEventListener("click",()=>state==="paused"?resume():null);
$("exitButton").addEventListener("click",backToMenu);
$("soundButton").addEventListener("click",()=>{muted=!muted;$("soundButton").textContent=muted?"♪̸":"♫";$("soundButton").setAttribute("aria-label",muted?"تشغيل المؤثرات":"إيقاف المؤثرات");if(!muted)sound();});
window.addEventListener("resize",()=>{if(!$("gamePanel").hidden){resize();draw(performance.now());}});
document.addEventListener("visibilitychange",()=>{if(document.hidden&&state==="running")pause();});
$("exitButton").hidden=true;setBest();resize();draw(0);
})();