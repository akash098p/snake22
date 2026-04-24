/* ════════════════════════════════════════════════════════════════
   SERPENT — Full Production Rewrite
   ✅ Desktop sidebar layout + mobile full-screen
   ✅ Audio: menu_music plays on ALL non-game screens (no restart on tab switch)
   ✅ background.wav plays ONLY during active game
   ✅ menu_select.wav fires on EVERY tap/button
   ✅ move.wav fires every snake step (low vol)
   ✅ level_up fires at 100, 200, 300... score milestones
   ✅ Cheat code TMKC unlocks everything; EXIT MODE re-locks
   ✅ No D-Pad on mobile; swipe only
   ✅ Richer snake rendering (scales, gradient body)
   ✅ Larger, clearer food rendering
════════════════════════════════════════════════════════════════ */

// ── DATA ──────────────────────────────────────────────────────────
const MODES = {
  easy:   {ms:165,label:'EASY',   emoji:'🟢',tip:'Casual play',   color:'#56e39f',track:'#113425',danger:'LOW',speed:'SLOW'},
  medium: {ms:108,label:'MEDIUM', emoji:'🟡',tip:'Balanced challenge',color:'#ffd24d',track:'#3a2b08',danger:'MID',speed:'FAST'},
  hard:   {ms: 65,label:'HARD',   emoji:'🔴',tip:'Intense speed', color:'#ff5f73',track:'#3f0a15',danger:'HIGH',speed:'EXTREME'}
};

// Themes: richer, distinct visual personalities
const THEMES = [
  {name:'Abyss',    bg:'#06070d',gA:'#09090f',gB:'#07080e',gc:'#1a1a2e',cost:{c:0,d:0},ok:true,
   desc:'Deep dark void'},
  {name:'Forest',   bg:'#050e08',gA:'#071209',gB:'#060f07',gc:'#0d2414',cost:{c:40,d:0},ok:true,
   desc:'Ancient woodland'},
  {name:'Neon City',bg:'#040314',gA:'#090828',gB:'#07071e',gc:'#12103a',cost:{c:60,d:2},ok:true,
   desc:'Cyberpunk grid'},
  {name:'Lava',     bg:'#0d0400',gA:'#1a0800',gB:'#130600',gc:'#2a0d00',cost:{c:75,d:3},ok:true,
   desc:'Volcanic heat'},
  {name:'Arctic',   bg:'#030e18',gA:'#071828',gB:'#051422',gc:'#0a2035',cost:{c:90,d:5},ok:true,
   desc:'Frozen tundra'},
  {name:'Cosmic',   bg:'#03010e',gA:'#0b0520',gB:'#070318',gc:'#130828',cost:{c:0,d:0},ok:false,
   desc:'Coming soon'}
];
const TH_ICONS=['🌑','🌲','🌆','🌋','❄️','🌌'];
// Theme accent colors for grid shimmer
const TH_ACC=['#00e5a0','#22c55e','#a78bfa','#f97316','#38bdf8','#c084fc'];

// Skins: rich, realistic snake color palettes
const SKINS = [
  {name:'Emerald',   head:'#00e87c',body:'#00c464',belly:'#b8f0d8',  out:'#005a30',eyes:'#fff',cost:0, ok:true,
   desc:'Classic green'},
  {name:'Crimson',   head:'#e83030',body:'#c42020',belly:'#f5c0c0',  out:'#5a0000',eyes:'#fff',cost:50,ok:true,
   desc:'Blood red viper'},
  {name:'Royal Blue',head:'#3a8fff',body:'#2470e0',belly:'#c0d8ff',  out:'#002466',eyes:'#fff',cost:50,ok:true,
   desc:'Deep ocean'},
  {name:'Golden',    head:'#ffcc00',body:'#e0aa00',belly:'#fff5b0',  out:'#664400',eyes:'#222',cost:55,ok:true,
   desc:'Sand boa'},
  {name:'Amethyst',  head:'#a855f7',body:'#8b3de8',belly:'#e8d0ff',  out:'#3b0066',eyes:'#fff',cost:60,ok:true,
   desc:'Mystic purple'},
  {name:'Ghost',     head:'#c8cce8',body:'#a8acd0',belly:'#eeeef8',  out:'#404060',eyes:'#333',cost:70,ok:true,
   desc:'Pale albino'},
  {name:'Obsidian',  head:'#2a2a3a',body:'#1a1a28',belly:'#50506a',  out:'#0a0a14',eyes:'#ff4444',cost:80,ok:true,
   desc:'Midnight black'},
  {name:'Krait',     head:'#1a1a00',body:'#111100',belly:'#f0e060',  out:'#000000',eyes:'#ff0',cost:0, ok:false,
   desc:'Coming soon'}
];

const FOODS = {
  apple:      {color:'#ff3a3a',pts:10, emoji:'🍎',w:40},
  banana:     {color:'#ffe44a',pts:15, emoji:'🍌',w:25},
  cherry:     {color:'#cc1155',pts:20, emoji:'🍒',w:20},
  grape:      {color:'#9955ee',pts:25, emoji:'🍇',w:15},
  orange:     {color:'#ff7722',pts:12, emoji:'🍊',w:30},
  strawberry: {color:'#ff4477',pts:18, emoji:'🍓',w:25},
  watermelon: {color:'#22dd55',pts:30, emoji:'🍉',w:10},
  pineapple:  {color:'#ffdd00',pts:35, emoji:'🍍',w:8 }
};

const POWERUPS = {
  speed_boost:  {color:'#22d3ee',dur:5000,emoji:'⚡',label:'SPEED',  w:10},
  invincible:   {color:'#fbbf24',dur:3000,emoji:'🛡️',label:'SHIELD', w:5 },
  double_points:{color:'#c084fc',dur:8000,emoji:'✨',label:'2× PTS', w:8 },
  ghost_mode:   {color:'#94a3b8',dur:4000,emoji:'👻',label:'GHOST',  w:6 },
  shrink:       {color:'#60a5fa',dur:200, emoji:'🔵',label:'SHRINK', w:7 },
  magnet:       {color:'#fb923c',dur:7000,emoji:'🧲',label:'MAGNET', w:9 }
};

const COLLS = {
  coin:   {emoji:'🪙',color:'#fbbf24',w:12},
  diamond:{emoji:'💎',color:'#67e8f9',w:2}
};

const BOOST_LV=[
  {add:0,cost:0},{add:2,cost:10},{add:2,cost:25},
  {add:2,cost:40},{add:2,cost:50},{add:4,cost:80}
];

// ── STORAGE ───────────────────────────────────────────────────────
const LD=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch{return d}};
const SV=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
let CFG  = LD('sp2_cfg',  {volume:.7,bgVolume:1});
let HS   = LD('sp2_hs',   {easy:0,medium:0,hard:0});
let WAL  = LD('sp2_wal',  {coins:0,diamonds:0});
let SHOP = LD('sp2_shop', {skins:{owned:[0],sel:0},themes:{owned:[0],sel:0},boosts:{}});
let CHEAT_ACTIVE = LD('sp2_cheat', false);
let DEV_SNAPSHOT = null;

SHOP.skins=SHOP.skins||{owned:[0],sel:0};
SHOP.themes=SHOP.themes||{owned:[0],sel:0};
SHOP.boosts=SHOP.boosts||{};
if(!Array.isArray(SHOP.skins.owned)||!SHOP.skins.owned.length)SHOP.skins.owned=[0];
if(!Array.isArray(SHOP.themes.owned)||!SHOP.themes.owned.length)SHOP.themes.owned=[0];
if(!CHEAT_ACTIVE){
  if(!SHOP.skins.owned.includes(SHOP.skins.sel))SHOP.skins.sel=0;
  if(!SHOP.themes.owned.includes(SHOP.themes.sel))SHOP.themes.sel=0;
}
if(typeof CFG.bgVolume!=='number')CFG.bgVolume=1;

