import { BackendDocument, DocumentListResponse, DocumentUploadResponse } from '../../types/api';
import { getApiBaseUrl } from './client';
import { getAuthHeaders } from './auth';

/**
 * Fetch the uploaded document history from FastAPI backend.
 * Endpoint: GET /documents/
 */
export async function getDocuments(): Promise<BackendDocument[]> {
  const baseUrl = getApiBaseUrl();
  const endpoint = `${baseUrl}/documents/`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: getAuthHeaders({
        'Accept': 'application/json',
      }),
    });

    if (!response.ok) {
      let errBody = '';
      try {
        errBody = await response.text();
      } catch {
        // ignore
      }
      throw new Error(`Failed to load documents (${response.status}): ${errBody || response.statusText}`);
    }

    const data: DocumentListResponse = await response.json();
    if (data && Array.isArray(data.documents)) {
      return data.documents;
    }
    // In case the endpoint returns an array directly
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
      throw new Error(`Unable to connect to CyberGuard AI document service at ${baseUrl}. Ensure FastAPI is running.`);
    }
    throw err;
  }
}

/**
 * Upload a document using multipart/form-data.
 * Field name: 'file'
 * Endpoint: POST /documents/upload
 * Supported types: PDF, TXT, DOCX, JSON
 */
export async function uploadDocument(file: File): Promise<DocumentUploadResponse> {
  const baseUrl = getApiBaseUrl();
  const endpoint = `${baseUrl}/documents/upload`;

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      let errBody = '';
      try {
        errBody = await response.text();
      } catch {
        // ignore
      }
      throw new Error(`Upload failed (${response.status}): ${errBody || response.statusText}`);
    }

    const data: DocumentUploadResponse = await response.json();
    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
      throw new Error(`Unable to connect to CyberGuard AI at ${baseUrl}. Ensure FastAPI is running.`);
    }
    throw err;
  }
}

/**
 * Get readable preview content for TXT and JSON files.
 * Endpoint: GET /documents/{filename}/preview
 */
export async function getDocumentPreview(filename: string): Promise<string> {
  const baseUrl = getApiBaseUrl();
  const endpoint = `${baseUrl}/documents/${encodeURIComponent(filename)}/preview`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      let errBody = '';
      try {
        errBody = await response.text();
      } catch {
        // ignore
      }
      throw new Error(`Failed to load document preview (${response.status}): ${errBody || response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      if (typeof data === 'string') return data;
      if (data && typeof data.content === 'string') return data.content;
      if (data && typeof data.preview === 'string') return data.preview;
      return JSON.stringify(data, null, 2);
    }

    return await response.text();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
      throw new Error(`Unable to connect to document preview service at ${baseUrl}.`);
    }
    throw err;
  }
}

/**
 * Download document file as a real browser download.
 * Endpoint: GET /documents/{filename}/download
 */
export async function downloadDocument(filename: string, originalFilename?: string): Promise<void> {
  const baseUrl = getApiBaseUrl();
  const endpoint = `${baseUrl}/documents/${encodeURIComponent(filename)}/download`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      let errBody = '';
      try {
        errBody = await response.text();
      } catch {
        // ignore
      }
      throw new Error(`Download failed (${response.status}): ${errBody || response.statusText}`);
    }

    const blob = await response.blob();
    const downloadName = originalFilename || filename;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
      throw new Error(`Unable to connect to download service at ${baseUrl}.`);
    }
    throw err;
  }
}
