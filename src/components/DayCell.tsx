import { format, isSameMonth, isToday } from 'date-fns';
import { StickyNote as NoteIcon } from 'lucide-react';
import type { DayShiftPart } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DayCellProps {
  date: Date;
  currentMonth: Date;
  shiftParts: DayShiftPart[];
  isFullMonthView?: boolean;
  onToggleNote?: () => void;
  hasNote?: boolean;
  isNoteMinimized?: boolean;
  noteColor?: string; // New: specific color of the note
  isDarkMode?: boolean;
}

export const DayCell: React.FC<DayCellProps> = ({ 
  date, 
  currentMonth, 
  shiftParts, 
  isFullMonthView,
  onToggleNote,
  hasNote,
  isNoteMinimized,
  noteColor,
  isDarkMode
}) => {
  const isCurrentMonth = isSameMonth(date, currentMonth);
  const isDayToday = isToday(date);

  return (
    <div className={cn(
      "border-r border-b p-1 transition-all relative group flex flex-col",
      isDarkMode ? "bg-slate-900 border-slate-800 hover:bg-slate-800" : "bg-white border-slate-200 hover:bg-slate-50",
      !isCurrentMonth && (isDarkMode ? "bg-slate-950/40 text-slate-700" : "bg-slate-50/40 text-slate-300"),
      isFullMonthView ? "min-h-0 flex-1" : "min-h-[140px]"
    )}>
      <div className="flex justify-between items-start mb-1 h-6">
        <span className={cn(
          "text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-lg transition-all",
          isDayToday ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none" : (isDarkMode ? "text-slate-600" : "text-slate-400"),
          (!isCurrentMonth && !isDayToday) && "opacity-30"
        )}>
          {format(date, 'd')}
        </span>

        {isCurrentMonth && (
          <div className="flex gap-1">
            <button 
              onClick={onToggleNote}
              className={cn(
                "p-1 rounded-md transition-all shadow-sm",
                hasNote && isNoteMinimized 
                  ? "animate-bounce-subtle" 
                  : (hasNote && !isNoteMinimized 
                      ? (isDarkMode ? "text-blue-400 bg-blue-900/30 ring-1 ring-blue-500/30" : "text-blue-500 bg-blue-50 ring-1 ring-blue-500/10")
                      : (isDarkMode ? "opacity-0 group-hover:opacity-100 text-slate-500 hover:bg-slate-700" : "opacity-0 group-hover:opacity-100 text-slate-400 hover:bg-slate-200")
                    )
              )}
              style={hasNote && isNoteMinimized && noteColor ? { 
                backgroundColor: `${noteColor}22`, 
                color: noteColor,
                boxShadow: `0 2px 8px -2px ${noteColor}44` 
              } : undefined}
              title={hasNote ? (isNoteMinimized ? "Expandir nota" : "Minimizar nota") : "Agregar nota"}
            >
              <NoteIcon size={12} fill={hasNote && isNoteMinimized ? noteColor : 'transparent'} fillOpacity={0.4} />
            </button>
          </div>
        )}
      </div>

      <div className={`flex-1 relative w-full rounded-xl overflow-hidden border transition-colors ${isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50/50 border-slate-100 group-hover:border-slate-200'}`}>
        {shiftParts.map((part, index) => (
          <div
            key={`${part.shiftId}-${index}`}
            className="absolute h-full transition-all duration-500 rounded-lg shadow-sm"
            style={{
              left: `${part.startPercentage}%`,
              width: `${part.durationPercentage}%`,
              backgroundColor: part.color,
              opacity: isCurrentMonth ? 1 : 0.1
            }}
          >
            <div className="w-full h-full opacity-10 bg-white mix-blend-overlay" />
          </div>
        ))}
      </div>
      
      {/* Indicador visual de que hay una nota expandida para este día */}
      {hasNote && !isNoteMinimized && (
        <div className="absolute inset-0 bg-blue-500/5 pointer-events-none border-2 border-blue-500/20 rounded-sm z-0 dark:bg-blue-400/5 dark:border-blue-400/20" />
      )}
    </div>
  );
};
