import { describe, it, expect, beforeEach } from 'vitest';
import { freshApi } from './helpers.js';

let api;
beforeEach(() => {
  api = freshApi();
});

describe('GET /health', () => {
  it('reports ok', async () => {
    const res = await api.get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('GET /products', () => {
  it('returns the first page with the default page size', async () => {
    const res = await api.get('/products');
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(5);
    expect(res.body.page).toBe(1);
    expect(res.body.total).toBe(12);
  });

  it('returns disjoint pages', async () => {
    const one = await api.get('/products?page=1&limit=5');
    const two = await api.get('/products?page=2&limit=5');
    const ids = [...one.body.items, ...two.body.items].map((p) => p.id);
    expect(new Set(ids).size).toBe(10);
  });

  it('computes totalPages', async () => {
    const res = await api.get('/products?limit=4');
    expect(res.body.totalPages).toBe(3);
  });

  it('reaches every product with the default page size (LOOP-3)', async () => {
    const first = await api.get('/products');
    expect(first.body.totalPages).toBe(3);
    const last = await api.get('/products?page=3');
    expect(last.status).toBe(200);
    expect(last.body.items.map((p) => p.name)).toEqual(['Headphone hook', 'Coffee mug']);
  });

  it('rejects the page after the last one (LOOP-3)', async () => {
    const res = await api.get('/products?page=4');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('page_out_of_range');
  });

  it('covers all 12 products exactly once across pages 1-3 (LOOP-3)', async () => {
    const ids = [];
    for (const page of [1, 2, 3]) {
      const res = await api.get(`/products?page=${page}`);
      expect(res.status).toBe(200);
      ids.push(...res.body.items.map((p) => p.id));
    }
    expect(ids).toHaveLength(12);
    expect(new Set(ids).size).toBe(12);
  });

  it('rejects invalid pagination', async () => {
    expect((await api.get('/products?page=0')).status).toBe(400);
    expect((await api.get('/products?limit=500')).status).toBe(400);
  });
});

describe('GET /products/:id', () => {
  it('returns a product', async () => {
    const res = await api.get('/products/p_2');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Desk mat');
  });

  it('404s for an unknown product', async () => {
    expect((await api.get('/products/nope')).status).toBe(404);
  });
});
