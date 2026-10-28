export interface Employee {
  id: string; // e.g., 'G-E735', 'G-730'
  name: string; // English
  nameHindi: string; // Hindi
  ward: string; // Ward in Gorakhpur Nagar Nigam
  designation: string; // e.g., Safai Mitra, Tipper Driver, Supervisor
  phone?: string;
  isActive: boolean;
  addedAt?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  ward: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO
  formattedTime: string; // e.g. "07:42 AM"
  latitude: number;
  longitude: number;
  accuracy: number; // in meters
  selfieDataUrl: string; // base64 JPEG
  status: 'Present' | 'Absent' | 'Leave';
  isFlagged: boolean;
  flagReason?: string;
  auditNotes?: string;
  correctedBy?: string;
}

export interface AdminAccount {
  adminId: string; // Custom username/ID set by user
  displayName: string;
  isRegistered: boolean;
  hasCustomPassword: boolean;
  lastLogin?: string;
  updatedAt?: string;
}

export interface Holiday {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
}

export interface ApprovedLeave {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  reason: string;
}

export interface MonthlyEmployeeSummary {
  employeeId: string;
  employeeName: string;
  ward: string;
  totalWorkingDays: number;
  presentDays: number;
  approvedLeaveDays: number;
  absentDays: number;
  attendancePercentage: number;
}
