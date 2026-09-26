const app=document.getElementById("app");
const KEY="anormous_v2_history";
let mode="fix";

const modes={
fix:["Fix grammar & spelling","Clean mistakes while keeping your meaning."],
improve:["Make it better","Improve clarity, flow and wording."],
professional:["Make it professional","Turn casual text into polished writing."],
shorten:["Shorten it","Keep the important parts, remove the fluff."],
simple:["Make it simple","Rewrite complicated wording so it is easier to understand."],
friendly:["Make it friendly","Make the tone natural, warm and easy to read."]
};

function history(){try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch{return[]}}
function saveHistory(item){const h=history();h.unshift(item);localStorage.setItem(KEY,JSON.stringify(h.slice(0,12)))}

function goHome(){
app.innerHTML=`
<section class="hero">
 <div class="pill">Free • Mobile first • Private</div>
 <h1>FIX.<br><i>IMPROVE.</i><br>DONE.</h1>
 <p>Paste anything. Pick what you want changed. Get a cleaner version in seconds — without leaving your phone.</p>
</section>
<div class="editor">
 <div class="editor-top"><b>Your text</b><button class="clear" onclick="clearText()">Clear</button></div>
 <textarea id="input" class="input" maxlength="5000" placeholder="Paste a message, caption, paragraph, email..."></textarea>
 <div id="count" class="count">0 / 5000</div>
</div>
<div class="section-title">What do you want?</div>
<div class="modes" id="modes"></div>
<div class="actions"><button id="run" class="primary" onclick="runFix()">✦ Improve my text</button></div>
<div id="output" class="output">
 <div class="out-head"><b>Your improved version</b><button class="copy" onclick="copyResult()">Copy</button></div>
 <div id="result" class="result"></div>
 <div id="meta" class="meta"></div>
</div>
<div class="trust"><span>✓ No account</span><span>✓ No upload</span><span>✓ Works on GitHub Pages</span></div>
`;
const m=document.getElementById("modes");
m.innerHTML=Object.entries(modes).map(([key,v])=>`<button class="mode ${key===mode?"active":""}" onclick="selectMode('${key}')"><b>${v[0]}</b><small>${v[1]}</small></button>`).join("");
const input=document.getElementById("input");input.oninput=()=>document.getElementById("count").textContent=input.value.length+" / 5000";
}

function selectMode(next){mode=next;document.querySelectorAll(".mode").forEach(x=>x.classList.remove("active"));event.currentTarget.classList.add("active");document.getElementById("run").textContent="✦ "+modes[next][0]}
function clearText(){const x=document.getElementById("input");x.value="";x.dispatchEvent(new Event("input"));document.getElementById("output").classList.remove("show")}
function clean(s){return s.replace(/[ \t]+/g," ").replace(/\n{3,}/g,"\n\n").trim()}
function fixText(s){
let x=clean(s);
x=x.replace(/\bi\b/g,"I");
x=x.replace(/\s+([,.!?;:])/g,"$1");
x=x.replace(/([.!?])([A-Za-z])/g,"$1 $2");
x=x.replace(/\bi'm\b/gi,"I'm").replace(/\bi've\b/gi,"I've").replace(/\bdont\b/gi,"don't").replace(/\bcant\b/gi,"can't").replace(/\bwont\b/gi,"won't").replace(/\bim\b/gi,"I'm").replace(/\bpls\b/gi,"please").replace(/\bthx\b/gi,"thanks").replace(/\bu\b/gi,"you");
return sentenceCase(x);
}
function sentenceCase(s){return s.replace(/(^|[.!?]\s+)([a-z])/g,(m,a,b)=>a+b.toUpperCase())}
function improveText(s){let x=fixText(s);x=x.replace(/\bvery\s+very\b/gi,"extremely").replace(/\breally\s+really\b/gi,"extremely").replace(/\bthing is\b/gi,"the main point is").replace(/\bi think that\b/gi,"I believe").return x}
function professionalText(s){let x=improveText(s);x=x.replace(/\bhey\b/gi,"Hello").replace(/\bhi\b/gi,"Hello").replace(/\bthanks!\b/gi,"Thank you.").replace(/\bthx\b/gi,"Thank you").replace(/\bokay\b/gi,"Understood");return x}
function shortenText(s){let x=improveText(s);x=x.replace(/\b(in order to)\b/gi,"to").replace(/\b(due to the fact that)\b/gi,"because").replace(/\b(at this point in time)\b/gi,"now").replace(/\b(a large number of)\b/gi,"many").replace(/\b(in the event that)\b/gi,"if");return x.split(/\n/).map(line=>line.trim()).join("\n")}
function simpleText(s){let x=improveText(s);x=x.replace(/\bapproximately\b/gi,"about").replace(/\butilize\b/gi,"use").replace(/\bcommence\b/gi,"start").replace(/\badditional\b/gi,"extra").replace(/\bsubsequent\b/gi,"next").replace(/\bimplement\b/gi,"use");return x}
function friendlyText(s){let x=improveText(s);x=x.replace(/^Hello[,!]?/i,"Hey,");return x}

function transform(s){switch(mode){case"fix":return fixText(s);case"improve":return improveText(s);case"professional":return professionalText(s);case"shorten":return shortenText(s);case"simple":return simpleText(s);case"friendly":return friendlyText(s);default:return s}}

function runFix(){
const input=document.getElementById("input"),text=input.value.trim(),out=document.getElementById("output"),result=document.getElementById("result"),meta=document.getElementById("meta");
if(!text){input.focus();input.placeholder="Paste something first — a message, caption, paragraph or email.";return}
const run=document.getElementById("run");run.disabled=true;run.textContent="Working...";
setTimeout(()=>{const value=transform(text);result.textContent=value;meta.textContent="Done • "+value.length+" characters";out.classList.add("show");saveHistory({mode:modes[mode][0],input:text,output:value,time:new Date().toLocaleString()});run.disabled=false;run.textContent="✦ "+modes[mode][0]},180);
}
async function copyResult(){const value=document.getElementById("result").textContent;if(!value)return;try{await navigator.clipboard.writeText(value);document.querySelector(".copy").textContent="Copied ✓";setTimeout(()=>document.querySelector(".copy").textContent="Copy",1200)}catch{}}
function toggleHistory(){
const h=history();const layer=document.createElement("div");layer.className="history open";layer.id="historyLayer";
layer.innerHTML=`<div class="sheet"><div class="sheet-head"><b>Recent fixes</b><button onclick="document.getElementById('historyLayer').remove()">×</button></div>${h.length?h.map((x,i)=>`<div class="history-item"><b>${escapeHtml(x.mode)}</b><p>${escapeHtml(x.output)}</p></div>`).join(""):'<div class="empty">No fixes yet. Your recent results will appear here.</div>'}</div>`;
document.body.appendChild(layer);
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
goHome();
