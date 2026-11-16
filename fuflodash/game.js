"use strict";
// ================= WUBBLE DASH v4 =================
const W=960,H=480,GROUND=400,CEIL=40,CELL=40,SPEED=6,PS=40;
const BPM=100;
const BEAT_PX=SPEED*60*60/BPM;
const MODES=["cube","ship","ball","ufo","wave","robot","spider"];
const MODE_RU={cube:"Куб",ship:"Кораблик",ball:"Шар",ufo:"НЛО",wave:"Волна",robot:"Робот",spider:"Паук",bebra:"★ Бебра"};
const COLORS=["#ffffff","#9e9e9e","#101010","#e53935","#fb8c00","#fdd835","#43a047","#00bcd4","#1e88e5","#8e24aa","#ec407a","#6d4c41"];
const DIFF_EMOJI={"Легко":"😀","Средне":"😐","Сложно":"😰","Хардкор":"😈","Безумие":"💀","Демон":"💀","Свой":"🛠️"};
const ORBS=[250,250,450,450,700,700,1000,1000]; // награда за прохождение уровней 1–8
const LVL_UNLOCK=[[0,"cube",2],[1,"cube",3],[3,"ship",2],[4,"ufo",2],[5,"spider",2],[6,"ball",2],[7,"wave",2]];
const COIN_UNLOCK=[[2,"ship",3],[4,"robot",2],[8,"spider",3],[9,"cube",4]];
const CASES=[["c-normal","Обычный",30,[2,6]],["c-uncommon","Необычный",80,[6,10]],["c-rare","Редкий",200,[10,15]],["c-mythic","Мистический",500,[15,25]]];
const THEMES=[
 {bg:"#0e1440",gr:"#1a2a6c",ln:"#4f74e3",bl:"#2a3f8f"},
 {bg:"#04202c",gr:"#0b3a4a",ln:"#22a5b5",bl:"#0d4a5e"},
 {bg:"#160a2e",gr:"#2a1256",ln:"#8a4fe3",bl:"#33176b"},
 {bg:"#3a2410",gr:"#5e3a1a",ln:"#e3924f",bl:"#6e4622"},
 {bg:"#04122e",gr:"#0a2456",ln:"#3f74e3",bl:"#123a8f"},
 {bg:"#2a0a14",gr:"#4a1024",ln:"#e34f6a",bl:"#5e1a30"},
 {bg:"#120420",gr:"#260a40",ln:"#a04fe3",bl:"#2e1060"},
 {bg:"#0a0010",gr:"#1c0330",ln:"#7a1fd0",bl:"#2a0650"}
];
const CV=document.getElementById("cv"),CT=CV.getContext("2d");
function loadLS(k){try{return JSON.parse(localStorage.getItem(k)||"null")}catch(e){return null}}
let cfg=loadLS("wd_cfg")||{};
let st=loadLS("wd_st")||{best:{},wins:{},pwins:{},coins:{}};
st.orbs=st.orbs||0;st.u=st.u||{};st.orbGot=st.orbGot||{};
function save(){localStorage.setItem("wd_cfg",JSON.stringify(cfg));localStorage.setItem("wd_st",JSON.stringify(st));}
MODES.forEach(m=>{if(!cfg[m])cfg[m]={i:0,n:1,page:1,c:"#ffffff",bebra:false};else{if(cfg[m].n===undefined)cfg[m].n=1;if(!cfg[m].page)cfg[m].page=1;}});

