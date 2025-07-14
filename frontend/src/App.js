import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import apiClient from './api';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';

function App() {
  const [loginError, setLoginError] = useState(null); // Para errores de login
  // Usaremos 'accessToken' para ser consistentes con la nueva lógica de api.js
  const [token, setToken] = useState(localStorage.getItem('accessToken'));
  const navigate = useNavigate();

  // --- LÓGICA DE AUTENTICACIÓN ---
  const handleLogin = async (username, password) => {
    try {
      const response = await apiClient.post('token/', { username, password });
      
      // Guardamos AMBOS tokens con nombres claros
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      
      setToken(response.data.access);
      setLoginError(null);
      // Usamos navigate para una transición más suave, típico de una SPA
      navigate('/');

    } catch (err) {
      console.error("Error de login:", err);
      if (err.response && err.response.status === 401) {
        setLoginError('Usuario o contraseña incorrectos.');
      } else {
        setLoginError('Error de red o del servidor. Revisa la consola del navegador.');
      }
    }
  };

  const handleLogout = () => {
    // Borramos ambos tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setToken(null);
    navigate('/login');
  };

  // --- RENDERIZADO CONDICIONAL ---
  // Si no hay token, mostramos la pantalla de Login.
  if (!token) {
    // Redirigimos todas las rutas al login si no hay token
    return <Routes><Route path="*" element={<Login onLogin={handleLogin} error={loginError} />} /></Routes>;
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
          {/* Cualquier otra ruta no definida redirige al dashboard */}
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;