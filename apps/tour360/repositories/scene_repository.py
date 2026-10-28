"""
Repositorio de Escenas y Hotspots para el Tour 360° VR.
Capa de Acceso a Datos / Dominio bajo Clean Architecture y Principio SRP.
"""

from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any


class SceneRepositoryInterface(ABC):
    """
    Contrato abstracto para el acceso a escenas panorámicas 360 y puntos de interés.
    """

    @abstractmethod
    def get_all_scenes(self) -> List[Dict[str, Any]]:
        """Retorna la lista completa de escenas configuradas."""
        pass

    @abstractmethod
    def get_scene_by_id(self, scene_id: str) -> Optional[Dict[str, Any]]:
        """Retorna una escena específica por su identificador único."""
        pass

    @abstractmethod
    def get_radar_floor_plan(self) -> Dict[str, Any]:
        """Retorna la configuración geométrica del plano radar interactivo."""
        pass


class InMemorySceneRepository(SceneRepositoryInterface):
    """
    Implementación en memoria de alta velocidad y cero latencia.
    Estructura desacoplable a base de datos relacional (PostgreSQL/MySQL) o CMS Headless.
    """

    def __init__(self):
        self._scenes: Dict[str, Dict[str, Any]] = {
            'salon-principal': {
                'id': 'salon-principal',
                'name': 'Salón Central Gourmet',
                'category': 'Comedor Principal',
                'subtitle': 'Ambiente cálido con iluminación tenue, chimenea y mesas ejecutivas',
                'image_webp': '/static/img/tour360/salon-principal.webp',
                'image_jpg': '/static/img/tour360/salon-principal.jpg',
                'initial_view': {'yaw': 15, 'pitch': -4, 'fov': 75},
                'radar_coords': {'x': 48, 'y': 52},
                'hotspots': [
                    {
                        'id': 'hs-sp-mesa-04',
                        'type': 'table',
                        'yaw': 32,
                        'pitch': -11,
                        'title': 'Mesa 04 VIP (4 Personas)',
                        'badge': 'Mesa Disponible',
                        'description': 'Mesa central con iluminación focal cálida, sillones tapizados y servicio exclusivo de sommelier.',
                        'capacity': 4,
                        'action': 'reserve',
                        'min_consumption': '$30.000'
                    },
                    {
                        'id': 'hs-sp-mesa-08',
                        'type': 'table',
                        'yaw': -65,
                        'pitch': -10,
                        'title': 'Mesa 08 Ejecutiva (6 Personas)',
                        'badge': 'Mesa Ejecutiva',
                        'description': 'Espacio amplio para reuniones corporativas, almuerzos de negocios y celebraciones familiares.',
                        'capacity': 6,
                        'action': 'reserve',
                        'min_consumption': '$50.000'
                    },
                    {
                        'id': 'hs-sp-dish-lomo',
                        'type': 'dish',
                        'yaw': -18,
                        'pitch': -16,
                        'title': 'Lomo Saltado al Wok Endpoint',
                        'badge': 'Plato Insignia',
                        'price': '$18.900',
                        'description': 'Filete angus flameado al pisco quebranta, cebolla morada crocante, tomate y papas rústicas doradas.',
                        'image': '/static/img/lomo-saltado-wok.png',
                        'action': 'order'
                    },
                    {
                        'id': 'hs-sp-to-bar',
                        'type': 'portal',
                        'yaw': 118,
                        'pitch': -4,
                        'title': 'Pasar a la Barra Signature 🍸',
                        'badge': 'Siguiente Zona',
                        'target_scene': 'barra-signature'
                    },
                    {
                        'id': 'hs-sp-to-cava',
                        'type': 'portal',
                        'yaw': -135,
                        'pitch': -5,
                        'title': 'Bajar a Cava Privada VIP 🍷',
                        'badge': 'Zona Privada',
                        'target_scene': 'cava-vip'
                    }
                ]
            },
            'barra-signature': {
                'id': 'barra-signature',
                'name': 'Barra & Coctelería Signature',
                'category': 'Cocktail & Lounge',
                'subtitle': 'Mixología de vanguardia, destilados de colección y barra en vivo',
                'image_webp': '/static/img/tour360/barra-signature.webp',
                'image_jpg': '/static/img/tour360/barra-signature.jpg',
                'initial_view': {'yaw': 5, 'pitch': -3, 'fov': 75},
                'radar_coords': {'x': 78, 'y': 38},
                'hotspots': [
                    {
                        'id': 'hs-bar-pisco-sour',
                        'type': 'dish',
                        'yaw': 8,
                        'pitch': -7,
                        'title': 'Pisco Sour Catedral TuEndpoint',
                        'badge': 'Coctelería de Autor',
                        'price': '$7.900',
                        'description': 'Pisco artesanal 40°, limón de pica fresco exprimido al momento, jarabe de goma y amargo de angostura.',
                        'image': '/static/img/pisco-sour-catedral.png',
                        'action': 'order'
                    },
                    {
                        'id': 'hs-bar-seat-3',
                        'type': 'table',
                        'yaw': -42,
                        'pitch': -14,
                        'title': 'Barra Asiento 03 (Frontal)',
                        'badge': 'Experiencia Bartender',
                        'description': 'Primera fila frente a nuestra estación de coctelería experimental y ahumados.',
                        'capacity': 2,
                        'action': 'reserve',
                        'min_consumption': '$20.000'
                    },
                    {
                        'id': 'hs-bar-to-terraza',
                        'type': 'portal',
                        'yaw': 88,
                        'pitch': -4,
                        'title': 'Salir a la Terraza Sunset 🌅',
                        'badge': 'Exterior',
                        'target_scene': 'terraza-lounge'
                    },
                    {
                        'id': 'hs-bar-to-salon',
                        'type': 'portal',
                        'yaw': -145,
                        'pitch': -5,
                        'title': 'Volver al Salón Central 🍽️',
                        'badge': 'Salón Principal',
                        'target_scene': 'salon-principal'
                    }
                ]
            },
            'cava-vip': {
                'id': 'cava-vip',
                'name': 'Cava Privada & Salón Degustación',
                'category': 'Exclusivo VIP',
                'subtitle': 'Bóveda en madera noble y piedra para cenas de gala y catas guiadas',
                'image_webp': '/static/img/tour360/cava-vip.webp',
                'image_jpg': '/static/img/tour360/cava-vip.jpg',
                'initial_view': {'yaw': 0, 'pitch': -6, 'fov': 72},
                'radar_coords': {'x': 22, 'y': 70},
                'hotspots': [
                    {
                        'id': 'hs-cava-table-presidential',
                        'type': 'table',
                        'yaw': -3,
                        'pitch': -14,
                        'title': 'Mesa Presidencial Cava (12 Personas)',
                        'badge': 'Salón Cerrado VIP',
                        'description': 'Mesa de cata privada con sommelier personal, cristalería Riedel y menú degustación a 7 tiempos.',
                        'capacity': 12,
                        'action': 'reserve',
                        'min_consumption': '$120.000'
                    },
                    {
                        'id': 'hs-cava-info-wines',
                        'type': 'info',
                        'yaw': 68,
                        'pitch': -6,
                        'title': 'Cava Subterránea con +350 Etiquetas',
                        'badge': 'Colección Enológica',
                        'description': 'Vinos de guarda chilenos, cepas patrimoniales, añadas históricas y selecciones internacionales de Burdeos y Mendoza.'
                    },
                    {
                        'id': 'hs-cava-to-salon',
                        'type': 'portal',
                        'yaw': -176,
                        'pitch': -5,
                        'title': 'Subir al Salón Central 🍽️',
                        'badge': 'Regresar',
                        'target_scene': 'salon-principal'
                    }
                ]
            },
            'terraza-lounge': {
                'id': 'terraza-lounge',
                'name': 'Terraza Sunset & Deck Exterior',
                'category': 'Aire Libre',
                'subtitle': 'Vista panorámica al atardecer, brisa marina y confort en cada detalle',
                'image_webp': '/static/img/tour360/terraza-lounge.webp',
                'image_jpg': '/static/img/tour360/terraza-lounge.jpg',
                'initial_view': {'yaw': 30, 'pitch': -6, 'fov': 75},
                'radar_coords': {'x': 82, 'y': 80},
                'hotspots': [
                    {
                        'id': 'hs-ter-mesa-21',
                        'type': 'table',
                        'yaw': 24,
                        'pitch': -11,
                        'title': 'Mesa 21 Sunset Frontline (4 Personas)',
                        'badge': 'Vista Panorámica',
                        'description': 'La ubicación más demandada al atardecer. Climatización radiante y vista directa al horizonte.',
                        'capacity': 4,
                        'action': 'reserve',
                        'min_consumption': '$40.000'
                    },
                    {
                        'id': 'hs-ter-dish-ceviche',
                        'type': 'dish',
                        'yaw': -48,
                        'pitch': -15,
                        'title': 'Ceviche Mixto al Fuego Endpoint',
                        'badge': 'Mariscos Frescos',
                        'price': '$19.500',
                        'description': 'Corvina recién desembarcada, camarones sellados, pulpo tierno, chulpi crocante y camote glaseado.',
                        'image': '/static/img/cebiche-clasico.png',
                        'action': 'order'
                    },
                    {
                        'id': 'hs-ter-to-bar',
                        'type': 'portal',
                        'yaw': -125,
                        'pitch': -4,
                        'title': 'Entrar a Barra Signature 🍸',
                        'badge': 'Interior',
                        'target_scene': 'barra-signature'
                    }
                ]
            }
        }

    def get_all_scenes(self) -> List[Dict[str, Any]]:
        return list(self._scenes.values())

    def get_scene_by_id(self, scene_id: str) -> Optional[Dict[str, Any]]:
        return self._scenes.get(scene_id)

    def get_radar_floor_plan(self) -> Dict[str, Any]:
        return {
            'restaurant_name': 'TuEndpoint Restaurant & Gourmet Lounge',
            'width': 600,
            'height': 400,
            'zones': [
                {'id': 'salon-principal', 'name': 'Salón Central', 'x': 48, 'y': 52},
                {'id': 'barra-signature', 'name': 'Barra Cocktail', 'x': 78, 'y': 38},
                {'id': 'cava-vip', 'name': 'Cava VIP', 'x': 22, 'y': 70},
                {'id': 'terraza-lounge', 'name': 'Terraza Sunset', 'x': 82, 'y': 80},
            ]
        }