// ================= УРОВНИ =================
// s шипы · sm малый · sl низкий · cs потолочные · b блок · bC с потолка · bs блок+шипы
// hb полублок · ramp пандус · pad жёлтая/padH красная джампада
// orb/porb/borb орбы · os шипы+орб · p портал режима · dual/single дуал-порталы
// flip переворот · g гравитация · mini/big мини · sp скорость · rhy ритм-шипы
// m монета · mY монета на высоте · fork развилка · wtri коридор волны · donut пончик · pill туннель
const SEG={
 S1a:[["flat",8],["m",1],["s",1],["flat",4],["sm",2],["flat",4],["b",1,3],["donut",2],["flat",3]],
 S1b:[["flat",6],["s",2],["flat",4],["pad"],["flat",2],["b",2,4],["flat",4],["sl",1],["m",1],["flat",4]],
 S1c:[["p","ship"],["flat",3],["pill",2,3],["mY",240],["flat",2],["pill",3,2],["flat",2],["cs",2],["pill",2,2],["mY",260],["flat",3],["p","cube"],["flat",3]],
 S1d:[["flat",4],["s",2],["flat",4],["b",1,3],["flat",2],["b",1,3],["flat",3],["s",2],["m",1],["flat",6],["end"]],
 T1:[["flat",8],["m",1],["s",2],["flat",3],["sm",3],["flat",4],["b",2,3],["donut",3],["flat",3],["s",1],["flat",4]],
 T2:[["pad"],["flat",2],["b",2,3],["flat",3],["padH"],["flat",2],["s",3],["flat",4],["m",1],["flat",2]],
 T3:[["p","ship"],["flat",3],["pill",2,2],["cs",2],["mY",240],["pill",3,2],["flat",2],["pill",2,3],["cs",1],["p","cube"],["flat",3]],
 T4:[["flat",4],["s",2],["flat",3],["b",1,3],["s",2],["flat",4],["os",2],["m",1],["flat",6],["end"]],
 U1:[["flat",8],["m",1],["s",2],["flat",4],["b",1,3],["flat",2],["s",2],["flat",4]],
 U2:[["p","ball"],["flat",3],["s",1],["flat",3],["cs",1],["mY",240],["flat",3],["s",2],["flat",4],["cs",1],["flat",4]],
 U3:[["borb",1],["flat",3],["s",2],["flat",4],["b",2,3],["flat",3],["g",1],["m",1],["flat",2]],
 U4:[["p","cube"],["flat",3],["os",2],["flat",3],["ramp",3],["flat",2],["b",1,3],["flat",3],["s",2],["flat",5],["end"]],
 V1:[["flat",8],["m",1],["s",2],["flat",3],["os",2],["flat",3],["hb",4],["flat",3]],
 V2:[["mini"],["flat",2],["rhy",8,1],["flat",2],["cs",1],["m",1],["flat",3],["pill",1,3],["flat",2]],
 V3:[["big"],["g",-1],["flat",4],["bC",2,3],["flat",3],["bC",1,3],["s",1],["flat",3],["g",1],["flat",2]],
 V4:[["g",1],["flat",3],["s",2],["flat",4],["p","ufo"],["flat",3],["cs",1],["flat",3],["s",1],["flat",3],["cs",2],["m",1],["flat",4]],
 V5:[["p","cube"],["flat",3],["pad"],["flat",2],["b",2,3],["flat",3],["os",2],["m",1],["flat",6],["end"]],
 W1:[["flat",8],["m",1],["s",2],["flat",3],["b",1,3],["flat",2],["s",2],["flat",4],["pad"],["flat",2],["b",2,3],["flat",4]],
 W2:[["p","ship"],["flat",3],["pill",2,2],["cs",2],["pill",3,3],["mY",250],["flat",2],["pill",2,3],["cs",2],["flat",3]],
 W3:[["p","wave"],["flat",2],["pill",3,3],["flat",1],["pill",2,2],["flat",1],["pill",3,3],["flat",2],["cs",2],["flat",3]],
 W4:[["p","cube"],["flat",3],["s",2],["flat",3],["b",2,3],["m",1],["flat",3],["os",2],["flat",5],["end"]],
 X1:[["p","robot"],["m",1],["flat",3],["s",2],["flat",3],["b",1,2],["b",2,2],["flat",3],["rhy",6,2],["flat",3]],
 X2:[["p","spider"],["flat",3],["s",1],["flat",3],["cs",1],["m",1],["flat",3],["s",1],["flat",3],["cs",2],["flat",4]],
 X3:[["p","cube"],["flip"],["flat",4],["bC",2,3],["flat",3],["bC",1,3],["flat",3],["s",1],["flat",3],["flip"],["m",1],["flat",3]],
 X4:[["flat",3],["s",2],["flat",3],["s",2],["flat",4],["padH"],["flat",2],["bs",3,5,1],["flat",3],["os",3],["flat",6],["end"]],
 Y1:[["flat",8],["m",1],["s",2],["flat",3],["b",1,3],["flat",2],["s",2],["flat",3],["pad"],["flat",2],["b",2,4],["flat",4]],
 Y2:[["sp",1.5],["p","ship"],["flat",3],["fork",4],["flat",2],["pill",3,2],["mY",240],["cs",2],["flat",3]],
 Y3:[["p","wave"],["flat",2],["wtri",5],["flat",1],["pill",3,3],["m",1],["pill",2,2],["cs",1],["flat",2]],
 Y4:[["sp",1],["p","cube"],["flat",3],["mini"],["rhy",6,1],["flat",2],["big"],["flat",3]],
 Y5:[["p","ball"],["flat",3],["s",1],["flat",3],["cs",1],["m",1],["flat",3],["s",2],["flat",4]],
 Y6:[["p","cube"],["flat",3],["padH"],["flat",2],["b",3,4],["flat",3],["ramp",3],["flat",2],["os",3],["m",1],["flat",3],["s",2],["flat",8],["end"]],
 // ---- Уровень 8: демон (аналог Clubstep) ----
 H1:[["sp",2],["flat",6],["m",1],["rhy",8,1],["flat",2],["pill",1,4],["pill",2,4],["pill",1,5],["flat",2],["s",2],["flat",3]],
 H2:[["p","wave"],["flat",2],["wtri",6],["flat",1],["pill",1,4],["pill",2,4],["pill",1,5],["cs",2],["flat",2]],
 H3:[["p","cube"],["dual"],["flat",3],["s",1],["flat",4],["s",1],["flat",4],["cs",1],["flat",4],["cs",1],["flat",4],["single"],["flat",3]],
 H4:[["p","cube"],["sp",1.5],["flat",3],["rhy",10,1],["flat",2],["pill",1,4],["mY",300],["pill",1,4],["flat",2],["pad"],["flat",2],["bs",2,4,2],["flat",2],["os",3],["flat",2],["s",2],["m",1],["flat",8],["end"]]
};
const LEVELS=[
 {name:"Stereo Madness",rarity:"r-blue",diff:"Легко",spec:[...SEG.S1a,...SEG.S1b,...SEG.S1c,...SEG.S1a,...SEG.S1b,...SEG.S1c,...SEG.S1d]},
 {name:"Back on Track",rarity:"r-blue",diff:"Легко",spec:[...SEG.T1,...SEG.T2,...SEG.T3,...SEG.T1,...SEG.T2,...SEG.T3,...SEG.T4]},
 {name:"Polargeist",rarity:"r-green",diff:"Средне",spec:[...SEG.U1,...SEG.U2,...SEG.U3,...SEG.U1,...SEG.U2,...SEG.U3,...SEG.U4]},
 {name:"Dry Out",rarity:"r-green",diff:"Средне",spec:[...SEG.V1,...SEG.V2,...SEG.V3,...SEG.V4,...SEG.V2,...SEG.V5]},
 {name:"Base After Base",rarity:"r-yellow",diff:"Сложно",spec:[...SEG.W1,...SEG.W2,...SEG.W3,...SEG.W1,...SEG.W2,...SEG.W3,...SEG.W4]},
 {name:"Can't Let Go",rarity:"r-yellow",diff:"Сложно",spec:[...SEG.X1,...SEG.X2,...SEG.X3,...SEG.X1,...SEG.X2,...SEG.X3,...SEG.X4]},
 {name:"Jumper",rarity:"r-purple",diff:"Хардкор",spec:[...SEG.Y1,...SEG.Y2,...SEG.Y3,...SEG.Y4,...SEG.Y5,...SEG.Y3,...SEG.Y6]},
 {name:"CLUBSTEP",rarity:"r-red",diff:"Демон",spec:[...SEG.H1,...SEG.H2,...SEG.H3,...SEG.H4]}
];
function buildLevel(spec){
  let cur=300,objs=[],coins=0;
  const spike=(x,y,d)=>objs.push({t:d?"spikeC":"spike",x,y});
  for(const tok of spec){
    const[k,...a]=tok;
    if(k==="flat")cur+=a[0]*CELL;
    else if(k==="s"){for(let i=0;i<a[0];i++)spike(cur+i*CELL,GROUND,false);cur+=a[0]*CELL+CELL;}
    else if(k==="sm"){for(let i=0;i<a[0];i++)objs.push({t:"sm",x:cur+i*CELL,y:GROUND});cur+=a[0]*CELL+CELL;}
    else if(k==="sl"){objs.push({t:"sl",x:cur,y:GROUND});cur+=CELL;}
    else if(k==="cs"){for(let i=0;i<a[0];i++)spike(cur+i*CELL,CEIL,true);cur+=a[0]*CELL+CELL;}
    else if(k==="b"){objs.push({t:"block",x:cur,y:GROUND-a[0]*CELL,w:a[1]*CELL,h:a[0]*CELL});cur+=a[1]*CELL;}
    else if(k==="bC"){objs.push({t:"block",x:cur,y:CEIL,w:a[1]*CELL,h:a[0]*CELL});cur+=a[1]*CELL;}
    else if(k==="hb"){objs.push({t:"block",x:cur,y:GROUND-20,w:a[0]*CELL,h:20});cur+=a[0]*CELL;}
    else if(k==="ramp"){const n=Math.min(a[0],6);
      for(let i=0;i<n;i++)objs.push({t:"block",x:cur+i*20,y:GROUND-(i+1)*20,w:20,h:(i+1)*20});
      cur+=n*20;}
    else if(k==="bs"){objs.push({t:"block",x:cur,y:GROUND-a[0]*CELL,w:a[1]*CELL,h:a[0]*CELL});
      for(let i=0;i<a[2];i++)spike(cur+CELL*(i+2),GROUND-a[0]*CELL,false);cur+=a[1]*CELL;}
    else if(k==="pad"){objs.push({t:"pad",x:cur,y:GROUND,pw:17,col:"#fdd835"});cur+=2*CELL;}
    else if(k==="padH"){objs.push({t:"pad",x:cur,y:GROUND,pw:23,col:"#e53935"});cur+=2*CELL;}
    else if(k==="os"){const n=a[0];for(let i=0;i<n;i++)spike(cur+i*CELL,GROUND,false);
      objs.push({t:"orb",x:cur+(n-1)*CELL/2,y:GROUND-3*CELL,col:"#fdd835"});cur+=n*CELL+CELL;}
    else if(k==="orb"){objs.push({t:"orb",x:cur,y:GROUND-a[0]*CELL,col:"#fdd835"});cur+=2*CELL;}
    else if(k==="porb"){objs.push({t:"orb",x:cur,y:GROUND-a[0]*CELL,col:"#ff80ab"});cur+=2*CELL;}
    else if(k==="borb"){objs.push({t:"orb",x:cur,y:GROUND-a[0]*CELL,col:"#4fc3f7"});cur+=2*CELL;}
    else if(k==="p"){objs.push({t:"portal",x:cur,kind:a[0]});cur+=2*CELL;}
    else if(k==="g"){objs.push({t:"portal",x:cur,kind:a[0]===-1?"gravUp":"gravDown"});cur+=2*CELL;}
    else if(k==="flip"){objs.push({t:"portal",x:cur,kind:"flip"});cur+=2*CELL;}
    else if(k==="dual"){objs.push({t:"portal",x:cur,kind:"dual"});cur+=2*CELL;}
    else if(k==="single"){objs.push({t:"portal",x:cur,kind:"single"});cur+=2*CELL;}
    else if(k==="mini"){objs.push({t:"portal",x:cur,kind:"mini"});cur+=2*CELL;}
    else if(k==="big"){objs.push({t:"portal",x:cur,kind:"big"});cur+=2*CELL;}
    else if(k==="sp"){objs.push({t:"portal",x:cur,kind:"speed",val:a[0]});cur+=2*CELL;}
    else if(k==="rhy"){const n=a[0],step=BEAT_PX*a[1];
      const start=Math.round(cur/step)*step;
      for(let i=0;i<n;i++)spike(start+i*step,GROUND,false);
      cur=start+n*step+CELL;}
    else if(k==="m"){if(coins<3){objs.push({t:"coin",x:cur+CELL/2,y:GROUND-64,got:false});coins++;}cur+=CELL;}
    else if(k==="mY"){if(coins<3){objs.push({t:"coin",x:cur+CELL/2,y:a[0],got:false});coins++;}cur+=CELL;}
    else if(k==="fork"){const w=a[0]*CELL;
      objs.push({t:"block",x:cur,y:200,w,h:60});
      if(coins<3){objs.push({t:"coin",x:cur+w/2,y:330,got:false});coins++;}
      cur+=w;}
    else if(k==="wtri"){const steps=Math.min(a[0],8);
      for(let i=0;i<steps;i++){
        objs.push({t:"block",x:cur+i*20,y:GROUND-(i+1)*20,w:20,h:(i+1)*20});
        objs.push({t:"block",x:cur+i*20,y:CEIL,w:20,h:(i+1)*20});}
      cur+=steps*20+CELL;}
    else if(k==="donut"){objs.push({t:"donut",x:cur+CELL/2,y:GROUND-100-((a[0]%3)*40)});cur+=CELL;}
    else if(k==="pill"){objs.push({t:"block",x:cur,y:GROUND-a[0]*CELL,w:2*CELL,h:a[0]*CELL});
      objs.push({t:"block",x:cur,y:CEIL,w:2*CELL,h:a[1]*CELL});cur+=4*CELL;}
    else if(k==="end"){objs.push({t:"finish",x:cur});break;}
  }
  return{objs,length:cur+300};
}

