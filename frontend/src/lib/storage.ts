import { InvestigationThread, UploadedFileRecord, ThreatReport } from '../types/api';

const STORAGE_KEY_THREADS = 'cyberguard_threads_v1';
const STORAGE_KEY_FILES = 'cyberguard_files_v1';
const FILE_CONTENTS_CACHE = new Map<string, string>();

export const INITIAL_REPORTS: ThreatReport[] = [
  {
    id: 'rep-1',
    filename: 'ransomware-spotlight-lockbit.json',
    title: 'Ransomware Spotlight: LockBit 3.0 (Black)',
    type: 'JSON',
    threatActor: 'LockBit Supporter / Bitwise Spider',
    malwareFamily: 'LockBit',
    date: '2024-03-12',
    summary: 'Comprehensive analysis of LockBit 3.0 ransomware-as-a-service (RaaS) operations, StealBit exfiltration tool pairing, anti-analysis routines, and VMware ESXi / Linux encryption capabilities.',
    content: JSON.stringify(
      {
        threat: {
          name: "LockBit",
          alias: ["LockBit 3.0", "LockBit Black", "ABCD Ransomware"],
          family: "Ransomware-as-a-Service (RaaS)",
          first_observed: "September 2019",
          active_status: "High",
          ransom_note: "Restore-My-Files.txt"
        },
        tactics: {
          initial_access: [
            "T1190 - Exploit Public-Facing Application",
            "T1078 - Valid Accounts via Initial Access Brokers",
            "T1566 - Phishing"
          ],
          execution: [
            "T1059.001 - PowerShell scripts",
            "T1047 - Windows Management Instrumentation (WMI)"
          ],
          defense_evasion: [
            "T1562.001 - Impair Defenses: Disable Windows Defender",
            "T1027 - Obfuscated Files or Information"
          ],
          exfiltration: [
            "T1048 - Exfiltration Over Alternative Protocol using StealBit tool"
          ],
          impact: [
            "T1486 - Data Encrypted for Impact (ChaCha20 + Curve25519)"
          ]
        },
        associated_tools: [
          {
            name: "StealBit",
            purpose: "Custom exfiltration tool designed specifically for LockBit affiliates to rapidly exfiltrate sensitive files prior to encryption."
          }
        ],
        targeted_platforms: [
          "Microsoft Windows",
          "VMware ESXi",
          "Linux"
        ],
        iocs: {
          hashes_sha256: [
            "d6d333ad9b9e61c57e8fa176fb974cfc70b8098ffb4d2427a1f280a562089a8e",
            "ef2e28328c0b5e40e6c27e8a9f6d7c71d6092d6e3c0b118b6a1e8a8b8a9c1e7a"
          ],
          c2_domains: [
            "lockbitsupp[.]xyz",
            "decryptersupport[.]top"
          ]
        }
      },
      null,
      2
    )
  },
  {
    id: 'rep-2',
    filename: '3am-ransomware-lockbit.json',
    title: '3AM Ransomware & LockBit Fallback Operation',
    type: 'JSON',
    threatActor: 'Unknown Affiliate / LockBit affiliate overlap',
    malwareFamily: '3AM Ransomware',
    date: '2024-04-05',
    summary: 'Analysis of novel 3AM ransomware strain deployed as a secondary fallback payload when LockBit execution was blocked by EDR on enterprise endpoints.',
    content: JSON.stringify(
      {
        threat: {
          name: "3AM Ransomware",
          discovered: "Late 2023",
          behavior: "Contingency ransomware deployed when primary LockBit deployment fails",
          encryption: "Salsa20 with RSA-2048 key exchange"
        },
        execution_chain: {
          stage_1: "Cobalt Strike beaconing",
          stage_2: "Attempted LockBit deployment (thwarted by automated EDR containment)",
          stage_3: "Fallback invocation of 3AM 64-bit payload via cmd.exe"
        },
        distinguishing_markers: {
          ransom_note_pattern: "readme.txt with standard .3am extension appended to files",
          volume_shadow_deletion: "vssadmin delete shadows /all /quiet"
        }
      },
      null,
      2
    )
  }
];

