import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, ChevronDown, Globe } from 'lucide-react';
import { useCurrency, CURRENCIES } from '../context/CurrencyContext';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/products':  'Product Management',
  '/pos':       'POS — Billing',
  '/inventory': 'Inventory',
  '/reports':   'Reports',
};

/**
 * Top navigation bar — shows page title, currency selector & notifications.
 */
export default function Navbar() {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] ?? 'POS System';
  const { currency, changeCurrency } = useCurrency();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = CURRENCIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.includes(search)
  );

  return (
    <header
      className="fixed top-0 left-64 right-0 h-16 bg-dark-100/80 backdrop-blur-md
                  border-b border-gray-800 flex items-center justify-between px-6 z-30"
    >
      {/* Page title */}
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="text-xs text-gray-500 hidden sm:block">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">

        {/* ── Currency Selector ── */}
        <div className="relative" ref={dropdownRef}>
          <button
            id="currency-selector-btn"
            onClick={() => { setDropdownOpen((o) => !o); setSearch(''); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                       bg-dark-200 border border-gray-700 text-sm font-medium
                       text-gray-300 hover:text-white hover:border-primary-500
                       transition-all cursor-pointer"
            title="Change Currency"
          >
            <Globe className="w-4 h-4 text-primary-400" />
            <span className="font-mono text-primary-400">{currency.symbol}</span>
            <span>{currency.code}</span>
            <ChevronDown
              className="w-3 h-3 text-gray-500"
              style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
            />
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 top-10 w-72 bg-dark-100 border border-gray-700
                         rounded-xl shadow-2xl z-50 overflow-hidden animate-slide-in"
              style={{ maxHeight: '380px' }}
            >
              {/* Search */}
              <div className="p-2 border-b border-gray-800">
                <input
                  id="currency-search"
                  autoFocus
                  type="text"
                  placeholder="Search currency…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input text-sm py-1.5"
                />
              </div>

              {/* Currency list */}
              <div style={{ overflowY: 'auto', maxHeight: '300px' }}>
                {filtered.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm py-4">No currencies found</p>
                ) : (
                  filtered.map((c) => (
                    <button
                      key={c.code}
                      id={`currency-${c.code}`}
                      onClick={() => {
                        changeCurrency(c.code);
                        setDropdownOpen(false);
                        setSearch('');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5
                                 hover:bg-dark-200 transition-colors text-left cursor-pointer border-none"
                      style={{
                        background: c.code === currency.code ? 'rgba(37,99,235,0.15)' : 'transparent',
                        borderLeft: c.code === currency.code ? '3px solid #3b82f6' : '3px solid transparent',
                      }}
                    >
                      <span
                        className="text-base font-bold w-8 text-center"
                        style={{ color: c.code === currency.code ? '#60a5fa' : '#9ca3af' }}
                      >
                        {c.symbol}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">{c.name}</p>
                        <p className="text-xs text-gray-500">{c.code}</p>
                      </div>
                      {c.code === currency.code && (
                        <span className="text-xs text-primary-400 font-semibold shrink-0">✓ Active</span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <button
          id="nav-notifications"
          className="relative btn-ghost p-2 rounded-lg"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>
    </header>
  );
}
