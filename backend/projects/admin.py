from django.contrib import admin
from .models import Project

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    """
    Configuración para mostrar el modelo Project en el panel de administrador de Django.
    """
    list_display = ('name', 'client', 'status', 'created_at')
    list_filter = ('status', 'client')
    search_fields = ('name', 'description', 'client__business_name')