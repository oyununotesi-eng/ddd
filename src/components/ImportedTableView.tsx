import React from 'react';
import { ImportedTable } from '../data/spreadsheets';

interface ImportedTableViewProps {
  title: string;
  table: ImportedTable;
}

export const ImportedTableView: React.FC<ImportedTableViewProps> = ({ title, table }) => (
  <section className="mt-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
    <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <div>
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-400 mt-1">Kaynak: {table.sourceFile} · Son güncelleme: {new Date(table.importedAt).toLocaleString()}</p>
      </div>
      <span className="text-xs font-semibold text-slate-500">{table.rows.length} kayıt</span>
    </div>
    <div className="overflow-auto max-h-[70vh]">
      <table className="min-w-full text-left text-xs">
        <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500">
          <tr>{table.headers.map((header, index) => <th key={`${header}-${index}`} className="px-4 py-3 whitespace-nowrap font-bold">{header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {table.rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-slate-50/70">
              {table.headers.map((_, columnIndex) => <td key={columnIndex} className="px-4 py-3 text-slate-700 whitespace-nowrap">{row[columnIndex] || '—'}</td>)}
            </tr>
          ))}
          {table.rows.length === 0 && <tr><td colSpan={table.headers.length} className="p-8 text-center text-slate-400">Bu dosyada kayıt yok.</td></tr>}
        </tbody>
      </table>
    </div>
  </section>
);
