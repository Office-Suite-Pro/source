import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Table, Presentation, Star, MoreVertical, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '../LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const typeIcons = {
  document: FileText,
  spreadsheet: Table,
  presentation: Presentation
};

const typeColors = {
  document: 'from-blue-500 to-indigo-600',
  spreadsheet: 'from-green-500 to-emerald-600',
  presentation: 'from-orange-500 to-red-500'
};

export default function DocumentCard({ document, onClick, onDelete, onToggleFavorite }) {
  const { t } = useLanguage();
  const Icon = typeIcons[document.type] || FileText;
  const gradient = typeColors[document.type] || typeColors.document;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100"
      onClick={onClick}
    >
      <div className={`h-32 bg-gradient-to-br ${gradient} p-6 relative`}>
        <Icon className="w-12 h-12 text-white/90" />
        <div className="absolute top-4 right-4 flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(document);
            }}
            className={`p-2 rounded-full transition-colors ${
              document.is_favorite
                ? 'bg-yellow-400 text-yellow-900'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Star className="w-4 h-4" fill={document.is_favorite ? 'currentColor' : 'none'} />
          </motion.button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <button className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onDelete(document);
              }} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                {t('delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-gray-900 truncate mb-1">
          {document.title || t('untitled')}
        </h3>
        <p className="text-sm text-gray-500">
          {document.last_modified 
            ? format(new Date(document.last_modified), 'dd.MM.yyyy HH:mm')
            : format(new Date(document.created_date), 'dd.MM.yyyy HH:mm')
          }
        </p>
      </div>
    </motion.div>
  );
}
