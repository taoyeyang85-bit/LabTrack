import { auth } from './firebase';
import type { Report, TrendsResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_TIMEOUT_MS = 45_000;
const API_RETRIES = 2;
const RETRY_DELAY_MS = 4_000;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly kind: 'network' | 'server' | 'auth' = 'network'
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const user = auth.currentUser;
  if (!user) {
    throw new ApiError('You must be signed in to perform this action.', 'auth');
  }
  const token = await user.getIdToken();
  return {
    Authorization: `Bearer ${token}`,
  };
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  url: string,
  init?: RequestInit
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= API_RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    try {
      const response = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(timeout);
      return response;
    } catch (error) {
      clearTimeout(timeout);
      lastError = error;
      if (attempt < API_RETRIES) {
        await sleep(RETRY_DELAY_MS);
      }
    }
  }

  if (lastError instanceof DOMException && lastError.name === 'AbortError') {
    throw new ApiError(
      'The server is taking too long to respond. If you are on a free hosting tier, wait a minute and try again.',
      'network'
    );
  }

  throw new ApiError(
    'Could not reach the LabTrack server. Check your connection or try again in a moment.',
    'network'
  );
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = 'Something went wrong. Please try again.';
    try {
      const data = await response.json();
      if (data.detail) {
        message = typeof data.detail === 'string' ? data.detail : message;
      }
    } catch {
      // use default message
    }
    throw new ApiError(message, response.status >= 500 ? 'server' : 'network');
  }
  return response.json();
}

export async function uploadReport(file: File): Promise<Report> {
  const headers = await getAuthHeaders();
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetchWithRetry(`${API_BASE}/api/reports/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  return handleResponse<Report>(response);
}

export async function fetchReports(): Promise<Report[]> {
  const headers = await getAuthHeaders();
  const response = await fetchWithRetry(`${API_BASE}/api/reports`, { headers });
  return handleResponse<Report[]>(response);
}

export async function fetchReport(reportId: string): Promise<Report> {
  const headers = await getAuthHeaders();
  const response = await fetchWithRetry(`${API_BASE}/api/reports/${reportId}`, {
    headers,
  });
  return handleResponse<Report>(response);
}

export async function fetchTrends(): Promise<TrendsResponse> {
  const headers = await getAuthHeaders();
  const response = await fetchWithRetry(`${API_BASE}/api/trends`, { headers });
  return handleResponse<TrendsResponse>(response);
}

export async function checkHealth(): Promise<{ status: string }> {
  const response = await fetchWithRetry(`${API_BASE}/health`);
  return handleResponse(response);
}

export function isLikelyLocalApi(): boolean {
  return !API_BASE || API_BASE.includes('localhost') || API_BASE.includes('127.0.0.1');
}
