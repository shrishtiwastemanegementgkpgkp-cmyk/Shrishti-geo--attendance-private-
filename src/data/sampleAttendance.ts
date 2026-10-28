import { AttendanceRecord } from '../types';

// Gorakhpur locations near Golghar, Civil Lines, Gorakhnath Temple, Rapti Nagar
export function getSampleAttendanceRecords(): AttendanceRecord[] {
  const today = new Date().toISOString().split('T')[0];

  // SVG placeholder face selfies encoded into base64 data URIs so there are no broken images
  const createAvatarDataUrl = (initials: string, color: string) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${color}" />
          <stop offset="100%" stop-color="#1e293b" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="url(#bg)"/>
      <circle cx="100" cy="75" r="38" fill="#f8fafc" opacity="0.95"/>
      <path d="M 40 180 C 40 135, 70 120, 100 120 C 130 120, 160 135, 160 180 Z" fill="#f8fafc" opacity="0.95"/>
      <circle cx="88" cy="70" r="5" fill="#334155"/>
      <circle cx="112" cy="70" r="5" fill="#334155"/>
      <path d="M 90 88 Q 100 96 110 88" stroke="#334155" stroke-width="3" fill="none" stroke-linecap="round"/>
      <rect x="20" y="15" width="160" height="24" rx="12" fill="#059669" opacity="0.9"/>
      <text x="100" y="32" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">LIVE VERIFIED</text>
      <text x="100" y="165" font-family="sans-serif" font-size="14" font-weight="bold" fill="#15803d" text-anchor="middle">${initials}</text>
    </svg>`;
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  };

  return [
    {
      id: `att-ge735-${today}`,
      employeeId: 'G-E735',
      employeeName: 'Hemant Tripathi (हेमंत त्रिपाठी)',
      ward: 'वार्ड 01 - गोलघर (Golghar)',
      date: today,
      timestamp: `${today}T06:35:14Z`,
      formattedTime: '06:35 AM',
      latitude: 26.7588,
      longitude: 83.3697,
      accuracy: 6.4,
      selfieDataUrl: createAvatarDataUrl('HT', '#0f766e'),
      status: 'Present',
      isFlagged: false,
    },
    {
      id: `att-ge736-${today}`,
      employeeId: 'G-E736',
      employeeName: 'Sanjay Rawat (संजय रावत)',
      ward: 'वार्ड 01 - गोलघर (Golghar)',
      date: today,
      timestamp: `${today}T06:42:20Z`,
      formattedTime: '06:42 AM',
      latitude: 26.7602,
      longitude: 83.3712,
      accuracy: 8.1,
      selfieDataUrl: createAvatarDataUrl('SR', '#0369a1'),
      status: 'Present',
      isFlagged: false,
    },
    {
      id: `att-ge738-${today}`,
      employeeId: 'G-E738',
      employeeName: 'Raju Gond (राजू गौड़)',
      ward: 'वार्ड 02 - सिविल लाइंस (Civil Lines)',
      date: today,
      timestamp: `${today}T06:55:08Z`,
      formattedTime: '06:55 AM',
      latitude: 26.7511,
      longitude: 83.3824,
      accuracy: 12.3,
      selfieDataUrl: createAvatarDataUrl('RG', '#4338ca'),
      status: 'Present',
      isFlagged: false,
    },
    {
      id: `att-ge745-${today}`,
      employeeId: 'G-E745',
      employeeName: 'Jaiprakash Paswan (जयप्रकाश पासवान)',
      ward: 'वार्ड 04 - राप्ती नगर (Rapti Nagar)',
      date: today,
      timestamp: `${today}T07:10:45Z`,
      formattedTime: '07:10 AM',
      latitude: 26.7821,
      longitude: 83.3912,
      accuracy: 54.2, // > 50m accuracy triggers a flag
      selfieDataUrl: createAvatarDataUrl('JP', '#b45309'),
      status: 'Present',
      isFlagged: true,
      flagReason: 'कमज़ोर जीपीएस सिग्नल (Accuracy > 50m: 54.2m)',
    },
    {
      id: `att-ge750-${today}`,
      employeeId: 'G-E750',
      employeeName: 'Kamal Kishor (कमल किशोर)',
      ward: 'वार्ड 06 - बेतियाहाता (Betiahata)',
      date: today,
      timestamp: `${today}T07:22:19Z`,
      formattedTime: '07:22 AM',
      latitude: 26.7445,
      longitude: 83.3615,
      accuracy: 9.8,
      selfieDataUrl: createAvatarDataUrl('KK', '#15803d'),
      status: 'Present',
      isFlagged: false,
    },
  ];
}
