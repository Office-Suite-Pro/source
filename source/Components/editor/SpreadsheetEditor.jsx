import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Loader2, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '../LanguageContext';
import { base44 } from '@/api/base44Client';
import { debounce } from 'lodash';

export default function SpreadsheetEditor({ document, onBack, onUpdate }) {
  const { t } = useLanguage();
  const [title, setTitle] = useState(document.title || '');
  const [data, setData] = useState(() => {
    try {
      return JSON.parse(document.content);
    } catch {
      return { rows: Array(10).fill().map(() => Array(8).fill('')), columnWidths: Array(8).fill(100) };
    }
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const [selectedCell, setSelectedCell] = useState(null);
  const [formulaInput, setFormulaInput] = useState('');

  const columns = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

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

  const updateCell = (rowIndex, colIndex, value) => {
    const newRows = [...data.rows];
    newRows[rowIndex] = [...newRows[rowIndex]];
    newRows[rowIndex][colIndex] = value;
    setData({ ...data, rows: newRows });
  };

  const addRow = () => {
    setData({
      ...data,
      rows: [...data.rows, Array(data.rows[0]?.length || 8).fill('')]
    });
  };

  const addColumn = () => {
    setData({
      ...data,
      rows: data.rows.map(row => [...row, '']),
      columnWidths: [...data.columnWidths, 100]
    });
  };

  const evaluateFormula = (formula, rowIndex, colIndex) => {
    if (!formula.startsWith('=')) return formula;
    
    try {
      let expr = formula.substring(1);
      
      // Replace cell references with values
      expr = expr.replace(/([A-Z])(\d+)/gi, (match, col, row) => {
        const cIdx = col.toUpperCase().charCodeAt(0) - 65;
        const rIdx = parseInt(row) - 1;
        const val = data.rows[rIdx]?.[cIdx] || 0;
        return isNaN(parseFloat(val)) ? 0 : parseFloat(val);
      });

      // Handle SUM function
      if (expr.toUpperCase().startsWith('SUM(')) {
        const range = expr.match(/SUM\(([A-Z])(\d+):([A-Z])(\d+)\)/i);
        if (range) {
          const [, startCol, startRow, endCol, endRow] = range;
          let sum = 0;
          const startC = startCol.toUpperCase().charCodeAt(0) - 65;
          const endC = endCol.toUpperCase().charCodeAt(0) - 65;
          const startR = parseInt(startRow) - 1;
          const endR = parseInt(endRow) - 1;
          
          for (let r = startR; r <= endR; r++) {
            for (let c = startC; c <= endC; c++) {
              const val = parseFloat(data.rows[r]?.[c]) || 0;
              sum += val;
            }
          }
          return sum;
        }
      }

      // Evaluate simple math
      return eval(expr);
    } catch {
      return '#ERROR';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
              <Button variant="outline" size="sm" onClick={addColumn}>
                <Plus className="w-4 h-4 mr-1" />
                {t('addColumn')}
              </Button>
              <Button variant="outline" size="sm" onClick={addRow}>
                <Plus className="w-4 h-4 mr-1" />
                {t('addRow')}
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

        {/* Formula bar */}
        {selectedCell && (
          <div className="px-4 py-2 bg-gray-50 border-t flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600 w-12">
              {columns[selectedCell.col]}{selectedCell.row + 1}
            </span>
            <Input
              value={formulaInput}
              onChange={(e) => setFormulaInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateCell(selectedCell.row, selectedCell.col, formulaInput);
                  setSelectedCell(null);
                }
              }}
              className="flex-1 h-8 text-sm"
              placeholder={t('formula')}
            />
          </div>
        )}
      </div>

      {/* Spreadsheet */}
      <div className="p-4 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden inline-block min-w-full"
        >
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="w-12 h-10 bg-gray-100 border border-gray-200 text-xs text-gray-500 font-medium sticky left-0 z-10"></th>
                {data.rows[0]?.map((_, colIndex) => (
                  <th
                    key={colIndex}
                    className="h-10 bg-gray-100 border border-gray-200 text-xs text-gray-600 font-medium px-2"
                    style={{ minWidth: data.columnWidths[colIndex] || 100 }}
                  >
                    {columns[colIndex]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="w-12 h-8 bg-gray-100 border border-gray-200 text-xs text-gray-600 font-medium text-center sticky left-0">
                    {rowIndex + 1}
                  </td>
                  {row.map((cell, colIndex) => (
                    <td
                      key={colIndex}
                      className={`h-8 border border-gray-200 p-0 ${
                        selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                          ? 'ring-2 ring-blue-500 ring-inset'
                          : ''
                      }`}
                      style={{ minWidth: data.columnWidths[colIndex] || 100 }}
                    >
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                        onFocus={() => {
                          setSelectedCell({ row: rowIndex, col: colIndex });
                          setFormulaInput(cell);
                        }}
                        className="w-full h-full px-2 text-sm border-none outline-none bg-transparent"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  );
}
