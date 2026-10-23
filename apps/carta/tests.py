"""
Pruebas Unitarias para la lógica de negocio de la Carta Gastronómica.
Verifica principios SOLID e independencia del repositorio.
"""

from django.test import TestCase
from apps.carta.models import Categoria, Plato
from apps.carta.services.menu_service import MenuService
from apps.carta.repositories.dish_repository import DjangoDishRepository


class MenuServiceTestCase(TestCase):
    def setUp(self):
        self.cat = Categoria.objects.create(
            nombre="Cebiches",
            slug="cebiches",
            orden=1,
            activa=True
        )
        self.plato = Plato.objects.create(
            categoria=self.cat,
            nombre="Ceviche Clásico",
            slug="ceviche-clasico",
            descripcion="Pescado del día con leche de tigre",
            precio_clp=16900,
            es_destacado=True,
            es_especialidad=True,
            disponible=True
        )
        self.service = MenuService(DjangoDishRepository())

    def test_get_full_catalog_context(self):
        context = self.service.get_full_catalog_context()
        self.assertIn('categories', context)
        self.assertIn('dishes', context)
        self.assertEqual(len(context['categories']), 1)
        self.assertEqual(context['total_items'], 1)

    def test_get_dishes_payload_structure(self):
        payload = self.service.get_dishes_payload()
        self.assertEqual(len(payload), 1)
        item = payload[0]
        self.assertEqual(item['nombre'], "Ceviche Clásico")
        self.assertEqual(item['precio_clp'], 16900)
        self.assertIn("$16.900", item['precio_formateado'])

    def test_filter_by_category_slug(self):
        payload = self.service.get_dishes_payload(category_slug="cebiches")
        self.assertEqual(len(payload), 1)
        empty_payload = self.service.get_dishes_payload(category_slug="inexistente")
        self.assertEqual(len(empty_payload), 0)
