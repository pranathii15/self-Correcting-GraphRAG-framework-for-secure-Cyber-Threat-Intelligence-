import { AuthTokenResponse, UserLogin, UserCreate, AuthUser } from '../../types/api';
import { getApiBaseUrl } from './client';

const STORAGE_KEY_AUTH_TOKEN = 'cyberguard_auth_token';
const STORAGE_KEY_AUTH_USER = 'cyberguard_auth_user';

/**
 * Get current stored auth token (JWT / Bearer token).
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY_AUTH_TOKEN);
}

/**
 * Set stored auth token.
 */
export function setAuthToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(STORAGE_KEY_AUTH_TOKEN, token);
  } else {
    localStorage.removeItem(STORAGE_KEY_AUTH_TOKEN);
  }
}

/**
 * Get stored auth user information.
 */
export function getStoredAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY_AUTH_USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Set stored auth user information.
 */
export function setStoredAuthUser(user: AuthUser | null): void {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY_AUTH_USER);
  }
}

/**
 * Clear all authentication and user-specific client state.
 */
export function clearAuthSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY_AUTH_TOKEN);
  localStorage.removeItem(STORAGE_KEY_AUTH_USER);
}

/**
 * Returns Authorization header with Bearer token if session exists.
 */
export function getAuthHeaders(headers: Record<string, string> = {}): Record<string, string> {
  const token = getAuthToken();
  if (token) {
    return {
      ...headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return headers;
}

/**
 * Register a new user with FastAPI backend.
 * Endpoint: POST /auth/register
 */
export async function registerUser(payload: UserCreate): Promise<AuthTokenResponse> {
  const baseUrl = getApiBaseUrl();
  const endpoint = `${baseUrl}/auth/register`;

  // Provide email, password, and optionally username/full_name
  const bodyData: Record<string, unknown> = {
    email: payload.email.trim(),
    password: payload.password,
  };
  if (payload.username && payload.username.trim()) {
    bodyData.username = payload.username.trim();
  } else {
    // If username is empty, derive from email or send email as fallback
    bodyData.username = payload.email.split('@')[0];
  }
  if (payload.full_name && payload.full_name.trim()) {
    bodyData.full_name = payload.full_name.trim();
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(bodyData),
    });

    const responseText = await response.text();
    let data: AuthTokenResponse;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { message: responseText };
    }

    if (!response.ok) {
      const errorMsg =
        (data as unknown as { detail?: string | { msg?: string }[] })?.detail;
      let formattedMsg = '';
      if (typeof errorMsg === 'string') {
        formattedMsg = errorMsg;
      } else if (Array.isArray(errorMsg) && errorMsg.length > 0) {
        formattedMsg = errorMsg.map((e) => e.msg || JSON.stringify(e)).join(', ');
      } else {
        formattedMsg = data.message || `Registration failed (${response.status})`;
      }
      throw new Error(formattedMsg);
    }

    // If backend returns a token immediately on registration
    const token = data.access_token || data.token;
    if (token) {
      setAuthToken(token);
      const user: AuthUser = {
        email: payload.email,
        username: data.user?.username || (bodyData.username as string),
        full_name: data.user?.full_name || payload.full_name,
        id: data.user?.id,
      };
      setStoredAuthUser(user);
    }

    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
      throw new Error(`Unable to connect to CyberGuard AI auth service at ${baseUrl}. Ensure backend is running.`);
    }
    throw err;
  }
}

/**
 * Authenticate with FastAPI backend.
 * Endpoint: POST /auth/login
 * Handles both JSON payload and OAuth2 form urlencoded payload if required by FastAPI OAuth2PasswordRequestForm
 */
export async function loginUser(payload: UserLogin): Promise<AuthTokenResponse> {
  const baseUrl = getApiBaseUrl();
  const endpoint = `${baseUrl}/auth/login`;

  const usernameOrEmail = (payload.email || payload.username || '').trim();

  // Primary: JSON payload matching standard FastAPI Pydantic schema
  const jsonBody = {
    email: usernameOrEmail,
    username: usernameOrEmail,
    password: payload.password,
  };

  try {
    let response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(jsonBody),
    });

    // If backend expects x-www-form-urlencoded (standard FastAPI OAuth2PasswordRequestForm: 422 or 415)
    if (!response.ok && (response.status === 422 || response.status === 415)) {
      try {
        const errorData = await response.clone().json();
        const detailStr = JSON.stringify(errorData);
        // If error indicates form expected or OAuth2PasswordRequestForm
        if (detailStr.includes('grant_type') || detailStr.includes('formData') || detailStr.includes('form')) {
          const formParams = new URLSearchParams();
          formParams.append('username', usernameOrEmail);
          formParams.append('password', payload.password);

          const formResponse = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json',
            },
            body: formParams.toString(),
          });

          if (formResponse.ok) {
            response = formResponse;
          }
        }
      } catch {
        // use original response
      }
    }

    const responseText = await response.text();
    let data: AuthTokenResponse;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { message: responseText };
    }

    if (!response.ok) {
      const errorMsg = (data as unknown as { detail?: string | { msg?: string }[] })?.detail;
      let formattedMsg = '';
      if (typeof errorMsg === 'string') {
        formattedMsg = errorMsg;
      } else if (Array.isArray(errorMsg) && errorMsg.length > 0) {
        formattedMsg = errorMsg.map((e) => e.msg || JSON.stringify(e)).join(', ');
      } else {
        formattedMsg = data.message || `Login failed (${response.status})`;
      }
      throw new Error(formattedMsg);
    }

    const token = data.access_token || data.token;
    if (!token) {
      throw new Error('Authentication succeeded but no access token was returned by backend.');
    }

    // Persist token and user in client storage
    setAuthToken(token);
    const user: AuthUser = {
      email: data.user?.email || (usernameOrEmail.includes('@') ? usernameOrEmail : `${usernameOrEmail}@enterprise.local`),
      username: data.user?.username || usernameOrEmail.split('@')[0],
      full_name: data.user?.full_name || undefined,
      id: data.user?.id,
    };
    setStoredAuthUser(user);

    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
      throw new Error(`Unable to connect to CyberGuard AI auth service at ${baseUrl}. Ensure backend is running.`);
    }
    throw err;
  }
}
