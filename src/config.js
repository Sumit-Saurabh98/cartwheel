const num = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

export const config = {
  port: num(process.env.PORT, 3000),
  taxRate: num(process.env.TAX_RATE, 0.08),
  freeShippingThreshold: num(process.env.FREE_SHIPPING_THRESHOLD_CENTS, 5000) / 100,
  shippingFee: num(process.env.SHIPPING_CENTS, 499) / 100,
  defaultPageSize: 5,
  maxPageSize: 50,
};
