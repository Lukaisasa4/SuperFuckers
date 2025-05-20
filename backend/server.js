const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());

// Lista de ciudades reducida a Pasaia, Vitoria y Bilbao
const cities = {
  donostia: { name: "Donostia", latitude: 43.3128, longitude: -1.9750 },
  pasaia: { name: "Pasaia", latitude: 43.3256, longitude: -1.9261 },
  bilbao: { name: "Bilbao", latitude: 43.2630, longitude: -2.9350 },
  vitoria: { name: "Vitoria-Gasteiz", latitude: 42.8467, longitude: -2.6727 }
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

function getWeatherDescription(code) {
  return weatherMap[code] || { desc: "Desconocido", emoji: "❓" };
}

function getClosestHourIndex(times) {
  const now = new Date();
  const nowHour = now.toISOString().slice(0, 13) + ":00";
  let idx = times.findIndex(t => t === nowHour);
  if (idx === -1) {
    const nowTime = new Date(nowHour).getTime();
    let minDiff = Infinity;
    times.forEach((t, i) => {
      const diff = Math.abs(new Date(t).getTime() - nowTime);
      if (diff < minDiff) {
        minDiff = diff;
        idx = i;
      }
    });
  }
  return idx;
}

// Ruta para obtener el tiempo de las ciudades seleccionadas
app.get('/api/tiempo-ciudades', async (req, res) => {
  try {
    const results = {};

    await Promise.all(Object.entries(cities).map(async ([key, city]) => {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current_weather=true&hourly=relative_humidity_2m,pressure_msl&timezone=Europe%2FMadrid`;
      const response = await fetch(url);
      const data = await response.json();

      const idx = getClosestHourIndex(data.hourly.time);
      const weatherInfo = getWeatherDescription(data.current_weather?.weathercode);

      results[key] = {
        nombre: city.name,
        temperatura: data.current_weather?.temperature ?? null,
        humedad: idx !== -1 ? data.hourly.relative_humidity_2m[idx] : null,
        presion: idx !== -1 ? data.hourly.pressure_msl[idx] : null,
        estado: `${weatherInfo.emoji} ${weatherInfo.desc}`
      };
    }));

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para Donosti con histórico y predicción (si la quieres mantener, sino puedes borrarla)
app.get('/api/tiempo-donosti', async (req, res) => {
  try {
    const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=43.3128&longitude=-1.9750&hourly=temperature_2m,relative_humidity_2m,pressure_msl&current_weather=true&past_days=7&forecast_days=7&timezone=Europe%2FMadrid');
    const data = await response.json();

    const idx = getClosestHourIndex(data.hourly.time);

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
