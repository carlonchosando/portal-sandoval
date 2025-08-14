from django.core.management.base import BaseCommand
from clients.models import AppConfiguration


class Command(BaseCommand):
    help = 'Inicializa la configuración de la aplicación con valores por defecto'

    def handle(self, *args, **options):
        """
        Comando para inicializar la configuración de la aplicación.
        Se ejecuta automáticamente en producción para asegurar que existe
        una configuración por defecto.
        """
        try:
            # Verificar si ya existe una configuración
            config = AppConfiguration.objects.first()
            
            if config:
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Configuración ya existe: "{config.app_name}"'
                    )
                )
            else:
                # Crear configuración por defecto
                config = AppConfiguration.objects.create(
                    app_name='Portal Sandoval'
                )
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Configuración creada exitosamente: "{config.app_name}"'
                    )
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(
                    f'Error al inicializar configuración: {str(e)}'
                )
            )