// ── AUDIO ENGINE ──────────────────────────────────────────────────
// Strategy:
//  - menu_music: HTMLAudio, loops, plays on ALL non-game screens (no restart if already playing)
//  - background: HTMLAudio, loops, plays ONLY during active game
//  - SFX: cloneNode() from master elements → overlap-safe, instant
//  - Volume: live-updated on all active elements
const AU = (()=>{
  const SFX={
    eat:          'sounds/eat.wav',
    coin:         'sounds/coin.wav',
    diamond:      'sounds/diamond.wav',
    game_over:    'sounds/game_over.wav',
    menu_select:  'sounds/menu_select.wav',
    start:        'sounds/start.wav',
    level_up:     'sounds/level_up.wav',
    shrink:       'sounds/shrink.wav',
    speed_boost:  'sounds/speed_boost.wav',
    invincible:   'sounds/invincible.wav',
    ghost_mode:   'sounds/ghost_mode.wav',
    double_points:'sounds/double_points.wav',
    magnet:       'sounds/magnet.wav',
    move:         'sounds/move.wav'
  };
  const MUSIC={
    menu_music: 'sounds/menu_music.mp3',
    background: 'sounds/background.mp3'
  };

  let vol = CFG.volume;
  let bgVol = CFG.bgVolume;
  const masters = {};
  const musicEl = {};
  let curMusic = null;
  let unlocked = false;

  // Pre-create elements
  Object.entries(SFX).forEach(([k,src])=>{
    const a=new Audio();a.src=src;a.preload='auto';a.load();masters[k]=a;
  });
  Object.entries(MUSIC).forEach(([k,src])=>{
    const a=new Audio();a.src=src;a.loop=true;a.volume=vol;a.preload='auto';musicEl[k]=a;
  });

  function showToast(){
    const t=document.getElementById('audioToast');
    t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2500);
  }
  const targetVol=(name)=>name==='background'?vol*bgVol:vol;

  async function unlock(){
    if(unlocked)return; unlocked=true;
    try{const ac=new(window.AudioContext||window.webkitAudioContext)();
      if(ac.state==='suspended')await ac.resume();ac.close();}catch{}
    // Warm up SFX
    Object.values(masters).forEach(a=>{
      try{const c=a.cloneNode();c.volume=0;c.play().then(()=>c.pause()).catch(()=>{});}catch{}
    });
    // Start expected music immediately after first user interaction.
    if(typeof curScreen!=='undefined'){
      if(curScreen==='game'&&!gameOver&&!paused)playMusic('background');
      else playMusic('menu_music');
    }else{
      playMusic('menu_music');
    }
    showToast();
  }

  // Play SFX — cloneNode for overlap
  function sfx(name, volMul=1){
    if(!masters[name]||vol===0)return;
    try{
      const c=masters[name].cloneNode();
      c.volume=Math.min(1,vol*volMul);
      c.play().catch(()=>{});
    }catch{}
  }

  // Crossfade music — DOES NOT restart if same track already playing
  function playMusic(name){
    if(!musicEl[name])return;
    if(curMusic===name&&!musicEl[name].paused)return; // already playing
    // Fade out old track (different track)
    if(curMusic&&curMusic!==name){
      const oldName=curMusic;
      const old=musicEl[oldName];
      let ov=old.volume;
      const fi=setInterval(()=>{
        ov=Math.max(0,ov-.07);old.volume=ov;
        if(ov<=0){old.pause();old.currentTime=0;old.volume=targetVol(oldName);clearInterval(fi);}
      },30);
    }
    curMusic=name;
    const m=musicEl[name];
    m.currentTime=0;m.volume=0;
    m.play().then(()=>{
      const tar=targetVol(name);
      let nv=0;const fi=setInterval(()=>{
        nv=Math.min(tar,nv+.05);m.volume=nv;if(nv>=tar)clearInterval(fi);
      },35);
    }).catch(()=>{});
  }

  function stopMusic(name,cb){
    if(!musicEl[name])return;
    const m=musicEl[name];
    if(m.paused){if(cb)cb();if(curMusic===name)curMusic=null;return;}
    let ov=m.volume;
    const fi=setInterval(()=>{
      ov=Math.max(0,ov-.08);m.volume=ov;
      if(ov<=0){m.pause();m.currentTime=0;m.volume=targetVol(name);clearInterval(fi);if(cb)cb();}
    },28);
    if(curMusic===name)curMusic=null;
  }

  function stopAll(){
    Object.keys(musicEl).forEach(n=>{musicEl[n].pause();musicEl[n].currentTime=0;});
    curMusic=null;
  }

  function setVol(v){
    vol=v;CFG.volume=v;SV('sp2_cfg',CFG);
    Object.entries(musicEl).forEach(([k,m])=>{if(!m.paused)m.volume=targetVol(k);});
  }

  function setBgVol(v){
    bgVol=v;CFG.bgVolume=v;SV('sp2_cfg',CFG);
    const bg=musicEl.background;
    if(bg&&!bg.paused)bg.volume=targetVol('background');
  }

  return{unlock,sfx,playMusic,stopMusic,stopAll,setVol,setBgVol,getVol:()=>vol,getBgVol:()=>bgVol};
})();

['pointerdown','keydown','touchstart'].forEach(ev=>
  document.addEventListener(ev,()=>AU.unlock(),{once:true,passive:true})
);

// ── CANVAS ────────────────────────────────────────────────────────
const canvas=document.getElementById('gameCanvas');
const ctx=canvas.getContext('2d');
let CELL=28,COLS=22,ROWS=18;

function resizeCanvas(){
  const wrap=document.getElementById('canvasWrap');
  const W=wrap.clientWidth,H=wrap.clientHeight;
  CELL=Math.max(16,Math.floor(Math.min(W/24,H/20)));
  COLS=Math.floor(W/CELL);
  ROWS=Math.floor(H/CELL);
  canvas.width=COLS*CELL;
  canvas.height=ROWS*CELL;
}

// ── STATE ─────────────────────────────────────────────────────────
let themeIdx=SHOP.themes.sel||0, skinIdx=SHOP.skins.sel||0;
let previewThemeIdx=null, previewSkinIdx=null;
let pendingThemeBuy=null, pendingSkinBuy=null;
let snake=[],dir={x:1,y:0},nextDir={x:1,y:0},dirLocked=false;
let foods=[],pups=[],colls=[];
let score=0,lastMilestone=0,activePU={},puEnd={};
let parts=[];
let gameOver=false,paused=false,started=false;
let selMode=null,curMode=null;
let sesCoins=0,sesDias=0;
let lastStep=0,stepMs=165;
let tFood=0,tPup=0,tColl=0;
let rafId=null;
let curScreen='menuScreen';

// ── HELPERS ───────────────────────────────────────────────────────
const wRand=(keys,getW)=>{
  let t=keys.reduce((s,k)=>s+getW(k),0),r=Math.random()*t;
  for(const k of keys){r-=getW(k);if(r<=0)return k}
  return keys[keys.length-1];
};
const occ=(x,y)=>
  snake.some(s=>s.x===x&&s.y===y)||
  foods.some(f=>f.x===x&&f.y===y)||
  pups.some(p=>p.x===x&&p.y===y)||
  colls.some(c=>c.x===x&&c.y===y);

function emptyPos(){
  for(let i=0;i<400;i++){
    const x=Math.floor(Math.random()*COLS),y=Math.floor(Math.random()*ROWS);
    if(!occ(x,y))return{x,y};
  }
  return{x:1,y:1};
}
function boostDur(base,type){
  const lv=SHOP.boosts?.[type]||0;let a=0;
  for(let i=1;i<=Math.min(lv,5);i++)a+=BOOST_LV[i].add;
  return base+a*1000;
}
function spawnFood(){const t=wRand(Object.keys(FOODS),k=>FOODS[k].w);foods.push({...emptyPos(),t});}
function spawnPup(){const t=wRand(Object.keys(POWERUPS),k=>POWERUPS[k].w);pups.push({...emptyPos(),t,born:Date.now()});}
function spawnColl(){const t=wRand(Object.keys(COLLS),k=>COLLS[k].w);colls.push({...emptyPos(),t,born:Date.now()});}
function attractTowardHead(entity,head,range=8){
  const dx=head.x-entity.x,dy=head.y-entity.y,d=Math.abs(dx)+Math.abs(dy);
  if(d<=0||d>=range)return;
  if(Math.abs(dx)>Math.abs(dy))entity.x+=Math.sign(dx);
  else entity.y+=Math.sign(dy);
}
let uiToastTimer=null;
function uiToast(msg){
  const t=document.getElementById('uiToast');
  if(!t)return;
  t.textContent=msg;
  t.classList.add('show');
  clearTimeout(uiToastTimer);
  uiToastTimer=setTimeout(()=>t.classList.remove('show'),1700);
}

