import React from 'react';
import { Smartphone, Download, X, Sparkles } from 'lucide-react';

interface PWAInstallBannerProps {
  onInstall: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  onInstall,
  isInstallable,
  isInstalled,
}) => {
  const [dismissed, setDismissed] = React.useState(false);

  if (isInstalled || dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 text-slate-950 px-4 py-2.5 shadow-md flex items-center justify-between gap-3 text-xs">
      <div className="flex items-center space-x-2.5">
        <div className="p-1.5 bg-black/15 rounded-lg shrink-0">
          <Smartphone className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="font-bold text-white block sm:inline mr-1">
            📱 एंड्रॉइड मोबाइल में ऐप इंस्टॉल करें:
          </span>
          <span className="text-amber-100">
            फुल स्क्रीन, ऑफलाइन सपोर्ट और बिना ब्राउज़र बार के सीधे फोन पर चलाएं।
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2 shrink-0">
        <button
          onClick={onInstall}
          className="bg-slate-950 hover:bg-black text-amber-300 font-bold px-3 py-1.5 rounded-lg transition active:scale-95 flex items-center space-x-1 shadow-sm text-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>सीधे फोन में इंस्टॉल करें</span>
        </button>

        <button
          onClick={() => setDismissed(true)}
          className="text-white/80 hover:text-white p-1 rounded-lg"
          title="बंद करें"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
