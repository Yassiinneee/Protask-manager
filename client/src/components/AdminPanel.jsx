import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Users, UserCog, Trash2, ShieldAlert, Search, RefreshCw, 
  Database, Cpu, CheckCircle2, AlertCircle, ArrowUpRight, Zap, ListTodo,
  Ban, UserX, UserCheck, Plus, Edit2, Calendar, Tag, Filter, Clock,
  UserPlus, KeyRound, Lock, Eye, EyeOff
} from 'lucide-react';
import { 
  fetchAllUsersAPI, 
  fetchAdminStatsAPI, 
  updateUserRoleAPI, 
  toggleBanUserAPI,
  deleteUserAPI,
  adminCreateUserAPI,
  adminUpdatePasswordAPI,
  getStoredUser
} from '../services/auth';
import {
  createTaskAPI,
  updateTaskAPI,
  deleteTaskAPI
} from '../services/api';

export default function AdminPanel({ tasks = [], onRefreshTasks, redisStats, onFlushCache, onTestRedis }) {
  const [users, setUsers] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [taskSearch, setTaskSearch] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState('All');
  const [actionMessage, setActionMessage] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Admin Task Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskStatus, setTaskStatus] = useState('Pending');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskCategory, setTaskCategory] = useState('Development');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('all'); // 'all' or userId
  const [savingTask, setSavingTask] = useState(false);

  // Admin User Creation State
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');
  const [newUserVerified, setNewUserVerified] = useState(true);
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);

  // Admin Change User Password State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordTargetUser, setPasswordTargetUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [savingUser, setSavingUser] = useState(false);

  const currentUser = getStoredUser();

  const loadAdminData = async () => {
    setLoading(true);
    setActionError(null);
    try {
      const [usersRes, statsRes] = await Promise.all([
        fetchAllUsersAPI(),
        fetchAdminStatsAPI(),
      ]);

      if (usersRes.success) setUsers(usersRes.data);
      if (statsRes.success) setAdminStats(statsRes.stats);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await updateUserRoleAPI(userId, newRole);
      if (res.success) {
        setActionMessage(`User role updated to ${newRole.toUpperCase()}`);
        setTimeout(() => setActionMessage(null), 3000);
        loadAdminData();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update user role');
      setTimeout(() => setActionError(null), 4000);
    }
  };

  const handleToggleBan = async (userId, userName, currentBanned) => {
    const actionText = currentBanned ? 'unban' : 'ban';
    if (!confirm(`Are you sure you want to ${actionText} user "${userName}"?`)) return;

    try {
      const res = await toggleBanUserAPI(userId, !currentBanned);
      if (res.success) {
        setActionMessage(res.message || `User "${userName}" was successfully ${currentBanned ? 'unbanned' : 'banned'}.`);
        setTimeout(() => setActionMessage(null), 3000);
        loadAdminData();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || `Failed to ${actionText} user`);
      setTimeout(() => setActionError(null), 4000);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to permanently delete user "${userName}"?`)) return;

    try {
      const res = await deleteUserAPI(userId);
      if (res.success) {
        setActionMessage(`User "${userName}" has been deleted.`);
        setTimeout(() => setActionMessage(null), 3000);
        loadAdminData();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to delete user');
      setTimeout(() => setActionError(null), 4000);
    }
  };

  // Open Create User Modal
  const handleOpenCreateUser = () => {
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    setNewUserRole('user');
    setNewUserVerified(true);
    setIsCreateUserModalOpen(true);
  };

  // Create User submit
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
      setActionError('Please fill in name, email, and password');
      return;
    }

    setSavingUser(true);
    setActionError(null);
    try {
      const res = await adminCreateUserAPI({
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
        isVerified: newUserVerified
      });

      if (res.success) {
        setActionMessage(res.message || `User "${newUserName}" created successfully.`);
        setIsCreateUserModalOpen(false);
        setTimeout(() => setActionMessage(null), 4000);
        loadAdminData();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to create user account');
      setTimeout(() => setActionError(null), 4000);
    } finally {
      setSavingUser(false);
    }
  };

  // Open Change Password Modal
  const handleOpenPasswordModal = (user) => {
    setPasswordTargetUser(user);
    setNewPassword('');
    setIsPasswordModalOpen(true);
  };

  // Update Password submit
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!passwordTargetUser) return;
    if (!newPassword || newPassword.length < 6) {
      setActionError('New password must be at least 6 characters long.');
      setTimeout(() => setActionError(null), 4000);
      return;
    }

    setSavingUser(true);
    setActionError(null);
    try {
      const res = await adminUpdatePasswordAPI(passwordTargetUser._id, newPassword);
      if (res.success) {
        setActionMessage(res.message || `Password for user "${passwordTargetUser.name}" updated successfully.`);
        setIsPasswordModalOpen(false);
        setPasswordTargetUser(null);
        setNewPassword('');
        setTimeout(() => setActionMessage(null), 4000);
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to modify user password');
      setTimeout(() => setActionError(null), 4000);
    } finally {
      setSavingUser(false);
    }
  };

  // Open Create Task Modal
  const handleOpenCreateTask = () => {
    setEditingTask(null);
    setTaskTitle('');
    setTaskDesc('');
    setTaskStatus('Pending');
    setTaskPriority('Medium');
    setTaskCategory('General');
    setTaskDueDate(new Date().toISOString().split('T')[0]);
    setTaskAssignee(currentUser?._id || (users[0]?._id) || '');
    setIsTaskModalOpen(true);
  };

  // Open Edit Task Modal
  const handleOpenEditTask = (task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDesc(task.description || '');
    setTaskStatus(task.status || 'Pending');
    setTaskPriority(task.priority || 'Medium');
    setTaskCategory(task.category || 'General');
    setTaskDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
    setTaskAssignee(task.assignedTo || currentUser?._id || (users[0]?._id) || '');
    setIsTaskModalOpen(true);
  };

  // Submit Admin Task (Create or Edit)
  const handleSaveAdminTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    setSavingTask(true);

    try {
      const targetAssigneeId = taskAssignee || currentUser?._id || (users[0]?._id);
      let targetUserObj = users.find(u => u._id === targetAssigneeId);
      if (!targetUserObj && currentUser?._id === targetAssigneeId) {
        targetUserObj = currentUser;
      }

      const payload = {
        title: taskTitle.trim(),
        description: taskDesc ? taskDesc.trim() : '',
        status: taskStatus,
        priority: taskPriority,
        category: taskCategory,
        dueDate: taskDueDate,
        assignedTo: targetAssigneeId,
        assignedToName: targetUserObj?.name || 'Assigned User',
        assignedToEmail: targetUserObj?.email || ''
      };

      if (editingTask) {
        await updateTaskAPI(editingTask._id, payload);
        setActionMessage(`Task "${taskTitle}" updated successfully.`);
      } else {
        const res = await createTaskAPI(payload);
        setActionMessage(res.message || `Task "${taskTitle}" created for ${targetUserObj?.name || 'user'}.`);
      }

      setIsTaskModalOpen(false);
      setTimeout(() => setActionMessage(null), 4000);
      if (onRefreshTasks) onRefreshTasks();
    } catch (err) {
      setActionError(err.message || 'Failed to save task');
      setTimeout(() => setActionError(null), 4000);
    } finally {
      setSavingTask(false);
    }
  };

  // Delete Task as Admin
  const handleDeleteAdminTask = async (taskId, title) => {
    if (!confirm(`Are you sure you want to delete task "${title}"?`)) return;

    try {
      await deleteTaskAPI(taskId);
      setActionMessage(`Task "${title}" deleted.`);
      setTimeout(() => setActionMessage(null), 3000);
      if (onRefreshTasks) onRefreshTasks();
    } catch (err) {
      setActionError(err.message || 'Failed to delete task');
      setTimeout(() => setActionError(null), 4000);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = 
      t.title?.toLowerCase().includes(taskSearch.toLowerCase()) ||
      t.description?.toLowerCase().includes(taskSearch.toLowerCase()) ||
      t.assignedToName?.toLowerCase().includes(taskSearch.toLowerCase()) ||
      t.assignedToEmail?.toLowerCase().includes(taskSearch.toLowerCase());
    const matchesStatus = taskStatusFilter === 'All' || t.status === taskStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Admin Panel Header */}
      <div className="bg-gradient-to-r from-slate-100 via-indigo-50 to-slate-100 dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-900 border border-indigo-500/20 rounded-3xl p-6 sm:p-8 shadow-lg dark:shadow-2xl relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-700 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Full System Admin Privileges</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Admin Control Center
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              Add tasks for all users or individual users, edit and delete any user's task, manage account roles, and monitor cache stats.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenCreateTask}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-lg shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task for Users</span>
            </button>
            <button
              onClick={() => { loadAdminData(); if(onRefreshTasks) onRefreshTasks(); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-medium transition shadow-sm dark:shadow-md"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {actionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Admin KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm dark:shadow-xl">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Users</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{adminStats?.totalUsers ?? users.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm dark:shadow-xl">
          <div>
            <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Administrators</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{adminStats?.totalAdmins ?? users.filter(u => u.role === 'admin').length}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <UserCog className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm dark:shadow-xl">
          <div>
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Banned Users</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{adminStats?.totalBanned ?? users.filter(u => u.isBanned).length}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <Ban className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm dark:shadow-xl">
          <div>
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Total System Tasks</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{tasks?.length || 0}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <ListTodo className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm dark:shadow-xl">
          <div>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">System Mode</p>
            <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mt-2 truncate">
              {adminStats?.databaseMode || 'Active Memory Engine'}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Database className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Global Task Management Section */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Global User Task Management
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Add tasks for all users, modify details, change status or priority, or delete tasks for any account.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search tasks or assignees..."
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <select
              value={taskStatusFilter}
              onChange={(e) => setTaskStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            <button
              onClick={handleOpenCreateTask}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          </div>
        </div>

        {/* Global Tasks Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                <th className="py-3 px-4">Task Title</th>
                <th className="py-3 px-4">Assigned To</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No tasks found matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100 max-w-xs">
                      <div className="truncate">{t.title}</div>
                      {t.description && (
                        <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400 truncate">
                          {t.description}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-medium text-[11px] bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                        <Users className="w-3 h-3 text-indigo-500" />
                        {t.assignedToName || 'All Users'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-[11px] border ${
                        t.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                          : t.status === 'In Progress'
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}>
                        {t.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded font-semibold text-[11px] border ${
                        t.priority === 'High'
                          ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
                          : t.priority === 'Medium'
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}>
                        {t.priority}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {t.category || 'General'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditTask(t)}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition"
                          title="Edit Task for User"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAdminTask(t._id, t.title)}
                          className="p-1.5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition"
                          title="Delete User Task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Management Section */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              User Account Management
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Control permissions, ban or unban standard users, modify passwords, create new accounts, or remove users.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <button
              onClick={handleOpenCreateUser}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition shadow-md shadow-indigo-600/20 flex items-center gap-1.5 shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    No users matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isAdmin = u.role === 'admin';
                  const isBanned = !!u.isBanned;
                  const isSelf = currentUser && (currentUser._id === u._id);

                  return (
                    <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition group">
                      <td className="py-4 px-4 font-medium text-slate-900 dark:text-slate-100 flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          isBanned
                            ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                            : isAdmin 
                            ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30' 
                            : 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30'
                        }`}>
                          {u.name ? u.name[0].toUpperCase() : 'U'}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{u.name}</span>
                          {isSelf && <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">(You)</span>}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-slate-700 dark:text-slate-300 font-mono">{u.email}</td>

                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold text-[11px] border ${
                          isAdmin 
                            ? 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}>
                          {isAdmin ? <ShieldCheck className="w-3 h-3 text-purple-600 dark:text-purple-400" /> : <Users className="w-3 h-3 text-slate-500 dark:text-slate-400" />}
                          {isAdmin ? 'Administrator' : 'User'}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold text-[11px] border ${
                          isBanned
                            ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                        }`}>
                          {isBanned ? (
                            <>
                              <UserX className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                              <span>Banned</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              <span>Active</span>
                            </>
                          )}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenPasswordModal(u)}
                            className="px-2.5 py-1.5 rounded-xl font-medium text-xs transition border bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/20 flex items-center gap-1"
                            title={`Modify password for ${u.name}`}
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Password</span>
                          </button>

                          <button
                            onClick={() => handleToggleRole(u._id, u.role)}
                            disabled={isSelf}
                            className={`px-2.5 py-1.5 rounded-xl font-medium text-xs transition border flex items-center gap-1 ${
                              isSelf
                                ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                                : isAdmin
                                ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                : 'bg-purple-600/10 hover:bg-purple-600/20 text-purple-700 dark:text-purple-300 border-purple-500/30'
                            }`}
                            title={isSelf ? "Cannot alter your own role" : isAdmin ? "Demote to standard User" : "Promote to Administrator"}
                          >
                            <UserCog className="w-3.5 h-3.5" />
                            <span>{isAdmin ? 'Revoke Admin' : 'Make Admin'}</span>
                          </button>

                          <button
                            onClick={() => handleToggleBan(u._id, u.name, isBanned)}
                            disabled={isSelf}
                            className={`px-2.5 py-1.5 rounded-xl font-medium text-xs transition border flex items-center gap-1 ${
                              isSelf
                                ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                                : isBanned
                                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                                : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-500/30'
                            }`}
                            title={isSelf ? "Cannot ban yourself" : isBanned ? "Unban user account" : "Ban user account"}
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>{isBanned ? 'Unban' : 'Ban'}</span>
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            disabled={isSelf}
                            className={`p-1.5 rounded-xl transition border ${
                              isSelf
                                ? 'opacity-50 cursor-not-allowed text-slate-400 border-transparent'
                                : 'hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border-transparent hover:border-rose-500/20'
                            }`}
                            title={isSelf ? "Cannot delete your own account" : "Delete user account"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>{editingTask ? 'Edit Task for User' : 'Create Task for Users'}</span>
              </h2>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAdminTask} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-400 mb-1">
                  Assign To User
                </label>
                <select
                  value={taskAssignee || currentUser?._id || (users[0]?._id)}
                  onChange={(e) => setTaskAssignee(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-indigo-500/30 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-slate-200 font-semibold focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                >
                  {users.map((u) => (
                    <option key={u._id} value={u._id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      👤 {u.name} ({u.email}) {u._id === currentUser?._id ? '(You)' : ''} {u.role === 'admin' ? '[Admin]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-400 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Review Q3 Objectives & Key Results"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-400 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Task instructions and details..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-400 mb-1">Status</label>
                  <select
                    value={taskStatus}
                    onChange={(e) => setTaskStatus(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                  >
                    <option value="Pending" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Pending</option>
                    <option value="In Progress" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">In Progress</option>
                    <option value="Completed" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-400 mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                  >
                    <option value="Low" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Low</option>
                    <option value="Medium" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Medium</option>
                    <option value="High" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-400 mb-1">Category</label>
                  <input
                    type="text"
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-400 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTask}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition text-sm font-medium shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                >
                  {savingTask ? 'Saving...' : editingTask ? 'Save Task Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {isCreateUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Add New User Account</span>
              </h2>
              <button
                onClick={() => setIsCreateUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Sarah Connor"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-400 mb-1">Initial Password</label>
                <div className="relative">
                  <input
                    type={showNewUserPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="At least 6 characters..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-4 pr-10 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewUserPassword(!showNewUserPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showNewUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-400 mb-1">Account Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                  >
                    <option value="user" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Standard User</option>
                    <option value="admin" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Administrator</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newUserVerified}
                      onChange={(e) => setNewUserVerified(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    <span>Auto-Verify Email</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition text-xs font-medium shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {savingUser ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modify User Password Modal */}
      {isPasswordModalOpen && passwordTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-500" />
                <span>Modify User Password</span>
              </h2>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 text-xs text-amber-800 dark:text-amber-300">
              Updating password for <strong>{passwordTargetUser.name}</strong> ({passwordTargetUser.email}).
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-400 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 chars)..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-4 pr-10 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-amber-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white transition text-xs font-medium shadow-lg shadow-amber-600/20 disabled:opacity-50"
                >
                  {savingUser ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
