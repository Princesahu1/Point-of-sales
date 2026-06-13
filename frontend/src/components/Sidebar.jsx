import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPendingUsers } from '../api/authApi';
import {
  LayoutDashboard, Package, ShoppingCart, Warehouse,
  BarChart3, LogOut, ChevronRight, Zap, Receipt, UserCheck,
} from 'lucide-react';

const ROLES = {
  ADMIN:            'ADMIN',
  STORE_MANAGER:    'STORE_MANAGER',
  CASHIER:          'CASHIER',
  INVENTORY_CLERK:  'INVENTORY_CLERK',
  BUSINESS_ANALYST: 'BUSINESS_ANALYST',
};

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    roles: Object.values(ROLES),
  },
  {
    label: 'Products',
    path: '/products',
    icon: Package,
    roles: Object.values(ROLES),
  },
  {
    label: 'POS / Billing',
    path: '/pos',
    icon: ShoppingCart,
    roles: [ROLES.ADMIN, ROLES.STORE_MANAGER, ROLES.CASHIER],
  },
  {
    label: 'Bills History',
    path: '/bills',
    icon: Receipt,
    roles: [ROLES.ADMIN, ROLES.STORE_MANAGER, ROLES.CASHIER],
  },
  {
    label: 'Inventory',
    path: '/inventory',
    icon: Warehouse,
    roles: [ROLES.ADMIN, ROLES.STORE_MANAGER, ROLES.INVENTORY_CLERK],
  },
  {
    label: 'Reports',
    path: '/reports',
    icon: BarChart3,
    roles: [ROLES.ADMIN, ROLES.STORE_MANAGER, ROLES.BUSINESS_ANALYST],
  },
  {
    label: 'Pending Approvals',
    path: '/admin/pending-users',
    icon: UserCheck,
    roles: [ROLES.ADMIN],
  },
];

const roleBadgeColor = {
  ADMIN:            'badge-red',
  STORE_MANAGER:    'badge-blue',
  CASHIER:          'badge-green',
  INVENTORY_CLERK:  'badge-yellow',
  BUSINESS_ANALYST: 'badge-gray',
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);

  // Poll pending count every 30s (admin only)
  useEffect(() => {
    if (user?.role !== 'ADMIN') return;
    const fetchCount = async () => {
      try { const res = await getPendingUsers(); setPendingCount(res.data?.length ?? 0); } catch {}
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30_000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => { logout(); navigate('/login'); };
  const visibleItems = NAV_ITEMS.filter(item => !item.roles || item.roles.includes(user?.role));

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-dark-100 border-r border-gray-800 flex flex-col z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
        <div className="p-2 bg-primary-600 rounded-xl">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white">POS System</h1>
          <p className="text-xs text-gray-500">Inventory Manager</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 mb-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
          Navigation
        </p>
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isPending = item.path === '/admin/pending-users';
          return (
            <NavLink key={item.path} to={item.path}
              className={({ isActive }) => `sidebar-link group ${isActive ? 'active' : ''}`}>
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isPending && pendingCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          );
        })}
      </nav>

      {/* User info & logout */}
      <div className="px-3 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-dark-200 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {user?.username?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">{user?.username}</p>
            <span className={`${roleBadgeColor[user?.role] || 'badge-gray'} mt-0.5`}>
              {user?.role?.replace('_', ' ')}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-900/20"
          id="logout-btn"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
