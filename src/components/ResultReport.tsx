import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, CheckCircle2, ShieldAlert, Copy, Search, MessageSquare, 
  Clock, HardDrive, Calendar, ThumbsUp, ThumbsDown, MessageCircle, 
  Send, ExternalLink, HelpCircle, Tag, Check, Filter, Share2
} from 'lucide-react';
import { SecurityReport, UserComment, VendorScan } from '../types';
import { formatBytes } from '../utils';

interface ResultReportProps {
  report: SecurityReport;
  onGoBack: () => void;
}

export default function ResultReport({ report, onGoBack }: ResultReportProps) {
  const [activeTab, setActiveTab] = useState<'detection' | 'details' | 'community'>('detection');
  const [vendorSearch, setVendorSearch] = useState('');
  const [vendorFilter, setVendorFilter] = useState<'all' | 'malicious' | 'clean'>('all');
  const [commentInput, setCommentInput] = useState('');
  const [copiedText, setCopiedText] = useState<'sha256' | 'sha1' | 'md5' | null>(null);
  
  // Local Reputation States
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [harmlessCount, setHarmlessCount] = useState(report.votedHarmless);
  const [maliciousCount, setMaliciousCount] = useState(report.votedMalicious);
  const [voteFeedback, setVoteFeedback] = useState<string | null>(null);

  // Prepopulated comments for simulation
  const [comments, setComments] = useState<UserComment[]>([
    {
      id: "c1",
      author: "cyber_sentinel_88",
      avatarUrl: undefined,
      isStaff: true,
      content: `A detailed inspection of this signature indicates a packed section utilizing dynamic API imports. Heuristics suggest high correlation with known telemetry payloaders. Highly recommend blocking at network perimeter.`,
      createdAt: "3 days ago",
      votes: 42
    },
    {
      id: "c2",
      author: "malware_bytes_fan",
      isStaff: false,
      content: report.positives > 10 
        ? `Warning! This matches automated sandboxing behaviors of Trojan families executing in %TEMP% folders.` 
        : `Verified harmless file. Frequently encountered during default system initialization setups. Clear signature matching.`,
      createdAt: "1 week ago",
      votes: report.positives > 10 ? 12 : 6
    }
  ]);

  // Handle copying to clipboard
  const handleCopy = (text: string | undefined, key: 'sha256' | 'sha1' | 'md5') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(key);
    setTimeout(() => setCopiedText(null), 1500);
  };

  // Upvote / Downvote reputation handlers
  const handleVote = (vote: 'up' | 'down') => {
    if (userVote === vote) {
      // Undo vote
      setUserVote(null);
      if (vote === 'up') setHarmlessCount(p => p - 1);
      else setMaliciousCount(p => p - 1);
      setVoteFeedback("Your vote has been retracted successfully.");
    } else {
      // Switch or apply vote
      if (userVote === 'up') setHarmlessCount(p => p - 1);
      if (userVote === 'down') setMaliciousCount(p => p - 1);

      setUserVote(vote);
      if (vote === 'up') {
        setHarmlessCount(p => p + 1);
        setVoteFeedback("Reputation Registered! Declaring this threat indicator as HARMLESS (Safe/Clean).");
      } else {
        setMaliciousCount(p => p + 1);
        setVoteFeedback("Reputation Registered! Flagging this threat indicator as MALICIOUS (Suspicious/Threat).");
      }
    }
    
    // Auto clear feedback text after several seconds
    const timer = setTimeout(() => {
      setVoteFeedback(null);
    }, 4500);
    return () => clearTimeout(timer);
  };

  // Submit comment
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment: UserComment = {
      id: "comment_" + Date.now(),
      author: "you_security_analyst",
      isStaff: false,
      content: commentInput.trim(),
      createdAt: "Just now",
      votes: 1
    };

    setComments(prev => [newComment, ...prev]);
    setCommentInput('');
  };

  // Upvote comment
  const voteComment = (id: string) => {
    setComments(prev => prev.map(c => c.id === id ? { ...c, votes: c.votes + 1 } : c));
  };

  // Filter vendor detections with search + status categories
  const filteredVendors = useMemo(() => {
    const list = Object.values(report.scans);
    return list.filter(item => {
      // Text Filter
      const matchSearch = item.vendor.toLowerCase().includes(vendorSearch.toLowerCase()) || 
                          (item.result && item.result.toLowerCase().includes(vendorSearch.toLowerCase()));
      
      // Category Filter
      if (vendorFilter === 'all') return matchSearch;
      if (vendorFilter === 'malicious') {
        return matchSearch && (item.category === 'malicious' || item.category === 'suspicious');
      }
      if (vendorFilter === 'clean') {
        return matchSearch && (item.category === 'clean' || item.category === 'undetected');
      }
      return matchSearch;
    });
  }, [report.scans, vendorSearch, vendorFilter]);

  const maliciousScansCount = filteredVendors.filter(v => v.category === 'malicious' || v.category === 'suspicious').length;

  return (
    <div id="result-dashboard-wrapper" className="max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-6">
      
      {/* Back to Home layout button */}
      <div>
        <button
          onClick={onGoBack}
          id="back-to-scan-btn"
          className="flex items-center gap-2 text-xs font-bold text-vt-text-muted hover:text-white bg-[#121c3e] border border-vt-border/60 py-2 px-4 rounded-lg hover:bg-vt-card-hover transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-vt-primary" />
          RE-ANALYZE / NEW FILE
        </button>
      </div>

      {/* Main Scan Indicator Section */}
      <div className="bg-[#121c3e] border border-vt-border rounded-xl p-6 md:p-8 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Radial score gauge visual */}
          <div className="lg:col-span-3 flex flex-col items-center justify-center p-4 border-b lg:border-b-0 lg:border-r border-vt-border/60">
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* Outer stroke track SVG */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="62"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  className="text-vt-border/50"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="62"
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 62}
                  strokeDashoffset={2 * Math.PI * 62 * (1 - report.positives / report.totalVendors)}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  className={`transition-all duration-1000 ${
                    report.positives > 20 
                      ? 'text-vt-danger' 
                      : report.positives > 0 
                        ? 'text-vt-warning' 
                        : 'text-vt-success'
                  }`}
                />
              </svg>

              {/* Centered large numerals */}
              <div className="absolute inset-x-0 inset-y-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-extrabold tracking-tight ${
                  report.positives > 20 
                    ? 'text-vt-danger' 
                    : report.positives > 0 
                      ? 'text-vt-warning' 
                      : 'text-vt-success'
                }`}>
                  {report.positives}
                </span>
                <span className="text-[10px] text-vt-text-muted font-bold tracking-widest border-t border-vt-border/70 pt-0.5 mt-0.5">
                  / {report.totalVendors}
                </span>
              </div>
            </div>

            {/* Verdict label string */}
            <div className="text-center mt-4">
              <h3 className={`text-sm font-bold tracking-wider uppercase flex items-center gap-1.5 justify-center ${
                report.positives > 20 
                  ? 'text-vt-danger' 
                  : report.positives > 0 
                    ? 'text-vt-warning' 
                    : 'text-vt-success'
              }`}>
                {report.positives > 20 ? (
                  <>
                    <ShieldAlert className="w-4 h-4 animate-bounce" />
                    MALICIOUS FILE
                  </>
                ) : report.positives > 0 ? (
                  <>
                    <HelpCircle className="w-4 h-4" />
                    SUSPICIOUS METRICS
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    UNDETECTED
                  </>
                )}
              </h3>
              <p className="text-[11px] text-vt-text-muted mt-1 leading-normal">
                {report.positives > 0 
                  ? `Flagged by ${report.positives} security engines.` 
                  : `0 security vendors detected threats in this file.`
                }
              </p>
            </div>
          </div>

          {/* Core metadata details column */}
          <div className="lg:col-span-9 space-y-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#0a0f24] text-vt-primary text-[10px] font-mono px-2 py-0.5 rounded border border-vt-border font-semibold uppercase">
                  {report.type}
                </span>
                <span className="text-xs text-vt-text-muted">
                  Analyzed {report.scanDate} UTC
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white select-all break-all leading-snug">
                {report.name}
              </h2>
            </div>

            {/* Key-Value metadata specs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#0a0f24] p-4 rounded-xl border border-vt-border/65">
              <div className="space-y-2.5 text-xs">
                <div className="flex md:items-center justify-between gap-2 border-b border-vt-border/30 pb-2">
                  <span className="text-vt-text-muted font-medium flex items-center gap-1.5 shrink-0">
                    <HardDrive className="w-3.5 h-3.5" /> Size:
                  </span>
                  <span className="text-white font-mono text-[11px]">
                    {report.size ? formatBytes(report.size) : 'N/A (Scan Query)'}
                  </span>
                </div>
                <div className="flex md:items-center justify-between gap-2 border-b md:border-b-0 border-vt-border/30 pb-2 md:pb-0">
                  <span className="text-vt-text-muted font-medium flex items-center gap-1.5 shrink-0">
                    <Calendar className="w-3.5 h-3.5" /> File Type:
                  </span>
                  <span className="text-white">
                    {report.fileType || "Network URL Indicator"}
                  </span>
                </div>
              </div>

              {/* Crypt hashes */}
              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex items-center justify-between gap-2 border-b border-vt-border/30 pb-2">
                  <span className="text-vt-text-muted font-semibold shrink-0">SHA-256:</span>
                  <div className="flex items-center gap-1 overflow-hidden">
                    <span className="text-white text-[10px] truncate max-w-[140px] sm:max-w-xs">{report.sha256}</span>
                    <button
                      onClick={() => handleCopy(report.sha256, 'sha256')}
                      className="text-vt-text-muted hover:text-white p-1 rounded transition-colors bg-[#111933] hover:bg-vt-border"
                      title="Copy SHA-256"
                    >
                      {copiedText === 'sha256' ? <Check className="w-3 h-3 text-vt-success" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-vt-text-muted font-semibold shrink-0">MD5:</span>
                  <div className="flex items-center gap-1 overflow-hidden">
                    <span className="text-white text-[10px] truncate max-w-[140px] sm:max-w-xs">{report.md5}</span>
                    <button
                      onClick={() => handleCopy(report.md5, 'md5')}
                      className="text-vt-text-muted hover:text-white p-1 rounded transition-colors bg-[#111933] hover:bg-vt-border"
                      title="Copy MD5"
                    >
                      {copiedText === 'md5' ? <Check className="w-3 h-3 text-vt-success" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Voting Metrics representation */}
            <div className="flex flex-col space-y-3 pt-1">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Threat Tags list */}
                <div className="flex flex-wrap gap-1.5">
                  {report.tags?.map((tag, i) => (
                    <span key={i} className="bg-vt-border/40 text-vt-text-muted text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded flex items-center gap-1 border border-vt-border/30">
                      <Tag className="w-2.5 h-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Upvote & Downvote community count simulation */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs text-vt-text-muted font-semibold">Community Reputation:</span>
                  
                  <div className="inline-flex rounded-xl overflow-hidden border border-vt-border bg-[#0a0f24] p-1 gap-1">
                    <button 
                      onClick={() => handleVote('up')}
                      className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold transition-all rounded-lg cursor-pointer ${
                        userVote === 'up' 
                          ? 'bg-vt-success text-white shadow-[0_0_12px_rgba(0,177,89,0.35)] scale-105' 
                          : 'text-[#8c9ebf] hover:text-white hover:bg-vt-border/40'
                      }`}
                      title={userVote === 'up' ? "Click to retract vote" : "Vote as Clean/Harmless"}
                    >
                      {userVote === 'up' ? <Check className="w-3.5 h-3.5 text-white stroke-[3px]" /> : <ThumbsUp className="w-3.5 h-3.5 text-vt-success" />}
                      <span>Harmless</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono leading-none ${userVote === 'up' ? 'bg-white/25 text-white' : 'bg-vt-border/80 text-vt-text-muted'}`}>{harmlessCount}</span>
                    </button>

                    <button 
                      onClick={() => handleVote('down')}
                      className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold transition-all rounded-lg cursor-pointer ${
                        userVote === 'down' 
                          ? 'bg-vt-danger text-white shadow-[0_0_12px_rgba(255,59,48,0.35)] scale-105' 
                          : 'text-[#8c9ebf] hover:text-white hover:bg-vt-border/40'
                      }`}
                      title={userVote === 'down' ? "Click to retract vote" : "Vote as Malicious"}
                    >
                      {userVote === 'down' ? <Check className="w-3.5 h-3.5 text-white stroke-[3px]" /> : <ThumbsDown className="w-3.5 h-3.5 text-vt-danger" />}
                      <span>Malicious</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono leading-none ${userVote === 'down' ? 'bg-white/25 text-white' : 'bg-vt-border/80 text-vt-text-muted'}`}>{maliciousCount}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Clear visual feedback response when user votes */}
              {voteFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className={`flex items-center gap-2 text-xs p-2.5 rounded-lg border ml-auto w-full sm:w-auto text-right justify-end font-semibold ${
                    userVote === 'up'
                      ? 'bg-vt-success/10 border-vt-success/25 text-vt-success'
                      : userVote === 'down'
                        ? 'bg-vt-danger/10 border-vt-danger/25 text-vt-danger'
                        : 'bg-vt-primary/10 border-vt-primary/25 text-vt-primary'
                  }`}
                >
                  {userVote === 'up' ? (
                    <span className="w-2 h-2 rounded-full bg-vt-success animate-ping shrink-0" />
                  ) : userVote === 'down' ? (
                    <span className="w-2 h-2 rounded-full bg-vt-danger animate-ping shrink-0" />
                  ) : null}
                  <span>{voteFeedback}</span>
                </motion.div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Main Tab Switchers */}
      <div className="flex border-b border-vt-border">
        {['detection', 'details', 'community'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`py-3 px-6 font-bold text-xs tracking-wider border-b-2 transition-all uppercase cursor-pointer ${
              activeTab === tab
                ? 'border-vt-primary text-white bg-vt-primary/5'
                : 'border-transparent text-vt-text-muted hover:text-white hover:bg-white/5'
            }`}
          >
            {tab === 'community' ? `COMMUNITY (${comments.length})` : tab}
          </button>
        ))}
      </div>

      {/* Dynamic Tab Contents */}
      <div className="min-h-[400px]">
        {activeTab === 'detection' ? (
          <div className="space-y-4">
            
            {/* Table layout filter & search utilities shelf */}
            <div className="flex flex-col md:flex-row gap-3 justify-between items-center bg-[#070b1b] p-4 rounded-xl border border-vt-border/50">
              
              {/* Search specific security antivir vendor names */}
              <div className="relative w-full md:w-80">
                <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-vt-text-muted">
                  <Search className="w-4 h-4" />
                </span>
                <input 
                  type="text" 
                  placeholder="Search vendor rules or signature results..."
                  value={vendorSearch}
                  onChange={(e) => setVendorSearch(e.target.value)}
                  className="w-full bg-[#121c3e] border border-vt-border/80 text-xs rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-vt-primary focus:ring-1 focus:ring-vt-primary/40 placeholder-vt-text-muted/60"
                />
              </div>

              {/* Interactive tag filters */}
              <div className="flex gap-1.5 w-full md:w-auto">
                {[
                  { id: 'all', label: 'All Engines', count: Object.keys(report.scans).length },
                  { id: 'malicious', label: 'Detections', count: report.positives },
                  { id: 'clean', label: 'Undetected / Clean', count: report.totalVendors - report.positives },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setVendorFilter(item.id as any)}
                    className={`flex-1 md:flex-initial text-[11px] font-semibold py-1.5 px-3.5 rounded-lg border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      vendorFilter === item.id 
                        ? 'bg-vt-primary/20 border-vt-primary text-white font-bold' 
                        : 'bg-[#121c3e] border-vt-border/60 text-vt-text-muted hover:text-white'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="bg-[#070b1b] text-white px-1.5 py-0.5 rounded-md font-mono text-[9px]">
                      {item.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* List block of antivirus systems engines */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {filteredVendors.length > 0 ? (
                filteredVendors.map((item) => {
                  const isPositive = item.category === 'malicious' || item.category === 'suspicious';
                  
                  return (
                    <div 
                      key={item.vendor} 
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all hover:bg-vt-card-hover/40 ${
                        isPositive 
                          ? 'bg-[#291419] border-vt-danger/35 hover:bg-[#34181f]/70' 
                          : 'bg-[#0d1430] border-vt-border/40'
                      }`}
                    >
                      <div className="flex flex-col pr-2">
                        <span className="text-[12px] font-bold text-white tracking-wide">
                          {item.vendor}
                        </span>
                        <span className={`text-[10px] font-mono mt-0.5 max-w-[170px] truncate ${
                          isPositive ? 'text-vt-danger font-semibold' : 'text-vt-text-muted/60'
                        }`}>
                          {item.result || 'Undetected'}
                        </span>
                      </div>

                      {/* Right engine category status tick or cross */}
                      <div>
                        {isPositive ? (
                          <span className="bg-vt-danger bg-opacity-15 border border-vt-danger/30 text-vt-danger font-bold text-[9px] tracking-wide px-2 py-1 rounded flex items-center gap-1 font-mono">
                            <ShieldAlert className="w-3 h-3 shrink-0" />
                            DETECTION
                          </span>
                        ) : (
                          <span className="bg-vt-success bg-opacity-10 border border-vt-success/20 text-vt-success font-semibold text-[9px] px-2 py-1 rounded flex items-center gap-1 font-mono">
                            <CheckCircle2 className="w-3 h-3 shrink-0" />
                            CLEAN
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12 text-vt-text-muted text-xs border border-dashed border-vt-border/50 rounded-xl">
                  No scan engines matched search parameter &quot;{vendorSearch}&quot;.
                </div>
              )}
            </div>

          </div>
        ) : activeTab === 'details' ? (
          <div className="space-y-6">
            
            {/* Technology expanded details panel file */}
            <div className="bg-[#121c3e] border border-vt-border rounded-xl p-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-vt-border/60 pb-2 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-vt-primary rounded" />
                  Basic File Hashes & Information
                </h3>
                <div className="space-y-3.5 text-xs text-vt-text-muted">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-1 md:gap-4 items-baseline border-b border-vt-border/30 pb-2">
                    <span className="md:col-span-3 text-white font-semibold">MD5 Hash</span>
                    <span className="md:col-span-9 font-mono text-[11px] select-all tracking-wide text-white">{report.md5}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-1 md:gap-4 items-baseline border-b border-vt-border/30 pb-2">
                    <span className="md:col-span-3 text-white font-semibold">SHA-1 Hash</span>
                    <span className="md:col-span-9 font-mono text-[11px] select-all tracking-wide text-white">{report.sha1}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-1 md:gap-4 items-baseline border-b border-vt-border/30 pb-2">
                    <span className="md:col-span-3 text-white font-semibold">SHA-256 Hash</span>
                    <span className="md:col-span-9 font-mono text-[11px] select-all tracking-wide text-white">{report.sha256}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-1 md:gap-4 items-baseline">
                    <span className="md:col-span-3 text-white font-semibold">File Types Analyzed</span>
                    <span className="md:col-span-9 text-white font-mono">{report.fileType || "URL Web Link Linkage"}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-vt-border/60 pb-2 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-vt-primary rounded" />
                  Analyzed History (Time Frame)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-center">
                  <div className="p-4 bg-[#0a0f24] rounded-lg border border-vt-border/40">
                    <span className="text-vt-text-muted block text-[10px] uppercase font-bold tracking-wider mb-1">First Scanned</span>
                    <span className="text-white font-mono text-[12px]">{report.history?.firstSeen || 'Today'}</span>
                  </div>
                  <div className="p-4 bg-[#0a0f24] rounded-lg border border-vt-border/40">
                    <span className="text-vt-text-muted block text-[10px] uppercase font-bold tracking-wider mb-1">Last Re-scanned</span>
                    <span className="text-white font-mono text-[12px]">{report.history?.lastSeen || 'Today'}</span>
                  </div>
                  <div className="p-4 bg-[#0a0f24] rounded-lg border border-vt-border/40">
                    <span className="text-vt-text-muted block text-[10px] uppercase font-bold tracking-wider mb-1">Last Engine Analysis</span>
                    <span className="text-white font-mono text-[12px]">{report.history?.lastAnalysis || 'Just Now'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-vt-border/60 pb-2 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-vt-primary rounded" />
                  Portable Executable Header Information & Sections (Simulated)
                </h3>
                <p className="text-xs text-vt-text-muted leading-relaxed mb-3">
                  VirusTotal inspects and dissects binary sections within Portable Executable files to detect potential buffer overruns or abnormal segment name packings.
                </p>
                
                <div className="font-mono text-[11px] bg-[#070b1b] border border-vt-border text-slate-300 p-4 rounded-lg overflow-x-auto space-y-1">
                  <div>Entrypoint Source: <span className="text-green-400">0x0040182C (.text)</span></div>
                  <div>Base of Code: 0x00401000</div>
                  <div>Image Base: 0x00400000</div>
                  <div>Number of Sections: 4 (.text, .rdata, .data, .rsrc)</div>
                  <div className="text-vt-text-muted mt-2">----------------------------------------------------</div>
                  <div className="text-white font-bold text-xs mt-1">PE Sections Metadata details:</div>
                  <div>• .text  | Size: 41,216 Bytes | Entropy: 6.25 (Packed alert: Low)</div>
                  <div>• .rdata | Size: 12,044 Bytes | Entropy: 4.88 (Packed alert: Clean)</div>
                  <div>• .data  | Size:  4,096 Bytes | Entropy: 1.12 (Packed alert: Clean)</div>
                  <div>• .rsrc  | Size:  2,100 Bytes | Entropy: 3.44 (Packed alert: Clean)</div>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Community Feed / Interactive Discussion Thread */}
            <div className="bg-[#121c3e] border border-vt-border rounded-xl p-6">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <MessageCircle className="text-vt-primary w-4 h-4" />
                Expert Analyst Comments ({comments.length})
              </h3>

              {/* Add Comment element */}
              <form onSubmit={handleCommentSubmit} className="space-y-3 mb-6">
                <textarea
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Share details of this artifact? Help the security community by noting hashes, behavior details, sandbox trace logs or file sources..."
                  rows={4}
                  className="w-full bg-[#0a0f24] border border-vt-border/80 text-xs rounded-xl p-3.5 text-white focus:outline-none focus:border-vt-primary focus:ring-1 focus:ring-vt-primary/40 placeholder-vt-text-muted/60 leading-relaxed"
                />
                <div className="flex justify-between items-center">
                  <div className="text-[10px] text-vt-text-muted flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-vt-primary" />
                    Supports custom markdown and hash signatures layout.
                  </div>
                  <button
                    type="submit"
                    className="bg-vt-primary hover:bg-vt-primary-hover text-white text-[11px] font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all uppercase cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Post Comment
                  </button>
                </div>
              </form>

              {/* Comments Feed List */}
              <div className="space-y-4">
                {comments.map((item) => (
                  <div key={item.id} className="bg-[#0a0f24] border border-vt-border/60 rounded-lg p-4 space-y-3 hover:border-vt-border transition-all">
                    
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {/* Circular Avatar design */}
                        <div className="w-8 h-8 rounded-full bg-vt-primary/15 border border-vt-primary/30 flex items-center justify-center font-bold text-xs text-vt-primary">
                          {item.author.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">
                            {item.author === "you_security_analyst" ? "You (Security Analyst)" : item.author}
                            {item.isStaff && (
                              <span className="ml-2 bg-vt-primary/20 text-vt-primary text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-normal">
                                STAFF
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] text-vt-text-muted block mt-0.5">
                            posted {item.createdAt}
                          </span>
                        </div>
                      </div>

                      {/* Vote comment index */}
                      <button 
                        onClick={() => voteComment(item.id)}
                        className="bg-[#121c40] border border-vt-border/75 text-vt-text-muted hover:text-white px-2.5 py-1 rounded text-[10px] flex items-center gap-1 hover:bg-vt-border transition-all font-semibold"
                      >
                        <ThumbsUp className="w-3 h-3 text-vt-primary" />
                        <span>+{item.votes}</span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line border-t border-vt-border/30 pt-2">
                      {item.content}
                    </p>

                  </div>
                ))}
              </div>

            </div>

          </div>
        )}
      </div>

    </div>
  );
}
