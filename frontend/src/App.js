import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import apiClient from './api';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';

function App() {
  const [loginError, setLoginError] = useState(null); // Para errores de login

  // El token de autenticación. Lo leemos de localStorage para mantener la sesión.
  const [token, setToken] = useState(localStorage.getItem('authToken'));

  // --- LÓGICA DE AUTENTICACIÓN ---
  const handleLogin = async (username, password) => {
    try {
      // Ahora podemos usar nuestro apiClient para todo.
      // Aunque el interceptor no actuará en esta llamada (porque aún no hay token), está bien.
      const response = await apiClient.post('token/', { username, password });
      const newToken = response.data.access;
      localStorage.setItem('authToken', newToken); // Guardamos el token en el navegador
      setLoginError(null);
      // Forzamos la recarga de la página. Esta es la solución más simple y robusta.
      // Al recargar, el nuevo token se leerá de localStorage desde el principio
      // y toda la aplicación estará correctamente autenticada.
      window.location.reload();
    } catch (err) {
      console.error("Error de login:", err);
      // Hacemos el manejo de errores más específico.
      if (err.response && err.response.status === 401) {
        // Error 401 significa específicamente "Unauthorized".
        setLoginError('Usuario o contraseña incorrectos.');
      } else {
        // Cualquier otro error (como el de red) se mostrará de forma genérica.
        setLoginError('Error de red o del servidor. Revisa la consola del navegador.');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken'); // Borramos el token
    // Forzamos la recarga para que el estado de autenticación se limpie en toda la app.
    window.location.href = '/';
  };

  // --- RENDERIZADO CONDICIONAL ---
  // Si no hay token, mostramos la pantalla de Login.
  if (!token) {
    return <Login onLogin={handleLogin} error={loginError} />;
  }

  // Si hay token, mostramos la aplicación principal.
  return (
    <div className="App">
      <header className="App-header">
        <h1>Portal Sandoval</h1>
        <button onClick={handleLogout} className="logout-button">Cerrar Sesión</button>
      </header>
      <main>
        <Routes>
          {/* La ruta principal ahora renderiza el componente Dashboard */}
          <Route path="/" element={<Dashboard />} />
          {/* Creamos una ruta dinámica para los detalles del proyecto */}
          <Route path="/projects/:projectId" element={<ProjectDetail />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;