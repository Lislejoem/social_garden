'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Loader2 } from 'lucide-react';
import type { Cadence } from '@/types';

export default function NewContactPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    cadence: 'REGULARLY' as Cadence,
    email: '',
    phone: '',
    instagram: '',
    linkedin: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const socials: Record<string, string> = {};
      if (formData.email) socials.email = formData.email;
      if (formData.phone) socials.phone = formData.phone;
      if (formData.instagram) socials.instagram = formData.instagram;
      if (formData.linkedin) socials.linkedin = formData.linkedin;

      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          location: formData.location || null,
          cadence: formData.cadence,
          socials: Object.keys(socials).length > 0 ? socials : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create contact');
      }

      const contact = await response.json();
      router.push(`/contact/${contact.id}`);
    } catch (err) {
      setError('Failed to create contact. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-[#FDFCFB]/80 backdrop-blur-md border-b border-stone-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center gap-2 text-stone-500 hover:text-emerald-800 font-bold transition-all group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Garden</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 mt-12">
        <h1 className="text-4xl font-serif font-bold text-stone-800 mb-2">
          Plant a New Contact
        </h1>
        <p className="text-stone-500 mb-12">
          Add someone to your garden. You can always add more details later.
        </p>

        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-2xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-bold text-stone-600 uppercase tracking-widest mb-3"
            >
              Name *
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-6 py-4 bg-white border border-stone-200 rounded-2xl text-lg focus:outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
              placeholder="Their name"
            />
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-bold text-stone-600 uppercase tracking-widest mb-3"
            >
              Location
            </label>
            <input
              id="location"
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="w-full px-6 py-4 bg-white border border-stone-200 rounded-2xl text-lg focus:outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
              placeholder="City, State"
            />
          </div>

          {/* Cadence */}
          <div>
            <label className="block text-sm font-bold text-stone-600 uppercase tracking-widest mb-3">
              How often do you want to connect?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(['OFTEN', 'REGULARLY', 'SELDOMLY', 'RARELY'] as Cadence[]).map(
                (cadence) => (
                  <button
                    key={cadence}
                    type="button"
                    onClick={() => setFormData({ ...formData, cadence })}
                    className={`px-4 py-3 rounded-2xl font-medium transition-all ${
                      formData.cadence === cadence
                        ? 'bg-emerald-900 text-white'
                        : 'bg-white border border-stone-200 text-stone-600 hover:border-emerald-300'
                    }`}
                  >
                    {cadence.charAt(0) + cadence.slice(1).toLowerCase()}
                  </button>
                )
              )}
            </div>
            <p className="text-stone-400 text-sm mt-2">
              {formData.cadence === 'OFTEN' && 'Every 7-10 days'}
              {formData.cadence === 'REGULARLY' && 'Every 3-4 weeks'}
              {formData.cadence === 'SELDOMLY' && 'Every 3 months'}
              {formData.cadence === 'RARELY' && 'Every 6-12 months'}
            </p>
          </div>

          {/* Contact Info */}
          <div className="pt-4 border-t border-stone-100">
            <h2 className="text-sm font-bold text-stone-600 uppercase tracking-widest mb-6">
              Contact Information (Optional)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs text-stone-400 uppercase tracking-widest mb-2"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-300"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-xs text-stone-400 uppercase tracking-widest mb-2"
                >
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-300"
                  placeholder="555-555-5555"
                />
              </div>
              <div>
                <label
                  htmlFor="instagram"
                  className="block text-xs text-stone-400 uppercase tracking-widest mb-2"
                >
                  Instagram
                </label>
                <input
                  id="instagram"
                  type="text"
                  value={formData.instagram}
                  onChange={(e) =>
                    setFormData({ ...formData, instagram: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-300"
                  placeholder="@username"
                />
              </div>
              <div>
                <label
                  htmlFor="linkedin"
                  className="block text-xs text-stone-400 uppercase tracking-widest mb-2"
                >
                  LinkedIn
                </label>
                <input
                  id="linkedin"
                  type="text"
                  value={formData.linkedin}
                  onChange={(e) =>
                    setFormData({ ...formData, linkedin: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-300"
                  placeholder="linkedin.com/in/username"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !formData.name}
            className="w-full py-5 bg-emerald-900 text-white rounded-2xl font-bold text-lg shadow-xl shadow-emerald-900/20 hover:bg-emerald-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Planting...
              </>
            ) : (
              'Plant Contact'
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
