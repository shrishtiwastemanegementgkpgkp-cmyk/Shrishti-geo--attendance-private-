import { Employee } from '../types';

// Gorakhpur Nagar Nigam Wards
const WARDS = [
  'वार्ड 01 - गोलघर (Golghar)',
  'वार्ड 02 - सिविल लाइंस (Civil Lines)',
  'वार्ड 03 - गोरखनाथ (Gorakhnath)',
  'वार्ड 04 - राप्ती नगर (Rapti Nagar)',
  'वार्ड 05 - रुस्तमपुर (Rustampur)',
  'वार्ड 06 - बेतियाहाता (Betiahata)',
  'वार्ड 07 - असुरन (Asuran)',
  'वार्ड 08 - धर्मशाला बाजार (Dharmshala Bazar)',
  'वार्ड 09 - मोहद्दीपुर (Mohaddipur)',
  'वार्ड 10 - तारामंडल (Taramandal)',
  'वार्ड 11 - बशारतपुर (Basharatpur)',
  'वार्ड 12 - अलीनगर (Alinagar)',
  'वार्ड 13 - शाहपुर (Shahpur)',
  'वार्ड 14 - दाउदपुर (Daudpur)',
];

const ROLES = [
  'मार्ग सफाई मित्र (Street Sweeper)',
  'डोर-टू-डोर सफाईकर्मी (Door-to-Door Collector)',
  'टिपर चालक (Tipper Driver)',
  'नाला गैंग सफाई मित्र (Drain Cleaner)',
  'वार्ड स्वच्छता पर्यवेक्षक (Ward Supervisor)',
];

