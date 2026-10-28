"""
Enrutamiento URL para el módulo de Tour 360° VR.
"""

from django.urls import path
from apps.tour360.views import Tour360View, Tour360ApiView

app_name = 'tour360'

urlpatterns = [
    path('', Tour360View.as_view(), name='index'),
    path('api/manifest/', Tour360ApiView.as_view(), name='manifest'),
]
