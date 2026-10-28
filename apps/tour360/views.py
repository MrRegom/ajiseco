"""
Vistas de la aplicación Tour 360 VR.
Responsabilidad estricta: Orquestar la solicitud HTTP delegando en TourService.
Cero lógica de negocio pesada en las vistas.
"""

import json
from django.views import View
from django.shortcuts import render
from django.http import JsonResponse, HttpRequest, HttpResponse
from apps.tour360.services.tour_service import TourService


class Tour360View(View):
    """
    Vista principal que orquesta la entrega de la experiencia 360° inmersiva.
    """
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = TourService()

    def get(self, request: HttpRequest) -> HttpResponse:
        manifest = self.service.get_tour_manifest()
        context = {
            'manifest': manifest,
            'manifest_json': json.dumps(manifest),
            'page_title': 'TuEndpoint — Experiencia 360° VR para Restaurantes',
            'meta_description': 'Recorrido virtual inmersivo en 360 grados para restaurantes. Conoce Salón Central, Barra Signature, Cava VIP y Terraza con reserva interactiva por mesa.'
        }
        return render(request, 'tour360/tour.html', context)


class Tour360ApiView(View):
    """
    API Endpoint REST para clientes desacoplados o consumo AJAX.
    """
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = TourService()

    def get(self, request: HttpRequest) -> JsonResponse:
        manifest = self.service.get_tour_manifest()
        return JsonResponse({
            'status': 'success',
            'data': manifest
        })
