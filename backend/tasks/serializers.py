from rest_framework import serializers
from .models import Task
from projects.models import Project

class ProjectForTaskSerializer(serializers.ModelSerializer):
    """Un serializer simple para mostrar info del proyecto dentro de una tarea."""
    class Meta:
        model = Project
        fields = ['id', 'name']

class TaskSerializer(serializers.ModelSerializer):
    # Por defecto, este campo aceptará un ID para escribir (POST/PUT).
    # Usaremos to_representation para cambiar cómo se muestra al leer (GET).
    project = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all())

    class Meta:
        model = Task
        fields = [
            'id',
            'project',          # Acepta ID al escribir, muestra objeto al leer.
            'title',
            'description',
            'due_date',
            'status',
            'cost',
            'attachment',
            'youtube_url',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def to_representation(self, instance):
        """
        Personaliza la salida del serializer para las peticiones GET.
        Convierte el 'project' (que por defecto sería solo un ID) en un objeto anidado
        con los detalles del proyecto.
        """
        representation = super().to_representation(instance)
        # Usamos el ProjectForTaskSerializer para obtener los detalles del proyecto.
        representation['project'] = ProjectForTaskSerializer(instance.project).data
        return representation