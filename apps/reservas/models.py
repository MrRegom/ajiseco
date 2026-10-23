"""
Módulo de Modelos de Dominio para Reservaciones de Mesas.
Cumple con SOLID y Clean Architecture.
"""

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class ZonaRestaurante(models.Model):
    nombre = models.CharField(max_length=60, unique=True, verbose_name="Nombre de Zona")
    slug = models.SlugField(max_length=80, unique=True)
    capacidad_mesas = models.PositiveSmallIntegerField(default=10, verbose_name="Número de mesas disponibles")
    capacidad_personas = models.PositiveIntegerField(default=40, verbose_name="Capacidad total comensales")
    descripcion = models.TextField(blank=True, verbose_name="Ambiente y características")
    activa = models.BooleanField(default=True, verbose_name="¿Disponible para reservas?")

    class Meta:
        verbose_name = "Zona del Restaurante"
        verbose_name_plural = "Zonas del Restaurante"

    def __str__(self) -> str:
        return f"{self.nombre} (Capacidad: {self.capacidad_personas} pers.)"


class Reserva(models.Model):
    ESTADOS = (
        ('PENDIENTE', 'Pendiente de confirmación'),
        ('CONFIRMADA', 'Confirmada'),
        ('CANCELADA', 'Cancelada'),
        ('FINALIZADA', 'Finalizada'),
    )

    codigo_reserva = models.CharField(max_length=12, unique=True, editable=False)
    nombre_cliente = models.CharField(max_length=120, verbose_name="Nombre y Apellidos")
    email = models.EmailField(verbose_name="Correo electrónico")
    telefono = models.CharField(max_length=25, verbose_name="Teléfono / WhatsApp (+56...)")
    fecha = models.DateField(verbose_name="Fecha de la reserva")
    hora = models.TimeField(verbose_name="Hora")
    comensales = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(30)],
        verbose_name="Cantidad de personas"
    )
    zona = models.ForeignKey(
        ZonaRestaurante,
        on_delete=models.PROTECT,
        related_name="reservas",
        verbose_name="Zona preferida"
    )
    estado = models.CharField(max_length=20, choices=ESTADOS, default='PENDIENTE')
    notas_especiales = models.TextField(blank=True, verbose_name="Alergias o requerimientos especiales")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")

    class Meta:
        verbose_name = "Reserva"
        verbose_name_plural = "Reservas"
        ordering = ['-fecha', '-hora']

    def __str__(self) -> str:
        return f"Reserva #{self.codigo_reserva} - {self.nombre_cliente} ({self.fecha} {self.hora})"
