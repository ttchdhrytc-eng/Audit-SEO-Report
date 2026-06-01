const memoryStore: Record<string, string> = {};

function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__test_storage__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

export const safeLocalStorage = {
  getItem(key: string): string | null {
    try {
      if (isLocalStorageAvailable()) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      console.warn("Storage item fetch blocked:", e);
    }
    return memoryStore[key] !== undefined ? memoryStore[key] : null;
  },
  setItem(key: string, value: string): void {
    try {
      if (isLocalStorageAvailable()) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch (e) {
      console.warn("Storage item save blocked:", e);
    }
    memoryStore[key] = String(value);
  },
  removeItem(key: string): void {
    try {
      if (isLocalStorageAvailable()) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch (e) {
      console.warn("Storage item remove blocked:", e);
    }
    delete memoryStore[key];
  }
};

export function getApiUrl(path: string): string {
  try {
    const savedSettings = safeLocalStorage.getItem('SEO_SUITE_WHITE_LABEL_SETTINGS');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      if (parsed.apiBaseUrl && parsed.apiBaseUrl.trim()) {
        const cleanBase = parsed.apiBaseUrl.trim().replace(/\/+$/, '');
        const cleanPath = path.replace(/^\/+/, '');
        return `${cleanBase}/${cleanPath}`;
      }
    }
  } catch (e) {
    console.warn("Could not load API base override from localStorage:", e);
  }

  // Fallback to Vite env variable
  const envBase = (import.meta as any).env?.VITE_API_URL || "";
  if (envBase && envBase.trim()) {
    const cleanBase = envBase.trim().replace(/\/+$/, '');
    const cleanPath = path.replace(/^\/+/, '');
    return `${cleanBase}/${cleanPath}`;
  }

  // Smart Fallback: Ensure all sandboxed iframe views (Google Preview environments)
  // and Shared App preview pages route their API calls back to our active writeable
  // live development container backend to align database state and prevent fetch errors.
  if (typeof window !== "undefined" && window.location) {
    const hostname = window.location.hostname;
    const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
    const devBackend = "https://ais-dev-jh73tlf3ma53ancchisqut-234509423251.asia-southeast1.run.app";
    
    // Local dev mode uses relative endpoints
    if (isLocal) {
      return path;
    }

    // If accessed on Cloudflare Pages (e.g. audit-seo-report.pages.dev), target the corresponding worker
    if (hostname.endsWith(".pages.dev")) {
      const prefix = hostname.split('.')[0];
      const cleanPath = path.replace(/^\/+/, '');
      return `https://${prefix}.t-tchdhry-tc.workers.dev/${cleanPath}`;
    }

    // Browsing the dev server directly uses relative endpoints
    if (hostname === "ais-dev-jh73tlf3ma53ancchisqut-234509423251.asia-southeast1.run.app") {
      return path;
    }

    // For any preview or shared/outer domains (such as Google iframe sandboxes, 
    // the Shared App container, or external worker previews), route to devBackend
    const cleanPath = path.replace(/^\/+/, '');
    return `${devBackend}/${cleanPath}`;
  }

  return path;
}

export function getAuthToken(): string | null {
  return safeLocalStorage.getItem('revenue_clutch_jwt_token');
}

export function setAuthToken(token: string | null): void {
  if (token) {
    safeLocalStorage.setItem('revenue_clutch_jwt_token', token);
  } else {
    safeLocalStorage.removeItem('revenue_clutch_jwt_token');
  }
}

export function getAuthHeaders(headers: HeadersInit = {}): HeadersInit {
  const token = getAuthToken();
  if (token) {
    return {
      ...headers,
      'Authorization': `Bearer ${token}`
    };
  }
  return headers;
}
