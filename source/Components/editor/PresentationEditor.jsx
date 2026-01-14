import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Loader2, Check, Trash2, ChevronLeft, ChevronRight, Play, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '../LanguageContext';
import { base44 } from '@/api/base44Client';
import { debounce } from 'lodash';

const BACKGROUNDS = [
  '#ffffff', '#1e293b', '#0f172a', '#312e81', '#7c3aed', '#059669',
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
];

export default function PresentationEditor({ document, onBack, onUpdate }) {
  const { t } = useLanguage();
  const [title, setTitle] = useState(document.title || '');
  const [data, setData] = useState(() => {
    try {
      return JSON.parse(document.content);
    } catch {
      return { slides: [{ id: 1, title: '', content: '', background: '#ffffff' }] };
    }
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPresenting, setIsPresenting] = useState(false);

  const saveDocument = useCallback(
    debounce(async (newTitle, newData) => {
      setSaving(true);
      try {
        await base44.entities.Document.update(document.id, {
          title: newTitle,
          content: JSON.stringify(newData),
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
    saveDocument(title, data);
  }, [title, data]);

  const updateSlide = (index, field, value) => {
    const newSlides = [...data.slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setData({ ...data, slides: newSlides });
  };

  const addSlide = () => {
    const newSlide = {
      id: Date.now(),
      title: '',
      content: '',
      background: '#ffffff'
    };
    setData({ ...data, slides: [...data.slides, newSlide] });
    setCurrentSlide(data.slides.length);
  };

  const deleteSlide = (index) => {
    if (data.slides.length <= 1) return;
    const newSlides = data.slides.filter((_, i) => i !== index);
    setData({ ...data, slides: newSlides });
    if (currentSlide >= newSlides.length) {
      setCurrentSlide(newSlides.length - 1);
    }
  };

  const currentSlideData = data.slides[currentSlide];

  // Presentation mode
  if (isPresenting) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: currentSlideData?.background || '#ffffff' }}
        onClick={() => {
          if (currentSlide < data.slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
          } else {
            setIsPresenting(false);
          }
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="text-center max-w-4xl px-8"
          >
            <h1 className={`text-6xl font-bold mb-8 ${
              currentSlideData?.background?.includes('#ffffff') || currentSlideData?.background === '#ffffff'
                ? 'text-gray-900'
                : 'text-white'
            }`}>
              {currentSlideData?.title || t('untitled')}
            </h1>
            <p className={`text-2xl whitespace-pre-wrap ${
              currentSlideData?.background?.includes('#ffffff') || currentSlideData?.background === '#ffffff'
                ? 'text-gray-700'
                : 'text-white/80'
            }`}>
              {currentSlideData?.content}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
          <span className="text-white/60 text-sm bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
            {currentSlide + 1} / {data.slides.length}
          </span>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); setIsPresenting(false); }}
          className="fixed top-4 right-4 text-white/60 hover:text-white text-sm bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm"
        >
          ESC
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-full mx-auto px-4 py-3">
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
                className="text-xl font-semibold border-none shadow-none focus-visible:ring-0 w-64"
                placeholder={t('untitled')}
              />
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={addSlide} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                {t('addSlide')}
              </Button>
              <Button onClick={() => setIsPresenting(true)} className="bg-gradient-to-r from-orange-500 to-red-500">
                <Play className="w-4 h-4 mr-1" />
                {t('presentations')}
              </Button>
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

      <div className="flex">
        {/* Slide thumbnails */}
        <div className="w-48 bg-white border-r border-gray-200 p-4 space-y-3 overflow-y-auto" style={{ height: 'calc(100vh - 65px)' }}>
          {data.slides.map((slide, index) => (
            <motion.div
              key={slide.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setCurrentSlide(index)}
              className={`aspect-video rounded-lg cursor-pointer relative group overflow-hidden ${
                index === currentSlide ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-200'
              }`}
              style={{ background: slide.background }}
            >
              <div className="absolute inset-0 p-2">
                <p className={`text-[8px] font-medium truncate ${
                  slide.background?.includes('#ffffff') || slide.background === '#ffffff'
                    ? 'text-gray-900'
                    : 'text-white'
                }`}>
                  {slide.title || t('untitled')}
                </p>
              </div>
              <div className="absolute bottom-1 left-1 text-[10px] text-gray-500 bg-white/80 px-1 rounded">
                {index + 1}
              </div>
              {data.slides.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); deleteSlide(index); }}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </motion.div>
          ))}
        </div>

        {/* Main editor */}
        <div className="flex-1 p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto"
          >
            {/* Slide preview */}
            <div
              className="aspect-video rounded-2xl shadow-2xl mb-6 p-12 flex flex-col justify-center items-center"
              style={{ background: currentSlideData?.background || '#ffffff' }}
            >
              <Input
                value={currentSlideData?.title || ''}
                onChange={(e) => updateSlide(currentSlide, 'title', e.target.value)}
                placeholder={t('title')}
                className={`text-4xl md:text-5xl font-bold text-center border-none bg-transparent shadow-none focus-visible:ring-0 mb-6 ${
                  currentSlideData?.background?.includes('#ffffff') || currentSlideData?.background === '#ffffff'
                    ? 'text-gray-900 placeholder:text-gray-400'
                    : 'text-white placeholder:text-white/50'
                }`}
              />
              <Textarea
                value={currentSlideData?.content || ''}
                onChange={(e) => updateSlide(currentSlide, 'content', e.target.value)}
                placeholder="..."
                className={`text-xl text-center border-none bg-transparent shadow-none focus-visible:ring-0 resize-none min-h-[100px] ${
                  currentSlideData?.background?.includes('#ffffff') || currentSlideData?.background === '#ffffff'
                    ? 'text-gray-700 placeholder:text-gray-400'
                    : 'text-white/80 placeholder:text-white/30'
                }`}
              />
            </div>

            {/* Background picker */}
            <div className="flex items-center gap-3 justify-center">
              <span className="text-sm text-gray-600">{t('theme')}:</span>
              <div className="flex gap-2">
                {BACKGROUNDS.map((bg, i) => (
                  <button
                    key={i}
                    onClick={() => updateSlide(currentSlide, 'background', bg)}
                    className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 ${
                      currentSlideData?.background === bg ? 'border-blue-500 scale-110' : 'border-gray-200'
                    }`}
                    style={{ background: bg }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
