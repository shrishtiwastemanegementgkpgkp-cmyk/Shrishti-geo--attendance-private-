import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Users,
  Calendar,
  Search,
  ExternalLink,
  Edit2,
  Plus,
  RefreshCw,
  LogOut,
  MapPin,
  Clock,
  Sparkles,
  Download,
  Upload,
  Check,
  X,
} from 'lucide-react';
import { Employee, AttendanceRecord, Holiday, ApprovedLeave, AdminAccount } from '../types';
import { api } from '../services/api';
import { exportMonthlyAttendanceReport, parseEmployeeExcelFile } from '../utils/excelExporter';

interface AdminDashboardProps {
  isLoggedIn: boolean;
  onLoginSuccess: (admin: Partial<AdminAccount>) => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isLoggedIn,
  onLoginSuccess,
  onLogout,
}) => {
  // Auth state
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [adminStatus, setAdminStatus] = useState<AdminAccount | null>(null);

  // Login form state (PASSWORDS ARE NEVER PRE-FILLED IN PLAIN TEXT)
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Registration form state
  const [regAdminId, setRegAdminId] = useState('');
  const [regDisplayName, setRegDisplayName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // Change Password Modal inside Admin Portal
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newAdminId, setNewAdminId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null);
  const [changePasswordSuccess, setChangePasswordSuccess] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Dashboard Tab state
  const [adminTab, setAdminTab] = useState<'attendance' | 'employees' | 'reports' | 'holidays' | 'security'>('attendance');

  // Data states
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [leaves, setLeaves] = useState<ApprovedLeave[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Filter states
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWard, setSelectedWard] = useState('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);

  // Selected Selfie modal
  const [previewSelfie, setPreviewSelfie] = useState<AttendanceRecord | null>(null);

  // Edit Employee modal
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editName, setEditName] = useState('');
  const [editNameHindi, setEditNameHindi] = useState('');
  const [editWard, setEditWard] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editError, setEditError] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Add Employee modal
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [newEmpId, setNewEmpId] = useState('');
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpNameHindi, setNewEmpNameHindi] = useState('');
  const [newEmpWard, setNewEmpWard] = useState('वार्ड 01 - गोलघर (Golghar)');
  const [newEmpRole, setNewEmpRole] = useState('मार्ग सफाई मित्र (Street Sweeper)');
  const [newEmpPhone, setNewEmpPhone] = useState('');
  const [addEmpError, setAddEmpError] = useState<string | null>(null);
  const [isAddingEmp, setIsAddingEmp] = useState(false);

  // Audit Correction Modal
  const [auditRecord, setAuditRecord] = useState<AttendanceRecord | null>(null);
  const [auditStatus, setAuditStatus] = useState<'Present' | 'Absent' | 'Leave'>('Present');
  const [auditNotes, setAuditNotes] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);

  // In-app Toast message (replaces window.alert for sandboxed iframe safety)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // File import ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load Admin status on mount
  useEffect(() => {
    api.getAdminStatus()
      .then((status) => {
        setAdminStatus(status);
        if (status.adminId) {
          setLoginId(status.adminId);
        }
      })
      .catch((err) => console.warn('Admin status load error:', err));
  }, []);

  // Fetch Portal Data when logged in
  const loadDashboardData = async () => {
    try {
      setIsLoadingData(true);
      const [empList, attList, holList, leaveList] = await Promise.all([
        api.getEmployees(),
        api.getAttendance(),
        api.getHolidays(),
        api.getLeaves(),
      ]);
      setEmployees(empList);
      setAttendance(attList);
      setHolidays(holList);
      setLeaves(leaveList);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadDashboardData();
    }
  }, [isLoggedIn]);

  // Auto-refresh attendance records every 5 seconds if enabled
  useEffect(() => {
    if (!isLoggedIn || !autoRefresh) return;
    const interval = setInterval(async () => {
      try {
        const attList = await api.getAttendance();
        setAttendance(attList);
      } catch (err) {
        // silent fail on polling
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isLoggedIn, autoRefresh]);

  // Handle Admin Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId.trim() || !loginPassword.trim()) {
      setLoginError('कृपया एडमिन आईडी और पासवर्ड दर्ज करें।');
      return;
    }

    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const res = await api.loginAdmin({
        adminId: loginId.trim(),
        password: loginPassword.trim(),
      });
      onLoginSuccess(res.admin);
      setLoginPassword(''); // Clean password from memory immediately
    } catch (err: any) {
      setLoginError(err.message || 'अमान्य एडमिन आईडी या पासवर्ड!');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Admin Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regAdminId.trim()) {
      setRegError('कृपया एडमिन आईडी दर्ज करें (कम से कम 3 अक्षर)।');
      return;
    }
    if (regPassword.length < 4) {
      setRegError('पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('दोनों पासवर्ड आपस में मेल नहीं खा रहे हैं।');
      return;
    }

    setIsRegistering(true);
    setRegError(null);
    setRegSuccess(null);

    try {
      const res = await api.registerAdmin({
        adminId: regAdminId.trim(),
        displayName: regDisplayName.trim() || 'Shrishti Admin',
        password: regPassword.trim(),
      });

      setRegSuccess('एडमिन आईडी व पासवर्ड सफलतापूर्वक पंजीकृत कर दिया गया है!');
      setLoginId(regAdminId.trim());
      setRegPassword('');
      setRegConfirmPassword('');
      // Auto login after registration
      setTimeout(() => {
        setAuthMode('login');
      }, 1500);
    } catch (err: any) {
      setRegError(err.message || 'पंजीकरण विफल हुआ।');
    } finally {
      setIsRegistering(false);
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setChangePasswordError('वर्तमान पासवर्ड दर्ज करना अनिवार्य है।');
      return;
    }
    if (newPassword && newPassword.length < 4) {
      setChangePasswordError('नया पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।');
      return;
    }
    if (newPassword && newPassword !== confirmNewPassword) {
      setChangePasswordError('नया पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते।');
      return;
    }

    setIsChangingPassword(true);
    setChangePasswordError(null);
    setChangePasswordSuccess(null);

    try {
      const res = await api.changeAdminPassword({
        currentPassword: currentPassword.trim(),
        newAdminId: newAdminId.trim() || undefined,
        newPassword: newPassword.trim() || undefined,
      });

      setChangePasswordSuccess('आईडी व पासवर्ड सफलतापूर्वक बदल दिया गया है! आगे से इसी पासवर्ड से लॉगिन होगा।');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => {
        setShowChangePasswordModal(false);
        setChangePasswordSuccess(null);
      }, 2000);
    } catch (err: any) {
      setChangePasswordError(err.message || 'पासवर्ड बदलने में त्रुटि।');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Open Edit Employee Modal
  const openEditEmployee = (emp: Employee) => {
    setEditingEmployee(emp);
    setEditName(emp.name);
    setEditNameHindi(emp.nameHindi || emp.name);
    setEditWard(emp.ward);
    setEditDesignation(emp.designation);
    setEditPhone(emp.phone || '');
    setEditIsActive(emp.isActive);
    setEditError(null);
  };

  // Save Edit Employee
  const handleSaveEditEmployee = async () => {
    if (!editingEmployee) return;
    if (!editName.trim()) {
      setEditError('कर्मचारी का नाम अनिवार्य है।');
      return;
    }

    setIsSavingEdit(true);
    setEditError(null);

    try {
      const res = await api.editEmployee(editingEmployee.id, {
        name: editName.trim(),
        nameHindi: editNameHindi.trim(),
        ward: editWard.trim(),
        designation: editDesignation.trim(),
        phone: editPhone.trim(),
        isActive: editIsActive,
      });

      // Update local state
      setEmployees((prev) =>
        prev.map((e) => (e.id === editingEmployee.id ? res.employee : e))
      );
      // Reload attendance records to show updated name
      const updatedAttendance = await api.getAttendance();
      setAttendance(updatedAttendance);

      setEditingEmployee(null);
    } catch (err: any) {
      setEditError(err.message || 'कर्मचारी विवरण सुधारने में त्रुटि।');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Handle Add Employee
  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpId.trim() || !newEmpName.trim()) {
      setAddEmpError('कर्मचारी कोड और नाम अनिवार्य हैं।');
      return;
    }

    setIsAddingEmp(true);
    setAddEmpError(null);

    try {
      const added = await api.addEmployee({
        id: newEmpId.trim().toUpperCase(),
        name: newEmpName.trim(),
        nameHindi: newEmpNameHindi.trim() || newEmpName.trim(),
        ward: newEmpWard,
        designation: newEmpRole,
        phone: newEmpPhone.trim(),
        isActive: true,
      });

      setEmployees((prev) => [added, ...prev]);
      setShowAddEmployeeModal(false);
      setNewEmpId('');
      setNewEmpName('');
      setNewEmpNameHindi('');
      setNewEmpPhone('');
    } catch (err: any) {
      setAddEmpError(err.message || 'कर्मचारी जोड़ने में विफल।');
    } finally {
      setIsAddingEmp(false);
    }
  };

  // Handle Excel Import
  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoadingData(true);
      const parsed = await parseEmployeeExcelFile(file);
      if (parsed.length === 0) {
        setToast({ message: 'एक्सेल फाइल में कोई मान्य कर्मचारी रिकॉर्ड नहीं मिला।', type: 'error' });
        return;
      }
      const res = await api.bulkImportEmployees(parsed);
      setToast({ message: res.message || `${parsed.length} कर्मचारी आयात किए गए।`, type: 'success' });
      loadDashboardData();
    } catch (err: any) {
      setToast({ message: `एक्सेल फाइल पढ़ने में त्रुटि: ${err.message}`, type: 'error' });
    } finally {
      setIsLoadingData(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Reset G-E735 to G-E800 series
  const handleResetGeSeries = async () => {
    try {
      setIsLoadingData(true);
      const res = await api.resetGeSeries();
      setToast({ message: res.message || 'G-E735 से G-E800 के सभी 66 कर्मचारी रीलोड हो गए।', type: 'success' });
      loadDashboardData();
    } catch (err: any) {
      setToast({ message: `त्रुटि: ${err.message}`, type: 'error' });
    } finally {
      setIsLoadingData(false);
    }
  };

  // Save Audit Correction
  const handleSaveAudit = async () => {
    if (!auditRecord) return;
    setIsAuditing(true);
    try {
      const res = await api.correctAttendance(auditRecord.id, {
        status: auditStatus,
        auditNotes: auditNotes.trim(),
        correctedBy: adminStatus?.adminId || 'Admin',
      });
      setAttendance((prev) =>
        prev.map((r) => (r.id === auditRecord.id ? res.record : r))
      );
      setToast({ message: 'ऑडिट रिकॉर्ड सफलतापूर्वक अपडेट कर दिया गया।', type: 'success' });
      setAuditRecord(null);
    } catch (err: any) {
      setToast({ message: `ऑडिट त्रुटि: ${err.message}`, type: 'error' });
    } finally {
      setIsAuditing(false);
    }
  };

  // Wards list for filter
  const allWards = Array.from(new Set(employees.map((e) => e.ward))).filter(Boolean);

  // Filtered attendance records
  const filteredAttendance = attendance.filter((rec) => {
    const matchesDate = !selectedDate || rec.date === selectedDate;
    const matchesWard = selectedWard === 'ALL' || rec.ward === selectedWard;
    const matchesQuery =
      !searchQuery ||
      rec.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDate && matchesWard && matchesQuery;
  });

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesWard = selectedWard === 'ALL' || emp.ward === selectedWard;
    const matchesQuery =
      !searchQuery ||
      emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.nameHindi && emp.nameHindi.includes(searchQuery));
    return matchesWard && matchesQuery;
  });

  // ---------------- RENDER LOGIN / REGISTRATION VIEW IF NOT LOGGED IN ----------------
  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-800 to-teal-900 p-6 text-white text-center">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/20">
              <Shield className="w-8 h-8 text-amber-300" />
            </div>
            <h2 className="text-xl font-bold">सृष्टि एडमिन पोर्टल</h2>
            <p className="text-xs text-emerald-200 mt-1">
              सुरक्षित एडमिनिस्ट्रेशन व उपस्थिति ऑडिट सिस्टम
            </p>

            {/* Privacy Guarantee Badge */}
            <div className="mt-3 inline-flex items-center space-x-1.5 bg-black/30 text-emerald-200 text-[11px] px-3 py-1 rounded-full border border-emerald-500/30">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>पासवर्ड पूर्णतः गोपनीय व सुरक्षित (SHA-512 Encrypted)</span>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
            <button
              onClick={() => {
                setAuthMode('login');
                setLoginError(null);
              }}
              className={`flex-1 py-3 text-center transition flex items-center justify-center space-x-1.5 ${
                authMode === 'login'
                  ? 'bg-white text-emerald-800 border-b-2 border-emerald-600 font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>एडमिन लॉगिन (Login)</span>
            </button>

            <button
              onClick={() => {
                setAuthMode('register');
                setRegError(null);
                setRegSuccess(null);
              }}
              className={`flex-1 py-3 text-center transition flex items-center justify-center space-x-1.5 ${
                authMode === 'register'
                  ? 'bg-white text-emerald-800 border-b-2 border-emerald-600 font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-amber-600" />
              <span>नया रजिस्ट्रेशन (New ID & Password)</span>
            </button>
          </div>

          <div className="p-6">
            {authMode === 'login' ? (
              /* LOGIN FORM */
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    एडमिन आईडी (Admin ID / Username)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      placeholder="पंजीकृत एडमिन आईडी दर्ज करें"
                      required
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    गोपनीय पासवर्ड (Secret Password)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      title={showLoginPassword ? 'छिपाएं' : 'देखें'}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    * पासवर्ड किसी को भी नहीं दिखेगा। केवल आपके द्वारा पंजीकृत पासवर्ड से ही लॉगिन होगा।
                  </p>
                </div>

                {loginError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">लॉगिन विफल</span>
                      <span>{loginError}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-md transition text-sm flex items-center justify-center space-x-2"
                >
                  {isLoggingIn ? (
                    <>
                      <span className="animate-spin">⌛</span>
                      <span>सत्यापित किया जा रहा है...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>एडमिन पोर्टल खोलें (Open Admin Portal)</span>
                    </>
                  )}
                </button>

                <div className="pt-2 text-center border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    यदि आपने अभी तक अपना नया पासवर्ड नहीं बनाया है:
                  </p>
                  <button
                    type="button"
                    onClick={() => setAuthMode('register')}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline mt-1"
                  >
                    यहाँ क्लिक करके अपनी नई आईडी व पासवर्ड रजिस्टर करें
                  </button>
                </div>
              </form>
            ) : (
              /* REGISTRATION FORM */
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 space-y-1">
                  <p className="font-bold flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>नया एडमिन खाता व गुप्त पासवर्ड सेट करें</span>
                  </p>
                  <p className="text-[11px]">
                    आप जो भी एडमिन आईडी और पासवर्ड यहाँ दर्ज करेंगे, भविष्य में केवल उसी से एडमिन पोर्टल खुलेगा। यह पासवर्ड पूरी तरह सुरक्षित रहेगा और किसी को भी नहीं दिखेगा।
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    मनपसंद एडमिन आईडी (Choose Admin ID)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      value={regAdminId}
                      onChange={(e) => setRegAdminId(e.target.value)}
                      placeholder="उदा. admin, shrishti_head, supervisor_gkp"
                      required
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    एडमिन का नाम / पद (Admin Full Name / Title)
                  </label>
                  <input
                    type="text"
                    value={regDisplayName}
                    onChange={(e) => setRegDisplayName(e.target.value)}
                    placeholder="उदा. नगर निगम स्वच्छता प्रभारी (गोरखपुर)"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    नया गुप्त पासवर्ड (New Secret Password)
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="कम से कम 4 अक्षरों का पासवर्ड"
                      required
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    पासवर्ड पुनः दर्ज करें (Confirm Password)
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="वही पासवर्ड दोबारा डालें"
                    required
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {regError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{regError}</span>
                  </div>
                )}

                {regSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{regSuccess}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-md transition text-sm flex items-center justify-center space-x-2"
                >
                  {isRegistering ? (
                    <>
                      <span className="animate-spin">⌛</span>
                      <span>पंजीकृत किया जा रहा है...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>नया एडमिन व पासवर्ड सुरक्षित करें</span>
                    </>
                  )}
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="text-xs text-slate-600 hover:text-slate-900 font-medium"
                  >
                    ← पहले से पंजीकृत हैं? लॉगिन पर वापस जाएं
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------------- RENDER FULL ADMIN PORTAL (WHEN LOGGED IN) ----------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-md transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
          }`}
        >
          <div className="flex items-center space-x-2">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-200" />
            )}
            <span>{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Admin Bar with Security Status and Change Password button */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg border border-emerald-200">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                एडमिन पोर्टल • {adminStatus?.displayName || 'Shrishti Admin'}
              </h2>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border border-emerald-300">
                लॉगिन सुरक्षित
              </span>
            </div>
            <p className="text-xs text-slate-500">
              आईडी: <span className="font-mono font-bold text-slate-700">{adminStatus?.adminId}</span> • गोरखपुर नगर निगम स्वच्छ सर्वेक्षण
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Change ID & Password Button */}
          <button
            onClick={() => {
              setShowChangePasswordModal(true);
              setChangePasswordError(null);
              setChangePasswordSuccess(null);
            }}
            className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-300 shadow-sm transition"
            title="पासवर्ड व आईडी बदलें"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-600" />
            <span>आईडी व पासवर्ड बदलें</span>
          </button>

          <button
            onClick={loadDashboardData}
            disabled={isLoadingData}
            className="inline-flex items-center space-x-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-2 rounded-xl text-xs font-bold transition"
            title="डेटा रिफ्रेश करें"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
            <span>रिफ्रेश</span>
          </button>

          <button
            onClick={onLogout}
            className="inline-flex items-center space-x-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-2 rounded-xl text-xs font-bold transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>लॉगआउट</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-1 overflow-x-auto scrollbar-none bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => setAdminTab('attendance')}
          className={`flex-1 min-w-[170px] py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
            adminTab === 'attendance'
              ? 'bg-white text-emerald-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4 text-emerald-600" />
          <span>दैनिक उपस्थिति व ऑडिट ({filteredAttendance.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('employees')}
          className={`flex-1 min-w-[170px] py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
            adminTab === 'employees'
              ? 'bg-white text-emerald-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-blue-600" />
          <span>कर्मचारी मास्टर ({employees.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('reports')}
          className={`flex-1 min-w-[170px] py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
            adminTab === 'reports'
              ? 'bg-white text-emerald-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-green-600" />
          <span>मासिक एक्सेल रिपोर्ट (.xlsx)</span>
        </button>

        <button
          onClick={() => setAdminTab('holidays')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
            adminTab === 'holidays'
              ? 'bg-white text-emerald-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4 text-purple-600" />
          <span>अवकाश व छुट्टी ({holidays.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('security')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
            adminTab === 'security'
              ? 'bg-white text-emerald-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Lock className="w-4 h-4 text-amber-600" />
          <span>सुरक्षा व पासवर्ड</span>
        </button>
      </div>

      {/* ================= TAB 1: DAILY ATTENDANCE & AUDIT ================= */}
      {adminTab === 'attendance' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center flex-1 min-w-[280px]">
              {/* Date Filter */}
              <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
                <Calendar className="w-4 h-4 text-slate-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
                />
              </div>

              {/* Ward Filter */}
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none"
              >
                <option value="ALL">सभी वार्ड (All Wards)</option>
                {allWards.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>

              {/* Search query */}
              <div className="relative flex-1 min-w-[150px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="आईडी या नाम खोजें..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Auto refresh switch */}
            <div className="flex items-center space-x-2">
              <label className="text-xs text-slate-600 font-medium flex items-center space-x-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>लाइव ऑटो-सिंक (5s)</span>
              </label>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">कर्मचारी (Employee)</th>
                    <th className="py-3 px-4">वार्ड व पद</th>
                    <th className="py-3 px-3 text-center">सेल्फी फोटो</th>
                    <th className="py-3 px-4">पंच का समय</th>
                    <th className="py-3 px-4">GPS निर्देशांक</th>
                    <th className="py-3 px-3 text-center">सटीकता</th>
                    <th className="py-3 px-3 text-center">स्थिति</th>
                    <th className="py-3 px-4 text-center">ऑडिट कार्रवाई</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        इस दिनांक / वार्ड के लिए कोई उपस्थिति रिकॉर्ड नहीं मिला।
                      </td>
                    </tr>
                  ) : (
                    filteredAttendance.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50 transition">
                        {/* Employee info */}
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {rec.employeeId}
                          </span>
                          <p className="font-bold text-slate-900 mt-1">{rec.employeeName}</p>
                        </td>

                        {/* Ward */}
                        <td className="py-3 px-4 text-slate-600">
                          <p className="font-medium">{rec.ward}</p>
                        </td>

                        {/* Selfie thumbnail */}
                        <td className="py-3 px-3 text-center">
                          {rec.selfieDataUrl ? (
                            <button
                              onClick={() => setPreviewSelfie(rec)}
                              className="group relative inline-block rounded-xl overflow-hidden border-2 border-emerald-400 hover:border-emerald-600 transition shadow-sm"
                            >
                              <img
                                src={rec.selfieDataUrl}
                                alt="Selfie"
                                className="w-12 h-12 object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[9px] font-bold">
                                देखें
                              </div>
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[10px]">कोई फोटो नहीं</span>
                          )}
                        </td>

                        {/* Punch Time */}
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-800">{rec.formattedTime}</span>
                          <span className="text-[10px] text-slate-400 block">{rec.date}</span>
                        </td>

                        {/* GPS Coordinates with Maps link */}
                        <td className="py-3 px-4 font-mono text-[11px]">
                          <a
                            href={`https://www.google.com/maps?q=${rec.latitude},${rec.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 hover:text-emerald-900 font-semibold inline-flex items-center space-x-1 underline"
                            title="गूगल मैप्स पर देखें"
                          >
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span>{rec.latitude.toFixed(4)}, {rec.longitude.toFixed(4)}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </td>

                        {/* Accuracy */}
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                              rec.accuracy <= 20
                                ? 'bg-emerald-100 text-emerald-800'
                                : rec.accuracy <= 50
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            ±{rec.accuracy}m
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                              rec.status === 'Present'
                                ? 'bg-emerald-100 text-emerald-800'
                                : rec.status === 'Leave'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {rec.status === 'Present' ? 'उपस्थित' : rec.status}
                          </span>
                          {rec.isFlagged && (
                            <span className="block text-[9px] text-amber-700 font-bold mt-0.5" title={rec.flagReason}>
                              ⚠️ जांच हेतु
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => {
                              setAuditRecord(rec);
                              setAuditStatus(rec.status);
                              setAuditNotes(rec.auditNotes || '');
                            }}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-1 rounded-lg text-xs transition inline-flex items-center space-x-1 border border-slate-300"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>सुधारें</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: EMPLOYEES MASTER (ADD & EDIT) ================= */}
      {adminTab === 'employees' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center flex-1 min-w-[280px]">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="कर्मचारी कोड (G-E735...) या नाम से खोजें..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Ward filter */}
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none"
              >
                <option value="ALL">सभी वार्ड</option>
                {allWards.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Reset G-E Series Button */}
              <button
                onClick={handleResetGeSeries}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-3 py-2 rounded-xl text-xs transition flex items-center space-x-1"
                title="G-E735 से G-E800 तक 66 कर्मचारियों को रीलोड करें"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>G-E735 से G-E800 सिंक</span>
              </button>

              {/* Excel Import button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 font-bold px-3 py-2 rounded-xl text-xs transition flex items-center space-x-1"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>एक्सेल इम्पोर्ट (.xlsx)</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleExcelImport}
                accept=".xlsx,.xls,.csv"
                className="hidden"
              />

              {/* Add Employee Button */}
              <button
                onClick={() => {
                  setShowAddEmployeeModal(true);
                  setAddEmpError(null);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition flex items-center space-x-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>+ नया कर्मचारी जोड़ें</span>
              </button>
            </div>
          </div>

          {/* Employees Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">कर्मचारी कोड (Emp ID)</th>
                    <th className="py-3 px-4">कर्मचारी का नाम (अंग्रेज़ी)</th>
                    <th className="py-3 px-4">हिंदी नाम</th>
                    <th className="py-3 px-4">वार्ड (Ward)</th>
                    <th className="py-3 px-4">पद / कार्य</th>
                    <th className="py-3 px-3">मोबाइल नंबर</th>
                    <th className="py-3 px-3 text-center">स्थिति</th>
                    <th className="py-3 px-4 text-center">कार्रवाई</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        कोई कर्मचारी नहीं मिला।
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-xs">
                            {emp.id}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">{emp.name}</td>
                        <td className="py-3 px-4 text-slate-700">{emp.nameHindi || '-'}</td>
                        <td className="py-3 px-4 text-slate-600">{emp.ward}</td>
                        <td className="py-3 px-4 text-slate-700 font-medium">{emp.designation}</td>
                        <td className="py-3 px-3 font-mono text-slate-600">{emp.phone || '-'}</td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              emp.isActive
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {emp.isActive ? 'सक्रिय' : 'निष्क्रिय'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => openEditEmployee(emp)}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-lg text-xs transition inline-flex items-center space-x-1 border border-emerald-300"
                            title="नाम या विवरण सुधारें"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>सुधारें (Edit)</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: MONTHLY EXCEL REPORT ================= */}
      {adminTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  मासिक उपस्थिति रिपोर्ट (.xlsx) डाउनलोड
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  गोरखपुर नगर निगम आधिकारिक 9-कॉलम रिपोर्ट + शीट-2 में उपस्थिति प्रतिशत व सारांश
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                />

                <button
                  onClick={() =>
                    exportMonthlyAttendanceReport(
                      employees,
                      attendance,
                      holidays,
                      leaves,
                      selectedMonth
                    )
                  }
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>मासिक एक्सेल (.xlsx) डाउनलोड करें</span>
                </button>
              </div>
            </div>

            {/* Column Specification Preview */}
            <div className="mt-6">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">
                एक्सेल शीट 1 में शामिल कॉलम (9 Mandatory Columns):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {[
                  '1. Employee ID',
                  '2. Employee Name',
                  '3. Date',
                  '4. Attendance Status',
                  '5. Selfie Reference',
                  '6. GPS Latitude',
                  '7. GPS Longitude',
                  '8. GPS Accuracy',
                  '9. Attendance Time',
                ].map((col) => (
                  <div
                    key={col}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    {col}
                  </div>
                ))}
              </div>
            </div>

            {/* Sheet 2 Summary Details */}
            <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wide mb-1">
                शीट 2 सारांश (Sheet 2: Monthly Summary):
              </h4>
              <p className="text-xs text-emerald-800">
                कुल कार्य दिवस (रविवार व नगर निगम अवकाश छोड़कर) • उपस्थित दिन • स्वीकृत अवकाश दिन • अनुपस्थित दिन • उपस्थिति प्रतिशत (%)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: HOLIDAYS & LEAVES ================= */}
      {adminTab === 'holidays' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Holidays */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span>गोरखपुर नगर निगम आधिकारिक अवकाश</span>
            </h3>

            <div className="space-y-2">
              {holidays.map((h) => (
                <div
                  key={h.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                >
                  <span className="font-bold text-slate-800">{h.name}</span>
                  <span className="font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-semibold">
                    {h.date}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Approved Leaves */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>स्वीकृत कर्मचारी छुट्टियां (Approved Leaves)</span>
            </h3>
            {leaves.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                कोई स्वीकृत छुट्टी दर्ज नहीं है।
              </p>
            ) : (
              <div className="space-y-2">
                {leaves.map((l) => (
                  <div
                    key={l.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-blue-800">{l.employeeId}</span>
                      <p className="text-slate-600 mt-0.5">{l.reason}</p>
                    </div>
                    <span className="font-mono text-slate-700">{l.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 5: SECURITY & ADMIN ACCOUNT ================= */}
      {adminTab === 'security' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-200">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center font-bold">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  एडमिन सुरक्षा व पासवर्ड सेटिंग्स
                </h3>
                <p className="text-xs text-slate-500">
                  एडमिन आईडी और गुप्त पासवर्ड प्रबंधन
                </p>
              </div>
            </div>

            {/* Privacy Confirmation Box */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>पासवर्ड गोपनीयता गारंटी (Password Privacy)</span>
              </div>
              <p className="text-xs text-emerald-700 leading-relaxed">
                आपका एडमिन पासवर्ड <strong>PBKDF2 SHA-512 हैशिंग</strong> द्वारा सुरक्षित किया गया है। सर्वर पर पासवर्ड कभी भी सादे टेक्स्ट (Plain Text) में नहीं रखा जाता, और न ही किसी स्क्रीन या उपयोगकर्ता को दिखाया जाता है।
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">वर्तमान पंजीकृत एडमिन आईडी:</span>
                <span className="font-mono font-bold text-slate-800">{adminStatus?.adminId}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">खाते की स्थिति:</span>
                <span className="font-bold text-emerald-700">सक्रिय व सुरक्षित (Active)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">पासवर्ड प्रदर्शन:</span>
                <span className="font-mono text-slate-400">•••••••••••• (गोपनीय)</span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowChangePasswordModal(true);
                setChangePasswordError(null);
                setChangePasswordSuccess(null);
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>नया पासवर्ड व एडमिन आईडी बदलें</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: CHANGE ADMIN PASSWORD & ID ================= */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-scale-up">
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 p-5 text-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">आईडी व पासवर्ड बदलें</h3>
              </div>
              <button
                onClick={() => setShowChangePasswordModal(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  वर्तमान पासवर्ड (Current Password) *
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="वर्तमान पासवर्ड दर्ज करें"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-2.5 text-slate-400"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  नई एडमिन आईडी (New Admin ID - Optional)
                </label>
                <input
                  type="text"
                  value={newAdminId}
                  onChange={(e) => setNewAdminId(e.target.value)}
                  placeholder={`वर्तमान: ${adminStatus?.adminId}`}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  नया गुप्त पासवर्ड (New Secret Password)
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="कम से कम 4 अक्षर"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-slate-400"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  नया पासवर्ड पुनः दर्ज करें (Confirm New Password)
                </label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="वही नया पासवर्ड दोबारा डालें"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {changePasswordError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{changePasswordError}</span>
                </div>
              )}

              {changePasswordSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{changePasswordSuccess}</span>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {isChangingPassword ? 'सुरक्षित हो रहा है...' : 'पासवर्ड अपडेट करें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT EMPLOYEE DETAILS ================= */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-scale-up">
            <div className="bg-gradient-to-r from-emerald-800 to-green-800 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base">कर्मचारी विवरण संशोधन (Edit Employee)</h3>
                <p className="text-xs text-emerald-200 font-mono">आईडी: {editingEmployee.id}</p>
              </div>
              <button
                onClick={() => setEditingEmployee(null)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  कर्मचारी का नाम (अंग्रेज़ी) *
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  हिंदी नाम (Hindi Name)
                </label>
                <input
                  type="text"
                  value={editNameHindi}
                  onChange={(e) => setEditNameHindi(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    वार्ड / क्षेत्र (Ward)
                  </label>
                  <select
                    value={editWard}
                    onChange={(e) => setEditWard(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none"
                  >
                    {allWards.map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    पद / कार्य (Designation)
                  </label>
                  <input
                    type="text"
                    value={editDesignation}
                    onChange={(e) => setEditDesignation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    मोबाइल नंबर (Phone)
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    सक्रियता स्थिति (Status)
                  </label>
                  <select
                    value={editIsActive ? 'active' : 'inactive'}
                    onChange={(e) => setEditIsActive(e.target.value === 'active')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none"
                  >
                    <option value="active">सक्रिय (Active)</option>
                    <option value="inactive">निष्क्रिय (Deactivated)</option>
                  </select>
                </div>
              </div>

              {editError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                  {editError}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  रद्द करें
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditEmployee}
                  disabled={isSavingEdit}
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {isSavingEdit ? 'सुरक्षित किया जा रहा है...' : 'संशोधन सुरक्षित करें'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD NEW EMPLOYEE ================= */}
      {showAddEmployeeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-scale-up">
            <div className="bg-gradient-to-r from-emerald-800 to-green-800 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base">+ नया कर्मचारी जोड़ें (Add Employee)</h3>
                <p className="text-xs text-emerald-200">गोरखपुर नगर निगम अधिकृत रोस्टर में नया कर्मचारी जोड़ें</p>
              </div>
              <button
                onClick={() => setShowAddEmployeeModal(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    कर्मचारी कोड (Emp ID) *
                  </label>
                  <input
                    type="text"
                    value={newEmpId}
                    onChange={(e) => setNewEmpId(e.target.value.toUpperCase())}
                    placeholder="उदा. G-E801, G-755"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 uppercase focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    मोबाइल नंबर (Phone)
                  </label>
                  <input
                    type="text"
                    value={newEmpPhone}
                    onChange={(e) => setNewEmpPhone(e.target.value)}
                    placeholder="98380XXXXX"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  कर्मचारी का नाम (अंग्रेज़ी) *
                </label>
                <input
                  type="text"
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  placeholder="उदा. Ramesh Kumar"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  हिंदी नाम (Hindi Name)
                </label>
                <input
                  type="text"
                  value={newEmpNameHindi}
                  onChange={(e) => setNewEmpNameHindi(e.target.value)}
                  placeholder="उदा. रमेश कुमार"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    वार्ड (Ward)
                  </label>
                  <select
                    value={newEmpWard}
                    onChange={(e) => setNewEmpWard(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none"
                  >
                    {allWards.map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    पद / कार्य (Role)
                  </label>
                  <select
                    value={newEmpRole}
                    onChange={(e) => setNewEmpRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none"
                  >
                    <option value="मार्ग सफाई मित्र (Street Sweeper)">मार्ग सफाई मित्र</option>
                    <option value="डोर-टू-डोर सफाईकर्मी (Door-to-Door Collector)">डोर-टू-डोर सफाईकर्मी</option>
                    <option value="टिपर चालक (Tipper Driver)">टिपर चालक</option>
                    <option value="नाला गैंग सफाई मित्र (Drain Cleaner)">नाला गैंग सफाई मित्र</option>
                    <option value="वार्ड स्वच्छता पर्यवेक्षक (Ward Supervisor)">वार्ड स्वच्छता पर्यवेक्षक</option>
                  </select>
                </div>
              </div>

              {addEmpError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                  {addEmpError}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddEmployeeModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={isAddingEmp}
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {isAddingEmp ? 'जोड़ा जा रहा है...' : 'कर्मचारी जोड़ें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: FULL RESOLUTION SELFIE PREVIEW ================= */}
      {previewSelfie && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200 text-center animate-scale-up">
            <div className="p-4 bg-emerald-800 text-white flex justify-between items-center">
              <span className="font-bold text-xs uppercase tracking-wider">लाइव कैमरा सेल्फी ऑडिट</span>
              <button
                onClick={() => setPreviewSelfie(null)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <img
                src={previewSelfie.selfieDataUrl}
                alt="Selfie Audit"
                className="w-full h-72 object-cover rounded-xl border border-slate-200 shadow-sm"
              />
              <div className="mt-3 text-left bg-slate-50 p-3 rounded-xl text-xs space-y-1">
                <p className="font-bold text-slate-900">{previewSelfie.employeeName}</p>
                <p className="text-slate-500 font-mono">आईडी: {previewSelfie.employeeId}</p>
                <p className="text-slate-600">समय: {previewSelfie.formattedTime} • दिनांक: {previewSelfie.date}</p>
                <p className="text-emerald-700 font-semibold">सटीकता: ±{previewSelfie.accuracy} मीटर</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: AUDIT RECORD CORRECTION ================= */}
      {auditRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-scale-up">
            <div className="bg-gradient-to-r from-emerald-800 to-green-800 p-5 text-white flex justify-between items-center">
              <h3 className="font-bold text-base">उपस्थिति ऑडिट व सुधार (Audit Record)</h3>
              <button
                onClick={() => setAuditRecord(null)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <span className="text-slate-500 block">कर्मचारी:</span>
                <span className="font-bold text-slate-900 text-sm">{auditRecord.employeeName} ({auditRecord.employeeId})</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  उपस्थिति स्थिति बदलें (Status)
                </label>
                <select
                  value={auditStatus}
                  onChange={(e) => setAuditStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="Present">Present (उपस्थित)</option>
                  <option value="Absent">Absent (अनुपस्थित)</option>
                  <option value="Leave">Leave (अवकाश)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  ऑडिट टिप्पणी (Audit Notes / Rationale)
                </label>
                <textarea
                  value={auditNotes}
                  onChange={(e) => setAuditNotes(e.target.value)}
                  placeholder="कारण दर्ज करें (उदा. जीपीएस सत्यापित, मैन्युअल जांच उपरांत स्वीकृत)"
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAuditRecord(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  रद्द करें
                </button>
                <button
                  type="button"
                  onClick={handleSaveAudit}
                  disabled={isAuditing}
                  className="px-5 py-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {isAuditing ? 'सुरक्षित हो रहा है...' : 'ऑडिट सुरक्षित करें'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
