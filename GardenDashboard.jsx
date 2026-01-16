import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Droplets, 
  Sprout, 
  MoreHorizontal, 
  Filter,
  Mic,
  Gift,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MessageCircle,
  Flower2,
  MapPin,
  Leaf
} from 'lucide-react';

// Relationship Framework: Care Frequency Labels
const CADENCE_LABELS = {
  OFTEN: { label: 'Often', text: 'text-stone-600' },
  REGULARLY: { label: 'Regularly', text: 'text-stone-600' },
  SELDOMLY: { label: 'Seldomly', text: 'text-stone-600' },
  RARELY: { label: 'Rarely', text: 'text-stone-600' },
};

// Health Themes: A Green Scale for health, with Orange for urgency
const HEALTH_THEMES = {
  thriving: {
    color: 'bg-emerald-100', // Deepest green
    border: 'hover:border-emerald-400',
    icon: <Flower2 className="w-4 h-4 text-emerald-700" />,
    badge: 'bg-emerald-200 text-emerald-800'
  },
  growing: {
    color: 'bg-emerald-50', // Standard healthy green
    border: 'hover:border-emerald-200',
    icon: <Sprout className="w-4 h-4 text-emerald-600" />,
    badge: 'bg-emerald-100 text-emerald-700'
  },
  thirsty: {
    color: 'bg-lime-50/50', // Paler green, starting to fade
    border: 'hover:border-lime-200',
    icon: <Leaf className="w-4 h-4 text-lime-600" />,
    badge: 'bg-lime-100 text-lime-700'
  },
  parched: {
    color: 'bg-orange-50', // "Wilting" alert color
    border: 'hover:border-orange-200',
    icon: <Droplets className="w-4 h-4 text-orange-600" />,
    badge: 'bg-orange-100 text-orange-700'
  }
};

const INITIAL_CONTACTS = [
  {
    id: '1',
    name: 'Mark Henderson',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    lastContact: '2 days ago',
    health: 'thriving',
    tier: CADENCE_LABELS.OFTEN,
    location: 'Montana',
    socials: { instagram: '#', linkedin: '#', email: 'mark@example.com', phone: '555-0123' },
    preferences: ['Hunting enthusiast', 'Loves dark roast coffee', 'Peanut allergy'],
  },
  {
    id: '2',
    name: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    lastContact: '4 months ago',
    health: 'parched',
    tier: CADENCE_LABELS.REGULARLY,
    location: 'Chicago',
    socials: { instagram: '#', email: 'sarah@example.com' },
    preferences: ['Sober', 'Prefers quiet bars', 'Classical pianist'],
  },
  {
    id: '3',
    name: 'Dave Wilson',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    lastContact: '2 weeks ago',
    health: 'growing',
    tier: CADENCE_LABELS.OFTEN,
    location: 'Austin',
    socials: { instagram: '#', linkedin: '#', phone: '555-0199' },
    preferences: ['Gravel biking', 'Vegan', 'Hates loud music'],
  },
  {
    id: '4',
    name: 'Elena Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
    lastContact: '8 months ago',
    health: 'thirsty',
    tier: CADENCE_LABELS.SELDOMLY,
    location: 'Miami',
    socials: { linkedin: '#', email: 'elena@example.com' },
    preferences: ['Speaks Spanish', 'Architecture fan', 'Gluten-free'],
  }
];

