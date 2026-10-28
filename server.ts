import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'node:crypto';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import { generateInitialEmployees } from './src/data/initialEmployees.ts';
import { getSampleAttendanceRecords } from './src/data/sampleAttendance.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DB_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Ensure db directory
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Password hashing helpers using standard crypto
function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, generatedSalt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt: generatedSalt };
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  const calculated = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(calculated, 'hex'));
}

// Database schema initialization
interface DBData {
  adminAccount: {
    adminId: string;
    displayName: string;
    passwordHash: string;
    salt: string;
    isRegistered: boolean;
    lastLogin?: string;
    createdAt: string;
    updatedAt: string;
  };
  employees: any[];
  attendance: any[];
  holidays: any[];
  leaves: any[];
}

function initDB(): DBData {
  const initialEmployees = generateInitialEmployees();
  const sampleAttendance = getSampleAttendanceRecords();

  // Initial admin setup: Admin can register custom ID and secret password
  // Default unconfigured state or initial default with salt & hash
  const initialSalt = crypto.randomBytes(16).toString('hex');
  const defaultHash = crypto.pbkdf2Sync('admin@gorakhpur', initialSalt, 10000, 64, 'sha512').toString('hex');

  const defaultDB: DBData = {
    adminAccount: {
      adminId: 'shrishti_admin',
      displayName: 'Shrishti Nagar Nigam Admin',
      passwordHash: defaultHash,
      salt: initialSalt,
      isRegistered: false, // will turn true when user registers their custom credentials
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    employees: initialEmployees,
    attendance: sampleAttendance,
    holidays: [
      { id: 'hol-1', date: '2026-10-02', name: 'Gandhi Jayanti' },
      { id: 'hol-2', date: '2026-10-24', name: 'Diwali' },
      { id: 'hol-3', date: '2026-11-05', name: 'Govardhan Puja' },
    ],
    leaves: [],
  };

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2), 'utf-8');
    return defaultDB;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    let modified = false;

    // Ensure all employees exist
    if (!parsed.employees || parsed.employees.length === 0) {
      parsed.employees = initialEmployees;
      modified = true;
    }

    // Ensure G-E735 to G-E800 are all present
    const existingIds = new Set(parsed.employees.map((e: any) => e.id));
    initialEmployees.forEach((emp) => {
      if (!existingIds.has(emp.id)) {
        parsed.employees.push(emp);
        modified = true;
      }
    });

    if (!parsed.attendance) {
      parsed.attendance = sampleAttendance;
      modified = true;
    }

    if (!parsed.adminAccount) {
      parsed.adminAccount = defaultDB.adminAccount;
      modified = true;
    }

    if (!parsed.holidays) {
      parsed.holidays = defaultDB.holidays;
      modified = true;
    }

    if (!parsed.leaves) {
      parsed.leaves = [];
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    }

    return parsed;
  } catch (err) {
    console.error('Error reading db.json, restoring default', err);
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2), 'utf-8');
    return defaultDB;
  }
}

let db = initDB();

function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save db.json:', err);
  }
}

// Middleware
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// ---------------- API ROUTES ----------------

// Health
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    system: 'Shrishti GPS Attendance API',
    employeesCount: db.employees.length,
    attendanceCount: db.attendance.length,
    adminRegistered: db.adminAccount.isRegistered,
  });
});

// Admin Status (CRITICAL: NEVER EXPOSE PASSWORD OR HASH)
app.get('/api/admin/status', (_req: Request, res: Response) => {
  res.json({
    isRegistered: db.adminAccount.isRegistered,
    adminId: db.adminAccount.adminId,
    displayName: db.adminAccount.displayName,
    lastLogin: db.adminAccount.lastLogin,
    updatedAt: db.adminAccount.updatedAt,
  });
});

