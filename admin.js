// admin.js — Brownie Bite (admin)
(function(){
  // Require login
  if(sessionStorage.getItem('adminLoggedIn')!=='true'){
    location.href = 'login.html';
    return;
  }

  const ready = () => typeof window.__FIREBASE_CONFIG__ !== 'undefined';
  const wait = (cb)=>{ if(ready()) cb(); else setTimeout(()=>wait(cb),50); };
  wait(init);

  function init(){
    firebase.initializeApp(window.__FIREBASE_CONFIG__);
    const db = firebase.database();

    // Logout
    document.getElementById('logoutBtn').addEventListener('click',()=>{
      sessionStorage.removeItem('adminLoggedIn');
      location.href = 'login.html';
    });

    const tbody = document.querySelector('#ordersTable tbody');

    function renderRow(key, o){
      const tr = document.createElement('tr');
      const when = o.createdAt ? new Date(o.createdAt).toLocaleString() : '';
      tr.innerHTML = `
        <td>${o.orderId||key}</td>
        <td>${o.name||''}<br><span class="small">${o.email||''}</span></td>
        <td>${o.phone||''}</td>
        <td>${o.address||''}</td>
        <td>${o.productName||o.productId||''}</td>
        <td>${o.qty||1}</td>
        <td>₹${o.total||0}</td>
        <td>
          <select data-k="${key}" data-field="paymentStatus">
            ${['Unpaid','Awaiting UPI','Paid','Refunded'].map(s=>`<option ${o.paymentStatus===s?'selected':''}>${s}</option>`).join('')}
          </select>
        </td>
        <td>
          <select data-k="${key}" data-field="status">
            ${['Pending','Preparing','Prepared','Out for Delivery','Delivered','Cancelled'].map(s=>`<option ${o.status===s?'selected':''}>${s}</option>`).join('')}
          </select>
        </td>
        <td>${when}</td>
        <td class="actions">
          <button class="btn-secondary" data-action="save" data-k="${key}">Save</button>
          <button class="btn-danger" data-action="delete" data-k="${key}">Delete</button>
        </td>
      `;
      return tr;
    }

    function refresh(){
      db.ref('orders').on('value', snap=>{
        tbody.innerHTML = '';
        const data = snap.val()||{};
        const rows = Object.entries(data).sort((a,b)=> (b[1].createdAt||0)-(a[1].createdAt||0));
        rows.forEach(([k,o])=> tbody.appendChild(renderRow(k,o)));
      });
    }
    refresh();

    // Save & Delete
    tbody.addEventListener('click', async (e)=>{
      const btn = e.target.closest('button');
      if(!btn) return;
      const key = btn.dataset.k;
      if(btn.dataset.action==='delete'){
        if(confirm('Delete this order?')) await db.ref('orders/'+key).remove();
      }
      if(btn.dataset.action==='save'){
        // find selects in the same row
        const tr = btn.closest('tr');
        const selects = tr.querySelectorAll('select[data-k="'+key+'"]');
        const updates = {};
        selects.forEach(s=> updates[s.dataset.field] = s.value);
        await db.ref('orders/'+key).update(updates);
        alert('Saved.');
      }
    });

    // Change handlers (optional auto-save when changed)
    tbody.addEventListener('change', async (e)=>{
      const s = e.target.closest('select[data-k]');
      if(!s) return;
      const key = s.dataset.k;
      const field = s.dataset.field;
      await db.ref('orders/'+key).update({[field]: s.value});
    });

    // Menu editor
    const addItem = document.getElementById('addItem');
    const resetMenu = document.getElementById('resetMenu');

    addItem.addEventListener('click', async ()=>{
      const name = document.getElementById('mName').value.trim();
      const price = Number(document.getElementById('mPrice').value||0);
      const img = document.getElementById('mImg').value.trim();
      if(!name || price<=0){ alert('Enter a valid name and price'); return; }
      const id = name.replace(/\s+/g,'').replace(/[^a-z0-9]/ig,'').slice(0,20) || ('Item'+Date.now());
      await db.ref('menu/'+id).set({id,name,price,img});
      alert('Menu updated.');
    });

    resetMenu.addEventListener('click', async ()=>{
      if(!confirm('Reset menu to default items?')) return;
      const defaults = {
        Classic:{id:'Classic',name:'Classic Brownie',price:40,img:''},
        Walnut:{id:'Walnut',name:'Walnut Brownie',price:50,img:''},
        Oreo:{id:'Oreo',name:'Oreo Brownie',price:50,img:''},
        ChocoChip:{id:'ChocoChip',name:'Choco-chip',price:50,img:''}
      };
      await db.ref('menu').set(defaults);
      alert('Menu reset.');
    });
  }
})();