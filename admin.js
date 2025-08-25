// admin.js
if (!sessionStorage.getItem('adminLoggedIn')) location.href = 'login.html';

firebase.initializeApp(window.FB_CFG);
const db = firebase.database();

const ordersTbody = document.querySelector('#ordersTable tbody');
const logoutBtn = document.getElementById('logoutBtn');

logoutBtn.addEventListener('click',()=>{ sessionStorage.removeItem('adminLoggedIn'); location.href='login.html'; });

const PAY_STATES = ['Pending','Paid'];
const ORDER_STATES = ['Preparing','Prepared','Out for delivery','Delivered'];

function renderOrderRow(id, o){
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${new Date(o.createdAt||Date.now()).toLocaleString()}</td>
    <td><span class="kbd">${o.orderId||id}</span></td>
    <td>${o.name||''}</td>
    <td>${o.phone||''}</td>
    <td style="min-width:220px">${o.address||''}</td>
    <td style="min-width:220px">${(o.items||[]).map(i=>i.name).join(', ')}</td>
    <td>${(o.items||[]).reduce((s,i)=>s+(i.qty||0),0)}</td>
    <td>₹${o.total||0}</td>
    <td>
      <select data-act="pay" data-id="${id}">
        ${PAY_STATES.map(s=>`<option value="${s}" ${o.paymentStatus===s?'selected':''}>${s}</option>`).join('')}
      </select>
    </td>
    <td>
      <select data-act="status" data-id="${id}">
        ${ORDER_STATES.map(s=>`<option value="${s}" ${o.status===s?'selected':''}>${s}</option>`).join('')}
      </select>
    </td>
    <td>
      <button class="btn ghost" data-act="del" data-id="${id}">Delete</button>
    </td>`;
  ordersTbody.appendChild(tr);
}

db.ref('orders').on('value', snap=>{
  ordersTbody.innerHTML='';
  const val = snap.val()||{};
  Object.entries(val).reverse().forEach(([id,o])=>renderOrderRow(id,o));
});

ordersTbody.addEventListener('change', e=>{
  const el = e.target;
  const id = el.dataset.id;
  const act = el.dataset.act;
  if (!id || !act) return;
  const ref = db.ref('orders/'+id);
  if (act==='pay') ref.update({paymentStatus: el.value});
  if (act==='status') ref.update({status: el.value});
});
ordersTbody.addEventListener('click', e=>{
  const el = e.target;
  if (el.dataset.act==='del'){
    const id = el.dataset.id;
    if (confirm('Delete this order?')) db.ref('orders/'+id).remove();
  }
});

// Menu manager
const listEl = document.getElementById('menuAdmin');
function refreshMenu(){
  db.ref('menu').once('value').then(s=>{
    const m = s.val()||{}; listEl.innerHTML='';
    Object.entries(m).forEach(([id,item])=>{
      const li = document.createElement('li');
      li.innerHTML = `<span class="kbd">${id}</span> — ${item.name} (₹${item.price}) <button class="btn ghost" data-del="${id}">Remove</button>`;
      listEl.appendChild(li);
    });
  });
}
refreshMenu();

document.getElementById('addMenu').addEventListener('click',()=>{
  const name = document.getElementById('mName').value.trim();
  const price = parseInt(document.getElementById('mPrice').value,10)||0;
  if (!name || !price) return alert('Enter name & price');
  const id = name.toLowerCase().replace(/\s+/g,'-');
  db.ref('menu/'+id).set({name, price}).then(()=>{
    document.getElementById('mName').value=''; document.getElementById('mPrice').value='';
    refreshMenu();
  });
});
listEl.addEventListener('click', e=>{
  if (e.target.dataset.del){
    db.ref('menu/'+e.target.dataset.del).remove().then(refreshMenu);
  }
});
