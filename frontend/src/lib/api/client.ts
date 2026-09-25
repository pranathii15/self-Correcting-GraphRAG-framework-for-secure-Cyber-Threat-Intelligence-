import { ChatRequest, ChatResponse } from '../../types/api';
import { getAuthHeaders } from './auth';

const STORAGE_KEY_API_URL = 'cyberguard_api_base_url';
export const DEFAULT_API_BASE = 'http://127.0.0.1:8000';

export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_API_BASE;
  const stored = localStorage.getItem(STORAGE_KEY_API_URL);
  if (stored && stored.trim()) {
    return stored.trim().replace(/\/+$/, '');
  }
  const envUrl =
    (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_API_URL) ||
    ((import.meta as unknown as { env?: Record<string, string> }).env?.NEXT_PUBLIC_API_URL) ||
    ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_URL) ||
    DEFAULT_API_BASE;
  return String(envUrl).trim().replace(/\/+$/, '');
}

export function setApiBaseUrl(url: string): void {
  if (typeof window === 'undefined') return;
  const clean = url.trim().replace(/\/+$/, '');
  localStorage.setItem(STORAGE_KEY_API_URL, clean);
}

export async function checkBackendHealth(): Promise<{ online: boolean; message: string; details?: unknown }> {
  const baseUrl = getApiBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    // Try a HEAD or GET on root or docs
    const response = await fetch(`${baseUrl}/`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json, text/plain, */*',
      },
    }).catch(async () => {
      // fallback test /docs or /openapi.json
      return fetch(`${baseUrl}/docs`, { method: 'HEAD', signal: controller.signal });
    });

    clearTimeout(timeoutId);

    if (response && (response.ok || response.status === 404 || response.status === 405 || response.status === 307)) {
      return {
        online: true,
        message: `FastAPI backend connected at ${baseUrl}`,
      };
    }
    return {
      online: false,
      message: `Backend returned status ${response?.status || 'unknown'}`,
    };
  } catch (error) {
    const isAbort = error instanceof Error && error.name === 'AbortError';
    return {
      online: false,
      message: isAbort
        ? `Connection timed out connecting to ${baseUrl}`
        : `Unable to reach FastAPI backend at ${baseUrl}. Ensure backend is running.`,
    };
  }
}

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const baseUrl = getApiBaseUrl();
  const endpoint = `${baseUrl}/chat/`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s for deep retrieval & LLM reasoning

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: getAuthHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }),
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorBody = '';
      try {
        errorBody = await response.text();
      } catch {
        // ignore
      }
      throw new Error(`Backend error (${response.status}): ${errorBody || response.statusText}`);
    }

    const data: ChatResponse = await response.json();
    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('AbortError') || message.includes('aborted')) {
      throw new Error(`Request timed out. The backend at ${baseUrl} took longer than 45 seconds to generate an answer.`);
    }
    if (message.includes('Failed to fetch') || message.includes('NetworkError') || message.includes('fetch')) {
      throw new Error(
        `Unable to connect to CyberGuard AI. Make sure the FastAPI backend is running at ${baseUrl} and CORS is permitted.`
      );
    }
    throw err;
  }
}

export { getDocuments, uploadDocument, getDocumentPreview, downloadDocument } from './files';
