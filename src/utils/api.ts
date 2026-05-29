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

  return path;
}
