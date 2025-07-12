import React, { useState } from 'react';

function AddClientForm({ onClientAdded, apiToken }) {
  // --- ESTADOS DEL FORMULARIO ---
  // Usamos un solo objeto para guardar todos los datos del formulario.
  const [formData, setFormData] = useState({
    business_name: '',
    contact_name: '',
    phone: '',
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // --- MANEJADORES DE EVENTOS ---
  // Esta función se ejecuta cada vez que el usuario escribe en un campo.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Esta función se ejecuta cuando el usuario envía el formulario.
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que la página se recargue.
    setSubmitting(true);
    setError(null);

    try {
      // Llamamos a la función que nos pasaron como prop.
      // Esta función vive en Dashboard.js y es la que realmente hace la llamada a la API.
      await onClientAdded(formData);
      // Si todo va bien, reseteamos el formulario.
      setFormData({
        business_name: '', contact_name: '', phone: '',
        username: '', email: '', password: '',
      });
    } catch (err) {
      // Si hay un error, lo mostramos.
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // --- RENDERIZADO DEL FORMULARIO ---
  return (
    <div className="form-container">
      <h3>Añadir Nuevo Cliente</h3>
      <form onSubmit={handleSubmit}>
        <input name="business_name" value={formData.business_name} onChange={handleChange} placeholder="Nombre del Negocio" required />
        <input name="contact_name" value={formData.contact_name} onChange={handleChange} placeholder="Persona de Contacto" required />
        <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Teléfono (Opcional)" />
        <hr />
        <p>Datos de acceso para el cliente:</p>
        <input name="username" value={formData.username} onChange={handleChange} placeholder="Nombre de usuario" required />
        <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
        <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Contraseña" required />
        
        <button type="submit" disabled={submitting}>
          {submitting ? 'Añadiendo...' : 'Añadir Cliente'}
        </button>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
}

export default AddClientForm;