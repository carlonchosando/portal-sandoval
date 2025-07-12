from django.db import models
from clients.models import Client

class Project(models.Model):
    """
    Representa un proyecto asociado a un cliente.
    """
    STATUS_CHOICES = [
        ('NUEVO', 'Nuevo'),
        ('EN_PROGRESO', 'En Progreso'),
        ('EN_REVISION', 'En Revisión'),
        ('COMPLETADO', 'Completado'),
        ('PAUSADO', 'Pausado'),
    ]
    CURRENCY_CHOICES = [
        ('USD', 'Dólares Americanos (U$S)'),
        ('ARS', 'Pesos Argentinos (ARS$)'),
    ]

    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='projects', verbose_name="Cliente")
    name = models.CharField(max_length=255, verbose_name="Nombre del Proyecto")
    description = models.TextField(blank=True, null=True, verbose_name="Descripción")
    start_date = models.DateField(blank=True, null=True, verbose_name="Fecha de Inicio")
    initial_cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, verbose_name="Coste Inicial")
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='USD', verbose_name="Moneda")
    attachment = models.FileField(upload_to='project_attachments/', blank=True, null=True, verbose_name="Archivo Adjunto del Proyecto")
    youtube_url = models.URLField(max_length=255, blank=True, null=True, verbose_name="URL de YouTube del Proyecto")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='NUEVO', verbose_name="Estado")

    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Última Actualización")

    def __str__(self):
        return f"{self.name} ({self.client.business_name})"