// ================= ИКОНКИ: картинки из img/ =================
const ICONIMG={};
function iconImg(m,n){
  const k=m+n;
  if(k in ICONIMG)return ICONIMG[k]===true?ICONIMG[k+"_obj"]:ICONIMG[k];
  ICONIMG[k]="load";
  const im=new Image();
  im.onload=()=>{ICONIMG[k]=true;ICONIMG[k+"_obj"]=im;if(document.getElementById("icons").classList.contains("active"))buildEditor();};
  im.onerror=()=>{ICONIMG[k]=false;};
  im.src="img/"+m+n+".png";
  return null;
}
function hasImg(m,n){return ICONIMG[m+n]===true;}
function drawNum(c,mode,n,col,s){
  const r=s/2;
  const im=hasImg(mode,n)?iconImg(mode,n):null;
  if(im){
    c.save();c.beginPath();c.rect(-r,-r,s,s);c.clip();
    c.drawImage(im,-r,-r,s,s);
    c.globalCompositeOperation="source-atop";
    c.globalAlpha=0.55;c.fillStyle=col;c.fillRect(-r,-r,s,s);
    c.restore();
    c.lineWidth=Math.max(2,s*.08);c.strokeStyle="#101020";c.strokeRect(-r,-r,s,s);
    return;
  }
  c.save();c.lineWidth=Math.max(2,s*.08);c.strokeStyle="#101020";c.fillStyle=col;
  const cr=s*.16;rr(c,-r+2,-r+2,s-4,s-4,cr);c.fill();c.stroke();
  c.fillStyle="#101020";c.font="bold "+Math.round(s*.4)+"px Arial";
  c.textAlign="center";c.textBaseline="middle";
  c.fillText(n,0,s*.02);c.restore();
  c.textAlign="left";c.textBaseline="alphabetic";
}
function patDetail(c,s,pat){
  if(!pat)return;
  c.strokeStyle="#101020";c.fillStyle="#101020";
  if(pat===1){c.lineWidth=Math.max(2,s*.07);c.beginPath();c.arc(0,0,s*.22,0,7);c.stroke();}
  else if(pat===2){c.lineWidth=Math.max(2,s*.07);c.beginPath();c.moveTo(-s*.22,-s*.22);c.lineTo(s*.22,s*.22);c.moveTo(s*.22,-s*.22);c.lineTo(-s*.22,s*.22);c.stroke();}
  else{c.lineWidth=Math.max(2,s*.06);c.beginPath();c.moveTo(-s*.28,-s*.08);c.lineTo(s*.28,-s*.08);c.moveTo(-s*.28,s*.12);c.lineTo(s*.28,s*.12);c.stroke();}
}

// ================= БАЗОВАЯ ГЕОМЕТРИЯ ИКОНОК =================
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function drawIcon(c,mode,color,s,pat){
  c.save();c.lineWidth=Math.max(2,s*.09);c.strokeStyle="#101020";c.fillStyle=color;const h=s/2;
  if(mode==="bebra"){c.beginPath();c.arc(0,0,h,0,7);c.fill();c.stroke();c.fillStyle="#101010";
    c.beginPath();c.arc(-s*.18,-s*.15,s*.09,0,7);c.fill();c.beginPath();c.arc(s*.18,-s*.15,s*.09,0,7);c.fill();
    for(let k=-1;k<=1;k++){c.beginPath();c.arc(k*s*.12,s*.14,s*.05,0,7);c.fill();}c.restore();return;}
  if(mode==="cube"){rr(c,-h,-h,s,s,s*.15);c.fill();c.stroke();patDetail(c,s,pat);}
  else if(mode==="ball"){c.beginPath();c.arc(0,0,h,0,7);c.fill();c.stroke();c.beginPath();c.arc(0,0,h*.45,0,7);c.stroke();patDetail(c,s,pat);}
  else if(mode==="ship"){c.beginPath();c.moveTo(-h,-s*.05);c.lineTo(h*.85,-s*.28);c.quadraticCurveTo(h,-s*.05,h*.85,s*.28);c.lineTo(-h,s*.3);c.quadraticCurveTo(-h*1.15,0,-h,-s*.05);c.closePath();c.fill();c.stroke();
    rr(c,-s*.16,-s*.34,s*.32,s*.34,s*.08);c.fill();c.stroke();}
  else if(mode==="ufo"){c.beginPath();c.ellipse(0,s*.12,h,h*.36,0,0,7);c.fill();c.stroke();
    c.beginPath();c.arc(0,-s*.08,h*.62,Math.PI,0);c.closePath();c.fill();c.stroke();
    c.fillStyle="#101010";c.beginPath();c.arc(-s*.16,-s*.18,s*.06,0,7);c.fill();c.beginPath();c.arc(s*.16,-s*.18,s*.06,0,7);c.fill();}
  else if(mode==="wave"){c.beginPath();c.moveTo(-h,h*.55);c.lineTo(h*.75,0);c.lineTo(-h,-h*.55);c.closePath();c.fill();c.stroke();}
  else if(mode==="robot"){rr(c,-h*.75,-h*.95,s*.75,s*.8,s*.1);c.fill();c.stroke();
    c.beginPath();c.moveTo(-h*.45,h*.05);c.lineTo(-h*.45,h*.95);c.moveTo(h*.45,h*.05);c.lineTo(h*.45,h*.95);c.stroke();
    c.beginPath();c.arc(0,-h*.4,s*.14,0,7);c.stroke();}
  else if(mode==="spider"){rr(c,-h*.55,-h*.45,s*.55,s*.55,s*.1);c.fill();c.stroke();
    c.beginPath();for(const dx of[-.5,-.2,.2,.5]){c.moveTo(dx*h,-h*.15);c.lineTo(dx*h*1.35,h*.95);}c.stroke();}
  c.restore();
}
function playerIcon(c,mode,size){
  const cf=cfg[mode];
  if(cf.bebra)drawIcon(c,"bebra","#ffffff",size);
  else if((cf.n||1)>1)drawNum(c,mode,cf.n,cf.c||"#ffffff",size);
  else drawIcon(c,mode,cf.c||"#ffffff",size,(cf.i||0)%4);
}

