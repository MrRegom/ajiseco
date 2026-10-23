'use client'

import React, { useEffect, useRef, useState } from 'react'

/**
 * ==============================================================================
 * ScrollWorld — Cinematic Storytelling Walkthrough (Arko Sushi Style)
 * 
 * Inspired by Arko Sushi (midudev/mcp-higgsfield-landing) adapted for
 * "El Ají Seco del Mar" (Viña del Mar, Chile).
 * Features:
 * - Sticky full-height stage (100vh / 100lvh)
 * - Progressive scroll-scrubbed image zoom and cross-dissolving frames
 * - Interactive vertical progress rail with active pills and dots
 * - High-contrast luminous scrims ensuring readability over real photography
 * - Native TypeScript, SSR-safe, React 18/19 compatible
 * ==============================================================================
 */

export interface ScrollStop {
  id: string
  number: string
  location: string
  eyebrow?: string
  title: string | React.ReactNode
  description: string
  image: string
  alt: string
  pills?: string[]
  stats?: { label: string; value: string }[]
  ctaPrimary?: { label: string; href: string }
  ctaSecondary?: { label: string; href: string }
}

export interface ScrollWorldProps {
  stops?: ScrollStop[]
  className?: string
  accentColor?: string
}

const DEFAULT_STOPS: ScrollStop[] = [
  {
    id: 'inicio',
    number: '01 / 05',
    location: 'Av. San Martín 230 · Viña del Mar',
    eyebrow: 'Tradición Marina & Criolla',
    title: (
      <>
        El mar del Pacífico <br className="hidden sm:inline" />
        <span className="text-[#e5a93b]">con alma criolla</span>
      </>
    ),
    description:
      'En el corazón de San Martín, unimos la frescura insuperable de nuestras costas con la centenaria maestría de la gastronomía peruana tradicional. Abierto de lunes a domingo.',
    image: '/static/img/entrada-san-martin.png',
    alt: 'Entrada de El Ají Seco del Mar en Av. San Martín 230',
    pills: ['Pesca fresca del día', 'A pasos de la playa', 'Recetas tradicionales'],
    ctaPrimary: { label: 'Reservar Mesa', href: '#reservas' },
    ctaSecondary: {
      label: 'Carta Completa (Drive PDF)',
      href: 'https://drive.google.com/file/d/170K6LLQenv_8Ctomo8HTva3OzuKd4Dz-/view',
    },
  },
  {
    id: 'cebicheria',
    number: '02 / 05',
    location: 'Barra Cebichera',
    eyebrow: 'Pesca del Día & Leche de Tigre',
    title: (
      <>
        Cebiches al momento <br className="hidden sm:inline" />
        <span className="text-[#e5a93b]">con limón recién exprimido</span>
      </>
    ),
    description:
      'Corvina, reineta y mariscos seleccionados macerados al instante con ají limo, choclo tierno y camote glaseado. Sin intermediarios, directo de la lonja a su plato.',
    image: '/static/img/cebiche-clasico.png',
    alt: 'Cebiche clásico de corvina en El Ají Seco del Mar',
    stats: [
      { label: 'Pesca Artesanal', value: '100% Fresca' },
      { label: 'Leche de Tigre', value: 'Al Momento' },
    ],
    pills: ['Limón de Pica & Sutil', 'Palta Hass de Quillota', 'Ají Limo Auténtico'],
  },
  {
    id: 'fuego',
    number: '03 / 05',
    location: 'Fuego & Wok Criollo',
    eyebrow: 'Sabor a 300°C',
    title: (
      <>
        El aroma del wok <br className="hidden sm:inline" />
        <span className="text-[#e5a93b]">y el lomo flameado al pisco</span>
      </>
    ),
    description:
      'Cortes de filete premium salteados a fuego bravío con cebolla morada crujiente, tomates jugosos y reducción de soya y vinagre tinto sobre papas doradas y arroz criollo.',
    image: '/static/img/lomo-saltado-wok.png',
    alt: 'Lomo saltado criollo al wok',
    stats: [
      { label: 'Corte', value: 'Filete Premium' },
      { label: 'Técnica', value: 'Flameado al Wok' },
    ],
    pills: ['Sabor ahumado único', 'Tacu Tacu con Mariscos', 'Arroz Criollo'],
  },
  {
    id: 'cocteleria',
    number: '04 / 05',
    location: 'Cava & Pisco Bar',
    eyebrow: 'Coctelería Catedral',
    title: (
      <>
        Pisco Sour Catedral <br className="hidden sm:inline" />
        <span className="text-[#e5a93b]">y coctelería de autor</span>
      </>
    ),
    description:
      'Nuestro clásico Pisco Sour preparado con uva Quebranta seleccionada, amargo de angostura y espuma aterciopelada. Macerados de chicha morada, maracuyá y ají amarillo.',
    image: '/static/img/pisco-sour-catedral.png',
    alt: 'Pisco Sour Catedral servido en copa clásica',
    stats: [
      { label: 'Copa Insignia', value: 'Catedral' },
      { label: 'Destilado', value: 'Quebranta 100%' },
    ],
    pills: ['Chilcanos de Autor', 'Macerados Caseros', 'Vinos de Casablanca'],
  },
  {
    id: 'ejecutivo',
    number: '05 / 05',
    location: 'Menú Ejecutivo & Mesa',
    eyebrow: 'Lunes a Viernes 12:00 a 16:30',
    title: (
      <>
        Almuerzo ejecutivo <br className="hidden sm:inline" />
        <span className="text-[#e5a93b]">con estándar de alta cocina</span>
      </>
    ),
    description:
      'Entrada, plato de fondo, postre y bebestible con la rapidez que exige su jornada y la calidad que distingue a El Ají Seco del Mar en Viña del Mar.',
    image: '/static/img/salon-san-martin.png',
    alt: 'Salón principal preparado para el servicio de almuerzo',
    ctaPrimary: {
      label: 'Descargar Menú Ejecutivo (PDF)',
      href: 'https://www.elajiseco.cl/wp-content/uploads/2026/01/MENUEJECUTIVO_MEGA_AJISECO_VINA.pdf',
    },
    ctaSecondary: { label: 'Reservar Mesa Ahora', href: '#reservas' },
    pills: ['Menú Diario Completo', 'Atención Rápida', 'San Martín 230'],
  },
]

