const API_BASE = process.env.REACT_APP_API_BASE || '';

/**
 * Internal helper to log raw responses for debugging.
 */
function debugLog(label, payload) {
  try {
    // eslint-disable-next-line no-console
    console.debug(`[API] ${label}:`, payload);
  } catch {
    // ignore
  }
}

/**
 * Wrap fetch handling to support normalized envelopes and detailed error messages.
 */
async function http(path, options = {}) {
  const url = `${API_BASE}${path}`;
  let res;
  try {
    res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });
  } catch (networkErr) {
    debugLog(`NETWORK_ERROR ${url}`, networkErr);
    throw new Error(`Network error contacting server`);
  }

  const contentType = (res.headers && res.headers.get && res.headers.get('content-type')) || '';
  const isJson = contentType.includes('application/json');

  if (!res.ok) {
    if (isJson) {
      const errJson = await res.json().catch(() => null);
      debugLog(`HTTP_ERROR ${url}`, errJson);
      const message =
        (errJson && (errJson.message || errJson.error || errJson.detail)) ||
        `Request failed: ${res.status}`;
      const e = new Error(message);
      e.raw = errJson;
      e.status = res.status;
      throw e;
    }
    const text = await res.text().catch(() => '');
    debugLog(`HTTP_ERROR_TEXT ${url}`, text);
    const e = new Error(text || `Request failed: ${res.status}`);
    e.raw = text;
    e.status = res.status;
    throw e;
  }

  const body = isJson ? await res.json().catch(() => null) : await res.text().catch(() => '');
  debugLog(`HTTP_OK ${url}`, body);

  // If backend returns a normalized envelope { success, data, error }
  if (isJson && body && typeof body === 'object' && ('success' in body || 'data' in body || 'error' in body)) {
    if (body.success === true) {
      return body.data !== undefined ? body.data : body;
    }
    // Treat explicit error envelope as failure
    const e = new Error(
      (body && (body.message || body.error || (body.errors && JSON.stringify(body.errors)))) ||
        'Server returned an error'
    );
    e.raw = body;
    throw e;
  }

  return body;
}

/**
 * PUBLIC_INTERFACE
 */
export async function getEvents({ page = 1, page_size = 20 } = {}) {
  /** Fetch a list of events from backend with pagination.
   * Always returns an array. If the backend returns a wrapped payload or null,
   * this function normalizes it to a plain array.
   */
  const qs = new URLSearchParams({ page, page_size });
  const data = await http(`/api/events/?${qs.toString()}`, { method: 'GET' });

  // Normalize common shapes:
  // - array -> array
  // - { results: [...] } or { items: [...] } -> underlying array
  // - null/undefined/other -> []
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
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
  if (lat) params.set('lat', String(lat));
  if (lon) params.set('lon', String(lon));
  if (units) params.set('units', units);
  if (lang) params.set('lang', lang);
  const data = await http(`/api/weather/current?${params.toString()}`, { method: 'GET' });

  // If data is envelope-unwrapped by http(), proceed. Ensure we return an object that components expect.
  // Current weather (OpenWeather-like): expect { main: { temp }, weather: [{ icon, description }] }
  if (data && typeof data === 'object') return data;
  return null;
}

// PUBLIC_INTERFACE
export async function getForecast({ q, lat, lon, units = 'metric', lang } = {}) {
  /** Fetch forecast via backend proxy and normalize to { daily: [...] } shape. */
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (lat) params.set('lat', String(lat));
  if (lon) params.set('lon', String(lon));
  if (units) params.set('units', units);
  if (lang) params.set('lang', lang);

  const raw = await http(`/api/weather/forecast?${params.toString()}`, { method: 'GET' });

  // If backend already returns { daily: [...] }
  if (raw && Array.isArray(raw.daily)) {
    return { daily: raw.daily };
  }

  // If backend returns an array (assume daily-like)
  if (Array.isArray(raw)) {
    return { daily: raw };
  }

  // If backend returns { list: [...] } (OpenWeather 5-day/3h), aggregate to daily min/max
  if (raw && Array.isArray(raw.list)) {
    const byDay = new Map();
    raw.list.forEach((entry) => {
      const ts = entry.dt ? entry.dt * 1000 : (entry.dt_txt ? new Date(entry.dt_txt).getTime() : Date.now());
      const dayKey = new Date(ts).toISOString().slice(0, 10);
      const tempMin = entry.main?.temp_min ?? entry.main?.temp ?? null;
      const tempMax = entry.main?.temp_max ?? entry.main?.temp ?? null;
      const weather = entry.weather || [];

      if (!byDay.has(dayKey)) {
        byDay.set(dayKey, {
          dt: Math.floor(new Date(`${dayKey}T12:00:00Z`).getTime() / 1000),
          temp: { min: tempMin ?? 0, max: tempMax ?? 0 },
          weather: weather.length ? [weather[0]] : [],
          main: entry.main,
        });
      } else {
        const d = byDay.get(dayKey);
        if (tempMin !== null && (d.temp.min === undefined || tempMin < d.temp.min)) d.temp.min = tempMin;
        if (tempMax !== null && (d.temp.max === undefined || tempMax > d.temp.max)) d.temp.max = tempMax;
        // keep first weather as representative
      }
    });

    const daily = Array.from(byDay.entries())
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([, v]) => v);

    return { daily };
  }

  // If backend returns normalized envelope that got unwrapped into a simple object with daily
  if (raw && typeof raw === 'object' && raw.daily && Array.isArray(raw.daily)) {
    return { daily: raw.daily };
  }

  // Fallback to empty
  return { daily: [] };
}

export default {
  getEvents,
  createEvent,
  getCurrentWeather,
  getForecast,
};
