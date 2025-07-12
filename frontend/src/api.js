import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1/';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- El Interceptor ---
// Este es el "guardia de seguridad". Se ejecuta ANTES de cada petición.
apiClient.interceptors.request.use((config) => {
  // Busca el token en el almacenamiento local.
  const token = localStorage.getItem('authToken');
  if (token) {
    // Si existe, lo añade a la cabecera de la petición.
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default apiClient;