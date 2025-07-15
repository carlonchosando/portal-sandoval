import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import apiClient from './api';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [loginError, setLoginError] = useState(null); // Para errores de login
  // Usaremos 'accessToken' para ser consistentes con la nueva lógica de api.js
  const [token, setToken] = useState(localStorage.getItem('accessToken'));
  const [isAdmin, setIsAdmin] = useState(false);
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

  // Verificar si el usuario es administrador probando acceso al endpoint administrativo
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!token) return;
      
      try {
        // Intentamos acceder al endpoint de métricas administrativas
        // Si podemos acceder, significa que somos administradores
        const today = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(today.getMonth() - 1);
        
        // No incluimos /api/v1/ porque ya está en el baseURL de apiClient
        const testUrl = `admin/metrics/?start_date=${oneMonthAgo.toISOString().split('T')[0]}&end_date=${today.toISOString().split('T')[0]}`;
        
        await apiClient.get(testUrl);
        // Si llegamos aquí sin error, somos admin
        setIsAdmin(true);
      } catch (err) {
        if (err.response && err.response.status === 403) {
          // Error 403 significa que no somos admin
          setIsAdmin(false);
        } else {
          // Otro error, mantenemos el estado actual
          console.error("Error verificando estado de administrador:", err);
        }
      }
    };
    
    checkAdminStatus();
  }, [token]);

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
        <div className="header-controls">
          {isAdmin && (
            <button 
              onClick={() => navigate('/admin')} 
              className="admin-button"
            >
              Panel Administrativo
            </button>
          )}
          <button onClick={handleLogout} className="logout-button">Cerrar Sesión</button>
        </div>
      </header>
      <main>
        <Routes>
          {/* La ruta principal ahora renderiza el componente Dashboard */}
          <Route path="/" element={<Dashboard />} />
          {/* Panel administrativo exclusivo para administradores */}
          <Route path="/admin" element={<AdminDashboard />} />
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