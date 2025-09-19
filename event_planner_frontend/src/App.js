import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import './index.css';
import WeatherWidget from './components/WeatherWidget';
import CalendarView from './components/CalendarView';
import EventForm from './components/EventForm';
import SuggestionsPanel from './components/SuggestionsPanel';
import { getEvents, getForecast, getCurrentWeather } from './services/api';

// PUBLIC_INTERFACE
function App() {
  /** Root application rendering the Ocean Professional themed UI, including:
   * - Top navigation
   * - Hero with current weather
   * - Calendar with forecast overlays
   * - Event booking form
   * - Weather-based suggestions
   */
  const [theme, setTheme] = useState('light');
  const [locationQuery, setLocationQuery] = useState('New York'); // default demo location
  const [units, setUnits] = useState('metric');
  const [events, setEvents] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [activeDate, setActiveDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Load initial data and when dependencies change
  useEffect(() => {
    let isCancelled = false;
    const loadData = async () => {
      setLoading(true);
      setApiError('');
      try {
        const [eventsRes, forecastRes, currentRes] = await Promise.all([
          getEvents(),
          getForecast({ q: locationQuery, units }),
          getCurrentWeather({ q: locationQuery, units }),
        ]);
        if (!isCancelled) {
          // Defensive: normalize events to an array in case backend returns a non-array type
          const normalizedEvents = Array.isArray(eventsRes)
            ? eventsRes
            : (eventsRes && Array.isArray(eventsRes.results))
              ? eventsRes.results
              : (eventsRes && Array.isArray(eventsRes.items))
                ? eventsRes.items
                : [];
          setEvents(normalizedEvents);
          setForecast(forecastRes || null);
          setCurrentWeather(currentRes || null);
        }
      } catch (e) {
        if (!isCancelled) {
          setApiError('Failed to fetch data from server. Please try again.');
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };
    loadData();
    return () => {
      isCancelled = true;
    };
  }, [locationQuery, units]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const gradientStyle = useMemo(
    () => ({
      background:
        'linear-gradient(180deg, rgba(37,99,235,0.08) 0%, rgba(249,250,251,1) 100%)',
    }),
    []
  );

  return (
    <div className="ocean-app">
      <header className="ocean-nav">
        <div className="ocean-container nav-inner">
          <div className="brand">
            <div className="brand-logo" aria-hidden="true">🌊</div>
            <div className="brand-text">
              <span className="brand-title">Event Planner</span>
              <span className="brand-sub">Weather-aware planning</span>
            </div>
          </div>
          <div className="nav-actions">
            <div className="input-group">
              <input
                aria-label="Location"
                className="input"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Enter city (e.g., London)"
              />
              <select
                aria-label="Units"
                className="select"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
              >
                <option value="metric">Metric (°C)</option>
                <option value="imperial">Imperial (°F)</option>
              </select>
            </div>
            <button
              className="btn-outline"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title="Toggle theme"
            >
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero" style={gradientStyle}>
          <div className="ocean-container hero-grid">
            <div className="hero-copy">
              <h1 className="title">
                Plan smarter with live weather insights
              </h1>
              <p className="subtitle">
                Create events, view forecasts, and receive recommendations tailored to the weather.
              </p>
              {apiError && <p className="error-banner">⚠ {apiError}</p>}
            </div>
            <div className="hero-widget">
              <WeatherWidget
                loading={loading}
                current={currentWeather}
                forecastDaily={(forecast && forecast.daily) || []}
                units={units}
                location={locationQuery}
              />
            </div>
          </div>
        </section>

        <section className="content-section">
          <div className="ocean-container content-grid">
            <div className="content-left">
              <CalendarView
                activeDate={activeDate}
                onDateChange={setActiveDate}
                forecastDaily={(forecast && Array.isArray(forecast.daily) ? forecast.daily : [])}
                events={Array.isArray(events) ? events : []}
                units={units}
              />
              <SuggestionsPanel
                current={currentWeather}
                forecastDaily={(forecast && forecast.daily) || []}
                activeDate={activeDate}
                units={units}
              />
            </div>
            <div className="content-right">
              <EventForm
                defaultDate={activeDate}
                onCreated={(evt) => setEvents((prev) => [...prev, evt])}
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="ocean-footer">
        <div className="ocean-container footer-inner">
          <span>© {new Date().getFullYear()} Event Planner</span>
          <span className="dot">•</span>
          <span>Ocean Professional theme</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
