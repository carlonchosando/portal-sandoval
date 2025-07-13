import React from 'react';

// Este componente ahora es "tonto" o "presentacional".
// Solo recibe datos (props) y los muestra. No tiene lógica propia.
function ClientList({ clients, onEdit, onDelete, onRestore, isArchivedList = false }) {  
  // Función para formatear el costo como moneda
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '$0.00';
    return new Intl.NumberFormat('es-AR', { // Puedes cambiar 'es-AR' a tu localización
      style: 'currency',
      currency: 'ARS', // Puedes cambiar 'ARS' a tu moneda
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
            <li key={`client-${client.id}`}>
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
          ))}
        </ul>
      )}
    </div>
  );
}

export default ClientList;