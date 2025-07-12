from rest_framework import viewsets, permissions
from .models import Task
from .serializers import TaskSerializer

class TaskViewSet(viewsets.ModelViewSet):
    """
    API endpoint que permite ver y gestionar tareas.
    """
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Optimizamos la consulta para precargar los datos del proyecto y cliente relacionados.
        # Esto evita hacer consultas adicionales a la base de datos por cada tarea.
        return Task.objects.select_related('project__client').all().order_by('due_date', 'created_at')