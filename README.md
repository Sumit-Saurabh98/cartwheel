# Cartwheel

A tiny cart and checkout API: products, carts, coupons, totals, checkout. In-memory, no database, no auth.

Cartwheel is the product in the **[Closed Loop](https://github.com/Sumit-Saurabh98/closed-loop)** demo, where users report Cartwheel bugs in a community chat and AI agents plus a human maintainer fix them through Switch.

## Run

```bash
npm install
npm test        # Vitest + Supertest
npm start       # http://localhost:3000
```

## Try it

```bash
curl -s -X POST localhost:3000/carts                                   # {"id":"c_1",...}
curl -s -X POST localhost:3000/carts/c_1/items -H 'content-type: application/json' -d '{"productId":"p_2"}'
curl -s -X POST localhost:3000/carts/c_1/coupon -H 'content-type: application/json' -d '{"code":"SAVE10"}'
curl -s localhost:3000/carts/c_1/total
```

## Endpoints

| Method | Path | What |
|---|---|---|
| GET | `/health` | Liveness |
| GET | `/products?page=&limit=` | Paginated catalog (12 products) |
| GET | `/products/:id` | One product |
| POST | `/carts` | New cart |
| GET | `/carts/:id` | Cart |
| POST | `/carts/:id/items` | Add `{productId, qty}` |
| DELETE | `/carts/:id/items/:productId` | Remove item |
| POST / DELETE | `/carts/:id/coupon` | Apply `{code}` / remove |
| GET | `/carts/:id/total` | `subtotal, discount, tax, shipping, total` |
| POST | `/carts/:id/checkout` | Create order, empty cart |

## Coupons

| Code | Effect |
|---|---|
| `SAVE10` | 10% off the subtotal |
| `FLAT5` | 5.00 off orders of 20.00+ |
| `FREESHIP` | Free shipping |

## Pricing

Tax is 8% of the discounted subtotal. Shipping is 4.99, or free from 50.00 (after discount) or with `FREESHIP`.

## Contributing

Read [SHIPPING.md](SHIPPING.md) before opening a PR.
