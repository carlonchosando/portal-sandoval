from django.contrib import admin
from .models import Task

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    """
    Configuración para mostrar el modelo Task en el panel de administrador de Django.
    """
    list_display = ('title', 'project', 'status', 'due_date', 'created_at')
    list_filter = ('status', 'project__client', 'project')
    search_fields = ('title', 'description', 'project__name')