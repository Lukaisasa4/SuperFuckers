import React, { useState } from "react";
import SearchBar from "./components/SearchBar";
import WeatherToday from "./components/WeatherToday";
import WeatherHistory from "./components/WeatherHistory";
import WeatherChart from "./components/WeatherChart";
import "./App.css";

// Componente principal de la aplicación
function App() {
  // Estado para almacenar los datos meteorológicos
  const [weatherData, setWeatherData] = useState(null);
  // Estado para almacenar la ciudad buscada
  const [city, setCity] = useState("");

  // Función que maneja la búsqueda de una ciudad
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