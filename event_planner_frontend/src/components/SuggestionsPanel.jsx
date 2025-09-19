import React, { useMemo } from 'react';

/**
 * PUBLIC_INTERFACE
 * SuggestionsPanel
 * Provides recommendations based on current and selected date weather.
 */
function SuggestionsPanel({ current, forecastDaily = [], activeDate, units = 'metric' }) {
  const tempUnit = units === 'imperial' ? '°F' : '°C';

  const selectedForecast = useMemo(() => {
    if (!activeDate) return null;
    const key = new Date(activeDate).toISOString().slice(0, 10);
    const found = forecastDaily.find((d) => {
      const iso = new Date(((d.dt || 0) * 1000) || d.date).toISOString().slice(0, 10);
      return iso === key;
    });
    return found || null;
  }, [forecastDaily, activeDate]);

  const suggestions = useMemo(() => {
    const list = [];
    const cw = current?.weather?.[0]?.main?.toLowerCase() || '';
    const cf = selectedForecast?.weather?.[0]?.main?.toLowerCase() || '';

    if (cw.includes('rain') || cf.includes('rain')) {
      list.push('Consider an indoor venue due to possible rain.');
    }
    if (cw.includes('clear') || cf.includes('clear')) {
      list.push('Great time for outdoor activities and photo sessions.');
    }
    const temp = selectedForecast?.temp?.day ?? current?.main?.temp ?? null;
    if (temp !== null) {
      if ((units === 'metric' && temp > 28) || (units === 'imperial' && temp > 82)) {
        list.push('It might be warm. Provide shade and hydration for guests.');
      }
      if ((units === 'metric' && temp < 8) || (units === 'imperial' && temp < 46)) {
        list.push('Cool temperatures expected. Consider heaters and warm beverages.');
      }
    }
    if (!list.length) list.push('No special recommendations. You are good to go!');
    return list;
  }, [current, selectedForecast, units]);

  const tempDisplay = selectedForecast?.temp?.day
    ? `${Math.round(selectedForecast.temp.day)}${tempUnit}`
    : current?.main?.temp !== undefined
      ? `${Math.round(current.main.temp)}${tempUnit}`
      : '—';

  const desc =
    selectedForecast?.weather?.[0]?.description ??
    current?.weather?.[0]?.description ??
    '—';

  return (
    <div className="panel" role="region" aria-label="Recommendations">
      <h3 className="panel-title">Weather-based Suggestions</h3>
      <div className="suggestion">
        <div className="helper" style={{ textTransform: 'capitalize' }}>
          Selected day outlook: {desc} · {tempDisplay}
        </div>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {suggestions.map((s, idx) => (
            <li key={idx}>{s}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default SuggestionsPanel;
