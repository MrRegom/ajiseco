"""
Patrón Repository para el acceso a datos de la Carta Gastronómica.
Desacopla la lógica de negocio de las consultas del ORM de Django.
"""

from abc import ABC, abstractmethod
from typing import List, Optional
from apps.carta.models import Plato, Categoria


class DishRepositoryInterface(ABC):
    @abstractmethod
    def get_all_active_categories(self) -> List[Categoria]:
        pass

    @abstractmethod
    def get_featured_3d_dishes(self) -> List[Plato]:
        pass

    @abstractmethod
    def get_available_menu_items(self, category_slug: Optional[str] = None) -> List[Plato]:
        pass

    @abstractmethod
    def get_by_slug(self, slug: str) -> Optional[Plato]:
        pass


class DjangoDishRepository(DishRepositoryInterface):
    """
    Implementación concreta del repositorio utilizando el ORM de Django optimizado
    con select_related y prefetch_related para evitar el problema N+1.
    """

    def get_all_active_categories(self) -> List[Categoria]:
        return list(
            Categoria.objects.filter(activa=True)
            .prefetch_related('platos')
            .order_by('orden', 'nombre')
        )

    def get_featured_3d_dishes(self) -> List[Plato]:
        return list(
            Plato.objects.filter(disponible=True, es_destacado=True)
            .select_related('categoria')
            .prefetch_related('alergenos')
            .order_by('orden')
        )

    def get_available_menu_items(self, category_slug: Optional[str] = None) -> List[Plato]:
        qs = Plato.objects.filter(disponible=True).select_related('categoria').prefetch_related('alergenos')
        if category_slug and category_slug != 'todos':
            qs = qs.filter(categoria__slug=category_slug)
        return list(qs.order_by('categoria__orden', 'orden', 'nombre'))

    def get_by_slug(self, slug: str) -> Optional[Plato]:
        try:
            return Plato.objects.select_related('categoria').prefetch_related('alergenos').get(slug=slug, disponible=True)
        except Plato.DoesNotExist:
            return None
