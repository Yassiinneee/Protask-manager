import React, { useState } from 'react';
import { 
  Sparkles, Zap, CheckCircle2, RefreshCw, Copy, Check, 
  ArrowRight, Wand2, FileText, ListChecks, Layers, 
  ChevronDown, ChevronUp, AlertCircle, Clock, Tag, MessageSquare
} from 'lucide-react';
import { generateTaskDescriptionAPI, refineTaskDescriptionAPI } from '../services/ai';

export default function AiTaskAssistant({
  title,
  currentDescription,
  category,
  priority,
  onApplyDescription,
  onApplyCategory,
  onApplyTags,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [tone, setTone] = useState('actionable');
  const [additionalContext, setAdditionalContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [refining, setRefining] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const [aiResult, setAiResult] = useState(null);
  const [editableResult, setEditableResult] = useState('');

  const handleGenerate = async (selectedTone = tone) => {
    if (!title || !title.trim()) {
      setError('Please enter a Task Title first so the AI knows what to write about.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await generateTaskDescriptionAPI({
        title: title.trim(),
        currentDescription: currentDescription || '',
        category: category || 'General',
        priority: priority || 'Medium',
        tone: selectedTone,
        additionalContext: additionalContext.trim(),
      });

      if (res.success && res.data) {
        setAiResult(res.data);
        setEditableResult(res.data.description || '');
      } else {
        setError(res.message || 'Failed to generate description.');
      }
    } catch (err) {
      setError(err.message || 'Failed to communicate with AI Assistant.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefine = async (action) => {
    const textToRefine = editableResult || currentDescription;
    if (!textToRefine || !textToRefine.trim()) {
      setError('No description text available to refine.');
      return;
    }

    setRefining(true);
    setError('');

    try {
      const res = await refineTaskDescriptionAPI({
        title: title || 'Task',
        description: textToRefine,
        action,
      });

      if (res.success && res.refinedText) {
        setEditableResult(res.refinedText);
        setAiResult((prev) => ({
          ...(prev || {}),
          description: res.refinedText,
        }));
      } else {
        setError(res.message || 'Failed to refine text.');
      }
    } catch (err) {
      setError(err.message || 'Failed to refine text.');
    } finally {
      setRefining(false);
    }
  };

  const handleCopy = () => {
    if (!editableResult) return;
    navigator.clipboard.writeText(editableResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (!editableResult) return;
    onApplyDescription(editableResult);
    if (aiResult?.suggestedTags && onApplyTags) {
      onApplyTags(aiResult.suggestedTags);
    }
    setIsOpen(false);
  };

  const tones = [
    { id: 'actionable', label: 'Actionable & DoD', icon: ListChecks, desc: 'Objectives, technical steps, definition of done' },
    { id: 'user-story', label: 'Agile User Story', icon: Layers, desc: 'As a... I want to... So that...' },
    { id: 'concise', label: 'Concise & Direct', icon: Zap, desc: 'Bullet points & essentials only' },
    { id: 'detailed', label: 'Detailed Specs', icon: FileText, desc: 'Deep technical context & edge cases' },
  ];

  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/60 dark:from-indigo-950/40 dark:via-slate-900 dark:to-purple-950/30 p-4 shadow-sm transition-all">
      {/* Header Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>AI Description Assistant</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-500/20">
                  Gemini 3.7 Flash
                </span>
              </h4>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Generate structured, professional task requirements, criteria & checklists in seconds
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!isOpen && !aiResult && title) {
              handleGenerate();
            }
            setIsOpen(!isOpen);
          }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition active:scale-98 cursor-pointer"
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>{isOpen ? 'Close AI Assistant' : '✨ Generate with AI'}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5 ml-0.5" /> : <ChevronDown className="w-3.5 h-3.5 ml-0.5" />}
        </button>
      </div>

      {/* Expanded AI Panel */}
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in duration-200">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Tone / Format Selection */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              Description Style & Format:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {tones.map((t) => {
                const Icon = t.icon;
                const active = tone === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTone(t.id);
                      handleGenerate(t.id);
                    }}
                    className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      active
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      <Icon className="w-3.5 h-3.5" />
                      <span>{t.label}</span>
                    </div>
                    <span className={`text-[10px] mt-1 leading-tight line-clamp-1 ${active ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>
                      {t.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Prompt Guidance */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="Add specific instructions (e.g. 'Must include Redis cache invalidation step')"
              className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="button"
              disabled={loading || refining}
              onClick={() => handleGenerate()}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shrink-0"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 dark:text-indigo-600" />
                  <span>Re-Generate</span>
                </>
              )}
            </button>
          </div>

          {/* Generated Result Preview & Direct Refine Tools */}
          {editableResult && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-indigo-500" />
                    <span>AI Generated Output</span>
                  </span>
                  {aiResult?.estimatedTime && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                      <Clock className="w-3 h-3" />
                      <span>Est: {aiResult.estimatedTime}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition text-xs flex items-center gap-1 cursor-pointer"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Editable Result Area */}
              <textarea
                rows={6}
                value={editableResult}
                onChange={(e) => setEditableResult(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-indigo-500/40 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y leading-relaxed"
                placeholder="AI Generated description will appear here..."
              />

              {/* Quick Refine Pills */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-[11px] text-slate-400 font-semibold">Refine:</span>
                <button
                  type="button"
                  disabled={refining}
                  onClick={() => handleRefine('add_acceptance_criteria')}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-[11px] font-medium transition cursor-pointer"
                >
                  + Add Acceptance Criteria
                </button>
                <button
                  type="button"
                  disabled={refining}
                  onClick={() => handleRefine('summarize')}
                  className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-100 text-[11px] font-medium transition cursor-pointer"
                >
                  ⚡ Make Concise
                </button>
                <button
                  type="button"
                  disabled={refining}
                  onClick={() => handleRefine('make_professional')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 text-[11px] font-medium transition cursor-pointer"
                >
                  👔 Polish Formal
                </button>
                <button
                  type="button"
                  disabled={refining}
                  onClick={() => handleRefine('expand')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-[11px] font-medium transition cursor-pointer"
                >
                  🔍 Expand Depth
                </button>
              </div>

              {/* Subtasks & Acceptance Criteria Badges */}
              {aiResult?.acceptanceCriteria && aiResult.acceptanceCriteria.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Acceptance Criteria Checklist</span>
                  </div>
                  <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 pl-1">
                    {aiResult.acceptanceCriteria.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Apply Button */}
              <div className="flex items-center justify-between pt-2">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Ready? Click Apply to populate your task's description.
                </p>
                <button
                  type="button"
                  onClick={handleApply}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer active:scale-98"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Apply to Task Form</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
