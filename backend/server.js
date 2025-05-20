const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());

const cities = {
  donostia: { name: "Donostia", latitude: 43.3128, longitude: -1.9750 },
  pasaia: { name: "Pasaia", latitude: 43.3256, longitude: -1.9261 },
  bilbao: { name: "Bilbao", latitude: 43.2630, longitude: -2.9350 },
  vitoria: { name: "Vitoria-Gasteiz", latitude: 42.8467, longitude: -2.6727 }
};

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

// Express route to get weather info for a city
app.get('/api/tiempo-:ciudad', async (req, res) => {
  const ciudad = req.params.ciudad.toLowerCase();
  const coords = cities[ciudad];
  if (!coords) {
    return res.status(404).json({ error: 'Ciudad no encontrada' });
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&hourly=temperature_2m&timezone=Europe%2FMadrid`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Error al obtener datos del tiempo');
    }
    const datos = await response.json();

    const clima = datos.current_weather || {};
    const daily = datos.daily || {};

    const weatherDesc = getWeatherDescription(clima.weathercode);

    res.json({
      temperatura: clima.temperature,
      viento: clima.windspeed,
      estado: weatherDesc.desc,
      emoji: weatherDesc.emoji,
      maxima: daily.temperature_2m_max ? daily.temperature_2m_max[0] : null,
      minima: daily.temperature_2m_min ? daily.temperature_2m_min[0] : null,
      salidaSol: daily.sunrise ? daily.sunrise[0] : null,
      puestaSol: daily.sunset ? daily.sunset[0] : null
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


app.listen(3001, () => {
  console.log('Servidor backend corriendo en http://localhost:3001');
});