export default function ScrollWorld({
  stops = DEFAULT_STOPS,
  className = '',
  accentColor = '#e5a93b',
}: ScrollWorldProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeStop, setActiveStop] = useState(0)
  const [railProgress, setRailProgress] = useState(0)
  const [hintVisible, setHintVisible] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      const scrollY = window.scrollY
      const containerTop = rect.top + scrollY
      const containerHeight = container.offsetHeight
      const viewportHeight = window.innerHeight
      const maxScroll = containerHeight - viewportHeight

      if (maxScroll <= 0) return

      const progress = Math.max(0, Math.min(1, (scrollY - containerTop) / maxScroll))
      setRailProgress(progress)

      if (progress > 0.05) {
        setHintVisible(false)
      } else {
        setHintVisible(true)
      }

      const exactStop = progress * (stops.length - 1)
      setActiveStop(Math.round(exactStop))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [stops.length])

  return (
    <section
      ref={containerRef}
      id="recorrido"
      data-world
      aria-label="Paseo por El Ají Seco del Mar"
      className={`relative bg-[#ffffff] text-[#1e1e24] ${className}`}
    >
      {/* Sticky Cinematic Stage */}
      <div
        data-stage
        className="sticky top-0 h-[100vh] h-[100lvh] overflow-hidden bg-[#ffffff]"
      >
        {/* Background Visual Frames */}
        <div className="absolute inset-0 z-0">
          {stops.map((stop, i) => {
            const isVisible = Math.abs(activeStop - i) <= 1
            const isCurrent = activeStop === i
            return (
              <div
                key={stop.id}
                data-frame
                className="absolute inset-0 size-full transition-opacity duration-700 ease-out"
                style={{
                  opacity: isCurrent ? 1 : isVisible ? 0.25 : 0,
                  transform: isCurrent ? 'scale(1.02)' : 'scale(1)',
                  transition: 'opacity 800ms ease, transform 1200ms ease',
                }}
              >
                <img
                  src={stop.image}
                  alt={stop.alt}
                  className="size-full object-cover object-center"
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
              </div>
            )
          })}
        </div>

        {/* Luminous Warm Scrim Masks */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/90 to-transparent z-10 pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent lg:bg-gradient-to-r lg:from-white/95 lg:via-white/75 lg:to-transparent z-10 pointer-events-none"
        />

        {/* Vertical Stops Rail (Arko Style) */}
        <nav
          aria-label="Paradas del recorrido"
          className="absolute top-1/2 right-6 -translate-y-1/2 hidden lg:flex flex-col items-end z-30 xl:right-10"
        >
          <ol className="relative flex flex-col items-end gap-5">
            <span
              aria-hidden="true"
              className="absolute top-3 right-1 bottom-3 w-[2px] translate-x-1/2 bg-[#1e1e24]/10 rounded-full"
            >
              <span
                data-rail-fill
                className="absolute inset-0 origin-top bg-[#e5a93b] rounded-full transition-transform duration-150"
                style={{ transform: `scaleY(${railProgress})` }}
              />
            </span>
            {stops.map((stop, i) => {
              const isCurrent = activeStop === i
              return (
                <li key={stop.id}>
                  <a
                    href={`#${stop.id}`}
                    data-goto
                    aria-current={isCurrent ? 'true' : 'false'}
                    className="group flex h-7 items-center gap-3 no-underline"
                  >
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap shadow-sm backdrop-blur-md transition-all duration-300 ${
                        isCurrent
                          ? 'bg-[#1e1e24] text-white opacity-100 translate-x-0'
                          : 'bg-white/80 text-[#1e1e24]/80 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 ring-1 ring-black/5'
                      }`}
                    >
                      {stop.location}
                    </span>
                    <span className="relative grid size-3 place-items-center">
                      <span
                        className={`size-2.5 rounded-full transition-all duration-300 ${
                          isCurrent
                            ? 'bg-[#e5a93b] ring-4 ring-[#e5a93b]/30 scale-125'
                            : 'bg-[#1e1e24]/40 group-hover:bg-[#e5a93b]'
                        }`}
                      />
                    </span>
                  </a>
                </li>
              )
            })}
          </ol>
        </nav>

        {/* Scroll Hint */}
        <div
          data-hint
          aria-hidden="true"
          className={`absolute right-10 bottom-8 hidden lg:flex items-center gap-3 text-xs tracking-widest text-[#1e1e24]/70 uppercase font-semibold transition-opacity duration-500 z-20 ${
            hintVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span>Desliza para recorrer El Ají Seco</span>
          <span className="relative block h-8 w-[2px] bg-[#e5a93b]/40 overflow-hidden">
            <span className="absolute inset-0 bg-[#e5a93b] animate-bounce" />
          </span>
        </div>
      </div>

      {/* Narrative Stops on Left Screen */}
      <div className="relative z-20 -mt-[100vh] -mt-[100lvh]">
        {stops.map((stop, index) => {
          const isCurrent = activeStop === index
          return (
            <article
              key={stop.id}
              id={stop.id}
              data-stop
              className={`min-h-[170vh] flex flex-col justify-end pointer-events-none transition-all duration-700 ${
                isCurrent ? 'is-current' : ''
              }`}
            >
              <div className="sticky bottom-0 flex w-full max-w-2xl xl:max-w-3xl flex-col items-start px-6 pt-32 pb-14 md:px-14 lg:pb-20 xl:px-24 pointer-events-auto">
                {/* Stop Tag */}
                <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-[#1e1e24]/60 uppercase">
                  <span>{stop.number}</span>
                  <span className="size-1.5 rounded-full bg-[#e5a93b]" />
                  <span>{stop.location}</span>
                </div>

                {/* Eyebrow */}
                {stop.eyebrow && (
                  <p className="mt-3 text-xs font-bold tracking-widest text-[#b87c12] uppercase">
                    {stop.eyebrow}
                  </p>
                )}

                {/* Title */}
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#1e1e24] sm:text-4xl lg:text-5xl font-serif">
                  {stop.title}
                </h2>

                {/* Description */}
                <p className="mt-4 text-base text-[#57534e] sm:text-lg leading-relaxed max-w-xl">
                  {stop.description}
                </p>

                {/* Optional Stats Grid */}
                {stop.stats && stop.stats.length > 0 && (
                  <div className="mt-6 grid grid-cols-2 gap-4 w-full max-w-md">
                    {stop.stats.map((stat, sIdx) => (
                      <div
                        key={sIdx}
                        className="rounded-xl bg-white/90 p-4 ring-1 ring-black/5 shadow-sm backdrop-blur-md"
                      >
                        <span className="block text-2xl font-bold text-[#1e1e24] font-serif">
                          {stat.value}
                        </span>
                        <span className="text-xs font-medium text-[#8c857b] uppercase">
                          {stat.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Food Pills */}
                {stop.pills && (
                  <ul className="mt-5 flex flex-wrap gap-2 text-xs font-medium text-[#1e1e24]">
                    {stop.pills.map((pill, pIdx) => (
                      <li
                        key={pIdx}
                        className="rounded-full bg-white/95 px-3 py-1 ring-1 ring-black/10 shadow-xs backdrop-blur-md"
                      >
                        {pill}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Action CTAs */}
                {(stop.ctaPrimary || stop.ctaSecondary) && (
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    {stop.ctaPrimary && (
                      <a
                        href={stop.ctaPrimary.href}
                        target={stop.ctaPrimary.href.startsWith('http') ? '_blank' : undefined}
                        rel="noopener noreferrer"
                        className="rounded-full bg-[#e5a93b] px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-[#d49b28] transition-colors"
                      >
                        {stop.ctaPrimary.label}
                      </a>
                    )}
                    {stop.ctaSecondary && (
                      <a
                        href={stop.ctaSecondary.href}
                        target={stop.ctaSecondary.href.startsWith('http') ? '_blank' : undefined}
                        rel="noopener noreferrer"
                        className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#1e1e24] ring-1 ring-black/10 hover:bg-black/5 transition-colors shadow-xs"
                      >
                        {stop.ctaSecondary.label}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
