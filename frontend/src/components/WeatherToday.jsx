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

function WeatherToday({ data }) {
  return (
    <div>
      <h2>Hoy</h2>
      {data.hours.map((hour, idx) => (
        <div className="weather-box" key={idx}>
          <span>{hour.split("T")[1]}</span>
          <span>{data.temperatures[idx]}°C</span>
          <span>{weatherIcons[data.codes[idx]] || "❔"}</span>
        </div>
      ))}
    </div>
  );
}

export default WeatherToday;