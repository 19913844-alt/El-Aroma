const cartStorageKey = 'cafeteria-carrito';
const cart = new Map();
const cartToggle = document.querySelector('.carrito-toggle');
const cartPanel = document.querySelector('#carrito');
const cartList = document.querySelector('.carrito-lista');
const cartCount = document.querySelector('.carrito-contador');
const cartEmptyMessage = document.querySelector('.carrito-vacio');
const cartTotal = document.querySelector('.carrito-total');
const clearCartButton = document.querySelector('.carrito-vaciar');
const orderButton = document.querySelector('.carrito-ordenar');
const cartMessage = document.querySelector('.carrito-mensaje');
let cartLoadError = false;

const formatPrice = (price) => `$${price.toFixed(2)}`;

function showCartMessage(text) {
  cartMessage.textContent = text;
  cartMessage.hidden = false;
}

function isValidCartItem(item) {
  return item
    && typeof item.name === 'string'
    && Number.isFinite(item.price)
    && Number.isInteger(item.quantity)
    && item.quantity > 0;
}

function loadCart() {
  try {
    const savedCart = sessionStorage.getItem(cartStorageKey);
    if (!savedCart) return;

    const items = JSON.parse(savedCart);
    if (!Array.isArray(items) || !items.every(isValidCartItem)) {
      throw new TypeError('El carrito guardado tiene un formato inválido.');
    }

    items.forEach((item) => cart.set(item.name, item));
  } catch (error) {
    console.error('No se pudo recuperar el carrito guardado.', error);
    cartLoadError = true;
    showCartMessage('No se pudo recuperar tu carrito guardado. Puedes volver a agregar los productos.');
  }
}

function renderCart() {
  cartList.replaceChildren();

  let itemCount = 0;
  let total = 0;

  cart.forEach((item, id) => {
    itemCount += item.quantity;
    total += item.price * item.quantity;

    const listItem = document.createElement('li');
    listItem.className = 'carrito-item';

    const itemInfo = document.createElement('div');
    itemInfo.className = 'carrito-item-info';

    const name = document.createElement('span');
    name.className = 'carrito-item-nombre';
    name.textContent = item.name;

    const price = document.createElement('span');
    price.className = 'carrito-item-precio';
    price.textContent = `${formatPrice(item.price)} c/u`;
    itemInfo.append(name, price);

    const quantityControls = document.createElement('div');
    quantityControls.className = 'carrito-cantidad';

    const decreaseButton = document.createElement('button');
    decreaseButton.type = 'button';
    decreaseButton.textContent = '−';
    decreaseButton.setAttribute('aria-label', `Quitar una unidad de ${item.name}`);
    decreaseButton.dataset.action = 'decrease';
    decreaseButton.dataset.id = id;

    const quantity = document.createElement('span');
    quantity.textContent = item.quantity;

    const increaseButton = document.createElement('button');
    increaseButton.type = 'button';
    increaseButton.textContent = '+';
    increaseButton.setAttribute('aria-label', `Agregar una unidad de ${item.name}`);
    increaseButton.dataset.action = 'increase';
    increaseButton.dataset.id = id;

    quantityControls.append(decreaseButton, quantity, increaseButton);
    listItem.append(itemInfo, quantityControls);
    cartList.append(listItem);
  });

  cartCount.textContent = itemCount;
  cartTotal.textContent = formatPrice(total);
  cartEmptyMessage.hidden = itemCount > 0;
  cartList.hidden = itemCount === 0;
  clearCartButton.disabled = itemCount === 0;
  orderButton.disabled = itemCount === 0;

  try {
    sessionStorage.setItem(cartStorageKey, JSON.stringify([...cart.values()]));
    if (!cartLoadError) cartMessage.hidden = true;
  } catch (error) {
    console.error('No se pudo guardar el carrito.', error);
    showCartMessage('No se pudo guardar el carrito en este navegador. Revisa la configuración de almacenamiento.');
  }
}

cartToggle.addEventListener('click', () => {
  const isOpening = cartPanel.hidden;
  cartPanel.hidden = !isOpening;
  cartToggle.setAttribute('aria-expanded', String(isOpening));
});

document.querySelector('.carrito-cerrar').addEventListener('click', () => {
  cartPanel.hidden = true;
  cartToggle.setAttribute('aria-expanded', 'false');
  cartToggle.focus();
});

orderButton.addEventListener('click', () => {
  if (cart.size === 0) return;

  try {
    sessionStorage.setItem(cartStorageKey, JSON.stringify([...cart.values()]));
    window.location.assign('formulario.html');
  } catch (error) {
    console.error('No se pudo guardar el carrito antes de abrir el formulario.', error);
    showCartMessage('No se pudo guardar tu carrito para abrir el formulario. Inténtalo de nuevo.');
  }
});

document.querySelectorAll('.btn-ordenar').forEach((button) => {
  button.addEventListener('click', () => {
    cartLoadError = false;
    const card = button.closest('.card');
    const name = card.querySelector('h3').textContent.trim();
    const price = Number(card.querySelector('.precio').textContent.replace('$', ''));
    const id = name;
    const item = cart.get(id);

    if (item) {
      item.quantity += 1;
    } else {
      cart.set(id, { name, price, quantity: 1 });
    }

    renderCart();
  });
});

cartList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const item = cart.get(button.dataset.id);
  if (!item) return;

  if (button.dataset.action === 'increase') {
    item.quantity += 1;
  } else {
    item.quantity -= 1;
    if (item.quantity === 0) cart.delete(button.dataset.id);
  }

  renderCart();
});

clearCartButton.addEventListener('click', () => {
  cartLoadError = false;
  cart.clear();
  renderCart();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !cartPanel.hidden) {
    cartPanel.hidden = true;
    cartToggle.setAttribute('aria-expanded', 'false');
    cartToggle.focus();
  }
});

loadCart();
renderCart();
