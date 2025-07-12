import React from 'react';
import { Link } from 'react-router-dom';

function ProjectList({ projects }) {
  return (
    <div className="project-list-container">
      <h2>Lista de Proyectos</h2>
      {projects.length === 0 ? (
        <p>No hay proyectos para mostrar.</p>
      ) : (
        <ul>
          {projects.map(project => (
            <li key={project.id} className={`status-${project.status.toLowerCase()}`}>
              <Link to={`/projects/${project.id}`} className="project-link">
                <strong>{project.name}</strong>
              </Link>
              <div className="project-details">Cliente: {project.client.business_name}</div>
              <div className="project-status">Estado: {project.status}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ProjectList;