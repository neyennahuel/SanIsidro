(function () {
  const products = Array.isArray(window.catalogData) ? window.catalogData : [];
  const productGrid = document.getElementById("product-grid");
  const cartList = document.getElementById("cart-list");
  const cartBadge = document.getElementById("cart-badge");
  const summaryProducts = document.getElementById("summary-products");
  const summaryUnits = document.getElementById("summary-units");
  const heroProductCount = document.getElementById("hero-product-count");
  const heroCartCount = document.getElementById("hero-cart-count");
  const whatsappButton = document.getElementById("whatsapp-button");
  const cartPanel = document.getElementById("cart-panel");
  const mobileCartToggle = document.getElementById("mobile-cart-toggle");
  const mobileCartBackdrop = document.getElementById("mobile-cart-backdrop");
  const whatsappNumber = "5491126980656";
  const mobileViewportQuery = window.matchMedia("(max-width: 760px)");

  const state = {
    draftQuantities: Object.fromEntries(products.map((product) => [product.id, 1])),
    cart: {},
    mobileCartOpen: false
  };

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function getCartEntries() {
    return products
      .filter((product) => state.cart[product.id] > 0)
      .map((product) => ({
        ...product,
        quantity: state.cart[product.id]
      }));
  }

  function getCartTotals() {
    const entries = getCartEntries();
    return {
      selectedProducts: entries.length,
      totalUnits: entries.reduce((accumulator, item) => accumulator + item.quantity, 0)
    };
  }

  function formatCartLabel(total) {
    return total === 1 ? "1 producto" : `${total} productos`;
  }

  function createWhatsAppLink(entries) {
    const lines = [
      "Hola, quiero realizar el siguiente pedido:",
      "",
      ...entries.map((item) => `- ${item.name} x${item.quantity}`),
      "",
      "Gracias."
    ];

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
  }

  function isMobileViewport() {
    return mobileViewportQuery.matches;
  }

  function syncMobileCartState() {
    const isOpen = isMobileViewport() && state.mobileCartOpen;

    cartPanel.classList.toggle("is-open", isOpen);
    mobileCartToggle.classList.toggle("is-active", isOpen);
    mobileCartToggle.setAttribute("aria-expanded", String(isOpen));
    mobileCartToggle.setAttribute("aria-label", isOpen ? "Ocultar carrito" : "Mostrar carrito");
    mobileCartBackdrop.hidden = !isOpen;
    document.body.classList.toggle("mobile-cart-open", isOpen);
  }

  function setMobileCartOpen(nextValue) {
    state.mobileCartOpen = Boolean(nextValue) && isMobileViewport();
    syncMobileCartState();
  }

  function renderProducts() {
    heroProductCount.textContent = String(products.length);

    if (!products.length) {
      productGrid.innerHTML = '<div class="empty-state"><p>No se encontraron productos.</p></div>';
      return;
    }

    productGrid.innerHTML = products
      .map((product) => {
        const draftQuantity = state.draftQuantities[product.id] || 1;
        const inCart = state.cart[product.id] || 0;
        const addLabel = inCart > 0 ? "Sumar al carrito" : "Agregar al carrito";
        const addButtonClass = inCart > 0 ? "add-button is-added" : "add-button";

        return `
          <article class="product-card">
            <div class="product-card__image-wrap">
              <img class="product-card__image" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}">
            </div>
            <div class="product-card__body">
              <div>
                <h3 class="product-card__title">${escapeHtml(product.name)}</h3>
                <p class="product-card__subtitle">${inCart > 0 ? `En carrito: ${inCart}` : "Listo para sumar"}</p>
              </div>
              <div class="product-controls">
                <div class="quantity-stepper" aria-label="Cantidad ${escapeHtml(product.name)}">
                  <button type="button" data-action="draft-decrement" data-product-id="${escapeHtml(product.id)}" aria-label="Quitar una unidad">-</button>
                  <span>${draftQuantity}</span>
                  <button type="button" data-action="draft-increment" data-product-id="${escapeHtml(product.id)}" aria-label="Agregar una unidad">+</button>
                </div>
                <button type="button" class="${addButtonClass}" data-action="add-to-cart" data-product-id="${escapeHtml(product.id)}">
                  ${addLabel}
                </button>
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renderCart() {
    const entries = getCartEntries();
    const totals = getCartTotals();

    cartBadge.textContent = formatCartLabel(totals.selectedProducts);
    summaryProducts.textContent = String(totals.selectedProducts);
    summaryUnits.textContent = String(totals.totalUnits);
    heroCartCount.textContent = String(totals.totalUnits);

    if (!entries.length) {
      cartList.innerHTML = '<div class="empty-state"><p>Seleccioná productos para empezar tu pedido.</p></div>';
      whatsappButton.className = "whatsapp-button whatsapp-button--disabled";
      whatsappButton.setAttribute("href", "#");
      whatsappButton.setAttribute("aria-disabled", "true");
      syncMobileCartState();
      return;
    }

    cartList.innerHTML = entries
      .map(
        (item) => `
          <article class="cart-item">
            <div class="cart-item__header">
              <h3 class="cart-item__title">${escapeHtml(item.name)}</h3>
              <button type="button" class="cart-item__remove" data-action="remove-item" data-product-id="${escapeHtml(item.id)}">
                Quitar
              </button>
            </div>
            <div class="cart-item__stepper" aria-label="Cantidad en carrito ${escapeHtml(item.name)}">
              <button type="button" data-action="cart-decrement" data-product-id="${escapeHtml(item.id)}" aria-label="Quitar una unidad">-</button>
              <span class="cart-item__qty">${item.quantity}</span>
              <button type="button" data-action="cart-increment" data-product-id="${escapeHtml(item.id)}" aria-label="Agregar una unidad">+</button>
            </div>
          </article>
        `
      )
      .join("");

    whatsappButton.className = "whatsapp-button";
    whatsappButton.setAttribute("href", createWhatsAppLink(entries));
    whatsappButton.setAttribute("aria-disabled", "false");
    syncMobileCartState();
  }

  function render() {
    renderProducts();
    renderCart();
  }

  function adjustDraftQuantity(productId, delta) {
    const current = state.draftQuantities[productId] || 1;
    state.draftQuantities[productId] = Math.max(1, current + delta);
    renderProducts();
  }

  function addToCart(productId) {
    const quantityToAdd = state.draftQuantities[productId] || 1;
    state.cart[productId] = (state.cart[productId] || 0) + quantityToAdd;
    state.draftQuantities[productId] = 1;
    render();
  }

  function adjustCartQuantity(productId, delta) {
    const nextQuantity = (state.cart[productId] || 0) + delta;

    if (nextQuantity <= 0) {
      delete state.cart[productId];
    } else {
      state.cart[productId] = nextQuantity;
    }

    render();
  }

  function removeItem(productId) {
    delete state.cart[productId];
    render();
  }

  document.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    const action = target.dataset.action;
    const productId = target.dataset.productId;

    if (!action || !productId) {
      return;
    }

    if (action === "draft-increment") {
      adjustDraftQuantity(productId, 1);
      return;
    }

    if (action === "draft-decrement") {
      adjustDraftQuantity(productId, -1);
      return;
    }

    if (action === "add-to-cart") {
      addToCart(productId);
      return;
    }

    if (action === "cart-increment") {
      adjustCartQuantity(productId, 1);
      return;
    }

    if (action === "cart-decrement") {
      adjustCartQuantity(productId, -1);
      return;
    }

    if (action === "remove-item") {
      removeItem(productId);
    }
  });

  whatsappButton.addEventListener("click", (event) => {
    if (whatsappButton.getAttribute("aria-disabled") === "true") {
      event.preventDefault();
    }
  });

  mobileCartToggle.addEventListener("click", () => {
    setMobileCartOpen(!state.mobileCartOpen);
  });

  mobileCartBackdrop.addEventListener("click", () => {
    setMobileCartOpen(false);
  });

  const handleViewportChange = () => {
    if (!isMobileViewport()) {
      state.mobileCartOpen = false;
    }

    syncMobileCartState();
  };

  if (typeof mobileViewportQuery.addEventListener === "function") {
    mobileViewportQuery.addEventListener("change", handleViewportChange);
  } else if (typeof mobileViewportQuery.addListener === "function") {
    mobileViewportQuery.addListener(handleViewportChange);
  }

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMobileCartOpen(false);
    }
  });

  render();
})();
