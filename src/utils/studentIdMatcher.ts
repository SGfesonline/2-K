import { TicketRecord } from '../types';

export function normalizeQueryString(str: string): string {
  if (!str) return '';
  return str
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/^[\s\u3000]+|[\s\u3000]+$/g, '')
    .toLowerCase();
}

export function findMatchingTicket(
  query: string,
  tickets: TicketRecord[]
): { ticket: TicketRecord | null; matchedBy: 'exact_email' | 'student_id' | 'number_without_s' | 'ticket_number' | 'name' | 'student_info' | null } {
  const q = normalizeQueryString(query);
  if (!q || tickets.length === 0) {
    return { ticket: null, matchedBy: null };
  }

  const ticketNumMatch = q.match(/^#?(\d{1,5})$/);
  if (ticketNumMatch) {
    const num = parseInt(ticketNumMatch[1], 10);
    const byNum = tickets.find(t => t.ticketNumber === num);
    if (byNum) {
      return { ticket: byNum, matchedBy: 'ticket_number' };
    }
  }

  const exactEmail = tickets.find(t => normalizeQueryString(t.email) === q);
  if (exactEmail) {
    return { ticket: exactEmail, matchedBy: 'exact_email' };
  }

  const byUsername = tickets.find(t => {
    const userPart = normalizeQueryString(t.email).split('@')[0];
    return userPart === q;
  });
  if (byUsername) {
    return { ticket: byUsername, matchedBy: 'student_id' };
  }

  if (/^\d{3,6}$/.test(q)) {
    const withS = `s${q}`;
    const byWithS = tickets.find(t => {
      const userPart = normalizeQueryString(t.email).split('@')[0];
      return userPart === withS;
    });
    if (byWithS) {
      return { ticket: byWithS, matchedBy: 'number_without_s' };
    }
  }

  if (/^s\d{3,6}$/.test(q)) {
    const withoutS = q.slice(1);
    const byWithoutS = tickets.find(t => {
      const userPart = normalizeQueryString(t.email).split('@')[0];
      return userPart === withoutS;
    });
    if (byWithoutS) {
      return { ticket: byWithoutS, matchedBy: 'student_id' };
    }
  }

  const byName = tickets.find(t => {
    const normName = normalizeQueryString(t.name);
    const normRep = t.representativeName ? normalizeQueryString(t.representativeName) : '';
    const normKana = t.kana ? normalizeQueryString(t.kana) : '';
    return normName === q || normRep === q || normKana === q || normName.includes(q) || normRep.includes(q);
  });
  if (byName) {
    return { ticket: byName, matchedBy: 'name' };
  }

  const byStudentInfo = tickets.find(t => {
    if (!t.grade && !t.className && !t.attendanceNumber) return false;
    const combined = `${t.grade || ''}${t.className || ''}${t.attendanceNumber || ''}`.replace(/[\s年組番\-]/g, '');
    const cleanQuery = q.replace(/[\s年組番\-]/g, '');
    return combined && cleanQuery && (combined === cleanQuery || (t.attendanceNumber && t.attendanceNumber === cleanQuery));
  });
  if (byStudentInfo) {
    return { ticket: byStudentInfo, matchedBy: 'student_info' };
  }

  if (!q.includes('@')) {
    const autoEmail = `${q}@stu.seikyo.ed.jp`;
    const byAutoEmail = tickets.find(t => normalizeQueryString(t.email) === autoEmail);
    if (byAutoEmail) {
      return { ticket: byAutoEmail, matchedBy: 'student_id' };
    }
  }

  return { ticket: null, matchedBy: null };
}

export function ticketMatchesSearchQuery(t: TicketRecord, rawQuery: string): boolean {
  const q = normalizeQueryString(rawQuery);
  if (!q) return true;

  if (String(t.ticketNumber).includes(q) || `#${t.ticketNumber}`.includes(q)) {
    return true;
  }

  if (normalizeQueryString(t.name).includes(q)) return true;
  if (t.representativeName && normalizeQueryString(t.representativeName).includes(q)) return true;
  if (t.kana && normalizeQueryString(t.kana).includes(q)) return true;

  if (t.grade && normalizeQueryString(t.grade).includes(q)) return true;
  if (t.className && normalizeQueryString(t.className).includes(q)) return true;
  if (t.attendanceNumber && normalizeQueryString(t.attendanceNumber).includes(q)) return true;
  const combinedStudent = `${t.grade || ''}${t.className || ''}${t.attendanceNumber || ''}`.replace(/[\s年組番\-]/g, '');
  const cleanQ = q.replace(/[\s年組番\-]/g, '');
  if (combinedStudent && cleanQ && combinedStudent.includes(cleanQ)) return true;

  if (t.attribute && normalizeQueryString(t.attribute).includes(q)) return true;
  if (t.email && normalizeQueryString(t.email).includes(q)) return true;

  return false;
}
