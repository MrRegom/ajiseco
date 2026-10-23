"""
Patrón Repository para la gestión de persistencia de Reservas.
"""

from abc import ABC, abstractmethod
from datetime import date, time
from typing import Optional, List
from django.db.models import Sum
from apps.reservas.models import Reserva, ZonaRestaurante


class ReservationRepositoryInterface(ABC):
    @abstractmethod
    def get_active_zones(self) -> List[ZonaRestaurante]:
        pass

    @abstractmethod
    def get_zone_by_slug(self, slug: str) -> Optional[ZonaRestaurante]:
        pass

    @abstractmethod
    def count_reserved_seats(self, fecha: date, hora_inicio: time, hora_fin: time, zona_id: int) -> int:
        pass

    @abstractmethod
    def create_reservation(self, reserva_data: dict) -> Reserva:
        pass


class DjangoReservationRepository(ReservationRepositoryInterface):
    def get_active_zones(self) -> List[ZonaRestaurante]:
        return list(ZonaRestaurante.objects.filter(activa=True))

    def get_zone_by_slug(self, slug: str) -> Optional[ZonaRestaurante]:
        try:
            return ZonaRestaurante.objects.get(slug=slug, activa=True)
        except ZonaRestaurante.DoesNotExist:
            return None

    def count_reserved_seats(self, fecha: date, hora_inicio: time, hora_fin: time, zona_id: int) -> int:
        resultado = Reserva.objects.filter(
            fecha=fecha,
            hora__gte=hora_inicio,
            hora__lte=hora_fin,
            zona_id=zona_id,
            estado__in=['PENDIENTE', 'CONFIRMADA']
        ).aggregate(total=Sum('comensales'))
        return resultado['total'] or 0

    def create_reservation(self, reserva_data: dict) -> Reserva:
        return Reserva.objects.create(**reserva_data)
