"""
Servicio de Negocio para el Tour 360° VR Inmersivo.
Capa de Servicios bajo Clean Architecture y Principios SOLID (SRP).
"""

from typing import Dict, List, Any, Optional
from apps.tour360.repositories.scene_repository import SceneRepositoryInterface, InMemorySceneRepository


class TourService:
    """
    Servicio encargado de la orquestación de escenas, validación de puntos interactivos
    y generación de manifiesto B2B para la oferta comercial a restaurantes.
    """

    def __init__(self, repository: Optional[SceneRepositoryInterface] = None):
        self.repository = repository or InMemorySceneRepository()

    def get_tour_manifest(self) -> Dict[str, Any]:
        """
        Retorna la estructura completa y validada requerida por el motor 3D cliente.
        """
        scenes = self.repository.get_all_scenes()
        radar_plan = self.repository.get_radar_floor_plan()

        return {
            'brand': {
                'name': 'TuEndpoint',
                'commercial_name': 'TuEndpoint | Restaurant & Gourmet Lounge',
                'tagline': 'Experiencia Gastronómica en Realidad Virtual 360°',
                'phone': '+56945678900',
                'whatsapp_link': 'https://wa.me/56945678900?text=Hola%20TuEndpoint%2C%20quiero%20cotizar%20un%20Tour%20360%20VR%20para%20mi%20restaurante'
            },
            'default_scene_id': 'salon-principal',
            'scenes': scenes,
            'radar_plan': radar_plan,
            'b2b_benefits': self.get_commercial_highlights()
        }

    def get_scene(self, scene_id: str) -> Optional[Dict[str, Any]]:
        """
        Obtiene el detalle seguro de una escena específica.
        """
        return self.repository.get_scene_by_id(scene_id)

    @staticmethod
    def get_commercial_highlights() -> List[Dict[str, str]]:
        """
        Propuesta de valor comercial para vender este producto a dueños de restaurantes.
        """
        return [
            {
                'title': 'Incremento de Reservas Directas (+42%)',
                'description': 'El cliente recorre el restaurante antes de llegar, disipando dudas y eligiendo con seguridad su mesa predilecta.'
            },
            {
                'title': 'Reserva Directa por Mesa en 360°',
                'description': 'Cada mesa cuenta con un hotspot interactivo con capacidad, consumo mínimo y enlace directo a reserva.'
            },
            {
                'title': 'Efecto Realidad Virtual en Smartphone',
                'description': 'Aprovecha el giroscopio del móvil del cliente sin necesidad de cascos VR. Girar el celular pivota la vista en tiempo real.'
            },
            {
                'title': 'Aumento del Ticket Promedio',
                'description': 'Exhibe platos icónicos y cócteles de autor en 3D mientras el cliente recorre la barra y el salón.'
            },
            {
                'title': 'Integración Omnicanal Instantánea',
                'description': 'Se enlaza con un clic en la biografía de Instagram, ficha de Google Maps, códigos QR en servilletas y sitio web.'
            }
        ]
