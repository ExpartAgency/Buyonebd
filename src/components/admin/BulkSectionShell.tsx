import React from 'react';
import { CheckSquare, Square, X } from 'lucide-react';

export interface BulkSectionShellProps {
  /** Short monospaced architectural tag, e.g. "BULK // ORDERS" */
  indexCode: string;
  title: string;
  subtitle?: string;
  totalCount: number;
  selectedCount?: number;
  accent?: 'amber' | 'emerald' | 'indigo' | 'cyan' | 'rose' | 'violet';
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const ACCENT_TOP_BAR: Record<NonNullable<BulkSectionShellProps['accent']>, string> = {
  amber: 'from-amber-400 via-orange-500 to-amber-300',
  emerald: 'from-emerald-400 via-teal-500 to-emerald-300',
  indigo: 'from-indigo-400 via-blue-500 to-cyan-400',
  cyan: 'from-cyan-400 via-sky-500 to-teal-300',
  rose: 'from-rose-400 via-pink-500 to-amber-400',
  violet: 'from-violet-400 via-purple-500 to-fuchsia-400',
};

const ACCENT_TAG_STYLE: Record<NonNullable<BulkSectionShellProps['accent']>, string> = {
  amber: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  emerald: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  indigo: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300',
  cyan: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
  rose: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
  violet: 'border-violet-500/40 bg-violet-500/10 text-violet-300',
};

/**
 * Architectural Bulk Command Surface
 * Distinct visual frame for all admin bulk list sections: top 2px gradient hairline,
 * obsidian structural header band, monospaced index tag, tabular counters, and zero pill clutter.
 */
export const BulkSectionShell: React.FC<BulkSectionShellProps> = ({
  indexCode,
  title,
  subtitle,
  totalCount,
  selectedCount = 0,
  accent = 'indigo',
  headerActions,
  children,
  className = '',
}) => {
  return (
    <section
      className={`relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950/90 shadow-lg shadow-black/25 ${className}`}
    >
      {/* Top 2px architectural hairline stripe */}
      <div className={`h-[2px] w-full bg-gradient-to-r ${ACCENT_TOP_BAR[accent]}`} />

      {/* Architectural Command Header */}
      <div className="flex flex-col gap-3 border-b border-slate-800/90 bg-slate-900/95 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded border px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase tabular-nums ${ACCENT_TAG_STYLE[accent]}`}
            >
              {indexCode}
            </span>
            <span className="inline-flex items-center rounded border border-slate-700 bg-slate-950 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-300 tabular-nums">
              TOTAL: {totalCount}
            </span>
            {selectedCount > 0 && (
              <span className="inline-flex items-center rounded border border-amber-400/50 bg-amber-500/15 px-2 py-0.5 font-mono text-[11px] font-bold text-amber-300 tabular-nums">
                SELECTED: {selectedCount}
              </span>
            )}
          </div>
          <h3 className="mt-1.5 text-sm font-bold tracking-tight text-white sm:text-base">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
        </div>

        {headerActions && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">{headerActions}</div>
        )}
      </div>

      {/* Body Content */}
      <div className="p-3 sm:p-4">{children}</div>
    </section>
  );
};

export interface BulkCommandBarProps {
  selectedCount: number;
  totalCount: number;
  allSelected: boolean;
  onToggleSelectAll: () => void;
  onClearSelection: () => void;
  itemLabel?: string;
  children?: React.ReactNode;
}

/**
 * Unified obsidian Bulk Action Bar mounted inside bulk sections.
 * Enforces single-line buttons (`whitespace-nowrap shrink-0`), vertical dividers (`w-px h-5`),
 * and clear selection controls.
 */
export const BulkCommandBar: React.FC<BulkCommandBarProps> = ({
  selectedCount,
  totalCount,
  allSelected,
  onToggleSelectAll,
  onClearSelection,
  itemLabel = 'items',
  children,
}) => {
  return (
    <div
      className={`mb-3 flex flex-wrap items-center justify-between gap-2.5 rounded-lg border px-3 py-2.5 transition-colors ${
        selectedCount > 0
          ? 'border-amber-500/50 bg-slate-900 text-white'
          : 'border-slate-800 bg-slate-900/60 text-slate-300'
      }`}
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={onToggleSelectAll}
          disabled={totalCount === 0}
          className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {allSelected && totalCount > 0 ? (
            <CheckSquare className="h-3.5 w-3.5 text-amber-400" />
          ) : (
            <Square className="h-3.5 w-3.5 text-slate-400" />
          )}
          <span>{allSelected && totalCount > 0 ? 'Deselect All' : 'Select All'}</span>
        </button>

        <div className="h-5 w-px bg-slate-700/80" />

        <span className="font-mono text-xs font-bold tracking-wide text-slate-200 tabular-nums whitespace-nowrap">
          [ {String(selectedCount).padStart(2, '0')} / {String(totalCount).padStart(2, '0')} {itemLabel.toUpperCase()} ]
        </span>

        {selectedCount > 0 && (
          <button
            type="button"
            onClick={onClearSelection}
            className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {children && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden h-5 w-px bg-slate-700/80 sm:block" />
          {children}
        </div>
      )}
    </div>
  );
};
