import React, { useState, useEffect } from 'react';

function EditClientForm({ client, onUpdate, onCancel }) {
  // Estado para manejar los datos del formulario
  const [formData, setFormData] = useState({
    business_name: '',
    contact_name: '',
    phone: '',
    internal_notes: '',
    username: '',
    email: '',
    password: '', // La contraseña estará vacía por defecto
  });
  const [error, setError] = useState(null);

  // Este efecto se ejecuta cuando el componente recibe un cliente para editar.
  // Rellena el formulario con los datos actuales de ese cliente.
  useEffect(() => {
    if (client) {
      setFormData({
        business_name: client.business_name || '',
        contact_name: client.contact_name || '',
        phone: client.phone || '',
        internal_notes: client.internal_notes || '',
        // El usuario está anidado, lo extraemos de client.user
        username: client.user?.username || '',
        email: client.user?.email || '',
        password: '', // Siempre vaciamos la contraseña por seguridad
      });
    }
  }, [client]);

  // Maneja los cambios en los inputs del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Se ejecuta al enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      // Creamos una copia de los datos para no enviar una contraseña vacía
      const dataToUpdate = { ...formData };
      if (!dataToUpdate.password) {
        // Si la contraseña está vacía, la eliminamos del objeto
        // para que el backend no intente actualizarla.
        delete dataToUpdate.password;
      }

      // Llama a la función onUpdate que nos pasaron desde el Dashboard
      await onUpdate(client.id, dataToUpdate);
    } catch (err) {
      setError(err.message || 'No se pudo actualizar el cliente.');
    }
  };

  // Si no hay cliente para editar, no mostramos nada.
  if (!client) return null;

  return (
    <div className="edit-form-container">
        <h3>Editando a: {client.business_name}</h3>
        <form onSubmit={handleSubmit}>
          <input name="business_name" value={formData.business_name} onChange={handleChange} placeholder="Nombre del Negocio" required />
          <input name="contact_name" value={formData.contact_name} onChange={handleChange} placeholder="Persona de Contacto" required />
          <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Teléfono (Opcional)" />
          <textarea name="internal_notes" value={formData.internal_notes} onChange={handleChange} placeholder="Notas internas (opcional)" />
          
          <hr />
          <p>Datos de acceso (editar con cuidado):</p>
          <input name="username" value={formData.username} onChange={handleChange} placeholder="Nombre de usuario" required />
          <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
          <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Nueva contraseña (dejar en blanco para no cambiar)" />
          
          <div className="form-actions">
            <button type="submit">Guardar Cambios</button>
            <button type="button" onClick={onCancel} className="button-cancel">Cancelar</button>
          </div>
          {error && <p className="error-message">{error}</p>}
        </form>
    </div>
  );
}

export default EditClientForm;