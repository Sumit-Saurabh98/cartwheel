import { config } from './config.js';
import { discountFor, findCoupon } from './coupons.js';

export const lineTotal = (item) => item.unitPrice * item.qty;

export function subtotalOf(cart) {
  return cart.items.reduce((sum, item) => sum + lineTotal(item), 0);
}

export function totalsFor(cart) {
  const coupon = cart.coupon ? findCoupon(cart.coupon) : null;
  const subtotal = subtotalOf(cart);
  const discount = discountFor(coupon, subtotal);
  const taxable = subtotal - discount;
  const tax = taxable * config.taxRate;

  let shipping = config.shippingFee;
  if (cart.items.length === 0) shipping = 0;
  if (coupon?.kind === 'shipping') shipping = 0;
  if (taxable >= config.freeShippingThreshold) shipping = 0;

  return {
    subtotal,
    discount,
    tax,
    shipping,
    total: taxable + tax + shipping,
    coupon: cart.coupon,
  };
}
