from django.db import models
from projects.models import Project

class Task(models.Model):
    STATUS_CHOICES = [
        ('PENDIENTE', 'Pendiente'),
        ('EN_PROGRESO', 'En Progreso'),
        ('COMPLETADA', 'Completada'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=200)
    # Hacemos la descripción opcional, permitiendo que esté en blanco y guardando un string vacío por defecto.
    description = models.TextField(blank=True, default='')
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='PENDIENTE')
    # Hacemos el costo opcional para evitar errores al crear tareas sin este dato.
    cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    attachment = models.FileField(upload_to='task_attachments/', blank=True, null=True, verbose_name='Archivo Adjunto')
    youtube_url = models.URLField(max_length=255, blank=True, null=True, verbose_name='URL de YouTube')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
