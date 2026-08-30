'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Badge from '../../components/ui/Badge';
import api from '../../lib/api';
import { useNotification } from '../../lib/NotificationContext';
import {
  FileText,
  Printer,
  Download,
  Search,
  Filter,
  GraduationCap,
  Users,
  CalendarCheck,
  Award,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('students');
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);

  // Filters
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [search, setSearch] = useState('');

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const { success, error } = useNotification();

  const reportTypes = [
    { id: 'students', label: 'Student Directory Report', icon: GraduationCap },
    { id: 'faculty', label: 'Faculty Directory Report', icon: Users },
    { id: 'attendance', label: 'Attendance & Shortage Report', icon: CalendarCheck },
    { id: 'marks', label: 'Semester Examination Marks Report', icon: Award },
    { id: 'talent', label: 'Student Talent Intelligence Report', icon: Sparkles },
    { id: 'department-talent', label: 'Department Talent Distribution Report', icon: BarChart3 },
  ];

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [dRes, cRes] = await Promise.all([api.get('/departments'), api.get('/courses')]);
        if (dRes.data.success) setDepartments(dRes.data.data);
        if (cRes.data.success) setCourses(cRes.data.data);
      } catch (err) {}
    };
    fetchMeta();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = {
        department: selectedDept,
        course: selectedCourse,
        year: selectedYear,
        search,
      };

      const res = await api.get(`/reports/${reportType}`, { params });
      if (res.data.success) {
        setReportData(res.data);
      }
    } catch (err) {
      error('Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, selectedDept, selectedCourse, selectedYear, search]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    if (!reportData || !reportData.data || reportData.data.length === 0) {
      error('No data available to export.');
      return;
    }

    try {
      const ws = XLSX.utils.json_to_sheet(reportData.data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Report_Data');
      XLSX.writeFile(wb, `${reportData.reportType}_report_${new Date().toISOString().split('T')[0]}.xlsx`);
      success('Report exported to Excel successfully.');
    } catch (err) {
      error('Failed to export Excel.');
    }
  };

  return (
    <DashboardLayout
      title="Institutional Reports"
      subtitle="Search, filter, print, and export official college records and talent summaries"
    >
      {/* Report Type Selector Tabs - Hidden during print */}
      <div className="print:hidden mb-6 flex flex-wrap gap-2 rounded-2xl bg-slate-100 p-1.5">
        {reportTypes.map((rt) => {
          const Icon = rt.icon;
          const isActive = reportType === rt.id;
          return (
            <button
              key={rt.id}
              onClick={() => setReportType(rt.id)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                isActive
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {rt.label}
            </button>
          );
        })}
      </div>

      {/* Filter Controls - Hidden during print */}
      <div className="print:hidden mb-6 flex flex-col md:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto text-xs">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="rounded-xl border border-slate-200 p-2 font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="All">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="rounded-xl border border-slate-200 p-2 font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="All">All Years</option>
            <option value="I Year">I Year</option>
            <option value="II Year">II Year</option>
            <option value="III Year">III Year</option>
            <option value="IV Year">IV Year</option>
          </select>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search in report..."
              className="rounded-xl border border-slate-200 pl-8 pr-3 py-1.5 font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-2xs"
          >
            <Download className="h-4 w-4 text-slate-500" />
            Export Excel
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs"
          >
            <Printer className="h-4 w-4" />
            Print Report
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-10 shadow-xs print:border-none print:p-0 print:shadow-none">
        {/* Printable Header */}
        <div className="border-b-2 border-slate-900 pb-6 mb-6 text-center">
          <h2 className="text-lg md:text-xl font-black uppercase tracking-tight text-slate-900">
            KAMBAN COLLEGE OF ARTS AND SCIENCE FOR WOMEN
          </h2>
          <p className="text-[11px] font-semibold text-slate-600">
            Recognized u/s 2(f) & 12(B) of UGC Act 1956 • NAAC Accredited • Affiliated to Thiruvalluvar University
          </p>
          <p className="text-[10px] text-slate-500">
            Thenmathur, Tiruvannamalai – 606 603, Tamil Nadu, India
          </p>

          <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs">
            <span className="font-extrabold text-blue-900 uppercase tracking-wide text-sm">
              {reportData?.title || 'Institutional Report'}
            </span>
            <span className="text-slate-500">
              Generated On: {new Date().toLocaleDateString('en-GB')} at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Report Content Table */}
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500">
            Generating real-time institutional report...
          </div>
        ) : reportData?.data?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100/80 text-[11px] font-bold uppercase text-slate-800 border-b border-slate-300">
                <tr>
                  <th className="p-3">#</th>
                  {reportData.headers?.map((h, i) => (
                    <th key={i} className="p-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reportData.data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slate-400">{idx + 1}</td>
                    {Object.values(row).map((val, cIdx) => (
                      <td key={cIdx} className="p-3">
                        {typeof val === 'string' && val.includes('Dominant') ? (
                          <Badge variant="gold" size="sm">{val}</Badge>
                        ) : typeof val === 'string' && (val === 'Pass' || val.includes('Healthy')) ? (
                          <span className="font-bold text-emerald-700">{val}</span>
                        ) : typeof val === 'string' && (val === 'Fail' || val.includes('Shortage')) ? (
                          <span className="font-bold text-rose-700">{val}</span>
                        ) : (
                          val
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-400">
            No records matched the selected report filters.
          </div>
        )}

        {/* Printable Footer Signatures */}
        <div className="mt-16 pt-8 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
          <div>
            <p className="border-t border-slate-400 pt-1 w-40 text-center">Prepared By</p>
          </div>
          <div>
            <p className="border-t border-slate-400 pt-1 w-40 text-center">Head of Department</p>
          </div>
          <div>
            <p className="border-t border-slate-400 pt-1 w-40 text-center">Principal / Controller</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
