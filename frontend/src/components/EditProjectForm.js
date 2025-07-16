import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import './EditProjectForm.css';

function EditProjectForm({ project, clients, onProjectUpdated, onCancel }) {
  const [formData, setFormData] = useState({
    name: project.name || '',
    description: project.description || '',
    start_date: project.start_date || '',
    initial_cost: project.initial_cost || '',
    currency: project.currency || 'USD',
    youtube_url: project.youtube_url || '',
    status: project.status || 'NUEVO',
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Actualiza el estado del formulario si el proyecto cambia
    setFormData({
      name: project.name || '',
      description: project.description || '',
      start_date: project.start_date || '',
      initial_cost: project.initial_cost || '',
      currency: project.currency || 'USD',
      youtube_url: project.youtube_url || '',
      status: project.status || 'NUEVO',
    });
  }, [project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Usamos FormData para poder enviar el archivo adjunto.
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('client_id', project.client.id.toString()); // Usamos el ID del cliente actual
    data.append('currency', formData.currency);
    data.append('status', formData.status);
    
    if (formData.start_date) data.append('start_date', formData.start_date);
    if (formData.initial_cost) data.append('initial_cost', formData.initial_cost.toString()); // Enviamos como string exacto
    if (formData.youtube_url) data.append('youtube_url', formData.youtube_url);
    if (file) data.append('attachment', file);

    try {
      const response = await apiClient.patch(`/projects/${project.id}/`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      onProjectUpdated(response.data);
    } catch (err) {
      console.error("Error al actualizar el proyecto:", err);
      setError(err.response?.data?.message || 'No se pudo actualizar el proyecto.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <h3>Editar Proyecto</h3>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="form-group">
          <label>Nombre del Proyecto:</label>
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Nombre del Proyecto" required />
        </div>
        
        <div className="form-group">
          <label>Descripción:</label>
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Descripción (Opcional)" />
        </div>
        
        <div className="form-group">
          <label>Cliente:</label>
          <div className="client-display">{project.client.business_name}</div>
        </div>
        
        <div className="form-group">
          <label>Estado del Proyecto:</label>
          <select name="status" value={formData.status} onChange={handleChange} required>
            <option value="NUEVO">Nuevo</option>
            <option value="EN_PROGRESO">En Progreso</option>
            <option value="EN_REVISION">En Revisión</option>
            <option value="COMPLETADO">Completado</option>
            <option value="PAUSADO">Pausado</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Fecha de Inicio:</label>
          <input name="start_date" type="date" value={formData.start_date} onChange={handleChange} />
        </div>
        
        <div className="form-group cost-container">
          <label>Coste Inicial:</label>
          <div className="cost-input-group">
            <input name="initial_cost" type="text" value={formData.initial_cost} onChange={handleChange} placeholder="Coste Inicial" pattern="\d*\.?\d*" inputMode="decimal" />
            <select name="currency" value={formData.currency} onChange={handleChange}>
              <option value="USD">U$S</option>
              <option value="ARS">ARS$</option>
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label>URL de YouTube:</label>
          <input name="youtube_url" type="url" value={formData.youtube_url} onChange={handleChange} placeholder="URL de video de YouTube (opcional)" />
        </div>
        
        <div className="form-group">
          <label>Archivo Adjunto:</label>
          <input id="project-attachment-upload" name="attachment" type="file" onChange={handleFileChange} />
          {project.attachment && (
            <div className="current-attachment">
              <p>Archivo actual: <a href={project.attachment} target="_blank" rel="noopener noreferrer">Ver archivo</a></p>
              <p className="attachment-note">(Solo se reemplazará si seleccionas un nuevo archivo)</p>
            </div>
          )}
        </div>
        
        <div className="button-group">
          <button type="button" onClick={onCancel} className="cancel-button">
            Cancelar
          </button>
          <button type="submit" disabled={submitting} className="submit-button">
            {submitting ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
        
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
}

export default EditProjectForm;
