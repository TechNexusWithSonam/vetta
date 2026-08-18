import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, ArrowLeft, Users, PhoneCall, Clock, CheckCircle2 } from 'lucide-react';

export default function LaunchCampaign() {
  const navigate = useNavigate();
  const [campaignName, setCampaignName] = useState('Enterprise SaaS — Q3 Outbound');
  const [leadSource, setLeadSource] = useState('researched');
  const [dailyCap, setDailyCap] = useState(400);
  const [isLaunched, setIsLaunched] = useState(false);

  const handleLaunch = (e) => {
    e.preventDefault();
    setIsLaunched(true);
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col space-y-6 max-w-4xl mx-auto w-full">
      
      {/* Back button & Header */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Launch New Campaign</h2>
          <p className="text-sm text-slate-500">Configure the autonomous AI SDR run and target parameters.</p>
        </div>
      </div>

      {isLaunched ? (
        <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-2xl text-center flex flex-col items-center justify-center space-y-3 my-auto">
          <CheckCircle2 size={48} className="text-emerald-600 animate-bounce" />
          <h3 className="text-xl font-bold text-emerald-900">Campaign Launched Successfully!</h3>
          <p className="text-sm text-emerald-700">AI voice agents and dialers have started processing your queue. Redirecting to dashboard...</p>
        </div>
      ) : (
        <form onSubmit={handleLaunch} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 space-y-6">
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Campaign Name</label>
            <input 
              type="text" 
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Select Lead Source</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div 
                onClick={() => setLeadSource('researched')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${leadSource === 'researched' ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
              >
                <Users size={20} className={leadSource === 'researched' ? 'text-indigo-600 mb-2' : 'text-slate-400 mb-2'} />
                <h4 className="font-bold text-sm text-slate-800">Researched Leads</h4>
                <p className="text-xs text-slate-500 mt-1">4,612 leads fully analyzed with Claude AI.</p>
              </div>

              <div 
                onClick={() => setLeadSource('all')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${leadSource === 'all' ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
              >
                <PhoneCall size={20} className={leadSource === 'all' ? 'text-indigo-600 mb-2' : 'text-slate-400 mb-2'} />
                <h4 className="font-bold text-sm text-slate-800">All Database</h4>
                <p className="text-xs text-slate-500 mt-1">4,820 total raw imported contacts.</p>
              </div>

              <div 
                onClick={() => setLeadSource('new')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${leadSource === 'new' ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
              >
                <Clock size={20} className={leadSource === 'new' ? 'text-indigo-600 mb-2' : 'text-slate-400 mb-2'} />
                <h4 className="font-bold text-sm text-slate-800">New CSV Import</h4>
                <p className="text-xs text-slate-500 mt-1">Upload fresh list right now.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Voice Engine Agent</label>
              <input 
                type="text" 
                value="Retell AI (Sub-300ms latency)" 
                disabled 
                className="w-full h-11 px-4 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Daily Call Cap</label>
              <input 
                type="number" 
                value={dailyCap}
                onChange={(e) => setDailyCap(e.target.value)}
                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Calling Compliance Window</label>
            <input 
              type="text" 
              value="9:00 AM – 6:00 PM (Lead local time · DNC scrub active)" 
              disabled 
              className="w-full h-11 px-4 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm flex items-center space-x-2"
            >
              <Rocket size={16} />
              <span>Launch Campaign Now</span>
            </button>
          </div>

        </form>
      )}

    </div>
  );
}