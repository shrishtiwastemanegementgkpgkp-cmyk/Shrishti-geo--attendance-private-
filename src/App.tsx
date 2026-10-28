/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { EmployeeAttendanceView } from './components/EmployeeAttendanceView';
import { AdminDashboard } from './components/AdminDashboard';
import { AndroidProjectHub } from './components/AndroidProjectHub';
import { MobileQrModal } from './components/MobileQrModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { usePWAInstall } from './hooks/usePWAInstall';
import { AdminAccount } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'field' | 'admin' | 'android'>('field');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState<Partial<AdminAccount> | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // PWA install support
  const { isInstallable, isInstalled, triggerInstall } = usePWAInstall();

  // Handle successful Admin Login
  const handleLoginSuccess = (admin: Partial<AdminAccount>) => {
    setIsAdminLoggedIn(true);
    setAdminUser(admin);
  };

  // Handle Admin Logout
  const handleLogoutAdmin = () => {
    setIsAdminLoggedIn(false);
    setAdminUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* 1-Click PWA Installation Banner */}
      <PWAInstallBanner
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        onInstall={triggerInstall}
      />

      {/* Main Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdminLoggedIn={isAdminLoggedIn}
        onLogoutAdmin={handleLogoutAdmin}
        onOpenQr={() => setIsQrModalOpen(true)}
        canInstallPwa={isInstallable}
        onInstallPwa={triggerInstall}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'field' && (
          <EmployeeAttendanceView
            onAttendanceSubmitted={() => {
              // Can switch or notify
            }}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            isLoggedIn={isAdminLoggedIn}
            onLoginSuccess={handleLoginSuccess}
            onLogout={handleLogoutAdmin}
          />
        )}

        {activeTab === 'android' && <AndroidProjectHub />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 text-center text-xs border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-300">
            सृष्टि वेस्ट मैनेजमेंट सर्विसेज • नगर निगम गोरखपुर, उत्तर प्रदेश
          </p>
          <p className="text-[11px] text-slate-500">
            जीपीएस अक्षांश, देशांतर, लाइव फ्रंट सेल्फी एवं डुप्लीकेट पंच रोकथाम प्रणाली • स्वच्छ सर्वेक्षण 2026
          </p>
          <div className="pt-2 text-[10px] text-slate-600 flex justify-center space-x-4">
            <span>Gorakhpur Central: 26.7588° N, 83.3697° E</span>
            <span>•</span>
            <span>PBKDF2 SHA-512 Encrypted Security</span>
            <span>•</span>
            <span>Excel 9-Column Standard</span>
          </div>
        </div>
      </footer>

      {/* Mobile QR Modal */}
      <MobileQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />
    </div>
  );
}
