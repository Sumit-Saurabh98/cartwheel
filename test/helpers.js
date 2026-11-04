import request from 'supertest';
import { createApp } from '../src/app.js';
import { resetStore } from '../src/store.js';

export function freshApi() {
  resetStore();
  return request(createApp());
}

export async function cartWith(api, items) {
  const { body: cart } = await api.post('/carts');
  for (const [productId, qty] of items) {
    await api.post(`/carts/${cart.id}/items`).send({ productId, qty });
  }
  return cart.id;
}
