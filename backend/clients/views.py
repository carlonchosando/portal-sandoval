from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Client
from .serializers import ClientSerializer

class ClientViewSet(viewsets.ModelViewSet):
    """
    Un ViewSet para ver, editar, y archivar Clientes.
    """
    queryset = Client.objects.all().order_by('-created_at')
    serializer_class = ClientSerializer

    def get_queryset(self):
        """
        Por defecto, la acción 'list' solo devuelve clientes activos.
        Otras acciones (como 'retrieve' o 'update') pueden acceder a todos.
        """
        if self.action == 'list':
            return self.queryset.filter(is_active=True)
        return self.queryset

    def perform_destroy(self, instance):
        """
        Sobrescribe el método de borrado (DELETE).
        En lugar de borrar, marca el cliente como inactivo (lo archiva).
        """
        instance.is_active = False
        instance.save()

    @action(detail=False, methods=['get'], url_path='archived')
    def list_archived(self, request):
        """
        Endpoint personalizado para obtener la lista de clientes archivados.
        Se accederá a través de /api/v1/clients/archived/
        """
        archived_clients = self.queryset.filter(is_active=False)
        serializer = self.get_serializer(archived_clients, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='restore')
    def restore(self, request, pk=None):
        """
        Restaura un cliente archivado, marcándolo como activo.
        """
        instance = self.get_object()
        instance.is_active = True
        instance.save()
        return Response({'status': 'cliente restaurado'}, status=status.HTTP_200_OK)