const API_BASE = process.env.REACT_APP_API_BASE || '';

async function http(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed: ${res.status}`);
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  return res.text();
}

// PUBLIC_INTERFACE
export async function getEvents({ page = 1, page_size = 20 } = {}) {
  /** Fetch a list of events from backend with pagination. */
  const qs = new URLSearchParams({ page, page_size });
  return http(`/api/events/?${qs.toString()}`, { method: 'GET' });
}

// PUBLIC_INTERFACE
export async function createEvent(payload) {
  /** Create a new event via backend. */
  return http('/api/events/', { method: 'POST', body: JSON.stringify(payload) });
}

// PUBLIC_INTERFACE
export async function getCurrentWeather({ q, lat, lon, units = 'metric', lang } = {}) {
  /** Fetch current weather via backend proxy. */
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (lat) params.set('lat', lat);
  if (lon) params.set('lon', lon);
  if (units) params.set('units', units);
  if (lang) params.set('lang', lang);
  return http(`/api/weather/current?${params.toString()}`, { method: 'GET' });
}

// PUBLIC_INTERFACE
export async function getForecast({ q, lat, lon, units = 'metric', lang } = {}) {
  /** Fetch forecast via backend proxy. */
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (lat) params.set('lat', lat);
  if (lon) params.set('lon', lon);
  if (units) params.set('units', units);
  if (lang) params.set('lang', lang);
  return http(`/api/weather/forecast?${params.toString()}`, { method: 'GET' });
}

export default {
  getEvents,
  createEvent,
  getCurrentWeather,
  getForecast,
};
