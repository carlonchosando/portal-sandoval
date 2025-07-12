from rest_framework import serializers
from .models import Project
from clients.models import Client

# Un serializer simple para anidar la información del cliente dentro de un proyecto.
class ClientForProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['id', 'business_name']

class ProjectSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Project.
    Maneja la lectura (mostrando detalles del cliente) y la escritura (aceptando un ID de cliente).
    """
    # Para leer (GET), mostramos los detalles del cliente. Es de solo lectura.
    client = ClientForProjectSerializer(read_only=True)

    # Para escribir (POST/PUT), aceptamos un ID de cliente. Es de solo escritura.
    # El `source='client'` le dice a DRF que use este campo para poblar la relación 'client'.
    client_id = serializers.PrimaryKeyRelatedField(
        queryset=Client.objects.all(), source='client', write_only=True
    )

    class Meta:
        model = Project
        fields = [
            'id', 'name', 'description', 'status', 'client', 'client_id', 
            'created_at', 'updated_at',
            # Nuevos campos añadidos
            'start_date', 
            'initial_cost', 
            'currency',
            'attachment', 
            'youtube_url'
        ]
        read_only_fields = ['created_at', 'updated_at', 'client']