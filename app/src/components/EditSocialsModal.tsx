'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import type { Socials } from '@/types';

interface EditSocialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  socials: Socials | null;
  onSave: (socials: Socials) => Promise<void>;
}

export default function EditSocialsModal({
  isOpen,
  onClose,
  socials,
  onSave,
}: EditSocialsModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Socials>({
    instagram: '',
    linkedin: '',
    email: '',
    phone: '',
    address: '',
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        instagram: socials?.instagram || '',
        linkedin: socials?.linkedin || '',
        email: socials?.email || '',
        phone: socials?.phone || '',
        address: socials?.address || '',
      });
    }
  }, [isOpen, socials]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Clean up empty strings to undefined
      const cleanedData: Socials = {};
      if (formData.instagram?.trim()) cleanedData.instagram = formData.instagram.trim();
      if (formData.linkedin?.trim()) cleanedData.linkedin = formData.linkedin.trim();
      if (formData.email?.trim()) cleanedData.email = formData.email.trim();
      if (formData.phone?.trim()) cleanedData.phone = formData.phone.trim();
      if (formData.address?.trim()) cleanedData.address = formData.address.trim();

      await onSave(cleanedData);
      onClose();
    } catch (error) {
      console.error('Failed to save socials:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof Socials, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative glass-floating rounded-3xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/30">
          <h2 className="text-xl font-serif font-bold text-ink-rich">Edit Social Links</h2>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-white/50 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          {/* Instagram */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
              <Instagram className="w-4 h-4 text-pink-600" />
              Instagram
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-4 py-3 bg-stone-100 border border-r-0 border-stone-200 rounded-l-xl text-stone-500 text-sm">
                @
              </span>
              <input
                type="text"
                value={formData.instagram || ''}
                onChange={(e) => handleChange('instagram', e.target.value)}
                placeholder="username"
                className="flex-1 px-4 py-3 border border-stone-200 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* LinkedIn */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
              <Linkedin className="w-4 h-4 text-blue-600" />
              LinkedIn
            </label>
            <input
              type="url"
              value={formData.linkedin || ''}
              onChange={(e) => handleChange('linkedin', e.target.value)}
              placeholder="https://linkedin.com/in/username"
              className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
              <Mail className="w-4 h-4 text-amber-600" />
              Email
            </label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
              <Phone className="w-4 h-4 text-emerald-600" />
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="(555) 123-4567"
              className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
              <MapPin className="w-4 h-4 text-red-500" />
              Address
            </label>
            <textarea
              value={formData.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="123 Main St, City, State 12345"
              rows={2}
              className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-white/30 bg-white/30">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-5 py-2.5 text-stone-600 text-sm font-medium rounded-xl border border-stone-200 hover:bg-white disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 bg-grove-primary text-white text-sm font-medium rounded-xl hover:bg-grove-primary/90 disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