// ================= РЕДАКТОР ИКОНОК =================
let edMode="cube";
function openEditor(){show("icons");buildEditor();}
function backToMenu(){show("menu");}
function pageNums(p){if(p===1)return null;const start=(p-2)*11+2;return{from:start,to:start+10};}
function totalPages(){return 4;}
function pageIconSlots(p){
  const r=pageNums(p);if(!r)return null;
  const arr=[];for(let n=r.from;n<=r.to&&n<=25;n++)arr.push(n);
  if(arr.length<11)arr.push(null);return arr;
}
function buildEditor(){
  const tabs=document.getElementById("mode-tabs");tabs.innerHTML="";
  MODES.concat(["bebra"]).forEach(m=>{
    const b=document.createElement("button");b.className="tab"+(edMode===m?" sel":"");
    b.textContent=MODE_RU[m];b.onclick=()=>{edMode=m;cfg[edMode].page=1;buildEditor();};tabs.appendChild(b);});
  document.getElementById("rare-note").textContent=edMode==="bebra"?"(редчайшая. легенда)":"";
  const pn=document.getElementById("page-nav");pn.innerHTML="";
  if(edMode==="bebra"){document.getElementById("page-info").textContent="";}
  else{
    document.getElementById("page-info").textContent="· "+cfg[edMode].page+" из "+totalPages();
    for(let p=1;p<=totalPages();p++){
      const b=document.createElement("button");b.className="tab"+(cfg[edMode].page===p?" sel":"");
      b.textContent=p===1?"стандарт":("стр "+p);b.onclick=()=>{cfg[edMode].page=p;buildEditor();};pn.appendChild(b);}
  }
  const grid=document.getElementById("icon-grid");grid.innerHTML="";
  if(edMode==="bebra"){
    const d=document.createElement("div");d.className="slot";
    const cnv=document.createElement("canvas");cnv.width=cnv.height=48;
    const x=cnv.getContext("2d");x.translate(24,24);drawIcon(x,"bebra","#ffffff",38);
    d.appendChild(cnv);
    const r=document.createElement("div");r.className="rare";r.textContent="⭐";d.appendChild(r);
    if(cfg.cube.bebra)d.classList.add("sel");
    d.onclick=()=>{cfg.cube.bebra=true;save();buildEditor();};
    grid.appendChild(d);
  }else{
    const p=cfg[edMode].page;
    if(p===1){
      for(let i=0;i<20;i++){
        const d=document.createElement("div");d.className="slot";
        const cnv=document.createElement("canvas");cnv.width=cnv.height=48;
        const x=cnv.getContext("2d");x.translate(24,24);
        drawIcon(x,edMode,"#e8e8f0",38,i%4);
        d.appendChild(cnv);
        if(i>0){const l=document.createElement("div");l.className="lock";l.textContent="🔒";d.appendChild(l);}
        if(!cfg[edMode].bebra&&cfg[edMode].n===1&&cfg[edMode].i===i)d.classList.add("sel");
        d.onclick=()=>{if(i>0)return;cfg[edMode].bebra=false;cfg[edMode].n=1;cfg[edMode].i=i;save();buildEditor();};
        grid.appendChild(d);}
    }else{
      const nums=pageIconSlots(p)||[];
      nums.forEach(num=>{
        const d=document.createElement("div");d.className="slot";
        if(num===null){const l=document.createElement("div");l.className="lock";l.textContent="·";d.appendChild(l);grid.appendChild(d);return;}
        const cnv=document.createElement("canvas");cnv.width=cnv.height=48;
        const x=cnv.getContext("2d");x.translate(24,24);
        drawNum(x,edMode,num,"#e8e8f0",38);
        d.appendChild(cnv);
        const lb=document.createElement("div");lb.className="rare";lb.textContent=num;d.appendChild(lb);
        const unlocked=st.u[edMode+num];
        if(!unlocked){const l=document.createElement("div");l.className="lock";l.textContent="🔒";d.appendChild(l);}
        else if(cfg[edMode].n===num&&!cfg[edMode].bebra)d.classList.add("sel");
        d.onclick=()=>{if(!unlocked)return;cfg[edMode].bebra=false;cfg[edMode].n=num;save();buildEditor();};
        grid.appendChild(d);});
    }
  }
  const sw=document.getElementById("swatches");sw.innerHTML="";
  COLORS.forEach(col=>{
    const s=document.createElement("div");s.className="sw"+(cfg[edMode].c===col?" sel":"");
    s.style.background=col;s.onclick=()=>{cfg[edMode].c=col;save();buildEditor();};sw.appendChild(s);});
  updPreview();
}
function updPreview(){
  const ps=document.getElementById("prev-ship"),pc=document.getElementById("prev-cube");
  if(!ps||!pc)return;
  let x=ps.getContext("2d");x.clearRect(0,0,120,120);x.save();x.translate(60,60);playerIcon(x,"ship",84);x.restore();
  x=pc.getContext("2d");x.clearRect(0,0,120,120);x.save();x.translate(60,60);playerIcon(x,"cube",84);x.restore();
}

// ================= МУЗЫКА =================
let music=null;
function setMusic(src){
  if(music)music.pause();
  music=new Audio(src);music.loop=true;music.volume=0.5;
  music.play().catch(()=>{});
}
function pickMusic(){
  const inp=document.createElement("input");
  inp.type="file";inp.accept="audio/*";
  inp.onchange=()=>{const f=inp.files[0];if(f)setMusic(URL.createObjectURL(f));};
  inp.click();
}
(function(){
  const a=new Audio("music.mp3");
  a.addEventListener("canplaythrough",()=>{if(!music)setMusic("music.mp3");},{once:true});
})();

// ================= СОБСТВЕННЫЕ УРОВНИ =================
let customLevels=loadLS("wd_levels")||[];
function allLevels(){return LEVELS.concat(customLevels.map((d,i)=>({name:d.name||("Мой уровень "+(i+1)),rarity:"r-blue",diff:"Свой",custom:true,data:d})));}
function saveCustom(){try{localStorage.setItem("wd_levels",JSON.stringify(customLevels));}catch(e){
  customLevels.forEach(d=>{if(d.music&&d.music.length>500000)d.music=null;});
  try{localStorage.setItem("wd_levels",JSON.stringify(customLevels));}catch(e2){}
  alert("Музыка не влезла в сохранение — оставил уровень без неё.");}}
function customTheme(hex){
  const n=parseInt(hex.slice(1),16),r=n>>16,g=(n>>8)&255,b=n&255;
  const dk=v=>Math.round(v*0.55),lt=v=>Math.round(v+(255-v)*0.35),md=v=>Math.round(v*0.8);
  return{bg:"rgb("+dk(r)+","+dk(g)+","+dk(b)+")",gr:"rgb("+dk(r)+","+dk(g)+","+dk(b)+")",
    ln:"rgb("+lt(r)+","+lt(g)+","+lt(b)+")",bl:"rgb("+md(r)+","+md(g)+","+md(b)+")"};
}

// ================= РАЗБЛОКИРОВКИ И ОРБЫ =================
function totalCoins(){let t=0;for(const k in st.coins)t+=st.coins[k]||0;return t;}
function applyUnlocks(){
  LVL_UNLOCK.forEach(([li,m,n])=>{if((st.wins[li]||0)>0)st.u[m+n]=true;});
  const tc=totalCoins();
  COIN_UNLOCK.forEach(([need,m,n])=>{if(tc>=need)st.u[m+n]=true;});
}
applyUnlocks();

