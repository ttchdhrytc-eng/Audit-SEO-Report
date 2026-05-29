export function getApiUrl(path: string): string {
  try {
    const savedSettings = localStorage.getItem('SEO_SUITE_WHITE_LABEL_SETTINGS');
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