export const INITIAL_THREADS: InvestigationThread[] = [
  {
    id: 'thread-lockbit-overview',
    title: 'What is LockBit?',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3.8).toISOString(),
    confidence: 'HIGH',
    evidenceUsed: true,
    retryCount: 0,
    messages: [
      {
        id: 'msg-u1',
        role: 'user',
        content: 'What is LockBit?',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString()
      },
      {
        id: 'msg-a1',
        role: 'assistant',
        content:
          'LockBit is one of the most prolific Ransomware-as-a-Service (RaaS) operations in modern cyber threat history, first observed in September 2019 (initially operating as "ABCD" ransomware). Under the RaaS business model, core developers maintain the ransomware encryptors, management dashboards, and negotiation portals, while recruiting external affiliates who conduct initial network compromise and lateral movement.\n\nLockBit encryptors are engineered for rapid multi-threaded execution across enterprise environments, utilizing ChaCha20 and AES encryption routines. Variants including LockBit 2.0 (Red) and LockBit 3.0 (Black) extended operations beyond Windows to target Linux systems and VMware ESXi hypervisors. Affiliates frequently pair LockBit with StealBit, a bespoke exfiltration utility, to execute double-extortion schemes by publishing exfiltrated data on dedicated leak portals if ransoms are not remitted.',
        timestamp: new Date(Date.now() - 3600000 * 3.8).toISOString(),
        response: {
          query: 'What is LockBit?',
          answer:
            'LockBit is one of the most prolific Ransomware-as-a-Service (RaaS) operations in modern cyber threat history, first observed in September 2019 (initially operating as "ABCD" ransomware). Under the RaaS business model, core developers maintain the ransomware encryptors, management dashboards, and negotiation portals, while recruiting external affiliates who conduct initial network compromise and lateral movement.\n\nLockBit encryptors are engineered for rapid multi-threaded execution across enterprise environments, utilizing ChaCha20 and AES encryption routines. Variants including LockBit 2.0 (Red) and LockBit 3.0 (Black) extended operations beyond Windows to target Linux systems and VMware ESXi hypervisors. Affiliates frequently pair LockBit with StealBit, a bespoke exfiltration utility, to execute double-extortion schemes by publishing exfiltrated data on dedicated leak portals if ransoms are not remitted.',
          used_fallback: false,
          evidence_used: true,
          confidence: 'HIGH',
          confidence_reason: 'Evidence sufficiently covers the origin, architecture, operational model, and tooling of LockBit from indexed CTI documents.',
          reasoning: {
            sufficient: true,
            coverage: 'high',
            consistency: 'consistent',
            missing_information: [],
            conflicts: [],
            unsupported_claims: [],
            reason: 'Vector retrieval returned verified spotlight intelligence matching LockBit operational lineage and encryptor mechanics.'
          },
          retry_count: 0,
          correction_exhausted: false,
          timing: {
            retrieval_seconds: 0.38,
            answer_generation_seconds: 1.12,
            total_seconds: 1.50
          },
          retrieval: {
            intent: 'THREAT_OVERVIEW',
            expanded_query: 'LockBit ransomware history RaaS affiliates encryption tactics StealBit',
            used_fallback: false,
            documents: [
              {
                id: 'doc-lockbit-spotlight-1',
                filename: 'ransomware-spotlight-lockbit.json',
                source: 'Qdrant Vector CTI Collection',
                excerpt: 'LockBit uses a ransomware-as-a-service model where core operators recruit affiliates to deploy payloads. LockBit 3.0 Black introduced modular architecture and bug bounty programs.',
                score: 0.94
              },
              {
                id: 'doc-lockbit-spotlight-2',
                filename: 'ransomware-spotlight-lockbit.json',
                source: 'Qdrant Vector CTI Collection',
                excerpt: 'Targets include Windows, Linux, and VMware ESXi servers. Exfiltration is handled via StealBit tool to execute double extortion.',
                score: 0.89
              }
            ],
            graph: [
              {
                source: 'LockBit',
                relation: 'uses',
                target: 'StealBit',
                type: 'TOOL_RELATION'
              },
              {
                source: 'LockBit',
                relation: 'targets',
                target: 'ESXi',
                type: 'PLATFORM_TARGET'
              },
              {
                source: 'LockBit',
                relation: 'recruits',
                target: 'Affiliates',
                type: 'ORGANIZATION'
              }
            ]
          }
        }
      }
    ]
  },
  {
    id: 'thread-stealbit-relation',
    title: 'LockBit and StealBit relationship',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1.9).toISOString(),
    confidence: 'HIGH',
    evidenceUsed: true,
    retryCount: 0,
    messages: [
      {
        id: 'msg-u2',
        role: 'user',
        content: 'Explain the relationship between LockBit and StealBit.',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'msg-a2',
        role: 'assistant',
        content:
          'StealBit is a proprietary data exfiltration tool developed directly by the LockBit gang and distributed exclusively to vetted LockBit affiliates.\n\nWhile LockBit serves as the encryption payload designed to lock victims\' systems, StealBit executes the preceding stage of double extortion: rapidly identifying, compressing, and siphoning sensitive documents out of the target environment to operator-controlled storage before the ransomware detonates. By providing StealBit alongside LockBit, the operators streamline the double-extortion pipeline for their affiliates.',
        timestamp: new Date(Date.now() - 3600000 * 1.9).toISOString(),
        response: {
          query: 'Explain the relationship between LockBit and StealBit.',
          answer:
            'StealBit is a proprietary data exfiltration tool developed directly by the LockBit gang and distributed exclusively to vetted LockBit affiliates.\n\nWhile LockBit serves as the encryption payload designed to lock victims\' systems, StealBit executes the preceding stage of double extortion: rapidly identifying, compressing, and siphoning sensitive documents out of the target environment to operator-controlled storage before the ransomware detonates. By providing StealBit alongside LockBit, the operators streamline the double-extortion pipeline for their affiliates.',
          used_fallback: false,
          evidence_used: true,
          confidence: 'HIGH',
          confidence_reason: 'Direct tool relationship corroborated across threat spotlight reports and graph ontology.',
          reasoning: {
            sufficient: true,
            coverage: 'high',
            consistency: 'consistent',
            missing_information: [],
            conflicts: [],
            unsupported_claims: [],
            reason: 'Tool affiliation confirmed in primary evidence.'
          },
          retry_count: 0,
          correction_exhausted: false,
          timing: {
            retrieval_seconds: 0.29,
            answer_generation_seconds: 0.95,
            total_seconds: 1.24
          },
          retrieval: {
            intent: 'RELATIONSHIP_ANALYSIS',
            expanded_query: 'StealBit exfiltration LockBit affiliate pairing double extortion',
            used_fallback: false,
            documents: [
              {
                id: 'doc-stealbit-rel-1',
                filename: 'ransomware-spotlight-lockbit.json',
                source: 'Qdrant Vector CTI Collection',
                excerpt: 'Associated tools: StealBit. Custom exfiltration tool designed specifically for LockBit affiliates to rapidly exfiltrate sensitive files prior to encryption.',
                score: 0.96
              }
            ],
            graph: [
              {
                source: 'LockBit',
                relation: 'uses',
                target: 'StealBit',
                type: 'TOOL_RELATION'
              }
            ]
          }
        }
      }
    ]
  }
];

