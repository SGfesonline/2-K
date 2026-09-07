export type QueueStatus = 
  | 'waiting'
  | 'called'
  | 'in_progress'
  | 'done'
  | 'on_hold'
  | 'absent'
  | 'interview'
  | 'donating'
  | 'resting';

export type AttendanceStatus = 'unattended' | 'present' | 'absent' | 'completed';

export type GradeType = '1年' | '2年' | '3年' | '教職員' | '保護者・一般';

export const CLASS_OPTIONS = [
  'A組', 'B組', 'C組', 'D組', 'E組', 'F組', 'G組', 'H組', 'I組', 'J組', 'K組', 'L組'
] as const;

export type ClassOptionType = typeof CLASS_OPTIONS[number];

export type AdminTabType = 'queue' | 'slots' | 'roster';

export interface TicketRecord {
  id: string;
  ticketNumber: number;
  name: string;
  representativeName?: string;
  numberOfPeople: number;
  grade: string;
  className?: string;
  attendanceNumber?: string;
  accessPassword?: string;
  projectName?: string;
  timeSlot?: string;
  scheduledDate?: string;
  attendance: AttendanceStatus;
  queueStatus: QueueStatus;
  attribute?: string;
  registeredAt?: string;
  arrivedAt?: string;
  calledAt?: string;
  calledTimestamp?: number;
  callCount?: number;
  completedAt?: string;
  notes?: string;
  email?: string;
  kana?: string;
  // Legacy compatibility fields
  lotteryResult?: string;
  parentalConsentStatus?: 'not_required' | 'submitted' | 'unconfirmed';
  safetyChecklist?: {
    mealTaken?: boolean;
    sleepAdequate?: boolean;
    weightQualified?: boolean;
    medicationCleared?: boolean;
    waterHydrated?: boolean;
    confirmedAt?: string;
  };
}

export interface TimeSlotStat {
  slot: string;
  total: number;
  waiting: number;
  inProgress: number;
  completed: number;
  absent: number;
  tickets: TicketRecord[];
}

export interface NotificationLog {
  id: string;
  ticketId: string;
  recipientEmail: string;
  recipientName: string;
  title: string;
  body: string;
  sentAt: string;
  status: 'simulated' | 'delivered' | 'failed';
}

export interface AdminAuthConfig {
  salt: string;
  hash: string;
  updatedAt: string;
}

// Backward compatibility types for legacy components
export type Ticket = TicketRecord;
export type TicketStatus = QueueStatus;

export interface ClassProject {
  id: string;
  title: string;
  gradeClass: string;
  location: string;
  capacityPerSlot: number;
  slotDurationMinutes: number;
  startTime: string;
  endTime: string;
  requiresStudentInfo: boolean;
  notes?: string;
}

export interface TicketFormData {
  numberOfPeople: number;
  representativeName: string;
  grade: string;
  className: string;
  attendanceNumber: string;
  notes?: string;
  timeSlot?: string;
}

