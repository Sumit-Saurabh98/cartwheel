import { useCallback, useEffect, useState } from 'react';
import { api, money } from './api.js';

const PAGE_SIZE = 5;
const COMMUNITY_URL = import.meta.env.VITE_COMMUNITY_URL || '';
const ART = {
  p_1: '⌨️', p_2: '🟫', p_3: '🔌', p_4: '💻', p_5: '📷', p_6: '🖱️',
  p_7: '🧷', p_8: '💡', p_9: '🗒️', p_10: '📓', p_11: '🎧', p_12: '☕',
};

function useCart() {
  const [cartId, setCartId] = useState(() => localStorage.getItem('cartwheel.cartId'));
  const [cart, setCart] = useState(null);
  const [totals, setTotals] = useState(null);

  const refresh = useCallback(async (id) => {
    const [c, t] = await Promise.all([api.cart(id), api.totals(id)]);
    setCart(c);
    setTotals(t);
  }, []);

  const ensureCart = useCallback(async () => {
    if (cartId) {
      try {
        await refresh(cartId);
        return cartId;
      } catch (e) {
        if (e.status !== 404) throw e;
      }
    }
    const fresh = await api.createCart();
    localStorage.setItem('cartwheel.cartId', fresh.id);
    setCartId(fresh.id);
    await refresh(fresh.id);
    return fresh.id;
  }, [cartId, refresh]);

  return { cartId, cart, totals, refresh, ensureCart };
}

export default function App() {
  const [page, setPage] = useState(1);
  const [catalog, setCatalog] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [order, setOrder] = useState(null);
  const { cart, totals, refresh, ensureCart } = useCart();

  useEffect(() => {
    ensureCart().catch((e) => setError(e.message));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    api
      .products(page, PAGE_SIZE)
      .then((data) => {
        setCatalog(data);
        setError('');
      })
      .catch((e) => setError(e.message));
  }, [page]);

  const run = async (fn, okMessage) => {
    try {
      setError('');
      const id = await ensureCart();
      await fn(id);
      await refresh(id);
      if (okMessage) setNotice(okMessage);
    } catch (e) {
      setError(e.message);
    }
  };

  const count = cart?.items.reduce((n, i) => n + i.qty, 0) ?? 0;

  return (
    <div className="shell">
      <header className="top">
        <div className="brand">
          <span className="logo">🛒</span>
          <div>
            <h1>Cartwheel</h1>
            <p>Desk gear, delivered.</p>
          </div>
        </div>
        <div className="cart-pill">Cart · {count}</div>
      </header>

      {error && <div className="banner error">⚠️ {error}</div>}
      {notice && !error && (
        <div className="banner ok" onAnimationEnd={() => setNotice('')}>
          {notice}
        </div>
      )}

      <main className="layout">
        <section className="catalog">
          <div className="section-head">
            <h2>Shop</h2>
            {catalog && <span className="muted">{catalog.total} products</span>}
          </div>

          <div className="grid">
            {catalog?.items.map((p) => (
              <article key={p.id} className="card">
                <div className="art">{ART[p.id] || '📦'}</div>
                <h3>{p.name}</h3>
                <div className="row">
                  <span className="price">${money(p.price)}</span>
                  <button onClick={() => run((id) => api.addItem(id, p.id), `Added ${p.name}`)}>Add</button>
                </div>
              </article>
            ))}
          </div>

          {catalog && (
            <nav className="pager">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
                ← Prev
              </button>
              <span>
                Page {catalog.page} of {catalog.totalPages}
              </span>
              <button disabled={page >= catalog.totalPages} onClick={() => setPage(page + 1)}>
                Next →
              </button>
            </nav>
          )}
        </section>

        <aside className="cart">
          {order ? (
            <OrderDone order={order} onDone={() => setOrder(null)} />
          ) : (
            <CartPanel cart={cart} totals={totals} run={run} onOrder={setOrder} />
          )}
        </aside>
      </main>

      <footer className="foot">
        Something look wrong?{' '}
        {COMMUNITY_URL ? (
          <a href={COMMUNITY_URL} target="_blank" rel="noreferrer">
            Tell us in the Cartwheel Community on Discord →
          </a>
        ) : (
          <span>Tell us in the Cartwheel Community on Discord.</span>
        )}
      </footer>
    </div>
  );
}

function CartPanel({ cart, totals, run, onOrder }) {
  const [code, setCode] = useState('');
  const items = cart?.items ?? [];

  return (
    <>
      <h2>Your cart</h2>
      {items.length === 0 && <p className="muted">Your cart is empty.</p>}
      <ul className="lines">
        {items.map((i) => (
          <li key={i.productId}>
            <span className="line-art">{ART[i.productId] || '📦'}</span>
            <span className="line-name">
              {i.name} <span className="muted">× {i.qty}</span>
            </span>
            <span>${money(i.lineTotal)}</span>
            <button className="link" onClick={() => run((id) => api.removeItem(id, i.productId))}>
              ✕
            </button>
          </li>
        ))}
      </ul>

      <form
        className="coupon"
        onSubmit={(e) => {
          e.preventDefault();
          if (code.trim()) run((id) => api.applyCoupon(id, code.trim()), `Coupon ${code.trim().toUpperCase()} applied`);
        }}
      >
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon code (try SAVE10)" />
        <button type="submit">Apply</button>
      </form>
      {cart?.coupon && (
        <p className="coupon-on">
          🏷️ {cart.coupon} applied{' '}
          <button className="link" onClick={() => run((id) => api.removeCoupon(id))}>
            remove
          </button>
        </p>
      )}

      {totals && (
        <dl className="totals">
          <dt>Subtotal</dt>
          <dd>${money(totals.subtotal)}</dd>
          <dt>Discount</dt>
          <dd>−${money(totals.discount)}</dd>
          <dt>Tax (8%)</dt>
          <dd>${money(totals.tax)}</dd>
          <dt>Shipping</dt>
          <dd>{totals.shipping === 0 ? 'Free' : `$${money(totals.shipping)}`}</dd>
          <dt className="grand">Total</dt>
          <dd className="grand">${money(totals.total)}</dd>
        </dl>
      )}

      <button
        className="checkout"
        disabled={items.length === 0}
        onClick={() => run(async (id) => onOrder(await api.checkout(id)))}
      >
        Checkout
      </button>
      <p className="muted small">Free shipping from $50 · Coupons: SAVE10, FLAT5, FREESHIP</p>
    </>
  );
}

function OrderDone({ order, onDone }) {
  return (
    <div className="done">
      <div className="big">🎉</div>
      <h2>Order {order.id} placed</h2>
      <p className="muted">{order.items.length} item(s)</p>
      <p className="grand">Charged ${money(order.totals.total)}</p>
      <button onClick={onDone}>Keep shopping</button>
    </div>
  );
}
