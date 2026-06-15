import React, { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Search, ShoppingCart, Plus, Minus, Trash2,
  CreditCard, Banknote, QrCode, Tag, Bookmark,
  Briefcase, Printer, Users, Zap, X, ChevronDown,
  ReceiptText, UtensilsCrossed, Coffee, Cookie,
  Salad, Soup, Package, Wallet
} from 'lucide-react';

import api from '../api/axios';
import { searchProducts } from '../api/productApi';
import { useCurrency } from '../context/CurrencyContext';

const CAT_ICONS = {
  All:      <Package  size={14} />,
  Beverages:<Coffee   size={14} />,
  Snacks:   <Cookie   size={14} />,
  Grocery:  <Package  size={14} />,
  Dairy:    <Soup     size={14} />,
  'Personal Care': <Salad size={14} />,
  Electronics: <Zap size={14} />,
  Household: <UtensilsCrossed size={14} />,
  Bakery:   <Cookie   size={14} />,
  Clothing: <Tag size={14} />,
  Other:    <Package size={14} />,
};

const getEmojiForCategory = (cat) => {
  if (!cat) return '📦';
  const map = {
    Beverages: '🥤',
    Snacks: '🥨',
    Grocery: '🛒',
    Dairy: '🥛',
    'Personal Care': '🧼',
    Electronics: '🔌',
    Household: '🧽',
    Bakery: '🥐',
    Clothing: '👕',
    Other: '📦'
  };
  return map[cat] || '📦';
};

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════ */
export default function POS() {
  const { formatAmount } = useCurrency();

  /* state */
  const [query,       setQuery]       = useState('');
  const [activeCat,   setActiveCat]   = useState('All');
  const [cart,        setCart]        = useState([]);
  const [discount,    setDiscount]    = useState(0);
  const [discInput,   setDiscInput]   = useState('');
  const [showDiscBox, setShowDiscBox] = useState(false);
  const [payMethod,   setPayMethod]   = useState('cash');
  const [tableNum,    setTableNum]    = useState('T-04');
  const [ordersToday, setOrdersToday] = useState(47);
  const [heldCount,   setHeldCount]   = useState(0);
  const [poppingId,   setPoppingId]   = useState(null);
  const [time,        setTime]        = useState('');
  const [notes,       setNotes]       = useState('');
  const searchRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(['All']);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await searchProducts('');
        const data = res.data?.content || res.data || [];
        setProducts(data);
        const uniqueCats = ['All', ...new Set(data.map(p => p.category).filter(Boolean))];
        setCategories(uniqueCats);
      } catch (err) {
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  /* clock */
  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }));
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  /* filtered products */
  const filtered = products.filter(p => {
    const matchCat = activeCat === 'All' || p.category === activeCat;
    const matchQ   = !query || p.name.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  /* cart helpers */
  const addItem = useCallback((product) => {
    setPoppingId(product.id);
    setTimeout(() => setPoppingId(null), 260);
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  }, []);

  /* Barcode Scanner Listener */
  useEffect(() => {
    let barcodeBuffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 50) barcodeBuffer = '';
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (barcodeBuffer.length > 2) {
          const matched = products.find(p => p.barcode === barcodeBuffer || p.name.toLowerCase() === barcodeBuffer.toLowerCase());
          if (matched) {
            addItem(matched);
            toast.success(`Added ${matched.name}`);
          } else {
            toast.error(`Barcode not found: ${barcodeBuffer}`);
          }
        }
        barcodeBuffer = '';
      } else if (e.key.length === 1) {
        barcodeBuffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products, addItem]);

  const changeQty = useCallback((id, delta) => {
    setCart(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, qty: i.qty + delta } : i);
      return updated.filter(i => i.qty > 0);
    });
  }, []);

  const removeItem = useCallback((id) => {
    setCart(prev => prev.filter(i => i.id !== id));
  }, []);

  const clearCart = () => { setCart([]); setDiscount(0); setDiscInput(''); setNotes(''); };

  /* totals */
  const subtotal   = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discAmt    = subtotal * (discount / 100);
  
  const taxAmt = cart.reduce((totalTax, i) => {
    const itemSubtotal = i.price * i.qty;
    const itemDiscount = itemSubtotal * (discount / 100);
    const itemNetPrice = itemSubtotal - itemDiscount;
    const itemTax = itemNetPrice * ((i.taxRate || 0) / 100);
    return totalTax + itemTax;
  }, 0);

  const grandTotal = subtotal - discAmt + taxAmt;
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);

  /* actions */
  const applyDiscount = () => {
    const v = Math.min(100, Math.max(0, parseInt(discInput) || 0));
    setDiscount(v);
    setShowDiscBox(false);
    if (v > 0) toast.success(`${v}% discount applied`);
  };

  const holdOrder = () => {
    if (!cart.length) { toast.error('Nothing to hold'); return; }
    setHeldCount(c => c + 1);
    clearCart();
    toast.success('Order placed on hold');
  };

  const voidOrder = () => {
    if (!cart.length) { toast.error('No active order'); return; }
    clearCart();
    toast.success('Order voided');
  };

  const processCharge = async () => {
    if (!cart.length) return;
    try {
      const items = cart.map(i => ({ productId: i.id, quantity: i.qty }));
      await api.post('/sales', {
        items,
        paymentMethod: payMethod.toUpperCase()
      });
      toast.success(`Charged ${formatAmount(grandTotal)} via ${payMethod.toUpperCase()}`, { icon: '💳' });
      setOrdersToday(n => n + 1);
      clearCart();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process sale');
    }
  };

  const printBill = () => {
    if (cart.length === 0) { toast.error('Cart is empty'); return; }
    const printWindow = window.open('', '_blank');
    const receiptHtml = `
      <html><head><title>Receipt</title>
      <style>
        body { font-family: monospace; padding: 20px; max-width: 300px; margin: 0 auto; color: #000; }
        .text-center { text-align: center; }
        .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
        table { width: 100%; border-collapse: collapse; }
        th, td { text-align: left; padding: 4px 0; font-size: 12px; }
        th.right, td.right { text-align: right; }
      </style></head><body>
      <div class="text-center">
        <h2>SwiftPOS</h2>
        <p>Receipt</p>
      </div>
      <div class="divider"></div>
      <table>
        <thead><tr><th>Item</th><th class="right">Qty</th><th class="right">Total</th></tr></thead>
        <tbody>
          ${cart.map(i => `<tr><td>${i.name}</td><td class="right">${i.qty}</td><td class="right">${formatAmount(i.price * i.qty)}</td></tr>`).join('')}
        </tbody>
      </table>
      <div class="divider"></div>
      <table>
        <tr><td>Subtotal</td><td class="right">${formatAmount(subtotal)}</td></tr>
        <tr><td>Discount</td><td class="right">-${formatAmount(discAmt)}</td></tr>
        <tr><td>Tax</td><td class="right">${formatAmount(taxAmt)}</td></tr>
        <tr><th><b>Total</b></th><th class="right"><b>${formatAmount(grandTotal)}</b></th></tr>
      </table>
      <div class="divider"></div>
      <p class="text-center">Thank you!</p>
      </body></html>
    `;
    printWindow.document.write(receiptHtml);
    printWindow.document.close();
    printWindow.print();
  };

  const openDrawer = () => toast.success('Cash drawer opened', { icon: '🗄️' });

  const TABLES = ['T-01','T-02','T-03','T-04','T-05','T-06','T-08','T-09'];
  const switchTable = () => {
    const t = TABLES[Math.floor(Math.random() * TABLES.length)];
    setTableNum(t);
    toast(`Switched to ${t}`, { icon: '🪑' });
  };

  /* ── render ── */
  return (
    <div style={S.shell}>

      {/* ══════════ TOP BAR ══════════ */}
      <header style={S.topbar}>
        <span style={S.logo}>Swift<span style={{ color: '#f3f4f6' }}>POS</span></span>
        <div style={S.topbarDivider} />

        <TopbarBtn icon={<Briefcase size={14} />} label="Open drawer" onClick={openDrawer} />
        <TopbarBtn icon={<Bookmark  size={14} />} label="Hold order"  onClick={holdOrder}  />
        <TopbarBtn
          icon={<Tag size={14} />}
          label="Discount"
          onClick={() => setShowDiscBox(b => !b)}
          active={showDiscBox}
        />
        <div style={S.topbarDivider} />
        <TopbarBtn
          icon={<UtensilsCrossed size={14} />}
          label={<>Table <span style={{ color: '#22c55e', marginLeft: 4 }}>{tableNum}</span></>}
          onClick={switchTable}
        />

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          {heldCount > 0 && (
            <span style={S.heldBadge}>● {heldCount} on hold</span>
          )}
          <div style={S.cashierBadge}>
            <span style={S.onlineDot} />
            <span style={{ fontSize: 13, color: '#9ca3af' }}>Maya R.</span>
          </div>
          <span style={{ fontSize: 13, color: '#6b7280', fontVariantNumeric: 'tabular-nums' }}>{time}</span>
        </div>
      </header>

      {/* ══════════ BODY ══════════ */}
      <div style={S.body}>

        {/* ── LEFT PANE ── */}
        <section style={S.leftPane}>
          {/* search */}
          <div style={{ padding: '12px 14px 8px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={S.searchIcon} />
              <input
                ref={searchRef}
                style={S.searchInput}
                placeholder="Search items…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              {query && (
                <button style={S.clearSearch} onClick={() => setQuery('')}>
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* categories */}
          <div style={S.catRow}>
            {categories.map(c => (
              <button
                key={c}
                style={{ ...S.catBtn, ...(activeCat === c ? S.catBtnActive : {}) }}
                onClick={() => setActiveCat(c)}
              >
                {CAT_ICONS[c] || <Package size={14} />}
                {c}
              </button>
            ))}
          </div>

          {/* product grid */}
          <div style={S.grid}>
            {filtered.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
                <Search size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
                <p style={{ fontSize: 14 }}>No items found</p>
              </div>
            )}
            {filtered.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                popping={poppingId === p.id}
                onAdd={() => addItem(p)}
              />
            ))}
          </div>
        </section>

        {/* ── CENTER PANE ── */}
        <section style={S.centerPane}>
          <div style={S.paneHeader}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 600, color: '#f3f4f6' }}>Order</span>
                {totalItems > 0 && <span style={S.countBadge}>{totalItems}</span>}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                Table {tableNum} · Dine in
              </div>
            </div>
            {cart.length > 0 && (
              <button style={S.voidSmall} onClick={voidOrder}>
                <Trash2 size={13} /> Clear
              </button>
            )}
          </div>

          {/* items */}
          <div style={S.orderScroll}>
            {cart.length === 0 ? (
              <div style={S.emptyCart}>
                <ShoppingCart size={40} style={{ opacity: 0.25, marginBottom: 10 }} />
                <p style={{ fontSize: 14, color: '#6b7280' }}>Tap items to add them</p>
              </div>
            ) : (
              cart.map(item => (
                <OrderRow
                  key={item.id}
                  item={item}
                  onInc={() => changeQty(item.id, +1)}
                  onDec={() => changeQty(item.id, -1)}
                  onDel={() => removeItem(item.id)}
                />
              ))
            )}
          </div>

          {/* notes */}
          <div style={{ padding: '0 14px 12px' }}>
            <textarea
              style={S.notesInput}
              placeholder="Order notes (allergies, special requests…)"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
        </section>

        {/* ── RIGHT PANE ── */}
        <section style={S.rightPane}>
          <div style={S.paneHeader}>
            <span style={{ fontWeight: 600, color: '#f3f4f6' }}>Checkout</span>
          </div>

          {/* discount input (toggles) */}
          {showDiscBox && (
            <div style={{ padding: '8px 16px', display: 'flex', gap: 6 }}>
              <input
                style={{ ...S.searchInput, fontSize: 13, padding: '7px 10px' }}
                type="number"
                min="0"
                max="100"
                placeholder="% discount"
                value={discInput}
                onChange={e => setDiscInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && applyDiscount()}
              />
              <button style={S.discApplyBtn} onClick={applyDiscount}>Apply</button>
            </div>
          )}

          {/* totals */}
          <div style={S.totalsArea}>
            <TotalRow label="Subtotal"          value={formatAmount(subtotal)} muted />
            {discount > 0 && (
              <TotalRow label={`Discount (${discount}%)`} value={`-${formatAmount(discAmt)}`} warn />
            )}
            <TotalRow label="Tax"                value={formatAmount(taxAmt)}  muted />
            <div style={S.totalDivider} />
            <TotalRow label="Total"              value={formatAmount(grandTotal)} grand />
          </div>

          {/* payment methods */}
          <div style={{ padding: '4px 16px 6px', fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.6px', fontWeight: 600 }}>
            Payment method
          </div>
          <div style={S.payGrid}>
            {[
              { id: 'cash',   label: 'Cash',    icon: <Banknote size={20} /> },
              { id: 'card',   label: 'Card',    icon: <CreditCard size={20} /> },
              { id: 'qr',     label: 'QR Code', icon: <QrCode size={20} /> },
              { id: 'wallet', label: 'Wallet',  icon: <Wallet size={20} /> },
              { id: 'credit', label: 'Credit',  icon: <Briefcase size={20} /> },
            ].map(m => (
              <button
                key={m.id}
                style={{ ...S.payBtn, ...(payMethod === m.id ? S.payBtnActive : {}) }}
                onClick={() => setPayMethod(m.id)}
              >
                {m.icon}
                {m.label}
              </button>
            ))}
          </div>

          {/* QR Display */}
          {payMethod === 'qr' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '10px 0' }}>
              <div style={{ background: '#fff', padding: 10, borderRadius: 12 }}>
                 <QrCode size={120} color="#000" />
              </div>
              <span style={{ fontSize: 13, marginTop: 8, color: '#9ca3af', fontWeight: 500 }}>
                Scan to pay <strong style={{color: '#f3f4f6'}}>{formatAmount(grandTotal)}</strong>
              </span>
            </div>
          )}

          {/* split / KOT */}
          <div style={{ display: 'flex', gap: 6, padding: '4px 16px 8px' }}>
            <button style={S.splitBtn}><Users size={13} /> Split bill</button>
            <button style={S.splitBtn} onClick={printBill}><Printer size={13} /> Print Bill</button>
          </div>

          {/* charge button */}
          <div style={{ padding: '6px 16px 0' }}>
            <button
              style={{ ...S.chargeBtn, ...(cart.length === 0 ? S.chargeBtnDisabled : {}) }}
              onClick={processCharge}
              disabled={cart.length === 0}
            >
              <Zap size={18} />
              <span>Charge</span>
              {cart.length > 0 && <span style={{ fontSize: 14, opacity: .75 }}>· {formatAmount(grandTotal)}</span>}
            </button>
          </div>

          {/* void */}
          <div style={{ padding: '8px 16px 16px' }}>
            <button style={S.voidBtn} onClick={voidOrder}>
              <Trash2 size={14} /> Void order
            </button>
          </div>
        </section>
      </div>

      {/* ══════════ STATUS BAR ══════════ */}
      <footer style={S.statusBar}>
        <StatusItem dot="#22c55e" label="POS Online" />
        <StatusDivider />
        <StatusItem dot="#3b82f6" label="Printer" value="Ready" />
        <StatusDivider />
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6b7280' }}>
          <ReceiptText size={13} />
          Orders today: <span style={{ color: '#d1d5db', fontWeight: 500 }}>{ordersToday}</span>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 12, color: '#6b7280' }}>
          Revenue: <span style={{ color: '#d1d5db', fontWeight: 500 }}>₹18,430</span>
        </div>
      </footer>
    </div>
  );
}

