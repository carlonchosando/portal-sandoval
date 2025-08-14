from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClientViewSet, AppConfigurationView

# DefaultRouter es una herramienta de Django REST Framework que crea automáticamente
# las rutas estándar para un ViewSet (listar, crear, detalle, actualizar, etc.).
router = DefaultRouter()
router.register(r'clients', ClientViewSet, basename='client')

# Las URLs de la API son generadas por el router.
urlpatterns = [
    path('', include(router.urls)),
    # Endpoint para configuración de la aplicación
    path('app-config/', AppConfigurationView.as_view(), name='app-config'),
]