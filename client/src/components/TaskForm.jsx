import React, { useState, useEffect } from 'react';
import { X, Plus, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import AiTaskAssistant from './AiTaskAssistant';

export const TaskForm = ({ isOpen, onClose, onSave, editingTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Pending');
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('General');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setStatus(editingTask.status);
      setPriority(editingTask.priority);
      setCategory(editingTask.category);
      if (editingTask.dueDate) {
        setDueDate(new Date(editingTask.dueDate).toISOString().split('T')[0]);
      }
    } else {
      setTitle('');
      setDescription('');
      setStatus('Pending');
      setPriority('Medium');
      setCategory('General');
      setDueDate(new Date().toISOString().split('T')[0]);
    }
    setError('');
  }, [editingTask, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSave({
        title,
        description,
        status,
        priority,
        category,
        dueDate: new Date(dueDate).toISOString()
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white border-2 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-lg overflow-hidden transition-all">
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black bg-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {editingTask ? <Save className="w-5 h-5 font-black" /> : <Plus className="w-5 h-5 font-black" />}
            </div>
            <h3 className="font-black text-xl uppercase tracking-tight text-slate-900">
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-800 bg-white border-2 border-black p-2 rounded-xl hover:bg-slate-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 font-black" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-200 border-2 border-black rounded-xl text-rose-900 font-bold text-sm flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Implement MERN REST API authentication"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-black bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-sm font-medium"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about the task..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-black bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-sm font-medium resize-y"
              required
            />

            {/* AI Assistant */}
            <AiTaskAssistant
              title={title}
              currentDescription={description}
              category={category}
              priority={priority}
              onApplyDescription={(newDesc) => setDescription(newDesc)}
              onApplyCategory={(newCat) => setCategory(newCat)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-black bg-white text-slate-900 focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-sm font-bold cursor-pointer"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-black bg-white text-slate-900 focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-sm font-bold cursor-pointer"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-black bg-white text-slate-900 focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-sm font-bold cursor-pointer"
              >
                <option value="General">General</option>
                <option value="Development">Development</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Design">Design</option>
                <option value="Testing">Testing</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-black bg-white text-slate-900 focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-sm font-bold cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-black">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border-2 border-black text-slate-800 font-black text-sm uppercase bg-white hover:bg-slate-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 border-2 border-black text-slate-900 font-black text-sm uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>Saving...</>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 font-black" />
                  {editingTask ? 'Update Task' : 'Create Task'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
