"use strict";
// ================= РЕДАКТОР УРОВНЕЙ v2 =================
const EC=document.getElementById("ecv"),ECT=EC.getContext("2d");
const ECOLS=120,EWW=ECOLS*40; // мир: 120 колонок — в два раза больше старого
let edWorld=[],edView=0,edTool="block",edTab="blocks",edEraseDrag=false,edMusic=null,edMusicName="",edBg="",editingIdx=null,edName="";

// ---------- ПАЛЕТКА С ВКЛАДКАМИ ----------
const TABS=[["blocks","Блоки"],["spikes","Шипы"],["portals","Порталы"],["items","Спец"],["decor","Декор"]];
const TOOLS={
 blocks:[["erase","❌"],["block","Блок"],["half","Полублок"],["ramp","Ступеньки"]],
 spikes:[["erase","❌"],["spike","Шип"],["smb","Малый шип"],["slo","Низкий шип"],["csp","Шип с потолка"],["rot","🔁 Поворот"]],
 portals:[["erase","❌"],["p_cube","Куб"],["p_ship","Кораблик"],["p_ball","Шар"],["p_ufo","НЛО"],["p_wave","Волна"],
   ["p_robot","Робот"],["p_spider","Паук"],["gUp","Грав ↑"],["gDn","Грав ↓"],["flip","Переворот"],
   ["mini","Мини"],["big","Большой"],["spd15","×1.5"],["spd2","×2"],["spd4","×4"],["spd6","×6"],
   ["dual","Дуал"],["single","Соло"]],
 items:[["erase","❌"],["coin","Монета"],["pad","Джампада ж"],["padH","Джампада кр"],
   ["orbY","Орб ж"],["orbP","Орб р"],["orbB","Орб с"],["finish","Финиш"]],
 decor:[["erase","❌"],["donut","Пончик"],["ring","Кольцо"],["stick","Палка"],["mus","🎵 Музыка"],["musX","🎵 ✕"]]
};
function buildPalette(){
  const tabs=document.getElementById("palette-tabs");tabs.innerHTML="";
  TABS.forEach(([id,label])=>{
    const b=document.createElement("button");b.className="tab"+(edTab===id?" sel":"");
    b.textContent=label;b.onclick=()=>{edTab=id;buildPalette();};tabs.appendChild(b);
  });
  const pal=document.getElementById("palette");pal.innerHTML="";
  TOOLS[edTab].forEach(([id,label])=>{
    if(id==="mus"||id==="musX")return;
    const b=document.createElement("button");
    b.className="pbtn"+(edTool===id?" sel":"");b.textContent=label;
    b.onclick=()=>{edTool=id;buildPalette();};pal.appendChild(b);
  });
  if(edTab==="decor"){
    const cl=document.createElement("input");cl.type="color";cl.value=edBg||"#0e1440";
    cl.title="Цвет фона";cl.style.width="42px";cl.style.height="30px";cl.style.borderRadius="8px";
    cl.oninput=()=>{edBg=cl.value;updEdStatus();};
    pal.appendChild(cl);
    const mb=document.createElement("button");mb.className="pbtn"+(edMusic?" sel":"");
    mb.textContent=edMusic?("🎵 "+(edMusicName||"своя")):"🎵 Музыка";
    mb.onclick=edPickMusic;pal.appendChild(mb);
    if(edMusic){const mx=document.createElement("button");mx.className="pbtn";mx.textContent="✕";
      mx.title="Убрать музыку";mx.onclick=()=>{edMusic=null;edMusicName="";buildPalette();updEdStatus();};pal.appendChild(mx);}
  }
  const prev=document.createElement("button");prev.className="pbtn";prev.textContent="‹ обзор";
  prev.onclick=()=>{edView=Math.max(0,edView-160);};
  const next=document.createElement("button");next.className="pbtn";next.textContent="обзор ›";
  next.onclick=()=>{edView=Math.min(EWW-960,edView+160);};
  pal.appendChild(prev);pal.appendChild(next);
}
function edPickMusic(){
  const inp=document.createElement("input");inp.type="file";inp.accept="audio/*";
  inp.onchange=()=>{
    const f=inp.files[0];if(!f)return;
    const rd=new FileReader();
    rd.onload=()=>{edMusic=rd.result;edMusicName=f.name.length>14?f.name.slice(0,13)+"…":f.name;buildPalette();updEdStatus();};
    rd.readAsDataURL(f);
  };
  inp.click();
}

