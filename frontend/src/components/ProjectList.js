import React from 'react';
import { Link } from 'react-router-dom';
import './ProjectList.css'; // Importamos los nuevos estilos

// Pequeña función de ayuda para formatear los números como moneda
const formatCurrency = (amount) => {
  // Convierte el string a número y luego lo formatea
  const number = parseFloat(amount);
  if (isNaN(number)) return '$0.00';
  return number.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
};

function ProjectList({ projects }) {
  if (!projects || projects.length === 0) {
    return <p>No hay proyectos para mostrar.</p>;
  }

  return (
    <div className="project-list-container">
      {projects.map(project => (
        <Link to={`/projects/${project.id}`} key={project.id} className="project-card">
          <div className="project-header">
            <h3 className="project-name">{project.name}</h3>
            <p className="project-client">Cliente: {project.client.business_name}</p>
            <p className="project-status">Estado: <strong>{project.status}</strong></p>
          </div>
          {/* Cambiamos la estructura para mostrar un desglose de costes más detallado */}
          <div className="project-costs">
            <div className="cost-item">
              <span>Coste Inicial:</span>
              <strong>{formatCurrency(project.initial_cost)}</strong>
            </div>
            <div className="cost-item">
              <span>Coste Extras ({project.task_count} tareas):</span>
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
  );
}

export default ProjectList;
