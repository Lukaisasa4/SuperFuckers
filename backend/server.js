const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

// Inicializa la app y middlewares
const app = express();
app.use(cors());

// Lista de ciudades con sus coordenadas
const cities = {
  donostia: { name: "Donostia", latitude: 43.3128, longitude: -1.9750 },
  zarautz: { name: "Zarautz", latitude: 43.2843, longitude: -2.1699 },
  zumaia: { name: "Zumaia", latitude: 43.2956, longitude: -2.2572 },
  pasaia: { name: "Pasaia", latitude: 43.3256, longitude: -1.9261 },
  azpeitia: { name: "Azpeitia", latitude: 43.1847, longitude: -2.2636 },
  irun: { name: "Irun", latitude: 43.3390, longitude: -1.7894 }
};

// Mapeo de códigos de clima a descripción y emoji
const weatherMap = {
  0: { desc: "Despejado", emoji: "☀️" },
  1: { desc: "Principalmente despejado", emoji: "🌤️" },
  2: { desc: "Parcialmente nublado", emoji: "⛅" },
  3: { desc: "Nublado", emoji: "☁️" },
  45: { desc: "Niebla", emoji: "🌫️" },
  48: { desc: "Niebla con escarcha", emoji: "🌫️❄️" },
  51: { desc: "Llovizna ligera", emoji: "🌦️" },
  53: { desc: "Llovizna moderada", emoji: "🌦️" },
  55: { desc: "Llovizna densa", emoji: "🌧️" },
  61: { desc: "Lluvia ligera", emoji: "🌦️" },
  63: { desc: "Lluvia moderada", emoji: "🌧️" },
  65: { desc: "Lluvia intensa", emoji: "🌧️" },
  80: { desc: "Chubascos ligeros", emoji: "🌦️" },
  81: { desc: "Chubascos moderados", emoji: "🌧️" },
  82: { desc: "Chubascos violentos", emoji: "⛈️" }
};

// Función auxiliar
function getWeatherDescription(code) {
  return weatherMap[code] || { desc: "Desconocido", emoji: "❓" };
}

// Ruta para obtener el tiempo de todas las ciudades
app.get('/api/tiempo-ciudades', async (req, res) => {
  try {
    const now = new Date();
    const hour = now.getHours();
    const results = {};

    await Promise.all(Object.entries(cities).map(async ([key, city]) => {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current_weather=true&hourly=relative_humidity_2m,pressure_msl`;
      const response = await fetch(url);
      const data = await response.json();

      results[key] = {
        nombre: city.name,
        temperatura: data.current_weather.temperature,
        humedad: data.hourly.relative_humidity_2m[hour],
        presion: data.hourly.pressure_msl[hour],
        codigo: data.current_weather.weathercode,
        descripcion: getWeatherDescription(data.current_weather.weathercode)
      };
    }));

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para Donosti con histórico y predicción
app.get('/api/tiempo-donosti', async (req, res) => {
  try {
    const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=43.3128&longitude=-1.9750&hourly=temperature_2m,relative_humidity_2m,pressure_msl&current_weather=true&past_days=7&forecast_days=7&timezone=Europe%2FMadrid');
    const data = await response.json();

    const now = new Date();
    const nowHour = now.toISOString().slice(0, 13) + ":00";
    const idx = data.hourly.time.findIndex(t => t === nowHour);

    const temperatura_actual = data.current_weather?.temperature ?? null;
    const humedad_actual = idx !== -1 ? data.hourly.relative_humidity_2m[idx] : null;
    const presion_actual = idx !== -1 ? data.hourly.pressure_msl[idx] : null;

    const fechas = data.hourly.time;
    const temperaturas = data.hourly.temperature_2m;
    const humedades = data.hourly.relative_humidity_2m;
    const presiones = data.hourly.pressure_msl;

    res.json({
      temperatura_actual,
      humedad_actual,
      presion_actual,
      fechas,
      temperaturas,
      humedades,
      presiones
    });
  } catch (error) {
    res.status(500).json({error: 'Error interno del servidor'});
  }
});

app.listen(3001, () => {
  console.log('Servidor backend corriendo en http://localhost:3001');
});