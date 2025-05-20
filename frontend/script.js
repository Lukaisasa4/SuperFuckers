fetch('http://localhost:3000/api/tiempo-donosti')
  .then(res => res.json())
  .then(data => {
    document.getElementById('tiempo').innerHTML = `
      <div class="cuadros-container">
        <div class="cuadro-tiempo cuadro-izquierda">
          <p><strong>Temperatura:</strong> ${data.temperatura} °C</p>
          <p><strong>Máxima:</strong> ${data.temp_max || '-'} °C</p>
          <p><strong>Mínima:</strong> ${data.temp_min || '-'} °C</p>
        </div>
        <div class="cuadro-tiempo cuadro-derecha">
          <p><strong>Humedad:</strong> ${data.humedad} %</p>
          <p><strong>Presión:</strong> ${data.presion} hPa</p>
          <p><strong>Viento:</strong> ${data.viento || '-'} km/h</p>
        </div>
      </div>
    `;
  })
  .catch(error => {
    document.getElementById('tiempo').innerHTML = `
      <div class="cuadro-tiempo">
        Error al cargar los datos: ${error}
      </div>
    `;
  });
