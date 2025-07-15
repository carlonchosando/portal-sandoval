# Documentación Panel Administrativo - Portal Sandoval

## Descripción General

El Panel Administrativo proporciona una interfaz para visualizar métricas financieras y datos de tareas en tiempo real. Esta funcionalidad está restringida exclusivamente a usuarios con permisos de administrador.

## Endpoints de API

### Métricas Administrativas

```
GET /api/v1/admin/metrics/
```

**Permisos requeridos:** `IsAdminUser` (is_staff=True o is_superuser=True)

**Parámetros:**
- `start_date` (opcional): Fecha de inicio para filtrar métricas (formato: YYYY-MM-DD)
- `end_date` (opcional): Fecha de fin para filtrar métricas (formato: YYYY-MM-DD)
- `client_id` (opcional): ID del cliente para filtrar métricas
- `group_by` (opcional): Agrupación temporal de datos ('day', 'week', 'month')

**Respuesta:**
```json
{
  "global_metrics": {
    "total_revenue": "0.00",
    "total_tasks": 0,
    "completed_tasks": 0,
    "completion_rate": 0
  },
  "client_metrics": [
    {
      "client_id": 1,
      "client_name": "Cliente Ejemplo",
      "revenue": "0.00",
      "tasks": 0,
      "completed": 0,
      "completion_rate": 0
    }
  ],
  "time_series": [
    {
      "period": "2025-07-01",
      "revenue": "0.00",
      "tasks": 0
    }
  ],
  "top_projects": [
    {
      "project_id": 1,
      "project_name": "Proyecto Ejemplo",
      "revenue": "0.00",
      "tasks": 0
    }
  ]
}
```

## Implementación Frontend

### Componente AdminDashboard

El componente `AdminDashboard.js` implementa la visualización de métricas administrativas con las siguientes características:

1. **Versión Simplificada**: Para garantizar la compatibilidad con el entorno Docker sin dependencias adicionales.
   - Usa inputs nativos de tipo date en lugar de react-datepicker
   - Muestra datos tabulares en lugar de gráficos Chart.js
   - Implementa exportación básica en lugar de react-to-print

2. **Filtrado de Datos**:
   - Por fecha (desde/hasta)
   - Por cliente
   - Por agrupación temporal (día/semana/mes)

3. **Visualización de Métricas**:
   - Métricas globales (ingresos totales, tareas, tasa de completado)
   - Métricas por cliente
   - Series temporales
   - Proyectos principales

### Acceso al Panel

El panel administrativo es accesible a través de dos métodos:

1. **Ruta directa**: `/admin`
2. **Botón en Dashboard principal**: Ubicado en la sección "Herramientas de Administración"

## Verificación de Permisos

La verificación de permisos de administrador se implementa de dos formas:

1. **Backend**: Mediante el decorador `@permission_classes([IsAdminUser])` en el endpoint
2. **Frontend**: Intentando acceder al endpoint de métricas administrativas. Si el acceso es exitoso, el usuario es administrador.

## Consideraciones Importantes

### Manejo de Valores Decimales

Es necesario tener especial cuidado con los campos de coste para asegurar la correcta conversión entre el frontend y el backend:

- En el frontend: Los valores deben convertirse a formato decimal antes de enviarse al backend
- En el backend: Los valores se procesan y almacenan como DecimalField

### Solución de Problemas

**Error 404 al verificar estado de administrador**:
- Problema: La ruta `/api/v1/auth/user/` no existe en el backend
- Solución: Se modificó el método de verificación en App.js para usar el endpoint de métricas administrativas

**Permisos de administrador**:
- Para convertir un usuario en administrador, ejecutar en la shell de Django:
```
python manage.py shell -c "from django.contrib.auth.models import User; user = User.objects.get(username='nombre_usuario'); user.is_staff=True; user.is_superuser=True; user.save()"
```
- Dentro del contenedor Docker:
```
docker-compose exec backend python manage.py shell -c "from django.contrib.auth.models import User; user = User.objects.get(username='nombre_usuario'); user.is_staff=True; user.is_superuser=True; user.save()"
```

**Errores de dependencias en Docker**:
- La versión simplificada del panel administrativo elimina dependencias de:
  - react-datepicker
  - chart.js y react-chartjs-2
  - react-to-print

## Próximas Mejoras Recomendadas

1. Incluir las dependencias en el Dockerfile para permitir la versión completa con gráficos
2. Implementar tests unitarios para el endpoint de métricas y el componente frontend
3. Añadir más filtros y opciones de visualización
4. Mejorar la exportación de datos
