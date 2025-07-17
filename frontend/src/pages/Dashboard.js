import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api';
import ClientList from '../components/ClientList';
import ProjectList from '../components/ProjectList';
import AddTaskForm from '../components/AddTaskForm';
import TaskList from '../components/TaskList';
import AddClientForm from '../components/AddClientForm';
import AddProjectForm from '../components/AddProjectForm';
import EditClientForm from '../components/EditClientForm'; // 1. Importamos el formulario de edición
import './TaskSection.css'; // Importamos los nuevos estilos para la sección de tareas
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
  const [showTasks, setShowTasks] = useState(false); // Estado para controlar la visibilidad de las tareas
  const [showProjects, setShowProjects] = useState(false); // Estado para controlar la visibilidad de los proyectos
  const [showClients, setShowClients] = useState(false); // Estado para controlar la visibilidad de los clientes

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
    // La creación de clientes envía JSON, así que lo especificamos.
    try {
      await apiClient.post('clients/', newClientData, {
        headers: { 'Content-Type': 'application/json' }
      });
      fetchData(); // Unificamos la lógica: siempre refrescamos los datos desde el servidor.
    } catch (err) {
      console.error("Error al añadir cliente:", err.response?.data || err.message);
      // Podríamos propagar el error para mostrarlo en el formulario
      throw err;
    }
  };

  // 3. Lógica para actualizar un cliente
  const handleUpdateClient = async (clientId, updatedData) => {
    try {
      // Actualización optimista para mejor experiencia de usuario
      const clientToUpdate = clients.find(c => c.id === clientId);
      if (clientToUpdate) {
        const optimisticClient = { ...clientToUpdate, ...updatedData };
        
        // Actualizamos localmente primero
        setClients(prevClients => prevClients.map(client => 
          client.id === clientId ? optimisticClient : client
        ));
      }
      
      // Enviamos al backend
      const response = await apiClient.patch(`clients/${clientId}/`, updatedData);
      
      // Actualizamos con los datos del servidor
      setClients(prevClients => prevClients.map(client => 
        client.id === clientId ? response.data : client
      ));
      
      setEditingClient(null); // Cerramos el formulario modal
    } catch (err) {
      console.error("Error al actualizar cliente:", err.response?.data || err.message);
      // Revertir cambios optimistas
      alert('Error al actualizar el cliente. Inténtalo de nuevo.');
      throw err; // Propagamos el error para que el formulario de edición lo muestre
    }
  };

  const handleDeleteClient = async (clientId) => {
    // El texto ahora es "archivar"
    if (window.confirm('¿Estás seguro de que quieres archivar este cliente? Podrás restaurarlo más tarde.')) {
      try {
        // Encontrar el cliente a archivar
        const clientToArchive = clients.find(c => c.id === clientId);
        
        if (clientToArchive) {
          // Actualizar localmente primero - quitar de la lista activa
          setClients(prevClients => prevClients.filter(client => client.id !== clientId));
          
          // Añadir a archivados optimistamente
          setArchivedClients(prev => [...prev, {...clientToArchive, archived: true}]);
        }
        
        // Enviar al backend a
        await apiClient.delete(`clients/${clientId}/`); // La llamada a la API no cambia
      } catch (err) {
        console.error("Error al archivar cliente:", err.response?.data || err.message);
        alert("No se pudo archivar el cliente. Inténtalo de nuevo.");
        // Revertir cambios si hay error
        fetchData();
      }
    }
  };

  const handleRestoreClient = async (clientId) => {
    if (window.confirm('¿Restaurar este cliente a la lista de activos?')) {
      try {
        // Encontrar el cliente a restaurar
        const clientToRestore = archivedClients.find(c => c.id === clientId);
        
        if (clientToRestore) {
          // Actualizar localmente - quitar de archivados
          setArchivedClients(prev => prev.filter(client => client.id !== clientId));
          
          // Añadir a activos
          const restoredClient = {...clientToRestore, archived: false};
          setClients(prev => [...prev, restoredClient]);
        }
        
        // Llamamos al endpoint 'restore' en el backend
        await apiClient.post(`clients/${clientId}/restore/`);
      } catch (err) {
        console.error("Error al restaurar cliente:", err.response?.data || err.message);
        alert("No se pudo restaurar el cliente.");
        // Revertir cambios en caso de error
        fetchData();
      }
    }
  };

  const handleProjectAdded = async (newProjectFormData) => {
    try {
      // Enviar al backend
      const response = await apiClient.post('projects/', newProjectFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Actualizar localmente con la respuesta del servidor
      // Ya que no podemos ver exactamente qué datos hay en el FormData,
      // usamos la respuesta completa del servidor para tener todos los campos
      setProjects(prevProjects => [...prevProjects, response.data]);
      
      // Actualizar las referencias del cliente si es necesario
      // No necesitamos recargar todo
    } catch (err) {
      console.error("Error al añadir proyecto:", err.response?.data || err.message);
      alert('Error al crear el proyecto. Inténtalo de nuevo.');
      throw err;
    }
  };

  const handleTaskAdded = async (newTaskFormData) => {
    try {
      // Enviar al backend
      const response = await apiClient.post('tasks/', newTaskFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Actualizar localmente con la respuesta del servidor
      setTasks(prevTasks => [...prevTasks, response.data]);
      
      // Actualizar el costo del proyecto asociado si es necesario
      // Esto es un poco más complejo porque afecta a los totales del proyecto
      // Una opción sería actualizar solo ese proyecto específico
      const projectId = response.data.project;
      if (projectId) {
        // Obtener el proyecto actualizado para tener los costes correctos
        const updatedProject = await apiClient.get(`projects/${projectId}/`);
        // Actualizar solo ese proyecto en el estado
        setProjects(prevProjects => prevProjects.map(p => 
          p.id === projectId ? updatedProject.data : p
        ));
      }
    } catch (err) {
      console.error("Error al añadir tarea:", err.response?.data || err.message);
      alert('Error al crear la tarea. Inténtalo de nuevo.');
      throw err;
    }
  };

  const handleTaskUpdate = async (taskId, updatedData) => {
    try {
      // Encontrar la tarea actual para actualización optimista
      const taskToUpdate = tasks.find(t => t.id === taskId);
      const projectId = taskToUpdate?.project;
      
      // Crear una copia optimista de la tarea actualizada
      if (taskToUpdate) {
        // Creamos una versión optimista con los cambios
        const optimisticTask = { ...taskToUpdate };
        
        // Aplicamos los cambios de los campos de texto
        for (const key in updatedData) {
          if (key !== 'attachment') { // Excluimos attachment para la actualización optimista
            optimisticTask[key] = updatedData[key];
          }
        }
        
        // Actualizamos inmediatamente en la UI
        setTasks(prevTasks => prevTasks.map(task => 
          task.id === taskId ? optimisticTask : task
        ));
      }
      
      // Para poder enviar archivos, necesitamos usar FormData, replicando la lógica de creación.
      const formData = new FormData();

      // Recorremos los datos actualizados y los añadimos al FormData.
      // Esto maneja tanto campos de texto como el nuevo archivo adjunto.
      for (const key in updatedData) {
        // Nos aseguramos de no enviar valores 'null' o 'undefined' que puedan dar problemas.
        // Si el valor es un string vacío, lo enviamos para que el backend pueda borrar el campo (ej. attachment).
        if (updatedData[key] !== null && updatedData[key] !== undefined) {
          // Procesamiento especial para el campo cost para garantizar que se envíe correctamente
          if (key === 'cost') {
            // Asegurar que se envía como string con formato decimal (backend espera esto para DecimalField)
            const costValue = parseFloat(updatedData[key]);
            if (!isNaN(costValue)) {
              formData.append(key, costValue.toFixed(2));
            } else {
              formData.append(key, '0.00');
            }
          } else {
            formData.append(key, updatedData[key]);
          }
        }
      }

      // Debugeamos el FormData para verificar lo que se está enviando
      console.log('Enviando datos de la tarea:', Object.fromEntries(formData.entries()));

      // Enviar al backend
      const response = await apiClient.patch(`tasks/${taskId}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Actualizar con los datos del servidor
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === taskId ? response.data : task
      ));
      
      // Si hay proyecto asociado y si actualizamos campos como cost que afectan al proyecto
      if (projectId && (updatedData.cost !== undefined || updatedData.status !== undefined)) {
        // Obtener el proyecto actualizado para tener los costes correctos
        const updatedProject = await apiClient.get(`projects/${projectId}/`);
        // Actualizar solo ese proyecto en el estado
        setProjects(prevProjects => prevProjects.map(p => 
          p.id === projectId ? updatedProject.data : p
        ));
      }
      
      return response.data; // Devolvemos los datos actualizados
    } catch (err) {
      console.error("Error al actualizar la tarea:", err);
      alert('Error al actualizar la tarea. Inténtalo de nuevo.');
      // Si hay error, podríamos recargar la tarea original
      if (taskId) {
        try {
          const originalTask = await apiClient.get(`tasks/${taskId}/`);
          setTasks(prevTasks => prevTasks.map(task => 
            task.id === taskId ? originalTask.data : task
          ));
        } catch (refreshErr) {
          // Si falla incluso recuperar la tarea, recargamos todo como último recurso
          console.error("Error al recuperar estado original de la tarea:", refreshErr);
        }
      }
      throw err; // Propagar el error para que el componente hijo (TaskList) pueda manejarlo
    }
  };

  const handleTaskStatusChange = async (taskToUpdate) => {
    const newStatus = taskToUpdate.status === 'PENDIENTE' ? 'COMPLETADA' : 'PENDIENTE';
    try {
      // Actualización optimista inmediata - mucho mejor experiencia de usuario
      const optimisticTask = { ...taskToUpdate, status: newStatus };
      
      // Actualizamos el estado local inmediatamente
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === taskToUpdate.id ? optimisticTask : task
      ));
      
      // Enviamos la petición al backend en segundo plano
      const response = await apiClient.patch(`tasks/${taskToUpdate.id}/`, { status: newStatus });
      
      // Confirmamos con los datos del servidor (solo esta tarea específica)
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === taskToUpdate.id ? response.data : task
      ));
      
      // Si necesitamos actualizar algún otro estado relacionado con esta tarea
      // lo haríamos aquí, pero sin recargar toda la página
    } catch (err) {
      console.error("Error al actualizar la tarea:", err);
      
      // Revertimos al estado original en caso de error
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === taskToUpdate.id ? {...task, status: taskToUpdate.status} : task
      ));
      
      alert('No se pudo actualizar el estado de la tarea. Inténtalo de nuevo.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      // Encontrar la tarea y su proyecto asociado antes de eliminarla
      const taskToDelete = tasks.find(t => t.id === taskId);
      const projectId = taskToDelete?.project;
      
      // Actualizar estado local primero - eliminar la tarea de la lista
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      
      // Enviar al backend
      await apiClient.delete(`tasks/${taskId}/`);
      
      // Si hay proyecto asociado, actualizar sus costes
      if (projectId) {
        // Obtener el proyecto actualizado para tener los costes correctos
        const updatedProject = await apiClient.get(`projects/${projectId}/`);
        // Actualizar solo ese proyecto en el estado
        setProjects(prevProjects => prevProjects.map(p => 
          p.id === projectId ? updatedProject.data : p
        ));
      }
    } catch (err) {
      console.error("Error al eliminar la tarea:", err);
      alert('Error al eliminar la tarea. Inténtalo de nuevo.');
      // Revertir cambios optimistas en caso de error
      fetchData();
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
          <div className="tasks-header">
            <h2>Lista de Tareas</h2>
            <button onClick={() => setShowTasks(!showTasks)} className="toggle-button">
              {showTasks ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          {showTasks && (
            <TaskList
              tasks={tasks}
              onToggleStatus={handleTaskStatusChange}
              onDeleteTask={handleDeleteTask}
              onUpdateTask={handleTaskUpdate}
              showProjectName={true} // Mostramos el nombre del proyecto en el dashboard
            />
          )}
        </div>
        <div className="dashboard-panel">
          <div className="tasks-header">
            <h2>Lista de Clientes</h2>
            <button onClick={() => setShowClients(!showClients)} className="toggle-button">
              {showClients ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          {showClients && (
            <>
              <ClientList 
                clients={clients} 
                onEdit={setEditingClient} 
                onDelete={handleDeleteClient}
                editingClient={editingClient}
                onUpdateClient={handleUpdateClient}
                onCancelEdit={() => setEditingClient(null)}
              />
            </>
          )}
        </div>
        <div className="dashboard-panel">
          <div className="tasks-header">
            <h2>Lista de Proyectos</h2>
            <button onClick={() => setShowProjects(!showProjects)} className="toggle-button">
              {showProjects ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          {showProjects && (
            <ProjectList projects={projects} />
          )}
        </div>
        {/* Nuevo panel para los clientes archivados */}
        <Collapsible title="🗄️ Clientes Archivados">
          <ClientList clients={archivedClients} onRestore={handleRestoreClient} isArchivedList={true} />
        </Collapsible>

        {/* Panel de acceso al Dashboard Administrativo */}
        <div className="dashboard-panel admin-access-panel">
          <h2>Herramientas de Administración</h2>
          <p>Accede al panel administrativo para ver métricas financieras detalladas y análisis de datos.</p>
          <button 
            onClick={() => window.location.href = '/admin'} 
            className="admin-dashboard-button"
          >
            🔍 Abrir Panel Administrativo
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;