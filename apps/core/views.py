"""
Vistas de la aplicación Núcleo (Core).
Orquesta la página principal inyectando los servicios de Carta y Reservas.
"""

from django.shortcuts import render
from django.views import View
from django.http import HttpRequest, HttpResponse
from apps.carta.services.menu_service import MenuService
from apps.reservas.repositories.reservation_repository import DjangoReservationRepository


class HomeView(View):
    """
    Controlador para la experiencia principal de El Ají Seco del Mar.
    Orquesta el catálogo gastronómico, estaciones del recorrido 3D y zonas disponibles.
    """
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.menu_service = MenuService()
        self.reservation_repo = DjangoReservationRepository()

    def get(self, request: HttpRequest) -> HttpResponse:
        catalog_context = self.menu_service.get_full_catalog_context()
        stations = self.menu_service.get_3d_experience_stations()
        zonas = self.reservation_repo.get_active_zones()

        context = {
            'categories': catalog_context['categories'],
            'dishes': catalog_context['dishes'],
            'featured_3d': catalog_context['featured_3d'],
            'stations': stations,
            'zonas': zonas,
            'restaurant_info': {
                'nombre': 'El Ají Seco del Mar',
                'direccion': 'Av. San Martín 230, Viña del Mar, Región de Valparaíso',
                'telefono': '+56 32 268 5463',
                'whatsapp': '+56 9 5825 9443',
                'instagram': '@elajiseco_delmar',
                'instagram_url': 'https://www.instagram.com/elajiseco_delmar',
                'horarios': {
                    'semana': 'Lunes a Sábado: 12:00 a 00:00 hrs',
                    'domingo': 'Domingos: 12:00 a 20:45 hrs'
                }
            }
        }
        return render(request, 'core/home.html', context)
