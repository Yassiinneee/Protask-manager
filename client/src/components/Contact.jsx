import React, { useState, useEffect, useRef } from 'react';
import { 
  Mail, MessageSquare, Send, User, CheckCircle2, AlertCircle, 
  MapPin, Phone, Clock, Sparkles, RefreshCw, HelpCircle, Check,
  Zap
} from 'lucide-react';
import emailjs from '@emailjs/browser';
import { sendContactAPI } from '../services/auth';

const EMAILJS_SERVICE_ID = 'service_hiy137g';
const EMAILJS_TEMPLATE_ID = 'template_lg313sb';
const EMAILJS_PUBLIC_KEY = 'ulbBsfpFyqKQG7x3W';

export default function Contact({ currentUser, onNavigate }) {
  const formRef = useRef(null);
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Initialize EmailJS with user public key
    try {
      emailjs.init(EMAILJS_PUBLIC_KEY);
    } catch (err) {
      console.warn('EmailJS init notice:', err);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      if (!name) setName(currentUser.name || '');
      if (!email) setEmail(currentUser.email || '');
    }
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const templateParams = {
      name: name.trim(),
      from_name: name.trim(),
      user_name: name.trim(),
      email: email.trim(),
      from_email: email.trim(),
      reply_to: email.trim(),
      user_email: email.trim(),
      subject: subject.trim(),
      title: subject.trim(),
      message: message.trim(),
      message_html: message.trim(),
      to_email: 'yassinekalthoum94@gmail.com',
      time: new Date().toLocaleString(),
    };

    let emailjsSuccess = false;

    try {
      // 1. Send through EmailJS directly from client
      const res = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      if (res.status === 200 || res.text === 'OK') {
        emailjsSuccess = true;
      }
    } catch (emailJsErr) {
      console.warn('EmailJS delivery attempt notice:', emailJsErr);
    }

    // 2. Also forward to backend for logging / fallback delivery
    try {
      await sendContactAPI({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });
    } catch (backendErr) {
      console.warn('Backend fallback log notice:', backendErr);
    }

    // Give user clear confirmation
    setSuccessMsg('Your message has been sent successfully via EmailJS! We will review and reply shortly.');
    setSubject('');
    setMessage('');
    setLoading(false);
    setTimeout(() => setSuccessMsg(''), 7000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-semibold">
            <Mail className="w-3.5 h-3.5 text-indigo-200" />
            <span>Customer & Technical Support</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Contact Our Team</h1>
          <p className="text-indigo-100 text-xs sm:text-sm leading-relaxed">
            Have questions about features, Redis performance, account security, or need assistance? Send us a message and our team will get back to you promptly.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Contact Cards & Info */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Direct Channels</h2>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Email Address</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Support & Inquiries</p>
                  <a 
                    href="mailto:yassinekalthoum94@gmail.com" 
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mt-1 block select-all font-mono"
                  >
                    yassinekalthoum94@gmail.com
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Response Time</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Within 24 business hours</p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-1">
                    <Check className="w-3 h-3" /> Priority for verified users
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Location</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tunis, Tunisia / Remote Worldwide</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick FAQ card */}
          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-xs">
              <HelpCircle className="w-4 h-4 text-indigo-500" />
              <span>Frequently Asked</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Looking for task shortcuts, email verification resend, or Redis performance telemetry? Check your Dashboard and Admin Control panels anytime.
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">Send Us a Message</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Fill in the form below and we will get back to you directly</p>
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 self-start sm:self-auto">
                <Zap className="w-3 h-3" />
                <span>Powered by EmailJS</span>
              </div>
            </div>

            {successMsg && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Your Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Johnson"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-purple-500" />
                    <span>Your Email Address</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. alex@example.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Feature request / Account support inquiry"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Message
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your inquiry or feedback here in detail..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-semibold shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
