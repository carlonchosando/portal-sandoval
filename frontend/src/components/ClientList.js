import React from 'react';

// Este componente ahora es "tonto" o "presentacional".
// Solo recibe datos (props) y los muestra. No tiene lógica propia.
function ClientList({ clients }) {
  return (
    <div>
      <h2>Lista de Clientes</h2>
      {clients.length === 0 ? (
        <p>No hay clientes para mostrar.</p>
      ) : (
        <ul>
          {clients.map(client => (
            <li key={`client-${client.id}`}>
              <strong>{client.business_name}</strong> - Contacto: {client.contact_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ClientList;