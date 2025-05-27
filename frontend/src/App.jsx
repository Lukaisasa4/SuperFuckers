import React, { useState } from "react";
import SearchBar from "./components/SearchBar";
import WeatherToday from "./components/WeatherToday";
import WeatherHistory from "./components/WeatherHistory";
import WeatherChart from "./components/WeatherChart";
import "./App.css";

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [city, setCity] = useState("");

  const handleSearch = async (query) => {
    setCity(query);
    const res = await fetch(`http://localhost:8000/weather?location=${query}`);
    const data = await res.json();
    setWeatherData(data);

    document.body.className = "";
    document.body.classList.add(data.background || "default");
  };

  return (
    <div className="container">
      <h1>Weather Dashboard</h1>
      <SearchBar onSearch={handleSearch} />

      {weatherData && (
        <>
          <WeatherToday data={weatherData.today} city={city} />
          <div className="main-weather-container glass">
            <WeatherChart
              hours={weatherData.today.hours}
              temperatures={weatherData.today.temperatures}
            />
          </div>
          <div className="section-container glass">
            <h2>Previsión próximos 7 días</h2>
            <WeatherHistory data={weatherData.forecast} />
          </div>
          <div className="section-container glass">
            <h2>Histórico últimos 7 días</h2>
            <WeatherHistory data={weatherData.history} />
          </div>
        </>
      )}
    </div>
  );
}

export default App;