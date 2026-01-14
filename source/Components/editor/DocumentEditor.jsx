import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Save, Bold, Italic, Underline, 
  AlignLeft, AlignCenter, AlignRight, List, ListOrdered,
  Loader2, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '../LanguageContext';
import { base44 } from '@/api/base44Client';
import ReactQuill from 'react-quill';
import { debounce } from 'lodash';

export default function DocumentEditor({ document, onBack, onUpdate }) {
  const { t } = useLanguage();
  const [title, setTitle] = useState(document.title || '');
  const [content, setContent] = useState(document.content || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link'],
      ['clean']
    ],
  };

  const saveDocument = useCallback(
    debounce(async (newTitle, newContent) => {
      setSaving(true);
      try {
        await base44.entities.Document.update(document.id, {
          title: newTitle,
          content: newContent,
          last_modified: new Date().toISOString()
        });
        setSaved(true);
        if (onUpdate) onUpdate();
      } catch (err) {
        console.error(err);
      }
      setSaving(false);
    }, 1000),
    [document.id]
  );

  useEffect(() => {
    setSaved(false);
    saveDocument(title, content);
  }, [title, content]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-semibold border-none shadow-none focus-visible:ring-0 w-64 md:w-96"
                placeholder={t('untitled')}
              />
            </div>

            <div className="flex items-center gap-3">
              {saving ? (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('saving')}
                </div>
              ) : saved ? (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <Check className="w-4 h-4" />
                  {t('saved')}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg min-h-[600px] overflow-hidden"
        >
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            className="h-full"
            style={{ minHeight: '600px' }}
          />
        </motion.div>
      </div>
    </div>
  );
}
