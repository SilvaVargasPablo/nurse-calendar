import { useState } from 'react';
import { Plus, Clock, Smile } from 'lucide-react';
import type { Shift, ShiftType, UserProfile as UserProfileType } from '../types';
import { UserProfile } from './UserProfile';

interface SidebarProps {
  onAddShift: (shift: Omit<Shift, 'id'>) => void;
  onAddSticker: (emoji: string) => void;
  userProfile: UserProfileType;
  onUpdateUser: (profile: UserProfileType) => void;
  isDarkMode: boolean;
}

const EMOJIS = ['💉', '💊', '🩺', '🚑', '🏥', '😴', '☕', '🍎', '✨', '🩹'];

export const Sidebar: React.FC<SidebarProps> = ({ 
  onAddShift, 
  onAddSticker, 
  userProfile, 
  onUpdateUser,
  isDarkMode
}) => {
  const [type, setType] = useState<ShiftType>('day');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('08:00');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [endTime, setEndTime] = useState('20:00');
  const [color, setColor] = useState('#3b82f6');

  const handleSubmitShift = (e: React.FormEvent) => {
    e.preventDefault();
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);

    if (end <= start) {
      alert("La hora de fin debe ser posterior a la de inicio");
      return;
    }

    onAddShift({ type, startTime: start, endTime: end, color });
  };

  const setPreset = (preset: 'day' | 'night') => {
    setType(preset);
    if (preset === 'day') {
      setStartTime('08:00');
      setEndTime('20:00');
      setColor('#3b82f6');
      setEndDate(startDate);
    } else {
      setStartTime('20:00');
      setEndTime('08:00');
      setColor('#8b5cf6');
      const d = new Date(startDate);
      d.setDate(d.getDate() + 1);
      setEndDate(d.toISOString().split('T')[0]);
    }
  };

  return (
    <div className={`w-96 border-r h-screen overflow-y-auto p-6 flex flex-col gap-8 shadow-inner transition-all duration-300 ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}>
      <UserProfile profile={userProfile} onUpdate={onUpdateUser} isDarkMode={isDarkMode} />

      <div className="space-y-6">
        {/* Sección de Turnos */}
        <div className={`rounded-2xl p-6 border shadow-sm space-y-4 transition-all duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className={`flex items-center gap-2 font-bold border-b pb-3 transition-colors ${isDarkMode ? 'text-white border-slate-800' : 'text-slate-800 border-slate-100'}`}>
            <Clock size={18} className="text-blue-600" />
            <h3 className="tracking-wide text-xs">NUEVO TURNO</h3>
          </div>
          
          <form onSubmit={handleSubmitShift} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tipo de Turno</label>
              <select 
                className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-100 text-slate-700'}`}
                value={type}
                onChange={(e) => {
                  const val = e.target.value as ShiftType;
                  if (val === 'day' || val === 'night') setPreset(val);
                  else setType(val);
                }}
              >
                <option value="day">Turno Día (08:00 - 20:00)</option>
                <option value="night">Turno Noche (20:00 - 08:00)</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Inicio</label>
                <input type="date" className={`w-full border rounded-xl px-2 py-2 text-sm transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-100 text-slate-700'}`} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <input type="time" className={`w-full border rounded-xl px-2 py-2 text-sm mt-1 transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-100 text-slate-700'}`} value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fin</label>
                <input type="date" className={`w-full border rounded-xl px-2 py-2 text-sm transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-100 text-slate-700'}`} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                <input type="time" className={`w-full border rounded-xl px-2 py-2 text-sm mt-1 transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-100 text-slate-700'}`} value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>

            <div className="space-y-4 text-center">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Color</label>
              <div className={`flex gap-2 flex-wrap justify-center p-3 rounded-xl border transition-colors ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/50 border-slate-100'}`}>
                {['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#e3689dff'].map((c) => (
                  <button key={c} type="button" onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? (isDarkMode ? "border-white scale-110 shadow-lg" : "border-slate-800 scale-110 shadow-lg") : (isDarkMode ? "border-slate-700 shadow-sm hover:scale-105" : "border-white shadow-sm hover:scale-105")}`} style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white rounded-xl py-4 font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200/50 dark:shadow-none flex items-center justify-center gap-2 mt-2">
              <Plus size={18} strokeWidth={3} />
              GUARDAR TURNO
            </button>
          </form>
        </div>

        {/* Sección de Emojis */}
        <div className={`rounded-2xl p-6 border shadow-sm space-y-4 transition-all duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className={`flex items-center gap-2 font-bold border-b pb-3 transition-colors ${isDarkMode ? 'text-white border-slate-800' : 'text-slate-800 border-slate-100'}`}>
            <Smile size={18} className="text-yellow-500" />
            <h3 className="tracking-wide text-xs">STICKERS</h3>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {EMOJIS.map(emoji => (
              <button 
                key={emoji} 
                onClick={() => onAddSticker(emoji)}
                className={`text-2xl p-2 rounded-xl transition-all hover:scale-125 ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
