from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Project
from .serializers import ProjectSerializer
from tasks.serializers import TaskSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    """
    API endpoint que permite ver y gestionar proyectos.
    """
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Por ahora, el administrador puede ver todos los proyectos.
        # Más adelante, un cliente solo podrá ver los suyos.
        return Project.objects.all().order_by('-created_at')

    @action(detail=True, methods=['get'])
    def tasks(self, request, pk=None):
        """
        Devuelve una lista de todas las tareas para un proyecto específico.
        Se accederá a través de la URL: /api/v1/projects/{id}/tasks/
        """
        project = self.get_object()
        tasks = project.tasks.all().order_by('created_at')
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)