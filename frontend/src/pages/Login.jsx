import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Zap, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-300 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-slide-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-primary-600 rounded-2xl mb-4 shadow-lg shadow-primary-900/50">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Welcome Back</h1>
          <p className="text-gray-400">Sign in to your POS account</p>
        </div>

        {/* Card */}
        <div className="card border-gray-700">
          <div className="card-body space-y-5">
            <form onSubmit={handleSubmit} className="space-y-5" id="login-form">
              {/* Username */}
              <div className="form-group">
                <label htmlFor="username" className="label">Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Enter your username"
                  value={form.username}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>

              {/* Password */}
              <div className="form-group">
                <label htmlFor="password" className="label">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    className="input pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    id="toggle-password"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex justify-end mt-1">
                  <Link to="/forgot-password" className="text-xs text-primary-400 hover:text-primary-300">
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Submit */}
              <button
                id="login-btn"
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3 text-base"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <LogIn className="w-5 h-5" />
                )}
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            {/* Quick fill hints */}
            <div className="pt-2 border-t border-gray-700">
              <p className="text-xs text-gray-500 mb-2 font-medium">Quick demo logins:</p>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: 'Admin',   u: 'admin',   r: 'ADMIN' },
                  { label: 'Manager', u: 'manager', r: 'STORE_MANAGER' },
                  { label: 'Cashier', u: 'cashier', r: 'CASHIER' },
                  { label: 'Clerk',   u: 'clerk',   r: 'INVENTORY_CLERK' },
                ].map(({ label, u }) => (
                  <button
                    key={u}
                    type="button"
                    id={`quick-${u}`}
                    onClick={() => setForm({ username: u, password: 'password123' })}
                    className="text-xs text-left px-3 py-2 rounded-lg bg-dark-200 border border-gray-700
                               text-gray-400 hover:text-white hover:border-gray-600 transition-colors"
                  >
                    {label}: <span className="text-gray-500">{u}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
