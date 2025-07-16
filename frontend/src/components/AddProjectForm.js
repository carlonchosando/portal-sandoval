import React, { useState } from 'react';

function AddProjectForm({ clients, onProjectAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client_id: '', // El nombre 'client_id' es el que espera el serializer
    start_date: '',
    initial_cost: '',
    currency: 'USD', // Moneda por defecto
    youtube_url: '',
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.client_id) {
      setError('Debes seleccionar un cliente.');
      return;
    }
    setSubmitting(true);
    setError(null);

    // Usamos FormData para poder enviar el archivo adjunto.
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('client_id', formData.client_id);
    data.append('currency', formData.currency);
    
    // Manejo mejorado de la fecha - aseguramos que se envía en formato YYYY-MM-DD
    if (formData.start_date && formData.start_date.trim() !== '') {
      console.log('Fecha seleccionada (raw):', formData.start_date);
      // La fecha ya está en formato YYYY-MM-DD gracias al input type="date"
      data.append('start_date', formData.start_date);
      console.log('Fecha enviada al backend:', formData.start_date);
    } else {
      console.log('No se seleccionó fecha de inicio');
      // Enviamos null explícitamente para indicar que no hay fecha
      data.append('start_date', '');
    }
    
    if (formData.initial_cost) data.append('initial_cost', formData.initial_cost.toString()); // Asegura que se envía como string exacto
    if (formData.youtube_url) data.append('youtube_url', formData.youtube_url);
    if (file) data.append('attachment', file);

    try {
      // Pasamos el objeto FormData al manejador del Dashboard
      await onProjectAdded(data);
      // Reseteamos el formulario a su estado inicial
      setFormData({
        name: '', description: '', client_id: '', start_date: '',
        initial_cost: '', currency: 'USD', youtube_url: '',
      });
      setFile(null);
      if (e.target.attachment) e.target.attachment.value = null;
    } catch (err) {
      setError(err.message || 'No se pudo añadir el proyecto.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input name="name" value={formData.name} onChange={handleChange} placeholder="Nombre del Proyecto" required />
        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Descripción (Opcional)" />
        <select name="client_id" value={formData.client_id} onChange={handleChange} required>
          <option value="">-- Selecciona un Cliente --</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>
              {client.business_name}
            </option>
          ))}
        </select>
        <label>Fecha de Inicio:</label>
        <input name="start_date" type="date" value={formData.start_date} onChange={handleChange} />
        <div className="cost-container">
          <input name="initial_cost" type="text" value={formData.initial_cost} onChange={handleChange} placeholder="Coste Inicial" pattern="\d*\.?\d*" inputMode="decimal" />
          <select name="currency" value={formData.currency} onChange={handleChange}>
            <option value="USD">U$S</option>
            <option value="ARS">ARS$</option>
          </select>
        </div>
        <input name="youtube_url" type="url" value={formData.youtube_url} onChange={handleChange} placeholder="URL de video de YouTube (opcional)" />
        <label htmlFor="project-attachment-upload">Adjuntar archivo principal (opcional)</label>
        <input id="project-attachment-upload" name="attachment" type="file" onChange={handleFileChange} />
        <button type="submit" disabled={submitting}>
          {submitting ? 'Añadiendo...' : 'Añadir Proyecto'}
        </button>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
}

export default AddProjectForm;