// ================= ИГРА =================
let curLvl=0,testMode=false,lastTest=null,carIdx=0,game=null,keys={},paused=false;
document.addEventListener("keydown",e=>{
  if(e.code==="Space"||e.code==="ArrowUp"){e.preventDefault();if(game&&!paused)press();}
  if(e.code==="KeyR"&&game&&!paused)restartLevel();
  if(e.code==="Escape"&&game){paused?closePause():openPause();}
  if(e.code==="KeyZ"&&game&&game.practice&&!paused&&game.alive){saveCheckpoint();game.cpTime=performance.now();}
  if(e.code==="KeyX"&&game&&game.practice&&!paused){game.cp=null;game.cpTime=0;}
});
document.addEventListener("keyup",e=>{if(e.code==="Space"||e.code==="ArrowUp")keys.held=false;});
CV.addEventListener("pointerdown",e=>{e.preventDefault();if(!paused)press();});
CV.addEventListener("pointerup",()=>keys.held=false);
function press(){keys.held=true;keys.pressed=true;}
function freshObjs(data){return data.objs.map(o=>Object.assign({},o,{got:o.t==="coin"?false:undefined}));}
function baseState(){return{px:0,py:GROUND-PS,vy:0,gdir:1,mode:"cube",
  onSurf:true,rot:0,attempt:0,alive:true,win:false,pct:0,practice:false,cp:null,cpTime:0,
  coinsGot:0,boost:false,holdT:0,size:PS,speed:1,parts:[],trail:[],wtrail:[],d2:null};}

function startLevel(idx){
  curLvl=idx;testMode=false;paused=false;
  let objs,length;
  if(idx<LEVELS.length){const r=buildLevel(LEVELS[idx].spec);objs=r.objs;length=r.length;
    if(music){music.currentTime=0;music.play().catch(()=>{});}}
  else{const d=customLevels[idx-LEVELS.length];objs=freshObjs(d);length=d.length;
    if(d.music)setMusic(d.music);
    else if(music){music.currentTime=0;music.play().catch(()=>{});}}
  game=Object.assign({objs,length},baseState());
  keys.held=false;keys.pressed=false;
  document.getElementById("win-overlay").classList.remove("show");
  document.getElementById("pause").classList.remove("show");
  show("game");updPrBtn();updHud();
}
function startTest(data){
  lastTest=data;curLvl=null;testMode=true;paused=false;
  if(data.music)setMusic(data.music);
  else if(music){music.currentTime=0;music.play().catch(()=>{});}
  game=Object.assign({objs:freshObjs(data),length:data.length},baseState());
  keys.held=false;keys.pressed=false;
  document.getElementById("win-overlay").classList.remove("show");
  document.getElementById("pause").classList.remove("show");
  show("game");updPrBtn();updHud();
}
function restartLevel(){
  if(testMode){startTest(lastTest);return;}
  const pr=game?game.practice:false;startLevel(curLvl);game.practice=pr;updPrBtn();updHud();
}
function quitToMenu(){game=null;paused=false;if(music)music.pause();document.getElementById("pause").classList.remove("show");document.getElementById("win-overlay").classList.remove("show");show("menu");renderCar();}
function lvlName(){return testMode?"ТЕСТ":allLevels()[curLvl].name;}
function updHud(){
  document.getElementById("bar-fill").style.width=(game?game.pct:0)+"%";
  const rec=testMode?"—":(st.best[curLvl]||0);
  document.getElementById("hud-text").textContent="Попытка "+(game?game.attempt+1:1)+" · "+Math.floor(game?game.pct:0)+"% · 🪙 "+(game?game.coinsGot:0)+"/3 · рекорд "+rec+"%"+(game&&(game.speed||1)!==1?" · ×"+game.speed:"");
}
function togglePractice(){if(!game)return;game.practice=!game.practice;game.cp=null;if(game.practice)game.attempt=0;updPrBtn();updHud();}
function updPrBtn(){document.getElementById("pr-btn").textContent="🏁 Практика: "+(game&&game.practice?"вкл":"выкл");}
function openPause(){if(!game)return;paused=true;document.getElementById("pause-info").textContent=lvlName()+" · прогресс "+Math.floor(game.pct)+"% · в практике: Z — чекпоинт, X — убрать";document.getElementById("pause").classList.add("show");}
function closePause(){paused=false;document.getElementById("pause").classList.remove("show");}
function explode(g){
  const col=(cfg[g.mode]&&cfg[g.mode].c)||"#ffffff";
  for(let i=0;i<28;i++){
    const a=Math.random()*Math.PI*2,sp=1.5+Math.random()*4.5;
    g.parts.push({x:g.px+g.size/2,y:g.py+g.size/2,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-1.2,
      life:28+Math.random()*22,col:i%2?col:"#ffffff",sz:3+Math.random()*4});
  }
  if(g.d2){
    for(let i=0;i<20;i++){
      const a=Math.random()*Math.PI*2,sp=1.5+Math.random()*4.5;
      g.parts.push({x:g.px+g.size/2,y:g.d2.py+g.size/2,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp+1.2,
        life:24+Math.random()*18,col:i%2?"#ec407a":"#ffffff",sz:3+Math.random()*3});
    }
  }
}
function die(){
  const g=game;
  if(g.practice&&g.cp){Object.assign(g,g.cp,{alive:true,vy:0,win:false});keys.pressed=false;return;}
  explode(g);
  g.alive=false;g.attempt++;
  for(const o of g.objs)if(o.t==="coin")o.got=false;
  g.coinsGot=0;
  if(!testMode)st.best[curLvl]=Math.max(st.best[curLvl]||0,Math.floor(g.pct));
  save();
  const pr=g.practice;
  setTimeout(()=>{if(game){restartLevel();updPrBtn();updHud();}},600);
}
function saveCheckpoint(){game.cp={px:game.px,py:game.py,gdir:game.gdir,mode:game.mode,size:game.size,speed:game.speed,
  d2:game.d2?{py:game.d2.py,vy:game.d2.vy,gdir:game.d2.gdir,onSurf:game.d2.onSurf}:null};}
function hazardNear(x){
  for(const o of game.objs){
   if(o.t==="spike"||o.t==="spikeC"||o.t==="sm"||o.t==="sl"||o.t==="spikeL"||o.t==="spikeR"||o.t==="block"){
      if(o.x>x-CELL*0.5&&o.x<x+CELL*3)return true;
    }
  }
  return false;
}
function dust(g,n,y){
  for(let i=0;i<n;i++)g.parts.push({x:g.px+Math.random()*g.size,y:y-2,vx:-1-Math.random()*2,
    vy:-Math.random()*1.5,life:14+Math.random()*10,col:"rgba(255,255,255,.7)",sz:2+Math.random()*3});
}

