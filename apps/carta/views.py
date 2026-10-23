"""
Vistas de la aplicación Carta.
Responsabilidad estricta: Orquestar la solicitud HTTP delegando en MenuService.
"""

from django.http import JsonResponse, HttpRequest, HttpResponse
from django.views import View
from apps.carta.services.menu_service import MenuService


class MenuCatalogApiView(View):
    """
    Endpoint REST seguro para la obtención dinámica de platos filtrados.
    """
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = MenuService()

    def get(self, request: HttpRequest) -> JsonResponse:
        categoria_slug = request.GET.get('categoria', None)
        data = self.service.get_dishes_payload(category_slug=categoria_slug)
        return JsonResponse({
            'status': 'success',
            'count': len(data),
            'categoria': categoria_slug or 'todos',
            'data': data
        })


class DishDetailApiView(View):
    """
    Endpoint para obtener el detalle de un plato por slug.
    """
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = MenuService()

    def get(self, request: HttpRequest, slug: str) -> JsonResponse:
        plato = self.service.repository.get_by_slug(slug)
        if not plato:
            return JsonResponse({'status': 'error', 'message': 'Plato no encontrado'}, status=404)

        return JsonResponse({
            'status': 'success',
            'data': {
                'id': plato.id,
                'nombre': plato.nombre,
                'slug': plato.slug,
                'categoria': plato.categoria.nombre,
                'descripcion': plato.descripcion,
                'precio_clp': plato.precio_clp,
                'precio_formateado': plato.precio_formateado,
                'imagen_url': plato.imagen_url,
                'es_especialidad': plato.es_especialidad,
                'tiempo_estimado_min': plato.tiempo_estimado_min,
                'alergenos': [a.nombre for a in plato.alergenos.all()]
            }
        })