// ---------- ВЫБОР УРОВНЯ ----------
function refreshChooser(){
  let box=document.getElementById("ed-choose");
  if(box)box.remove();
  box=document.createElement("div");box.id="ed-choose";box.className="pal";box.style.marginBottom="6px";
  customLevels.forEach((d,i)=>{
    const b=document.createElement("button");b.className="pbtn";b.textContent="✎ "+(d.name||("Мой уровень "+(i+1)));
    b.onclick=()=>loadCustom(i);box.appendChild(b);
  });
  const nb=document.createElement("button");nb.className="pbtn";nb.style.background="#43a047";
  nb.textContent="＋ Новый уровень";nb.onclick=newLevel;box.appendChild(nb);
  const pal=document.getElementById("palette");pal.parentNode.insertBefore(box,pal);
}
const snap=v=>Math.round(v/40)*40;
function toEditorObj(o){
  if(o.t==="spike")return{t:"spike",x:snap(o.x),y:snap(o.y-40),rot:0};
  if(o.t==="sm")return{t:"sm",x:snap(o.x),y:snap(o.y-40),rot:0};
  if(o.t==="sl")return{t:"sl",x:snap(o.x),y:snap(o.y-40),rot:0};
  if(o.t==="spikeC")return{t:"spike",x:snap(o.x),y:snap(o.y),rot:2};
  if(o.t==="spikeL")return{t:"spike",x:snap(o.x),y:snap(o.y),rot:1};
  if(o.t==="spikeR")return{t:"spike",x:snap(o.x),y:snap(o.y),rot:3};
  return Object.assign({},o);
}
function loadCustom(i){
  editingIdx=i;edName=customLevels[i].name||("Мой уровень "+(i+1));
  edWorld=customLevels[i].objs.map(o=>{const e=toEditorObj(o);e.x-=300;if(e.x<0)e.x=0;return e;});
  edBg=customLevels[i].bg||"";edMusic=customLevels[i].music||null;edMusicName=edMusic?"сохранена":"";
  edView=0;refreshChooser();buildPalette();updEdStatus();
}
function newLevel(){editingIdx=null;edName="";edWorld=[];edView=0;edBg="";edMusic=null;edMusicName="";refreshChooser();buildPalette();updEdStatus();}
function updEdStatus(){
  document.getElementById("ed-status").textContent=
    (editingIdx!==null?"Редактируешь: «"+edName+"»":"Новый уровень")+
    " · объектов: "+edWorld.length+
    (edBg?" · фон задан":"")+(edMusic?" · музыка: "+edMusicName:"")+
    " · сохрани, чтобы уровень появился в списке";
}

