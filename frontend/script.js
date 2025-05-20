fetch('http://localhost:3000/api/tiempo-donosti')
  .then(res => res.json())
  .then(data => {
    document.getElementById('tiempo').innerHTML = `
      <p>Temperatura: ${data.temperatura} °C</p>
      <p>Humedad: ${data.humedad} %</p>
      <p>Presión: ${data.presion} hPa</p>
    `;
  })
  .catch(error => {
    document.getElementById('tiempo').innerHTML = `Error al cargar los datos: ${error}`;
  });
