import React, { useState } from 'react';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Activity, 
  User, 
  Building, 
  MessageSquare,
  Calendar
} from 'lucide-react';

export default function LiveCalls() {
  const [isMuted, setIsMuted] = useState(false);
  const [callActive, setCallActive] = useState(true); // Simulating an active bridged call

  return (
    <div className="h-full flex flex-col space-y-6">
      
      {/* Top Status Bar */}
      <div className="bg-slate-900 rounded-xl p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-semibold text-sm tracking-wide uppercase">System Active</span>
          </div>
          <div className="h-4 w-px bg-slate-700"></div>
          <span className="text-slate-300 text-sm">Campaign: Q3 SaaS Founders</span>
        </div>
        
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex flex-col items-end">
            <span className="text-slate-400 text-xs">AI Dials Today</span>
            <span className="text-white font-bold">1,240</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-slate-400 text-xs">Live Bridges</span>
            <span className="text-white font-bold">312</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        
        {/* Left Side: Parallel Dialer Status */}
        <div className="w-80 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Active Lines</h2>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-md">Dialing x4</span>
          </div>
          
          <div className="p-2 overflow-y-auto flex-1 space-y-2">
            {/* Active Dialing Item */}
            <div className="p-3 border border-slate-200 rounded-lg bg-slate-50 opacity-60">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-slate-700">Line 1</span>
                <span className="text-xs font-semibold text-orange-500">Ringing...</span>
              </div>
              <p className="text-xs text-slate-500">Alex Mercer • Acme Corp</p>
            </div>

            {/* Voicemail Detected Item */}
            <div className="p-3 border border-slate-200 rounded-lg bg-slate-50 opacity-60">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-slate-700">Line 2</span>
                <span className="text-xs font-semibold text-slate-500">Voicemail Drop</span>
              </div>
              <p className="text-xs text-slate-500">Sarah Jenkins • TechFlow</p>
            </div>
            
            {/* Dead Number Item */}
            <div className="p-3 border border-slate-200 rounded-lg bg-slate-50 opacity-60">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-slate-700">Line 3</span>
                <span className="text-xs font-semibold text-red-500">Failed / Disconnected</span>
              </div>
              <p className="text-xs text-slate-500">David Kim • Global Solutions</p>
            </div>
          </div>
        </div>

        {/* Right Side: Active Bridged Call & Screen-Pop */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          
          {callActive ? (
            <>
              {/* Screen Pop Header */}
              <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-white flex justify-between items-start">
                <div className="flex space-x-4 items-start">
                  <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 shadow-md">
                    <User size={24} className="text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-xl font-bold text-slate-900">Priya Nair</h2>
                      <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded animate-pulse flex items-center">
                        <Activity size={12} className="mr-1"/> LIVE
                      </span>
                      <span className="text-slate-500 text-sm font-medium">02:14</span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-slate-600">
                      <span className="flex items-center"><Building size={14} className="mr-1"/> VP Sales at Brightwave</span>
                    </div>
                  </div>
                </div>

                {/* Call Controls */}
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-3 rounded-full border shadow-sm transition-colors ${isMuted ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                  >
                    {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                  </button>
                  <button 
                    onClick={() => setCallActive(false)}
                    className="p-3 rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 transition-colors"
                  >
                    <PhoneOff size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-1 flex overflow-hidden">
                {/* AI Research & Briefing Panel */}
                <div className="w-1/2 p-6 border-r border-slate-200 overflow-y-auto bg-slate-50">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center">
                    <MessageSquare size={16} className="mr-2 text-indigo-600" /> 
                    AI Briefing
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                      <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Why Now?</p>
                      <p className="text-sm text-slate-800">Brightwave just raised $12M Series A and is actively hiring 6 new SDRs on LinkedIn.</p>
                    </div>
                    
                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 shadow-sm">
                      <p className="text-xs text-indigo-600 font-semibold uppercase mb-1">Suggested Opening</p>
                      <p className="text-sm text-indigo-900 font-medium">"Hey Priya, saw the Series A and the push to hire 6 SDRs. Are you ramping them on manual dialing, or looking to automate?"</p>
                    </div>
                  </div>
                  
                  <button className="w-full mt-6 flex items-center justify-center space-x-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm">
                    <Calendar size={18} />
                    <span>Book Meeting</span>
                  </button>
                </div>

                {/* Live Transcript Panel */}
                <div className="w-1/2 p-6 overflow-y-auto bg-white flex flex-col">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Live Transcript</h3>
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-indigo-600 mb-1">You</span>
                      <p className="text-sm bg-indigo-50 p-3 rounded-lg rounded-tl-none border border-indigo-100 self-start text-slate-800">
                        Hi Priya, this is Gaurav. I noticed Brightwave is scaling up the sales team.
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-semibold text-emerald-600 mb-1">Priya Nair</span>
                      <p className="text-sm bg-slate-100 p-3 rounded-lg rounded-tr-none border border-slate-200 self-end text-slate-800">
                        Yeah, timing's actually pretty good, we're scaling fast after the round. Who did you say you were with?
                      </p>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-xs font-semibold text-emerald-600 mb-1">Priya Nair</span>
                      <p className="text-sm bg-slate-100 p-3 rounded-lg rounded-tr-none border border-slate-200 self-end text-slate-500 italic flex items-center">
                        <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce mr-1"></span>
                        <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce mr-1" style={{ animationDelay: '150ms' }}></span>
                        <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-slate-50">
              <Phone size={48} className="text-slate-300 mb-4" />
              <p className="text-lg font-medium text-slate-600">Waiting for next live connection...</p>
              <p className="text-sm mt-2">AI is parallel dialing 4 lines in the background.</p>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}