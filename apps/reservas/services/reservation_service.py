"""
Capa de Servicio para la lógica de negocio de Reservas.
Valida reglas empresariales y orquesta la creación y notificación.
"""

import uuid
import urllib.parse
from datetime import date, time, datetime, timedelta
from typing import Dict, Any, Optional
from apps.reservas.repositories.reservation_repository import (
    ReservationRepositoryInterface,
    DjangoReservationRepository,
)


class ReservationValidationError(Exception):
    """Excepción de dominio para errores en las reglas de reservación."""
    pass


class ReservationService:
    """
    Servicio de Dominio para la gestión de Reservas de El Ají Seco del Mar.
    """

    TELEFONO_OFICIAL_WHATSAPP = "56958259443"

    def __init__(self, repository: Optional[ReservationRepositoryInterface] = None):
        self.repository = repository or DjangoReservationRepository()

    def validate_and_create_reservation(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Aplica las reglas de negocio, valida aforo y horarios, y persiste la reserva.
        """
        nombre = payload.get('nombre_cliente', '').strip()
        email = payload.get('email', '').strip()
        telefono = payload.get('telefono', '').strip()
        fecha_str = payload.get('fecha')
        hora_str = payload.get('hora')
        comensales_raw = payload.get('comensales', 2)
        zona_slug = payload.get('zona_slug', 'salon-principal')
        notas = payload.get('notas_especiales', '').strip()

        if not nombre or len(nombre) < 3:
            raise ReservationValidationError("El nombre del cliente debe tener al menos 3 caracteres.")

        if not email or '@' not in email:
            raise ReservationValidationError("Ingrese un correo electrónico corporativo o personal válido.")

        if not telefono or len(telefono) < 8:
            raise ReservationValidationError("El número telefónico de contacto es obligatorio.")

        try:
            comensales = int(comensales_raw)
            if comensales < 1 or comensales > 30:
                raise ReservationValidationError("El número de comensales debe estar entre 1 y 30 personas.")
        except (ValueError, TypeError):
            raise ReservationValidationError("La cantidad de comensales no es válida.")

        # Validación de fecha
        try:
            fecha_obj = datetime.strptime(fecha_str, "%Y-%m-%d").date()
        except (ValueError, TypeError):
            raise ReservationValidationError("Formato de fecha inválido. Debe ser YYYY-MM-DD.")

        hoy = date.today()
        if fecha_obj < hoy:
            raise ReservationValidationError("No es posible agendar reservas en fechas pasadas.")

        if (fecha_obj - hoy).days > 60:
            raise ReservationValidationError("Las reservas se habilitan con un máximo de 60 días de anticipación.")

        # Validación de hora
        try:
            hora_obj = datetime.strptime(hora_str, "%H:%M").time()
        except (ValueError, TypeError):
            raise ReservationValidationError("Formato de hora inválido. Debe ser HH:MM (ej: 13:30, 20:00).")

        # Reglas de horario comercial El Ají Seco del Mar
        # Domingo: 12:00 a 20:45 (última reserva 19:30)
        # Lunes a Sábado: 12:00 a 24:00 (última reserva 22:30)
        es_domingo = fecha_obj.weekday() == 6
        if es_domingo:
            if hora_obj < time(12, 0) or hora_obj > time(19, 30):
                raise ReservationValidationError("Los domingos el horario de reservas es de 12:00 a 19:30 hrs.")
        else:
            if hora_obj < time(12, 0) or hora_obj > time(22, 30):
                raise ReservationValidationError("De lunes a sábado el horario de reservas es de 12:00 a 22:30 hrs.")

        # Validación de Zona
        zona = self.repository.get_zone_by_slug(zona_slug)
        if not zona:
            # Seleccionar primera zona activa por defecto
            zonas_activas = self.repository.get_active_zones()
            if not zonas_activas:
                raise ReservationValidationError("No hay zonas de restaurante configuradas.")
            zona = zonas_activas[0]

        # Validar capacidad disponible en la ventana de 90 minutos
        h_inicio = (datetime.combine(fecha_obj, hora_obj) - timedelta(minutes=45)).time()
        h_fin = (datetime.combine(fecha_obj, hora_obj) + timedelta(minutes=45)).time()
        asientos_ocupados = self.repository.count_reserved_seats(fecha_obj, h_inicio, h_fin, zona.id)

        if (asientos_ocupados + comensales) > zona.capacidad_personas:
            raise ReservationValidationError(
                f"Capacidad superada en {zona.nombre} para ese bloque horario. "
                "Por favor seleccione otra hora o comuníquese directamente vía WhatsApp."
            )

        # Generación de código único
        codigo_reserva = f"AJI-{uuid.uuid4().hex[:6].upper()}"

        reserva = self.repository.create_reservation({
            'codigo_reserva': codigo_reserva,
            'nombre_cliente': nombre,
            'email': email,
            'telefono': telefono,
            'fecha': fecha_obj,
            'hora': hora_obj,
            'comensales': comensales,
            'zona': zona,
            'notas_especiales': notas,
            'estado': 'PENDIENTE'
        })

        # Generar mensaje para WhatsApp
        mensaje_wa = (
            f"¡Hola El Ají Seco del Mar Viña del Mar!\n"
            f"He solicitado una reserva a través del sitio web:\n\n"
            f"🏷️ *Código:* #{reserva.codigo_reserva}\n"
            f"👤 *Nombre:* {reserva.nombre_cliente}\n"
            f"📅 *Fecha:* {reserva.fecha.strftime('%d/%m/%Y')}\n"
            f"⏰ *Hora:* {reserva.hora.strftime('%H:%M')} hrs\n"
            f"👥 *Personas:* {reserva.comensales}\n"
            f"📍 *Zona:* {zona.nombre}\n"
            f"📝 *Detalles:* {notas if notas else 'Ninguno'}\n\n"
            f"Por favor confirmar disponibilidad. ¡Muchas gracias!"
        )
        url_whatsapp = f"https://wa.me/{self.TELEFONO_OFICIAL_WHATSAPP}?text={urllib.parse.quote(mensaje_wa)}"

        return {
            'reserva_id': reserva.id,
            'codigo_reserva': reserva.codigo_reserva,
            'nombre_cliente': reserva.nombre_cliente,
            'fecha': reserva.fecha.strftime('%d/%m/%Y'),
            'hora': reserva.hora.strftime('%H:%M'),
            'comensales': reserva.comensales,
            'zona_nombre': zona.nombre,
            'whatsapp_url': url_whatsapp
        }
