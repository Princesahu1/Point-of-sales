import React, { useEffect, useState, useCallback } from 'react';
import {
  getInventory, getLowStockItems, adjustStock, getAlerts, resolveAlert,
} from '../api/inventoryApi';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Warehouse, AlertTriangle, ArrowUp, ArrowDown,
  CheckCircle, RefreshCw, X,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Inventory() {
  const [inventory, setInventory]     = useState([]);
  const [alerts, setAlerts]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [adjustModal, setAdjustModal] = useState(null); // { item, type }
  const [adjQty, setAdjQty]           = useState('');
  const [saving, setSaving]           = useState(false);
  const [resolving, setResolving]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [invRes, alertRes] = await Promise.allSettled([
        getInventory(),
        getAlerts(),
      ]);
      if (invRes.status === 'fulfilled') {
        const d = invRes.value.data;
        setInventory(d?.content || d || []);
      }
      if (alertRes.status === 'fulfilled') {
        setAlerts(alertRes.value.data || []);
      }
    } catch {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdjust = (item, type) => {
    setAdjustModal({ item, type });
    setAdjQty('');
  };

  const handleAdjust = async (e) => {
    e.preventDefault();
    const qty = parseInt(adjQty, 10);
    if (!qty || qty <= 0) { toast.error('Enter a valid quantity'); return; }
    setSaving(true);
    try {
      const item = adjustModal.item;
      const newQty = adjustModal.type === 'IN'
        ? item.quantityOnHand + qty
        : item.quantityOnHand - qty;

      if (newQty < 0) {
        toast.error(`Cannot remove more than available stock (${item.quantityOnHand})`);
        setSaving(false);
        return;
      }

      await adjustStock(item.productId, {
        quantityOnHand:   newQty,
        reorderThreshold: item.reorderThreshold,
      });
      toast.success(`Stock ${adjustModal.type === 'IN' ? 'added' : 'removed'} successfully`);
      setAdjustModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Adjustment failed');
    } finally {
      setSaving(false);
    }
  };

  const handleResolveAlert = async (alertId) => {
    setResolving(alertId);
    try {
      await resolveAlert(alertId);
      toast.success('Alert resolved');
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch {
      toast.error('Could not resolve alert');
    } finally {
      setResolving(null);
    }
  };

  if (loading) return <LoadingSpinner text="Loading inventory…" />;

  const lowStockCount = inventory.filter(
    (i) => i.quantityOnHand <= i.reorderThreshold
  ).length;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">{inventory.length} products tracked</p>
        </div>
        <button onClick={load} className="btn-secondary" id="refresh-inventory-btn">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Top alerts banner */}
      {alerts.length > 0 && (
        <div className="card border-amber-600/30 bg-amber-900/10">
          <div className="card-header">
            <h3 className="font-semibold text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {alerts.length} Replenishment Alert{alerts.length > 1 ? 's' : ''}
            </h3>
          </div>
          <div className="card-body space-y-2">
            {alerts.map((a) => (
              <div key={a.id}
                   className="flex items-center justify-between py-2 border-b border-amber-800/30 last:border-0">
                <div>
                  <p className="text-sm font-medium text-white">{a.productName}</p>
                  <p className="text-xs text-amber-400">
                    Current stock: {a.quantityOnHand} (min: {a.reorderThreshold})
                  </p>
                </div>
                <button
                  id={`resolve-alert-${a.id}`}
                  onClick={() => handleResolveAlert(a.id)}
                  disabled={resolving === a.id}
                  className="btn-success text-xs px-3 py-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  {resolving === a.id ? 'Resolving…' : 'Resolve'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Warehouse className="w-5 h-5 text-primary-400" />
            Stock Levels
          </h3>
          {lowStockCount > 0 && (
            <span className="badge-red">{lowStockCount} low stock</span>
          )}
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Barcode</th>
                <th>On Hand</th>
                <th>Min Qty</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    No inventory records found
                  </td>
                </tr>
              ) : (
                inventory.map((item) => {
                  const isLow = item.quantityOnHand <= item.reorderThreshold;
                  return (
                    <tr key={item.id}>
                      <td className="font-medium text-white">{item.productName}</td>
                      <td><span className="badge-blue">{item.category}</span></td>
                      <td className="font-mono text-xs text-gray-500">{item.barcode}</td>
                      <td>
                        <span className={`font-bold text-lg ${
                          isLow ? 'text-red-400' : 'text-emerald-400'
                        }`}>
                          {item.quantityOnHand}
                        </span>
                      </td>
                      <td className="text-gray-400">{item.reorderThreshold}</td>
                      <td>
                        {isLow
                          ? <span className="badge-red">Low Stock</span>
                          : <span className="badge-green">In Stock</span>
                        }
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            id={`stock-in-${item.id}`}
                            onClick={() => openAdjust(item, 'IN')}
                            className="btn text-xs bg-emerald-900/30 text-emerald-400
                                       hover:bg-emerald-900/50 border border-emerald-800"
                          >
                            <ArrowUp className="w-3 h-3" /> In
                          </button>
                          <button
                            id={`stock-out-${item.id}`}
                            onClick={() => openAdjust(item, 'OUT')}
                            className="btn text-xs bg-red-900/30 text-red-400
                                       hover:bg-red-900/50 border border-red-800"
                          >
                            <ArrowDown className="w-3 h-3" /> Out
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {adjustModal && (
        <div className="modal-overlay">
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="font-semibold text-white">
                {adjustModal.type === 'IN' ? 'Stock In' : 'Stock Out'} —{' '}
                {adjustModal.item.productName}
              </h3>
              <button onClick={() => setAdjustModal(null)} className="btn-ghost p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdjust}>
              <div className="modal-body">
                <p className="text-sm text-gray-400">
                  Current stock:{' '}
                  <span className="text-white font-bold">{adjustModal.item.quantityOnHand}</span>
                </p>
                <div className="form-group">
                  <label className="label">
                    Quantity to {adjustModal.type === 'IN' ? 'add' : 'remove'} *
                  </label>
                  <input
                    id="adj-qty-input"
                    type="number"
                    min="1"
                    value={adjQty}
                    onChange={(e) => setAdjQty(e.target.value)}
                    placeholder="Enter quantity"
                    className="input"
                    required
                    autoFocus
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setAdjustModal(null)} className="btn-secondary">
                  Cancel
                </button>
                <button
                  id="confirm-adj-btn"
                  type="submit"
                  disabled={saving}
                  className={adjustModal.type === 'IN' ? 'btn-success' : 'btn-danger'}
                >
                  {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {adjustModal.type === 'IN' ? 'Add Stock' : 'Remove Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
