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
      className={`flex flex-col rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden transition-all text-slate-800 ${className}`}
    >
      {/* Top Action Bar */}
      <div className="flex flex-col gap-3 p-4 sm:p-5 border-b border-slate-200 sm:flex-row sm:items-center sm:justify-between bg-slate-50/70">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder={searchPlaceholder}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-9.5 pr-4 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:border-[#6D1B29] focus:outline-hidden focus:ring-2 focus:ring-[#6D1B29]/10 shadow-2xs transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {filterComponent}
          {actions}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-100/90 text-[11px] font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key || col.header}
                  scope="col"
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`px-5 py-4 whitespace-nowrap ${
                    col.sortable ? 'cursor-pointer hover:bg-slate-200/70 select-none' : ''
                  } ${col.headerClassName || ''}`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <ArrowUpDown className="h-3 w-3 text-slate-400 hover:text-[#6D1B29]" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              // Skeleton loading rows
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {columns.map((_, c) => (
                    <td key={c} className="px-5 py-4">
                      <div className="h-4 w-3/4 bg-slate-100 rounded-md" />
                    </td>
                  ))}
                </tr>
              ))
            ) : sortedData.length > 0 ? (
              sortedData.map((row, rowIndex) => (
                <tr
                  key={row._id || row.id || rowIndex}
                  className="hover:bg-slate-50/90 transition-colors duration-150 group"
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
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 mb-3 shadow-2xs">
                      <Inbox className="h-7 w-7" />
                    </div>
                    <p className="text-sm font-bold text-slate-900">{emptyMessage}</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">No matching entries found in this directory partition.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex flex-col gap-3 sm:flex-row items-center justify-between border-t border-slate-200 px-5 py-4 bg-slate-50/70 text-xs text-slate-600">
          <div>
            Showing <span className="font-bold text-slate-900">{sortedData.length}</span> of{' '}
            <span className="font-bold text-slate-900">{totalItems || sortedData.length}</span> records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange && onPageChange(currentPage - 1)}
              disabled={currentPage <= 1 || loading}
              className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-800 shadow-2xs">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => onPageChange && onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || loading}
              className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition"
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
