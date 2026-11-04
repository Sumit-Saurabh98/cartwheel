import { config } from './config.js';
import { discountFor, findCoupon } from './coupons.js';

export const lineTotal = (item) => item.unitPrice * item.qty;

export function subtotalOf(cart) {
  return cart.items.reduce((sum, item) => sum + lineTotal(item), 0);
}

export function totalsFor(cart) {
  const coupon = cart.coupon ? findCoupon(cart.coupon) : null;
  const subtotal = subtotalOf(cart);
  // Money math in integer cents; round half-up once at the end.
  const subtotalCents = Math.round(subtotal * 100);
  const discountCents = Math.round(discountFor(coupon, subtotal) * 100);
  const taxableCents = subtotalCents - discountCents;
  const taxCents = Math.round(taxableCents * config.taxRate);

  let shippingCents = Math.round(config.shippingFee * 100);
  if (cart.items.length === 0) shippingCents = 0;
  if (coupon?.kind === 'shipping') shippingCents = 0;
  if (taxableCents >= Math.round(config.freeShippingThreshold * 100)) shippingCents = 0;

  return {
    subtotal: subtotalCents / 100,
    discount: discountCents / 100,
    tax: taxCents / 100,
    shipping: shippingCents / 100,
    total: (taxableCents + taxCents + shippingCents) / 100,
    coupon: cart.coupon,
  };
}
