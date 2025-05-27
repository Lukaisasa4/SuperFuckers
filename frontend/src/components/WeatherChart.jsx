import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// Registra los componentes necesarios de Chart.js
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

// Componente WeatherChart que recibe las horas y temperaturas como props
function WeatherChart({ hours, temperatures }) {
  if (!hours || !temperatures) return null;

  // Extrae las horas en formato HH:MM para las etiquetas del eje X
  const labels = hours.map(h => h.split("T")[1].slice(0, 5));

  // Configuración de los datos para el gráfico
  const data = {
    labels,
    datasets: [
      {
        label: "Temperatura (°C)",
        data: temperatures,
        fill: true,
        borderColor: "#007acc",
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, "rgba(0,122,204,0.18)");
          gradient.addColorStop(1, "rgba(0,122,204,0.01)");
          return gradient;
        },
        pointBackgroundColor: "#fff",
        pointBorderColor: "#007acc",
        pointRadius: 6,
        pointHoverRadius: 9,
        borderWidth: 4,
        tension: 0.4,
      },
    ],
  };

  // Opciones de configuración del gráfico
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#4c566a", font: { size: 15 } },
      },
      y: {
        grid: { color: "#e0e0e0" },
        ticks: { color: "#4c566a", font: { size: 15 } },
        beginAtZero: false,
      },
    },
  };

  // Renderiza el gráfico de líneas dentro de un contenedor
  return (
    <div className="weather-chart-container">
      <Line data={data} options={options} height={400} />
    </div>
  );
}

export default WeatherChart;