// ================== ПРОДОЛЖЕНИЕ (step, draw, шоп, экраны) — ВО ВТОРОЙ ПОЛОВИНЕ ==================
// ================= ШАГ ИГРЫ =================
function bodyBounds(g,b,m){
  const S=b.size||g.size;
  if(m==="wave")return{hx:b.px+S*0.2,hy:b.py+S*0.2,hs:S*0.6};
  return{hx:b.px,hy:b.py,hs:S};
}
function bodyHazard(g,b,m,S,prevB,prevT){
  const{hx,hy,hs}=bodyBounds(g,b,m);
  for(const o of g.objs){
    if(o.t==="block"){
      if(hx+hs>o.x&&hx<o.x+o.w&&hy+hs>o.y&&hy<o.y+o.h){
        if(m==="wave")return true;
        const fromTop=prevB<=o.y+10,fromBot=prevT>=o.y+o.h-10;
        if(fromTop&&(b.gdir===1||m==="ship"||m==="ufo"||m==="ball"||m==="spider")){b.py=o.y-S;b.vy=0;if(b.gdir===1)b.onSurf=true;}
        else if(fromBot&&(b.gdir===-1||m==="ship"||m==="ufo"||m==="ball"||m==="spider")){b.py=o.y+o.h;b.vy=0;if(b.gdir===-1)b.onSurf=true;}
        else return true;
      }
    }else if(o.t==="spike"||o.t==="spikeC"){
      const sx=o.x+12,sw2=16,sy=o.t==="spike"?o.y-22:o.y;
      if(hx+hs>sx&&hx<sx+sw2&&hy+hs>sy&&hy<sy+22)return true;
    }else if(o.t==="sm"){
      const sx=o.x+13,sw2=14,sy=o.y-12;
      if(hx+hs>sx&&hx<sx+sw2&&hy+hs>sy&&hy<sy+12)return true;
      }else if(o.t==="sl"){
      const sx=o.x+8,sw2=CELL-16,sy=o.y-8;
      if(hx+hs>sx&&hx<sx+sw2&&hy+hs>sy&&hy<sy+8)return true;
    }else if(o.t==="spikeL"){
      const sx=o.x,sw2=14,sy=o.y+12;
      if(hx+hs>sx&&hx<sx+sw2&&hy+hs>sy&&hy<sy+16)return true;
    }else if(o.t==="spikeR"){
      const sx=o.x+26,sw2=14,sy=o.y+12;
      if(hx+hs>sx&&hx<sx+sw2&&hy+hs>sy&&hy<sy+16)return true;
    }


  }
  return false;
}
function step(){
  const g=game;if(!g.alive||g.win||paused)return;
  const S=g.size,f=S/PS;
  g.px+=SPEED*(g.speed||1);
  const held=keys.held,prs=keys.pressed;keys.pressed=false;
  const m=g.mode;
  const ff=Math.max(f,0.82);
  const moveBody=(b)=>{
    if(m==="cube"){b.vy+=0.9*b.gdir;if(prs&&b.onSurf){b.vy=-13.5*ff;b.onSurf=false;if(b===g)dust(g,4,b.py+S);}}
    else if(m==="robot"){
      b.vy+=0.9*b.gdir;
      if(b.onSurf){if(prs){b.vy=-11*ff*b.gdir;b.onSurf=false;if(b===g)dust(g,4,b.py+S);}}
      else if(held&&b.vy*b.gdir>-6.5){b.vy-=0.55*b.gdir;if(b===g)dust(g,1,b.py+(b.gdir===1?S:0));}
    }else if(m==="ship"){b.vy+=(held?-0.5*f:0.45*f)*b.gdir;b.vy=Math.max(-8,Math.min(8,b.vy));}
    else if(m==="ball"){b.vy+=1.0*b.gdir;if(prs&&b.onSurf){b.gdir*=-1;b.vy=3*f*b.gdir;b.onSurf=false;}}
    else if(m==="ufo"){b.vy+=0.5*b.gdir;if(prs)b.vy=-8.5*f*b.gdir;}
    else if(m==="wave"){b.vy=(held?-6:6)*f*b.gdir;}
    else if(m==="spider"){b.vy+=1.0*b.gdir;
      if(prs){b.gdir*=-1;b.vy=0;b.onSurf=false;
        let ty=b.gdir===1?GROUND-S:CEIL;
        for(const o of g.objs)if(o.t==="block"){const inX=g.px+S>o.x&&g.px<o.x+o.w;
          if(inX){if(b.gdir===1&&o.y<ty&&o.y>b.py)ty=o.y-S;
            if(b.gdir===-1&&o.y+o.h>ty&&o.y+o.h<b.py+S)ty=o.y+o.h;}}
        b.py=ty;b.onSurf=true;}}
    const prevB=b.py+S,prevT=b.py;
    b.py+=b.vy;b.onSurf=false;
    if(b.py+S>=GROUND){b.py=GROUND-S;
      if(m==="wave"||m==="ship"||m==="ufo")b.vy=0;
      else if(b.gdir===1){b.vy=0;b.onSurf=true;}else return true;}
    if(b.py<=CEIL){b.py=CEIL;
      if(m==="wave"||m==="ship"||m==="ufo")b.vy=0;
      else if(b.gdir===-1){b.vy=0;b.onSurf=true;}else if(m==="ball"||m==="spider"){b.vy=0;b.onSurf=true;}}
    if(bodyHazard(g,b,m,S,prevB,prevT))return true;
    return false;
  };
  if(moveBody(g)){die();return;}
  if(g.d2){ // второе тело дуала: зеркальная гравитация, умирает вместе с первым
    g.d2.size=S;
    if(moveBody(g.d2)){die();return;}
    if(Math.abs(g.d2.py-g.py)<S*0.4){die();return;} // тела столкнулись друг с другом
  }
  for(const o of g.objs){
    if(o.t==="pad"){
      if(g.px+S>o.x&&g.px<o.x+CELL&&Math.abs((g.py+S)-GROUND)<16&&g.gdir===1){g.vy=-o.pw*f;dust(g,3,g.py+S);}
    }else if(o.t==="orb"){
      if(prs&&Math.hypot(g.px+S/2-o.x,g.py+S/2-o.y)<55){
        if(o.col==="#ff80ab")g.vy=-9*f*g.gdir;
        else if(o.col==="#4fc3f7"){g.gdir*=-1;g.vy=6*g.gdir;if(g.d2)g.d2.gdir=-g.gdir;}
        else{g.vy=-13*ff*g.gdir;g.boost=false;}
      }
    }else if(o.t==="coin"){
      if(!o.got&&Math.hypot(g.px+S/2-o.x,g.py+S/2-o.y)<34){o.got=true;g.coinsGot++;updHud();}
    }else if(o.t==="portal"){
      if(g.px+S>o.x&&g.px<o.x+34){
        if(o.kind==="gravUp")g.gdir=-1;
        else if(o.kind==="gravDown")g.gdir=1;
        else if(o.kind==="flip")g.gdir*=-1;
        else if(o.kind==="mini")g.size=24;
        else if(o.kind==="big")g.size=PS;
        else if(o.kind==="speed")g.speed=o.val;
        else if(o.kind==="dual"){
          if(!g.d2){g.d2={py:CEIL+(GROUND-CEIL)-(g.py+S)-S+CEIL,vy:-g.vy*0.5,gdir:-g.gdir,onSurf:false,size:S};
            if(g.d2.py<CEIL)g.d2.py=CEIL;}
        }
        else if(o.kind==="single")g.d2=null;
        else{g.mode=o.kind;g.vy*=.5;if(g.d2)g.d2.vy*=.5;}
      }
    }
  }
  g.pct=Math.min(100,g.px/g.length*100);
  if(m==="wave"){
    g.wtrail.push({x:g.px,y:g.py+S/2});
    if(g.wtrail.length>60)g.wtrail.shift();
  }else g.wtrail.length=0;
  g.trail.push({x:g.px,y:g.py,m:m});
  if(g.trail.length>14)g.trail.shift();
  if(g.py>GROUND+120||g.py<-120){die();return;}
  if(g.px>=g.length-300&&!g.win){
    g.win=true;
    if(!testMode&&!g.practice){
      st.best[curLvl]=100;st.wins[curLvl]=(st.wins[curLvl]||0)+1;
      st.coins[curLvl]=Math.max(st.coins[curLvl]||0,g.coinsGot);
      const gain=st.orbGot[curLvl]?50:(ORBS[curLvl]||100);
      st.orbGot[curLvl]=true;st.orbs+=gain;
      applyUnlocks();
      document.getElementById("win-stats").textContent=lvlName()+" пройден! Попыток: "+(g.attempt+1)+" · монет: "+g.coinsGot+"/3 · 🔮 +"+gain+(g.practice?" (практика)":"");
    }else if(!testMode){
      st.pwins[curLvl]=(st.pwins[curLvl]||0)+1;save();
      document.getElementById("win-stats").textContent=lvlName()+" пройден в практике! Попыток: "+(g.attempt+1);
    }else{
      document.getElementById("win-stats").textContent=lvlName()+" пройден! Попыток: "+(g.attempt+1)+" · монет: "+g.coinsGot+"/3";
    }
    save();
    document.getElementById("win-overlay").classList.add("show");
  }
  const now=performance.now();
  if(g.practice&&now-g.cpTime>1200&&!hazardNear(g.px)){
    const grounded=(g.onSurf&&g.gdir===1&&g.py+S>=GROUND-4);
    const flying=(m==="ship"||m==="ufo"||m==="wave")&&g.py>CEIL+6&&g.py+S<GROUND-6;
    if(grounded||flying){saveCheckpoint();g.cpTime=now;}
  }
  updHud();
}

