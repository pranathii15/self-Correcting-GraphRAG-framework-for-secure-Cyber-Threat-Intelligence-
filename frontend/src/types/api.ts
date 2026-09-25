export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | string;

export interface ReasoningMetadata {
  sufficient?: boolean;
  coverage?: string;
  consistency?: string;
  missing_information?: string[];
  conflicts?: string[];
  unsupported_claims?: string[];
  reason?: string;
}

export interface RetrievalDocument {
  id?: string;
  filename?: string;
  source?: string;
  content?: string;
  excerpt?: string;
  score?: number;
  metadata?: Record<string, unknown>;
}

export interface GraphEvidence {
  source?: string;
  target?: string;
  relation?: string;
  type?: string;
  label?: string;
  properties?: Record<string, unknown>;
}

export interface RetrievalMetadata {
  intent?: string;
  expanded_query?: string;
  used_fallback?: boolean;
  documents?: RetrievalDocument[];
  graph?: GraphEvidence[];
}

export interface TimingMetadata {
  retrieval_seconds?: number;
  answer_generation_seconds?: number;
  total_seconds?: number;
}

export interface ChatRequest {
  query: string;
}

export interface ChatResponse {
  query: string;
  answer: string;
  used_fallback?: boolean;
  evidence_used?: boolean;
  confidence?: ConfidenceLevel;
  confidence_reason?: string;
  reasoning?: ReasoningMetadata;
  retry_count?: number;
  correction_exhausted?: boolean;
  timing?: TimingMetadata;
  retrieval?: RetrievalMetadata;
  reasoning_unavailable?: boolean;
}

export interface ThreadMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachedReport?: string;
  response?: ChatResponse;
  isError?: boolean;
  errorMessage?: string;
}

export interface InvestigationThread {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ThreadMessage[];
  confidence?: ConfidenceLevel;
  evidenceUsed?: boolean;
  retryCount?: number;
}

export interface BackendDocument {
  stored_filename: string;
  original_filename: string;
  file_type: string;
  size: number;
  characters?: number;
  chunks?: number;
  embeddings?: number;
}

export interface DocumentListResponse {
  status: string;
  documents: BackendDocument[];
}

export interface DocumentUploadResponse {
  status: string;
  message?: string;
  document?: {
    original_filename: string;
    stored_filename: string;
    file_type: string;
    characters?: number;
    chunks?: number;
    embeddings?: number;
  };
}

export interface UploadedFileRecord {
  id: string;
  filename: string;
  size: number;
  type: string;
  uploadedAt: string;
  status: 'Indexed' | 'Processing' | 'Failed';
  rawContent?: string;
  isLocalOnly: boolean;
  stored_filename?: string;
  characters?: number;
  chunks?: number;
  embeddings?: number;
  error?: string;
}

export interface ThreatReport {
  id: string;
  filename: string;
  title: string;
  type: 'JSON' | 'PDF' | 'Markdown' | 'Text';
  threatActor?: string;
  malwareFamily?: string;
  summary: string;
  date: string;
  content?: string;
}

// Authentication Types for FastAPI endpoints: POST /auth/register & POST /auth/login
export interface UserLogin {
  username?: string;
  email?: string;
  password: string;
}

export interface UserCreate {
  username?: string;
  email: string;
  password: string;
  full_name?: string;
}

export interface AuthTokenResponse {
  access_token?: string;
  token?: string;
  token_type?: string;
  user?: {
    id?: string | number;
    username?: string;
    email?: string;
    full_name?: string;
  };
  message?: string;
  status?: string;
}

export interface AuthUser {
  id?: string | number;
  username?: string;
  email: string;
  full_name?: string;
}
