(()=>{'use strict';
const ASSETS={
  xocdia:{src:'assets/xocdia-md5-master.png',title:'Xóc Đĩa MD5',left:'CHAN',right:'LE',subs:['CHAN','LE','CHAN','LE']},
  taixiu:{src:'assets/taixiu-md5-master.png',title:'Tài Xỉu MD5',left:'TAI',right:'XIU',subs:['TAI_LE','TAI_CHAN','XIU_LE','XIU_CHAN']}
};
const CHIP_LEFT={10000:30.0,50000:39.2,100000:48.4,500000:57.6,1000000:66.8};
const VALID_CHIPS=Object.keys(CHIP_LEFT).map(Number);
const state={
  current:null,busy:false,
  xocdia:{balance:9888888888,selectedChip:10000,pending:{},last:{},confirmed:{},locked:false,muted:false,round:1234567},
  taixiu:{balance:9888888888,selectedChip:10000,pending:{},last:{},confirmed:{},locked:false,muted:false,round:7895421}
};
const $=id=>document.getElementById(id),overlay=$('gameOverlay'),art=$('gameArt'),md5=$('md5Label'),glow=$('chipGlow'),fx=$('motionFx');
let clickLock=0;
function guard(ms=100){const now=performance.now();if(now<clickLock)return false;clickLock=now+ms;return true}
function bind(el,fn){if(!el)return;el.addEventListener('click',fn,{passive:true});el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fn(e)}});el.addEventListener('pointerdown',()=>el.classList.add('is-pressed'),{passive:true});['pointerup','pointercancel','pointerleave'].forEach(n=>el.addEventListener(n,()=>el.classList.remove('is-pressed'),{passive:true}))}
function publicMd5(game){const s=state[game],seed=`X79|${game}|${s.round}|${s.balance}|${s.selectedChip}`;let h1=0x811c9dc5,h2=0x9e3779b9,h3=0x85ebca6b,h4=0xc2b2ae35;for(let i=0;i<seed.length;i++){const c=seed.charCodeAt(i);h1=Math.imul(h1^c,16777619);h2=Math.imul(h2^c,2246822519);h3=Math.imul(h3^c,3266489917);h4=Math.imul(h4^c,668265263)}return[h1,h2,h3,h4].map(v=>(v>>>0).toString(16).padStart(8,'0')).join('')}
function setMd5(){if(!state.current)return;const s=state[state.current];md5.textContent=`MD5: ${publicMd5(state.current)}  •  PHIÊN #${s.round}`}
function open(game){if(!ASSETS[game]||state.current||!guard(160))return;state.current=game;const s=state[game];s.locked=false;art.src=ASSETS[game].src;art.alt=`Bàn ${ASSETS[game].title} X79`;setMd5();overlay.classList.add('active');overlay.setAttribute('aria-hidden','false');history.replaceState({x79:game},'',location.pathname+location.search+'#'+game)}
function close(){if(!state.current||!guard(140))return;overlay.classList.remove('active');overlay.setAttribute('aria-hidden','true');state.current=null;history.replaceState({x79:'lobby'},'',location.pathname+location.search)}
function gameState(){return state.current?state[state.current]:null}
function total(obj){return Object.values(obj).reduce((a,b)=>a+b,0)}
function selectChip(v){const s=gameState();if(!s||s.locked||!VALID_CHIPS.includes(v)||!guard(70))return;s.selectedChip=v;glow.style.left=CHIP_LEFT[v]+'%';glow.classList.remove('flash');requestAnimationFrame(()=>glow.classList.add('flash'));setTimeout(()=>glow.classList.remove('flash'),140);setMd5()}
function animateBet(side){fx.classList.remove('go-left','go-right');void fx.offsetWidth;fx.classList.add(side==='left'?'go-left':'go-right');setTimeout(()=>fx.classList.remove('go-left','go-right'),430)}
function placeBet(key,side){const s=gameState();if(!s||s.locked||!guard(75))return;if(total(s.pending)+s.selectedChip>s.balance)return;s.pending[key]=(s.pending[key]||0)+s.selectedChip;animateBet(side);document.dispatchEvent(new CustomEvent('x79:bet-pending',{detail:{game:state.current,key,value:s.selectedChip,pending:{...s.pending}}}))}
function cancel(){const s=gameState();if(!s||s.locked||!guard(110))return;s.pending={}}
function repeat(){const s=gameState();if(!s||s.locked||!guard(110))return;const amount=total(s.last);if(!amount||amount>s.balance)return;s.pending={...s.last}}
function confirm(){const s=gameState();if(!s||s.locked||!guard(150))return;const amount=total(s.pending);if(!amount||amount>s.balance)return;s.balance-=amount;for(const[k,v]of Object.entries(s.pending))s.confirmed[k]=(s.confirmed[k]||0)+v;s.last={...s.pending};s.pending={};s.locked=true;setMd5();document.dispatchEvent(new CustomEvent('x79:bet-confirmed',{detail:{game:state.current,balance:s.balance,last:{...s.last},confirmed:{...s.confirmed},md5:publicMd5(state.current)}}))}
function mute(){const s=gameState();if(!s||!guard(70))return;s.muted=!s.muted;document.dispatchEvent(new CustomEvent('x79:mute-change',{detail:{game:state.current,muted:s.muted}}))}
bind($('openXocDiaMd5'),()=>open('xocdia'));bind($('openTaiXiuMd5'),()=>open('taixiu'));bind($('exitGame'),close);bind($('muteGame'),mute);bind($('cancelBet'),cancel);bind($('repeatBet'),repeat);bind($('confirmBet'),confirm);
document.querySelectorAll('[data-chip]').forEach(z=>bind(z,()=>selectChip(Number(z.dataset.chip))));
bind($('betLeft'),()=>{if(state.current)placeBet(ASSETS[state.current].left,'left')});bind($('betRight'),()=>{if(state.current)placeBet(ASSETS[state.current].right,'right')});
[$('betSub1'),$('betSub2'),$('betSub3'),$('betSub4')].forEach((z,i)=>bind(z,()=>{if(state.current)placeBet(ASSETS[state.current].subs[i],i<2?'left':'right')}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.current)close()});window.addEventListener('popstate',()=>{if(state.current)close()});
window.X79MD5={openXocDia:()=>open('xocdia'),openTaiXiu:()=>open('taixiu'),close,unlock(game){if(state[game])state[game].locked=false},nextRound(game){if(state[game]){state[game].round++;state[game].locked=false;if(state.current===game)setMd5()}},getState(game){return state[game]?JSON.parse(JSON.stringify(state[game])):null}};
})();