// Admin Registration / Setup: Set custom Admin ID & Password
// "Aur admin ka new registration I'd aur password chnge krne ka option ho"
app.post('/api/admin/register', (req: Request, res: Response) => {
  const { adminId, password, displayName } = req.body;

  if (!adminId || typeof adminId !== 'string' || adminId.trim().length < 3) {
    res.status(400).json({ error: 'एडमिन आईडी कम से कम 3 अक्षरों की होनी चाहिए।' });
    return;
  }
  if (!password || typeof password !== 'string' || password.trim().length < 4) {
    res.status(400).json({ error: 'पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।' });
    return;
  }

  const trimmedId = adminId.trim();
  const trimmedName = displayName ? displayName.trim() : 'Shrishti Admin';
  const { hash, salt } = hashPassword(password.trim());

  db.adminAccount = {
    adminId: trimmedId,
    displayName: trimmedName,
    passwordHash: hash,
    salt,
    isRegistered: true,
    createdAt: db.adminAccount.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveDB();

  // Return success without password or hash!
  res.json({
    success: true,
    message: 'एडमिन खाता और पासवर्ड सफलतापूर्वक पंजीकृत कर दिया गया है।',
    admin: {
      adminId: db.adminAccount.adminId,
      displayName: db.adminAccount.displayName,
      isRegistered: true,
    },
  });
});

// Admin Login: Authenticates ONLY using registered Admin ID and Password
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { adminId, password } = req.body;

  if (!adminId || !password) {
    res.status(400).json({ error: 'कृपया एडमिन आईडी और पासवर्ड दर्ज करें।' });
    return;
  }

  const trimmedId = String(adminId).trim();
  const inputPassword = String(password).trim();

  // Match admin ID
  if (db.adminAccount.adminId.toLowerCase() !== trimmedId.toLowerCase()) {
    res.status(401).json({ error: 'अमान्य एडमिन आईडी! कृपया सही पंजीकृत आईडी दर्ज करें।' });
    return;
  }

  // Verify secure hash
  const isValid = verifyPassword(inputPassword, db.adminAccount.passwordHash, db.adminAccount.salt);
  if (!isValid) {
    res.status(401).json({ error: 'गलत पासवर्ड! कृपया अपना सही पंजीकृत पासवर्ड दर्ज करें।' });
    return;
  }

  // Update last login
  db.adminAccount.lastLogin = new Date().toISOString();
  saveDB();

  // Issue session token
  const sessionToken = crypto.randomBytes(24).toString('hex');

  res.json({
    success: true,
    token: sessionToken,
    message: 'एडमिन लॉगिन सफल।',
    admin: {
      adminId: db.adminAccount.adminId,
      displayName: db.adminAccount.displayName,
      isRegistered: db.adminAccount.isRegistered,
    },
  });
});

// Admin Change Password / ID
// "aur password chnge krne ka option ho taki jo passward hm registration kar de usme se hi sadmin open kr k puri report dekh sake aur Admin password kisi k pass show na ho"
app.post('/api/admin/change-password', (req: Request, res: Response) => {
  const { currentPassword, newAdminId, newPassword, displayName } = req.body;

  if (!currentPassword) {
    res.status(400).json({ error: 'वर्तमान पासवर्ड दर्ज करना अनिवार्य है।' });
    return;
  }

  // Verify current password
  const isCurrentValid = verifyPassword(
    String(currentPassword).trim(),
    db.adminAccount.passwordHash,
    db.adminAccount.salt
  );

  if (!isCurrentValid) {
    res.status(401).json({ error: 'वर्तमान पासवर्ड गलत है! पासवर्ड बदलने के लिए सही वर्तमान पासवर्ड डालें।' });
    return;
  }

  if (newPassword && String(newPassword).trim().length < 4) {
    res.status(400).json({ error: 'नया पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।' });
    return;
  }

  if (newAdminId && String(newAdminId).trim().length < 3) {
    res.status(400).json({ error: 'नई एडमिन आईडी कम से कम 3 अक्षरों की होनी चाहिए।' });
    return;
  }

  if (newAdminId && String(newAdminId).trim()) {
    db.adminAccount.adminId = String(newAdminId).trim();
  }

  if (displayName && String(displayName).trim()) {
    db.adminAccount.displayName = String(displayName).trim();
  }

  if (newPassword && String(newPassword).trim()) {
    const { hash, salt } = hashPassword(String(newPassword).trim());
    db.adminAccount.passwordHash = hash;
    db.adminAccount.salt = salt;
    db.adminAccount.isRegistered = true;
  }

  db.adminAccount.updatedAt = new Date().toISOString();
  saveDB();

  res.json({
    success: true,
    message: 'एडमिन आईडी और पासवर्ड सफलतापूर्वक बदल दिया गया है। भविष्य में इसी पासवर्ड से लॉगिन होगा।',
    admin: {
      adminId: db.adminAccount.adminId,
      displayName: db.adminAccount.displayName,
      isRegistered: true,
    },
  });
});

