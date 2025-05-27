import React from "react";

const weatherIcons = {
  0: "☀️",
  1: "🌤️",
  2: "⛅",
  3: "☁️",
  45: "🌫️",
  48: "🌫️",
  51: "🌦️",
  53: "🌧️",
  55: "🌧️",
  61: "🌧️",
  63: "🌧️",
  65: "🌧️",
  71: "❄️",
  73: "❄️",
  75: "❄️",
  80: "🌦️",
  81: "🌧️",
  82: "⛈️",
  95: "⛈️",
  99: "🌩️"
};

function WeatherToday({ data, city }) {
  if (!data || !data.temperatures || !data.codes || !data.hours) return null;

  // Buscar el índice más cercano a la hora real (local del navegador)
  const now = new Date();
  let idx = 0;
  let minDiff = Infinity;
  data.hours.forEach((h, i) => {
    const hourDate = new Date(h);
    const diff = Math.abs(hourDate.getHours() - now.getHours());
    if (diff < minDiff) {
      minDiff = diff;
      idx = i;
    }
  });

  const temp = data.temperatures[idx];
  const code = data.codes[idx];
  const icon = weatherIcons[code] || "❔";

  return (
    <div className="weather-today-hero glass">
      {city && <div className="weather-today-city-hero">{city}</div>}
      <div className="weather-today-icon-hero">{icon}</div>
      <div className="weather-today-temp-hero">{temp}°C</div>
    </div>
  );
}

export default WeatherToday;