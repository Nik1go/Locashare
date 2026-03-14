"use client";

import * as React from "react";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { fr } from "date-fns/locale";
import { format, isWithinInterval, addDays } from "date-fns";

interface CalendarProps {
  bookedDates: { date_debut: Date; date_fin: Date }[];
  selectedRange: DateRange | undefined;
  onRangeChange: (range: DateRange | undefined) => void;
  className?: string;
}

export default function Calendar({
  bookedDates,
  selectedRange,
  onRangeChange,
  className,
}: CalendarProps) {
  // Convertir les bookedDates en intervals pour le désactivage
  const disabledDays = bookedDates.map((booking) => {
    const from = new Date(booking.date_debut);
    const to = new Date(booking.date_fin);
    from.setHours(0, 0, 0, 0);
    to.setHours(0, 0, 0, 0);
    return { from, to };
  });

  // On peut aussi griser le passé
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className={`p-3 bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
      <DayPicker
        mode="range"
        defaultMonth={today}
        selected={selectedRange}
        onSelect={onRangeChange}
        disabled={[...disabledDays, { before: today }]}
        locale={fr}
        numberOfMonths={1}
        modifiers={{
          booked: disabledDays,
        }}
        modifiersStyles={{
          booked: {
            backgroundColor: "#fee2e2", 
            color: "#b91c1c",
            fontWeight: "bold",
            borderTopLeftRadius: "4px",
            borderTopRightRadius: "4px",
            borderBottomLeftRadius: "4px",
            borderBottomRightRadius: "4px",
          },
          selected: { 
            backgroundColor: "#2563eb", 
            color: "white",
            borderTopLeftRadius: "0px",
            borderTopRightRadius: "0px",
            borderBottomLeftRadius: "0px",
            borderBottomRightRadius: "0px",
          },
          range_start: {
            borderTopLeftRadius: "8px",
            borderBottomLeftRadius: "8px",
            borderTopRightRadius: "0px",
            borderBottomRightRadius: "0px",
          },
          range_end: {
            borderTopRightRadius: "8px",
            borderBottomRightRadius: "8px",
            borderTopLeftRadius: "0px",
            borderBottomLeftRadius: "0px",
          }
        }}
        styles={{
          caption: { color: "#0f172a", fontWeight: "bold" },
          head_cell: { color: "#64748b", fontWeight: "600", fontSize: "0.8rem" },
          day: { transition: "all 0.2s ease" },
        }}
      />
      <div className="mt-4 flex flex-wrap gap-4 text-xs font-medium border-t border-slate-100 pt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full border border-slate-200"></div>
          <span className="text-slate-500">Disponible</span>
        </div>
        <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-100 border border-red-200"></div>
            <span className="text-red-700 font-bold">Indisponible (Déjà réservé)</span>
          </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
          <span className="text-slate-900">Sélection</span>
        </div>
      </div>
    </div>
  );
}
