"use client";

import React, { useState } from "react";

export type BotOption = {
  id: string;
  label: string;
  icon: string;
  description: string;
  action: "whatsapp" | "link" | "form" | "modal";
  payload?: string;
  whatsappMessage?: string;
};

const BOT_OPTIONS: BotOption[] = [
  {
    id: "reserva",
    label: "📅 Reservar una Mesa",
    icon: "📅",
    description: "Para hoy o una fecha especial en Viña del Mar",
    action: "form",
    payload: "#reservas",
    whatsappMessage: "¡Hola! Quisiera solicitar una reserva en El Ají Seco del Mar (San Martín 230). ¿Tienen disponibilidad?",
  },
  {
    id: "menu_ejecutivo",
    label: "🍽️ Menú Ejecutivo (PDF)",
    icon: "🍽️",
    description: "Platos del día, entrada y fondo (Lunes a Viernes)",
    action: "link",
    payload: "https://www.elajiseco.cl/wp-content/uploads/2026/01/MENUEJECUTIVO_MEGA_AJISECO_VINA.pdf",
    whatsappMessage: "¡Hola! Quisiera consultar por el Menú Ejecutivo de hoy en la sucursal de Viña del Mar.",
  },
  {
    id: "carta_completa",
    label: "📖 Ver Carta Completa (PDF)",
    icon: "📖",
    description: "Cebiches, tiraditos, lomo saltado y coctelería",
    action: "link",
    payload: "https://drive.google.com/file/d/170K6LLQenv_8Ctomo8HTva3OzuKd4Dz-/view",
  },
  {
    id: "como_llegar",
    label: "📍 ¿Cómo llegar? (San Martín 230)",
    icon: "📍",
    description: "Ver ubicación en Google Maps y estacionamientos",
    action: "link",
    payload: "https://maps.google.com/?q=Av.+San+Martín+230,+Viña+del+Mar",
  },
  {
    id: "hablar_maitre",
    label: "💬 Hablar con el Maître",
    icon: "💬",
    description: "Consultas directas, eventos o delivery",
    action: "whatsapp",
    whatsappMessage: "¡Hola El Ají Seco del Mar! Necesito hacer una consulta directa con el personal de Viña del Mar.",
  },
];

const PHONE_NUMBER = "56958259443";

export default function WhatsAppConciergeBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"menu" | "custom_msg">("menu");

  const handleOptionClick = (opt: BotOption) => {
    if (opt.action === "link" && opt.payload) {
      window.open(opt.payload, "_blank", "noopener,noreferrer");
    } else if (opt.action === "form" && opt.payload) {
      const el = document.querySelector(opt.payload);
      if (el) el.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
    } else if (opt.action === "whatsapp" || opt.whatsappMessage) {
      const url = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(opt.whatsappMessage || "¡Hola!")}`;
      window.open(url, "_blank", "noopener,noreferrer");
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Ventana de Diálogo del Asistente */}
      {isOpen && (
        <div className="mb-4 w-[340px] sm:w-[380px] rounded-3xl bg-white shadow-2xl border border-amber-200/80 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header del Concierge */}
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-full bg-white/20 p-1 flex items-center justify-center border border-white/30">
                <span className="text-xl">🌊</span>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <h4 className="font-bold text-sm tracking-wide">Concierge El Ají Seco</h4>
                <p className="text-xs text-amber-100 flex items-center gap-1">
                  <span>●</span> En línea · Viña del Mar
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
              aria-label="Cerrar chat"
            >
              ✕
            </button>
          </div>

          {/* Cuerpo de la Conversación */}
          <div className="p-4 bg-amber-50/30 max-h-[420px] overflow-y-auto space-y-3">
            <div className="bg-white rounded-2xl rounded-tl-sm p-3.5 shadow-sm border border-neutral-100 text-neutral-800 text-sm leading-relaxed">
              <p className="font-semibold text-amber-800 mb-1">¡Hola! Bienvenido a El Ají Seco del Mar 🐟</p>
              <p className="text-xs text-neutral-600">
                Soy tu asistente digital en <b>San Martín 230</b>. Elige una opción para guiarte o conectarte directamente por WhatsApp:
              </p>
            </div>

            {/* Opciones Interactivas */}
            <div className="space-y-2 pt-1">
              {BOT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleOptionClick(opt)}
                  className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-amber-100/60 border border-neutral-200 hover:border-amber-400 shadow-xs transition flex items-center justify-between group"
                >
                  <div className="pr-2">
                    <div className="font-semibold text-xs text-neutral-800 group-hover:text-amber-900 flex items-center gap-1.5">
                      <span>{opt.label}</span>
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">
                      {opt.description}
                    </div>
                  </div>
                  <span className="text-amber-600 font-bold text-sm transition-transform group-hover:translate-x-1">→</span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer del Bot */}
          <div className="p-3 bg-white border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
            <span>Atención: 12:00 a 24:00 hrs</span>
            <span className="font-medium text-amber-700">Viña del Mar</span>
          </div>
        </div>
      )}

      {/* Botón Flotante con Pulso */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3.5 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
        aria-label="Abrir asistente de WhatsApp"
      >
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-400 border border-white"></span>
        </span>
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.073-2.18-.543-1.895-.788-3.09-2.73-3.184-2.857-.094-.127-.768-1.02-.768-1.947 0-.928.487-1.381.66-1.571.173-.19.378-.238.504-.238.127 0 .253.002.363.007.117.005.273-.044.427.327.16.386.545 1.332.593 1.43.048.098.08.213.016.34-.064.127-.096.206-.19.317-.095.111-.2.247-.286.333-.095.095-.195.198-.084.388.111.19.493.813 1.057 1.316.726.647 1.338.848 1.528.943.19.095.301.079.412-.048.111-.127.476-.554.603-.744.127-.19.253-.159.428-.095.174.063 1.11.523 1.3.618.19.095.317.142.364.222.048.08.048.46-.096.865z"/>
        </svg>
        <span className="font-semibold text-sm pr-1">Asistente & WhatsApp</span>
      </button>
    </div>
  );
}
