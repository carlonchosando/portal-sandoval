import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api';
import ClientList from '../components/ClientList';
import ProjectList from '../components/ProjectList';
import AddTaskForm from '../components/AddTaskForm';
import TaskList from '../components/TaskList';
import AddClientForm from '../components/AddClientForm';
import AddProjectForm from '../components/AddProjectForm';
import EditClientForm from '../components/EditClientForm'; // 1. Importamos el formulario de edición
import Collapsible from '../components/Collapsible';

function Dashboard() {
  // --- ESTADO DEL DASHBOARD ---
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [archivedClients, setArchivedClients] = useState([]); // Nuevo estado para archivados
  const [editingClient, setEditingClient] = useState(null); // 2. Estado para saber a quién editamos

  // --- LÓGICA DE CARGA DE DATOS ---
  // Movemos fetchData fuera del useEffect para poder llamarla desde otros manejadores.
  // Usamos useCallback para evitar que la función se recree en cada render, optimizando el rendimiento.
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [clientsResponse, projectsResponse, tasksResponse, archivedClientsResponse] = await Promise.all([
        apiClient.get('clients/'),
        apiClient.get('projects/'),
        apiClient.get('tasks/'),
        apiClient.get('clients/archived/') // Llamamos al nuevo endpoint
      ]);
      setClients(clientsResponse.data);
      setProjects(projectsResponse.data);
      setTasks(tasksResponse.data);
      setArchivedClients(archivedClientsResponse.data);
    } catch (err) {
      setError('Hubo un problema al cargar los datos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []); // El array vacío significa que esta función nunca cambiará.

  // --- LÓGICA DE CARGA DE DATOS ---
  useEffect(() => {
    fetchData();
  }, [fetchData]); // Ahora fetchData es una dependencia.

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

  // 3. Lógica para actualizar un cliente
  const handleUpdateClient = async (clientId, updatedData) => {
    try {
      const response = await apiClient.patch(`clients/${clientId}/`, updatedData);
      // Actualizamos el cliente en la lista localmente para no recargar todo
      setClients(prevClients => prevClients.map(client => (client.id === clientId ? response.data : client)));
      setEditingClient(null); // Cerramos el formulario modal
    } catch (err) {
      console.error("Error al actualizar cliente:", err.response?.data || err.message);
      throw err; // Propagamos el error para que el formulario de edición lo muestre
    }
  };

  const handleDeleteClient = async (clientId) => {
    // El texto ahora es "archivar"
    if (window.confirm('¿Estás seguro de que quieres archivar este cliente? Podrás restaurarlo más tarde.')) {
      try {
        await apiClient.delete(`clients/${clientId}/`); // La llamada a la API no cambia
        fetchData(); // Recargamos todos los datos para que el cliente se mueva a la lista de archivados
      } catch (err) {
        console.error("Error al archivar cliente:", err.response?.data || err.message);
      }
    }
  };

  const handleRestoreClient = async (clientId) => {
    if (window.confirm('¿Restaurar este cliente a la lista de activos?')) {
      try {
        // Llamamos al nuevo endpoint 'restore' que creamos en el backend
        await apiClient.post(`clients/${clientId}/restore/`);
        fetchData(); // Recargamos todos los datos para ver el cambio
      } catch (err) {
        console.error("Error al restaurar cliente:", err.response?.data || err.message);
        alert("No se pudo restaurar el cliente.");
      }
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
        <div className="dashboard-panel">
          <TaskList tasks={tasks} onToggleStatus={handleTaskStatusChange} onDeleteTask={handleDeleteTask} onUpdateTask={handleTaskUpdate} />
        </div>
        <div className="dashboard-panel">
          {/* Ahora el formulario de edición aparecerá aquí cuando sea necesario */}
          <ClientList clients={clients} onEdit={setEditingClient} onDelete={handleDeleteClient} />
          {editingClient && (
            <EditClientForm
              client={editingClient}
              onUpdate={handleUpdateClient}
              onCancel={() => setEditingClient(null)} // Para el botón de cancelar
            />
          )}
        </div>
        <div className="dashboard-panel">
          <ProjectList projects={projects} />
        </div>
        {/* Nuevo panel para los clientes archivados */}
        <Collapsible title="🗄️ Clientes Archivados">
          <ClientList clients={archivedClients} onRestore={handleRestoreClient} isArchivedList={true} />
        </Collapsible>
      </div>
    </div>
  );
}

export default Dashboard;