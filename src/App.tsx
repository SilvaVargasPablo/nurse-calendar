import { useRef, useMemo, useState, useEffect } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfToday,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Share2, Sun, Moon } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { DayCell } from './components/DayCell';
import { DraggableItem } from './components/DraggableItem';
import { DraggableNote } from './components/DraggableNote';
import type { Shift, UserProfile as UserProfileType, Sticker, StickyNote } from './types';
import { getShiftsForDay } from './utils/dateUtils';
import { AnimatePresence } from 'framer-motion';

const INITIAL_PROFILE: UserProfileType = {
  name: 'Elizabeth',
  age: '23',
  profileImage: null
};

export default function App() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfileType>(INITIAL_PROFILE);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('calendar-theme');
      return saved ? saved === 'dark' : false;
    }
    return false;
  });
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('calendar-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('calendar-theme', 'light');
    }
  }, [isDarkMode]);

  const currentMonthKey = useMemo(() => format(currentMonth, 'yyyy-MM'), [currentMonth]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    while (days.length < 42) {
      const lastDay = days[days.length - 1];
      const nextDay = new Date(lastDay);
      nextDay.setDate(nextDay.getDate() + 1);
      days.push(nextDay);
    }
    return days;
  }, [currentMonth]);

  const handleAddShift = (newShift: Omit<Shift, 'id'>) => {
    setShifts(prev => [...prev, { ...newShift, id: crypto.randomUUID() }]);
  };

  const handleAddSticker = (emoji: string) => {
    setStickers(prev => [...prev, { 
      id: crypto.randomUUID(), 
      emoji, 
      x: 100, 
      y: 100,
      monthKey: currentMonthKey
    }]);
  };

  const handleToggleNote = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const existingNote = notes.find(n => n.dateKey === dateKey);

    if (existingNote) {
      setNotes(prev => prev.map(n => n.dateKey === dateKey ? { ...n, isMinimized: !n.isMinimized } : n));
    } else {
      const newNote: StickyNote = {
        id: crypto.randomUUID(),
        dateKey,
        blocks: [
          { id: crypto.randomUUID(), type: 'paragraph', content: '', isBold: false }
        ],
        color: '#fef08a',
        isMinimized: false,
        x: 150,
        y: 150
      };
      setNotes(prev => [...prev, newNote]);
    }
  };

  const updateStickerPos = (id: string, x: number, y: number) => {
    setStickers(prev => prev.map(s => s.id === id ? { ...s, x, y } : s));
  };

  const updateNotePos = (id: string, x: number, y: number) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, x, y } : n));
  };

  const handleDeleteSticker = (id: string) => {
    setStickers(prev => prev.filter(s => s.id !== id));
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const handleUpdateNote = (id: string, updates: Partial<StickyNote>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  const nextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));
  const prevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const goToToday = () => setCurrentMonth(startOfMonth(startOfToday()));

  const filteredStickers = stickers.filter(s => s.monthKey === currentMonthKey);
  const filteredNotes = notes.filter(n => n.dateKey.startsWith(currentMonthKey));

  return (
    <div className={`flex h-screen overflow-hidden font-sans transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white dark' : 'bg-slate-50 text-slate-900'}`}>
      <Sidebar 
        onAddShift={handleAddShift} 
        onAddSticker={handleAddSticker}
        userProfile={userProfile}
        onUpdateUser={setUserProfile}
        isDarkMode={isDarkMode}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className={`h-16 flex items-center justify-between px-8 shrink-0 z-20 shadow-sm transition-colors border-b ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-8">
            <h2 className={`text-xl font-black capitalize tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </h2>
            <div className={`flex items-center rounded-xl p-1 border transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
              <button 
                onClick={prevMonth} 
                className={`p-1.5 rounded-lg transition-all ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-white hover:shadow-sm text-slate-600'}`}
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={goToToday} 
                className={`px-4 py-1 text-xs font-bold rounded-lg transition-all ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-white hover:shadow-sm'}`}
              >
                HOY
              </button>
              <button 
                onClick={nextMonth} 
                className={`p-1.5 rounded-lg transition-all ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-white hover:shadow-sm text-slate-600'}`}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Modo Dark/Light Switch */}
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                {isDarkMode ? 'Dark' : 'Light'}
              </span>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`relative w-12 h-6 rounded-full p-1 transition-all duration-300 flex items-center shadow-inner ${isDarkMode ? 'bg-blue-600' : 'bg-slate-200'}`}
              >
                <div 
                  className={`w-4 h-4 bg-white rounded-full shadow-md transition-all duration-500 transform flex items-center justify-center ${isDarkMode ? 'translate-x-6 rotate-0' : 'translate-x-0 rotate-180'}`}
                >
                  {isDarkMode ? (
                    <Moon size={10} className="text-blue-600" />
                  ) : (
                    <Sun size={10} className="text-orange-500" />
                  )}
                </div>
              </button>
            </div>

            <button className={`p-2 rounded-xl transition-all shadow-md active:scale-95 ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-900 text-white hover:scale-105'}`}>
              <Share2 size={18} />
            </button>
          </div>
        </header>

        <div className="flex-1 p-4 lg:p-6 flex flex-col relative transition-colors duration-300">
          <div className={`flex-1 rounded-2xl shadow-xl border overflow-hidden flex flex-col relative transition-all duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-none' : 'bg-white border-slate-200'}`} ref={containerRef}>
            <div className={`grid grid-cols-7 border-b transition-colors duration-300 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/50 border-slate-200'}`}>
              {['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'].map(day => (
                <div key={day} className="py-2 text-center text-[9px] font-black text-slate-400 tracking-[0.2em] uppercase">
                  {day}
                </div>
              ))}
            </div>

            <div className={`grid grid-cols-7 flex-1 border-l transition-colors duration-300 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              {calendarDays.map((day) => (
                <DayCell 
                  key={day.toISOString()} 
                  date={day} 
                  currentMonth={currentMonth}
                  shiftParts={getShiftsForDay(day, shifts)}
                  isFullMonthView={true}
                  onToggleNote={() => handleToggleNote(day)}
                  hasNote={notes.some(n => n.dateKey === format(day, 'yyyy-MM-dd'))}
                  isNoteMinimized={notes.find(n => n.dateKey === format(day, 'yyyy-MM-dd'))?.isMinimized}
                  isDarkMode={isDarkMode}
                />
              ))}
            </div>

            <AnimatePresence>
              {filteredStickers.map(sticker => (
                <DraggableItem 
                  key={sticker.id}
                  x={sticker.x}
                  y={sticker.y}
                  containerRef={containerRef}
                  onDragEnd={(x, y) => updateStickerPos(sticker.id, x, y)}
                  onDelete={() => handleDeleteSticker(sticker.id)}
                >
                  <div className="text-4xl drop-shadow-lg select-none p-2">
                    {sticker.emoji}
                  </div>
                </DraggableItem>
              ))}

              {filteredNotes.map(note => (
                <DraggableNote
                  key={note.id}
                  note={note}
                  containerRef={containerRef}
                  onUpdate={handleUpdateNote}
                  onDragEnd={updateNotePos}
                  onDelete={() => handleDeleteNote(note.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
