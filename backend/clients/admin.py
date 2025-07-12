from django.contrib import admin
from .models import Client

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