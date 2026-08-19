import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, CheckCircle2, Clock, AlertCircle, Trash2, Edit2, Search, Filter, Calendar, Tag, 
  ShieldCheck, Database, Zap, RefreshCw, Cpu, LogIn, UserPlus, LogOut, User, LayoutDashboard, Sparkles,
  Sun, Moon, Users, ArrowUpDown, CheckSquare, Flame, AlertTriangle, Check, X, Settings as SettingsIcon,
  Info, Mail, MessageSquare
} from 'lucide-react';
import Login from './components/Login';
import Register from './components/Register';
import AdminPanel from './components/AdminPanel';
import EmailVerification from './components/EmailVerification';
import Settings from './components/Settings';
import About from './components/About';
import Contact from './components/Contact';
import Logo from './components/Logo';
import AiTaskAssistant from './components/AiTaskAssistant';
import TaskDetailModal from './components/TaskDetailModal';
import { getStoredUser, clearAuthData, fetchMeAPI, logoutAPI } from './services/auth';
import { useLanguage, LanguageSwitcherButton } from './context/LanguageContext';

export default function App() {
  const { language, t, formatShortDate, formatDate } = useLanguage();
  const storedUser = getStoredUser();

  const [currentUser, setCurrentUser] = useState(storedUser);
  const [activeTab, setActiveTab] = useState(storedUser ? 'dashboard' : 'register'); // 'register' default for new visitors
  const [welcomeToast, setWelcomeToast] = useState(null);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [loginNotice, setLoginNotice] = useState('');
  const [verificationEmail, setVerificationEmail] = useState('');

  // Theme State (Dark / Light)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Task State
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('deadline-asc');
  
  // Redis state
  const [redisStats, setRedisStats] = useState(null);
  const [cacheHit, setCacheHit] = useState(false);
  const [flushing, setFlushing] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [taskModalError, setTaskModalError] = useState('');
  const [viewingTask, setViewingTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Pending');
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('Development');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [allUsers, setAllUsers] = useState([]);

  // Restore user session on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setActiveTab('verify');
    }

    const verifyUser = async () => {
      try {
        const user = await fetchMeAPI();
        if (user && user.success) {
          setCurrentUser(user.user);
          if (!urlToken) setActiveTab('dashboard');
        } else {
          if (getStoredUser()) {
            clearAuthData();
          }
          setCurrentUser(null);
          if (!urlToken) setActiveTab('register');
        }
      } catch (err) {
        clearAuthData();
        setCurrentUser(null);
        if (!urlToken) setActiveTab('register');
      }
    };
    verifyUser();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks', getAuthHeaders());
      if (response.data.success) {
        setTasks(response.data.data);
        setCacheHit(!!response.data.cacheHit);
      }
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRedisStats = async () => {
    try {
      const res = await axios.get('/api/cache/stats');
      if (res.data.success) {
        setRedisStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch Redis stats', err);
    }
  };

  const handleFlushCache = async () => {
    setFlushing(true);
    try {
      const res = await axios.post('/api/cache/flush');
      if (res.data.success) {
        setRedisStats(res.data.stats);
        await fetchTasks();
      }
    } catch (err) {
      console.error('Failed to flush cache', err);
    } finally {
      setFlushing(false);
    }
  };

  const handleTestRedis = async () => {
    try {
      const res = await axios.post('/api/cache/test');
      if (res.data.success) {
        setTestResult(`Ping success! Key: ${res.data.key}`);
        fetchRedisStats();
        setTimeout(() => setTestResult(null), 4000);
      }
    } catch (err) {
      setTestResult('Ping failed');
      setTimeout(() => setTestResult(null), 4000);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchRedisStats();
  }, [currentUser]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
    setLoginNotice('');
    setWelcomeToast(`Welcome back, ${user.name}!`);
    setTimeout(() => setWelcomeToast(null), 4000);
  };

  const handleRegisterSuccess = ({ requiresVerification, email }) => {
    setRegisteredEmail(email || '');
    if (requiresVerification) {
      setVerificationEmail(email || '');
      setActiveTab('verify');
    } else {
      setLoginNotice(`Account registered successfully! Please log in with your credentials.`);
      setActiveTab('login');
    }
  };

  const handleVerificationSuccess = ({ email, message }) => {
    if (email) setRegisteredEmail(email);
    setLoginNotice(message || 'Email verified successfully! Please enter your password to sign in.');
    setActiveTab('login');
  };

  const handleRequireVerification = ({ email, message }) => {
    setVerificationEmail(email || '');
    setActiveTab('verify');
  };

  const handleLogout = async () => {
    try {
      await logoutAPI();
    } catch (e) {
      clearAuthData();
    }
    setCurrentUser(null);
    setActiveTab('login');
    setWelcomeToast('Logged out successfully');
    setTimeout(() => setWelcomeToast(null), 3000);
    setTasks([]);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  const loadUsersList = async () => {
    try {
      const res = await fetchAllUsersAPI();
      if (res.success) setAllUsers(res.data);
    } catch (err) {
      // Ignore
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      loadUsersList();
    }
  }, [currentUser]);

  const handleOpenCreate = () => {
    if (!currentUser) {
      setWelcomeToast(t('pleaseLoginToCreate'));
      setActiveTab('login');
      setTimeout(() => setWelcomeToast(null), 4000);
      return;
    }
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setStatus('Pending');
    setPriority('Medium');
    setCategory('Development');
    setDueDate(new Date().toISOString().split('T')[0]);
    setAssignedTo(currentUser?._id || '');
    setTaskModalError('');
    if (currentUser?.role === 'admin') loadUsersList();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setTitle(task.title || '');
    setDescription(task.description || '');
    setStatus(task.status || 'Pending');
    setPriority(task.priority || 'Medium');
    setCategory(task.category || 'Development');
    setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
    setAssignedTo(task.assignedTo || currentUser?._id || '');
    setTaskModalError('');
    if (currentUser?.role === 'admin') loadUsersList();
    setIsModalOpen(true);
  };

  const setQuickDeadlineDays = (days) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    setDueDate(targetDate.toISOString().split('T')[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !title.trim()) {
      setTaskModalError(t('taskTitleRequired'));
      return;
    }

    if (isSubmittingTask) return;
    setIsSubmittingTask(true);
    setTaskModalError('');

    let targetAssignedId = assignedTo || currentUser?._id;
    let selectedUserObj = null;
    if (targetAssignedId && allUsers.length > 0) {
      selectedUserObj = allUsers.find(u => u._id === targetAssignedId);
    }
    if (!selectedUserObj && currentUser) {
      selectedUserObj = currentUser;
      targetAssignedId = currentUser._id;
    }

    let formattedDueDate = undefined;
    if (dueDate) {
      const parts = dueDate.split('-');
      if (parts.length === 3) {
        const [y, m, d] = parts.map(Number);
        if (y && m && d) {
          formattedDueDate = new Date(y, m - 1, d, 12, 0, 0).toISOString();
        } else {
          formattedDueDate = new Date(dueDate).toISOString();
        }
      } else {
        formattedDueDate = new Date(dueDate).toISOString();
      }
    }

    const payload = { 
      title: title.trim(), 
      description: description ? description.trim() : '', 
      status, 
      priority, 
      category: category ? category.trim() : 'General', 
      dueDate: formattedDueDate,
      assignedTo: targetAssignedId,
      assignedToName: selectedUserObj?.name || 'Assigned User',
      assignedToEmail: selectedUserObj?.email || ''
    };

    try {
      if (editingTask) {
        const response = await axios.put(`/api/tasks/${editingTask._id}`, payload, getAuthHeaders());
        if (response.data.success) {
          await fetchTasks();
          setWelcomeToast(t('taskUpdatedSuccess'));
          setTimeout(() => setWelcomeToast(null), 3000);
          setIsModalOpen(false);
        }
      } else {
        const response = await axios.post('/api/tasks', payload, getAuthHeaders());
        if (response.data.success) {
          await fetchTasks();
          setWelcomeToast(t('taskCreatedSuccess'));
          setTimeout(() => setWelcomeToast(null), 3000);
          setIsModalOpen(false);
        }
      }
      fetchRedisStats();
    } catch (err) {
      console.error('Failed to save task', err);
      const errMsg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Failed to save task. Please ensure you are logged in.';
      setTaskModalError(errMsg);
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleQuickStatusChange = async (taskId, newStatus) => {
    try {
      const response = await axios.put(`/api/tasks/${taskId}`, { status: newStatus }, getAuthHeaders());
      if (response.data.success) {
        setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
        fetchRedisStats();
        setWelcomeToast(`Status updated to "${newStatus}"`);
        setTimeout(() => setWelcomeToast(null), 2500);
      }
    } catch (err) {
      console.error('Failed to update status', err);
      alert(err.response?.data?.message || 'Failed to update task status.');
    }
  };

  const handleToggleComplete = async (task) => {
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    await handleQuickStatusChange(task._id, nextStatus);
  };

  const handlePromptDelete = (task) => {
    setTaskToDelete(task);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      const response = await axios.delete(`/api/tasks/${taskToDelete._id}`, getAuthHeaders());
      if (response.data.success) {
        setTasks(tasks.filter(t => t._id !== taskToDelete._id));
        fetchRedisStats();
        setWelcomeToast(`Task "${taskToDelete.title}" deleted successfully`);
        setTimeout(() => setWelcomeToast(null), 3000);
      }
      setTaskToDelete(null);
    } catch (err) {
      console.error('Failed to delete task', err);
      const errMsg = err.response?.data?.message || 'Not authorized to delete this task. Only the creator or an administrator can delete it.';
      alert(errMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  const getDeadlineInfo = (dueDateStr, taskStatus) => {
    if (!dueDateStr) return null;
    const dueDateObj = new Date(dueDateStr);
    const now = new Date();
    const dueMidnight = new Date(dueDateObj.getFullYear(), dueDateObj.getMonth(), dueDateObj.getDate());
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = dueMidnight.getTime() - todayMidnight.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    const formattedDate = formatShortDate(dueDateObj);

    if (taskStatus === 'Completed') {
      return {
        type: 'completed',
        label: language === 'fr' ? 'Terminé' : 'Completed',
        formattedDate,
        colorClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
      };
    }

    if (diffDays < 0) {
      const overdueCount = Math.abs(diffDays);
      return {
        type: 'overdue',
        label: language === 'fr' 
          ? `En retard de ${overdueCount} jour${overdueCount > 1 ? 's' : ''}`
          : `Overdue by ${overdueCount} day${overdueCount > 1 ? 's' : ''}`,
        formattedDate,
        colorClass: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 font-semibold'
      };
    } else if (diffDays === 0) {
      return {
        type: 'today',
        label: language === 'fr' ? "Aujourd'hui" : 'Due Today',
        formattedDate,
        colorClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 font-semibold'
      };
    } else if (diffDays === 1) {
      return {
        type: 'tomorrow',
        label: language === 'fr' ? 'Demain' : 'Due Tomorrow',
        formattedDate,
        colorClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 font-medium'
      };
    } else {
      return {
        type: 'upcoming',
        label: language === 'fr' 
          ? `Échéance dans ${diffDays} jours`
          : `Due in ${diffDays} days`,
        formattedDate,
        colorClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
      };
    }
  };

  const availableCategories = ['All', ...Array.from(new Set(tasks.map(t => t.category).filter(Boolean)))];

  const isTaskOverdue = (task) => {
    if (task.status === 'Completed' || !task.dueDate) return false;
    const due = new Date(task.dueDate);
    const now = new Date();
    const dueMidnight = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return dueMidnight < todayMidnight;
  };

  const filteredTasks = tasks
    .filter(task => {
      const searchLower = search.trim().toLowerCase();
      const matchesSearch = !searchLower || (
        task.title.toLowerCase().includes(searchLower) || 
        (task.description && task.description.toLowerCase().includes(searchLower)) ||
        (task.category && task.category.toLowerCase().includes(searchLower)) ||
        (task.assignedToName && task.assignedToName.toLowerCase().includes(searchLower))
      );

      const matchesStatus = 
        statusFilter === 'All' 
          ? true 
          : statusFilter === 'Overdue' 
          ? isTaskOverdue(task) 
          : task.status === statusFilter;

      const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
      const matchesCategory = categoryFilter === 'All' || task.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'deadline-asc') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (sortBy === 'deadline-desc') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(b.dueDate) - new Date(a.dueDate);
      }
      if (sortBy === 'priority-desc' || sortBy === 'priority') {
        const priorityWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      }
      if (sortBy === 'priority-asc') {
        const priorityWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return (priorityWeight[a.priority] || 0) - (priorityWeight[b.priority] || 0);
      }
      if (sortBy === 'status') {
        const statusWeight = { 'Pending': 1, 'In Progress': 2, 'Completed': 3 };
        return (statusWeight[a.status] || 0) - (statusWeight[b.status] || 0);
      }
      if (sortBy === 'title-asc' || sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'title-desc') {
        return b.title.localeCompare(a.title);
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      // default: newest
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  const overdueCount = tasks.filter(isTaskOverdue).length;

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'Pending').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    completed: tasks.filter(t => t.status === 'Completed').length,
    overdue: overdueCount
  };

  const hasActiveFilters = search.trim() !== '' || statusFilter !== 'All' || priorityFilter !== 'All' || categoryFilter !== 'All';

  const resetAllFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setPriorityFilter('All');
    setCategoryFilter('All');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Toast Notification */}
      {welcomeToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-500/20 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 backdrop-blur animate-fade-in">
          <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-medium">{welcomeToast}</span>
        </div>
      )}

      {/* Navigation Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
          {/* Interactive Modern Brand Logo */}
          <Logo 
            variant="header"
            onClick={() => setActiveTab('dashboard')} 
            className="cursor-pointer"
          />

          {/* Nav Tabs, Theme Toggle, Language Switcher & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher Button - visible on all pages */}
            <LanguageSwitcherButton />

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 transition shadow-sm flex items-center gap-2 text-xs font-semibold cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden md:inline">{t('lightMode')}</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600" />
                  <span className="hidden md:inline">{t('darkMode')}</span>
                </>
              )}
            </button>

            <nav className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              {currentUser ? (
                <>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                      activeTab === 'dashboard'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-900'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('dashboard')}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('about')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                      activeTab === 'about'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-900'
                    }`}
                  >
                    <Info className="w-4 h-4" />
                    <span>{t('about')}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('contact')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                      activeTab === 'contact'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-900'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    <span>{t('contact')}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                      activeTab === 'settings'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-900'
                    }`}
                  >
                    <SettingsIcon className="w-4 h-4" />
                    <span>{t('settings')}</span>
                  </button>

                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => setActiveTab('admin')}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                        activeTab === 'admin'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-200 hover:bg-slate-200 dark:hover:bg-slate-900'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span>{t('adminControl')}</span>
                    </button>
                  )}

                  <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800/80">
                    <button
                      onClick={() => setActiveTab('settings')}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition cursor-pointer"
                      title="View & Edit Profile Settings"
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        currentUser.role === 'admin'
                          ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                          : 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-400'
                      }`}>
                        {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                      </div>
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
                        {currentUser.name}
                      </span>
                      {currentUser.role === 'admin' && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                          Admin
                        </span>
                      )}
                    </button>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/25 hover:border-rose-500/40 rounded-xl transition text-xs font-semibold shadow-xs cursor-pointer"
                      title="Log Out of your account"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('logout')}</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setActiveTab('login')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                      activeTab === 'login'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-900'
                    }`}
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{t('login')}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('register')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                      activeTab === 'register'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-900'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{t('register')}</span>
                  </button>

                  {activeTab === 'verify' && (
                    <button
                      onClick={() => setActiveTab('verify')}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-emerald-600 text-white shadow-md cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{t('verifyEmail')}</span>
                    </button>
                  )}
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main View Router */}
      {activeTab === 'about' ? (
        <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full space-y-8">
          <About onNavigate={(tab) => setActiveTab(tab)} />
        </main>
      ) : activeTab === 'contact' ? (
        <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full space-y-8">
          <Contact currentUser={currentUser} onNavigate={(tab) => setActiveTab(tab)} />
        </main>
      ) : !currentUser ? (
        activeTab === 'login' ? (
          <main className="flex-1 flex items-center justify-center p-6">
            <Login
              onLoginSuccess={handleLoginSuccess}
              onSwitchToRegister={() => {
                setLoginNotice('');
                setActiveTab('register');
              }}
              onRequireVerification={handleRequireVerification}
              initialEmail={registeredEmail}
              noticeMessage={loginNotice}
            />
          </main>
        ) : activeTab === 'verify' ? (
          <main className="flex-1 flex items-center justify-center p-6">
            <EmailVerification
              email={verificationEmail}
              onVerificationSuccess={handleVerificationSuccess}
              onSwitchToLogin={() => setActiveTab('login')}
            />
          </main>
        ) : (
          <main className="flex-1 flex items-center justify-center p-6">
            <Register
              onRegisterSuccess={handleRegisterSuccess}
              onSwitchToLogin={() => setActiveTab('login')}
            />
          </main>
        )
      ) : activeTab === 'settings' ? (
        /* Settings View */
        <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full space-y-8">
          <Settings
            currentUser={currentUser}
            onUserUpdated={(updated) => {
              setCurrentUser(updated);
              setWelcomeToast('Profile updated successfully!');
              setTimeout(() => setWelcomeToast(null), 3000);
            }}
          />
        </main>
      ) : activeTab === 'admin' && currentUser?.role === 'admin' ? (
        /* Admin View */
        <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full space-y-8">
          <AdminPanel
            tasks={tasks}
            onRefreshTasks={fetchTasks}
            redisStats={redisStats}
            onFlushCache={handleFlushCache}
            onTestRedis={handleTestRedis}
          />
        </main>
      ) : (
        /* Dashboard View */
        <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full space-y-8">
          {/* Redis Cache Control Banner */}
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-xl relative overflow-hidden transition">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                  <Zap className="w-5 h-5 fill-red-500 dark:fill-red-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-slate-900 dark:text-white">Redis High-Speed Caching Layer</h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${cacheHit ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'}`}>
                      {cacheHit ? '⚡ Last Fetch: Cache Hit' : '🔄 Last Fetch: DB / Fresh'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Mode: <span className="text-slate-900 dark:text-slate-200 font-medium">{redisStats?.mode || 'Active'}</span> • Hits: <span className="text-emerald-600 dark:text-emerald-400 font-medium">{redisStats?.hits ?? 0}</span> • Misses: <span className="text-amber-600 dark:text-amber-400 font-medium">{redisStats?.misses ?? 0}</span> • Hit Ratio: <span className="text-indigo-600 dark:text-indigo-400 font-medium">{redisStats?.hitRatio ?? '0%'}</span> • Cached Keys: <span className="text-slate-800 dark:text-slate-300 font-medium">{redisStats?.keysCount ?? 0}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={handleTestRedis}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 transition"
                  title="Test Redis set/get operation"
                >
                  <Cpu className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Ping Redis</span>
                </button>

                <button
                  onClick={handleFlushCache}
                  disabled={flushing}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs font-medium text-red-600 dark:text-red-400 transition"
                  title="Purge all Redis cache keys"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${flushing ? 'animate-spin' : ''}`} />
                  <span>Purge Cache</span>
                </button>
              </div>
            </div>

            {testResult && (
              <div className="mt-3 text-xs px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-mono">
                {testResult}
              </div>
            )}
          </div>

          {/* Task Stats Row with 1-click Filter Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <button
              onClick={() => setStatusFilter('All')}
              className={`p-4 rounded-2xl border text-left transition flex items-center justify-between shadow-sm dark:shadow-none ${
                statusFilter === 'All'
                  ? 'bg-slate-900 text-white dark:bg-indigo-600 dark:text-white border-slate-900 dark:border-indigo-500 shadow-md'
                  : 'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
                <p className={`text-xs font-medium uppercase tracking-wider ${statusFilter === 'All' ? 'text-slate-300 dark:text-indigo-200' : 'text-slate-500 dark:text-slate-400'}`}>Total Tasks</p>
                <h3 className={`text-2xl font-bold mt-1 ${statusFilter === 'All' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{taskStats.total}</h3>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${statusFilter === 'All' ? 'bg-white/10 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                <Calendar className="w-5 h-5" />
              </div>
            </button>

            <button
              onClick={() => setStatusFilter(statusFilter === 'Pending' ? 'All' : 'Pending')}
              className={`p-4 rounded-2xl border text-left transition flex items-center justify-between shadow-sm dark:shadow-none ${
                statusFilter === 'Pending'
                  ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20'
                  : 'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-amber-500/50'
              }`}
            >
              <div>
                <p className={`text-xs font-medium uppercase tracking-wider ${statusFilter === 'Pending' ? 'text-amber-100' : 'text-amber-600 dark:text-amber-400'}`}>Pending</p>
                <h3 className={`text-2xl font-bold mt-1 ${statusFilter === 'Pending' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{taskStats.pending}</h3>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${statusFilter === 'Pending' ? 'bg-white/20 text-white' : 'bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400'}`}>
                <Clock className="w-5 h-5" />
              </div>
            </button>

            <button
              onClick={() => setStatusFilter(statusFilter === 'In Progress' ? 'All' : 'In Progress')}
              className={`p-4 rounded-2xl border text-left transition flex items-center justify-between shadow-sm dark:shadow-none ${
                statusFilter === 'In Progress'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                  : 'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-blue-500/50'
              }`}
            >
              <div>
                <p className={`text-xs font-medium uppercase tracking-wider ${statusFilter === 'In Progress' ? 'text-blue-100' : 'text-blue-600 dark:text-blue-400'}`}>In Progress</p>
                <h3 className={`text-2xl font-bold mt-1 ${statusFilter === 'In Progress' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{taskStats.inProgress}</h3>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${statusFilter === 'In Progress' ? 'bg-white/20 text-white' : 'bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400'}`}>
                <AlertCircle className="w-5 h-5" />
              </div>
            </button>

            <button
              onClick={() => setStatusFilter(statusFilter === 'Completed' ? 'All' : 'Completed')}
              className={`p-4 rounded-2xl border text-left transition flex items-center justify-between shadow-sm dark:shadow-none ${
                statusFilter === 'Completed'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                  : 'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-emerald-500/50'
              }`}
            >
              <div>
                <p className={`text-xs font-medium uppercase tracking-wider ${statusFilter === 'Completed' ? 'text-emerald-100' : 'text-emerald-600 dark:text-emerald-400'}`}>Completed</p>
                <h3 className={`text-2xl font-bold mt-1 ${statusFilter === 'Completed' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{taskStats.completed}</h3>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${statusFilter === 'Completed' ? 'bg-white/20 text-white' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'}`}>
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </button>

            <button
              onClick={() => setStatusFilter(statusFilter === 'Overdue' ? 'All' : 'Overdue')}
              className={`p-4 rounded-2xl border text-left transition flex items-center justify-between shadow-sm dark:shadow-none ${
                statusFilter === 'Overdue'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20'
                  : 'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-rose-500/50'
              }`}
            >
              <div>
                <p className={`text-xs font-medium uppercase tracking-wider ${statusFilter === 'Overdue' ? 'text-rose-100' : 'text-rose-600 dark:text-rose-400'}`}>Overdue</p>
                <h3 className={`text-2xl font-bold mt-1 ${
                  statusFilter === 'Overdue' ? 'text-white' : taskStats.overdue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
                }`}>{taskStats.overdue}</h3>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                statusFilter === 'Overdue' 
                  ? 'bg-white/20 text-white' 
                  : taskStats.overdue > 0 
                  ? 'bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 animate-pulse' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
            </button>
          </div>

          {/* Quick Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setStatusFilter('All')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === 'All'
                  ? 'bg-slate-900 text-white dark:bg-indigo-600 dark:text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>All Tasks</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${statusFilter === 'All' ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>{taskStats.total}</span>
            </button>

            <button
              onClick={() => setStatusFilter('Pending')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === 'Pending'
                  ? 'bg-amber-500 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Pending</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${statusFilter === 'Pending' ? 'bg-white/20' : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'}`}>{taskStats.pending}</span>
            </button>

            <button
              onClick={() => setStatusFilter('In Progress')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === 'In Progress'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10'
              }`}
            >
              <AlertCircle className="w-3 h-3" />
              <span>In Progress</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${statusFilter === 'In Progress' ? 'bg-white/20' : 'bg-blue-500/15 text-blue-700 dark:text-blue-300'}`}>{taskStats.inProgress}</span>
            </button>

            <button
              onClick={() => setStatusFilter('Completed')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === 'Completed'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Completed</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${statusFilter === 'Completed' ? 'bg-white/20' : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'}`}>{taskStats.completed}</span>
            </button>

            <button
              onClick={() => setStatusFilter('Overdue')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === 'Overdue'
                  ? 'bg-rose-600 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Overdue</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${statusFilter === 'Overdue' ? 'bg-white/20' : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'}`}>{taskStats.overdue}</span>
            </button>
          </div>

          {/* Toolbar & Filters */}
          <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between bg-white dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tasks by title, description or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-10 py-2 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Status Filter Dropdown */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl">
                <Filter className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-xs font-medium text-slate-800 dark:text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="All" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">All Statuses</option>
                  <option value="Pending" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Pending</option>
                  <option value="In Progress" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">In Progress</option>
                  <option value="Completed" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Completed</option>
                  <option value="Overdue" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Overdue Only</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl">
                <Tag className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="bg-transparent text-xs font-medium text-slate-800 dark:text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="All" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">All Priorities</option>
                  <option value="Low" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Low Priority</option>
                  <option value="Medium" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Medium Priority</option>
                  <option value="High" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">High Priority</option>
                </select>
              </div>

              {/* Category Filter */}
              {availableCategories.length > 2 && (
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-transparent text-xs font-medium text-slate-800 dark:text-slate-300 focus:outline-none cursor-pointer"
                  >
                    {availableCategories.map(cat => (
                      <option key={cat} value={cat} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                        {cat === 'All' ? 'All Categories' : `📁 ${cat}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Sort By Dropdown with comprehensive options */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl">
                <ArrowUpDown className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-xs font-medium text-slate-800 dark:text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="deadline-asc" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">📅 Deadline (Soonest first)</option>
                  <option value="deadline-desc" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">📅 Deadline (Latest first)</option>
                  <option value="priority-desc" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">⚡ Priority (High → Low)</option>
                  <option value="priority-asc" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">⚡ Priority (Low → High)</option>
                  <option value="status" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">🔄 Status (Pending → Done)</option>
                  <option value="newest" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">✨ Newest Created</option>
                  <option value="oldest" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">⏳ Oldest Created</option>
                  <option value="title-asc" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">🔤 Title (A to Z)</option>
                  <option value="title-desc" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">🔤 Title (Z to A)</option>
                </select>
              </div>

              <button
                onClick={handleOpenCreate}
                className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-medium text-xs sm:text-sm transition shadow-md shadow-indigo-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>New Task</span>
              </button>
            </div>
          </div>

          {/* Active Filter Chips & Clear All */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-600 dark:text-slate-400 animate-fade-in">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-slate-500">Active Filters:</span>
                {search && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-medium">
                    Search: "{search}"
                    <button onClick={() => setSearch('')} className="hover:text-indigo-900 dark:hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {statusFilter !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 font-medium">
                    Status: {statusFilter}
                    <button onClick={() => setStatusFilter('All')} className="hover:text-amber-900 dark:hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {priorityFilter !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 font-medium">
                    Priority: {priorityFilter}
                    <button onClick={() => setPriorityFilter('All')} className="hover:text-purple-900 dark:hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {categoryFilter !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 font-medium">
                    Category: {categoryFilter}
                    <button onClick={() => setCategoryFilter('All')} className="hover:text-blue-900 dark:hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-slate-500">
                  Showing <strong>{filteredTasks.length}</strong> of <strong>{tasks.length}</strong> tasks
                </span>
                <button
                  onClick={resetAllFilters}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  Reset all filters
                </button>
              </div>
            </div>
          )}

          {/* Task List / Grid */}
          {loading ? (
            <div className="text-center py-20 text-slate-500">Loading tasks from database...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/60 rounded-3xl shadow-sm dark:shadow-none p-8">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-4">
                <CheckSquare className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No tasks found</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                {search || statusFilter !== 'All' || priorityFilter !== 'All' || categoryFilter !== 'All'
                  ? 'No tasks match your current filter criteria. Try resetting filters.'
                  : 'You have no tasks in your list. Get started by creating your first task!'}
              </p>
              <button
                onClick={handleOpenCreate}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-indigo-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Task</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTasks.map((task) => {
                const isCompleted = task.status === 'Completed';
                const deadlineInfo = getDeadlineInfo(task.dueDate, task.status);

                const statusBadgeStyle =
                  task.status === 'Completed'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                    : task.status === 'In Progress'
                    ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30'
                    : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30';

                const priorityColor =
                  task.priority === 'High'
                    ? 'text-rose-700 dark:text-rose-300 bg-rose-500/15 border-rose-500/30'
                    : task.priority === 'Medium'
                    ? 'text-amber-700 dark:text-amber-300 bg-amber-500/15 border-amber-500/30'
                    : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';

                const isCreator = task.user === currentUser?._id || (task.createdBy && task.createdBy.includes(currentUser?.name));
                const isAssignedToMe = task.assignedTo === currentUser?._id;

                return (
                  <div
                    key={task._id}
                    className={`bg-white dark:bg-slate-900/80 border rounded-2xl p-5 flex flex-col justify-between transition shadow-sm hover:shadow-md ${
                      isCompleted 
                        ? 'border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/10' 
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-3.5">
                      {/* Top Badges Row */}
                      <div className="flex items-start justify-between gap-2">
                        {/* Quick Status Select */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleComplete(task)}
                            className={`p-1 rounded-lg border transition ${
                              isCompleted 
                                ? 'bg-emerald-600 text-white border-emerald-600' 
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'
                            }`}
                            title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
                          >
                            <Check className="w-3.5 h-3.5 font-bold" />
                          </button>

                          <select
                            value={task.status}
                            onChange={(e) => handleQuickStatusChange(task._id, e.target.value)}
                            className={`text-xs px-2 py-1 rounded-lg border font-semibold cursor-pointer focus:outline-none ${statusBadgeStyle}`}
                          >
                            <option value="Pending" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Pending</option>
                            <option value="In Progress" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">In Progress</option>
                            <option value="Completed" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Completed</option>
                          </select>
                        </div>

                        {/* Priority Badge & Ownership */}
                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                          {isCreator && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                              My Task
                            </span>
                          )}
                          {isAssignedToMe && !isCreator && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                              Assigned to Me
                            </span>
                          )}
                          <span className={`text-[11px] px-2 py-0.5 rounded-md border font-semibold ${priorityColor}`}>
                            {task.priority === 'High' && '🔥 '}
                            {task.priority}
                          </span>
                        </div>
                      </div>

                      {/* Title & Description (Clickable for full AI details) */}
                      <div 
                        onClick={() => setViewingTask(task)}
                        className="cursor-pointer group/title"
                      >
                        <h3 className={`text-base font-bold tracking-tight group-hover/title:text-indigo-600 dark:group-hover/title:text-indigo-400 transition ${
                          isCompleted 
                            ? 'line-through text-slate-400 dark:text-slate-500' 
                            : 'text-slate-900 dark:text-white'
                        }`}>
                          {task.title}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mt-1.5 leading-relaxed">
                          {task.description || 'No description provided. Click to view or generate details with AI.'}
                        </p>
                      </div>

                      {/* Deadline Countdown & Category Tag */}
                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        {deadlineInfo && (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs ${deadlineInfo.colorClass}`}>
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            <span>{deadlineInfo.label}</span>
                          </span>
                        )}

                        {task.category && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700">
                            📁 {task.category}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Footer Row */}
                    <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span className="text-[11px]">
                          {task.dueDate 
                            ? formatShortDate(task.dueDate)
                            : (language === 'fr' ? 'Aucune échéance' : 'No deadline')}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(task)}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition"
                          title="Edit Task"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handlePromptDelete(task)}
                          className="p-1.5 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg text-slate-400 transition"
                          title="Delete Task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/80 backdrop-blur-xs shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
                  {editingTask ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingTask ? t('editTaskDetails') : t('createNewTask')}
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {editingTask ? 'Update task attributes and specifications' : 'Define task details, timeline and assignment'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center text-sm font-semibold transition"
                title="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {/* In-Modal Error Alert */}
              {taskModalError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="font-medium">{taskModalError}</span>
                </div>
              )}

              {/* Admin Assignment Field */}
              {currentUser?.role === 'admin' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <span>{t('assignToUser')}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">Admin</span>
                  </label>
                  <select
                    value={assignedTo || currentUser?._id}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-indigo-500/30 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-200 font-semibold focus:outline-none focus:border-indigo-500 transition"
                  >
                    {allUsers.map((u) => (
                      <option key={u._id} value={u._id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                        👤 {u.name} ({u.email}) {u._id === currentUser?._id ? '(You)' : ''} {u.role === 'admin' ? '[Admin]' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Task Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('taskTitle')} <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (taskModalError) setTaskModalError('');
                  }}
                  placeholder={t('taskTitlePlaceholder')}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t('taskDescription')}
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {t('markdownSupported')}
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('taskDescPlaceholder')}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-y font-normal leading-relaxed"
                />

                {/* AI Description Assistant */}
                <AiTaskAssistant
                  title={title}
                  currentDescription={description}
                  category={category}
                  priority={priority}
                  onApplyDescription={(newDesc) => setDescription(newDesc)}
                  onApplyCategory={(newCat) => setCategory(newCat)}
                />
              </div>

              {/* Status & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('categoryLabel') || 'Status'}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                  >
                    <option value="Pending" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{t('statusPending')}</option>
                    <option value="In Progress" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{t('statusInProgress')}</option>
                    <option value="Completed" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{t('statusCompleted')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('priorityHigh') ? 'Priority' : 'Priorité'}
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                  >
                    <option value="Low" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">🟢 {t('priorityLow')}</option>
                    <option value="Medium" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">🟡 {t('priorityMedium')}</option>
                    <option value="High" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">🔴 {t('priorityHigh')} (🔥 Urgent)</option>
                  </select>
                </div>
              </div>

              {/* Category with Quick Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('categoryLabel')}
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder={t('categoryPlaceholder')}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                />
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  {['Development', 'Design', 'QA', 'Bug Fix', 'General'].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                        category === cat 
                          ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 font-semibold' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Due Date & Deadline with Presets */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t('deadlineDue')}
                  </label>
                  {dueDate && (
                    <button
                      type="button"
                      onClick={() => setDueDate('')}
                      className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                    >
                      {t('clearDeadline')}
                    </button>
                  )}
                </div>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                />
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">{t('quickSet')}:</span>
                  {[
                    { label: t('today'), days: 0 },
                    { label: t('tomorrow'), days: 1 },
                    { label: t('in3Days'), days: 3 },
                    { label: t('in1Week'), days: 7 },
                    { label: t('in2Weeks'), days: 14 }
                  ].map(preset => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setQuickDeadlineDays(preset.days)}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Buttons (Sticky Footer) */}
              <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 sticky bottom-0 bg-white/95 dark:bg-slate-900/95 py-2 -mx-6 px-6 backdrop-blur-xs">
                <button
                  type="button"
                  disabled={isSubmittingTask}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-sm font-medium cursor-pointer disabled:opacity-50"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTask}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition text-sm font-semibold shadow-lg shadow-indigo-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
                >
                  {isSubmittingTask && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>{isSubmittingTask ? t('saving') : (editingTask ? t('saveChangesBtn') : t('createTaskBtn'))}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {viewingTask && (
        <TaskDetailModal
          task={viewingTask}
          currentUser={currentUser}
          onClose={() => setViewingTask(null)}
          onEdit={(t) => {
            setViewingTask(null);
            handleOpenEdit(t);
          }}
          onToggleComplete={(t) => {
            handleToggleComplete(t);
            setViewingTask((prev) => prev ? { ...prev, status: prev.status === 'Completed' ? 'Pending' : 'Completed' } : null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Task?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{taskToDelete.title}</p>
              {taskToDelete.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{taskToDelete.description}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setTaskToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition text-sm font-semibold shadow-lg shadow-rose-600/20 disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Application Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/40 backdrop-blur py-6 px-6">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Security in Depth Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Security in Depth Architecture:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-medium">
                JWT Auth
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                Rate-Limiting
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-medium">
                HTTP-Only Session Cookies
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium">
                HPP & XSS Sanitization
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-medium">
                Helmet Headers
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Logo variant="footer" onClick={() => setActiveTab('dashboard')} />
              <span>• {t('taskMasterFooter')}</span>
            </div>
            <div className="flex items-center gap-5">
              <button
                onClick={() => setActiveTab('about')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer font-medium"
              >
                {t('about')}
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer font-medium"
              >
                {t('contact')}
              </button>
              {currentUser && (
                <button
                  onClick={() => setActiveTab('settings')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer font-medium"
                >
                  {t('settings')}
                </button>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}