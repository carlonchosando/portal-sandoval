from django.contrib import admin
from .models import Client, AppConfiguration

# Register your models here.

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    """
    Configuración para mostrar el modelo Client en el panel de administrador de Django.
    """
    list_display = ('business_name', 'contact_name', 'user', 'created_at')
    search_fields = ('business_name', 'contact_name', 'user__username', 'user__email')
    list_filter = ('created_at',)
    ordering = ('-created_at',)


@admin.register(AppConfiguration)
class AppConfigurationAdmin(admin.ModelAdmin):
    """
    Configuración para el modelo AppConfiguration en el panel de administrador.
    Permite personalizar el nombre y favicon de la aplicación.
    """
    list_display = ('app_name', 'created_at', 'updated_at')
    fields = ('app_name', 'favicon')
    
    def has_add_permission(self, request):
        # Solo permitir una instancia (Singleton pattern)
        return not AppConfiguration.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        # No permitir eliminar la configuración
        return False