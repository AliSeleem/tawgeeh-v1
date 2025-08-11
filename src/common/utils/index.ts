import { DayOfWeek } from '@prisma/client';

export default function getNextWeekdayDate(weekdayName: DayOfWeek): Date {
  const daysOfWeek = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  const today = new Date();
  const targetDay = daysOfWeek[weekdayName.toLowerCase()];
  if (targetDay === undefined) throw new Error('Invalid weekday name');

  let daysUntil = (targetDay - today.getDay() + 7) % 7;
  if (daysUntil === 0) daysUntil = 7; // force "next" week if it's today

  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + daysUntil);
  return nextDate;
}