/* ══════════════════ SUB-COMPONENTS ══════════════════ */

function ProductCard({ product, popping, onAdd }) {
  const { formatAmount } = useCurrency();
  const [pressed, setPressed] = useState(false);
  const emoji = product.emoji || getEmojiForCategory(product.category);
  return (
    <div
      style={{
        ...S.productCard,
        ...(pressed ? S.productCardPressed : {}),
        ...(popping  ? S.productCardPop    : {}),
      }}
      onClick={onAdd}
      onMouseDown={() => setPressed(true)}
      onMouseUp={()   => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={()   => setPressed(false)}
      role="button"
      tabIndex={0}
      aria-label={`Add ${product.name}`}
      onKeyDown={e => e.key === 'Enter' && onAdd()}
    >
      {(product.hot || product.isNew) && (
        <span style={{ ...S.badge, ...(product.hot ? S.badgeHot : S.badgeNew) }}>
          {product.hot ? 'hot' : 'new'}
        </span>
      )}
      <div style={{ fontSize: 28, textAlign: 'center', lineHeight: 1, marginBottom: 6 }}>{emoji}</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: '#e5e7eb', lineHeight: 1.3 }}>{product.name}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#22c55e', marginTop: 4 }}>{formatAmount(product.price)}</div>
    </div>
  );
}

