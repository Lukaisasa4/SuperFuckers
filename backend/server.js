const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const mysql = require('mysql2/promise');
const cron = require('node-cron');


const app = express();
app.use(cors());
 
// Configuración de base de datos
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'sanlapo4',
  database: 'reto99'
};

// Datos de ciudades
const cities = {
  bilbao: { nombre: "Bilbao", latitude: 43.2630, longitude: -2.9350, altitude: 19 },
  "vitoria-gasteiz": { nombre: "Vitoria-Gasteiz", latitude: 42.8467, longitude: -2.6716, altitude: 525 },
  "donostia-san-sebastian": { nombre: "Donostia / San Sebastián", latitude: 43.3128, longitude: -1.9748, altitude: 6 },
  barakaldo: { nombre: "Barakaldo", latitude: 43.2956, longitude: -2.9972, altitude: 39 },
  getxo: { nombre: "Getxo", latitude: 43.3569, longitude: -3.0116, altitude: 50 },
  portugalete: { nombre: "Portugalete", latitude: 43.3204, longitude: -3.0197, altitude: 20 },
  irun: { nombre: "Irun", latitude: 43.3381, longitude: -1.7890, altitude: 10 },
  basauri: { nombre: "Basauri", latitude: 43.2386, longitude: -2.8852, altitude: 70 },
  durango: { nombre: "Durango", latitude: 43.1704, longitude: -2.6336, altitude: 121 },
  eibar: { nombre: "Eibar", latitude: 43.1849, longitude: -2.4713, altitude: 121 },
  sestao: { nombre: "Sestao", latitude: 43.3094, longitude: -3.0075, altitude: 26 },
  santurtzi: { nombre: "Santurtzi", latitude: 43.3283, longitude: -3.0323, altitude: 23 },
  lezama: { nombre: "Lezama", latitude: 43.2739, longitude: -2.8434, altitude: 65 },
  tolosa: { nombre: "Tolosa", latitude: 43.1345, longitude: -2.0705, altitude: 75 },
  zarautz: { nombre: "Zarautz", latitude: 43.2843, longitude: -2.1696, altitude: 5 }
};


// Obtener índice de la hora más cercana
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

