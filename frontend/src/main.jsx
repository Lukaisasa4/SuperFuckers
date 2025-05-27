// Importa la librería principal de React
import React from 'react';

// Importa el módulo para trabajar con el DOM en React
import ReactDOM from 'react-dom/client';

// Importa el componente principal de la aplicación
import App from './App';

// Importa los estilos globales
import './index.css';

// Renderiza el componente <App /> dentro del elemento con id="root"
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
