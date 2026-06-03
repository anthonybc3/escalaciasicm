export type ClassId = 'bebes' | 'criancas' | 'intermediarios' | 'adolescentes';

export type Role = 'ADMIN' | 'MANAGER' | 'TEACHER';
export type UserStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Church {
  id: string;
  name: string;
}

export interface User {
  id: string;
  email?: string;
  password?: string;
  username: string;
  name: string;
  role: Role;
  churchId: string | null;
  managedChurchIds?: string[];
  status: UserStatus;
}

export interface ClassInfo {
  id: ClassId;
  name: string;
  description: string;
  color: string;
  textColor: string;
}

export interface Teacher {
  id: string;
  name: string;
  classId: ClassId;
  churchId: string;
}

export interface ClassConfig {
  classId: ClassId;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  churchId: string;
}

export interface ScheduleEntry {
  id: string;
  date: string; // ISO string or YYYY-MM-DD
  teacherId: string | null;
}

export interface ClassSchedule {
  classId: ClassId;
  entries: ScheduleEntry[];
}

export interface MonthlySchedule {
  id: string;
  month: number; // 0-11
  year: number;
  churchId: string;
  classes: ClassSchedule[];
}

