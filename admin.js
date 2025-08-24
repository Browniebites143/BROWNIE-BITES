// admin.js
if (sessionStorage.getItem("adminLoggedIn") !== "true") {
  window.location.href = "login.html";
}

firebase.initializeApp(window.firebaseConfig);
const db = firebase.database();

const tbody = document.querySelector("#ordersTable tbody");
const search = document.getElementById("q");

function fmt(ts){
  try{
    const d = new Date(ts);
    return d.toLocaleString();
  }catch(e){ return "—"; }
}

function draw(snapshot){
  const q = (search.value||"").toLowerCase();
  tbody.innerHTML = "";
  const val = snapshot.val() || {};
  const ids = Object.keys(val).sort((a,b)=> (val[b].createdAt||0)-(val[a].createdAt||0));
  ids.forEach(id=>{
    const o = val[id];
    const hay = (id+" "+(o.name||"")+" "+(o.phone||"")).toLowerCase();
    if(q && !hay.includes(q)) return;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${fmt(o.createdAt)}</td>
      <td>${id}</td>
      <td>${o.name||""}</td>
      <td>${o.phone||""}</td>
      <td style="min-width:220px">${o.address||""}</td>
      <td>${o.product||""}</td>
      <td>${o.qty||""}</td>
      <td>₹${o.total||0}</td>
      <td>
        <select data-k="paymentStatus">
          ${["Pending","Paid","Failed"].map(s=>`<option ${o.paymentStatus===s?"selected":""}>${s}</option>`).join("")}
        </select>
      </td>
      <td>
        <select data-k="status">
          ${["Pending","Preparing","Prepared","Out for delivery","Delivered","Cancelled"].map(s=>`<option ${o.status===s?"selected":""}>${s}</option>`).join("")}
        </select>
      </td>
      <td><button class="btn ghost" data-del="1">Delete</button></td>
    `;
    // listeners
    tr.querySelectorAll("select").forEach(sel=>{
      sel.addEventListener("change", (e)=>{
        const k = sel.getAttribute("data-k");
        db.ref("orders/"+id+"/"+k).set(sel.value);
      });
    });
    tr.querySelector("[data-del]").addEventListener("click", ()=>{
      if(confirm("Delete order "+id+" ?")){
        db.ref("orders/"+id).remove();
      }
    });
    tbody.appendChild(tr);
  });
}

db.ref("orders").on("value", draw);
search.addEventListener("input", ()=> db.ref("orders").once("value").then(draw));

document.getElementById("logout").addEventListener("click", ()=>{
  sessionStorage.removeItem("adminLoggedIn");
  location.href = "login.html";
});