//v 1.0.0

function priceGenerator(DropdownValue) {
  switch (DropdownValue) {
    default:
      return 199;
    case "A4 ":
      return 199;
    case "A3":
      return 249;
    case "A4 Framed":
      return 399;
    case "A3 Framed":
      return 599;
  }
}

function total(cartItems) {
  let total = 0;
  cartItems.forEach((item) => {
    let subtotal = item.quantity * priceGenerator(item.type);
    total = total + subtotal;
  });

  return total;
}

module.exports = { total };