// ── GAME INIT ─────────────────────────────────────────────────────
function initGame(mode){
  cancelAnimationFrame(rafId);
  const sx=Math.max(5,Math.floor(COLS/4)),sy=Math.floor(ROWS/2);
  snake=[{x:sx,y:sy},{x:sx-1,y:sy},{x:sx-2,y:sy},{x:sx-3,y:sy}];
  dir={x:1,y:0};nextDir={x:1,y:0};dirLocked=false;
  foods=[];pups=[];colls=[];activePU={};puEnd={};parts=[];
  score=0;lastMilestone=0;
  gameOver=false;paused=false;
  sesCoins=0;sesDias=0;
  curMode=mode;stepMs=MODES[mode].ms;
  tFood=0;tPup=0;tColl=0;
  spawnFood();spawnFood();spawnColl();
  document.getElementById('goOverlay').classList.add('hidden');
  document.getElementById('pauseOverlay').classList.add('hidden');
  syncHUD();
  lastStep=performance.now();
  rafId=requestAnimationFrame(loop);
}

// ── LOOP ──────────────────────────────────────────────────────────
function loop(ts){
  rafId=requestAnimationFrame(loop);
  if(paused||gameOver){render();return;}
  let ms=stepMs;
  if(activePU.speed_boost)ms=Math.floor(ms*.52);
  if(ts-lastStep>=ms){step(ts);lastStep=ts;}
  render();
}

// ── STEP ──────────────────────────────────────────────────────────
function step(ts){
  dir={...nextDir};dirLocked=false;
  AU.sfx('move',.14);

  const head={x:snake[0].x+dir.x,y:snake[0].y+dir.y};

  // Ghost wrapping
  if(activePU.ghost_mode){
    head.x=((head.x%COLS)+COLS)%COLS;
    head.y=((head.y%ROWS)+ROWS)%ROWS;
  }
  // Wall
  if(!activePU.ghost_mode&&(head.x<0||head.x>=COLS||head.y<0||head.y>=ROWS)){doGameOver();return;}
  // Self
  if(!activePU.invincible&&snake.some(s=>s.x===head.x&&s.y===head.y)){doGameOver();return;}

  snake.unshift(head);
  let ate=false;

  // Food
  for(let i=foods.length-1;i>=0;i--){
    const f=foods[i];
    if(activePU.magnet)attractTowardHead(f,head,10);
    if(f.x===head.x&&f.y===head.y){
      AU.sfx('eat');
      let pts=FOODS[f.t].pts;
      if(activePU.double_points)pts*=2;
      score+=pts;
      if(score>(HS[curMode]||0)){HS[curMode]=score;SV('sp2_hs',HS);}
      // Milestone check: 100, 200, 300, ...
      const milestone=Math.floor(score/100);
      if(milestone>lastMilestone){
        lastMilestone=milestone;
        setTimeout(()=>AU.sfx('level_up'),100);
      }
      popScore(head,'+'+pts,FOODS[f.t].color);
      spawnParts(head.x*CELL+CELL/2,head.y*CELL+CELL/2,FOODS[f.t].color,14);
      flashEat();foods.splice(i,1);ate=true;break;
    }
  }
  if(!ate)snake.pop();

  // Powerups
  const now=Date.now();
  for(let i=pups.length-1;i>=0;i--){
    const p=pups[i];
    if(now-p.born>15000){pups.splice(i,1);continue;}
    if(p.x===head.x&&p.y===head.y){
      activatePU(p.t);
      spawnParts(p.x*CELL+CELL/2,p.y*CELL+CELL/2,POWERUPS[p.t].color,20);
      pups.splice(i,1);
    }
  }

  // Collectibles
  for(let i=colls.length-1;i>=0;i--){
    const c=colls[i];
    if(now-c.born>22000){colls.splice(i,1);continue;}
    if(activePU.magnet)attractTowardHead(c,head,10);
    if(c.x===head.x&&c.y===head.y){
      if(c.t==='coin'){WAL.coins++;sesCoins++;AU.sfx('coin');}
      else{WAL.diamonds++;sesDias++;AU.sfx('diamond');}
      SV('sp2_wal',WAL);
      popScore(head,COLLS[c.t].emoji,COLLS[c.t].color);
      spawnParts(c.x*CELL+CELL/2,c.y*CELL+CELL/2,COLLS[c.t].color,16);
      colls.splice(i,1);
    }
  }

  // Expire PU timers
  for(const [k,end] of Object.entries(puEnd)){if(now>=end){delete activePU[k];delete puEnd[k];}}

  // Spawn cadence
  if(ts-tFood>2600&&foods.length<3){spawnFood();tFood=ts;}
  if(ts-tPup>11000&&pups.length<2){spawnPup();tPup=ts;}
  if(ts-tColl>8000&&colls.length<2){spawnColl();tColl=ts;}

  syncHUD();
}

function activatePU(type){
  const dur=boostDur(POWERUPS[type].dur,type);
  activePU[type]=true;puEnd[type]=Date.now()+dur;
  AU.sfx(type);
  if(type==='shrink'){while(snake.length>4)snake.pop();delete activePU.shrink;delete puEnd.shrink;}
}

function doGameOver(){
  gameOver=true;
  AU.stopMusic('background');
  AU.sfx('game_over');
  spawnParts(snake[0].x*CELL+CELL/2,snake[0].y*CELL+CELL/2,'#ff3a3a',35);
  const isHS=score>0&&score>=(HS[curMode]||0);
  document.getElementById('goScore').textContent='SCORE: '+score;
  document.getElementById('goC').textContent='🪙 '+sesCoins;
  document.getElementById('goD').textContent='💎 '+sesDias;
  document.getElementById('goHS').classList.toggle('hidden',!(isHS&&score>0));
  document.getElementById('goOverlay').classList.remove('hidden');
  syncHUD();
}

