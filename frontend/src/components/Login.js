import React, { useState } from 'react';

function Login({ onLogin, error }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Llamamos a la función onLogin que nos pasaron desde App.js
    // con el usuario y la contraseña.
    await onLogin(username, password);
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Iniciar Sesión</h2>
        <p>Usa las credenciales de superusuario que creaste.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nombre de usuario"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
          {/* Mostramos el error si existe */}
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default Login;