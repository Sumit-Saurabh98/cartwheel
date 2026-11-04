async function call(method, path, body) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || data.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.code = data.error;
    throw err;
  }
  return data;
}

export const api = {
  products: (page, limit) => call('GET', `/products?page=${page}&limit=${limit}`),
  createCart: () => call('POST', '/carts'),
  cart: (id) => call('GET', `/carts/${id}`),
  addItem: (id, productId, qty = 1) => call('POST', `/carts/${id}/items`, { productId, qty }),
  removeItem: (id, productId) => call('DELETE', `/carts/${id}/items/${productId}`),
  applyCoupon: (id, code) => call('POST', `/carts/${id}/coupon`, { code }),
  removeCoupon: (id) => call('DELETE', `/carts/${id}/coupon`),
  totals: (id) => call('GET', `/carts/${id}/total`),
  checkout: (id) => call('POST', `/carts/${id}/checkout`),
};

// The API contract promises amounts with at most 2 decimals, so the shop shows them as sent.
export const money = (n) => (Math.round(n * 100) === n * 100 ? n.toFixed(2) : String(n));
