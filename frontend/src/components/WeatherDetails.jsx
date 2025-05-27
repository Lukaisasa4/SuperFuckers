import React from "react";

// Componente WeatherDetails que recibe los datos meteorológicos como prop
function WeatherDetails({ data }) {
  return (
    // Contenedor de los detalles meteorológicos
    <div className="details-box">
      <h3>Detalles</h3>
      <p>Humedad: {data.humidity}%</p>
      <p>Viento: {data.wind} km/h</p>
      <p>Presión: {data.pressure} hPa</p>
    </div>
  );
}

export default WeatherDetails;