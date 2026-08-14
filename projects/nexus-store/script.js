/* ============================================================
   NEXUS STORE — Main JavaScript
   Cart, animations, theme toggle, scroll effects
   ============================================================ */

'use strict';

/* ── State ── */
const Store = {
  cart: JSON.parse(localStorage.getItem('nexus_cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('nexus_wishlist') || '[]'),
  theme: localStorage.getItem('nexus_theme') || 'dark',

  saveCart() {
    localStorage.setItem('nexus_cart', JSON.stringify(this.cart));
    updateCartUI();
  },
  saveWishlist() {
    localStorage.setItem('nexus_wishlist', JSON.stringify(this.wishlist));
  },

  addToCart(product) {
    const existing = this.cart.find(i => i.id === product.id);
    if (existing) {
      existing.qty = Math.min(existing.qty + 1, 10);
    } else {
      this.cart.push({ ...product, qty: 1 });
    }
    this.saveCart();
    showToast(`✓ ${product.name} added to cart`);
    animateCartIcon();
  },

  removeFromCart(id) {
    this.cart = this.cart.filter(i => i.id !== id);
    this.saveCart();
  },

  updateQty(id, qty) {
    const item = this.cart.find(i => i.id === id);
    if (item) { item.qty = Math.max(1, Math.min(10, qty)); }
    this.saveCart();
  },

  toggleWishlist(product) {
    const idx = this.wishlist.findIndex(i => i.id === product.id);
    if (idx === -1) {
      this.wishlist.push(product);
      showToast(`♡ ${product.name} added to wishlist`);
    } else {
      this.wishlist.splice(idx, 1);
      showToast(`Removed from wishlist`);
    }
    this.saveWishlist();
    return idx === -1;
  },

  getCartCount() {
    return this.cart.reduce((s, i) => s + i.qty, 0);
  },

  getSubtotal() {
    return this.cart.reduce((s, i) => s + i.price * i.qty, 0);
  }
};

/* ── Sample Products ── */
const PRODUCTS = [
  { id: 1,  name: 'Aurora Pro Headphones',     category: 'Electronics', price: 299,  oldPrice: 399,  rating: 4.8, reviews: 1243, badge: 'Hot',      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80' },
  { id: 2,  name: 'Quantum Smartwatch X',       category: 'Electronics', price: 449,  oldPrice: 599,  rating: 4.7, reviews: 876,  badge: 'New',      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80' },
  { id: 3,  name: 'Minimal Sneakers Pro',       category: 'Fashion',     price: 189,  oldPrice: 249,  rating: 4.6, reviews: 654,  badge: 'Sale',     image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80' },
  { id: 4,  name: 'Neon Glow Backpack',         category: 'Fashion',     price: 129,  oldPrice: null, rating: 4.5, reviews: 432,  badge: null,       image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80' },
  { id: 5,  name: 'Crystal Serum Collection',   category: 'Beauty',      price: 89,   oldPrice: 120,  rating: 4.9, reviews: 2108, badge: 'Hot',      image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&q=80' },
  { id: 6,  name: 'ArcLight Desk Lamp',         category: 'Home',        price: 159,  oldPrice: 199,  rating: 4.7, reviews: 567,  badge: 'New',      image: 'https://images.unsplash.com/photo-1513506003901-1e6a35b7bf4c?w=400&q=80' },
  { id: 7,  name: 'Levity Drone V2',            category: 'Electronics', price: 599,  oldPrice: 799,  rating: 4.6, reviews: 321,  badge: 'Sale',     image: 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=400&q=80' },
  { id: 8,  name: 'NovaCam Mirrorless',         category: 'Electronics', price: 1299, oldPrice: 1599, rating: 4.9, reviews: 1876, badge: 'Hot',      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80' },
  { id: 9,  name: 'Silk Oversized Jacket',      category: 'Fashion',     price: 219,  oldPrice: null, rating: 4.5, reviews: 289,  badge: 'New',      image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80' },
  { id: 10, name: 'Zen Diffuser Set',           category: 'Home',        price: 69,   oldPrice: 95,   rating: 4.8, reviews: 1542, badge: 'Sale',     image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&q=80' },
  { id: 11, name: 'Cloud Wireless Earbuds',     category: 'Electronics', price: 179,  oldPrice: 229,  rating: 4.7, reviews: 934,  badge: null,       image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80' },
  { id: 12, name: 'Obsidian Perfume',           category: 'Beauty',      price: 145,  oldPrice: null, rating: 4.6, reviews: 445,  badge: 'New',      image: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&q=80' },
];

/* ── DOM Ready ── */
document.addEventListener('DOMContentLoaded', () => {
  initLoading();
  initTheme();
  initNavbar();
  initMobileNav();
  initBackToTop();
  initScrollReveal();
  updateCartUI();
  initCountdown();
  initProductPage();
  initCartPage();
  initCheckout();
  initShopPage();
  initProfilePage();
});

/* ── Loading Screen ── */
function initLoading() {
  const screen = document.getElementById('loading-screen');
  if (!screen) return;
  setTimeout(() => screen.classList.add('hidden'), 1600);
}

/* ── Theme ── */
function initTheme() {
  document.documentElement.setAttribute('data-theme', Store.theme);
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  updateThemeIcon(btn);
  btn.addEventListener('click', () => {
    Store.theme = Store.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('nexus_theme', Store.theme);
    document.documentElement.setAttribute('data-theme', Store.theme);
    updateThemeIcon(btn);
  });
}
function updateThemeIcon(btn) {
  btn.innerHTML = Store.theme === 'dark'
    ? '<i class="fas fa-sun"></i>'
    : '<i class="fas fa-moon"></i>';
}

/* ── Navbar Scroll ── */
function initNavbar() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });
}

/* ── Mobile Nav ── */
function initMobileNav() {
  const toggle = document.querySelector('.hamburger');
  const drawer = document.querySelector('.mobile-nav');
  if (!toggle || !drawer) return;
  toggle.addEventListener('click', () => {
    drawer.classList.toggle('open');
    toggle.classList.toggle('active');
  });
}

/* ── Back to Top ── */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ── Scroll Reveal ── */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  els.forEach(el => obs.observe(el));
}

/* ── Cart UI ── */
function updateCartUI() {
  const count = Store.getCartCount();
  document.querySelectorAll('.cart-badge').forEach(badge => {
    badge.textContent = count;
    badge.classList.toggle('show', count > 0);
  });
  renderCartPage();
}

function animateCartIcon() {
  const btn = document.querySelector('.cart-nav-btn');
  if (!btn) return;
  btn.classList.add('pop');
  setTimeout(() => btn.classList.remove('pop'), 400);
}

/* ── Toast ── */
function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.innerHTML = `<i class="fas fa-check-circle"></i><span></span>`;
    document.body.appendChild(toast);
  }
  toast.querySelector('span').textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ── Countdown Timer ── */
function initCountdown() {
  const ends = new Date(Date.now() + 2 * 60 * 60 * 1000 + 34 * 60 * 1000 + 22 * 1000);
  function tick() {
    const diff = ends - Date.now();
    if (diff <= 0) return;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = String(val).padStart(2, '0'); };
    set('cd-h', h); set('cd-m', m); set('cd-s', s);
  }
  tick();
  setInterval(tick, 1000);
}

/* ── HOME: Product Grids ── */
function renderProductCard(p, small = false) {
  const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : null;
  return `
    <div class="product-card reveal" onclick="window.location='product.html?id=${p.id}'">
      <div class="product-card-img">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <div class="product-card-badges">
          ${p.badge ? `<span class="badge ${p.badge==='Sale'?'badge-coral':p.badge==='New'?'badge-cyan':'badge-primary'}">${p.badge}</span>` : ''}
          ${discount ? `<span class="badge badge-coral">-${discount}%</span>` : ''}
        </div>
        <div class="product-card-actions">
          <button class="card-action-btn" onclick="event.stopPropagation();toggleWishlistBtn(this,${p.id})" title="Wishlist">
            <i class="far fa-heart"></i>
          </button>
          <button class="card-action-btn" onclick="event.stopPropagation();window.location='product.html?id=${p.id}'" title="Quick View">
            <i class="fas fa-eye"></i>
          </button>
        </div>
      </div>
      <div class="product-card-body">
        <div class="product-card-category">${p.category}</div>
        <div class="product-card-name">${p.name}</div>
        <div class="product-card-rating">
          <span class="stars">${'★'.repeat(Math.floor(p.rating))}${'☆'.repeat(5-Math.floor(p.rating))}</span>
          <span class="rating-count">(${p.reviews.toLocaleString()})</span>
        </div>
      </div>
      <div class="product-card-footer">
        <div>
          <span class="product-price">$${p.price}</span>
          ${p.oldPrice ? `<span class="product-price-old">$${p.oldPrice}</span>` : ''}
        </div>
        <button class="add-cart-btn" onclick="event.stopPropagation();Store.addToCart(PRODUCTS.find(x=>x.id===${p.id}))" title="Add to Cart">
          <i class="fas fa-plus"></i>
        </button>
      </div>
    </div>`;
}

// Render featured products on home page
const featuredGrid = document.getElementById('featured-products');
if (featuredGrid) {
  featuredGrid.innerHTML = PRODUCTS.slice(0, 8).map(p => renderProductCard(p)).join('');
  initScrollReveal();
}

function toggleWishlistBtn(btn, id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const added = Store.toggleWishlist(p);
  const icon = btn.querySelector('i');
  icon.className = added ? 'fas fa-heart' : 'far fa-heart';
  if (added) icon.style.color = '#FF6B6B'; else icon.style.color = '';
}

/* ── SHOP PAGE ── */
function initShopPage() {
  const shopGrid = document.getElementById('shop-products-grid');
  if (!shopGrid) return;

  let filtered = [...PRODUCTS];
  let activeCategories = [];
  let maxPrice = 2000;
  let sortBy = 'popular';
  let searchQuery = '';

  function render() {
    let results = PRODUCTS.filter(p => {
      const catOk  = activeCategories.length === 0 || activeCategories.includes(p.category);
      const priceOk = p.price <= maxPrice;
      const searchOk = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return catOk && priceOk && searchOk;
    });

    if (sortBy === 'price-low')  results.sort((a,b) => a.price - b.price);
    if (sortBy === 'price-high') results.sort((a,b) => b.price - a.price);
    if (sortBy === 'rating')     results.sort((a,b) => b.rating - a.rating);
    if (sortBy === 'popular')    results.sort((a,b) => b.reviews - a.reviews);

    const count = document.getElementById('result-count');
    if (count) count.textContent = `${results.length} products`;

    shopGrid.innerHTML = results.length
      ? results.map(p => renderProductCard(p)).join('')
      : `<div style="text-align:center;padding:4rem;color:var(--text-2);grid-column:1/-1">
           <i class="fas fa-search" style="font-size:2rem;margin-bottom:1rem;display:block;color:var(--text-3)"></i>
           No products match your filters.
         </div>`;
    initScrollReveal();
  }

  // Category filters
  document.querySelectorAll('.cat-filter').forEach(cb => {
    cb.addEventListener('change', () => {
      activeCategories = [...document.querySelectorAll('.cat-filter:checked')].map(x => x.value);
      render();
    });
  });

  // Price range
  const priceSlider = document.getElementById('price-slider');
  const priceLabel  = document.getElementById('price-label');
  if (priceSlider) {
    priceSlider.addEventListener('input', () => {
      maxPrice = +priceSlider.value;
      if (priceLabel) priceLabel.textContent = `$${maxPrice}`;
      render();
    });
  }

  // Sort
  const sortSel = document.getElementById('sort-select');
  if (sortSel) sortSel.addEventListener('change', () => { sortBy = sortSel.value; render(); });

  // Search
  const searchInput = document.getElementById('shop-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => { searchQuery = searchInput.value; render(); });
  }

  // Mobile filter toggle
  const filterToggle = document.getElementById('filter-toggle');
  const sidebar = document.querySelector('.shop-sidebar');
  if (filterToggle && sidebar) {
    filterToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  }

  render();
}

/* ── PRODUCT DETAIL PAGE ── */
function initProductPage() {
  const wrap = document.getElementById('product-detail-root');
  if (!wrap) return;

  const params = new URLSearchParams(window.location.search);
  const id = +params.get('id') || 1;
  const p = PRODUCTS.find(x => x.id === id) || PRODUCTS[0];

  // Set title
  document.title = `${p.name} — Nexus Store`;

  // Gallery images (use same + generate alt views)
  const imgs = [p.image, ...PRODUCTS.filter(x=>x.id!==id).slice(0,3).map(x=>x.image)];

  let activeImg = 0;
  function renderGallery() {
    const main = document.getElementById('gallery-main-img');
    const thumbs = document.getElementById('gallery-thumbs');
    if (main) main.src = imgs[activeImg];
    if (thumbs) {
      thumbs.innerHTML = imgs.map((src,i) =>
        `<div class="gallery-thumb ${i===activeImg?'active':''}" onclick="selectThumb(${i})">
           <img src="${src}" alt="View ${i+1}" loading="lazy">
         </div>`).join('');
    }
  }
  window.selectThumb = (i) => { activeImg = i; renderGallery(); };

  // Product info
  const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : null;
  const nameEl  = document.getElementById('product-name');
  const priceEl = document.getElementById('product-price');
  const oldPriceEl = document.getElementById('product-old-price');
  const discEl  = document.getElementById('product-discount');
  const ratingEl = document.getElementById('product-rating');
  const reviewsEl = document.getElementById('product-reviews-count');
  const catEl   = document.getElementById('product-category');

  if (nameEl)     nameEl.textContent = p.name;
  if (priceEl)    priceEl.textContent = `$${p.price}`;
  if (oldPriceEl && p.oldPrice) { oldPriceEl.textContent = `$${p.oldPrice}`; oldPriceEl.style.display = ''; }
  if (discEl && discount)       { discEl.textContent = `-${discount}%`; discEl.style.display = ''; }
  if (ratingEl)   ratingEl.innerHTML = '★'.repeat(Math.floor(p.rating)) + '☆'.repeat(5-Math.floor(p.rating));
  if (reviewsEl)  reviewsEl.textContent = `(${p.reviews.toLocaleString()} reviews)`;
  if (catEl)      catEl.textContent = p.category;

  renderGallery();

  // Quantity
  let qty = 1;
  const qtyNum = document.getElementById('qty-num');
  window.changeQty = (delta) => {
    qty = Math.max(1, Math.min(10, qty + delta));
    if (qtyNum) qtyNum.textContent = qty;
  };

  // Add to cart
  const addCartBtn = document.getElementById('add-to-cart-btn');
  if (addCartBtn) {
    addCartBtn.addEventListener('click', () => {
      Store.addToCart({ ...p, qty: undefined });
    });
  }
  const buyNowBtn = document.getElementById('buy-now-btn');
  if (buyNowBtn) {
    buyNowBtn.addEventListener('click', () => {
      Store.addToCart({ ...p, qty: undefined });
      window.location.href = 'cart.html';
    });
  }

  // Related products
  const related = document.getElementById('related-products');
  if (related) {
    const rel = PRODUCTS.filter(x => x.category === p.category && x.id !== p.id).slice(0, 4);
    related.innerHTML = rel.map(x => renderProductCard(x)).join('');
    initScrollReveal();
  }
}

/* ── CART PAGE ── */
function renderCartPage() {
  const wrap = document.getElementById('cart-items-wrap');
  if (!wrap) return;

  if (Store.cart.length === 0) {
    wrap.innerHTML = `
      <div style="text-align:center;padding:5rem 2rem;color:var(--text-2)">
        <i class="fas fa-shopping-cart" style="font-size:3rem;margin-bottom:1.5rem;display:block;color:var(--text-3)"></i>
        <h3 style="font-family:var(--font-display);margin-bottom:0.5rem">Your cart is empty</h3>
        <p style="margin-bottom:2rem">Add some amazing products!</p>
        <a href="shop.html" class="btn btn-primary">Start Shopping</a>
      </div>`;
    updateCartSummary();
    return;
  }

  wrap.innerHTML = Store.cart.map(item => `
    <div class="cart-item" id="cart-item-${item.id}">
      <div class="cart-item-img">
        <img src="${item.image}" alt="${item.name}">
      </div>
      <div>
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-variant">${item.category}</div>
        <div class="qty-control" style="width:fit-content">
          <button class="qty-btn" onclick="cartQty(${item.id},-1)"><i class="fas fa-minus"></i></button>
          <div class="qty-num" id="cqty-${item.id}">${item.qty}</div>
          <button class="qty-btn" onclick="cartQty(${item.id},1)"><i class="fas fa-plus"></i></button>
        </div>
        <button class="cart-item-remove mt-1" onclick="cartRemove(${item.id})"><i class="fas fa-trash-alt"></i> Remove</button>
      </div>
      <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
    </div>`).join('');

  updateCartSummary();
}

function updateCartSummary() {
  const sub = Store.getSubtotal();
  const shipping = sub > 0 ? (sub >= 100 ? 0 : 9.99) : 0;
  const tax = sub * 0.08;
  const total = sub + shipping + tax;

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('cart-subtotal', `$${sub.toFixed(2)}`);
  set('cart-shipping', sub >= 100 && sub > 0 ? 'Free' : `$${shipping.toFixed(2)}`);
  set('cart-tax', `$${tax.toFixed(2)}`);
  set('cart-total', `$${total.toFixed(2)}`);
}

window.cartQty = (id, delta) => {
  const item = Store.cart.find(i => i.id === id);
  if (!item) return;
  Store.updateQty(id, item.qty + delta);
  const qEl = document.getElementById(`cqty-${id}`);
  if (qEl) qEl.textContent = item.qty;
  renderCartPage();
};
window.cartRemove = (id) => {
  const row = document.getElementById(`cart-item-${id}`);
  if (row) { row.style.opacity = '0'; row.style.transform = 'translateX(-20px)'; }
  setTimeout(() => { Store.removeFromCart(id); renderCartPage(); }, 300);
};

function initCartPage() {
  const promo = document.getElementById('apply-promo');
  if (promo) {
    promo.addEventListener('click', () => {
      const code = document.getElementById('promo-code')?.value.toUpperCase();
      if (code === 'NEXUS20') showToast('Promo code applied! 20% off');
      else showToast('Invalid promo code');
    });
  }
}

/* ── CHECKOUT PAGE ── */
function initCheckout() {
  const form = document.getElementById('checkout-form');
  if (!form) return;

  // Payment option selection
  document.querySelectorAll('.payment-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.payment-option').forEach(o => { o.classList.remove('selected'); o.querySelector('input').checked = false; });
      opt.classList.add('selected');
      opt.querySelector('input').checked = true;
    });
  });

  // Select first by default
  const first = document.querySelector('.payment-option');
  if (first) { first.classList.add('selected'); if (first.querySelector('input')) first.querySelector('input').checked = true; }

  // Populate order summary
  const summaryWrap = document.getElementById('checkout-order-items');
  if (summaryWrap) {
    summaryWrap.innerHTML = Store.cart.map(i =>
      `<div class="summary-row">
        <span>${i.name} × ${i.qty}</span>
        <span>$${(i.price * i.qty).toFixed(2)}</span>
       </div>`).join('') || `<div class="summary-row"><span>No items</span></div>`;
  }

  const sub = Store.getSubtotal();
  const shipping = sub > 0 ? (sub >= 100 ? 0 : 9.99) : 0;
  const tax = sub * 0.08;
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('co-sub', `$${sub.toFixed(2)}`);
  set('co-ship', sub >= 100 && sub > 0 ? 'Free' : `$${shipping.toFixed(2)}`);
  set('co-tax', `$${tax.toFixed(2)}`);
  set('co-total', `$${(sub + shipping + tax).toFixed(2)}`);

  // Form submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('🎉 Order placed successfully!');
    Store.cart = [];
    Store.saveCart();
    setTimeout(() => window.location.href = 'index.html', 2000);
  });
}

/* ── PROFILE PAGE ── */
function initProfilePage() {
  const orderTable = document.getElementById('order-table-body');
  if (!orderTable) return;

  const orders = [
    { id: '#NX-8821', date: 'Jun 10, 2026', items: 3, total: '$478.00', status: 'Delivered', statusClass: 'status-delivered' },
    { id: '#NX-8745', date: 'Jun 01, 2026', items: 1, total: '$299.00', status: 'Shipped',   statusClass: 'status-shipped' },
    { id: '#NX-8612', date: 'May 22, 2026', items: 2, total: '$318.00', status: 'Delivered', statusClass: 'status-delivered' },
    { id: '#NX-8530', date: 'May 15, 2026', items: 4, total: '$734.00', status: 'Delivered', statusClass: 'status-delivered' },
    { id: '#NX-8421', date: 'May 03, 2026', items: 1, total: '$159.00', status: 'Pending',   statusClass: 'status-pending' },
  ];
  orderTable.innerHTML = orders.map(o => `
    <tr>
      <td style="color:var(--primary);font-weight:600">${o.id}</td>
      <td>${o.date}</td>
      <td>${o.items} item${o.items > 1 ? 's' : ''}</td>
      <td>${o.total}</td>
      <td><span class="order-status ${o.statusClass}">${o.status}</span></td>
      <td><button class="btn btn-secondary btn-sm" onclick="showToast('Order details coming soon!')">Details</button></td>
    </tr>`).join('');

  // Wishlist render
  const wishWrap = document.getElementById('wishlist-grid');
  if (wishWrap) {
    if (Store.wishlist.length) {
      wishWrap.innerHTML = Store.wishlist.map(p => renderProductCard(p)).join('');
    } else {
      wishWrap.innerHTML = `<div style="text-align:center;padding:3rem;color:var(--text-2);grid-column:1/-1">
        <i class="fas fa-heart" style="font-size:2rem;margin-bottom:1rem;display:block;color:var(--text-3)"></i>
        Your wishlist is empty. Browse <a href="shop.html" style="color:var(--primary)">the shop</a>!
      </div>`;
    }
  }

  // Tab switching
  document.querySelectorAll('.profile-nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = link.dataset.tab;
      if (!tab) return;
      document.querySelectorAll('.profile-nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      document.querySelectorAll('.profile-tab').forEach(t => t.style.display = 'none');
      const target = document.getElementById(`tab-${tab}`);
      if (target) target.style.display = '';
    });
  });
}

/* ── NAV SEARCH (home) ── */
const navSearchInput = document.getElementById('nav-search-input');
if (navSearchInput) {
  navSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = navSearchInput.value.trim();
      if (q) window.location.href = `shop.html?search=${encodeURIComponent(q)}`;
    }
  });
}

/* ── SHOP: Pre-fill search from URL ── */
window.addEventListener('DOMContentLoaded', () => {
  const shopSearch = document.getElementById('shop-search');
  if (shopSearch) {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('search');
    if (q) { shopSearch.value = q; shopSearch.dispatchEvent(new Event('input')); }
  }
});

/* ── Newsletter ── */
const newsletterForm = document.getElementById('newsletter-form');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('🎉 You\'re subscribed! Check your inbox.');
    newsletterForm.reset();
  });
}

/* ── Auth Forms ── */
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Welcome back! Logging you in…');
    setTimeout(() => window.location.href = 'index.html', 1500);
  });
}
const signupForm = document.getElementById('signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Account created! Welcome to Nexus!');
    setTimeout(() => window.location.href = 'index.html', 1500);
  });
}

/* expose globally */
window.Store   = Store;
window.PRODUCTS = PRODUCTS;
window.showToast = showToast;
window.toggleWishlistBtn = toggleWishlistBtn;
