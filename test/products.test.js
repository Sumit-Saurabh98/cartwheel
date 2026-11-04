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
