import React from 'react';
import { 
  Calendar, 
  Clock, 
  Video, 
  User, 
  FileText, 
  CheckCircle2, 
  MessageSquare,
  ArrowRight,
  RefreshCcw
} from 'lucide-react';

export default function Bookings() {
  return (
    <div className="h-full flex flex-col space-y-6 max-w-7xl mx-auto w-full">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Meetings & Handoffs</h2>
          <p className="text-sm text-slate-500 mt-1">Review booked meetings, AE routing, and AI conversation summaries.</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            <RefreshCcw size={16} />
            <span>Sync CRM</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            <Calendar size={16} />
            <span>View Master Calendar</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        
        {/* Left Sidebar: Upcoming Meetings List */}
        <div className="w-80 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Upcoming (Next 7 Days)</h3>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-md">14 Booked</span>
          </div>
          
          <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
            {/* Active Meeting Item */}
            <div className="p-4 bg-indigo-50 border-l-4 border-indigo-600 cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-slate-900">Priya Nair</span>
                <span className="text-xs font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">Today</span>
              </div>
              <p className="text-sm text-slate-600 mb-2">Brightwave • Discovery Call</p>
              <div className="flex items-center text-xs text-slate-500 space-x-3">
                <span className="flex items-center"><Clock size={12} className="mr-1"/> 2:00 PM EST</span>
                <span className="flex items-center"><User size={12} className="mr-1"/> AE: S. Jenkins</span>
              </div>
            </div>

            {/* Meeting Item 2 */}
            <div className="p-4 hover:bg-slate-50 cursor-pointer transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-slate-700">Marcus Webb</span>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Tomorrow</span>
              </div>
              <p className="text-sm text-slate-500 mb-2">Orbit Inc • Platform Demo</p>
              <div className="flex items-center text-xs text-slate-400 space-x-3">
                <span className="flex items-center"><Clock size={12} className="mr-1"/> 10:30 AM EST</span>
                <span className="flex items-center"><User size={12} className="mr-1"/> AE: M. Davis</span>
              </div>
            </div>
            
            {/* Meeting Item 3 */}
            <div className="p-4 hover:bg-slate-50 cursor-pointer transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-slate-700">Dana Liu</span>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Aug 6</span>
              </div>
              <p className="text-sm text-slate-500 mb-2">Northwind • SDR Process</p>
              <div className="flex items-center text-xs text-slate-400 space-x-3">
                <span className="flex items-center"><Clock size={12} className="mr-1"/> 1:15 PM EST</span>
                <span className="flex items-center"><User size={12} className="mr-1"/> AE: S. Jenkins</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Area: Handoff Package */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          
          {/* Meeting Details Header */}
          <div className="p-6 border-b border-slate-200 bg-slate-50">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Brightwave Discovery Call</h2>
                <div className="flex items-center space-x-4 text-sm text-slate-600">
                  <span className="flex items-center font-medium"><Calendar size={16} className="mr-1.5 text-indigo-600"/> Today, Aug 4, 2026</span>
                  <span className="flex items-center font-medium"><Clock size={16} className="mr-1.5 text-indigo-600"/> 2:00 PM - 2:30 PM EST</span>
                </div>
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors">
                <Video size={16} />
                <span>Join Zoom Room</span>
              </button>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center">
                  <span className="text-slate-500 mr-2">Booked via:</span>
                  <span className="font-medium inline-flex items-center"><MessageSquare size={14} className="mr-1 text-orange-500"/> AI-Assisted Cold Dial</span>
                </div>
                <div className="flex items-center">
                  <span className="text-slate-500 mr-2">Routed to:</span>
                  <div className="flex items-center font-medium bg-white px-2 py-1 border border-slate-200 rounded-md">
                    <div className="h-4 w-4 rounded-full bg-indigo-600 mr-2"></div>
                    Sarah Jenkins (Round-Robin)
                  </div>
                </div>
              </div>
              
              <div className="flex items-center text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 size={16} className="mr-1.5" />
                Synced to HubSpot
              </div>
            </div>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto bg-white space-y-6">
            
            {/* AI Call Summary */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center space-x-2">
                <FileText size={18} className="text-slate-600" />
                <h3 className="font-bold text-slate-800">AI Call Summary</h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Key Takeaways</h4>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Prospect confirmed they are hiring 6 new SDRs this quarter. Currently struggling with the cost of ramping new reps using manual dialing tools. Highly interested in the AI-assisted live bridge feature.
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Identified Pain Point</h4>
                  <p className="text-sm text-slate-700">High SDR turnover and inefficient cold calling blocks.</p>
                </div>
                <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg">
                  <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-1">AI Recommendation for AE</h4>
                  <p className="text-sm text-indigo-900 font-medium">Focus the demo heavily on the "Live Calls" console and the 3-5x multiplier on live conversations. Mention how this reduces the need to hire all 6 SDRs.</p>
                </div>
              </div>
            </div>

            {/* Transcript Snippet */}
            <div>
              <h3 className="font-bold text-slate-800 mb-3 flex items-center">
                <MessageSquare size={18} className="mr-2 text-slate-500" />
                Conversation Highlights
              </h3>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-semibold text-emerald-600 mb-1">Priya Nair</span>
                  <p className="text-sm bg-white p-3 rounded-lg rounded-tr-none border border-slate-200 self-end text-slate-800 shadow-sm">
                    Honestly, my biggest headache right now is onboarding. We're about to bring on 6 new reps and getting them to hit quota on pure cold outbound takes forever.
                  </p>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-indigo-600 mb-1">Gaurav (AI Bridge)</span>
                  <p className="text-sm bg-indigo-50 p-3 rounded-lg rounded-tl-none border border-indigo-100 self-start text-slate-800 shadow-sm">
                    That makes total sense. What if you didn't have to train them to dial through voicemails, and they only spoke when a live prospect answered? I can show you how that works on a quick demo tomorrow.
                  </p>
                </div>
              </div>
              <button className="mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center transition-colors">
                Read Full Transcript <ArrowRight size={16} className="ml-1" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}