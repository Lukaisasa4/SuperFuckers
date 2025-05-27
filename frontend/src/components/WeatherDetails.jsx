import React from "react";

function WeatherDetails({ data }) {
  return (
    <div className="details-box">
      <h3>Detalles</h3>
      <p>Humedad: {data.humidity}%</p>
      <p>Viento: {data.wind} km/h</p>
      <p>Presión: {data.pressure} hPa</p>
    </div>
  );
}

export default WeatherDetails;