"""
Pruebas Unitarias y de Integración para el módulo Tour 360° VR.
Arquitectura Limpia: Verificación de Repositorio, Servicio y Vistas.
"""

import json
from django.test import TestCase, Client
from django.urls import reverse
from apps.tour360.repositories.scene_repository import InMemorySceneRepository
from apps.tour360.services.tour_service import TourService


class SceneRepositoryTestCase(TestCase):
    """Pruebas para el Repositorio de Escenas Panorámicas."""

    def setUp(self):
        self.repo = InMemorySceneRepository()

    def test_repository_contains_all_four_restaurant_scenes(self):
        scenes = self.repo.get_all_scenes()
        self.assertEqual(len(scenes), 5)

        scene_ids = [s['id'] for s in scenes]
        self.assertIn('salon-principal', scene_ids)
        self.assertIn('barra-signature', scene_ids)
        self.assertIn('cava-vip', scene_ids)
        self.assertIn('terraza-lounge', scene_ids)
        self.assertIn('mi-comedor', scene_ids)

    def test_scene_attributes_integrity(self):
        scene = self.repo.get_scene_by_id('salon-principal')
        self.assertIsNotNone(scene)
        self.assertEqual(scene['name'], 'Salón Central Gourmet')
        self.assertIn('.webp', scene['image_webp'])
        self.assertIn('hotspots', scene)
        self.assertGreater(len(scene['hotspots']), 0)
        self.assertIn('radar_coords', scene)

    def test_radar_floor_plan_configuration(self):
        plan = self.repo.get_radar_floor_plan()
        self.assertIn('zones', plan)
        self.assertEqual(len(plan['zones']), 5)


class TourServiceTestCase(TestCase):
    """Pruebas de la capa de Lógica de Negocio."""

    def setUp(self):
        self.service = TourService()

    def test_manifest_structure(self):
        manifest = self.service.get_tour_manifest()
        self.assertIn('brand', manifest)
        self.assertEqual(manifest['brand']['name'], 'TuEndpoint')
        self.assertEqual(manifest['default_scene_id'], 'salon-principal')
        self.assertIn('scenes', manifest)
        self.assertIn('radar_plan', manifest)
        self.assertIn('b2b_benefits', manifest)

    def test_commercial_b2b_highlights(self):
        highlights = self.service.get_commercial_highlights()
        self.assertGreater(len(highlights), 0)
        titles = [h['title'] for h in highlights]
        self.assertTrue(any('Reservas Directas' in t for t in titles))


class TourViewsTestCase(TestCase):
    """Pruebas de Integración HTTP de las Vistas."""

    def setUp(self):
        self.client = Client()

    def test_tour_view_renders_template_successfully(self):
        url = reverse('tour360:index')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'tour360/tour.html')
        self.assertIn('manifest', response.context)
        self.assertIn('manifest_json', response.context)

        # Validar que manifest_json sea JSON válido y parseable
        parsed = json.loads(response.context['manifest_json'])
        self.assertEqual(parsed['brand']['name'], 'TuEndpoint')

    def test_api_manifest_endpoint(self):
        url = reverse('tour360:manifest')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['status'], 'success')
        self.assertEqual(data['data']['brand']['name'], 'TuEndpoint')
