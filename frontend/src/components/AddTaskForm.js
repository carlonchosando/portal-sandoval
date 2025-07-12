import React, { useState } from 'react';

function AddTaskForm({ projectId, projects = [], onTaskAdded }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    youtube_url: '',
    project: '', // Renombrado de project_id para consistencia con la API
  });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState([]); // Cambiado a un array para múltiples mensajes

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrors(['El título es obligatorio.']);
      return;
    }
    if (!projectId && !formData.project) {
      setErrors(['Debes seleccionar un proyecto.']);
      return;
    }
    setSubmitting(true);
    setErrors([]);

    // Usamos FormData porque vamos a enviar un archivo.
    // Esta es la forma estándar de manejar "multipart/form-data".
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('project', projectId || formData.project); // Usa el ID de la prop o del selector
    if (formData.due_date) data.append('due_date', formData.due_date);
    if (formData.youtube_url) data.append('youtube_url', formData.youtube_url);
    if (file) data.append('attachment', file);

    try {
      // La función onTaskAdded (de Dashboard o ProjectDetail) recibe el objeto FormData.
      await onTaskAdded(data);
      // Limpiar el formulario después de un envío exitoso
      setFormData({ title: '', description: '', due_date: '', youtube_url: '', project: '' });
      setFile(null);
      // Si hay un input de archivo, hay que limpiarlo por separado
      if (e.target.attachment) e.target.attachment.value = null;
    } catch (err) {
      if (err.response && err.response.data) {
        // Si el backend de Django envía errores de validación, los mostramos.
        // err.response.data es un objeto como { field_name: ["error message"] }
        const errorMessages = Object.entries(err.response.data).map(([field, messages]) => {
          // Hacemos el código más robusto: comprobamos si 'messages' es un array.
          // Si lo es, lo unimos. Si no (si es un simple string), lo usamos directamente.
          const messageText = Array.isArray(messages) ? messages.join(' ') : messages;
          return `${field}: ${messageText}`;
        });
        setErrors(errorMessages.length > 0 ? errorMessages : ['Error desconocido del servidor.']);
      } else {
        setErrors([err.message || 'Ocurrió un error inesperado.']);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-container add-task-form">
      <h4>Añadir Nueva Tarea</h4>
      <form onSubmit={handleSubmit}>
        {/* El selector de proyecto solo aparece si no estamos en la página de un proyecto específico */}
        {!projectId && (
          <select name="project" value={formData.project} onChange={handleChange} required>
            <option value="">-- Selecciona un Proyecto --</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        )}
        <input name="title" type="text" value={formData.title} onChange={handleChange} placeholder="Título de la tarea" required />
        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Descripción detallada (opcional)" />
        <input name="due_date" type="date" value={formData.due_date} onChange={handleChange} title="Fecha límite" />
        <input name="youtube_url" type="url" value={formData.youtube_url} onChange={handleChange} placeholder="URL de video de YouTube (opcional)" />
        <label htmlFor="attachment-upload" className="file-upload-label">Adjuntar archivo (opcional)</label>
        <input id="attachment-upload" name="attachment" type="file" onChange={handleFileChange} />
        <button type="submit" disabled={submitting}>{submitting ? 'Añadiendo...' : 'Añadir Tarea'}</button>
        {errors.length > 0 && (
          <div className="error-message">
            {errors.map((error, index) => <p key={index}>{error}</p>)}
          </div>
        )}
      </form>
    </div>
  );
}

export default AddTaskForm;