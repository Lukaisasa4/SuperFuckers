app.get('/tiempo', async (req, res) => {
  const nombreCiudad = req.query.ciudad?.toLowerCase();

  if (!ciudades[nombreCiudad]) {
    return res.status(400).json({ error: 'Ciudad no encontrada' });
  }

  const { lat, lon } = ciudades[nombreCiudad];

  try {
    const response = await axios.get(`https://api.euskalmet.euskadi.eus/api/v1/forecast`, {
      params: { lat, lon },
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error consultando Euskalmet' });
  }
});