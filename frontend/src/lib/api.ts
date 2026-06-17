import { auth } from './firebase';
import type { Report, TrendsResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function getAuthHeaders(): Promise<HeadersInit> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('You must be signed in to perform this action.');
  }
  const token = await user.getIdToken();
  return {
    Authorization: `Bearer ${token}`,
  };
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
    throw new Error(message);
  }
  return response.json();
}

export async function uploadReport(file: File): Promise<Report> {
  const headers = await getAuthHeaders();
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/api/reports/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  return handleResponse<Report>(response);
}

export async function fetchReports(): Promise<Report[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/api/reports`, { headers });
  return handleResponse<Report[]>(response);
}

export async function fetchReport(reportId: string): Promise<Report> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/api/reports/${reportId}`, { headers });
  return handleResponse<Report>(response);
}

export async function fetchTrends(): Promise<TrendsResponse> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/api/trends`, { headers });
  return handleResponse<TrendsResponse>(response);
}

export async function checkHealth(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE}/health`);
  return handleResponse(response);
}
