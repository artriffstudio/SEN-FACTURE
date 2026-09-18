"use client";

import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  amount?: number;
  type?: "paid" | "pending" | "overdue" | "custom";
}

interface ModernCalendarProps {
  selectedDate?: string;
  onSelectDate?: (dateStr: string) => void;
  events?: CalendarEvent[];
  className?: string;
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

export default function ModernCalendar({
  selectedDate,
  onSelectDate,
  events = [],
  className = "",
}: ModernCalendarProps) {
  const { currentLanguage } = useTranslation();
  const isAr = currentLanguage === "ar";

  const initialDate = useMemo(() => {
    if (!selectedDate) return new Date();
    const d = new Date(selectedDate);
    return isNaN(d.getTime()) ? new Date() : d;
  }, [selectedDate]);

  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

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

  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
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
        isSelected: dateStr === selectedDate,
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
        isSelected: dateStr === selectedDate,
        isToday: dateStr === todayStr,
      });
    }

    // Jours du mois suivant
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
        isSelected: dateStr === selectedDate,
        isToday: dateStr === todayStr,
      });
    }

    return days;
  }, [viewYear, viewMonth, selectedDate]);

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm ${className}`}
    >
      {/* En-tête mois/année */}
      <div className="flex items-center justify-between mb-4">
        <div className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
          <CalendarIcon size={16} className="text-sky-600" />
          <span>{monthNames[viewMonth]}</span>
          <span className="text-slate-500 font-bold">{viewYear}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() =>
              viewMonth === 0
                ? (setViewMonth(11), setViewYear((y) => y - 1))
                : setViewMonth((m) => m - 1)
            }
            className="w-7 h-7 rounded-lg border border-slate-200 hover:border-sky-300 hover:bg-sky-50 flex items-center justify-center text-slate-600 hover:text-sky-600 transition-all cursor-pointer"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            type="button"
            onClick={() =>
              viewMonth === 11
                ? (setViewMonth(0), setViewYear((y) => y + 1))
                : setViewMonth((m) => m + 1)
            }
            className="w-7 h-7 rounded-lg border border-slate-200 hover:border-sky-300 hover:bg-sky-50 flex items-center justify-center text-slate-600 hover:text-sky-600 transition-all cursor-pointer"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Jours de semaine */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayHeaders.map((dh, idx) => (
          <div
            key={idx}
            className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider py-0.5"
          >
            {dh}
          </div>
        ))}
      </div>

      {/* Grille */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((item, idx) => {
          const dayEvents = events.filter((ev) => ev.date === item.dateStr);

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectDate?.(item.dateStr)}
              className={`h-9 w-full rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer select-none ${
                item.isSelected
                  ? "bg-[#0284c7] text-white font-black shadow-md shadow-sky-500/30 scale-102"
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

              {item.isSelected ? (
                <span className="w-3 h-0.5 bg-white rounded-full mt-0.5" />
              ) : dayEvents.length > 0 ? (
                <div className="flex items-center gap-0.5 mt-0.5">
                  {dayEvents.slice(0, 3).map((ev, eIdx) => {
                    const bg =
                      ev.type === "paid"
                        ? "bg-emerald-500"
                        : ev.type === "overdue"
                        ? "bg-rose-500"
                        : ev.type === "pending"
                        ? "bg-amber-500"
                        : "bg-sky-500";
                    return (
                      <span key={eIdx} className={`w-1 h-1 rounded-full ${bg}`} />
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
    </div>
  );
}
