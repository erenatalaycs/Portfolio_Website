// src/content/attack-techniques.ts
//
// Hand-curated subset of MITRE ATT&CK Enterprise. Keys are technique IDs
// (or sub-technique IDs as e.g. "T1218.010"); values are canonical names
// as published at https://attack.mitre.org/techniques/enterprise/.
//
// Phase 3 seeds ~15 techniques covering the 3 D-17 write-ups + a few
// common neighbours so the Plan 06 authoring sprint doesn't trip Pitfall 8
// (write-up frontmatter referencing an id missing from this map).
//
// Add new entries as future write-ups reference techniques. The parity
// audit (Plan 03-07) does NOT enforce coverage — it's a soft fail (the
// ProvenanceFooter renders "(unknown technique — add to attack-techniques.ts)"
// for misses, which is recruiter-visible — author discipline is the gate.
//
// Source: https://attack.mitre.org/techniques/enterprise/
//         03-RESEARCH.md Pattern 10c; 03-RESEARCH.md Pitfall 8

export const ATTACK_TECHNIQUES: Record<string, string> = {
  // Detection write-up (LOLBins + Sigma + Splunk)
  T1140: 'Deobfuscate/Decode Files or Information',
  T1105: 'Ingress Tool Transfer',
  'T1218.010': 'System Binary Proxy Execution: Regsvr32',
  'T1218.005': 'System Binary Proxy Execution: Mshta',
  'T1218.011': 'System Binary Proxy Execution: Rundll32',
  // CTI write-up (sample → ATT&CK)
  'T1059.001': 'Command and Scripting Interpreter: PowerShell',
  'T1059.003': 'Command and Scripting Interpreter: Windows Command Shell',
  T1027: 'Obfuscated Files or Information',
  T1071: 'Application Layer Protocol',
  // Web Auth write-up (JWT alg confusion)
  T1190: 'Exploit Public-Facing Application',
  T1078: 'Valid Accounts',
  T1212: 'Exploitation for Credential Access',
  // Common neighbours for future growth
  T1566: 'Phishing',
  T1083: 'File and Directory Discovery',
  T1041: 'Exfiltration Over C2 Channel',
};
