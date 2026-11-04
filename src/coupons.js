export const coupons = {
  SAVE10: { kind: 'percent', amount: 10, label: '10% off your order' },
  FLAT5: { kind: 'flat', amount: 5, minSubtotal: 20, label: '$5 off orders of $20+' },
  FREESHIP: { kind: 'shipping', amount: 0, label: 'Free shipping' },
};

export const findCoupon = (code) => coupons[String(code || '').toUpperCase()];

export function checkCouponRules(coupon, subtotal) {
  if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
    return `Requires a subtotal of at least ${coupon.minSubtotal.toFixed(2)}`;
  }
  return null;
}

export function discountFor(coupon, subtotal) {
  if (!coupon || coupon.kind === 'shipping') return 0;
  if (coupon.kind === 'percent') return (subtotal * coupon.amount) / 100;
  return Math.min(coupon.amount, subtotal);
}
