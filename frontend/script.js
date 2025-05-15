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
