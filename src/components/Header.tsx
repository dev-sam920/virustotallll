import React from 'react';
import { ShieldCheck, Info, Shield, Users, Search, HelpCircle, Activity, Globe, Menu, Sparkles } from 'lucide-react';

interface HeaderProps {
  onGoHome: () => void;
  onSearchQuery: (query: string) => void;
}

export default function Header({ onGoHome, onSearchQuery }: HeaderProps) {
  const [searchVal, setSearchVal] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      onSearchQuery(searchVal.trim());
    }
  };

  return (
    <header className="border-b border-vt-border/60 bg-[#070b1b] px-4 md:px-8 py-3.5 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo and Tagline */}
        <button 
          onClick={onGoHome}
          id="vt-logo-btn"
          className="flex items-center gap-3 group text-left cursor-pointer transition-all focus:outline-none"
        >
          {/* VirusTotal Stylized Shield Icon in SVG */}
          <div className="relative w-8 h-8 flex items-center justify-center bg-vt-primary bg-opacity-10 rounded-lg group-hover:bg-opacity-20 transition-all border border-vt-primary/20">
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              className="w-5 h-5 text-vt-primary transition-transform group-hover:scale-110 duration-300"
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-vt-success rounded-full border-2 border-[#070b1b]" />
          </div>
          
          <div className="hidden sm:block">
            <span className="text-lg font-bold tracking-wider text-white font-sans flex items-center">
              VIRUSTOTAL
              <span className="ml-1.5 text-[9px] bg-vt-primary/25 text-vt-primary font-mono px-1 py-0.5 rounded uppercase tracking-normal">CLONE</span>
            </span>
          </div>
        </button>

        {/* Search header container */}
        <form onSubmit={handleSubmit} className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-vt-text-muted">
              <Search className="w-4 h-4" />
            </span>
            <input 
              type="text" 
              id="header-search-input"
              placeholder="Search hash, URL, IP or domain..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full bg-[#121933] border border-vt-border/80 text-xs rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-vt-primary placeholder-vt-text-muted/60 transition-all focus:ring-1 focus:ring-vt-primary/40"
            />
          </div>
        </form>

        {/* Right Nav Options */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs font-medium">
          <button 
            onClick={onGoHome}
            className="text-vt-text-muted hover:text-white transition-colors py-1 hidden lg:block cursor-pointer"
          >
            Deploy Virus
          </button>
          
          <div className="h-4 w-[1px] bg-vt-border/60 hidden lg:block" />

          {/* Core Menu Actions */}
          <a 
            href="#intelligence" 
            onClick={(e) => { e.preventDefault(); alert("VirusTotal Intelligence is simulated. Explore by scanning files or entering suspicious URLs directly!"); }}
            className="text-vt-text-muted hover:text-white transition-colors py-1 hidden sm:flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
            Intelligence
          </a>

          <a 
            href="#community" 
            onClick={(e) => { e.preventDefault(); alert("Welcome to the virus scanning community! Try uploading a file or typing a query to view results."); }}
            className="text-vt-text-muted hover:text-white transition-colors py-1 flex items-center gap-1 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            Community
          </a>

          <div className="h-4 w-[1px] bg-vt-border/60" />

          <button 
            onClick={() => alert("Simulation setup. No sign-in required for this Premium clone!")}
            className="bg-[#121c40] border border-vt-border text-white px-3 py-1.5 rounded-md hover:bg-vt-card-hover transition-all font-semibold shadow-sm text-xs cursor-pointer"
          >
            Sign In
          </button>

          <button 
            onClick={onGoHome}
            className="bg-vt-primary hover:bg-vt-primary-hover text-white px-3.5 py-1.5 rounded-md transition-all font-bold shadow-md shadow-vt-primary/10 text-xs cursor-pointer"
          >
            Join Community
          </button>
        </div>
      </div>
    </header>
  );
}
