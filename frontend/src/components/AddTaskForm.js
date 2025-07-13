import React, { useState, useEffect } from 'react';
import apiClient from '../api';

function AddTaskForm({ onTaskAdded, projectId = null }) {
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    project: projectId || '', // Pre-selecciona el proyecto si se proporciona
    due_date: '',
    cost: '', // Añadimos el campo de costo al estado inicial
    attachment: null,
    youtube_url: '',
  });
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Solo cargamos la lista de proyectos si no estamos en una página de proyecto específico
    if (!projectId) {
      apiClient.get('/projects/')
        .then(response => setProjects(response.data))
        .catch(err => console.error("Error al cargar proyectos:", err));
    }
  }, [projectId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'attachment') {
      setTaskFormData({ ...taskFormData, [name]: files[0] });
    } else {
      setTaskFormData({ ...taskFormData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!taskFormData.project) {
      setError('Debes seleccionar un proyecto.');
      return;
    }

    const formData = new FormData();
    // Añadimos todos los campos al FormData
    formData.append('project', taskFormData.project);
    formData.append('title', taskFormData.title);
    formData.append('description', taskFormData.description);
    if (taskFormData.due_date) {
      formData.append('due_date', taskFormData.due_date);
    }
    // Añadimos el costo solo si tiene un valor
    if (taskFormData.cost) {
      formData.append('cost', taskFormData.cost);
    }
    if (taskFormData.attachment) {
      formData.append('attachment', taskFormData.attachment);
    }
    if (taskFormData.youtube_url) {
      formData.append('youtube_url', taskFormData.youtube_url);
    }

    try {
      await onTaskAdded(formData);
      setSuccess('¡Tarea añadida con éxito!');
      // Limpiamos el formulario
      setTaskFormData({
        title: '',
        description: '',
        project: projectId || '',
        due_date: '',
        cost: '',
        attachment: null,
        youtube_url: '',
      });
      // Limpiamos el input de archivo manualmente
      if (e.target.attachment) e.target.attachment.value = null;
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData && typeof errorData === 'object') {
        const errorMessages = Object.values(errorData).flat().join(' ');
        setError(`Error: ${errorMessages}`);
      } else {
        setError('Error al añadir la tarea. Revisa los campos.');
      }
    }
  };

  return (
    <div className="form-container add-task-form">
      <h3>Añadir Nueva Tarea</h3>
      <form onSubmit={handleSubmit}>
        {/* El selector de proyecto solo aparece si no estamos en la página de un proyecto */}
        {!projectId && (
          <select name="project" value={taskFormData.project} onChange={handleChange} required>
            <option value="">-- Selecciona un Proyecto --</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        )}
        <input type="text" name="title" value={taskFormData.title} onChange={handleChange} placeholder="Título de la tarea" required />
        <textarea name="description" value={taskFormData.description} onChange={handleChange} placeholder="Descripción detallada (opcional)" />
        <input type="date" name="due_date" value={taskFormData.due_date} onChange={handleChange} />
        <input type="number" name="cost" value={taskFormData.cost} onChange={handleChange} placeholder="Costo (ej: 150.00)" step="0.01" />
        <input type="file" name="attachment" onChange={handleChange} />
        <input type="url" name="youtube_url" value={taskFormData.youtube_url} onChange={handleChange} placeholder="Enlace de YouTube (opcional)" />
        <button type="submit">Añadir Tarea</button>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
      </form>
    </div>
  );
}

export default AddTaskForm;