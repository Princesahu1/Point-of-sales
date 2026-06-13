import React, { useEffect, useState, useCallback } from 'react';
import { getSales } from '../api/saleApi';
import { printBill } from '../utils/printBill';
import LoadingSpinner from '../components/LoadingSpinner';
import { useCurrency } from '../context/CurrencyContext';
import {
  Receipt, Search, Printer, ChevronDown, ChevronUp,
  Calendar, X, ShoppingBag, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Bills() {
  const { formatAmount, currency } = useCurrency();
  const today = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().slice(0, 10);

  const [sales, setSales]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate]     = useState(today);
  const [search, setSearch]       = useState('');
  const [expanded, setExpanded]   = useState(null); // sale id that is open

  const loadSales = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSales({ start: startDate, end: endDate });
      const data = res.data || [];
      // Sort newest first
      setSales([...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      toast.error('Failed to load bills');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => { loadSales(); }, [loadSales]);

  const filtered = sales.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      String(s.id).includes(q) ||
      s.cashierUsername?.toLowerCase().includes(q) ||
      s.paymentMethod?.toLowerCase().includes(q) ||
      s.status?.toLowerCase().includes(q)
    );
  });

  const handlePrint = (sale) => {
    printBill({
      billId:        sale.id,
      cashier:       sale.cashierUsername,
      dateStr:       sale.createdAt,
      items:         (sale.items || []).map(i => ({
        name:      i.productName || i.name || 'Item',
        quantity:  i.quantity,
        price:     i.unitPrice ?? i.price ?? 0,
        unitPrice: i.unitPrice ?? i.price ?? 0,
      })),
      paymentMethod: sale.paymentMethod,
      status:        sale.status,
      currency,
      formatAmount,
    });
  };

  const statusBadge = (status) => {
    if (status === 'COMPLETED') return 'badge-green';
    if (status === 'REFUNDED')  return 'badge-red';
    return 'badge-gray';
  };

  const payIcon = { CASH: '💵', CARD: '💳', UPI: '📱' };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Bills & Sale History</h1>
          <p className="page-subtitle">View, search, and print past transaction receipts</p>
        </div>
        <button onClick={loadSales} className="btn-secondary" id="refresh-bills-btn">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="form-group">
              <label className="label">From Date</label>
              <input
                id="bills-start-date"
                type="date"
                value={startDate}
                max={endDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input"
              />
            </div>
            <div className="form-group">
              <label className="label">To Date</label>
              <input
                id="bills-end-date"
                type="date"
                value={endDate}
                max={today}
                onChange={(e) => setEndDate(e.target.value)}
                className="input"
              />
            </div>
            <div className="form-group flex-1 min-w-[200px]">
              <label className="label">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  id="bills-search"
                  type="text"
                  placeholder="Bill #, cashier, payment…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input pl-9"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="card p-4" style={{ background:'rgba(16,185,129,0.06)', borderColor:'rgba(16,185,129,0.2)' }}>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-emerald-400">
              {formatAmount(filtered.reduce((s, b) => s + Number(b.totalAmount || 0), 0))}
            </p>
          </div>
          <div className="card p-4" style={{ background:'rgba(37,99,235,0.06)', borderColor:'rgba(37,99,235,0.2)' }}>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Bills</p>
            <p className="text-2xl font-bold text-primary-400">{filtered.length}</p>
          </div>
          <div className="card p-4" style={{ background:'rgba(139,92,246,0.06)', borderColor:'rgba(139,92,246,0.2)' }}>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Avg Bill Value</p>
            <p className="text-2xl font-bold text-purple-400">
              {formatAmount(filtered.reduce((s, b) => s + Number(b.totalAmount || 0), 0) / filtered.length)}
            </p>
          </div>
        </div>
      )}

      {/* Bills List */}
      {loading ? (
        <LoadingSpinner text="Loading bills…" />
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <ShoppingBag className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400">No bills found for this period.</p>
          <p className="text-xs text-gray-600 mt-1">Try adjusting the date range.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((sale) => (
            <div key={sale.id} className="card overflow-hidden">
              {/* Row header — always visible */}
              <button
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-dark-300/50 transition-colors text-left"
                onClick={() => setExpanded(expanded === sale.id ? null : sale.id)}
                id={`bill-row-${sale.id}`}
              >
                {/* Bill # */}
                <div className="flex items-center gap-2 min-w-[80px]">
                  <Receipt className="w-4 h-4 text-primary-400 shrink-0" />
                  <span className="font-bold text-white">#{sale.id}</span>
                </div>

                {/* Date & Cashier */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium">
                    {sale.createdAt ? new Date(sale.createdAt).toLocaleString() : '—'}
                  </p>
                  <p className="text-xs text-gray-500">Cashier: {sale.cashierUsername || '—'}</p>
                </div>

                {/* Payment */}
                <div className="text-sm text-gray-300 min-w-[90px]">
                  {payIcon[sale.paymentMethod] || '💰'} {sale.paymentMethod}
                </div>

                {/* Status */}
                <span className={statusBadge(sale.status)}>{sale.status}</span>

                {/* Amount */}
                <p className="font-bold text-emerald-400 text-base min-w-[90px] text-right">
                  {formatAmount(sale.totalAmount)}
                </p>

                {/* Print */}
                <button
                  id={`print-bill-${sale.id}`}
                  onClick={(e) => { e.stopPropagation(); handlePrint(sale); }}
                  className="btn-secondary text-xs px-3 py-1.5 shrink-0"
                  title="Print receipt"
                >
                  <Printer className="w-4 h-4" />
                </button>

                {/* Expand toggle */}
                {expanded === sale.id
                  ? <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                }
              </button>

              {/* Expanded item breakdown */}
              {expanded === sale.id && (
                <div className="border-t border-gray-800 bg-dark-300/40 px-6 py-4">
                  {(!sale.items || sale.items.length === 0) ? (
                    <p className="text-gray-500 text-sm">No item details available.</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-500 text-xs border-b border-gray-800">
                          <th className="text-left pb-2">Product</th>
                          <th className="text-center pb-2">Qty</th>
                          <th className="text-right pb-2">Unit Price</th>
                          <th className="text-right pb-2">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sale.items.map((item, idx) => (
                          <tr key={idx} className="border-b border-gray-800/50 last:border-0">
                            <td className="py-2 text-white font-medium">{item.productName || item.name || '—'}</td>
                            <td className="py-2 text-center text-gray-400">{item.quantity}</td>
                            <td className="py-2 text-right text-gray-400">{formatAmount(item.unitPrice ?? item.price)}</td>
                            <td className="py-2 text-right text-emerald-400 font-semibold">
                              {formatAmount(item.subtotal ?? (Number(item.unitPrice || item.price) * item.quantity))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={3} className="pt-3 text-right text-gray-400 font-medium">Total</td>
                          <td className="pt-3 text-right text-emerald-400 font-bold text-base">
                            {formatAmount(sale.totalAmount)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