// ── RENDER ────────────────────────────────────────────────────────
function render(){
  if(!started)return;
  const W=canvas.width,H=canvas.height;
  const th=THEMES[themeIdx],sk=SKINS[skinIdx];
  const now=Date.now();

  // Background
  ctx.fillStyle=th.bg;ctx.fillRect(0,0,W,H);

  // Checkerboard grid with theme color
  for(let x=0;x<COLS;x++){
    for(let y=0;y<ROWS;y++){
      ctx.fillStyle=(x+y)%2===0?th.gA:th.gB;
      ctx.fillRect(x*CELL,y*CELL,CELL,CELL);
    }
  }

  // Subtle grid lines
  ctx.strokeStyle='rgba(255,255,255,.018)';ctx.lineWidth=.5;
  for(let x=0;x<=COLS;x++){ctx.beginPath();ctx.moveTo(x*CELL,0);ctx.lineTo(x*CELL,H);ctx.stroke();}
  for(let y=0;y<=ROWS;y++){ctx.beginPath();ctx.moveTo(0,y*CELL);ctx.lineTo(W,y*CELL);ctx.stroke();}

  // ── COLLECTIBLES ──
  colls.forEach(c=>{
    const cx=c.x*CELL+CELL/2,cy=c.y*CELL+CELL/2;
    const pulse=.9+.1*Math.sin(now/240+c.x*1.7);
    ctx.save();ctx.translate(cx,cy);ctx.scale(pulse,pulse);
    ctx.shadowColor=COLLS[c.t].color;ctx.shadowBlur=14;
    ctx.font=`${Math.round(CELL*.9)}px serif`;
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(COLLS[c.t].emoji,0,1);
    ctx.restore();
  });

  // ── FOOD — large, clear, with glow halo ──
  foods.forEach(f=>{
    const cx=f.x*CELL+CELL/2,cy=f.y*CELL+CELL/2;
    const bob=Math.sin(now/400+f.x*1.4)*2;
    ctx.save();ctx.translate(cx,cy+bob);

    // Glow halo
    const grd=ctx.createRadialGradient(0,0,CELL*.2,0,0,CELL*.7);
    grd.addColorStop(0,FOODS[f.t].color+'44');
    grd.addColorStop(1,'transparent');
    ctx.fillStyle=grd;ctx.beginPath();ctx.arc(0,0,CELL*.7,0,Math.PI*2);ctx.fill();

    // Large emoji
    ctx.shadowColor=FOODS[f.t].color;ctx.shadowBlur=18;
    ctx.font=`${Math.round(CELL*.88)}px serif`;
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(FOODS[f.t].emoji,0,1);
    ctx.restore();
  });

  // ── POWERUPS ──
  pups.forEach(p=>{
    const cx=p.x*CELL+CELL/2,cy=p.y*CELL+CELL/2;
    const t=(now-p.born)/1000;
    const pulse=.88+.12*Math.sin(t*4.5);
    ctx.save();ctx.translate(cx,cy);ctx.scale(pulse,pulse);
    // Outer ring
    ctx.beginPath();ctx.arc(0,0,CELL*.52,0,Math.PI*2);
    ctx.strokeStyle=POWERUPS[p.t].color+'bb';ctx.lineWidth=2;
    ctx.shadowColor=POWERUPS[p.t].color;ctx.shadowBlur=18;ctx.stroke();
    // Inner fill
    ctx.beginPath();ctx.arc(0,0,CELL*.42,0,Math.PI*2);
    ctx.fillStyle=POWERUPS[p.t].color+'28';ctx.fill();
    // Emoji
    ctx.shadowBlur=10;
    ctx.font=`${Math.round(CELL*.72)}px serif`;
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(POWERUPS[p.t].emoji,0,1);
    ctx.restore();
    // Expire bar
    const age=(now-p.born)/15000;
    ctx.fillStyle=POWERUPS[p.t].color+'60';
    ctx.fillRect(p.x*CELL,p.y*CELL+CELL-3,CELL*(1-age),3);
  });

  // ── SNAKE ──
  const ghostA=activePU.ghost_mode?.42:1;
  ctx.globalAlpha=ghostA;

  // Draw body segments (back to front so head is on top)
  for(let i=snake.length-1;i>0;i--){
    const seg=snake[i],x=seg.x*CELL,y=seg.y*CELL;
    const isTail=i===snake.length-1;
    const prog=i/snake.length;
    const alpha=ghostA*(0.75+0.25*(1-prog));
    ctx.globalAlpha=alpha;

    const r=isTail?CELL*.44:CELL*.38;
    ctx.shadowColor=sk.body;ctx.shadowBlur=i<5?8:2;

    // Scale-like body gradient
    const grd=ctx.createRadialGradient(
      x+CELL*.35,y+CELL*.3,CELL*.05,
      x+CELL/2,y+CELL/2,CELL*.52
    );
    grd.addColorStop(0,lighten(sk.body,40));
    grd.addColorStop(.5,sk.body);
    grd.addColorStop(1,darken(sk.body,30));

    roundRect(x+2,y+2,CELL-4,CELL-4,r);
    ctx.fillStyle=grd;ctx.fill();
    ctx.strokeStyle=sk.out;ctx.lineWidth=1.2;ctx.stroke();
    ctx.shadowBlur=0;

    // Belly stripe
    if(!isTail&&CELL>18){
      const bw=CELL*.34,bx=x+(CELL-bw)/2,by=y+CELL*.27,bh=CELL*.46;
      roundRect(bx,by,bw,bh,CELL*.12);
      ctx.fillStyle=sk.belly+'88';ctx.fill();
    }

    ctx.globalAlpha=ghostA;
  }

  // HEAD
  {
    const seg=snake[0],x=seg.x*CELL,y=seg.y*CELL;
    ctx.globalAlpha=ghostA;
    ctx.shadowColor=sk.head;ctx.shadowBlur=18;

    // Head gradient
    const grd=ctx.createRadialGradient(
      x+CELL*.38,y+CELL*.3,CELL*.06,
      x+CELL/2,y+CELL/2,CELL*.58
    );
    grd.addColorStop(0,lighten(sk.head,50));
    grd.addColorStop(.5,sk.head);
    grd.addColorStop(1,darken(sk.head,20));

    roundRect(x+1,y+1,CELL-2,CELL-2,CELL*.36);
    ctx.fillStyle=grd;ctx.fill();
    ctx.strokeStyle=sk.out;ctx.lineWidth=1.8;ctx.stroke();
    ctx.shadowBlur=0;

    // Eyes
    const eR=CELL*.12,eO=CELL*.22;
    const hx=x+CELL/2,hy=y+CELL/2;
    let e1x,e1y,e2x,e2y;
    if(dir.x>0) {e1x=hx+eO;e1y=hy-eO;e2x=hx+eO;e2y=hy+eO;}
    else if(dir.x<0){e1x=hx-eO;e1y=hy-eO;e2x=hx-eO;e2y=hy+eO;}
    else if(dir.y<0){e1x=hx-eO;e1y=hy-eO;e2x=hx+eO;e2y=hy-eO;}
    else            {e1x=hx-eO;e1y=hy+eO;e2x=hx+eO;e2y=hy+eO;}

    [[e1x,e1y],[e2x,e2y]].forEach(([ex,ey])=>{
      // White sclera
      ctx.fillStyle=sk.eyes||'#fff';
      ctx.beginPath();ctx.arc(ex,ey,eR,0,Math.PI*2);ctx.fill();
      // Pupil (elliptical cat-eye)
      ctx.fillStyle='#111';
      ctx.beginPath();
      ctx.ellipse(ex+dir.x*eR*.25,ey+dir.y*eR*.25,eR*.38,eR*.62,0,0,Math.PI*2);
      ctx.fill();
      // Shine
      ctx.fillStyle='rgba(255,255,255,.8)';
      ctx.beginPath();ctx.arc(ex-dir.x*eR*.28-eR*.18,ey-dir.y*eR*.28-eR*.18,eR*.28,0,Math.PI*2);ctx.fill();
    });

    // Tongue flicker
    if(Math.floor(now/170)%3!==2){
      const tl=CELL*.52,fk=CELL*.22;
      const tx=hx+dir.x*CELL*.46,ty=hy+dir.y*CELL*.46;
      const px=dir.x===0?1:0,py=dir.y===0?1:0;
      ctx.strokeStyle='#ff2255';ctx.lineWidth=1.8;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(tx+dir.x*tl,ty+dir.y*tl);
      const tx2=tx+dir.x*tl,ty2=ty+dir.y*tl;
      ctx.moveTo(tx2,ty2);ctx.lineTo(tx2+px*fk+dir.x*fk*.5,ty2+py*fk+dir.y*fk*.5);
      ctx.moveTo(tx2,ty2);ctx.lineTo(tx2-px*fk+dir.x*fk*.5,ty2-py*fk+dir.y*fk*.5);
      ctx.stroke();
    }

    // Nostrils
    if(CELL>20){
      const nOff=CELL*.14,nFwd=CELL*.38;
      const nx1=hx+dir.x*nFwd+(dir.y===0?-nOff:dir.x*nOff*0);
      const ny1=hy+dir.y*nFwd+(dir.x===0?-nOff:dir.y*nOff*0);
      const nx2=hx+dir.x*nFwd+(dir.y===0?nOff:0);
      const ny2=hy+dir.y*nFwd+(dir.x===0?nOff:0);
      ctx.fillStyle='rgba(0,0,0,.35)';
      [dir.x===0?[[nx1,ny1],[nx2,ny2]]:[[nx1,ny1],[nx2,ny2]]].flat().forEach(([nx,ny])=>{
        if(!isNaN(nx)){ctx.beginPath();ctx.arc(nx,ny,CELL*.04,0,Math.PI*2);ctx.fill();}
      });
    }
  }

  ctx.globalAlpha=1;ctx.shadowBlur=0;

  // ── PARTICLES ──
  for(let i=parts.length-1;i>=0;i--){
    const p=parts[i];
    p.x+=p.vx;p.y+=p.vy;p.vy+=.16;p.life--;
    if(p.life<=0){parts.splice(i,1);continue;}
    const a=(p.life/p.ml)**1.6;
    ctx.globalAlpha=a;ctx.fillStyle=p.c;
    ctx.beginPath();ctx.arc(p.x,p.y,p.r*a,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;

  // Animated border
  const bPulse=.5+.5*Math.sin(now/800);
  ctx.strokeStyle=`rgba(${hexToRgb(TH_ACC[themeIdx])},${.3+bPulse*.25})`;
  ctx.lineWidth=2.5;ctx.strokeRect(1.5,1.5,W-3,H-3);
}

// Canvas helpers
function roundRect(x,y,w,h,r){
  ctx.beginPath();ctx.roundRect(x,y,w,h,r);
}
function lighten(hex,amt){
  const [r,g,b]=hexToRgbArr(hex);
  return`rgb(${Math.min(255,r+amt)},${Math.min(255,g+amt)},${Math.min(255,b+amt)})`;
}
function darken(hex,amt){
  const [r,g,b]=hexToRgbArr(hex);
  return`rgb(${Math.max(0,r-amt)},${Math.max(0,g-amt)},${Math.max(0,b-amt)})`;
}
function hexToRgbArr(hex){
  const n=parseInt(hex.replace('#',''),16);
  return[(n>>16)&255,(n>>8)&255,n&255];
}
function hexToRgb(hex){return hexToRgbArr(hex).join(',')}

// ── VFX ───────────────────────────────────────────────────────────
function spawnParts(cx,cy,color,count){
  for(let i=0;i<count;i++){
    const a=Math.random()*Math.PI*2,sp=2+Math.random()*8;
    parts.push({x:cx,y:cy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-2.5,
      r:2.5+Math.random()*4.5,life:20+Math.random()*18,ml:38,c:color});
  }
}
function popScore(pos,text,color){
  const r=canvas.getBoundingClientRect();
  const el=document.createElement('div');
  el.className='score-pop';el.textContent=text;el.style.color=color;
  el.style.textShadow=`0 0 10px ${color}`;
  el.style.left=(r.left+pos.x*CELL+CELL/2)+'px';
  el.style.top =(r.top +pos.y*CELL+CELL/2)+'px';
  document.body.appendChild(el);setTimeout(()=>el.remove(),950);
}
function flashEat(){
  const el=document.createElement('div');el.className='eat-flash';
  document.getElementById('canvasWrap').appendChild(el);
  setTimeout(()=>el.remove(),300);
}

// ── HUD SYNC ──────────────────────────────────────────────────────
function syncHUD(){
  // In-game HUD bar (mobile/all)
  document.getElementById('hudScore').textContent=score;
  document.getElementById('hudBest').textContent='BEST: '+(HS[curMode]||0);
  document.getElementById('hudMode').textContent=curMode?.toUpperCase()||'';
  document.getElementById('hudC').textContent='🪙 '+WAL.coins;
  document.getElementById('hudD').textContent='💎 '+WAL.diamonds;

  // Powerup bar
  syncPUBar();

  // Sidebar sync
  syncSidebar();
}

function syncPUBar(){
  const bar=document.getElementById('puBar');bar.innerHTML='';
  const now=Date.now();
  for(const [k,end] of Object.entries(puEnd)){
    if(!activePU[k])continue;
    const rem=Math.max(0,end-now),tot=boostDur(POWERUPS[k].dur,k);
    const pct=(rem/tot*100).toFixed(1);
    const b=document.createElement('div');b.className='pu-badge';
    b.style.borderColor=POWERUPS[k].color;
    b.innerHTML=`<span>${POWERUPS[k].emoji}</span><span style="color:${POWERUPS[k].color}">${POWERUPS[k].label}</span><div class="pu-tbar"><div class="pu-tfill" style="width:${pct}%;background:${POWERUPS[k].color}"></div></div>`;
    bar.appendChild(b);
  }
}

function syncSidebar(){
  document.getElementById('sbCoins').textContent=WAL.coins;
  document.getElementById('sbDias').textContent=WAL.diamonds;
  if(started&&curMode){
    document.getElementById('sbScore').textContent=score;
    document.getElementById('sbLen').textContent=snake.length;
    document.getElementById('sbMode').textContent=MODES[curMode].label;
    document.getElementById('sbBest').textContent=HS[curMode]||0;
    document.getElementById('sbScorePanel').style.display='';
    // PU panel
    const now=Date.now();
    const hasPU=Object.keys(puEnd).some(k=>activePU[k]);
    const ppanel=document.getElementById('sbPuPanel');
    ppanel.style.display=hasPU?'':'none';
    if(hasPU){
      const list=document.getElementById('sbPuList');list.innerHTML='';
      for(const [k,end] of Object.entries(puEnd)){
        if(!activePU[k])continue;
        const rem=Math.max(0,end-Date.now()),tot=boostDur(POWERUPS[k].dur,k);
        const pct=(rem/tot*100).toFixed(1);
        const d=document.createElement('div');d.className='sb-pu-item';
        d.style.borderColor=POWERUPS[k].color;
        d.innerHTML=`<span>${POWERUPS[k].emoji}</span><span style="color:${POWERUPS[k].color}">${POWERUPS[k].label}</span><div class="sb-pu-bar"><div class="sb-pu-fill" style="width:${pct}%;background:${POWERUPS[k].color}"></div></div>`;
        list.appendChild(d);
      }
    }
  } else {
    document.getElementById('sbScorePanel').style.display='none';
    document.getElementById('sbPuPanel').style.display='none';
  }
  // HS table
  const ht=document.getElementById('sbHsTable');ht.innerHTML='';
  Object.entries(MODES).forEach(([k,v])=>{
    const r=document.createElement('div');r.className='sb-hs-row';
    r.innerHTML=`<span class="sb-hs-mode">${v.emoji} ${v.label}</span><span class="sb-hs-val">${HS[k]||0}</span>`;
    ht.appendChild(r);
  });
}

// ── MENU BUILD ────────────────────────────────────────────────────
function buildMenu(){
  AU.sfx('menu_select'); // play on every menu open

  const sk=SKINS[skinIdx];
  const prev=document.getElementById('snakePrev');prev.innerHTML='';
  for(let i=0;i<9;i++){
    const d=document.createElement('div');d.className='sp-seg';
    const sz=Math.max(10,22-i*1.5);
    d.style.cssText=`width:${sz}px;height:${sz}px;background:${i===0?sk.head:sk.body};box-shadow:0 0 ${i<2?12:5}px ${i===0?sk.head:sk.body}80`;
    prev.appendChild(d);
  }

  document.getElementById('mCoins').textContent='🪙 '+WAL.coins;
  document.getElementById('mDias').textContent='💎 '+WAL.diamonds;

  const mhs=document.getElementById('menuHs');mhs.innerHTML='';
  Object.entries(MODES).forEach(([k,v])=>{
    const d=document.createElement('div');d.className='menu-hs-item';
    d.innerHTML=`${v.emoji} <span class="menu-hs-val">${HS[k]||0}</span>`;mhs.appendChild(d);
  });

  const mc=document.getElementById('modeCards');mc.innerHTML='';
  Object.entries(MODES).forEach(([k,v])=>{
    const c=document.createElement('div');
    c.className='mode-card'+(selMode===k?' sel':'');
    const segs=Array.from({length:6},(_,i)=>{
      const sz=Math.max(7,16-i*1.5);
      const alpha=(.96-i*.12).toFixed(2);
      return `<i style="width:${sz}px;height:${sz}px;background:${v.color};opacity:${alpha};box-shadow:0 0 8px ${v.color}77"></i>`;
    }).join('');
    c.innerHTML=`<div class="mc-art" style="background:linear-gradient(135deg,${v.track},#0b1020)">
      <div class="mc-track"></div>
      <div class="mc-snake">${segs}</div>
      <div class="mc-pulse" style="color:${v.color}"></div>
    </div>
    <div class="mc-name">${v.label}</div><div class="mc-tip">${v.tip}</div>
    <div class="mc-stats"><span class="mc-pill">SPD ${v.speed}</span><span class="mc-pill">RISK ${v.danger}</span></div>`;
    c.onclick=()=>{AU.sfx('menu_select');selMode=k;buildMenu();};
    mc.appendChild(c);
  });
  document.getElementById('startBtn').disabled=!selMode;

  const tabs=document.getElementById('menuTabs');tabs.innerHTML='';
  [['themeScreen','🎨 Themes'],['skinScreen','🐍 Skins'],['boostScreen','⚡ Upgrades'],['settingsScreen','⚙️ Settings']].forEach(([sc,lbl])=>{
    const b=document.createElement('button');b.className='tab-btn';b.textContent=lbl;
    b.onclick=()=>{AU.sfx('menu_select');showScreen(sc);};
    tabs.appendChild(b);
  });
}

function renderThemePreview(){
  const idx=previewThemeIdx??SHOP.themes.sel??0;
  const th=THEMES[idx];
  const el=document.getElementById('thPreview');
  if(!el)return;
  const canBuy=previewThemeIdx!==null&&!(SHOP.themes.owned.includes(idx)||CHEAT_ACTIVE);
  el.innerHTML=`<div class="shop-preview-title">LIVE THEME PREVIEW</div>
    <div class="shop-preview-board" style="background:repeating-linear-gradient(45deg,${th.gA} 0 18px,${th.gB} 18px 36px);box-shadow:inset 0 0 0 2px ${th.gc}">
      <div style="position:absolute;right:10px;top:10px;font-size:1.2rem">${TH_ICONS[idx]}</div>
      <div style="position:absolute;left:10px;bottom:8px;font-family:'Orbitron',monospace;font-size:.62rem;color:${TH_ACC[idx]}">${th.name.toUpperCase()}</div>
    </div>
    <div class="shop-preview-note">${canBuy?'Previewing selected theme.':'Active in owned/equipped selection.'}</div>
    <div class="preview-actions">${canBuy?`<button id="thPreviewBuyBtn" class="preview-buy-btn">BUY 🪙${th.cost.c}${th.cost.d?' 💎'+th.cost.d:''}</button>`:''}</div>`;
  const b=document.getElementById('thPreviewBuyBtn');
  if(b)b.onclick=()=>{AU.sfx('menu_select');buyTheme(idx);};
}

function renderSkinPreview(){
  const idx=previewSkinIdx??SHOP.skins.sel??0;
  const sk=SKINS[idx];
  const el=document.getElementById('skPreview');
  if(!el)return;
  const canBuy=previewSkinIdx!==null&&!(SHOP.skins.owned.includes(idx)||CHEAT_ACTIVE);
  const segs=Array.from({length:8},(_,i)=>{
    const sz=Math.max(9,20-i*1.6);
    const col=i===0?sk.head:sk.body;
    return `<i style="width:${sz}px;height:${sz}px;background:${col};box-shadow:0 0 ${i<2?10:4}px ${col}66"></i>`;
  }).join('');
  el.innerHTML=`<div class="shop-preview-title">LIVE SKIN PREVIEW</div>
    <div class="shop-preview-board" style="background:linear-gradient(135deg,#0a0d1c,#070a15)">
      <div class="shop-preview-snake">${segs}</div>
    </div>
    <div class="shop-preview-note">${canBuy?'Previewing selected skin.':'Active in owned/equipped selection.'}</div>
    <div class="preview-actions">${canBuy?`<button id="skPreviewBuyBtn" class="preview-buy-btn">BUY 🪙${sk.cost}</button>`:''}</div>`;
  const b=document.getElementById('skPreviewBuyBtn');
  if(b)b.onclick=()=>{AU.sfx('menu_select');buySkin(idx);};
}

function deepClone(obj){return JSON.parse(JSON.stringify(obj));}

function snapshotBeforeDevMode(){
  DEV_SNAPSHOT={
    themeSel:SHOP.themes.sel??0,
    skinSel:SHOP.skins.sel??0,
    boosts:deepClone(SHOP.boosts||{})
  };
}

function setAllBoostsToMax(){
  if(!SHOP.boosts)SHOP.boosts={};
  Object.keys(POWERUPS).forEach(k=>{SHOP.boosts[k]=5;});
}

function enterDevMode(){
  if(!DEV_SNAPSHOT)snapshotBeforeDevMode();
  CHEAT_ACTIVE=true;
  setAllBoostsToMax();
  SV('sp2_cheat',true);
  SV('sp2_shop',SHOP);
}

function exitDevMode(){
  CHEAT_ACTIVE=false;
  if(DEV_SNAPSHOT){
    SHOP.themes.sel=DEV_SNAPSHOT.themeSel??0;
    SHOP.skins.sel=DEV_SNAPSHOT.skinSel??0;
    SHOP.boosts=deepClone(DEV_SNAPSHOT.boosts||{});
  }else{
    SHOP.themes.sel=0;
    SHOP.skins.sel=0;
    SHOP.boosts={};
  }
  previewThemeIdx=null;previewSkinIdx=null;
  pendingThemeBuy=null;pendingSkinBuy=null;
  themeIdx=SHOP.themes.sel||0;
  skinIdx=SHOP.skins.sel||0;
  SV('sp2_cheat',false);
  SV('sp2_shop',SHOP);
}

// ── SHOP BUILDERS ─────────────────────────────────────────────────
function buildThemes(){
  document.getElementById('thC').textContent='🪙 '+WAL.coins;
  document.getElementById('thD').textContent='💎 '+WAL.diamonds;
  const list=document.getElementById('thList');list.innerHTML='';
  THEMES.forEach((th,i)=>{
    const owned=SHOP.themes.owned.includes(i)||CHEAT_ACTIVE;
    const sel=SHOP.themes.sel===i;
    const preview=!owned&&previewThemeIdx===i;
    const card=document.createElement('div');
    card.className='s-card'+(sel?' active':owned?' owned':!th.ok?' locked':'');
    let badge=!th.ok&&!CHEAT_ACTIVE?`<span class="s-badge bl">SOON</span>`:
      sel?`<span class="s-badge ba">ACTIVE</span>`:
      preview?`<span class="s-badge bo">PREVIEW</span>`:
      owned?`<span class="s-badge bo">OWNED</span>`:
      `<span class="s-badge bp">🪙${th.cost.c}${th.cost.d?' 💎'+th.cost.d:''}</span>`;
    if(CHEAT_ACTIVE&&!th.ok)badge='<span class="s-badge bcheat">UNLOCKED</span>';
    const sw=`<div class="theme-swatch" style="background:${th.bg};border-color:${th.gc};color:${TH_ACC[i]}">${TH_ICONS[i]}</div>`;
    // Color preview strips
    const strips=`<div style="display:flex;gap:3px;margin-top:5px">
      <div style="width:28px;height:8px;border-radius:3px;background:${th.gA}"></div>
      <div style="width:28px;height:8px;border-radius:3px;background:${th.gB}"></div>
      <div style="width:28px;height:8px;border-radius:3px;background:${th.gc}"></div></div>`;
    card.innerHTML=`${sw}<div class="s-body"><div class="s-name">${th.name}</div><div class="s-desc">${th.desc}</div>${strips}</div>${badge}`;
    if(th.ok||CHEAT_ACTIVE)card.onclick=()=>{AU.sfx('menu_select');handleThemeClick(i);};
    list.appendChild(card);
  });
  renderThemePreview();
}
function handleThemeClick(i){
  const owned=SHOP.themes.owned.includes(i)||CHEAT_ACTIVE;
  if(owned){
    pendingThemeBuy=null;previewThemeIdx=null;
    buyTheme(i);
    return;
  }
  pendingThemeBuy=i;
  previewThemeIdx=i;
  themeIdx=i;
  buildThemes();
  buildMenu();
  syncSidebar();
}
function buyTheme(i){
  const owned=SHOP.themes.owned.includes(i)||CHEAT_ACTIVE;
  if(owned){
    SHOP.themes.sel=i;themeIdx=i;
    SV('sp2_shop',SHOP);
  }else{
    const th=THEMES[i];
    if(WAL.coins>=th.cost.c&&WAL.diamonds>=th.cost.d){
      WAL.coins-=th.cost.c;WAL.diamonds-=th.cost.d;
      SHOP.themes.owned.push(i);SHOP.themes.sel=i;themeIdx=i;
      pendingThemeBuy=null;previewThemeIdx=null;
      SV('sp2_wal',WAL);SV('sp2_shop',SHOP);
    }else{uiToast('Not enough coins/diamonds for this theme');return;}
  }
  buildThemes();buildMenu();
}

function buildSkins(){
  document.getElementById('skC').textContent='🪙 '+WAL.coins;
  const list=document.getElementById('skList');list.innerHTML='';
  SKINS.forEach((sk,i)=>{
    const owned=SHOP.skins.owned.includes(i)||CHEAT_ACTIVE;
    const sel=SHOP.skins.sel===i;
    const preview=!owned&&previewSkinIdx===i;
    const card=document.createElement('div');
    card.className='s-card'+(sel?' active':owned?' owned':!sk.ok?' locked':'');
    let badge=!sk.ok&&!CHEAT_ACTIVE?`<span class="s-badge bl">SOON</span>`:
      sel?`<span class="s-badge ba">ACTIVE</span>`:
      preview?`<span class="s-badge bo">PREVIEW</span>`:
      owned?`<span class="s-badge bo">OWNED</span>`:
      `<span class="s-badge bp">🪙${sk.cost}</span>`;
    if(CHEAT_ACTIVE&&!sk.ok)badge='<span class="s-badge bcheat">UNLOCKED</span>';
    const dots=`<div class="skin-dots"><div class="skin-dot" style="background:${sk.head};box-shadow:0 0 6px ${sk.head}88"></div><div class="skin-dot" style="background:${sk.body}"></div><div class="skin-dot" style="background:${sk.belly};border:1px solid #ffffff22"></div></div>`;
    const eyes_preview=`<div style="width:10px;height:10px;border-radius:50%;background:${sk.eyes||'#fff'};display:inline-block;margin-left:4px;vertical-align:middle;border:1px solid #333"></div>`;
    card.innerHTML=`<div class="s-icon">🐍</div><div class="s-body"><div class="s-name">${sk.name}</div><div class="s-desc">${sk.desc}</div>${dots}</div>${badge}`;
    if(sk.ok||CHEAT_ACTIVE)card.onclick=()=>{AU.sfx('menu_select');handleSkinClick(i);};
    list.appendChild(card);
  });
  renderSkinPreview();
}
function handleSkinClick(i){
  const owned=SHOP.skins.owned.includes(i)||CHEAT_ACTIVE;
  if(owned){
    pendingSkinBuy=null;previewSkinIdx=null;
    buySkin(i);
    return;
  }
  pendingSkinBuy=i;
  previewSkinIdx=i;
  skinIdx=i;
  buildSkins();
  buildMenu();
  syncSidebar();
}
function buySkin(i){
  const owned=SHOP.skins.owned.includes(i)||CHEAT_ACTIVE;
  if(owned){
    SHOP.skins.sel=i;skinIdx=i;SV('sp2_shop',SHOP);
  }else{
    const sk=SKINS[i];
    if(WAL.coins>=sk.cost){
      WAL.coins-=sk.cost;
      SHOP.skins.owned.push(i);SHOP.skins.sel=i;skinIdx=i;
      pendingSkinBuy=null;previewSkinIdx=null;
      SV('sp2_wal',WAL);SV('sp2_shop',SHOP);
    }else{uiToast('Not enough coins for this skin');return;}
  }
  buildSkins();buildMenu();
}

function buildBoosts(){
  document.getElementById('buC').textContent='🪙 '+WAL.coins;
  const list=document.getElementById('buList');list.innerHTML='';
  Object.entries(POWERUPS).forEach(([k,v])=>{
    const lv=SHOP.boosts?.[k]||0;
    const dur=Math.floor(boostDur(v.dur,k)/1000);
    const card=document.createElement('div');
    card.className='s-card';
    card.style.cursor='default';
    const stars='★'.repeat(lv)+'☆'.repeat(5-lv);
    const canUp=lv<5;
    const cost=canUp?BOOST_LV[lv+1].cost:0;
    const badge=canUp?`<span class="s-badge bp">🪙${cost}</span>`:`<span class="s-badge ba">MAX</span>`;
    card.innerHTML=`<div class="s-icon">${v.emoji}</div>
      <div class="s-body"><div class="s-name">${v.label}</div><div class="s-desc">${dur}s duration · <span style="color:var(--gold)">${stars}</span> Lv${lv}</div></div>
      ${badge}
      <button class="boost-up-btn"${canUp?'':' disabled'}>${canUp?'UPGRADE':'MAXED'}</button>`;
    const btn=card.querySelector('.boost-up-btn');
    if(canUp&&btn)btn.onclick=(e)=>{e.stopPropagation();AU.sfx('menu_select');upgradeBoost(k);};
    list.appendChild(card);
  });
}
function upgradeBoost(type){
  const lv=SHOP.boosts?.[type]||0;if(lv>=5)return;
  const cost=BOOST_LV[lv+1].cost;
  if(WAL.coins>=cost){WAL.coins-=cost;if(!SHOP.boosts)SHOP.boosts={};
    SHOP.boosts[type]=lv+1;SV('sp2_wal',WAL);SV('sp2_shop',SHOP);buildBoosts();}
  else uiToast('Not enough coins to upgrade this boost');
}

// Build sidebar food legend (once)
function buildLegend(){
  const leg=document.getElementById('sbLegend');leg.innerHTML='';
  Object.entries(FOODS).forEach(([k,v])=>{
    const d=document.createElement('div');d.className='sb-leg-item';
    d.innerHTML=`<span>${v.emoji}</span><span>${k[0].toUpperCase()+k.slice(1)}</span><span class="sb-leg-pts">+${v.pts}</span>`;
    leg.appendChild(d);
  });
}

// ── CHEAT CODE ────────────────────────────────────────────────────
const CHEAT_PASSWORD='TMKC';

function initCheatUI(){
  const input=document.getElementById('cheatInput');
  const submit=document.getElementById('cheatSubmitBtn');
  const status=document.getElementById('cheatStatus');
  const activeBar=document.getElementById('cheatActiveBar');
  const inputSection=document.getElementById('cheatInputSection');
  const exitBtn=document.getElementById('cheatExitBtn');

  function refreshCheatUI(){
    if(CHEAT_ACTIVE){
      activeBar.style.display='flex';
      inputSection.style.display='none';
    } else {
      activeBar.style.display='none';
      inputSection.style.display='block';
      input.value='';input.className='cheat-input';status.textContent='';status.className='cheat-status';
    }
  }
  refreshCheatUI();

  submit.onclick=()=>{
    AU.sfx('menu_select');
    const val=input.value.trim().toUpperCase();
    if(val===CHEAT_PASSWORD){
      enterDevMode();
      input.className='cheat-input valid';
      status.textContent='✅ DEVELOPER MODE ACTIVATED';status.className='cheat-status ok';
      setTimeout(()=>{refreshCheatUI();buildThemes();buildSkins();buildBoosts();buildMenu();syncSidebar();},800);
    } else {
      input.className='cheat-input invalid';
      status.textContent='❌ INVALID CODE';status.className='cheat-status err';
      setTimeout(()=>{input.className='cheat-input';status.textContent='';},1500);
    }
  };

  input.addEventListener('keydown',e=>{if(e.key==='Enter')submit.click();});
  input.addEventListener('input',()=>{input.value=input.value.toUpperCase();});

  exitBtn.onclick=()=>{
    AU.sfx('menu_select');
    exitDevMode();
    refreshCheatUI();
    buildThemes();buildSkins();buildBoosts();buildMenu();syncSidebar();
  };
}

// ── SCREEN ROUTING ────────────────────────────────────────────────
const ALL_SCREENS=['menuScreen','themeScreen','skinScreen','boostScreen','settingsScreen'];

// Track which non-game screen we're on (for sidebar legend building etc)
function showScreen(id){
  // menu_select sound on every transition
  if(id!=='menuScreen')AU.sfx('menu_select');

  if(id==='menuScreen'){
    previewThemeIdx=null;previewSkinIdx=null;
    pendingThemeBuy=null;pendingSkinBuy=null;
    themeIdx=SHOP.themes.sel||0;
    skinIdx=SHOP.skins.sel||0;
  }

  ALL_SCREENS.forEach(s=>document.getElementById(s).classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  curScreen=id;

  // HUD / PU bar visibility
  const inGame=false; // these screens are all menus
  document.getElementById('hud').style.display='none';
  document.getElementById('puBar').style.display='none';

  // Music: play menu_music on ALL non-game screens, don't restart if already playing
  AU.playMusic('menu_music');

  if(id==='menuScreen'){buildMenu();}
  else if(id==='themeScreen'){buildThemes();}
  else if(id==='skinScreen'){buildSkins();}
  else if(id==='boostScreen'){buildBoosts();}
  else if(id==='settingsScreen'){initCheatUI();}

  syncSidebar();
}

// ── GAME START / RETRY / MENU ──────────────────────────────────────
function startGame(){
  if(!selMode)return;
  // Prevent previewed (not purchased) cosmetics from being used in matches.
  previewThemeIdx=null;previewSkinIdx=null;
  pendingThemeBuy=null;pendingSkinBuy=null;
  themeIdx=SHOP.themes.sel||0;
  skinIdx=SHOP.skins.sel||0;
  AU.sfx('start');
  AU.stopMusic('menu_music',()=>{
    setTimeout(()=>AU.playMusic('background'),350);
  });

  // Hide all screens
  ALL_SCREENS.forEach(s=>document.getElementById(s).classList.add('hidden'));
  curScreen='game';

  // Show HUD
  document.getElementById('hud').style.display='flex';
  document.getElementById('puBar').style.display='flex';

  resizeCanvas();
  started=true;

  requestAnimationFrame(()=>initGame(selMode));
}

function retryGame(){
  if(!curMode)return;
  AU.sfx('start');
  AU.stopAll();
  initGame(curMode);
  setTimeout(()=>AU.playMusic('background'),380);
}

function goToMenu(){
  AU.sfx('menu_select');
  cancelAnimationFrame(rafId);
  gameOver=false;paused=false;started=false;
  document.getElementById('goOverlay').classList.add('hidden');
  document.getElementById('pauseOverlay').classList.add('hidden');
  document.getElementById('hud').style.display='none';
  document.getElementById('puBar').style.display='none';
  AU.stopAll();
  showScreen('menuScreen');
}

function togglePause(){
  AU.sfx('menu_select');
  paused=!paused;
  document.getElementById('pauseOverlay').classList.toggle('hidden',!paused);
}

// ── KEYBOARD ──────────────────────────────────────────────────────
document.addEventListener('keydown',e=>{
  AU.unlock();
  if(curScreen==='game'||curScreen==='gameScreen'){
    if(e.key==='Escape'){e.preventDefault();if(gameOver)goToMenu();else togglePause();return;}
    if(e.key===' '){e.preventDefault();if(gameOver)retryGame();else togglePause();return;}
    if((e.key==='p'||e.key==='P')&&!gameOver){togglePause();return;}
    if(gameOver||paused)return;
    if(!dirLocked){
      const d=dir;
      if((e.key==='ArrowUp'   ||e.key==='w'||e.key==='W')&&d.y!== 1){nextDir={x:0,y:-1};dirLocked=true;}
      if((e.key==='ArrowDown' ||e.key==='s'||e.key==='S')&&d.y!==-1){nextDir={x:0,y:1} ;dirLocked=true;}
      if((e.key==='ArrowLeft' ||e.key==='a'||e.key==='A')&&d.x!== 1){nextDir={x:-1,y:0};dirLocked=true;}
      if((e.key==='ArrowRight'||e.key==='d'||e.key==='D')&&d.x!==-1){nextDir={x:1,y:0} ;dirLocked=true;}
    }
  } else {
    if(e.key==='Escape'){AU.sfx('menu_select');showScreen('menuScreen');}
    if((e.key===' '||e.key==='Enter')&&curScreen==='menuScreen'&&selMode){e.preventDefault();startGame();}
  }
});

// ── TOUCH / SWIPE ─────────────────────────────────────────────────
let tStart=null;
document.addEventListener('touchstart',e=>{
  AU.unlock();
  tStart={x:e.touches[0].clientX,y:e.touches[0].clientY};
},{passive:true});
document.addEventListener('touchend',e=>{
  if(!tStart)return;
  const dx=e.changedTouches[0].clientX-tStart.x;
  const dy=e.changedTouches[0].clientY-tStart.y;
  const adx=Math.abs(dx),ady=Math.abs(dy);
  if(Math.max(adx,ady)<20){tStart=null;return;}
  if(curScreen==='game'&&!gameOver&&!paused&&!dirLocked){
    if(adx>ady){
      if(dx>0&&dir.x!==-1){nextDir={x:1,y:0};dirLocked=true;}
      else if(dx<0&&dir.x!==1){nextDir={x:-1,y:0};dirLocked=true;}
    } else {
      if(dy>0&&dir.y!==-1){nextDir={x:0,y:1};dirLocked=true;}
      else if(dy<0&&dir.y!==1){nextDir={x:0,y:-1};dirLocked=true;}
    }
  }
  tStart=null;
},{passive:true});

// Tap on game over = retry
document.getElementById('goOverlay').addEventListener('pointerdown',e=>{
  if(e.target===document.getElementById('goOverlay'))retryGame();
});

// ── BUTTON WIRING ─────────────────────────────────────────────────
const wire=(id,fn)=>{const el=document.getElementById(id);if(el)el.onclick=fn;};
wire('startBtn',   startGame);
wire('pauseBtn',   togglePause);
wire('resumeBtn',  ()=>{AU.sfx('menu_select');paused=false;document.getElementById('pauseOverlay').classList.add('hidden');});
wire('restartBtn', ()=>{AU.sfx('menu_select');retryGame();});
wire('pauseMenuBtn',goToMenu);
wire('retryBtn',   retryGame);
wire('goMenuBtn',  goToMenu);
wire('backTh',     ()=>{AU.sfx('menu_select');showScreen('menuScreen');});
wire('backSk',     ()=>{AU.sfx('menu_select');showScreen('menuScreen');});
wire('backBu',     ()=>{AU.sfx('menu_select');showScreen('menuScreen');});
wire('backSet',    ()=>{AU.sfx('menu_select');showScreen('menuScreen');});

// Volume slider
const vs=document.getElementById('volSlider'),vv=document.getElementById('volVal');
vs.value=Math.round(AU.getVol()*100);vv.textContent=Math.round(AU.getVol()*100)+'%';
vs.oninput=()=>{const v=vs.value/100;AU.setVol(v);vv.textContent=Math.round(v*100)+'%';};
const bvs=document.getElementById('bgVolSlider'),bvv=document.getElementById('bgVolVal');
bvs.value=Math.round(AU.getBgVol()*100);bvv.textContent=Math.round(AU.getBgVol()*100)+'%';
bvs.oninput=()=>{const v=bvs.value/100;AU.setBgVol(v);bvv.textContent=Math.round(v*100)+'%';};

// ── RESIZE ────────────────────────────────────────────────────────
window.addEventListener('resize',()=>{if(curScreen==='game')resizeCanvas();});

// ── POLYFILL ──────────────────────────────────────────────────────
if(!CanvasRenderingContext2D.prototype.roundRect){
  CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){
    if(Array.isArray(r))r=r[0];
    if(w<2*r)r=w/2;if(h<2*r)r=h/2;
    this.beginPath();this.moveTo(x+r,y);
    this.arcTo(x+w,y,x+w,y+h,r);this.arcTo(x+w,y+h,x,y+h,r);
    this.arcTo(x,y+h,x,y,r);this.arcTo(x,y,x+w,y,r);
    this.closePath();return this;
  };
}

// ── BOOT ──────────────────────────────────────────────────────────
if(CHEAT_ACTIVE){
  snapshotBeforeDevMode();
  setAllBoostsToMax();
  SV('sp2_shop',SHOP);
}
buildLegend();
showScreen('menuScreen');
// Don't play menu_select on very first load