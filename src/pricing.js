import { config } from './config.js';
import { discountFor, findCoupon } from './coupons.js';

export const lineTotal = (item) => item.unitPrice * item.qty;

export function subtotalOf(cart) {
  return cart.items.reduce((sum, item) => sum + lineTotal(item), 0);
}

export function totalsFor(cart) {
  const coupon = cart.coupon ? findCoupon(cart.coupon) : null;
  const cents = (amount) => Math.round(amount * 100);
  const subtotalCents = cents(subtotalOf(cart));
  const discountCents = cents(discountFor(coupon, subtotalCents / 100));
  const taxableCents = subtotalCents - discountCents;
  const taxCents = Math.round(taxableCents * config.taxRate);

  let shippingCents = cents(config.shippingFee);
  if (cart.items.length === 0) shippingCents = 0;
  if (coupon?.kind === 'shipping') shippingCents = 0;
  if (taxableCents >= cents(config.freeShippingThreshold)) shippingCents = 0;

  return {
    subtotal: subtotalCents / 100,
    discount: discountCents / 100,
    tax: taxCents / 100,
    shipping: shippingCents / 100,
    total: (taxableCents + taxCents + shippingCents) / 100,
    coupon: cart.coupon,
  };
}
