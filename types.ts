export interface User {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  banner?: string;
  settings: {
    darkMode: boolean;
    reminders: boolean;
  };
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  totalTimeStudied: number; // in minutes
}

export interface Goal {
  id: string;
  subjectId: string;
  title: string;
  targetMinutes: number;
  completed: boolean;
  createdAt: string;
}

export interface Note {
  id: string;
  folderId: string;
  title: string;
  content: string;
  updatedAt: string;
  color: string; // Hex code or class name
}

export interface Folder {
  id: string;
  name: string;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  day: string; // 'Monday', 'Tuesday', etc.
  date?: string; // YYYY-MM-DD specific date override
  startTime: string;
  endTime: string;
  isAllDay?: boolean;
  type: 'class' | 'study' | 'other';
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  subjectId?: string;
  reminder?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isRead: boolean;
}

export interface Contact {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'study';
  avatar: string;
  type: 'individual' | 'group';
  email?: string;
  phone?: string;
  members?: string[]; // IDs of members if group
}

export interface WellnessLog {
  date: string;
  mood: 'happy' | 'neutral' | 'stressed' | 'tired' | 'energetic';
  waterIntake: number; // in ml
  sleepHours: number;
  steps: number;
}