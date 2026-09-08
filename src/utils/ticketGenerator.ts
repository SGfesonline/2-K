import { TicketRecord } from '../types';

export function getNextTicketNumber(tickets: TicketRecord[]): number {
  if (!tickets || tickets.length === 0) return 1;
  const maxNumber = tickets.reduce((max, t) => {
    return typeof t.ticketNumber === 'number' && !isNaN(t.ticketNumber)
      ? Math.max(max, t.ticketNumber)
      : max;
  }, 0);
  return maxNumber + 1;
}

export function getCurrentTimeSlot(): string {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  if (hours < 9) return '09:30-10:00';
  if (hours >= 16 && minutes >= 30) return '16:00-16:30';

  const slotStartMin = minutes < 30 ? 0 : 30;
  const slotEndHour = slotStartMin === 0 ? hours : hours + 1;
  const slotEndMin = slotStartMin === 0 ? 30 : 0;

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(slotStartMin)}-${pad(slotEndHour)}:${pad(slotEndMin)}`;
}

export interface TicketIssueInput {
  numberOfPeople: number;
  representativeName: string;
  grade: string;
  className?: string;
  attendanceNumber?: string;
  accessPassword: string;
  projectName?: string;
}

export function createFestivalTicket(
  input: TicketIssueInput,
  existingTickets: TicketRecord[]
): TicketRecord {
  const ticketNumber = getNextTicketNumber(existingTickets);
  const now = new Date();
  const timeStr = now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toISOString().split('T')[0];

  const trimmedName = input.representativeName.trim();
  const trimmedGrade = input.grade.trim();
  const isSchoolStaffOrGuest = trimmedGrade === '教職員' || trimmedGrade === '保護者・一般';
  
  const trimmedClass = isSchoolStaffOrGuest ? '' : (input.className ? input.className.trim() : '');
  const trimmedNumber = isSchoolStaffOrGuest ? '' : (input.attendanceNumber ? input.attendanceNumber.trim() : '');
  
  let studentInfoTag = '';
  if (isSchoolStaffOrGuest) {
    studentInfoTag = trimmedGrade;
  } else {
    studentInfoTag = [trimmedGrade, trimmedClass, trimmedNumber ? `${trimmedNumber}番` : '']
      .filter(Boolean)
      .join(' ');
  }

  return {
    id: `ticket_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    ticketNumber,
    name: trimmedName,
    representativeName: trimmedName,
    numberOfPeople: Math.max(1, Number(input.numberOfPeople) || 1),
    grade: trimmedGrade,
    className: trimmedClass || undefined,
    attendanceNumber: trimmedNumber || undefined,
    accessPassword: input.accessPassword.trim(),
    projectName: input.projectName || '今日、迷子になりました。～惑星朝日編～',
    timeSlot: getCurrentTimeSlot(),
    scheduledDate: dateStr,
    attendance: 'present',
    queueStatus: 'waiting',
    attribute: studentInfoTag || '一般来場者',
    registeredAt: timeStr,
    arrivedAt: timeStr,
    callCount: 0
  };
}
