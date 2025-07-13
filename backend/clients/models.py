from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Client(models.Model):
    """
    Representa a un cliente en el sistema.
    Cada cliente está asociado a una cuenta de usuario de Django para la autenticación.
    """
    # Relación uno a uno con el modelo de Usuario de Django.
    # Si se elimina el usuario, también se elimina el perfil del cliente.
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='client_profile')

    # Información del negocio y contacto
    business_name = models.CharField(max_length=255, verbose_name="Nombre del Negocio")
    contact_name = models.CharField(max_length=255, verbose_name="Persona de Contacto")
    # El email se tomará del modelo User, pero podemos añadir uno de contacto si es diferente.
    # Por simplicidad, por ahora usaremos el del User.
    phone = models.CharField(max_length=50, blank=True, null=True, verbose_name="Teléfono")
    internal_notes = models.TextField(blank=True, null=True, verbose_name="Notas Internas")
    is_active = models.BooleanField(default=True, help_text="Designa si este cliente debe ser tratado como activo. Desmarcar en lugar de borrar.")
    # Timestamps para auditoría
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Última Actualización")

    def __str__(self):
        return self.business_name