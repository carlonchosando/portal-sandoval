import React, { useState, useEffect, useCallback, useReducer } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api';
import TaskList from '../components/TaskList';
import AddTaskForm from '../components/AddTaskForm';
import EditProjectForm from '../components/EditProjectForm';
import { toast } from 'react-toastify'; // Para notificaciones toast (asume que está instalado)
import './ProjectDetail.css'; // Importamos el nuevo CSS

// Función para formatear fechas en formato español DD/MM/YYYY
const formatDate = (dateString) => {
  if (!dateString) return 'Sin fecha de inicio';
  
  try {
    // Dividir la fecha en partes (formato ISO: YYYY-MM-DD)
    const parts = dateString.split('-');
    if (parts.length !== 3) {
      console.log('Formato de fecha incorrecto:', dateString);
      return 'Sin fecha de inicio';
    }
    
    // Extraer año, mes y día directamente
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    
    // Verificar que son números válidos
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      console.log('Componentes de fecha inválidos:', dateString);
      return 'Sin fecha de inicio';
    }
    
    // Formatear manualmente para evitar problemas de zona horaria
    return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return 'Sin fecha de inicio';
  }
};

// Función para formatear los números como moneda en formato español
const formatCurrency = (amount) => {
  // Si no hay valor o es inválido, mostramos cero
  if (!amount || isNaN(parseFloat(amount))) return '$ 0,00';
  
  // Convertimos el valor a número para asegurar que sea válido
  const numericValue = parseFloat(amount);
  
  // Formateamos con separador de miles (punto) y decimales (coma)
  const formattedValue = numericValue.toString()
    .replace('.', ',') // Primero reemplazamos el punto decimal por coma
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Luego añadimos puntos como separadores de miles
  
  const prefix = '$ ';
  return prefix + formattedValue;
};

