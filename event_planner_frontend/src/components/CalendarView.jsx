import React, { useMemo } from 'react';

/**
 * PUBLIC_INTERFACE
 * CalendarView
 * Displays a monthly calendar and overlays simple weather and event information.
 */
function CalendarView({ activeDate, onDateChange, forecastDaily = [], events = [], units = 'metric' }) {
  const now = new Date(activeDate);

  // Defensive normalization to avoid runtime TypeErrors if callers pass non-arrays
  const safeForecastDaily = Array.isArray(forecastDaily) ? forecastDaily : [];
  const safeEvents = Array.isArray(events) ? events : [];

  const monthMeta = useMemo(() => {
    const year = now.getFullYear();
    const month = now.getMonth();
    const first = new Date(year, month, 1);
    const startDay = first.getDay(); // 0 Sunday - 6 Saturday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < startDay; i++) {
      cells.push({ key: `p-${i}`, label: '', date: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      cells.push({ key: `d-${d}`, label: String(d), date });
    }
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let i = 0; i < remaining; i++) {
      cells.push({ key: `n-${i}`, label: '', date: null });
    }
    return { year, month, cells };
  }, [now]);

  const tempUnit = units === 'imperial' ? '°F' : '°C';

  const dailyByDate = useMemo(() => {
    const map = {};
    (safeForecastDaily || []).forEach((d) => {
      const ds = new Date(((d.dt || 0) * 1000) || d.date).toISOString().slice(0, 10);
      map[ds] = d;
    });
    return map;
  }, [safeForecastDaily]);

  const eventsByDate = useMemo(() => {
    const map = {};
    (safeEvents || []).forEach((e) => {
      if (!e || !e.date) return;
      const ds = new Date(e.date).toISOString().slice(0, 10);
      if (!map[ds]) map[ds] = [];
      map[ds].push(e);
    });
    return map;
  }, [safeEvents]);

  const title = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(now);

  const shiftMonth = (delta) => {
    const d = new Date(now);
    d.setMonth(d.getMonth() + delta);
    onDateChange?.(d);
  };

  return (
    <div className="panel calendar" role="region" aria-label="Calendar">
      <div className="calendar-header">
        <h3 className="panel-title">{title}</h3>
        <div className="calendar-controls">
          <button className="btn-outline" onClick={() => shiftMonth(-1)} aria-label="Previous month">‹</button>
          <button className="btn-outline" onClick={() => onDateChange(new Date())} aria-label="Today">Today</button>
          <button className="btn-outline" onClick={() => shiftMonth(1)} aria-label="Next month">›</button>
        </div>
      </div>
      <div className="grid" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} style={{ textAlign: 'center', paddingBottom: 4 }}>{d}</div>
        ))}
      </div>
      <div className="grid">
        {monthMeta.cells.map((c) => {
          if (!c.date) return <div key={c.key} className="day" aria-hidden="true" />;
          const iso = c.date.toISOString().slice(0, 10);
          const d = dailyByDate[iso];
          const rains = (d?.weather?.[0]?.main || '').toLowerCase().includes('rain');
          const tempMin = d?.temp?.min ?? d?.main?.temp_min;
          const tempMax = d?.temp?.max ?? d?.main?.temp_max;
          const todaysEvents = eventsByDate[iso] || [];
          return (
            <button
              key={c.key}
              className="day"
              onClick={() => onDateChange?.(c.date)}
              title={`Select ${iso}`}
              style={{ textAlign: 'left' }}
            >
              <div className="day-header">
                <span>{c.label}</span>
                <span className="dot">●</span>
              </div>
              {d ? (
                <span className={`badge ${rains ? 'badge-warn' : ''}`}>
                  {tempMin !== undefined && tempMax !== undefined
                    ? `${Math.round(tempMin)}${tempUnit}/${Math.round(tempMax)}${tempUnit}`
                    : 'Forecast'}
                </span>
              ) : (
                <span className="helper">No data</span>
              )}
              <div style={{ display: 'grid', gap: 6, marginTop: 6 }}>
                {todaysEvents.slice(0, 2).map((e) => (
                  <div key={e.id || e.title} className="event-item">
                    {e.title}
                  </div>
                ))}
                {todaysEvents.length > 2 && (
                  <div className="helper">+{todaysEvents.length - 2} more</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CalendarView;
