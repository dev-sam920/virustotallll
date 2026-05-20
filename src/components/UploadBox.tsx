import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Link, Search, FileText, AlertCircle, HelpCircle, HardDrive } from 'lucide-react';
import { calculateSHA256 } from '../utils';

interface UploadBoxProps {
  onFileAnalyzed: (file: File, sha256: string) => void;
  onUrlAnalyzed: (url: string) => void;
  onSearchAnalyzed: (query: string) => void;
}

type ActiveTab = 'file' | 'url' | 'search';

export default function UploadBox({ onFileAnalyzed, onUrlAnalyzed, onSearchAnalyzed }: UploadBoxProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('file');
  const [isDragActive, setIsDragActive] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isHashing, setIsHashing] = useState(false);
  const [hashProgress, setHashProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger file dialog
  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Process standard files
  const processUploadedFile = async (file: File) => {
    if (!file) return;
    setErrorText(null);
    setIsHashing(true);
    setHashProgress(15);

    try {
      // Simulate cryptographic calculation steps
      const interval = setInterval(() => {
        setHashProgress(p => {
          if (p >= 90) {
            clearInterval(interval);
            return 90;
          }
          return p + 25;
        });
      }, 150);

      const sha256 = await calculateSHA256(file);
      clearInterval(interval);
      setHashProgress(100);
      
      // small delay to let progress complete visually
      setTimeout(() => {
        setIsHashing(false);
        onFileAnalyzed(file, sha256);
      }, 350);
    } catch (err) {
      console.error(err);
      setErrorText("Failed to calculate SHA-256 hash secure block.");
      setIsHashing(false);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await processUploadedFile(e.target.files[0]);
    }
  };

  // URL Submission
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    if (!urlInput.trim()) {
      setErrorText("Please enter a valid URL to analyze.");
      return;
    }
    onUrlAnalyzed(urlInput.trim());
  };

  // Search Submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    if (!searchInput.trim()) {
      setErrorText("Please enter a hash, URL, IP address or domain.");
      return;
    }
    onSearchAnalyzed(searchInput.trim());
  };

  return (
    <div id="upload-main-container" className="w-full max-w-4xl mx-auto mt-6 md:mt-12 px-4">
      {/* Search Header Hero Elements */}
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
          VirusTotal
        </h1>
        <p className="text-sm md:text-base text-vt-text-muted/90 max-w-2xl mx-auto px-2 leading-relaxed">
          Analyze suspicious files, domains, IPs and URLs to detect malware and other breaches, automatically share them with the security community.
        </p>
      </div>

      {/* Upload core tabs switcher card */}
      <div className="bg-[#121c3e] border border-vt-border/80 rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="flex border-b border-vt-border/50 bg-[#0c122b]">
          {/* FILE TAP */}
          <button
            onClick={() => { setActiveTab('file'); setErrorText(null); }}
            className={`flex-1 py-4.5 px-4 font-bold text-xs md:text-sm tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'file'
                ? 'border-vt-primary text-white bg-vt-primary/5'
                : 'border-transparent text-vt-text-muted hover:text-white hover:bg-white/5'
            }`}
          >
            <Upload className="w-4.5 h-4.5" />
            FILE
          </button>

          {/* URL TAP */}
          <button
            onClick={() => { setActiveTab('url'); setErrorText(null); }}
            className={`flex-1 py-4.5 px-4 font-bold text-xs md:text-sm tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'url'
                ? 'border-vt-primary text-white bg-vt-primary/5'
                : 'border-transparent text-vt-text-muted hover:text-white hover:bg-white/5'
            }`}
          >
            <Link className="w-4.5 h-4.5" />
            URL
          </button>

          {/* SEARCH TAP */}
          <button
            onClick={() => { setActiveTab('search'); setErrorText(null); }}
            className={`flex-1 py-4.5 px-4 font-bold text-xs md:text-sm tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'search'
                ? 'border-vt-primary text-white bg-vt-primary/5'
                : 'border-transparent text-vt-text-muted hover:text-white hover:bg-white/5'
            }`}
          >
            <Search className="w-4.5 h-4.5" />
            SEARCH
          </button>
        </div>

        {/* Content Tabs Area */}
        <div className="p-8 md:p-12 min-h-[280px] flex flex-col justify-center">
          
          <AnimatePresence mode="wait">
            {isHashing ? (
              <motion.div
                key="hashing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center flex flex-col items-center justify-center py-6"
              >
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-full border-4 border-vt-border border-t-vt-primary animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center font-mono text-xs font-bold text-vt-primary">
                    {hashProgress}%
                  </div>
                </div>
                <h3 className="text-base font-semibold text-white mb-2">Hashing Local File blocks...</h3>
                <p className="text-xs text-vt-text-muted max-w-sm">
                  Computing SHA-256 secure hash checksum locally using the browser's cryptographic sandbox.
                </p>
              </motion.div>
            ) : activeTab === 'file' ? (
              <motion.div
                key="file"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer flex flex-col items-center justify-center min-h-[240px] relative overflow-hidden ${
                  isDragActive
                    ? 'border-vt-primary bg-vt-primary/15 scale-[1.02] shadow-[0_0_35px_rgba(57,117,255,0.25)] ring-2 ring-vt-primary/30'
                    : 'border-vt-border/80 hover:border-vt-primary hover:bg-vt-card-hover/40 hover:shadow-[0_0_20px_rgba(57,117,255,0.05)]'
                }`}
                onClick={onButtonClick}
              >
                {/* Visual Ambient Drag Over Active Pulse Waves */}
                {isDragActive && (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(57,117,255,0.15)_0%,transparent_70%)] pointer-events-none animate-pulse" />
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  id="vt-file-uploader-input"
                  className="hidden"
                  onChange={handleFileChange}
                />
                
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 transition-all duration-300 relative z-10 ${
                  isDragActive 
                    ? 'bg-vt-primary/25 text-white scale-110 ring-8 ring-vt-primary/10 rotate-6 shadow-lg shadow-vt-primary/25' 
                    : 'bg-vt-primary/10 text-vt-primary group-hover:scale-110'
                }`}>
                  <Upload className={`w-8 h-8 transition-transform duration-300 ${
                    isDragActive ? 'animate-bounce text-white' : 'animate-pulse text-vt-primary'
                  }`} />
                </div>

                <div className="space-y-2 max-w-md relative z-10">
                  <span className={`transition-all duration-300 font-bold px-4 py-2 rounded-lg text-xs tracking-wider inline-block ${
                    isDragActive 
                      ? 'bg-vt-success/20 text-vt-success scale-105 border border-vt-success/30' 
                      : 'bg-vt-primary/20 text-vt-primary hover:bg-vt-primary/30'
                  }`}>
                    {isDragActive ? "DROP FILE NOW" : "CHOOSE FILE"}
                  </span>
                  
                  <p className="text-sm font-semibold text-white mt-3 transition-colors duration-300">
                    {isDragActive ? "Release to unleash VirusTotal Analyzer!" : "Drag and drop your file here"}
                  </p>
                  
                  <p className="text-xs text-vt-text-muted leading-normal transition-colors duration-300">
                    {isDragActive 
                      ? "Unreleasing computes secure SHA-256 blocks dynamically in your local sandbox browser."
                      : "Or select a local application, PDF, document or image. Analysis is performed on the standard file hash. Size limit up to 650MB."
                    }
                  </p>
                </div>
              </motion.div>
            ) : activeTab === 'url' ? (
              <motion.div
                key="url"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 max-w-2xl mx-auto w-full"
              >
                <form onSubmit={handleUrlSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-vt-text-muted">
                      <Link className="w-5 h-5 text-vt-primary" />
                    </span>
                    <input
                      type="text"
                      id="vt-url-input"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="Search or analyze a URL..."
                      className="w-full bg-[#0a0f24] border border-vt-border text-sm rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-vt-primary focus:ring-2 focus:ring-vt-primary/20 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-vt-primary hover:bg-vt-primary-hover text-white font-bold px-6 py-4 rounded-xl shadow-lg transition-all text-xs tracking-wide uppercase cursor-pointer"
                  >
                    Analyze
                  </button>
                </form>

                {/* Suggestions triggers for real testing */}
                <div>
                  <h4 className="text-xs font-semibold text-vt-text-muted/80 uppercase tracking-widest mb-2 flex items-center gap-1.5 justify-center">
                    <HardDrive className="w-3.5 h-3.5" />
                    Try testing one of these URLs:
                  </h4>
                  <div className="flex flex-wrap justify-center gap-2">
                    {[
                      { label: "google.com (Clean)", url: "https://www.google.com" },
                      { label: "ransomware-host.xyz (Malicious)", url: "http://malicious-ransomware-host.xyz/payload" },
                      { label: "phishing-secure-account-verification.net", url: "http://phishing-secure-account-verification.net/login.php" },
                    ].map((item, index) => (
                      <button
                        key={index}
                        onClick={() => setUrlInput(item.url)}
                        className="bg-[#0a0f24] hover:bg-[#12193b] text-[10px] text-vt-text-muted border border-vt-border/60 py-1.5 px-3 rounded-lg hover:text-white transition-all text-left truncate max-w-xs cursor-pointer select-none"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="search"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 max-w-2xl mx-auto w-full"
              >
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-vt-text-muted">
                      <Search className="w-5 h-5 text-vt-primary" />
                    </span>
                    <input
                      type="text"
                      id="vt-search-input"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="URL, IP address, domain or file hash (MD5, SHA-1, SHA-256)..."
                      className="w-full bg-[#0a0f24] border border-vt-border text-sm rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-vt-primary focus:ring-2 focus:ring-vt-primary/20 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-vt-primary hover:bg-vt-primary-hover text-white font-bold px-6 py-4 rounded-xl shadow-lg transition-all text-xs tracking-wide uppercase cursor-pointer"
                  >
                    Search
                  </button>
                </form>

                {/* Simulated quick elements */}
                <div>
                  <h4 className="text-xs font-semibold text-vt-text-muted/80 uppercase tracking-widest mb-2 flex items-center gap-1.5 justify-center">
                    <HardDrive className="w-3.5 h-3.5" />
                    Click here to instantly scan demo indicators:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md mx-auto">
                    {[
                      { label: "IP: 193.56.28.11 (Active Attack)", value: "193.56.28.11" },
                      { label: "IP: 8.8.8.8 (Google DNS - Safe)", value: "8.8.8.8" },
                      { label: "Hash: Malicious Trojan File", value: "8374a58b8f2c3d42857a2c009fdca3e9817e082cb75e5f3dbdeca48fa918ff5e" },
                      { label: "Domain: phishing-alert.co", value: "phishing-alert.co" }
                    ].map((item, index) => (
                      <button
                        key={index}
                        onClick={() => setSearchInput(item.value)}
                        className="bg-[#0a0f24] hover:bg-[#12193b] text-[10px] text-vt-text-muted border border-vt-border/60 py-1.5 px-3 rounded-lg hover:text-white transition-all text-left truncate cursor-pointer select-none"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feedback error line with layout */}
          <AnimatePresence>
            {errorText && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="mt-6 flex items-center gap-2 p-3 bg-vt-danger/10 border border-vt-danger/25 text-vt-danger rounded-lg text-xs font-medium justify-center"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorText}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Helpful educational widget */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-[#0a0e21] rounded-xl border border-vt-border/40 text-xs text-vt-text-muted/90">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-vt-primary shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-white text-xs mb-0.5">Want to deploy an EICAR antivirus test?</h4>
            <p className="leading-relaxed">
              Upload any text file with <code className="bg-[#121c3e] text-orange-400 px-1 py-0.5 rounded font-mono text-[10px]">virus</code> or <code className="bg-[#121c3e] text-orange-400 px-1 py-0.5 rounded font-mono text-[10px]">&quot;malware&quot;</code> in its name (e.g. <span className="italic">eicar_test_virus.txt</span>) to trigger the simulated threat detection module and try out filtering functions!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
