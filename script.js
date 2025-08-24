// script.js
firebase.initializeApp(window.firebaseConfig);
const db = firebase.database();

const productEl = document.getElementById("product");
const qtyEl = document.getElementById("qty");
const totalEl = document.getElementById("totalAmt");
const form = document.getElementById("orderForm");
const payRadios = () => Array.from(document.querySelectorAll('input[name="pay"]'));
const upiOptions = document.getElementById("upiOptions");
const trackBtn = document.getElementById("trackBtn");
const trackId = document.getElementById("trackId");
const trackResult = document.getElementById("trackResult");

// price compute
function unitPrice(){
  const opt = productEl.options[productEl.selectedIndex];
  return Number(opt.getAttribute("data-price")||0);
}
function compute(){
  const t = unitPrice() * Math.max(1, Number(qtyEl.value||1));
  totalEl.textContent = "₹"+t;
  return t;
}
productEl.addEventListener("change", compute);
qtyEl.addEventListener("input", compute);
compute();

// toggle UPI panel
function refreshPayUI(){
  const val = (payRadios().find(r=>r.checked)||{}).value;
  upiOptions.style.display = val==="UPI" ? "" : "none";
}
payRadios().forEach(r=> r.addEventListener("change", refreshPayUI));
refreshPayUI();

// helpers
function genOrderId(){
  const d = new Date();
  const ymd = d.toISOString().slice(0,10).replace(/-/g,"");
  const rand = Math.floor(1000 + Math.random()*9000);
  return `BB-${ymd}-${rand}`;
}
function buildUpiUri(orderId, amount){
  const pa = encodeURIComponent("9380248566@fam");
  const pn = encodeURIComponent("Brownie Bite");
  const am = encodeURIComponent(String(amount.toFixed(2)));
  const tn = encodeURIComponent(orderId);
  return `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR&tn=${tn}`;
}
function openUpiApp(app, uri){
  // best-effort: use universal UPI link; some Android browsers support intent targeting, iOS will show chooser
  // try direct navigation
  window.location.href = uri;
}

function showModal(oid, needsOnline){
  const m = document.getElementById("thanksModal");
  document.getElementById("popOrderId").textContent = oid;
  m.style.display = "flex";
  const online = document.getElementById("onlinePayArea");
  const goThanks = document.getElementById("goThanks");
  const copyBtn = document.getElementById("copyUpi");
  const openGeneric = document.getElementById("openGeneric");
  const paidBtn = document.getElementById("paidBtn");
  const iosHint = document.getElementById("iosHint");
  const appButtons = m.querySelectorAll(".app-picker button");

  if(needsOnline){
    online.style.display = "";
    const amount = parseFloat(totalEl.textContent.replace("₹","")) || 0;
    const uri = buildUpiUri(oid, amount);
    openGeneric.href = uri;
    // iOS hint
    iosHint.style.display = /iPhone|iPad|iPod/i.test(navigator.userAgent) ? "" : "none";

    appButtons.forEach(btn=>{
      btn.onclick = ()=> openUpiApp(btn.dataset.app, uri);
    });
    copyBtn.onclick = async ()=>{
      try{ await navigator.clipboard.writeText(uri); alert("UPI link copied. Open your UPI app and paste to pay."); }
      catch(e){ alert("Copy failed. Long‑press to copy: "+uri); }
    };
    paidBtn.onclick = ()=>{
      // mark payment as paid
      db.ref("orders/"+oid+"/paymentStatus").set("Paid");
      goThanks.href = "thankyou.html?id="+encodeURIComponent(oid);
      goThanks.style.display = "";
    };
    goThanks.style.display = "none";
  }else{
    online.style.display = "none";
    goThanks.href = "thankyou.html?id="+encodeURIComponent(oid);
    goThanks.style.display = "";
  }

  document.getElementById("closeModal").onclick = ()=>{
    m.style.display = "none";
  };
  m.addEventListener("click", (e)=>{
    if(e.target===m) m.style.display="none";
  });
}

// submit handler
form.addEventListener("submit", async (e)=>{
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  const email = document.getElementById("email").value.trim();
  const product = productEl.value;
  const qty = Math.max(1, Number(qtyEl.value||1));
  const total = compute();
  const paymentMethod = (payRadios().find(r=>r.checked)||{}).value || "COD";

  if(!name || !phone || !address){ alert("Please fill Name, Phone, Address."); return; }

  const orderId = genOrderId();
  const payload = {
    orderId, name, phone, address, email: email || null,
    product, qty, unitPrice: unitPrice(), total,
    paymentMethod,
    paymentStatus: paymentMethod==="UPI" ? "Pending" : "COD",
    status: "Pending",
    createdAt: Date.now()
  };

  try{
    await db.ref("orders/"+orderId).set(payload);
    // show modal with actions
    showModal(orderId, paymentMethod==="UPI");
    // reset form but keep amounts visible
    form.reset();
    qtyEl.value = 1;
    compute();
    refreshPayUI();
  }catch(err){
    console.error(err);
    alert("Could not place order. Check internet and Firebase config.");
  }
});

// tracking
trackBtn.addEventListener("click", async ()=>{
  const id = (trackId.value||"").trim();
  if(!id){ trackResult.textContent=""; return; }
  const snap = await db.ref("orders/"+id).once("value");
  const o = snap.val();
  if(!o){ trackResult.textContent = "No order found."; return; }
  trackResult.textContent = `Status: ${o.status} · Payment: ${o.paymentStatus}`;
});