"""
Capa de Servicio para la Carta Gastronómica.
Concentra las reglas de negocio y preparación de datos para la presentación y API.
"""

from typing import Dict, Any, List, Optional
from apps.carta.repositories.dish_repository import DishRepositoryInterface, DjangoDishRepository


class MenuService:
    """
    Servicio que implementa la lógica de negocio de la carta de El Ají Seco del Mar.
    Inyecta la interfaz del repositorio (DIP).
    """

    def __init__(self, repository: Optional[DishRepositoryInterface] = None):
        self.repository = repository or DjangoDishRepository()

    def get_full_catalog_context(self, category_slug: Optional[str] = None) -> Dict[str, Any]:
        """
        Retorna la estructura de datos enriquecida para el renderizado del template o API.
        """
        categories = self.repository.get_all_active_categories()
        dishes = self.repository.get_available_menu_items(category_slug=category_slug)
        featured_3d = self.repository.get_featured_3d_dishes()

        return {
            'categories': categories,
            'dishes': dishes,
            'featured_3d': featured_3d,
            'total_items': len(dishes),
            'active_filter': category_slug or 'todos'
        }

    def get_dishes_payload(self, category_slug: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Serializa de forma eficiente y segura la carta para consumo del frontend interactivo.
        """
        dishes = self.repository.get_available_menu_items(category_slug=category_slug)
        payload = []
        for dish in dishes:
            payload.append({
                'id': dish.id,
                'nombre': dish.nombre,
                'slug': dish.slug,
                'categoria': dish.categoria.nombre,
                'categoria_slug': dish.categoria.slug,
                'descripcion': dish.descripcion,
                'precio_clp': dish.precio_clp,
                'precio_formateado': dish.precio_formateado,
                'imagen_url': dish.imagen_url,
                'es_destacado': dish.es_destacado,
                'es_especialidad': dish.es_especialidad,
                'tiempo_estimado_min': dish.tiempo_estimado_min,
                'alergenos': [a.nombre for a in dish.alergenos.all()]
            })
        return payload

    def get_3d_experience_stations(self) -> List[Dict[str, Any]]:
        """
        Define las paradas espaciales y gastronómicas sincronizadas con la escena 3D WebGL.
        """
        return [
            {
                'id': 0,
                'tag': 'Bienvenida',
                'title': 'El Ají Seco del Mar',
                'subtitle': 'Gastronomía Peruana de Alta Gama en el Borde Costero',
                'description': 'Av. San Martín 230, Viña del Mar. Una atmósfera marina inmersiva donde el Pacífico y el sabor tradicional del Perú se fusionan.',
                'highlight': 'Terraza con vista & Salón Marino',
                'cta_text': 'Explorar Carta 3D',
                'cta_link': '#recorrido'
            },
            {
                'id': 1,
                'tag': 'Estación Cebichera',
                'title': 'Ceviches & Tiraditos al Rocoto',
                'subtitle': 'La Frescura del Pacífico en su Máxima Expresión',
                'description': 'Pescado fresco del día cortado al minuto, leche de tigre cremosa, choclo peruano desgranado y camote glaseado artesanal.',
                'highlight': 'Ceviche Mixto & Tiradito a los Tres Ajíes',
                'cta_text': 'Ver Platos Marinos',
                'cta_link': '#carta'
            },
            {
                'id': 2,
                'tag': 'Fuego y Wok',
                'title': 'Lomo Saltado Criollo',
                'subtitle': 'El Arte del Salteado a la Llama Viva',
                'description': 'Filete de res premium seleccionado, cebollas moradas crujientes, tomates frescos y reducción de soya y pisco peruano servido con papas fritas doradas y arroz con choclo.',
                'highlight': 'Sabor ahumado inconfundible',
                'cta_text': 'Explorar Brasas y Wok',
                'cta_link': '#carta'
            },
            {
                'id': 3,
                'tag': 'Cava & Coctelería',
                'title': 'Pisco Sour Catedral & Macerados',
                'subtitle': 'El Alma Líquida del Callao y Lima',
                'description': 'Pisco quebranta de selección, zumo de limón recién exprimido, jarabe de goma y amargo de angostura, servido con la espuma exacta.',
                'highlight': 'Pisco Sour Catedral, Maracuyá & Chicha Sour',
                'cta_text': 'Ver Coctelería',
                'cta_link': '#carta'
            },
            {
                'id': 4,
                'tag': 'Experiencia Sensorial',
                'title': 'Mesa Reservada & Eventos',
                'subtitle': 'Viva un Momento Inolvidable frente a la Costa',
                'description': 'Reserve su mesa en Terraza San Martín o Salón Principal. Atención preferente y opciones para cenas románticas, reuniones ejecutivas o celebraciones familiares.',
                'highlight': 'Confirmación inmediata y atención VIP',
                'cta_text': 'Reservar Mesa Ahora',
                'cta_link': '#reservas'
            }
        ]
