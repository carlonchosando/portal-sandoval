from rest_framework import serializers
from .models import Task
from projects.models import Project

class ProjectForTaskSerializer(serializers.ModelSerializer):
    """Un serializer simple para mostrar info del proyecto dentro de una tarea."""
    class Meta:
        model = Project
        fields = ['id', 'name']

class TaskSerializer(serializers.ModelSerializer):
    # Para leer (GET), mostramos detalles del proyecto. Es de solo lectura.
    project_details = ProjectForTaskSerializer(source='project', read_only=True)

    # Para escribir (POST), esperamos un ID de proyecto.
    # El frontend lo envía con la clave 'project'.
    project = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all())

    class Meta:
        model = Task
        fields = [
            'id',
            'project',          # Para escribir (acepta un ID)
            'project_details',  # Para leer (muestra el objeto anidado)
            'title',
            'description',
            'due_date',
            'status',
            'attachment',
            'youtube_url',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def to_representation(self, instance):
        """Personaliza la salida JSON para que sea más amigable para el frontend."""
        representation = super().to_representation(instance)
        # Movemos los detalles del proyecto a la clave 'project' para consistencia.
        representation['project'] = representation.pop('project_details')
        return representation