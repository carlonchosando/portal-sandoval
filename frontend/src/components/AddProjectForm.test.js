import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddProjectForm from './AddProjectForm';

describe('AddProjectForm Component', () => {
  // Datos de ejemplo para las pruebas
  const mockClients = [
    { id: 1, business_name: 'Cliente Test 1' },
    { id: 2, business_name: 'Cliente Test 2' }
  ];

  /**
   * TEST 1: Verificación de renderizado básico
   * Comprueba que todos los elementos del formulario se renderizan correctamente
   */
  test('renderiza el formulario con todos los campos requeridos', () => {
    render(<AddProjectForm clients={mockClients} onProjectAdded={jest.fn()} />);
    
    // Verificar campos principales
    expect(screen.getByPlaceholderText('Nombre del Proyecto')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Descripción (Opcional)')).toBeInTheDocument();
    
    // Verificar selector de cliente
    const clientSelect = screen.getByRole('combobox', { name: '' });
    expect(clientSelect).toBeInTheDocument();
    expect(screen.getByText('-- Selecciona un Cliente --')).toBeInTheDocument();
    
    // Verificar opciones de clientes
    expect(screen.getByText('Cliente Test 1')).toBeInTheDocument();
    expect(screen.getByText('Cliente Test 2')).toBeInTheDocument();
    
    // Verificar campos adicionales
    expect(screen.getByLabelText('Fecha de Inicio:')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Coste Inicial')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: '' })).toBeInTheDocument(); // selector de moneda
    expect(screen.getByPlaceholderText('URL de video de YouTube (opcional)')).toBeInTheDocument();
    
    // Verificar campo de archivo
    expect(screen.getByLabelText('Adjuntar archivo principal (opcional)')).toBeInTheDocument();
    
    // Verificar botón de envío
    expect(screen.getByRole('button', { name: /añadir proyecto/i })).toBeInTheDocument();
  });

  /**
   * TEST 2: Verificación de interacción con formulario
   * Comprueba que los campos del formulario responden correctamente a las interacciones del usuario
   */
  test('permite al usuario completar todos los campos del formulario', () => {
    render(<AddProjectForm clients={mockClients} onProjectAdded={jest.fn()} />);
    
    // Completar nombre del proyecto
    const nameInput = screen.getByPlaceholderText('Nombre del Proyecto');
    fireEvent.change(nameInput, { target: { value: 'Proyecto de Prueba' } });
    expect(nameInput.value).toBe('Proyecto de Prueba');
    
    // Completar descripción
    const descriptionInput = screen.getByPlaceholderText('Descripción (Opcional)');
    fireEvent.change(descriptionInput, { target: { value: 'Esta es una descripción de prueba' } });
    expect(descriptionInput.value).toBe('Esta es una descripción de prueba');
    
    // Seleccionar cliente
    const clientSelect = screen.getByRole('combobox', { name: '' });
    fireEvent.change(clientSelect, { target: { value: '1' } });
    expect(clientSelect.value).toBe('1');
    
    // Establecer fecha de inicio
    const dateInput = screen.getByLabelText('Fecha de Inicio:');
    fireEvent.change(dateInput, { target: { value: '2025-07-15' } });
    expect(dateInput.value).toBe('2025-07-15');
    
    // Establecer coste inicial
    const costInput = screen.getByPlaceholderText('Coste Inicial');
    fireEvent.change(costInput, { target: { value: '1500.50' } });
    expect(costInput.value).toBe('1500.50');
    
    // Cambiar moneda
    const currencySelect = screen.getAllByRole('combobox')[1]; // El segundo combobox es el de moneda
    fireEvent.change(currencySelect, { target: { value: 'ARS' } });
    expect(currencySelect.value).toBe('ARS');
    
    // Añadir URL de YouTube
    const youtubeInput = screen.getByPlaceholderText('URL de video de YouTube (opcional)');
    fireEvent.change(youtubeInput, { target: { value: 'https://youtube.com/watch?v=12345' } });
    expect(youtubeInput.value).toBe('https://youtube.com/watch?v=12345');
  });

  /**
   * TEST 3: Validación del formulario
   * Comprueba que la validación funciona correctamente cuando faltan campos requeridos
   */
  test('muestra error cuando se intenta enviar sin seleccionar cliente', async () => {
    render(<AddProjectForm clients={mockClients} onProjectAdded={jest.fn()} />);
    
    // Completar solo el nombre (campo requerido)
    fireEvent.change(screen.getByPlaceholderText('Nombre del Proyecto'), { 
      target: { value: 'Proyecto de Prueba' } 
    });
    
    // Intentar enviar el formulario sin seleccionar cliente
    fireEvent.click(screen.getByRole('button', { name: /añadir proyecto/i }));
    
    // Verificar mensaje de error
    await waitFor(() => {
      expect(screen.getByText('Debes seleccionar un cliente.')).toBeInTheDocument();
    });
  });

  /**
   * TEST 4: Envío exitoso del formulario
   * Comprueba que el formulario se envía correctamente y se resetea después
   */
  test('envía el formulario y lo resetea después de un envío exitoso', async () => {
    // Mock de la función onProjectAdded
    const mockOnProjectAdded = jest.fn().mockResolvedValue({});
    
    render(<AddProjectForm clients={mockClients} onProjectAdded={mockOnProjectAdded} />);
    
    // Completar campos requeridos
    fireEvent.change(screen.getByPlaceholderText('Nombre del Proyecto'), { 
      target: { value: 'Proyecto de Prueba' } 
    });
    
    fireEvent.change(screen.getByRole('combobox', { name: '' }), { 
      target: { value: '1' } 
    });
    
    // Completar campos opcionales
    fireEvent.change(screen.getByPlaceholderText('Coste Inicial'), { 
      target: { value: '1500.50' } 
    });
    
    // Enviar formulario
    fireEvent.click(screen.getByRole('button', { name: /añadir proyecto/i }));
    
    // Verificar que se llamó a onProjectAdded
    await waitFor(() => {
      expect(mockOnProjectAdded).toHaveBeenCalled();
    });
    
    // Verificar que los campos se resetean
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nombre del Proyecto').value).toBe('');
      expect(screen.getByRole('combobox', { name: '' }).value).toBe('');
      expect(screen.getByPlaceholderText('Coste Inicial').value).toBe('');
    });
  });

  /**
   * TEST 5: Verificación de datos enviados
   * Comprueba que los datos enviados al callback son correctos y en formato FormData
   */
  test('envía los datos correctos en formato FormData', async () => {
    // Mock de la función onProjectAdded para capturar los datos
    const mockOnProjectAdded = jest.fn().mockResolvedValue({});
    
    render(<AddProjectForm clients={mockClients} onProjectAdded={mockOnProjectAdded} />);
    
    // Completar todos los campos
    fireEvent.change(screen.getByPlaceholderText('Nombre del Proyecto'), { 
      target: { value: 'Proyecto Completo' } 
    });
    
    fireEvent.change(screen.getByPlaceholderText('Descripción (Opcional)'), { 
      target: { value: 'Descripción detallada del proyecto' } 
    });
    
    fireEvent.change(screen.getByRole('combobox', { name: '' }), { 
      target: { value: '2' } 
    });
    
    fireEvent.change(screen.getByLabelText('Fecha de Inicio:'), { 
      target: { value: '2025-08-01' } 
    });
    
    fireEvent.change(screen.getByPlaceholderText('Coste Inicial'), { 
      target: { value: '2500.75' } 
    });
    
    const currencySelect = screen.getAllByRole('combobox')[1];
    fireEvent.change(currencySelect, { 
      target: { value: 'ARS' } 
    });
    
    fireEvent.change(screen.getByPlaceholderText('URL de video de YouTube (opcional)'), { 
      target: { value: 'https://youtube.com/watch?v=test123' } 
    });
    
    // Enviar formulario
    fireEvent.click(screen.getByRole('button', { name: /añadir proyecto/i }));
    
    // Verificar los datos enviados
    await waitFor(() => {
      expect(mockOnProjectAdded).toHaveBeenCalled();
      
      const formDataArg = mockOnProjectAdded.mock.calls[0][0];
      expect(formDataArg).toBeInstanceOf(FormData);
      
      // Verificar cada campo individualmente
      expect(formDataArg.get('name')).toBe('Proyecto Completo');
      expect(formDataArg.get('description')).toBe('Descripción detallada del proyecto');
      expect(formDataArg.get('client_id')).toBe('2');
      expect(formDataArg.get('start_date')).toBe('2025-08-01');
      expect(formDataArg.get('initial_cost')).toBe('2500.75');
      expect(formDataArg.get('currency')).toBe('ARS');
      expect(formDataArg.get('youtube_url')).toBe('https://youtube.com/watch?v=test123');
    });
  });

  /**
   * TEST 6: Manejo de errores
   * Comprueba que el componente maneja correctamente los errores al enviar el formulario
   */
  test('muestra mensaje de error cuando falla el envío del formulario', async () => {
    // Mock que simula un error al enviar
    const mockError = new Error('Error al crear el proyecto');
    const mockOnProjectAdded = jest.fn().mockRejectedValue(mockError);
    
    render(<AddProjectForm clients={mockClients} onProjectAdded={mockOnProjectAdded} />);
    
    // Completar campos requeridos
    fireEvent.change(screen.getByPlaceholderText('Nombre del Proyecto'), { 
      target: { value: 'Proyecto Error' } 
    });
    
    fireEvent.change(screen.getByRole('combobox', { name: '' }), { 
      target: { value: '1' } 
    });
    
    // Enviar formulario
    fireEvent.click(screen.getByRole('button', { name: /añadir proyecto/i }));
    
    // Verificar mensaje de error
    await waitFor(() => {
      expect(screen.getByText('Error al crear el proyecto')).toBeInTheDocument();
    });
  });

  /**
   * TEST 7: Estado de carga durante el envío
   * Comprueba que el botón cambia durante el envío para mostrar el estado de carga
   */
  test('muestra estado de carga durante el envío del formulario', async () => {
    // Crear una promesa que podemos resolver manualmente
    let resolvePromise;
    const pendingPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });
    
    const mockOnProjectAdded = jest.fn(() => pendingPromise);
    
    render(<AddProjectForm clients={mockClients} onProjectAdded={mockOnProjectAdded} />);
    
    // Completar campos requeridos
    fireEvent.change(screen.getByPlaceholderText('Nombre del Proyecto'), { 
      target: { value: 'Proyecto Test' } 
    });
    
    fireEvent.change(screen.getByRole('combobox', { name: '' }), { 
      target: { value: '1' } 
    });
    
    // Enviar formulario
    fireEvent.click(screen.getByRole('button', { name: /añadir proyecto/i }));
    
    // Verificar estado de carga
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText('Añadiendo...')).toBeInTheDocument();
    
    // Resolver la promesa para completar el test
    resolvePromise({});
    
    // Verificar que vuelve al estado normal
    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled();
      expect(screen.getByText('Añadir Proyecto')).toBeInTheDocument();
    });
  });
});
