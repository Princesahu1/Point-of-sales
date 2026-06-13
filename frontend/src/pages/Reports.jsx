import React, { useEffect, useState } from 'react';
import {
  getDailyReport, getMonthlyReport, getInventoryReport, getTopProducts
} from '../api/reportApi';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, ResponsiveContainer, LineChart, Line, Area, AreaChart,
} from 'recharts';
import {
  Calendar, TrendingUp, Package, BarChart3,
  ShoppingCart, DollarSign, ArrowUpRight, Download,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCurrency } from '../context/CurrencyContext';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316', '#ec4899'];

/** Custom recharts tooltip that auto-formats currency */
function CurrencyTooltip({ active, payload, label, formatAmount }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1e2130', border: '1px solid #374151',
      borderRadius: 8, padding: '10px 14px', fontSize: 13,
    }}>
      {label && <p style={{ color: '#9ca3af', marginBottom: 4 }}>{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color || '#e5e7eb', margin: '2px 0' }}>
          <span style={{ color: '#6b7280' }}>{entry.name}: </span>
          {typeof entry.value === 'number' && entry.name?.toLowerCase().includes('revenue')
            ? formatAmount(entry.value)
            : entry.value}
        </p>
      ))}
    </div>
  );
}

export default function Reports() {
  const { formatAmount, currency } = useCurrency();
  const today = new Date();
  const [activeTab, setActiveTab]       = useState('daily');
  const [selectedDate, setDate]         = useState(today.toISOString().slice(0, 10));
  const [selectedYear, setYear]         = useState(today.getFullYear());
  const [selectedMonth, setMonth]       = useState(today.getMonth() + 1);
  const [report, setReport]             = useState(null);
  const [topProducts, setTopProducts]   = useState([]);
  const [inventoryRep, setInventoryRep] = useState([]);
  const [loading, setLoading]           = useState(false);

  useEffect(() => { loadReport(); }, [activeTab, selectedDate, selectedYear, selectedMonth]);
  useEffect(() => { loadTopProducts(); loadInventoryReport(); }, []);

  const loadReport = async () => {
    setLoading(true);
    try {
      let res;
      if (activeTab === 'daily') {
        res = await getDailyReport(selectedDate);
      } else {
        res = await getMonthlyReport(selectedYear, selectedMonth);
      }
      setReport(res.data);
    } catch {
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const loadTopProducts = async () => {
    try {
      const res = await getTopProducts(8);
      setTopProducts(res.data || []);
    } catch { /* silently ignore */ }
  };

  const loadInventoryReport = async () => {
    try {
      const res = await getInventoryReport();
      setInventoryRep(res.data || []);
    } catch { /* silently ignore */ }
  };

  /** Export report as CSV */
  const exportCSV = () => {
    if (!report) return;
    const rows = [
      ['Metric', 'Value'],
      ['Report Type', activeTab],
      ['Period', activeTab === 'daily' ? selectedDate : `${selectedYear}-${selectedMonth}`],
      ['Currency', currency.code],
      ['Total Revenue', report.totalRevenue ?? 0],
      ['Total Orders', report.totalOrders ?? 0],
      ['Avg Order Value', report.avgOrderValue ?? 0],
      ['Items Sold', report.totalItemsSold ?? 0],
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${activeTab}-${selectedDate || selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported!');
  };

  const tabs = [
    { key: 'daily',   label: 'Daily Report',   icon: Calendar },
    { key: 'monthly', label: 'Monthly Report',  icon: TrendingUp },
  ];

  const summaryCards = report ? [
    {
      label: 'Total Revenue',
      value: formatAmount(report.totalRevenue ?? 0),
      color: 'text-emerald-400',
      border: 'rgba(16,185,129,0.2)',
      bg: 'rgba(16,185,129,0.06)',
      icon: DollarSign,
      iconColor: '#10b981',
    },
    {
      label: 'Total Orders',
      value: report.totalOrders ?? 0,
      color: 'text-primary-400',
      border: 'rgba(37,99,235,0.2)',
      bg: 'rgba(37,99,235,0.06)',
      icon: ShoppingCart,
      iconColor: '#3b82f6',
    },
    {
      label: 'Avg Order Value',
      value: formatAmount(report.avgOrderValue ?? 0),
      color: 'text-purple-400',
      border: 'rgba(139,92,246,0.2)',
      bg: 'rgba(139,92,246,0.06)',
      icon: TrendingUp,
      iconColor: '#8b5cf6',
    },
    {
      label: 'Items Sold',
      value: report.totalItemsSold ?? 0,
      color: 'text-amber-400',
      border: 'rgba(245,158,11,0.2)',
      bg: 'rgba(245,158,11,0.06)',
      icon: Package,
      iconColor: '#f59e0b',
    },
  ] : [];

  return (
    <div className="animate-fade-in space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">
            Sales analytics &amp; inventory insights &mdash; all amounts in{' '}
            <span style={{ color: '#60a5fa', fontWeight: 600 }}>
              {currency.name} ({currency.code})
            </span>
          </p>
        </div>
        <button
          id="export-report-btn"
          onClick={exportCSV}
          disabled={!report}
          className="btn-secondary"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            id={`tab-${key}`}
            onClick={() => setActiveTab(key)}
            className={`btn ${activeTab === key ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          {activeTab === 'daily' ? (
            <div className="flex items-end gap-4 flex-wrap">
              <div className="form-group">
                <label className="label">Select Date</label>
                <input
                  id="report-date"
                  type="date"
                  value={selectedDate}
                  max={today.toISOString().slice(0, 10)}
                  onChange={(e) => setDate(e.target.value)}
                  className="input"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-end gap-4 flex-wrap">
              <div className="form-group">
                <label className="label">Year</label>
                <select
                  id="report-year"
                  value={selectedYear}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="input"
                >
                  {[today.getFullYear(), today.getFullYear() - 1, today.getFullYear() - 2].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Month</label>
                <select
                  id="report-month"
                  value={selectedMonth}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="input"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {new Date(2024, m - 1).toLocaleString('en', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {loading ? (
        <LoadingSpinner />
      ) : report ? (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {summaryCards.map(({ label, value, color, border, bg, icon: Icon, iconColor }) => (
            <div
              key={label}
              className="card p-5"
              style={{ background: bg, borderColor: border }}
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
                <div
                  className="p-2 rounded-lg"
                  style={{ background: `${iconColor}22` }}
                >
                  <Icon className="w-4 h-4" style={{ color: iconColor }} />
                </div>
              </div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                <span className="text-xs text-emerald-400">Live data</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center text-gray-500">
          <BarChart3 className="w-10 h-10 mx-auto mb-2 text-gray-700" />
          <p>No report data for this period.</p>
          <p className="text-xs mt-1 text-gray-600">Try a different date or check if sales exist.</p>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Top Products Bar Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-white">Top Products by Revenue ({currency.code})</h3>
            <TrendingUp className="w-5 h-5 text-primary-400" />
          </div>
          <div className="p-4">
            {topProducts.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No sales data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topProducts} margin={{ left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis
                    dataKey="productName"
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    axisLine={false} tickLine={false}
                    tickFormatter={(v) => v?.length > 12 ? v.slice(0, 12) + '…' : v}
                  />
                  <YAxis
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    axisLine={false} tickLine={false}
                    tickFormatter={(v) => formatAmount(v)}
                    width={80}
                  />
                  <Tooltip content={<CurrencyTooltip formatAmount={formatAmount} />} />
                  <Bar dataKey="totalRevenue" name="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                    {topProducts.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Inventory by Category Pie */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-white">Inventory by Category</h3>
            <Package className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="p-4">
            {inventoryRep.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No inventory data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={inventoryRep}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    dataKey="totalQuantity"
                    nameKey="category"
                    labelLine={false}
                    label={({ name, percent }) =>
                      percent > 0.06 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
                    }
                  >
                    {inventoryRep.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1e2130', border: '1px solid #374151', borderRadius: 8 }}
                    formatter={(v, name) => [v + ' units', name]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 12, color: '#9ca3af' }}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Inventory Value Table */}
      {inventoryRep.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-white">Inventory Summary by Category</h3>
            <span className="text-xs text-gray-500">Values in {currency.code}</span>
          </div>
          <div className="table-container" style={{ borderRadius: 0, border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Total Items</th>
                  <th>Total Qty</th>
                  <th>Total Value ({currency.code})</th>
                </tr>
              </thead>
              <tbody>
                {inventoryRep.map((row, i) => (
                  <tr key={i}>
                    <td>
                      <span className="badge-blue">{row.category || '—'}</span>
                    </td>
                    <td className="text-gray-300">{row.totalProducts ?? '—'}</td>
                    <td className="text-gray-300">{row.totalQuantity ?? '—'}</td>
                    <td className="font-semibold text-emerald-400">
                      {row.totalValue != null ? formatAmount(row.totalValue) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
