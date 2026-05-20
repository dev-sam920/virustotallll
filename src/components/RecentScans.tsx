import React from 'react';
import { ShieldCheck, ShieldAlert, Clock, ChevronRight, Activity, ArrowRight, UserCheck } from 'lucide-react';
import { SecurityReport } from '../types';
import { createSimulatedReport } from '../utils';

interface RecentScansProps {
  onSelectScannedReport: (report: SecurityReport) => void;
}

export default function RecentScans({ onSelectScannedReport }: RecentScansProps) {
  // Pre-configured typical indicators so user can click to view a high quality scan results!
  const mockDemos = [
    {
      name: "eicar_test_antivirus_payload.zip",
      type: "file" as const,
      size: 44,
      desc: "Antivirus Standard Test Signature",
      label: "EICAR Test Block"
    },
    {
      name: "chrome_setup_installer.exe",
      type: "file" as const,
      size: 3845912,
      desc: "Verified Google Chrome Web Installer",
      label: "Safe PE Executable"
    },
    {
      name: "https://secure-login-paypal-verification.net/update",
      type: "url" as const,
      desc: "Reported credential harvest landing site",
      label: "Active Phishing Campaign"
    },
    {
      name: "193.56.28.11",
      type: "search" as const,
      desc: "Malicious payload host C2 server back-connect link",
      label: "Command & Control IP Host"
    },
    {
      name: "8.8.8.8",
      type: "search" as const,
      desc: "Google Public Anycast Resolver",
      label: "Safe System IP (Google DNS)"
    }
  ];

  const handleDemoClick = (item: typeof mockDemos[number]) => {
    // Generate simulated reports immediately
    const report = createSimulatedReport(item.name, item.type, item.size);
    onSelectScannedReport(report);
  };

  return (
    <div id="recent-scans-panel" className="max-w-4xl mx-auto mt-12 px-4 pb-12">
      <div className="flex items-center gap-2 mb-4 border-b border-vt-border/40 pb-2">
        <Activity className="w-5 h-5 text-vt-primary" />
        <h2 className="text-sm font-extrabold tracking-widest text-[#8c9ebf] uppercase">
          Simulated Security Intel Logs (Preloaded Samples)
        </h2>
      </div>

      <p className="text-xs text-vt-text-muted/80 mb-4 bg-vt-primary bg-opacity-5 p-3 rounded-lg border border-vt-primary/15 leading-relaxed">
        💡 **Sandbox Demo Tip:** Click any of the preloaded security threat indicators below to view its corresponding VirusTotal scan report immediately. You can view detections, details, and comment threads.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {mockDemos.map((item, index) => {
          // precalculate verdict look
          const isMalicious = item.name.includes('eicar') || item.name.includes('paypal') || item.name.includes('193.56');
          
          return (
            <button
              key={index}
              onClick={() => handleDemoClick(item)}
              className="text-left bg-[#121c3e] border border-vt-border/60 rounded-xl p-4 hover:border-vt-primary hover:bg-vt-card-hover transition-all flex items-center justify-between group cursor-pointer focus:outline-none"
            >
              <div className="space-y-1.5 flex-1 pr-4 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                    isMalicious 
                      ? 'bg-vt-danger/10 text-vt-danger border border-vt-danger/15' 
                      : 'bg-vt-success/15 text-vt-success border border-vt-success/25'
                  }`}>
                    {isMalicious ? "Threat Pending" : "Safe Zone"}
                  </span>
                  <span className="text-[10px] text-vt-text-muted uppercase tracking-wider font-mono">
                    {item.type}
                  </span>
                </div>
                
                <h4 className="text-xs font-bold text-white font-mono truncate">
                  {item.name}
                </h4>
                
                <p className="text-[11px] text-vt-text-muted truncate">
                  {item.desc}
                </p>
              </div>

              <div className="shrink-0 w-8 h-8 rounded-full bg-[#0a0f24] group-hover:bg-vt-primary/20 flex items-center justify-center text-vt-text-muted group-hover:text-white transition-all">
                <ChevronRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
