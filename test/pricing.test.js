import { describe, it, expect, beforeEach } from 'vitest';
import { freshApi, cartWith } from './helpers.js';

let api;
beforeEach(() => {
  api = freshApi();
});

describe('GET /carts/:id/total', () => {
  it('is all zeros for an empty cart', async () => {
    const id = await cartWith(api, []);
    const { body } = await api.get(`/carts/${id}/total`);
    expect(body).toMatchObject({ subtotal: 0, discount: 0, tax: 0, shipping: 0, total: 0 });
  });

  it('adds tax and shipping under the free-shipping threshold', async () => {
    const id = await cartWith(api, [['p_2', 1]]); // 40.00
    const { body } = await api.get(`/carts/${id}/total`);
    expect(body.subtotal).toBeCloseTo(40, 2);
    expect(body.tax).toBeCloseTo(3.2, 2);
    expect(body.shipping).toBeCloseTo(4.99, 2);
    expect(body.total).toBeCloseTo(48.19, 2);
  });

  it('ships free at 50.00 and above', async () => {
    const id = await cartWith(api, [['p_6', 2]]); // 2 x 25.00
    const { body } = await api.get(`/carts/${id}/total`);
    expect(body.shipping).toBe(0);
    expect(body.total).toBeCloseTo(54, 2);
  });
});

describe('coupons', () => {
  it('FLAT5 takes 5.00 off', async () => {
    const id = await cartWith(api, [['p_6', 2]]); // 50.00
    await api.post(`/carts/${id}/coupon`).send({ code: 'FLAT5' });
    const { body } = await api.get(`/carts/${id}/total`);
    expect(body.discount).toBeCloseTo(5, 2);
    expect(body.coupon).toBe('FLAT5');
  });

  it('SAVE10 takes 10% of the subtotal (LOOP-1)', async () => {
    const id = await cartWith(api, [['p_2', 1]]); // 40.00
    await api.post(`/carts/${id}/coupon`).send({ code: 'SAVE10' });
    const { body } = await api.get(`/carts/${id}/total`);
    expect(body.discount).toBe(4);
    expect(body.tax).toBe(2.88);
    expect(body.shipping).toBe(4.99);
    expect(body.total).toBe(43.87);
  });

  it('FLAT5 needs a subtotal of 20.00', async () => {
    const id = await cartWith(api, [['p_3', 1]]); // 9.99
    const res = await api.post(`/carts/${id}/coupon`).send({ code: 'FLAT5' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('coupon_not_applicable');
  });

  it('FREESHIP removes shipping', async () => {
    const id = await cartWith(api, [['p_2', 1]]);
    await api.post(`/carts/${id}/coupon`).send({ code: 'freeship' });
    const { body } = await api.get(`/carts/${id}/total`);
    expect(body.shipping).toBe(0);
    expect(body.total).toBeCloseTo(43.2, 2);
  });

  it('rejects unknown coupons and can remove a coupon', async () => {
    const id = await cartWith(api, [['p_2', 1]]);
    expect((await api.post(`/carts/${id}/coupon`).send({ code: 'BOGUS' })).status).toBe(400);
    await api.post(`/carts/${id}/coupon`).send({ code: 'FREESHIP' });
    const res = await api.delete(`/carts/${id}/coupon`);
    expect(res.body.coupon).toBeNull();
  });
});

describe('checkout', () => {
  it('creates an order and empties the cart', async () => {
    const id = await cartWith(api, [['p_6', 2]]);
    const res = await api.post(`/carts/${id}/checkout`);
    expect(res.status).toBe(201);
    expect(res.body.id).toBe('o_1');
    expect(res.body.totals.total).toBeCloseTo(54, 2);
    expect((await api.get(`/carts/${id}`)).body.items).toEqual([]);
  });

  it('refuses an empty cart', async () => {
    const id = await cartWith(api, []);
    expect((await api.post(`/carts/${id}/checkout`)).status).toBe(400);
  });
});