function ProjectDetail() {
  const { projectId } = useParams(); // Obtiene el ID del proyecto de la URL
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false); // Estado para controlar visibilidad del formulario
  const [showEditProjectForm, setShowEditProjectForm] = useState(false); // Estado para mostrar formulario de edición
  const [isUpdatingTasks, setIsUpdatingTasks] = useState(false); // Estado para controlar actualizaciones parciales
  const [scrollPosition, setScrollPosition] = useState(0); // Guardar la posición del scroll
  const [projectStats, setProjectStats] = useState({
    taskCount: 0,
    tasksWithCostCount: 0,
    tasksWithoutCostCount: 0,
    extraCost: 0,
    totalCost: 0
  });
  const [clients, setClients] = useState([]); // Estado para controlar visibilidad del formulario

  // Función para recalcular estadísticas del proyecto basadas en las tareas actuales
  const recalculateProjectStats = useCallback(() => {
    if (project && tasks && tasks.length >= 0) {
      // Contamos tareas con y sin coste
      const tasksWithCost = tasks.filter(task => task.cost && parseFloat(task.cost) > 0);
      const tasksWithoutCost = tasks.filter(task => !task.cost || parseFloat(task.cost) <= 0);
      
      // Calculamos el coste extra total de las tareas
      const extraCost = tasksWithCost.reduce((sum, task) => {
        const cost = parseFloat(task.cost || 0);
        return sum + (isNaN(cost) ? 0 : cost);
      }, 0);
      
      // Calculamos el coste total del proyecto (inicial + tareas)
      const initialCost = parseFloat(project.initial_cost || 0);
      const totalCost = (isNaN(initialCost) ? 0 : initialCost) + extraCost;
      
      // Actualizamos las estadísticas
      setProjectStats({
        taskCount: tasks.length,
        tasksWithCostCount: tasksWithCost.length,
        tasksWithoutCostCount: tasksWithoutCost.length,
        extraCost: extraCost,
        totalCost: totalCost
      });
      
      // Actualizamos localmente el objeto proyecto con los nuevos cálculos
      setProject(prevProject => ({
        ...prevProject,
        extra_cost: extraCost,
        total_cost: totalCost,
        task_count: tasks.length,
        tasks_with_cost_count: tasksWithCost.length,
        tasks_without_cost_count: tasksWithoutCost.length
      }));
    }
  }, [project, tasks]);

  // Referencia para mantener el elemento que debemos mantener a la vista
  const taskListRef = React.useRef(null);
  
  // Referencia al taskList para mantener la posición de desplazamiento
  
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
      setIsUpdatingTasks(true); // Indicador de actualización
      
      // Obtenemos los detalles del proyecto
      const projectResponse = await apiClient.get(`/projects/${projectId}/`);
      setProject(projectResponse.data);
      
      // También cargamos las tareas del proyecto
      const tasksResponse = await apiClient.get(`/projects/${projectId}/tasks/`);
      setTasks(tasksResponse.data);
      
      // Notificación de éxito solo si es una recarga explícita (no la inicial)
      if (!loading) {
        toast?.success?.('Datos actualizados correctamente') || 
          console.log('Datos actualizados correctamente');
      }
    } catch (err) {
      console.error("Error al cargar datos del proyecto:", err);
      setError("No se pudo cargar la información del proyecto. Por favor, inténtalo de nuevo.");
      toast?.error?.('Error al actualizar los datos') || 
        console.error('Error al actualizar los datos');
    } finally {
      setLoading(false);
      setIsUpdatingTasks(false); // Desactivamos indicador
      // Restauramos la posición del scroll con varios intentos para asegurar que funcione
      // después de que el DOM se haya actualizado completamente
      setTimeout(restoreScrollPosition, 0);
      setTimeout(restoreScrollPosition, 50);
      setTimeout(restoreScrollPosition, 150);
    }
  }, [projectId, restoreScrollPosition, saveScrollPosition]); // Esta función se recalcula solo si el projectId cambia.

  // Cargamos los datos del proyecto cuando el componente se monta
  useEffect(() => {
    fetchProjectData();
    // Esta función solo se ejecuta la primera vez que se monta el componente
    // Siguientes actualizaciones se manejarán con estado local para mayor eficiencia
  }, [fetchProjectData]);
  
  // Efecto para recalcular estadísticas cuando cambian las tareas o el proyecto
  useEffect(() => {
    if (project && tasks && tasks.length >= 0) {
      // Contamos tareas con y sin coste
      const tasksWithCost = tasks.filter(task => task.cost && parseFloat(task.cost) > 0);
      const tasksWithoutCost = tasks.filter(task => !task.cost || parseFloat(task.cost) <= 0);
      
      // Calculamos el coste extra total de las tareas
      const extraCost = tasksWithCost.reduce((sum, task) => {
        const cost = parseFloat(task.cost || 0);
        return sum + (isNaN(cost) ? 0 : cost);
      }, 0);
      
      // Calculamos el coste total del proyecto (inicial + tareas)
      const initialCost = parseFloat(project.initial_cost || 0);
      const totalCost = (isNaN(initialCost) ? 0 : initialCost) + extraCost;
      
      // Actualizamos las estadísticas
      setProjectStats({
        taskCount: tasks.length,
        tasksWithCostCount: tasksWithCost.length,
        tasksWithoutCostCount: tasksWithoutCost.length,
        extraCost: extraCost,
        totalCost: totalCost
      });
      
      // Actualizamos localmente el objeto proyecto con los nuevos cálculos
      setProject(prevProject => ({
        ...prevProject,
        extra_cost: extraCost,
        total_cost: totalCost,
        task_count: tasks.length,
        tasks_with_cost_count: tasksWithCost.length,
        tasks_without_cost_count: tasksWithoutCost.length
      }));
    }
  }, [project?.initial_cost, tasks]);

  // --- MANEJADORES DE EVENTOS ---

  // Se llama desde AddTaskForm cuando se envía el formulario.
  const handleAddTask = async (taskFormData) => {
    try {
      // Mostramos indicador visual de carga
      setIsUpdatingTasks(true);
      
      // Enviamos la petición
      const response = await apiClient.post(`/projects/${projectId}/tasks/`, taskFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      // Si es exitosa, actualizamos la lista de tareas
      if (response.status === 201) {
        // Añadimos la nueva tarea al estado local sin necesidad de recargar todo
        const newTask = response.data;
        setTasks(prevTasks => [...prevTasks, newTask]);
        
        // Recalculamos las estadísticas inmediatamente
        // La función recalculateProjectStats se ejecutará automáticamente por su dependencia en tasks
        
        // Mostramos notificación de éxito
        toast?.success?.('Tarea creada con éxito') || alert('Tarea creada con éxito');
        
        // Ocultamos el formulario
        setShowAddTaskForm(false);
      }
    } catch (error) {
      console.error("Error al crear la tarea:", error);
      toast?.error?.('No se pudo crear la tarea') || alert('No se pudo crear la tarea. Por favor, inténtalo de nuevo.');
    } finally {
      setIsUpdatingTasks(false);
    }
  };

  // Esta función es para manejar la actualización del estado de las tareas en esta página
  const handleTaskStatusChange = async (taskToUpdate) => {
    const newStatus = taskToUpdate.status === 'PENDIENTE' ? 'COMPLETADA' : 'PENDIENTE';
    try {
      // Indicador visual de actualización
      setIsUpdatingTasks(true);
      
      // Actualización optimista para efecto inmediato
      const optimisticTask = { ...taskToUpdate, status: newStatus };
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === taskToUpdate.id ? optimisticTask : task
      ));
      
      // Enviamos la petición al servidor
      await apiClient.patch(`/tasks/${taskToUpdate.id}/`, {
        status: newStatus
      });
      
      // Mostramos notificación de éxito
      toast?.success?.(`Tarea ${newStatus === 'COMPLETADA' ? 'completada' : 'marcada como pendiente'}`) || 
        alert(`Tarea ${newStatus === 'COMPLETADA' ? 'completada' : 'marcada como pendiente'}`);
      
      // Llamamos a recalcular estadísticas (aunque en este caso no afecta a los costes)
      recalculateProjectStats();
    } catch (err) {
      console.error("Error al actualizar la tarea:", err);
      // En caso de error, revertimos el cambio optimista
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === taskToUpdate.id ? taskToUpdate : task
      ));
      toast?.error?.('No se pudo actualizar el estado de la tarea') || 
        alert('No se pudo actualizar el estado de la tarea. Inténtalo de nuevo.');
    } finally {
      setIsUpdatingTasks(false);
    }
  };

  // Se llama desde TaskList cuando se guarda la edición de una tarea.
  const handleTaskUpdate = async (taskId, updatedData) => {
    try {
      // Indicador visual de actualización
      setIsUpdatingTasks(true);
      
      // Hacemos una copia profunda de la tarea que estamos actualizando para la actualización optimista
      const taskToUpdate = tasks.find(task => task.id === taskId);
      if (!taskToUpdate) {
        throw new Error(`No se encontró la tarea con ID ${taskId}`);
      }
      
      // Creamos una versión local actualizada para mostrar inmediatamente
      const updatedTask = {...taskToUpdate};
      Object.keys(updatedData).forEach(key => {
        if (updatedData[key] !== null && updatedData[key] !== undefined) {
          updatedTask[key] = updatedData[key];
        }
      });
      
      // Actualizamos de forma optimista en la UI primero
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === taskId ? updatedTask : task
      ));
      
      // Lógica para enviar el formulario con archivos al backend
      const formData = new FormData();
      for (const key in updatedData) {
        if (updatedData[key] !== null && updatedData[key] !== undefined) {
          // Procesamiento especial para el campo cost
          if (key === 'cost') {
            // Aseguramos que el costo se envía como un número decimal con formato correcto
            const costValue = parseFloat(updatedData[key]);
            const formattedCost = isNaN(costValue) ? '0.00' : costValue.toFixed(2);
            formData.append(key, formattedCost);
          } else if (key === 'status') {
            // Aseguramos que el estado se envía correctamente
            formData.append(key, updatedData[key]);
          } else {
            formData.append(key, updatedData[key]);
          }
        }
      }
      
      // Dado que ya actualizamos el estado local, recalculamos inmediatamente las estadísticas
      // para dar feedback visual inmediato al usuario
      recalculateProjectStats();

      // Enviamos al backend (corregimos la URL para quitar la barra inicial)
      const response = await apiClient.patch(`tasks/${taskId}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Verificamos que la respuesta sea correcta
      if (!response.data) {
        throw new Error('La respuesta del servidor no incluye los datos de la tarea actualizada');
      }

      // Actualizamos la tarea específica con los datos devueltos por el servidor
      // para asegurar consistencia entre el frontend y el backend
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === taskId ? {...response.data} : task
      ));
      
      // Recargamos los datos completos para asegurar consistencia total
      setTimeout(() => {
        fetchProjectData();
      }, 300);
      
      // Mostramos notificación de éxito
      toast?.success?.('Tarea actualizada con éxito') || 
        alert('Tarea actualizada con éxito');
    } catch (error) {
      console.error("Error al actualizar la tarea:", error);
      // Revertimos al estado anterior en caso de error
      toast?.error?.(`No se pudo actualizar la tarea: ${error.message || 'Error desconocido'}`) || 
        alert('No se pudo actualizar la tarea. Por favor, inténtalo de nuevo.');
        
      // Recargamos los datos para asegurar consistencia en caso de error
      fetchProjectData();
    } finally {
      setIsUpdatingTasks(false); // Desactivamos indicador de carga
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      // Indicador visual de actualización
      setIsUpdatingTasks(true);
      
      // Guardamos la tarea que se va a eliminar para posible restauración
      const taskToDelete = tasks.find(task => task.id === taskId);
      
      // Eliminamos la tarea localmente primero (actualización optimista)
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      
      // Recalculamos inmediatamente para dar feedback visual al usuario
      // El efecto useEffect hará este recalculo automáticamente
      
      // Luego enviamos la petición al backend
      await apiClient.delete(`/tasks/${taskId}/`);
      
      // Mostramos notificación de éxito
      toast?.success?.('Tarea eliminada con éxito') || 
        alert('Tarea eliminada con éxito');
    } catch (err) {
      console.error("Error al eliminar la tarea:", err);
      // Revertimos la eliminación local si hubo error
      toast?.error?.('No se pudo eliminar la tarea') || 
        alert('No se pudo eliminar la tarea. Inténtalo de nuevo.');
      // Recargamos los datos para asegurar consistencia
      await fetchProjectData(); 
    } finally {
      setIsUpdatingTasks(false); // Desactivamos indicador de carga
    }
  };

  if (loading) return <div className="loading-container">Cargando proyecto...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!project) return <div className="not-found-message">Proyecto no encontrado.</div>;
  
  // Clases condicionales para mostrar feedback visual durante actualizaciones
  const projectInfoClass = `project-info ${isUpdatingTasks ? 'updating' : ''}`;
  const projectStatsClass = `project-stats ${isUpdatingTasks ? 'updating' : ''}`;

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
          <button 
            onClick={() => setShowEditProjectForm(true)} 
            className="edit-project-button"
          >
            <i className="fas fa-edit"></i> Editar Proyecto
          </button>
        </div>
        
        <div className="project-header-main">
          <div className="project-title-section">
            <h1>{project.name}</h1>
            <p className="project-client">{project.client.business_name}</p>
          </div>
          <div className={projectInfoClass}>
            {/* Sección de información básica */}
            <div className="project-details-section">
              <h4 className="details-section-title">Información básica</h4>
              <div className="details-items-row">
                <div className="detail-item detail-fecha-inicio">
                  <span className="detail-label">Fecha de inicio:</span>
                  <span className="detail-value">{formatDate(project.start_date)}</span>
                </div>
                <div className="detail-item detail-estado">
                  <span className="detail-label">Estado:</span>
                  <span className="detail-value status-value">{project.status}</span>
                </div>
              </div>
            </div>
            
            <div className="project-details-section">
              <h4 className="details-section-title">
                Información económica
                {isUpdatingTasks && <span className="updating-indicator"> (actualizando...)</span>}
              </h4>
              <div className="details-items-row">
                <div className="detail-item detail-coste-inicial">
                  <span className="detail-label">Coste inicial (presupuestado):</span>
                  <span className="detail-value">{formatCurrency(project.initial_cost)}</span>
                </div>
                <div className="detail-item detail-coste-extra">
                  <span className="detail-label">Coste extra (tareas):</span>
                  <span className="detail-value">{formatCurrency(project.extra_cost)}</span>
                </div>
                <div className="detail-item total-cost">
                  <span className="detail-label">Coste total:</span>
                  <span className="detail-value">{formatCurrency(project.total_cost)}</span>
                </div>
              </div>
            </div>
            
            <div className="project-details-section">
              <h4 className="details-section-title">
                Tareas
                {isUpdatingTasks && <span className="updating-indicator"> (actualizando...)</span>}
              </h4>
              <div className={`details-items-row ${isUpdatingTasks ? 'updating-items' : ''}`}>
                <div className="detail-item detail-tareas-totales">
                  <span className="detail-label">Tareas totales:</span>
                  <span className="detail-value">{project.task_count || 0}</span>
                </div>
                <div className="detail-item detail-tareas-incluidas">
                  <span className="detail-label">Tareas incluidas en presupuesto:</span>
                  <span className="detail-value">{project.tasks_without_cost_count || 0}</span>
                </div>
                <div className="detail-item detail-tareas-adicionales">
                  <span className="detail-label">Tareas con coste adicional:</span>
                  <span className="detail-value">{project.tasks_with_cost_count || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="project-description">
          <div className="description-content">
            <h3>Descripción del Proyecto</h3>
            <p>{project.description || 'No hay descripción para este proyecto.'}</p>
          </div>
        </div>
      </div>
      
      {/* Modal para editar el proyecto */}
      {showEditProjectForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <EditProjectForm 
              project={project} 
              clients={clients} 
              onProjectUpdated={(updatedProject) => {
                setProject(updatedProject);
                setShowEditProjectForm(false);
                // Recalculamos las estadísticas con el coste inicial actualizado
                calculateProjectStats(updatedProject.initial_cost, tasks);
                toast.success('¡Proyecto actualizado con éxito!');
              }} 
              onCancel={() => setShowEditProjectForm(false)} 
            />
          </div>
        </div>
      )}
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
        className={`task-list-wrapper ${isUpdatingTasks ? 'updating-task-list' : ''}`}
      >
        <div className="task-list-header">
          <h3>
            Tareas del proyecto 
            {isUpdatingTasks && <span className="updating-indicator"> (actualizando...)</span>}
          </h3>
        </div>
        <TaskList
          tasks={tasks}
          onToggleStatus={handleTaskStatusChange}
          onUpdateTask={handleTaskUpdate}
          onDeleteTask={handleDeleteTask}
          showProjectName={false} // En esta vista, ya sabemos el proyecto.
          disableActions={isUpdatingTasks} // Desactivar acciones durante actualizaciones
        />
      </div>
    </div>
  );
}

export default ProjectDetail;