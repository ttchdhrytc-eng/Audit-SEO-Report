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

  // Smart Fallback: If running on an external domain (e.g. Cloudflare Workers, GitHub Pages),
  // automatically route traffic to the live Google Cloud Run sandbox container.
  if (typeof window !== "undefined" && window.location) {
    const hostname = window.location.hostname;
    const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
    const isContainer = hostname.endsWith("run.app");
    
    if (!isLocal && !isContainer) {
      const defaultBackend = "https://ais-pre-jh73tlf3ma53ancchisqut-234509423251.asia-southeast1.run.app";
      const cleanPath = path.replace(/^\/+/, '');
      return `${defaultBackend}/${cleanPath}`;
    }
  }

  return path;
}
