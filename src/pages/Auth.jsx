import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  BrainCircuit, 
  PhoneCall, 
  GitBranch, 
  Calendar, 
  ArrowRight, 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false); // Toggle between Login & Signup
  const [showPassword, setShowPassword] = useState(false);
  
  // 5 Client Testimonials state for rotation
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  const clients = [
    {
      quote: "Vetta completely collapsed our SDR ramp time. The AI handles voicemails and dead numbers, and my team only talks to live prospects.",
      name: "Michael Johnson",
      role: "VP Sales, TechFlow SaaS",
      initials: "MJ",
      bg: "from-orange-400 to-orange-600"
    },
    {
      quote: "We replaced two separate dialing tools with Vetta. Our live conversation rate tripled in the first week alone.",
      name: "Priya Nair",
      role: "VP Sales, Brightwave Logistics",
      initials: "PN",
      bg: "from-indigo-400 to-indigo-600"
    },
    {
      quote: "The compliance guardrails give us total peace of mind. DNC scrubbing and local calling windows work seamlessly out of the box.",
      name: "Marcus Webb",
      role: "Head of RevOps, Orbit Inc",
      initials: "MW",
      bg: "from-teal-400 to-teal-600"
    },
    {
      quote: "Auto-booking meetings directly to our AEs' calendars with full AI summaries attached has doubled our closing efficiency.",
      name: "Sara Ellison",
      role: "CRO, Cleo Health",
      initials: "SE",
      bg: "from-purple-400 to-purple-600"
    },
    {
      quote: "The multi-channel workflow builder combined with the live voice bridge is lightyears ahead of any traditional sales tool.",
      name: "Jacob Tan",
      role: "Director of Growth, Foundry Labs",
      initials: "JT",
      bg: "from-pink-400 to-pink-600"
    }
  ];

  // Auto-rotate testimonials every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % clients.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [clients.length]);

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans text-slate-900 overflow-hidden">
      
      {/* LEFT SIDE: Form Container (Sign Up / Login) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 sm:p-12 lg:p-16 overflow-y-auto">
        
        {/* Top Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md">
            <ShieldCheck size={22} className="text-white" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-slate-900">Vetta</span>
        </div>

        {/* Center Form Box */}
        <div className="w-full max-w-md mx-auto my-auto py-8">
          
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-slate-500 text-sm">
              {isLogin 
                ? 'Log in to continue running your autonomous sales pipeline.' 
                : 'Start running AI-assisted cold dials and multi-channel cadences in minutes.'}
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">First name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Gaurav" 
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Last name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Tripathi" 
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Work email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="email" 
                  required 
                  placeholder="you@company.com" 
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
                {isLogin && (
                  <a href="#" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">Forgot password?</a>
                )}
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  placeholder={isLogin ? "••••••••••••" : "Create a secure password"} 
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center justify-center space-x-2"
            >
              <span>{isLogin ? 'Log in to workspace' : 'Create account'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Toggle between Login and Signup */}
          <div className="mt-6 text-center text-sm text-slate-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              {isLogin ? 'Create a free account' : 'Log in'}
            </button>
          </div>

        </div>

        {/* Footer legal text */}
        <div className="text-xs text-slate-400 text-center lg:text-left">
          By continuing you agree to Vetta's <a href="#" className="underline hover:text-slate-600">Terms of Service</a> and <a href="#" className="underline hover:text-slate-600">Privacy Policy</a>.
        </div>

      </div>

      {/* RIGHT SIDE: Platform Highlights & Rotating Client Testimonials */}
      <div className="hidden lg:flex w-1/2 bg-indigo-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        
        {/* Background ambient lighting */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Top Feature Tag */}
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold uppercase tracking-wider text-indigo-200 mb-6">
            <ShieldCheck size={14} className="text-indigo-400" />
            <span>The Complete Autonomous Sales Platform</span>
          </div>
          
          <h1 className="text-4xl font-extrabold tracking-tight mb-3 leading-tight">
            From first lead to booked meeting.
          </h1>
          <p className="text-indigo-200 text-sm max-w-lg mb-8 leading-relaxed">
            Find prospects, verify direct-dials, run AI-assisted cold dials, and auto-book meetings directly onto AE calendars — all in one unified engine.
          </p>

          {/* Feature Steps List */}
          <div className="space-y-4 max-w-md">
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0 mt-0.5">
                <BrainCircuit size={16} className="text-indigo-300" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">AI Research Engine</h4>
                <p className="text-xs text-indigo-300">Pulls firmographics, recent funding signals, and custom call angles.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0 mt-0.5">
                <PhoneCall size={16} className="text-indigo-300" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Live Voice & Parallel Dialing</h4>
                <p className="text-xs text-indigo-300">Filters out voicemails and dead numbers, connecting reps only on live pickup.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0 mt-0.5">
                <GitBranch size={16} className="text-indigo-300" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Multi-Channel Sequences</h4>
                <p className="text-xs text-indigo-300">Automated email cadences, LinkedIn connection invites, and objection handling.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0 mt-0.5">
                <Calendar size={16} className="text-indigo-300" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Round-Robin CRM Sync</h4>
                <p className="text-xs text-indigo-300">Synced seamlessly with HubSpot, Salesforce, and Google Calendar.</p>
              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM: Rotating 5 Clients Testimonial Box with Navigation Controls */}
        <div className="relative z-10 mt-8">
          <div className="bg-indigo-950/60 border border-white/15 p-6 rounded-2xl backdrop-blur-md relative shadow-xl">
            
            <p className="text-indigo-100 text-sm italic mb-6 leading-relaxed">
              "{clients[currentTestimonial].quote}"
            </p>

            <div className="flex items-center justify-between">
              
              {/* Client Info */}
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${clients[currentTestimonial].bg} border border-white/20 flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                  {clients[currentTestimonial].initials}
                </div>
                <div>
                  <p className="text-white text-xs font-bold">{clients[currentTestimonial].name}</p>
                  <p className="text-indigo-300 text-[11px]">{clients[currentTestimonial].role}</p>
                </div>
              </div>

              {/* Navigation Arrows & Indicator dots */}
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  {clients.map((_, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setCurrentTestimonial(idx)}
                      className={`h-1.5 rounded-full transition-all ${currentTestimonial === idx ? 'w-6 bg-indigo-400' : 'w-1.5 bg-white/30'}`}
                    />
                  ))}
                </div>

                <div className="flex items-center space-x-1 pl-2 border-l border-white/15">
                  <button 
                    onClick={() => setCurrentTestimonial((prev) => (prev === 0 ? clients.length - 1 : prev - 1))}
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    onClick={() => setCurrentTestimonial((prev) => (prev + 1) % clients.length)}
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>

    </div>
  );
}