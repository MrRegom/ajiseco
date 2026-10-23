"""
Comando de gestión corporativo para inicializar los datos maestros de El Ají Seco del Mar.
"""

from django.core.management.base import BaseCommand
from apps.carta.models import Categoria, Plato, Alergeno
from apps.reservas.models import ZonaRestaurante


class Command(BaseCommand):
    help = "Inicializa el catálogo gastronómico oficial y zonas de El Ají Seco del Mar (Viña del Mar)"

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Iniciando sembrado de datos maestros..."))

        # 1. Alérgenos
        alergenos_data = [
            ("Pescado y Derivados", "pescado"),
            ("Crustáceos y Mariscos", "mariscos"),
            ("Gluten / Trigo", "gluten"),
            ("Lácteos", "lactosa"),
            ("Huevo", "huevo"),
            ("Soja", "soja"),
        ]
        alergenos_dict = {}
        for nombre, codigo in alergenos_data:
            a, _ = Alergeno.objects.get_or_create(codigo=codigo, defaults={'nombre': nombre})
            alergenos_dict[codigo] = a

        # 2. Zonas del Restaurante
        zonas_data = [
            ("Terraza San Martín", "terraza-san-martin", 12, 48, "Brisa marina y vista a la vibrante avenida San Martín. Calefaccionada todo el año."),
            ("Salón Principal Marino", "salon-principal", 18, 72, "Elegancia, techos altos, iluminación cálida y la mejor acústica para veladas gastronómicas."),
            ("Barra Cebichera & Pisco Bar", "barra-cebichera", 6, 18, "Experiencia inmersiva en primera fila frente a los maestros cebicheros y mixólogos."),
        ]
        for nombre, slug, mesas, pers, desc in zonas_data:
            ZonaRestaurante.objects.get_or_create(
                slug=slug,
                defaults={
                    'nombre': nombre,
                    'capacidad_mesas': mesas,
                    'capacidad_personas': pers,
                    'descripcion': desc,
                    'activa': True
                }
            )

        # 3. Categorías
        cat_cebiches, _ = Categoria.objects.get_or_create(
            slug="cebiches-y-tiraditos",
            defaults={"nombre": "Cebiches & Tiraditos", "icono": "i-fish", "orden": 1}
        )
        cat_causas, _ = Categoria.objects.get_or_create(
            slug="causas-y-entradas",
            defaults={"nombre": "Causas & Entradas Frías", "icono": "i-star", "orden": 2}
        )
        cat_criollos, _ = Categoria.objects.get_or_create(
            slug="fondos-criollos",
            defaults={"nombre": "Wok & Fondos Criollos", "icono": "i-flame", "orden": 3}
        )
        cat_mariscos, _ = Categoria.objects.get_or_create(
            slug="arroces-y-mariscos",
            defaults={"nombre": "Arroces & Pescados a lo Macho", "icono": "i-utensils", "orden": 4}
        )
        cat_cocteleria, _ = Categoria.objects.get_or_create(
            slug="cocteleria-y-piscos",
            defaults={"nombre": "Coctelería & Piscos Sour", "icono": "i-glass", "orden": 5}
        )
        cat_postres, _ = Categoria.objects.get_or_create(
            slug="postres-tradicionales",
            defaults={"nombre": "Postres Limeños", "icono": "i-heart", "orden": 6}
        )

        # 4. Platos
        platos_data = [
            # Cebiches
            {
                "categoria": cat_cebiches,
                "nombre": "Ceviche Clásico del Pacífico",
                "slug": "ceviche-clasico-del-pacifico",
                "descripcion": "Corvina fresca de roca cortada en cubos macerados al instante en zumo de limón de pica, cebolla morada en pluma fina, cilantro, ají limo, camote glaseado y choclo tierno.",
                "precio_clp": 16900,
                "imagen_url": "static/img/platos/ceviche-clasico.jpg",
                "es_destacado": True,
                "es_especialidad": True,
                "tiempo_estimado_min": 12,
                "alergenos": ["pescado"],
                "orden": 1
            },
            {
                "categoria": cat_cebiches,
                "nombre": "Ceviche Mixto El Ají Seco",
                "slug": "ceviche-mixto-el-aji-seco",
                "descripcion": "Pesca del día acompañada de camarones ecuatorianos, calamares tiernos y pulpo macerados en leche de tigre al rocoto con toque ahumado.",
                "precio_clp": 18900,
                "imagen_url": "static/img/platos/ceviche-mixto.jpg",
                "es_destacado": True,
                "es_especialidad": True,
                "tiempo_estimado_min": 15,
                "alergenos": ["pescado", "mariscos"],
                "orden": 2
            },
            {
                "categoria": cat_cebiches,
                "nombre": "Tiradito a los Tres Ajíes",
                "slug": "tiradito-a-los-tres-ajies",
                "descripcion": "Finas láminas de reineta selladas con crema de ají amarillo, rocoto criollo y crema de aceitunas botija del Valle de Azapa.",
                "precio_clp": 17500,
                "imagen_url": "static/img/platos/tiradito-tres-ajies.jpg",
                "es_destacado": False,
                "es_especialidad": True,
                "tiempo_estimado_min": 14,
                "alergenos": ["pescado"],
                "orden": 3
            },
            # Causas
            {
                "categoria": cat_causas,
                "nombre": "Causa Limeña de Centolla & Camarón",
                "slug": "causa-limena-centolla-camaron",
                "descripcion": "Suave masa de papa amarilla prensada con pasta de ají amarillo y limón criollo, rellena de pulpa de centolla magallánica, colas de camarón y palta hass en finas láminas.",
                "precio_clp": 15900,
                "imagen_url": "static/img/platos/causa-centolla.jpg",
                "es_destacado": False,
                "es_especialidad": True,
                "tiempo_estimado_min": 12,
                "alergenos": ["mariscos", "huevo"],
                "orden": 1
            },
            # Fondos Criollos
            {
                "categoria": cat_criollos,
                "nombre": "Lomo Saltado al Wok Tradicional",
                "slug": "lomo-saltado-al-wok",
                "descripcion": "Trozos selectos de filete de res sellados a fuego vivo en wok chino, cebolla morada crujiente, tomates frescos, ají amarillo y cebollín, desglaseados con pisco y salsa de soya. Servido con papas fritas rústicas y arroz con choclo.",
                "precio_clp": 18500,
                "imagen_url": "static/img/platos/lomo-saltado.jpg",
                "es_destacado": True,
                "es_especialidad": True,
                "tiempo_estimado_min": 16,
                "alergenos": ["soja", "gluten"],
                "orden": 1
            },
            {
                "categoria": cat_criollos,
                "nombre": "Ají de Gallina Cremoso",
                "slug": "aji-de-gallina-cremoso",
                "descripcion": "Pechuga de ave deshilachada en suave crema de ají amarillo, nueces tostadas, caldo concentrado y queso parmesano gratinado sobre papas cocidas.",
                "precio_clp": 15900,
                "imagen_url": "static/img/platos/aji-gallina.jpg",
                "es_destacado": False,
                "es_especialidad": False,
                "tiempo_estimado_min": 15,
                "alergenos": ["lactosa", "gluten"],
                "orden": 2
            },
            # Arroces y Pescados
            {
                "categoria": cat_mariscos,
                "nombre": "Arroz con Mariscos a la Limeña",
                "slug": "arroz-con-mariscos-limena",
                "descripcion": "Arroz salteado en caldo concentrado de crustáceos con ají panca, vino blanco, arvejas tiernas, camarones, calamares, pulpo y choritos con toque de queso parmesano.",
                "precio_clp": 17900,
                "imagen_url": "static/img/platos/arroz-mariscos.jpg",
                "es_destacado": True,
                "es_especialidad": True,
                "tiempo_estimado_min": 18,
                "alergenos": ["mariscos", "pescado", "lactosa"],
                "orden": 1
            },
            {
                "categoria": cat_mariscos,
                "nombre": "Filete de Reineta a lo Macho",
                "slug": "filete-reineta-a-lo-macho",
                "descripcion": "Filete de pescado a la plancha bañado en una contundente y sedosa salsa de mariscos al vino blanco, ají panca y crema de leche.",
                "precio_clp": 19500,
                "imagen_url": "static/img/platos/pescado-a-lo-macho.jpg",
                "es_destacado": False,
                "es_especialidad": True,
                "tiempo_estimado_min": 20,
                "alergenos": ["pescado", "mariscos", "lactosa"],
                "orden": 2
            },
            # Coctelería
            {
                "categoria": cat_cocteleria,
                "nombre": "Pisco Sour Catedral Tradicional",
                "slug": "pisco-sour-catedral",
                "descripcion": "350cc de Pisco Quebranta peruano cuatro gallos, limón recién exprimido de pica, jarabe de goma artesanal, clara de huevo pasteurizada y gotas de amargo de Angostura.",
                "precio_clp": 8900,
                "imagen_url": "static/img/platos/pisco-sour.jpg",
                "es_destacado": True,
                "es_especialidad": True,
                "tiempo_estimado_min": 5,
                "alergenos": ["huevo"],
                "orden": 1
            },
            {
                "categoria": cat_cocteleria,
                "nombre": "Maracuyá Sour Tropical",
                "slug": "maracuya-sour-tropical",
                "descripcion": "Pisco aromático macerado, pulpa de fruta de la pasión fresca de Chanchamayo y balance perfecto de dulzor y acidez cítrica.",
                "precio_clp": 8500,
                "imagen_url": "static/img/platos/maracuya-sour.jpg",
                "es_destacado": False,
                "es_especialidad": False,
                "tiempo_estimado_min": 5,
                "alergenos": ["huevo"],
                "orden": 2
            },
            # Postres
            {
                "categoria": cat_postres,
                "nombre": "Suspiro a la Limeña Clásico",
                "slug": "suspiro-a-la-limena",
                "descripcion": "Manjar blanco cocinado a fuego lento con yemas de huevo de campo, coronado con merengue al oporto y lluvia de canela aromática.",
                "precio_clp": 6500,
                "imagen_url": "static/img/platos/suspiro-limeno.jpg",
                "es_destacado": False,
                "es_especialidad": True,
                "tiempo_estimado_min": 5,
                "alergenos": ["lactosa", "huevo"],
                "orden": 1
            }
        ]

        for p_data in platos_data:
            alergenos_keys = p_data.pop("alergenos")
            slug = p_data.pop("slug")
            plato, _ = Plato.objects.get_or_create(slug=slug, defaults=p_data)
            for a_key in alergenos_keys:
                if a_key in alergenos_dict:
                    plato.alergenos.add(alergenos_dict[a_key])

        self.stdout.write(self.style.SUCCESS("[OK] Catalogo gastronomico y zonas sembrados con exito."))
