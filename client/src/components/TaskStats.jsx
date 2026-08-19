import React from 'react';
import { CheckCircle2, Clock, ListTodo } from 'lucide-react';

export const TaskStats = ({ tasks }) => {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'Completed').length;
  const inProgress = tasks.filter(t => t.status === 'In Progress').length;
  const pending = tasks.filter(t => t.status === 'Pending').length;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      <div className="bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1">Total Tasks</p>
          <h4 className="text-3xl font-black text-slate-900">{total}</h4>
        </div>
        <div className="p-3 bg-indigo-100 border-2 border-black text-indigo-700 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <ListTodo className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-blue-200 border-2 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-slate-700 mb-1">In Progress</p>
          <h4 className="text-3xl font-black text-slate-900">{inProgress}</h4>
        </div>
        <div className="p-3 bg-white border-2 border-black text-blue-700 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <Clock className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-emerald-300 border-2 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-slate-800 mb-1">Completed</p>
          <h4 className="text-3xl font-black text-slate-900">{completed}</h4>
        </div>
        <div className="p-3 bg-white border-2 border-black text-emerald-700 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <CheckCircle2 className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-yellow-300 border-2 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-slate-800 mb-1">Completion Rate</p>
          <div className="flex items-center gap-2">
            <h4 className="text-3xl font-black text-slate-900">{completionRate}%</h4>
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-white border-2 border-black flex items-center justify-center text-slate-900 font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          {completionRate}%
        </div>
      </div>
    </div>
  );
};
