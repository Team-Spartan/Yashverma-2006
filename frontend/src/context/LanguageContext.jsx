import React, { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    appTitle: "JalDrishti",
    appSubtitle: "Rural Water Quality Monitoring & Issue Reporting System",
    overview: "Overview Dashboard",
    waterLogs: "Water Test Logs",
    issueReports: "Issue Reports",
    trends: "Trend Analytics",
    adminPanel: "Admin Oversight",
    brandDetails: "Brand & Team G Info",
    totalLogs: "Total Water Tests",
    safeWaterPct: "Safe Drinking Water",
    pendingIssues: "Active Contamination Issues",
    avgWQI: "Average WQI Index",
    addLog: "Log Water Test",
    reportIssue: "Report Issue",
    searchPlaceholder: "Search sources, villages, reporters...",
    safetySafe: "Safe",
    safetyWarning: "Warning",
    safetyHazardous: "Hazardous",
    language: "Hindi / हिंदी",
    roleAdmin: "District Admin / Official",
    roleWorker: "Village Representative / Health Worker",
    roleMember: "Community Resident",
    switchRole: "Switch Role",
    quickActions: "Quick Operational Actions",
    recentAlerts: "Critical Health Alerts"
  },
  hi: {
    appTitle: "जलदृष्टि",
    appSubtitle: "ग्रामीण जल गुणवत्ता निगरानी एवं समस्या निवारण प्रणाली",
    overview: "मुख्य डैशबोर्ड",
    waterLogs: "जल परीक्षण लॉग",
    issueReports: "समस्या रिपोर्ट",
    trends: "ट्रेंड विश्लेषण (चार्ट्स)",
    adminPanel: "प्रशासनिक निगरानी",
    brandDetails: "ब्रांड एवं टीम विवरण",
    totalLogs: "कुल जल परीक्षण",
    safeWaterPct: "सुरक्षित पेयजल %",
    pendingIssues: "सक्रिय दूषित जल मामले",
    avgWQI: "औसत जल गुणवत्ता सूचकांक (WQI)",
    addLog: "जल परीक्षण दर्ज करें",
    reportIssue: "समस्या की रिपोर्ट करें",
    searchPlaceholder: "स्रोत, गांव या रिपोर्टर खोजें...",
    safetySafe: "सुरक्षित",
    safetyWarning: "चेतावनी",
    safetyHazardous: "खतरनाक",
    language: "English",
    roleAdmin: "जिला अधिकारी / एडमिन",
    roleWorker: "ग्राम प्रतिनिधि / स्वास्थ्य कार्यकर्ता",
    roleMember: "ग्रामीण नागरिक",
    switchRole: "भूमिका बदलें",
    quickActions: "त्वरित कार्रवाई",
    recentAlerts: "गंभीर स्वास्थ्य चेतावनी"
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('en');

  const toggleLanguage = () => {
    setLang(prev => (prev === 'en' ? 'hi' : 'en'));
  };

  const t = (key) => {
    return translations[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
