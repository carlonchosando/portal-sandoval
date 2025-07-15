import React, { useState, useEffect } from 'react';
import axios from 'axios';
import apiClient from '../api'; // Importar el cliente API configurado
import { useNavigate } from 'react-router-dom';
import { FaMoneyBillWave, FaProjectDiagram, FaTasks, FaCheckCircle, FaUserTie } from 'react-icons/fa';
import './AdminDashboard.css';



const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(new Date().getFullYear() - 1 + '-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [clientId, setClientId] = useState('');
  const [clients, setClients] = useState([]);
  // Valor fijo de agrupación temporal, eliminamos el selector de la UI
  const [timeGrouping] = useState('month'); // Agrupación por mes por defecto
  const [isAdmin, setIsAdmin] = useState(false);

  const navigate = useNavigate();

  // Ya no necesitamos verificar el estado de administrador aquí
  // La verificación se hace en App.js antes de renderizar este componente
  useEffect(() => {
    const token = localStorage.getItem('accessToken'); // Usar 'accessToken' para ser consistente con App.js
    if (!token) {
      navigate('/');
      return;
    }
    
    // Si llegamos a este componente, es porque ya tenemos permisos de administrador
    setIsAdmin(true);
  }, [navigate]);

  // Cargar lista de clientes
  useEffect(() => {
    const fetchClients = async () => {
      try {
        // Usando apiClient que ya tiene configurado el baseURL y los headers
        const response = await apiClient.get('clients/');
        setClients(response.data);
      } catch (error) {
        console.error('Error cargando clientes:', error);
      }
    };

    if (isAdmin) {
      fetchClients();
    }
  }, [isAdmin]);

  // Función para cargar métricas
  const fetchMetrics = async () => {
    setLoading(true);
    try {
      // Construir la URL con parámetros de consulta
      const params = new URLSearchParams();
      params.append('start_date', startDate);
      params.append('end_date', endDate);
      params.append('time_grouping', timeGrouping);
      
      if (clientId) params.append('client_id', clientId);
      
      const response = await apiClient.get(`/admin/metrics/?${params.toString()}`);
      setMetrics(response.data);
      
      // Log para depuración
      console.log('Datos recibidos:', response.data);
      console.log('Datos de estado de tareas:', response.data.task_status);
      
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar métricas:", error);
      setError("No se pudieron cargar las métricas. Por favor, inténtalo de nuevo.");
      setLoading(false);
    }
  };

  // Cargar métricas cuando cambian los filtros o cuando se verifica que es admin
  useEffect(() => {
    if (isAdmin) {
      fetchMetrics();
    }
  }, [isAdmin]);
  
  // Cargar métricas automáticamente cuando cambia la agrupación temporal
  useEffect(() => {
    if (isAdmin) {
      fetchMetrics();
    }
  }, [timeGrouping]);

  // Función para aplicar filtros
  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchMetrics();
  };

  // Función para exportar datos (versión simplificada)
  const handleExport = () => {
    alert('Funcionalidad de exportación disponible en la próxima versión');
  };

  // Función para exportar datos a CSV


  // Si está cargando o no es admin, mostrar carga
  if (loading || !isAdmin) {
    return <div className="loading">Cargando panel administrativo...</div>;
  }

  // Si hay error, mostrar mensaje
  if (error) {
    return <div className="error-message">{error}</div>;
  }

  // Si no hay métricas, mostrar mensaje
  if (!metrics) {
    return <div className="no-data">No hay datos disponibles para mostrar.</div>;
  }





  // Formatear números para mostrar como moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <button 
          onClick={() => navigate('/')} 
          className="back-button"
        >
          &larr; Volver al Inicio
        </button>
        <h1>Panel Administrativo - Métricas Financieras</h1>
      </div>
      
      {/* Filtros */}
      <div className="filters-container">
        <form onSubmit={handleApplyFilters}>
          <div className="filter-group">
            <label>Período:</label>
            <div className="date-picker-container">
              <input 
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="date-picker"
              />
              <span>hasta</span>
              <input 
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="date-picker"
              />
            </div>
          </div>
          
          <div className="filter-group">
            <label>Cliente:</label>
            <select 
              value={clientId} 
              onChange={e => setClientId(e.target.value)}
              className="client-select"
            >
              <option value="">Todos los Clientes</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.business_name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Agrupación Temporal eliminada por simplificación de UI */}
          
          <button type="submit" className="apply-filters-btn">
            Aplicar Filtros
          </button>
        </form>
        
        <div className="export-options">
          <button onClick={handleExport} className="print-btn">
            Exportar Datos
          </button>
        </div>
      </div>
      
      {/* Contenido principal para imprimir */}
      <div className="dashboard-content">
        {/* Información del período */}
        <div className="period-info">
          <p>Período analizado: <strong>{metrics.global_metrics.filter_period.start_date}</strong> al <strong>{metrics.global_metrics.filter_period.end_date}</strong></p>
          {clientId && clients.find(c => c.id === parseInt(clientId)) && (
            <p>Cliente: <strong>{clients.find(c => c.id === parseInt(clientId)).business_name}</strong></p>
          )}
        </div>
        
        {/* Tarjetas de resumen KPI - Versión mejorada y responsiva */}
        <div className="responsive-metrics-grid">
          <div className="metric-card primary">
            <div className="metric-icon">
              <FaMoneyBillWave size={32} />
            </div>
            <div className="metric-content">
              <h3>Coste Total</h3>
              <div className="metric-value">{formatCurrency(metrics.global_metrics.total_cost)}</div>
              <div className="metric-details">Valor total de todos los proyectos y tareas</div>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon">
              <FaProjectDiagram size={32} />
            </div>
            <div className="metric-content">
              <h3>Proyectos</h3>
              <div className="metric-value">{metrics.global_metrics.total_projects}</div>
              <div className="metric-details">Total de proyectos: {formatCurrency(metrics.global_metrics.total_initial_cost)}</div>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon">
              <FaTasks size={32} />
            </div>
            <div className="metric-content">
              <h3>Tareas</h3>
              <div className="metric-value">{metrics.global_metrics.total_tasks}</div>
              <div className="metric-details">Coste: {formatCurrency(metrics.global_metrics.total_task_cost)}</div>
            </div>
          </div>
          
          {/* Sección de distribución de estado de tareas */}
          <div className="metric-card status-card">
            <div className="metric-icon">
              <FaCheckCircle size={32} />
            </div>
            <div className="metric-content">
              <h3>Estado de Tareas</h3>
              <div className="status-distribution">
                {metrics.task_status ? (
                  <div className="status-bars">
                    {Object.entries(metrics.task_status || {}).map(([status, count]) => {
                      const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_');
                      // Asegurarnos de manejar valores numéricos correctamente (similar a la solución del campo cost)
                      const totalTasks = metrics.global_metrics?.total_tasks || 0;
                      const taskCount = parseFloat(count) || 0;
                      const percentage = totalTasks > 0 
                        ? (taskCount / totalTasks) * 100 
                        : 0;
                      
                      return (
                        <div key={status} className="status-item">
                          <div className="status-label">{status} ({count})</div>
                          <div className="status-bar-container">
                            <div 
                              className={`status-bar status-${normalizedStatus}`}
                              style={{
                                width: `${percentage}%`
                              }}
                            ></div>
                            <span className="status-count">{Math.round(percentage)}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="no-data-message">No hay datos de estado disponibles</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Sección de clientes principales */}
          {metrics.client_metrics && metrics.client_metrics.length > 0 && (
            <div className="metric-card wide-card">
              <div className="metric-icon">
                <FaUserTie size={32} />
              </div>
              <div className="metric-content">
                <h3>Top Clientes</h3>
                <div className="client-list">
                  {metrics.client_metrics.slice(0, 3).map(client => (
                    <div key={client.id} className="client-item">
                      <div className="client-name">{client.name}</div>
                      <div className="client-revenue">{formatCurrency(client.total_cost)}</div>
                      <div className="client-tasks">{client.task_count} tareas</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Tabla de proyectos más costosos */}
        <div className="top-projects-section">
          <h2>Proyectos Más Costosos</h2>
          <div className="table-container">
            <table className="top-projects-table">
              <thead>
                <tr>
                  <th>Proyecto</th>
                  <th>Cliente</th>
                  <th>Coste Inicial</th>
                  <th>Coste de Tareas</th>
                  <th>Coste Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {metrics.top_projects.map((project, index) => (
                  <tr key={index}>
                    <td>{project.name}</td>
                    <td>{project.client}</td>
                    <td>{formatCurrency(project.initial_cost)}</td>
                    <td>{formatCurrency(project.task_cost)}</td>
                    <td className="total-cost">{formatCurrency(project.total_cost)}</td>
                    <td>
                      <span className={`status-badge status-${project.status.toLowerCase()}`}>
                        {project.status === 'NUEVO' ? 'Nuevo' :
                          project.status === 'EN_PROGRESO' ? 'En Progreso' :
                          project.status === 'EN_REVISION' ? 'En Revisión' :
                          project.status === 'COMPLETADO' ? 'Completado' :
                          project.status === 'PAUSADO' ? 'Pausado' : project.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Análisis por cliente (si no hay filtro de cliente) */}
        {!clientId && metrics.client_metrics.length > 0 && (
          <div className="client-metrics-section">
            <h2>Análisis por Cliente</h2>
            <div className="table-container">
              <table className="client-metrics-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Proyectos</th>
                    <th>Tareas</th>
                    <th>Tareas Completadas</th>
                    <th>Coste Inicial</th>
                    <th>Coste de Tareas</th>
                    <th>Coste Total</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.client_metrics.map((client, index) => (
                    <tr key={index}>
                      <td>{client.name}</td>
                      <td>{client.project_count}</td>
                      <td>{client.task_count}</td>
                      <td>{client.completed_tasks}</td>
                      <td>{formatCurrency(client.initial_cost)}</td>
                      <td>{formatCurrency(client.task_cost)}</td>
                      <td className="total-cost">{formatCurrency(client.total_cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Pie de página para versión impresa */}
        <div className="print-footer">
          <p>Informe generado el {new Date().toLocaleDateString()} a las {new Date().toLocaleTimeString()}</p>
          <p>Portal Sandoval - Panel Administrativo</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
