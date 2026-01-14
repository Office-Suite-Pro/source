import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Table, Presentation, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '../LanguageContext';
import { base44 } from '@/api/base44Client';

export default function CreateDocumentModal({ type, onClose, onCreated }) {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const typeConfig = {
    document: {
      icon: FileText,
      gradient: 'from-blue-500 to-indigo-600',
      label: t('newDocument'),
      defaultContent: '<p></p>'
    },
    spreadsheet: {
      icon: Table,
      gradient: 'from-green-500 to-emerald-600',
      label: t('newSpreadsheet'),
      defaultContent: JSON.stringify({
        rows: Array(10).fill().map(() => Array(8).fill('')),
        columnWidths: Array(8).fill(100)
      })
    },
    presentation: {
      icon: Presentation,
      gradient: 'from-orange-500 to-red-500',
      label: t('newPresentation'),
      defaultContent: JSON.stringify({
        slides: [{ id: 1, title: '', content: '', background: '#ffffff' }]
      })
    }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  const handleCreate = async () => {
    setLoading(true);
    try {
      const doc = await base44.entities.Document.create({
        title: title || t('untitled'),
        type: type,
        content: config.defaultContent,
        last_modified: new Date().toISOString(),
        is_favorite: false
      });
      onCreated(doc);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        <div className={`bg-gradient-to-br ${config.gradient} p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Icon className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold">{config.label}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('title')}
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('untitled')}
              className="h-12"
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12"
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={loading}
              className={`flex-1 h-12 bg-gradient-to-r ${config.gradient} hover:opacity-90`}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                t('create')
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