const ContactCard = ({ contact }) => {
  const theme = HEALTH_THEMES[contact.health];

  return (
    <div className={`relative group p-6 rounded-[2.5rem] transition-all duration-500 border-2 border-transparent ${theme.border} hover:shadow-2xl hover:shadow-emerald-900/5 ${theme.color}`}>
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img 
              src={contact.avatar} 
              alt={contact.name} 
              className="w-16 h-16 rounded-3xl object-cover shadow-inner ring-4 ring-white"
            />
            <div className="absolute -bottom-1 -right-1 p-1.5 bg-white rounded-xl shadow-sm border border-stone-50">
              {theme.icon}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-stone-800 leading-tight">{contact.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/60 text-stone-600`}>
                {contact.tier.label}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-stone-400 font-sans uppercase tracking-widest">
                <MapPin className="w-3 h-3" /> {contact.location}
              </span>
            </div>
          </div>
        </div>
        <button className="text-stone-300 hover:text-stone-600 transition-colors p-1">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Social & Contact Actions */}
      <div className="flex gap-2 mb-6">
        {contact.socials.instagram && (
          <a href={contact.socials.instagram} className="p-2.5 bg-white rounded-2xl text-stone-400 hover:text-emerald-700 hover:shadow-md transition-all">
            <Instagram className="w-4 h-4" />
          </a>
        )}
        {contact.socials.linkedin && (
          <a href={contact.socials.linkedin} className="p-2.5 bg-white rounded-2xl text-stone-400 hover:text-emerald-700 hover:shadow-md transition-all">
            <Linkedin className="w-4 h-4" />
          </a>
        )}
        {contact.socials.phone && (
          <a href={`tel:${contact.socials.phone}`} className="p-2.5 bg-white rounded-2xl text-stone-400 hover:text-emerald-700 hover:shadow-md transition-all">
            <MessageCircle className="w-4 h-4" />
          </a>
        )}
        {contact.socials.email && (
          <a href={`mailto:${contact.socials.email}`} className="p-2.5 bg-white rounded-2xl text-stone-400 hover:text-emerald-700 hover:shadow-md transition-all">
            <Mail className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Quick Preferences */}
      <div className="flex flex-wrap gap-2 mb-6">
        {contact.preferences.map((pref, i) => (
          <span key={i} className="px-3 py-1.5 bg-white/40 text-[11px] font-medium text-stone-600 rounded-xl border border-white/50">
            {pref}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between text-[11px] text-stone-400 border-t border-stone-200/40 pt-4">
        <span className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${contact.health === 'parched' ? 'bg-orange-500 animate-pulse' : 'bg-emerald-400'}`} />
          Last seen {contact.lastContact}
        </span>
        <button className="font-bold text-stone-600 hover:text-emerald-800 transition-all uppercase tracking-tighter">
          Open Profile
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <div className="min-h-screen bg-[#FDFCFB] text-stone-900 font-sans selection:bg-emerald-100 pb-24">
      <header className="max-w-7xl mx-auto px-6 pt-12 pb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-stone-800">The Social Garden</h1>
          <p className="text-stone-500 mt-1">Cultivating {INITIAL_CONTACTS.length} meaningful connections</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="p-4 bg-white rounded-3xl border border-stone-100 shadow-sm text-stone-600 hover:bg-stone-50 transition-all">
            <Filter className="w-5 h-5" />
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-emerald-900 text-white rounded-3xl font-bold shadow-xl shadow-emerald-900/20 hover:bg-emerald-800 hover:-translate-y-0.5 transition-all">
            <Plus className="w-5 h-5" />
            <span>Plant New Contact</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6">
        {/* Morning Digest Banner */}
        <div className="mb-12 bg-white border border-stone-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden group">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 text-emerald-700 font-bold text-[10px] uppercase tracking-[0.3em] mb-4 px-3 py-1 bg-emerald-50 rounded-full">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Morning Insight
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-medium mb-6 leading-tight">
                Your garden is <span className="text-emerald-700 italic underline decoration-emerald-100 underline-offset-8">thriving</span>, but two plants are parched.
              </h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="flex items-center gap-2 bg-stone-50 px-5 py-2.5 rounded-2xl border border-stone-100 text-sm font-medium">
                  <Gift className="w-4 h-4 text-emerald-400" />
                  <span>Mark's Birthday • Saturday</span>
                </div>
                <div className="flex items-center gap-2 bg-stone-50 px-5 py-2.5 rounded-2xl border border-stone-100 text-sm font-medium">
                  <Droplets className="w-4 h-4 text-orange-400" />
                  <span>2 friends need watering</span>
                </div>
              </div>
            </div>
            <button className="relative z-10 px-10 py-5 bg-stone-900 text-white rounded-3xl font-bold hover:bg-stone-800 hover:shadow-2xl transition-all whitespace-nowrap">
              Open Daily Digest
            </button>
          </div>
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-50 rounded-full blur-[100px] opacity-40 -translate-y-1/2 translate-x-1/3" />
        </div>

        {/* Semantic Search Area */}
        <div className="mb-12 relative group">
          <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-stone-300 group-focus-within:text-emerald-600 transition-colors" />
          </div>
          <input
            type="text"
            className="w-full pl-16 pr-24 py-7 bg-white border-2 border-transparent rounded-[2.5rem] shadow-sm focus:outline-none focus:border-emerald-100 focus:shadow-xl focus:shadow-emerald-900/5 text-xl placeholder:text-stone-300 transition-all font-serif italic"
            placeholder="Ask your garden: 'Who told me they were starting a new job?'"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute inset-y-4 right-4 flex items-center">
            <button className="h-full px-6 bg-stone-50 text-stone-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-2xl transition-all font-bold text-sm uppercase tracking-widest">
              Search
            </button>
          </div>
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {INITIAL_CONTACTS.map(contact => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
          
          <button className="border-4 border-dashed border-stone-100 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-stone-300 hover:border-emerald-200 hover:text-emerald-700 hover:bg-emerald-50/30 transition-all group min-h-[350px]">
            <div className="w-16 h-16 rounded-3xl border-2 border-dashed border-stone-200 flex items-center justify-center mb-6 group-hover:border-emerald-300 group-hover:bg-white transition-all">
               <Plus className="w-8 h-8" />
            </div>
            <p className="font-serif text-xl italic text-stone-500">Plant a New Connection</p>
            <p className="text-xs font-sans uppercase tracking-[0.2em] mt-2 opacity-60">Add to your garden</p>
          </button>
        </div>
      </main>

      {/* Floating Action for Mobile Brain Dump */}
      <div className="fixed bottom-10 right-10 flex flex-col gap-4 items-end z-50">
        <button className="w-20 h-20 bg-emerald-900 text-white rounded-[2rem] shadow-2xl flex items-center justify-center hover:scale-110 hover:-rotate-6 active:scale-95 transition-all">
          <Mic className="w-10 h-10" />
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
          background-color: #FDFCFB;
        }
        
        .font-serif {
          font-family: 'Playfair Display', serif;
        }
      `}} />
    </div>
  );
}