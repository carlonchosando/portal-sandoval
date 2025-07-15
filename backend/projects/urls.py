from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet
from .admin_views import admin_dashboard_metrics

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')

urlpatterns = [
    path('', include(router.urls)),
    path('admin/metrics/', admin_dashboard_metrics, name='admin-dashboard-metrics'),
]