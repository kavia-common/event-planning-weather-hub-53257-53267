import React from 'react';

/**
 * PUBLIC_INTERFACE
 * WeatherWidget
 * Displays current weather and short forecast summary.
 */
function WeatherWidget({ loading, current, forecastDaily, units, location }) {
  const tempUnit = units === 'imperial' ? '°F' : '°C';

  const currentTemp = current?.main?.temp ?? current?.temp;
  const description =
    current?.weather?.[0]?.description ??
    current?.weather?.[0]?.main ??
    '—';
  const icon =
    current?.weather?.[0]?.icon ??
    forecastDaily?.[0]?.weather?.[0]?.icon;

  const iconUrl = icon
    ? `https://openweathermap.org/img/wn/${icon}@2x.png`
    : null;

  return (
    <div className="panel" role="region" aria-label="Current weather">
      <h3 className="panel-title">Current Weather</h3>
      {loading ? (
        <p className="helper">Loading weather...</p>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {iconUrl && (
              <img
                src={iconUrl}
                width={56}
                height={56}
                alt={description}
                style={{ borderRadius: 12, background: 'rgba(0,0,0,0.03)' }}
              />
            )}
            <div>
              <div style={{ fontWeight: 700, fontSize: 20 }}>
                {location || '—'}
              </div>
              <div className="helper" style={{ textTransform: 'capitalize' }}>
                {description}
              </div>
            </div>
            <div style={{ marginLeft: 'auto', fontWeight: 700, fontSize: 24 }}>
              {currentTemp !== undefined ? `${Math.round(currentTemp)}${tempUnit}` : '—'}
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <h4 className="label" style={{ marginBottom: 6 }}>Next days</h4>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {forecastDaily?.slice(0, 4).map((d, idx) => {
                const day = new Date((d.dt || d.dt_txt) * 1000 || d.date).toLocaleDateString(undefined, { weekday: 'short' });
                const min = Math.round(d.temp?.min ?? d.main?.temp_min ?? 0);
                const max = Math.round(d.temp?.max ?? d.main?.temp_max ?? 0);
                const ic = d.weather?.[0]?.icon;
                const iu = ic ? `https://openweathermap.org/img/wn/${ic}.png` : null;
                return (
                  <div key={idx} className="day" style={{ minHeight: 80 }}>
                    <div className="day-header">
                      <span>{day}</span>
                      {iu && <img src={iu} alt="" width={24} height={24} />}
                    </div>
                    <div className="helper">{min}{tempUnit} / {max}{tempUnit}</div>
                  </div>
                );
              })}
              {!forecastDaily?.length && <div className="helper">No forecast data</div>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default WeatherWidget;
