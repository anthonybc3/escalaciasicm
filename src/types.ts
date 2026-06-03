// ClassId has been replaced by dynamic UUIDs from the classes table

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

export interface Class {
  id: string;
  churchId: string;
  name: string;
  dayOfWeek: number;
  isActive: boolean;
}

export interface Teacher {
  id: string;
  name: string;
  classId: string;
  churchId: string;
}



export interface ScheduleEntry {
  id: string;
  date: string; // ISO string or YYYY-MM-DD
  teacherId: string | null;
}

export interface ClassSchedule {
  classId: string;
  entries: ScheduleEntry[];
}

export interface MonthlySchedule {
  id: string;
  month: number; // 0-11
  year: number;
  churchId: string;
  classes: ClassSchedule[];
}

