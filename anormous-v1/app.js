const app=document.getElementById("app");
const store=JSON.parse(localStorage.getItem("anormous_v1")||"{}");
function save(){localStorage.setItem("anormous_v1",JSON.stringify(store))}
function setBest(key,val,lower=true){if(store[key]===undefined || (lower?val<store[key]:val>store[key])){store[key]=val;save();return true}return false}
function showHome(){
 app.innerHTML=`<section class="hero"><div class="eyebrow">Mobile performance lab</div><h1>TEST.<br>TRAIN.<br>IMPROVE.</h1><p>Free browser tests built for your phone. See your score, practice it, and come back to beat it.</p></section>
 <div class="section-title">Tests</div><div class="grid">
 ${card("⚡","Reaction","How fast can you react?","showReaction()")}
 ${card("🧠","Memory","Remember the pattern.","showMemory()")}
 ${card("👆","Tap Accuracy","How accurate are your taps?","showTap()")}
 ${card("⌨️","Typing","Speed + accuracy.","showTyping()")}
 </div>
 <div class="section-title">Your progress</div>
 <div class="card" onclick="showProgress()"><div class="icon">📈</div><h2>Improve your scores</h2><p>Your best scores stay on this device. No account.</p></div>`;
}
function card(icon,title,desc,fn){return `<button class="card" onclick="${fn}" style="text-align:left;width:100%;cursor:pointer"><div class="icon">${icon}</div><h2>${title}</h2><p>${desc}</p></button>`}
function shell(title,body){app.innerHTML=`<section class="test"><div class="test-head"><a class="back" href="#" onclick="showHome();return false">← Home</a><h1>${title}</h1><span></span></div>${body}</section>`}
function showReaction(){
 let state="wait",start=0,timer=null,tries=0,best=null;
 shell("Reaction",`<p style="color:var(--muted)">Wait for green, then tap anywhere. Don't tap early.</p><div id="rstage" class="stage wait"><button id="rbtn">START</button></div><div id="rmsg" style="text-align:center;color:var(--muted)">Best: ${store.reaction?store.reaction+" ms":"—"}</div>`);
 const stage=document.getElementById("rstage"),btn=document.getElementById("rbtn");
 btn.onclick=()=>{
   if(state==="wait"){state="ready";stage.className="stage ready";btn.textContent="WAIT...";let delay=700+Math.random()*2400;timer=setTimeout(()=>{state="go";start=performance.now();stage.className="stage go";btn.textContent="TAP!",navigator.vibrate?.(15)},delay)}
   else if(state==="ready"){clearTimeout(timer);state="wait";stage.className="stage wait";btn.textContent="TOO EARLY — TAP TO TRY AGAIN"}
   else if(state==="go"){let ms=Math.round(performance.now()-start);tries++;best=best?Math.min(best,ms):ms;setBest("reaction",ms,true);state="wait";stage.className="stage wait";btn.textContent="AGAIN";document.getElementById("rmsg").innerHTML=`<strong>${ms} ms</strong> &nbsp; Best: <strong>${store.reaction} ms</strong>`}
 };
}
function showTap(){
 let hits=0,total=0,running=false,ends=0;
 shell("Tap Accuracy",`<p style="color:var(--muted)">Tap the targets as quickly as you can. 20 targets.</p><div id="tstage" class="stage wait"><button id="tbtn">START</button></div><div id="tmsg" style="text-align:center;color:var(--muted)">Best accuracy: ${store.tapAcc?store.tapAcc+"%":"—"}</div>`);
 const s=document.getElementById("tstage"),b=document.getElementById("tbtn");
 b.onclick=()=>{if(!running){running=true;hits=0;total=0;next()}};
 function next(){if(total>=20){running=false;let acc=Math.round(hits/20*100);setBest("tapAcc",acc,false);s.className="stage wait";b.textContent=`DONE — ${acc}%`;document.getElementById("tmsg").textContent=`Best accuracy: ${store.tapAcc}%`;return}
  total++;let x=12+Math.random()*76,y=12+Math.random()*76;
  b.style.position="absolute";b.style.width="62px";b.style.height="62px";b.style.borderRadius="50%";b.style.background="var(--accent)";b.style.left=x+"%";b.style.top=y+"%";b.textContent="";
  let born=performance.now();b.onclick=()=>{hits++;next()};}
}
function showMemory(){
 let level=3,sequence=[],input=[],phase="idle";
 shell("Memory",`<p style="color:var(--muted)">Memorize the highlighted tiles, then repeat the pattern.</p><div class="stage wait" style="padding:20px"><div id="mgrid" class="memory-grid"></div></div><div id="mmsg" style="text-align:center;color:var(--muted)">Level ${level}</div>`);
 const g=document.getElementById("mgrid"),msg=document.getElementById("mmsg");
 function build(){g.innerHTML="";for(let i=0;i<9;i++){let d=document.createElement("button");d.className="mem";d.dataset.i=i;d.onclick=()=>tap(i);g.appendChild(d)}}
 function start(){build();sequence=[];input=[];while(sequence.length<level){let n=Math.floor(Math.random()*9);if(!sequence.includes(n))sequence.push(n)}phase="show";msg.textContent=`Level ${level} — memorize`;sequence.forEach((n,i)=>setTimeout(()=>g.children[n].classList.add("on"),i*500));setTimeout(()=>{[...g.children].forEach(x=>x.classList.remove("on"));phase="input";msg.textContent="Repeat it";},level*500+500)}
 function tap(i){if(phase!=="input")return;input.push(i);g.children[i].classList.add("on");setTimeout(()=>g.children[i].classList.remove("on"),180);if(input[input.length-1]!==sequence[input.length-1]){phase="idle";level=Math.max(3,level-1);msg.innerHTML=`❌ Try again — highest level: <strong>${Math.max(2,input.length-1)}</strong>`;setTimeout(start,700);return}if(input.length===sequence.length){phase="idle";let old=store.memory||0;store.memory=Math.max(old,level);save();msg.innerHTML=`✅ Level ${level} complete — <strong>Next level</strong>`;level++;setTimeout(start,800)}}
 msg.innerHTML=`<button class="primary" onclick="this.remove();start()">START MEMORY TEST</button>`;
}
function showTyping(){
 const text="speed comes from accuracy first";
 shell("Typing",`<p style="color:var(--muted)">Type the sentence exactly as shown.</p><div class="card"><h2 id="quote">${text}</h2></div><input id="type" class="input" placeholder="Tap here and start typing" autocomplete="off"><div id="typemsg" style="margin-top:15px;color:var(--muted)">Best: ${store.typing?store.typing+" WPM":"—"}</div>`);
 const inp=document.getElementById("type"),msg=document.getElementById("typemsg");let started=0;
 inp.oninput=()=>{if(!started)started=performance.now();if(inp.value===text){let sec=(performance.now()-started)/1000;let wpm=Math.round((text.trim().split(/\s+/).length/sec)*60);setBest("typing",wpm,false);msg.innerHTML=`🔥 <strong>${wpm} WPM</strong> — Best: <strong>${store.typing} WPM</strong>`;inp.disabled=true}};
}
function showProgress(){
 let rows=[["⚡ Reaction",store.reaction?store.reaction+" ms":"Not tested"],["🧠 Memory",store.memory?`Level ${store.memory}`:"Not tested"],["👆 Tap Accuracy",store.tapAcc?store.tapAcc+"%":"Not tested"],["⌨️ Typing",store.typing?store.typing+" WPM":"Not tested"]];
 shell("Progress",`<p style="color:var(--muted)">Everything is stored locally on this device. No account required.</p>${rows.map(r=>`<div class="stat"><span>${r[0]}</span><span>${r[1]}</span></div>`).join("")}<div style="margin-top:18px"><button class="secondary" onclick="localStorage.removeItem('anormous_v1');location.reload()">Reset local progress</button></div>`);
}
showHome();