function OrderRow({ item, onInc, onDec, onDel }) {
  const { formatAmount } = useCurrency();
  const emoji = item.emoji || getEmojiForCategory(item.category);
  return (
    <div style={S.orderRow}>
      <span style={{ fontSize: 20, flexShrink: 0 }}>{emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#e5e7eb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.name}
        </div>
        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }}>{formatAmount(item.price)} each</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
        <QtyBtn onClick={onDec}><Minus size={13} /></QtyBtn>
        <span style={{ fontSize: 14, fontWeight: 600, minWidth: 22, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{item.qty}</span>
        <QtyBtn onClick={onInc}><Plus size={13} /></QtyBtn>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#f3f4f6', minWidth: 60, textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
        {formatAmount(item.price * item.qty)}
      </div>
      <button style={S.delBtn} onClick={onDel} aria-label={`Remove ${item.name}`}>
        <X size={14} />
      </button>
    </div>
  );
}

function QtyBtn({ children, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      style={{ ...S.qtyBtn, ...(hover ? S.qtyBtnHover : {}) }}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </button>
  );
}

function TopbarBtn({ icon, label, onClick, active }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      style={{ ...S.topbarBtn, ...(hover || active ? S.topbarBtnHover : {}) }}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {icon}{label}
    </button>
  );
}

