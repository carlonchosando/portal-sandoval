import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import ClientList from '../components/ClientList';
import ProjectList from '../components/ProjectList';
import AddTaskForm from '../components/AddTaskForm';
import TaskList from '../components/TaskList';
import AddClientForm from '../components/AddClientForm';
import AddProjectForm from '../components/AddProjectForm';
import Collapsible from '../components/Collapsible';

function Dashboard() {
  // --- ESTADO DEL DASHBOARD ---
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- LÓGICA DE CARGA DE DATOS ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [clientsResponse, projectsResponse, tasksResponse] = await Promise.all([
          apiClient.get('clients/'),
          apiClient.get('projects/'),
          apiClient.get('tasks/')
        ]);
        setClients(clientsResponse.data);
        setProjects(projectsResponse.data);
        setTasks(tasksResponse.data);
      } catch (err) {
        setError('Hubo un problema al cargar los datos.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- MANEJADORES DE EVENTOS ---
  const handleClientAdded = async (newClientData) => {
    try {
      const response = await apiClient.post('clients/', newClientData);
      setClients(prevClients => [response.data, ...prevClients]);
    } catch (err) {
      console.error("Error al añadir cliente:", err.response?.data || err.message);
      // Podríamos propagar el error para mostrarlo en el formulario
      throw err;
    }
  };

  const handleProjectAdded = async (newProjectFormData) => {
    try {
      const response = await apiClient.post('projects/', newProjectFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setProjects(prevProjects => [response.data, ...prevProjects]);
    } catch (err) {
      console.error("Error al añadir proyecto:", err.response?.data || err.message);
      throw err;
    }
  };

  const handleTaskAdded = async (newTaskFormData) => {
    try {
      const response = await apiClient.post('tasks/', newTaskFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setTasks(prevTasks => [response.data, ...prevTasks]);
    } catch (err) {
      console.error("Error al añadir tarea:", err.response?.data || err.message);
      throw err;
    }
  };

  const handleTaskUpdate = async (taskId, updatedData) => {
    try {
      const response = await apiClient.patch(`tasks/${taskId}/`, updatedData);
      setTasks(prevTasks => prevTasks.map(task => (task.id === taskId ? response.data : task)));
    } catch (err) {
      console.error("Error al actualizar la tarea:", err);
      throw err; // Propagar el error para que el componente hijo (TaskList) pueda manejarlo
    }
  };

  const handleTaskStatusChange = async (taskToUpdate) => {
    const newStatus = taskToUpdate.status === 'PENDIENTE' ? 'COMPLETADA' : 'PENDIENTE';
    try {
      const response = await apiClient.patch(`tasks/${taskToUpdate.id}/`, { status: newStatus });
      setTasks(prevTasks => prevTasks.map(task => task.id === taskToUpdate.id ? response.data : task));
    } catch (err) {
      console.error("Error al actualizar la tarea:", err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await apiClient.delete(`tasks/${taskId}/`);
      // Actualizamos el estado para que la tarea desaparezca de la UI inmediatamente.
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    } catch (err) {
      console.error("Error al eliminar la tarea:", err);
    }
  };

  if (loading) return <div>Cargando datos...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="layout-grid">
      <div className="column">
        {/* Envolvemos los formularios en componentes colapsables para una UI más limpia */}
        <Collapsible title="➕ Añadir Nuevo Cliente">
          <AddClientForm onClientAdded={handleClientAdded} />
        </Collapsible>
        <Collapsible title="➕ Añadir Nuevo Proyecto">
          <AddProjectForm clients={clients} onProjectAdded={handleProjectAdded} />
        </Collapsible>
        <Collapsible title="➕ Añadir Nueva Tarea">
          <AddTaskForm projects={projects} onTaskAdded={handleTaskAdded} />
        </Collapsible>
      </div>
      <div className="column">
        {/* Pasamos la prop onUpdateTask que faltaba */}
        <TaskList tasks={tasks} onToggleStatus={handleTaskStatusChange} onDeleteTask={handleDeleteTask} onUpdateTask={handleTaskUpdate} />
        <hr className="separator" />
        <ClientList clients={clients} />
        <ProjectList projects={projects} />
      </div>
    </div>
  );
}

export default Dashboard;