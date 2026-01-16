'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  onSearch,
  placeholder = "Ask your garden: 'Who told me they were starting a new job?'",
}: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className="mb-12 relative group">
      <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none">
        <Search className="h-6 w-6 text-stone-300 group-focus-within:text-emerald-600 transition-colors" />
      </div>
      <input
        type="text"
        className="w-full pl-16 pr-24 py-7 bg-white border-2 border-transparent rounded-5xl shadow-sm focus:outline-none focus:border-emerald-100 focus:shadow-xl focus:shadow-emerald-900/5 text-xl placeholder:text-stone-300 transition-all font-serif italic"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
      />
      <div className="absolute inset-y-4 right-4 flex items-center">
        <button className="h-full px-6 bg-stone-50 text-stone-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-2xl transition-all font-bold text-sm uppercase tracking-widest">
          Search
        </button>
      </div>
    </div>
  );
}