export function getStoredThreads(): InvestigationThread[] {
  if (typeof window === 'undefined') return INITIAL_THREADS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_THREADS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_THREADS, JSON.stringify(INITIAL_THREADS));
      return INITIAL_THREADS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_THREADS;
  } catch {
    return INITIAL_THREADS;
  }
}

export function saveStoredThreads(threads: InvestigationThread[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_THREADS, JSON.stringify(threads));
  } catch (e) {
    console.error('Failed to save threads to localStorage', e);
  }
}

export function getStoredFiles(): UploadedFileRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FILES);
    if (!raw) {
      // Seed with initial uploaded reports
      const seeds: UploadedFileRecord[] = INITIAL_REPORTS.map((rep) => ({
        id: rep.id,
        filename: rep.filename,
        size: rep.content ? new Blob([rep.content]).size : 12400,
        type: 'application/json',
        uploadedAt: new Date(rep.date).toISOString(),
        status: 'Indexed',
        rawContent: rep.content,
        isLocalOnly: false,
      }));
      // Cache raw content in memory
      seeds.forEach((s) => {
        if (s.rawContent) FILE_CONTENTS_CACHE.set(s.id, s.rawContent);
      });
      localStorage.setItem(STORAGE_KEY_FILES, JSON.stringify(seeds.map(({ rawContent, ...meta }) => meta)));
      return seeds;
    }
    const parsed = JSON.parse(raw);
    return parsed.map((item: UploadedFileRecord) => ({
      ...item,
      rawContent: FILE_CONTENTS_CACHE.get(item.id) || (INITIAL_REPORTS.find(r => r.filename === item.filename)?.content),
    }));
  } catch {
    return [];
  }
}

export function saveStoredFile(fileMeta: UploadedFileRecord, rawContent?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredFiles();
    const cleanMeta = { ...fileMeta };
    delete cleanMeta.rawContent;

    const updated = [cleanMeta, ...existing.filter((f) => f.id !== fileMeta.id)];
    localStorage.setItem(STORAGE_KEY_FILES, JSON.stringify(updated));

    if (rawContent) {
      FILE_CONTENTS_CACHE.set(fileMeta.id, rawContent);
    }
  } catch (e) {
    console.error('Failed to save file metadata', e);
  }
}

export function getFileContent(fileId: string, filename?: string): string | undefined {
  if (FILE_CONTENTS_CACHE.has(fileId)) {
    return FILE_CONTENTS_CACHE.get(fileId);
  }
  const match = INITIAL_REPORTS.find((r) => r.id === fileId || r.filename === filename);
  return match?.content;
}
