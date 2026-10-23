from django.urls import path
from apps.carta.views import MenuCatalogApiView, DishDetailApiView

app_name = 'carta'

urlpatterns = [
    path('api/platos/', MenuCatalogApiView.as_view(), name='api_platos'),
    path('api/platos/<slug:slug>/', DishDetailApiView.as_view(), name='api_plato_detalle'),
]
