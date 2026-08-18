import React from 'react';
import { 
  GitBranch, 
  Phone, 
  Mail, 
  Link, // Swapped from Linkedin to fix the export error
  MessageSquare, 
  Save, 
  Plus, 
  Settings2,
  ChevronRight,
  Play
} from 'lucide-react';

export default function Workflow() {
  return (
    <div className="h-full flex flex-col space-y-6">
      
      {/* Header Actions */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Q3 SaaS Founders Sequence</h2>
          <p className="text-sm text-slate-500">Multi-channel cadence with AI Voice handoff</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            <Save size={16} />
            <span>Save Draft</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            <Play size={16} />
            <span>Publish Campaign</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        
        {/* Left Sidebar: Sequence Steps */}
        <div className="w-80 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Cadence Steps</h3>
            <button className="text-indigo-600 hover:text-indigo-800"><Plus size={18} /></button>
          </div>
          
          <div className="p-4 overflow-y-auto flex-1 space-y-4">
            {/* Step 1 */}
            <div className="relative pl-6 border-l-2 border-indigo-200">
              <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-indigo-600 border-4 border-white"></div>
              <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg cursor-pointer shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">Day 1</span>
                  <Phone size={14} className="text-indigo-600" />
                </div>
                <p className="text-sm font-medium text-slate-800">AI-Assisted Cold Dial</p>
                <p className="text-xs text-slate-500 mt-1">Parallel dial + Human Bridge</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative pl-6 border-l-2 border-slate-200">
              <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-slate-300 border-4 border-white"></div>
              <div className="bg-white border border-slate-200 p-3 rounded-lg cursor-pointer hover:border-slate-300 transition-colors">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Day 2</span>
                  <Mail size={14} className="text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-800">Follow-up Email</p>
                <p className="text-xs text-slate-500 mt-1">If no connect on Day 1</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative pl-6 border-l-2 border-transparent">
              <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-slate-300 border-4 border-white"></div>
              <div className="bg-white border border-slate-200 p-3 rounded-lg cursor-pointer hover:border-slate-300 transition-colors">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Day 4</span>
                  <Link size={14} className="text-slate-400" /> {/* Updated Icon */}
                </div>
                <p className="text-sm font-medium text-slate-800">LinkedIn Connection</p>
                <p className="text-xs text-slate-500 mt-1">Automated invite with note</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Area: AI Script & Branching Builder */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <div className="flex items-center space-x-2">
              <MessageSquare size={18} className="text-slate-600" />
              <h3 className="font-semibold text-slate-800">AI Scripting & Objection Handling</h3>
            </div>
            <button className="text-slate-500 hover:text-slate-700"><Settings2 size={18} /></button>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto bg-slate-50/50">
            <div className="max-w-2xl mx-auto space-y-6">
              
              {/* Opener Block */}
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">1. The Opener</span>
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-medium">Dynamic Token</span>
                </div>
                <div className="p-4">
                  <textarea 
                    className="w-full h-20 p-3 border border-slate-200 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    defaultValue="Hi {{prospect_name}}, this is {{rep_name}}. I saw {{company_name}} just {{recent_funding_signal}}. Are you currently expanding your SDR team?"
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-center text-slate-400">
                <GitBranch size={24} />
              </div>

              {/* Branching Logic Blocks */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Positive Branch */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="bg-emerald-200 text-emerald-800 text-xs font-bold px-2 py-1 rounded">If: Yes / Positive</span>
                  </div>
                  <textarea 
                    className="w-full h-24 p-3 border border-emerald-200 rounded-md text-sm bg-white focus:ring-emerald-500 focus:border-emerald-500"
                    defaultValue="Great. A lot of teams scaling right now are burning cash on manual dialing. Our platform automates the dialing and bridges you only when a human answers. Does it make sense to show you how?"
                  ></textarea>
                </div>

                {/* Objection Branch */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="bg-orange-200 text-orange-800 text-xs font-bold px-2 py-1 rounded">If: &quot;Send me an email&quot;</span>
                  </div>
                  <textarea 
                    className="w-full h-24 p-3 border border-orange-200 rounded-md text-sm bg-white focus:ring-orange-500 focus:border-orange-500"
                    defaultValue="I can definitely do that, {{prospect_name}}. Just to make sure I send over the right info, are your current reps doing full-cycle or just outbound dialing?"
                  ></textarea>
                </div>

              </div>

              {/* Add New Branch Button */}
              <button className="w-full py-3 border-2 border-dashed border-slate-300 text-slate-500 font-medium rounded-lg hover:border-indigo-400 hover:text-indigo-600 transition-colors flex items-center justify-center space-x-2">
                <Plus size={18} />
                <span>Add AI Objection Handler</span>
              </button>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}