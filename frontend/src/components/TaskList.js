import React, { useState } from 'react';

function TaskList({ tasks, onToggleStatus, onUpdateTask, onDeleteTask, showProjectName = true }) {
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  if (!tasks || tasks.length === 0) {
    return <p>No hay tareas para mostrar.</p>;
  }

  const handleEditClick = (task) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditingTitle('');
  };

  const handleSaveEdit = async (taskId) => {
    try {
      await onUpdateTask(taskId, { title: editingTitle });
      setEditingTaskId(null);
      setEditingTitle('');
    } catch (error) {
      console.error("Error al guardar la tarea:", error);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  };

  // Función para formatear el costo como moneda (USD, puedes cambiarlo a EUR, etc.)
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="task-list-container">
      <h3>Lista de Tareas</h3>
      <ul className="task-list">
        {tasks.map(task => (
          <li key={task.id} className={`task-item task-status-${task.status.toLowerCase()}`}>
            <div className="task-header">
              <input
                type="checkbox"
                checked={task.status === 'COMPLETADA'}
                onChange={() => onToggleStatus(task)}
                title={task.status === 'COMPLETADA' ? 'Marcar como Pendiente' : 'Marcar como Completada'}
              />
              {editingTaskId === task.id ? (
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  className="task-title-edit"
                />
              ) : (
                <span className="task-title">{task.title}</span>
              )}
              {showProjectName && task.project && (
                <span className="task-project-name">({task.project.name})</span>
              )}
            </div>
            <div className="task-details">
              {task.description && <p className="task-description">{task.description}</p>}
              <div className="task-meta">
                {task.due_date && <span>Vence: {task.due_date}</span>}
                {/* Mostramos el costo si existe y es mayor que cero */}
                {task.cost > 0 && (
                  <span className="task-cost">
                    Costo: <strong>{formatCurrency(task.cost)}</strong>
                  </span>
                )}
              </div>
              <div className="task-links">
                {task.attachment && <a href={task.attachment} target="_blank" rel="noopener noreferrer">Ver Adjunto</a>}
                {task.youtube_url && <a href={task.youtube_url} target="_blank" rel="noopener noreferrer">Ver Video</a>}
              </div>
            </div>
            <div className="task-actions">
              {editingTaskId === task.id ? (
                <>
                  <button onClick={() => handleSaveEdit(task.id)} className="button-save">Guardar</button>
                  <button onClick={handleCancelEdit} className="button-cancel">Cancelar</button>
                </>
              ) : (
                <button onClick={() => handleEditClick(task)} className="button-edit">Editar</button>
              )}
              <button onClick={() => onDeleteTask(task.id)} className="button-delete">Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskList;