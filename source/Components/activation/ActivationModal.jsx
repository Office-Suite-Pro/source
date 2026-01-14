import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Loader2, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '../LanguageContext';
import { base44 } from '@/api/base44Client';

export default function ActivationModal({ onActivated }) {
  const { t } = useLanguage();
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [purchasedKey, setPurchasedKey] = useState('');

  const handleActivate = async () => {
    if (!key.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Find the key
      const keys = await base44.entities.ProductKey.filter({ key: key.trim().toUpperCase() });
      
      if (keys.length === 0) {
        setError(t('invalidKey'));
        setLoading(false);
        return;
      }

      const productKey = keys[0];
      
      if (productKey.is_used) {
        setError(t('keyUsed'));
        setLoading(false);
        return;
      }

      // Mark key as used
      const user = await base44.auth.me();
      await base44.entities.ProductKey.update(productKey.id, {
        is_used: true,
        used_by: user.email,
        used_at: new Date().toISOString()
      });

      // Update user as activated
      await base44.auth.updateMe({
        is_activated: true,
        activated_at: new Date().toISOString()
      });

      setSuccess(true);
      setTimeout(() => {
        onActivated();
      }, 1500);
    } catch (err) {
      setError(t('invalidKey'));
    }
    
    setLoading(false);
  };

  const handlePurchase = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Find an unused key
      const availableKeys = await base44.entities.ProductKey.filter({ is_used: false });
      
      if (availableKeys.length === 0) {
        setError('Keine Produktschlüssel mehr verfügbar');
        setLoading(false);
        return;
      }

      const selectedKey = availableKeys[0];
      const user = await base44.auth.me();

      // Mark key as used
      await base44.entities.ProductKey.update(selectedKey.id, {
        is_used: true,
        used_by: user.email,
        used_at: new Date().toISOString()
      });

      // Update user as activated
      await base44.auth.updateMe({
        is_activated: true,
        activated_at: new Date().toISOString()
      });

      setPurchasedKey(selectedKey.key);
      setSuccess(true);
      setTimeout(() => {
        onActivated();
      }, 2500);
    } catch (err) {
      setError('Fehler beim Kauf');
    }
    
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 text-white text-center">
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 10 }}
            transition={{ repeat: Infinity, repeatType: 'reverse', duration: 2 }}
            className="inline-block"
          >
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Key className="w-10 h-10" />
            </div>
          </motion.div>
          <h2 className="text-2xl font-bold mb-2">{t('activationRequired')}</h2>
          <p className="text-white/80 text-sm">{t('activationDesc')}</p>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 10 }}
                >
                  <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                </motion.div>
                <p className="text-xl font-semibold text-gray-800">{t('activationSuccess')}</p>
                {purchasedKey && (
                  <div className="mt-4 p-3 bg-gray-100 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Ihr Produktschlüssel:</p>
                    <p className="font-mono text-lg text-gray-900">{purchasedKey}</p>
                  </div>
                )}
                <Sparkles className="w-6 h-6 text-yellow-500 mx-auto mt-2 animate-pulse" />
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('productKey')}
                    </label>
                    <Input
                      value={key}
                      onChange={(e) => setKey(e.target.value.toUpperCase())}
                      placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
                      className="text-center text-lg tracking-widest font-mono h-14 border-2 focus:border-indigo-500"
                      maxLength={23}
                    />
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-xl"
                    >
                      <XCircle className="w-5 h-5" />
                      <span className="text-sm">{error}</span>
                    </motion.div>
                  )}

                  <Button
                    onClick={handleActivate}
                    disabled={loading || key.length < 10}
                    className="w-full h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg font-medium rounded-xl"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Key className="w-5 h-5 mr-2" />
                        {t('activateNow')}
                      </>
                    )}
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">oder</span>
                    </div>
                  </div>

                  <Button
                    onClick={handlePurchase}
                    disabled={loading}
                    variant="outline"
                    className="w-full h-14 border-2 border-green-600 text-green-600 hover:bg-green-50 text-lg font-medium rounded-xl"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Produktschlüssel kaufen
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
