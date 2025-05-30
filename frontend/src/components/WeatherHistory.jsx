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

// Componente WeatherHistory que recibe los datos como prop
function WeatherHistory({ data }) {
  return (
    <div>
      {data.map((item, idx) => (
        <div className="weather-box" key={idx}>
          <span>{item.date}</span>
          <span>{item.temp_min}° / {item.temp_max}°</span>
          <span>{weatherIcons[item.code] || "❔"}</span>
        </div>
      ))}
    </div>
  );
}

export default WeatherHistory;