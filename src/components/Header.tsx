import React from 'react';
import { Shield, Smartphone, QrCode, Lock, CheckCircle2, RefreshCw } from 'lucide-react';

interface HeaderProps {
  activeTab: 'field' | 'admin' | 'android';
  setActiveTab: (tab: 'field' | 'admin' | 'android') => void;
  isAdminLoggedIn: boolean;
  onLogoutAdmin: () => void;
  onOpenQr: () => void;
  onInstallPwa?: () => void;
  canInstallPwa?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isAdminLoggedIn,
  onLogoutAdmin,
  onOpenQr,
  onInstallPwa,
  canInstallPwa,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-emerald-800 via-green-800 to-teal-900 text-white shadow-lg border-b border-emerald-600/30">
      {/* Top organization banner */}
      <div className="bg-emerald-950/80 px-4 py-1 text-xs text-emerald-200 border-b border-emerald-800/60 flex items-center justify-between">
        <div className="flex items-center space-x-2 truncate">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold tracking-wide truncate">
            सृष्टि वेस्ट मैनेजमेंट सर्विसेज • गोरखपुर नगर निगम, उत्तर प्रदेश
          </span>
        </div>
        <div className="hidden sm:flex items-center space-x-4 text-emerald-300">
          <span>GPS & Live Camera Attendance System</span>
          <span className="bg-emerald-900/90 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-mono border border-emerald-700/50">
            G-730 — G-E990 Master
          </span>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('field')}>
          <div className="w-11 h-11 rounded-xl bg-white p-1.5 shadow-md flex items-center justify-center ring-2 ring-emerald-400/50">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <rect width="100" height="100" rx="20" fill="#15803d" />
              <path d="M50 20 C62 20 70 30 70 42 C70 58 50 80 50 80 C50 80 30 58 30 42 C30 30 38 20 50 20 Z" fill="#ffffff" />
              <circle cx="50" cy="42" r="10" fill="#15803d" />
              <path d="M46 42 L49 45 L55 39" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-tight">
                Shrishti GPS Attendance
              </h1>
              <span className="bg-emerald-500/30 text-emerald-100 text-[11px] px-2 py-0.5 rounded-full font-medium border border-emerald-400/40">
                Gorakhpur
              </span>
            </div>
            <p className="text-xs text-emerald-100/90 font-medium">
              सृष्टि जीपीएस उपस्थिति प्रणाली (स्वच्छ गोरखपुर)
            </p>
          </div>
        </div>

        {/* Quick Actions (Install & QR) */}
        <div className="flex items-center space-x-2">
          {canInstallPwa && onInstallPwa && (
            <button
              onClick={onInstallPwa}
              className="hidden sm:inline-flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs shadow-md transition"
              title="फोन में इंस्टॉल करें"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>फ़ोन में इंस्टॉल करें</span>
            </button>
          )}

          <button
            onClick={onOpenQr}
            className="inline-flex items-center space-x-1 bg-emerald-700/60 hover:bg-emerald-600/70 border border-emerald-500/50 px-2.5 py-1.5 rounded-lg text-xs font-medium text-emerald-100 transition"
            title="मोबाइल क्यूआर कोड"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">QR स्कैन</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex border-t border-emerald-700/50 space-x-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('field')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap ${
            activeTab === 'field'
              ? 'border-emerald-300 text-white bg-emerald-700/30 font-bold'
              : 'border-transparent text-emerald-200 hover:text-white hover:bg-emerald-800/40'
          }`}
        >
          <Smartphone className="w-4 h-4 text-emerald-300" />
          <span>कर्मचारी हाजिरी (Field Attendance)</span>
        </button>

        <button
          onClick={() => setActiveTab('admin')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap ${
            activeTab === 'admin'
              ? 'border-emerald-300 text-white bg-emerald-700/30 font-bold'
              : 'border-transparent text-emerald-200 hover:text-white hover:bg-emerald-800/40'
          }`}
        >
          <Shield className="w-4 h-4 text-amber-300" />
          <span>एडमिन पोर्टल (Admin Portal)</span>
          {isAdminLoggedIn && (
            <span className="w-2 h-2 rounded-full bg-emerald-400" title="लॉगिन है" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('android')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap ${
            activeTab === 'android'
              ? 'border-emerald-300 text-white bg-emerald-700/30 font-bold'
              : 'border-transparent text-emerald-200 hover:text-white hover:bg-emerald-800/40'
          }`}
        >
          <Smartphone className="w-4 h-4 text-cyan-300" />
          <span>Android APK व कोड (Native APK Hub)</span>
        </button>

        {isAdminLoggedIn && (
          <div className="ml-auto flex items-center py-1.5 pl-2">
            <button
              onClick={onLogoutAdmin}
              className="text-xs text-rose-200 hover:text-white bg-rose-900/60 hover:bg-rose-800 border border-rose-700/60 px-2.5 py-1 rounded transition flex items-center space-x-1"
            >
              <Lock className="w-3 h-3" />
              <span>लॉगआउट</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
