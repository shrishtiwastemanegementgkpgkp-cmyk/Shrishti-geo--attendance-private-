import * as XLSX from 'xlsx';
import { AttendanceRecord, Employee, Holiday, ApprovedLeave } from '../types';

export function exportMonthlyAttendanceReport(
  employees: Employee[],
  attendanceRecords: AttendanceRecord[],
  holidays: Holiday[],
  leaves: ApprovedLeave[],
  selectedMonth: string // YYYY-MM
) {
  // 1. Prepare Sheet 1: Detailed Daily Records (Exact 9 columns required)
  const filteredRecords = attendanceRecords.filter((rec) =>
    rec.date.startsWith(selectedMonth)
  );

  const sheet1Data = filteredRecords.map((rec) => ({
    'Employee ID': rec.employeeId,
    'Employee Name': rec.employeeName,
    'Date': rec.date,
    'Attendance Status': rec.status,
    'Selfie Reference': rec.selfieDataUrl ? 'LIVE_SELFIE_VERIFIED' : 'NO_IMAGE',
    'GPS Latitude': rec.latitude,
    'GPS Longitude': rec.longitude,
    'GPS Accuracy': `${rec.accuracy} m`,
    'Attendance Time': rec.formattedTime || rec.timestamp.split('T')[1]?.substring(0, 5) || '-',
  }));

  // If empty, provide a clean template row so the columns are always visible
  if (sheet1Data.length === 0) {
    sheet1Data.push({
      'Employee ID': 'SAMPLE-ID',
      'Employee Name': 'Sample Worker Name',
      'Date': `${selectedMonth}-01`,
      'Attendance Status': 'Present',
      'Selfie Reference': 'LIVE_SELFIE_VERIFIED',
      'GPS Latitude': 26.7588,
      'GPS Longitude': 83.3697,
      'GPS Accuracy': '8.2 m',
      'Attendance Time': '06:45 AM',
    });
  }

  // 2. Prepare Sheet 2: Monthly Summary
  // Calculate total working days in this month (exclude Sundays & official holidays)
  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10); // 1-12
  const daysInMonth = new Date(year, month, 0).getDate();

  const holidayDates = new Set(holidays.map((h) => h.date));
  let workingDaysCount = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayOfWeek = new Date(year, month - 1, d).getDay(); // 0 is Sunday
    // In Nagar Nigam, Sunday is off unless special drive
    if (dayOfWeek !== 0 && !holidayDates.has(dStr)) {
      workingDaysCount++;
    }
  }
  if (workingDaysCount === 0) workingDaysCount = 26; // Default to 26 working days

  const activeEmployees = employees.filter((e) => e.isActive);

  const sheet2Data = activeEmployees.map((emp) => {
    const empRecords = filteredRecords.filter((r) => r.employeeId === emp.id);
    const presentDays = empRecords.filter((r) => r.status === 'Present').length;
    const leaveRecords = leaves.filter(
      (l) => l.employeeId === emp.id && l.date.startsWith(selectedMonth)
    );
    const approvedLeaveDays = leaveRecords.length;

    // Absent = Working Days - (Present + Approved Leave)
    const absentDays = Math.max(0, workingDaysCount - presentDays - approvedLeaveDays);

    const attendedRatio = workingDaysCount > 0
      ? ((presentDays + approvedLeaveDays) / workingDaysCount) * 100
      : 0;
    const attendancePercentage = Math.min(100, Math.round(attendedRatio * 10) / 10);

    return {
      'Employee ID': emp.id,
      'Employee Name': `${emp.name} (${emp.nameHindi || ''})`,
      'Ward': emp.ward,
      'Designation': emp.designation,
      'Total Working Days': workingDaysCount,
      'Present Days': presentDays,
      'Approved Leave Days': approvedLeaveDays,
      'Absent Days': absentDays,
      'Attendance Percentage': `${attendancePercentage}%`,
    };
  });

  // Create workbook
  const wb = XLSX.utils.book_new();

  const ws1 = XLSX.utils.json_to_sheet(sheet1Data);
  const ws2 = XLSX.utils.json_to_sheet(sheet2Data);

  // Set column widths for readable Excel files
  ws1['!cols'] = [
    { wch: 15 }, // ID
    { wch: 28 }, // Name
    { wch: 14 }, // Date
    { wch: 18 }, // Status
    { wch: 22 }, // Selfie Ref
    { wch: 15 }, // Lat
    { wch: 15 }, // Long
    { wch: 14 }, // Accuracy
    { wch: 18 }, // Time
  ];

  ws2['!cols'] = [
    { wch: 15 },
    { wch: 30 },
    { wch: 28 },
    { wch: 25 },
    { wch: 18 },
    { wch: 14 },
    { wch: 20 },
    { wch: 14 },
    { wch: 22 },
  ];

  XLSX.utils.book_append_sheet(wb, ws1, 'Daily Attendance Records');
  XLSX.utils.book_append_sheet(wb, ws2, 'Monthly Summary');

  // Trigger download in browser
  const fileName = `Shrishti_Attendance_${selectedMonth}_Gorakhpur.xlsx`;
  XLSX.writeFile(wb, fileName);
}

// Function to parse uploaded Excel file for employee master import
export function parseEmployeeExcelFile(file: File): Promise<Partial<Employee>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

        const parsedEmployees: Partial<Employee>[] = rows
          .map((row) => {
            const id =
              row['Employee ID'] ||
              row['ID'] ||
              row['Emp ID'] ||
              row['कर्मचारी कोड'] ||
              row['Code'];
            const name =
              row['Employee Name'] ||
              row['Name'] ||
              row['नाम'] ||
              row['Worker Name'];
            const nameHindi = row['Hindi Name'] || row['हिंदी नाम'] || name;
            const ward =
              row['Ward'] ||
              row['वार्ड'] ||
              row['Location'] ||
              'वार्ड 01 - गोलघर (Golghar)';
            const designation =
              row['Designation'] ||
              row['पद'] ||
              row['Role'] ||
              'मार्ग सफाई मित्र (Street Sweeper)';
            const phone = row['Phone'] || row['Mobile'] || row['मोबाइल'];

            if (!id || !name) return null;

            return {
              id: String(id).trim().toUpperCase(),
              name: String(name).trim(),
              nameHindi: String(nameHindi).trim(),
              ward: String(ward).trim(),
              designation: String(designation).trim(),
              phone: phone ? String(phone).trim() : undefined,
              isActive: true,
            };
          })
          .filter(Boolean) as Partial<Employee>[];

        resolve(parsedEmployees);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