// ================= ОТРИСОВКА =================
function draw(){
  const g=game,c=CT;
  const th=(testMode&&lastTest&&lastTest.bg)?customTheme(lastTest.bg):(THEMES[testMode?7:(curLvl||0)]||THEMES[0]);
  c.fillStyle=th.bg;c.fillRect(0,0,W,H);
  const off=g.px-280;
  const phase=(g.px%BEAT_PX)/BEAT_PX;
  const pulse=Math.max(0,0.22*(1-phase*2.5));
  c.strokeStyle="rgba(255,255,255,.045)";c.lineWidth=1;
  for(let x=-((off*0.25%120)+120)%120;x<W;x+=120){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke();}
  for(let y=0;y<H;y+=120){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke();}
  c.strokeStyle="rgba(255,255,255,.07)";
  for(let x=-((off*0.55%60)+60)%60;x<W;x+=60){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke();}
  if(pulse>0){c.fillStyle="rgba(120,80,255,"+pulse.toFixed(3)+")";c.fillRect(0,0,W,H);}
  c.fillStyle=th.gr;c.fillRect(0,GROUND,W,H-GROUND);c.fillRect(0,0,W,CEIL);
  c.fillStyle="rgba(255,255,255,.05)";
  for(let x=-((off%80)+80)%80;x<W;x+=80){c.fillRect(x,GROUND,40,H-GROUND);c.fillRect(x+40,0,40,CEIL);}
  c.strokeStyle=th.ln;c.lineWidth=3;
  c.beginPath();c.moveTo(0,GROUND);c.lineTo(W,GROUND);c.stroke();
  c.beginPath();c.moveTo(0,CEIL);c.lineTo(W,CEIL);c.stroke();
  for(const o of g.objs){
    const x=o.x-off;if(x<-240||x>W+240)continue;
    if(o.t==="block"){c.fillStyle=th.bl;c.fillRect(x,o.y,o.w,o.h);c.strokeStyle=th.ln;c.lineWidth=2;c.strokeRect(x,o.y,o.w,o.h);}
    else if(o.t==="spike"||o.t==="spikeC"){c.fillStyle="#e53935";c.strokeStyle="#ffb3ab";c.lineWidth=2;c.beginPath();
      if(o.t==="spike"){c.moveTo(x,o.y);c.lineTo(x+CELL/2,o.y-CELL);c.lineTo(x+CELL,o.y);}
      else{c.moveTo(x,o.y);c.lineTo(x+CELL/2,o.y+CELL);c.lineTo(x+CELL,o.y);}
      c.closePath();c.fill();c.stroke();}
    else if(o.t==="sm"){c.fillStyle="#ff7043";c.strokeStyle="#ffccbc";c.lineWidth=2;c.beginPath();
      c.moveTo(x,o.y);c.lineTo(x+CELL/2,o.y-20);c.lineTo(x+CELL,o.y);c.closePath();c.fill();c.stroke();}
          else if(o.t==="spikeL"){c.fillStyle="#e53935";c.strokeStyle="#ffb3ab";c.lineWidth=2;c.beginPath();
      c.moveTo(x,o.y);c.lineTo(x+20,o.y+20);c.lineTo(x,o.y+40);c.closePath();c.fill();c.stroke();}
    else if(o.t==="spikeR"){c.fillStyle="#e53935";c.strokeStyle="#ffb3ab";c.lineWidth=2;c.beginPath();
      c.moveTo(x+40,o.y);c.lineTo(x+20,o.y+20);c.lineTo(x+40,o.y+40);c.closePath();c.fill();c.stroke();}
    else if(o.t==="ring"){c.strokeStyle=o.col||"#ffd54f";c.lineWidth=5;c.beginPath();c.arc(x,o.y,14,0,7);c.stroke();}
    else if(o.t==="stick"){c.strokeStyle="rgba(255,255,255,.4)";c.lineWidth=4;c.beginPath();
      c.moveTo(x+20,GROUND);c.lineTo(x+20,o.y);c.stroke();}

    else if(o.t==="sl"){c.fillStyle="#ff7043";c.strokeStyle="#ffccbc";c.lineWidth=2;c.beginPath();
      c.moveTo(x,o.y);c.lineTo(x+CELL/2,o.y-14);c.lineTo(x+CELL,o.y);c.closePath();c.fill();c.stroke();}
    else if(o.t==="pad"){c.fillStyle=o.col||"#fdd835";c.fillRect(x,o.y-9,CELL,9);
      c.strokeStyle="rgba(255,255,255,.7)";c.strokeRect(x,o.y-9,CELL,9);}
    else if(o.t==="orb"){
      c.strokeStyle=o.col;c.lineWidth=4;c.beginPath();c.arc(x,o.y,15,0,7);c.stroke();
      c.fillStyle=o.col+"33";c.fill();}
    else if(o.t==="donut"){
      c.strokeStyle="rgba(255,255,255,.35)";c.lineWidth=3;
      c.beginPath();c.moveTo(x,o.y+16);c.lineTo(x,GROUND);c.stroke();
      const r=12+pulse*6;
      c.strokeStyle="#ffd54f";c.lineWidth=5;c.beginPath();c.arc(x,o.y,r,0,7);c.stroke();
      c.strokeStyle="rgba(255,213,79,.25)";c.lineWidth=9;c.beginPath();c.arc(x,o.y,r,0,7);c.stroke();}
    else if(o.t==="coin"){
      if(o.got)continue;
      c.fillStyle="#ffd54f";c.beginPath();c.arc(x,o.y,11,0,7);c.fill();
      c.strokeStyle="#8a6300";c.lineWidth=2;c.beginPath();c.arc(x,o.y,11,0,7);c.stroke();
      c.beginPath();c.arc(x,o.y,6,0,7);c.stroke();}
    else if(o.t==="portal"){
      let col;
      if(o.kind==="gravUp")col="#fdd835";
      else if(o.kind==="gravDown")col="#4fc3f7";
      else if(o.kind==="flip")col="#ec407a";
      else if(o.kind==="mini")col="#ff9800";
      else if(o.kind==="big")col="#8bc34a";
      else if(o.kind==="speed")col=["#7cff4f","#ffe14f","#ff9e4f","#ff5f6f"][Math.min(3,Math.round((o.val||1)*2)-2)]||"#7cff4f";
      else if(o.kind==="dual")col="#ff5252";
      else if(o.kind==="single")col="#b0bec5";
      else col={cube:"#43a047",ship:"#ec407a",ball:"#fb8c00",ufo:"#8e24aa",wave:"#00bcd4",robot:"#9e9e9e",spider:"#6d4c41"}[o.kind]||"#fff";
      const pr=62+pulse*22;
      if(o.kind==="dual"||o.kind==="single"){
        c.strokeStyle=col;c.lineWidth=5;
        c.beginPath();c.ellipse(x,CEIL+60,16,44,0,0,7);c.stroke();c.fillStyle=col+"33";c.fill();
        c.beginPath();c.ellipse(x,GROUND-60,16,44,0,0,7);c.stroke();c.fillStyle=col+"33";c.fill();
      }else{
        c.strokeStyle=col;c.lineWidth=5;c.beginPath();c.ellipse(x,GROUND-90,16,pr,0,0,7);c.stroke();
        c.fillStyle=col+"33";c.fill();
      }
      c.fillStyle=col;c.font="bold 13px Arial";
      const lbl={dual:"ДУАЛ",single:"СОЛО",mini:"MINI",big:"БОЛЬШОЙ",speed:"×"+o.val,
        cube:"КУБ",ship:"КОРАБЛИК",ball:"ШАР",ufo:"НЛО",wave:"ВОЛНА",robot:"РОБОТ",spider:"ПАУК",
        gravUp:"↑ГРАВ",gravDown:"↓ГРАВ",flip:"ПЕРЕВОРОТ"}[o.kind];
      if(lbl)c.fillText(lbl,x-24,GROUND-165);
    }
    else if(o.t==="finish"){c.fillStyle="#43a047";c.fillRect(x,CEIL,10,GROUND-CEIL);
      c.fillStyle="#fff";for(let y=CEIL;y<GROUND;y+=20)c.fillRect(x,y,10,10);}
  }
  // след волны — сплошная лента, как в GD
  if(g.wtrail.length>1){
    c.strokeStyle=(cfg.wave&&cfg.wave.c)||"#00bcd4";
    c.lineWidth=g.size*0.55;c.lineJoin="round";c.globalAlpha=0.55;
    c.beginPath();
    for(let i=0;i<g.wtrail.length;i++){
      const p=g.wtrail[i],x=p.x-off;
      if(i===0)c.moveTo(x,p.y);else c.lineTo(x,p.y);
    }
    c.stroke();c.globalAlpha=1;c.lineWidth=1;
  }
  if(g.alive){
    for(let i=0;i<g.trail.length;i++){
      const t=g.trail[i],a=(i/g.trail.length)*0.35;
      c.globalAlpha=a;c.fillStyle=(cfg[t.m]&&cfg[t.m].c)||"#fff";
      const ts=g.size*0.5*(i/g.trail.length);
      c.fillRect(t.x-off+g.size/2-ts/2,t.y+g.size/2-ts/2,ts,ts);
    }
    c.globalAlpha=1;
  }
  for(let i=g.parts.length-1;i>=0;i--){
    const p=g.parts[i];
    p.x+=p.vx;p.y+=p.vy;p.vy+=0.12;p.vx*=0.97;p.life--;
    if(p.life<=0){g.parts.splice(i,1);continue;}
    c.globalAlpha=Math.max(0,Math.min(1,p.life/40));
    c.fillStyle=p.col;c.fillRect(p.x-off,p.y,p.sz,p.sz);
  }
  c.globalAlpha=1;
  if(g.practice&&g.cp){const cx=g.cp.px-off;
    if(cx>-20&&cx<W+20){c.strokeStyle="#7cff4f";c.lineWidth=3;c.setLineDash([6,4]);c.beginPath();c.moveTo(cx,CEIL);c.lineTo(cx,GROUND);c.stroke();c.setLineDash([]);}}
  if(g.alive){
    const S=g.size;
    c.save();c.translate(280+S/2,g.py+S/2);
    if(g.mode==="cube"||g.mode==="robot"){if(!g.onSurf)g.rot+=0.09*g.gdir;else g.rot=Math.round(g.rot/(Math.PI/2))*(Math.PI/2);c.rotate(g.rot);}
    if(g.gdir===-1)c.scale(1,-1);
    playerIcon(c,g.mode,S);c.restore();
    if(g.d2){
      c.save();c.translate(280+S/2,g.d2.py+S/2);
      if(g.mode==="cube"||g.mode==="robot"){if(!g.d2.onSurf)g.rot-=0.09*g.d2.gdir;else g.rot=Math.round(g.rot/(Math.PI/2))*(Math.PI/2);c.rotate(g.rot);}
      if(g.d2.gdir===-1)c.scale(1,-1);
      c.globalAlpha=0.95;
      c.save();c.filter="hue-rotate(120deg)";
      playerIcon(c,g.mode,S);c.restore();
      c.globalAlpha=1;c.restore();
    }
  }
  c.fillStyle="rgba(255,255,255,.85)";c.font="bold 24px Arial";
  c.fillText("Попытка "+(g.attempt+1),340-g.px,GROUND-180);
  if(g.practice){c.fillStyle="rgba(124,255,79,.9)";c.font="bold 18px Arial";c.fillText("PRACTICE · Z чекпоинт · X убрать",12,26);}
}

