import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api';
import TaskList from '../components/TaskList';
import AddTaskForm from '../components/AddTaskForm';

function ProjectDetail() {
  const { projectId } = useParams(); // Obtiene el ID del proyecto de la URL
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extraemos la lógica de fetching de tareas para poder reutilizarla.
  const fetchTasks = async () => {
    try {
      const tasksResponse = await apiClient.get(`/projects/${projectId}/tasks/`);
      setTasks(tasksResponse.data);
    } catch (err) {
      console.error("Error al cargar las tareas:", err);
      setError('No se pudieron cargar las tareas del proyecto.');
    }
  };

  useEffect(() => {
    const fetchProjectData = async () => {
      setLoading(true);
      try {
        const projectResponse = await apiClient.get(`/projects/${projectId}/`);
        setProject(projectResponse.data);
        await fetchTasks(); // Usamos la nueva función para cargar las tareas
        setError(null);
      } catch (err) {
        setError('No se pudieron cargar los datos del proyecto.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]); // Se ejecuta cada vez que el projectId de la URL cambia

  // --- MANEJADORES DE EVENTOS ---

  // Se llama desde AddTaskForm cuando se envía el formulario.
  const handleAddTask = async (taskFormData) => {
    try {
      // 1. Creamos la nueva tarea en el backend
      await apiClient.post('/tasks/', taskFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // 2. Volvemos a pedir la lista de tareas actualizada.
      // Esto es más robusto que añadir la tarea manualmente al estado
      // ya que nos aseguramos de que los datos son 100% consistentes con el servidor.
      await fetchTasks();
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
      const response = await apiClient.patch(`/tasks/${taskToUpdate.id}/`, { status: newStatus });
      setTasks(prevTasks => prevTasks.map(task => task.id === taskToUpdate.id ? response.data : task));
    } catch (err) {
      console.error("Error al actualizar la tarea:", err);
    }
  };

  // Se llama desde TaskList cuando se guarda la edición de una tarea.
  const handleTaskUpdate = async (taskId, updatedData) => {
    try {
      const response = await apiClient.patch(`/tasks/${taskId}/`, updatedData);
      // Actualizamos el estado local para reflejar el cambio del título
      setTasks(prevTasks => prevTasks.map(task => (task.id === taskId ? response.data : task)));
    } catch (err) {
      console.error("Error al actualizar la tarea:", err);
      throw new Error('No se pudo actualizar la tarea.'); // Para que el componente hijo sepa del error
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await apiClient.delete(`/tasks/${taskId}/`);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    } catch (err) {
      console.error("Error al eliminar la tarea:", err);
    }
  };

  if (loading) return <div>Cargando proyecto...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!project) return <div>Proyecto no encontrado.</div>;

  return (
    <div className="project-detail-container">
      <Link to="/" className="back-link">&larr; Volver al Dashboard</Link>
      <h1>{project.name}</h1>
      <p className="project-client">Cliente: {project.client.business_name}</p>
      <p className="project-status-detail">Estado: <strong>{project.status}</strong></p>
      <div className="project-description">
        <h3>Descripción</h3>
        <p>{project.description || 'No hay descripción para este proyecto.'}</p>
      </div>
      <hr className="separator" />
      {/* Añadimos el formulario para crear tareas */}
      <AddTaskForm projectId={projectId} onTaskAdded={handleAddTask} />
      <TaskList
        tasks={tasks}
        onToggleStatus={handleTaskStatusChange}
        onUpdateTask={handleTaskUpdate}
        onDeleteTask={handleDeleteTask}
        showProjectName={false} // En esta vista, ya sabemos el proyecto.
      />
    </div>
  );
}

export default ProjectDetail;