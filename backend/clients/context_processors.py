from .models import AppConfiguration

def app_config(request):
    """
    Context processor para hacer disponible la configuración de la aplicación
    en todos los templates de Django.
    """
    try:
        config = AppConfiguration.get_config()
        return {
            'app_name': config.app_name,
            'app_favicon_url': config.favicon.url if config.favicon else None,
        }
    except Exception:
        # Si hay algún error, usar valores por defecto
        return {
            'app_name': 'Portal Sandoval',
            'app_favicon_url': None,
        }
