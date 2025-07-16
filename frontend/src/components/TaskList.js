import React, { useState } from 'react';
import { FaYoutube, FaPaperclip, FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import './TaskList.css';

// Helper para formatear el coste como moneda, asegurando consistencia.
const formatCurrency = (amount) => {
  const number = parseFloat(amount);
  if (isNaN(number)) return '$0.00';
  // Usamos el formato de moneda ARS que ya se usa en otras partes de la app.
  return number.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
};

function TaskList({ tasks, onToggleStatus, onUpdateTask, onDeleteTask, showProjectName = false }) {
  const [editingTaskId, setEditingTaskId] = useState(null);
  // Estado para guardar todos los datos del formulario de edición
  const [editedTaskData, setEditedTaskData] = useState({});

  const handleEditStart = (task) => {
    setEditingTaskId(task.id);
    // Al empezar a editar, llenamos el estado con los datos actuales de la tarea
    setEditedTaskData({
      title: task.title,
      description: task.description || '',
      due_date: task.due_date || '',
      status: task.status,
      cost: task.cost || '0.00',
      youtube_url: task.youtube_url || '',
      attachment: task.attachment, // Guardamos la URL del adjunto actual para mostrarla
    });
  };

  const handleEditCancel = () => {
    setEditingTaskId(null);
    setEditedTaskData({}); // Limpiamos el estado
  };

  // Manejador único para todos los cambios en los inputs del formulario
  const handleEditChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      // Si es un archivo, guardamos el objeto File
      setEditedTaskData(prevData => ({ ...prevData, [name]: files[0] }));
    } else if (name === 'cost' && type === 'number') {
      // Para el campo de coste, aseguramos que sea un valor numérico válido
      // Permitimos que el campo esté vacío durante la edición
      const costValue = value === '' ? '' : parseFloat(value);
      setEditedTaskData(prevData => ({ ...prevData, [name]: value }));
    } else {
      // Si es texto, guardamos el valor
      setEditedTaskData(prevData => ({ ...prevData, [name]: value }));
    }
  };

  const handleEditSave = async (taskId) => {
    if (!editedTaskData.title.trim()) {
      alert('El título no puede estar vacío.');
      return;
    }
    try {
      const dataToUpdate = { ...editedTaskData };
      // Si el adjunto es una URL (string), significa que el usuario no ha subido un nuevo archivo.
      // En este caso, no queremos enviar este campo en la petición PATCH,
      // para que el backend no intente procesar una URL como si fuera un archivo.
      if (typeof dataToUpdate.attachment === 'string' && dataToUpdate.attachment.startsWith('http')) {
        delete dataToUpdate.attachment;
      }
      
      // Aseguramos que el campo cost sea un número válido antes de enviarlo
      if (dataToUpdate.cost) {
        // Convertimos el string a número y aseguramos que tenga 2 decimales
        const costValue = parseFloat(dataToUpdate.cost);
        if (!isNaN(costValue)) {
          dataToUpdate.cost = costValue.toFixed(2);
        } else {
          dataToUpdate.cost = '0.00';
        }
      } else {
        dataToUpdate.cost = '0.00';
      }
      
      // CORRECCIÓN: Pasamos el objeto 'dataToUpdate' que ha sido limpiado.
      await onUpdateTask(taskId, dataToUpdate);
      handleEditCancel(); // Cerramos y limpiamos el formulario al guardar
    } catch (error) {
      console.error("Failed to save task:", error);
      alert('No se pudo guardar la tarea. Revisa los campos.');
    }
  };

  if (!tasks || tasks.length === 0) {
    return <p>No hay tareas para mostrar.</p>;
  }

  return (
    <ul className="task-list">
      {tasks.map(task => (
        <li
          key={task.id}
          // Asignamos una clase dinámica basada en el estado, ej: "status-pendiente"
          className={`task-item status-${task.status.toLowerCase()}`}
        >
          {/* Contenido principal de la tarea (siempre visible) */}
          <div className="task-item-content">
            <div className="task-main-content">
              <input
                type="checkbox"
                className="task-checkbox"
                checked={task.status === 'COMPLETADA'}
                onChange={() => onToggleStatus(task)}
              />
              <div className="task-details">
                <span className="task-title">{task.title}</span>
                <div className="task-meta">
                  {showProjectName && <small className="task-project-name">Proyecto: {task.project_name} | Cliente: {task.client_name}</small>}
                  <span className={`task-status-badge status-badge-${task.status.toLowerCase()}`}>
                    {/* Reemplazamos todos los guiones bajos por espacios para una mejor lectura */}
                    {task.status.replace(/_/g, ' ')}
                  </span>
                  <span className={`task-cost-badge ${parseFloat(task.cost) > 0 ? 'has-cost' : 'no-cost'}`}>
                    {formatCurrency(task.cost)}
                  </span>
                </div>
              </div>
            </div>
            <div className="task-actions">
              <div className="task-links">
                {task.youtube_url && <a href={task.youtube_url} target="_blank" rel="noopener noreferrer" className="task-link-icon youtube" title="Ver video en YouTube"><FaYoutube /></a>}
                {task.attachment && <a href={task.attachment} target="_blank" rel="noopener noreferrer" className="task-link-icon attachment" title="Ver archivo adjunto"><FaPaperclip /></a>}
              </div>
              <button onClick={() => handleEditStart(task)} className="task-button edit" title="Editar"><FaEdit /></button>
              <button onClick={() => onDeleteTask(task.id)} className="task-button delete" title="Eliminar"><FaTrash /></button>
            </div>
          </div>

          {/* Formulario de edición (solo se muestra si el ID coincide) */}
          {editingTaskId === task.id && (
            <div className="task-edit-container">
              <div className="task-edit-form">
                <div className="form-group">
                  <label>Título</label>
                  <input type="text" name="title" value={editedTaskData.title} onChange={handleEditChange} className="form-control" />
                </div>
                <div className="form-group">
                  <label>Descripción</label>
                  <textarea name="description" value={editedTaskData.description} onChange={handleEditChange} className="form-control" rows="3"></textarea>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Fecha Venc.</label>
                    <input type="date" name="due_date" value={editedTaskData.due_date} onChange={handleEditChange} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label>Coste Extra ($)</label>
                    <input type="number" name="cost" step="0.01" value={editedTaskData.cost} onChange={handleEditChange} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label>Estado</label>
                    <select name="status" value={editedTaskData.status} onChange={handleEditChange} className="form-control">
                      <option value="PENDIENTE">Pendiente</option>
                      <option value="EN_PROGRESO">En Progreso</option>
                      <option value="COMPLETADA">Completada</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>URL YouTube</label>
                  <input type="url" name="youtube_url" placeholder="https://..." value={editedTaskData.youtube_url} onChange={handleEditChange} className="form-control" />
                </div>
                <div className="form-group">
                  <label>Archivo Adjunto</label>
                  {/* Mostramos el enlace al archivo actual si existe */}
                  {typeof editedTaskData.attachment === 'string' && editedTaskData.attachment && (
                    <div className="current-attachment">
                      <a href={editedTaskData.attachment} target="_blank" rel="noopener noreferrer">Ver adjunto actual</a>
                      {/* Botón para marcar el archivo para ser borrado */}
                      <button onClick={() => setEditedTaskData(p => ({...p, attachment: ''}))} className="remove-attachment-btn" title="Eliminar adjunto">
                        <FaTimes />
                      </button>
                    </div>
                  )}
                  <input type="file" name="attachment" onChange={handleEditChange} className="form-control" />
                </div>
              </div>
              <div className="edit-form-actions">
                <button onClick={handleEditCancel} className="form-button cancel">Cancelar</button>
                <button onClick={() => handleEditSave(task.id)} className="form-button save">Guardar Cambios</button>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

export default TaskList;
