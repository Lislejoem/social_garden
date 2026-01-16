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
  Leaf,
  ChevronLeft,
  Users,
  Star,
  Zap,
  Clock,
  ExternalLink
} from 'lucide-react';

// --- SHARED CONSTANTS (From Dashboard) ---
const CADENCE_LABELS = {
  OFTEN: { label: 'Often', text: 'text-stone-600' },
  REGULARLY: { label: 'Regularly', text: 'text-stone-600' },
  SELDOMLY: { label: 'Seldomly', text: 'text-stone-600' },
  RARELY: { label: 'Rarely', text: 'text-stone-600' },
};

const HEALTH_THEMES = {
  thriving: {
    color: 'bg-emerald-100',
    border: 'border-emerald-200',
    icon: <Flower2 className="w-5 h-5 text-emerald-700" />,
    text: 'text-emerald-800'
  },
  growing: {
    color: 'bg-emerald-50',
    border: 'border-emerald-100',
    icon: <Sprout className="w-5 h-5 text-emerald-600" />,
    text: 'text-emerald-700'
  },
  thirsty: {
    color: 'bg-lime-50/50',
    border: 'border-lime-100',
    icon: <Leaf className="w-5 h-5 text-lime-600" />,
    text: 'text-lime-700'
  },
  parched: {
    color: 'bg-orange-50',
    border: 'border-orange-100',
    icon: <Droplets className="w-5 h-5 text-orange-600" />,
    text: 'text-orange-700'
  }
};

// --- MOCK DATA ---
const INITIAL_CONTACTS = [
  {
    id: '1',
    name: 'Mark Henderson',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    lastContact: '2 days ago',
    health: 'thriving',
    tier: CADENCE_LABELS.OFTEN,
    location: 'Bozeman, Montana',
    socials: { instagram: '#', linkedin: '#', email: 'mark@example.com', phone: '555-0123' },
    preferences: {
      always: ['Dark roast coffee', 'Hardback books', 'Quiet mornings'],
      never: ['Peanuts (Allergy)', 'Loud bars', 'Saccharin'],
    },
    family: [
      { name: 'Beth', relation: 'Partner' },
      { name: 'Bo', relation: 'Dog (Golden Retriever)' },
      { name: 'Leo', relation: 'Son (6 yrs)' }
    ],
    topics: ['Elk hunting in the fall', 'Restoring his 1967 Mustang', 'Sustainable ranching'],
    seedlings: [
      'Check in about Leo\'s first day of school',
      'Ask if the Mustang engine parts arrived from Germany',
      'Potential gift: A specific wood-carving set he mentioned'
    ],
    history: [
      { date: 'Jan 12, 2024', type: 'Call', summary: 'Discussed the upcoming hunting trip and how he’s feeling about the move. Bo had a minor vet visit but is doing fine.' },
      { date: 'Dec 20, 2023', type: 'Meet', summary: 'Coffee at Blackbird. He shared his frustration with the ranch irrigation. Mentioned Leo is really getting into soccer.' },
      { date: 'Nov 15, 2023', type: 'Text', summary: 'Quick check-in. He sent a photo of the Mustang restoration progress.' }
    ]
  },
  // ... other contacts would go here
];

// --- COMPONENTS ---

const DashboardView = ({ onOpenProfile }) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-stone-900 font-sans selection:bg-emerald-100 pb-24">
      <header className="max-w-7xl mx-auto px-6 pt-12 pb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-stone-800 tracking-tight">The Social Garden</h1>
          <p className="text-stone-500 mt-1">Cultivating {INITIAL_CONTACTS.length} meaningful connections</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-emerald-900 text-white rounded-3xl font-bold shadow-xl shadow-emerald-900/20 hover:bg-emerald-800 hover:-translate-y-0.5 transition-all">
            <Plus className="w-5 h-5" />
            <span>Plant New Contact</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6">
        {/* Simplified Search for Mockup */}
        <div className="mb-12 relative">
          <input
            type="text"
            className="w-full pl-14 pr-6 py-6 bg-white border border-stone-100 rounded-[2rem] shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-100 text-lg placeholder:text-stone-300"
            placeholder="Search your garden..."
          />
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-300 w-5 h-5" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {INITIAL_CONTACTS.map(contact => {
            const theme = HEALTH_THEMES[contact.health];
            return (
              <div key={contact.id} className={`p-6 rounded-[2.5rem] border-2 border-transparent hover:border-emerald-200 transition-all ${theme.color}`}>
                <div className="flex items-center gap-4 mb-6">
                  <img src={contact.avatar} alt="" className="w-16 h-16 rounded-3xl object-cover ring-4 ring-white" />
                  <div>
                    <h3 className="text-xl font-serif font-bold">{contact.name}</h3>
                    <p className="text-[10px] uppercase tracking-widest text-stone-400">{contact.tier.label} • {contact.location}</p>
                  </div>
                </div>
                <div className="flex gap-2 mb-6">
                   <button className="p-2.5 bg-white rounded-xl text-stone-400"><Instagram className="w-4 h-4" /></button>
                   <button className="p-2.5 bg-white rounded-xl text-stone-400"><Mail className="w-4 h-4" /></button>
                </div>
                <button 
                  onClick={() => onOpenProfile(contact)}
                  className="w-full py-3 bg-white/60 hover:bg-white rounded-2xl text-sm font-bold text-stone-600 transition-all"
                >
                  Open Profile
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

const ProfileView = ({ contact, onBack }) => {
  const theme = HEALTH_THEMES[contact.health];

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-stone-900 font-sans selection:bg-emerald-100 pb-24">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-[#FDFCFB]/80 backdrop-blur-md border-b border-stone-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-stone-500 hover:text-emerald-800 font-bold transition-all group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Garden</span>
          </button>
          <div className="flex items-center gap-3">
             <button className="p-2.5 text-stone-400 hover:text-stone-600"><MoreHorizontal /></button>
             <button className="px-6 py-2.5 bg-emerald-900 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-900/10">Edit Profile</button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 mt-12">
        {/* Header Section */}
        <section className="flex flex-col md:flex-row gap-10 items-start md:items-center mb-16">
          <div className="relative">
            <img 
              src={contact.avatar} 
              alt={contact.name} 
              className="w-32 h-32 md:w-48 md:h-48 rounded-[3rem] object-cover shadow-2xl ring-8 ring-white"
            />
            <div className={`absolute -bottom-2 -right-2 p-3 bg-white rounded-2xl shadow-xl border-2 ${theme.border}`}>
              {theme.icon}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-stone-800 tracking-tight">{contact.name}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-stone-500">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-white border border-stone-100 rounded-full text-xs font-bold uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" /> {contact.tier.label}
              </span>
              <span className="flex items-center gap-1.5 text-sm">
                <MapPin className="w-4 h-4 text-stone-300" /> {contact.location}
              </span>
              <div className="h-4 w-px bg-stone-200 mx-2 hidden md:block" />
              <div className="flex items-center gap-3">
                <Instagram className="w-5 h-5 hover:text-pink-600 cursor-pointer transition-colors" />
                <Linkedin className="w-5 h-5 hover:text-blue-600 cursor-pointer transition-colors" />
                <Mail className="w-5 h-5 hover:text-amber-600 cursor-pointer transition-colors" />
                <Phone className="w-5 h-5 hover:text-emerald-600 cursor-pointer transition-colors" />
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column: The Greenhouse Cheat Sheet */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Essential People */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-stone-100 shadow-sm relative overflow-hidden group">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-rose-50 rounded-2xl text-rose-600"><Users className="w-5 h-5" /></div>
                <h2 className="text-2xl font-serif font-bold">Important People</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contact.family.map((person, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-stone-50/50 hover:bg-stone-50 transition-colors border border-transparent hover:border-stone-100">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-stone-400 font-bold">
                      {person.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-stone-800">{person.name}</p>
                      <p className="text-xs text-stone-400 uppercase tracking-widest">{person.relation}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Users className="w-24 h-24" />
              </div>
            </div>

            {/* Preference Board (Always/Never) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-emerald-50/30 rounded-[2.5rem] p-8 border border-emerald-100/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-white rounded-xl text-emerald-600 shadow-sm"><Star className="w-4 h-4 fill-current" /></div>
                  <h3 className="text-xl font-serif font-bold text-emerald-900 italic">Always</h3>
                </div>
                <ul className="space-y-3">
                  {contact.preferences.always.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-stone-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-stone-100/40 rounded-[2.5rem] p-8 border border-stone-200/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-white rounded-xl text-stone-400 shadow-sm"><Wind className="w-4 h-4" /></div>
                  <h3 className="text-xl font-serif font-bold text-stone-800 italic">Never</h3>
                </div>
                <ul className="space-y-3">
                  {contact.preferences.never.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-stone-600 line-through decoration-stone-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Topics of Interest */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-stone-100 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-amber-50 rounded-2xl text-amber-600"><Zap className="w-5 h-5" /></div>
                <h2 className="text-2xl font-serif font-bold">Topics They Care About</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {contact.topics.map((topic, i) => (
                  <div key={i} className="px-6 py-3 bg-stone-50 text-stone-700 rounded-2xl border border-stone-100 font-medium">
                    {topic}
                  </div>
                ))}
              </div>
            </div>

            {/* Interaction History (Summarized) */}
            <div className="space-y-8 pt-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-serif font-bold">Recent Growth</h2>
                <button className="text-sm font-bold text-emerald-800 hover:underline">View All History</button>
              </div>
              <div className="space-y-6">
                {contact.history.map((log, i) => (
                  <div key={i} className="relative pl-8 pb-8 border-l-2 border-stone-100 last:border-0 last:pb-0">
                    <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-emerald-400 shadow-sm" />
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">{log.date}</span>
                      <span className="px-2 py-0.5 bg-stone-100 text-[10px] font-bold rounded-md text-stone-500">{log.type}</span>
                    </div>
                    <p className="text-stone-700 leading-relaxed bg-white p-5 rounded-3xl border border-stone-50 shadow-sm">
                      {log.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: The Seedling Bed */}
          <div className="space-y-8">
            <div className="sticky top-28">
              <div className="bg-emerald-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-emerald-900/20 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-8">
                    <Sprout className="w-6 h-6 text-emerald-300" />
                    <h2 className="text-2xl font-serif font-bold text-white">The Seedling Bed</h2>
                  </div>
                  <p className="text-emerald-100/70 text-sm mb-8 italic">Future check-ins and ideas to nurture this connection.</p>
                  
                  <div className="space-y-4">
                    {contact.seedlings.map((seed, i) => (
                      <div key={i} className="p-4 bg-white/10 rounded-2xl border border-white/10 hover:bg-white/15 transition-all cursor-pointer group">
                        <p className="text-sm leading-relaxed mb-2">{seed}</p>
                        <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                           <button className="text-[10px] font-bold uppercase tracking-widest text-emerald-300 flex items-center gap-1">
                             Nudge Me <ChevronRight className="w-3 h-3" />
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="w-full mt-8 py-4 bg-emerald-800 hover:bg-emerald-700 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all">
                    <Plus className="w-4 h-4" /> Add Seedling
                  </button>
                </div>
                
                {/* Decorative background element */}
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
              </div>

              {/* Quick Utility Section */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                 <div className="p-6 bg-white border border-stone-100 rounded-3xl text-center">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Last Gift</p>
                    <p className="text-sm font-bold text-stone-800">Mustang Parts</p>
                 </div>
                 <div className="p-6 bg-white border border-stone-100 rounded-3xl text-center">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Mailing Address</p>
                    <button className="text-xs font-bold text-emerald-800 flex items-center gap-1 mx-auto">
                      View <ExternalLink className="w-3 h-3" />
                    </button>
                 </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedContact, setSelectedContact] = useState(null);

  const handleOpenProfile = (contact) => {
    setSelectedContact(contact);
    setCurrentView('profile');
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setCurrentView('dashboard');
    setSelectedContact(null);
  };

  return (
    <div className="relative">
      {currentView === 'dashboard' ? (
        <DashboardView onOpenProfile={handleOpenProfile} />
      ) : (
        <ProfileView contact={selectedContact} onBack={handleBack} />
      )}

      {/* GLOBAL FLOATING ACTION (Same as Dashboard) */}
      <div className="fixed bottom-10 right-10 z-50">
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

// Utility icon for the Never section
const Wind = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" /><path d="M9.6 4.6A2 2 0 1 1 11 8H2" /><path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
  </svg>
);

const ChevronRight = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);