import React from 'react';
import EditClientForm from './EditClientForm'; // Asegúrate de que esta ruta de importación sea correcta
import './ClientList.css'; // Importamos los estilos mejorados para la modal de edición

// Este componente ahora recibe también editingClient y las funciones relacionadas
function ClientList({ clients, onEdit, onDelete, onRestore, isArchivedList = false, editingClient, onUpdateClient, onCancelEdit }) {  
  // Función para formatear el costo como moneda
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '$0.00';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(value);
  };
  return (
    <div className="list-container">
      <h2>{isArchivedList ? 'Clientes Archivados' : 'Lista de Clientes'}</h2>
      {clients.length === 0 ? (
        <p>No hay clientes para mostrar.</p>
      ) : (
        <ul className={isArchivedList ? 'archived-list' : ''}>
          {clients.map(client => (
            <React.Fragment key={`client-${client.id}`}>
              <li>
                <div className="item-main-info">
                  <div className="item-info">
                    <strong>{client.business_name}</strong> - Contacto: {client.contact_name}
                  </div>
                  {/* Solo mostramos los costes para clientes activos */}
                  {!isArchivedList && (
                    <div className="item-costs">
                      <span>Inicial: {formatCurrency(client.initial_cost)}</span>
                      <span>Extra: {formatCurrency(client.extra_cost)}</span>
                      <span>Total: <strong>{formatCurrency(client.total_cost)}</strong></span>
                    </div>
                  )}
                </div>
                <div className="item-actions">
                  {/* Solo mostramos los botones si nos pasan las funciones */}
                  {onEdit && <button onClick={() => onEdit(client)} className="button-edit">Editar</button>}
                  {onDelete && <button onClick={() => onDelete(client.id)} className="button-delete">Archivar</button>}
                  {onRestore && <button onClick={() => onRestore(client.id)} className="button-restore">Restaurar</button>}
                </div>
              </li>
              {/* Renderizar el formulario de edición directamente después del cliente si es el que se está editando */}
              {editingClient && editingClient.id === client.id && (
                <li className="edit-form-row">
                  <EditClientForm
                    client={editingClient}
                    onUpdate={onUpdateClient}
                    onCancel={onCancelEdit}
                  />
                </li>
              )}
            </React.Fragment>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ClientList;