import { SecurityReport, VendorScan } from './types';

// Standard VirusTotal Engines
export const SEC_VENDORS = [
  "Acronis", "Ad-Aware", "AhnLab-V3", "Alibaba", "ALYac", "Antiy-AVL", 
  "Apex (Cylance)", "Avast", "AVG", "Avira (no cloud)", "Baidu", 
  "BitDefender", "BitDefenderTheta", "Bkav", "CAT-QuickHeal", "ClamAV", 
  "CMC", "Comodo", "CrowdStrike Apex", "Cybereason", "Cynet", "Cyren", 
  "DrWeb", "Elastic", "Emsisoft", "eScan", "ESET-NOD32", "F-Secure", 
  "FireEye", "Fortinet", "GData", "Gridinsoft", "Jiangmin", "K7AntiVirus", 
  "Kaspersky", "Kingsoft", "Malwarebytes", "MaxSecure", "McAfee", 
  "Microsoft", "NANO-Antivirus", "Palo Alto Networks", "Panda", 
  "Qihoo-360", "Rising", "Sangfor", "SentinelOne", "Sophos", 
  "Symantec", "Tencent", "Trustlook", "VBA32", "VIPRE", "ViRobot", 
  "Webroot", "Yandex", "Zillya", "ZoneAlarm by Check Point"
];

// Helper to compute actual SHA-256 of a file block
export async function calculateSHA256(file: File): Promise<string> {
  try {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    console.error("Error calculating hash:", err);
    // Return a beautiful dynamic mockup hash if crypto fails
    return Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }
}

// Generate MD5 / SHA-1 from content or randomly
export function generateMD5(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${hex}${hex}${hex}${hex}`.substring(0, 32);
}

export function generateSHA1(seed: string): string {
  let hash = 0;
  for (let i = seed.length - 1; i >= 0; i--) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${hex}${hex}${hex}${hex}${hex}`.substring(0, 40);
}

// Simple helper to judge file suspiciousness
export function evaluateThreatScore(name: string, size?: number, isUrl = false): { positives: number, isExecutable: boolean, detectedNames: string[] } {
  const norm = name.toLowerCase();
  let weight = 0;
  let isExecutable = false;
  const detectedNames: string[] = [];

  if (isUrl) {
    if (norm.includes('malware') || norm.includes('phishing') || norm.includes('hack') || norm.includes('crack') || norm.includes('suspicious') || norm.includes('freebitcoins')) {
      weight = Math.floor(Math.random() * 15) + 12; // 12 to 26 detections
      detectedNames.push("Phishing.Site", "Malicious.URL", "Blacklisted.Domain");
    } else if (norm.includes('test') || norm.includes('demo') || norm.includes('xyz') || norm.includes('temp')) {
      weight = Math.floor(Math.random() * 4) + 1; // 1 to 5 detections
      detectedNames.push("Unsafe.URL.Heuristic");
    }
  } else {
    // Files
    const extensions = ['.exe', '.dmg', '.pkg', '.scr', '.bat', '.cmd', '.vbs', '.js', '.sh', '.bin', '.dll'];
    const hasExecutableExtension = extensions.some(ext => norm.endsWith(ext));
    
    if (hasExecutableExtension) {
      isExecutable = true;
    }

    if (norm.includes('virus') || norm.includes('malware') || norm.includes('trojan') || norm.includes('ransomware') || norm.includes('keylogger')) {
      weight = Math.floor(Math.random() * 20) + 38; // Heavy malicious: 38 to 58 detections
      detectedNames.push("Trojan.Win32.Generic", "HEUR/Active.Malware", "Malware.Agent.CRX");
    } else if (isExecutable) {
      // Executables have a natural chance of positive triggers to make simulation fun!
      const randomSeed = Math.random();
      if (randomSeed > 0.7) {
        weight = Math.floor(Math.random() * 8) + 2; // Low heuristic alert: 2 to 10
        detectedNames.push("Gen:Variant.Adware", "Heur.Suspicious.File");
      }
    } else if (size && size > 100 * 1024 * 1024) { // Large file size triggers heur
      weight = Math.floor(Math.random() * 2) + 1;
      detectedNames.push("Riskware.LargeCompressed");
    }
  }

  return { positives: weight, isExecutable, detectedNames };
}

