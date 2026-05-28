"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiLogin } from '@/lib/adminApi';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiLogin(username, password);
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_user', data.username);
      router.push('/admin');
    } catch {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#FAFAF8] flex items-center justify-center z-[100]">
      <div className="bg-white border border-[#8C7A6B]/20 p-12 w-full max-w-md shadow-lg">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-serif tracking-[0.3em] text-[#1A1A1A] uppercase mb-3">Al Furqan</h1>
          <p className="text-gray-500 text-xs tracking-[0.3em] uppercase">Boutique Admin Portal</p>
          <div className="w-16 h-px bg-[#8C7A6B]/40 mx-auto mt-6" />
        </div>

        <form className="space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="p-4 border border-red-300 bg-red-50 text-red-600 text-xs tracking-widest">
              {error}
            </div>
          )}
          <div>
            <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-[#8C7A6B] mb-3">Username</label>
            <input
              type="text"
              className="w-full p-4 bg-[#FAFAF8] text-[#1A1A1A] border border-[#8C7A6B]/30 focus:border-[#8C7A6B] focus:outline-none transition-colors font-medium placeholder-gray-400"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-[#8C7A6B] mb-3">Password</label>
            <input
              type="password"
              className="w-full p-4 bg-[#FAFAF8] text-[#1A1A1A] border border-[#8C7A6B]/30 focus:border-[#8C7A6B] focus:outline-none transition-colors font-medium placeholder-gray-400"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1A1A1A] text-[#FAFAF8] font-bold py-4 tracking-[0.2em] uppercase text-xs hover:bg-[#8C7A6B] transition-colors mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Authenticating...' : 'Enter Boutique'}
          </button>
        </form>
        <p className="text-center text-[10px] text-gray-400 mt-8 tracking-widest uppercase">Default: admin / admin123</p>
      </div>
    </div>
  );
}
