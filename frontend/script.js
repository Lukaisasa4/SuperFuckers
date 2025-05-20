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
// Función para obtener el índice de la hora más cercana

// Ejemplo de datos
const horas = Array.from({length: 24}, (_, i) => `${i}:00`);
const datos = [/* tus datos de temperatura por hora, 24 valores */];

const ctx = document.getElementById('graficoTemp').getContext('2d');
new Chart(ctx, {
  type: 'line',
  data: {
    labels: horas,
    datasets: [{
      label: 'Temperatura',
      data: datos,
      borderColor: 'rgba(0,180,255,1)',
      backgroundColor: 'rgba(0,180,255,0.2)',
      fill: true,
      tension: 0.3
    }]
  },
  options: {
    responsive: false, // Importante para scroll
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { ticks: { color: '#fff' } },
      y: { ticks: { color: '#fff' } }
    }
  }
});
