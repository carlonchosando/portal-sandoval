from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClientViewSet

# DefaultRouter es una herramienta de Django REST Framework que crea automáticamente
# las rutas estándar para un ViewSet (listar, crear, detalle, actualizar, etc.).
router = DefaultRouter()
router.register(r'clients', ClientViewSet, basename='client')

# Las URLs de la API son generadas por el router.
urlpatterns = [
    path('', include(router.urls)),
]