// ================= МАСШТАБ =================
function fit(){
  const hud=document.querySelector("#game .hud");
  const hh=hud?hud.offsetHeight+10:50;
  const aw=window.innerWidth-14,ah=window.innerHeight-hh-18;
  const s=Math.max(.3,Math.min(aw/W,ah/H));
  CV.style.width=Math.floor(W*s)+"px";CV.style.height=Math.floor(H*s)+"px";
}
window.addEventListener("resize",fit);
document.addEventListener("fullscreenchange",fit);
function toggleFS(){if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen().then(fit).catch(()=>{});}

// ================= ШОП =================
function openShop(){show("shop");updShop();}
function updShop(){
  document.getElementById("shop-orbs").textContent=st.orbs;
  const cases=document.getElementById("shop-cases");cases.innerHTML="";
  CASES.forEach(([cls,name,price,range])=>{
    const d=document.createElement("div");d.className="case "+cls;
    d.innerHTML='<div class="cn">📦</div>'+name+'<div class="price">🔮 '+price+'</div>';
    d.onclick=()=>buyCase(price,range);
    cases.appendChild(d);
  });
  document.getElementById("menu-orbs").textContent=st.orbs;
  document.getElementById("lvl-orbs").textContent=st.orbs;
}
function buyCase(price,range){
  if(st.orbs<price){document.getElementById("shop-result").textContent="Не хватает орбов! Нужно 🔮 "+price;return;}
  st.orbs-=price;
  const n=range[0]+Math.floor(Math.random()*(range[1]-range[0]+1));
  const modes=["cube","ship","ball","ufo","wave","robot","spider"];
  const m=modes[Math.floor(Math.random()*modes.length)];
  st.u[m+n]=true;applyUnlocks();save();
  const res=document.getElementById("shop-result");
  res.innerHTML="Открыл кейс: "+MODE_RU[m]+" №"+n+"!";
  const cnv=document.createElement("canvas");cnv.width=cnv.height=80;
  const x=cnv.getContext("2d");x.translate(40,40);
  if(m==="cube"||m==="ball")drawNum(x,m,n,"#e8e8f0",60);else drawIcon(x,m,"#e8e8f0",60);
  res.appendChild(document.createElement("br"));res.appendChild(cnv);
  updShop();
}

// ================= ЦИКЛ / ЭКРАНЫ =================
function frame(){
  if(game&&document.getElementById("game").classList.contains("active")&&!paused){step();draw();}
  requestAnimationFrame(frame);
}
function show(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  if(id==="game")fit();
  document.getElementById("menu-orbs").textContent=st.orbs;
  document.getElementById("lvl-orbs").textContent=st.orbs;
}
function showLevels(){carIdx=0;renderCar();show("levels");}
function carMove(d){carIdx=(carIdx+d+allLevels().length)%allLevels().length;renderCar();}
function renderCar(){
  const L=allLevels()[carIdx];
  const card=document.getElementById("lvl-card");
  card.className="lvl-card "+L.rarity;
  const rec=st.best[carIdx]||0;
  let stats;
  if(L.custom)stats='<div class="stats">Свой уровень · 🪙 '+(st.coins[carIdx]||0)+'/3 · рекорд: '+rec+'%</div>';
  else stats='<div class="stats">Обычный: '+(st.wins[carIdx]||0)+' · Практика: '+(st.pwins[carIdx]||0)+' · 🪙 '+(st.coins[carIdx]||0)+'/3<br>рекорд: '+rec+'% · награда 🔮 '+(st.orbGot[carIdx]?50:ORBS[carIdx])+'</div>';
  card.innerHTML='<div class="num">Уровень '+(carIdx+1)+' из '+allLevels().length+' · '+L.diff+' '+(DIFF_EMOJI[L.diff]||"")+'</div>'+
    '<div class="nm">'+L.name+'</div>'+stats;
}
renderCar();frame();
updShop();
