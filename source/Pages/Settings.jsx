import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Globe, Palette, User, Check, Loader2,
  CheckCircle, LogOut, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { LanguageProvider, useLanguage } from '@/components/LanguageContext';

const languages = [
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' }
];

const themes = [
  { key: 'light', label: 'Light', colors: ['#ffffff', '#f3f4f6', '#e5e7eb'] },
  { key: 'dark', label: 'Dark', colors: ['#1f2937', '#111827', '#0f172a'] }
];

function SettingsContent() {
  const { t, language, setLanguage } = useLanguage();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('light');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      if (userData.preferred_language) {
        setLanguage(userData.preferred_language);
      }
      if (userData.theme) {
        setCurrentTheme(userData.theme);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const updateSetting = async (key, value) => {
    setSaving(true);
    try {
      await base44.auth.updateMe({ [key]: value });
      if (key === 'preferred_language') {
        setLanguage(value);
      }
      if (key === 'theme') {
        setCurrentTheme(value);
      }
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">{t('settings')}</h1>
            {saving && <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Profile section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                {user?.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="text-white">
                <h2 className="text-xl font-bold">{user?.full_name || 'User'}</h2>
                <p className="text-white/80">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-50 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">{t('activated')}</span>
            <Sparkles className="w-4 h-4 text-yellow-500" />
          </div>
        </motion.div>

        {/* Language section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t('language')}</h2>
              <p className="text-sm text-gray-500">Wählen Sie Ihre bevorzugte Sprache</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {languages.map((lang) => (
              <motion.button
                key={lang.code}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => updateSetting('preferred_language', lang.code)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  language === lang.code
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">{lang.flag}</div>
                <div className="font-medium text-gray-900">{lang.name}</div>
                {language === lang.code && (
                  <Check className="w-4 h-4 text-indigo-600 mt-2 mx-auto" />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Theme section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Palette className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t('theme')}</h2>
              <p className="text-sm text-gray-500">Passen Sie das Erscheinungsbild an</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {themes.map((theme) => (
              <motion.button
                key={theme.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => updateSetting('theme', theme.key)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  currentTheme === theme.key
                    ? 'border-indigo-500'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex gap-1 mb-3">
                  {theme.colors.map((color, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-lg first:rounded-l-xl last:rounded-r-xl"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="font-medium text-gray-900 text-left">
                  {theme.key === 'light' ? t('light') : t('dark')}
                </div>
                {currentTheme === theme.key && (
                  <Check className="w-4 h-4 text-indigo-600 mt-2" />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full h-14 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
          >
            <LogOut className="w-5 h-5 mr-2" />
            {t('logout')}
          </Button>
        </motion.div>
      </main>
    </div>
  );
}

export default function Settings() {
  const [userLanguage, setUserLanguage] = useState('de');
  
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const user = await base44.auth.me();
        if (user.preferred_language) {
          setUserLanguage(user.preferred_language);
        }
      } catch (err) {}
    };
    loadLanguage();
  }, []);

  return (
    <LanguageProvider initialLanguage={userLanguage}>
      <SettingsContent />
    </LanguageProvider>
  );
}
