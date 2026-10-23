"""
Módulo de Modelos de Dominio para la Carta Gastronómica.
Cumple con SOLID: Los modelos solo definen el esquema de datos y comportamientos intrínsecos.
"""

from django.db import models


class Categoria(models.Model):
    nombre = models.CharField(max_length=80, unique=True, verbose_name="Nombre de Categoría")
    slug = models.SlugField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, verbose_name="Descripción comercial")
    icono = models.CharField(max_length=40, default="i-fish", help_text="Identificador de ícono SVG")
    orden = models.PositiveSmallIntegerField(default=0, verbose_name="Orden de visualización")
    activa = models.BooleanField(default=True, verbose_name="¿Categoría Activa?")

    class Meta:
        verbose_name = "Categoría"
        verbose_name_plural = "Categorías"
        ordering = ['orden', 'nombre']

    def __str__(self) -> str:
        return self.nombre


class Alergeno(models.Model):
    nombre = models.CharField(max_length=60, unique=True)
    codigo = models.CharField(max_length=20, unique=True, help_text="Ej: gluten, mariscos, lactosa")

    class Meta:
        verbose_name = "Alérgeno"
        verbose_name_plural = "Alérgenos"
        ordering = ['nombre']

    def __str__(self) -> str:
        return self.nombre


class Plato(models.Model):
    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.PROTECT,
        related_name="platos",
        verbose_name="Categoría"
    )
    nombre = models.CharField(max_length=120, verbose_name="Nombre del Plato")
    slug = models.SlugField(max_length=140, unique=True)
    descripcion = models.TextField(verbose_name="Descripción e ingredientes clave")
    precio_clp = models.PositiveIntegerField(verbose_name="Precio en CLP")
    imagen_url = models.CharField(max_length=500, blank=True, verbose_name="URL de Imagen o Render")
    es_destacado = models.BooleanField(default=False, verbose_name="¿Plato Destacado 3D?")
    es_especialidad = models.BooleanField(default=False, verbose_name="¿Especialidad de la Casa?")
    tiempo_estimado_min = models.PositiveSmallIntegerField(default=15, verbose_name="Tiempo de preparación (min)")
    alergenos = models.ManyToManyField(Alergeno, blank=True, related_name="platos")
    disponible = models.BooleanField(default=True, verbose_name="¿Disponible?")
    orden = models.PositiveSmallIntegerField(default=0)

    class Meta:
        verbose_name = "Plato"
        verbose_name_plural = "Platos"
        ordering = ['categoria__orden', 'orden', 'nombre']

    def __str__(self) -> str:
        return f"{self.nombre} (${self.precio_clp:,} CLP)"

    @property
    def precio_formateado(self) -> str:
        return f"${self.precio_clp:,.0f}".replace(",", ".")
