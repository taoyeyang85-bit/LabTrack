const DEFAULT_PRODUCTION_API_BASE_URL = 'https://labtrack-production-21c6.up.railway.app';

function normalizeUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

function isLocalhostUrl(url: string): boolean {
  return /localhost|127\.0\.0\.1/.test(url);
}

let runtimeApiBaseUrl: string | null = null;

export async function loadRuntimeConfig(): Promise<void> {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}config.json`, {
      cache: 'no-store',
    });
    if (!response.ok) return;
    const data = (await response.json()) as { apiBaseUrl?: string };
    if (typeof data.apiBaseUrl === 'string' && data.apiBaseUrl.trim()) {
      runtimeApiBaseUrl = normalizeUrl(data.apiBaseUrl.trim());
    }
  } catch {
    /* ignore missing runtime config */
  }
}

export function getApiBaseUrl(): string {
  if (runtimeApiBaseUrl) {
    return runtimeApiBaseUrl;
  }

  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim();
  if (fromEnv) {
    const normalized = normalizeUrl(fromEnv);
    if (!import.meta.env.PROD || !isLocalhostUrl(normalized)) {
      return normalized;
    }
  }

  if (import.meta.env.PROD) {
    return DEFAULT_PRODUCTION_API_BASE_URL;
  }

  return 'http://localhost:8000';
}

export function isLikelyLocalApi(): boolean {
  return isLocalhostUrl(getApiBaseUrl());
}

export function getApiSetupHint(): string | null {
  if (!import.meta.env.PROD || !isLikelyLocalApi()) {
    return null;
  }

  return 'The deployed app is still pointing at localhost. Set the VITE_API_BASE_URL GitHub secret to your live backend URL and redeploy.';
}
