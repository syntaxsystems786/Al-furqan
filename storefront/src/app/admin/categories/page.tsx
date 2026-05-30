"use client";

import { useState, useEffect } from 'react';
import { Plus, X, Edit, Trash2 } from 'lucide-react';
import { apiGetCategories, apiCreateCategory, apiUpdateCategory, apiDeleteCategory } from '@/lib/adminApi';
// This caches the page and updates it in the background at most once every 15 minutes
export const revalidate = 900;
export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await apiGetCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (category: any) => {
    setEditingId(category.id);
    setName(category.name);
    setError(null);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await apiDeleteCategory(id);
      loadCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to delete category');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        await apiUpdateCategory(editingId, name);
      } else {
        await apiCreateCategory(name);
      }
      setShowModal(false);
      setName('');
      loadCategories();
    } catch (err: any) {
      setError(err.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-[#8C7A6B]">Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif text-[#1A1A1A] tracking-widest uppercase">Categories</h1>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-6 py-3 bg-[#1A1A1A] text-[#FAFAF8] text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#8C7A6B] transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="bg-white border border-[#8C7A6B]/20 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#8C7A6B]/20 text-[#8C7A6B] text-[10px] uppercase tracking-[0.2em]">
              <th className="p-4 font-bold">ID</th>
              <th className="p-4 font-bold">Name</th>
              <th className="p-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b border-[#8C7A6B]/10 hover:bg-[#FAFAF8] transition-colors">
                <td className="p-4 text-sm text-gray-500 font-mono">{c.id}</td>
                <td className="p-4 text-sm font-bold tracking-widest uppercase text-[#1A1A1A]">{c.name}</td>
                <td className="p-4 flex justify-end gap-3">
                  <button onClick={() => handleOpenEdit(c)} className="p-2 text-gray-400 hover:text-[#D4AF37] transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-500 text-sm">No categories found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-[150] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#111] w-full max-w-md p-8 border border-[#D4AF37]/20 shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 text-gray-500 hover:text-[#D4AF37]">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-serif text-[#D4AF37] tracking-widest uppercase mb-6">
              {editingId ? 'Edit Category' : 'New Category'}
            </h2>
            <form onSubmit={handleSave}>
              <label className="block text-[#F8F8F8] text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#0B0B0B] border border-[#D4AF37]/30 p-3 text-[#F8F8F8] focus:border-[#D4AF37] focus:outline-none mb-6"
                autoFocus
                required
              />
              {error && <p className="text-red-500 text-xs mb-4">{error}</p>}
              <button
                type="submit"
                disabled={saving}
                className="w-full py-4 bg-[#D4AF37] text-[#111] font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-white transition-colors"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
