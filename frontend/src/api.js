import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api/v1/',
});

// Interceptor para AÑADIR el token a cada petición
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Para JWT debemos usar 'Bearer' como prefijo, no 'Token'
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para MANEJAR la expiración de tokens (401)
apiClient.interceptors.response.use(
  // Si la respuesta es exitosa (2xx), simplemente la devolvemos
  (response) => response,
  // Si hay un error...
  async (error) => {
    const originalRequest = error.config;

    // Verificamos si el error es 401 y si no hemos reintentado ya esta petición
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Marcamos la petición para no entrar en un bucle infinito

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // Si no hay refresh token, no podemos hacer nada. Redirigimos a login.
          console.error("No refresh token found. Redirecting to login.");
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Pedimos un nuevo access token usando el refresh token
        const { data } = await axios.post('http://localhost:8000/api/v1/token/refresh/', {
          refresh: refreshToken,
        });

        // Guardamos el nuevo token de acceso
        localStorage.setItem('accessToken', data.access);

        // Actualizamos el header de la petición original con el nuevo token
        originalRequest.headers['Authorization'] = `Bearer ${data.access}`;

        // Reintentamos la petición original que había fallado
        return apiClient(originalRequest);

      } catch (refreshError) {
        // Si el refresh token también falla (está caducado o es inválido)
        console.error("Session expired. Please log in again.", refreshError);
        // Limpiamos los tokens y redirigimos al login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Para cualquier otro error que no sea 401, lo devolvemos
    return Promise.reject(error);
  }
);

export default apiClient;