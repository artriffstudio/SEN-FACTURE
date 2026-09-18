"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Check,
  RotateCcw,
} from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";

export interface CalendarEventDot {
  date: string; // YYYY-MM-DD
  color?: "blue" | "green" | "amber" | "rose" | "orange";
}

interface DatePickerProps {
  value: string; // Format YYYY-MM-DD
  onChange: (dateStr: string) => void;
  label?: string;
  minDate?: string;
  maxDate?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showPresets?: boolean;
  events?: CalendarEventDot[];
}

const MONTH_NAMES_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

const MONTH_NAMES_AR = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

const MONTH_NAMES_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const MONTH_NAMES_ZH = [
  "一月", "二月", "三月", "四月", "五月", "六月",
  "七月", "八月", "九月", "十月", "十一月", "十二月"
];

const DAYS_HEADER_FR = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const DAYS_HEADER_AR = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];
const DAYS_HEADER_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_HEADER_ZH = ["日", "一", "二", "三", "四", "五", "六"];

export default function DatePicker({
  value,
  onChange,
  label,
  minDate,
  maxDate,
  placeholder = "Sélectionner une date",
  className = "",
  disabled = false,
  showPresets = true,
  events = [],
}: DatePickerProps) {
  const { currentLanguage } = useTranslation();
  const isAr = currentLanguage === "ar";
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialisation de la vue sur la date courante ou sélectionnée
  const parsedDate = useMemo(() => {
    if (!value) return new Date();
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date() : d;
  }, [value]);

  const [viewYear, setViewYear] = useState(parsedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsedDate.getMonth()); // 0-11

  // Synchronisation lors de l'ouverture
  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value, isOpen]);

  // Fermeture au clic extérieur
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Noms selon la langue
  const monthNames = isAr
    ? MONTH_NAMES_AR
    : currentLanguage === "en"
    ? MONTH_NAMES_EN
    : currentLanguage === "zh"
    ? MONTH_NAMES_ZH
    : MONTH_NAMES_FR;

  const dayHeaders = isAr
    ? DAYS_HEADER_AR
    : currentLanguage === "en"
    ? DAYS_HEADER_EN
    : currentLanguage === "zh"
    ? DAYS_HEADER_ZH
    : DAYS_HEADER_FR;

  // Calcul des jours du mois
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Dimanche
    const totalDaysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prevMonthTotalDays = new Date(viewYear, viewMonth, 0).getDate();

    const days: Array<{
      day: number;
      month: number;
      year: number;
      isCurrentMonth: boolean;
      dateStr: string;
      isSelected: boolean;
      isToday: boolean;
    }> = [];

    const todayStr = new Date().toISOString().split("T")[0];

    // Jours du mois précédent
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const day = prevMonthTotalDays - i;
      const m = viewMonth === 0 ? 11 : viewMonth - 1;
      const y = viewMonth === 0 ? viewYear - 1 : viewYear;
      const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      days.push({
        day,
        month: m,
        year: y,
        isCurrentMonth: false,
        dateStr,
        isSelected: dateStr === value,
        isToday: dateStr === todayStr,
      });
    }

    // Jours du mois en cours
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      days.push({
        day,
        month: viewMonth,
        year: viewYear,
        isCurrentMonth: true,
        dateStr,
        isSelected: dateStr === value,
        isToday: dateStr === todayStr,
      });
    }

    // Jours du mois suivant pour compléter à 35 ou 42 cases (5 ou 6 semaines)
    const totalSlots = days.length <= 35 ? 35 : 42;
    const remaining = totalSlots - days.length;
    for (let day = 1; day <= remaining; day++) {
      const m = viewMonth === 11 ? 0 : viewMonth + 1;
      const y = viewMonth === 11 ? viewYear + 1 : viewYear;
      const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      days.push({
        day,
        month: m,
        year: y,
        isCurrentMonth: false,
        dateStr,
        isSelected: dateStr === value,
        isToday: dateStr === todayStr,
      });
    }

    return days;
  }, [viewYear, viewMonth, value]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (dateStr: string) => {
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleQuickPreset = (daysOffset: number) => {
    const target = new Date();
    target.setDate(target.getDate() + daysOffset);
    const dateStr = target.toISOString().split("T")[0];
    onChange(dateStr);
    setIsOpen(false);
  };

  // Formatage affiché dans l'input
  const displayValue = useMemo(() => {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const monthLabel = monthNames[d.getMonth()] || "";
    return `${day} ${monthLabel} ${year}`;
  }, [value, monthNames]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          {label}
        </label>
      )}

      {/* Trigger Bouton / Champ de saisie */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between px-3 py-2 bg-white border rounded-xl text-xs font-semibold transition-all text-left ${
          isOpen
            ? "border-sky-500 ring-2 ring-sky-100 shadow-sm"
            : "border-slate-200 hover:border-sky-300 hover:bg-slate-50/60"
        } ${disabled ? "opacity-50 cursor-not-allowed bg-slate-100" : "cursor-pointer"}`}
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarIcon
            size={15}
            className={`${isOpen ? "text-sky-600" : "text-slate-400"} shrink-0`}
          />
          <span className={value ? "text-slate-900 font-bold" : "text-slate-400 font-medium"}>
            {displayValue || placeholder}
          </span>
        </div>

        <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md shrink-0">
          {value ? value.split("-").reverse().join("/") : "Choisir"}
        </span>
      </button>

      {/* Calendrier Popover Inspiré de Google Calendar */}
      {isOpen && (
        <div
          className={`absolute z-50 mt-1.5 p-3.5 bg-white rounded-2xl shadow-xl border border-slate-200 w-[300px] sm:w-[320px] transition-all animate-in fade-in zoom-in-95 duration-150 ${
            isAr ? "right-0" : "left-0"
          }`}
          style={{
            boxShadow:
              "0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)",
          }}
        >
          {/* En-tête : Mois Année + Boutons Navigation */}
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
              <span>{monthNames[viewMonth]}</span>
              <span className="text-slate-500 font-bold">{viewYear}</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-7 h-7 rounded-lg border border-slate-200 hover:border-sky-300 hover:bg-sky-50 flex items-center justify-center text-slate-600 hover:text-sky-600 transition-all"
                title="Mois précédent"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="w-7 h-7 rounded-lg border border-slate-200 hover:border-sky-300 hover:bg-sky-50 flex items-center justify-center text-slate-600 hover:text-sky-600 transition-all"
                title="Mois suivant"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          {/* En-têtes des jours de la semaine */}
          <div className="grid grid-cols-7 gap-1 mb-1.5">
            {dayHeaders.map((dh, idx) => (
              <div
                key={idx}
                className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider py-1"
              >
                {dh}
              </div>
            ))}
          </div>

          {/* Grille des Jours du Mois */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((item, idx) => {
              const hasEvents = events.filter((ev) => ev.date === item.dateStr);

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDay(item.dateStr)}
                  className={`relative group h-9 w-full rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer select-none ${
                    item.isSelected
                      ? "bg-[#0284c7] text-white font-extrabold shadow-md shadow-sky-500/30 scale-102"
                      : item.isCurrentMonth
                      ? "text-slate-800 font-bold hover:bg-sky-50 hover:text-sky-600"
                      : "text-slate-300 font-medium hover:text-slate-500 hover:bg-slate-50"
                  } ${
                    item.isToday && !item.isSelected
                      ? "ring-1.5 ring-sky-400 font-black text-sky-600"
                      : ""
                  }`}
                >
                  <span className="text-xs leading-none">{item.day}</span>

                  {/* Ligne ou Point indicateur de statut / sélection (style Google Calendar) */}
                  {item.isSelected ? (
                    <span className="w-3 h-0.5 bg-white rounded-full mt-0.5 opacity-90" />
                  ) : hasEvents.length > 0 ? (
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {hasEvents.slice(0, 3).map((ev, eIdx) => {
                        const dotColor =
                          ev.color === "green"
                            ? "bg-emerald-500"
                            : ev.color === "rose"
                            ? "bg-rose-500"
                            : ev.color === "amber"
                            ? "bg-amber-500"
                            : ev.color === "orange"
                            ? "bg-orange-500"
                            : "bg-sky-500";
                        return (
                          <span
                            key={eIdx}
                            className={`w-1 h-1 rounded-full ${dotColor}`}
                          />
                        );
                      })}
                    </div>
                  ) : item.isToday ? (
                    <span className="w-1 h-1 rounded-full bg-sky-500 mt-0.5" />
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Raccourcis Rapides (Aujourd'hui, +15j, +30j, etc.) */}
          {showPresets && (
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1 flex-wrap">
              <button
                type="button"
                onClick={() => handleQuickPreset(0)}
                className="px-2 py-1 text-[10px] font-bold rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 transition-all"
              >
                Aujourd&apos;hui
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset(15)}
                className="px-2 py-1 text-[10px] font-bold rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 transition-all"
              >
                +15 jours
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset(30)}
                className="px-2 py-1 text-[10px] font-bold rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 transition-all"
              >
                +30 jours
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset(60)}
                className="px-2 py-1 text-[10px] font-bold rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 transition-all"
              >
                +60 jours
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
