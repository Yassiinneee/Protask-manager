import React from 'react';
import Markdown from 'react-markdown';
import { 
  X, Calendar, Clock, Tag, User, Check, Edit2, 
  CheckCircle2, Sparkles, AlertCircle, AlertTriangle 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function TaskDetailModal({ 
  task, 
  onClose, 
  onEdit, 
  onToggleComplete,
  currentUser 
}) {
  const { language, t, formatShortDate } = useLanguage();
  if (!task) return null;

  const isCompleted = task.status === 'Completed';

  const priorityColor =
    task.priority === 'High'
      ? 'text-rose-700 dark:text-rose-300 bg-rose-500/15 border-rose-500/30'
      : task.priority === 'Medium'
      ? 'text-amber-700 dark:text-amber-300 bg-amber-500/15 border-amber-500/30'
      : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';

  const statusBadgeStyle =
    task.status === 'Completed'
      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
      : task.status === 'In Progress'
      ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30'
      : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30';

  const statusLabel = 
    task.status === 'Completed' ? t('statusCompleted') :
    task.status === 'In Progress' ? t('statusInProgress') :
    t('statusPending');

  const priorityLabel = 
    task.priority === 'High' ? t('priorityHigh') :
    task.priority === 'Medium' ? t('priorityMedium') :
    t('priorityLow');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs px-2.5 py-0.5 rounded-md border font-semibold ${statusBadgeStyle}`}>
                {statusLabel}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-md border font-semibold ${priorityColor}`}>
                {task.priority === 'High' && '🔥 '}
                {priorityLabel} {language === 'fr' ? 'Priorité' : 'Priority'}
              </span>
              {task.category && (
                <span className="text-xs px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700">
                  📁 {task.category}
                </span>
              )}
            </div>
            <h3 className={`text-lg sm:text-xl font-bold tracking-tight mt-1 ${isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
              {task.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body with Markdown Rendering */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200">
          {/* Metadata Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">{t('deadline')}</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                {task.dueDate 
                  ? formatShortDate(task.dueDate)
                  : t('noDeadline')}
              </span>
            </div>

            <div>
              <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">{t('created')}</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {task.createdAt 
                  ? formatShortDate(task.createdAt)
                  : (language === 'fr' ? 'Récent' : 'Recent')}
              </span>
            </div>

            <div>
              <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">{t('owner')}</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mt-0.5 truncate">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {task.createdBy || t('teamMember')}
              </span>
            </div>
          </div>

          {/* Description Content */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t('taskDescriptionObjectives')}
            </h4>
            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200/70 dark:border-slate-800/80">
              {task.description ? (
                <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-slate-100 prose-p:leading-relaxed prose-li:my-0.5 text-xs sm:text-sm">
                  <Markdown>{task.description}</Markdown>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">{t('noDescription')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              if (onToggleComplete) onToggleComplete(task);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              isCompleted
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{isCompleted ? t('markIncomplete') : t('markComplete')}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition cursor-pointer"
            >
              {t('close')}
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onEdit) onEdit(task);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{t('editAiAssist')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

