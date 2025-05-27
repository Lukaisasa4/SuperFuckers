import React, { useState } from "react";

// Componente SearchBar que recibe la función onSearch como prop
function SearchBar({ onSearch }) {
  // Estado local para almacenar el valor del input de búsqueda
  const [query, setQuery] = useState("");

  // Maneja el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario
    onSearch(query);    // Llama a la función onSearch con el valor actual del input
  };

  return (
    // Formulario de búsqueda
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Introduce una ciudad"
        value={query}
        onChange={(e) => setQuery(e.target.value)} // Actualiza el estado al escribir
      />
      <button type="submit">Buscar</button>
    </form>
  );
}

export default SearchBar;