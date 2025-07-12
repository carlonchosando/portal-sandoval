import React, { useState } from 'react';

function TaskList({ tasks, onToggleStatus, onUpdateTask, onDeleteTask, showProjectName = true }) {
  // --- HELPERS ---
  // Función para extraer el ID de un video de YouTube de cualquier formato de URL
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const [editingTask, setEditingTask] = useState(null); // Almacena los datos de la tarea en edición
  const [submitting, setSubmitting] = useState(false);

  const handleEditClick = (task) => {
    // Guardamos los campos que queremos editar.
    // El input de fecha necesita un string vacío en lugar de null.
    setEditingTask({
      id: task.id,
      title: task.title,
      description: task.description || '',
      due_date: task.due_date || '',
      youtube_url: task.youtube_url || ''
    });
  };

  const handleCancel = () => {
    setEditingTask(null);
  };

  // Un manejador genérico para todos los campos del formulario de edición
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingTask(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!editingTask || !onUpdateTask) return;
    setSubmitting(true);
    try {
      // Preparamos los datos para enviar a la API.
      // Si la fecha está vacía, la enviamos como null para que se borre.
      const payload = {
        title: editingTask.title,
        description: editingTask.description,
        due_date: editingTask.due_date || null,
        youtube_url: editingTask.youtube_url || null
      };
      // La función onUpdateTask viene de las props y es la que llama a la API
      await onUpdateTask(editingTask.id, payload);
      setEditingTask(null); // Cierra el formulario de edición si todo va bien
    } catch (error) {
      console.error("No se pudo actualizar la tarea", error);
      // Opcional: mostrar un error al usuario
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (taskId) => {
    // Pedimos confirmación antes de realizar una acción destructiva.
    if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea? Esta acción no se puede deshacer.')) {
      onDeleteTask(taskId);
    }
  };

  return (
    <div className="task-list-container">
      <h2>Lista de Tareas</h2>
      {tasks.length === 0 ? (
        <p>No hay tareas para mostrar.</p>
      ) : (
        <ul>
          {tasks.map(task => (
            <li key={task.id} className={`status-task-${task.status.toLowerCase()}`}>
              {editingTask && editingTask.id === task.id ? (
                // --- VISTA DE EDICIÓN ---
                <div className="task-edit-form">
                  <div className="edit-fields">
                    <label htmlFor={`title-${task.id}`}>Título:</label>
                    <input
                      id={`title-${task.id}`}
                      type="text"
                      name="title"
                      value={editingTask.title}
                      onChange={handleEditChange}
                      autoFocus
                      className="task-edit-input"
                    />
                    <label htmlFor={`description-${task.id}`}>Descripción:</label>
                    <textarea
                      id={`description-${task.id}`}
                      name="description"
                      value={editingTask.description}
                      onChange={handleEditChange}
                      className="task-edit-input"
                      rows="3"
                    />
                    <label htmlFor={`due_date-${task.id}`}>Fecha Límite:</label>
                    <input
                      id={`due_date-${task.id}`}
                      type="date" name="due_date" value={editingTask.due_date} onChange={handleEditChange} className="task-edit-input" />
                    <label htmlFor={`youtube_url-${task.id}`}>URL de YouTube:</label>
                    <input
                      id={`youtube_url-${task.id}`}
                      type="url" name="youtube_url" value={editingTask.youtube_url} onChange={handleEditChange} className="task-edit-input" placeholder="https://youtube.com/watch?v=..." />
                  </div>
                  <div className="task-actions">
                    <button onClick={handleSave} disabled={submitting} className="save-button">
                      {submitting ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button onClick={handleCancel} disabled={submitting} className="cancel-button">Cancelar</button>
                  </div>
                </div>
              ) : (
                // --- VISTA NORMAL ---
                <>
                  <div className="task-header">
                    <input
                      type="checkbox"
                      checked={task.status === 'COMPLETADA'}
                      onChange={() => onToggleStatus(task)}
                    />
                    <strong>{task.title}</strong>
                  </div>
                  {/* Mostramos la nueva información enriquecida */}
                  {task.description && <p className="task-description">{task.description}</p>}
                  
                  {getYouTubeEmbedUrl(task.youtube_url) && (
                    <div className="youtube-embed">
                      <iframe
                        src={getYouTubeEmbedUrl(task.youtube_url)}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={`Video de la tarea ${task.title}`}
                      ></iframe>
                    </div>
                  )}

                  <div className="task-details">
                    {showProjectName && task.project && <span>Proyecto: {task.project.name}</span>}
                    {task.due_date && <span className="due-date"> | Fecha Límite: {task.due_date}</span>}
                    {task.attachment && <a href={task.attachment} target="_blank" rel="noopener noreferrer" className="attachment-link">Ver Adjunto</a>}
                  </div>
                  <div className="task-footer">
                    <span className="task-status">Estado: {task.status}</span>
                    <div className="task-actions-footer">
                      {onUpdateTask && <button onClick={() => handleEditClick(task)} className="edit-button">Editar</button>}
                      {onDeleteTask && <button onClick={() => handleDelete(task.id)} className="delete-button">Eliminar</button>}
                    </div>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TaskList;