import { describe, it, expect, beforeEach } from 'vitest';
import { freshApi } from './helpers.js';

let api;
beforeEach(() => {
  api = freshApi();
});

describe('carts', () => {
  it('creates an empty cart', async () => {
    const res = await api.post('/carts');
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 'c_1', coupon: null, items: [] });
  });

  it('adds items and merges quantities', async () => {
    const { body: cart } = await api.post('/carts');
    await api.post(`/carts/${cart.id}/items`).send({ productId: 'p_6', qty: 1 });
    const res = await api.post(`/carts/${cart.id}/items`).send({ productId: 'p_6', qty: 2 });
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].qty).toBe(3);
    expect(res.body.items[0].lineTotal).toBeCloseTo(75, 2);
  });

  it('removes an item', async () => {
    const { body: cart } = await api.post('/carts');
    await api.post(`/carts/${cart.id}/items`).send({ productId: 'p_3' });
    const res = await api.delete(`/carts/${cart.id}/items/p_3`);
    expect(res.body.items).toEqual([]);
  });

  it('validates input', async () => {
    const { body: cart } = await api.post('/carts');
    expect((await api.post(`/carts/${cart.id}/items`).send({ productId: 'nope' })).status).toBe(404);
    expect((await api.post(`/carts/${cart.id}/items`).send({ productId: 'p_1', qty: 0 })).status).toBe(400);
    expect((await api.delete(`/carts/${cart.id}/items/p_1`)).status).toBe(404);
  });

  it('404s for an unknown cart', async () => {
    expect((await api.get('/carts/c_999')).status).toBe(404);
    expect((await api.get('/carts/c_999/total')).status).toBe(404);
  });
});
