"use client";

import { useState, useEffect, useRef } from 'react';
import { Check, AlertCircle, Save, Upload, Plus, Trash2 } from 'lucide-react';
import { getBaseUrl } from '@/lib/api';

export default function AdminSettings() {
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  
  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // CMS State
  const [heroImage, setHeroImage] = useState<string>('');
  const [featuredProducts, setFeaturedProducts] = useState<string>('');
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [savingCMS, setSavingCMS] = useState(false);
  const [loadingCMS, setLoadingCMS] = useState(true);

  const heroInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data) {
          setHeroImage(data.heroImageUrl || '');
          setFeaturedProducts((data.featuredProducts || []).join(', '));
          setJournalEntries(data.journalEntries || []);
        }
      } catch {
        showToast('Failed to load settings', 'error');
      } finally {
        setLoadingCMS(false);
      }
    }
    loadSettings();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return showToast('New passwords do not match', 'error');
    }
    if (newPassword.length < 6) {
      return showToast('Password must be at least 6 characters', 'error');
    }

    setChangingPassword(true);
    try {
      const res = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');
      
      showToast('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSaveCMS = async () => {
    setSavingCMS(true);
    try {
      const parsedProducts = featuredProducts
        .split(',')
        .map(id => parseInt(id.trim()))
        .filter(id => !isNaN(id));

      const payload = {
        heroImageUrl: heroImage,
        featuredProducts: parsedProducts,
        journalEntries
      };

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Failed to save settings');
      showToast('Homepage settings saved successfully');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSavingCMS(false);
    }
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Use the existing products endpoint logic for images by sending FormData
    // Since we don't have a standalone upload endpoint, we will implement one now or use a trick.
    // Let's create an upload endpoint later if needed, or just ask the user to upload it via product and copy URL.
    // For now, let's just let them paste a URL since creating a dedicated standalone upload route wasn't in the plan,
    // actually, wait! The user wants to change the bottle image. We can read the file as Data URL or use a new upload route.
    
    // Fallback: Read as data URL for quick preview if no upload API exists yet.
    // Ideally we should upload to R2.
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      showToast('Uploading image...', 'success');
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setHeroImage(data.url);
        showToast('Image uploaded successfully');
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const addJournalEntry = () => {
    setJournalEntries([...journalEntries, { title: '', date: '', image: '' }]);
  };

  const updateJournalEntry = (index: number, field: string, value: string) => {
    const newEntries = [...journalEntries];
    newEntries[index][field] = value;
    setJournalEntries(newEntries);
  };

  const removeJournalEntry = (index: number) => {
    setJournalEntries(journalEntries.filter((_, i) => i !== index));
  };

  const inputClass = "w-full p-4 bg-[#0B0B0B] border border-[#D4AF37]/30 text-[#F8F8F8] placeholder-gray-600 focus:border-[#D4AF37] focus:outline-none transition-colors font-light text-sm";
  const labelClass = "block text-[10px] font-medium tracking-[0.2em] uppercase text-[#D4AF37] mb-2";

  return (
    <div className="max-w-4xl">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] px-6 py-4 shadow-2xl flex items-center space-x-3 border ${toast.type === 'success' ? 'bg-[#111] border-[#D4AF37]/40 text-[#D4AF37]' : 'bg-[#111] border-red-500/40 text-red-400'}`}>
          {toast.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium text-sm tracking-wide">{toast.msg}</span>
        </div>
      )}

      <div className="mb-10">
        <h1 className="text-4xl font-serif text-[#D4AF37] tracking-[0.2em] uppercase">Settings</h1>
        <p className="text-gray-500 mt-2 text-sm tracking-widest">Manage your boutique's homepage and security</p>
      </div>

      {/* Security Settings */}
      <div className="bg-[#111] border border-[#D4AF37]/20 p-8 mb-10">
        <h2 className="text-xl font-serif text-[#D4AF37] tracking-widest uppercase mb-6">Security</h2>
        <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
          <div>
            <label className={labelClass}>Current Password</label>
            <input type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>New Password</label>
            <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Confirm New Password</label>
            <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputClass} />
          </div>
          <button type="submit" disabled={changingPassword} className="w-full py-4 bg-[#D4AF37] text-[#0B0B0B] text-xs font-bold tracking-[0.2em] uppercase hover:bg-white transition-colors disabled:opacity-50">
            {changingPassword ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Homepage CMS */}
      <div className="bg-[#111] border border-[#D4AF37]/20 p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-serif text-[#D4AF37] tracking-widest uppercase">Homepage Content</h2>
          <button onClick={handleSaveCMS} disabled={savingCMS || loadingCMS} className="flex items-center space-x-2 bg-[#D4AF37] text-[#0B0B0B] px-6 py-3 text-xs font-bold tracking-[0.2em] uppercase hover:bg-white transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" />
            <span>{savingCMS ? 'Saving...' : 'Save Content'}</span>
          </button>
        </div>

        {loadingCMS ? (
          <div className="text-[#D4AF37]/60 font-light tracking-[0.3em] uppercase text-sm">Loading settings...</div>
        ) : (
          <div className="space-y-12">
            
            {/* Hero Image */}
            <div>
              <h3 className="text-sm font-serif text-[#F8F8F8] tracking-widest uppercase mb-4">Hero Section Bottle</h3>
              <div className="flex items-start gap-8">
                <div 
                  className="w-48 aspect-[3/4] bg-[#0B0B0B] border border-dashed border-[#D4AF37]/30 flex flex-col items-center justify-center cursor-pointer hover:border-[#D4AF37] transition-colors relative overflow-hidden"
                  onClick={() => heroInputRef.current?.click()}
                >
                  {heroImage ? (
                    <img src={heroImage} alt="Hero Bottle" className="w-full h-full object-contain p-4" />
                  ) : (
                    <Upload className="w-8 h-8 text-[#D4AF37]/30" />
                  )}
                  <div className="absolute bottom-0 w-full bg-black/80 text-center text-[10px] text-[#D4AF37] py-2 tracking-widest uppercase">
                    Upload Bottle
                  </div>
                </div>
                <input type="file" ref={heroInputRef} className="hidden" accept="image/*" onChange={handleHeroImageUpload} />
                <div className="flex-1">
                  <label className={labelClass}>Image URL (Auto-fills on upload)</label>
                  <input type="text" value={heroImage} onChange={e => setHeroImage(e.target.value)} className={inputClass} placeholder="/perfumes/p1.png" />
                  <p className="text-gray-500 text-xs mt-3 leading-relaxed tracking-wide">
                    Upload a transparent PNG of a perfume bottle. This will replace the levitating bottle in the hero section.
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-[#D4AF37]/10" />

            {/* Featured Products */}
            <div>
              <h3 className="text-sm font-serif text-[#F8F8F8] tracking-widest uppercase mb-4">Signature Archives (Featured Products)</h3>
              <label className={labelClass}>Product IDs (Comma separated)</label>
              <input type="text" value={featuredProducts} onChange={e => setFeaturedProducts(e.target.value)} className={inputClass} placeholder="1, 4, 12, 15" />
              <p className="text-gray-500 text-xs mt-3 leading-relaxed tracking-wide">
                Enter the IDs of the products you want to display on the homepage carousel. You can find product IDs in the Products tab URL when editing.
              </p>
            </div>

            <hr className="border-[#D4AF37]/10" />

            {/* Journal Entries */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-serif text-[#F8F8F8] tracking-widest uppercase">Journal Entries</h3>
                <button onClick={addJournalEntry} className="flex items-center text-[#D4AF37] text-xs font-medium tracking-[0.2em] uppercase hover:text-white transition-colors">
                  <Plus className="w-3 h-3 mr-2" /> Add Entry
                </button>
              </div>
              
              <div className="space-y-6">
                {journalEntries.map((entry, idx) => (
                  <div key={idx} className="bg-[#0B0B0B] p-6 border border-[#D4AF37]/10 relative">
                    <button onClick={() => removeJournalEntry(idx)} className="absolute top-4 right-4 text-red-500/50 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Title</label>
                        <input type="text" value={entry.title} onChange={e => updateJournalEntry(idx, 'title', e.target.value)} className={inputClass} placeholder="e.g. The Anatomy of Oud" />
                      </div>
                      <div>
                        <label className={labelClass}>Date / Subtitle</label>
                        <input type="text" value={entry.date} onChange={e => updateJournalEntry(idx, 'date', e.target.value)} className={inputClass} placeholder="e.g. Oct 12, 2026" />
                      </div>
                      <div className="md:col-span-2">
                        <label className={labelClass}>Image URL</label>
                        <input type="text" value={entry.image} onChange={e => updateJournalEntry(idx, 'image', e.target.value)} className={inputClass} placeholder="/perfumes/p3.jpeg" />
                      </div>
                    </div>
                  </div>
                ))}
                {journalEntries.length === 0 && (
                  <p className="text-gray-500 text-xs tracking-widest">No journal entries added yet.</p>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
