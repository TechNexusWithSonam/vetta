import React from 'react';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // In a real app, you would authenticate here. 
    // For now, just route them to the dashboard.
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans text-slate-900">
      
      {/* Left Side: Branding & Pitch */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background Graphic Element */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-600 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-emerald-500 rounded-full blur-3xl opacity-10"></div>

        <div className="relative z-10">
          <div className="flex items-center space-x-2 text-white mb-12">
            <ShieldCheck size={32} className="text-indigo-500" />
            <span className="text-3xl font-extrabold tracking-tight">Vetta</span>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
            The Compliant <br/>AI Sales Engine.
          </h1>
          <p className="text-lg text-slate-400 max-w-md">
            Automate your outbound dialing, instantly engage inbound leads, and never worry about TCPA compliance again.
          </p>
        </div>

        <div className="relative z-10">
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl backdrop-blur-sm">
            <p className="text-slate-300 text-sm italic mb-4">
              "Vetta completely collapsed our SDR ramp time. The AI handles the voicemails and dead numbers, and my team only talks to live prospects."
            </p>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-white font-bold">
                MJ
              </div>
              <div>
                <p className="text-white text-sm font-bold">Michael Johnson</p>
                <p className="text-slate-400 text-xs">VP Sales, TechFlow SaaS</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h2>
            <p className="text-slate-500">Log in to your workspace to continue.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Work Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="email" 
                  required
                  placeholder="you@company.com" 
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <a href="#" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••" 
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full flex justify-center items-center space-x-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              <span>Sign In</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex justify-center items-center py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              Single Sign-On (SSO)
            </button>
            <button className="flex justify-center items-center py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              Google
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}