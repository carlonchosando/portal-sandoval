from rest_framework import viewsets, permissions
from .models import Client
from .serializers import ClientSerializer

class ClientViewSet(viewsets.ModelViewSet):
    """
    API endpoint que permite ver, crear, editar y borrar clientes.
    ModelViewSet nos da todas estas funcionalidades (GET, POST, PUT, DELETE) automáticamente.
    """
    queryset = Client.objects.all().order_by('-created_at')
    serializer_class = ClientSerializer
    # Gracias a la configuración en settings.py, ya no es necesario especificar
    # los permisos aquí, a menos que queramos algo diferente al default.
    # Por defecto, ahora es `IsAuthenticated`, que es exactamente lo que queremos.
    permission_classes = [permissions.IsAuthenticated]