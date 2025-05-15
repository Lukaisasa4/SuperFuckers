function consultar() {
  const ciudad = document.getElementById("ciudad").value;

  fetch(`http://localhost:8080/api/tiempo?ciudad=${ciudad}`)
    .then(response => response.json())
    .then(data => {
      document.getElementById("resultado").innerHTML = `
        <p>Temperatura: ${data.temperatura} °C</p>
        <p>Humedad: ${data.humedad} %</p>
        <p>Cielo: ${data.estado}</p>
      `;
    })
    .catch(error => {
      console.error("Error:", error);
      document.getElementById("resultado").innerText = "Error al consultar.";
    });
}

function cargarMunicipios() {
  fetch('https://api.euskalmet.euskadi.eus/api/geo/municipios')
    .then(response => response.json())
    .then(municipios => {
      const select = document.getElementById("ciudad");
      select.innerHTML = "";
      municipios.forEach(muni => {
        const option = document.createElement("option");
        option.value = muni.nombre; // o muni.codigo, según la API
        option.text = muni.nombre;
        select.appendChild(option);
      });
    })
    .catch(error => {
      console.error("Error cargando municipios:", error);
    });
}

// Llama a cargarMunicipios() cuando cargue la página
window.onload = cargarMunicipios;