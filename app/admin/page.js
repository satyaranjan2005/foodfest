'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if already logged in
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken');
      if (token) {
        router.push('/admin/dashboard');
      }
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!password) {
      toast.error('Please enter password');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        toast.success('Login successful!');
        router.push('/admin/dashboard');
      } else {
        toast.error(data.message || 'Invalid password');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🔐 Admin Login</h1>
          <p className="text-gray-600">FoodFest 2026 Management</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Admin Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Enter admin password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-primary hover:underline">
            ← Back to Homepage
          </Link>
        </div>

        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-600 text-center">
            Default password: <code className="bg-gray-200 px-2 py-1 rounded">admin123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
