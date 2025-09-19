# Event Planner Frontend (React)

Modern, responsive UI for planning events with live weather integration, following the "Ocean Professional" theme.

## Features
- Current weather and 4-day forecast summary
- Monthly calendar with weather badges and event markers
- Event booking form (title, date/time, location, description, weather preference)
- Weather-based suggestions for your selected day
- Light/Dark theme toggle
- Mobile-friendly responsive layout

## Configuration
Set the backend API base URL via environment variable:
- Create a `.env` file in this directory (see `.env.example`)
- Example:
```
REACT_APP_API_BASE=http://localhost:3001
```

The frontend uses these backend endpoints:
- GET /api/events/
- POST /api/events/
- GET /api/weather/current
- GET /api/weather/forecast

## Scripts
- `npm start` - Run the app at http://localhost:3000
- `npm test` - Run tests
- `npm run build` - Production build

## Notes
- The UI uses lightweight CSS with subtle shadows, rounded corners, and gradients.
- No heavy UI libraries are required.
