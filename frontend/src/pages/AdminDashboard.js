import React, { useState, useEffect } from 'react';
import axios from 'axios';
import apiClient from '../api'; // Importar el cliente API configurado
import { useNavigate } from 'react-router-dom';
import { FaMoneyBillWave, FaProjectDiagram, FaTasks, FaCheckCircle, FaUserTie } from 'react-icons/fa';
import './AdminDashboard.css';
import { useAppConfig } from '../contexts/AppConfigContext';



const AdminDashboard = () => {
  const { appName } = useAppConfig(); // Hook para obtener el nombre dinámico
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Inicializar fechas de forma más intuitiva: último mes completo
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    const firstDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(firstDayOfCurrentMonth.getFullYear(), firstDayOfCurrentMonth.getMonth() - 1, 1);
    return firstDayOfLastMonth.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  });
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

  // Función para exportar datos (CSV por defecto, Excel como opción)
  const handleExport = (format = 'csv') => {
    if (!metrics) {
      alert('No hay datos para exportar');
      return;
    }

    let content, mimeType, extension;
    
    if (format === 'excel') {
      // Generar contenido para Excel (TSV - Tab Separated Values)
      content = generateExcelContent(metrics, startDate, endDate, clientId, clients);
      mimeType = 'application/vnd.ms-excel;charset=utf-8;';
      extension = 'xls';
    } else {
      // Generar contenido CSV
      content = generateCSVContent(metrics, startDate, endDate, clientId, clients);
      mimeType = 'text/csv;charset=utf-8;';
      extension = 'csv';
    }
    
    // Crear y descargar archivo
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    // Nombre del archivo con fecha actual
    const fileName = `metricas_${startDate}_${endDate}${clientId ? '_cliente_' + clientId : ''}.${extension}`;
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Función para generar y descargar PDF usando window.print
  const handleExportPDF = async () => {
    if (!metrics) {
      alert('No hay datos para exportar');
      return;
    }

    try {
      // Usar los datos que ya tenemos en metrics (que están correctos)
      console.log('📊 USANDO DATOS DE METRICS:', metrics);
      
      // Extraer métricas ya calculadas correctamente
      const totalProjects = metrics.global_metrics?.total_projects || 0;
      const totalTasks = metrics.global_metrics?.total_tasks || 0;
      const totalInitialCost = metrics.global_metrics?.total_initial_cost || 0;
      const totalTaskCost = metrics.global_metrics?.total_task_cost || 0;
      const totalGeneralCost = metrics.global_metrics?.total_cost || (totalInitialCost + totalTaskCost);

      // Estados ya calculados
      const projectStates = metrics.project_status || {};
      const taskStates = metrics.task_status || {};
      
      // Proyectos más costosos ya calculados
      const topProjects = metrics.top_projects || [];
      
      console.log('✅ MÉTRICAS FINALES PARA PDF:');
      console.log('Total proyectos:', totalProjects);
      console.log('Total tareas:', totalTasks);
      console.log('Coste inicial total:', totalInitialCost);
      console.log('Coste tareas total:', totalTaskCost);
      console.log('Coste general total:', totalGeneralCost);

      // Crear contenido HTML para el PDF
      const selectedClient = clientId ? clients.find(c => c.id == parseInt(clientId)) : null;
      const clientName = selectedClient ? selectedClient.business_name : 'Todos los Clientes';
      

    
    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${appName} - Reporte Completo</title>
        <style>
          @page {
            size: A4;
            margin: 15mm;
          }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0;
            padding: 0;
            line-height: 1.4;
            color: #333;
            font-size: 12px;
          }
          .header { 
            text-align: center; 
            border-bottom: 3px solid #2c5530; 
            padding-bottom: 15px; 
            margin-bottom: 20px;
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            padding: 20px;
            border-radius: 8px;
          }
          .header h1 { 
            color: #2c5530; 
            margin: 0 0 10px 0;
            font-size: 22px;
            font-weight: bold;
          }
          .header p { 
            margin: 3px 0; 
            color: #666;
            font-size: 11px;
          }
          .content-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }
          .section { 
            margin: 15px 0; 
            page-break-inside: avoid;
          }
          .section h2 { 
            color: #2c5530; 
            border-bottom: 2px solid #2c5530; 
            padding-bottom: 5px;
            font-size: 16px;
            margin: 0 0 15px 0;
            font-weight: bold;
          }
          .metrics-container {
            margin: 10px 0;
          }
          .main-metric {
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            margin-bottom: 15px;
          }
          .main-cost {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-bottom: 8px;
          }
          .currency-symbol {
            font-size: 1.5em;
          }
          .main-amount {
            font-size: 2em;
            font-weight: bold;
          }
          .main-label {
            font-size: 1em;
            font-weight: bold;
            margin-bottom: 3px;
          }
          .main-subtitle {
            font-size: 0.8em;
            opacity: 0.9;
          }
          .metrics-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin: 15px 0;
          }
          .metric-card {
            background: #f8f9fa;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .metric-icon {
            font-size: 1.5em;
            margin-bottom: 8px;
          }
          .metric-number {
            font-size: 1.8em;
            font-weight: bold;
            color: #2c5530;
            margin-bottom: 3px;
          }
          .metric-label {
            font-size: 1em;
            font-weight: bold;
            color: #333;
            margin-bottom: 3px;
          }
          .metric-detail {
            font-size: 0.8em;
            color: #666;
          }
          .status-grid {
            display: flex;
            gap: 10px;
            margin: 10px 0;
            flex-wrap: wrap;
          }
          .status-item {
            padding: 8px 12px;
            background: #f8f9fa;
            border-left: 3px solid #2c5530;
            border-radius: 5px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            min-width: 120px;
            flex: 1;
          }
          .status-label {
            font-weight: bold;
            text-transform: uppercase;
            font-size: 0.8em;
          }
          .status-count {
            background: #2c5530;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-weight: bold;
            font-size: 0.8em;
          }
          .projects-table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
            background: white;
            font-size: 11px;
          }
          .projects-table th,
          .projects-table td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          .projects-table th {
            background: #2c5530;
            color: white;
            font-weight: bold;
            font-size: 10px;
            text-transform: uppercase;
          }
          .projects-table tr:nth-child(even) {
            background: #f8f9fa;
          }
          .status-badge {
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .status-en_progreso {
            background: #ff9800;
            color: white;
          }
          .status-completada {
            background: #4CAF50;
            color: white;
          }
          .status-nuevo {
            background: #2196F3;
            color: white;
          }
          .footer { 
            margin-top: 20px; 
            text-align: center; 
            font-size: 10px; 
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
          }
          
          /* Estilos para detalles de proyectos */
          .project-detail, .task-detail {
            margin: 15px 0;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background: #fafafa;
            page-break-inside: avoid;
          }
          
          .project-header, .task-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            border-bottom: 1px solid #eee;
            padding-bottom: 8px;
          }
          
          .project-header h3, .task-header h4 {
            margin: 0;
            color: #2c5530;
            font-size: 16px;
          }
          
          .task-header h4 {
            font-size: 14px;
          }
          
          .project-status, .task-status {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          
          .status-nuevo, .status-pendiente {
            background: #fff3cd;
            color: #856404;
          }
          
          .status-en_progreso, .status-en_proceso {
            background: #cce5ff;
            color: #004085;
          }
          
          .status-completado, .status-completada {
            background: #d4edda;
            color: #155724;
          }
          
          .status-cancelado, .status-cancelada {
            background: #f8d7da;
            color: #721c24;
          }
          
          .project-info p, .task-info p {
            margin: 5px 0;
            font-size: 13px;
            line-height: 1.4;
          }
          
          .project-info strong, .task-info strong {
            color: #2c5530;
          }
          
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
            .project-detail, .task-detail {
              break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏢 PORTAL SANDOVAL - REPORTE COMPLETO</h1>
          <p><strong>Período:</strong> ${startDate} hasta ${endDate}</p>
          <p><strong>Cliente:</strong> ${clientName}</p>
          <p><strong>Generado:</strong> ${new Date().toLocaleString('es-ES')}</p>
        </div>

        <!-- LAYOUT EN GRID PARA UNA SOLA PÁGINA -->
        <div class="content-grid">
          <!-- COLUMNA IZQUIERDA: MÉTRICAS -->
          <div class="left-column">
            <div class="section">
              <h2>📊 MÉTRICAS GENERALES</h2>
              <div class="main-metric">
                <div class="main-cost">
                  <span class="currency-symbol">💰</span>
                  <span class="main-amount">${formatCurrency(totalGeneralCost)}</span>
                </div>
                <div class="main-label">Coste Total</div>
                <div class="main-subtitle">Valor total de todos los proyectos y tareas</div>
              </div>
              
              <div class="metrics-grid">
                <div class="metric-card">
                  <div class="metric-icon">🏢</div>
                  <div class="metric-number">${totalProjects}</div>
                  <div class="metric-label">Proyectos</div>
                  <div class="metric-detail">Total: ${formatCurrency(totalInitialCost)}</div>
                </div>
                
                <div class="metric-card">
                  <div class="metric-icon">✅</div>
                  <div class="metric-number">${totalTasks}</div>
                  <div class="metric-label">Tareas</div>
                  <div class="metric-detail">Coste: ${formatCurrency(totalTaskCost)}</div>
                </div>
              </div>
            </div>

            <!-- ESTADOS DE TAREAS -->
            <div class="section">
              <h2>📊 Estado de Tareas</h2>
              <div class="status-grid">
                ${Object.entries(taskStates).map(([status, count]) => `
                  <div class="status-item">
                    <span class="status-label">${status.replace('_', ' ')}</span>
                    <span class="status-count">${count}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- COLUMNA DERECHA: PROYECTOS -->
          <div class="right-column">
            <div class="section">
              <h2>💰 Proyectos Más Costosos</h2>
              <table class="projects-table">
                <thead>
                  <tr>
                    <th>Proyecto</th>
                    <th>Cliente</th>
                    <th>Coste Inicial</th>
                    <th>Coste Tareas</th>
                    <th>Total</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  ${topProjects.map(project => `
                    <tr>
                      <td><strong>${project.name}</strong></td>
                      <td>${project.client}</td>
                      <td>${formatCurrency(project.initial_cost || 0)}</td>
                      <td>${formatCurrency(project.task_cost || 0)}</td>
                      <td><strong>${formatCurrency(project.total_cost || 0)}</strong></td>
                      <td><span class="status-badge status-${(project.status || 'nuevo').toLowerCase()}">${project.status || 'NUEVO'}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>





        <div class="footer">
          <p><strong>${appName} © 2025</strong></p>
          <p>Reporte generado automáticamente - ${new Date().toLocaleString('es-ES')}</p>
        </div>
      </body>
      </html>
    `;

    // Crear nombre personalizado para el PDF
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
    const clientNameForFile = clientName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_'); // Limpiar caracteres especiales
    const pdfTitle = clientId ? 
      `Reporte_${clientNameForFile}_${dateStr}` : 
      `Reporte_Portal_Sandoval_${dateStr}`;

    // Modificar el contenido HTML para incluir el título en el head
    const pdfContentWithTitle = pdfContent.replace(
      `<title>${appName} - Reporte Completo</title>`,
      `<title>${pdfTitle}</title>`
    );

    // Abrir nueva ventana y generar PDF con título personalizado
    const printWindow = window.open('', '_blank');
    printWindow.document.write(pdfContentWithTitle);
    printWindow.document.close();
    
    // Esperar a que cargue y luego imprimir
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        // Cerrar ventana después de imprimir
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      }, 500);
    };
    
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al obtener datos detallados para el PDF. Por favor, inténtalo de nuevo.');
    }
  };

  // Función para generar contenido Excel (formato TSV mejorado y estructurado)
  const generateExcelContent = (data, startDate, endDate, clientId, clients) => {
    const clientName = clientId ? clients.find(c => c.id == clientId)?.business_name || 'Cliente no encontrado' : 'Todos los Clientes';
    
    let excel = 'PORTAL SANDOVAL - REPORTE DE MÉTRICAS\t\t\t\t\n';
    excel += '===========================================\t\t\t\t\n';
    excel += `Período:\t${startDate}\thasta\t${endDate}\t\n`;
    excel += `Cliente:\t${clientName}\t\t\t\n`;
    excel += `Generado:\t${new Date().toLocaleString('es-ES')}\t\t\t\n`;
    excel += '===========================================\t\t\t\t\n';
    excel += '\t\t\t\t\n';
    
    // MÉTRICAS GENERALES - Formato mejorado
    excel += 'SECCIÓN\tCONCEPTO\tVALOR\tTIPO\n';
    excel += 'MÉTRICAS GENERALES\tTotal Proyectos\t' + (data.global_metrics?.total_projects || 0) + '\tCantidad\n';
    excel += 'MÉTRICAS GENERALES\tCoste Inicial Total\t' + (data.global_metrics?.total_initial_cost || 0) + '\tMoneda\n';
    excel += 'MÉTRICAS GENERALES\tTotal Tareas\t' + (data.global_metrics?.total_tasks || 0) + '\tCantidad\n';
    excel += 'MÉTRICAS GENERALES\tCoste Tareas Total\t' + (data.global_metrics?.total_task_cost || 0) + '\tMoneda\n';
    excel += 'MÉTRICAS GENERALES\tCoste Total General\t' + ((data.global_metrics?.total_initial_cost || 0) + (data.global_metrics?.total_task_cost || 0)) + '\tMoneda\n';
    excel += '\t\t\t\n';
    
    // ESTADOS DE PROYECTOS - Formato estructurado
    if (data.project_status) {
      Object.entries(data.project_status).forEach(([status, count]) => {
        excel += `ESTADOS PROYECTOS\t${status}\t${count}\tCantidad\n`;
      });
    }
    excel += '\t\t\t\n';
    
    // ESTADOS DE TAREAS - Formato estructurado
    if (data.task_status) {
      Object.entries(data.task_status).forEach(([status, count]) => {
        excel += `ESTADOS TAREAS\t${status}\t${count}\tCantidad\n`;
      });
    }
    excel += '\t\t\t\n';
    
    // PIE DE PÁGINA
    excel += `INFORMACIÓN\tReporte generado por ${appName}\t\t\n`;
    excel += 'INFORMACIÓN\tFecha y hora: ' + new Date().toLocaleString('es-ES') + '\t\t\n';
    
    return excel;
  };

  // Función auxiliar para generar contenido CSV completo y bonito
  const generateCSVContent = (data, startDate, endDate, clientId, clients) => {
    const clientName = clientId ? clients.find(c => c.id == clientId)?.business_name || 'Cliente no encontrado' : 'Todos los Clientes';
    
    let csv = '===========================================\n';
    csv += 'PORTAL SANDOVAL - REPORTE DE MÉTRICAS\n';
    csv += '===========================================\n';
    csv += `Período:,${startDate},hasta,${endDate}\n`;
    csv += `Cliente:,${clientName}\n`;
    csv += `Generado:,${new Date().toLocaleString('es-ES')}\n`;
    csv += '===========================================\n\n';
    
    // MÉTRICAS GENERALES - Sección principal
    csv += '📊 MÉTRICAS GENERALES\n';
    csv += '-------------------------------------------\n';
    csv += 'Concepto,Valor\n';
    csv += `Total Proyectos,${data.global_metrics?.total_projects || 0}\n`;
    csv += `Coste Inicial Total,${formatCurrency(data.global_metrics?.total_initial_cost || 0)}\n`;
    csv += `Total Tareas,${data.global_metrics?.total_tasks || 0}\n`;
    csv += `Coste Tareas Total,${formatCurrency(data.global_metrics?.total_task_cost || 0)}\n`;
    csv += `Coste Total General,${formatCurrency((data.global_metrics?.total_initial_cost || 0) + (data.global_metrics?.total_task_cost || 0))}\n\n`;
    
    // ESTADOS DE PROYECTOS - Con formato mejorado
    csv += '📋 ESTADOS DE PROYECTOS\n';
    csv += '-------------------------------------------\n';
    csv += 'Estado,Cantidad\n';
    if (data.project_status) {
      Object.entries(data.project_status).forEach(([status, count]) => {
        csv += `${status},${count}\n`;
      });
    } else {
      csv += 'Sin datos de proyectos,0\n';
    }
    csv += '\n';
    
    // ESTADOS DE TAREAS - Con formato mejorado
    csv += '✅ ESTADOS DE TAREAS\n';
    csv += '-------------------------------------------\n';
    csv += 'Estado,Cantidad\n';
    if (data.task_status) {
      Object.entries(data.task_status).forEach(([status, count]) => {
        csv += `${status},${count}\n`;
      });
    } else {
      csv += 'Sin datos de tareas,0\n';
    }
    csv += '\n';
    
    // ANÁLISIS POR CLIENTE (si hay datos detallados)
    if (data.client_analysis && data.client_analysis.length > 0) {
      csv += '👥 ANÁLISIS POR CLIENTE\n';
      csv += '-------------------------------------------\n';
      csv += 'Cliente,Proyectos,Tareas,Coste Total\n';
      data.client_analysis.forEach(client => {
        csv += `${client.client_name || 'Sin nombre'},${client.project_count || 0},${client.task_count || 0},${formatCurrency(client.total_cost || 0)}\n`;
      });
      csv += '\n';
    }
    
    // DATOS TEMPORALES (si hay tendencias)
    if (data.time_series && data.time_series.length > 0) {
      csv += '📈 TENDENCIAS TEMPORALES\n';
      csv += '-------------------------------------------\n';
      csv += 'Período,Proyectos Creados,Tareas Creadas,Coste del Período\n';
      data.time_series.forEach(period => {
        csv += `${period.period || 'Sin período'},${period.projects || 0},${period.tasks || 0},${formatCurrency(period.cost || 0)}\n`;
      });
      csv += '\n';
    }
    
    // PIE DE PÁGINA
    csv += '===========================================\n';
    csv += `Reporte generado por ${appName}\n`;
    csv += `Fecha y hora: ${new Date().toLocaleString('es-ES')}\n`;
    csv += '===========================================\n';
    
    return csv;
  };


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
        <h1>Panel Administrativo - Métricas Financieras</h1>
        <button 
          onClick={() => navigate('/')} 
          className="back-button"
        >
          VOLVER AL INICIO
        </button>
      </div>
      
      {/* Filtros */}
      <div className="filters-container">
        <form onSubmit={handleApplyFilters}>
          <div className="filters-row">
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
            
            <div className="filter-group">
              <label>Período:</label>
              <div className="date-picker-container">
                <input 
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="date-picker"
                />
                <span className="date-separator">hasta</span>
                <input 
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="date-picker"
                />
              </div>
            </div>
          </div>
        </form>
        
        <div className="actions-container">
          <button 
            onClick={handleApplyFilters} 
            className="apply-filters-btn"
          >
            Aplicar Filtros
          </button>
          
          <div className="export-options">
            <button onClick={() => handleExport('csv')} className="print-btn csv-btn">
              📊 Exportar CSV
            </button>
            <button onClick={() => handleExport('excel')} className="print-btn excel-btn">
              📈 Exportar Excel
            </button>
            <button onClick={handleExportPDF} className="print-btn pdf-btn">
              📄 Exportar PDF
            </button>
          </div>
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
          
          {/* Versión desktop - tabla tradicional */}
          <div className="table-container desktop-only">
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
                  <tr key={`desktop-${index}`}>
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
          
          {/* Versión móvil - tarjetas */}
          <div className="project-cards-container mobile-only">
            {metrics.top_projects.map((project, index) => (
              <div className="project-card" key={`mobile-${index}`}>
                <div className="project-card-header">
                  <h3>{project.name}</h3>
                  <span className={`status-badge status-${project.status.toLowerCase()}`}>
                    {project.status === 'NUEVO' ? 'Nuevo' :
                      project.status === 'EN_PROGRESO' ? 'En Progreso' :
                      project.status === 'EN_REVISION' ? 'En Revisión' :
                      project.status === 'COMPLETADO' ? 'Completado' :
                      project.status === 'PAUSADO' ? 'Pausado' : project.status}
                  </span>
                </div>
                
                <div className="project-card-body">
                  <div className="project-detail">
                    <span className="detail-label">Cliente:</span>
                    <span className="detail-value">{project.client}</span>
                  </div>
                  
                  <div className="project-detail">
                    <span className="detail-label">Coste Inicial:</span>
                    <span className="detail-value">{formatCurrency(project.initial_cost)}</span>
                  </div>
                  
                  <div className="project-detail">
                    <span className="detail-label">Coste de Tareas:</span>
                    <span className="detail-value">{formatCurrency(project.task_cost)}</span>
                  </div>
                  
                  <div className="project-detail total-cost">
                    <span className="detail-label">Coste Total:</span>
                    <span className="detail-value">{formatCurrency(project.total_cost)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Análisis por cliente (si no hay filtro de cliente) */}
        {!clientId && metrics.client_metrics.length > 0 && (
          <div className="client-metrics-section">
            <h2>Análisis por Cliente</h2>
            
            {/* Versión desktop y tablet - tabla tradicional */}
            <div className="table-container desktop-only">
              <table className="client-metrics-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Proyectos</th>
                    <th>Tareas</th>
                    <th>Completadas</th>
                    <th>Coste Inicial</th>
                    <th>Coste de Tareas</th>
                    <th>Coste Total</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.client_metrics.map((client, index) => (
                    <tr key={`desktop-client-${index}`}>
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
            
            {/* Versión móvil - tarjetas */}
            <div className="client-cards-container mobile-only">
              {metrics.client_metrics.map((client, index) => (
                <div className="client-card" key={`mobile-client-${index}`}>
                  <div className="client-card-header">
                    <h3>{client.name}</h3>
                  </div>
                  
                  <div className="client-card-body">
                    <div className="client-stats">
                      <div className="stat-item">
                        <span className="stat-value">{client.project_count}</span>
                        <span className="stat-label">Proyectos</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">{client.task_count}</span>
                        <span className="stat-label">Tareas</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">{client.completed_tasks}</span>
                        <span className="stat-label">Completadas</span>
                      </div>
                    </div>
                    
                    <div className="client-detail">
                      <span className="detail-label">Coste Inicial:</span>
                      <span className="detail-value">{formatCurrency(client.initial_cost)}</span>
                    </div>
                    
                    <div className="client-detail">
                      <span className="detail-label">Coste de Tareas:</span>
                      <span className="detail-value">{formatCurrency(client.task_cost)}</span>
                    </div>
                    
                    <div className="client-detail total-cost">
                      <span className="detail-label">Coste Total:</span>
                      <span className="detail-value">{formatCurrency(client.total_cost)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Pie de página para versión impresa */}
        <div className="print-footer">
          <p>Informe generado el {new Date().toLocaleDateString()} a las {new Date().toLocaleTimeString()}</p>
          <p>${appName} - Panel Administrativo</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
