"use client";

import { useEffect, useState, useRef } from 'react';
import { Plus, Edit, Trash2, X, Check, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { apiGetProducts, apiCreateProduct, apiUpdateProduct, apiDeleteProduct, apiGetCategories } from '@/lib/api';

interface Variation { size: string; color: string; stock: number; }
interface Product {
  id: number; name: string; description: string;
  topNotes?: string; middleNotes?: string; baseNotes?: string;
  price: number; categoryId: number | null;
  category?: { name: string };
  variations: (Variation & { id?: number })[];
  images?: { url: string }[];
}

const VOLUMES = ['30ml', '50ml', '75ml', '100ml', '150ml', 'Extrait (15ml)', 'Extrait (30ml)', 'Travel Size (10ml)'];
const EDITIONS = ['Standard', 'Premium', 'Extrait de Parfum', 'Eau de Parfum', 'Limited Edition'];

const emptyForm = {
  name: '', description: '', topNotes: '', middleNotes: '', baseNotes: '',
  price: '', categoryId: '',
  variations: [{ size: '50ml', color: 'Standard', stock: 50 }] as Variation[]
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([null, null]);
  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([null, null]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const primaryInputRef = useRef<HTMLInputElement>(null);
  const secondaryInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([apiGetProducts(), apiGetCategories()]);
      setProducts(prods);
      setCategories(cats);
    } catch { showToast('Failed to load data', 'error'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, variations: [{ size: '50ml', color: 'Standard', stock: 50 }] });
    setImageFiles([null, null]);
    setImagePreviews([null, null]);
    setShowModal(true);
  };

  const openEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description || '',
      topNotes: product.topNotes || '',
      middleNotes: product.middleNotes || '',
      baseNotes: product.baseNotes || '',
      price: product.price.toString(),
      categoryId: product.categoryId?.toString() || '',
      variations: product.variations.map(v => ({ size: v.size, color: v.color, stock: v.stock })),
    });
    setImageFiles([null, null]);
    setImagePreviews([
      product.images?.[0] ? `http://localhost:4000${product.images[0].url}` : null,
      product.images?.[1] ? `http://localhost:4000${product.images[1].url}` : null
    ]);
    setShowModal(true);
  };

  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newFiles = [...imageFiles];
      newFiles[index] = file;
      setImageFiles(newFiles);
      
      const newPreviews = [...imagePreviews];
      newPreviews[index] = URL.createObjectURL(file);
      setImagePreviews(newPreviews);
    }
  };

  const addVariation = () => {
    setForm(f => ({ ...f, variations: [...f.variations, { size: '50ml', color: 'Standard', stock: 50 }] }));
  };

  const removeVariation = (idx: number) => {
    setForm(f => ({ ...f, variations: f.variations.filter((_, i) => i !== idx) }));
  };

  const updateVariation = (idx: number, field: keyof Variation, value: string | number) => {
    setForm(f => {
      const vars = [...f.variations];
      vars[idx] = { ...vars[idx], [field]: field === 'stock' ? Number(value) : value };
      return { ...f, variations: vars };
    });
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return showToast('Name and price are required', 'error');
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('topNotes', form.topNotes);
      formData.append('middleNotes', form.middleNotes);
      formData.append('baseNotes', form.baseNotes);
      formData.append('price', form.price);
      if (form.categoryId) formData.append('categoryId', form.categoryId);
      formData.append('variations', JSON.stringify(form.variations));
      
      // Send primary first, then secondary
      if (imageFiles[0]) formData.append('images', imageFiles[0]);
      if (imageFiles[1]) formData.append('images', imageFiles[1]);

      if (editingId) {
        await apiUpdateProduct(editingId, formData);
        showToast('Fragrance updated successfully');
      } else {
        await apiCreateProduct(formData);
        showToast('Fragrance created successfully');
      }
      setShowModal(false);
      load();
    } catch { showToast('Failed to save fragrance', 'error'); }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    try {
      await apiDeleteProduct(id);
      showToast('Fragrance deleted');
      setDeleteConfirm(null);
      load();
    } catch { showToast('Failed to delete', 'error'); }
  };

  const inputClass = "w-full p-4 bg-[#0B0B0B] border border-[#D4AF37]/30 text-[#F8F8F8] placeholder-gray-600 focus:border-[#D4AF37] focus:outline-none transition-colors font-light";
  const labelClass = "block text-[10px] font-medium tracking-[0.2em] uppercase text-[#D4AF37] mb-2";

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] px-6 py-4 shadow-2xl flex items-center space-x-3 border ${toast.type === 'success' ? 'bg-[#111] border-[#D4AF37]/40 text-[#D4AF37]' : 'bg-[#111] border-red-500/40 text-red-400'}`}>
          {toast.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium text-sm tracking-wide">{toast.msg}</span>
        </div>
      )}

      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-serif text-[#D4AF37] tracking-[0.2em] uppercase">Fragrances</h1>
          <p className="text-gray-500 mt-2 text-sm tracking-widest">{products.length} fragrances in your boutique</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center space-x-2 border border-[#D4AF37] text-[#D4AF37] px-6 py-3 text-xs font-medium tracking-[0.2em] uppercase hover:bg-[#D4AF37] hover:text-[#0B0B0B] transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Fragrance</span>
        </button>
      </div>

      <div className="bg-[#111] border border-[#D4AF37]/20 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-[#D4AF37]/60 font-light tracking-[0.3em] uppercase text-sm">Loading fragrances...</div>
        ) : (
          <table className="w-full text-left">
            <thead className="border-b border-[#D4AF37]/20">
              <tr className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]/60">
                <th className="p-5 font-medium">Fragrance</th>
                <th className="p-5 font-medium">Collection</th>
                <th className="p-5 font-medium">Price</th>
                <th className="p-5 font-medium">Volumes</th>
                <th className="p-5 font-medium">Stock</th>
                <th className="p-5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/10 text-sm">
              {products.map((product) => {
                const totalStock = product.variations?.reduce((s, v) => s + (v.stock || 0), 0) || 0;
                return (
                  <tr key={product.id} className="hover:bg-[#0B0B0B] transition-colors group">
                    <td className="p-5">
                      <div className="flex items-center space-x-4">
                        {product.images?.[0] ? (
                          <img src={`http://localhost:4000${product.images[0].url}`} alt="" width={48} height={60} className="object-cover bg-[#0B0B0B] border border-[#D4AF37]/20 aspect-[4/5]" style={{width:48,height:60}} />
                        ) : (
                          <div className="w-12 h-[60px] bg-[#0B0B0B] border border-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]/30">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <span className="font-serif text-[#F8F8F8] tracking-widest uppercase text-base">{product.name}</span>
                          {product.topNotes && <p className="text-xs text-gray-600 mt-1 tracking-wide truncate max-w-[200px]">Top: {product.topNotes}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-gray-400 text-xs tracking-widest uppercase">{product.category?.name || '—'}</td>
                    <td className="p-5 text-[#D4AF37] font-light tracking-widest">Rs. {product.price.toLocaleString()}</td>
                    <td className="p-5 text-gray-400 text-xs tracking-widest">{product.variations?.length || 0} volumes</td>
                    <td className="p-5">
                      <span className={`px-3 py-1.5 text-[10px] font-medium tracking-[0.2em] uppercase border ${totalStock > 10 ? 'border-green-500/30 text-green-500 bg-green-500/5' : totalStock > 0 ? 'border-yellow-500/30 text-yellow-500 bg-yellow-500/5' : 'border-red-500/30 text-red-500 bg-red-500/5'}`}>
                        {totalStock} in stock
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex justify-end space-x-3">
                        <button onClick={() => openEdit(product)} className="p-2.5 text-[#D4AF37]/50 hover:text-[#D4AF37] border border-transparent hover:border-[#D4AF37]/30 transition-all">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirm(product.id)} className="p-2.5 text-red-500/50 hover:text-red-500 border border-transparent hover:border-red-500/30 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr><td colSpan={6} className="p-16 text-center text-gray-600 tracking-[0.3em] uppercase text-sm">No fragrances yet. Add your first fragrance!</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 z-[150] flex items-center justify-center backdrop-blur-sm">
          <div className="bg-[#111] p-10 max-w-sm w-full mx-4 shadow-2xl border border-[#D4AF37]/20">
            <h3 className="text-2xl font-serif text-[#D4AF37] tracking-widest uppercase mb-4">Remove Fragrance</h3>
            <p className="text-gray-400 mb-8 font-light leading-relaxed">Are you sure you want to permanently remove this fragrance? This action cannot be undone.</p>
            <div className="flex space-x-4">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-4 border border-[#D4AF37]/30 text-[#F8F8F8] text-xs font-medium tracking-[0.2em] uppercase hover:border-[#D4AF37] transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-4 bg-red-500/10 border border-red-500/40 text-red-500 text-xs font-medium tracking-[0.2em] uppercase hover:bg-red-500/20 transition-colors">Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-[150] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#111] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#D4AF37]/20">
            <div className="flex items-center justify-between p-8 border-b border-[#D4AF37]/20">
              <h2 className="text-2xl font-serif text-[#D4AF37] tracking-widest uppercase">{editingId ? 'Edit Fragrance' : 'New Fragrance'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-500 hover:text-[#D4AF37] transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Image Upload */}
              <div>
                <label className={labelClass}>Fragrance Images (Click each box to upload)</label>
                <div className="flex items-center gap-6 p-2">
                  <div className="flex gap-4">
                    {/* Primary Image Upload */}
                    <div 
                      className="w-32 aspect-[4/5] flex-shrink-0 bg-[#0B0B0B] border border-dashed border-[#D4AF37]/30 hover:border-[#D4AF37]/60 flex flex-col items-center justify-center overflow-hidden relative cursor-pointer transition-colors"
                      onClick={() => primaryInputRef.current?.click()}
                    >
                      {imagePreviews[0] ? (
                        <img src={imagePreviews[0]} alt="Primary" className="object-cover w-full h-full" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-[#D4AF37]/20" />
                      )}
                      <span className="absolute bottom-0 w-full bg-black/80 text-center text-[10px] text-[#D4AF37] uppercase tracking-widest py-1.5 font-bold">
                        Primary (Bottle)
                      </span>
                    </div>
                    <input type="file" ref={primaryInputRef} className="hidden" accept="image/*" onChange={e => handleImageChange(0, e)} />

                    {/* Secondary Image Upload */}
                    <div 
                      className="w-32 aspect-[4/5] flex-shrink-0 bg-[#0B0B0B] border border-dashed border-[#D4AF37]/30 hover:border-[#D4AF37]/60 flex flex-col items-center justify-center overflow-hidden relative cursor-pointer transition-colors"
                      onClick={() => secondaryInputRef.current?.click()}
                    >
                      {imagePreviews[1] ? (
                        <img src={imagePreviews[1]} alt="Hover" className="object-cover w-full h-full" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-[#D4AF37]/20" />
                      )}
                      <span className="absolute bottom-0 w-full bg-black/80 text-center text-[10px] text-[#D4AF37] uppercase tracking-widest py-1.5 font-bold">
                        Secondary (Box)
                      </span>
                    </div>
                    <input type="file" ref={secondaryInputRef} className="hidden" accept="image/*" onChange={e => handleImageChange(1, e)} />
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className={labelClass}>Fragrance Name *</label>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputClass} placeholder="e.g. Oud Royale" />
                </div>
                <div>
                  <label className={labelClass}>Price (Rs.) *</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className={inputClass} placeholder="18500" />
                </div>
                <div>
                  <label className={labelClass}>Collection</label>
                  <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className={inputClass}>
                    <option value="">— Select Collection —</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className={inputClass + " resize-none"} placeholder="Describe this fragrance's character and mood..." />
                </div>
              </div>

              {/* Scent Structure */}
              <div className="bg-[#0B0B0B] p-6 border border-[#D4AF37]/20">
                <h3 className="text-sm font-serif text-[#D4AF37] tracking-[0.2em] uppercase mb-6">Scent Structure</h3>
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Top Notes</label>
                    <input type="text" value={form.topNotes} onChange={e => setForm(f => ({ ...f, topNotes: e.target.value }))} className={inputClass} placeholder="e.g. Bergamot, Pink Pepper, Saffron" />
                  </div>
                  <div>
                    <label className={labelClass}>Heart Notes (Middle)</label>
                    <input type="text" value={form.middleNotes} onChange={e => setForm(f => ({ ...f, middleNotes: e.target.value }))} className={inputClass} placeholder="e.g. Rose, Jasmine, Oud" />
                  </div>
                  <div>
                    <label className={labelClass}>Base Notes</label>
                    <input type="text" value={form.baseNotes} onChange={e => setForm(f => ({ ...f, baseNotes: e.target.value }))} className={inputClass} placeholder="e.g. Amber, Musk, Sandalwood" />
                  </div>
                </div>
              </div>

              {/* Volumes & Inventory */}
              <div className="bg-[#0B0B0B] p-6 border border-[#D4AF37]/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-serif text-[#D4AF37] tracking-[0.2em] uppercase">Volumes & Inventory</h3>
                  <button onClick={addVariation} className="flex items-center text-[#D4AF37] text-xs font-medium tracking-[0.2em] uppercase border border-[#D4AF37]/30 px-4 py-2 hover:bg-[#D4AF37]/10 transition-colors">
                    <Plus className="w-3 h-3 mr-2" /> Add Volume
                  </button>
                </div>
                <div className="space-y-4">
                  {form.variations.map((v, idx) => (
                    <div key={idx} className="flex items-end gap-4 p-4 bg-[#111] border border-[#D4AF37]/10">
                      <div className="flex-1">
                        <label className={labelClass}>Volume</label>
                        <select value={v.size} onChange={e => updateVariation(idx, 'size', e.target.value)} className={inputClass}>
                          {VOLUMES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className={labelClass}>Edition / Type</label>
                        <select value={v.color} onChange={e => updateVariation(idx, 'color', e.target.value)} className={inputClass}>
                          {EDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="w-32">
                        <label className={labelClass}>Stock</label>
                        <input type="number" value={v.stock} onChange={e => updateVariation(idx, 'stock', e.target.value)} className={inputClass} min="0" />
                      </div>
                      {form.variations.length > 1 && (
                        <button onClick={() => removeVariation(idx)} className="mb-0.5 p-3 text-red-500/50 hover:text-red-500 border border-transparent hover:border-red-500/30 transition-all">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-[#D4AF37]/20 flex gap-4">
              <button onClick={() => setShowModal(false)} className="flex-1 py-4 border border-[#D4AF37]/30 text-[#F8F8F8] text-xs font-medium tracking-[0.2em] uppercase hover:border-[#D4AF37] transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-4 bg-[#D4AF37] text-[#0B0B0B] text-xs font-bold tracking-[0.2em] uppercase hover:bg-white transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : editingId ? 'Update Fragrance' : 'Create Fragrance'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
