import React, { useState } from "react";
import SearchBar from "./components/SearchBar";
import WeatherToday from "./components/WeatherToday";
import WeatherHistory from "./components/WeatherHistory";
import "./App.css";

function App() {
  const [weatherData, setWeatherData] = useState(null);

  const handleSearch = async (query) => {
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
          <WeatherToday data={weatherData.today} />
          <h2>Últimos 7 días</h2>
          <WeatherHistory data={weatherData.history} />
          <h2>Próximos 7 días</h2>
          <WeatherHistory data={weatherData.forecast} />
        </>
      )}
    </div>
  );
}

export default App;
