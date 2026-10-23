"""
Pruebas Unitarias para el Servicio de Reservas.
Valida reglas de negocio: horarios, anticipación, cálculo de aforo y generación de enlace de contacto.
"""

from datetime import date, timedelta
from django.test import TestCase
from apps.reservas.models import ZonaRestaurante
from apps.reservas.services.reservation_service import ReservationService, ReservationValidationError


class ReservationServiceTestCase(TestCase):
    def setUp(self):
        self.zona = ZonaRestaurante.objects.create(
            nombre="Terraza Marina",
            slug="terraza-marina",
            capacidad_mesas=10,
            capacidad_personas=40,
            activa=True
        )
        self.service = ReservationService()

    def test_reservation_past_date_raises_error(self):
        ayer = (date.today() - timedelta(days=1)).strftime("%Y-%m-%d")
        payload = {
            'nombre_cliente': 'Carlos Mendoza',
            'email': 'carlos@empresa.cl',
            'telefono': '+56911223344',
            'fecha': ayer,
            'hora': '14:00',
            'comensales': 4,
            'zona_slug': 'terraza-marina'
        }
        with self.assertRaises(ReservationValidationError) as ctx:
            self.service.validate_and_create_reservation(payload)
        self.assertIn("No es posible agendar reservas en fechas pasadas", str(ctx.exception))

    def test_reservation_invalid_commercial_hours(self):
        manana = (date.today() + timedelta(days=2)).strftime("%Y-%m-%d")
        payload = {
            'nombre_cliente': 'Carlos Mendoza',
            'email': 'carlos@empresa.cl',
            'telefono': '+56911223344',
            'fecha': manana,
            'hora': '08:00',  # Cerrado por la mañana
            'comensales': 2,
            'zona_slug': 'terraza-marina'
        }
        with self.assertRaises(ReservationValidationError):
            self.service.validate_and_create_reservation(payload)

    def test_successful_reservation_creation(self):
        manana = (date.today() + timedelta(days=2)).strftime("%Y-%m-%d")
        payload = {
            'nombre_cliente': 'Valentina Valenzuela',
            'email': 'valentina@empresa.cl',
            'telefono': '+56987654321',
            'fecha': manana,
            'hora': '14:30',
            'comensales': 4,
            'zona_slug': 'terraza-marina',
            'notas_especiales': 'Celebración de aniversario'
        }
        resultado = self.service.validate_and_create_reservation(payload)
        self.assertIn('codigo_reserva', resultado)
        self.assertTrue(resultado['codigo_reserva'].startswith('AJI-'))
        self.assertIn('whatsapp_url', resultado)
        self.assertIn('wa.me', resultado['whatsapp_url'])
