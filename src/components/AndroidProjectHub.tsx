import React, { useState } from 'react';
import { Smartphone, Download, Code2, CheckCircle2, Terminal, Copy, Check, ShieldCheck } from 'lucide-react';
import { ANDROID_FILES } from '../data/androidProjectSource';

export const AndroidProjectHub: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<keyof typeof ANDROID_FILES>('MainActivity.kt');
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(ANDROID_FILES[selectedFile]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([ANDROID_FILES[selectedFile]], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Overview Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-cyan-100 text-cyan-800 rounded-xl flex items-center justify-center font-bold">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Native Android Kotlin & Jetpack Compose Source Code
              </h2>
              <p className="text-xs text-slate-500">
                CameraX फ्रंट कैमरा + FusedLocationProviderClient हाई-एक्यूरेसी जीपीएस
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadFile}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{selectedFile} डाउनलोड करें</span>
            </button>
          </div>
        </div>

        {/* Build instructions summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <h3 className="font-bold text-slate-800 flex items-center space-x-1.5">
              <Terminal className="w-4 h-4 text-emerald-600" />
              <span>तरीका 1: Android Studio में APK कम्पाइल करें</span>
            </h3>
            <ol className="list-decimal pl-4 space-y-1 text-slate-600">
              <li>Android Studio (Hedgehog या नया) खोलें और प्रोजेक्ट इम्पोर्ट करें।</li>
              <li>Gradle Sync पूरा होने दें (Kotlin 2.0 & Jetpack Compose)।</li>
              <li>मेन्यू बार में Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s) पर क्लिक करें।</li>
              <li>कम्पाइल की गई APK <code className="bg-slate-200 px-1 rounded">app/build/outputs/apk/release/</code> में तैयार मिलेगी।</li>
            </ol>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <h3 className="font-bold text-slate-800 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-600" />
              <span>तरीका 2: GitHub Actions 1-Click Cloud APK Build</span>
            </h3>
            <ol className="list-decimal pl-4 space-y-1 text-slate-600">
              <li>प्रोजेक्ट को किसी भी GitHub रिपॉजिटरी में पुश करें।</li>
              <li>शामिल <code className="bg-slate-200 px-1 rounded">.github/workflows/build-apk.yml</code> अपने आप रन होगा।</li>
              <li>GitHub Runner पर JDK 17 के साथ <code className="bg-slate-200 px-1 rounded">./gradlew assembleRelease</code> चलेगा।</li>
              <li>Actions Summary पेज से हस्ताक्षरित .apk फाइल सीधे डाउनलोड करें।</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Code Viewer */}
      <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-800">
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex space-x-1 overflow-x-auto scrollbar-none">
            {Object.keys(ANDROID_FILES).map((fileName) => (
              <button
                key={fileName}
                onClick={() => setSelectedFile(fileName as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                  selectedFile === fileName
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {fileName}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopyCode}
            className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'कॉपी हो गया' : 'कोड कॉपी करें'}</span>
          </button>
        </div>

        <pre className="p-4 sm:p-6 text-emerald-300 font-mono text-xs overflow-x-auto max-h-[500px] leading-relaxed">
          <code>{ANDROID_FILES[selectedFile]}</code>
        </pre>
      </div>
    </div>
  );
};