// Build a dynamic security report
export function createSimulatedReport(name: string, type: 'file' | 'url' | 'search', size?: number, hashOverride?: string): SecurityReport {
  const seed = hashOverride || name + (size || 0);
  const sha256 = hashOverride || generateSHA1(seed + "sha256") + generateSHA1(seed + "sha256").substring(0, 24);
  const sha1 = generateSHA1(seed);
  const md5 = generateMD5(seed);
  
  const isUrl = type === 'url';
  const { positives, isExecutable, detectedNames } = evaluateThreatScore(name, size, isUrl);
  
  const scanDate = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const totalVendors = SEC_VENDORS.length;
  
  // Decide which random vendors flag it if positive > 0
  const alertedVendors = new Set<string>();
  if (positives > 0) {
    const shuffled = [...SEC_VENDORS].sort(() => 0.5 - Math.random());
    for (let i = 0; i < positives && i < shuffled.length; i++) {
      alertedVendors.add(shuffled[i]);
    }
  }

  const scans: Record<string, VendorScan> = {};
  
  SEC_VENDORS.forEach(vendor => {
    const isAlert = alertedVendors.has(vendor);
    let category: 'clean' | 'undetected' | 'malicious' | 'suspicious' = 'undetected';
    let result: string | null = null;

    if (isAlert) {
      const isSuspicious = Math.random() > 0.85;
      category = isSuspicious ? 'suspicious' : 'malicious';
      
      // select malware signature label
      const baseLabel = detectedNames[Math.floor(Math.random() * detectedNames.length)] || "Trojan.Generic";
      result = isSuspicious ? "Heur.Suspicious" : baseLabel;
    } else {
      // mostly undetected or clean (let's split 60/40)
      category = Math.random() > 0.4 ? 'undetected' : 'clean';
    }

    const todayStr = new Date().toISOString().substring(0, 10);

    scans[vendor] = {
      vendor,
      category,
      result,
      update: todayStr
    };
  });

  // Calculate file type label
  let fileTypeLabel = "Plain text document (TXT)";
  if (type === 'file') {
    const norm = name.toLowerCase();
    if (norm.endsWith('.exe')) fileTypeLabel = "Win32 Executable (EXE)";
    else if (norm.endsWith('.dmg')) fileTypeLabel = "Apple Disk Image (DMG)";
    else if (norm.endsWith('.zip')) fileTypeLabel = "ZIP Compressed Archive";
    else if (norm.endsWith('.tar.gz') || norm.endsWith('.tgz')) fileTypeLabel = "Gzipped Tar Archive";
    else if (norm.endsWith('.pdf')) fileTypeLabel = "Adobe Portable Document Format (PDF)";
    else if (norm.endsWith('.png') || norm.endsWith('.jpg') || norm.endsWith('.jpeg')) fileTypeLabel = "Image Media File";
    else if (norm.endsWith('.json')) fileTypeLabel = "JSON Data Format";
    else if (norm.endsWith('.docx') || norm.endsWith('.doc')) fileTypeLabel = "Microsoft Word Document";
    else if (isExecutable) fileTypeLabel = "Executable Script Binary";
  }

  // Tags
  const tags: string[] = [type];
  if (isExecutable) tags.push('peexe', 'executable', 'windows');
  if (positives > 0) tags.push('malware', 'suspicious');
  else tags.push('clean', 'harmless');

  // Reputation votes
  const votedHarmless = positives > 20 ? Math.floor(Math.random() * 5) : Math.floor(Math.random() * 150) + 40;
  const votedMalicious = positives > 20 ? Math.floor(Math.random() * 450) + 120 : Math.floor(Math.random() * 4);

  return {
    id: sha256,
    type,
    name,
    sha256,
    sha1,
    md5,
    size,
    fileType: fileTypeLabel,
    reputation: votedHarmless - votedMalicious,
    positives,
    totalVendors,
    scanDate,
    scans,
    votedMalicious,
    votedHarmless,
    tags,
    history: {
      firstSeen: new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
      lastSeen: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString().split('T')[0],
      lastAnalysis: new Date().toISOString().split('T')[0]
    }
  };
}

// Formatting size
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
