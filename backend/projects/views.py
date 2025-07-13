from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from .models import Project
from .serializers import ProjectSerializer
from tasks.serializers import TaskSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    """
    API endpoint que permite ver y gestionar proyectos.
    """
    serializer_class = ProjectSerializer
    # Añadimos los parsers para poder manejar la subida de archivos (multipart/form-data)
    # que enviará el formulario del frontend al incluir un archivo adjunto.
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Por ahora, el administrador puede ver todos los proyectos.
        # Más adelante, un cliente solo podrá ver los suyos.
        return Project.objects.all().order_by('-created_at')

    # Le decimos a esta acción que ahora también acepta peticiones POST.
    @action(detail=True, methods=['get', 'post'])
    def tasks(self, request, pk=None):
        """
        GET: Devuelve una lista de todas las tareas para un proyecto específico.
        POST: Crea una nueva tarea para este proyecto.
        Se accederá a través de la URL: /api/v1/projects/{id}/tasks/
        """
        project = self.get_object()

        if request.method == 'GET':
            tasks = project.tasks.all().order_by('created_at')
            # Pasamos el contexto para que el serializador pueda construir URLs completas para los archivos.
            serializer = TaskSerializer(tasks, many=True, context={'request': request})
            return Response(serializer.data)

        elif request.method == 'POST':
            # Creamos una instancia del serializador de Tareas con los datos que vienen del formulario.
            serializer = TaskSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                # Antes de guardar, le inyectamos el proyecto actual. Así la tarea queda asociada correctamente.
                serializer.save(project=project)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)