const cartStorageKey = 'cafeteria-carrito';
const orderStorageKey = 'cafeteria-pedido';
const summaryList = document.querySelector('.pedido-resumen-lista');
const summaryTotal = document.querySelector('.pedido-resumen-total strong');
const orderForm = document.querySelector('.pedido-formulario');
const orderMessage = document.querySelector('.pedido-mensaje');
const formatPrice = (price) => `$${price.toFixed(2)}`;

function showMissingCart() {
  orderForm.querySelectorAll('input, textarea, button[type="submit"]').forEach((control) => {
    control.disabled = true;
  });
  orderMessage.textContent = 'No encontramos productos en tu carrito. Regresa al menú y agrega productos para continuar.';
  orderMessage.hidden = false;
}

let items = null;
let cartReadError = false;
try {
  const savedCart = sessionStorage.getItem(cartStorageKey);
  items = savedCart ? JSON.parse(savedCart) : null;
} catch (error) {
  console.error('No se pudo recuperar el carrito para completar el pedido.', error);
  cartReadError = true;
}

const isValidCart = Array.isArray(items)
  && items.length > 0
  && items.every((item) => item
    && typeof item.name === 'string'
    && Number.isFinite(item.price)
    && Number.isInteger(item.quantity)
    && item.quantity > 0);

if (isValidCart) {
  items.forEach((item) => {
    const listItem = document.createElement('li');
    listItem.textContent = `${item.name} × ${item.quantity} — ${formatPrice(item.price * item.quantity)}`;
    summaryList.append(listItem);
  });

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  summaryTotal.textContent = formatPrice(total);
} else {
  if (!cartReadError && items !== null) {
    console.error('El carrito guardado tiene un formato inválido.');
  }
  showMissingCart();
}

orderForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!isValidCart) return;

  const formData = new FormData(orderForm);
  const order = {
    customer: {
      name: formData.get('nombre').trim(),
      phone: formData.get('telefono').trim(),
      address: formData.get('direccion').trim(),
      notes: formData.get('notas').trim(),
    },
    items,
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    createdAt: new Date().toISOString(),
  };

  try {
    sessionStorage.setItem(orderStorageKey, JSON.stringify(order));
    sessionStorage.removeItem(cartStorageKey);
    window.location.assign('confirmacion.html');
  } catch (error) {
    console.error('No se pudo guardar el pedido para mostrar la confirmación.', error);
    orderMessage.textContent = 'No se pudo guardar el pedido en este navegador. Revisa la configuración de almacenamiento e inténtalo de nuevo.';
    orderMessage.hidden = false;
  }
});
