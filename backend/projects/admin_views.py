from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, Count, Case, When, IntegerField, F, Q, Avg
from django.db.models.functions import TruncMonth, TruncWeek, TruncDay
from decimal import Decimal

from .models import Project
from tasks.models import Task
from clients.models import Client
from datetime import datetime, timedelta
from django.utils import timezone

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_dashboard_metrics(request):
    """
    Endpoint exclusivo para administradores que proporciona métricas financieras
    y de tareas para el panel administrativo.
    
    Parámetros de consulta:
    - start_date (YYYY-MM-DD): Fecha de inicio del período a analizar
    - end_date (YYYY-MM-DD): Fecha de fin del período a analizar
    - client_id (int, opcional): ID del cliente para filtrar los datos
    - time_grouping (string, opcional): Agrupación temporal ('day', 'week', 'month'). Por defecto: 'month'
    
    Retorna:
    - Métricas globales del período
    - Datos para gráficos de tendencias
    - Análisis por cliente
    """
    # Obtener parámetros de consulta
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    client_id = request.query_params.get('client_id')
    time_grouping = request.query_params.get('time_grouping', 'month')
    
    # Validar fechas
    try:
        if start_date:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        else:
            # Por defecto, un año atrás
            start_date = timezone.now().date() - timedelta(days=365)
            
        if end_date:
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        else:
            # Por defecto, hoy
            end_date = timezone.now().date()
    except ValueError:
        return Response(
            {"error": "Formato de fecha inválido. Use YYYY-MM-DD."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Construir filtros base para proyectos y tareas
    project_filters = Q(created_at__date__gte=start_date, created_at__date__lte=end_date)
    task_filters = Q(created_at__date__gte=start_date, created_at__date__lte=end_date)
    
    # Filtrar por cliente si se especifica
    if client_id:
        try:
            client = Client.objects.get(pk=client_id)
            project_filters &= Q(client=client)
            task_filters &= Q(project__client=client)
        except Client.DoesNotExist:
            return Response(
                {"error": f"Cliente con ID {client_id} no encontrado."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    # Obtener proyectos y tareas filtrados
    projects = Project.objects.filter(project_filters)
    tasks = Task.objects.filter(task_filters)
    
    # === MÉTRICAS GLOBALES ===
    # Cálculo de métricas de proyectos
    total_projects = projects.count()
    total_initial_cost = projects.aggregate(total=Sum('initial_cost'))['total'] or Decimal('0.00')
    
    # Cálculo de métricas de tareas
    total_tasks = tasks.count()
    total_task_cost = tasks.aggregate(total=Sum('cost'))['total'] or Decimal('0.00')
    
    # Métricas de tareas por estado
    task_status_counts = tasks.values('status').annotate(count=Count('id'))
    task_status_data = {
        status_dict['status']: status_dict['count']
        for status_dict in task_status_counts
    }
    
    # Métricas de proyectos por estado
    project_status_counts = projects.values('status').annotate(count=Count('id'))
    project_status_data = {
        status_dict['status']: status_dict['count'] 
        for status_dict in project_status_counts
    }
    
    # Análisis de tareas con y sin coste
    tasks_with_cost = tasks.filter(cost__gt=0).count()
    tasks_without_cost = tasks.filter(cost=0).count()
    
    # === ANÁLISIS POR CLIENTE ===
    client_metrics = []
    
    # Si no se filtró por un cliente específico, obtener datos para todos los clientes
    if not client_id:
        clients = Client.objects.filter(
            projects__in=projects
        ).distinct()
        
        for client in clients:
            client_projects = projects.filter(client=client)
            client_tasks = tasks.filter(project__client=client)
            
            # Costes iniciales y de tareas para este cliente
            client_initial_cost = client_projects.aggregate(total=Sum('initial_cost'))['total'] or Decimal('0.00')
            client_task_cost = client_tasks.aggregate(total=Sum('cost'))['total'] or Decimal('0.00')
            client_total_cost = client_initial_cost + client_task_cost
            
            # Contar tareas completadas para este cliente
            client_completed_tasks = client_tasks.filter(status='COMPLETADA').count()
            
            # Datos para este cliente
            client_data = {
                'id': client.id,
                'name': client.business_name,
                'project_count': client_projects.count(),
                'task_count': client_tasks.count(),
                'completed_tasks': client_completed_tasks,
                'initial_cost': float(client_initial_cost),
                'task_cost': float(client_task_cost),
                'total_cost': float(client_total_cost)
            }
            
            client_metrics.append(client_data)
    
    # === DATOS PARA GRÁFICOS DE TENDENCIAS ===
    # Determinar la función de truncamiento según la agrupación temporal
    if time_grouping == 'day':
        trunc_func = TruncDay('created_at')
    elif time_grouping == 'week':
        trunc_func = TruncWeek('created_at')
    else:  # Por defecto, mes
        trunc_func = TruncMonth('created_at')
    
    # Tendencia de costes de tareas a lo largo del tiempo
    task_cost_trend = tasks.annotate(
        period=trunc_func
    ).values('period').annotate(
        total_cost=Sum('cost')
    ).order_by('period')
    
    # Tendencia de creación de proyectos
    project_creation_trend = projects.annotate(
        period=trunc_func
    ).values('period').annotate(
        count=Count('id'),
        total_cost=Sum('initial_cost')
    ).order_by('period')
    
    # Preparar datos de tendencias para el frontend
    task_cost_trend_data = [
        {
            'period': item['period'].strftime('%Y-%m-%d'),
            'total_cost': float(item['total_cost'] or 0)
        }
        for item in task_cost_trend
    ]
    
    project_trend_data = [
        {
            'period': item['period'].strftime('%Y-%m-%d'),
            'count': item['count'],
            'total_cost': float(item['total_cost'] or 0)
        }
        for item in project_creation_trend
    ]
    
    # === PROYECTOS MÁS COSTOSOS ===
    # Calcular coste total para cada proyecto (inicial + tareas)
    top_projects = []
    for project in projects:
        project_task_cost = Task.objects.filter(
            project=project, 
            created_at__date__gte=start_date, 
            created_at__date__lte=end_date
        ).aggregate(total=Sum('cost'))['total'] or Decimal('0.00')
        
        # Manejo seguro para evitar error de tipo cuando initial_cost es None
        initial_cost = project.initial_cost if project.initial_cost is not None else Decimal('0.00')
        total_project_cost = initial_cost + project_task_cost
        
        top_projects.append({
            'id': project.id,
            'name': project.name,
            'client': project.client.business_name,
            'initial_cost': float(initial_cost),  # Usamos la variable initial_cost ya verificada
            'task_cost': float(project_task_cost),
            'total_cost': float(total_project_cost),
            'status': project.status
        })
    
    # Ordenar proyectos por coste total descendente
    top_projects = sorted(top_projects, key=lambda x: x['total_cost'], reverse=True)[:10]
    
    # === CONSTRUIR RESPUESTA FINAL ===
    response_data = {
        'global_metrics': {
            'total_projects': total_projects,
            'total_tasks': total_tasks,
            'total_initial_cost': float(total_initial_cost),
            'total_task_cost': float(total_task_cost),
            'total_cost': float(total_initial_cost + total_task_cost),
            'tasks_with_cost': tasks_with_cost,
            'tasks_without_cost': tasks_without_cost,
            'filter_period': {
                'start_date': start_date.strftime('%Y-%m-%d'),
                'end_date': end_date.strftime('%Y-%m-%d')
            }
        },
        'task_status': task_status_data,
        'project_status': project_status_data,
        'client_metrics': client_metrics,
        'trends': {
            'task_cost': task_cost_trend_data,
            'projects': project_trend_data
        },
        'top_projects': top_projects
    }
    
    return Response(response_data)