// ---------- ПОСТАНОВКА / СТИРАНИЕ / ПОВОРОТ ----------
function edCell(e){
  const r=EC.getBoundingClientRect();
  const wx=(e.clientX-r.left)*(EC.width/r.width)+edView;
  const wy=(e.clientY-r.top)*(EC.height/r.height);
  return{col:Math.max(0,Math.min(ECOLS-1,Math.floor(wx/40))),row:Math.max(0,Math.min(11,Math.floor(wy/40))),wy};
}
function coinCount(){return edWorld.filter(o=>o.t==="coin").length;}
function placeAt(e){
  const{col,row}=edCell(e);
  const x=col*40,y=row*40;
  switch(edTool){
    case"block":edWorld.push({t:"block",x,y,w:40,h:40});break;
    case"half":edWorld.push({t:"block",x,y:y+20,w:40,h:20});break;
    case"ramp":for(let i=0;i<4;i++)edWorld.push({t:"block",x:(col+i)*40,y:GROUND-(i+1)*20,w:20,h:(i+1)*20});break;
    case"spike":edWorld.push({t:"spike",x,y,rot:0});break;      // свободно: стоит на дне клетки
    case"csp":edWorld.push({t:"spike",x,y,rot:2});break;        // свисает с верха клетки
    case"smb":edWorld.push({t:"sm",x,y,rot:0});break;
    case"slo":edWorld.push({t:"sl",x,y,rot:0});break;
    case"pad":edWorld.push({t:"pad",x,y:GROUND,pw:17,col:"#fdd835"});break;
    case"padH":edWorld.push({t:"pad",x,y:GROUND,pw:23,col:"#e53935"});break;
    case"orbY":edWorld.push({t:"orb",x:x+20,y:y+20,col:"#fdd835"});break;
    case"orbP":edWorld.push({t:"orb",x:x+20,y:y+20,col:"#ff80ab"});break;
    case"orbB":edWorld.push({t:"orb",x:x+20,y:y+20,col:"#4fc3f7"});break;
    case"p_cube":edWorld.push({t:"portal",x,kind:"cube"});break;
    case"p_ship":edWorld.push({t:"portal",x,kind:"ship"});break;
    case"p_ball":edWorld.push({t:"portal",x,kind:"ball"});break;
    case"p_ufo":edWorld.push({t:"portal",x,kind:"ufo"});break;
    case"p_wave":edWorld.push({t:"portal",x,kind:"wave"});break;
    case"p_robot":edWorld.push({t:"portal",x,kind:"robot"});break;
    case"p_spider":edWorld.push({t:"portal",x,kind:"spider"});break;
    case"gUp":edWorld.push({t:"portal",x,kind:"gravUp"});break;
    case"gDn":edWorld.push({t:"portal",x,kind:"gravDown"});break;
    case"flip":edWorld.push({t:"portal",x,kind:"flip"});break;
    case"mini":edWorld.push({t:"portal",x,kind:"mini"});break;
    case"big":edWorld.push({t:"portal",x,kind:"big"});break;
    case"spd15":edWorld.push({t:"portal",x,kind:"speed",val:1.5});break;
    case"spd2":edWorld.push({t:"portal",x,kind:"speed",val:2});break;
    case"spd4":edWorld.push({t:"portal",x,kind:"speed",val:4});break;
    case"spd6":edWorld.push({t:"portal",x,kind:"speed",val:6});break;
    case"dual":edWorld.push({t:"portal",x,kind:"dual"});break;
    case"single":edWorld.push({t:"portal",x,kind:"single"});break;
    case"coin":
      if(coinCount()>=3){alert("Максимум 3 монеты на уровень");break;}
      edWorld.push({t:"coin",x:x+20,y:y+20});break;
    case"donut":edWorld.push({t:"donut",x:x+20,y:y+20});break;
    case"ring":edWorld.push({t:"ring",x:x+20,y:y+20,col:"#ffd54f"});break;
    case"stick":edWorld.push({t:"stick",x,y:Math.max(y,CEIL+40)});break;
    case"finish":
      edWorld=edWorld.filter(o=>o.t!=="finish");
      edWorld.push({t:"finish",x});break;
  }
  updEdStatus();
}
function bbox(o){
  if(o.t==="block")return o;
  if(o.t==="portal")return{x:o.x,y:CEIL,w:32,h:360};
  if(o.t==="orb"||o.t==="coin"||o.t==="donut"||o.t==="ring")return{x:o.x-20,y:o.y-20,w:40,h:40};
  if(o.t==="stick")return{x:o.x,y:o.y,w:40,h:GROUND-o.y};
  if(o.t==="finish")return{x:o.x,y:CEIL,w:12,h:GROUND-CEIL};
  return{x:o.x,y:o.y,w:40,h:40};
}
function eraseAt(e){
  const{col,row}=edCell(e);
  const x0=col*40,y0=row*40;
  edWorld=edWorld.filter(o=>{
    const b=bbox(o);
    return!(b.x<x0+40&&b.x+b.w>x0&&b.y<y0+40&&b.y+b.h>y0);
  });
  updEdStatus();
}
function rotateAt(e){ // 🔁: клик по объекту — поворот на 90°
  const{col,row}=edCell(e);
  const x0=col*40,y0=row*40;
  for(const o of edWorld){
    const b=bbox(o);
    if(!(b.x<x0+40&&b.x+b.w>x0&&b.y<y0+40&&b.y+b.h>y0))continue;
    if(o.t==="spike"){
      o.rot=((o.rot||0)+1)%4;
      // полные шипы крутятся свободно: пол → правая стена → потолок → левая стена
    }else if(o.t==="block"&&(o.w===20||o.h===20)){
      const cx=o.x+o.w/2,cy=o.y+o.h/2,nw=o.h,nh=o.w;
      o.x=Math.round(cx-nw/2);o.y=Math.round(cy-nh/2);o.w=nw;o.h=nh;
    }
    updEdStatus();return;
  }
}

