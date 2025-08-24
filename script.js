// script.js — Brownie Bite (client)
(function(){
  // Guard: wait for config
  const ready = () => typeof window.__FIREBASE_CONFIG__ !== 'undefined';
  const wait = (cb)=>{ if(ready()) cb(); else setTimeout(()=>wait(cb),50); };
  wait(init);

  function init(){
    firebase.initializeApp(window.__FIREBASE_CONFIG__);
    const db = firebase.database();

    // Default menu (can be overridden by /menu in DB)
    const defaultMenu = [
      {id:"Classic",    name:"Classic Brownie", price:40, img:"https://images.unsplash.com/photo-1606313564200-e75d5e30476b?q=80&w=400&auto=format&fit=crop"},
      {id:"Walnut",     name:"Walnut Brownie",  price:50, img:"https://images.unsplash.com/photo-1589308078057-918dc4b00f68?q=80&w=400&auto=format&fit=crop"},
      {id:"Oreo",       name:"Oreo Brownie",    price:50, img:"https://images.unsplash.com/photo-1590086782792-42dd2350140b?q=80&w=400&auto=format&fit=crop"},
      {id:"ChocoChip",  name:"Choco-chip",      price:50, img:"https://images.unsplash.com/photo-1541781286675-b292b6f2df26?q=80&w=400&auto=format&fit=crop"}
    ];

    const menuGrid = document.getElementById('menuGrid');
    const productSel = document.getElementById('product');
    const qtyEl = document.getElementById('qty');
    const totalAmt = document.getElementById('totalAmt');
    const unitNote = document.getElementById('unitPriceNote');
    const orderForm = document.getElementById('orderForm');
    const upiRow = document.getElementById('upiRow');
    const trackBtn = document.getElementById('trackBtn');
    const trackId = document.getElementById('trackId');
    const trackResult = document.getElementById('trackResult');

    const UPI_ID = "9380248566@fam";
    const PAYEE_NAME = "Brownie Bite";

    // Show menu from DB else default
    firebase.database().ref('menu').once('value').then(snap=>{
      const data = snap.val();
      const items = data ? Object.values(data) : defaultMenu;
      renderMenu(items);
      buildProductOptions(items);
      recalc();
    }).catch(()=>{
      renderMenu(defaultMenu);
      buildProductOptions(defaultMenu);
      recalc();
    });

    function renderMenu(items){
      menuGrid.innerHTML = "";
      items.forEach(it=>{
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <div class="menu-item">
            <img src="${it.img||''}" alt="${it.name}">
            <div class="meta">
              <div style="font-weight:600">${it.name}</div>
              <div class="small">Rich, fudgy & gooey</div>
              <div class="price">₹${it.price}</div>
            </div>
            <button class="btn-secondary" data-id="${it.id}" data-price="${it.price}" data-name="${it.name}">Add</button>
          </div>
        `;
        menuGrid.appendChild(card);
      });
      // Add-to-form buttons
      menuGrid.querySelectorAll('button[data-id]').forEach(btn=>{
        btn.addEventListener('click',()=>{
          productSel.value = btn.getAttribute('data-id');
          qtyEl.value = 1;
          recalc();
          window.scrollTo({top:document.getElementById('orderForm').offsetTop-60, behavior:'smooth'});
        });
      });
    }

    function buildProductOptions(items){
      productSel.innerHTML = items.map(it=>`<option value="${it.id}" data-price="${it.price}" data-name="${it.name}">${it.name} — ₹${it.price}</option>`).join('');
    }

    function getUnitPrice(){
      const opt = productSel.selectedOptions[0];
      return Number(opt?.dataset.price||0);
    }
    function recalc(){
      const unit = getUnitPrice();
      const qty = Math.max(1, Number(qtyEl.value||1));
      unitNote.textContent = `(₹${unit} x ${qty})`;
      totalAmt.textContent = `₹${unit*qty}`;
    }
    productSel.addEventListener('change', recalc);
    qtyEl.addEventListener('input', recalc);

    // Payment UI
    document.querySelectorAll('input[name="pay"]').forEach(r=>{
      r.addEventListener('change',()=>{
        upiRow.style.display = (getPayMethod()==='UPI') ? 'block':'none';
      });
    });
    function getPayMethod(){
      const r = document.querySelector('input[name="pay"]:checked');
      return r ? r.value : 'COD';
    }

    // Create Order ID
    function makeOrderId(){
      const ts = new Date();
      const part = Math.floor(Math.random()*900000+100000);
      return `BB-${ts.getFullYear()}${String(ts.getMonth()+1).padStart(2,'0')}${String(ts.getDate()).padStart(2,'0')}-${part}`;
    }

    // Build UPI URL
    function upiUrl(amount, orderId){
      const params = new URLSearchParams({
        pa: UPI_ID,
        pn: PAYEE_NAME,
        am: String(amount),
        cu: "INR",
        tn: orderId
      });
      return `upi://pay?${params.toString()}`;
    }

    // Handle app buttons: will be clicked after order is created
    let pendingOrderKey = null;
    let pendingOrderId = null;
    let pendingAmount = null;

    document.querySelectorAll('.app-btn').forEach(btn=>{
      btn.addEventListener('click',()=>{
        if(!pendingOrderId){ alert("Please press 'Place Order' first."); return; }
        const url = upiUrl(pendingAmount, pendingOrderId);
        // Open in new window; mobile will prompt to open selected app
        window.open(url, '_blank');
        // show confirm modal
        openModal();
      });
    });

    // Modal helpers
    const modal = document.getElementById('upiModal');
    const confirmPaid = document.getElementById('confirmPaid');
    const cancelUpi = document.getElementById('cancelUpi');
    function openModal(){ modal.classList.add('show'); modal.setAttribute('aria-hidden','false'); }
    function closeModal(){ modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); }

    confirmPaid.addEventListener('click', async ()=>{
      if(!pendingOrderKey) return closeModal();
      await db.ref('orders/'+pendingOrderKey).update({ paymentStatus:'Paid'});
      closeModal();
      location.href = 'thankyou.html?id='+encodeURIComponent(pendingOrderId);
    });
    cancelUpi.addEventListener('click', ()=> closeModal());

    // Submit order
    orderForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const email = document.getElementById('email').value.trim();
      const address = document.getElementById('address').value.trim();
      const productOpt = productSel.selectedOptions[0];
      const productId = productOpt.value;
      const productName = productOpt.dataset.name;
      const qty = Math.max(1, Number(qtyEl.value||1));
      const unit = getUnitPrice();
      const total = unit*qty;
      const method = getPayMethod();

      const orderId = makeOrderId();
      const payload = {
        orderId,
        name, phone, email: email||null, address,
        productId, productName, qty, unit, total,
        paymentMethod: method,
        paymentStatus: method==='COD' ? 'Unpaid' : 'Awaiting UPI',
        status: 'Pending',
        createdAt: firebase.database.ServerValue.TIMESTAMP
      };

      try{
        const ref = await db.ref('orders').push(payload);
        pendingOrderKey = ref.key;
        pendingOrderId  = orderId;
        pendingAmount   = total;

        if(method==='COD'){
          location.href = 'thankyou.html?id='+encodeURIComponent(orderId);
        }else{
          // Reveal UPI section & ask user to pick an app
          upiRow.style.display = 'block';
          alert('Pick your UPI app below to pay. Amount & Order ID will auto-fill.');
          // Auto scroll to UPI apps
          upiRow.scrollIntoView({behavior:'smooth'});
        }
      }catch(err){
        console.error(err);
        alert("Could not place order. Please try again.");
      }
    });

    // Tracker
    document.getElementById('trackBtn').addEventListener('click', async ()=>{
      const id = trackId.value.trim();
      if(!id) return;
      trackResult.textContent = 'Searching...';
      const snap = await db.ref('orders').orderByChild('orderId').equalTo(id).once('value');
      const val = snap.val();
      if(!val){ trackResult.textContent = 'No order found.'; return; }
      const key = Object.keys(val)[0];
      const ord = val[key];
      const when = ord.createdAt ? new Date(ord.createdAt).toLocaleString() : '';
      trackResult.innerHTML = `
        <b>Status:</b> ${ord.status} &nbsp; | &nbsp;
        <b>Payment:</b> ${ord.paymentStatus} &nbsp; | &nbsp;
        <b>Total:</b> ₹${ord.total} &nbsp; | &nbsp;
        <span class="small">Placed: ${when}</span>
      `;
    });
  }
})();