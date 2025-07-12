from django.db import models
from projects.models import Project

class Task(models.Model):
    """
    Representa una tarea individual dentro de un proyecto.
    """
    STATUS_CHOICES = [
        ('PENDIENTE', 'Pendiente'),
        ('COMPLETADA', 'Completada'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks', verbose_name="Proyecto")
    title = models.CharField(max_length=255, verbose_name="Título de la Tarea")
    description = models.TextField(blank=True, null=True, verbose_name="Descripción")
    due_date = models.DateField(blank=True, null=True, verbose_name="Fecha de Entrega")
    
    # --- CAMPOS AÑADIDOS ---
    # Campo para subir archivos. Se guardarán en la carpeta 'media/task_attachments/'
    attachment = models.FileField(upload_to='task_attachments/', blank=True, null=True, verbose_name="Archivo Adjunto")
    # Campo para la URL de YouTube
    youtube_url = models.URLField(max_length=255, blank=True, null=True, verbose_name="URL de YouTube")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDIENTE', verbose_name="Estado")

    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Última Actualización")

    def __str__(self):
        return self.title