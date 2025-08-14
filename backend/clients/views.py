from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Client, AppConfiguration
from .serializers import ClientSerializer, AppConfigurationSerializer

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


class AppConfigurationView(APIView):
    """
    Vista para obtener y actualizar la configuración global de la aplicación.
    GET: Obtiene la configuración actual
    PATCH: Actualiza la configuración (nombre y/o favicon)
    """
    
    def get(self, request):
        """Obtiene la configuración actual de la aplicación"""
        config = AppConfiguration.get_config()
        serializer = AppConfigurationSerializer(config, context={'request': request})
        return Response(serializer.data)
    
    def patch(self, request):
        """Actualiza la configuración de la aplicación"""
        config = AppConfiguration.get_config()
        serializer = AppConfigurationSerializer(
            config, 
            data=request.data, 
            partial=True,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)