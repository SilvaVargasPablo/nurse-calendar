import { 
  startOfDay, 
  endOfDay, 
  differenceInMinutes, 
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isWithinInterval
} from 'date-fns';
import type { Shift, DayShiftPart } from '../types';

export const getShiftsForDay = (date: Date, shifts: Shift[]): DayShiftPart[] => {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);
  const totalMinutesInDay = 24 * 60;

  const parts: DayShiftPart[] = [];

  shifts.forEach((shift) => {
    // Check if shift overlaps with this day
    const overlapStart = shift.startTime > dayStart ? shift.startTime : dayStart;
    const overlapEnd = shift.endTime < dayEnd ? shift.endTime : dayEnd;

    if (overlapStart < overlapEnd && isWithinInterval(overlapStart, { start: dayStart, end: dayEnd })) {
      const minutesFromStart = differenceInMinutes(overlapStart, dayStart);
      const duration = differenceInMinutes(overlapEnd, overlapStart);

      parts.push({
        shiftId: shift.id,
        type: shift.type,
        color: shift.color,
        startPercentage: (minutesFromStart / totalMinutesInDay) * 100,
        durationPercentage: (duration / totalMinutesInDay) * 100,
      });
    }
    
    // Check for edge case: shift starts on this day but ends on the next
    // date-fns isWithinInterval is inclusive. If a shift starts at 22:00 and ends at 08:00 next day.
    // Day 1: 22:00 to 24:00 (120 mins) -> 120/1440 = 8.33% at the end.
    // Day 2: 00:00 to 08:00 (480 mins) -> 480/1440 = 33.33% at the start.
  });

  return parts;
};

export const getCalendarDays = (currentMonth: Date) => {
  const start = startOfWeek(startOfDay(currentMonth), { weekStartsOn: 1 });
  const end = endOfWeek(endOfDay(currentMonth), { weekStartsOn: 1 });

  return eachDayOfInterval({ start, end });
};
