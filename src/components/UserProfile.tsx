import { useRef } from 'react';
import { Camera, User } from 'lucide-react';
import type { UserProfile as UserProfileType } from '../types';

interface UserProfileProps {
  profile: UserProfileType;
  onUpdate: (profile: UserProfileType) => void;
  isDarkMode: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({ profile, onUpdate, isDarkMode }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      onUpdate({ ...profile, profileImage: imageUrl });
    }
  };

  return (
    <div className={`rounded-2xl p-6 border shadow-sm flex flex-col gap-6 transition-all duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="flex items-center gap-4">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className={`w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center transition-all border-2 ${isDarkMode ? 'bg-slate-800 border-slate-700 group-hover:border-blue-500' : 'bg-slate-100 border-slate-200 group-hover:border-blue-400'}`}>
            {profile.profileImage ? (
              <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className={`w-10 h-10 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
            )}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-blue-600 p-2 rounded-lg text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera size={14} />
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleImageChange} 
          />
        </div>
        <div className="flex-1 space-y-1">
          <input
            type="text"
            className={`w-full text-xl font-bold bg-transparent border-none p-0 focus:ring-0 placeholder:text-slate-300 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
            placeholder="Nombre..."
            value={profile.name}
            onChange={(e) => onUpdate({ ...profile, name: e.target.value })}
          />
          <div className="flex items-center gap-2">
             <input
              type="text"
              className={`w-12 text-sm bg-transparent border-none p-0 focus:ring-0 placeholder:text-slate-300 transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
              placeholder="Edad"
              value={profile.age}
              onChange={(e) => onUpdate({ ...profile, age: e.target.value })}
            />
            <span className="text-sm text-slate-400 dark:text-slate-500">años</span>
          </div>
        </div>
      </div>
    </div>
  );
};