// ---------- ОТРИСОВКА ПОЛЯ ----------
function edDraw(){
  const c=ECT,off=edView;
  c.fillStyle=edBg||"#0e1440";c.fillRect(0,0,960,480);
  c.strokeStyle="rgba(255,255,255,.08)";c.lineWidth=1;
  for(let i=Math.floor(off/40)*40;i<off+960+40;i+=40){
    const x=i-off;c.beginPath();c.moveTo(x,0);c.lineTo(x,480);c.stroke();
  }
  for(let y=0;y<=480;y+=40){c.beginPath();c.moveTo(0,y);c.lineTo(960,y);c.stroke();}
  c.fillStyle="rgba(26,42,108,.85)";c.fillRect(0,GROUND,960,80);c.fillRect(0,0,960,CEIL);
  c.strokeStyle="#4f74e3";c.lineWidth=3;
  c.beginPath();c.moveTo(0,GROUND);c.lineTo(960,GROUND);c.stroke();
  c.beginPath();c.moveTo(0,CEIL);c.lineTo(960,CEIL);c.stroke();
  const pulse=0.5+0.5*Math.sin(performance.now()/300);
  for(const o of edWorld){
    const x=o.x-off;if(x<-60||x>1020)continue;
    if(o.t==="block"){c.fillStyle="#2a3f8f";c.fillRect(x,o.y,o.w,o.h);c.strokeStyle="#4f74e3";c.lineWidth=2;c.strokeRect(x,o.y,o.w,o.h);}
    else if(o.t==="spike"){
      c.fillStyle="#e53935";c.beginPath();
      if(o.rot===0){c.moveTo(x,o.y+40);c.lineTo(x+20,o.y);c.lineTo(x+40,o.y+40);}
      else if(o.rot===1){c.moveTo(x,o.y);c.lineTo(x+20,o.y+20);c.lineTo(x,o.y+40);}
      else if(o.rot===2){c.moveTo(x,o.y);c.lineTo(x+20,o.y+40);c.lineTo(x+40,o.y);}
      else{c.moveTo(x+40,o.y);c.lineTo(x+20,o.y+20);c.lineTo(x+40,o.y+40);}
      c.closePath();c.fill();c.lineWidth=2;c.stroke();
    }
    else if(o.t==="sm"){c.fillStyle="#ff7043";c.beginPath();c.moveTo(x,o.y+40);c.lineTo(x+20,o.y+20);c.lineTo(x+40,o.y+40);c.fill();}
    else if(o.t==="sl"){c.fillStyle="#ff7043";c.beginPath();c.moveTo(x,o.y+40);c.lineTo(x+20,o.y+26);c.lineTo(x+40,o.y+40);c.fill();}
    else if(o.t==="pad")    else if(o.t==="spikeL"){c.fillStyle="#e53935";c.strokeStyle="#ffb3ab";c.lineWidth=2;c.beginPath();
      c.moveTo(x,o.y);c.lineTo(x+20,o.y+20);c.lineTo(x,o.y+40);c.closePath();c.fill();c.stroke();}
    else if(o.t==="spikeR"){c.fillStyle="#e53935";c.strokeStyle="#ffb3ab";c.lineWidth=2;c.beginPath();
      c.moveTo(x+40,o.y);c.lineTo(x+20,o.y+20);c.lineTo(x+40,o.y+40);c.closePath();c.fill();c.stroke();}
    else if(o.t==="ring"){c.strokeStyle=o.col||"#ffd54f";c.lineWidth=5;c.beginPath();c.arc(x,o.y,14,0,7);c.stroke();}
    else if(o.t==="stick"){c.strokeStyle="rgba(255,255,255,.4)";c.lineWidth=4;c.beginPath();
      c.moveTo(x+20,GROUND);c.lineTo(x+20,o.y);c.stroke();}
{c.fillStyle=o.col;c.fillRect(x,GROUND-9,40,9);}
    else if(o.t==="orb"){c.strokeStyle=o.col;c.lineWidth=4;c.beginPath();c.arc(x,o.y,15,0,7);c.stroke();}
    else if(o.t==="coin"){c.fillStyle="#ffd54f";c.beginPath();c.arc(x,o.y,11,0,7);c.fill();c.strokeStyle="#8a6300";c.lineWidth=2;c.stroke();}
    else if(o.t==="donut"){
      c.strokeStyle="rgba(255,255,255,.35)";c.lineWidth=3;c.beginPath();c.moveTo(x,o.y+16);c.lineTo(x,GROUND);c.stroke();
      c.strokeStyle="#ffd54f";c.lineWidth=5;c.beginPath();c.arc(x,o.y,12+pulse*5,0,7);c.stroke();}
    else if(o.t==="ring"){c.strokeStyle=o.col;c.lineWidth=5;c.beginPath();c.arc(x,o.y,14+pulse*4,0,7);c.stroke();}
    else if(o.t==="stick"){c.strokeStyle="rgba(255,255,255,.4)";c.lineWidth=4;c.beginPath();c.moveTo(x+20,GROUND);c.lineTo(x+20,o.y);c.stroke();}
    else if(o.t==="portal"){
      const col={gravUp:"#fdd835",gravDown:"#4fc3f7",flip:"#ec407a",mini:"#ff9800",big:"#8bc34a",speed:"#7cff4f",
        dual:"#ff5252",single:"#b0bec5",cube:"#43a047",ship:"#ec407a",ball:"#fb8c00",ufo:"#8e24aa",
        wave:"#00bcd4",robot:"#9e9e9e",spider:"#6d4c41"}[o.kind]||"#fff";
      const lbl={gravUp:"↑ГРАВ",gravDown:"↓ГРАВ",flip:"ПЕРЕВОРОТ",mini:"MINI",big:"БОЛЬШОЙ",dual:"ДУАЛ",single:"СОЛО",
        speed:"×"+o.val,cube:"КУБ",ship:"КОРАБЛИК",ball:"ШАР",ufo:"НЛО",wave:"ВОЛНА",robot:"РОБОТ",spider:"ПАУК"}[o.kind];
      c.strokeStyle=col;
      if(o.kind==="dual"||o.kind==="single"){
        c.lineWidth=5;
        c.beginPath();c.ellipse(x+16,CEIL+60,16,44,0,0,7);c.stroke();
        c.beginPath();c.ellipse(x+16,GROUND-60,16,44,0,0,7);c.stroke();
      }else{c.lineWidth=5;c.beginPath();c.ellipse(x+16,GROUND-90,16,58,0,0,7);c.stroke();}
      c.fillStyle=col;c.font="bold 11px Arial";
      if(lbl)c.fillText(lbl,x-6,GROUND-165);
    }
    else if(o.t==="finish"){
      c.fillStyle="#43a047";c.fillRect(x,CEIL,10,GROUND-CEIL);
      c.fillStyle="#fff";for(let yy=CEIL;yy<GROUND;yy+=20)c.fillRect(x,yy,10,10);}
  }
  // спавн + превью твоего скина
  const sx=280-off;
  c.fillStyle="rgba(255,255,255,.15)";c.fillRect(sx-2,CEIL,3,GROUND-CEIL);
  c.fillStyle="rgba(255,255,255,.5)";c.font="12px Arial";
  c.fillText("твой скин:",sx-90,CEIL+18);
  c.save();c.translate(sx,GROUND-40);playerIcon(c,"cube",30);c.restore();
}

