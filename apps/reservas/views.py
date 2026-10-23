"""
Vistas de la aplicación Reservas.
Orquesta solicitudes HTTP y delega en ReservationService.
"""

import json
from django.http import JsonResponse, HttpRequest
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from apps.reservas.services.reservation_service import ReservationService, ReservationValidationError


@method_decorator(csrf_exempt, name='dispatch')
class ReservationCreateApiView(View):
    """
    API REST para procesar solicitudes de reserva de mesa.
    """
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = ReservationService()

    def post(self, request: HttpRequest) -> JsonResponse:
        try:
            if request.content_type == 'application/json':
                payload = json.loads(request.body)
            else:
                payload = request.POST.dict()

            resultado = self.service.validate_and_create_reservation(payload)

            return JsonResponse({
                'status': 'success',
                'message': 'Reserva solicitada exitosamente.',
                'data': resultado
            }, status=201)

        except ReservationValidationError as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)
        except json.JSONDecodeError:
            return JsonResponse({
                'status': 'error',
                'message': 'Cuerpo de solicitud JSON inválido.'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': 'Error interno del servidor al procesar la reserva.'
            }, status=500)
