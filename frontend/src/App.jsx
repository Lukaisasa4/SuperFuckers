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
  // Estado para el histórico de 30 días
  const [history30, setHistory30] = useState(null);
  const [showHistory30, setShowHistory30] = useState(false);

  // Función que maneja la búsqueda de una ciudad
  const handleSearch = async (query) => {
    setCity(query);
    setShowHistory30(false);
    setHistory30(null);
    const res = await fetch(`http://localhost:8000/weather?location=${query}`);
    const data = await res.json();
    setWeatherData(data);

    document.body.className = "";
    document.body.classList.add(data.background || "default");
  };

  // Función para pedir el histórico de 30 días
  const handleShowHistory30 = async () => {
    if (!city) return;
    const res = await fetch(`http://localhost:8000/weather?location=${city}&history_days=30`);
    const data = await res.json();
    setHistory30(data.history);
    setShowHistory30(true);
  };

  return (
    <div className="container">
      <h1>🌍 Clima Mundial 🌎</h1>
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
          <div className="section-container glass" style={{ textAlign: "center" }}>
            <button className="history-btn" onClick={handleShowHistory30}>
              Ver histórico últimos 30 días
            </button>
            {showHistory30 && history30 && (
              <>
                <h2>Histórico últimos 30 días</h2>
                <WeatherHistory data={history30} />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;