import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Zap, Eye, EyeOff, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLES = [
  { value: 'CASHIER',          label: 'Cashier' },
  { value: 'STORE_MANAGER',    label: 'Store Manager' },
  { value: 'INVENTORY_CLERK',  label: 'Inventory Clerk' },
  { value: 'BUSINESS_ANALYST', label: 'Business Analyst' },
  { value: 'ADMIN',            label: 'Admin' },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'CASHIER' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.username || form.username.length < 3) e.username = 'Username must be at least 3 characters';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email address';
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (!form.role) e.role = 'Please select a role';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-300 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-slide-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-primary-600 rounded-2xl mb-4 shadow-lg shadow-primary-900/50">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Create Account</h1>
          <p className="text-gray-400">Register to access the POS system</p>
        </div>

        <div className="card border-gray-700">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-5" id="register-form">
              {/* Username */}
              <div className="form-group">
                <label htmlFor="reg-username" className="label">Username</label>
                <input
                  id="reg-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Choose a username"
                  value={form.username}
                  onChange={handleChange}
                  className={`input ${errors.username ? 'border-red-600' : ''}`}
                />
                {errors.username && (
                  <p className="text-xs text-red-400 mt-1">{errors.username}</p>
                )}
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="reg-email" className="label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    id="reg-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="yourname@gmail.com"
                    value={form.email}
                    onChange={handleChange}
                    className={`input pl-10 ${errors.email ? 'border-red-600' : ''}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-400 mt-1">{errors.email}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Used for OTP-based password reset</p>
              </div>

              {/* Password */}
              <div className="form-group">
                <label htmlFor="reg-password" className="label">Password</label>
                <div className="relative">
                  <input
                    id="reg-password"
                    name="password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Create a password (min 6 chars)"
                    value={form.password}
                    onChange={handleChange}
                    className={`input pr-10 ${errors.password ? 'border-red-600' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400 mt-1">{errors.password}</p>
                )}
              </div>

              {/* Role */}
              <div className="form-group">
                <label htmlFor="reg-role" className="label">Role</label>
                <select
                  id="reg-role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className={`input ${errors.role ? 'border-red-600' : ''}`}
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                {errors.role && (
                  <p className="text-xs text-red-400 mt-1">{errors.role}</p>
                )}
              </div>

              <button
                id="register-btn"
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3 text-base mt-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <UserPlus className="w-5 h-5" />
                )}
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
