export type ShiftType = 'day' | 'night' | 'custom';

export interface Shift {
  id: string;
  type: ShiftType;
  startTime: Date;
  endTime: Date;
  color: string;
}

export interface DayShiftPart {
  shiftId: string;
  type: ShiftType;
  color: string;
  startPercentage: number; // 0-100
  durationPercentage: number; // 0-100
}

export interface UserProfile {
  name: string;
  age: string;
  profileImage: string | null;
}

export interface Sticker {
  id: string;
  emoji: string;
  x: number;
  y: number;
  monthKey: string;
}

export type BlockType = 'paragraph' | 'list' | 'checklist';

export interface NoteBlock {
  id: string;
  type: BlockType;
  content: string;
  items?: NoteItem[];
  isBold: boolean; // New: per-block bold formatting
}

export interface NoteItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface StickyNote {
  id: string;
  dateKey: string;
  blocks: NoteBlock[];
  color: string;
  isMinimized: boolean;
  x: number;
  y: number;
}
