import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, Flame, Edit, Trash2, Calendar, Tag, CheckSquare } from 'lucide-react';

export const TaskList = ({ tasks, onEdit, onDelete, onStatusChange, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map((n) => (
          <div key={n} className="bg-white border-2 border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] h-48 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-5 bg-slate-200 rounded-lg w-3/4"></div>
              <div className="h-4 bg-slate-100 rounded-lg w-full"></div>
              <div className="h-4 bg-slate-100 rounded-lg w-1/2"></div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t-2 border-black">
              <div className="h-6 w-20 bg-slate-200 rounded-full"></div>
              <div className="h-8 w-16 bg-slate-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-white border-2 border-black rounded-3xl p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-xl mx-auto my-12">
        <div className="w-16 h-16 bg-indigo-100 border-2 border-black text-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <CheckSquare className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-1">No tasks found</h3>
        <p className="text-slate-600 text-sm mb-6 font-medium">
          Get started by creating a new task or adjusting your filter criteria.
        </p>
      </div>
    );
  }

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Urgent':
        return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-300 border-2 border-black text-slate-900 flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"><Flame className="w-3 h-3" /> Urgent</span>;
      case 'High':
        return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-300 border-2 border-black text-slate-900 flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"><AlertTriangle className="w-3 h-3" /> High</span>;
      case 'Medium':
        return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-200 border-2 border-black text-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Medium</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-200 border-2 border-black text-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Low</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tasks.map((task) => (
        <div
          key={task._id}
          className={`border-2 border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between group ${
            task.status === 'Completed'
              ? 'bg-emerald-100/70'
              : 'bg-white'
          }`}
        >
          <div>
            <div className="flex items-start justify-between gap-4 mb-3">
              <h4 className={`font-black text-base text-slate-900 tracking-tight line-clamp-1 ${task.status === 'Completed' ? 'line-through text-slate-500' : ''}`}>
                {task.title}
              </h4>
              {getPriorityBadge(task.priority)}
            </div>

            <p className="text-slate-700 text-sm mb-4 line-clamp-3 font-medium">
              {task.description}
            </p>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-indigo-100 border-2 border-black text-indigo-900 flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Tag className="w-3 h-3 text-indigo-700" />
                {task.category || 'General'}
              </span>

              {task.dueDate && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-yellow-200 border-2 border-black text-slate-900 flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <Calendar className="w-3 h-3 text-slate-700" />
                  {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>

          <div className="pt-4 border-t-2 border-black flex items-center justify-between gap-2">
            <select
              value={task.status}
              onChange={(e) => onStatusChange(task._id, e.target.value)}
              className="text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-xl border-2 border-black bg-white text-slate-900 focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(task)}
                className="p-2.5 bg-yellow-300 border-2 border-black text-slate-900 rounded-xl hover:bg-yellow-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all"
                title="Edit Task"
              >
                <Edit className="w-4 h-4 font-black" />
              </button>
              <button
                onClick={() => onDelete(task._id)}
                className="p-2.5 bg-rose-300 border-2 border-black text-slate-900 rounded-xl hover:bg-rose-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all"
                title="Delete Task"
              >
                <Trash2 className="w-4 h-4 font-black" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