// Employees Master: Get all
app.get('/api/employees', (_req: Request, res: Response) => {
  res.json(db.employees);
});

// Employee Lookup by ID (Case-insensitive)
app.get('/api/employees/:id', (req: Request, res: Response) => {
  const queryId = req.params.id.trim().toUpperCase();
  const emp = db.employees.find((e: any) => e.id.toUpperCase() === queryId);
  if (!emp) {
    res.status(404).json({ error: 'कर्मचारी आईडी अधिकृत सूची में नहीं मिली।' });
    return;
  }
  res.json(emp);
});

// Add New Employee
app.post('/api/employees', (req: Request, res: Response) => {
  const { id, name, nameHindi, ward, designation, phone } = req.body;
  if (!id || !name) {
    res.status(400).json({ error: 'कर्मचारी कोड और नाम अनिवार्य हैं।' });
    return;
  }

  const cleanId = String(id).trim().toUpperCase();
  const existingIndex = db.employees.findIndex((e: any) => e.id.toUpperCase() === cleanId);
  if (existingIndex >= 0) {
    res.status(409).json({ error: `कर्मचारी कोड ${cleanId} पहले से मौजूद है। विवरण बदलने के लिए "सुधारें" (Edit) विकल्प चुनें।` });
    return;
  }

  const newEmp = {
    id: cleanId,
    name: String(name).trim(),
    nameHindi: nameHindi ? String(nameHindi).trim() : String(name).trim(),
    ward: ward ? String(ward).trim() : 'वार्ड 01 - गोलघर (Golghar)',
    designation: designation ? String(designation).trim() : 'मार्ग सफाई मित्र (Street Sweeper)',
    phone: phone ? String(phone).trim() : '',
    isActive: true,
    addedAt: new Date().toISOString(),
  };

  db.employees.unshift(newEmp);
  saveDB();
  res.status(201).json(newEmp);
});

// Edit Existing Employee details (Fix wrong name, ward, designation, phone)
app.put('/api/employees/:id', (req: Request, res: Response) => {
  const empId = req.params.id.trim().toUpperCase();
  const { name, nameHindi, ward, designation, phone, isActive } = req.body;

  const index = db.employees.findIndex((e: any) => e.id.toUpperCase() === empId);
  if (index === -1) {
    res.status(404).json({ error: 'कर्मचारी नहीं मिला।' });
    return;
  }

  const target = db.employees[index];
  if (name !== undefined) target.name = String(name).trim();
  if (nameHindi !== undefined) target.nameHindi = String(nameHindi).trim();
  if (ward !== undefined) target.ward = String(ward).trim();
  if (designation !== undefined) target.designation = String(designation).trim();
  if (phone !== undefined) target.phone = String(phone).trim();
  if (isActive !== undefined) target.isActive = Boolean(isActive);

  // Also sync updated employee name in existing attendance records for consistency
  db.attendance.forEach((rec: any) => {
    if (rec.employeeId.toUpperCase() === empId) {
      rec.employeeName = `${target.name} (${target.nameHindi || ''})`;
      rec.ward = target.ward;
    }
  });

  saveDB();
  res.json({ success: true, employee: target });
});

