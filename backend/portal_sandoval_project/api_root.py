from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.reverse import reverse
from django.conf import settings

@api_view(['GET'])
@permission_classes([AllowAny])  # Permitir acceso sin autenticación para ver la API
def api_root(request, format=None):
    """
    Portal Sandoval API Root
    
    Bienvenido a la API de Portal Sandoval - Sistema de Gestión Empresarial
    Creado por Carlos Daniel Sandoval
    """
    
    # Obtener la configuración de la aplicación si existe
    try:
        from clients.models import AppConfiguration
        app_config = AppConfiguration.get_instance()
        app_name = app_config.app_name
    except:
        app_name = "Portal Sandoval"
    
    return Response({
        'message': f'🚀 Bienvenido a la API de {app_name}',
        'description': 'Sistema de Gestión Empresarial - Desarrollado por Carlos Daniel Sandoval',
        'version': '1.0.0',
        'documentation': 'Ver API_DOCUMENTATION.md para detalles completos',
        
        # Endpoints de Autenticación
        'authentication': {
            'login': reverse('token_obtain_pair', request=request, format=format),
            'refresh_token': reverse('token_refresh', request=request, format=format),
        },
        
        # Endpoints Principales
        'endpoints': {
            # Configuración de la Aplicación
            'app_configuration': {
                'url': request.build_absolute_uri('/api/v1/app-config/'),
                'description': 'Configurar nombre de la aplicación y favicon',
                'methods': ['GET', 'PATCH'],
                'auth_required': True,
                'admin_only': True
            },
            
            # Clientes
            'clients': {
                'url': request.build_absolute_uri('/api/v1/clients/'),
                'description': 'Gestión de clientes',
                'methods': ['GET', 'POST', 'PATCH', 'DELETE'],
                'auth_required': True,
                'features': ['CRUD', 'Archivado', 'Restauración']
            },
            
            # Proyectos
            'projects': {
                'url': request.build_absolute_uri('/api/v1/projects/'),
                'description': 'Gestión de proyectos',
                'methods': ['GET', 'POST', 'PATCH', 'DELETE'],
                'auth_required': True,
                'features': ['CRUD', 'Archivos', 'YouTube URLs', 'Costos']
            },
            
            # Tareas
            'tasks': {
                'url': request.build_absolute_uri('/api/v1/tasks/'),
                'description': 'Gestión de tareas',
                'methods': ['GET', 'POST', 'PATCH', 'DELETE'],
                'auth_required': True,
                'features': ['CRUD', 'Archivos', 'YouTube URLs', 'Fechas límite']
            },
            
            # Métricas del Dashboard
            'admin_metrics': {
                'url': request.build_absolute_uri('/api/v1/admin/metrics/'),
                'description': 'Métricas financieras y estadísticas',
                'methods': ['GET'],
                'auth_required': True,
                'admin_only': True,
                'features': ['Reportes PDF', 'Excel', 'CSV']
            }
        },
        
        # Información adicional
        'features': [
            '🎨 Sistema de personalización (nombre + favicon)',
            '📊 Dashboard administrativo con métricas',
            '📄 Reportes profesionales (PDF, Excel, CSV)',
            '🔐 Autenticación JWT segura',
            '📁 Subida de archivos',
            '🎥 Integración con YouTube',
            '💰 Gestión de costos y presupuestos',
            '📱 API REST completa'
        ],
        
        # Información técnica
        'technical_info': {
            'framework': 'Django REST Framework',
            'database': 'PostgreSQL',
            'authentication': 'JWT (JSON Web Tokens)',
            'file_uploads': 'Multipart/form-data',
            'pagination': 'Automática',
            'filtering': 'Soportado',
            'ordering': 'Soportado'
        },
        
        # Enlaces útiles
        'useful_links': {
            'admin_panel': request.build_absolute_uri('/admin/'),
            'password_reset': request.build_absolute_uri('/password-reset/'),
            'documentation': 'Ver archivo API_DOCUMENTATION.md',
            'github': 'https://github.com/tu-usuario/portal-sandoval'
        },
        
        # Créditos
        'credits': {
            'creator': 'Carlos Daniel Sandoval',
            'role': 'Arquitecto de Software e Inversor Principal',
            'ai_assistance': [
                'Cascade AI (Windsurf)',
                'Claude AI (Anthropic)', 
                'ChatGPT (OpenAI)',
                'GitHub Copilot'
            ],
            'license': 'MIT License',
            'year': '2025'
        },
        
        # Instrucciones de uso
        'getting_started': {
            '1': 'Obtén un token de acceso en /api/v1/token/',
            '2': 'Incluye el token en el header: Authorization: Bearer <token>',
            '3': 'Explora los endpoints disponibles arriba',
            '4': 'Consulta API_DOCUMENTATION.md para ejemplos detallados'
        }
    })
