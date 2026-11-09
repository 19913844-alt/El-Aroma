const message = document.querySelector('.confirmacion-mensaje');
const orderList = document.querySelector('.confirmacion-lista');
const total = document.querySelector('.confirmacion-total strong');
const notes = document.querySelector('.confirmacion-notas');

function showMissingOrder() {
  document.querySelector('#confirmacion-titulo').textContent = 'No encontramos tu pedido';
  message.textContent = 'Vuelve al menú y completa el formulario para registrar un pedido.';
  document.querySelector('.confirmacion section').hidden = true;
  document.querySelector('.confirmacion-datos').hidden = true;
  document.querySelector('.confirmacion-aviso').hidden = true;
}

let order;
try {
  const savedOrder = sessionStorage.getItem('cafeteria-pedido');
  order = savedOrder ? JSON.parse(savedOrder) : null;
} catch (error) {
  console.error('No se pudo leer el pedido guardado.', error);
  showMissingOrder();
}

if (order && order.customer && Array.isArray(order.items)) {
  message.textContent = `Gracias, ${order.customer.name}. Tu pedido quedó registrado.`;

  order.items.forEach((item) => {
    const listItem = document.createElement('li');
    listItem.textContent = `${item.name} × ${item.quantity} — $${(item.price * item.quantity).toFixed(2)}`;
    orderList.append(listItem);
  });

  total.textContent = `$${Number(order.total).toFixed(2)}`;
  document.querySelector('[data-order-field="phone"]').textContent = order.customer.phone;
  document.querySelector('[data-order-field="address"]').textContent = order.customer.address;

  if (order.customer.notes) {
    document.querySelector('[data-order-field="notes"]').textContent = order.customer.notes;
    notes.hidden = false;
  }

  sessionStorage.removeItem('cafeteria-pedido');
} else if (order === null) {
  showMissingOrder();
} else {
  showMissingOrder();
}
