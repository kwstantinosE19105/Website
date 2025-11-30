const CART_KEY = "nh_cart";

/* ============ Helpers ============ */
function getCart() {
  const raw = localStorage.getItem(CART_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function getCartTotal() {
  return getCart().reduce((sum, item) => sum + item.qty * item.price, 0);
}

/* ============ Core actions ============ */
function addToCart(product, qty = 1) {
  const cart = getCart();
  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      img: product.img,
      brand: product.brand,
      series: product.series || "",
      qty: qty
    });
  }

  saveCart(cart);
  updateCartBadge();

  // Simple feedback
  try {
    // avoid blocking if user hates alerts: you can swap this to a toast later
    console.log(`Added to cart: ${product.name}`);
  } catch {}
}

function removeFromCart(id) {
  const cart = getCart().filter(item => item.id !== id);
  saveCart(cart);
  updateCartBadge();
}

function updateCartQuantity(id, qty) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.qty = qty < 1 ? 1 : qty;
  saveCart(cart);
  updateCartBadge();
}

function clearCart() {
  saveCart([]);
  updateCartBadge();
}

/* ============ Cart badge (if you add one in header) ============ */
function updateCartBadge() {
  const badge = document.querySelector("[data-cart-count]");
  if (!badge) return;

  const count = getCartCount();
  badge.textContent = count;
  badge.style.display = count > 0 ? "inline-flex" : "none";
}

/* ============ Render cart page ============ */
function renderCartPage() {
  const listEl   = document.getElementById("cart-items");
  const emptyEl  = document.getElementById("cart-empty");
  const summaryEl = document.getElementById("cart-summary");

  if (!listEl || !emptyEl || !summaryEl) return; // Not on cart page

  const cart = getCart();

  if (!cart.length) {
    listEl.innerHTML = "";
    emptyEl.style.display = "block";
    summaryEl.style.display = "none";
    return;
  }

  emptyEl.style.display = "none";
  summaryEl.style.display = "block";

  listEl.innerHTML = "";
  cart.forEach(item => {
    const row = document.createElement("article");
    row.className = "cart-item";
    row.innerHTML = `
      <img src="${item.img}" alt="${item.name}" class="cart-thumb">

      <div>
        <div class="cart-title">${item.name}</div>
        <div class="cart-meta">
          ${item.brand || ""}${item.series ? " • " + item.series : ""}
        </div>
        <div class="cart-price">€${item.price.toFixed(2)}</div>
        <div class="cart-actions-inline">
          <label style="font-size:.8rem;">
            Qty:
            <input
              type="number"
              min="1"
              value="${item.qty}"
              class="cart-qty-input"
              data-id="${item.id}"
            >
          </label>
          <button
            class="btn-link-danger"
            type="button"
            data-action="remove"
            data-id="${item.id}"
          >
            <i class="fa-solid fa-xmark"></i> Remove
          </button>
        </div>
      </div>

      <div style="justify-self:flex-end;text-align:right;">
        <div style="font-size:.85rem;color:#bdbdbd;">Line total</div>
        <div style="font-weight:700;">
          €${(item.price * item.qty).toFixed(2)}
        </div>
      </div>
    `;
    listEl.appendChild(row);
  });

  // Totals
  const itemsCountEl = document.getElementById("cart-items-count");
  const subtotalEl   = document.getElementById("cart-subtotal");
  const totalEl      = document.getElementById("cart-total");

  if (itemsCountEl) itemsCountEl.textContent = getCartCount();
  const subtotal = getCartTotal();
  if (subtotalEl) subtotalEl.textContent = `€${subtotal.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `€${subtotal.toFixed(2)}`; // same for now

  // Attach events
  listEl.querySelectorAll("[data-action='remove']").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id, 10);
      removeFromCart(id);
      renderCartPage();
    });
  });

  listEl.querySelectorAll(".cart-qty-input").forEach(input => {
    input.addEventListener("change", () => {
      const id = parseInt(input.dataset.id, 10);
      let qty = parseInt(input.value, 10);
      if (isNaN(qty) || qty < 1) qty = 1;
      updateCartQuantity(id, qty);
      renderCartPage();
    });
  });
}

/* ============ Init ============ */
document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  renderCartPage();

  const clearBtn = document.getElementById("cart-clear");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (confirm("Clear all items from your cart?")) {
        clearCart();
        renderCartPage();
      }
    });
  }

  const checkoutBtn = document.getElementById("cart-checkout");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      alert("This is a demo checkout. Hook this up to your real payment flow later!");
    });
  }
});// Load cart or default to empt
