'use client';

import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Inbox } from 'lucide-react';

export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  totalItems = 0,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  actions,
  filterComponent,
  emptyMessage = 'No records found.',
  className = '',
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (onSearchChange) {
      onSearchChange(val);
    }
  };

  const handleSort = (key) => {
    if (sortColumn === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(key);
      setSortDirection('asc');
    }
  };

  // Client-side sorting if not handled externally
  const sortedData = React.useMemo(() => {
    if (!sortColumn) return data;
    return [...data].sort((a, b) => {
      let aVal = a[sortColumn];
      let bVal = b[sortColumn];
      if (aVal === undefined || aVal === null) aVal = '';
      if (bVal === undefined || bVal === null) bVal = '';

      if (typeof aVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(String(bVal))
          : String(bVal).localeCompare(aVal);
      }
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [data, sortColumn, sortDirection]);

  return (
    <div
      className={`flex flex-col rounded-3xl border border-[#D4AF37]/25 bg-slate-900/80 backdrop-blur-xl shadow-xl overflow-hidden transition-all text-white ${className}`}
    >
      {/* Top Action Bar */}
      <div className="flex flex-col gap-3 p-4 sm:p-5 border-b border-slate-800 sm:flex-row sm:items-center sm:justify-between bg-slate-900/90">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#D4AF37]" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder={searchPlaceholder}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 py-2 pl-9.5 pr-4 text-xs font-semibold text-white placeholder-slate-400 focus:border-[#D4AF37] focus:outline-hidden focus:ring-2 focus:ring-[#D4AF37]/20 shadow-xs transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {filterComponent}
          {actions}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-[10px] font-extrabold uppercase tracking-wider text-[#D4AF37] border-b border-slate-800">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key || col.header}
                  scope="col"
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`px-5 py-4 whitespace-nowrap ${
                    col.sortable ? 'cursor-pointer hover:bg-slate-900 hover:text-[#F3E5AB] select-none' : ''
                  } ${col.headerClassName || ''}`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <ArrowUpDown className="h-3 w-3 text-slate-400 hover:text-[#D4AF37]" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {loading ? (
              // Skeleton loading rows
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {columns.map((_, c) => (
                    <td key={c} className="px-5 py-4">
                      <div className="h-4 w-3/4 bg-slate-800 rounded-md" />
                    </td>
                  ))}
                </tr>
              ))
            ) : sortedData.length > 0 ? (
              sortedData.map((row, rowIndex) => (
                <tr
                  key={row._id || row.id || rowIndex}
                  className="hover:bg-slate-800/50 transition-colors duration-150 group"
                >
                  {columns.map((col) => (
                    <td key={col.key || col.header} className={`px-5 py-4 ${col.className || ''}`}>
                      {col.render ? col.render(row, rowIndex) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 border border-slate-700 text-[#D4AF37] mb-3 shadow-sm">
                      <Inbox className="h-7 w-7" />
                    </div>
                    <p className="text-sm font-bold text-white">{emptyMessage}</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">No matching entries found in this directory partition.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex flex-col gap-3 sm:flex-row items-center justify-between border-t border-slate-800 px-5 py-4 bg-slate-950/60 text-xs text-slate-400">
          <div>
            Showing <span className="font-bold text-white">{sortedData.length}</span> of{' '}
            <span className="font-bold text-white">{totalItems || sortedData.length}</span> records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange && onPageChange(currentPage - 1)}
              disabled={currentPage <= 1 || loading}
              className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[11px] font-bold text-[#D4AF37] shadow-xs">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => onPageChange && onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || loading}
              className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
