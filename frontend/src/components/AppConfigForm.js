import React, { useState } from 'react';
import { useAppConfig } from '../contexts/AppConfigContext';
import './AppConfigForm.css';

const AppConfigForm = ({ onClose }) => {
  const { config, updateConfig } = useAppConfig();
  const [formData, setFormData] = useState({
    app_name: config.app_name || 'Portal Sandoval',
    favicon: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'favicon') {
      setFormData(prev => ({ ...prev, favicon: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await updateConfig(formData);
      alert('Configuración actualizada correctamente');
      if (onClose) onClose();
    } catch (err) {
      setError('Error al actualizar la configuración');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-config-form">
      <h3>Configuración de la Aplicación</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="app_name">Nombre de la Aplicación:</label>
          <input
            type="text"
            id="app_name"
            name="app_name"
            value={formData.app_name}
            onChange={handleChange}
            placeholder="Ej: Mi Empresa Pro"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="favicon">Favicon (opcional):</label>
          <input
            type="file"
            id="favicon"
            name="favicon"
            onChange={handleChange}
            accept="image/*"
          />
          <small>Recomendado: 16x16 o 32x32 píxeles, formato PNG o ICO</small>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Configuración'}
          </button>
          {onClose && (
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AppConfigForm;
