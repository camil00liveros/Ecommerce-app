/* ============================================================
   Atelier · Probador virtual
   Lógica: catálogo, prueba de prendas sobre el avatar SVG,
   carrito, pestañas, menú móvil y controles.
   ============================================================ */

// ---- Catálogo de prendas ----
const PRODUCTS = {
  camisas: [
    { id:'c1', name:'Camisa Bosque',   price:89000,  color:'Verde',  hex:'#3f6f5b' },
    { id:'c2', name:'Camisa Arena',    price:79000,  color:'Beige',  hex:'#c9b18c' },
    { id:'c3', name:'Camisa Carbón',   price:95000,  color:'Negro',  hex:'#2b2f33' },
    { id:'c4', name:'Camisa Terracota',price:85000,  color:'Teja',   hex:'#c06b4a' },
    { id:'c5', name:'Camisa Cielo',    price:82000,  color:'Azul',   hex:'#5b86a8' },
  ],
  pantalones: [
    { id:'p1', name:'Pantalón Humo',   price:120000, color:'Gris',   hex:'#6b7280' },
    { id:'p2', name:'Pantalón Caqui',  price:115000, color:'Caqui',  hex:'#a48a5e' },
    { id:'p3', name:'Pantalón Índigo', price:135000, color:'Azul',   hex:'#34406b' },
    { id:'p4', name:'Pantalón Olivo',  price:118000, color:'Olivo',  hex:'#5a6342' },
  ],
};

const fmt = n => '$' + n.toLocaleString('es-CO');

// ---- Estado ----
const state = { camisas:null, pantalones:null, cart:0 };

// ---- Refs ----
const cardsEl   = document.getElementById('cards');
const shirtPath = document.getElementById('shirt');
const collarPath= document.getElementById('shirtCollar');
const pantsPath = document.getElementById('pants');
const chipShirt = document.querySelector('#chipShirt b');
const chipPants = document.querySelector('#chipPants b');
const cartCount = document.getElementById('cartCount');
const toastEl   = document.getElementById('toast');

let currentCat = 'camisas';

// ---- SVG miniatura para la card (camisa o pantalón) ----
function thumbSVG(type, hex){
  if(type === 'camisas'){
    return `<svg viewBox="0 0 100 100"><path d="M30 22 q20 -10 40 0 q9 4 11 13 l-8 8 -5 -4 -2 40 q-20 6 -42 0 l-2 -40 -5 4 -8 -8 q2 -9 11 -13z" fill="${hex}"/></svg>`;
  }
  return `<svg viewBox="0 0 100 100"><path d="M32 18 q18 -5 36 0 l5 64 -14 1 -6 -44 h-4 l-6 44 -14 -1z" fill="${hex}"/></svg>`;
}

// ---- Render de cards ----
function renderCards(cat){
  currentCat = cat;
  cardsEl.innerHTML = PRODUCTS[cat].map(p => `
    <article class="card ${state[cat]===p.id?'selected':''}" data-id="${p.id}" data-cat="${cat}" tabindex="0">
      <div class="card-img" style="background:linear-gradient(160deg,#fff, #f1eee7)">
        ${thumbSVG(cat, p.hex)}
      </div>
      <div class="card-body">
        <span class="card-name">${p.name}</span>
        <div class="card-meta">
          <span class="card-price">${fmt(p.price)}</span>
          <span class="card-color"><span class="swatch" style="background:${p.hex}"></span>${p.color}</span>
        </div>
        <button class="try-btn">${state[cat]===p.id?'Puesto ✓':'Probar'}</button>
      </div>
    </article>
  `).join('');
}

// ---- Aplicar prenda al avatar ----
function applyGarment(cat, id){
  const item = PRODUCTS[cat].find(p => p.id === id);
  if(!item) return;
  state[cat] = id;

  if(cat === 'camisas'){
    shirtPath.setAttribute('fill', item.hex);
    collarPath.setAttribute('fill', shade(item.hex, -18));
    chipShirt.textContent = item.name;
  } else {
    pantsPath.setAttribute('fill', item.hex);
    chipPants.textContent = item.name;
  }
  renderCards(cat);
  showToast(`${item.name} colocada sobre el modelo`);
}

// ---- Oscurecer un hex (para el cuello de la camisa) ----
function shade(hex, pct){
  const n = parseInt(hex.slice(1),16);
  let r=(n>>16)+pct, g=((n>>8)&255)+pct, b=(n&255)+pct;
  r=Math.max(0,Math.min(255,r));g=Math.max(0,Math.min(255,g));b=Math.max(0,Math.min(255,b));
  return '#'+((r<<16)|(g<<8)|b).toString(16).padStart(6,'0');
}

// ---- Toast ----
let toastTimer;
function showToast(msg){
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>toastEl.classList.remove('show'), 1800);
}

// ---- Eventos de cards (delegación) ----
cardsEl.addEventListener('click', e => {
  const card = e.target.closest('.card');
  if(!card) return;
  const { id, cat } = card.dataset;

  if(e.target.classList.contains('try-btn') || !e.target.closest('.try-btn')){
    applyGarment(cat, id);
    // Si tocaron el botón Probar -> también suma al carrito
    if(e.target.classList.contains('try-btn')) addToCart();
  }
});
cardsEl.addEventListener('keydown', e => {
  if(e.key==='Enter' || e.key===' '){
    const card = e.target.closest('.card');
    if(card){ e.preventDefault(); applyGarment(card.dataset.cat, card.dataset.id); }
  }
});

// ---- Carrito ----
function addToCart(){
  state.cart++;
  cartCount.textContent = state.cart;
  cartCount.classList.add('bump');
  setTimeout(()=>cartCount.classList.remove('bump'), 220);
}
document.getElementById('cartBtn').addEventListener('click', ()=>{
  showToast(state.cart ? `Tienes ${state.cart} prenda(s) en el carrito` : 'Tu carrito está vacío');
});

// ---- Pestañas ----
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => {
      t.classList.remove('is-active'); t.setAttribute('aria-selected','false');
    });
    tab.classList.add('is-active'); tab.setAttribute('aria-selected','true');
    renderCards(tab.dataset.cat);
  });
});

// ---- Controles del avatar ----
const avatar = document.getElementById('avatar');
document.getElementById('rotateBtn').addEventListener('click', ()=> avatar.classList.toggle('flip'));
document.getElementById('resetBtn').addEventListener('click', ()=>{
  state.camisas = null; state.pantalones = null;
  shirtPath.setAttribute('fill','#cdd2d8');
  collarPath.setAttribute('fill','#b9bfc6');
  pantsPath.setAttribute('fill','#cdd2d8');
  chipShirt.textContent = '—'; chipPants.textContent = '—';
  renderCards(currentCat);
  showToast('Prendas retiradas');
});

// ---- Menú móvil ----
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');
hamburger.addEventListener('click', ()=>{
  const open = nav.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', open);
});
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', ()=> nav.classList.remove('open')));

// ---- Footer: suscripción y CTA ----
document.getElementById('ctaGive').addEventListener('click', ()=>{
  const email = document.getElementById('subEmail').value.trim();
  if(email && /\S+@\S+\.\S+/.test(email)) showToast('¡Listo! Revisa tu correo para el 15% de descuento.');
  else showToast('Ingresa un email válido para suscribirte.');
});

// ---- Init ----
renderCards('camisas');
