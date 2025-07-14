import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api';
import TaskList from '../components/TaskList';
import AddTaskForm from '../components/AddTaskForm';
import './ProjectDetail.css'; // Importamos el nuevo CSS

function ProjectDetail() {
  const { projectId } = useParams(); // Obtiene el ID del proyecto de la URL
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false); // Estado para controlar visibilidad del formulario
  const [isUpdatingTasks, setIsUpdatingTasks] = useState(false); // Estado para controlar actualizaciones parciales
  const [scrollPosition, setScrollPosition] = useState(0); // Guardar la posición del scroll

  // Referencia para mantener el elemento que debemos mantener a la vista
  const taskListRef = React.useRef(null);
  
  // Función para guardar la posición actual del scroll y el elemento relevante
  const saveScrollPosition = useCallback(() => {
    setScrollPosition(window.scrollY);
  }, []);

  // Función para restaurar la posición del scroll de manera más confiable
  const restoreScrollPosition = useCallback(() => {
    // Restauramos exactamente a la misma posición Y
    if (scrollPosition > 0) {
      window.scrollTo({
        top: scrollPosition,
        behavior: 'auto' // Instantáneo para evitar animaciones que puedan confundir
      });
    }
  }, [scrollPosition]);

  // Creamos una única función de carga de datos, envuelta en useCallback para optimización.
  // Esta función recargará tanto los detalles del proyecto como su lista de tareas.
  const fetchProjectData = useCallback(async () => {
    try {
      saveScrollPosition(); // Guardamos la posición actual del scroll
      setLoading(true);
      setError(null);
      // Obtenemos los detalles del proyecto
      const projectResponse = await apiClient.get(`/projects/${projectId}/`);
      setProject(projectResponse.data);
      // También cargamos las tareas del proyecto
      const tasksResponse = await apiClient.get(`/projects/${projectId}/tasks/`);
      setTasks(tasksResponse.data);
    } catch (err) {
      console.error("Error al cargar datos del proyecto:", err);
      setError("No se pudo cargar la información del proyecto. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
      // Restauramos la posición del scroll con varios intentos para asegurar que funcione
      // después de que el DOM se haya actualizado completamente
      setTimeout(restoreScrollPosition, 0);
      setTimeout(restoreScrollPosition, 50);
      setTimeout(restoreScrollPosition, 150);
    }
  }, [projectId, restoreScrollPosition, saveScrollPosition]); // Esta función se recalcula solo si el projectId cambia.

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  // --- MANEJADORES DE EVENTOS ---

  // Se llama desde AddTaskForm cuando se envía el formulario.
  const handleAddTask = async (taskFormData) => {
    try {
      // Enviamos los datos al backend
      const response = await apiClient.post(`/projects/${projectId}/tasks/`, taskFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      // Actualización local: agregamos la nueva tarea al estado actual
      // sin necesidad de volver a cargar toda la página
      setTasks(prevTasks => [...prevTasks, response.data]);
      
      // También podríamos actualizar el proyecto si es necesario
      // (por ejemplo, si hay contadores que necesitan actualizarse)
      // Pero no es necesario recargar todo
    } catch (err) {
      console.error("Error al crear la tarea:", err);
      // Lanzamos un error para que el componente del formulario pueda mostrar un mensaje.
      throw new Error('No se pudo crear la tarea. Inténtalo de nuevo.');
    }
  };

  // Esta función es para manejar la actualización del estado de las tareas en esta página
  const handleTaskStatusChange = async (taskToUpdate) => {
    const newStatus = taskToUpdate.status === 'PENDIENTE' ? 'COMPLETADA' : 'PENDIENTE';
    try {
      // Ya no necesitamos todo el aparato de guardar posición de scroll
      // porque no vamos a recargar toda la página
      
      // Actualización optimista para efecto inmediato
      const optimisticTask = { ...taskToUpdate, status: newStatus };
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === taskToUpdate.id ? optimisticTask : task
      ));
      
      // Hacemos la petición al backend en segundo plano
      const response = await apiClient.patch(`/tasks/${taskToUpdate.id}/`, { status: newStatus });
      
      // Confirmamos con los datos del servidor (solo actualizamos esta tarea específica)
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === taskToUpdate.id ? response.data : task
      ));
    } catch (err) {
      console.error("Error al actualizar la tarea:", err);
      // Revertimos al estado original en caso de error
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === taskToUpdate.id ? {...task, status: taskToUpdate.status} : task
      ));
      // Mostrar notificación de error al usuario
      alert('No se pudo actualizar el estado de la tarea. Inténtalo de nuevo.');
    }
  };

  // Se llama desde TaskList cuando se guarda la edición de una tarea.
  const handleTaskUpdate = async (taskId, updatedData) => {
     try {
      // Actualizamos de forma optimista en la UI primero
      // Creamos una versión local actualizada para mostrar inmediatamente
      setTasks(prevTasks => prevTasks.map(task => {
        if (task.id === taskId) {
          // Creamos una copia local de la tarea con los datos actualizados
          const updatedTask = {...task};
          Object.keys(updatedData).forEach(key => {
            if (updatedData[key] !== null && updatedData[key] !== undefined) {
              updatedTask[key] = updatedData[key];
            }
          });
          return updatedTask;
        }
        return task;
      }));
      
      // Lógica para enviar el formulario con archivos al backend
      const formData = new FormData();
      for (const key in updatedData) {
        if (updatedData[key] !== null && updatedData[key] !== undefined) {
          // Procesamiento especial para el campo cost (como en Dashboard)
          if (key === 'cost') {
            // Aseguramos que el costo se envía como un número decimal con formato correcto
            const costValue = parseFloat(updatedData[key]);
            const formattedCost = isNaN(costValue) ? '0.00' : costValue.toFixed(2);
            formData.append(key, formattedCost);
          } else {
            formData.append(key, updatedData[key]);
          }
        }
      }

      // Enviamos al backend
      const response = await apiClient.patch(`/tasks/${taskId}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Actualizamos con los datos que devolvió el servidor
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === taskId ? response.data : task
      ));
    } catch (err) {
      console.error("Error al actualizar la tarea:", err);
      // Revertir cambios optimistas
      alert('No se pudo actualizar la tarea. Inténtalo de nuevo.');
      throw new Error('No se pudo actualizar la tarea.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      // Eliminamos la tarea localmente primero (actualización optimista)
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      
      // Luego enviamos la petición al backend
      await apiClient.delete(`/tasks/${taskId}/`);
      
      // No necesitamos recargar toda la página, ya actualizamos el estado local
    } catch (err) {
      console.error("Error al eliminar la tarea:", err);
      // Revertimos la eliminación local si hubo error
      alert('No se pudo eliminar la tarea. Inténtalo de nuevo.');
      await fetchProjectData(); // Solo en caso de error recargamos todos los datos
    }
  };

  if (loading) return <div className="loading-container">Cargando proyecto...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!project) return <div className="not-found-message">Proyecto no encontrado.</div>;

  // Función para normalizar el estado para atributos data-*
  const normalizeStatus = (status) => {
    if (!status) return "NUEVO";
    // Eliminar acentos, convertir a mayúsculas y reemplazar espacios por guiones bajos
    return status.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/ /g, "_");
  };

  return (
    <div className="project-detail-container" data-status={normalizeStatus(project.status)}>
      <div className="project-header-wrapper">
        <div className="project-header-top">
          <Link to="/" className="back-link">Volver al Dashboard</Link>
          <div className="project-status-badge">{project.status}</div>
        </div>
        
        <div className="project-header-main">
          <div className="project-title-section">
            <h1>{project.name}</h1>
            <p className="project-client">{project.client.business_name}</p>
          </div>
        </div>

        <div className="project-description">
          <div className="description-content">
            <h3>Descripción del Proyecto</h3>
            <p>{project.description || 'No hay descripción para este proyecto.'}</p>
          </div>
        </div>
      </div>
      <hr className="separator" />
      {/* Formulario desplegable para crear tareas */}
      <div className={`form-container add-task-form ${showAddTaskForm ? 'expanded' : 'collapsed'}`}>
        <div 
          className="form-header" 
          onClick={() => setShowAddTaskForm(!showAddTaskForm)}
        >
          <h3>Añadir Nueva Tarea</h3>
          <button 
            type="button" 
            className="toggle-form-btn"
            aria-label={showAddTaskForm ? 'Ocultar formulario' : 'Mostrar formulario'}
          >
            <span className={`toggle-icon ${showAddTaskForm ? 'open' : ''}`}>▼</span>
          </button>
        </div>
        <div className="form-content">
          {showAddTaskForm && <AddTaskForm projectId={projectId} onTaskAdded={handleAddTask} />}
        </div>
      </div>
      <div 
        ref={taskListRef}
        className="task-list-wrapper"
      >
        <TaskList
          tasks={tasks}
          onToggleStatus={handleTaskStatusChange}
          onUpdateTask={handleTaskUpdate}
          onDeleteTask={handleDeleteTask}
          showProjectName={false} // En esta vista, ya sabemos el proyecto.
        />
      </div>
    </div>
  );
}

export default ProjectDetail;