// Bulk Import or Reset G-E735 to G-E800 Employees
app.post('/api/employees/bulk', (req: Request, res: Response) => {
  const { employees, mode } = req.body;

  if (mode === 'reset-ge-series') {
    const initialList = generateInitialEmployees();
    const geOnly = initialList.filter((e) => e.id.startsWith('G-E'));
    const existingOther = db.employees.filter((e: any) => !e.id.startsWith('G-E'));
    db.employees = [...geOnly, ...existingOther];
    saveDB();
    res.json({
      success: true,
      count: geOnly.length,
      message: `G-E735 से G-E800 के सभी 66 कर्मचारी सफलतापूर्वक लोड व सिंक कर दिए गए हैं।`,
      employees: db.employees,
    });
    return;
  }

  if (!Array.isArray(employees) || employees.length === 0) {
    res.status(400).json({ error: 'अमान्य कर्मचारी सूची डेटा।' });
    return;
  }

  let addedCount = 0;
  let updatedCount = 0;

  employees.forEach((emp: any) => {
    if (!emp.id || !emp.name) return;
    const cleanId = String(emp.id).trim().toUpperCase();
    const existing = db.employees.find((e: any) => e.id.toUpperCase() === cleanId);
    if (existing) {
      existing.name = String(emp.name).trim();
      if (emp.nameHindi) existing.nameHindi = String(emp.nameHindi).trim();
      if (emp.ward) existing.ward = String(emp.ward).trim();
      if (emp.designation) existing.designation = String(emp.designation).trim();
      if (emp.phone) existing.phone = String(emp.phone).trim();
      updatedCount++;
    } else {
      db.employees.push({
        id: cleanId,
        name: String(emp.name).trim(),
        nameHindi: emp.nameHindi ? String(emp.nameHindi).trim() : String(emp.name).trim(),
        ward: emp.ward ? String(emp.ward).trim() : 'वार्ड 01 - गोलघर (Golghar)',
        designation: emp.designation ? String(emp.designation).trim() : 'मार्ग सफाई मित्र (Street Sweeper)',
        phone: emp.phone ? String(emp.phone).trim() : '',
        isActive: true,
        addedAt: new Date().toISOString(),
      });
      addedCount++;
    }
  });

  saveDB();
  res.json({
    success: true,
    addedCount,
    updatedCount,
    total: db.employees.length,
    message: `${addedCount} नए कर्मचारी जोड़े गए, ${updatedCount} अपडेट किए गए।`,
  });
});

// Attendance: Get all attendance records
app.get('/api/attendance', (req: Request, res: Response) => {
  const { date, employeeId } = req.query;
  let records = db.attendance;

  if (date && typeof date === 'string') {
    records = records.filter((r: any) => r.date === date);
  }
  if (employeeId && typeof employeeId === 'string') {
    const qId = employeeId.trim().toUpperCase();
    records = records.filter((r: any) => r.employeeId.toUpperCase() === qId);
  }

  res.json(records);
});

