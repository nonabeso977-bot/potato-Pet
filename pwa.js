(() => {
"use strict";
const installButton=document.getElementById("installAppButton");
const shareButton=document.getElementById("shareAppButton");
let installPrompt=null;
const isStandalone=()=>window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===true;
const notify=message=>{
 let toast=document.getElementById("pwaNotice");
 if(!toast){
  toast=document.createElement("div");
  toast.id="pwaNotice";
  toast.setAttribute("role","status");
  toast.style.cssText="position:fixed;z-index:100;bottom:calc(18px + env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);width:min(90%,420px);padding:12px 16px;border:1px solid #76e4e477;border-radius:13px;background:#101a32;color:#eef3ff;box-shadow:0 12px 35px #0009;font:12px Changa,sans-serif;text-align:center;line-height:1.8";
  document.body.appendChild(toast);
 }
 toast.textContent=message;
 toast.hidden=false;
 clearTimeout(toast._timer);
 toast._timer=setTimeout(()=>{toast.hidden=true;},4200);
};
if(isStandalone()){
 document.documentElement.classList.add("installed-app");
 if(installButton)installButton.hidden=true;
}
window.addEventListener("beforeinstallprompt",event=>{
 event.preventDefault();
 installPrompt=event;
 if(installButton)installButton.hidden=false;
});
window.addEventListener("appinstalled",()=>{
 installPrompt=null;
 if(installButton)installButton.hidden=true;
 notify("تم تثبيت مدار. أهلًا بكِ خارج المتصفح ✦");
});
installButton?.addEventListener("click",async()=>{
 if(isStandalone()){notify("مدار مثبت بالفعل على هذا الجهاز.");return;}
 if(installPrompt){
  installPrompt.prompt();
  const choice=await installPrompt.userChoice;
  if(choice?.outcome==="accepted")installButton.hidden=true;
  installPrompt=null;
  return;
 }
 const ua=navigator.userAgent||"";
 if(/Android/i.test(ua)){
  notify("افتحي قائمة ⋮ في Chrome ثم اختاري «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية». إذا كنتِ داخل تطبيق آخر، افتحي الرابط في Chrome.");
 }else if(/iPhone|iPad|iPod/i.test(ua)){
  notify("من Safari اضغطي «مشاركة» ثم «إضافة إلى الشاشة الرئيسية».");
 }else{
  notify("من قائمة المتصفح اختاري «تثبيت مدار» أو «إنشاء اختصار».");
 }
});
shareButton?.addEventListener("click",async()=>{
 const shareData={title:"مدار | ORBIT ARCADE",text:"جربي مدار، لعبة الأركيد الفضائية!",url:location.href};
 try{
  if(navigator.share)await navigator.share(shareData);
  else if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(location.href);notify("نسخت رابط مدار. أرسليه للعائلة ✦");}
  else notify("انسخي رابط اللعبة من شريط العنوان وشاركيه مع العائلة.");
 }catch(error){if(error?.name!=="AbortError")notify("تعذرت المشاركة من هذا المتصفح. انسخي الرابط وشاركيه يدويًا.");}
});
if("serviceWorker" in navigator){
 window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>notify("اللعبة تعمل، لكن تعذر تفعيل وضع العمل دون إنترنت.")));
}
})();