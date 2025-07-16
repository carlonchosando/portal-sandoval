from rest_framework import serializers
from .models import Project
from clients.serializers import ClientSerializer
from clients.models import Client
from tasks.models import Task
from django.db.models import Sum, Count, Case, When, IntegerField, Q
from decimal import Decimal

class ProjectSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Project.
    Ahora incluye campos calculados para el coste inicial, extras, total y el número de tareas.
    """
    # Para LEER: Usamos el ClientSerializer para mostrar los datos del cliente de forma anidada.
    client = ClientSerializer(read_only=True)
    # Para ESCRIBIR: Aceptamos un simple ID de cliente.
    client_id = serializers.PrimaryKeyRelatedField(
        queryset=Client.objects.all(), source='client', write_only=True,
        label="ID del Cliente"
    )

    # Nuevos campos calculados que se añadirán a la respuesta de la API.
    extra_cost = serializers.SerializerMethodField()
    total_cost = serializers.SerializerMethodField()
    task_count = serializers.SerializerMethodField()
    tasks_with_cost_count = serializers.SerializerMethodField()
    tasks_without_cost_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        # Añadimos los nuevos campos a la lista de fields.
        fields = [
            'id', 'name', 'client', 'client_id', 'description', 'status', 
            'start_date', 'initial_cost', 'extra_cost', 'total_cost', 'task_count',
            'tasks_with_cost_count', 'tasks_without_cost_count',
            'created_at'
        ]

    def get_extra_cost(self, obj):
        """
        Calcula el coste de las tareas extra.
        Suma los costes de todas las tareas asociadas a este proyecto.
        'obj' es la instancia del proyecto que se está serializando.
        """
        return obj.tasks.aggregate(total=Sum('cost'))['total'] or Decimal('0.00')

    def get_total_cost(self, obj):
        """
        Calcula el coste total del proyecto.
        Suma el coste inicial del proyecto + la suma de los costes de todas sus tareas.
        """
        # Reutilizamos el método anterior para no repetir código
        extra = self.get_extra_cost(obj)
        
        # Verificar si initial_cost es None y usar 0 en ese caso
        initial_cost = obj.initial_cost if obj.initial_cost is not None else Decimal('0.00')
        return initial_cost + extra

    def get_task_count(self, obj):
        """
        Cuenta cuántas tareas están asociadas a este proyecto.
        """
        return obj.tasks.count()
        
    def get_tasks_with_cost_count(self, obj):
        """
        Cuenta cuántas tareas con coste (mayor que 0) están asociadas a este proyecto.
        """
        return obj.tasks.filter(cost__gt=0).count()
        
    def get_tasks_without_cost_count(self, obj):
        """
        Cuenta cuántas tareas sin coste (igual a 0) están asociadas a este proyecto.
        """
        return obj.tasks.filter(cost=0).count()
