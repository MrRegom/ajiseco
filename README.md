# El Ají Seco del Mar — Plataforma Web de Alta Gastronomía

Plataforma web corporativa y experiencial para **El Ají Seco del Mar** (Av. San Martín 230, Viña del Mar), inspirada en el estándar de interacción cinemática de **Arko Sushi** (`arko-sushi.midudev.workers.dev`).

Diseñada bajo **Clean Architecture** (Arquitectura Limpia), principios **SOLID** y una paleta luminosa y amigable: **fondo blanco/marfil (`#ffffff`)**, mostaza andino (`#e5a93b`), azul pacífico (`#0284c7`) y negro carbón (`#1e1e24`).

---

## ✨ Características Principales

1. **Paseo Cinemático ScrollWorld (Arko Sushi Style)**:
   - Escenario fijo (`sticky 100lvh`) con 5 paradas inmersivas por las dependencias y preparaciones insignes de Viña del Mar.
   - Zoom progresivo (`scale`), opacidad por fotogramas reales y máscaras de luz blanca que garantizan lectura cristalina y apetitosa.
   - Raíl de paradas vertical lateral con barra de progreso continua (`data-rail-fill`) y puntos interactivos con salto suave.
2. **Acceso Inmediato a Documentos Oficiales (Pill Bar)**:
   - 📖 **Carta Completa (Google Drive PDF)**: Directo a la carta oficial del restaurante.
   - 🍽️ **Menú Ejecutivo Viña del Mar (PDF)**: Horario de lunes a viernes con descarga inmediata.
   - 💬 **WhatsApp Directo** (+56 9 5825 9443).
   - 📷 **Instagram** (`@elajiseco_delmar`).
   - 📍 **Cómo Llegar** (Av. San Martín 230).
3. **Bot Asistente Concierge de WhatsApp**:
   - Widget flotante inteligente que orienta al comensal antes de transferir a WhatsApp con mensajes preformateados.
4. **Carta Gastronómica Interactiva**:
   - Buscador en tiempo real por ingredientes o nombres.
   - Filtro por categorías (Cebiches & Tiraditos, Causas, Wok & Salteados, Pescados & Mariscos, Coctelería).
   - Alérgenos identificados según estándares gastronómicos.
5. **Túnel Sensorial 3D del Pacífico**:
   - Módulo interactivo con espiral áurea para explorar platos en 3D interactivo.
6. **Formulario de Reserva Amigable**:
   - Horarios de almuerzo y cena con selección de zona (Terraza San Martín, Salón Principal, Barra Cebichera) y confirmación por WhatsApp.

---

## 🏛️ Estructura del Proyecto

```
c:\proyectos\ajiseco\
├── apps/
│   ├── core/                  # Orquestación de vistas y comandos de seeding
│   ├── carta/                 # Dominio de platos, categorías y alérgenos (Repository & Service)
│   └── reservas/              # Dominio de reservas y disponibilidad (Repository & Service)
├── components/ui/             # Componentes React / TypeScript para shadcn/Tailwind
│   ├── scroll-world.tsx       # Componente ScrollWorld cinemático (Arko style)
│   ├── perspective-tunnel-hero.tsx
│   ├── whatsapp-concierge-bot.tsx
│   └── agentic-factory-3d.tsx
├── templates/                 # Plantillas HTML puras sin JS incrustado
│   ├── base.html
│   └── core/home.html
├── static/
│   ├── css/ajiseco.css        # Hoja de estilos unificada blanca, dorada y marina
│   ├── img/                   # Fotografías reales del restaurante y platos
│   └── js/
│       ├── scroll-world.js    # Motor de scroll cinemático e interpolación por tramos
│       ├── perspective-tunnel.js # Túnel 3D con espiral áurea
│       ├── whatsapp-bot.js    # Asistente concierge conversacional
│       ├── menu-filter.js     # Filtro y buscador en tiempo real
│       ├── booking-widget.js  # Gestor de reservas con fallback offline
│       └── main.js            # Navegación y accesibilidad WCAG
├── index.html                 # Versión estática 100% operativa (despliegue 1-clic)
└── vercel.json                # Configuración de despliegue Vercel
```

---

## 🚀 Despliegue en Vercel (Igual que Power Security)

1. En Vercel: **Add New → Project** e importar este repositorio / carpeta.
2. Framework Preset: **Other**.
3. Build Command: *vacío*.
4. Output Directory: *vacío*.
5. La plataforma funciona de forma estática autónoma con `index.html` y conexión con WhatsApp directo al restaurante.

---

## 🐍 Ejecución con Django

```bash
# 1. Migraciones y Carga de Datos
python manage.py migrate
python manage.py seed_ajiseco

# 2. Ejecutar Pruebas Unitarias
python manage.py test

# 3. Servidor de Desarrollo
python manage.py runserver 8000
```
Abrir: `http://127.0.0.1:8000/`