function TotalRow({ label, value, muted, warn, grand }) {
  const color = grand ? '#f3f4f6' : warn ? '#fbbf24' : '#9ca3af';
  const size  = grand ? 20 : 13;
  const weight = grand ? 800 : 400;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: size, fontWeight: weight, color, fontVariantNumeric: 'tabular-nums' }}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function StatusItem({ dot, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6b7280' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, display: 'inline-block' }} />
      {label}
      {value && <span style={{ color: '#d1d5db', fontWeight: 500, marginLeft: 2 }}>{value}</span>}
    </div>
  );
}

function StatusDivider() {
  return <span style={{ width: 1, height: 16, background: '#1f2937', display: 'inline-block' }} />;
}

/* ══════════════════ STYLES ══════════════════ */
const S = {
  shell: {
    display: 'grid',
    gridTemplateRows: '52px 1fr 48px',
    height: '100vh',
    width: '100%',
    background: '#12141f',
    fontFamily: "'Inter', system-ui, sans-serif",
    overflow: 'hidden',
  },
  topbar: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '0 16px',
    background: '#1e2130',
    borderBottom: '1px solid #1f2937',
    flexShrink: 0,
  },
  logo: {
    fontWeight: 700,
    fontSize: 16,
    color: '#22c55e',
    letterSpacing: '-0.5px',
    marginRight: 4,
  },
  topbarDivider: { width: 1, height: 24, background: '#1f2937' },
  topbarBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 12px', borderRadius: 6,
    border: '1px solid #1f2937', background: '#12141f',
    color: '#9ca3af', fontSize: 13, fontFamily: 'inherit',
    cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .15s',
  },
  topbarBtnHover: { background: '#1e2130', borderColor: '#374151', color: '#f3f4f6' },
  cashierBadge: { display: 'flex', alignItems: 'center', gap: 7, padding: '4px 10px', borderRadius: 6, background: '#12141f', border: '1px solid #1f2937' },
  onlineDot:    { width: 7, height: 7, borderRadius: '50%', background: '#22c55e', flexShrink: 0 },
  heldBadge:    { padding: '3px 9px', borderRadius: 10, background: '#451a03', color: '#fbbf24', fontSize: 11, fontWeight: 600, cursor: 'pointer' },

  body: {
    display: 'grid',
    gridTemplateColumns: '1fr 320px 260px',
    overflow: 'hidden',
    minHeight: 0,
  },

  /* left */
  leftPane: { display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: '1px solid #1f2937', background: '#12141f', minHeight: 0 },
  searchIcon: { position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#6b7280', pointerEvents: 'none' },
  searchInput: {
    width: '100%', padding: '9px 32px 9px 34px',
    background: '#1e2130', border: '1px solid #1f2937',
    borderRadius: 8, color: '#f3f4f6', fontSize: 14,
    fontFamily: 'inherit', outline: 'none',
    transition: 'border .15s',
  },
  clearSearch: { position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  catRow: { display: 'flex', gap: 6, padding: '4px 14px 10px', overflowX: 'auto', scrollbarWidth: 'none', flexShrink: 0 },
  catBtn: {
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '5px 13px', borderRadius: 20,
    border: '1px solid #1f2937', background: 'transparent',
    color: '#9ca3af', fontSize: 12, fontFamily: 'inherit',
    cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .15s', flexShrink: 0,
  },
  catBtnActive: { background: '#22c55e', borderColor: '#22c55e', color: '#000', fontWeight: 600 },
  grid: {
    flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 14px 14px',
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(128px,1fr))',
    gridAutoRows: 'min-content',
    gap: 10, alignContent: 'start', scrollbarWidth: 'thin', scrollbarColor: '#1f2937 transparent',
  },
  productCard: {
    background: '#1e2130', border: '1px solid #1f2937',
    borderRadius: 12, padding: '14px 12px 12px',
    cursor: 'pointer', transition: 'all .18s',
    display: 'flex', flexDirection: 'column', gap: 0,
    position: 'relative', overflow: 'hidden',
    userSelect: 'none', outline: 'none',
    minHeight: 110,
  },
  productCardPressed: { transform: 'scale(.96)', borderColor: '#22c55e' },
  productCardPop:     { animation: 'none', transform: 'scale(1.04)' },
  badge: { position: 'absolute', top: 8, right: 8, fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 600 },
  badgeHot: { background: '#7f1d1d', color: '#fca5a5' },
  badgeNew: { background: '#1e3a5f', color: '#93c5fd' },

  /* center */
  centerPane: { display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: '1px solid #1f2937', background: '#1e2130' },
  paneHeader: { padding: '13px 16px 10px', borderBottom: '1px solid #1f2937', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 },
  countBadge: { background: '#22c55e', color: '#000', borderRadius: 10, padding: '1px 8px', fontSize: 12, fontWeight: 700 },
  orderScroll: { flex: 1, overflowY: 'auto', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8, scrollbarWidth: 'thin', scrollbarColor: '#1f2937 transparent' },
  emptyCart:   { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6b7280' },
  orderRow: {
    background: '#12141f', border: '1px solid #1f2937',
    borderRadius: 8, padding: '10px 12px',
    display: 'flex', alignItems: 'center', gap: 10,
    animation: 'slideIn .2s ease-out',
  },
  qtyBtn: {
    width: 28, height: 28, borderRadius: 6,
    border: '1px solid #1f2937', background: '#1e2130',
    color: '#d1d5db', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all .12s', flexShrink: 0,
  },
  qtyBtnHover: { background: '#22c55e', borderColor: '#22c55e', color: '#000' },
  delBtn: {
    width: 26, height: 26, borderRadius: 6,
    border: 'none', background: 'transparent',
    color: '#6b7280', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all .12s', flexShrink: 0,
  },
  notesInput: {
    width: '100%', padding: '8px 10px',
    background: '#12141f', border: '1px solid #1f2937',
    borderRadius: 8, color: '#d1d5db', fontSize: 13,
    fontFamily: 'inherit', resize: 'none', outline: 'none', height: 52,
  },
  voidSmall: {
    display: 'flex', alignItems: 'center', gap: 4,
    padding: '4px 10px', borderRadius: 6,
    border: '1px solid #1f2937', background: 'transparent',
    color: '#6b7280', fontSize: 12, fontFamily: 'inherit', cursor: 'pointer',
    transition: 'all .15s',
  },

  /* right */
  rightPane: { display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#1e2130' },
  totalsArea: { padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 7, borderBottom: '1px solid #1f2937' },
  totalDivider: { borderTop: '1px solid #1f2937', marginTop: 4, paddingTop: 4 },
  payGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, padding: '4px 16px 8px' },
  payBtn: {
    padding: '10px 6px', borderRadius: 8,
    border: '1px solid #1f2937', background: '#12141f',
    color: '#9ca3af', fontSize: 12, fontFamily: 'inherit',
    cursor: 'pointer', transition: 'all .15s',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, fontWeight: 500,
  },
  payBtnActive: { borderColor: '#22c55e', background: 'rgba(34,197,94,.12)', color: '#22c55e' },
  splitBtn: {
    flex: 1, padding: '8px', borderRadius: 8,
    border: '1px solid #1f2937', background: '#12141f',
    color: '#9ca3af', fontSize: 12, fontFamily: 'inherit',
    cursor: 'pointer', transition: 'all .15s',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
  },
  discApplyBtn: {
    padding: '7px 14px', borderRadius: 8,
    border: '1px solid #d97706', background: 'transparent',
    color: '#fbbf24', fontSize: 13, fontFamily: 'inherit',
    cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .15s',
  },
  chargeBtn: {
    width: '100%', padding: '15px',
    borderRadius: 12, border: 'none',
    background: '#22c55e', color: '#000',
    fontSize: 16, fontWeight: 800, fontFamily: 'inherit',
    cursor: 'pointer', transition: 'all .15s',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    letterSpacing: '-0.2px',
  },
  chargeBtnDisabled: { background: '#1e2130', color: '#4b5563', cursor: 'not-allowed', border: '1px solid #1f2937' },
  voidBtn: {
    width: '100%', padding: 10,
    borderRadius: 8, border: '1px solid #1f2937',
    background: 'transparent', color: '#6b7280',
    fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
    transition: 'all .15s',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  },

  /* status bar */
  statusBar: {
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '0 16px',
    background: '#1e2130', borderTop: '1px solid #1f2937',
    flexShrink: 0,
  },
};
