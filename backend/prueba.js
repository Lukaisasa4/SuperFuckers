const express = require('express');
const app = express();

// Ruta de prueba simple
app.get('/ping', (req, res) => {
  res.send('pong');
});

// Ruta principal
app.get('/', (req, res) => {
  res.send('¡Servidor funcionando correctamente!');
});

// Iniciar servidor
const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});