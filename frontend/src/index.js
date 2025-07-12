import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';

// Este es el punto de entrada de la aplicación React.
// Busca el elemento con id="root" en tu public/index.html
const root = ReactDOM.createRoot(document.getElementById('root'));

// Y renderiza tu componente principal <App /> dentro de él.
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);