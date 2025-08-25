// script.js
firebase.initializeApp(window.FB_CFG);
const db = firebase.database();

const DEFAULT_MENU = [
  {id:'classic', name:'Classic Brownie', price:40, emoji:'🍫'},
  {id:'walnut', name:'Walnut Brownie', price:50, emoji:'🌰'},
  {id:'oreo', name:'Oreo Brownie', price:50, emoji:'🍪'},
  {id:'chocochip', name:'Choco-chip Brownie', price:50, emoji:'🍫'}
];

const menuList = document.getElementById('menuList');
const cartList = document.getElementById('cartList');
const cartTotalEl = document.getElementById('cartTotal');

let cart = [];

function money(n){ return (n||0).toFixed(0); }
function toast(msg){
  const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 1800);
}

function renderMenu(items){
  menuList.innerHTML='';
  items.forEach(it=>{
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `
      <div class="thumb">${it.emoji||'🍫'}</div>
      <div class="meta">
        <h4>${it.name}</h4>
        <div class="row" style="align-items:center;justify-content:space-between">
          <span class="badge">₹${it.price}</span>
          <button class="btn ghost" data-add="${it.id}">Add</button>
        </div>
      </div>`;
    menuList.appendChild(div);
  });
}

function calcTotal(){ return cart.reduce((s,i)=>s+i.price*i.qty,0); }

function renderCart(){
  cartList.innerHTML='';
  cart.forEach((i,idx)=>{
    const li = document.createElement('li');
    li.innerHTML = `
      <div style="flex:1">${i.name} ×
        <input type="number" min="1" value="${i.qty}" data-qty="${idx}" style="width:64px"> 
        <span class="small">₹${i.price} each</span>
      </div>
      <div>₹${i.price*i.qty}</div>
      <button class="btn ghost" data-del="${idx}">✕</button>`;
    cartList.appendChild(li);
  });
  cartTotalEl.textContent = money(calcTotal());
}

menuList.addEventListener('click', e=>{
  const id = e.target.dataset.add; if (!id) return;
  const it = currentMenu.find(x=>x.id===id);
  const found = cart.find(x=>x.id===id);
  if (found) found.qty += 1;
  else cart.push({id:it.id, name:it.name, price:it.price, qty:1});
  renderCart();
});

cartList.addEventListener('input', e=>{
  const idx = e.target.dataset.qty; if (idx==null) return;
  const v = Math.max(1, parseInt(e.target.value,10)||1);
  cart[idx].qty = v; renderCart();
});
cartList.addEventListener('click', e=>{
  const idx = e.target.dataset.del; if (idx==null) return;
  cart.splice(parseInt(idx,10),1); renderCart();
});

// Load menu from DB (fallback to default)
let currentMenu = [];
db.ref('menu').once('value').then(s=>{
  const m = s.val();
  currentMenu = m ? Object.entries(m).map(([id,val])=>({id, name:val.name, price:val.price, emoji:'🍫'})) : DEFAULT_MENU;
  renderMenu(currentMenu);
});

// Payment option selection
let chosenPay = 'COD';
document.getElementById('payOptions').addEventListener('click', e=>{
  const m = e.target.closest('.paybtn'); if (!m) return;
  document.querySelectorAll('.paybtn').forEach(b=>b.classList.remove('selectedPay'));
  m.classList.add('selectedPay'); chosenPay = m.dataset.method;
});

// Place Order
document.getElementById('placeOrder').addEventListener('click', async ()=>{
  if (cart.length===0) return toast('Add something to cart');
  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const addr = document.getElementById('custAddr').value.trim();
  const email = document.getElementById('custEmail').value.trim();
  const pin = document.getElementById('custPincode').value.trim();
  if (!name||!phone||!addr||!pin) return toast('Please fill delivery details');
  const total = calcTotal();

  // Order ID
  const now = new Date();
  const rid = Math.floor(1000+Math.random()*9000);
  const orderId = `BB-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${rid}`;

  // Save as Pending (COD) or mark Paid if UPI flow is opened (optimistic; admin can adjust)
  const base = {
    orderId, name, phone, address: addr, email, pincode: pin,
    items: cart, total, status:'Preparing',
    paymentMethod: chosenPay==='COD'?'COD':'UPI',
    paymentStatus: chosenPay==='COD'?'Pending':'Pending',
    createdAt: Date.now()
  };
  const newRef = db.ref('orders').push();
  await newRef.set(base);

  if (chosenPay==='COD'){
    location.href = `thankyou.html?id=${encodeURIComponent(orderId)}`;
    return;
  }

  // Build UPI deeplink (auto note = order id)
  const pa = '9380248566@fam'; // your UPI ID
  const pn = encodeURIComponent('Brownie Bite');
  const am = total.toFixed(2);
  const tn = encodeURIComponent(orderId);
  const url = `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR&tn=${tn}`;

  // Try intent (Android), else custom scheme; on iOS may show chooser / do nothing
  const isAndroid = /Android/i.test(navigator.userAgent);
  if (isAndroid){
    const intent = `intent://pay?pa=${encodeURIComponent(pa)}&pn=${pn}&am=${am}&cu=INR&tn=${tn}#Intent;scheme=upi;S.browser_fallback_url=${encodeURIComponent(location.origin+'/thankyou.html?id='+orderId)};end`;
    // Open intent
    window.location.href = intent;
    // Also set a fallback timer to thankyou page
    setTimeout(()=>{ location.href = `thankyou.html?id=${encodeURIComponent(orderId)}`; }, 4000);
  }else{
    // iOS / others: try to open scheme; fallback after a few seconds
    const a = document.createElement('a'); a.href = url; document.body.appendChild(a); a.click();
    setTimeout(()=>{ location.href = `thankyou.html?id=${encodeURIComponent(orderId)}`; }, 5000);
  }
});

// Tracker
document.getElementById('openTrack').addEventListener('click', e=>{
  e.preventDefault(); document.getElementById('trackModal').classList.add('show');
});
document.getElementById('closeTrack').addEventListener('click', ()=>{
  document.getElementById('trackModal').classList.remove('show');
});
document.getElementById('trackBtn').addEventListener('click', ()=>{
  const id = document.getElementById('trackInput').value.trim();
  if (!id) return;
  db.ref('orders').orderByChild('orderId').equalTo(id).once('value').then(s=>{
    const v = s.val();
    if (!v){ document.getElementById('trackResult').textContent = 'Not found'; return; }
    const key = Object.keys(v)[0]; const o = v[key];
    document.getElementById('trackResult').innerHTML = 
      `<div class="status-pill">Status: ${o.status}</div> · <span class="status-pill">Payment: ${o.paymentStatus}</span>`;
  });
});
