// script.js

async function consultar() {
  const ciudad = document.getElementById('ciudad').value.trim();
  const resultado = document.getElementById('resultado');
  if (!ciudad) {
    resultado.innerHTML = '<p style="color:#c00;">Por favor, introduce una ciudad de Euskal Herria.</p>';
    return;
  }

  resultado.innerHTML = '<div style="text-align:center;"><span>Cargando...</span></div>';

  try {
    // Cambia la URL si tu backend está en otro puerto o ruta
    const response = await fetch(`http://localhost:8080/api/tiempo?ciudad=${encodeURIComponent(ciudad)}`);
    if (!response.ok) throw new Error('No se pudo obtener el tiempo');
    const data = await response.json();

    // Icono simple según estado
    let icono = "☀️";
    if (data.estado.toLowerCase().includes("lluvia")) icono = "🌧️";
    else if (data.estado.toLowerCase().includes("nube")) icono = "⛅";
    else if (data.estado.toLowerCase().includes("tormenta")) icono = "⛈️";
    else if (data.estado.toLowerCase().includes("nieve")) icono = "❄️";
    else if (data.estado.toLowerCase().includes("niebla")) icono = "🌫️";

    resultado.innerHTML = `
      <h2>${icono} ${data.ciudad}</h2>
      <p><strong>Temperatura:</strong> ${data.temperatura} °C</p>
      <p><strong>Humedad:</strong> ${data.humedad} %</p>
      <p><strong>Estado:</strong> ${data.estado}</p>
    `;
  } catch (err) {
    resultado.innerHTML = `<p style="color:#c00;">No se pudo obtener el tiempo para <b>${ciudad}</b>. Intenta otra ciudad.</p>`;
  }
}

// Permite pulsar Enter para consultar
document.getElementById('ciudad').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') consultar();
});