import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getDashboardSummary } from '../api/reportApi';
import { getLowStockItems } from '../api/inventoryApi';
import { getSales } from '../api/saleApi';
import {
  DollarSign, ShoppingBag, Package, AlertTriangle,
  TrendingUp, Clock, Banknote, CreditCard, Smartphone,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const { formatAmount, currency, convertAmount } = useCurrency();
  const [summary, setSummary]       = useState(null);
  const [lowStock, setLowStock]     = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [allSales, setAllSales]     = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // dates for the last 30 days (covers recent + weekly chart)
        const today     = new Date();
        const todayStr  = today.toISOString().slice(0, 10);
        const d30Ago    = new Date(today - 30 * 86400000).toISOString().slice(0, 10);

        const [smRes, lsRes, salesRes] = await Promise.allSettled([
          getDashboardSummary(),
          getLowStockItems(),
          getSales({ start: d30Ago, end: todayStr }),
        ]);
        if (smRes.status === 'fulfilled')    setSummary(smRes.value.data);
        if (lsRes.status === 'fulfilled')    setLowStock(lsRes.value.data || []);
        if (salesRes.status === 'fulfilled') {
          const data = salesRes.value.data?.content || salesRes.value.data || [];
          // Sort newest first
          const sorted = [...data].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setAllSales(sorted);
          setRecentSales(sorted.slice(0, 5));
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Build last-7-days chart from actual sale data
  const chartData = buildWeeklyChart(allSales);

  // Stats derived from real data
  const ordersToday = recentSales.filter(s => {
    const d = s.createdAt ? new Date(s.createdAt).toDateString() : '';
    return d === new Date().toDateString();
  }).length;

  if (loading) return <LoadingSpinner fullScreen text="Loading dashboard…" />;

  const payIcons = { CASH: Banknote, CARD: CreditCard, UPI: Smartphone };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Greeting */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Good {getGreeting()},{' '}
            <span className="text-gradient">{user?.username}</span> 👋
          </h1>
          <p className="page-subtitle">
            Here's what's happening in your store today —&nbsp;
            <span style={{ color: '#60a5fa', fontWeight: 600 }}>{currency.name} ({currency.code})</span>
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Today's Revenue"
          value={formatAmount(summary?.todayRevenue ?? 0)}
          icon={<DollarSign className="w-6 h-6" />}
          color="blue"
          subtitle={`in ${currency.code}`}
        />
        <StatCard
          title="Orders Today"
          value={summary?.ordersToday ?? ordersToday}
          icon={<ShoppingBag className="w-6 h-6" />}
          color="green"
          subtitle="transactions"
        />
        <StatCard
          title="Total Products"
          value={summary?.totalProducts ?? 0}
          icon={<Package className="w-6 h-6" />}
          color="purple"
          subtitle="in catalog"
        />
        <StatCard
          title="Low Stock Alerts"
          value={summary?.lowStockCount ?? lowStock.length}
          icon={<AlertTriangle className="w-6 h-6" />}
          color={(summary?.lowStockCount ?? lowStock.length) > 0 ? 'red' : 'green'}
          subtitle={(summary?.lowStockCount ?? lowStock.length) > 0 ? 'action required' : 'all stocked'}
        />
      </div>

      {/* Chart + Low Stock */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue chart — real data */}
        <div className="xl:col-span-2 card">
          <div className="card-header">
            <div>
              <h3 className="font-semibold text-white">
                Weekly Revenue ({currency.code})
              </h3>
              <p className="text-xs text-gray-500">Last 7 days • converted at live rate</p>
            </div>
            <TrendingUp className="w-5 h-5 text-primary-400" />
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  axisLine={false} tickLine={false}
                  tickFormatter={(v) => formatAmount(v)}
                  width={90}
                />
                <Tooltip
                  contentStyle={{ background: '#1e2130', border: '1px solid #374151', borderRadius: 8 }}
                  labelStyle={{ color: '#9ca3af' }}
                  itemStyle={{ color: '#60a5fa' }}
                  formatter={(v) => [formatAmount(v), `Revenue (${currency.code})`]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low stock panel */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="font-semibold text-white">Low Stock</h3>
              <p className="text-xs text-gray-500">Needs restocking</p>
            </div>
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="card-body space-y-3">
            {lowStock.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">All products are stocked ✅</p>
            ) : (
              lowStock.slice(0, 6).map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2
                                               border-b border-gray-800 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-white">{item.productName}</p>
                    <p className="text-xs text-gray-500">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-400">{item.quantityOnHand}</p>
                    <p className="text-xs text-gray-500">/{item.reorderThreshold} min</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="font-semibold text-white">Recent Transactions</h3>
            <p className="text-xs text-gray-500">Last 5 sales</p>
          </div>
          <Clock className="w-5 h-5 text-gray-500" />
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Sale ID</th>
                <th>Cashier</th>
                <th>Items</th>
                <th>Total ({currency.code})</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-gray-500 py-12">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-gray-700" />
                    No transactions yet
                  </td>
                </tr>
              ) : (
                recentSales.map((s) => {
                  const PayIcon = payIcons[s.paymentMethod] || Banknote;
                  const itemCount = s.items?.reduce((sum, i) => sum + i.quantity, 0) ?? '—';
                  return (
                    <tr key={s.id}>
                      <td className="font-mono text-primary-400">#{s.id}</td>
                      <td className="text-white">{s.cashierUsername || s.cashierName || '—'}</td>
                      <td className="text-gray-400">{itemCount} item{itemCount !== 1 ? 's' : ''}</td>
                      <td className="font-semibold text-emerald-400">
                        {formatAmount(s.totalAmount)}
                      </td>
                      <td>
                        <span className="flex items-center gap-1.5 text-gray-300 text-sm">
                          <PayIcon className="w-3.5 h-3.5" />
                          {s.paymentMethod}
                        </span>
                      </td>
                      <td>
                        <span className={s.status === 'COMPLETED' ? 'badge-green' : 'badge-red'}>
                          {s.status}
                        </span>
                      </td>
                      <td className="text-gray-500 text-xs">
                        {s.createdAt ? new Date(s.createdAt).toLocaleString() : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/** Build a last-7-days revenue array from an array of sales objects */
function buildWeeklyChart(sales) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      day: d.toLocaleDateString('en', { weekday: 'short' }),
      dateStr: d.toDateString(),
      revenue: 0,
    });
  }
  sales.forEach((s) => {
    if (!s.createdAt || s.status !== 'COMPLETED') return;
    const saleDate = new Date(s.createdAt).toDateString();
    const slot = days.find((d) => d.dateStr === saleDate);
    if (slot) slot.revenue += Number(s.totalAmount || 0);
  });
  return days;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
