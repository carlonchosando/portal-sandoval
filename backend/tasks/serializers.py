from rest_framework import serializers
from .models import Task
from projects.models import Project

class TaskSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Task.
    Distingue entre lectura (mostrando project_name) y escritura (aceptando project ID).
    """
    # Para LEER: Mostramos el nombre del proyecto para simplicidad.
    project_name = serializers.CharField(source='project.name', read_only=True)
    # También mostramos el nombre del cliente, que es muy útil en las listas.
    client_name = serializers.CharField(source='project.client.business_name', read_only=True)

    # Para ESCRIBIR: Aceptamos un simple ID de proyecto.
    # El campo en el formulario se debe llamar 'project'.
    project = serializers.PrimaryKeyRelatedField(
        queryset=Project.objects.all(), write_only=True, label="ID del Proyecto"
    )

    class Meta:
        model = Task
        # 'project' es para escribir (acepta el ID), los otros son para leer.
        fields = [
            'id', 'project', 'project_name', 'client_name', 'title', 'description', 
            'due_date', 'status', 'cost', 'attachment', 
            'youtube_url', 'created_at', 'updated_at'
        ]
