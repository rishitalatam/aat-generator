import React from 'react';
import { BookOpen, FileCheck, Award, Layers, CheckCircle2 } from 'lucide-react';

export const FormatGuideView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
            <BookOpen className="w-5 h-5" />
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            IARE Academic Formatting Specifications
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Authoritative standards derived from official IARE CEP guidelines, DOCX templates, and JNTUH examination formats.
        </p>
      </div>

      {/* Typography & Page Margins Card */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          1. Typography, Layout, and Spacing Discipline
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
            <span className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider text-[11px]">
              Page Setup & Margins
            </span>
            <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
              <li>• <strong>Paper Size:</strong> A4 standard</li>
              <li>• <strong>Left Margin:</strong> 1.25 inches (32 mm for binding)</li>
              <li>• <strong>Right Margin:</strong> 1.0 inch (25.4 mm)</li>
              <li>• <strong>Top & Bottom Margins:</strong> 1.0 inch (25.4 mm)</li>
              <li>• <strong>Line Spacing:</strong> Strictly 1.5 line spacing throughout body</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
            <span className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider text-[11px]">
              Font Hierarchy (Times New Roman)
            </span>
            <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 font-academic text-xs">
              <li>• <strong>Chapter Heading:</strong> 16 pt, BOLD, ALL CAPS, Centered</li>
              <li>• <strong>Section Heading (e.g. 1.1):</strong> 14 pt, Bold, Title Case</li>
              <li>• <strong>Subsection Heading (e.g. 1.1.1):</strong> 12 pt, Bold, Title Case</li>
              <li>• <strong>Body Text:</strong> 12 pt, Regular, Justified Alignment</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Numbering Convention */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-emerald-600" />
          2. Page Numbering & Pagination Hierarchy
        </h2>

        <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 text-xs space-y-2">
          <p className="text-slate-800 dark:text-slate-200 font-semibold">
            Preliminary Pages (Roman Numerals in Lowercase):
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-emerald-800 dark:text-emerald-300">
            <span>Cover Page: (No No.)</span>
            <span>Title Page: i</span>
            <span>Declaration: ii</span>
            <span>Certificate: iii</span>
            <span>Approval Sheet: iv</span>
            <span>Acknowledgement: v</span>
            <span>Abstract: vi</span>
            <span>Table of Contents: vii</span>
          </div>

          <p className="text-slate-800 dark:text-slate-200 font-semibold pt-2">
            Chapters & References (Arabic Numerals):
          </p>
          <p className="text-slate-600 dark:text-slate-400 text-xs">
            From Chapter 1 (Introduction) onwards until References, page numbering starts from <strong>1, 2, 3...</strong> centered in the footer.
          </p>
        </div>
      </div>

      {/* CEP Problem Solving Criteria */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          3. Complex Engineering Problem (CEP) Attributes
        </h2>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          According to Washington Accord and NBA guidelines enforced at IARE, a CEP report must satisfy attributes:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {[
            { title: 'P1: Depth of Knowledge', desc: 'Cannot be resolved without in-depth engineering fundamentals.' },
            { title: 'P2: Conflicting Requirements', desc: 'Involves trade-offs across performance, memory, cost, and safety.' },
            { title: 'P3: Depth of Analysis', desc: 'Requires analytical or algorithmic modeling and benchmarking.' },
            { title: 'P4: Familiarity of Issues', desc: 'Involves infrequently encountered issues with non-obvious solutions.' },
            { title: 'P5: Beyond Standard Codes', desc: 'Cannot be solved simply by copying existing manual guidelines.' },
            { title: 'P6: Diverse Stakeholders', desc: 'Impacts users, systems, latency, and environmental footprint.' },
          ].map((item, idx) => (
            <div key={idx} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <span className="font-bold text-slate-900 dark:text-white block">{item.title}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
