export interface VendorScan {
  vendor: string;
  category: 'malicious' | 'suspicious' | 'clean' | 'undetected' | 'type-unsupported';
  result: string | null; // e.g. "Trojan.Generic", "Malware", null
  update: string; // date of engine update
}

export interface SecurityReport {
  id: string; // SHA-256 hash or simulated ID
  type: 'file' | 'url' | 'search';
  name: string; // file name or URL searched or search query
  sha256?: string;
  sha1?: string;
  md5?: string;
  size?: number; // size in bytes
  fileType?: string; // e.g. "Executable (EXE)", "Text (plain)", "PDF Document"
  target?: string; // for URLs
  reputation: number; // votes/karma
  positives: number; // count of malicious engines
  totalVendors: number; // e.g. 74
  scanDate: string;
  scans: Record<string, VendorScan>;
  votedMalicious: number;
  votedHarmless: number;
  tags?: string[];
  history?: {
    firstSeen?: string;
    lastSeen?: string;
    lastAnalysis?: string;
  };
}

export interface UserComment {
  id: string;
  author: string;
  avatarUrl?: string;
  isStaff?: boolean;
  content: string;
  createdAt: string;
  votes: number;
}
