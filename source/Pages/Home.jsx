import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Table, Presentation, Plus, Search, Star, Clock, 
  Settings, Grid, List, Loader2, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LanguageProvider, useLanguage } from '@/components/LanguageContext';
import ActivationModal from '@/components/activation/ActivationModal';
import DocumentCard from '@/components/documents/DocumentCard';
import CreateDocumentModal from '@/components/documents/CreateDocumentModal';
import DocumentEditor from '@/components/editor/DocumentEditor';
import SpreadsheetEditor from '@/components/editor/SpreadsheetEditor';
import PresentationEditor from '@/components/editor/PresentationEditor';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

function HomeContent() {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showActivation, setShowActivation] = useState(false);
  const [createType, setCreateType] = useState(null);
  const [editingDocument, setEditingDocument] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [activeFilter, setActiveFilter] = useState('all');
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      if (!userData.is_activated) {
        setShowActivation(true);
      }
    } catch (err) {
      console.error(err);
      // User not logged in - redirect to login
      base44.auth.redirectToLogin();
      return;
    }
    setLoading(false);
  };

  const { data: documents = [], isLoading: docsLoading, refetch } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.filter({ created_by: user?.email }, '-last_modified'),
    enabled: !!user?.email && !showActivation,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Document.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['documents'])
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Document.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['documents'])
  });

  const handleToggleFavorite = (doc) => {
    updateMutation.mutate({ id: doc.id, data: { is_favorite: !doc.is_favorite } });
  };

  const handleDelete = (doc) => {
    if (confirm(t('delete') + '?')) {
      deleteMutation.mutate(doc.id);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      activeFilter === 'all' ||
      (activeFilter === 'favorites' && doc.is_favorite) ||
      (activeFilter === 'documents' && doc.type === 'document') ||
      (activeFilter === 'spreadsheets' && doc.type === 'spreadsheet') ||
      (activeFilter === 'presentations' && doc.type === 'presentation');
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (showActivation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100">
        <ActivationModal onActivated={() => {
          setShowActivation(false);
          loadUser();
        }} />
      </div>
    );
  }

  if (editingDocument) {
    const EditorComponent = {
      document: DocumentEditor,
      spreadsheet: SpreadsheetEditor,
      presentation: PresentationEditor
    }[editingDocument.type];

    return (
      <EditorComponent
        document={editingDocument}
        onBack={() => {
          setEditingDocument(null);
          refetch();
        }}
        onUpdate={refetch}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                OfficeSuite
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden sm:block">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search')}
                  className="pl-10 w-64 bg-gray-50 border-gray-200 focus:bg-white"
                />
              </div>
              <Link to={createPageUrl('Settings')}>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Settings className="w-5 h-5 text-gray-600" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('welcome').split(' ')[0]}, {user?.full_name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-gray-500">{t('createFirst')}</p>
        </motion.div>

        {/* Create new section */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('create')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { type: 'document', icon: FileText, label: t('newDocument'), gradient: 'from-blue-500 to-indigo-600' },
              { type: 'spreadsheet', icon: Table, label: t('newSpreadsheet'), gradient: 'from-green-500 to-emerald-600' },
              { type: 'presentation', icon: Presentation, label: t('newPresentation'), gradient: 'from-orange-500 to-red-500' }
            ].map((item) => (
              <motion.button
                key={item.type}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCreateType(item.type)}
                className={`group relative bg-gradient-to-br ${item.gradient} p-6 rounded-2xl text-left text-white overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                <item.icon className="w-10 h-10 mb-3" />
                <h3 className="font-semibold text-lg">{item.label}</h3>
                <Plus className="absolute bottom-4 right-4 w-6 h-6 opacity-50 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { key: 'all', label: t('allDocuments'), icon: Grid },
              { key: 'favorites', label: t('favorites'), icon: Star },
              { key: 'documents', label: t('documents'), icon: FileText },
              { key: 'spreadsheets', label: t('spreadsheets'), icon: Table },
              { key: 'presentations', label: t('presentations'), icon: Presentation }
            ].map((filter) => (
              <Button
                key={filter.key}
                variant={activeFilter === filter.key ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveFilter(filter.key)}
                className={`flex items-center gap-2 whitespace-nowrap ${
                  activeFilter === filter.key 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <filter.icon className="w-4 h-4" />
                {filter.label}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-gray-100' : ''}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-gray-100' : ''}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Documents grid */}
        {docsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : filteredDocuments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noDocuments')}</h3>
            <p className="text-gray-500">{t('createFirst')}</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-3'
            }
          >
            {filteredDocuments.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <DocumentCard
                  document={doc}
                  onClick={() => setEditingDocument(doc)}
                  onDelete={handleDelete}
                  onToggleFavorite={handleToggleFavorite}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      {/* Create modal */}
      <AnimatePresence>
        {createType && (
          <CreateDocumentModal
            type={createType}
            onClose={() => setCreateType(null)}
            onCreated={(doc) => {
              setCreateType(null);
              setEditingDocument(doc);
              refetch();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  const [userLanguage, setUserLanguage] = useState('de');
  
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const user = await base44.auth.me();
        if (user.preferred_language) {
          setUserLanguage(user.preferred_language);
        }
      } catch (err) {
        // User not logged in - redirect to login
        base44.auth.redirectToLogin();
      }
    };
    loadLanguage();
  }, []);

  return (
    <LanguageProvider initialLanguage={userLanguage}>
      <HomeContent />
    </LanguageProvider>
  );
}
