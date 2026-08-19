import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    locale: 'en-US',
    greetingMorning: 'Good Morning',
    greetingAfternoon: 'Good Afternoon',
    greetingEvening: 'Good Evening',
    timeFormat12: '12-hour',
    timeFormat24: '24-hour',
    toggleTimeFormat: 'Click to toggle 12h / 24h format',
    liveSystemSync: 'Live System Sync',
    tzLabel: 'TZ',
    
    // Auth & Creator signature
    proTaskManager: 'Pro Task Manager',
    buildingBy: 'building By',
    creatorName: 'Yassine Kalthoum',
    withWord: 'with',
    loveWord: 'love',
    usingWord: 'using',
    allRightsReserved: 'All rights reserved.',
    copyrightNotice: 'Pro Task Manager. All rights reserved.',
    lovedTooltip: 'You loved this project!',
    clickToSendLove: 'Click to send love',
    
    // Header & Navigation
    dashboard: 'Dashboard',
    about: 'About',
    contact: 'Contact',
    settings: 'Settings',
    adminControl: 'Admin Control',
    login: 'Log In',
    register: 'Register',
    verifyEmail: 'Verify Email',
    logout: 'Logout',
    lightMode: 'Light',
    darkMode: 'Dark',
    switchLanguage: 'Changer en Français',
    currentLanguageLabel: 'English',
    
    // Task properties
    statusPending: 'Pending',
    statusInProgress: 'In Progress',
    statusCompleted: 'Completed',
    priorityLow: 'Low',
    priorityMedium: 'Medium',
    priorityHigh: 'High',
    deadline: 'Deadline',
    created: 'Created',
    owner: 'Owner / Creator',
    noDeadline: 'No deadline set',
    teamMember: 'Team Member',
    markComplete: 'Mark as Complete',
    markIncomplete: 'Mark as Incomplete',
    editAiAssist: 'Edit & AI Assist',
    close: 'Close',
    taskDescriptionObjectives: 'Task Description & Objectives',
    noDescription: 'No description provided for this task.',
    
    // Enterprise footer
    taskMasterFooter: 'Enterprise Task Management',

    // Task Creation & Editing Modal
    createNewTask: 'Create New Task',
    editTaskDetails: 'Edit Task Details',
    taskTitle: 'Task Title',
    taskTitleRequired: 'Task Title is required',
    taskTitlePlaceholder: 'e.g. Implement user authentication endpoints',
    taskDescription: 'Task Description',
    taskDescPlaceholder: 'Describe task details, objectives, criteria, definition of done...',
    markdownSupported: 'Markdown supported',
    categoryLabel: 'Category',
    categoryPlaceholder: 'e.g. Development, Design, QA, Bug Fix, General...',
    deadlineDue: 'Deadline / Due Date',
    quickSet: 'Quick Set',
    today: 'Today',
    tomorrow: 'Tomorrow',
    in3Days: '+3 Days',
    in1Week: '+1 Week',
    in2Weeks: '+2 Weeks',
    clearDeadline: 'Clear Date',
    assignToUser: 'Assign To User',
    cancel: 'Cancel',
    createTaskBtn: 'Create Task',
    saveChangesBtn: 'Save Changes',
    saving: 'Saving...',
    taskCreatedSuccess: 'Task created successfully!',
    taskUpdatedSuccess: 'Task updated successfully!',
    pleaseLoginToCreate: 'Please log in or create an account to save personal tasks.',
  },
  fr: {
    locale: 'fr-FR',
    greetingMorning: 'Bonjour',
    greetingAfternoon: 'Bon après-midi',
    greetingEvening: 'Bonsoir',
    timeFormat12: 'Format 12h',
    timeFormat24: 'Format 24h',
    toggleTimeFormat: 'Cliquez pour basculer entre 12h et 24h',
    liveSystemSync: 'Synchronisation Système en Direct',
    tzLabel: 'Fuseau',
    
    // Auth & Creator signature
    proTaskManager: 'Pro Task Manager',
    buildingBy: 'créé par',
    creatorName: 'Yassine Kalthoum',
    withWord: 'avec',
    loveWord: 'amour',
    usingWord: 'avec la suite',
    allRightsReserved: 'Tous droits réservés.',
    copyrightNotice: 'Pro Task Manager. Tous droits réservés.',
    lovedTooltip: 'Vous avez aimé ce projet !',
    clickToSendLove: 'Cliquez pour envoyer votre soutien',
    
    // Header & Navigation
    dashboard: 'Tableau de bord',
    about: 'À propos',
    contact: 'Contact',
    settings: 'Paramètres',
    adminControl: 'Administration',
    login: 'Connexion',
    register: "S'inscrire",
    verifyEmail: "Vérifier l'e-mail",
    logout: 'Déconnexion',
    lightMode: 'Clair',
    darkMode: 'Sombre',
    switchLanguage: 'Switch to English',
    currentLanguageLabel: 'Français',
    
    // Task properties
    statusPending: 'En attente',
    statusInProgress: 'En cours',
    statusCompleted: 'Terminé',
    priorityLow: 'Faible',
    priorityMedium: 'Moyen',
    priorityHigh: 'Élevée',
    deadline: 'Date limite',
    created: 'Création',
    owner: 'Propriétaire / Créateur',
    noDeadline: 'Aucune échéance fixée',
    teamMember: "Membre de l'équipe",
    markComplete: 'Marquer comme terminé',
    markIncomplete: 'Marquer comme non terminé',
    editAiAssist: 'Modifier & Assistant IA',
    close: 'Fermer',
    taskDescriptionObjectives: 'Description & Objectifs de la tâche',
    noDescription: 'Aucune description fournie pour cette tâche.',
    
    // Enterprise footer
    taskMasterFooter: 'Gestion des Tâches d’Entreprise',

    // Task Creation & Editing Modal
    createNewTask: 'Créer une nouvelle tâche',
    editTaskDetails: 'Modifier les détails de la tâche',
    taskTitle: 'Titre de la tâche',
    taskTitleRequired: 'Le titre de la tâche est obligatoire',
    taskTitlePlaceholder: "ex. Développer les points d'API d'authentification",
    taskDescription: 'Description de la tâche',
    taskDescPlaceholder: 'Décrivez les détails, objectifs, critères et livrables...',
    markdownSupported: 'Format Markdown supporté',
    categoryLabel: 'Catégorie',
    categoryPlaceholder: 'ex. Développement, Design, QA, Correctif, Général...',
    deadlineDue: 'Date limite / Échéance',
    quickSet: 'Raccourcis',
    today: "Aujourd'hui",
    tomorrow: 'Demain',
    in3Days: '+3 Jours',
    in1Week: '+1 Semaine',
    in2Weeks: '+2 Semaines',
    clearDeadline: 'Effacer date',
    assignToUser: 'Attribuer à un utilisateur',
    cancel: 'Annuler',
    createTaskBtn: 'Créer la tâche',
    saveChangesBtn: 'Enregistrer les modifications',
    saving: 'Enregistrement...',
    taskCreatedSuccess: 'Tâche créée avec succès !',
    taskUpdatedSuccess: 'Tâche mise à jour avec succès !',
    pleaseLoginToCreate: 'Veuillez vous connecter ou créer un compte pour enregistrer des tâches.',
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('app_language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('app_language', language);
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'fr' : 'en'));
  };

  const setLang = (lang) => {
    if (lang === 'en' || lang === 'fr') {
      setLanguage(lang);
    }
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  const formatDate = (dateInput, options = {}) => {
    if (!dateInput) return '';
    try {
      const date = typeof dateInput === 'string' || typeof dateInput === 'number' 
        ? new Date(dateInput) 
        : dateInput;
      
      if (isNaN(date.getTime())) return '';

      const locale = language === 'fr' ? 'fr-FR' : 'en-US';
      const defaultOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };

      return date.toLocaleDateString(locale, { ...defaultOptions, ...options });
    } catch {
      return String(dateInput);
    }
  };

  const formatShortDate = (dateInput) => {
    if (!dateInput) return '';
    try {
      const date = typeof dateInput === 'string' || typeof dateInput === 'number' 
        ? new Date(dateInput) 
        : dateInput;
      if (isNaN(date.getTime())) return '';

      const locale = language === 'fr' ? 'fr-FR' : 'en-US';
      return date.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return String(dateInput);
    }
  };

  return (
    <LanguageContext.Provider 
      value={{ 
        language, 
        toggleLanguage, 
        setLanguage: setLang, 
        t, 
        formatDate,
        formatShortDate
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      language: 'en',
      toggleLanguage: () => {},
      setLanguage: () => {},
      t: (key) => translations.en[key] || key,
      formatDate: (d, opt) => new Date(d).toLocaleDateString('en-US', opt || { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      formatShortDate: (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
  }
  return context;
}

export function LanguageSwitcherButton({ className = '' }) {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      title={language === 'en' ? 'Passer en Français' : 'Switch to English'}
      className={`px-3 py-2 rounded-2xl border transition shadow-xs flex items-center gap-1.5 text-xs font-bold cursor-pointer select-none ${
        language === 'fr'
          ? 'bg-gradient-to-r from-blue-500/15 via-white/10 to-red-500/15 border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/25'
          : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-800'
      } ${className}`}
    >
      <span className="text-sm">🌐</span>
      <span className="uppercase tracking-wider">{language === 'en' ? 'EN' : 'FR'}</span>
      <span className="text-[10px] text-slate-400 font-normal">
        {language === 'en' ? '→ FR' : '→ EN'}
      </span>
    </button>
  );
}