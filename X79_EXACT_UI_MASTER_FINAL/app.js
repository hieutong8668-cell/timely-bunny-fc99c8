(()=>{
'use strict';
const modal=document.getElementById('authModal');
const connect=document.getElementById('connectScreen');
const pct=document.getElementById('connectPct');
const bar=document.getElementById('connectBar');
const text=document.getElementById('connectText');
const msg=document.getElementById('authMsg');
const toast=document.getElementById('toast');
let busy=false,toastTimer=0;
function setTab(name){
  document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));
  document.querySelectorAll('[data-form]').forEach(f=>f.classList.toggle('active',f.dataset.form===name));
  msg.textContent='';
}
function openAuth(name){if(busy)return;setTab(name);modal.classList.add('open');modal.setAttribute('aria-hidden','false')}
function closeAuth(){if(busy)return;modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}
document.querySelectorAll('[data-auth]').forEach(b=>b.addEventListener('click',()=>openAuth(b.dataset.auth)));
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.tab)));
document.getElementById('authClose').addEventListener('click',closeAuth);
modal.addEventListener('pointerdown',e=>{if(e.target===modal)closeAuth()});
function runConnect(){
  if(busy)return;busy=true;modal.classList.remove('open');connect.classList.add('show');
  const start=performance.now(),duration=2000;
  const tick=now=>{
    const raw=Math.min(1,(now-start)/duration);const eased=1-Math.pow(1-raw,2.1);const p=raw>=1?100:Math.min(99,Math.floor(eased*100));
    pct.textContent=p+'%';bar.style.width=p+'%';
    text.textContent=p<30?'Đang xác thực tài khoản...':p<65?'Đang kết nối máy chủ...':p<92?'Đang đồng bộ dữ liệu...':'Đang hoàn tất...';
    if(raw<1)requestAnimationFrame(tick);else{pct.textContent='100%';bar.style.width='100%';text.textContent='Hoàn tất';setTimeout(()=>{connect.classList.remove('show');busy=false;sessionStorage.setItem('x79-auth','1')},180)}
  };
  requestAnimationFrame(tick);
}
function submit(e,kind){
  e.preventDefault();if(busy||!e.currentTarget.reportValidity())return;
  if(kind==='register'&&e.currentTarget.elements.password.value!==e.currentTarget.elements.confirm.value){msg.textContent='Mật khẩu nhập lại chưa khớp.';return}
  runConnect();
}
document.getElementById('loginForm').addEventListener('submit',e=>submit(e,'login'));
document.getElementById('registerForm').addEventListener('submit',e=>submit(e,'register'));
document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>{
  if(busy)return;toast.textContent=b.dataset.action;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),850);
}));
})();
