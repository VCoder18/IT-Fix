'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simple authentication check (in production, this would be a real API call)
    setTimeout(() => {
      if (formData.email === 'admin@itfix.com' && formData.password === 'admin123') {
        localStorage.setItem('isAdmin', 'true');
        router.push('/admin');
      } else {
        setError('Invalid email or password');
        setLoading(false);
      }
    }, 500);
  };

  return (
    <main className="max-w-md mx-auto py-16 px-6">
      <div className="bg-slate-800 rounded-lg shadow-md p-8 border border-slate-700">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl mb-2">Admin Login</h1>
          <p className="text-gray-300">Sign in to access the admin dashboard</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-gray-200 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="admin@itfix.com"
              className="w-full px-4 py-3 border border-slate-600 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-200 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-slate-600 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 px-6 rounded-lg transition-colors duration-200 mb-4"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="text-center">
            <Link href="/" className="text-green-500 hover:text-green-400 text-sm">
              ← Back to Home
            </Link>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-700">
          <p className="text-sm text-gray-400 text-center">
            Demo credentials:<br />
            <span className="text-gray-300">admin@itfix.com / admin123</span>
          </p>
        </div>
      </div>
    </main>
  );
}
