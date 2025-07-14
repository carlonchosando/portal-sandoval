import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddClientForm from './AddClientForm';

describe('AddClientForm Component', () => {
  /**
   * TEST 1: Verifica que el formulario renderiza correctamente con todos sus campos
   * Este test básico asegura que la interfaz de usuario está presente
   */
  test('renderiza el formulario con todos los campos requeridos', () => {
    render(<AddClientForm onClientAdded={jest.fn()} />);
    
    // Verificar campos de información de negocio
    expect(screen.getByPlaceholderText('Nombre del Negocio')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Persona de Contacto')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Teléfono (Opcional)')).toBeInTheDocument();
    
    // Verificar campos de credenciales
    expect(screen.getByPlaceholderText('Nombre de usuario')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    
    // Verificar botón de envío
    expect(screen.getByRole('button', { name: /añadir cliente/i })).toBeInTheDocument();
  });

  /**
   * TEST 2: Verifica que el usuario puede completar el formulario
   * Este test simula la interacción del usuario con todos los campos
   */
  test('permite al usuario escribir en todos los campos', () => {
    render(<AddClientForm onClientAdded={jest.fn()} />);
    
    // Simular entrada de usuario en cada campo
    const businessNameInput = screen.getByPlaceholderText('Nombre del Negocio');
    fireEvent.change(businessNameInput, { target: { value: 'Empresa Test' } });
    expect(businessNameInput.value).toBe('Empresa Test');
    
    const contactNameInput = screen.getByPlaceholderText('Persona de Contacto');
    fireEvent.change(contactNameInput, { target: { value: 'Juan Pérez' } });
    expect(contactNameInput.value).toBe('Juan Pérez');
    
    const phoneInput = screen.getByPlaceholderText('Teléfono (Opcional)');
    fireEvent.change(phoneInput, { target: { value: '123456789' } });
    expect(phoneInput.value).toBe('123456789');
    
    const usernameInput = screen.getByPlaceholderText('Nombre de usuario');
    fireEvent.change(usernameInput, { target: { value: 'juanperez' } });
    expect(usernameInput.value).toBe('juanperez');
    
    const emailInput = screen.getByPlaceholderText('Email');
    fireEvent.change(emailInput, { target: { value: 'juan@test.com' } });
    expect(emailInput.value).toBe('juan@test.com');
    
    const passwordInput = screen.getByPlaceholderText('Contraseña');
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    expect(passwordInput.value).toBe('password123');
  });

  /**
   * TEST 3: Verifica el envío exitoso del formulario
   * Este test comprueba que los datos se envían correctamente al callback
   */
  test('envía los datos del formulario correctamente', async () => {
    // Mock de la función onClientAdded para verificar que se llama con los datos correctos
    const mockOnClientAdded = jest.fn().mockResolvedValue({});
    
    render(<AddClientForm onClientAdded={mockOnClientAdded} />);
    
    // Completar el formulario
    fireEvent.change(screen.getByPlaceholderText('Nombre del Negocio'), { 
      target: { value: 'Empresa Test' } 
    });
    
    fireEvent.change(screen.getByPlaceholderText('Persona de Contacto'), { 
      target: { value: 'Juan Pérez' } 
    });
    
    fireEvent.change(screen.getByPlaceholderText('Teléfono (Opcional)'), { 
      target: { value: '123456789' } 
    });
    
    fireEvent.change(screen.getByPlaceholderText('Nombre de usuario'), { 
      target: { value: 'juanperez' } 
    });
    
    fireEvent.change(screen.getByPlaceholderText('Email'), { 
      target: { value: 'juan@test.com' } 
    });
    
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { 
      target: { value: 'password123' } 
    });
    
    // Enviar el formulario
    fireEvent.click(screen.getByRole('button', { name: /añadir cliente/i }));
    
    // Verificar que se llamó a onClientAdded con los datos correctos
    await waitFor(() => {
      expect(mockOnClientAdded).toHaveBeenCalledWith({
        business_name: 'Empresa Test',
        contact_name: 'Juan Pérez',
        phone: '123456789',
        username: 'juanperez',
        email: 'juan@test.com',
        password: 'password123'
      });
    });
  });

  /**
   * TEST 4: Verifica que el formulario se resetea después de un envío exitoso
   * Este test comprueba que los campos se limpian después del envío
   */
  test('resetea el formulario después de un envío exitoso', async () => {
    const mockOnClientAdded = jest.fn().mockResolvedValue({});
    
    render(<AddClientForm onClientAdded={mockOnClientAdded} />);
    
    // Completar solo los campos requeridos
    fireEvent.change(screen.getByPlaceholderText('Nombre del Negocio'), { 
      target: { value: 'Empresa Test' } 
    });
    
    fireEvent.change(screen.getByPlaceholderText('Persona de Contacto'), { 
      target: { value: 'Juan Pérez' } 
    });
    
    fireEvent.change(screen.getByPlaceholderText('Nombre de usuario'), { 
      target: { value: 'juanperez' } 
    });
    
    fireEvent.change(screen.getByPlaceholderText('Email'), { 
      target: { value: 'juan@test.com' } 
    });
    
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { 
      target: { value: 'password123' } 
    });
    
    // Enviar el formulario
    fireEvent.click(screen.getByRole('button', { name: /añadir cliente/i }));
    
    // Verificar que se resetean los campos
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nombre del Negocio').value).toBe('');
      expect(screen.getByPlaceholderText('Persona de Contacto').value).toBe('');
      expect(screen.getByPlaceholderText('Nombre de usuario').value).toBe('');
      expect(screen.getByPlaceholderText('Email').value).toBe('');
      expect(screen.getByPlaceholderText('Contraseña').value).toBe('');
    });
  });

  /**
   * TEST 5: Verifica que se muestra un mensaje de error cuando falla el envío
   * Este test simula un error en la respuesta del servidor
   */
  test('muestra mensaje de error cuando falla el envío', async () => {
    // Mock que simula un error
    const mockError = new Error('Error al crear cliente');
    const mockOnClientAdded = jest.fn().mockRejectedValue(mockError);
    
    render(<AddClientForm onClientAdded={mockOnClientAdded} />);
    
    // Completar los campos requeridos
    fireEvent.change(screen.getByPlaceholderText('Nombre del Negocio'), { 
      target: { value: 'Empresa Test' } 
    });
    
    fireEvent.change(screen.getByPlaceholderText('Persona de Contacto'), { 
      target: { value: 'Juan Pérez' } 
    });
    
    fireEvent.change(screen.getByPlaceholderText('Nombre de usuario'), { 
      target: { value: 'juanperez' } 
    });
    
    fireEvent.change(screen.getByPlaceholderText('Email'), { 
      target: { value: 'juan@test.com' } 
    });
    
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { 
      target: { value: 'password123' } 
    });
    
    // Enviar el formulario
    fireEvent.click(screen.getByRole('button', { name: /añadir cliente/i }));
    
    // Verificar que se muestra el mensaje de error
    await waitFor(() => {
      expect(screen.getByText('Error al crear cliente')).toBeInTheDocument();
    });
  });

  /**
   * TEST 6: Verifica el cambio de estado del botón durante el envío
   * Este test comprueba la retroalimentación visual durante el proceso de envío
   */
  test('deshabilita el botón durante el envío y muestra texto de carga', async () => {
    // Creamos una promesa que podemos resolver manualmente para controlar el tiempo
    let resolvePromise;
    const pendingPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });
    
    const mockOnClientAdded = jest.fn(() => pendingPromise);
    
    render(<AddClientForm onClientAdded={mockOnClientAdded} />);
    
    // Completar campos mínimos requeridos
    fireEvent.change(screen.getByPlaceholderText('Nombre del Negocio'), { 
      target: { value: 'Test' } 
    });
    
    fireEvent.change(screen.getByPlaceholderText('Persona de Contacto'), { 
      target: { value: 'Test' } 
    });
    
    fireEvent.change(screen.getByPlaceholderText('Nombre de usuario'), { 
      target: { value: 'test' } 
    });
    
    fireEvent.change(screen.getByPlaceholderText('Email'), { 
      target: { value: 'test@test.com' } 
    });
    
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { 
      target: { value: 'password' } 
    });
    
    // Enviar el formulario
    fireEvent.click(screen.getByRole('button'));
    
    // Verificar estado de carga
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveTextContent('Añadiendo...');
    
    // Resolver la promesa para finalizar el test
    resolvePromise({});
    
    // Verificar que vuelve al estado normal
    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled();
      expect(screen.getByRole('button')).toHaveTextContent('Añadir Cliente');
    });
  });
});
