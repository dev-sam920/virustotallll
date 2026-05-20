import { useState } from 'react';
import Header from './components/Header';
import UploadBox from './components/UploadBox';
import ResultReport from './components/ResultReport';
import RecentScans from './components/RecentScans';
import { SecurityReport } from './types';
import { createSimulatedReport } from './utils';

export default function App() {
  const [currentReport, setCurrentReport] = useState<SecurityReport | null>(null);

  // File was successfully processed and hashed
  const handleFileAnalyzed = (file: File, sha256: string) => {
    const report = createSimulatedReport(file.name, 'file', file.size, sha256);
    setCurrentReport(report);
  };

  // URL analyzed
  const handleUrlAnalyzed = (url: string) => {
    const report = createSimulatedReport(url, 'url');
    setCurrentReport(report);
  };

  // Search query analyzed
  const handleSearchAnalyzed = (query: string) => {
    // If it's an IP address or domain/hash
    const report = createSimulatedReport(query, 'search');
    setCurrentReport(report);
  };

  return (
    <div className="min-h-screen flex flex-col bg-vt-bg text-white selection:bg-vt-primary/30 selection:text-white relative">
      
      {/* Visual Ambient Glow Ornaments */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-vt-primary bg-opacity-5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-vt-success bg-opacity-5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Header element */}
      <Header 
        onGoHome={() => setCurrentReport(null)} 
        onSearchQuery={handleSearchAnalyzed} 
      />

      {/* Main body viewport */}
      <main className="flex-1 w-full relative z-10 py-6">
        {currentReport ? (
          <ResultReport 
            report={currentReport} 
            onGoBack={() => setCurrentReport(null)} 
          />
        ) : (
          <div className="space-y-4">
            <UploadBox 
              onFileAnalyzed={handleFileAnalyzed}
              onUrlAnalyzed={handleUrlAnalyzed}
              onSearchAnalyzed={handleSearchAnalyzed}
            />
            
            <RecentScans 
              onSelectScannedReport={(report) => setCurrentReport(report)}
            />
          </div>
        )}
      </main>

      {/* High Fidelity footer */}
      <footer className="border-t border-vt-border/30 bg-[#070b1b] py-8 text-center text-xs text-vt-text-muted mt-auto">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-vt-text-muted">
            <button onClick={() => alert("Simulation terms: Dedicated entirely to ethical learning purposes.")} className="hover:text-white transition-colors cursor-pointer">Terms of Service</button>
            <button onClick={() => alert("Simulation privacy: No files uploaded ever leave your local computer.")} className="hover:text-white transition-colors cursor-pointer">Privacy Policy</button>
            <button onClick={() => alert("The VT Public API is free for any standard integration.")} className="hover:text-white transition-colors cursor-pointer">API Agreement</button>
            <button onClick={() => alert("This clone is high-quality React fully operational local clone.")} className="hover:text-white transition-colors cursor-pointer">About Us</button>
            <button onClick={() => alert("Collaborate on threat intelligence repositories.")} className="hover:text-white transition-colors cursor-pointer">Community Contribs</button>
          </div>
          <p className="text-[11px] text-vt-text-muted/60 leading-relaxed font-mono">
            VirusTotal Clone Engine v4.8.20 • Crafted with deep-dark technological aesthetic • Current Local Sandbox Server Active: {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
