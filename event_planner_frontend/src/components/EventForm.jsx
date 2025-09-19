import React, { useState } from 'react';
import { createEvent } from '../services/api';

/**
 * PUBLIC_INTERFACE
 * EventForm
 * Form to create a new event by posting to the backend API.
 */
function EventForm({ defaultDate = new Date(), onCreated }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => {
    const d = new Date(defaultDate);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); // local ISO for datetime-local
    return d.toISOString().slice(0, 16);
  });
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [weatherPreference, setWeatherPreference] = useState('');
  const [loading, setLoading] = useState(false);
  const [formMsg, setFormMsg] = useState('');

  const reset = () => {
    setTitle('');
    setDescription('');
    setLocation('');
    setWeatherPreference('');
    setFormMsg('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormMsg('');
    if (!title.trim() || !date) {
      setFormMsg('Please provide a title and date/time.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        location: location.trim() || null,
        date: new Date(date).toISOString(),
        weather_preference: weatherPreference || null,
      };
      const created = await createEvent(payload);
      setFormMsg('Event created successfully.');
      onCreated?.(created);
      reset();
    } catch (err) {
      setFormMsg('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel" role="region" aria-label="Event form">
      <h3 className="panel-title">Book an Event</h3>
      <form className="form" onSubmit={onSubmit}>
        <div className="form-row">
          <label className="label" htmlFor="title">Title</label>
          <input
            id="title"
            className="input"
            placeholder="e.g., Team Offsite"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="row">
          <div className="form-row">
            <label className="label" htmlFor="datetime">Date & Time</label>
            <input
              id="datetime"
              type="datetime-local"
              className="datetime"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="form-row">
            <label className="label" htmlFor="location">Location</label>
            <input
              id="location"
              className="input"
              placeholder="City or venue"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <label className="label" htmlFor="description">Description</label>
          <textarea
            id="description"
            className="textarea"
            placeholder="Additional details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <span className="helper">Optional</span>
        </div>

        <div className="form-row">
          <label className="label" htmlFor="weatherPref">Weather Preference</label>
          <select
            id="weatherPref"
            className="select"
            value={weatherPreference}
            onChange={(e) => setWeatherPreference(e.target.value)}
          >
            <option value="">No preference</option>
            <option value="sunny">Prefer sunny</option>
            <option value="no_rain">Avoid rain</option>
            <option value="cool">Prefer cooler</option>
            <option value="warm">Prefer warmer</option>
          </select>
        </div>

        {formMsg && (
          <div
            className="helper"
            style={{ color: formMsg.includes('successfully') ? 'var(--secondary)' : 'var(--error)' }}
          >
            {formMsg}
          </div>
        )}

        <div className="actions">
          <button type="reset" className="btn-outline" onClick={reset} disabled={loading}>Reset</button>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EventForm;
