import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ProjectList.css'; // Importamos los estilos

// Pequeña función de ayuda para formatear los números como moneda
const formatCurrency = (amount) => {
  // Convierte el string a número y luego lo formatea
  const number = parseFloat(amount);
  if (isNaN(number)) return '$0.00';
  return number.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
};

function ProjectList({ projects }) {
  // Estado para controlar qué clientes están expandidos/colapsados
  const [expandedClients, setExpandedClients] = useState({});
  
  if (!projects || projects.length === 0) {
    return <p>No hay proyectos para mostrar.</p>;
  }

  // Función para normalizar el estado para los atributos data-*
  const normalizeStatus = (status) => {
    if (!status) return "NUEVO";
    // Eliminar acentos, convertir a mayúsculas y reemplazar espacios por guiones bajos
    return status.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/ /g, "_");
  };
  
  // Agrupar proyectos por cliente
  const projectsByClient = projects.reduce((acc, project) => {
    const clientId = project.client.id;
    if (!acc[clientId]) {
      acc[clientId] = {
        clientInfo: project.client,
        projects: []
      };
    }
    acc[clientId].projects.push(project);
    return acc;
  }, {});

  // Inicializar todos los clientes como expandidos si el estado está vacío
  if (Object.keys(expandedClients).length === 0 && Object.keys(projectsByClient).length > 0) {
    const initialExpandedState = {};
    Object.keys(projectsByClient).forEach(clientId => {
      initialExpandedState[clientId] = true; // Todos expandidos inicialmente
    });
    setExpandedClients(initialExpandedState);
  }
  
  // Manejar el clic para expandir/colapsar grupos de clientes
  const toggleClientExpand = (clientId, e) => {
    e.preventDefault(); // Prevenir navegación si se hace clic en el encabezado
    setExpandedClients(prev => ({
      ...prev,
      [clientId]: !prev[clientId]
    }));
  };
  
  // Calcular totales por cliente
  const calculateClientTotals = (projects) => {
    return projects.reduce((acc, project) => {
      acc.initialCost += parseFloat(project.initial_cost || 0);
      acc.extraCost += parseFloat(project.extra_cost || 0);
      acc.totalCost += parseFloat(project.total_cost || 0);
      acc.projectCount += 1;
      acc.taskCount += project.task_count || 0;
      // Asumimos que tasks_with_cost está disponible, o si no, estimamos que la mitad tienen costo
      acc.tasksWithCostCount += project.tasks_with_cost_count || Math.ceil((project.task_count || 0) * 0.5);
      acc.tasksWithoutCostCount += project.tasks_without_cost_count || (project.task_count || 0) - (project.tasks_with_cost_count || Math.ceil((project.task_count || 0) * 0.5));
      return acc;
    }, { initialCost: 0, extraCost: 0, totalCost: 0, projectCount: 0, taskCount: 0, tasksWithCostCount: 0, tasksWithoutCostCount: 0 });
  };
  
  // Función para estimar tareas con costo y sin costo si no tenemos los datos exactos
  const estimateTaskDistribution = (project) => {
    const totalTasks = project.task_count || 0;
    // Si tenemos los valores exactos del backend, los usamos
    if (project.tasks_with_cost_count !== undefined && project.tasks_without_cost_count !== undefined) {
      return {
        withCost: project.tasks_with_cost_count,
        withoutCost: project.tasks_without_cost_count
      };
    }

    // Nuevo enfoque: si el proyecto tiene información sobre tareas_details,
    // usamos esa información para contar precisamente las tareas con coste y sin coste
    if (project.tasks_details && Array.isArray(project.tasks_details)) {
      const withCost = project.tasks_details.filter(task => parseFloat(task.cost) > 0).length;
      return {
        withCost: withCost,
        withoutCost: totalTasks - withCost
      };
    }
    
    // Si no hay costos extra, asumimos que todas las tareas están incluidas en el presupuesto inicial
    // pero esto es una aproximación, deberíamos recibir datos más precisos del backend
    if (parseFloat(project.extra_cost || 0) === 0) {
      return {
        withCost: 0,
        withoutCost: totalTasks
      };
    }
    
    // Nota: Esta es una estimación imprecisa y solo debe usarse como último recurso
    // Lo ideal es que el backend proporcione los recuentos precisos o los detalles de tareas
    // para realizar una clasificación exacta
    const tasksWithCost = Math.ceil(parseFloat(project.extra_cost || 0) / 1000); // Ajustamos estimación
    return {
      withCost: Math.min(tasksWithCost, totalTasks), // No puede ser mayor que el total
      withoutCost: Math.max(0, totalTasks - tasksWithCost)
    };
  };

  return (
    <div className="project-list-container grouped">
      {Object.entries(projectsByClient).map(([clientId, { clientInfo, projects }]) => {
        const clientTotals = calculateClientTotals(projects);
        const isExpanded = expandedClients[clientId];
        
        return (
          <div key={clientId} className="client-group">
            <div 
              className={`client-header ${isExpanded ? 'expanded' : 'collapsed'}`}
              onClick={(e) => toggleClientExpand(clientId, e)}
            >
              <div className="client-info">
                <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
                <h2 className="client-name">{clientInfo.business_name}</h2>
                <span className="project-count">{clientTotals.projectCount} proyecto{clientTotals.projectCount !== 1 ? 's' : ''}</span>
              </div>
              <div className="client-totals">
                <span>Total: <strong>{formatCurrency(clientTotals.totalCost)}</strong></span>
              </div>
            </div>
            
            {isExpanded && (
              <div className="client-projects">
                {projects.map(project => (
                  <Link 
                    to={`/projects/${project.id}`} 
                    key={project.id} 
                    className="project-card"
                    data-status={normalizeStatus(project.status)}
                  >
                    <div className="project-header">
                      <h3 className="project-name">{project.name}</h3>
                      <p className="project-status">Estado: <strong>{project.status}</strong></p>
                    </div>
                    <div className="project-costs">
                      <div className="cost-item">
                        <span>Coste Inicial:</span>
                        <strong>{formatCurrency(project.initial_cost)}</strong>
                      </div>
                      {/* Desglose de tareas por tipo - Siempre mostramos ambas categorías */}
                      <div className="tasks-breakdown">
                        {(() => {
                          const taskDistribution = estimateTaskDistribution(project);
                          return (
                            <>
                              <div className="task-type included">
                                <span>Incluidas en presupuesto:</span>
                                <strong>{taskDistribution.withoutCost}</strong>
                              </div>
                              <div className="task-type extra">
                                <span>Con coste extra:</span>
                                <strong>{taskDistribution.withCost}</strong>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                      <div className="cost-item">
                        <span>Coste Extras:</span>
                        <strong>{formatCurrency(project.extra_cost)}</strong>
                      </div>
                      <div className="cost-item total">
                        <span>Coste Total:</span>
                        <strong>{formatCurrency(project.total_cost)}</strong>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ProjectList;
