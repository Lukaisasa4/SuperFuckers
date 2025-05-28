import React from "react";

// Diccionario de iconos según el código de clima
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

// Componente WeatherToday que recibe los datos y la ciudad como props
function WeatherToday({ data, city }) {
  // Si no hay datos suficientes, no renderiza nada
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

  // Obtiene la temperatura, el código y el icono correspondiente a la hora encontrada
  const temp = data.temperatures[idx];
  const code = data.codes[idx];
  const icon = weatherIcons[code] || "❔";
  // Nuevos datos actuales
  const wind = data.winds ? data.winds[idx] : null;
  const humidity = data.humidity ? data.humidity[idx] : null;
  const pressure = data.pressure ? data.pressure[idx] : null;
  const apparent = data.apparent_temperature ? data.apparent_temperature[idx] : null;
  const uv = data.uv_index ? data.uv_index[idx] : null;
  const precip = data.precipitation ? data.precipitation[idx] : null;

  // Renderiza el bloque principal con ciudad, icono y temperatura
  return (
    <div className="weather-today-hero glass">
      {city && <div className="weather-today-city-hero">{city}</div>}
      <div className="weather-today-icon-hero">{icon}</div>
      <div className="weather-today-temp-hero">{temp}°C</div>
      <div className="weather-today-extra">
        {wind !== null && <span>💨 Viento: {wind} km/h</span>}
        {humidity !== null && <span>💧 Humedad: {humidity}%</span>}
        {pressure !== null && <span>🌡️ Presión: {pressure} hPa</span>}
        {apparent !== null && <span>🤗 Sensación: {apparent}°C</span>}
        {uv !== null && <span>🌞 UV: {uv}</span>}
        {precip !== null && <span>🌧️ Precipitación: {precip} mm</span>}
      </div>
    </div>
  );
}

export default WeatherToday;