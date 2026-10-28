import React from 'react';
import { X, Smartphone, Copy, Check, ExternalLink } from 'lucide-react';

interface MobileQrModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileQrModal: React.FC<MobileQrModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const currentUrl = window.location.origin;
  // Use a reliable QR code image generator service
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
    currentUrl
  )}&margin=10&color=15-128-61`;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200 text-center animate-scale-up">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-green-800 p-5 text-white flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-emerald-300" />
            <h3 className="font-bold text-sm sm:text-base">मोबाइल पर ऐप खोलें</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600">
            अपने मोबाइल के कैमरे या <strong>Google Lens</strong> से इस QR कोड को स्कैन करें और सीधे ऐप खोलें:
          </p>

          <div className="inline-block p-3 bg-slate-50 border-2 border-emerald-500 rounded-2xl shadow-inner">
            <img
              src={qrImageUrl}
              alt="Mobile App QR Code"
              className="w-48 h-48 mx-auto rounded-xl"
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-left">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
              ऐप वेब लिंक (App Web Link)
            </span>
            <div className="flex items-center justify-between text-xs font-mono text-emerald-800 truncate">
              <span className="truncate pr-2">{currentUrl}</span>
              <button
                onClick={handleCopy}
                className="shrink-0 p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg transition"
                title="लिंक कॉपी करें"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            * फोन पर खुलने के बाद <strong>"Add to Home screen"</strong> पर टैप करके ऐप की तरह चलाएं।
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition"
          >
            समझ गया (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