// ---------- ЭКСПОРТ / СОХРАНЕНИЕ / ТЕСТ ----------
function exportObjs(){
  return edWorld.map(o=>{
    if(o.t==="spike"){
      if(o.rot===0)return{t:"spike",x:o.x,y:o.y+40};
      if(o.rot===2)return{t:"spikeC",x:o.x,y:o.y};
      if(o.rot===1)return{t:"spikeL",x:o.x,y:o.y};
      return{t:"spikeR",x:o.x,y:o.y};
    }
    if(o.t==="sm")return{t:"sm",x:o.x,y:o.y+40};
    if(o.t==="sl")return{t:"sl",x:o.x,y:o.y+40};
    return Object.assign({},o);
  });
}
function buildEdData(){
  if(!edWorld.some(o=>o.t==="finish")){
    const mx=edWorld.reduce((m,o)=>Math.max(m,o.x+(o.w||40)),0);
    edWorld.push({t:"finish",x:Math.min(mx+120,EWW-40)});
  }
  const objs=exportObjs().map(o=>Object.assign({},o,{x:o.x+300}));
  const fin=objs.find(o=>o.t==="finish");
  return{name:edName||"Мой уровень",objs,length:(fin?fin.x:EWW+300)+300,
    bg:edBg||null,music:edMusic||null};
}
function edTest(){startTest(buildEdData());}
function edSave(){
  const d=buildEdData();
  let name=prompt("Название уровня:",editingIdx!==null?edName:"Мой уровень "+(customLevels.length+1));
  if(name===null)return;
  d.name=name.trim()||"Мой уровень";edName=d.name;
  if(editingIdx!==null)customLevels[editingIdx]=d;else{customLevels.push(d);editingIdx=customLevels.length-1;}
  saveCustom();renderCar();refreshChooser();updEdStatus();
  alert("Уровень «"+d.name+"» сохранён!");
}
function edClear(){
  if(!edWorld.length)return;
  if(confirm("Очистить всё поле?")){edWorld=[];editingIdx=null;edBg="";edMusic=null;edMusicName="";refreshChooser();updEdStatus();}
}

// ---------- СОБЫТИЯ ----------
EC.addEventListener("pointerdown",e=>{
  e.preventDefault();
  if(edTool==="erase"){edEraseDrag=true;eraseAt(e);}
  else if(edTool==="rot")rotateAt(e);
  else placeAt(e);
});
EC.addEventListener("pointermove",e=>{if(edEraseDrag)eraseAt(e);});
document.addEventListener("pointerup",()=>edEraseDrag=false);
EC.addEventListener("contextmenu",e=>e.preventDefault());
EC.addEventListener("wheel",e=>{
  e.preventDefault();
  edView=Math.max(0,Math.min(EWW-960,edView+(e.deltaY>0?160:-160)));
},{passive:false});

// ---------- ЦИКЛ ----------
function edFrame(){
  if(document.getElementById("editor").classList.contains("active"))edDraw();
  requestAnimationFrame(edFrame);
}
function openEditorLvl(){show("editor");refreshChooser();buildPalette();updEdStatus();edView=0;}
edFrame();
