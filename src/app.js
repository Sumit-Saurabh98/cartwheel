import express from 'express';
import { config } from './config.js';
import { products, findProduct } from './catalog.js';
import { paginate } from './pagination.js';
import { findCoupon, checkCouponRules } from './coupons.js';
import { subtotalOf, totalsFor } from './pricing.js';
import * as store from './store.js';

const VERSION = '1.0.0';

const fail = (res, status, error, message) => res.status(status).json({ error, message });

const intParam = (value, fallback) => {
  if (value === undefined) return fallback;
  const n = Number(value);
  return Number.isInteger(n) ? n : NaN;
};

export function createApp() {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ status: 'ok', version: VERSION }));

  app.get('/products', (req, res) => {
    const page = intParam(req.query.page, 1);
    const limit = intParam(req.query.limit, config.defaultPageSize);
    if (!(page >= 1) || !(limit >= 1 && limit <= config.maxPageSize)) {
      return fail(res, 400, 'invalid_pagination', `page >= 1, 1 <= limit <= ${config.maxPageSize}`);
    }
    const result = paginate(products, page, limit);
    if (page > result.totalPages) {
      return fail(res, 400, 'page_out_of_range', `There are only ${result.totalPages} pages`);
    }
    res.json(result);
  });

  app.get('/products/:productId', (req, res) => {
    const product = findProduct(req.params.productId);
    if (!product) return fail(res, 404, 'product_not_found');
    res.json(product);
  });

  app.post('/carts', (_req, res) => res.status(201).json(store.serializeCart(store.createCart())));

  // Every /carts/:cartId route below needs the cart.
  app.param('cartId', (req, res, next, id) => {
    const cart = store.getCart(id);
    if (!cart) return fail(res, 404, 'cart_not_found');
    req.cart = cart;
    next();
  });

  app.get('/carts/:cartId', (req, res) => res.json(store.serializeCart(req.cart)));

  app.post('/carts/:cartId/items', (req, res) => {
    const { productId, qty = 1 } = req.body || {};
    const product = findProduct(productId);
    if (!product) return fail(res, 404, 'product_not_found');
    if (!Number.isInteger(qty) || qty < 1 || qty > 99) {
      return fail(res, 400, 'invalid_qty', 'qty must be an integer from 1 to 99');
    }
    res.json(store.serializeCart(store.addItem(req.cart, product, qty)));
  });

  app.delete('/carts/:cartId/items/:productId', (req, res) => {
    if (!store.removeItem(req.cart, req.params.productId)) return fail(res, 404, 'item_not_found');
    res.json(store.serializeCart(req.cart));
  });

  app.post('/carts/:cartId/coupon', (req, res) => {
    const coupon = findCoupon(req.body?.code);
    if (!coupon) return fail(res, 400, 'unknown_coupon');
    const ruleError = checkCouponRules(coupon, subtotalOf(req.cart));
    if (ruleError) return fail(res, 400, 'coupon_not_applicable', ruleError);
    req.cart.coupon = String(req.body.code).toUpperCase();
    res.json(store.serializeCart(req.cart));
  });

  app.delete('/carts/:cartId/coupon', (req, res) => {
    req.cart.coupon = null;
    res.json(store.serializeCart(req.cart));
  });

  app.get('/carts/:cartId/total', (req, res) => res.json(totalsFor(req.cart)));

  app.post('/carts/:cartId/checkout', (req, res) => {
    if (req.cart.items.length === 0) return fail(res, 400, 'empty_cart');
    const order = store.createOrder(req.cart, totalsFor(req.cart));
    res.status(201).json(order);
  });

  return app;
}