// Ruta para consultar tiempo actual
app.get("/api/tiempo-:ciudad", async (req, res) => {
  const ciudad = req.params.ciudad.toLowerCase();
  const coords = cities[ciudad];
  if (!coords) {
    return res.status(404).json({ error: "Ciudad no encontrada" });
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&hourly=temperature_2m,relative_humidity_2m,pressure_msl&timezone=Europe%2FMadrid`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Error al obtener datos del clima");
    const datos = await response.json();
    const clima = datos.current_weather || {};
    const daily = datos.daily || {};
    const hourly = datos.hourly || {};

    let humedad = null;
    let presion = null;
    if (hourly.time && hourly.relative_humidity_2m && hourly.pressure_msl) {
      const idx = getClosestHourIndex(hourly.time);
      humedad = hourly.relative_humidity_2m[idx];
      presion = hourly.pressure_msl[idx];
    }

    res.json({
      temperatura: clima.temperature,
      viento: clima.windspeed,
      estadoCodigo: clima.weathercode,
      humedad: humedad,
      presion: presion,
      maxima: daily.temperature_2m_max ? daily.temperature_2m_max[0] : null,
      minima: daily.temperature_2m_min ? daily.temperature_2m_min[0] : null,
      salidaSol: daily.sunrise ? daily.sunrise[0] : null,
      puestaSol: daily.sunset ? daily.sunset[0] : null
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Ruta para guardar datos actuales e históricos en la base de datos
app.get("/api/guardar-tiempo", async (req, res) => {
  const conn = await mysql.createConnection(dbConfig);
  const resultados = [];

  for (const key in cities) {
    const { nombre, latitude, longitude } = cities[key];
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,pressure_msl,precipitation,winddirection_10m&timezone=Europe%2FMadrid`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const clima = data.current_weather;
      const idx = getClosestHourIndex(data.hourly.time);

      const humedad = data.hourly.relative_humidity_2m?.[idx] || null;
      const precipitacion = data.hourly.precipitation?.[idx] || null;
      const viento_direccion = clima.winddirection?.toString() || null;
      const fechaHora = new Date().toISOString().slice(0, 19).replace('T', ' ');

      const [rows] = await conn.execute('SELECT id FROM ubicaciones WHERE nombre = ?', [nombre]);
      if (rows.length === 0) {
        resultados.push({ ciudad: nombre, estado: "NO ENCONTRADA EN DB" });
        continue;
      }

      const id_ubicacion = rows[0].id;

      // Insertar en tiempo_actual
      await conn.execute(`
        INSERT INTO tiempo_actual (id_ubicacion, fecha_hora, temperatura, humedad, viento_velocidad, viento_direccion, precipitacion)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [id_ubicacion, fechaHora, clima.temperature, humedad, clima.windspeed, viento_direccion, precipitacion]);

      // Insertar en historico
      await conn.execute(`
        INSERT INTO historico (id_ubicacion, fecha_hora, temperatura, humedad, viento_velocidad, viento_direccion, precipitacion)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [id_ubicacion, fechaHora, clima.temperature, humedad, clima.windspeed, viento_direccion, precipitacion]);

      resultados.push({ ciudad: nombre, estado: "GUARDADO" });
    } catch (err) {
      resultados.push({ ciudad: nombre, estado: "ERROR", mensaje: err.message });
    }
  }

  await conn.end();
  res.json(resultados);
});
async function guardarResumenDiario() {
  const conn = await mysql.createConnection(dbConfig);
  // Fecha de ayer en formato YYYY-MM-DD
  const fechaAyer = new Date();
  fechaAyer.setDate(fechaAyer.getDate() - 1);
  const fecha = fechaAyer.toISOString().split('T')[0];

  console.log(`📊 Guardando resumen diario para fecha: ${fecha}`);

  for (const key in cities) {
    const nombre = cities[key].nombre;

    // Obtener id_ubicacion
    const [rowsUbicacion] = await conn.execute('SELECT id FROM ubicaciones WHERE nombre = ?', [nombre]);
    if (rowsUbicacion.length === 0) {
      console.log(`❌ Ubicación no encontrada en DB: ${nombre}`);
      continue;
    }
    const id_ubicacion = rowsUbicacion[0].id;

    // Consultar datos históricos del día anterior
    const [rows] = await conn.execute(`
      SELECT
        AVG(temperatura) AS temperatura_media,
        AVG(humedad) AS humedad_media,
        AVG(viento_velocidad) AS viento_velocidad_media,
        SUM(precipitacion) AS precipitacion_total
      FROM historico
      WHERE id_ubicacion = ? AND DATE(fecha_hora) = ?
    `, [id_ubicacion, fecha]);

    const resumen = rows[0];
    if (!resumen || resumen.temperatura_media === null) {
      console.log(`⚠️ Sin datos para resumen en ${nombre} para fecha ${fecha}`);
      continue;
    }

    // Insertar o actualizar resumen diario
    await conn.execute(`
      INSERT INTO resumen_diario (id_ubicacion, fecha, temperatura_media, humedad_media, viento_velocidad_media, precipitacion_total)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        temperatura_media = VALUES(temperatura_media),
        humedad_media = VALUES(humedad_media),
        viento_velocidad_media = VALUES(viento_velocidad_media),
        precipitacion_total = VALUES(precipitacion_total)
    `, [
      id_ubicacion,
      fecha,
      resumen.temperatura_media,
      resumen.humedad_media,
      resumen.viento_velocidad_media,
      resumen.precipitacion_total
    ]);

    console.log(`✅ Resumen diario guardado para ${nombre} (${fecha})`);
  }

  await conn.end();
}


// Ejecutar automáticamente cada día a las 00:00 para guardar datos actuales e históricos
cron.schedule('0 0 * * *', async () => {
  console.log("⏰ Ejecutando tarea programada para guardar el clima...");

  try {
    const res = await fetch('http://localhost:3002/api/guardar-tiempo');
    const data = await res.json();
    console.log("✅ Datos guardados automáticamente:", data);
  } catch (error) {
    console.error("❌ Error al ejecutar la tarea programada:", error.message);
  }
});

// Ejecutar automáticamente cada día a las 00:05 para guardar resumen diario (5 minutos después de guardar datos)
cron.schedule('5 0 * * *', async () => {
  console.log("⏰ Ejecutando tarea programada para guardar resumen diario...");

  try {
    await guardarResumenDiario();
    console.log("✅ Resumen diario guardado correctamente");
  } catch (error) {
    console.error("❌ Error guardando resumen diario:", error.message);
  }
});

// ... (todo tu código anterior se mantiene igual hasta)

app.get("/api/test-resumen", async (req, res) => {
  try {
    await guardarResumenDiario();
    res.json({ status: "Resumen diario guardado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//prueba de conexion
app.get('/ping', (req, res) => res.send('pong'));

// Ruta principal
app.get('/', (req, res) => {
  res.send(`
    <h1>Servidor de Clima del País Vasco</h1>
    <p>Endpoints disponibles:</p>
    <ul>
      <li><a href="/api/tiempo-bilbao">/api/tiempo-:ciudad</a> (ej: bilbao, vitoria-gasteiz)</li>
      <li><a href="/api/guardar-tiempo">/api/guardar-tiempo</a> (guarda datos en DB)</li>
      <li><a href="/ping">/ping</a> (prueba de conexión)</li>
    </ul>
  `);
});

// Iniciar servidor (SOLO UNA VEZ, al final de todo)
app.listen(3001, () => {
  console.log('Servidor backend corriendo en http://localhost:3001');
});