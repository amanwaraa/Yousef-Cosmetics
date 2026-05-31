(function(){
"use strict";

var ACCESS_PASSWORD="78789852";
var SYSTEM_KEY="78789852";
var DB_NAME="sales_webapp_cashier_units_v5";
var DB_VERSION=2;
var STORES=["settings","accounts","customers","products","invoices","debts","payments","dailySales","purchases","transactions","expenses","syncQueue","syncLogs"];
var db=null, syncing=false, fbReady=false, fbListening=false, deferredInstallPrompt=null;

var firebaseConfig = {
  apiKey: "AIzaSyCtBotFdwreDoMPu9_1hm76f7LB13jZaBw",
  authDomain: "hhhfddv-f3884.firebaseapp.com",
  databaseURL: "https://hhhfddv-f3884-default-rtdb.firebaseio.com",
  projectId: "hhhfddv-f3884",
  storageBucket: "hhhfddv-f3884.firebasestorage.app",
  messagingSenderId: "17966992020",
  appId: "1:17966992020:web:f59597fe10e5ed5a768281",
  measurementId: "G-QPWGLZ74B2"
};

var state={route:"dashboard",selectedCustomerId:null,settings:null,accounts:[],customers:[],products:[],invoices:[],debts:[],payments:[],dailySales:[],purchases:[],transactions:[],expenses:[],syncQueue:[],syncLogs:[],lastInvoice:null};

var icons={
store:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M4 10h16l-1-6H5l-1 6Z"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/><path d="M4 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/></svg>',
home:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10.5V20h14v-9.5"/><path d="M9 20v-6h6v6"/></svg>',
receipt:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M7 3h10a2 2 0 0 1 2 2v16l-3-2-2 2-2-2-2 2-2-2-3 2V5a2 2 0 0 1 2-2Z"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>',
payment:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/><path d="M7 15h4"/></svg>',
chart:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M4 19V5"/><path d="M4 19h16"/><rect x="7" y="11" width="3" height="5" rx="1"/><rect x="12" y="7" width="3" height="9" rx="1"/><rect x="17" y="13" width="3" height="3" rx="1"/></svg>',
debt:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M7 4h10a2 2 0 0 1 2 2v14l-7-3-7 3V6a2 2 0 0 1 2-2Z"/><path d="M9 9h6M9 13h4"/></svg>',
box:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="m3 7 9-4 9 4-9 4-9-4Z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/></svg>',
truck:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M3 6h12v10H3z"/><path d="M15 10h4l2 3v3h-6z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg>',
settings:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z"/><path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.04.04a2 2 0 0 1-2.83 2.83l-.04-.04A1.8 1.8 0 0 0 15 19.4a1.8 1.8 0 0 0-1 .6 1.8 1.8 0 0 0-.5 1.3V21a2 2 0 0 1-4 0v-.06A1.8 1.8 0 0 0 8.5 19.4a1.8 1.8 0 0 0-1.98.36l-.04.04a2 2 0 0 1-2.83-2.83l.04-.04A1.8 1.8 0 0 0 4.6 15a1.8 1.8 0 0 0-.6-1 1.8 1.8 0 0 0-1.3-.5H3a2 2 0 0 1 0-4h.06A1.8 1.8 0 0 0 4.6 8.5a1.8 1.8 0 0 0-.36-1.98l-.04-.04a2 2 0 0 1 2.83-2.83l.04.04A1.8 1.8 0 0 0 9 4.6a1.8 1.8 0 0 0 1-.6 1.8 1.8 0 0 0 .5-1.3V3a2 2 0 0 1 4 0v.06a1.8 1.8 0 0 0 1 1.54 1.8 1.8 0 0 0 1.98-.36l.04-.04a2 2 0 0 1 2.83 2.83l-.04.04A1.8 1.8 0 0 0 19.4 9c.3.3.6.6 1 .6h.6a2 2 0 0 1 0 4h-.06a1.8 1.8 0 0 0-1.54 1Z"/></svg>',
wallet:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M4 7h15a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12"/><path d="M16 13h5"/><circle cx="17.5" cy="13" r="1"/></svg>',
users:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
alert:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M10.3 4.3 2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
menu:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
moon:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.5 6.5 0 0 0 9.8 9.8Z"/></svg>',
sync:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 16h6v-6"/><path d="M3 12A9 9 0 0 1 18.5 5.8L21 8"/><path d="M21 8h-6v6"/></svg>',
account:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M7 9h10"/><path d="M7 13h6"/><path d="M16 16h1"/></svg>',
clock:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
cloud:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M17.5 19H7a5 5 0 1 1 1-9.9A7 7 0 0 1 21 12.5 3.5 3.5 0 0 1 17.5 19Z"/></svg>'
};
function icon(n){return '<span class="icon">'+(icons[n]||icons.store)+'</span>'}

var routes=[
{id:"dashboard",title:"الرئيسية",subtitle:"ملخص الحسابات والمبيعات",icon:"home"},
{id:"invoices",title:"الفواتير",subtitle:"بيع مع مبلغ مدفوع ومتبقي كدين",icon:"receipt"},
{id:"customers",title:"العملاء والديون",subtitle:"ملفات العملاء والديون والسداد",icon:"users"},
{id:"accounts",title:"الحسابات",subtitle:"حسابات الصندوق والبنك والجهات",icon:"account"},
{id:"payments",title:"الدفعات",subtitle:"سداد ديون العملاء إلى حساب محدد",icon:"payment"},
{id:"sales",title:"المبيعات",subtitle:"سجل المبيعات",icon:"chart"},
{id:"products",title:"المنتجات",subtitle:"المخزون والباركود",icon:"box"},
{id:"purchases",title:"المشتريات",subtitle:"واردات وصادرات الحسابات",icon:"truck"},
{id:"settings",title:"الإعدادات",subtitle:"النظام والمزامنة والتثبيت",icon:"settings"}
];
var bottomIds=["dashboard","invoices","customers","accounts","suppliers","products"];

document.addEventListener("DOMContentLoaded",boot);

function $(id){return document.getElementById(id)}
function val(id){var e=$(id);return e?e.value:""}
function setVal(id,v){var e=$(id);if(e)e.value=v}
function html(id,v){var e=$(id);if(e)e.innerHTML=v}
function text(id,v){var e=$(id);if(e)e.textContent=v}
function esc(v){return String(v==null?"":v).replace(/[&<>"']/g,function(m){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]})}
function toNumber(v){var n=Number(v);return Number.isFinite(n)?n:0}
function fmt(n){return Number(n||0).toLocaleString("en-US",{maximumFractionDigits:2})}
function money(v){return fmt(toNumber(v))+" "+((state.settings&&state.settings.currency)||"شيكل")}
function uid(p){return p+"_"+Date.now()+"_"+Math.random().toString(16).slice(2)}
function nowBase(o){o=o||{};o.createdAt=o.createdAt||Date.now();o.updatedAt=Date.now();o.syncStatus="pending";o.isDeleted=false;return o}
function active(a){return (a||[]).filter(function(x){return !x.isDeleted})}
function today(){var d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function statusText(s){return {cash:"كاش",bank:"بنك",transfer:"تحويل",deferred:"آجل",paid:"مدفوع",partial:"جزئي",unpaid:"غير مدفوع",overdue:"متأخر",income:"وارد",expense:"صادر"}[s]||s||"-"}
function statusClass(s){return ["paid","income","cash"].includes(s)?"success":["partial","bank","transfer"].includes(s)?"warning":["unpaid","overdue","expense","deferred"].includes(s)?"danger":""}
function chip(s){return '<span class="chip '+statusClass(s)+'">'+statusText(s)+'</span>'}
function toast(m,t){var e=document.createElement("div");e.className="toast "+(t||"");e.textContent=m;$("toastHost").appendChild(e);setTimeout(function(){e.remove()},3500)}

function boot(){
 $("loginLogo").innerHTML=icon("store");$("menuBtn").innerHTML=icon("menu");$("themeBtn").innerHTML=icon("moon");$("syncIcon").innerHTML='<span class="sync-spin">'+icon("sync")+'</span>';
 document.body.classList.toggle("dark",localStorage.getItem("sales_theme")==="dark");
 buildNav();
 openDB().then(ensureDefaults).then(loadAll).then(function(){applyBrand();bindShell();watchConnection();initPWA();initLogin();if(localStorage.getItem("sales_access_ok")==="1"){showApp();navigate(localStorage.getItem("sales_last_route")||"dashboard");syncNow(true);startRealtime()}});
 if("serviceWorker" in navigator){navigator.serviceWorker.register("./service-worker.js").catch(function(){})}
}
function openDB(){return new Promise(function(res,rej){var r=indexedDB.open(DB_NAME,DB_VERSION);r.onupgradeneeded=function(e){var d=e.target.result;STORES.forEach(function(n){if(!d.objectStoreNames.contains(n)){var s=d.createObjectStore(n,{keyPath:"id"});s.createIndex("updatedAt","updatedAt",{unique:false});s.createIndex("syncStatus","syncStatus",{unique:false})}})};r.onsuccess=function(){db=r.result;res()};r.onerror=function(){rej(r.error)}})}
function store(n,m){return db.transaction(n,m||"readonly").objectStore(n)}
function getAll(n){return new Promise(function(res,rej){var r=store(n).getAll();r.onsuccess=function(){res(r.result||[])};r.onerror=function(){rej(r.error)}})}
function getOne(n,id){return new Promise(function(res,rej){var r=store(n).get(id);r.onsuccess=function(){res(r.result)};r.onerror=function(){rej(r.error)}})}
function putOne(n,v){return new Promise(function(res,rej){var r=store(n,"readwrite").put(v);r.onsuccess=function(){res(v)};r.onerror=function(){rej(r.error)}})}
function delOne(n,id){return new Promise(function(res,rej){var r=store(n,"readwrite").delete(id);r.onsuccess=function(){res(true)};r.onerror=function(){rej(r.error)}})}
function clearStore(n){return getAll(n).then(function(a){return Promise.all(a.map(function(x){return delOne(n,x.id)}))})}
function loadAll(){return Promise.all(STORES.map(function(n){return getAll(n).then(function(a){state[n]=a})})).then(function(){state.settings=(state.settings||[]).find(function(x){return x.id==="main"})||null})}
function ensureDefaults(){
 return getOne("settings","main").then(function(s){
  var tasks=[];
  if(!s){s=nowBase({id:"main",storeName:"نظام إدارة المبيعات",logoUrl:"",openingBalance:0,currency:"شيكل",password:ACCESS_PASSWORD});tasks.push(putOne("settings",s).then(function(){return queueSync("settings","main","update",s)}))}
  return getAll("accounts").then(function(accs){
    if(!active(accs).length){
      var cash=nowBase({id:uid("account"),entityName:"الصندوق",accountName:"نقدي",openingBalance:0,type:"cash"});
      var bank=nowBase({id:uid("account"),entityName:"البنك",accountName:"حساب بنكي",openingBalance:0,type:"bank"});
      tasks.push(putOne("accounts",cash).then(function(){return queueSync("accounts",cash.id,"create",cash)}));
      tasks.push(putOne("accounts",bank).then(function(){return queueSync("accounts",bank.id,"create",bank)}));
    }
    return Promise.all(tasks);
  });
 });
}
function initLogin(){
 $("loginForm").onsubmit=function(e){e.preventDefault();var pass=val("loginPassword").trim(),saved=(state.settings&&state.settings.password)||ACCESS_PASSWORD;if(pass===saved){localStorage.setItem("sales_access_ok","1");$("loginPassword").value="";showApp();navigate("dashboard");syncNow(true);startRealtime()}else{$("loginPassword").value="";toast("كلمة المرور غير صحيحة","danger")}};
}
function showApp(){$("loginScreen").classList.add("hidden");$("appShell").classList.remove("hidden")}
function buildNav(){html("sideNav",routes.map(function(r){return '<button class="nav-btn" data-nav="'+r.id+'">'+icon(r.icon)+'<span>'+r.title+'</span></button>'}).join(""));html("bottomNav",routes.filter(function(r){return bottomIds.includes(r.id)}).map(function(r){return '<button class="nav-btn" data-nav="'+r.id+'">'+icon(r.icon)+'<span>'+r.title+'</span></button>'}).join(""))}
function bindShell(){
 document.body.addEventListener("click",function(e){var b=e.target.closest("[data-nav]");if(b){navigate(b.dataset.nav);closeSide()}});
 $("menuBtn").onclick=function(){$("sidebar").classList.add("open");$("sidebarBackdrop").classList.add("open")};
 $("sidebarBackdrop").onclick=closeSide;
 $("themeBtn").onclick=function(){document.body.classList.toggle("dark");localStorage.setItem("sales_theme",document.body.classList.contains("dark")?"dark":"light")};
 $("logoutBtn").onclick=function(){localStorage.removeItem("sales_access_ok");location.reload()};
 $("syncBtn").onclick=function(){syncNow(false)};
}
function closeSide(){$("sidebar").classList.remove("open");$("sidebarBackdrop").classList.remove("open")}
function applyBrand(){var s=state.settings||{};text("brandName",s.storeName||"نظام إدارة المبيعات");var logo=s.logoUrl?'<img src="'+esc(s.logoUrl)+'" onerror="this.parentNode.innerHTML=\''+icon("store").replace(/'/g,"&#39;")+'\'">':icon("store");html("brandLogo",logo);html("loginLogo",logo)}
function setMeta(r){text("pageTitle",r.title);text("pageSubtitle",r.subtitle);document.querySelectorAll("[data-nav]").forEach(function(b){b.classList.toggle("active",b.dataset.nav===r.id)})}
function navigate(id){var r=routes.find(function(x){return x.id===id})||routes[0];state.route=r.id;localStorage.setItem("sales_last_route",r.id);setMeta(r);html("pageHost",templates[r.id]());setDates();bindPage();renderCurrent();enhanceSearchSelects()}
function setDates(){["invDate","paymentDate","debtDate","purchaseDate","txnDate","salesDateFilter"].forEach(function(id){var e=$(id);if(e&&!e.value)e.value=today()});var due=$("debtDueDate");if(due&&!due.value){var d=new Date();d.setDate(d.getDate()+7);setVal("debtDueDate",d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"))}}
function bindPage(){
 if(state.route==="invoices"){bindCustomerSuggest("invCustomerName","invCustomerSuggest","invPhone","invCustomerDebtInfo");addInvoiceItemRow();$("addInvoiceItemBtn").onclick=addInvoiceItemRow;$("scanInvoiceBarcodeBtn").onclick=scanInvoiceProduct;$("saveInvoiceBtn").onclick=saveInvoice;$("clearInvoiceBtn").onclick=clearInvoiceForm;$("printInvoiceBtn").onclick=printLastInvoice;$("invoiceSearch").oninput=renderInvoices}
 if(state.route==="customers"){$("customerSearch").oninput=renderCustomers;$("saveCustomerBtn").onclick=saveCustomer;$("clearCustomerBtn").onclick=clearCustomerForm}
 if(state.route==="debts"){$("saveManualDebtBtn").onclick=saveManualDebt;$("debtSearch").oninput=renderDebtsPage;$("saveDebtPaymentBtn").onclick=savePayment}
 if(state.route==="accounts"){$("saveAccountBtn").onclick=saveAccount;$("clearAccountBtn").onclick=clearAccountForm;$("accountSearch").oninput=renderAccounts;$("saveTxnBtn").onclick=saveTransaction}
 if(state.route==="payments"){bindCustomerSuggest("paymentCustomerName","paymentCustomerSuggest","paymentPhone","paymentCustomerDebtInfo");$("savePaymentBtn").onclick=savePayment;$("paymentCustomerName").addEventListener("input",renderPaymentDebtOptions)}
 if(state.route==="sales"){$("salesDateFilter").onchange=renderSales;$("salesSearch").oninput=renderSales}
 if(state.route==="products"){$("saveProductBtn").onclick=saveProduct;$("clearProductBtn").onclick=clearProductForm;$("scanProductBarcodeBtn").onclick=function(){scanBarcode().then(function(c){if(c)setVal("productBarcode",c)})};$("productSearch").oninput=renderProducts}
 if(state.route==="purchases"){$("savePurchaseBtn").onclick=savePurchase}
 if(state.route==="settings"){hydrateSettings();$("saveSettingsBtn").onclick=saveSettings;$("exportDataBtn").onclick=exportAllJSON;$("clearDataBtn").onclick=clearAllData;$("settingsSyncBtn").onclick=function(){syncNow(false)};$("pullBtn").onclick=function(){pullFirebase().then(loadAll).then(renderCurrent).then(function(){toast("تم سحب البيانات","success")})};$("settingLogoUrl").oninput=function(){var i=$("settingsLogoPreview");if(i)i.src=val("settingLogoUrl")}}
}
function renderCurrent(){applyBrand();if(state.route==="dashboard")renderDashboard();if(state.route==="invoices"){renderAccountOptions();renderInvoices();calcInvoiceTotal()}if(state.route==="customers"){renderCustomers();renderAccountOptions()}if(state.route==="debts"){renderManualDebtArea();renderAccountOptions();renderPaymentDebtOptions();renderDebtsPage()}if(state.route==="accounts"){renderAccounts();renderAccountOptions();renderTransactions()}if(state.route==="payments"){renderAccountOptions();renderPaymentDebtOptions();renderPayments()}if(state.route==="sales")renderSales();if(state.route==="products")renderProducts();if(state.route==="purchases"){renderPurchaseProductOptions();renderAccountOptions();renderPurchases()}if(state.route==="settings"){hydrateSettings(false);renderSyncStatus()}enhanceSearchSelects()}

function table(headers,rows,id){id=id||"reportTable";if(!rows.length)return '<div class="empty">لا توجد بيانات.</div>';var htmlTable='<div id="'+id+'" class="table-wrap desktop-table"><table><thead><tr>'+headers.map(function(h){return '<th>'+h+'</th>'}).join("")+'</tr></thead><tbody>'+rows.map(function(r){return '<tr>'+r.map(function(c){return '<td>'+c+'</td>'}).join("")+'</tr>'}).join("")+'</tbody></table></div>';var mob='<div class="mobile-card-list">'+rows.map(function(r){return '<div class="record-card">'+r.map(function(c,i){return '<div class="record-line"><b>'+headers[i]+'</b><span>'+c+'</span></div>'}).join("")+'</div>'}).join("")+'</div>';return htmlTable+mob}
function tools(target,title){return '<div class="table-tools"><button class="btn small ghost" data-print="'+target+'">طباعة</button><button class="btn small ghost" data-pdf="'+target+'">PDF</button><button class="btn small ghost" data-img="'+target+'">صورة</button><button class="btn small ghost" data-csv="'+target+'">جدول CSV</button></div>'}
document.body.addEventListener("click",function(e){var p=e.target.closest("[data-print]"),pdf=e.target.closest("[data-pdf]"),img=e.target.closest("[data-img]"),csv=e.target.closest("[data-csv]");if(p)printElement(p.dataset.print);if(pdf)downloadPDF(pdf.dataset.pdf);if(img)downloadImage(img.dataset.img);if(csv)downloadCSV(csv.dataset.csv)});
function printElement(id){var el=$(id);if(!el){window.print();return}var w=window.open("","_blank");w.document.write('<html dir="rtl"><head><title>طباعة</title><style>body{font-family:Arial;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f3f4f6}</style></head><body>'+el.innerHTML+'</body></html>');w.document.close();w.print()}
function downloadImage(id){var el=$(id);if(!el){toast("لا يوجد جدول","warning");return}if(!window.html2canvas){toast("مكتبة الصورة تحتاج إنترنت","warning");return}html2canvas(el,{backgroundColor:"#ffffff"}).then(function(canvas){var a=document.createElement("a");a.href=canvas.toDataURL("image/png");a.download="report.png";a.click()})}
function downloadPDF(id){var el=$(id);if(!el){toast("لا يوجد جدول","warning");return}if(!window.html2canvas||!window.jspdf){toast("مكتبة PDF تحتاج إنترنت","warning");return}html2canvas(el,{backgroundColor:"#ffffff",scale:2}).then(function(canvas){var img=canvas.toDataURL("image/png");var pdf=new jspdf.jsPDF("p","mm","a4");var w=190,h=canvas.height*w/canvas.width;pdf.addImage(img,"PNG",10,10,w,h);pdf.save("report.pdf")})}
function downloadCSV(id){var el=$(id);if(!el){toast("لا يوجد جدول","warning");return}var rows=[].slice.call(el.querySelectorAll("tr")).map(function(tr){return [].slice.call(tr.children).map(function(td){return '"'+td.innerText.replace(/"/g,'""')+'"'}).join(",")}).join("\n");var blob=new Blob(["\ufeff"+rows],{type:"text/csv;charset=utf-8"});var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="report.csv";a.click();URL.revokeObjectURL(a.href)}

function accountBalance(id){var acc=active(state.accounts).find(function(a){return a.id===id});var bal=toNumber(acc&&acc.openingBalance);active(state.transactions).filter(function(t){return t.accountId===id}).forEach(function(t){bal += t.type==="income"?toNumber(t.amount):-toNumber(t.amount)});return bal}
function totalAccounts(){return active(state.accounts).reduce(function(s,a){return s+accountBalance(a.id)},0)}
function openDebtTotal(){return active(state.debts).reduce(function(s,d){return s+toNumber(d.remaining)},0)}
function dashboardData(){var todaySales=active(state.dailySales).filter(function(s){return s.date===today()}).reduce(function(s,x){return s+toNumber(x.amount)},0);var low=active(state.products).filter(function(p){return toNumber(p.quantity)<=toNumber(p.minQuantity||0)});return {balance:totalAccounts(),todaySales:todaySales,debt:openDebtTotal(),low:low,customers:active(state.customers).length,invoices:active(state.invoices).length,accounts:active(state.accounts).length}}
function renderDashboard(){var d=dashboardData();text("currentBalance",money(d.balance));text("mTodaySales",money(d.todaySales));text("mInvoices",d.invoices);text("mDebts",money(d.debt));text("mAccounts",d.accounts);text("mCustomers",d.customers);text("mLowProducts",d.low.length);var rec=active(state.transactions).sort(function(a,b){return b.createdAt-a.createdAt}).slice(0,8);html("recentTransactions",rec.length?tools("txnMiniTable","آخر الحركات")+table(["التاريخ","الحساب","النوع","المبلغ","البيان"],rec.map(function(t){return [t.date||"-",esc(accountName(t.accountId)),chip(t.type),'<span class="money">'+money(t.amount)+'</span>',esc(t.note||"-")]}),"txnMiniTable"):'<div class="empty">لا توجد حركات.</div>')}

function customerDebtTotal(id){return active(state.debts).filter(function(d){return d.customerId===id}).reduce(function(s,d){return s+toNumber(d.remaining)},0)}
function setCustomerDebtInfo(targetId, customer){var el=$(targetId);if(!el)return;if(!customer){el.innerHTML='';return}el.innerHTML='<span class="chip '+(customerDebtTotal(customer.id)>0?'danger':'success')+'">دين العميل الحالي: '+money(customerDebtTotal(customer.id))+'</span>'}
function bindCustomerSuggest(inputId,boxId,phoneId,infoId){var inp=$(inputId),box=$(boxId);if(!inp||!box)return;inp.oninput=function(){var q=inp.value.trim().toLowerCase();if(infoId)setCustomerDebtInfo(infoId,null);if(q.length<2){box.classList.remove("open");box.innerHTML="";return}var list=active(state.customers).filter(function(c){return (c.name+" "+(c.phone||"")).toLowerCase().includes(q)}).slice(0,10);box.innerHTML=list.map(function(c){return '<button type="button" data-customer-pick="'+c.id+'"><b>'+esc(c.name)+'</b><small>'+esc(c.phone||'-')+' — عليه '+money(customerDebtTotal(c.id))+'</small></button>'}).join("");box.classList.toggle("open",!!list.length)};box.onclick=function(e){var b=e.target.closest("[data-customer-pick]");if(!b)return;var c=active(state.customers).find(function(x){return x.id===b.dataset.customerPick});if(c){inp.value=c.name;if(phoneId)setVal(phoneId,c.phone||"");if(infoId)setCustomerDebtInfo(infoId,c);box.classList.remove("open");renderPaymentDebtOptions()}}}
function upsertCustomer(name,phone){var f=active(state.customers).find(function(c){return (phone&&c.phone===phone)||c.name===name});if(f)return Promise.resolve(f);var c=nowBase({id:uid("customer"),name:name,phone:phone});return putOne("customers",c).then(function(){return queueSync("customers",c.id,"create",c)}).then(function(){state.customers.push(c);return c})}

function renderAccountOptions(){var opts=active(state.accounts).map(function(a){return '<option value="'+a.id+'">'+esc(a.entityName)+' - '+esc(a.accountName)+' - '+money(accountBalance(a.id))+'</option>'}).join("");["invPaidAccount","paymentAccount","purchaseAccount","txnAccount"].forEach(function(id){var s=$(id);if(s){var old=s.value;s.innerHTML=opts||'<option value="">أضف حسابًا أولًا</option>';if(old)s.value=old}})}
function accountName(id){var a=active(state.accounts).find(function(x){return x.id===id});return a?(a.entityName+" - "+a.accountName):"-"}
function saveAccount(){var id=val("accountEditId"),entity=val("accountEntity").trim(),name=val("accountName").trim(),opening=toNumber(val("accountOpening")),type=val("accountType");if(!entity||!name){toast("أكمل بيانات الحساب","warning");return}(id?getOne("accounts",id):Promise.resolve(null)).then(function(old){var a=nowBase(Object.assign({},old||{},{id:id||uid("account"),entityName:entity,accountName:name,openingBalance:opening,type:type,createdAt:(old&&old.createdAt)||Date.now()}));return putOne("accounts",a).then(function(){return queueSync("accounts",a.id,id?"update":"create",a)})}).then(loadAll).then(function(){clearAccountForm();renderCurrent();toast("تم حفظ الحساب","success")})}
function clearAccountForm(){["accountEditId","accountEntity","accountName","accountOpening"].forEach(function(id){setVal(id,"")});setVal("accountType","cash")}
function editAccount(id){var a=active(state.accounts).find(function(x){return x.id===id});if(!a)return;setVal("accountEditId",a.id);setVal("accountEntity",a.entityName||"");setVal("accountName",a.accountName||"");setVal("accountOpening",a.openingBalance||0);setVal("accountType",a.type||"cash")}
function renderAccounts(){var q=(val("accountSearch")||"").trim().toLowerCase();var arr=active(state.accounts).filter(function(a){return !q||(a.entityName+" "+a.accountName).toLowerCase().includes(q)}).sort(function(a,b){return b.createdAt-a.createdAt});html("accountsList",(arr.length?tools("accountsTable","الحسابات")+table(["الجهة","الحساب","رصيد افتتاحي","الرصيد الحالي","النوع","إجراءات"],arr.map(function(a){return [esc(a.entityName),esc(a.accountName),'<span class="money">'+money(a.openingBalance)+'</span>','<span class="money">'+money(accountBalance(a.id))+'</span>',esc(a.type||"-"),'<div class="actions"><button class="btn small ghost" data-edit-account="'+a.id+'">تعديل</button><button class="btn small danger" data-delete="accounts:'+a.id+'">حذف</button></div>']}),"accountsTable"):'<div class="empty">لا توجد حسابات.</div>'));document.querySelectorAll("[data-edit-account]").forEach(function(b){b.onclick=function(){editAccount(b.dataset.editAccount)}});bindDelete()}
function saveTransaction(){var accountId=val("txnAccount"),type=val("txnType"),amount=toNumber(val("txnAmount")),date=val("txnDate")||today(),note=val("txnNote").trim();if(!accountId||amount<=0){toast("اختر الحساب واكتب المبلغ","warning");return}var t=nowBase({id:uid("txn"),accountId:accountId,type:type,amount:amount,date:date,note:note,source:"manual"});putOne("transactions",t).then(function(){return queueSync("transactions",t.id,"create",t)}).then(loadAll).then(function(){setVal("txnAmount","");setVal("txnNote","");renderCurrent();toast("تم حفظ الحركة","success")})}
function renderTransactions(){var arr=active(state.transactions).sort(function(a,b){return b.createdAt-a.createdAt});html("transactionsList",arr.length?tools("transactionsTable","سجل الحسابات")+table(["التاريخ","الحساب","النوع","المبلغ","البيان","إجراءات"],arr.map(function(t){return [t.date||"-",esc(accountName(t.accountId)),chip(t.type),'<span class="money">'+money(t.amount)+'</span>',esc(t.note||"-"),'<button class="btn small danger" data-delete="transactions:'+t.id+'">حذف</button>']}),"transactionsTable"):'<div class="empty">لا توجد حركات حسابات.</div>');bindDelete()}

function productOptions(){return '<option value="">صنف يدوي</option>'+active(state.products).map(function(p){return '<option value="'+p.id+'" data-price="'+esc(p.price)+'">'+esc(p.name)+' - '+money(p.price)+' - كمية '+esc(p.quantity||0)+'</option>'}).join("")}
function addInvoiceItemRow(prefill){prefill=prefill||{};var w=$("invoiceItems");if(!w)return;var row=document.createElement("div");row.className="item-row";row.innerHTML='<label class="wide">الصنف<select class="invoice-product" data-search="1">'+productOptions()+'</select><input class="invoice-custom-name" placeholder="اسم الصنف اليدوي" value="'+esc(prefill.name||"")+'"></label><label>العدد<input class="invoice-qty" type="number" min="0" step="0.01" value="'+esc(prefill.quantity||1)+'"></label><label>السعر<input class="invoice-price" type="number" min="0" step="0.01" value="'+esc(prefill.price||0)+'"></label><label>المبلغ<input class="invoice-line-total" disabled value="0"></label><button class="btn danger small remove-item" type="button">حذف</button>';w.appendChild(row);var sel=row.querySelector(".invoice-product");if(prefill.productId)sel.value=prefill.productId;sel.onchange=function(){var p=active(state.products).find(function(x){return x.id===sel.value});if(p){row.querySelector(".invoice-custom-name").value=p.name;row.querySelector(".invoice-price").value=p.price||0}calcInvoiceTotal()};row.querySelectorAll(".invoice-qty,.invoice-price").forEach(function(e){e.oninput=calcInvoiceTotal});row.querySelector(".remove-item").onclick=function(){row.remove();calcInvoiceTotal()};sel.onchange();calcInvoiceTotal()}
function calcInvoiceTotal(){var total=0;document.querySelectorAll("#invoiceItems .item-row").forEach(function(row){var q=toNumber(row.querySelector(".invoice-qty").value),p=toNumber(row.querySelector(".invoice-price").value),line=q*p;row.querySelector(".invoice-line-total").value=fmt(line);total+=line});text("invoiceTotal",money(total));var paid=toNumber(val("invPaidAmount"));text("invoiceRemaining",money(Math.max(0,total-paid)));return total}
function getInvoiceItems(){return [].slice.call(document.querySelectorAll("#invoiceItems .item-row")).map(function(row){var pid=row.querySelector(".invoice-product").value,p=active(state.products).find(function(x){return x.id===pid}),name=row.querySelector(".invoice-custom-name").value.trim()||(p&&p.name)||"صنف",q=toNumber(row.querySelector(".invoice-qty").value),pr=toNumber(row.querySelector(".invoice-price").value);return {productId:pid,name:name,quantity:q,price:pr,total:q*pr}}).filter(function(i){return i.quantity>0&&i.name})}
function scanInvoiceProduct(){scanBarcode().then(function(code){if(!code)return;var p=active(state.products).find(function(x){return String(x.barcode||"").trim()===String(code).trim()});if(!p){toast("الباركود غير موجود في المنتجات","warning");return}addInvoiceItemRow({productId:p.id,name:p.name,price:p.price,quantity:1});toast("تمت إضافة المنتج","success")})}
function saveInvoice(){var name=val("invCustomerName").trim(),phone=val("invPhone").trim(),date=val("invDate")||today(),paid=toNumber(val("invPaidAmount")),acc=val("invPaidAccount"),items=getInvoiceItems(),total=items.reduce(function(s,i){return s+i.total},0),rem=Math.max(0,total-paid);if(!name||!items.length){toast("أكمل بيانات الفاتورة","warning");return}if(paid>0&&!acc){toast("اختر الحساب الذي دخل عليه المبلغ المدفوع","warning");return}upsertCustomer(name,phone).then(function(c){var inv=nowBase({id:uid("invoice"),customerId:c.id,customerName:name,phone:phone,date:date,items:items,total:total,paid:paid,remaining:rem,accountId:acc,qrValue:""});inv.qrValue="INV|"+inv.id+"|"+name+"|"+total+"|"+paid+"|"+rem;return putOne("invoices",inv).then(function(){return queueSync("invoices",inv.id,"create",inv)}).then(function(){state.lastInvoice=inv;var tasks=[];items.forEach(function(it){if(it.productId)tasks.push(getOne("products",it.productId).then(function(p){if(p){p.quantity=Math.max(0,toNumber(p.quantity)-toNumber(it.quantity));p.updatedAt=Date.now();return putOne("products",p).then(function(){return queueSync("products",p.id,"update",p)})}}))});if(paid>0){var t=nowBase({id:uid("txn"),accountId:acc,type:"income",amount:paid,date:date,note:"دفعة من فاتورة "+name,source:"invoice",sourceId:inv.id});tasks.push(putOne("transactions",t).then(function(){return queueSync("transactions",t.id,"create",t)}));var sale=nowBase({id:uid("sale"),customerId:c.id,name:name,amount:paid,phone:phone,paymentMethod:"account",accountId:acc,source:"invoice",sourceId:inv.id,date:date});tasks.push(putOne("dailySales",sale).then(function(){return queueSync("dailySales",sale.id,"create",sale)}))}if(rem>0){var d=nowBase({id:uid("debt"),customerId:c.id,customerName:name,phone:phone,invoiceId:inv.id,amount:rem,paid:0,remaining:rem,status:"unpaid",date:date,dueDate:"",items:items,source:"invoice"});tasks.push(putOne("debts",d).then(function(){return queueSync("debts",d.id,"create",d)}))}return Promise.all(tasks)})}).then(loadAll).then(function(){clearInvoiceForm();renderCurrent();toast("تم حفظ الفاتورة","success")})}
function clearInvoiceForm(){["invCustomerName","invPhone","invPaidAmount"].forEach(function(id){setVal(id,"")});html("invoiceItems","");setDates();renderAccountOptions();addInvoiceItemRow();calcInvoiceTotal()}
function renderInvoices(){var q=(val("invoiceSearch")||"").toLowerCase();var arr=active(state.invoices).filter(function(i){return !q||(i.customerName+" "+i.phone).toLowerCase().includes(q)}).sort(function(a,b){return b.createdAt-a.createdAt});html("invoiceList",arr.length?tools("invoicesTable","الفواتير")+table(["العميل","الجوال","التاريخ","الإجمالي","المدفوع","المتبقي","الحساب","إجراءات"],arr.map(function(i){return [esc(i.customerName),esc(i.phone||"-"),i.date||"-",money(i.total),money(i.paid),money(i.remaining),esc(accountName(i.accountId)),'<div class="actions"><button class="btn small ghost" data-customer-view="'+i.customerId+'">عرض العميل</button><button class="btn small ghost" data-print-invoice="'+i.id+'">طباعة</button><button class="btn small danger" data-delete="invoices:'+i.id+'">حذف</button></div>']}),"invoicesTable"):'<div class="empty">لا توجد فواتير.</div>');bindCustomerView();document.querySelectorAll("[data-print-invoice]").forEach(function(b){b.onclick=function(){printInvoice(b.dataset.printInvoice)}});bindDelete()}
function printLastInvoice(){var inv=state.lastInvoice||active(state.invoices).sort(function(a,b){return b.createdAt-a.createdAt})[0];if(inv)printInvoice(inv.id);else toast("لا توجد فاتورة","warning")}
function printInvoice(id){var inv=active(state.invoices).find(function(x){return x.id===id});if(!inv)return;var w=window.open("","_blank");w.document.write('<html dir="rtl"><head><title>فاتورة</title><style>body{font-family:Arial;padding:24px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px;text-align:right}.total{font-size:20px;font-weight:bold;margin:10px 0}.barcode{height:50px;width:260px;background:repeating-linear-gradient(90deg,#111 0 2px,transparent 2px 5px,#111 5px 8px,transparent 8px 13px);margin-top:14px}</style></head><body><h1>'+esc(state.settings.storeName)+'</h1><p>العميل: '+esc(inv.customerName)+' - '+esc(inv.phone||"-")+'</p><p>التاريخ: '+esc(inv.date)+'</p><table><thead><tr><th>الصنف</th><th>العدد</th><th>السعر</th><th>المبلغ</th></tr></thead><tbody>'+(inv.items||[]).map(function(i){return '<tr><td>'+esc(i.name)+'</td><td>'+i.quantity+'</td><td>'+money(i.price)+'</td><td>'+money(i.total)+'</td></tr>'}).join("")+'</tbody></table><div class="total">الإجمالي: '+money(inv.total)+'</div><div>المدفوع: '+money(inv.paid)+'</div><div>المتبقي دين: '+money(inv.remaining)+'</div><div class="barcode"></div><p>'+esc(inv.qrValue)+'</p></body></html>');w.document.close();w.print()}

function saveCustomer(){var id=val("customerEditId"),name=val("customerName").trim(),phone=val("customerPhone").trim(),note=val("customerNote").trim();if(!name){toast("اكتب اسم العميل","warning");return}(id?getOne("customers",id):Promise.resolve(null)).then(function(old){var c=nowBase(Object.assign({},old||{},{id:id||uid("customer"),name:name,phone:phone,note:note,createdAt:(old&&old.createdAt)||Date.now()}));return putOne("customers",c).then(function(){return queueSync("customers",c.id,id?"update":"create",c)})}).then(loadAll).then(function(){clearCustomerForm();renderCurrent();toast("تم حفظ العميل","success")})}
function clearCustomerForm(){["customerEditId","customerName","customerPhone","customerNote"].forEach(function(id){setVal(id,"")})}
function editCustomer(id){var c=active(state.customers).find(function(x){return x.id===id});if(!c)return;setVal("customerEditId",c.id);setVal("customerName",c.name||"");setVal("customerPhone",c.phone||"");setVal("customerNote",c.note||"");scrollTo({top:0,behavior:"smooth"})}
function renderCustomers(){var q=(val("customerSearch")||"").toLowerCase();var arr=active(state.customers).filter(function(c){return !q||(c.name+" "+(c.phone||"")).toLowerCase().includes(q)}).sort(function(a,b){return b.createdAt-a.createdAt});html("customersList",arr.length?tools("customersTable","العملاء")+table(["الاسم","الجوال","إجمالي الدين","عدد الفواتير","إجراءات"],arr.map(function(c){var debt=customerDebtTotal(c.id);var invs=active(state.invoices).filter(function(i){return i.customerId===c.id}).length;return [esc(c.name),esc(c.phone||"-"),money(debt),invs,'<div class="actions"><button class="btn small ghost" data-customer-view="'+c.id+'">عرض</button><button class="btn small ghost" data-edit-customer="'+c.id+'">تعديل</button><button class="btn small danger" data-delete="customers:'+c.id+'">حذف</button></div>']}),"customersTable"):'<div class="empty">لا يوجد عملاء.</div>');bindCustomerView();document.querySelectorAll("[data-edit-customer]").forEach(function(b){b.onclick=function(){editCustomer(b.dataset.editCustomer)}});bindDelete()}
function bindCustomerView(){document.querySelectorAll("[data-customer-view]").forEach(function(b){b.onclick=function(){state.selectedCustomerId=b.dataset.customerView;navigate("customers");setTimeout(renderCustomerProfile,0)}})}
function renderCustomerProfile(){var id=state.selectedCustomerId,c=active(state.customers).find(function(x){return x.id===id});if(!c)return;var invs=active(state.invoices).filter(function(i){return i.customerId===id}).sort(function(a,b){return b.createdAt-a.createdAt});var debts=active(state.debts).filter(function(d){return d.customerId===id}).sort(function(a,b){return b.createdAt-a.createdAt});var pays=active(state.payments).filter(function(p){return p.customerId===id}).sort(function(a,b){return b.createdAt-a.createdAt});html("customerProfile",'<div class="card"><div class="customer-head"><div><h3>'+esc(c.name)+'</h3><p class="muted">'+esc(c.phone||"-")+'</p></div><div class="customer-avatar">'+esc((c.name||"?")[0])+'</div></div><div class="grid cards-4" style="margin-top:14px"><div class="card metric" style="box-shadow:none"><b>'+money(debts.reduce(function(s,d){return s+toNumber(d.remaining)},0))+'</b><span>الدين المتبقي</span></div><div class="card metric" style="box-shadow:none"><b>'+invs.length+'</b><span>الفواتير</span></div><div class="card metric" style="box-shadow:none"><b>'+pays.length+'</b><span>الدفعات</span></div></div>'+tools("customerInvoices","فواتير العميل")+table(["التاريخ","الإجمالي","المدفوع","المتبقي"],invs.map(function(i){return [i.date,money(i.total),money(i.paid),money(i.remaining)]}),"customerInvoices")+tools("customerDebts","ديون العميل")+table(["التاريخ","الدين","المدفوع","المتبقي","الحالة"],debts.map(function(d){return [d.date,money(d.amount),money(d.paid),money(d.remaining),chip(debtStatus(d))]}),"customerDebts")+tools("customerPayments","دفعات العميل")+table(["التاريخ","المبلغ","الحساب","ملاحظة"],pays.map(function(p){return [p.date,money(p.amount),esc(accountName(p.accountId)),esc(p.note||"-")]}),"customerPayments")+'</div>')}
function renderManualDebtArea(){if(!$("manualDebtCustomer"))return;var opts=active(state.customers).map(function(c){return '<option value="'+c.id+'">'+esc(c.name)+' - '+esc(c.phone||"")+'</option>'}).join("");html("manualDebtCustomer",opts||'<option value="">أضف عميلًا عبر الفاتورة أولًا</option>')}
function renderDebtsPage(){var q=(val("debtSearch")||"").toLowerCase();var arr=active(state.debts).filter(function(d){return !q||(d.customerName+" "+(d.phone||"")).toLowerCase().includes(q)}).sort(function(a,b){return b.createdAt-a.createdAt});html("debtsList",arr.length?tools("debtsTable","الديون")+table(["العميل","الجوال","التاريخ","أصل الدين","المدفوع","المتبقي","الحالة","إجراءات"],arr.map(function(d){return [esc(d.customerName),esc(d.phone||"-"),d.date||"-",money(d.amount),money(d.paid),money(d.remaining),chip(debtStatus(d)),'<div class="actions"><button class="btn small success" data-pay-debt="'+d.id+'">سداد</button><button class="btn small ghost" data-customer-view="'+d.customerId+'">عرض العميل</button><button class="btn small danger" data-delete="debts:'+d.id+'">حذف</button></div>']}),"debtsTable"):'<div class="empty">لا توجد ديون.</div>');document.querySelectorAll("[data-pay-debt]").forEach(function(b){b.onclick=function(){var s=$("customerPaymentDebt");if(s)s.value=b.dataset.payDebt;var p=$("paymentDebt");if(p)p.value=b.dataset.payDebt}});bindCustomerView();bindDelete()}
function renderCustomerPaymentArea(){if(!$("customerPaymentDebt"))return;renderPaymentDebtOptions()}
function debtStatus(d){if(toNumber(d.remaining)<=0)return"paid";if(toNumber(d.paid)>0)return"partial";return"unpaid"}
function saveManualDebt(){var cid=val("manualDebtCustomer"),amount=toNumber(val("manualDebtAmount")),date=val("manualDebtDate")||today(),note=val("manualDebtNote").trim();var c=active(state.customers).find(function(x){return x.id===cid});if(!c||amount<=0){toast("اختر العميل واكتب المبلغ","warning");return}var d=nowBase({id:uid("debt"),customerId:c.id,customerName:c.name,phone:c.phone,amount:amount,paid:0,remaining:amount,status:"unpaid",date:date,note:note,source:"manual"});putOne("debts",d).then(function(){return queueSync("debts",d.id,"create",d)}).then(loadAll).then(renderCurrent).then(function(){toast("تم إضافة الدين","success")})}
function renderPaymentDebtOptions(){var select=$("paymentDebt")||$("customerPaymentDebt");if(!select)return;var name=val("paymentCustomerName").trim().toLowerCase();var debts=active(state.debts).filter(function(d){return toNumber(d.remaining)>0 && (!name||d.customerName.toLowerCase().includes(name))});select.innerHTML=debts.length?debts.map(function(d){return '<option value="'+d.id+'">'+esc(d.customerName)+' - المتبقي '+money(d.remaining)+'</option>'}).join(""):'<option value="">لا توجد ديون مفتوحة</option>'}
function savePayment(){var debtId=val("paymentDebt")||val("customerPaymentDebt"),amount=toNumber(val("paymentAmount")||val("customerPaymentAmount")),acc=val("paymentAccount"),date=val("paymentDate")||today(),note=val("paymentNote").trim();getOne("debts",debtId).then(function(d){if(!d||amount<=0||!acc){toast("اختر الدين والحساب واكتب المبلغ","warning");throw"stop"}if(amount>toNumber(d.remaining)){toast("المبلغ أكبر من المتبقي","warning");throw"stop"}var rem=toNumber(d.remaining)-amount;var p=nowBase({id:uid("payment"),customerId:d.customerId,customerName:d.customerName,phone:d.phone,debtId:d.id,amount:amount,accountId:acc,date:date,remainingAfterPayment:rem,note:note});return putOne("payments",p).then(function(){return queueSync("payments",p.id,"create",p)}).then(function(){d.paid=toNumber(d.paid)+amount;d.remaining=rem;d.status=rem<=0?"paid":"partial";d.updatedAt=Date.now();return putOne("debts",d).then(function(){return queueSync("debts",d.id,"update",d)})}).then(function(){var t=nowBase({id:uid("txn"),accountId:acc,type:"income",amount:amount,date:date,note:"سداد دين: "+d.customerName,source:"payment",sourceId:p.id});return putOne("transactions",t).then(function(){return queueSync("transactions",t.id,"create",t)})})}).then(loadAll).then(renderCurrent).then(function(){toast("تم تسجيل السداد","success")}).catch(function(){})}
function renderPayments(){var arr=active(state.payments).sort(function(a,b){return b.createdAt-a.createdAt});html("paymentsList",arr.length?tools("paymentsTable","الدفعات")+table(["العميل","التاريخ","المبلغ","الحساب","المتبقي بعد الدفع","ملاحظة"],arr.map(function(p){return [esc(p.customerName),p.date,money(p.amount),esc(accountName(p.accountId)),money(p.remainingAfterPayment),esc(p.note||"-")]}),"paymentsTable"):'<div class="empty">لا توجد دفعات.</div>')}

function renderSales(){var q=(val("salesSearch")||"").toLowerCase(),date=val("salesDateFilter");var arr=active(state.dailySales).filter(function(s){return (!q||(s.name+" "+s.phone).toLowerCase().includes(q))&&(!date||s.date===date)}).sort(function(a,b){return b.createdAt-a.createdAt});text("salesTotal",money(arr.reduce(function(s,x){return s+toNumber(x.amount)},0)));html("salesList",arr.length?tools("salesTable","المبيعات")+table(["الاسم","الجوال","التاريخ","المبلغ","الحساب"],arr.map(function(s){return [esc(s.name),esc(s.phone||"-"),s.date,money(s.amount),esc(accountName(s.accountId))]}),"salesTable"):'<div class="empty">لا توجد مبيعات.</div>')}

function saveProduct(){var id=val("productEditId"),name=val("productName").trim(),price=toNumber(val("productPrice")),barcode=val("productBarcode").trim(),qty=toNumber(val("productQty")),cat=val("productCategory").trim(),min=toNumber(val("productMinQty")||5);if(!name){toast("اكتب اسم المنتج","warning");return}(id?getOne("products",id):Promise.resolve(null)).then(function(old){var p=nowBase(Object.assign({},old||{},{id:id||uid("product"),name:name,price:price,barcode:barcode,quantity:qty,category:cat,minQuantity:min,createdAt:(old&&old.createdAt)||Date.now()}));return putOne("products",p).then(function(){return queueSync("products",p.id,id?"update":"create",p)})}).then(loadAll).then(function(){clearProductForm();renderCurrent();toast("تم حفظ المنتج","success")})}
function clearProductForm(){["productEditId","productName","productPrice","productBarcode","productQty","productCategory","productMinQty"].forEach(function(id){setVal(id,"")})}
function editProduct(id){var p=active(state.products).find(function(x){return x.id===id});if(!p)return;setVal("productEditId",p.id);setVal("productName",p.name);setVal("productPrice",p.price);setVal("productBarcode",p.barcode);setVal("productQty",p.quantity);setVal("productCategory",p.category);setVal("productMinQty",p.minQuantity)}
function renderProducts(){var q=(val("productSearch")||"").toLowerCase();var arr=active(state.products).filter(function(p){return !q||(p.name+" "+p.barcode+" "+p.category).toLowerCase().includes(q)}).sort(function(a,b){return b.createdAt-a.createdAt});html("productsList",arr.length?tools("productsTable","المنتجات")+table(["المنتج","التصنيف","الباركود","السعر","الكمية","إجراءات"],arr.map(function(p){var low=toNumber(p.quantity)<=toNumber(p.minQuantity||0);return [esc(p.name),esc(p.category||"-"),esc(p.barcode||"-"),money(p.price),'<span class="chip '+(low?"danger":"success")+'">'+esc(p.quantity||0)+'</span>','<div class="actions"><button class="btn small ghost" data-edit-product="'+p.id+'">تعديل</button><button class="btn small danger" data-delete="products:'+p.id+'">حذف</button></div>']}),"productsTable"):'<div class="empty">لا توجد منتجات.</div>');document.querySelectorAll("[data-edit-product]").forEach(function(b){b.onclick=function(){editProduct(b.dataset.editProduct)}});bindDelete()}

function renderPurchaseProductOptions(){var s=$("purchaseProduct");if(!s)return;var old=s.value;var arr=active(state.products);s.innerHTML=arr.length?arr.map(function(p){return '<option value="'+p.id+'" '+(old===p.id?"selected":"")+'>'+esc(p.name)+' - كمية '+esc(p.quantity||0)+'</option>'}).join(""):'<option value="">أضف منتجًا أولًا</option>'}
function savePurchase(){var supplier=val("purchaseSupplier").trim(),pid=val("purchaseProduct"),qty=toNumber(val("purchaseQty")),cost=toNumber(val("purchaseUnitCost")),date=val("purchaseDate")||today(),acc=val("purchaseAccount");getOne("products",pid).then(function(p){if(!supplier||!p||qty<=0||!acc){toast("أكمل بيانات الشراء واختر الحساب","warning");throw"stop"}var pur=nowBase({id:uid("purchase"),supplierName:supplier,productId:pid,productName:p.name,quantity:qty,unitCost:cost,totalCost:qty*cost,accountId:acc,date:date});return putOne("purchases",pur).then(function(){return queueSync("purchases",pur.id,"create",pur)}).then(function(){p.quantity=toNumber(p.quantity)+qty;p.updatedAt=Date.now();return putOne("products",p).then(function(){return queueSync("products",p.id,"update",p)})}).then(function(){var t=nowBase({id:uid("txn"),accountId:acc,type:"expense",amount:qty*cost,date:date,note:"شراء من "+supplier,source:"purchase",sourceId:pur.id});return putOne("transactions",t).then(function(){return queueSync("transactions",t.id,"create",t)})})}).then(loadAll).then(function(){["purchaseSupplier","purchaseQty","purchaseUnitCost"].forEach(function(id){setVal(id,"")});renderCurrent();toast("تم حفظ الشراء","success")}).catch(function(){})}
function renderPurchases(){var arr=active(state.purchases).sort(function(a,b){return b.createdAt-a.createdAt});html("purchasesList",arr.length?tools("purchasesTable","المشتريات")+table(["المورد","المنتج","الكمية","التكلفة","الإجمالي","الحساب","التاريخ","إجراءات"],arr.map(function(p){return [esc(p.supplierName),esc(p.productName),p.quantity,money(p.unitCost),money(p.totalCost),esc(accountName(p.accountId)),p.date,'<button class="btn small danger" data-delete="purchases:'+p.id+'">حذف</button>']}),"purchasesTable"):'<div class="empty">لا توجد مشتريات.</div>');bindDelete()}

function hydrateSettings(force){if(state.route!=="settings")return;force=force!==false;var s=state.settings||{};if(force||document.activeElement.id!=="settingStoreName")setVal("settingStoreName",s.storeName||"");if(force||document.activeElement.id!=="settingLogoUrl")setVal("settingLogoUrl",s.logoUrl||"");if(force||document.activeElement.id!=="settingOpeningBalance")setVal("settingOpeningBalance",s.openingBalance||0);if(force||document.activeElement.id!=="settingCurrency")setVal("settingCurrency",s.currency||"شيكل");var img=$("settingsLogoPreview");if(img)img.src=s.logoUrl||""}
function saveSettings(){getOne("settings","main").then(function(cur){cur=cur||{};var s=nowBase(Object.assign({},cur,{id:"main",storeName:val("settingStoreName").trim()||"نظام إدارة المبيعات",logoUrl:val("settingLogoUrl").trim(),openingBalance:toNumber(val("settingOpeningBalance")),currency:val("settingCurrency").trim()||"شيكل",password:val("settingPassword")?val("settingPassword"):cur.password||ACCESS_PASSWORD,createdAt:cur.createdAt||Date.now()}));return putOne("settings",s).then(function(){return queueSync("settings","main","update",s)})}).then(loadAll).then(function(){setVal("settingPassword","");applyBrand();renderCurrent();toast("تم حفظ الإعدادات","success")})}
function renderSyncStatus(){text("pendingCount",(state.syncQueue||[]).filter(function(x){return x.status==="pending"||x.status==="failed"}).length);var last=localStorage.getItem("sales_last_sync");text("lastSyncText",last?new Date(last).toLocaleTimeString("ar"):"-");var logs=(state.syncLogs||[]).sort(function(a,b){return b.createdAt-a.createdAt}).slice(0,20);html("syncLog",logs.length?logs.map(function(x){return '<div class="log-line"><b>'+new Date(x.createdAt).toLocaleString("ar")+'</b><br>'+esc(x.message)+'</div>'}).join(""):'<div class="empty">لا توجد سجلات مزامنة.</div>')}
function exportAllJSON(){var data={};Promise.all(STORES.map(function(s){return getAll(s).then(function(a){data[s]=a})})).then(function(){var blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="sales-backup-"+today()+".json";a.click();URL.revokeObjectURL(a.href)})}
function clearAllData(){if(!confirm("سيتم حذف البيانات المحلية فقط. هل أنت متأكد؟"))return;Promise.all(STORES.map(clearStore)).then(ensureDefaults).then(loadAll).then(renderCurrent).then(function(){toast("تم حذف البيانات المحلية","success")})}
function softDelete(storeName,id){if(!confirm("تأكيد الحذف؟"))return;getOne(storeName,id).then(function(item){if(!item)return;item.isDeleted=true;item.updatedAt=Date.now();item.syncStatus="pending";return putOne(storeName,item).then(function(){return queueSync(storeName,id,"delete",item)})}).then(loadAll).then(renderCurrent).then(function(){toast("تم الحذف","success")})}
function bindDelete(){document.querySelectorAll("[data-delete]").forEach(function(b){b.onclick=function(){var p=b.dataset.delete.split(":");softDelete(p[0],p[1])}})}

function enhanceSearchSelects(){document.querySelectorAll('select[data-search="1"]').forEach(function(sel){if(sel.dataset.enhanced==="1"){refreshSearchSelect(sel);return}sel.dataset.enhanced="1";sel.classList.add("hidden");var wrap=document.createElement("div");wrap.className="smart-select";var btn=document.createElement("button");btn.type="button";btn.className="smart-select-btn";var menu=document.createElement("div");menu.className="smart-select-menu";var input=document.createElement("input");input.type="search";input.placeholder="بحث...";var list=document.createElement("div");list.className="smart-select-list";menu.appendChild(input);menu.appendChild(list);wrap.appendChild(btn);wrap.appendChild(menu);sel.after(wrap);sel._smart={wrap:wrap,btn:btn,input:input,list:list};btn.onclick=function(){document.querySelectorAll(".smart-select.open").forEach(function(x){if(x!==wrap)x.classList.remove("open")});wrap.classList.toggle("open");input.value="";refreshSearchSelect(sel);setTimeout(function(){input.focus()},20)};input.oninput=function(){refreshSearchSelect(sel)};list.onclick=function(e){var opt=e.target.closest("[data-value]");if(!opt)return;sel.value=opt.dataset.value;sel.dispatchEvent(new Event("change",{bubbles:true}));wrap.classList.remove("open");refreshSearchSelect(sel)};sel.addEventListener("change",function(){refreshSearchSelect(sel)});new MutationObserver(function(){refreshSearchSelect(sel)}).observe(sel,{childList:true,subtree:true,attributes:true});refreshSearchSelect(sel)})}
function refreshSearchSelect(sel){if(!sel._smart)return;var o=sel.options[sel.selectedIndex];sel._smart.btn.innerHTML='<span>'+(o?esc(o.textContent):'اختر')+'</span><span>⌄</span>';var q=(sel._smart.input.value||"").toLowerCase();var opts=[].slice.call(sel.options).filter(function(opt){return opt.textContent.toLowerCase().includes(q)});sel._smart.list.innerHTML=opts.length?opts.map(function(opt){return '<button type="button" data-value="'+esc(opt.value)+'" class="smart-option">'+esc(opt.textContent)+'</button>'}).join(""):'<div class="empty" style="padding:12px">لا توجد نتائج</div>'}
document.addEventListener("click",function(e){if(!e.target.closest(".smart-select")){document.querySelectorAll(".smart-select.open").forEach(function(x){x.classList.remove("open")})}});
function scanBarcode(){return new Promise(function(resolve){var modal=document.createElement("div");modal.className="scanner-modal";modal.innerHTML='<div class="scanner-card"><video id="barcodeVideo" playsinline></video><div class="scanner-actions"><button class="btn primary" id="closeScanner" type="button">إغلاق</button><button class="btn ghost" id="manualBarcode" type="button">إدخال يدوي</button></div></div>';document.body.appendChild(modal);var video=modal.querySelector("video"),controls=null,stream=null,done=false;function close(v){done=true;try{if(controls)controls.stop()}catch(e){}try{if(stream)stream.getTracks().forEach(function(t){t.stop()})}catch(e){}modal.remove();resolve(v||null)}modal.querySelector("#closeScanner").onclick=function(){close(null)};modal.querySelector("#manualBarcode").onclick=function(){close(prompt("أدخل الباركود يدويًا")||null)};if(window.ZXingBrowser&&ZXingBrowser.BrowserMultiFormatReader){var reader=new ZXingBrowser.BrowserMultiFormatReader();reader.decodeFromVideoDevice(null,video,function(result,err,c){controls=c;if(result)close(result.getText())}).catch(function(){toast("تعذر فتح الكاميرا. استخدم HTTPS أو الإدخال اليدوي.","danger")})}else{toast("الكاميرا تحتاج إنترنت لتحميل ماسح الباركود. استخدم الإدخال اليدوي.","warning")}})}

function queueSync(entity,entityId,action,payload){var q={id:uid("queue"),entity:entity,entityId:entityId,action:action,payload:payload,status:"pending",attempts:0,createdAt:Date.now()};return putOne("syncQueue",q).then(function(){showPendingSync();if(navigator.onLine)setTimeout(function(){syncNow(true)},100)})}
function showPendingSync(){setSyncStatus("جاري المزامنة","syncing")}
function setSyncStatus(txt,kind){var cls=kind==="offline"?"offline":kind==="failed"?"failed":kind==="syncing"?"syncing":"";html("syncStatus",'<span class="status-dot '+cls+'"></span><span>'+txt+'</span>');$("syncBtn").classList.toggle("syncing",kind==="syncing")}
function initFirebase(){if(fbReady)return true;if(!window.firebase||!firebase.database)return false;try{if(!firebase.apps.length)firebase.initializeApp(firebaseConfig);fbReady=true;return true}catch(e){return false}}
function path(entity,id){return "systems/"+SYSTEM_KEY+"/"+entity+(id?"/"+id:"")}
function addLog(msg,type){return putOne("syncLogs",{id:uid("log"),message:msg,type:type||"info",createdAt:Date.now()})}
function syncNow(silent){if(syncing)return Promise.resolve();if(!navigator.onLine){setSyncStatus("بدون نت","offline");if(!silent)toast("لا يوجد اتصال","warning");return Promise.resolve()}if(!initFirebase()){setSyncStatus("Firebase غير جاهز","failed");if(!silent)toast("تعذر تحميل Firebase","danger");return Promise.resolve()}syncing=true;setSyncStatus("جاري المزامنة","syncing");return getAll("syncQueue").then(function(qs){qs=qs.filter(function(x){return x.status==="pending"||x.status==="failed"}).sort(function(a,b){return a.createdAt-b.createdAt});var chain=Promise.resolve();qs.forEach(function(item){chain=chain.then(function(){var payload=Object.assign({},item.payload,{updatedAt:Date.now()});if(item.action==="delete")payload.isDeleted=true;return firebase.database().ref(path(item.entity,item.entityId)).set(payload).then(function(){return delOne("syncQueue",item.id)}).then(function(){return getOne(item.entity,item.entityId)}).then(function(local){if(local){local.syncStatus="synced";return putOne(item.entity,local)}}).catch(function(err){item.status="failed";item.attempts=(item.attempts||0)+1;item.error=String(err.message||err);return putOne("syncQueue",item).then(function(){throw err})})})});return chain.then(pullFirebase).then(function(){localStorage.setItem("sales_last_sync",new Date().toISOString());return addLog("تمت المزامنة. العمليات: "+qs.length,"success")})}).then(function(){setSyncStatus("تمت المزامنة","online");if(!silent)toast("تمت المزامنة","success")}).catch(function(err){setSyncStatus("فشل المزامنة","failed");addLog("فشل المزامنة: "+(err.message||err),"danger");if(!silent)toast("فشل المزامنة. راجع Firebase Rules.","danger")}).finally(function(){syncing=false;return loadAll().then(renderCurrent)})}
function pullFirebase(){if(!navigator.onLine||!initFirebase())return Promise.resolve();var ents=STORES.filter(function(s){return !["syncQueue","syncLogs"].includes(s)}),chain=Promise.resolve();ents.forEach(function(entity){chain=chain.then(function(){return firebase.database().ref(path(entity)).once("value").then(function(snap){var vals=Object.values(snap.val()||{}),inner=Promise.resolve();vals.forEach(function(rec){if(!rec||!rec.id)return;inner=inner.then(function(){return getOne(entity,rec.id).then(function(local){if(!local||Number(rec.updatedAt||0)>=Number(local.updatedAt||0)){rec.syncStatus="synced";return putOne(entity,rec)}})})});return inner})})});return chain.then(function(){localStorage.setItem("sales_last_sync",new Date().toISOString())})}
function startRealtime(){if(fbListening||!navigator.onLine||!initFirebase())return;fbListening=true;STORES.filter(function(s){return !["syncQueue","syncLogs"].includes(s)}).forEach(function(entity){firebase.database().ref(path(entity)).on("value",function(snap){var vals=Object.values(snap.val()||{}),chain=Promise.resolve();vals.forEach(function(rec){if(!rec||!rec.id)return;chain=chain.then(function(){return getOne(entity,rec.id).then(function(local){if(!local||Number(rec.updatedAt||0)>=Number(local.updatedAt||0)){rec.syncStatus="synced";return putOne(entity,rec)}})})});chain.then(loadAll).then(renderCurrent)})})}
function watchConnection(){function u(){if(navigator.onLine){setSyncStatus("متصل","online");syncNow(true);startRealtime()}else setSyncStatus("بدون نت","offline")}window.addEventListener("online",u);window.addEventListener("offline",u);u()}
function initPWA(){window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();deferredInstallPrompt=e;$("installBtn").classList.remove("hidden")});$("installBtn").onclick=function(){if(deferredInstallPrompt){deferredInstallPrompt.prompt();deferredInstallPrompt=null;$("installBtn").classList.add("hidden")}}}

var templates={
dashboard:function(){return '<div class="section-head"><div><h3>لوحة التحكم</h3><p>ملخص الحسابات والمبيعات والديون.</p></div><button class="btn primary" data-nav="invoices">فاتورة جديدة</button></div><div class="card balance-card"><small>إجمالي أرصدة الحسابات</small><strong id="currentBalance">0</strong><small>يحسب من الرصيد الافتتاحي + الواردات - الصادرات لكل حساب.</small></div><div class="grid cards-6" style="margin-top:14px"><div class="card metric"><div class="metric-icon">'+icon("wallet")+'</div><b id="mTodaySales">0</b><span>مبيعات اليوم</span></div><div class="card metric"><div class="metric-icon">'+icon("receipt")+'</div><b id="mInvoices">0</b><span>عدد الفواتير</span></div><div class="card metric"><div class="metric-icon">'+icon("debt")+'</div><b id="mDebts">0</b><span>ديون مفتوحة</span></div><div class="card metric"><div class="metric-icon">'+icon("account")+'</div><b id="mAccounts">0</b><span>عدد الحسابات</span></div><div class="card metric"><div class="metric-icon">'+icon("users")+'</div><b id="mCustomers">0</b><span>عدد العملاء</span></div><div class="card metric"><div class="metric-icon">'+icon("alert")+'</div><b id="mLowProducts">0</b><span>منتجات ناقصة</span></div></div><div class="card" style="margin-top:14px"><div class="section-head" style="margin-top:0"><div><h3>آخر حركات الحسابات</h3><p>سجل واردات وصادرات مختصر.</p></div></div><div id="recentTransactions"></div></div>'},
invoices:function(){return '<div class="section-head"><div><h3>الفواتير</h3><p>اكتب اسم العميل، المدفوع، والمتبقي يتحول إلى دين تلقائيًا.</p></div><button class="btn ghost" id="clearInvoiceBtn">تفريغ النموذج</button></div><div class="grid two-col"><div class="card"><h3 style="margin-top:0;font-family:Cairo">إنشاء فاتورة</h3><div class="form-grid"><label class="suggest-wrap">اسم العميل<input id="invCustomerName" placeholder="اكتب أول حرفين لظهور اقتراحات"><div id="invCustomerSuggest" class="suggest-box"></div><div id="invCustomerDebtInfo" style="margin-top:8px"></div></label><label>رقم الجوال<input id="invPhone" inputmode="tel"></label><label>التاريخ<input id="invDate" type="date"></label><label>المبلغ المدفوع<input id="invPaidAmount" type="number" min="0" step="0.01" oninput="calcInvoiceTotal()"></label><label class="full">الحساب الذي دخل عليه المدفوع<select id="invPaidAccount" data-search="1"></select></label></div><div class="section-head"><div><h3 style="font-size:18px">الأصناف</h3><p>اختر من المنتجات أو امسح باركود.</p></div><div class="actions"><button class="btn small secondary" id="scanInvoiceBarcodeBtn">مسح باركود</button><button class="btn small primary" id="addInvoiceItemBtn">إضافة صنف</button></div></div><div id="invoiceItems" class="invoice-items"></div><div class="invoice-total"><span>الإجمالي</span><span class="money" id="invoiceTotal">0</span></div><div class="invoice-total"><span>المتبقي كدين</span><span class="money" id="invoiceRemaining">0</span></div><div class="actions" style="margin-top:12px"><button class="btn primary" id="saveInvoiceBtn">حفظ الفاتورة</button><button class="btn ghost" id="printInvoiceBtn">طباعة آخر فاتورة</button></div></div><div class="card"><h3 style="margin-top:0;font-family:Cairo">سجل الفواتير</h3><div class="searchbar"><input id="invoiceSearch" placeholder="بحث"></div><div id="invoiceList"></div></div></div>'},
customers:function(){return '<div class="section-head"><div><h3>العملاء</h3><p>إضافة العملاء ومشاهدة ملف كل عميل.</p></div></div><div id="customerProfile" style="margin-bottom:14px"></div><div class="grid two-col"><div class="card"><h3 style="margin-top:0;font-family:Cairo">إضافة / تعديل عميل</h3><input id="customerEditId" type="hidden"><div class="form-grid"><label>اسم العميل<input id="customerName" placeholder="اسم العميل"></label><label>رقم الجوال<input id="customerPhone" inputmode="tel" placeholder="رقم الجوال"></label><label class="full">ملاحظة<input id="customerNote" placeholder="اختياري"></label></div><div class="actions" style="margin-top:12px"><button class="btn primary" id="saveCustomerBtn">حفظ العميل</button><button class="btn ghost" id="clearCustomerBtn">جديد</button></div></div><div class="card"><h3 style="margin-top:0;font-family:Cairo">قائمة العملاء</h3><div class="searchbar"><input id="customerSearch" placeholder="بحث عن عميل"></div><div id="customersList"></div></div></div>'},
debts:function(){return '<div class="section-head"><div><h3>الديون</h3><p>إضافة دين يدوي وسداد الديون على حساب محدد.</p></div></div><div class="grid two-col"><div class="card"><h3 style="margin-top:0;font-family:Cairo">إضافة دين يدوي</h3><div class="form-grid"><label>العميل<select id="manualDebtCustomer" data-search="1"></select></label><label>المبلغ<input id="manualDebtAmount" type="number" step="0.01"></label><label>التاريخ<input id="manualDebtDate" type="date"></label><label>ملاحظة<input id="manualDebtNote"></label></div><button class="btn primary" style="margin-top:12px" id="saveManualDebtBtn">حفظ الدين</button><hr style="border:0;border-top:1px solid var(--border);margin:16px 0"><h3 style="font-family:Cairo">سداد دفعة</h3><div class="form-grid"><label>الدين<select id="customerPaymentDebt" data-search="1"></select></label><label>الحساب<select id="paymentAccount" data-search="1"></select></label><label>المبلغ<input id="customerPaymentAmount" type="number" step="0.01"></label><label>التاريخ<input id="paymentDate" type="date"></label><label class="full">ملاحظة<input id="paymentNote"></label></div><button class="btn success" style="margin-top:12px" id="saveDebtPaymentBtn">حفظ السداد</button></div><div class="card"><h3 style="margin-top:0;font-family:Cairo">سجل الديون</h3><div class="searchbar"><input id="debtSearch" placeholder="بحث في الديون"></div><div id="debtsList"></div></div></div>'},
accounts:function(){return '<div class="section-head"><div><h3>الحسابات</h3><p>الصندوق، البنك، المحافظ، أو أي جهة مالية.</p></div></div><div class="grid two-col"><div class="card"><h3 style="margin-top:0;font-family:Cairo">إضافة / تعديل حساب</h3><input id="accountEditId" type="hidden"><div class="form-grid"><label>اسم الجهة<input id="accountEntity" placeholder="مثال: البنك / الصندوق"></label><label>اسم الحساب<input id="accountName" placeholder="مثال: حساب رئيسي"></label><label>رصيد افتتاحي<input id="accountOpening" type="number" step="0.01"></label><label>نوع الحساب<select id="accountType" data-search="1"><option value="cash">نقدي</option><option value="bank">بنك</option><option value="wallet">محفظة</option><option value="other">آخر</option></select></label></div><div class="actions" style="margin-top:12px"><button class="btn primary" id="saveAccountBtn">حفظ الحساب</button><button class="btn ghost" id="clearAccountBtn">جديد</button></div><hr style="border:0;border-top:1px solid var(--border);margin:16px 0"><h3 style="font-family:Cairo">وارد / صادر يدوي</h3><div class="form-grid"><label>الحساب<select id="txnAccount" data-search="1"></select></label><label>نوع الحركة<select id="txnType" data-search="1"><option value="income">وارد</option><option value="expense">صادر</option></select></label><label>المبلغ<input id="txnAmount" type="number" step="0.01"></label><label>التاريخ<input id="txnDate" type="date"></label><label class="full">البيان<input id="txnNote"></label></div><button class="btn secondary" style="margin-top:12px" id="saveTxnBtn">حفظ الحركة</button></div><div class="card"><div class="searchbar"><input id="accountSearch" placeholder="بحث في الحسابات"></div><div id="accountsList"></div><div id="transactionsList" style="margin-top:14px"></div></div></div>'},
payments:function(){return '<div class="section-head"><div><h3>سداد الديون</h3><p>اختر الدين والحساب الذي ستدخل عليه الدفعة.</p></div></div><div class="grid two-col"><div class="card"><h3 style="margin-top:0;font-family:Cairo">إضافة دفعة</h3><div class="form-grid"><label class="suggest-wrap">اسم العميل<input id="paymentCustomerName" placeholder="اكتب أول حرفين"><div id="paymentCustomerSuggest" class="suggest-box"></div><div id="paymentCustomerDebtInfo" style="margin-top:8px"></div></label><label>رقم الجوال<input id="paymentPhone"></label><label class="full">الدين<select id="paymentDebt" data-search="1"></select></label><label>المبلغ<input id="paymentAmount" type="number" step="0.01"></label><label>الحساب<select id="paymentAccount" data-search="1"></select></label><label>التاريخ<input id="paymentDate" type="date"></label><label class="full">ملاحظة<input id="paymentNote"></label></div><button class="btn primary" style="margin-top:12px" id="savePaymentBtn">حفظ الدفعة</button></div><div class="card"><h3 style="margin-top:0;font-family:Cairo">سجل الدفعات</h3><div id="paymentsList"></div></div></div>'},
sales:function(){return '<div class="section-head"><div><h3>المبيعات</h3><p>سجل المبالغ المقبوضة من الفواتير.</p></div></div><div class="card"><div class="searchbar"><input id="salesSearch" placeholder="بحث"><input id="salesDateFilter" type="date"></div><div class="invoice-total" style="margin-bottom:12px"><span>الإجمالي</span><span class="money" id="salesTotal">0</span></div><div id="salesList"></div></div>'},
products:function(){return '<div class="section-head"><div><h3>المنتجات</h3><p>إدارة المنتجات والباركود.</p></div></div><div class="grid two-col"><div class="card"><h3 style="margin-top:0;font-family:Cairo">إضافة / تعديل منتج</h3><input id="productEditId" type="hidden"><div class="form-grid"><label>اسم المنتج<input id="productName"></label><label>السعر<input id="productPrice" type="number" step="0.01"></label><label>الباركود<input id="productBarcode"></label><label>الكمية<input id="productQty" type="number"></label><label>التصنيف<input id="productCategory"></label><label>حد التنبيه<input id="productMinQty" type="number"></label></div><div class="actions" style="margin-top:12px"><button class="btn primary" id="saveProductBtn">حفظ</button><button class="btn ghost" id="clearProductBtn">جديد</button><button class="btn secondary" id="scanProductBarcodeBtn">مسح باركود</button></div></div><div class="card"><div class="searchbar"><input id="productSearch" placeholder="بحث"></div><div id="productsList"></div></div></div>'},
purchases:function(){return '<div class="section-head"><div><h3>المشتريات</h3><p>تسجيل شراء يخصم من الحساب ويزيد المخزون.</p></div></div><div class="grid two-col"><div class="card"><h3 style="margin-top:0;font-family:Cairo">إضافة مشتريات</h3><div class="form-grid"><label>المورد<input id="purchaseSupplier"></label><label>المنتج<select id="purchaseProduct" data-search="1"></select></label><label>الكمية<input id="purchaseQty" type="number"></label><label>تكلفة الوحدة<input id="purchaseUnitCost" type="number" step="0.01"></label><label>الحساب المدفوع منه<select id="purchaseAccount" data-search="1"></select></label><label>التاريخ<input id="purchaseDate" type="date"></label></div><button class="btn primary" style="margin-top:12px" id="savePurchaseBtn">حفظ الشراء</button></div><div class="card"><div id="purchasesList"></div></div></div>'},
settings:function(){return '<div class="section-head"><div><h3>الإعدادات</h3><p>تغيير الاسم والصورة وكلمة المرور والمزامنة.</p></div></div><div class="grid two-col"><div class="card"><h3 style="margin-top:0;font-family:Cairo">إعدادات عامة</h3><div class="form-grid"><label>اسم النظام<input id="settingStoreName"></label><label>رابط الصورة<input id="settingLogoUrl"></label><label>رصيد بداية عام<input id="settingOpeningBalance" type="number" step="0.01"></label><label>العملة<input id="settingCurrency"></label><label>كلمة مرور جديدة<input id="settingPassword" type="password" placeholder="اتركها فارغة إن لم ترد تغييرها"></label><label>معاينة<img id="settingsLogoPreview" class="settings-logo-preview"></label></div><div class="actions" style="margin-top:12px"><button class="btn primary" id="saveSettingsBtn">حفظ</button><button class="btn ghost" id="exportDataBtn">نسخة JSON</button><button class="btn danger" id="clearDataBtn">حذف المحلي</button></div></div><div class="card"><h3 style="margin-top:0;font-family:Cairo">المزامنة والتثبيت</h3><div class="grid cards-4"><div class="card metric" style="box-shadow:none"><div class="metric-icon">'+icon("clock")+'</div><b id="pendingCount">0</b><span>عمليات معلقة</span></div><div class="card metric" style="box-shadow:none"><div class="metric-icon">'+icon("cloud")+'</div><b id="lastSyncText">-</b><span>آخر مزامنة</span></div></div><div class="actions" style="margin-top:12px"><button class="btn primary" id="settingsSyncBtn">مزامنة الآن</button><button class="btn ghost" id="pullBtn">سحب Firebase</button></div><div id="syncLog" class="sync-log" style="margin-top:12px"></div></div></div>'}
};


/* ===== V4 overrides: cashier, barcode wedge, product units, expenses, rollback invoice ===== */
routes.forEach(function(r){ if(r.id==="invoices"){r.title="الكاشير";r.subtitle="بيع سريع بالباركود والوحدات";} });
if(!routes.some(function(r){return r.id==="expenses";})){
  routes.splice(routes.findIndex(function(r){return r.id==="settings";}),0,{id:"expenses",title:"المصروفات",subtitle:"مصروفات مرتبطة بالحسابات",icon:"wallet"});
}
bottomIds=["dashboard","invoices","customers","accounts","suppliers","products"];

templates.invoices=function(){return '<div class="section-head"><div><h3>الكاشير</h3><p>امسح باركود بجهاز القارئ أو الكاميرا، والمنتج يضاف للسلة تلقائيًا كقطعة.</p></div><button class="btn ghost" id="clearInvoiceBtn">تفريغ السلة</button></div><div class="grid two-col"><div class="card"><h3 style="margin-top:0;font-family:Cairo">فاتورة بيع</h3><div class="form-grid"><label class="suggest-wrap">اسم العميل<input id="invCustomerName" placeholder="اكتب أول حرفين لاقتراح العملاء"><div id="invCustomerSuggest" class="suggest-box"></div><div id="invCustomerDebtInfo" style="margin-top:8px"></div></label><label>رقم الجوال<input id="invPhone" inputmode="tel"></label><label>التاريخ<input id="invDate" type="date"></label><label>المبلغ المدفوع<input id="invPaidAmount" type="number" min="0" step="0.01" oninput="calcInvoiceTotal()"></label><label class="full">الحساب الذي دخل عليه المدفوع<select id="invPaidAccount" data-search="1"></select></label></div><div class="section-head"><div><h3 style="font-size:18px">السلة</h3><p>افتراضيًا البيع كقطعة. يمكن اختيار وحدة كاملة إذا كانت مسجلة للمنتج.</p></div><div class="actions"><button class="btn small secondary" id="scanInvoiceBarcodeBtn">كاميرا الباركود</button><button class="btn small primary" id="addInvoiceItemBtn">إضافة صنف</button></div></div><div id="invoiceItems" class="invoice-items"></div><div class="invoice-total"><span>الإجمالي</span><span class="money" id="invoiceTotal">0</span></div><div class="invoice-total"><span>المتبقي كدين</span><span class="money" id="invoiceRemaining">0</span></div><div class="actions" style="margin-top:12px"><button class="btn primary" id="saveInvoiceBtn">حفظ الفاتورة</button><button class="btn ghost" id="printInvoiceBtn">طباعة حرارية</button></div></div><div class="card"><h3 style="margin-top:0;font-family:Cairo">سجل الكاشير</h3><div class="searchbar"><input id="invoiceSearch" placeholder="بحث"></div><div id="invoiceList"></div></div></div>'};

templates.products=function(){return '<div class="section-head"><div><h3>المنتجات</h3><p>إضافة منتجات كقطع أو كوحدة تحتوي على عدة قطع، مع سعر جملة وسعر بيع.</p></div></div><div class="grid two-col"><div class="card"><h3 style="margin-top:0;font-family:Cairo">إضافة / تعديل منتج</h3><input id="productEditId" type="hidden"><div class="form-grid"><label>اسم المنتج<input id="productName"></label><label>الباركود<input id="productBarcode" placeholder="امسح بجهاز الباركود أو اكتب"></label><label>اسم المورد<input id="productSupplier" placeholder="اسم المورد"></label><label>الحساب المدفوع منه<select id="productPurchaseAccount" data-search="1"></select></label><label>طريقة الإضافة<select id="productAddMode" data-search="1"><option value="piece">قطعة</option><option value="unit">وحدة تحتوي على قطع</option></select></label><label>الكمية بالمخزون (قطع)<input id="productQty" type="number" min="0" step="0.01"></label><label>سعر الجملة للقطعة<input id="productWholesalePiece" type="number" min="0" step="0.01"></label><label>سعر البيع للقطعة<input id="productSalePiece" type="number" min="0" step="0.01"></label><label>التصنيف<input id="productCategory"></label><label>حد التنبيه<input id="productMinQty" type="number" min="0" step="0.01"></label><label>نوع الخصم<select id="productDiscountType" data-search="1"><option value="none">بدون خصم</option><option value="fixed">خصم ثابت</option><option value="percent">خصم نسبة %</option></select></label><label>قيمة الخصم<input id="productDiscountValue" type="number" min="0" step="0.01"></label><label class="unit-fields">اسم الوحدة<input id="productUnitName" placeholder="مثال: كرتونة / باكيت"></label><label class="unit-fields">كم قطعة في الوحدة<input id="productUnitPieces" type="number" min="0" step="0.01"></label><label class="unit-fields">سعر الوحدة جملة<input id="productUnitWholesale" type="number" min="0" step="0.01"></label><label class="unit-fields">سعر الوحدة بيع<input id="productUnitSale" type="number" min="0" step="0.01"></label><label class="unit-fields">سعر الجملة لكل قطعة<input id="productCalcWholesalePiece" disabled></label><label class="unit-fields">سعر البيع لكل قطعة<input id="productCalcSalePiece" type="number" min="0" step="0.01"></label><label class="full">إجمالي المشتريات بعد الخصم<input id="productPurchaseTotal" disabled></label></div><div class="actions" style="margin-top:12px"><button class="btn primary" id="saveProductBtn">حفظ المنتج</button><button class="btn ghost" id="clearProductBtn">جديد</button><button class="btn secondary" id="scanProductBarcodeBtn">كاميرا الباركود</button></div></div><div class="card"><div class="searchbar"><input id="productSearch" placeholder="بحث"></div><div id="productsList"></div></div></div>'};

templates.expenses=function(){return '<div class="section-head"><div><h3>المصروفات</h3><p>كل مصروف يخصم من الحساب المختار ويظهر في سجل الحسابات.</p></div></div><div class="grid two-col"><div class="card"><h3 style="margin-top:0;font-family:Cairo">إضافة مصروف</h3><div class="form-grid"><label>نوع المصروف<input id="expenseType" placeholder="مثال: مواصلات / إيجار / كهرباء"></label><label>المبلغ<input id="expenseAmount" type="number" min="0" step="0.01"></label><label>الحساب<select id="expenseAccount" data-search="1"></select></label><label>التاريخ<input id="expenseDate" type="date"></label><label class="full">ملاحظة<input id="expenseNote"></label></div><button class="btn primary" style="margin-top:12px" id="saveExpenseBtn">حفظ المصروف</button></div><div class="card"><h3 style="margin-top:0;font-family:Cairo">سجل المصروفات</h3><div id="expensesList"></div></div></div>'};

function bindPage(){
 if(state.route==="invoices"){bindCustomerSuggest("invCustomerName","invCustomerSuggest","invPhone");addInvoiceItemRow();$("addInvoiceItemBtn").onclick=addInvoiceItemRow;$("scanInvoiceBarcodeBtn").onclick=scanInvoiceProduct;$("saveInvoiceBtn").onclick=saveInvoice;$("clearInvoiceBtn").onclick=clearInvoiceForm;$("printInvoiceBtn").onclick=printLastInvoice;$("invoiceSearch").oninput=renderInvoices;$("invCustomerName").addEventListener("input",function(){updateCustomerDebtInfo("invCustomerName","invCustomerDebtInfo")});$("invPaidAmount").addEventListener("input",calcInvoiceTotal)}
 if(state.route==="customers"){$("customerSearch").oninput=renderCustomers;$("saveCustomerBtn").onclick=saveCustomer;$("clearCustomerBtn").onclick=clearCustomerForm}
 if(state.route==="debts"){$("saveManualDebtBtn").onclick=saveManualDebt;$("saveDebtPaymentBtn").onclick=savePayment;$("debtSearch").oninput=renderDebts}
 if(state.route==="accounts"){$("saveAccountBtn").onclick=saveAccount;$("clearAccountBtn").onclick=clearAccountForm;$("accountSearch").oninput=renderAccounts;$("saveTxnBtn").onclick=saveTransaction}
 if(state.route==="payments"){bindCustomerSuggest("paymentCustomerName","paymentCustomerSuggest","paymentPhone");$("savePaymentBtn").onclick=savePayment;$("paymentCustomerName").addEventListener("input",function(){renderPaymentDebtOptions();updateCustomerDebtInfo("paymentCustomerName","paymentCustomerDebtInfo")})}
 if(state.route==="sales"){$("salesDateFilter").onchange=renderSales;$("salesSearch").oninput=renderSales}
 if(state.route==="products"){$("saveProductBtn").onclick=saveProduct;$("clearProductBtn").onclick=clearProductForm;$("scanProductBarcodeBtn").onclick=function(){scanBarcode().then(function(c){if(c)setVal("productBarcode",c)})};$("productSearch").oninput=renderProducts;["productAddMode","productQty","productWholesalePiece","productSalePiece","productUnitPieces","productUnitWholesale","productUnitSale","productCalcSalePiece","productDiscountType","productDiscountValue"].forEach(function(id){var el=$(id);if(el)el.addEventListener("input",updateProductUnitUI);if(el)el.addEventListener("change",updateProductUnitUI)});updateProductUnitUI()}
 if(state.route==="purchases"){$("savePurchaseBtn").onclick=savePurchase}
 if(state.route==="expenses"){$("saveExpenseBtn").onclick=saveExpense}
 if(state.route==="settings"){hydrateSettings();$("saveSettingsBtn").onclick=saveSettings;$("exportDataBtn").onclick=exportAllJSON;$("clearDataBtn").onclick=clearAllData;$("settingsSyncBtn").onclick=function(){syncNow(false)};$("pullBtn").onclick=function(){pullFirebase().then(loadAll).then(renderCurrent).then(function(){toast("تم سحب البيانات","success")})};$("settingLogoUrl").oninput=function(){var i=$("settingsLogoPreview");if(i)i.src=val("settingLogoUrl")}}
 enhanceCustomSelects();
}

function renderCurrent(){applyBrand();if(state.route==="dashboard")renderDashboard();if(state.route==="invoices"){renderAccountOptions();renderInvoices();calcInvoiceTotal()}if(state.route==="customers"){renderCustomers()}if(state.route==="debts"){renderManualDebtArea();renderAccountOptions();renderPaymentDebtOptions();renderDebts()}if(state.route==="accounts"){renderAccounts();renderAccountOptions();renderTransactions()}if(state.route==="payments"){renderAccountOptions();renderPaymentDebtOptions();renderPayments()}if(state.route==="sales")renderSales();if(state.route==="products"){renderAccountOptions();renderProducts();updateProductUnitUI()}if(state.route==="purchases"){renderPurchaseProductOptions();renderAccountOptions();renderPurchases()}if(state.route==="expenses"){renderAccountOptions();renderExpenses()}if(state.route==="settings"){hydrateSettings(false);renderSyncStatus()}enhanceCustomSelects()}

function renderAccountOptions(){var opts=active(state.accounts).map(function(a){return '<option value="'+a.id+'">'+esc(a.entityName)+' - '+esc(a.accountName)+' - '+money(accountBalance(a.id))+'</option>'}).join("");["invPaidAccount","paymentAccount","purchaseAccount","txnAccount","productPurchaseAccount","expenseAccount"].forEach(function(id){var s=$(id);if(s){var old=s.value;s.innerHTML=opts||'<option value="">أضف حسابًا أولًا</option>';if(old)s.value=old;s.dispatchEvent(new Event("select-refresh"))}})}

function enhanceCustomSelects(){document.querySelectorAll('select[data-search="1"]').forEach(function(sel){if(sel.dataset.enhanced==="1"){sel.dispatchEvent(new Event("select-refresh"));return}sel.dataset.enhanced="1";sel.classList.add("hidden");var wrap=document.createElement("div");wrap.className="search-select";var display=document.createElement("button");display.type="button";display.className="search-select-display";var menu=document.createElement("div");menu.className="search-select-menu";var search=document.createElement("input");search.placeholder="بحث...";var opts=document.createElement("div");opts.className="search-select-options";menu.appendChild(search);menu.appendChild(opts);wrap.appendChild(display);wrap.appendChild(menu);sel.after(wrap);function render(){var selected=sel.options[sel.selectedIndex];display.innerHTML='<span>'+(selected?esc(selected.textContent):'اختر')+'</span><span>⌄</span>';var q=search.value.trim().toLowerCase();opts.innerHTML=[].slice.call(sel.options).filter(function(o){return o.textContent.toLowerCase().includes(q)}).map(function(o){return '<button type="button" class="search-select-option" data-value="'+esc(o.value)+'">'+esc(o.textContent)+'</button>'}).join("")||'<div class="empty" style="padding:12px">لا توجد نتائج</div>'}display.onclick=function(e){e.preventDefault();document.querySelectorAll(".search-select.open").forEach(function(x){if(x!==wrap)x.classList.remove("open")});wrap.classList.toggle("open");search.value="";render();setTimeout(function(){search.focus()},20)};search.oninput=render;opts.onclick=function(e){var b=e.target.closest("[data-value]");if(!b)return;sel.value=b.dataset.value;sel.dispatchEvent(new Event("change",{bubbles:true}));wrap.classList.remove("open");render()};sel.addEventListener("change",render);sel.addEventListener("select-refresh",render);render()})}
document.addEventListener("click",function(e){if(!e.target.closest(".search-select"))document.querySelectorAll(".search-select.open").forEach(function(x){x.classList.remove("open")})});

function updateCustomerDebtInfo(inputId,boxId){var q=val(inputId).trim().toLowerCase();var c=active(state.customers).find(function(x){return x.name.toLowerCase()===q || (x.phone&&x.phone===q)});var box=$(boxId);if(!box)return;if(!c){box.innerHTML="";return}var debt=active(state.debts).filter(function(d){return d.customerId===c.id}).reduce(function(s,d){return s+toNumber(d.remaining)},0);box.innerHTML='<span class="chip '+(debt>0?'danger':'success')+'">دين العميل الحالي: '+money(debt)+'</span>'}
function bindCustomerSuggest(inputId,boxId,phoneId){var inp=$(inputId),box=$(boxId);if(!inp||!box)return;inp.oninput=function(){var q=inp.value.trim().toLowerCase();updateCustomerDebtInfo(inputId,inputId==="invCustomerName"?"invCustomerDebtInfo":"paymentCustomerDebtInfo");if(q.length<2){box.classList.remove("open");box.innerHTML="";return}var list=active(state.customers).filter(function(c){return (c.name+" "+(c.phone||"")).toLowerCase().includes(q)}).slice(0,8);box.innerHTML=list.map(function(c){var debt=active(state.debts).filter(function(d){return d.customerId===c.id}).reduce(function(s,d){return s+toNumber(d.remaining)},0);return '<button type="button" data-customer-pick="'+c.id+'">'+esc(c.name)+' - '+esc(c.phone||"")+' - دين: '+money(debt)+'</button>'}).join("");box.classList.toggle("open",!!list.length)};box.onclick=function(e){var b=e.target.closest("[data-customer-pick]");if(!b)return;var c=active(state.customers).find(function(x){return x.id===b.dataset.customerPick});if(c){inp.value=c.name;if(phoneId)setVal(phoneId,c.phone||"");box.classList.remove("open");updateCustomerDebtInfo(inputId,inputId==="invCustomerName"?"invCustomerDebtInfo":"paymentCustomerDebtInfo");renderPaymentDebtOptions()}}}

function productSalePiece(p){return toNumber(p.salePiecePrice!=null?p.salePiecePrice:p.price)}
function productWholesalePiece(p){return toNumber(p.wholesalePiecePrice!=null?p.wholesalePiecePrice:p.wholesalePrice)}
function productUnitPieces(p){return toNumber(p.unitPieces||0)}
function productHasUnit(p){return !!(p&&p.addMode==="unit"&&productUnitPieces(p)>0&&p.unitName)}
function productPurchaseBaseTotal(){var mode=val("productAddMode"),qty=toNumber(val("productQty"));if(mode==="unit"){var pieces=toNumber(val("productUnitPieces")),unitWholesale=toNumber(val("productUnitWholesale"));return pieces>0?qty*toNumber(val("productWholesalePiece")):qty*unitWholesale}return qty*toNumber(val("productWholesalePiece"))}
function calcDiscount(total){var type=val("productDiscountType"),v=toNumber(val("productDiscountValue"));if(type==="percent")return Math.min(total,total*v/100);if(type==="fixed")return Math.min(total,v);return 0}
function updateProductUnitUI(){if(!$("productAddMode"))return;var mode=val("productAddMode");document.querySelectorAll(".unit-fields").forEach(function(el){el.style.display=mode==="unit"?"grid":"none"});var pieces=toNumber(val("productUnitPieces")),unitW=toNumber(val("productUnitWholesale")),unitS=toNumber(val("productUnitSale"));if(mode==="unit"&&pieces>0){setVal("productCalcWholesalePiece",fmt(unitW/pieces));if(!val("productCalcSalePiece"))setVal("productCalcSalePiece",fmt(unitS/pieces));setVal("productWholesalePiece",fmt(unitW/pieces));if(!val("productSalePiece"))setVal("productSalePiece",fmt(unitS/pieces))}var base=toNumber(val("productQty"))*toNumber(val("productWholesalePiece"));var total=Math.max(0,base-calcDiscount(base));setVal("productPurchaseTotal",money(total))}
function saveProduct(){var id=val("productEditId"),name=val("productName").trim(),barcode=val("productBarcode").trim(),supplier=val("productSupplier").trim(),acc=val("productPurchaseAccount"),mode=val("productAddMode")||"piece",qty=toNumber(val("productQty")),wholesalePiece=toNumber(val("productWholesalePiece")),salePiece=toNumber(val("productSalePiece")),cat=val("productCategory").trim(),min=toNumber(val("productMinQty")||0),unitName=val("productUnitName").trim(),unitPieces=toNumber(val("productUnitPieces")),unitWholesale=toNumber(val("productUnitWholesale")),unitSale=toNumber(val("productUnitSale")),calcSale=toNumber(val("productCalcSalePiece")||salePiece),discountType=val("productDiscountType"),discountValue=toNumber(val("productDiscountValue"));if(!name){toast("اكتب اسم المنتج","warning");return}if(mode==="unit"&&(!unitName||unitPieces<=0)){toast("أكمل بيانات الوحدة","warning");return}(id?getOne("products",id):Promise.resolve(null)).then(function(old){var oldQty=old?toNumber(old.quantity):0;var p=nowBase(Object.assign({},old||{},{id:id||uid("product"),name:name,barcode:barcode,supplierName:supplier,addMode:mode,quantity:qty,wholesalePiecePrice:wholesalePiece,salePiecePrice:mode==="unit"?(calcSale||salePiece):salePiece,price:mode==="unit"?(calcSale||salePiece):salePiece,category:cat,minQuantity:min,unitName:mode==="unit"?unitName:"",unitPieces:mode==="unit"?unitPieces:0,unitWholesalePrice:mode==="unit"?unitWholesale:0,unitSalePrice:mode==="unit"?unitSale:0,discountType:discountType,discountValue:discountValue,createdAt:(old&&old.createdAt)||Date.now()}));return putOne("products",p).then(function(){return queueSync("products",p.id,id?"update":"create",p)}).then(function(){var addedQty=Math.max(0,qty-oldQty);var base=addedQty*wholesalePiece;var total=Math.max(0,base-calcDiscount(base));if(!id&&acc&&total>0){var t=nowBase({id:uid("txn"),accountId:acc,type:"expense",amount:total,date:today(),note:"شراء منتج: "+name+(supplier?" من "+supplier:""),source:"product_purchase",sourceId:p.id});return putOne("transactions",t).then(function(){return queueSync("transactions",t.id,"create",t)})}})}).then(loadAll).then(function(){clearProductForm();renderCurrent();toast("تم حفظ المنتج","success")})}
function clearProductForm(){["productEditId","productName","productBarcode","productSupplier","productQty","productWholesalePiece","productSalePiece","productCategory","productMinQty","productUnitName","productUnitPieces","productUnitWholesale","productUnitSale","productCalcWholesalePiece","productCalcSalePiece","productDiscountValue","productPurchaseTotal"].forEach(function(id){setVal(id,"")});setVal("productAddMode","piece");setVal("productDiscountType","none");updateProductUnitUI()}
function editProduct(id){var p=active(state.products).find(function(x){return x.id===id});if(!p)return;setVal("productEditId",p.id);setVal("productName",p.name||"");setVal("productBarcode",p.barcode||"");setVal("productSupplier",p.supplierName||"");setVal("productAddMode",p.addMode||"piece");setVal("productQty",p.quantity||0);setVal("productWholesalePiece",productWholesalePiece(p));setVal("productSalePiece",productSalePiece(p));setVal("productCategory",p.category||"");setVal("productMinQty",p.minQuantity||0);setVal("productUnitName",p.unitName||"");setVal("productUnitPieces",p.unitPieces||0);setVal("productUnitWholesale",p.unitWholesalePrice||0);setVal("productUnitSale",p.unitSalePrice||0);setVal("productCalcSalePiece",productSalePiece(p));setVal("productDiscountType",p.discountType||"none");setVal("productDiscountValue",p.discountValue||0);updateProductUnitUI();scrollTo({top:0,behavior:"smooth"})}
function renderProducts(){var q=(val("productSearch")||"").toLowerCase();var arr=active(state.products).filter(function(p){return !q||(p.name+" "+p.barcode+" "+p.category+" "+p.supplierName).toLowerCase().includes(q)}).sort(function(a,b){return b.createdAt-a.createdAt});html("productsList",arr.length?tools("productsTable","المنتجات")+table(["المنتج","المورد","الباركود","سعر جملة قطعة","سعر بيع قطعة","الوحدة","المخزون قطع","إجراءات"],arr.map(function(p){var low=toNumber(p.quantity)<=toNumber(p.minQuantity||0);return [esc(p.name),esc(p.supplierName||"-"),esc(p.barcode||"-"),money(productWholesalePiece(p)),money(productSalePiece(p)),productHasUnit(p)?esc(p.unitName+" / "+p.unitPieces+" قطعة"):"قطعة",'<span class="chip '+(low?"danger":"success")+'">'+esc(p.quantity||0)+'</span>','<div class="actions"><button class="btn small ghost" data-edit-product="'+p.id+'">تعديل</button><button class="btn small danger" data-delete="products:'+p.id+'">حذف</button></div>']}),"productsTable"):'<div class="empty">لا توجد منتجات.</div>');document.querySelectorAll("[data-edit-product]").forEach(function(b){b.onclick=function(){editProduct(b.dataset.editProduct)}});bindDelete()}

function addInvoiceItemRow(prefill){prefill=prefill||{};var w=$("invoiceItems");if(!w)return;var row=document.createElement("div");row.className="item-row";row.innerHTML='<label class="wide">الصنف<select class="invoice-product">'+productOptions()+'</select><input class="invoice-custom-name" placeholder="اسم الصنف اليدوي" value="'+esc(prefill.name||"")+'"></label><label>نوع البيع<select class="invoice-sale-mode"><option value="piece">قطعة</option><option value="unit">وحدة</option></select></label><label class="invoice-unit-wrap">اسم الوحدة<select class="invoice-unit-name"></select></label><label>الكمية<input class="invoice-qty" type="number" min="0" step="0.01" value="'+esc(prefill.quantity||1)+'"></label><label>السعر<input class="invoice-price" type="number" min="0" step="0.01" value="'+esc(prefill.price||0)+'"></label><label>المبلغ<input class="invoice-line-total" disabled value="0"></label><button class="btn danger small remove-item" type="button">حذف</button>';w.appendChild(row);var sel=row.querySelector(".invoice-product"),mode=row.querySelector(".invoice-sale-mode");if(prefill.productId)sel.value=prefill.productId;if(prefill.saleMode)mode.value=prefill.saleMode;sel.onchange=function(){invoiceProductChanged(row)};mode.onchange=function(){invoiceProductChanged(row)};row.querySelectorAll(".invoice-qty,.invoice-price").forEach(function(e){e.oninput=calcInvoiceTotal});row.querySelector(".remove-item").onclick=function(){row.remove();calcInvoiceTotal()};invoiceProductChanged(row);calcInvoiceTotal()}
function invoiceProductChanged(row){var sel=row.querySelector(".invoice-product"),mode=row.querySelector(".invoice-sale-mode"),unitWrap=row.querySelector(".invoice-unit-wrap"),unitSelect=row.querySelector(".invoice-unit-name"),p=active(state.products).find(function(x){return x.id===sel.value});if(p){row.querySelector(".invoice-custom-name").value=p.name;if(productHasUnit(p)){unitWrap.style.display="grid";unitSelect.innerHTML='<option value="'+esc(p.unitName)+'">'+esc(p.unitName)+' - '+esc(p.unitPieces)+' قطعة</option>'}else{unitWrap.style.display="none";unitSelect.innerHTML="";mode.value="piece"}if(mode.value==="unit"&&productHasUnit(p)){row.querySelector(".invoice-price").value=toNumber(p.unitSalePrice||0)}else{mode.value="piece";row.querySelector(".invoice-price").value=productSalePiece(p)}}else{unitWrap.style.display="none"}calcInvoiceTotal()}
function calcInvoiceTotal(){var total=0;document.querySelectorAll("#invoiceItems .item-row").forEach(function(row){var q=toNumber(row.querySelector(".invoice-qty").value),pr=toNumber(row.querySelector(".invoice-price").value),line=q*pr;row.querySelector(".invoice-line-total").value=fmt(line);total+=line});text("invoiceTotal",money(total));var paid=toNumber(val("invPaidAmount"));text("invoiceRemaining",money(Math.max(0,total-paid)));return total}
function getInvoiceItems(){return [].slice.call(document.querySelectorAll("#invoiceItems .item-row")).map(function(row){var pid=row.querySelector(".invoice-product").value,p=active(state.products).find(function(x){return x.id===pid}),mode=row.querySelector(".invoice-sale-mode").value,name=row.querySelector(".invoice-custom-name").value.trim()||(p&&p.name)||"صنف",q=toNumber(row.querySelector(".invoice-qty").value),pr=toNumber(row.querySelector(".invoice-price").value),stockQty=(mode==="unit"&&p&&productHasUnit(p))?q*productUnitPieces(p):q;return {productId:pid,name:name,quantity:q,saleMode:mode,unitName:(mode==="unit"&&p)?p.unitName:"",unitPieces:(mode==="unit"&&p)?productUnitPieces(p):1,stockQty:stockQty,price:pr,total:q*pr}}).filter(function(i){return i.quantity>0&&i.name})}
function addProductToCartByBarcode(code){var p=active(state.products).find(function(x){return String(x.barcode||"").trim()===String(code).trim()});if(!p){toast("المنتج غير موجود","danger");return false}if(state.route!=="invoices"){toast("تم قراءة الباركود: "+p.name,"success");return true}addInvoiceItemRow({productId:p.id,name:p.name,price:productSalePiece(p),quantity:1,saleMode:"piece"});toast("تمت إضافة المنتج للسلة","success");return true}
function scanInvoiceProduct(){scanBarcode().then(function(code){if(code)addProductToCartByBarcode(code)})}
function saveInvoice(){var name=val("invCustomerName").trim(),phone=val("invPhone").trim(),date=val("invDate")||today(),paid=toNumber(val("invPaidAmount")),acc=val("invPaidAccount"),items=getInvoiceItems(),total=items.reduce(function(s,i){return s+i.total},0),rem=Math.max(0,total-paid);if(!name||!items.length){toast("أكمل بيانات الفاتورة","warning");return}if(paid>0&&!acc){toast("اختر الحساب الذي دخل عليه المبلغ المدفوع","warning");return}var bad=items.find(function(it){var p=active(state.products).find(function(x){return x.id===it.productId});return p&&toNumber(p.quantity)<toNumber(it.stockQty)});if(bad){toast("الكمية غير كافية للصنف: "+bad.name,"danger");return}upsertCustomer(name,phone).then(function(c){var inv=nowBase({id:uid("invoice"),customerId:c.id,customerName:name,phone:phone,date:date,items:items,total:total,paid:paid,remaining:rem,accountId:acc,qrValue:""});inv.qrValue="INV|"+inv.id+"|"+name+"|"+total+"|"+paid+"|"+rem;return putOne("invoices",inv).then(function(){return queueSync("invoices",inv.id,"create",inv)}).then(function(){state.lastInvoice=inv;var tasks=[];items.forEach(function(it){if(it.productId)tasks.push(getOne("products",it.productId).then(function(p){if(p){p.quantity=Math.max(0,toNumber(p.quantity)-toNumber(it.stockQty||it.quantity));p.updatedAt=Date.now();return putOne("products",p).then(function(){return queueSync("products",p.id,"update",p)})}}))});if(paid>0){var t=nowBase({id:uid("txn"),accountId:acc,type:"income",amount:paid,date:date,note:"دفعة من فاتورة "+name,source:"invoice",sourceId:inv.id});tasks.push(putOne("transactions",t).then(function(){return queueSync("transactions",t.id,"create",t)}));var sale=nowBase({id:uid("sale"),customerId:c.id,name:name,amount:paid,phone:phone,paymentMethod:"account",accountId:acc,source:"invoice",sourceId:inv.id,date:date});tasks.push(putOne("dailySales",sale).then(function(){return queueSync("dailySales",sale.id,"create",sale)}))}if(rem>0){var d=nowBase({id:uid("debt"),customerId:c.id,customerName:name,phone:phone,invoiceId:inv.id,amount:rem,paid:0,remaining:rem,status:"unpaid",date:date,dueDate:"",items:items,source:"invoice"});tasks.push(putOne("debts",d).then(function(){return queueSync("debts",d.id,"create",d)}))}return Promise.all(tasks)})}).then(loadAll).then(function(){clearInvoiceForm();renderCurrent();toast("تم حفظ الفاتورة","success")})}
function renderInvoices(){var q=(val("invoiceSearch")||"").toLowerCase();var arr=active(state.invoices).filter(function(i){return !q||(i.customerName+" "+i.phone).toLowerCase().includes(q)}).sort(function(a,b){return b.createdAt-a.createdAt});html("invoiceList",arr.length?tools("invoicesTable","الكاشير")+table(["العميل","الجوال","التاريخ","الإجمالي","المدفوع","المتبقي","الحساب","إجراءات"],arr.map(function(i){return [esc(i.customerName),esc(i.phone||"-"),i.date||"-",money(i.total),money(i.paid),money(i.remaining),esc(accountName(i.accountId)),'<div class="actions"><button class="btn small ghost" data-customer-view="'+i.customerId+'">عرض العميل</button><button class="btn small ghost" data-print-invoice="'+i.id+'">طباعة حرارية</button><button class="btn small danger" data-delete="invoices:'+i.id+'">حذف مع عكس</button></div>']}),"invoicesTable"):'<div class="empty">لا توجد فواتير.</div>');bindCustomerView();document.querySelectorAll("[data-print-invoice]").forEach(function(b){b.onclick=function(){printInvoice(b.dataset.printInvoice)}});bindDelete()}
function printInvoice(id){var inv=active(state.invoices).find(function(x){return x.id===id});if(!inv)return;var w=window.open("","_blank");w.document.write('<html dir="rtl"><head><title>فاتورة حرارية</title><style>@page{size:58mm auto;margin:2mm}body{font-family:Arial,sans-serif;width:54mm;margin:0 auto;color:#111;font-size:11px}h2{text-align:center;margin:4px 0;font-size:15px}.center{text-align:center}.line{border-top:1px dashed #111;margin:5px 0}table{width:100%;border-collapse:collapse}td,th{padding:2px;text-align:right;vertical-align:top}.total{font-weight:bold;font-size:13px}.barcode{height:34px;background:repeating-linear-gradient(90deg,#111 0 2px,transparent 2px 4px,#111 4px 7px,transparent 7px 10px);margin:6px 0}</style></head><body><h2>'+esc(state.settings.storeName)+'</h2><div class="center">فاتورة كاشير</div><div class="line"></div><div>العميل: '+esc(inv.customerName)+'</div><div>الجوال: '+esc(inv.phone||"-")+'</div><div>التاريخ: '+esc(inv.date)+'</div><div class="line"></div><table><thead><tr><th>الصنف</th><th>ك</th><th>س</th><th>م</th></tr></thead><tbody>'+(inv.items||[]).map(function(i){return '<tr><td>'+esc(i.name)+(i.saleMode==="unit"?' / '+esc(i.unitName):'')+'</td><td>'+esc(i.quantity)+'</td><td>'+fmt(i.price)+'</td><td>'+fmt(i.total)+'</td></tr>'}).join("")+'</tbody></table><div class="line"></div><div class="total">الإجمالي: '+money(inv.total)+'</div><div>المدفوع: '+money(inv.paid)+'</div><div>المتبقي: '+money(inv.remaining)+'</div><div class="barcode"></div><div class="center">'+esc(inv.id)+'</div></body></html>');w.document.close();w.focus();w.print()}
function deleteInvoiceWithRollback(id){if(!confirm("سيتم حذف الفاتورة وإرجاع المخزون وعكس الحركات المالية المرتبطة بها. متابعة؟"))return;getOne("invoices",id).then(function(inv){if(!inv)return;var tasks=[];(inv.items||[]).forEach(function(it){if(it.productId)tasks.push(getOne("products",it.productId).then(function(p){if(p){p.quantity=toNumber(p.quantity)+toNumber(it.stockQty||it.quantity);p.updatedAt=Date.now();return putOne("products",p).then(function(){return queueSync("products",p.id,"update",p)})}}))});["transactions","dailySales"].forEach(function(storeName){active(state[storeName]).filter(function(x){return x.source==="invoice"&&x.sourceId===id}).forEach(function(x){x.isDeleted=true;x.updatedAt=Date.now();tasks.push(putOne(storeName,x).then(function(){return queueSync(storeName,x.id,"delete",x)}))})});var relatedDebts=active(state.debts).filter(function(d){return d.invoiceId===id||d.sourceId===id});relatedDebts.forEach(function(d){d.isDeleted=true;d.updatedAt=Date.now();tasks.push(putOne("debts",d).then(function(){return queueSync("debts",d.id,"delete",d)}));active(state.payments).filter(function(p){return p.debtId===d.id}).forEach(function(p){p.isDeleted=true;p.updatedAt=Date.now();tasks.push(putOne("payments",p).then(function(){return queueSync("payments",p.id,"delete",p)}));active(state.transactions).filter(function(t){return t.source==="payment"&&t.sourceId===p.id}).forEach(function(t){t.isDeleted=true;t.updatedAt=Date.now();tasks.push(putOne("transactions",t).then(function(){return queueSync("transactions",t.id,"delete",t)}))})})});inv.isDeleted=true;inv.updatedAt=Date.now();tasks.push(putOne("invoices",inv).then(function(){return queueSync("invoices",inv.id,"delete",inv)}));return Promise.all(tasks)}).then(loadAll).then(renderCurrent).then(function(){toast("تم حذف الفاتورة وعكسها","success")})}
function bindDelete(){document.querySelectorAll("[data-delete]").forEach(function(b){b.onclick=function(){var p=b.dataset.delete.split(":");if(p[0]==="invoices")deleteInvoiceWithRollback(p[1]);else softDelete(p[0],p[1])}})}

function saveExpense(){var type=val("expenseType").trim(),amount=toNumber(val("expenseAmount")),acc=val("expenseAccount"),date=val("expenseDate")||today(),note=val("expenseNote").trim();if(!type||amount<=0||!acc){toast("أكمل بيانات المصروف","warning");return}var exp=nowBase({id:uid("expense"),type:type,amount:amount,accountId:acc,date:date,note:note});putOne("expenses",exp).then(function(){return queueSync("expenses",exp.id,"create",exp)}).then(function(){var t=nowBase({id:uid("txn"),accountId:acc,type:"expense",amount:amount,date:date,note:"مصروف: "+type+(note?" - "+note:""),source:"expense",sourceId:exp.id});return putOne("transactions",t).then(function(){return queueSync("transactions",t.id,"create",t)})}).then(loadAll).then(function(){["expenseType","expenseAmount","expenseNote"].forEach(function(id){setVal(id,"")});renderCurrent();toast("تم حفظ المصروف","success")})}
function renderExpenses(){var arr=active(state.expenses).sort(function(a,b){return b.createdAt-a.createdAt});html("expensesList",arr.length?tools("expensesTable","المصروفات")+table(["التاريخ","نوع المصروف","المبلغ","الحساب","ملاحظة","إجراءات"],arr.map(function(e){return [e.date,esc(e.type),money(e.amount),esc(accountName(e.accountId)),esc(e.note||"-"),'<button class="btn small danger" data-delete="expenses:'+e.id+'">حذف</button>']}),"expensesTable"):'<div class="empty">لا توجد مصروفات.</div>');bindDelete()}

function scanBarcode(){return new Promise(function(resolve){var modal=document.createElement("div");modal.className="scanner-modal";modal.innerHTML='<div class="scanner-card"><video id="barcodeVideo" playsinline></video><div class="scanner-actions"><button class="btn primary" id="closeScanner" type="button">إغلاق</button><button class="btn ghost" id="manualBarcode" type="button">إدخال يدوي</button></div></div>';document.body.appendChild(modal);var video=modal.querySelector("video"),controls=null,stream=null,closed=false;function close(v){closed=true;try{if(controls)controls.stop()}catch(e){}try{if(stream)stream.getTracks().forEach(function(t){t.stop()})}catch(e){}modal.remove();resolve(v||null)}modal.querySelector("#closeScanner").onclick=function(){close(null)};modal.querySelector("#manualBarcode").onclick=function(){close(prompt("أدخل الباركود يدويًا")||null)};if("BarcodeDetector" in window&&navigator.mediaDevices){navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}}).then(function(s){stream=s;video.srcObject=s;return video.play()}).then(function(){var detector=new BarcodeDetector({formats:["ean_13","ean_8","code_128","code_39","qr_code","upc_a","upc_e"]});function tick(){if(closed)return;detector.detect(video).then(function(codes){if(codes&&codes[0])close(codes[0].rawValue);else requestAnimationFrame(tick)}).catch(function(){requestAnimationFrame(tick)})}tick()}).catch(function(){toast("تعذر فتح الكاميرا. استخدم HTTPS أو الإدخال اليدوي.","danger")});return}if(window.ZXingBrowser&&ZXingBrowser.BrowserMultiFormatReader){var reader=new ZXingBrowser.BrowserMultiFormatReader();reader.decodeFromVideoDevice(null,video,function(result,err,c){controls=c;if(result)close(result.getText())}).catch(function(){toast("تعذر فتح الكاميرا. استخدم HTTPS أو الإدخال اليدوي.","danger")});return}toast("الكاميرا غير متاحة هنا. استخدم جهاز قارئ الباركود أو الإدخال اليدوي.","warning")})}
function initBarcodeWedge(){var buffer="",last=0;document.addEventListener("keydown",function(e){if(e.ctrlKey||e.altKey||e.metaKey)return;var now=Date.now();if(now-last>90)buffer="";last=now;if(e.key==="Enter"){var code=buffer.trim();buffer="";if(code.length>=4){handleScannedBarcode(code);e.preventDefault()}return}if(e.key&&e.key.length===1){buffer+=e.key}})}
function handleScannedBarcode(code){if(state.route==="invoices"){addProductToCartByBarcode(code);return}if(state.route==="products"){setVal("productBarcode",code);toast("تم قراءة الباركود في المنتج","success");return}var p=active(state.products).find(function(x){return String(x.barcode||"").trim()===String(code).trim()});toast(p?"تم قراءة: "+p.name:"المنتج غير موجود","warning")}
document.addEventListener("DOMContentLoaded",initBarcodeWedge);

/* ===== V5 major overrides: unit stock, images, suppliers, reports, mobile P2P cashier ===== */
try{ if(!STORES.includes('suppliers')) STORES.splice(STORES.indexOf('syncQueue'),0,'suppliers'); if(!STORES.includes('supplierPayments')) STORES.splice(STORES.indexOf('syncQueue'),0,'supplierPayments'); }catch(e){}
try{
  if(!routes.some(r=>r.id==='suppliers')) routes.splice(routes.findIndex(r=>r.id==='products'),0,{id:'suppliers',title:'الموردين',subtitle:'أرصدة ودفعات الموردين',icon:'users'});
  if(!routes.some(r=>r.id==='reports')) routes.splice(routes.findIndex(r=>r.id==='settings'),0,{id:'reports',title:'التقارير',subtitle:'الأرباح والمبيعات والمصروفات',icon:'chart'});
  routes.forEach(function(r){ if(r.id==='purchases'){r.title='المشتريات';r.subtitle='يفتح إضافة منتج ومشتريات';} if(r.id==='invoices'){r.title='الكاشير';} });
  bottomIds=["dashboard","invoices","customers","accounts","suppliers","products"];
}catch(e){}

var p2p={pc:null,dc:null,offer:'',lastScan:'',connected:false};
var cashierCart=[];

function supplierName(id){var s=active(state.suppliers||[]).find(x=>x.id===id);return s?s.name:'-'}
function supplierBalance(id){var s=active(state.suppliers||[]).find(x=>x.id===id);var bal=toNumber(s&&s.openingBalance);active(state.purchases||[]).filter(p=>p.supplierId===id).forEach(p=>bal+=toNumber(p.remaining||0));active(state.supplierPayments||[]).filter(p=>p.supplierId===id).forEach(p=>bal-=toNumber(p.amount||0));return bal}
function supplierPurchasesTotal(id){return active(state.purchases||[]).filter(p=>p.supplierId===id).reduce((a,p)=>a+toNumber(p.totalCost),0)}
function supplierOptions(){return active(state.suppliers||[]).map(s=>'<option value="'+s.id+'">'+esc(s.name)+' - رصيد '+money(supplierBalance(s.id))+'</option>').join('')||'<option value="">أضف موردًا أولًا</option>'}
function calcDiscountTotal(base,type,val){val=toNumber(val); if(type==='percent') return Math.max(0,base-(base*val/100)); if(type==='fixed') return Math.max(0,base-val); return base}
function productImg(p){return p&&p.imageUrl?'<img src="'+esc(p.imageUrl)+'" onerror="this.outerHTML=productFallbackIcon()">':productFallbackIcon()}
window.productFallbackIcon=function(){return '<div class="prod-fallback">'+icon('box')+'</div>'}
function productUnitLabel(p){return p&&p.unitName?esc(p.unitName)+' / '+fmt(p.unitPieces)+' قطعة':'لا توجد وحدة'}
function productPieceSale(p){return toNumber(p.salePiecePrice||p.price||0)}
function productPieceCost(p){return toNumber(p.wholesalePiecePrice||0)}
function productUnitSale(p){return toNumber(p.unitSalePrice||productPieceSale(p)*toNumber(p.unitPieces||1))}
function productStockPieces(p){return toNumber(p.quantity||0)}

var oldEnsureDefaults=ensureDefaults;
ensureDefaults=function(){return oldEnsureDefaults().then(function(){return getAll('suppliers').then(function(sups){if(!active(sups).length){var s=nowBase({id:uid('supplier'),name:'مورد عام',phone:'',openingBalance:0,note:''});return putOne('suppliers',s).then(()=>queueSync('suppliers',s.id,'create',s));}})})}

var oldRenderAccountOptions=renderAccountOptions;
renderAccountOptions=function(){oldRenderAccountOptions(); var opts=active(state.accounts).map(function(a){return '<option value="'+a.id+'">'+esc(a.entityName)+' - '+esc(a.accountName)+' - '+money(accountBalance(a.id))+'</option>'}).join('')||'<option value="">أضف حسابًا أولًا</option>'; ['productPurchaseAccount','supplierPaymentAccount','expenseAccount','paymentAccount','invPaidAccount','purchaseAccount'].forEach(function(id){var s=$(id);if(s){var old=s.value;s.innerHTML=opts;if(old)s.value=old}}); var so=supplierOptions(); ['productSupplier','supplierPaymentSupplier'].forEach(function(id){var s=$(id);if(s){var old=s.value;s.innerHTML=so;if(old)s.value=old}})}

templates.invoices=function(){return '<div class="section-head"><div><h3>الكاشير</h3><p>انقر على المنتج أو امسح الباركود. المخزون يحسب بالقطع، والوحدة تخصم عدد قطعها.</p></div><div class="actions"><button class="btn secondary" id="pairMobileBtn">ربط الجوال</button><button class="btn ghost" id="clearInvoiceBtn">تفريغ السلة</button></div></div><div id="p2pPanel" class="p2p-panel hidden"></div><div class="cashier-shell"><div class="card cart-panel"><h3 style="margin-top:0;font-family:Cairo">السلة</h3><div class="form-grid"><label class="suggest-wrap">اسم العميل<input id="invCustomerName" placeholder="اكتب أول حرفين"><div id="invCustomerSuggest" class="suggest-box"></div><div id="invCustomerDebtInfo" style="margin-top:8px"></div></label><label>رقم الجوال<input id="invPhone" inputmode="tel"></label><label>المبلغ المدفوع<input id="invPaidAmount" type="number" min="0" step="0.01" oninput="calcInvoiceTotal()"></label><label>الحساب<select id="invPaidAccount"></select></label><label>التاريخ<input id="invDate" type="date"></label></div><div id="invoiceItems" class="cart-grid"></div><div class="invoice-total"><span>الإجمالي</span><span class="money" id="invoiceTotal">0</span></div><div class="invoice-total"><span>المتبقي كدين</span><span class="money" id="invoiceRemaining">0</span></div><div class="actions" style="margin-top:12px"><button class="btn primary" id="saveInvoiceBtn">حفظ الفاتورة</button><button class="btn ghost" id="printInvoiceBtn">طباعة حرارية</button><button class="btn secondary" id="scanInvoiceBarcodeBtn">كاميرا</button></div></div><div class="card products-panel"><div class="section-head" style="margin-top:0"><div><h3>المنتجات</h3><p>الأكثر طلبًا أولًا، ثم كل المنتجات.</p></div></div><input id="cashierProductSearch" class="cashier-search" placeholder="بحث بالاسم أو الباركود"><h4>الأكثر طلبًا</h4><div id="popularProducts" class="product-pick-grid popular"></div><h4>كل المنتجات</h4><div id="cashierProducts" class="product-pick-grid"></div></div></div><div class="card" style="margin-top:14px"><h3 style="margin-top:0;font-family:Cairo">سجل الكاشير</h3><div class="searchbar"><input id="invoiceSearch" placeholder="بحث"></div><div id="invoiceList"></div></div>'};

templates.products=function(){return '<div class="section-head"><div><h3>إضافة منتج / مشتريات</h3><p>إذا اخترت وحدة، يتم إدخال عدد الوحدات ويُخزن المخزون كقطع تلقائيًا.</p></div></div><div class="grid two-col"><div class="card"><h3 style="margin-top:0;font-family:Cairo">بيانات المنتج</h3><input id="productEditId" type="hidden"><div class="form-grid"><label>اسم المنتج<input id="productName"></label><label>رابط صورة المنتج<input id="productImageUrl" placeholder="https://..."></label><label>الباركود<input id="productBarcode" placeholder="امسح بجهاز الباركود أو اكتب"></label><label>المورد<select id="productSupplier"></select></label><label>الحساب المدفوع منه<select id="productPurchaseAccount"></select></label><label>طريقة الإضافة<select id="productAddMode"><option value="piece">قطعة</option><option value="unit">وحدة</option></select></label><label class="piece-field">عدد القطع<input id="productQty" type="number" min="0" step="0.01"></label><label class="piece-field">سعر الجملة للقطعة<input id="productWholesalePiece" type="number" min="0" step="0.01"></label><label class="piece-field">سعر البيع للقطعة<input id="productSalePiece" type="number" min="0" step="0.01"></label><label class="unit-field">عدد الوحدات<input id="productUnitCount" type="number" min="0" step="0.01"></label><label class="unit-field">اسم الوحدة<input id="productUnitName" placeholder="كرتونة / باكيت"></label><label class="unit-field">كم قطعة في الوحدة<input id="productUnitPieces" type="number" min="0" step="0.01"></label><label class="unit-field">سعر الوحدة جملة<input id="productUnitWholesale" type="number" min="0" step="0.01"></label><label class="unit-field">سعر الوحدة بيع<input id="productUnitSale" type="number" min="0" step="0.01"></label><label class="unit-field">سعر الجملة لكل قطعة<input id="productCalcWholesalePiece" disabled></label><label class="unit-field">سعر البيع لكل قطعة<input id="productCalcSalePiece" type="number" min="0" step="0.01"></label><label>التصنيف<input id="productCategory"></label><label>حد التنبيه<input id="productMinQty" type="number" min="0" step="0.01"></label><label>نوع الخصم<select id="productDiscountType"><option value="none">بدون خصم</option><option value="fixed">خصم ثابت</option><option value="percent">خصم نسبة %</option></select></label><label>قيمة الخصم<input id="productDiscountValue" type="number" min="0" step="0.01"></label><label>المدفوع من المبلغ<input id="productPaidAmount" type="number" min="0" step="0.01"></label><label>إجمالي التكلفة بعد الخصم<input id="productPurchaseTotal" disabled></label><label>الباقي على المورد<input id="productSupplierRemaining" disabled></label></div><div class="actions" style="margin-top:12px"><button class="btn primary" id="saveProductBtn">حفظ المنتج</button><button class="btn ghost" id="clearProductBtn">جديد</button><button class="btn secondary" id="scanProductBarcodeBtn">كاميرا الباركود</button></div></div><div class="card"><div class="searchbar"><input id="productSearch" placeholder="بحث"></div><div id="productsList"></div></div></div>'};

templates.suppliers=function(){return '<div class="section-head"><div><h3>الموردين</h3><p>رصيد افتتاحي، إجمالي مشتريات، ودفعات الموردين.</p></div></div><div class="grid two-col"><div class="card"><h3 style="margin-top:0;font-family:Cairo">إضافة / تعديل مورد</h3><input id="supplierEditId" type="hidden"><div class="form-grid"><label>اسم المورد<input id="supplierName"></label><label>رقم الجوال<input id="supplierPhone"></label><label>رصيد افتتاحي<input id="supplierOpening" type="number" step="0.01"></label><label class="full">ملاحظة<input id="supplierNote"></label></div><div class="actions" style="margin-top:12px"><button class="btn primary" id="saveSupplierBtn">حفظ المورد</button><button class="btn ghost" id="clearSupplierBtn">جديد</button></div><hr style="border:0;border-top:1px solid var(--border);margin:16px 0"><h3 style="font-family:Cairo">سداد دفعة لمورد</h3><div class="form-grid"><label>المورد<select id="supplierPaymentSupplier"></select></label><label>الحساب<select id="supplierPaymentAccount"></select></label><label>المبلغ<input id="supplierPaymentAmount" type="number" step="0.01"></label><label>التاريخ<input id="supplierPaymentDate" type="date"></label><label class="full">ملاحظة<input id="supplierPaymentNote"></label></div><button class="btn secondary" style="margin-top:12px" id="saveSupplierPaymentBtn">حفظ الدفعة</button></div><div class="card"><div class="searchbar"><input id="supplierSearch" placeholder="بحث"></div><div id="suppliersList"></div><div id="supplierPaymentsList" style="margin-top:14px"></div></div></div>'};

templates.reports=function(){return '<div class="section-head"><div><h3>التقارير</h3><p>تقرير شامل للأرباح: البيع - الجملة - المصروفات.</p></div></div><div id="reportsContent"></div>'};

templates.purchases=function(){return templates.products()};

function bindPage(){
 if(state.route==='invoices'){bindCustomerSuggest('invCustomerName','invCustomerSuggest','invPhone');$('pairMobileBtn').onclick=showPairing;$('scanInvoiceBarcodeBtn').onclick=scanInvoiceProduct;$('saveInvoiceBtn').onclick=saveInvoice;$('clearInvoiceBtn').onclick=clearInvoiceForm;$('printInvoiceBtn').onclick=printLastInvoice;$('invoiceSearch').oninput=renderInvoices;$('cashierProductSearch').oninput=renderCashierProducts;$('invCustomerName').addEventListener('input',function(){updateCustomerDebtInfo('invCustomerName','invCustomerDebtInfo')});$('invPaidAmount').addEventListener('input',calcInvoiceTotal)}
 if(state.route==='customers'){$('customerSearch').oninput=renderCustomers;$('saveCustomerBtn').onclick=saveCustomer;$('clearCustomerBtn').onclick=clearCustomerForm}
 if(state.route==='debts'){$('saveManualDebtBtn').onclick=saveManualDebt;$('saveDebtPaymentBtn').onclick=savePayment;$('debtSearch').oninput=renderDebts}
 if(state.route==='accounts'){$('saveAccountBtn').onclick=saveAccount;$('clearAccountBtn').onclick=clearAccountForm;$('accountSearch').oninput=renderAccounts;$('saveTxnBtn').onclick=saveTransaction}
 if(state.route==='payments'){bindCustomerSuggest('paymentCustomerName','paymentCustomerSuggest','paymentPhone');$('savePaymentBtn').onclick=savePayment;$('paymentCustomerName').addEventListener('input',function(){renderPaymentDebtOptions();updateCustomerDebtInfo('paymentCustomerName','paymentCustomerDebtInfo')})}
 if(state.route==='sales'){$('salesDateFilter').onchange=renderSales;$('salesSearch').oninput=renderSales}
 if(state.route==='products'||state.route==='purchases'){$('saveProductBtn').onclick=saveProduct;$('clearProductBtn').onclick=clearProductForm;$('scanProductBarcodeBtn').onclick=function(){scanBarcode().then(function(c){if(c)setVal('productBarcode',c)})};$('productSearch').oninput=renderProducts;['productAddMode','productQty','productWholesalePiece','productSalePiece','productUnitCount','productUnitPieces','productUnitWholesale','productUnitSale','productCalcSalePiece','productDiscountType','productDiscountValue','productPaidAmount'].forEach(function(id){var el=$(id);if(el){el.addEventListener('input',updateProductUnitUI);el.addEventListener('change',updateProductUnitUI)}});updateProductUnitUI()}
 if(state.route==='suppliers'){$('saveSupplierBtn').onclick=saveSupplier;$('clearSupplierBtn').onclick=clearSupplierForm;$('supplierSearch').oninput=renderSuppliers;$('saveSupplierPaymentBtn').onclick=saveSupplierPayment}
 if(state.route==='expenses'){$('saveExpenseBtn').onclick=saveExpense}
 if(state.route==='settings'){hydrateSettings();$('saveSettingsBtn').onclick=saveSettings;$('exportDataBtn').onclick=exportAllJSON;$('clearDataBtn').onclick=clearAllData;$('settingsSyncBtn').onclick=function(){syncNow(false)};$('pullBtn').onclick=function(){pullFirebase().then(loadAll).then(renderCurrent).then(function(){toast('تم سحب البيانات','success')})};$('settingLogoUrl').oninput=function(){var i=$('settingsLogoPreview');if(i)i.src=val('settingLogoUrl')}}
}

function renderCurrent(){applyBrand();if(state.route==='dashboard')renderDashboard();if(state.route==='invoices'){renderAccountOptions();renderCashierProducts();renderCart();renderInvoices();calcInvoiceTotal();renderP2PPanel()}if(state.route==='customers'){renderCustomers()}if(state.route==='debts'){renderManualDebtArea();renderAccountOptions();renderPaymentDebtOptions();renderDebts()}if(state.route==='accounts'){renderAccounts();renderAccountOptions();renderTransactions()}if(state.route==='payments'){renderAccountOptions();renderPaymentDebtOptions();renderPayments()}if(state.route==='sales')renderSales();if(state.route==='products'||state.route==='purchases'){renderAccountOptions();renderSupplierOptions();renderProducts();updateProductUnitUI()}if(state.route==='suppliers'){renderAccountOptions();renderSupplierOptions();renderSuppliers();renderSupplierPayments()}if(state.route==='expenses'){renderAccountOptions();renderExpenses()}if(state.route==='reports')renderReports();if(state.route==='settings'){hydrateSettings(false);renderSyncStatus()}}

function renderSupplierOptions(){var so=supplierOptions();['productSupplier','supplierPaymentSupplier'].forEach(function(id){var s=$(id);if(s){var old=s.value;s.innerHTML=so;if(old)s.value=old}})}
function updateProductUnitUI(){var mode=val('productAddMode')||'piece';document.querySelectorAll('.unit-field').forEach(e=>e.classList.toggle('hidden',mode!=='unit'));document.querySelectorAll('.piece-field').forEach(e=>e.classList.toggle('hidden',mode==='unit'));var total=0, wholesalePiece=0, salePiece=0, remaining=0;if(mode==='unit'){var count=toNumber(val('productUnitCount')), pieces=toNumber(val('productUnitPieces')), uw=toNumber(val('productUnitWholesale')), us=toNumber(val('productUnitSale'));wholesalePiece=pieces?uw/pieces:0;salePiece=pieces?us/pieces:0;if(!$('productCalcSalePiece')._touched){setVal('productCalcSalePiece',fmt(salePiece))}setVal('productCalcWholesalePiece',fmt(wholesalePiece));total=count*uw}else{var q=toNumber(val('productQty'));wholesalePiece=toNumber(val('productWholesalePiece'));salePiece=toNumber(val('productSalePiece'));total=q*wholesalePiece}var el=$('productCalcSalePiece');if(el&&!el._bind){el.addEventListener('input',function(){this._touched=true});el._bind=1}total=calcDiscountTotal(total,val('productDiscountType'),val('productDiscountValue'));remaining=Math.max(0,total-toNumber(val('productPaidAmount')));setVal('productPurchaseTotal',fmt(total));setVal('productSupplierRemaining',fmt(remaining))}
function clearProductForm(){['productEditId','productName','productImageUrl','productBarcode','productQty','productWholesalePiece','productSalePiece','productUnitCount','productUnitName','productUnitPieces','productUnitWholesale','productUnitSale','productCalcWholesalePiece','productCalcSalePiece','productCategory','productMinQty','productDiscountValue','productPaidAmount','productPurchaseTotal','productSupplierRemaining'].forEach(function(id){setVal(id,'')});setVal('productAddMode','piece');setVal('productDiscountType','none');updateProductUnitUI()}
function saveProduct(){var id=val('productEditId'),name=val('productName').trim(),imageUrl=val('productImageUrl').trim(),barcode=val('productBarcode').trim(),supplierId=val('productSupplier'),acc=val('productPurchaseAccount'),mode=val('productAddMode')||'piece',cat=val('productCategory').trim(),min=toNumber(val('productMinQty')||0),discountType=val('productDiscountType'),discountValue=toNumber(val('productDiscountValue')),paid=toNumber(val('productPaidAmount'));if(!name){toast('اكتب اسم المنتج','warning');return}var qtyPieces=0, wholesalePiece=0, salePiece=0, unitName='',unitPieces=0,unitWholesale=0,unitSale=0,totalCost=0;if(mode==='unit'){var count=toNumber(val('productUnitCount'));unitName=val('productUnitName').trim();unitPieces=toNumber(val('productUnitPieces'));unitWholesale=toNumber(val('productUnitWholesale'));unitSale=toNumber(val('productUnitSale'));if(!unitName||unitPieces<=0||count<=0){toast('أكمل بيانات الوحدة وعدد الوحدات','warning');return}qtyPieces=count*unitPieces;wholesalePiece=unitWholesale/unitPieces;salePiece=toNumber(val('productCalcSalePiece'))||(unitSale/unitPieces);totalCost=calcDiscountTotal(count*unitWholesale,discountType,discountValue)}else{qtyPieces=toNumber(val('productQty'));wholesalePiece=toNumber(val('productWholesalePiece'));salePiece=toNumber(val('productSalePiece'));if(qtyPieces<=0){toast('اكتب عدد القطع','warning');return}totalCost=calcDiscountTotal(qtyPieces*wholesalePiece,discountType,discountValue)}var remaining=Math.max(0,totalCost-paid);(id?getOne('products',id):Promise.resolve(null)).then(function(old){var oldQty=old?toNumber(old.quantity):0;var p=nowBase(Object.assign({},old||{},{id:id||uid('product'),name:name,imageUrl:imageUrl,barcode:barcode,supplierId:supplierId,supplierName:supplierName(supplierId),addMode:mode,quantity:id?qtyPieces:qtyPieces,wholesalePiecePrice:wholesalePiece,salePiecePrice:salePiece,price:salePiece,category:cat,minQuantity:min,unitName:unitName,unitPieces:unitPieces,unitWholesalePrice:unitWholesale,unitSalePrice:unitSale,discountType:discountType,discountValue:discountValue,createdAt:(old&&old.createdAt)||Date.now()}));return putOne('products',p).then(()=>queueSync('products',p.id,id?'update':'create',p)).then(function(){var tasks=[];if(!id&&totalCost>0){var pur=nowBase({id:uid('purchase'),supplierId:supplierId,supplierName:supplierName(supplierId),productId:p.id,productName:name,quantity:qtyPieces,unitCount:mode==='unit'?toNumber(val('productUnitCount')):0,unitPieces:unitPieces,unitCost:wholesalePiece,totalCost:totalCost,paid:paid,remaining:remaining,accountId:acc,date:today(),source:'product_add'});tasks.push(putOne('purchases',pur).then(()=>queueSync('purchases',pur.id,'create',pur)));if(paid>0&&acc){var t=nowBase({id:uid('txn'),accountId:acc,type:'expense',amount:paid,date:today(),note:'شراء منتج: '+name,source:'purchase',sourceId:pur.id});tasks.push(putOne('transactions',t).then(()=>queueSync('transactions',t.id,'create',t)))} }return Promise.all(tasks)})}).then(loadAll).then(function(){clearProductForm();renderCurrent();toast('تم حفظ المنتج والمشتريات','success')})}
function editProduct(id){var p=active(state.products).find(x=>x.id===id);if(!p)return;setVal('productEditId',p.id);setVal('productName',p.name||'');setVal('productImageUrl',p.imageUrl||'');setVal('productBarcode',p.barcode||'');setVal('productSupplier',p.supplierId||'');setVal('productPurchaseAccount','');setVal('productAddMode',p.addMode||'piece');setVal('productCategory',p.category||'');setVal('productMinQty',p.minQuantity||0);setVal('productDiscountType',p.discountType||'none');setVal('productDiscountValue',p.discountValue||0);if((p.addMode||'piece')==='unit'){setVal('productUnitCount','');setVal('productUnitName',p.unitName||'');setVal('productUnitPieces',p.unitPieces||0);setVal('productUnitWholesale',p.unitWholesalePrice||0);setVal('productUnitSale',p.unitSalePrice||0);setVal('productCalcSalePiece',p.salePiecePrice||0)}else{setVal('productQty',p.quantity||0);setVal('productWholesalePiece',p.wholesalePiecePrice||0);setVal('productSalePiece',p.salePiecePrice||p.price||0)}updateProductUnitUI();scrollTo({top:0,behavior:'smooth'})}
function renderProducts(){var q=(val('productSearch')||'').toLowerCase();var arr=active(state.products).filter(p=>!q||(p.name+' '+p.barcode+' '+p.category).toLowerCase().includes(q)).sort((a,b)=>b.createdAt-a.createdAt);html('productsList',arr.length?tools('productsTable','المنتجات')+table(['الصورة','المنتج','المورد','المخزون قطع','سعر جملة قطعة','سعر بيع قطعة','الوحدة','إجراءات'],arr.map(function(p){return [productImg(p),esc(p.name),esc(supplierName(p.supplierId)),fmt(p.quantity),money(productPieceCost(p)),money(productPieceSale(p)),productUnitLabel(p),'<div class="actions"><button class="btn small ghost" data-edit-product="'+p.id+'">تعديل</button><button class="btn small danger" data-delete="products:'+p.id+'">حذف</button></div>']}),'productsTable'):'<div class="empty">لا توجد منتجات.</div>');document.querySelectorAll('[data-edit-product]').forEach(b=>b.onclick=function(){editProduct(b.dataset.editProduct)});bindDelete()}

function getPopularProducts(limit){limit=limit||9;var counts={};active(state.invoices).forEach(function(inv){(inv.items||[]).forEach(function(it){if(it.productId)counts[it.productId]=(counts[it.productId]||0)+toNumber(it.stockQty||it.quantity)})});return active(state.products).sort(function(a,b){return (counts[b.id]||0)-(counts[a.id]||0)||b.createdAt-a.createdAt}).slice(0,limit)}
function productPickCard(p){return '<button type="button" class="pick-card" data-pick-product="'+p.id+'"><div class="pick-img">'+productImg(p)+'</div><b>'+esc(p.name)+'</b><small>'+money(productPieceSale(p))+'</small><span>المخزون: '+fmt(p.quantity)+'</span></button>'}
function renderCashierProducts(){var q=(val('cashierProductSearch')||'').toLowerCase();var list=active(state.products).filter(p=>!q||(p.name+' '+p.barcode).toLowerCase().includes(q)).slice(0,80);html('popularProducts',getPopularProducts(window.innerWidth>900?9:6).map(productPickCard).join('')||'<div class="empty">لا توجد منتجات</div>');html('cashierProducts',list.map(productPickCard).join('')||'<div class="empty">لا توجد نتائج</div>');document.querySelectorAll('[data-pick-product]').forEach(function(b){b.onclick=function(){addProductToCart(b.dataset.pickProduct,'piece')}})}
function addProductToCart(productId,mode){var p=active(state.products).find(x=>x.id===productId);if(!p){toast('المنتج غير موجود','danger');sendP2P({type:'miss',code:productId});return}if(cashierCart.some(x=>x.productId===p.id)){toast('المنتج مضاف مسبقًا','warning');sendP2P({type:'notice',message:'المنتج مضاف مسبقًا'});return}mode=mode||'piece';var unitOk=mode==='unit'&&toNumber(p.unitPieces)>0;var item={id:uid('cart'),productId:p.id,name:p.name,imageUrl:p.imageUrl||'',barcode:p.barcode||'',saleMode:unitOk?'unit':'piece',unitName:p.unitName||'',unitPieces:toNumber(p.unitPieces||0),quantity:1,price:unitOk?productUnitSale(p):productPieceSale(p),wholesalePiecePrice:productPieceCost(p),unitSalePrice:productUnitSale(p),pieceSalePrice:productPieceSale(p)};cashierCart.push(item);renderCart();toast('تمت إضافة: '+p.name,'success');pushP2PAll()}
function addProductToCartByBarcode(code){var p=active(state.products).find(x=>String(x.barcode||'').trim()===String(code).trim());if(!p){toast('المنتج غير موجود','danger');sendP2P({type:'miss',code:code});return}addProductToCart(p.id,'piece')}
function renderCart(){var wrap=$('invoiceItems');if(!wrap)return;if(!cashierCart.length){wrap.innerHTML='<div class="empty">السلة فارغة</div>';calcInvoiceTotal();pushP2PAll();return}wrap.innerHTML=cashierCart.map(function(it,idx){var p=active(state.products).find(x=>x.id===it.productId)||{};var unitDisabled=toNumber(p.unitPieces)>0?'':'disabled';return '<div class="cart-card"><div class="cart-prod-img">'+productImg(it)+'</div><div class="cart-info"><b>'+esc(it.name)+'</b><small>مخزون: '+fmt(p.quantity||0)+' قطعة</small></div><label>نوع البيع<select data-cart-mode="'+idx+'"><option value="piece" '+(it.saleMode==='piece'?'selected':'')+'>قطعة</option><option value="unit" '+(it.saleMode==='unit'?'selected':'')+' '+unitDisabled+'>وحدة '+esc(p.unitName||'')+'</option></select></label><label>الكمية<input data-cart-qty="'+idx+'" type="number" min="0" step="0.01" value="'+esc(it.quantity)+'"></label><label>السعر<input data-cart-price="'+idx+'" type="number" min="0" step="0.01" value="'+esc(it.price)+'"></label><div class="cart-total">'+money(cartItemTotal(it))+'</div><button class="btn small danger" data-cart-remove="'+idx+'">حذف</button></div>'}).join('');document.querySelectorAll('[data-cart-mode]').forEach(el=>el.onchange=function(){var i=+this.dataset.cartMode;setCartMode(i,this.value)});document.querySelectorAll('[data-cart-qty]').forEach(el=>el.oninput=function(){cashierCart[+this.dataset.cartQty].quantity=toNumber(this.value);calcInvoiceTotal();pushP2PAll()});document.querySelectorAll('[data-cart-price]').forEach(el=>el.oninput=function(){cashierCart[+this.dataset.cartPrice].price=toNumber(this.value);calcInvoiceTotal();pushP2PAll()});document.querySelectorAll('[data-cart-remove]').forEach(el=>el.onclick=function(){cashierCart.splice(+this.dataset.cartRemove,1);renderCart()});calcInvoiceTotal();pushP2PAll()}
function setCartMode(i,mode){var it=cashierCart[i],p=active(state.products).find(x=>x.id===it.productId)||{};it.saleMode=(mode==='unit'&&toNumber(p.unitPieces)>0)?'unit':'piece';it.price=it.saleMode==='unit'?productUnitSale(p):productPieceSale(p);it.unitPieces=toNumber(p.unitPieces||0);it.unitName=p.unitName||'';renderCart()}
function cartItemStockQty(it){return toNumber(it.quantity)*(it.saleMode==='unit'?toNumber(it.unitPieces||1):1)}
function cartItemTotal(it){return toNumber(it.quantity)*toNumber(it.price)}
function cartItemCost(it){return cartItemStockQty(it)*toNumber(it.wholesalePiecePrice||0)}
function calcInvoiceTotal(){var total=cashierCart.reduce((s,it)=>s+cartItemTotal(it),0);var paid=toNumber(val('invPaidAmount'));text('invoiceTotal',money(total));text('invoiceRemaining',money(Math.max(0,total-paid)));return total}
function getInvoiceItems(){return cashierCart.map(function(it){return {productId:it.productId,name:it.name,imageUrl:it.imageUrl,quantity:toNumber(it.quantity),price:toNumber(it.price),total:cartItemTotal(it),saleMode:it.saleMode,unitName:it.unitName,unitPieces:it.unitPieces,stockQty:cartItemStockQty(it),wholesalePiecePrice:it.wholesalePiecePrice,cost:cartItemCost(it),profit:cartItemTotal(it)-cartItemCost(it)}})}
function clearInvoiceForm(){cashierCart=[];['invCustomerName','invPhone','invPaidAmount'].forEach(id=>setVal(id,''));setDates();renderAccountOptions();renderCart();calcInvoiceTotal();pushP2PAll()}
function saveInvoice(){var name=val('invCustomerName').trim()||'زبون نقدي',phone=val('invPhone').trim(),date=val('invDate')||today(),paid=toNumber(val('invPaidAmount')),acc=val('invPaidAccount'),items=getInvoiceItems(),total=items.reduce((s,i)=>s+i.total,0),cost=items.reduce((s,i)=>s+i.cost,0),profit=total-cost,rem=Math.max(0,total-paid);if(!items.length){toast('السلة فارغة','warning');return}if(paid>0&&!acc){toast('اختر الحساب','warning');return}upsertCustomer(name,phone).then(function(c){var inv=nowBase({id:uid('invoice'),customerId:c.id,customerName:name,phone:phone,date:date,items:items,total:total,paid:paid,remaining:rem,cost:cost,profit:profit,accountId:acc,qrValue:'INV|'+name+'|'+total});return putOne('invoices',inv).then(()=>queueSync('invoices',inv.id,'create',inv)).then(function(){state.lastInvoice=inv;var tasks=[];items.forEach(function(it){tasks.push(getOne('products',it.productId).then(function(p){if(p){p.quantity=Math.max(0,toNumber(p.quantity)-toNumber(it.stockQty));p.updatedAt=Date.now();return putOne('products',p).then(()=>queueSync('products',p.id,'update',p))}}))});if(paid>0){var t=nowBase({id:uid('txn'),accountId:acc,type:'income',amount:paid,date:date,note:'دفعة من فاتورة '+name,source:'invoice',sourceId:inv.id});tasks.push(putOne('transactions',t).then(()=>queueSync('transactions',t.id,'create',t)));var sale=nowBase({id:uid('sale'),customerId:c.id,name:name,amount:paid,phone:phone,paymentMethod:'account',accountId:acc,source:'invoice',sourceId:inv.id,date:date});tasks.push(putOne('dailySales',sale).then(()=>queueSync('dailySales',sale.id,'create',sale)))}if(rem>0){var d=nowBase({id:uid('debt'),customerId:c.id,customerName:name,phone:phone,invoiceId:inv.id,amount:rem,paid:0,remaining:rem,status:'unpaid',date:date,items:items,source:'invoice'});tasks.push(putOne('debts',d).then(()=>queueSync('debts',d.id,'create',d)))}return Promise.all(tasks)})}).then(loadAll).then(function(){clearInvoiceForm();renderCurrent();toast('تم حفظ الفاتورة','success')})}
function renderInvoices(){var q=(val('invoiceSearch')||'').toLowerCase();var arr=active(state.invoices).filter(i=>!q||(i.customerName+' '+i.phone).toLowerCase().includes(q)).sort((a,b)=>b.createdAt-a.createdAt);html('invoiceList',arr.length?tools('invoicesTable','الكاشير')+table(['العميل','التاريخ','الإجمالي','المدفوع','المتبقي','الربح','إجراءات'],arr.map(function(i){return [esc(i.customerName),i.date||'-',money(i.total),money(i.paid),money(i.remaining),money(i.profit||0),'<div class="actions"><button class="btn small ghost" data-print-invoice="'+i.id+'">طباعة</button><button class="btn small danger" data-delete="invoices:'+i.id+'">حذف مع عكس</button></div>']}),'invoicesTable'):'<div class="empty">لا توجد فواتير.</div>');document.querySelectorAll('[data-print-invoice]').forEach(b=>b.onclick=function(){printInvoice(b.dataset.printInvoice)});bindDelete()}

function saveSupplier(){var id=val('supplierEditId'),name=val('supplierName').trim(),phone=val('supplierPhone').trim(),opening=toNumber(val('supplierOpening')),note=val('supplierNote').trim();if(!name){toast('اكتب اسم المورد','warning');return}(id?getOne('suppliers',id):Promise.resolve(null)).then(function(old){var s=nowBase(Object.assign({},old||{},{id:id||uid('supplier'),name:name,phone:phone,openingBalance:opening,note:note,createdAt:(old&&old.createdAt)||Date.now()}));return putOne('suppliers',s).then(()=>queueSync('suppliers',s.id,id?'update':'create',s))}).then(loadAll).then(function(){clearSupplierForm();renderCurrent();toast('تم حفظ المورد','success')})}
function clearSupplierForm(){['supplierEditId','supplierName','supplierPhone','supplierOpening','supplierNote'].forEach(id=>setVal(id,''))}
function editSupplier(id){var s=active(state.suppliers||[]).find(x=>x.id===id);if(!s)return;setVal('supplierEditId',s.id);setVal('supplierName',s.name||'');setVal('supplierPhone',s.phone||'');setVal('supplierOpening',s.openingBalance||0);setVal('supplierNote',s.note||'')}
function renderSuppliers(){var q=(val('supplierSearch')||'').toLowerCase();var arr=active(state.suppliers||[]).filter(s=>!q||(s.name+' '+s.phone).toLowerCase().includes(q));html('suppliersList',arr.length?tools('suppliersTable','الموردين')+table(['المورد','الجوال','رصيد افتتاحي','إجمالي المشتريات','الرصيد الحالي','إجراءات'],arr.map(function(s){return [esc(s.name),esc(s.phone||'-'),money(s.openingBalance),money(supplierPurchasesTotal(s.id)),money(supplierBalance(s.id)),'<div class="actions"><button class="btn small ghost" data-edit-supplier="'+s.id+'">تعديل</button><button class="btn small danger" data-delete="suppliers:'+s.id+'">حذف</button></div>']}),'suppliersTable'):'<div class="empty">لا يوجد موردين.</div>');document.querySelectorAll('[data-edit-supplier]').forEach(b=>b.onclick=function(){editSupplier(b.dataset.editSupplier)});bindDelete()}
function saveSupplierPayment(){var sid=val('supplierPaymentSupplier'),acc=val('supplierPaymentAccount'),amount=toNumber(val('supplierPaymentAmount')),date=val('supplierPaymentDate')||today(),note=val('supplierPaymentNote').trim();if(!sid||!acc||amount<=0){toast('اختر المورد والحساب واكتب المبلغ','warning');return}var sp=nowBase({id:uid('supplierPay'),supplierId:sid,supplierName:supplierName(sid),accountId:acc,amount:amount,date:date,note:note});putOne('supplierPayments',sp).then(()=>queueSync('supplierPayments',sp.id,'create',sp)).then(function(){var t=nowBase({id:uid('txn'),accountId:acc,type:'expense',amount:amount,date:date,note:'سداد مورد: '+supplierName(sid),source:'supplier_payment',sourceId:sp.id});return putOne('transactions',t).then(()=>queueSync('transactions',t.id,'create',t))}).then(loadAll).then(function(){['supplierPaymentAmount','supplierPaymentNote'].forEach(id=>setVal(id,''));renderCurrent();toast('تم سداد المورد','success')})}
function renderSupplierPayments(){var arr=active(state.supplierPayments||[]).sort((a,b)=>b.createdAt-a.createdAt);html('supplierPaymentsList',arr.length?tools('supplierPaymentsTable','دفعات الموردين')+table(['التاريخ','المورد','المبلغ','الحساب','ملاحظة'],arr.map(p=>[p.date,esc(p.supplierName),money(p.amount),esc(accountName(p.accountId)),esc(p.note||'-')]),'supplierPaymentsTable'):'<div class="empty">لا توجد دفعات موردين.</div>')}

function renderReports(){var invoices=active(state.invoices),expenses=active(state.expenses),purchases=active(state.purchases);var sales=invoices.reduce((s,i)=>s+toNumber(i.total),0),cost=invoices.reduce((s,i)=>s+toNumber(i.cost||(i.items||[]).reduce((a,it)=>a+toNumber(it.cost),0)),0),gross=sales-cost,exp=expenses.reduce((s,e)=>s+toNumber(e.amount),0),net=gross-exp;html('reportsContent','<div class="grid cards-6"><div class="card metric"><div class="metric-icon">'+icon('wallet')+'</div><b>'+money(sales)+'</b><span>إجمالي البيع</span></div><div class="card metric"><div class="metric-icon">'+icon('box')+'</div><b>'+money(cost)+'</b><span>تكلفة البضاعة المباعة</span></div><div class="card metric"><div class="metric-icon">'+icon('chart')+'</div><b>'+money(gross)+'</b><span>الربح قبل المصروفات</span></div><div class="card metric"><div class="metric-icon">'+icon('wallet')+'</div><b>'+money(exp)+'</b><span>المصروفات</span></div><div class="card metric"><div class="metric-icon">'+icon('chart')+'</div><b>'+money(net)+'</b><span>صافي الربح</span></div><div class="card metric"><div class="metric-icon">'+icon('debt')+'</div><b>'+money(openDebtTotal())+'</b><span>ديون العملاء</span></div></div><div class="card" style="margin-top:14px"><h3 style="font-family:Cairo;margin-top:0">تقرير الفواتير</h3>'+tools('reportInvoices','تقرير الفواتير')+table(['التاريخ','العميل','المبيعات','التكلفة','الربح','المتبقي'],invoices.map(i=>[i.date,esc(i.customerName),money(i.total),money(i.cost||0),money(i.profit||0),money(i.remaining||0)]),'reportInvoices')+'</div><div class="card" style="margin-top:14px"><h3 style="font-family:Cairo;margin-top:0">المصروفات</h3>'+tools('reportExpenses','تقرير المصروفات')+table(['التاريخ','النوع','المبلغ','الحساب'],expenses.map(e=>[e.date,esc(e.type),money(e.amount),esc(accountName(e.accountId))]),'reportExpenses')+'</div>')}

function initP2P(){if(p2p.pc)try{p2p.pc.close()}catch(e){}p2p.pc=new RTCPeerConnection({iceServers:[]});p2p.dc=p2p.pc.createDataChannel('cashier-mobile');setupP2PChannel(p2p.dc);return p2p.pc.createOffer().then(o=>p2p.pc.setLocalDescription(o)).then(()=>waitIceP2P(p2p.pc)).then(function(){return packP2P(p2p.pc.localDescription)}).then(function(code){p2p.offer=code;renderP2PPanel();return code})}
function setupP2PChannel(ch){p2p.dc=ch;ch.onopen=function(){p2p.connected=true;toast('تم ربط الجوال','success');pushP2PAll();renderP2PPanel()};ch.onclose=function(){p2p.connected=false;renderP2PPanel()};ch.onmessage=function(e){var m={};try{m=JSON.parse(e.data)}catch(_){return}if(m.type==='scan')receiveMobileScan(m.code);if(m.type==='cart:qty'&&cashierCart[m.idx]){cashierCart[m.idx].quantity=toNumber(m.qty);renderCart()}if(m.type==='cart:mode'&&cashierCart[m.idx]){setCartMode(m.idx,m.mode)}if(m.type==='cart:price'&&cashierCart[m.idx]){cashierCart[m.idx].price=toNumber(m.price);renderCart()}if(m.type==='cart:delete'){cashierCart.splice(toNumber(m.idx),1);renderCart()}if(m.type==='cart:clear'){cashierCart=[];renderCart()}if(m.type==='meta:update'){applyMobileMeta(m.meta||{});pushP2PMeta()}if(m.type==='checkout'){applyMobileMeta(m.meta||{});saveInvoice()}if(m.type==='products:get')pushP2PProducts();if(m.type==='cart:get')pushP2PCart();if(m.type==='meta:get')pushP2PMeta()}}
function receiveMobileScan(code){code=String(code||'').trim();if(!code||p2p.lastScan===code)return;p2p.lastScan=code;setTimeout(()=>{if(p2p.lastScan===code)p2p.lastScan=''},700);addProductToCartByBarcode(code);setTimeout(pushP2PAll,100)}
function applyMobileMeta(meta){if(meta.customerName!==undefined)setVal('invCustomerName',meta.customerName);if(meta.phone!==undefined)setVal('invPhone',meta.phone);if(meta.payAmount!==undefined)setVal('invPaidAmount',meta.payAmount);if(meta.accountId!==undefined)setVal('invPaidAccount',meta.accountId);calcInvoiceTotal()}
function showPairing(){var panel=$('p2pPanel');if(panel)panel.classList.remove('hidden');initP2P()}
function renderP2PPanel(){var panel=$('p2pPanel');if(!panel)return;panel.innerHTML='<div class="card p2p-card"><h3 style="font-family:Cairo;margin-top:0">ربط الجوال</h3><p class="muted">افتح <b>mobile-cashier.html</b> على الجوال، الصق رمز الاتصال، ثم الصق كود الجواب هنا. يعمل على نفس الشبكة بدون إنترنت.</p><label>رمز الاتصال<input id="p2pOffer" readonly value="'+esc(p2p.offer||'')+'"></label><div class="actions" style="margin:8px 0"><button class="btn small ghost" id="copyOfferBtn">نسخ رمز الاتصال</button><button class="btn small secondary" id="newOfferBtn">رمز جديد</button></div><label>كود الجواب من الجوال<input id="p2pAnswer" placeholder="الصق كود الجواب"></label><div class="actions" style="margin-top:8px"><button class="btn primary" id="useAnswerBtn">بدء الاتصال</button><span class="chip '+(p2p.connected?'success':'warning')+'">'+(p2p.connected?'متصل':'غير متصل')+'</span></div></div>';$('copyOfferBtn').onclick=function(){var t=$('p2pOffer');t.select();document.execCommand('copy');toast('تم نسخ الرمز')};$('newOfferBtn').onclick=initP2P;$('useAnswerBtn').onclick=function(){useAnswerCode($('p2pAnswer').value)}}
function useAnswerCode(code){code=String(code||'').trim();if(!p2p.pc||!code){toast('أنشئ الرمز والصق كود الجواب','warning');return}unpackP2P(code).then(ans=>p2p.pc.setRemoteDescription(ans)).then(()=>toast('تم إدخال كود الجواب','success')).catch(e=>toast('كود الجواب غير صحيح','danger'))}
function sendP2P(o){try{if(p2p.dc&&p2p.dc.readyState==='open')p2p.dc.send(JSON.stringify(o))}catch(e){}}
function pushP2PProducts(){sendP2P({type:'products',items:active(state.products).map(function(p){return {id:p.id,name:p.name,barcode:p.barcode,imageUrl:p.imageUrl,price:productPieceSale(p),unitName:p.unitName,unitPieces:p.unitPieces,unitSalePrice:productUnitSale(p),stock:p.quantity}}),meta:mobileMeta()})}
function pushP2PCart(){sendP2P({type:'cart',items:cashierCart,total:cashierCart.reduce((s,i)=>s+cartItemTotal(i),0),meta:mobileMeta()})}
function pushP2PMeta(){sendP2P({type:'meta',meta:mobileMeta()})}
function pushP2PAll(){pushP2PProducts();pushP2PCart();pushP2PMeta()}
function mobileMeta(){return {customerName:val('invCustomerName'),phone:val('invPhone'),payAmount:val('invPaidAmount'),accountId:val('invPaidAccount'),accounts:active(state.accounts).map(a=>({id:a.id,name:a.entityName+' - '+a.accountName}))}}
function waitIceP2P(peer){return new Promise(res=>{if(peer.iceGatheringState==='complete')return res();peer.onicegatheringstatechange=()=>{if(peer.iceGatheringState==='complete')res()};setTimeout(res,4200)})}
function b64(bytes){var bin='';for(var i=0;i<bytes.length;i+=0x8000)bin+=String.fromCharCode.apply(null,bytes.subarray(i,i+0x8000));return btoa(bin)}
function bytes(s){var bin=atob(s),a=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);return a}
function packP2P(o){var raw=new TextEncoder().encode(JSON.stringify(o));try{if(!window.CompressionStream)throw 0;var cs=new CompressionStream('gzip'),w=cs.writable.getWriter();w.write(raw);w.close();return new Response(cs.readable).arrayBuffer().then(buf=>'GZ:'+b64(new Uint8Array(buf)))}catch(e){return Promise.resolve('B64:'+btoa(unescape(encodeURIComponent(JSON.stringify(o)))))}}
function unpackP2P(s){s=String(s||'').trim();if(s.startsWith('GZ:')){var ds=new DecompressionStream('gzip'),w=ds.writable.getWriter();w.write(bytes(s.slice(3)));w.close();return new Response(ds.readable).text().then(JSON.parse)}if(s.startsWith('B64:'))s=s.slice(4);return Promise.resolve(JSON.parse(decodeURIComponent(escape(atob(s)))))}

function initBarcodeWedgeV5(){var buffer='',last=0;document.addEventListener('keydown',function(e){if(e.ctrlKey||e.altKey||e.metaKey)return;var now=Date.now();if(now-last>90)buffer='';last=now;if(e.key==='Enter'){var code=buffer.trim();buffer='';if(code.length>=4){handleScannedBarcode(code);e.preventDefault()}return}if(e.key&&e.key.length===1)buffer+=e.key})}
initBarcodeWedgeV5();


/* ===== V6 final user fixes: tiny product images, invoices archive, thermal image, no full product list ===== */
try{
  if(!routes.some(function(r){return r.id==='invoiceArchive'})){
    var ix=routes.findIndex(function(r){return r.id==='customers'});
    routes.splice(ix<0?2:ix,0,{id:'invoiceArchive',title:'الفواتير',subtitle:'أرشيف الفواتير والطباعة الحرارية',icon:'receipt'});
  }
}catch(e){}

productImg=function(p){
  return p&&p.imageUrl?'<img class="product-image" src="'+esc(p.imageUrl)+'" loading="lazy" decoding="async" onerror="this.outerHTML=productFallbackIcon()">':productFallbackIcon();
};
function productThumb(p){return '<div class="prod-table-img">'+productImg(p)+'</div>'}

/* الكاشير: الأكثر طلبًا فقط، والبحث يعرض نتائج ضمن نفس القسم بدون عرض كل المنتجات */
templates.invoices=function(){return '<div class="section-head"><div><h3>الكاشير</h3><p>انقر على المنتج أو امسح الباركود. المنتجات المعروضة هنا هي الأكثر طلبًا، والبحث يظهر النتائج فورًا.</p></div><div class="actions"><button class="btn secondary" id="pairMobileBtn">ربط الجوال</button><button class="btn ghost" id="clearInvoiceBtn">تفريغ السلة</button></div></div><div id="p2pPanel" class="p2p-panel hidden"></div><div class="cashier-shell"><div class="card cart-panel"><h3 style="margin-top:0;font-family:Cairo">السلة</h3><div class="form-grid"><label class="suggest-wrap">اسم العميل<input id="invCustomerName" placeholder="اكتب أول حرفين"><div id="invCustomerSuggest" class="suggest-box"></div><div id="invCustomerDebtInfo" style="margin-top:8px"></div></label><label>رقم الجوال<input id="invPhone" inputmode="tel"></label><label>المبلغ المدفوع<input id="invPaidAmount" type="number" min="0" step="0.01" oninput="calcInvoiceTotal()"></label><label>الحساب<select id="invPaidAccount"></select></label><label>التاريخ<input id="invDate" type="date"></label></div><div id="invoiceItems" class="cart-grid"></div><div class="invoice-total"><span>الإجمالي</span><span class="money" id="invoiceTotal">0</span></div><div class="invoice-total"><span>المتبقي كدين</span><span class="money" id="invoiceRemaining">0</span></div><div class="actions" style="margin-top:12px"><button class="btn primary" id="saveInvoiceBtn">حفظ الفاتورة</button><button class="btn ghost" id="printInvoiceBtn">طباعة حرارية</button><button class="btn secondary" id="scanInvoiceBarcodeBtn">كاميرا</button></div></div><div class="card products-panel"><div class="section-head" style="margin-top:0"><div><h3>الأكثر طلبًا</h3><p id="cashierProductsHint">اضغط على المنتج لإضافته للسلة.</p></div></div><input id="cashierProductSearch" class="cashier-search" placeholder="بحث بالاسم أو الباركود"><div id="popularProducts" class="product-pick-grid popular"></div><h4 class="all-products-title">كل المنتجات</h4><div id="cashierProducts" class="product-pick-grid"></div></div></div>'};

templates.invoiceArchive=function(){return '<div class="section-head"><div><h3>الفواتير</h3><p>أرشيف كل الفواتير مع الطباعة الحرارية وتحميل الفاتورة كصورة.</p></div><button class="btn primary" data-nav="invoices">فتح الكاشير</button></div><div class="card invoice-archive-card"><div class="searchbar"><input id="invoiceSearch" placeholder="بحث باسم العميل أو رقم الجوال أو التاريخ"></div><div id="invoiceList"></div></div>'};

var oldBindPageV6=bindPage;
bindPage=function(){oldBindPageV6(); if(state.route==='invoiceArchive'){var s=$('invoiceSearch'); if(s) s.oninput=renderInvoices;}};
var oldRenderCurrentV6=renderCurrent;
renderCurrent=function(){oldRenderCurrentV6(); if(state.route==='invoiceArchive')renderInvoices();};

renderCashierProducts=function(){
  var q=(val('cashierProductSearch')||'').trim().toLowerCase();
  var limit=window.innerWidth>900?9:6;
  var list=q?active(state.products).filter(function(p){return (p.name+' '+(p.barcode||'')+' '+(p.category||'')).toLowerCase().includes(q)}).slice(0,limit):getPopularProducts(limit);
  html('popularProducts',list.map(productPickCard).join('')||'<div class="empty">لا توجد منتجات</div>');
  html('cashierProducts','');
  var hint=$('cashierProductsHint'); if(hint) hint.textContent=q?'نتائج البحث، اضغط على المنتج لإضافته للسلة.':'اضغط على المنتج لإضافته للسلة.';
  document.querySelectorAll('[data-pick-product]').forEach(function(b){b.onclick=function(){addProductToCart(b.dataset.pickProduct,'piece')}});
};

renderProducts=function(){
  var q=(val('productSearch')||'').toLowerCase();
  var arr=active(state.products).filter(function(p){return !q||(p.name+' '+(p.barcode||'')+' '+(p.category||'')+' '+supplierName(p.supplierId)).toLowerCase().includes(q)}).sort(function(a,b){return b.createdAt-a.createdAt});
  html('productsList',arr.length?tools('productsTable','المنتجات')+table(['الصورة','المنتج','المورد','المخزون قطع','سعر جملة قطعة','سعر بيع قطعة','الوحدة','إجراءات'],arr.map(function(p){return [productThumb(p),esc(p.name),esc(supplierName(p.supplierId)),fmt(p.quantity),money(productPieceCost(p)),money(productPieceSale(p)),productUnitLabel(p),'<div class="actions"><button class="btn small ghost" data-edit-product="'+p.id+'">تعديل</button><button class="btn small danger" data-delete="products:'+p.id+'">حذف</button></div>']}),'productsTable'):'<div class="empty">لا توجد منتجات.</div>');
  document.querySelectorAll('[data-edit-product]').forEach(function(b){b.onclick=function(){editProduct(b.dataset.editProduct)}});bindDelete();
};

function receiptHTML(inv){
  inv=inv||{}; var items=inv.items||[];
  return '<div class="receipt-thermal" id="thermalReceipt_'+esc(inv.id||'')+'"><div class="rt-head"><div class="rt-store">'+esc((state.settings&&state.settings.storeName)||'نظام إدارة المبيعات')+'</div><div class="rt-meta">فاتورة حرارية<br>رقم: '+esc(inv.id||'-')+'<br>التاريخ: '+esc(inv.date||'-')+'<br>العميل: '+esc(inv.customerName||'زبون نقدي')+' '+(inv.phone?'<br>جوال: '+esc(inv.phone):'')+'</div></div><table><thead><tr><th>الصنف</th><th class="num">كمية</th><th class="num">سعر</th><th class="num">الإجمالي</th></tr></thead><tbody>'+items.map(function(it){return '<tr><td>'+esc(it.name||'-')+(it.saleMode==='unit'?'<br><small>وحدة: '+esc(it.unitName||'')+'</small>':'')+'</td><td class="num">'+fmt(it.quantity)+'</td><td class="num">'+fmt(it.price)+'</td><td class="num">'+fmt(it.total)+'</td></tr>'}).join('')+'</tbody></table><div class="rt-total"><span>الإجمالي</span><span>'+money(inv.total||0)+'</span></div><div class="rt-total"><span>المدفوع</span><span>'+money(inv.paid||0)+'</span></div><div class="rt-total"><span>المتبقي</span><span>'+money(inv.remaining||0)+'</span></div><div class="rt-foot">شكرًا لتعاملكم معنا</div></div>';
}

printInvoice=function(id){
  var inv=active(state.invoices).find(function(x){return x.id===id}); if(!inv){toast('الفاتورة غير موجودة','warning');return}
  var w=window.open('','_blank');
  w.document.write('<html dir="rtl"><head><title>فاتورة حرارية</title><style>body{margin:0;background:#fff;color:#111;font-family:Arial,Tahoma,sans-serif}.receipt-thermal{width:80mm;max-width:80mm;padding:8px;box-sizing:border-box}.rt-head{text-align:center;border-bottom:1px dashed #111;padding-bottom:6px;margin-bottom:6px}.rt-store{font-weight:900;font-size:18px}.rt-meta{font-size:11px;line-height:1.6}table{width:100%;border-collapse:collapse;font-size:11px}th,td{border-bottom:1px dashed #aaa;padding:4px 2px;text-align:right;vertical-align:top}.num{text-align:left;direction:ltr}.rt-total{border-top:1px dashed #111;margin-top:6px;padding-top:5px;font-weight:900;font-size:13px;display:flex;justify-content:space-between}.rt-foot{text-align:center;font-size:11px;margin-top:8px;border-top:1px dashed #111;padding-top:6px}@page{size:80mm auto;margin:0}</style></head><body>'+receiptHTML(inv)+'</body></html>');
  w.document.close(); setTimeout(function(){w.print()},250);
};
printLastInvoice=function(){var inv=state.lastInvoice||active(state.invoices).sort(function(a,b){return b.createdAt-a.createdAt})[0]; if(inv)printInvoice(inv.id); else toast('لا توجد فاتورة','warning')};

function downloadInvoiceImage(id){
  var inv=active(state.invoices).find(function(x){return x.id===id}); if(!inv){toast('الفاتورة غير موجودة','warning');return}
  if(!window.html2canvas){toast('تحميل الصورة يحتاج اتصالًا لتحميل المكتبة أول مرة','warning');return}
  var wrap=document.createElement('div'); wrap.style.position='fixed'; wrap.style.left='-9999px'; wrap.style.top='0'; wrap.innerHTML=receiptHTML(inv); document.body.appendChild(wrap);
  html2canvas(wrap.querySelector('.receipt-thermal'),{backgroundColor:'#ffffff',scale:3}).then(function(canvas){var a=document.createElement('a');a.href=canvas.toDataURL('image/png');a.download='invoice-'+(inv.id||Date.now())+'.png';a.click();wrap.remove()}).catch(function(){wrap.remove();toast('تعذر إنشاء الصورة','danger')});
}

renderInvoices=function(){
  var q=(val('invoiceSearch')||'').toLowerCase();
  var arr=active(state.invoices).filter(function(i){return !q||(String(i.customerName||'')+' '+String(i.phone||'')+' '+String(i.date||'')).toLowerCase().includes(q)}).sort(function(a,b){return b.createdAt-a.createdAt});
  html('invoiceList',arr.length?tools('invoicesTable','الفواتير')+table(['العميل','التاريخ','الإجمالي','المدفوع','المتبقي','الربح','إجراءات'],arr.map(function(i){return [esc(i.customerName),i.date||'-',money(i.total),money(i.paid),money(i.remaining),money(i.profit||0),'<div class="invoice-tools-v6"><button class="btn small ghost" data-print-invoice="'+i.id+'">طباعة حرارية</button><button class="btn small secondary" data-image-invoice="'+i.id+'">صورة</button><button class="btn small danger" data-delete="invoices:'+i.id+'">حذف مع عكس</button></div>']}),'invoicesTable'):'<div class="empty">لا توجد فواتير.</div>');
  document.querySelectorAll('[data-print-invoice]').forEach(function(b){b.onclick=function(){printInvoice(b.dataset.printInvoice)}});
  document.querySelectorAll('[data-image-invoice]').forEach(function(b){b.onclick=function(){downloadInvoiceImage(b.dataset.imageInvoice)}});
  bindDelete();
};


/* ===== V7 accounting + dropdown final fixes ===== */
try{ if(!STORES.includes('suppliers')) STORES.splice(STORES.indexOf('syncQueue'),0,'suppliers'); if(!STORES.includes('supplierPayments')) STORES.splice(STORES.indexOf('syncQueue'),0,'supplierPayments'); }catch(e){}
state.suppliers=state.suppliers||[]; state.supplierPayments=state.supplierPayments||[];

/* كل القوائم المنسدلة تتحول لقائمة احترافية فيها بحث، حتى لو نسينا data-search */
enhanceSearchSelects=function(){
  document.querySelectorAll('select').forEach(function(sel){
    if(sel.closest('.smart-select')) return;
    if(sel.dataset.enhanced==='1'){refreshSearchSelect(sel);return}
    sel.dataset.enhanced='1';
    sel.classList.add('hidden');
    var wrap=document.createElement('div');wrap.className='smart-select';
    var btn=document.createElement('button');btn.type='button';btn.className='smart-select-btn';
    var menu=document.createElement('div');menu.className='smart-select-menu';
    var input=document.createElement('input');input.type='search';input.placeholder='بحث...';
    var list=document.createElement('div');list.className='smart-select-list';
    menu.appendChild(input);menu.appendChild(list);wrap.appendChild(btn);wrap.appendChild(menu);sel.after(wrap);
    sel._smart={wrap:wrap,btn:btn,input:input,list:list};
    btn.onclick=function(ev){ev.preventDefault();ev.stopPropagation();document.querySelectorAll('.smart-select.open').forEach(function(x){if(x!==wrap)x.classList.remove('open')});wrap.classList.toggle('open');input.value='';refreshSearchSelect(sel);setTimeout(function(){input.focus()},30)};
    input.onclick=function(ev){ev.stopPropagation()};
    input.oninput=function(){refreshSearchSelect(sel)};
    list.onclick=function(e){var opt=e.target.closest('[data-value]');if(!opt)return;sel.value=opt.dataset.value;sel.dispatchEvent(new Event('change',{bubbles:true}));wrap.classList.remove('open');refreshSearchSelect(sel);setTimeout(renderCurrentSafe,0)};
    sel.addEventListener('change',function(){refreshSearchSelect(sel)});
    new MutationObserver(function(){refreshSearchSelect(sel)}).observe(sel,{childList:true,subtree:true,attributes:true});
    refreshSearchSelect(sel);
  });
};
function renderCurrentSafe(){try{ if(state.route==='debts'){renderManualDebtArea();renderAccountOptions();renderPaymentDebtOptions();renderDebts()} if(state.route==='products'||state.route==='purchases'){renderAccountOptions();renderSupplierOptions()} if(state.route==='suppliers'){renderAccountOptions();renderSupplierOptions()} }catch(e){} try{enhanceSearchSelects()}catch(e){} }

/* فتح القوائم فوق كل شيء */
(function(){var st=document.createElement('style');st.id='v7-dropdown-accounting-fix';st.textContent='.smart-select{position:relative!important;z-index:20}.smart-select.open{z-index:9999!important}.smart-select-menu{z-index:10000!important;max-height:320px;overflow:hidden}.smart-select-list{max-height:250px;overflow:auto}.smart-select-btn{cursor:pointer}.account-negative{color:#dc2626!important;font-weight:900}.account-positive{color:#16a34a!important;font-weight:900}';document.head.appendChild(st)})();

function transactionExists(source,sourceId){return active(state.transactions||[]).some(function(t){return t.source===source && t.sourceId===sourceId})}

/* مراجعة رصيد الحسابات: يسمح بالسالب ويعالج أي حركة محفوظة بدون transaction */
accountBalance=function(id){
  var acc=active(state.accounts||[]).find(function(a){return a.id===id});
  var bal=toNumber(acc&&acc.openingBalance);
  active(state.transactions||[]).filter(function(t){return t.accountId===id}).forEach(function(t){bal += t.type==='income'?toNumber(t.amount):-toNumber(t.amount)});
  active(state.purchases||[]).filter(function(p){return p.accountId===id && toNumber(p.paid)>0 && !transactionExists('purchase',p.id)}).forEach(function(p){bal -= toNumber(p.paid)});
  active(state.supplierPayments||[]).filter(function(p){return p.accountId===id && !transactionExists('supplier_payment',p.id)}).forEach(function(p){bal -= toNumber(p.amount)});
  active(state.payments||[]).filter(function(p){return p.accountId===id && !transactionExists('payment',p.id)}).forEach(function(p){bal += toNumber(p.amount)});
  active(state.invoices||[]).filter(function(i){return i.accountId===id && toNumber(i.paid)>0 && !transactionExists('invoice',i.id)}).forEach(function(i){bal += toNumber(i.paid)});
  active(state.expenses||[]).filter(function(e){return e.accountId===id && !transactionExists('expense',e.id)}).forEach(function(e){bal -= toNumber(e.amount)});
  return bal;
};

supplierPurchasesTotal=function(id){return active(state.purchases||[]).filter(function(p){return p.supplierId===id}).reduce(function(s,p){return s+toNumber(p.totalCost)},0)};
supplierBalance=function(id){var s=active(state.suppliers||[]).find(function(x){return x.id===id});var bal=toNumber(s&&s.openingBalance);active(state.purchases||[]).filter(function(p){return p.supplierId===id}).forEach(function(p){bal+=toNumber(p.remaining)});active(state.supplierPayments||[]).filter(function(p){return p.supplierId===id}).forEach(function(p){bal-=toNumber(p.amount)});return bal};

supplierOptions=function(){var list=active(state.suppliers||[]);return list.length?list.map(function(s){return '<option value="'+s.id+'">'+esc(s.name)+' - رصيد '+money(supplierBalance(s.id))+'</option>'}).join(''):'<option value="">مورد عام</option>'};
renderSupplierOptions=function(){var so=supplierOptions();['productSupplier','supplierPaymentSupplier'].forEach(function(id){var s=$(id);if(s){var old=s.value;s.innerHTML=so;if(old&&Array.prototype.some.call(s.options,function(o){return o.value===old}))s.value=old;refreshSearchSelect(s)}})};
renderAccountOptions=function(){var opts=active(state.accounts||[]).map(function(a){var b=accountBalance(a.id);return '<option value="'+a.id+'">'+esc(a.entityName)+' - '+esc(a.accountName)+' - '+money(b)+'</option>'}).join('')||'<option value="">أضف حسابًا أولًا</option>';['invPaidAccount','paymentAccount','purchaseAccount','txnAccount','productPurchaseAccount','supplierPaymentAccount','expenseAccount'].forEach(function(id){var s=$(id);if(s){var old=s.value;s.innerHTML=opts;if(old&&Array.prototype.some.call(s.options,function(o){return o.value===old}))s.value=old;refreshSearchSelect(s)}})};

/* دين الديون: إعادة تعبئة القوائم في صفحة الديون مع فتح مضمون */
renderManualDebtArea=function(){var s=$('manualDebtCustomer');if(!s)return;var old=s.value;var arr=active(state.customers||[]);s.innerHTML=arr.length?arr.map(function(c){return '<option value="'+c.id+'">'+esc(c.name)+' - '+esc(c.phone||'')+'</option>'}).join(''):'<option value="">أضف عميلًا أولًا</option>';if(old)s.value=old;refreshSearchSelect(s)};
renderPaymentDebtOptions=function(){var selects=[];if($('paymentDebt'))selects.push($('paymentDebt'));if($('customerPaymentDebt'))selects.push($('customerPaymentDebt'));if(!selects.length)return;var name=(val('paymentCustomerName')||'').trim().toLowerCase();var debts=active(state.debts||[]).filter(function(d){return toNumber(d.remaining)>0 && (!name||String(d.customerName||'').toLowerCase().includes(name))});var htmlOpts=debts.length?debts.map(function(d){return '<option value="'+d.id+'">'+esc(d.customerName)+' - المتبقي '+money(d.remaining)+'</option>'}).join(''):'<option value="">لا توجد ديون مفتوحة</option>';selects.forEach(function(s){var old=s.value;s.innerHTML=htmlOpts;if(old)s.value=old;refreshSearchSelect(s)})};

/* حفظ المنتج: يثبت أثر المورد والحساب دائمًا. الحساب ينزل بالسالب عادي. */
saveProduct=function(){
  var id=val('productEditId'),name=val('productName').trim(),imageUrl=val('productImageUrl').trim(),barcode=val('productBarcode').trim();
  var supplierId=val('productSupplier') || ((active(state.suppliers||[])[0]||{}).id||'');
  var acc=val('productPurchaseAccount'),mode=val('productAddMode')||'piece',cat=val('productCategory').trim(),min=toNumber(val('productMinQty')||0),discountType=val('productDiscountType'),discountValue=toNumber(val('productDiscountValue')),paid=toNumber(val('productPaidAmount'));
  if(!name){toast('اكتب اسم المنتج','warning');return}
  var qtyPieces=0, wholesalePiece=0, salePiece=0, unitName='',unitPieces=0,unitWholesale=0,unitSale=0,totalCost=0;
  if(mode==='unit'){
    var count=toNumber(val('productUnitCount'));unitName=val('productUnitName').trim();unitPieces=toNumber(val('productUnitPieces'));unitWholesale=toNumber(val('productUnitWholesale'));unitSale=toNumber(val('productUnitSale'));
    if(!unitName||unitPieces<=0||count<=0){toast('أكمل بيانات الوحدة وعدد الوحدات','warning');return}
    qtyPieces=count*unitPieces;wholesalePiece=unitWholesale/unitPieces;salePiece=toNumber(val('productCalcSalePiece'))||(unitSale/unitPieces);totalCost=calcDiscountTotal(count*unitWholesale,discountType,discountValue);
  }else{
    qtyPieces=toNumber(val('productQty'));wholesalePiece=toNumber(val('productWholesalePiece'));salePiece=toNumber(val('productSalePiece'));
    if(qtyPieces<=0){toast('اكتب عدد القطع','warning');return}
    totalCost=calcDiscountTotal(qtyPieces*wholesalePiece,discountType,discountValue);
  }
  if(paid>0 && !acc){toast('اختر الحساب الذي سينخصم منه المدفوع','warning');return}
  if(paid<0)paid=0; if(paid>totalCost) paid=totalCost;
  var remaining=Math.max(0,totalCost-paid);
  (id?getOne('products',id):Promise.resolve(null)).then(function(old){
    var p=nowBase(Object.assign({},old||{},{id:id||uid('product'),name:name,imageUrl:imageUrl,barcode:barcode,supplierId:supplierId,supplierName:supplierName(supplierId),addMode:mode,quantity:qtyPieces,wholesalePiecePrice:wholesalePiece,salePiecePrice:salePiece,price:salePiece,category:cat,minQuantity:min,unitName:unitName,unitPieces:unitPieces,unitWholesalePrice:unitWholesale,unitSalePrice:unitSale,discountType:discountType,discountValue:discountValue,totalPurchaseCost:totalCost,purchasePaid:paid,purchaseRemaining:remaining,purchaseAccountId:acc,createdAt:(old&&old.createdAt)||Date.now()}));
    return putOne('products',p).then(function(){return queueSync('products',p.id,id?'update':'create',p)}).then(function(){
      var tasks=[];
      if(!id&&totalCost>0){
        var pur=nowBase({id:uid('purchase'),supplierId:supplierId,supplierName:supplierName(supplierId),productId:p.id,productName:name,quantity:qtyPieces,unitCount:mode==='unit'?toNumber(val('productUnitCount')):0,unitPieces:unitPieces,unitCost:wholesalePiece,totalCost:totalCost,paid:paid,remaining:remaining,accountId:acc,date:today(),source:'product_add'});
        tasks.push(putOne('purchases',pur).then(function(){return queueSync('purchases',pur.id,'create',pur)}));
        if(paid>0&&acc){var t=nowBase({id:uid('txn'),accountId:acc,type:'expense',amount:paid,date:today(),note:'شراء منتج: '+name,source:'purchase',sourceId:pur.id});tasks.push(putOne('transactions',t).then(function(){return queueSync('transactions',t.id,'create',t)}))}
      }
      return Promise.all(tasks)
    })
  }).then(loadAll).then(function(){clearProductForm();renderCurrent();toast('تم حفظ المنتج وتحديث رصيد المورد والحساب','success')})
};

/* ترميم المنتجات التي تمت إضافتها سابقًا بدون مشتريات: يضيف دينًا على المورد فقط حتى تظهر الأرصدة */
function repairMissingProductPurchases(){
  var products=active(state.products||[]), purchases=active(state.purchases||[]), tasks=[];
  products.forEach(function(p){
    if(!p.id) return;
    var exists=purchases.some(function(x){return x.productId===p.id && (x.source==='product_add'||x.source==='product_repair')});
    if(exists) return;
    var sid=p.supplierId || ((active(state.suppliers||[])[0]||{}).id||'');
    var total=toNumber(p.totalPurchaseCost) || (toNumber(p.quantity)*toNumber(productPieceCost(p)));
    if(!sid || total<=0) return;
    var pur=nowBase({id:uid('purchase'),supplierId:sid,supplierName:supplierName(sid),productId:p.id,productName:p.name,quantity:toNumber(p.quantity),unitCount:0,unitPieces:toNumber(p.unitPieces||0),unitCost:toNumber(productPieceCost(p)),totalCost:total,paid:0,remaining:total,accountId:'',date:p.createdAt?new Date(p.createdAt).toISOString().slice(0,10):today(),source:'product_repair'});
    tasks.push(putOne('purchases',pur).then(function(){return queueSync('purchases',pur.id,'create',pur)}));
  });
  return Promise.all(tasks);
}
var oldRenderCurrentV7=renderCurrent;
renderCurrent=function(){oldRenderCurrentV7(); try{if(state.route==='accounts'){renderAccounts();renderTransactions()} if(state.route==='suppliers'){renderSuppliers();renderSupplierPayments()} enhanceSearchSelects()}catch(e){}};
var oldBootLoadFix=loadAll;
loadAll=function(){return oldBootLoadFix().then(function(){state.suppliers=state.suppliers||[];state.supplierPayments=state.supplierPayments||[]})};
setTimeout(function(){loadAll().then(repairMissingProductPurchases).then(loadAll).then(function(){try{renderCurrent()}catch(e){}})},1500);

/* عرض الحسابات بألوان توضح السالب */
renderAccounts=function(){var q=(val('accountSearch')||'').trim().toLowerCase();var arr=active(state.accounts||[]).filter(function(a){return !q||(a.entityName+' '+a.accountName).toLowerCase().includes(q)}).sort(function(a,b){return b.createdAt-a.createdAt});html('accountsList',arr.length?tools('accountsTable','الحسابات')+table(['الجهة','الحساب','رصيد افتتاحي','الرصيد الحالي','النوع','إجراءات'],arr.map(function(a){var b=accountBalance(a.id);return [esc(a.entityName),esc(a.accountName),'<span class="money">'+money(a.openingBalance)+'</span>','<span class="money '+(b<0?'account-negative':'account-positive')+'">'+money(b)+'</span>',esc(a.type||'-'),'<div class="actions"><button class="btn small ghost" data-edit-account="'+a.id+'">تعديل</button><button class="btn small danger" data-delete="accounts:'+a.id+'">حذف</button></div>']}),'accountsTable'):'<div class="empty">لا توجد حسابات.</div>');document.querySelectorAll('[data-edit-account]').forEach(function(b){b.onclick=function(){editAccount(b.dataset.editAccount)}});bindDelete();enhanceSearchSelects()};



/* ===================== V8 GLOBAL FIXES: DROPDOWNS + CASHIER PRODUCTS + MANUAL ITEM ===================== */
(function(){
  function safeActiveProducts(){
    try{
      return active(state.products||[]).filter(function(p){
        return p && !p.isDeleted && (p.name || p.barcode || p.id);
      });
    }catch(e){ return []; }
  }

  // قوائم منسدلة احترافية لكل الموقع، وليست فقط data-search
  var currentOpenSmart = null;
  window.enhanceSearchSelects = function(){
    document.querySelectorAll('select').forEach(function(sel){
      if(!sel || sel.dataset.noSmart === "1") return;

      // إزالة النسخة القديمة إذا كانت من النظام السابق ومكسورة
      var next = sel.nextElementSibling;
      if(next && next.classList && next.classList.contains('smart-select') && sel.dataset.enhancedV8 !== "1"){
        next.remove();
        sel.classList.remove("hidden");
        delete sel.dataset.enhanced;
      }

      if(sel.dataset.enhancedV8 === "1"){
        refreshSmartSelectV8(sel);
        return;
      }

      sel.dataset.enhancedV8 = "1";
      sel.classList.add("hidden");

      var wrap = document.createElement("div");
      wrap.className = "smart-select smart-select-v8";

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "smart-select-btn";
      btn.innerHTML = "<span>اختر</span><span>⌄</span>";

      var menu = document.createElement("div");
      menu.className = "smart-select-menu smart-select-floating";
      menu.innerHTML = '<input type="search" placeholder="بحث..."><div class="smart-select-list"></div>';

      document.body.appendChild(menu);
      wrap.appendChild(btn);
      sel.after(wrap);

      sel._smartV8 = {
        wrap: wrap,
        btn: btn,
        menu: menu,
        input: menu.querySelector("input"),
        list: menu.querySelector(".smart-select-list")
      };

      btn.addEventListener("click", function(ev){
        ev.preventDefault();
        ev.stopPropagation();

        document.querySelectorAll(".smart-select-menu.open").forEach(function(m){
          if(m !== menu) m.classList.remove("open");
        });

        currentOpenSmart = sel;
        positionSmartMenu(sel);
        menu.classList.toggle("open");
        sel._smartV8.input.value = "";
        refreshSmartSelectV8(sel);
        setTimeout(function(){ try{ sel._smartV8.input.focus(); }catch(e){} }, 30);
      });

      sel._smartV8.input.addEventListener("input", function(){ refreshSmartSelectV8(sel); });

      sel._smartV8.list.addEventListener("click", function(ev){
        var optBtn = ev.target.closest("[data-value]");
        if(!optBtn) return;
        sel.value = optBtn.getAttribute("data-value");
        sel.dispatchEvent(new Event("change", {bubbles:true}));
        menu.classList.remove("open");
        refreshSmartSelectV8(sel);
      });

      sel.addEventListener("change", function(){ refreshSmartSelectV8(sel); });

      new MutationObserver(function(){ refreshSmartSelectV8(sel); }).observe(sel, {
        childList:true,
        subtree:true,
        attributes:true
      });

      refreshSmartSelectV8(sel);
    });
  };

  window.refreshSmartSelectV8 = function(sel){
    var smart = sel && sel._smartV8;
    if(!smart) return;

    var selected = sel.options[sel.selectedIndex];
    var label = selected ? selected.textContent : "اختر";
    smart.btn.innerHTML = "<span>"+esc(label)+"</span><span>⌄</span>";

    var q = (smart.input.value || "").trim().toLowerCase();
    var opts = Array.prototype.slice.call(sel.options || []).filter(function(opt){
      return !q || opt.textContent.toLowerCase().indexOf(q) !== -1 || String(opt.value||"").toLowerCase().indexOf(q) !== -1;
    });

    smart.list.innerHTML = opts.length ? opts.map(function(opt){
      var activeCls = opt.value === sel.value ? " active" : "";
      return '<button type="button" class="smart-option'+activeCls+'" data-value="'+esc(opt.value)+'">'+esc(opt.textContent)+'</button>';
    }).join("") : '<div class="empty" style="padding:12px">لا توجد نتائج</div>';

    if(smart.menu.classList.contains("open")) positionSmartMenu(sel);
  };

  window.positionSmartMenu = function(sel){
    var smart = sel && sel._smartV8;
    if(!smart) return;
    var r = smart.btn.getBoundingClientRect();
    var menu = smart.menu;
    var margin = 8;
    var availableBottom = window.innerHeight - r.bottom - margin;
    var availableTop = r.top - margin;
    var openUp = availableBottom < 260 && availableTop > availableBottom;

    menu.style.position = "fixed";
    menu.style.right = "auto";
    menu.style.left = Math.max(margin, r.left) + "px";
    menu.style.width = Math.min(r.width, window.innerWidth - margin*2) + "px";
    menu.style.maxHeight = Math.max(180, Math.min(360, openUp ? availableTop : availableBottom)) + "px";
    menu.style.top = openUp ? "auto" : (r.bottom + margin) + "px";
    menu.style.bottom = openUp ? (window.innerHeight - r.top + margin) + "px" : "auto";
    menu.style.zIndex = "999999";
  };

  document.addEventListener("click", function(ev){
    if(!ev.target.closest(".smart-select-v8") && !ev.target.closest(".smart-select-floating")){
      document.querySelectorAll(".smart-select-menu.open").forEach(function(m){ m.classList.remove("open"); });
    }
  }, true);

  window.addEventListener("resize", function(){
    if(currentOpenSmart) positionSmartMenu(currentOpenSmart);
  });
  window.addEventListener("scroll", function(){
    if(currentOpenSmart) positionSmartMenu(currentOpenSmart);
  }, true);

  // تصحيح قالب الكاشير: الأكثر طلبًا فقط + البحث + منتج يدوي
  var originalInvoicesTemplateV8 = templates.invoices;
  templates.invoices = function(){
    return '<div class="section-head"><div><h3>الكاشير</h3><p>اضغط على المنتج أو امسح باركود. الأكثر طلبًا يظهر مباشرة، والبحث يظهر النتائج.</p></div><div class="actions"><button class="btn secondary" id="pairMobileBtn">ربط الجوال</button><button class="btn ghost" id="clearInvoiceBtn">تفريغ السلة</button></div></div>'+
    '<div id="p2pPanel" class="p2p-panel hidden"></div>'+
    '<div class="cashier-shell">'+
      '<div class="card cart-panel"><h3 style="margin-top:0;font-family:Cairo">السلة</h3>'+
        '<div class="form-grid">'+
          '<label class="suggest-wrap">اسم العميل<input id="invCustomerName" placeholder="اكتب أول حرفين"><div id="invCustomerSuggest" class="suggest-box"></div><div id="invCustomerDebtInfo" style="margin-top:8px"></div></label>'+
          '<label>رقم الجوال<input id="invPhone" inputmode="tel"></label>'+
          '<label>المبلغ المدفوع<input id="invPaidAmount" type="number" min="0" step="0.01" oninput="calcInvoiceTotal()"></label>'+
          '<label>الحساب<select id="invPaidAccount"></select></label>'+
          '<label>التاريخ<input id="invDate" type="date"></label>'+
        '</div>'+
        '<div id="invoiceItems" class="cart-grid"></div>'+
        '<div class="invoice-total"><span>الإجمالي</span><span class="money" id="invoiceTotal">0</span></div>'+
        '<div class="invoice-total"><span>المتبقي كدين</span><span class="money" id="invoiceRemaining">0</span></div>'+
        '<div class="actions" style="margin-top:12px"><button class="btn primary" id="saveInvoiceBtn">حفظ الفاتورة</button><button class="btn ghost" id="printInvoiceBtn">طباعة حرارية</button><button class="btn secondary" id="scanInvoiceBarcodeBtn">كاميرا</button><button class="btn ghost" id="manualItemBtn">منتج يدوي</button></div>'+
      '</div>'+
      '<div class="card products-panel">'+
        '<div class="section-head" style="margin-top:0"><div><h3 id="cashierProductTitle">الأكثر طلبًا</h3><p id="cashierProductsHint">اضغط على المنتج لإضافته للسلة.</p></div></div>'+
        '<input id="cashierProductSearch" class="cashier-search" placeholder="بحث بالاسم أو الباركود">'+
        '<div id="popularProducts" class="product-pick-grid popular"></div>'+
        '<div id="cashierProducts" class="product-pick-grid hidden"></div>'+
      '</div>'+
    '</div>';
  };

  // ربط أزرار الكاشير الإضافية
  var oldBindPageV8 = bindPage;
  bindPage = function(){
    oldBindPageV8();
    if(state.route === "invoices"){
      var manualBtn = $("manualItemBtn");
      if(manualBtn) manualBtn.onclick = addManualItemToCart;
      var search = $("cashierProductSearch");
      if(search) search.oninput = renderCashierProducts;
    }
    setTimeout(enhanceSearchSelects, 0);
  };

  // بعد أي Render أعد تشغيل القوائم المنسدلة حتى لا تبقى مكسورة
  var oldRenderCurrentV8 = renderCurrent;
  renderCurrent = function(){
    oldRenderCurrentV8();
    setTimeout(function(){
      enhanceSearchSelects();
      if(state.route === "invoices") renderCashierProducts();
    }, 0);
  };

  // الأكثر طلبًا مع fallback للمنتجات الحديثة لو ما في مبيعات
  getPopularProducts = function(limit){
    limit = limit || (window.innerWidth > 900 ? 9 : 6);
    var products = safeActiveProducts();
    var counts = {};
    active(state.invoices||[]).forEach(function(inv){
      (inv.items||[]).forEach(function(it){
        if(it.productId) counts[it.productId] = (counts[it.productId]||0) + toNumber(it.stockQty || it.quantity || 1);
      });
    });
    return products.sort(function(a,b){
      var ca = counts[a.id] || 0, cb = counts[b.id] || 0;
      if(cb !== ca) return cb - ca;
      return toNumber(b.updatedAt || b.createdAt) - toNumber(a.updatedAt || a.createdAt);
    }).slice(0, limit);
  };

  // عرض الكاشير: لا تعرض كل المنتجات إلا عند البحث، ولا تخليها فاضية إذا فيه منتجات
  renderCashierProducts = function(){
    var q = (val("cashierProductSearch") || "").trim().toLowerCase();
    var limit = window.innerWidth > 900 ? 9 : 6;
    var products = safeActiveProducts();
    var list = q ? products.filter(function(p){
      return ((p.name||"") + " " + (p.barcode||"") + " " + (p.category||"")).toLowerCase().indexOf(q) !== -1;
    }).slice(0, 60) : getPopularProducts(limit);

    var title = $("cashierProductTitle");
    if(title) title.textContent = q ? "نتائج البحث" : "الأكثر طلبًا";

    var hint = $("cashierProductsHint");
    if(hint) hint.textContent = q ? "نتائج البحث، اضغط على المنتج لإضافته للسلة." : "اضغط على المنتج لإضافته للسلة.";

    html("popularProducts", list.length ? list.map(productPickCard).join("") : '<div class="empty">لا توجد منتجات. أضف منتجًا من صفحة المنتجات أولًا.</div>');
    html("cashierProducts", "");
    var cp = $("cashierProducts");
    if(cp) cp.classList.add("hidden");

    document.querySelectorAll("[data-pick-product]").forEach(function(b){
      b.onclick = function(){ addProductToCart(b.dataset.pickProduct, "piece"); };
    });
  };

  // منتج يدوي لا يؤثر على المخزون، لكنه يدخل في الفاتورة
  window.addManualItemToCart = function(){
    var name = prompt("اسم المنتج اليدوي");
    if(!name) return;
    var price = toNumber(prompt("سعر البيع", "0"));
    if(price <= 0){ toast("اكتب سعر صحيح", "warning"); return; }
    var qty = toNumber(prompt("الكمية", "1")) || 1;
    cashierCart.push({
      id: uid("manual_cart"),
      productId: "",
      manual: true,
      name: name,
      imageUrl: "",
      barcode: "",
      saleMode: "manual",
      unitName: "",
      unitPieces: 1,
      quantity: qty,
      price: price,
      wholesalePiecePrice: 0,
      unitSalePrice: price,
      pieceSalePrice: price
    });
    renderCart();
    toast("تمت إضافة منتج يدوي", "success");
  };

  // تعديل عرض السلة لقبول المنتج اليدوي وعدم كسر القوائم
  var oldSetCartModeV8 = setCartMode;
  setCartMode = function(i, mode){
    var it = cashierCart[i];
    if(!it || it.manual){
      if(it) it.saleMode = "manual";
      renderCart();
      return;
    }
    oldSetCartModeV8(i, mode);
  };

  cartItemStockQty = function(it){
    if(it && it.manual) return 0;
    return toNumber(it.quantity) * (it.saleMode === "unit" ? toNumber(it.unitPieces || 1) : 1);
  };

  // تأكد أن عناصر الفاتورة اليدوية لا تخصم مخزون
  var oldGetInvoiceItemsV8 = getInvoiceItems;
  getInvoiceItems = function(){
    return cashierCart.map(function(it){
      return {
        productId: it.productId || "",
        manual: !!it.manual,
        name: it.name,
        imageUrl: it.imageUrl || "",
        quantity: toNumber(it.quantity),
        saleMode: it.saleMode || "piece",
        unitName: it.unitName || "",
        unitPieces: toNumber(it.unitPieces || 0),
        stockQty: it.manual ? 0 : cartItemStockQty(it),
        price: toNumber(it.price),
        total: cartItemTotal(it),
        cost: it.manual ? 0 : cartItemCost(it),
        profit: it.manual ? cartItemTotal(it) : (cartItemTotal(it) - cartItemCost(it))
      };
    }).filter(function(i){ return i.name && i.quantity > 0; });
  };

  // حماية saveInvoice من خصم مخزون المنتج اليدوي
  var oldSaveInvoiceV8 = saveInvoice;
  saveInvoice = function(){
    // الدالة القديمة تعتمد على productId، واليدوي productId فاضي، فتبقى آمنة.
    oldSaveInvoiceV8();
  };

  // تشغيل أولي
  setTimeout(function(){
    enhanceSearchSelects();
    if(state.route === "invoices") renderCashierProducts();
  }, 400);
})();


/* ===================== V9 REAL FIX: LOCAL DROPDOWN OVERRIDE + CASHIER PRODUCT RENDER ===================== */
(function(){
  var smartCounterV9 = 0;

  function ensureSelectIdV9(sel){
    if(!sel.dataset.smartIdV9){
      sel.dataset.smartIdV9 = "smart_v9_" + (++smartCounterV9) + "_" + Math.random().toString(16).slice(2);
    }
    return sel.dataset.smartIdV9;
  }

  function closeAllSmartV9(except){
    document.querySelectorAll(".smart-menu-v9.open").forEach(function(m){
      if(m !== except) m.classList.remove("open");
    });
    document.querySelectorAll(".smart-wrap-v9.open").forEach(function(w){
      if(!except || w._menuV9 !== except) w.classList.remove("open");
    });
  }

  function placeSmartMenuV9(sel){
    if(!sel || !sel._smartV9) return;
    var smart = sel._smartV9;
    var r = smart.btn.getBoundingClientRect();
    var margin = 10;
    var bottomSpace = window.innerHeight - r.bottom - margin;
    var topSpace = r.top - margin;
    var openUp = bottomSpace < 260 && topSpace > bottomSpace;
    var width = Math.max(180, Math.min(r.width, window.innerWidth - margin * 2));
    var left = Math.max(margin, Math.min(r.left, window.innerWidth - width - margin));

    smart.menu.style.position = "fixed";
    smart.menu.style.left = left + "px";
    smart.menu.style.right = "auto";
    smart.menu.style.width = width + "px";
    smart.menu.style.top = openUp ? "auto" : (r.bottom + margin) + "px";
    smart.menu.style.bottom = openUp ? (window.innerHeight - r.top + margin) + "px" : "auto";
    smart.menu.style.maxHeight = Math.max(220, Math.min(380, openUp ? topSpace : bottomSpace)) + "px";
    smart.menu.style.zIndex = "2147483647";
  }

  function refreshSmartSelectV9(sel){
    if(!sel || !sel._smartV9) return;
    var smart = sel._smartV9;
    var selected = sel.options[sel.selectedIndex];
    smart.btn.innerHTML = '<span class="smart-label-v9">'+esc(selected ? selected.textContent : "اختر")+'</span><span class="smart-arrow-v9">⌄</span>';

    var q = (smart.input.value || "").trim().toLowerCase();
    var opts = Array.prototype.slice.call(sel.options || []).filter(function(opt){
      var text = (opt.textContent || "").toLowerCase();
      var value = String(opt.value || "").toLowerCase();
      return !q || text.indexOf(q) !== -1 || value.indexOf(q) !== -1;
    });

    smart.list.innerHTML = opts.length ? opts.map(function(opt){
      var cls = opt.value === sel.value ? " selected" : "";
      return '<button type="button" class="smart-option-v9'+cls+'" data-value="'+esc(opt.value)+'">'+esc(opt.textContent || "بدون اسم")+'</button>';
    }).join("") : '<div class="smart-empty-v9">لا توجد نتائج</div>';

    if(smart.menu.classList.contains("open")) placeSmartMenuV9(sel);
  }

  // هنا الإصلاح الحقيقي: إعادة تعريف الدالة المحلية نفسها، وليس window فقط.
  enhanceSearchSelects = function(){
    document.querySelectorAll("select").forEach(function(sel){
      if(!sel || sel.dataset.noSmart === "1") return;

      // لو كانت نسخة قديمة من V7/V8 موجودة، أخفيها حتى لا تتداخل
      var n = sel.nextElementSibling;
      if(n && n.classList && (n.classList.contains("smart-select") || n.classList.contains("search-select")) && !n.classList.contains("smart-wrap-v9")){
        n.style.display = "none";
      }

      if(sel._smartV9){
        refreshSmartSelectV9(sel);
        return;
      }

      ensureSelectIdV9(sel);
      sel.classList.add("hidden");
      sel.style.display = "none";

      var wrap = document.createElement("div");
      wrap.className = "smart-wrap-v9";
      wrap.setAttribute("data-for", sel.dataset.smartIdV9);

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "smart-btn-v9";
      btn.innerHTML = '<span>اختر</span><span>⌄</span>';

      var menu = document.createElement("div");
      menu.className = "smart-menu-v9";
      menu.setAttribute("data-for", sel.dataset.smartIdV9);
      menu.innerHTML = '<input class="smart-search-v9" type="search" placeholder="بحث..."><div class="smart-list-v9"></div>';

      wrap.appendChild(btn);
      sel.after(wrap);
      document.body.appendChild(menu);

      sel._smartV9 = {
        wrap: wrap,
        btn: btn,
        menu: menu,
        input: menu.querySelector(".smart-search-v9"),
        list: menu.querySelector(".smart-list-v9")
      };
      wrap._menuV9 = menu;

      btn.addEventListener("click", function(e){
        e.preventDefault();
        e.stopPropagation();
        var willOpen = !menu.classList.contains("open");
        closeAllSmartV9(menu);
        if(willOpen){
          wrap.classList.add("open");
          menu.classList.add("open");
          sel._smartV9.input.value = "";
          refreshSmartSelectV9(sel);
          placeSmartMenuV9(sel);
          setTimeout(function(){ try{ sel._smartV9.input.focus(); }catch(err){} }, 30);
        } else {
          wrap.classList.remove("open");
          menu.classList.remove("open");
        }
      });

      sel._smartV9.input.addEventListener("input", function(){ refreshSmartSelectV9(sel); });

      sel._smartV9.list.addEventListener("click", function(e){
        var b = e.target.closest("[data-value]");
        if(!b) return;
        sel.value = b.getAttribute("data-value");
        sel.dispatchEvent(new Event("change", {bubbles:true}));
        menu.classList.remove("open");
        wrap.classList.remove("open");
        refreshSmartSelectV9(sel);
      });

      sel.addEventListener("change", function(){ refreshSmartSelectV9(sel); });

      new MutationObserver(function(){ refreshSmartSelectV9(sel); }).observe(sel, {
        childList:true,
        subtree:true,
        attributes:true
      });

      refreshSmartSelectV9(sel);
    });
  };

  document.addEventListener("click", function(e){
    if(!e.target.closest(".smart-wrap-v9") && !e.target.closest(".smart-menu-v9")){
      closeAllSmartV9();
    }
  }, true);

  window.addEventListener("resize", function(){
    document.querySelectorAll("select").forEach(function(sel){
      if(sel._smartV9 && sel._smartV9.menu.classList.contains("open")) placeSmartMenuV9(sel);
    });
  });
  window.addEventListener("scroll", function(){
    document.querySelectorAll("select").forEach(function(sel){
      if(sel._smartV9 && sel._smartV9.menu.classList.contains("open")) placeSmartMenuV9(sel);
    });
  }, true);

  function productsV9(){
    try{
      return (state.products || []).filter(function(p){
        return p && !p.isDeleted && (p.name || p.barcode || p.id);
      });
    }catch(e){
      return [];
    }
  }

  // إصلاح عرض المنتجات بالكاشير حتى لو لا يوجد سجل مبيعات سابق.
  getPopularProducts = function(limit){
    limit = limit || (window.innerWidth > 900 ? 9 : 6);
    var products = productsV9();
    var counts = {};
    (state.invoices || []).filter(function(i){return !i.isDeleted;}).forEach(function(inv){
      (inv.items || []).forEach(function(it){
        if(it.productId) counts[it.productId] = (counts[it.productId] || 0) + toNumber(it.stockQty || it.quantity || 1);
      });
    });

    return products.sort(function(a,b){
      var ca = counts[a.id] || 0;
      var cb = counts[b.id] || 0;
      if(cb !== ca) return cb - ca;
      return toNumber(b.updatedAt || b.createdAt || 0) - toNumber(a.updatedAt || a.createdAt || 0);
    }).slice(0, limit);
  };

  productPickCard = function(p){
    return '<button type="button" class="pick-card" data-pick-product="'+esc(p.id)+'">'+
      '<div class="pick-img">'+productImg(p)+'</div>'+
      '<b>'+esc(p.name || "منتج")+'</b>'+
      '<small>'+money(productPieceSale(p))+'</small>'+
      '<span>المخزون: '+fmt(p.quantity || 0)+'</span>'+
    '</button>';
  };

  renderCashierProducts = function(){
    var searchEl = $("cashierProductSearch");
    var q = (searchEl ? searchEl.value : "").trim().toLowerCase();
    var limit = window.innerWidth > 900 ? 9 : 6;
    var products = productsV9();

    var list = q ? products.filter(function(p){
      return ((p.name || "") + " " + (p.barcode || "") + " " + (p.category || "")).toLowerCase().indexOf(q) !== -1;
    }).slice(0, 60) : getPopularProducts(limit);

    var title = $("cashierProductTitle");
    if(title) title.textContent = q ? "نتائج البحث" : "الأكثر طلبًا";

    var hint = $("cashierProductsHint");
    if(hint) hint.textContent = q ? "نتائج البحث، اضغط على المنتج لإضافته للسلة." : "اضغط على المنتج لإضافته للسلة.";

    var target = $("popularProducts");
    if(target){
      target.innerHTML = list.length ? list.map(productPickCard).join("") :
        '<div class="empty">لا توجد منتجات ظاهرة. افتح صفحة المنتجات وتأكد أن المنتج محفوظ وغير محذوف.</div>';
    }
    var old = $("cashierProducts");
    if(old){ old.innerHTML = ""; old.classList.add("hidden"); }

    document.querySelectorAll("[data-pick-product]").forEach(function(b){
      b.onclick = function(){ addProductToCart(b.dataset.pickProduct, "piece"); };
    });

    // لو الحالة ما حملت المنتجات من IndexedDB لأي سبب، اسحبها مباشرة وأعد العرض
    if(!products.length && typeof getAll === "function"){
      getAll("products").then(function(rows){
        state.products = rows || [];
        var retryProducts = productsV9();
        if(retryProducts.length){
          renderCashierProducts();
        }
      }).catch(function(){});
    }
  };

  // منتج يدوي ثابت في الكاشير
  addManualItemToCart = function(){
    var name = prompt("اسم المنتج اليدوي");
    if(!name) return;
    var price = toNumber(prompt("سعر البيع", "0"));
    if(price <= 0){ toast("اكتب سعر صحيح", "warning"); return; }
    var qty = toNumber(prompt("الكمية", "1")) || 1;

    cashierCart.push({
      id: uid("manual_cart"),
      productId: "",
      manual: true,
      name: name,
      imageUrl: "",
      barcode: "",
      saleMode: "manual",
      unitName: "",
      unitPieces: 1,
      quantity: qty,
      price: price,
      wholesalePiecePrice: 0,
      unitSalePrice: price,
      pieceSalePrice: price
    });

    renderCart();
    toast("تمت إضافة منتج يدوي", "success");
  };

  // تأكد من وجود زر المنتج اليدوي حتى لو القالب القديم انعرض
  var oldBindPageV9 = bindPage;
  bindPage = function(){
    oldBindPageV9();

    if(state.route === "invoices"){
      var manualBtn = $("manualItemBtn");
      if(!manualBtn){
        var actions = $("scanInvoiceBarcodeBtn") ? $("scanInvoiceBarcodeBtn").parentElement : null;
        if(actions){
          manualBtn = document.createElement("button");
          manualBtn.className = "btn ghost";
          manualBtn.type = "button";
          manualBtn.id = "manualItemBtn";
          manualBtn.textContent = "منتج يدوي";
          actions.appendChild(manualBtn);
        }
      }
      if(manualBtn) manualBtn.onclick = addManualItemToCart;

      var s = $("cashierProductSearch");
      if(s) s.oninput = renderCashierProducts;
    }

    setTimeout(function(){
      enhanceSearchSelects();
      if(state.route === "invoices") renderCashierProducts();
    }, 30);
  };

  var oldRenderCurrentV9 = renderCurrent;
  renderCurrent = function(){
    oldRenderCurrentV9();
    setTimeout(function(){
      enhanceSearchSelects();
      if(state.route === "invoices") renderCashierProducts();
    }, 30);
  };

  // اجعل خصم المخزون يتجاهل المنتج اليدوي
  cartItemStockQty = function(it){
    if(it && it.manual) return 0;
    return toNumber(it.quantity) * (it.saleMode === "unit" ? toNumber(it.unitPieces || 1) : 1);
  };

  getInvoiceItems = function(){
    return cashierCart.map(function(it){
      return {
        productId: it.productId || "",
        manual: !!it.manual,
        name: it.name,
        imageUrl: it.imageUrl || "",
        quantity: toNumber(it.quantity),
        saleMode: it.saleMode || "piece",
        unitName: it.unitName || "",
        unitPieces: toNumber(it.unitPieces || 0),
        stockQty: it.manual ? 0 : cartItemStockQty(it),
        price: toNumber(it.price),
        total: cartItemTotal(it),
        cost: it.manual ? 0 : cartItemCost(it),
        profit: it.manual ? cartItemTotal(it) : (cartItemTotal(it) - cartItemCost(it))
      };
    }).filter(function(i){ return i.name && i.quantity > 0; });
  };

  // تشغيل فوري
  setTimeout(function(){
    enhanceSearchSelects();
    if(state.route === "invoices") renderCashierProducts();
  }, 300);
})();


/* ===================== V10: CUSTOMERS-DEBTS MERGE + CASHIER LOAD + MANUAL MULTI + REVERSALS + RECEIPT ===================== */
(function(){
  function safeArr(name){ return (state[name] || []).filter(function(x){return x && !x.isDeleted;}); }
  function byId(store,id){ return safeArr(store).find(function(x){return x.id === id;}); }
  function stockQtyFromItemV10(it){ return toNumber(it.stockQty || (toNumber(it.quantity) * (it.saleMode === "unit" ? toNumber(it.unitPieces || 1) : 1))); }
  function customerDebtTotalV10(customerId){
    return safeArr("debts").filter(function(d){return d.customerId === customerId;})
      .reduce(function(s,d){return s + toNumber(d.remaining);},0);
  }
  function normalizeProductsV10(){
    return (state.products || []).filter(function(p){ return p && !p.isDeleted && (p.name || p.barcode || p.id); });
  }

  try{
    var oldInitPWA = initPWA;
    initPWA = function(){
      oldInitPWA();
      var install = $("installBtn");
      if(install){
        install.classList.remove("hidden");
        install.onclick = function(){
          if(deferredInstallPrompt){ deferredInstallPrompt.prompt(); deferredInstallPrompt = null; }
          else toast("من كروم: القائمة ⋮ ثم تثبيت التطبيق أو إضافة إلى الشاشة الرئيسية", "warning");
        };
      }
    };
  }catch(e){}

  try{
    routes.forEach(function(r){ if(r.id === "debts"){ r.title = "الديون"; r.subtitle = "ديون العملاء والسداد"; r.icon = "debt"; } });
  }catch(e){}

  templates.debts = function(){ return templates.customers(); };

  templates.customers = function(){
    return '<div class="section-head"><div><h3>العملاء والديون</h3><p>إضافة العملاء، عرض ملف العميل، إضافة دين يدوي، وسداد دفعة من نفس الملف.</p></div></div>'+
    '<div id="customerProfile" style="margin-bottom:14px"></div>'+
    '<div class="grid two-col">'+
      '<div class="card"><h3 style="margin-top:0;font-family:Cairo">إضافة / تعديل عميل</h3>'+
        '<input id="customerEditId" type="hidden">'+
        '<div class="form-grid">'+
          '<label>اسم العميل<input id="customerName"></label>'+
          '<label>رقم الجوال<input id="customerPhone" inputmode="tel"></label>'+
          '<label class="full">ملاحظة<input id="customerNote"></label>'+
        '</div>'+
        '<div class="actions" style="margin-top:12px"><button class="btn primary" id="saveCustomerBtn">حفظ العميل</button><button class="btn ghost" id="clearCustomerBtn">جديد</button></div>'+
      '</div>'+
      '<div class="card"><h3 style="margin-top:0;font-family:Cairo">قائمة العملاء</h3>'+
        '<div class="searchbar"><input id="customerSearch" placeholder="بحث باسم أو رقم العميل"></div>'+
        '<div id="customersList"></div>'+
      '</div>'+
    '</div>';
  };

  function ensureCustomerButtonsV10(){
    if($("saveCustomerBtn")) $("saveCustomerBtn").onclick = saveCustomerV10;
    if($("clearCustomerBtn")) $("clearCustomerBtn").onclick = clearCustomerFormV10;
    if($("customerSearch")) $("customerSearch").oninput = renderCustomers;
  }

  function saveCustomerV10(){
    var id = val("customerEditId");
    var name = val("customerName").trim();
    var phone = val("customerPhone").trim();
    var note = val("customerNote").trim();
    if(!name){ toast("اكتب اسم العميل", "warning"); return; }
    (id ? getOne("customers", id) : Promise.resolve(null)).then(function(old){
      var c = nowBase(Object.assign({}, old || {}, {id: id || uid("customer"), name: name, phone: phone, note: note, createdAt: (old && old.createdAt) || Date.now()}));
      return putOne("customers", c).then(function(){ return queueSync("customers", c.id, id ? "update" : "create", c); });
    }).then(loadAll).then(function(){ clearCustomerFormV10(); renderCurrent(); toast("تم حفظ العميل", "success"); });
  }

  function clearCustomerFormV10(){ ["customerEditId","customerName","customerPhone","customerNote"].forEach(function(id){ setVal(id,""); }); }
  function editCustomerV10(id){
    var c = byId("customers", id); if(!c) return;
    setVal("customerEditId", c.id); setVal("customerName", c.name || ""); setVal("customerPhone", c.phone || ""); setVal("customerNote", c.note || "");
    window.scrollTo({top:0, behavior:"smooth"});
  }
  function showCustomerProfileV10(id){ state.selectedCustomerId = id; renderCustomerProfileV10(); setTimeout(function(){ var el = $("customerProfile"); if(el) el.scrollIntoView({behavior:"smooth", block:"start"}); }, 50); }

  renderCustomers = function(){
    ensureCustomerButtonsV10();
    var q = (val("customerSearch") || "").toLowerCase();
    var arr = safeArr("customers").filter(function(c){ return !q || ((c.name||"") + " " + (c.phone||"")).toLowerCase().indexOf(q) !== -1; }).sort(function(a,b){ return toNumber(b.createdAt) - toNumber(a.createdAt); });
    html("customersList", arr.length ? tools("customersTable","العملاء") + table(["الاسم","الجوال","الدين الحالي","ملاحظة","إجراءات"], arr.map(function(c){
      return [esc(c.name), esc(c.phone || "-"), '<span class="money">'+money(customerDebtTotalV10(c.id))+'</span>', esc(c.note || "-"), '<div class="actions"><button class="btn small ghost" data-customer-view="'+c.id+'">عرض الملف</button><button class="btn small ghost" data-edit-customer="'+c.id+'">تعديل</button><button class="btn small danger" data-delete="customers:'+c.id+'">حذف</button></div>'];
    }), "customersTable") : '<div class="empty">لا يوجد عملاء. أضف عميلًا من النموذج.</div>');
    document.querySelectorAll("[data-customer-view]").forEach(function(b){ b.onclick = function(){ showCustomerProfileV10(b.dataset.customerView); }; });
    document.querySelectorAll("[data-edit-customer]").forEach(function(b){ b.onclick = function(){ editCustomerV10(b.dataset.editCustomer); }; });
    bindDelete();
    if(state.selectedCustomerId) renderCustomerProfileV10();
  };

  function accountOptionsHTMLV10(){
    var arr = safeArr("accounts");
    return arr.length ? arr.map(function(a){ return '<option value="'+a.id+'">'+esc(a.entityName)+' - '+esc(a.accountName)+' - '+money(accountBalance(a.id))+'</option>'; }).join("") : '<option value="">أضف حسابًا أولًا</option>';
  }

  function renderCustomerProfileV10(){
    var id = state.selectedCustomerId;
    var c = byId("customers", id);
    if(!c){ html("customerProfile",""); return; }
    var debts = safeArr("debts").filter(function(d){return d.customerId === id;}).sort(function(a,b){return toNumber(b.createdAt)-toNumber(a.createdAt);});
    var invs = safeArr("invoices").filter(function(i){return i.customerId === id;}).sort(function(a,b){return toNumber(b.createdAt)-toNumber(a.createdAt);});
    var pays = safeArr("payments").filter(function(p){return p.customerId === id;}).sort(function(a,b){return toNumber(b.createdAt)-toNumber(a.createdAt);});
    var openDebts = debts.filter(function(d){return toNumber(d.remaining)>0;});
    html("customerProfile",
      '<div class="card">'+
        '<div class="customer-head"><div><h3>'+esc(c.name)+'</h3><p class="muted">'+esc(c.phone||"-")+'</p><p class="muted">'+esc(c.note||"")+'</p></div><div class="customer-avatar">'+esc((c.name||"?")[0])+'</div></div>'+
        '<div class="grid cards-4" style="margin-top:14px"><div class="card metric" style="box-shadow:none"><b>'+money(customerDebtTotalV10(c.id))+'</b><span>الدين الحالي</span></div><div class="card metric" style="box-shadow:none"><b>'+invs.length+'</b><span>فواتير</span></div><div class="card metric" style="box-shadow:none"><b>'+pays.length+'</b><span>دفعات</span></div></div>'+
        '<div class="grid two-col" style="margin-top:14px">'+
          '<div class="card" style="box-shadow:none"><h3 style="font-family:Cairo;margin-top:0">إضافة دين يدوي</h3><div class="form-grid"><label>المبلغ<input id="profileDebtAmount" type="number" step="0.01"></label><label>التاريخ<input id="profileDebtDate" type="date" value="'+today()+'"></label><label class="full">ملاحظة<input id="profileDebtNote"></label></div><button class="btn primary" style="margin-top:12px" id="profileAddDebtBtn">إضافة دين</button></div>'+
          '<div class="card" style="box-shadow:none"><h3 style="font-family:Cairo;margin-top:0">سداد دفعة</h3><div class="form-grid"><label>الدين<select id="profilePaymentDebt">'+(openDebts.length ? openDebts.map(function(d){return '<option value="'+d.id+'">'+esc(d.date||"-")+' - المتبقي '+money(d.remaining)+'</option>';}).join("") : '<option value="">لا توجد ديون مفتوحة</option>')+'</select></label><label>الحساب<select id="profilePaymentAccount">'+accountOptionsHTMLV10()+'</select></label><label>المبلغ<input id="profilePaymentAmount" type="number" step="0.01"></label><label>التاريخ<input id="profilePaymentDate" type="date" value="'+today()+'"></label><label class="full">ملاحظة<input id="profilePaymentNote"></label></div><button class="btn success" style="margin-top:12px" id="profilePayBtn">حفظ السداد</button></div>'+
        '</div>'+
        '<div style="margin-top:14px">'+tools("customerDebts","ديون العميل")+table(["التاريخ","الأصل","المدفوع","المتبقي","الحالة","ملاحظة","إجراءات"], debts.map(function(d){return [esc(d.date||"-"),money(d.amount),money(d.paid),money(d.remaining),chip(debtStatus(d)),esc(d.note||"-"),'<button class="btn small danger" data-delete-smart="debts:'+d.id+'">حذف</button>'];}), "customerDebts")+'</div>'+
        '<div style="margin-top:14px">'+tools("customerPayments","دفعات العميل")+table(["التاريخ","المبلغ","الحساب","ملاحظة","إجراءات"], pays.map(function(p){return [esc(p.date||"-"),money(p.amount),esc(accountName(p.accountId)),esc(p.note||"-"),'<button class="btn small danger" data-delete-smart="payments:'+p.id+'">حذف</button>'];}), "customerPayments")+'</div>'+
        '<div style="margin-top:14px">'+tools("customerInvoices","فواتير العميل")+table(["التاريخ","الإجمالي","المدفوع","المتبقي","إجراءات"], invs.map(function(i){return [esc(i.date||"-"),money(i.total),money(i.paid),money(i.remaining),'<button class="btn small ghost" data-print-invoice="'+i.id+'">طباعة</button><button class="btn small danger" data-delete-smart="invoices:'+i.id+'">حذف</button>'];}), "customerInvoices")+'</div>'+
      '</div>');
    $("profileAddDebtBtn").onclick = function(){ addProfileDebtV10(c); };
    $("profilePayBtn").onclick = function(){ addProfilePaymentV10(c); };
    document.querySelectorAll("[data-delete-smart]").forEach(function(b){ b.onclick = function(){ var p = b.dataset.deleteSmart.split(":"); smartDeleteV10(p[0], p[1]); }; });
    document.querySelectorAll("[data-print-invoice]").forEach(function(b){ b.onclick = function(){ printInvoice(b.dataset.printInvoice); }; });
    setTimeout(enhanceSearchSelects, 20);
  }

  function addProfileDebtV10(c){
    var amount = toNumber(val("profileDebtAmount"));
    var date = val("profileDebtDate") || today();
    var note = val("profileDebtNote").trim();
    if(amount <= 0){ toast("اكتب مبلغ الدين", "warning"); return; }
    var d = nowBase({id: uid("debt"), customerId: c.id, customerName: c.name, phone: c.phone, amount: amount, paid: 0, remaining: amount, status: "unpaid", date: date, note: note, source: "manual"});
    putOne("debts", d).then(function(){ return queueSync("debts", d.id, "create", d); }).then(loadAll).then(function(){ renderCustomers(); toast("تم إضافة الدين", "success"); });
  }

  function addProfilePaymentV10(c){
    var debtId = val("profilePaymentDebt");
    var accountId = val("profilePaymentAccount");
    var amount = toNumber(val("profilePaymentAmount"));
    var date = val("profilePaymentDate") || today();
    var note = val("profilePaymentNote").trim();
    getOne("debts", debtId).then(function(d){
      if(!d || !accountId || amount <= 0){ toast("اختر الدين والحساب واكتب المبلغ", "warning"); throw "stop"; }
      if(amount > toNumber(d.remaining)){ toast("المبلغ أكبر من المتبقي", "warning"); throw "stop"; }
      var rem = toNumber(d.remaining) - amount;
      var p = nowBase({id: uid("payment"), customerId: c.id, customerName: c.name, phone: c.phone, debtId: d.id, amount: amount, accountId: accountId, date: date, remainingAfterPayment: rem, note: note});
      var txn = nowBase({id: uid("txn"), accountId: accountId, type: "income", amount: amount, date: date, note: "سداد دين: " + c.name, source: "payment", sourceId: p.id});
      d.paid = toNumber(d.paid) + amount; d.remaining = rem; d.status = rem <= 0 ? "paid" : "partial"; d.updatedAt = Date.now();
      return putOne("payments", p).then(function(){ return queueSync("payments", p.id, "create", p); }).then(function(){ return putOne("debts", d); }).then(function(){ return queueSync("debts", d.id, "update", d); }).then(function(){ return putOne("transactions", txn); }).then(function(){ return queueSync("transactions", txn.id, "create", txn); });
    }).then(loadAll).then(function(){ renderCustomers(); toast("تم حفظ السداد", "success"); }).catch(function(){});
  }
})();


/* ===================== V10B: CASHIER LOAD + MANUAL MULTI + SMART DELETE + RECEIPT ===================== */
(function(){
  function safeArrB(name){ return (state[name] || []).filter(function(x){return x && !x.isDeleted;}); }
  function stockQtyFromItemB(it){ return toNumber(it.stockQty || (toNumber(it.quantity) * (it.saleMode === "unit" ? toNumber(it.unitPieces || 1) : 1))); }
  function normalizeProductsB(){ return (state.products || []).filter(function(p){ return p && !p.isDeleted && (p.name || p.barcode || p.id); }); }

  renderCashierProducts = function(){
    var run = function(){
      var q = (val("cashierProductSearch") || "").trim().toLowerCase();
      var limit = window.innerWidth > 900 ? 9 : 6;
      var products = normalizeProductsB();
      var counts = {};
      safeArrB("invoices").forEach(function(inv){
        (inv.items || []).forEach(function(it){
          if(it.productId) counts[it.productId] = (counts[it.productId] || 0) + toNumber(it.stockQty || it.quantity || 1);
        });
      });
      var list = q ? products.filter(function(p){
        return ((p.name||"") + " " + (p.barcode||"") + " " + (p.category||"")).toLowerCase().indexOf(q) !== -1;
      }).slice(0, 60) : products.sort(function(a,b){
        var ca = counts[a.id] || 0, cb = counts[b.id] || 0;
        if(cb !== ca) return cb - ca;
        return toNumber(b.updatedAt || b.createdAt || 0) - toNumber(a.updatedAt || a.createdAt || 0);
      }).slice(0, limit);
      var title = $("cashierProductTitle"); if(title) title.textContent = q ? "نتائج البحث" : "الأكثر طلبًا";
      var target = $("popularProducts");
      if(target) target.innerHTML = list.length ? list.map(productPickCard).join("") : '<div class="empty">لا توجد منتجات. أضف منتجات من قسم المشتريات/المنتجات.</div>';
      var old = $("cashierProducts"); if(old){ old.innerHTML = ""; old.classList.add("hidden"); }
      document.querySelectorAll("[data-pick-product]").forEach(function(b){ b.onclick = function(){ addProductToCart(b.dataset.pickProduct, "piece"); }; });
    };
    if(!normalizeProductsB().length && typeof getAll === "function"){
      getAll("products").then(function(rows){ state.products = rows || []; run(); }).catch(run);
    } else run();
  };

  function openManualItemModalV10(){
    var modal = document.createElement("div");
    modal.className = "manual-modal-v10";
    modal.innerHTML =
      '<div class="manual-card-v10">'+
        '<div class="section-head" style="margin:0 0 12px"><div><h3>إضافة منتجات يدوية</h3><p>يمكن إضافة أكثر من صنف بدون التأثير على المخزون.</p></div><button class="btn ghost small" id="manualCloseV10">إغلاق</button></div>'+
        '<div id="manualRowsV10" class="manual-rows-v10"></div>'+
        '<div class="actions" style="margin-top:12px"><button class="btn secondary" id="manualAddRowV10">إضافة صنف آخر</button><button class="btn primary" id="manualSaveV10">إضافة للسلة</button></div>'+
      '</div>';
    document.body.appendChild(modal);
    function row(){
      var div = document.createElement("div");
      div.className = "manual-row-v10";
      div.innerHTML =
        '<label>اسم الصنف<input class="m-name" placeholder="مثال: صنف غير مخزن"></label>'+
        '<label>سعر الجملة<input class="m-cost" type="number" step="0.01" value="0"></label>'+
        '<label>سعر البيع<input class="m-price" type="number" step="0.01" value="0"></label>'+
        '<label>الكمية<input class="m-qty" type="number" step="0.01" value="1"></label>'+
        '<button class="btn danger small m-del" type="button">حذف</button>';
      div.querySelector(".m-del").onclick = function(){ div.remove(); };
      return div;
    }
    var rows = modal.querySelector("#manualRowsV10");
    rows.appendChild(row());
    modal.querySelector("#manualAddRowV10").onclick = function(){ rows.appendChild(row()); };
    modal.querySelector("#manualCloseV10").onclick = function(){ modal.remove(); };
    modal.querySelector("#manualSaveV10").onclick = function(){
      var added = 0;
      rows.querySelectorAll(".manual-row-v10").forEach(function(r){
        var name = r.querySelector(".m-name").value.trim();
        var cost = toNumber(r.querySelector(".m-cost").value);
        var price = toNumber(r.querySelector(".m-price").value);
        var qty = toNumber(r.querySelector(".m-qty").value) || 1;
        if(!name || price <= 0) return;
        cashierCart.push({id: uid("manual_cart"), productId: "", manual: true, name: name, imageUrl: "", barcode: "", saleMode: "manual", unitName: "", unitPieces: 1, quantity: qty, price: price, wholesalePiecePrice: cost, unitSalePrice: price, pieceSalePrice: price});
        added++;
      });
      if(!added){ toast("أدخل اسم وسعر بيع لصنف واحد على الأقل", "warning"); return; }
      modal.remove(); renderCart(); toast("تمت إضافة الأصناف اليدوية", "success");
    };
  }
  addManualItemToCart = openManualItemModalV10;

  function softDeleteOnlyB(storeName, id){
    return getOne(storeName, id).then(function(item){
      if(!item) return;
      item.isDeleted = true; item.updatedAt = Date.now(); item.syncStatus = "pending";
      return putOne(storeName, item).then(function(){ return queueSync(storeName, id, "delete", item); });
    });
  }
  function reverseInvoiceB(id){
    return getOne("invoices", id).then(function(inv){
      if(!inv || inv.isDeleted) return;
      var tasks = [];
      (inv.items || []).forEach(function(it){
        if(!it.productId) return;
        tasks.push(getOne("products", it.productId).then(function(p){
          if(!p) return;
          p.quantity = toNumber(p.quantity) + stockQtyFromItemB(it);
          p.updatedAt = Date.now(); p.syncStatus = "pending";
          return putOne("products", p).then(function(){ return queueSync("products", p.id, "update", p); });
        }));
      });
      safeArrB("transactions").filter(function(t){return t.source === "invoice" && t.sourceId === id;}).forEach(function(t){ tasks.push(softDeleteOnlyB("transactions", t.id)); });
      safeArrB("dailySales").filter(function(s){return s.source === "invoice" && s.sourceId === id;}).forEach(function(s){ tasks.push(softDeleteOnlyB("dailySales", s.id)); });
      safeArrB("debts").filter(function(d){return d.invoiceId === id || d.sourceId === id;}).forEach(function(d){
        tasks.push(softDeleteOnlyB("debts", d.id));
        safeArrB("payments").filter(function(p){return p.debtId === d.id;}).forEach(function(p){
          tasks.push(softDeleteOnlyB("payments", p.id));
          safeArrB("transactions").filter(function(t){return t.source === "payment" && t.sourceId === p.id;}).forEach(function(t){ tasks.push(softDeleteOnlyB("transactions", t.id)); });
        });
      });
      tasks.push(softDeleteOnlyB("invoices", id));
      return Promise.all(tasks);
    });
  }
  function reversePaymentB(id){
    return getOne("payments", id).then(function(p){
      if(!p || p.isDeleted) return;
      var tasks = [];
      tasks.push(getOne("debts", p.debtId).then(function(d){
        if(!d) return;
        d.paid = Math.max(0, toNumber(d.paid) - toNumber(p.amount));
        d.remaining = toNumber(d.remaining) + toNumber(p.amount);
        d.status = d.remaining <= 0 ? "paid" : (d.paid > 0 ? "partial" : "unpaid");
        d.updatedAt = Date.now(); d.syncStatus = "pending";
        return putOne("debts", d).then(function(){ return queueSync("debts", d.id, "update", d); });
      }));
      safeArrB("transactions").filter(function(t){return t.source === "payment" && t.sourceId === id;}).forEach(function(t){ tasks.push(softDeleteOnlyB("transactions", t.id)); });
      tasks.push(softDeleteOnlyB("payments", id));
      return Promise.all(tasks);
    });
  }
  smartDeleteV10 = function(storeName, id){
    if(!confirm("تأكيد الحذف مع عكس الحسابات والمخزون إن وجدت؟")) return;
    var p = storeName === "invoices" ? reverseInvoiceB(id) : (storeName === "payments" ? reversePaymentB(id) : softDeleteOnlyB(storeName, id));
    p.then(loadAll).then(function(){ renderCurrent(); toast("تم الحذف وتحديث الحسابات", "success"); });
  };
  bindDelete = function(){
    document.querySelectorAll("[data-delete]").forEach(function(b){
      b.onclick = function(){ var p = b.dataset.delete.split(":"); smartDeleteV10(p[0], p[1]); };
    });
  };

  function receiptHTMLV10(inv){
    inv = inv || {}; var items = inv.items || [];
    var itemCount = items.reduce(function(s,it){return s + toNumber(it.quantity);},0);
    var date = inv.date || today();
    var time = new Date(inv.createdAt || Date.now()).toLocaleTimeString("en-GB", {hour:"2-digit",minute:"2-digit",second:"2-digit"});
    return '<div class="receipt-like-v10" id="receipt_'+esc(inv.id)+'">'+
      '<div class="r-center r-title">'+esc((state.settings&&state.settings.storeName)||"نظام إدارة المبيعات")+'</div>'+
      '<div class="r-center">الفرع الرئيسي</div><div class="r-center r-sale">فاتورة بيع</div><div class="r-line"></div>'+
      '<div class="r-info"><span>رقم العملية</span><b>'+esc((inv.id||"").slice(-8) || "-")+'</b></div>'+
      '<div class="r-info"><span>التاريخ</span><b>'+esc(date)+'</b></div><div class="r-info"><span>الوقت</span><b>'+esc(time)+'</b></div>'+
      '<div class="r-info"><span>العميل</span><b>'+esc(inv.customerName||"عميل نقدي")+'</b></div><div class="r-line"></div>'+
      '<table class="r-table"><thead><tr><th>الصنف</th><th>الوحدة</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr></thead><tbody>'+
      items.map(function(it){ var unit = it.saleMode === "unit" ? (it.unitName || "unit") : "قطعة"; return '<tr><td>'+esc(it.name)+'</td><td>'+esc(unit)+'</td><td>'+fmt(it.quantity)+'</td><td>'+fmt(it.price)+'</td><td>'+fmt(it.total)+'</td></tr>'; }).join("")+
      '</tbody></table><div class="r-line"></div><div class="r-total-row"><span>الإجمالي</span><b>'+fmt(inv.total)+'</b></div>'+
      '<div class="r-net">'+fmt(inv.total)+'</div><div class="r-info big"><span>المدفوع</span><b>'+fmt(inv.paid)+'</b></div><div class="r-info big"><span>المتبقي</span><b>'+fmt(inv.remaining)+'</b></div>'+
      '<div class="r-count">عدد الأصناف المباعة <b>'+fmt(itemCount)+'</b></div><div class="r-info"><span>'+esc(date)+'</span><b>'+esc(time)+'</b></div>'+
      '<div class="r-footer">بعد إصدار الفاتورة جميع الخدمات المباعة لا ترد ولا يجوز استرداد المبالغ المدفوعة</div></div>';
  }
  printInvoice = function(id){
    var inv = safeArrB("invoices").find(function(x){return x.id === id;});
    if(!inv){ toast("الفاتورة غير موجودة", "warning"); return; }
    var w = window.open("", "_blank");
    w.document.write('<html dir="rtl"><head><title>فاتورة حرارية</title><style>body{margin:0;background:#fff;font-family:Arial,Tahoma,sans-serif;color:#111}.receipt-like-v10{width:80mm;max-width:80mm;padding:3mm;box-sizing:border-box;font-size:12px}.r-center{text-align:center}.r-title{font-weight:900;font-size:16px}.r-sale{font-weight:900;font-size:18px;margin:4px 0}.r-line{border-top:1px solid #111;margin:5px 0}.r-info{display:flex;justify-content:space-between;gap:8px;margin:3px 0}.r-info b{font-weight:800}.r-table{width:100%;border-collapse:collapse;font-size:11px}.r-table th,.r-table td{border-bottom:1px solid #ddd;padding:3px 2px;text-align:right}.r-table th{font-weight:900}.r-total-row{display:flex;justify-content:space-between;font-size:18px;font-weight:900;margin-top:6px}.r-net{border:1px dashed #111;text-align:center;font-size:24px;font-weight:900;margin:7px 0;padding:5px}.big{font-size:17px;font-weight:900}.r-count{text-align:center;font-size:18px;font-weight:900;margin:8px 0}.r-count b{font-size:22px}.r-footer{text-align:center;margin-top:8px;font-size:13px;line-height:1.7}@media print{@page{size:80mm auto;margin:0}body{width:80mm}}</style></head><body>'+receiptHTMLV10(inv)+'</body></html>');
    w.document.close(); setTimeout(function(){ w.print(); }, 250);
  };

  var oldBindPageV10b = bindPage;
  bindPage = function(){
    oldBindPageV10b();
    if(state.route === "invoices"){
      var manualBtn = $("manualItemBtn"); if(manualBtn) manualBtn.onclick = openManualItemModalV10;
      var search = $("cashierProductSearch"); if(search) search.oninput = renderCashierProducts;
      setTimeout(function(){ getAll("products").then(function(rows){ state.products = rows || []; renderCashierProducts(); }); }, 80);
    }
    setTimeout(enhanceSearchSelects, 50);
  };
  var oldRenderCurrentV10b = renderCurrent;
  renderCurrent = function(){
    oldRenderCurrentV10b();
    if(state.route === "invoices") setTimeout(renderCashierProducts, 50);
    setTimeout(enhanceSearchSelects, 50);
  };

  cartItemCost = function(it){
    if(it && it.manual) return toNumber(it.quantity) * toNumber(it.wholesalePiecePrice || 0);
    return cartItemStockQty(it) * toNumber(it.wholesalePiecePrice || 0);
  };
  getInvoiceItems = function(){
    return cashierCart.map(function(it){
      return {productId: it.productId || "", manual: !!it.manual, name: it.name, imageUrl: it.imageUrl || "", quantity: toNumber(it.quantity), saleMode: it.saleMode || "piece", unitName: it.unitName || "", unitPieces: toNumber(it.unitPieces || 0), stockQty: it.manual ? 0 : cartItemStockQty(it), price: toNumber(it.price), total: cartItemTotal(it), cost: cartItemCost(it), profit: cartItemTotal(it) - cartItemCost(it)};
    }).filter(function(i){ return i.name && i.quantity > 0; });
  };
})();


/* ===================== V11 USER FIX: BOTTOM CUSTOMERS + CASHIER AUTO LOAD + MANUAL MULTI GUARANTEE ===================== */
(function(){
  // 1) القائمة السفلية: العملاء والديون بدل الديون
  try{
    routes = routes.filter(function(r){ return r.id !== "debts"; });
    routes.forEach(function(r){
      if(r.id === "customers"){
        r.title = "العملاء والديون";
        r.subtitle = "ملفات العملاء والديون والسداد";
        r.icon = "users";
      }
      if(r.id === "invoices"){
        r.title = "الكاشير";
        r.subtitle = "بيع سريع بالباركود والوحدات";
        r.icon = "receipt";
      }
    });
    bottomIds = ["dashboard","invoices","customers","accounts","suppliers","products"];
  }catch(e){}

  // 2) دوال مساعدة نهائية لعرض المنتجات بدون انتظار تحديث الصفحة
  function aliveProductsV11(){
    return (state.products || []).filter(function(p){
      return p && !p.isDeleted && (p.name || p.barcode || p.id);
    });
  }
  function salePriceV11(p){
    try{return productPieceSale(p);}catch(e){return toNumber(p.salePiecePrice || p.price || 0);}
  }
  function imgV11(p){
    try{return productImg(p);}catch(e){
      return p && p.imageUrl ? '<img src="'+esc(p.imageUrl)+'" onerror="this.outerHTML=\'<div class=&quot;prod-fallback&quot;>'+icon("box").replace(/"/g,"&quot;")+'</div>\'">' : '<div class="prod-fallback">'+icon("box")+'</div>';
    }
  }
  function productCardV11(p){
    return '<button type="button" class="pick-card" data-pick-product="'+esc(p.id)+'">'+
      '<div class="pick-img">'+imgV11(p)+'</div>'+
      '<b>'+esc(p.name || "منتج")+'</b>'+
      '<small>'+money(salePriceV11(p))+'</small>'+
      '<span>المخزون: '+fmt(p.quantity || 0)+'</span>'+
    '</button>';
  }
  function popularV11(limit){
    limit = limit || (window.innerWidth > 900 ? 9 : 6);
    var products = aliveProductsV11();
    var counts = {};
    (state.invoices || []).filter(function(i){return i && !i.isDeleted;}).forEach(function(inv){
      (inv.items || []).forEach(function(it){
        if(it.productId) counts[it.productId] = (counts[it.productId] || 0) + toNumber(it.stockQty || it.quantity || 1);
      });
    });
    return products.sort(function(a,b){
      var ca = counts[a.id] || 0, cb = counts[b.id] || 0;
      if(cb !== ca) return cb - ca;
      return toNumber(b.updatedAt || b.createdAt || 0) - toNumber(a.updatedAt || a.createdAt || 0);
    }).slice(0, limit);
  }
  function renderCashierProductsV11(){
    var q = (val("cashierProductSearch") || "").trim().toLowerCase();
    var list = q ? aliveProductsV11().filter(function(p){
      return ((p.name || "") + " " + (p.barcode || "") + " " + (p.category || "")).toLowerCase().indexOf(q) !== -1;
    }).slice(0, 60) : popularV11(window.innerWidth > 900 ? 9 : 6);

    var title = $("cashierProductTitle");
    if(title) title.textContent = q ? "نتائج البحث" : "الأكثر طلبًا";
    var hint = $("cashierProductsHint");
    if(hint) hint.textContent = q ? "اضغط على المنتج لإضافته للسلة." : "اضغط على المنتج لإضافته للسلة.";

    var target = $("popularProducts");
    if(target){
      target.innerHTML = list.length ? list.map(productCardV11).join("") : '<div class="empty">لا توجد منتجات ظاهرة. انتقل إلى المنتجات/المشتريات وأضف منتجًا.</div>';
    }
    var old = $("cashierProducts");
    if(old){
      old.innerHTML = "";
      old.classList.add("hidden");
    }
    document.querySelectorAll("[data-pick-product]").forEach(function(b){
      b.onclick = function(){ addProductToCart(b.dataset.pickProduct, "piece"); };
    });
  }
  function forceCashierLoadV11(){
    if(state.route !== "invoices") return;
    var done = function(){
      renderAccountOptions();
      renderCashierProductsV11();
      var search = $("cashierProductSearch");
      if(search) search.oninput = renderCashierProductsV11;
      var manual = $("manualItemBtn");
      if(manual) manual.onclick = openManualItemModalV11;
      setTimeout(function(){ try{ enhanceSearchSelects(); }catch(e){} }, 30);
    };
    Promise.all([
      getAll("products").then(function(rows){ state.products = rows || []; }),
      getAll("invoices").then(function(rows){ state.invoices = rows || []; }),
      getAll("accounts").then(function(rows){ state.accounts = rows || []; })
    ]).then(done).catch(done);
  }

  // 3) منتج يدوي متعدد الأصناف: اسم، جملة، بيع، كمية
  function openManualItemModalV11(){
    var modal = document.createElement("div");
    modal.className = "manual-modal-v10";
    modal.innerHTML =
      '<div class="manual-card-v10">'+
        '<div class="section-head" style="margin:0 0 12px"><div><h3>إضافة منتجات يدوية</h3><p>أضف صنفًا أو أكثر: اسم الصنف، سعر الجملة، سعر البيع، والكمية.</p></div><button class="btn ghost small" id="manualCloseV11" type="button">إغلاق</button></div>'+
        '<div id="manualRowsV11" class="manual-rows-v10"></div>'+
        '<div class="actions" style="margin-top:12px"><button class="btn secondary" id="manualAddRowV11" type="button">إضافة صنف آخر</button><button class="btn primary" id="manualSaveV11" type="button">إضافة للسلة</button></div>'+
      '</div>';
    document.body.appendChild(modal);

    function addRow(){
      var div = document.createElement("div");
      div.className = "manual-row-v10";
      div.innerHTML =
        '<label>اسم الصنف<input class="m-name" placeholder="اسم الصنف"></label>'+
        '<label>سعر الجملة<input class="m-cost" type="number" min="0" step="0.01" value="0"></label>'+
        '<label>سعر البيع<input class="m-price" type="number" min="0" step="0.01" value="0"></label>'+
        '<label>الكمية<input class="m-qty" type="number" min="0" step="0.01" value="1"></label>'+
        '<button class="btn danger small m-del" type="button">حذف</button>';
      div.querySelector(".m-del").onclick = function(){ div.remove(); };
      modal.querySelector("#manualRowsV11").appendChild(div);
    }

    addRow();
    modal.querySelector("#manualAddRowV11").onclick = addRow;
    modal.querySelector("#manualCloseV11").onclick = function(){ modal.remove(); };
    modal.querySelector("#manualSaveV11").onclick = function(){
      var added = 0;
      modal.querySelectorAll(".manual-row-v10").forEach(function(row){
        var name = row.querySelector(".m-name").value.trim();
        var cost = toNumber(row.querySelector(".m-cost").value);
        var price = toNumber(row.querySelector(".m-price").value);
        var qty = toNumber(row.querySelector(".m-qty").value) || 1;
        if(!name || price <= 0) return;
        cashierCart.push({
          id: uid("manual_cart"),
          productId: "",
          manual: true,
          name: name,
          imageUrl: "",
          barcode: "",
          saleMode: "manual",
          unitName: "",
          unitPieces: 1,
          quantity: qty,
          price: price,
          wholesalePiecePrice: cost,
          unitSalePrice: price,
          pieceSalePrice: price
        });
        added++;
      });
      if(!added){
        toast("أدخل اسم وسعر بيع لصنف واحد على الأقل", "warning");
        return;
      }
      modal.remove();
      renderCart();
      toast("تمت إضافة المنتج اليدوي", "success");
    };
  }

  addManualItemToCart = openManualItemModalV11;
  renderCashierProducts = renderCashierProductsV11;

  // 4) ضمان ربط الزر حتى لو تم إعادة رسم الصفحة
  var previousBindPageV11 = bindPage;
  bindPage = function(){
    previousBindPageV11();
    if(state.route === "invoices"){
      var manual = $("manualItemBtn");
      if(manual) manual.onclick = openManualItemModalV11;
      var search = $("cashierProductSearch");
      if(search) search.oninput = renderCashierProductsV11;
      setTimeout(forceCashierLoadV11, 20);
      setTimeout(forceCashierLoadV11, 300);
    }
  };

  var previousRenderCurrentV11 = renderCurrent;
  renderCurrent = function(){
    previousRenderCurrentV11();
    if(state.route === "invoices"){
      setTimeout(forceCashierLoadV11, 20);
      setTimeout(forceCashierLoadV11, 300);
    }
  };

  var previousNavigateV11 = navigate;
  navigate = function(id){
    previousNavigateV11(id);
    if(id === "invoices"){
      setTimeout(forceCashierLoadV11, 20);
      setTimeout(forceCashierLoadV11, 300);
      setTimeout(forceCashierLoadV11, 900);
    }
  };

  // 5) rebuild bottom nav after DOM loads with customers included
  document.addEventListener("DOMContentLoaded", function(){
    setTimeout(function(){
      try{
        bottomIds = ["dashboard","invoices","customers","accounts","suppliers","products"];
        buildNav();
        document.querySelectorAll("[data-nav]").forEach(function(btn){
          if(btn.dataset.nav === state.route) btn.classList.add("active");
        });
        forceCashierLoadV11();
      }catch(e){}
    }, 150);
  });

  // 6) ربح المنتج اليدوي: البيع - الجملة
  cartItemCost = function(it){
    if(it && it.manual) return toNumber(it.quantity) * toNumber(it.wholesalePiecePrice || 0);
    try{return cartItemStockQty(it) * toNumber(it.wholesalePiecePrice || 0);}catch(e){return 0;}
  };
  getInvoiceItems = function(){
    return cashierCart.map(function(it){
      var total = cartItemTotal(it);
      var cost = cartItemCost(it);
      return {
        productId: it.productId || "",
        manual: !!it.manual,
        name: it.name,
        imageUrl: it.imageUrl || "",
        quantity: toNumber(it.quantity),
        saleMode: it.saleMode || "piece",
        unitName: it.unitName || "",
        unitPieces: toNumber(it.unitPieces || 0),
        stockQty: it.manual ? 0 : cartItemStockQty(it),
        price: toNumber(it.price),
        total: total,
        cost: cost,
        profit: total - cost
      };
    }).filter(function(i){ return i.name && i.quantity > 0; });
  };
})();


/* ===================== V12 FINAL PATCH ===================== */
(function(){
  var paidTouchedV12=false,lastCartSigV12="",barcodeBufV12="",barcodeTimerV12=null;

  function arrV12(name){return (state[name]||[]).filter(function(x){return x&&!x.isDeleted;});}
  function productsV12(){return (state.products||[]).filter(function(p){return p&&!p.isDeleted&&(p.name||p.barcode||p.id);});}
  function saleV12(p){try{return productPieceSale(p)}catch(e){return toNumber(p.salePiecePrice||p.price||0)}}
  function imgV12(p){try{return productImg(p)}catch(e){return p&&p.imageUrl?'<img src="'+esc(p.imageUrl)+'">':'<div class="prod-fallback">'+icon("box")+'</div>'}}
  function cardV12(p){return '<button type="button" class="pick-card" data-pick-product="'+esc(p.id)+'"><div class="pick-img">'+imgV12(p)+'</div><b>'+esc(p.name||"منتج")+'</b><small>'+money(saleV12(p))+'</small><span>المخزون: '+fmt(p.quantity||0)+'</span></button>'}

  function fixBottomLabelsV12(){
    document.querySelectorAll("#bottomNav [data-nav='customers'] span").forEach(function(s){s.textContent="الديون";});
    document.querySelectorAll("#sideNav [data-nav='customers'] span").forEach(function(s){s.textContent="العملاء والديون";});
  }

  try{
    routes=routes.filter(function(r){return r.id!=="debts";});
    routes.forEach(function(r){
      if(r.id==="customers"){r.title="العملاء والديون";r.subtitle="ملفات العملاء والديون والسداد";r.icon="users";}
      if(r.id==="invoices"){r.title="الكاشير";r.subtitle="بيع سريع بالباركود والوحدات";}
    });
    bottomIds=["dashboard","invoices","customers","accounts","suppliers","products"];
  }catch(e){}

  var oldBuildNavV12=buildNav;
  buildNav=function(){oldBuildNavV12();fixBottomLabelsV12();};

  function ensureDirectBtnV12(){
    var b=$("manualItemBtn")||$("directInvoiceBtn");
    if(b){b.textContent="فاتورة مباشرة";b.id="directInvoiceBtn";b.onclick=openDirectInvoiceModalV12;}
  }

  function renderCashierProductsV12(){
    var target=$("popularProducts"); if(!target)return;
    var q=(val("cashierProductSearch")||"").trim().toLowerCase();
    var counts={};
    arrV12("invoices").forEach(function(inv){(inv.items||[]).forEach(function(it){if(it.productId)counts[it.productId]=(counts[it.productId]||0)+toNumber(it.stockQty||it.quantity||1);});});
    var list=q?productsV12().filter(function(p){return ((p.name||"")+" "+(p.barcode||"")+" "+(p.category||"")).toLowerCase().indexOf(q)!==-1;}).slice(0,60)
      :productsV12().sort(function(a,b){var ca=counts[a.id]||0,cb=counts[b.id]||0;if(cb!==ca)return cb-ca;return toNumber(b.updatedAt||b.createdAt||0)-toNumber(a.updatedAt||a.createdAt||0);}).slice(0,window.innerWidth>900?9:6);
    var title=$("cashierProductTitle"); if(title)title.textContent=q?"نتائج البحث":"الأكثر طلبًا";
    target.innerHTML=list.length?list.map(cardV12).join(""):'<div class="empty">لا توجد منتجات ظاهرة. أضف منتجات أو افتح الصفحة بعد تحديث النسخة.</div>';
    var old=$("cashierProducts"); if(old){old.innerHTML="";old.classList.add("hidden");}
    document.querySelectorAll("[data-pick-product]").forEach(function(btn){btn.onclick=function(){addProductToCart(btn.dataset.pickProduct,"piece");};});
  }
  renderCashierProducts=renderCashierProductsV12;

  function loadCashierNowV12(){
    if(state.route!=="invoices")return Promise.resolve();
    return Promise.all([
      getAll("products").then(function(r){state.products=r||[];}),
      getAll("invoices").then(function(r){state.invoices=r||[];}),
      getAll("accounts").then(function(r){state.accounts=r||[];})
    ]).then(function(){
      renderAccountOptions();
      renderCashierProductsV12();
      ensureDirectBtnV12();
      try{enhanceSearchSelects();}catch(e){}
    }).catch(function(){renderCashierProductsV12();});
  }

  function cartSigV12(){try{return JSON.stringify(cashierCart.map(function(i){return [i.productId,i.name,i.quantity,i.price,i.saleMode];}));}catch(e){return"";}}
  function syncPaidV12(total){
    var p=$("invPaidAmount"); if(!p)return;
    var sig=cartSigV12();
    if(sig!==lastCartSigV12){
      lastCartSigV12=sig;
      if(!paidTouchedV12||p.value===""||toNumber(p.value)===0)p.value=total?String(Number(total.toFixed?total.toFixed(2):total)):"";
    }
  }
  var oldCalcV12=calcInvoiceTotal;
  calcInvoiceTotal=function(){var t=oldCalcV12();syncPaidV12(toNumber(t));return t;};
  function hookPaidV12(){var p=$("invPaidAmount");if(p&&!p.dataset.v12){p.dataset.v12="1";p.addEventListener("input",function(){paidTouchedV12=true;});}}
  var oldRenderCartV12=renderCart;
  renderCart=function(){oldRenderCartV12();hookPaidV12();syncPaidV12(cashierCart.reduce(function(s,it){return s+cartItemTotal(it);},0));};

  function openDirectInvoiceModalV12(){
    var modal=document.createElement("div");
    modal.className="direct-modal-v12";
    modal.innerHTML='<div class="direct-card-v12"><div class="section-head" style="margin:0 0 12px"><div><h3>فاتورة مباشرة</h3><p>أصناف ليست من المخزون، ويمكن إضافة أكثر من صنف.</p></div><button class="btn ghost small" id="directCloseV12" type="button">إغلاق</button></div><div id="directRowsV12" class="direct-rows-v12"></div><div class="actions" style="margin-top:12px"><button class="btn secondary" id="directAddRowV12" type="button">إضافة صنف</button><button class="btn primary" id="directSaveV12" type="button">إضافة للسلة</button></div></div>';
    document.body.appendChild(modal);
    function addRow(){
      var row=document.createElement("div");row.className="direct-row-v12";
      row.innerHTML='<label class="direct-name">اسم الصنف<input class="d-name" placeholder="اسم الصنف"></label><label>سعر الجملة<input class="d-cost" type="number" min="0" step="0.01" value="0"></label><label>السعر<input class="d-price" type="number" min="0" step="0.01" value="0"></label><label>الكمية<div class="qty-step-v12"><button type="button" class="d-minus">-</button><input class="d-qty" type="number" min="0" step="1" value="1"><button type="button" class="d-plus">+</button></div></label><button class="btn danger small d-del" type="button">حذف</button>';
      row.querySelector(".d-plus").onclick=function(){var q=row.querySelector(".d-qty");q.value=toNumber(q.value)+1;};
      row.querySelector(".d-minus").onclick=function(){var q=row.querySelector(".d-qty");q.value=Math.max(0,toNumber(q.value)-1);};
      row.querySelector(".d-del").onclick=function(){row.remove();};
      modal.querySelector("#directRowsV12").appendChild(row);
    }
    addRow();
    modal.querySelector("#directAddRowV12").onclick=addRow;
    modal.querySelector("#directCloseV12").onclick=function(){modal.remove();};
    modal.querySelector("#directSaveV12").onclick=function(){
      var added=0;
      modal.querySelectorAll(".direct-row-v12").forEach(function(row){
        var name=row.querySelector(".d-name").value.trim(),cost=toNumber(row.querySelector(".d-cost").value),price=toNumber(row.querySelector(".d-price").value),qty=toNumber(row.querySelector(".d-qty").value)||1;
        if(!name||price<=0)return;
        cashierCart.push({id:uid("direct_cart"),productId:"",manual:true,direct:true,name:name,imageUrl:"",barcode:"",saleMode:"manual",unitName:"",unitPieces:1,quantity:qty,price:price,wholesalePiecePrice:cost,unitSalePrice:price,pieceSalePrice:price});
        added++;
      });
      if(!added){toast("أدخل اسم وسعر صنف واحد على الأقل","warning");return;}
      modal.remove();renderCart();toast("تمت إضافة الفاتورة المباشرة للسلة","success");
    };
  }
  addManualItemToCart=openDirectInvoiceModalV12;

  function processBarcodeV12(code){
    code=String(code||"").trim(); if(!code||code.length<3)return;
    if(state.route==="products"||state.route==="purchases"){
      var inp=$("productBarcode"); if(inp){inp.value=code;inp.dispatchEvent(new Event("input",{bubbles:true}));toast("تم قراءة الباركود: "+code,"success");return;}
    }
    if(state.route==="invoices"){
      var p=productsV12().find(function(x){return String(x.barcode||"").trim()===code;});
      if(p)addProductToCart(p.id,"piece"); else toast("المنتج غير موجود: "+code,"danger");
    }
  }
  document.addEventListener("keydown",function(e){
    if(e.ctrlKey||e.altKey||e.metaKey)return;
    var active=document.activeElement,isTyping=active&&["INPUT","TEXTAREA"].indexOf(active.tagName)!==-1,allow=active&&active.id==="productBarcode";
    if(isTyping&&state.route!=="invoices"&&!allow)return;
    if(e.key==="Enter"){if(barcodeBufV12.length>=3){processBarcodeV12(barcodeBufV12);barcodeBufV12="";e.preventDefault();}return;}
    if(e.key&&e.key.length===1){barcodeBufV12+=e.key;clearTimeout(barcodeTimerV12);barcodeTimerV12=setTimeout(function(){if(barcodeBufV12.length>=6)processBarcodeV12(barcodeBufV12);barcodeBufV12="";},90);}
  },true);

  var oldBindV12=bindPage;
  bindPage=function(){oldBindV12();fixBottomLabelsV12();if(state.route==="invoices"){paidTouchedV12=false;hookPaidV12();ensureDirectBtnV12();var s=$("cashierProductSearch");if(s)s.oninput=renderCashierProductsV12;setTimeout(loadCashierNowV12,20);setTimeout(loadCashierNowV12,300);setTimeout(loadCashierNowV12,1000);}};
  var oldRenderV12=renderCurrent;
  renderCurrent=function(){oldRenderV12();fixBottomLabelsV12();if(state.route==="invoices"){hookPaidV12();ensureDirectBtnV12();setTimeout(loadCashierNowV12,20);setTimeout(loadCashierNowV12,300);}};
  var oldNavV12=navigate;
  navigate=function(id){oldNavV12(id);fixBottomLabelsV12();if(id==="invoices"){setTimeout(loadCashierNowV12,20);setTimeout(loadCashierNowV12,300);setTimeout(loadCashierNowV12,1000);}};

  if(window.caches&&caches.keys){caches.keys().then(function(keys){return Promise.all(keys.filter(function(k){return k.indexOf("sales-webapp-v13")===-1;}).map(function(k){return caches.delete(k);}));}).catch(function(){});}
  document.addEventListener("DOMContentLoaded",function(){setTimeout(function(){fixBottomLabelsV12();if(state.route==="invoices")loadCashierNowV12();},300);});

  cartItemCost=function(it){if(it&&it.manual)return toNumber(it.quantity)*toNumber(it.wholesalePiecePrice||0);try{return cartItemStockQty(it)*toNumber(it.wholesalePiecePrice||0);}catch(e){return 0;}};
  getInvoiceItems=function(){return cashierCart.map(function(it){var total=cartItemTotal(it),cost=cartItemCost(it);return {productId:it.productId||"",manual:!!it.manual,name:it.name,imageUrl:it.imageUrl||"",quantity:toNumber(it.quantity),saleMode:it.saleMode||"piece",unitName:it.unitName||"",unitPieces:toNumber(it.unitPieces||0),stockQty:it.manual?0:cartItemStockQty(it),price:toNumber(it.price),total:total,cost:cost,profit:total-cost};}).filter(function(i){return i.name&&i.quantity>0;});};
})();


/* ===================== V13 FINAL CASHIER IMPLEMENTATION ===================== */
(function(){
  var paidEditedV13=false, lastPaidCartSigV13="", cashierHydratingV13=false, firebasePulledForCashierV13=false;
  var barcodeBufferV13="", barcodeLastKeyV13=0, barcodeTimerV13=null, lastProductAddKeyV13="", lastProductAddAtV13=0;

  firebaseConfig = {
  apiKey: "AIzaSyCtBotFdwreDoMPu9_1hm76f7LB13jZaBw",
  authDomain: "hhhfddv-f3884.firebaseapp.com",
  databaseURL: "https://hhhfddv-f3884-default-rtdb.firebaseio.com",
  projectId: "hhhfddv-f3884",
  storageBucket: "hhhfddv-f3884.firebasestorage.app",
  messagingSenderId: "17966992020",
  appId: "1:17966992020:web:f59597fe10e5ed5a768281",
  measurementId: "G-QPWGLZ74B2"
};

  function activeV13(name){return (state[name]||[]).filter(function(x){return x&&!x.isDeleted;});}
  function productsV13(){return activeV13("products").filter(function(p){return p&&(p.id||p.name||p.barcode);});}
  function productPiecePriceV13(p){try{return productPieceSale(p);}catch(e){return toNumber(p.salePiecePrice||p.price||0);}}
  function productUnitPriceV13(p){try{return productUnitSale(p);}catch(e){return toNumber(p.unitSalePrice||0);}}
  function productCostV13(p){try{return productPieceCost(p);}catch(e){return toNumber(p.wholesalePiecePrice||0);}}
  function safeImgV13(p){
    if(p&&p.imageUrl)return '<img src="'+esc(p.imageUrl)+'" loading="lazy" decoding="async" onerror="this.outerHTML=\'<div class=&quot;prod-fallback&quot;>📦</div>\'">';
    return '<div class="prod-fallback">📦</div>';
  }
  function cartSignatureV13(){
    try{return JSON.stringify(cashierCart.map(function(it){return [it.productId||"",it.name||"",toNumber(it.quantity),toNumber(it.price),it.saleMode||""]; }));}
    catch(e){return "";}
  }
  function fixLabelsV13(){
    try{
      routes=routes.filter(function(r){return r.id!=="debts";});
      routes.forEach(function(r){
        if(r.id==="customers"){r.title="الديون";r.subtitle="العملاء والديون والسداد";r.icon="debt";}
        if(r.id==="invoices"){r.title="الكاشير";r.subtitle="بيع سريع بالباركود وفاتورة مباشرة";}
      });
      bottomIds=["dashboard","invoices","customers","accounts","suppliers","products"];
      document.querySelectorAll("#bottomNav [data-nav='customers'] span").forEach(function(s){s.textContent="الديون";});
      document.querySelectorAll("#sideNav [data-nav='customers'] span").forEach(function(s){s.textContent="الديون";});
    }catch(e){}
  }

  templates.invoices=function(){
    return '<div class="section-head"><div><h3>الكاشير</h3><p>اضغط على المنتج أو امسح الباركود، وسيضاف المنتج للسلة فورًا. زر الفاتورة المباشرة للأصناف غير الموجودة في المخزون.</p></div><div class="actions"><button class="btn secondary" id="pairMobileBtn" type="button">ربط الجوال</button><button class="btn ghost" id="clearInvoiceBtn" type="button">تفريغ السلة</button></div></div>'+ 
    '<div id="p2pPanel" class="p2p-panel hidden"></div>'+ 
    '<div class="cashier-shell cashier-v13">'+
      '<div class="card cart-panel"><div class="cart-title-row"><h3 style="margin-top:0;font-family:Cairo">السلة</h3><span class="chip success" id="cartCountV13">0 صنف</span></div>'+ 
        '<div class="form-grid">'+
          '<label class="suggest-wrap">اسم العميل<input id="invCustomerName" placeholder="اكتب أول حرفين"><div id="invCustomerSuggest" class="suggest-box"></div><div id="invCustomerDebtInfo" style="margin-top:8px"></div></label>'+ 
          '<label>رقم الجوال<input id="invPhone" inputmode="tel"></label>'+ 
          '<label>المبلغ المدفوع<input id="invPaidAmount" type="number" min="0" step="0.01"></label>'+ 
          '<label>الحساب<select id="invPaidAccount"></select></label>'+ 
          '<label>التاريخ<input id="invDate" type="date"></label>'+ 
        '</div>'+ 
        '<div id="invoiceItems" class="cart-grid"></div>'+ 
        '<div class="invoice-total"><span>الإجمالي</span><span class="money" id="invoiceTotal">0</span></div>'+ 
        '<div class="invoice-total"><span>المتبقي كدين</span><span class="money" id="invoiceRemaining">0</span></div>'+ 
        '<div class="actions cashier-actions-v13" style="margin-top:12px"><button class="btn primary" id="saveInvoiceBtn" type="button">حفظ الفاتورة</button><button class="btn ghost" id="printInvoiceBtn" type="button">طباعة حرارية</button><button class="btn secondary" id="scanInvoiceBarcodeBtn" type="button">كاميرا</button><button class="btn ghost" id="directInvoiceBtn" type="button">فاتورة مباشرة</button></div>'+ 
      '</div>'+ 
      '<div class="card products-panel"><div class="section-head" style="margin-top:0"><div><h3 id="cashierProductTitle">الأكثر طلبًا</h3><p id="cashierProductsHint">تظهر المنتجات من التخزين المحلي، ثم تتحدث من Firebase عند الاتصال.</p></div></div>'+ 
        '<input id="cashierProductSearch" class="cashier-search" placeholder="بحث بالاسم أو الباركود">'+
        '<div id="popularProducts" class="product-pick-grid popular"></div><div id="cashierProducts" class="product-pick-grid hidden"></div>'+ 
      '</div>'+ 
    '</div>'+ 
    '<div class="card invoice-history-v13" style="margin-top:14px"><h3 style="margin-top:0;font-family:Cairo">سجل الكاشير</h3><div class="searchbar"><input id="invoiceSearch" placeholder="بحث باسم العميل أو الجوال"></div><div id="invoiceList"></div></div>';
  };

  function buildNavV13(){
    fixLabelsV13();
    html("sideNav",routes.map(function(r){return '<button class="nav-btn" data-nav="'+r.id+'">'+icon(r.icon)+'<span>'+r.title+'</span></button>';}).join(""));
    html("bottomNav",routes.filter(function(r){return bottomIds.includes(r.id);}).map(function(r){var title=r.id==="customers"?"الديون":r.title;return '<button class="nav-btn" data-nav="'+r.id+'">'+icon(r.icon)+'<span>'+title+'</span></button>';}).join(""));
    fixLabelsV13();
  }
  buildNav=buildNavV13;

  function cardV13(p){
    return '<button type="button" class="pick-card" data-pick-product="'+esc(p.id)+'" data-barcode="'+esc(p.barcode||"")+'"><div class="pick-img">'+safeImgV13(p)+'</div><b>'+esc(p.name||"منتج")+'</b><small>'+money(productPiecePriceV13(p))+'</small><span>المخزون: '+fmt(p.quantity||0)+'</span></button>';
  }
  function sortedProductsV13(q){
    var counts={};
    activeV13("invoices").forEach(function(inv){(inv.items||[]).forEach(function(it){if(it.productId)counts[it.productId]=(counts[it.productId]||0)+toNumber(it.stockQty||it.quantity||1);});});
    var arr=productsV13();
    if(q){
      return arr.filter(function(p){return ((p.name||"")+" "+(p.barcode||"")+" "+(p.category||"")).toLowerCase().indexOf(q)!==-1;}).slice(0,80);
    }
    return arr.sort(function(a,b){
      var ca=counts[a.id]||0, cb=counts[b.id]||0;
      if(cb!==ca)return cb-ca;
      return toNumber(b.updatedAt||b.createdAt||0)-toNumber(a.updatedAt||a.createdAt||0);
    }).slice(0, window.innerWidth>900?12:8);
  }
  function renderCashierProductsV13(){
    var target=$("popularProducts"); if(!target)return;
    var q=(val("cashierProductSearch")||"").trim().toLowerCase();
    var list=sortedProductsV13(q);
    var title=$("cashierProductTitle"); if(title)title.textContent=q?"نتائج البحث":"الأكثر طلبًا";
    var hint=$("cashierProductsHint"); if(hint)hint.textContent=q?"نتائج البحث، اضغط على المنتج لإضافته للسلة.":"اضغط على المنتج أو استخدم قارئ الباركود للإضافة التلقائية.";
    target.innerHTML=list.length?list.map(cardV13).join(""):'<div class="empty">لا توجد منتجات ظاهرة. جاري فحص التخزين المحلي و Firebase...</div>';
    var old=$("cashierProducts"); if(old){old.innerHTML="";old.classList.add("hidden");}
    document.querySelectorAll("[data-pick-product]").forEach(function(btn){btn.onclick=function(){addProductToCart(btn.dataset.pickProduct,"piece");};});
  }
  renderCashierProducts=renderCashierProductsV13;

  function hydrateCashierV13(forceFirebase){
    if(state.route!=="invoices"||cashierHydratingV13)return Promise.resolve();
    cashierHydratingV13=true;
    return Promise.all([
      getAll("products").then(function(r){state.products=r||[];}),
      getAll("invoices").then(function(r){state.invoices=r||[];}),
      getAll("accounts").then(function(r){state.accounts=r||[];}),
      getAll("customers").then(function(r){state.customers=r||[];})
    ]).then(function(){
      renderAccountOptions(); renderCashierProductsV13(); renderCart(); renderInvoices();
      if(forceFirebase && navigator.onLine && !firebasePulledForCashierV13){
        firebasePulledForCashierV13=true;
        return pullFirebase().then(loadAll).then(function(){renderAccountOptions();renderCashierProductsV13();renderCart();renderInvoices();});
      }
    }).catch(function(){renderCashierProductsV13();}).finally(function(){cashierHydratingV13=false;});
  }

  function setPaidToTotalV13(total){
    var paid=$("invPaidAmount"); if(!paid)return;
    var sig=cartSignatureV13();
    if(sig!==lastPaidCartSigV13){
      lastPaidCartSigV13=sig;
      if(!paidEditedV13 || paid.value==="" || toNumber(paid.value)===0){
        paid.value=total>0?String(Number(total.toFixed(2))):"";
      }
    }
  }
  calcInvoiceTotal=function(){
    var total=cashierCart.reduce(function(s,it){return s+cartItemTotal(it);},0);
    setPaidToTotalV13(total);
    var paid=toNumber(val("invPaidAmount"));
    text("invoiceTotal",money(total));
    text("invoiceRemaining",money(Math.max(0,total-paid)));
    return total;
  };

  addProductToCart=function(productId,mode){
    mode=mode||"piece";
    var addKey=String(productId||"")+":"+mode, addNow=Date.now();
    if(addKey===lastProductAddKeyV13 && addNow-lastProductAddAtV13<320)return true;
    lastProductAddKeyV13=addKey; lastProductAddAtV13=addNow;
    var p=productsV13().find(function(x){return x.id===productId;});
    if(!p){toast("المنتج غير موجود","danger");try{sendP2P({type:"miss",code:productId});}catch(e){}return false;}
    var unitOk=mode==="unit"&&toNumber(p.unitPieces)>0;
    var saleMode=unitOk?"unit":"piece";
    var existing=cashierCart.find(function(x){return x.productId===p.id && !x.manual && x.saleMode===saleMode;});
    if(existing){
      existing.quantity=toNumber(existing.quantity)+1;
      existing.price=saleMode==="unit"?productUnitPriceV13(p):productPiecePriceV13(p);
      renderCart(); toast("تمت زيادة الكمية: "+(p.name||"منتج"),"success"); try{pushP2PAll();}catch(e){} return true;
    }
    cashierCart.push({id:uid("cart"),productId:p.id,manual:false,name:p.name||"منتج",imageUrl:p.imageUrl||"",barcode:p.barcode||"",saleMode:saleMode,unitName:p.unitName||"",unitPieces:toNumber(p.unitPieces||0),quantity:1,price:saleMode==="unit"?productUnitPriceV13(p):productPiecePriceV13(p),wholesalePiecePrice:productCostV13(p),unitSalePrice:productUnitPriceV13(p),pieceSalePrice:productPiecePriceV13(p)});
    renderCart(); toast("تمت إضافة: "+(p.name||"منتج"),"success"); try{pushP2PAll();}catch(e){} return true;
  };
  addProductToCartByBarcode=function(code){
    code=String(code||"").trim(); if(!code)return false;
    var p=productsV13().find(function(x){return String(x.barcode||"").trim()===code || String(x.id||"").trim()===code;});
    if(!p){toast("المنتج غير موجود: "+code,"danger");try{sendP2P({type:"miss",code:code});}catch(e){}return false;}
    return addProductToCart(p.id,"piece");
  };
  setCartMode=function(i,mode){
    var it=cashierCart[i]; if(!it)return;
    if(it.manual){it.saleMode="manual";renderCart();return;}
    var p=productsV13().find(function(x){return x.id===it.productId;})||{};
    var unitOk=mode==="unit"&&toNumber(p.unitPieces)>0;
    it.saleMode=unitOk?"unit":"piece";
    it.price=it.saleMode==="unit"?productUnitPriceV13(p):productPiecePriceV13(p);
    it.unitPieces=toNumber(p.unitPieces||0); it.unitName=p.unitName||"";
    renderCart();
  };
  cartItemStockQty=function(it){if(it&&it.manual)return 0;return toNumber(it.quantity)*(it.saleMode==="unit"?toNumber(it.unitPieces||1):1);};
  cartItemCost=function(it){if(it&&it.manual)return 0;return cartItemStockQty(it)*toNumber(it.wholesalePiecePrice||0);};
  cartItemTotal=function(it){return toNumber(it.quantity)*toNumber(it.price);};
  getInvoiceItems=function(){
    return cashierCart.map(function(it){var total=cartItemTotal(it),cost=cartItemCost(it);return {productId:it.productId||"",manual:!!it.manual,direct:!!it.direct,name:it.name||"",imageUrl:it.imageUrl||"",quantity:toNumber(it.quantity),saleMode:it.saleMode||"piece",unitName:it.unitName||"",unitPieces:toNumber(it.unitPieces||0),stockQty:it.manual?0:cartItemStockQty(it),price:toNumber(it.price),total:total,cost:cost,profit:total-cost};}).filter(function(i){return i.name&&i.quantity>0;});
  };

  function qtyControlV13(idx,val){
    var it=cashierCart[idx]; if(!it)return;
    it.quantity=Math.max(0,toNumber(val));
    renderCart();
  }
  renderCart=function(){
    var wrap=$("invoiceItems"); if(!wrap)return;
    var count=$("cartCountV13"); if(count)count.textContent=cashierCart.length+" صنف";
    if(!cashierCart.length){wrap.innerHTML='<div class="empty">السلة فارغة</div>';calcInvoiceTotal();try{pushP2PAll();}catch(e){}return;}
    wrap.innerHTML=cashierCart.map(function(it,idx){
      var p=productsV13().find(function(x){return x.id===it.productId;})||{};
      var unitOk=!it.manual&&toNumber(p.unitPieces)>0;
      var modeHtml=it.manual?'<span class="chip">ليس من المخزون</span>':'<select data-cart-mode="'+idx+'"><option value="piece" '+(it.saleMode==="piece"?"selected":"")+'>قطعة</option><option value="unit" '+(it.saleMode==="unit"?"selected":"")+' '+(unitOk?"":"disabled")+'>وحدة '+esc(p.unitName||"")+'</option></select>';
      return '<div class="cart-card cart-card-v13">'+
        '<div class="cart-prod-img">'+safeImgV13(it)+'</div>'+ 
        '<div class="cart-info"><b>'+esc(it.name||"-")+'</b><small>'+(it.manual?'فاتورة مباشرة':('مخزون: '+fmt(p.quantity||0)+' قطعة'))+'</small></div>'+ 
        '<label>نوع البيع'+modeHtml+'</label>'+ 
        '<label>الكمية<div class="qty-step-v13"><button type="button" data-cart-minus="'+idx+'">-</button><input data-cart-qty="'+idx+'" type="number" min="0" step="1" value="'+esc(it.quantity)+'"><button type="button" data-cart-plus="'+idx+'">+</button></div></label>'+ 
        '<label>السعر<input data-cart-price="'+idx+'" type="number" min="0" step="0.01" value="'+esc(it.price)+'"></label>'+ 
        '<div class="cart-total">'+money(cartItemTotal(it))+'</div><button class="btn small danger" data-cart-remove="'+idx+'" type="button">حذف</button>'+ 
      '</div>';
    }).join("");
    document.querySelectorAll("[data-cart-mode]").forEach(function(el){el.onchange=function(){setCartMode(+this.dataset.cartMode,this.value);};});
    document.querySelectorAll("[data-cart-minus]").forEach(function(el){el.onclick=function(){var i=+this.dataset.cartMinus;qtyControlV13(i,toNumber(cashierCart[i].quantity)-1);};});
    document.querySelectorAll("[data-cart-plus]").forEach(function(el){el.onclick=function(){var i=+this.dataset.cartPlus;qtyControlV13(i,toNumber(cashierCart[i].quantity)+1);};});
    document.querySelectorAll("[data-cart-qty]").forEach(function(el){
      el.oninput=function(){var i=+this.dataset.cartQty;if(cashierCart[i])cashierCart[i].quantity=toNumber(this.value);calcInvoiceTotal();try{pushP2PAll();}catch(e){}};
      el.onkeydown=function(e){var i=+this.dataset.cartQty;if(e.key==="+"||e.key==="ArrowUp"){e.preventDefault();qtyControlV13(i,toNumber(cashierCart[i].quantity)+1);}if(e.key==="-"||e.key==="ArrowDown"){e.preventDefault();qtyControlV13(i,toNumber(cashierCart[i].quantity)-1);}};
    });
    document.querySelectorAll("[data-cart-price]").forEach(function(el){el.oninput=function(){var i=+this.dataset.cartPrice;if(cashierCart[i])cashierCart[i].price=toNumber(this.value);calcInvoiceTotal();try{pushP2PAll();}catch(e){}};});
    document.querySelectorAll("[data-cart-remove]").forEach(function(el){el.onclick=function(){cashierCart.splice(+this.dataset.cartRemove,1);renderCart();};});
    calcInvoiceTotal(); try{pushP2PAll();}catch(e){}
  };

  function openDirectInvoiceModalV13(){
    var modal=document.createElement("div");
    modal.className="direct-modal-v13";
    modal.innerHTML='<div class="direct-card-v13"><div class="section-head" style="margin:0 0 12px"><div><h3>فاتورة مباشرة</h3><p>أضف أصنافًا ليست من المخزون: اسم الصنف، السعر، والكمية.</p></div><button class="btn ghost small" id="directCloseV13" type="button">إغلاق</button></div><div id="directRowsV13" class="direct-rows-v13"></div><div class="actions" style="margin-top:12px"><button class="btn secondary" id="directAddRowV13" type="button">إضافة صنف آخر</button><button class="btn primary" id="directSaveV13" type="button">إضافة للسلة</button></div></div>';
    document.body.appendChild(modal);
    function addRow(){
      var row=document.createElement("div"); row.className="direct-row-v13";
      row.innerHTML='<label class="direct-name">اسم الصنف<input class="d-name" placeholder="اسم الصنف"></label><label>السعر<input class="d-price" type="number" min="0" step="0.01" value="0"></label><label>الكمية<div class="qty-step-v13"><button type="button" class="d-minus">-</button><input class="d-qty" type="number" min="0" step="1" value="1"><button type="button" class="d-plus">+</button></div></label><button class="btn danger small d-del" type="button">حذف</button>';
      function change(delta){var q=row.querySelector(".d-qty");q.value=Math.max(0,toNumber(q.value)+delta);q.focus();}
      row.querySelector(".d-plus").onclick=function(){change(1);};
      row.querySelector(".d-minus").onclick=function(){change(-1);};
      row.querySelector(".d-qty").onkeydown=function(e){if(e.key==="+"||e.key==="ArrowUp"){e.preventDefault();change(1);}if(e.key==="-"||e.key==="ArrowDown"){e.preventDefault();change(-1);}};
      row.querySelector(".d-del").onclick=function(){row.remove();};
      modal.querySelector("#directRowsV13").appendChild(row);
      row.querySelector(".d-name").focus();
    }
    addRow();
    modal.querySelector("#directAddRowV13").onclick=addRow;
    modal.querySelector("#directCloseV13").onclick=function(){modal.remove();};
    modal.addEventListener("click",function(e){if(e.target===modal)modal.remove();});
    modal.querySelector("#directSaveV13").onclick=function(){
      var added=0;
      modal.querySelectorAll(".direct-row-v13").forEach(function(row){
        var name=row.querySelector(".d-name").value.trim(), price=toNumber(row.querySelector(".d-price").value), qty=toNumber(row.querySelector(".d-qty").value)||1;
        if(!name||price<=0)return;
        cashierCart.push({id:uid("direct_cart"),productId:"",manual:true,direct:true,name:name,imageUrl:"",barcode:"",saleMode:"manual",unitName:"",unitPieces:1,quantity:qty,price:price,wholesalePiecePrice:0,unitSalePrice:price,pieceSalePrice:price});
        added++;
      });
      if(!added){toast("أدخل اسم وسعر صنف واحد على الأقل","warning");return;}
      modal.remove(); renderCart(); toast("تمت إضافة الفاتورة المباشرة للسلة","success");
    };
  }
  addManualItemToCart=openDirectInvoiceModalV13;

  clearInvoiceForm=function(){
    cashierCart=[]; paidEditedV13=false; lastPaidCartSigV13="";
    ["invCustomerName","invPhone","invPaidAmount"].forEach(function(id){setVal(id,"");});
    setDates(); renderAccountOptions(); renderCart(); calcInvoiceTotal(); try{pushP2PAll();}catch(e){}
  };
  saveInvoice=function(){
    var total=cashierCart.reduce(function(s,it){return s+cartItemTotal(it);},0);
    if(total>0 && !paidEditedV13 && (!val("invPaidAmount") || toNumber(val("invPaidAmount"))===0))setVal("invPaidAmount",String(Number(total.toFixed(2))));
    var name=val("invCustomerName").trim()||"زبون نقدي", phone=val("invPhone").trim(), date=val("invDate")||today(), paid=toNumber(val("invPaidAmount")), acc=val("invPaidAccount"), items=getInvoiceItems();
    total=items.reduce(function(s,i){return s+i.total;},0);
    var cost=items.reduce(function(s,i){return s+i.cost;},0), profit=total-cost, rem=Math.max(0,total-paid);
    if(!items.length){toast("السلة فارغة","warning");return;}
    if(paid>0&&!acc){toast("اختر الحساب","warning");return;}
    var bad=items.find(function(it){if(!it.productId)return false;var p=productsV13().find(function(x){return x.id===it.productId;});return p&&toNumber(p.quantity)<toNumber(it.stockQty);});
    if(bad){toast("الكمية غير كافية للصنف: "+bad.name,"danger");return;}
    upsertCustomer(name,phone).then(function(c){
      var inv=nowBase({id:uid("invoice"),customerId:c.id,customerName:name,phone:phone,date:date,items:items,total:total,paid:paid,remaining:rem,cost:cost,profit:profit,accountId:acc,qrValue:"INV|"+name+"|"+total+"|"+paid+"|"+rem});
      return putOne("invoices",inv).then(function(){return queueSync("invoices",inv.id,"create",inv);}).then(function(){
        state.lastInvoice=inv; var tasks=[];
        items.forEach(function(it){if(!it.productId)return;tasks.push(getOne("products",it.productId).then(function(p){if(p){p.quantity=Math.max(0,toNumber(p.quantity)-toNumber(it.stockQty));p.updatedAt=Date.now();p.syncStatus="pending";return putOne("products",p).then(function(){return queueSync("products",p.id,"update",p);});}}));});
        if(paid>0){
          var t=nowBase({id:uid("txn"),accountId:acc,type:"income",amount:paid,date:date,note:"دفعة من فاتورة "+name,source:"invoice",sourceId:inv.id});
          tasks.push(putOne("transactions",t).then(function(){return queueSync("transactions",t.id,"create",t);}));
          var sale=nowBase({id:uid("sale"),customerId:c.id,name:name,amount:paid,phone:phone,paymentMethod:"account",accountId:acc,source:"invoice",sourceId:inv.id,date:date});
          tasks.push(putOne("dailySales",sale).then(function(){return queueSync("dailySales",sale.id,"create",sale);}));
        }
        if(rem>0){
          var d=nowBase({id:uid("debt"),customerId:c.id,customerName:name,phone:phone,invoiceId:inv.id,amount:rem,paid:0,remaining:rem,status:"unpaid",date:date,items:items,source:"invoice"});
          tasks.push(putOne("debts",d).then(function(){return queueSync("debts",d.id,"create",d);}));
        }
        return Promise.all(tasks);
      });
    }).then(loadAll).then(function(){clearInvoiceForm();renderCurrent();toast("تم حفظ الفاتورة","success");});
  };

  function bindInvoiceV13(){
    try{bindCustomerSuggest("invCustomerName","invCustomerSuggest","invPhone","invCustomerDebtInfo");}catch(e){}
    var pair=$("pairMobileBtn"); if(pair)pair.onclick=showPairing;
    var scan=$("scanInvoiceBarcodeBtn"); if(scan)scan.onclick=scanInvoiceProduct;
    var save=$("saveInvoiceBtn"); if(save)save.onclick=saveInvoice;
    var clear=$("clearInvoiceBtn"); if(clear)clear.onclick=clearInvoiceForm;
    var print=$("printInvoiceBtn"); if(print)print.onclick=printLastInvoice;
    var direct=$("directInvoiceBtn"); if(direct)direct.onclick=openDirectInvoiceModalV13;
    var search=$("cashierProductSearch"); if(search)search.oninput=renderCashierProductsV13;
    var invSearch=$("invoiceSearch"); if(invSearch)invSearch.oninput=renderInvoices;
    var paid=$("invPaidAmount"); if(paid){paid.oninput=function(){paidEditedV13=true;calcInvoiceTotal();};}
    var customer=$("invCustomerName"); if(customer)customer.addEventListener("input",function(){try{updateCustomerDebtInfo("invCustomerName","invCustomerDebtInfo");}catch(e){};});
  }
  var oldBindPageV13=bindPage;
  bindPage=function(){
    if(state.route==="invoices"){bindInvoiceV13();return;}
    oldBindPageV13(); fixLabelsV13();
  };
  var oldRenderCurrentV13=renderCurrent;
  renderCurrent=function(){
    if(state.route!=="invoices"){oldRenderCurrentV13();fixLabelsV13();return;}
    applyBrand(); renderAccountOptions(); renderCart(); renderCashierProductsV13(); renderInvoices(); calcInvoiceTotal(); try{enhanceSearchSelects();}catch(e){};
    setTimeout(function(){hydrateCashierV13(false);},30);
    setTimeout(function(){hydrateCashierV13(true);},350);
  };
  navigate=function(id){
    fixLabelsV13();
    var r=routes.find(function(x){return x.id===id;})||routes[0];
    state.route=r.id; localStorage.setItem("sales_last_route",r.id); setMeta(r); html("pageHost",templates[r.id]()); setDates(); bindPage(); renderCurrent(); try{enhanceSearchSelects();}catch(e){};
    fixLabelsV13();
    if(r.id==="invoices"){setTimeout(function(){hydrateCashierV13(false);},50);setTimeout(function(){hydrateCashierV13(true);},500);setTimeout(function(){hydrateCashierV13(false);},1200);}
  };

  function scannedBarcodeV13(code){
    code=String(code||"").trim(); if(!code||code.length<3)return;
    if(state.route==="invoices"){
      if(!addProductToCartByBarcode(code))hydrateCashierV13(true).then(function(){addProductToCartByBarcode(code);});
      return;
    }
    if(state.route==="products"||state.route==="purchases"){
      var input=$("productBarcode"); if(input){input.value=code;input.dispatchEvent(new Event("input",{bubbles:true}));toast("تم قراءة الباركود: "+code,"success");}
    }
  }
  document.addEventListener("keydown",function(e){
    if(e.ctrlKey||e.altKey||e.metaKey)return;
    var now=Date.now();
    if(now-barcodeLastKeyV13>110)barcodeBufferV13="";
    barcodeLastKeyV13=now;
    if(e.key==="Enter"){
      var code=barcodeBufferV13.trim(); barcodeBufferV13="";
      if(code.length>=3){scannedBarcodeV13(code);e.preventDefault();}
      return;
    }
    if(e.key&&e.key.length===1){
      barcodeBufferV13+=e.key;
      clearTimeout(barcodeTimerV13);
      barcodeTimerV13=setTimeout(function(){var code=barcodeBufferV13.trim();barcodeBufferV13="";if(code.length>=8)scannedBarcodeV13(code);},130);
    }
  },true);

  function resetBrowserCacheV13(){
    try{
      if(window.caches&&caches.keys){
        caches.keys().then(function(keys){return Promise.all(keys.filter(function(k){return k.indexOf("sales-webapp-v13")===-1;}).map(function(k){return caches.delete(k);}));}).catch(function(){});
      }
      if("serviceWorker" in navigator){navigator.serviceWorker.getRegistrations().then(function(regs){regs.forEach(function(r){try{r.update();}catch(e){}});}).catch(function(){});}
    }catch(e){}
  }
  document.addEventListener("DOMContentLoaded",function(){
    fixLabelsV13(); buildNavV13(); resetBrowserCacheV13();
    setTimeout(function(){fixLabelsV13(); if(state.route==="invoices")hydrateCashierV13(true);},250);
  });
})();

})();
