# ... (otras configuraciones de Django)

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Apps de terceros
    'rest_framework',
    'corsheaders',  # <-- Añadir esta línea

    # Mis Apps
    'clients',
    'projects',
    'tasks',
    'users',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # <-- Añadir esta línea (importante que esté alta en la lista)
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# ... (otras configuraciones)

# --- Configuración de CORS ---
# Lista de orígenes que tienen permiso para hacer peticiones a nuestra API.
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # El origen de nuestra aplicación React
    "http://127.0.0.1:3000",
]

# Opcional: si quieres ser más permisivo en desarrollo
# CORS_ALLOW_ALL_ORIGINS = True

# ... (resto de tu configuración de settings.py)