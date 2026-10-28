import { AttendanceRecord, Employee, Holiday, ApprovedLeave, AdminAccount } from '../types';

const API_BASE = '/api';

export const api = {
  // Admin Authentication & Setup
  async getAdminStatus(): Promise<AdminAccount> {
    const res = await fetch(`${API_BASE}/admin/status`);
    if (!res.ok) throw new Error('एडमिन स्थिति प्राप्त करने में विफल');
    return res.json();
  },

  async registerAdmin(payload: {
    adminId: string;
    password: string;
    displayName?: string;
  }): Promise<{ success: boolean; message: string; admin: Partial<AdminAccount> }> {
    const res = await fetch(`${API_BASE}/admin/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'पंजीकरण विफल');
    return data;
  },

  async loginAdmin(payload: {
    adminId: string;
    password: string;
  }): Promise<{ success: boolean; token: string; admin: Partial<AdminAccount> }> {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'लॉगिन विफल');
    return data;
  },

  async changeAdminPassword(payload: {
    currentPassword: string;
    newAdminId?: string;
    newPassword?: string;
    displayName?: string;
  }): Promise<{ success: boolean; message: string; admin: Partial<AdminAccount> }> {
    const res = await fetch(`${API_BASE}/admin/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'पासवर्ड बदलने में विफल');
    return data;
  },

  // Employees
  async getEmployees(): Promise<Employee[]> {
    const res = await fetch(`${API_BASE}/employees`);
    if (!res.ok) throw new Error('कर्मचारी सूची लोड करने में विफल');
    return res.json();
  },

  async getEmployeeById(id: string): Promise<Employee> {
    const res = await fetch(`${API_BASE}/employees/${encodeURIComponent(id)}`);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'कर्मचारी अधिकृत नहीं है');
    }
    return res.json();
  },

  async addEmployee(employee: Partial<Employee>): Promise<Employee> {
    const res = await fetch(`${API_BASE}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employee),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'कर्मचारी जोड़ने में विफल');
    return data;
  },

  async editEmployee(id: string, updates: Partial<Employee>): Promise<{ success: boolean; employee: Employee }> {
    const res = await fetch(`${API_BASE}/employees/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'कर्मचारी विवरण सुधारने में विफल');
    return data;
  },

  async bulkImportEmployees(employees: Partial<Employee>[]): Promise<any> {
    const res = await fetch(`${API_BASE}/employees/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employees }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'इम्पोर्ट विफल');
    return data;
  },

  async resetGeSeries(): Promise<any> {
    const res = await fetch(`${API_BASE}/employees/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'reset-ge-series' }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'G-E श्रृंखला रीलोड करने में विफल');
    return data;
  },

  // Attendance
  async getAttendance(date?: string, employeeId?: string): Promise<AttendanceRecord[]> {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (employeeId) params.append('employeeId', employeeId);
    const res = await fetch(`${API_BASE}/attendance?${params.toString()}`);
    if (!res.ok) throw new Error('उपस्थिति रिकॉर्ड लोड करने में विफल');
    return res.json();
  },

  async submitAttendance(payload: {
    employeeId: string;
    selfieDataUrl: string;
    latitude: number;
    longitude: number;
    accuracy: number;
  }): Promise<{ success: boolean; message: string; record: AttendanceRecord }> {
    const res = await fetch(`${API_BASE}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'उपस्थिति दर्ज करने में विफल');
    return data;
  },

  async correctAttendance(
    id: string,
    updates: { status?: 'Present' | 'Absent' | 'Leave'; auditNotes?: string; correctedBy?: string }
  ): Promise<{ success: boolean; record: AttendanceRecord }> {
    const res = await fetch(`${API_BASE}/attendance/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'ऑडिट अपडेट में विफल');
    return data;
  },

  // Holidays & Leaves
  async getHolidays(): Promise<Holiday[]> {
    const res = await fetch(`${API_BASE}/holidays`);
    return res.ok ? res.json() : [];
  },

  async addHoliday(date: string, name: string): Promise<Holiday> {
    const res = await fetch(`${API_BASE}/holidays`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, name }),
    });
    return res.json();
  },

  async getLeaves(): Promise<ApprovedLeave[]> {
    const res = await fetch(`${API_BASE}/leaves`);
    return res.ok ? res.json() : [];
  },

  async addLeave(employeeId: string, date: string, reason: string): Promise<ApprovedLeave> {
    const res = await fetch(`${API_BASE}/leaves`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId, date, reason }),
    });
    return res.json();
  },
};
