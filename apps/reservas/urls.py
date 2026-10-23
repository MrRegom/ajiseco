from django.urls import path
from apps.reservas.views import ReservationCreateApiView

app_name = 'reservas'

urlpatterns = [
    path('api/reservar/', ReservationCreateApiView.as_view(), name='api_reservar'),
]
