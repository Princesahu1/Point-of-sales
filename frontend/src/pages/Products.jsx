import React, { useEffect, useState, useCallback } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  getProducts, searchProducts, createProduct, updateProduct, deleteProduct,
} from '../api/productApi';
import {
  Plus, Pencil, Trash2, Search, X, Package,
  ChevronLeft, ChevronRight, Tag, DollarSign,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';

const EMPTY_FORM = { name: '', barcode: '', category: '', price: '', taxRate: '' };
const CATEGORIES = ['Beverages', 'Snacks', 'Grocery', 'Personal Care', 'Electronics', 'Clothing', 'Dairy', 'Bakery', 'Household', 'Other'];

export default function Products() {
  const { formatAmount, symbol, currency } = useCurrency();
  const { hasAnyRole } = useAuth();

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [page, setPage]           = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await searchProducts('');
      const data = res.data?.content || res.data || [];
      setAllProducts(data);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = allProducts.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase()) ||
                          p.barcode?.toLowerCase().includes(search.toLowerCase()) ||
                          p.category?.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;

  useEffect(() => {
    if (page >= totalPages && totalPages > 0) {
      setPage(totalPages - 1);
    }
  }, [totalPages, page]);

  const paginatedProducts = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const openCreate = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditItem(p);
    setForm({
      name: p.name || '',
      barcode: p.barcode || '',
      category: p.category || '',
      price: p.price ?? '',
      taxRate: p.taxRate ?? '',
    });
    setShowModal(true);
  };

  const handleFormChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        taxRate: parseFloat(form.taxRate || 0),
      };
      if (editItem) {
        await updateProduct(editItem.id, payload);
        toast.success('Product updated');
      } else {
        await createProduct(payload);
        toast.success('Product created');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    setDeleting(id);
    try {
      await deleteProduct(id);
      toast.success('Product deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">Manage your product catalog</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Currency indicator */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium"
            style={{
              background: 'rgba(37,99,235,0.08)',
              borderColor: 'rgba(37,99,235,0.3)',
              color: '#60a5fa',
            }}
          >
            <DollarSign className="w-4 h-4" />
            Prices in {currency.code} ({symbol})
          </div>
          {hasAnyRole('STORE_MANAGER', 'ADMIN') && (
            <button id="add-product-btn" onClick={openCreate} className="btn-primary">
              <Plus className="w-4 h-4" /> Add Product
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto custom-scrollbar">
          {['All', ...CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20 border border-primary-500'
                  : 'bg-dark-300 text-gray-400 hover:bg-dark-200 hover:text-white border border-gray-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            id="product-search"
            type="text"
            placeholder="Search by name, barcode…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 w-full"
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

      {/* Table */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Barcode</th>
                  <th>Category</th>
                  <th>Price ({currency.code})</th>
                  <th>Tax %</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16">
                      {search ? (
                        <div className="text-center">
                          <Package className="w-10 h-10 text-gray-700 mx-auto mb-2" />
                          <p className="text-gray-500">No products found matching "{search}"</p>
                        </div>
                      ) : (
                        <div className="max-w-md mx-auto text-center animate-fade-in">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4 border border-red-500/20">
                            <Package className="w-8 h-8 text-red-400" />
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2">We couldn’t load your products</h3>
                          <p className="text-gray-400 mb-6">
                            Everything else looks fine, but your sellable items are missing.
                          </p>
                          
                          <div className="bg-dark-300/50 border border-gray-800 rounded-xl p-5 text-left mb-6">
                            <p className="text-sm font-semibold text-gray-300 mb-3">Possible reasons:</p>
                            <ul className="space-y-2.5 text-sm text-gray-400">
                              <li className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                Inventory not synced
                              </li>
                              <li className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                Items disabled
                              </li>
                              <li className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                Missing price data
                              </li>
                              <li className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                Temporary server issue
                              </li>
                            </ul>
                          </div>
                          
                          <div className="flex items-center justify-center gap-2 text-sm bg-primary-500/10 border border-primary-500/20 py-3 px-4 rounded-xl">
                            <span>👉</span>
                            <button onClick={load} className="text-primary-400 hover:text-primary-300 font-medium hover:underline transition-all">
                              Try refreshing
                            </button>
                            <span className="text-gray-500">or check your inventory settings</span>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((p, i) => (
                    <tr key={p.id}>
                      <td className="text-gray-600">{page * 10 + i + 1}</td>
                      <td className="font-medium text-white">{p.name}</td>
                      <td className="font-mono text-xs text-gray-400">{p.barcode}</td>
                      <td>
                        <span className="badge-blue flex items-center gap-1 w-fit">
                          <Tag className="w-3 h-3" />{p.category}
                        </span>
                      </td>
                      <td className="font-semibold text-emerald-400">
                        {formatAmount(p.price)}
                      </td>
                      <td className="text-gray-400">{p.taxRate ?? 0}%</td>
                      <td>
                        <div className="flex items-center gap-2">
                          {hasAnyRole('STORE_MANAGER', 'ADMIN') && (
                            <button
                              id={`edit-product-${p.id}`}
                              onClick={() => openEdit(p)}
                              className="btn-ghost p-1.5 rounded-lg"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4 text-primary-400" />
                            </button>
                          )}
                          {hasAnyRole('ADMIN') && (
                            <button
                              id={`delete-product-${p.id}`}
                              onClick={() => handleDelete(p.id)}
                              disabled={deleting === p.id}
                              className="btn-ghost p-1.5 rounded-lg"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Summary footer */}
          {filtered.length > 0 && (
            <div className="flex items-center justify-between text-sm text-gray-500 px-1">
              <span>
                Showing <span className="text-white font-medium">{paginatedProducts.length}</span> of <span className="text-white font-medium">{filtered.length}</span> product{filtered.length !== 1 ? 's' : ''}
              </span>
              <span>
                Total catalog value:{' '}
                <span className="text-emerald-400 font-semibold">
                  {formatAmount(filtered.reduce((sum, p) => sum + (p.price || 0), 0))}
                </span>
              </span>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="btn-secondary px-3"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-400">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="btn-secondary px-3"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" id="product-modal">
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-semibold text-white">
                {editItem ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setShowModal(false)} className="btn-ghost p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="label">Product Name *</label>
                  <input name="name" value={form.name} onChange={handleFormChange}
                         className="input" placeholder="e.g. Coca-Cola 500ml" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="label">Barcode *</label>
                    <input name="barcode" value={form.barcode} onChange={handleFormChange}
                           className="input" placeholder="BAR-001-XXXX" required />
                  </div>
                  <div className="form-group">
                    <label className="label">Category</label>
                    <select name="category" value={form.category} onChange={handleFormChange}
                            className="input">
                      <option value="">— Select —</option>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="label">Price ({currency.code} — {symbol}) *</label>
                    <div className="relative">
                      <span
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold"
                      >
                        {symbol}
                      </span>
                      <input name="price" type="number" step="0.01" min="0"
                             value={form.price} onChange={handleFormChange}
                             className="input pl-9" placeholder="0.00" required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="label">Tax Rate (%)</label>
                    <input name="taxRate" type="number" step="0.01" min="0"
                           value={form.taxRate} onChange={handleFormChange}
                           className="input" placeholder="0.00" />
                  </div>
                </div>

                {/* Live price preview */}
                {form.price && (
                  <div
                    className="rounded-lg p-3 text-sm"
                    style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
                  >
                    <span className="text-gray-400">Preview: </span>
                    <span className="text-emerald-400 font-semibold">
                      {formatAmount(parseFloat(form.price) || 0)}
                    </span>
                    {form.taxRate && (
                      <span className="text-gray-500">
                        {' '}+{' '}
                        {formatAmount((parseFloat(form.price) || 0) * (parseFloat(form.taxRate) / 100))} tax
                        {' '}= {formatAmount((parseFloat(form.price) || 0) * (1 + parseFloat(form.taxRate) / 100))} total
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button id="save-product-btn" type="submit" disabled={saving} className="btn-primary">
                  {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {saving ? 'Saving…' : editItem ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