// Mark Attendance (Field Employee Submission)
app.post('/api/attendance', (req: Request, res: Response) => {
  const { employeeId, selfieDataUrl, latitude, longitude, accuracy } = req.body;

  if (!employeeId) {
    res.status(400).json({ error: 'कर्मचारी आईडी अनिवार्य है।' });
    return;
  }

  const cleanId = String(employeeId).trim().toUpperCase();
  const employee = db.employees.find((e: any) => e.id.toUpperCase() === cleanId);

  if (!employee) {
    res.status(403).json({ error: `कर्मचारी आईडी "${cleanId}" अधिकृत सूची में पंजीकृत नहीं है। केवल अधिकृत कर्मचारी ही हाजिरी लगा सकते हैं।` });
    return;
  }

  if (!employee.isActive) {
    res.status(403).json({ error: `कर्मचारी आईडी "${cleanId}" वर्तमान में निष्क्रिय (Deactivated) है। कृपया सुपरवाइज़र से संपर्क करें।` });
    return;
  }

  if (!selfieDataUrl || !selfieDataUrl.startsWith('data:image/')) {
    res.status(400).json({ error: 'लाइव कैमरे से ली गई सेल्फी फोटो अनिवार्य है। गैलरी से अपलोड मान्य नहीं है।' });
    return;
  }

  if (latitude === undefined || longitude === undefined) {
    res.status(400).json({ error: 'जीपीएस लोकेशन प्राप्त नहीं हो सकी। कृपया फोन का GPS/Location ऑन करें।' });
    return;
  }

  // Calculate today's date in local Gorakhpur (IST)
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  // Prevent duplicate punch today!
  const alreadyPunched = db.attendance.find(
    (r: any) => r.employeeId.toUpperCase() === cleanId && r.date === dateStr
  );

  if (alreadyPunched) {
    res.status(409).json({
      error: `आपकी उपस्थिति आज (${dateStr}) पहले ही ${alreadyPunched.formattedTime || 'दर्ज'} हो चुकी है। एक कर्मचारी दिन में केवल एक बार ही हाजिरी लगा सकता है।`,
      record: alreadyPunched,
    });
    return;
  }

  const numAccuracy = parseFloat(accuracy) || 10;
  const isFlagged = numAccuracy > 50;
  const flagReason = isFlagged ? `कमज़ोर जीपीएस सिग्नल (सटीकता ${numAccuracy} मीटर > 50 मीटर)` : undefined;

  const timeString = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const record = {
    id: `att-${cleanId.toLowerCase()}-${Date.now()}`,
    employeeId: employee.id,
    employeeName: `${employee.name} (${employee.nameHindi || ''})`,
    ward: employee.ward,
    date: dateStr,
    timestamp: now.toISOString(),
    formattedTime: timeString,
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    accuracy: numAccuracy,
    selfieDataUrl,
    status: 'Present',
    isFlagged,
    flagReason,
  };

  db.attendance.unshift(record);
  saveDB();

  res.status(201).json({
    success: true,
    message: 'उपस्थिति सफलतापूर्वक दर्ज हो गई है!',
    record,
  });
});

// Audit Correction (Admin changes status or adds notes)
app.patch('/api/attendance/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, auditNotes, correctedBy } = req.body;

  const record = db.attendance.find((r: any) => r.id === id);
  if (!record) {
    res.status(404).json({ error: 'उपस्थिति रिकॉर्ड नहीं मिला।' });
    return;
  }

  if (status) record.status = status;
  if (auditNotes !== undefined) record.auditNotes = auditNotes;
  if (correctedBy) record.correctedBy = correctedBy;

  saveDB();
  res.json({ success: true, record });
});

// Holidays & Leaves
app.get('/api/holidays', (_req: Request, res: Response) => res.json(db.holidays));
app.post('/api/holidays', (req: Request, res: Response) => {
  const { date, name } = req.body;
  if (!date || !name) {
    res.status(400).json({ error: 'दिनांक और अवकाश का नाम अनिवार्य है।' });
    return;
  }
  const item = { id: `hol-${Date.now()}`, date, name };
  db.holidays.push(item);
  saveDB();
  res.status(201).json(item);
});

app.get('/api/leaves', (_req: Request, res: Response) => res.json(db.leaves));
app.post('/api/leaves', (req: Request, res: Response) => {
  const { employeeId, date, reason } = req.body;
  if (!employeeId || !date) {
    res.status(400).json({ error: 'कर्मचारी आईडी और दिनांक अनिवार्य है।' });
    return;
  }
  const item = { id: `leave-${Date.now()}`, employeeId: employeeId.toUpperCase(), date, reason: reason || 'Approved' };
  db.leaves.push(item);
  saveDB();
  res.status(201).json(item);
});

// Setup Vite development server or static serving
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      if (res.headersSent) return;
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
