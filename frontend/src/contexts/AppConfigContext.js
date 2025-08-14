import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api';

// Crear el contexto
const AppConfigContext = createContext();

// Hook personalizado para usar el contexto
export const useAppConfig = () => {
  const context = useContext(AppConfigContext);
  if (!context) {
    throw new Error('useAppConfig debe ser usado dentro de AppConfigProvider');
  }
  return context;
};

// Provider del contexto
export const AppConfigProvider = ({ children }) => {
  const [config, setConfig] = useState({
    app_name: 'Portal Sandoval', // Valor por defecto
    favicon_url: null,
    loading: true,
    error: null
  });

  // Función para cargar la configuración desde el backend
  const loadConfig = async () => {
    try {
      setConfig(prev => ({ ...prev, loading: true, error: null }));
      const response = await apiClient.get('app-config/');
      setConfig({
        app_name: response.data.app_name || 'Portal Sandoval',
        favicon_url: response.data.favicon_url,
        loading: false,
        error: null
      });
      
      // Actualizar el favicon dinámicamente
      updateFavicon(response.data.favicon_url);
      
      // Actualizar el título de la página
      updatePageTitle(response.data.app_name);
      
    } catch (error) {
      console.error('Error cargando configuración de la aplicación:', error);
      setConfig(prev => ({
        ...prev,
        loading: false,
        error: 'Error cargando configuración'
      }));
    }
  };

  // Función para actualizar la configuración
  const updateConfig = async (newConfig) => {
    try {
      const formData = new FormData();
      
      if (newConfig.app_name) {
        formData.append('app_name', newConfig.app_name);
      }
      
      if (newConfig.favicon) {
        formData.append('favicon', newConfig.favicon);
      }

      const response = await apiClient.patch('app-config/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setConfig(prev => ({
        ...prev,
        app_name: response.data.app_name,
        favicon_url: response.data.favicon_url
      }));

      // Actualizar favicon y título dinámicamente
      updateFavicon(response.data.favicon_url);
      updatePageTitle(response.data.app_name);

      return response.data;
    } catch (error) {
      console.error('Error actualizando configuración:', error);
      throw error;
    }
  };

  // Función para actualizar el favicon dinámicamente
  const updateFavicon = (faviconUrl) => {
    if (faviconUrl) {
      // Buscar el elemento link del favicon existente
      let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = faviconUrl;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  };

  // Función para actualizar el título de la página
  const updatePageTitle = (appName) => {
    document.title = appName || 'Portal Sandoval';
  };

  // Cargar configuración al montar el componente
  useEffect(() => {
    loadConfig();
  }, []);

  const value = {
    config,
    loadConfig,
    updateConfig,
    // Propiedades de conveniencia
    appName: config.app_name,
    faviconUrl: config.favicon_url,
    isLoading: config.loading,
    error: config.error
  };

  return (
    <AppConfigContext.Provider value={value}>
      {children}
    </AppConfigContext.Provider>
  );
};

export default AppConfigContext;