// Helper to generate realistic Gorakhpur Nagar Nigam employees
export function generateInitialEmployees(): Employee[] {
  const employees: Employee[] = [];

  // 1. G-E735 through G-E800 (66 authorized sanitation workers)
  const geNames: { idNum: number; name: string; nameHindi: string; roleIdx: number; wardIdx: number; phone: string }[] = [
    { idNum: 735, name: 'Hemant Tripathi', nameHindi: 'हेमंत त्रिपाठी', roleIdx: 4, wardIdx: 0, phone: '9838012301' },
    { idNum: 736, name: 'Sanjay Rawat', nameHindi: 'संजय रावत', roleIdx: 1, wardIdx: 0, phone: '9838012302' },
    { idNum: 737, name: 'Vijay Balmiki', nameHindi: 'विजय बाल्मीकि', roleIdx: 0, wardIdx: 0, phone: '9838012303' },
    { idNum: 738, name: 'Raju Gond', nameHindi: 'राजू गौड़', roleIdx: 2, wardIdx: 1, phone: '9838012304' },
    { idNum: 739, name: 'Pramod Paswan', nameHindi: 'प्रमोद पासवान', roleIdx: 0, wardIdx: 1, phone: '9838012305' },
    { idNum: 740, name: 'Imran Khan', nameHindi: 'इमरान खान', roleIdx: 1, wardIdx: 1, phone: '9838012306' },
    { idNum: 741, name: 'Mukesh Kumar', nameHindi: 'मुकेश कुमार', roleIdx: 0, wardIdx: 2, phone: '9838012307' },
    { idNum: 742, name: 'Santosh Balmiki', nameHindi: 'संतोष बाल्मीकि', roleIdx: 1, wardIdx: 2, phone: '9838012308' },
    { idNum: 743, name: 'Dinesh Prasad', nameHindi: 'दिनेश प्रसाद', roleIdx: 2, wardIdx: 2, phone: '9838012309' },
    { idNum: 744, name: 'Ramesh Yadav', nameHindi: 'रमेश यादव', roleIdx: 0, wardIdx: 3, phone: '9838012310' },
    { idNum: 745, name: 'Jaiprakash Paswan', nameHindi: 'जयप्रकाश पासवान', roleIdx: 1, wardIdx: 3, phone: '9838012311' },
    { idNum: 746, name: 'Anil Gond', nameHindi: 'अनिल गौड़', roleIdx: 3, wardIdx: 3, phone: '9838012312' },
    { idNum: 747, name: 'Sunil Balmiki', nameHindi: 'सुनील बाल्मीकि', roleIdx: 0, wardIdx: 4, phone: '9838012313' },
    { idNum: 748, name: 'Manoj Kumar', nameHindi: 'मनोज कुमार', roleIdx: 1, wardIdx: 4, phone: '9838012314' },
    { idNum: 749, name: 'Babulal Rawat', nameHindi: 'बाबूलाल रावत', roleIdx: 2, wardIdx: 4, phone: '9838012315' },
    { idNum: 750, name: 'Kamal Kishor', nameHindi: 'कमल किशोर', roleIdx: 0, wardIdx: 5, phone: '9838012316' },
    { idNum: 751, name: 'Rajendra Prasad', nameHindi: 'राजेन्द्र प्रसाद', roleIdx: 1, wardIdx: 5, phone: '9838012317' },
    { idNum: 752, name: 'Surendra Balmiki', nameHindi: 'सुरेन्द्र बाल्मीकि', roleIdx: 3, wardIdx: 5, phone: '9838012318' },
    { idNum: 753, name: 'Ajay Kumar', nameHindi: 'अजय कुमार', roleIdx: 0, wardIdx: 6, phone: '9838012319' },
    { idNum: 754, name: 'Deepak Paswan', nameHindi: 'दीपक पासवान', roleIdx: 1, wardIdx: 6, phone: '9838012320' },
    { idNum: 755, name: 'Guddu Gond', nameHindi: 'गुड्डू गौड़', roleIdx: 2, wardIdx: 6, phone: '9838012321' },
    { idNum: 756, name: 'Hariom Rawat', nameHindi: 'हरिओम रावत', roleIdx: 0, wardIdx: 7, phone: '9838012322' },
    { idNum: 757, name: 'Jagdish Balmiki', nameHindi: 'जगदीश बाल्मीकि', roleIdx: 1, wardIdx: 7, phone: '9838012323' },
    { idNum: 758, name: 'Kishun Kumar', nameHindi: 'किशुन कुमार', roleIdx: 3, wardIdx: 7, phone: '9838012324' },
    { idNum: 759, name: 'Lallan Yadav', nameHindi: 'लल्लन यादव', roleIdx: 0, wardIdx: 8, phone: '9838012325' },
    { idNum: 760, name: 'Lakhan Rawat', nameHindi: 'लखन रावत', roleIdx: 2, wardIdx: 8, phone: '9838012326' },
    { idNum: 761, name: 'Mahesh Paswan', nameHindi: 'महेश पासवान', roleIdx: 1, wardIdx: 8, phone: '9838012327' },
    { idNum: 762, name: 'Nandlal Balmiki', nameHindi: 'नंदलाल बाल्मीकि', roleIdx: 0, wardIdx: 9, phone: '9838012328' },
    { idNum: 763, name: 'Pappu Gond', nameHindi: 'पप्पू गौड़', roleIdx: 1, wardIdx: 9, phone: '9838012329' },
    { idNum: 764, name: 'Radheshyam Kumar', nameHindi: 'राधेश्याम कुमार', roleIdx: 3, wardIdx: 9, phone: '9838012330' },
    { idNum: 765, name: 'Shyamu Rawat', nameHindi: 'श्यामु रावत', roleIdx: 0, wardIdx: 10, phone: '9838012331' },
    { idNum: 766, name: 'Tribhuvan Balmiki', nameHindi: 'त्रिभुवन बाल्मीकि', roleIdx: 1, wardIdx: 10, phone: '9838012332' },
    { idNum: 767, name: 'Umesh Paswan', nameHindi: 'उमेश पासवान', roleIdx: 2, wardIdx: 10, phone: '9838012333' },
    { idNum: 768, name: 'Virendra Yadav', nameHindi: 'वीरेन्द्र यादव', roleIdx: 0, wardIdx: 11, phone: '9838012334' },
    { idNum: 769, name: 'Waseem Ahmad', nameHindi: 'वसीम अहमद', roleIdx: 1, wardIdx: 11, phone: '9838012335' },
    { idNum: 770, name: 'Munna Balmiki', nameHindi: 'मुन्ना बाल्मीकि', roleIdx: 0, wardIdx: 11, phone: '9838012336' },
    { idNum: 771, name: 'Anand Kumar', nameHindi: 'आनंद कुमार', roleIdx: 2, wardIdx: 12, phone: '9838012337' },
    { idNum: 772, name: 'Bhola Rawat', nameHindi: 'भोला रावत', roleIdx: 0, wardIdx: 12, phone: '9838012338' },
    { idNum: 773, name: 'Chhotu Balmiki', nameHindi: 'छोटू बाल्मीकि', roleIdx: 1, wardIdx: 12, phone: '9838012339' },
    { idNum: 774, name: 'Dharmendra Paswan', nameHindi: 'धर्मेन्द्र पासवान', roleIdx: 3, wardIdx: 13, phone: '9838012340' },
    { idNum: 775, name: 'Gautam Gond', nameHindi: 'गौतम गौड़', roleIdx: 0, wardIdx: 13, phone: '9838012341' },
    { idNum: 776, name: 'Harendra Kumar', nameHindi: 'हरेन्द्र कुमार', roleIdx: 1, wardIdx: 13, phone: '9838012342' },
    { idNum: 777, name: 'Indrajeet Balmiki', nameHindi: 'इन्द्रजीत बाल्मीकि', roleIdx: 2, wardIdx: 0, phone: '9838012343' },
    { idNum: 778, name: 'Jitendra Rawat', nameHindi: 'जितेन्द्र रावत', roleIdx: 0, wardIdx: 1, phone: '9838012344' },
    { idNum: 779, name: 'Kishan Paswan', nameHindi: 'किशन पासवान', roleIdx: 1, wardIdx: 2, phone: '9838012345' },
    { idNum: 780, name: 'Narsingh Gond', nameHindi: 'नरसिंह गौड़', roleIdx: 0, wardIdx: 4, phone: '9838012346' },
    { idNum: 781, name: 'Madan Balmiki', nameHindi: 'मदन बाल्मीकि', roleIdx: 1, wardIdx: 5, phone: '9838012347' },
    { idNum: 782, name: 'Naresh Kumar', nameHindi: 'नरेश कुमार', roleIdx: 3, wardIdx: 6, phone: '9838012348' },
    { idNum: 783, name: 'Pradeep Yadav', nameHindi: 'प्रदीप यादव', roleIdx: 2, wardIdx: 7, phone: '9838012349' },
    { idNum: 784, name: 'Ramlal Rawat', nameHindi: 'रामलाल रावत', roleIdx: 0, wardIdx: 8, phone: '9838012350' },
    { idNum: 785, name: 'Sitaram Balmiki', nameHindi: 'सीताराम बाल्मीकि', roleIdx: 1, wardIdx: 9, phone: '9838012351' },
    { idNum: 786, name: 'Tejbahadur Paswan', nameHindi: 'तेजबहादुर पासवान', roleIdx: 0, wardIdx: 10, phone: '9838012352' },
    { idNum: 787, name: 'Upendra Gond', nameHindi: 'उपेन्द्र गौड़', roleIdx: 2, wardIdx: 11, phone: '9838012353' },
    { idNum: 788, name: 'Vinod Balmiki', nameHindi: 'विनोद बाल्मीकि', roleIdx: 1, wardIdx: 12, phone: '9838012354' },
    { idNum: 789, name: 'Yogesh Kumar', nameHindi: 'योगेश कुमार', roleIdx: 0, wardIdx: 13, phone: '9838012355' },
    { idNum: 790, name: 'Omkar Yadav', nameHindi: 'ओमकार यादव', roleIdx: 3, wardIdx: 9, phone: '9838012356' },
    { idNum: 791, name: 'Arvind Rawat', nameHindi: 'अरविंद रावत', roleIdx: 0, wardIdx: 0, phone: '9838012357' },
    { idNum: 792, name: 'Birendra Balmiki', nameHindi: 'वीरेन्द्र बाल्मीकि', roleIdx: 1, wardIdx: 1, phone: '9838012358' },
    { idNum: 793, name: 'Chandra Prakash', nameHindi: 'चंद्र प्रकाश', roleIdx: 2, wardIdx: 2, phone: '9838012359' },
    { idNum: 794, name: 'Devendra Paswan', nameHindi: 'देवेन्द्र पासवान', roleIdx: 0, wardIdx: 3, phone: '9838012360' },
    { idNum: 795, name: 'Govind Gond', nameHindi: 'गोविंद गौड़', roleIdx: 1, wardIdx: 4, phone: '9838012361' },
    { idNum: 796, name: 'Hori Lal Balmiki', nameHindi: 'होरी लाल बाल्मीकि', roleIdx: 3, wardIdx: 5, phone: '9838012362' },
    { idNum: 797, name: 'Ishwar Dayal', nameHindi: 'ईश्वर दयाल', roleIdx: 0, wardIdx: 6, phone: '9838012363' },
    { idNum: 798, name: 'Jagdish Yadav', nameHindi: 'जगदीश यादव', roleIdx: 2, wardIdx: 7, phone: '9838012364' },
    { idNum: 799, name: 'Kamlesh Rawat', nameHindi: 'कमलेश रावत', roleIdx: 1, wardIdx: 8, phone: '9838012365' },
    { idNum: 800, name: 'Balak Ram Balmiki', nameHindi: 'बालक राम बाल्मीकि', roleIdx: 0, wardIdx: 5, phone: '9838012366' },
  ];

  geNames.forEach((item) => {
    employees.push({
      id: `G-E${item.idNum}`,
      name: item.name,
      nameHindi: item.nameHindi,
      ward: WARDS[item.wardIdx],
      designation: ROLES[item.roleIdx],
      phone: item.phone,
      isActive: true,
      addedAt: '2026-10-01T06:00:00Z',
    });
  });

  // 2. G-730 through G-750 (21 authorized sanitation staff)
  const gSeriesNames = [
    { num: 730, name: 'Subhash Balmiki', nameHindi: 'सुभाष बाल्मीकि', role: 0, ward: 0 },
    { num: 731, name: 'Pawan Kumar', nameHindi: 'पवन कुमार', role: 1, ward: 1 },
    { num: 732, name: 'Radhe Mohan', nameHindi: 'राधे मोहन', role: 2, ward: 2 },
    { num: 733, name: 'Shambhu Paswan', nameHindi: 'शम्भू पासवान', role: 0, ward: 3 },
    { num: 734, name: 'Tuntun Rawat', nameHindi: 'टुनटुन रावत', role: 3, ward: 4 },
    { num: 735, name: 'Vimal Gond', nameHindi: 'विमल गौड़', role: 1, ward: 5 },
    { num: 736, name: 'Akhilesh Yadav', nameHindi: 'अखिलेश यादव', role: 0, ward: 6 },
    { num: 737, name: 'Birju Balmiki', nameHindi: 'बिरजू बाल्मीकि', role: 2, ward: 7 },
    { num: 738, name: 'Chhedi Lal', nameHindi: 'छेदी लाल', role: 1, ward: 8 },
    { num: 739, name: 'Dinanath Rawat', nameHindi: 'दीनानाथ रावत', role: 0, ward: 9 },
    { num: 740, name: 'Guddu Paswan', nameHindi: 'गुड्डू पासवान', role: 3, ward: 10 },
    { num: 741, name: 'Heera Lal Balmiki', nameHindi: 'हीरा लाल बाल्मीकि', role: 0, ward: 11 },
    { num: 742, name: 'Indresh Kumar', nameHindi: 'इन्द्रेश कुमार', role: 1, ward: 12 },
    { num: 743, name: 'Jhinkan Rawat', nameHindi: 'झिनकन रावत', role: 2, ward: 13 },
    { num: 744, name: 'Kailash Gond', nameHindi: 'कैलाश गौड़', role: 0, ward: 0 },
    { num: 745, name: 'Lallan Balmiki', nameHindi: 'लल्लन बाल्मीकि', role: 1, ward: 1 },
    { num: 746, name: 'Mangal Paswan', nameHindi: 'मंगल पासवान', role: 3, ward: 2 },
    { num: 747, name: 'Nankau Rawat', nameHindi: 'ननकऊ रावत', role: 0, ward: 3 },
    { num: 748, name: 'Paltu Yadav', nameHindi: 'पलटू यादव', role: 2, ward: 4 },
    { num: 749, name: 'Ramkripal Balmiki', nameHindi: 'रामकृपाल बाल्मीकि', role: 1, ward: 5 },
    { num: 750, name: 'Sitaram Gond', nameHindi: 'सीताराम गौड़', role: 0, ward: 6 },
  ];

  gSeriesNames.forEach((item) => {
    employees.push({
      id: `G-${item.num}`,
      name: item.name,
      nameHindi: item.nameHindi,
      ward: WARDS[item.ward],
      designation: ROLES[item.role],
      phone: `9838099${item.num}`,
      isActive: true,
      addedAt: '2026-10-01T06:00:00Z',
    });
  });

  return employees;
}
