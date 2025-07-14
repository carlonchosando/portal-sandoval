import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddTaskForm from './AddTaskForm';
import apiClient from '../api';

// Mock del módulo api para simular las llamadas a la API
jest.mock('../api', () => ({
  get: jest.fn(),
}));

describe('AddTaskForm Component', () => {
  // Configuración que se ejecuta antes de cada test
  beforeEach(() => {
    // Reiniciar mocks entre pruebas
    jest.clearAllMocks();
    
    // Mock de la respuesta de la API para proyectos
    apiClient.get.mockResolvedValue({
      data: [
        { id: 1, name: 'Proyecto Test 1' },
        { id: 2, name: 'Proyecto Test 2' }
      ]
    });
  });

  /**
   * TEST 1: Verifica que el formulario renderiza correctamente con todos sus campos
   * Este test básico asegura que todos los elementos UI estén presentes
   */
  test('renderiza el formulario con todos los campos requeridos', () => {
    render(<AddTaskForm onTaskAdded={jest.fn()} />);
    
    // Verificar que los elementos principales del formulario están presentes
    expect(screen.getByRole('combobox')).toBeInTheDocument(); // Select de proyectos
    expect(screen.getByPlaceholderText('Título de la tarea')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Descripción detallada (opcional)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Costo (ej: 150.00)')).toBeInTheDocument();
    
    // Verificar campos adicionales
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    
    expect(screen.getByPlaceholderText('Enlace de YouTube (opcional)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /añadir tarea/i })).toBeInTheDocument();
  });

  /**
   * TEST 2: Verifica que se cargan los proyectos en el dropdown
   * Este test asegura que la llamada a la API se realiza correctamente y los datos se muestran
   */
  test('carga y muestra la lista de proyectos', async () => {
    render(<AddTaskForm onTaskAdded={jest.fn()} />);
    
    // Verificar que se llamó a la API
    expect(apiClient.get).toHaveBeenCalledWith('/projects/');
    
    // Esperar a que los proyectos se carguen y muestren en el dropdown
    await waitFor(() => {
      const projectOptions = screen.getAllByRole('option');
      // El +1 es por la opción default "-- Selecciona un Proyecto --"
      expect(projectOptions.length).toBe(3);
      expect(screen.getByText('Proyecto Test 1')).toBeInTheDocument();
      expect(screen.getByText('Proyecto Test 2')).toBeInTheDocument();
    });
  });

  /**
   * TEST 3: Verifica que no se muestra el selector de proyecto cuando se proporciona un projectId
   * Esto es importante para cuando el formulario se usa dentro de la página de un proyecto específico
   */
  test('no muestra selector de proyecto cuando se proporciona projectId', () => {
    render(<AddTaskForm onTaskAdded={jest.fn()} projectId="1" />);
    
    // No debería haber un select en el documento
    const projectSelect = screen.queryByRole('combobox');
    expect(projectSelect).not.toBeInTheDocument();
    
    // Pero los demás campos sí deben estar
    expect(screen.getByPlaceholderText('Título de la tarea')).toBeInTheDocument();
  });

  /**
   * TEST 4: Verifica la validación básica del formulario
   * Este test comprueba que la validación impide enviar el formulario si falta información requerida
   */
  test('muestra error cuando se intenta enviar sin seleccionar proyecto', async () => {
    render(<AddTaskForm onTaskAdded={jest.fn()} />);
    
    // Intentar enviar el formulario sin seleccionar proyecto
    const submitButton = screen.getByRole('button', { name: /añadir tarea/i });
    fireEvent.click(submitButton);
    
    // Debería mostrar un mensaje de error
    await waitFor(() => {
      expect(screen.getByText('Debes seleccionar un proyecto.')).toBeInTheDocument();
    });
  });

  /**
   * TEST 5: Verifica que los datos del formulario se envían correctamente
   * Este test simula la interacción completa del usuario con el formulario
   */
  test('envía los datos del formulario al hacer submit', async () => {
    // Mock de la función onTaskAdded para verificar que se llama correctamente
    const mockOnTaskAdded = jest.fn().mockResolvedValue({});
    
    render(<AddTaskForm onTaskAdded={mockOnTaskAdded} />);
    
    // Rellenar el formulario
    await waitFor(() => {
      expect(screen.getAllByRole('option').length).toBe(3);
    });
    
    // Seleccionar proyecto
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });
    
    // Rellenar título
    fireEvent.change(screen.getByPlaceholderText('Título de la tarea'), { 
      target: { value: 'Nueva tarea de prueba' } 
    });
    
    // Rellenar descripción
    fireEvent.change(screen.getByPlaceholderText('Descripción detallada (opcional)'), { 
      target: { value: 'Descripción de la tarea de prueba' } 
    });
    
    // Establecer coste
    fireEvent.change(screen.getByPlaceholderText('Costo (ej: 150.00)'), { 
      target: { value: '120.50' } 
    });
    
    // Enviar formulario
    fireEvent.click(screen.getByRole('button', { name: /añadir tarea/i }));
    
    // Verificar que se llamó a onTaskAdded con los datos correctos
    await waitFor(() => {
      expect(mockOnTaskAdded).toHaveBeenCalled();
      
      // Verificar que se pasó un objeto FormData
      const formDataArg = mockOnTaskAdded.mock.calls[0][0];
      expect(formDataArg).toBeInstanceOf(FormData);
      
      // Verificar que los datos están en el FormData
      // Nota: FormData no es fácil de inspeccionar en tests, esta es una aproximación
      expect(formDataArg.get('title')).toBe('Nueva tarea de prueba');
      expect(formDataArg.get('description')).toBe('Descripción de la tarea de prueba');
      expect(formDataArg.get('project')).toBe('1');
      expect(formDataArg.get('cost')).toBe('120.50');
    });
    
    // Verificar mensaje de éxito después de enviar
    await waitFor(() => {
      expect(screen.getByText('¡Tarea añadida con éxito!')).toBeInTheDocument();
    });
    
    // Verificar que el formulario se reinició
    expect(screen.getByPlaceholderText('Título de la tarea').value).toBe('');
  });

  /**
   * TEST 6: Verifica el manejo de errores de la API
   * Este test simula un error al enviar el formulario y verifica que se muestre apropiadamente
   */
  test('maneja errores al enviar el formulario', async () => {
    // Mock que simula un error al enviar
    const mockError = {
      response: {
        data: { error: ['Error en el servidor'] }
      }
    };
    const mockOnTaskAdded = jest.fn().mockRejectedValue(mockError);
    
    render(<AddTaskForm onTaskAdded={mockOnTaskAdded} />);
    
    // Rellenar datos mínimos y enviar
    await waitFor(() => {
      expect(screen.getAllByRole('option').length).toBe(3);
    });
    
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });
    fireEvent.change(screen.getByPlaceholderText('Título de la tarea'), { 
      target: { value: 'Tarea con error' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /añadir tarea/i }));
    
    // Verificar mensaje de error
    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });
});
