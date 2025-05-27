// Importaciones necesarias
import React, { useState } from "react";
import SearchBar from "./components/SearchBar";
import WeatherToday from "./components/WeatherToday";
import WeatherHistory from "./components/WeatherHistory";
import "./App.css";

function App() {
  // Estado para los datos del tiempo
  const [weatherData, setWeatherData] = useState(null);

  // Maneja la búsqueda de una ciudad
  const handleSearch = async (query) => {
    const res = await fetch(`http://localhost:8000/weather?location=${query}`);
    const data = await res.json();
    setWeatherData(data);

    // Cambia el fondo según el tipo de clima
    document.body.className = "";
    document.body.classList.add(data.background || "default");
  };

  return (
    <div className="container">
      <h1>Weather Dashboard</h1>
      {/* Barra de búsqueda */}
      <SearchBar onSearch={handleSearch} />

      {/* Muestra los datos si existen */}
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
