import { lineTotal } from './pricing.js';

let carts = new Map();
let orders = [];
let nextCart = 1;
let nextOrder = 1;

export function resetStore() {
  carts = new Map();
  orders = [];
  nextCart = 1;
  nextOrder = 1;
}

export function createCart() {
  const cart = { id: `c_${nextCart++}`, items: [], coupon: null };
  carts.set(cart.id, cart);
  return cart;
}

export const getCart = (id) => carts.get(id);

export function addItem(cart, product, qty) {
  const existing = cart.items.find((i) => i.productId === product.id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.items.push({ productId: product.id, name: product.name, unitPrice: product.price, qty });
  }
  return cart;
}

export function removeItem(cart, productId) {
  const before = cart.items.length;
  cart.items = cart.items.filter((i) => i.productId !== productId);
  return cart.items.length !== before;
}

export function createOrder(cart, totals) {
  const order = {
    id: `o_${nextOrder++}`,
    cartId: cart.id,
    items: cart.items.map((i) => ({ ...i })),
    totals,
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  cart.items = [];
  cart.coupon = null;
  return order;
}

export const serializeCart = (cart) => ({
  id: cart.id,
  coupon: cart.coupon,
  items: cart.items.map((i) => ({ ...i, lineTotal: lineTotal(i) })),
});
