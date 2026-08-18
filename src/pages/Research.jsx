import React from 'react';
import { 
  BrainCircuit, 
  Target, 
  Newspaper, 
  TrendingUp, 
  Lightbulb,
  Search,
  Building,
  User
} from 'lucide-react';

export default function Research() {
  return (
    <div className="h-full flex flex-col space-y-6 max-w-7xl mx-auto w-full">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">AI Intelligence</h2>
          <p className="text-sm text-slate-500 mt-1">Review AI-generated summaries, buying triggers, and personalization tokens.</p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search accounts or prospects..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        
        {/* Left Sidebar: Scored Prospects */}
        <div className="w-80 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Ranked Queue</h3>
            <span className="text-xs font-medium text-slate-500">By Composite Score</span>
          </div>
          
          <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
            {/* Active Prospect */}
            <div className="p-4 bg-indigo-50 border-l-4 border-indigo-600 cursor-pointer">
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-slate-900">Brightwave</span>
                <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-0.5 rounded">94 Score</span>
              </div>
              <p className="text-sm text-slate-600">Priya Nair • VP Sales</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">Funding Signal</span>
              </div>
            </div>

            {/* Prospect 2 */}
            <div className="p-4 hover:bg-slate-50 cursor-pointer transition-colors">
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-slate-700">Orbit Inc</span>
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded">88 Score</span>
              </div>
              <p className="text-sm text-slate-500">Marcus Webb • RevOps</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">Hiring Signal</span>
              </div>
            </div>

            {/* Prospect 3 */}
            <div className="p-4 hover:bg-slate-50 cursor-pointer transition-colors">
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-slate-700">Northwind</span>
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded">85 Score</span>
              </div>
              <p className="text-sm text-slate-500">Dana Liu • SDR Lead</p>
            </div>
          </div>
        </div>

        {/* Right Area: Deep Dive Research */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          
          <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-14 w-14 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-sm">
                BW
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Brightwave</h2>
                <p className="text-sm text-slate-500 flex items-center mt-1">
                  <User size={14} className="mr-1" /> Priya Nair, VP Sales
                  <span className="mx-2 text-slate-300">|</span>
                  <Building size={14} className="mr-1" /> B2B SaaS (50-200 emp)
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Composite Score</p>
              <p className="text-3xl font-bold text-indigo-600">94<span className="text-lg text-slate-400">/100</span></p>
            </div>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto bg-white space-y-6">
            
            {/* Grid for Signals and Persona */}
            <div className="grid grid-cols-2 gap-6">
              
              {/* Buying Triggers & Signals */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <div className="flex items-center space-x-2 mb-4 text-emerald-700">
                  <TrendingUp size={18} />
                  <h3 className="font-bold">Recent Signals & Triggers</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3 text-sm">
                    <Newspaper size={16} className="text-slate-400 mt-0.5 shrink-0" />
                    <span className="text-slate-700"><strong>Funding:</strong> Raised $12M Series A on August 1st, 2026.</span>
                  </li>
                  <li className="flex items-start space-x-3 text-sm">
                    <Target size={16} className="text-slate-400 mt-0.5 shrink-0" />
                    <span className="text-slate-700"><strong>Hiring:</strong> 6 open job postings for "Sales Development Representative" on LinkedIn.</span>
                  </li>
                </ul>
              </div>

              {/* Persona Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <div className="flex items-center space-x-2 mb-4 text-blue-700">
                  <BrainCircuit size={18} />
                  <h3 className="font-bold">Persona: VP Sales</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Priya is focused on scaling pipeline post-funding. Her primary metric is pipeline generated vs. burn rate. SDR churn and ramp time will be her biggest operational bottlenecks in the next 3 months.
                </p>
              </div>
            </div>

            {/* Recommended Angle */}
            <div className="border border-indigo-100 bg-indigo-50/50 rounded-xl p-5">
              <div className="flex items-center space-x-2 mb-3 text-indigo-700">
                <Lightbulb size={18} />
                <h3 className="font-bold">Recommended Call Angle</h3>
              </div>
              <p className="text-sm text-indigo-900">
                Position Vetta as a way to "skip the SDR ramp phase." Since they are actively trying to hire 6 reps, suggest automating the cold dialing block so they only need to hire 2 closing AEs instead.
              </p>
            </div>

            {/* Generated Tokens */}
            <div>
              <h3 className="font-bold text-slate-800 mb-3">Generated Personalization Tokens</h3>
              <div className="overflow-hidden border border-slate-200 rounded-lg">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Variable</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">AI Output</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    <tr>
                      <td className="px-4 py-3 font-mono text-xs text-indigo-600">{"{{recent_funding_signal}}"}</td>
                      <td className="px-4 py-3 text-slate-600">announced the $12M Series A</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-xs text-indigo-600">{"{{pain_point_hypothesis}}"}</td>
                      <td className="px-4 py-3 text-slate-600">burning cash on SDR ramp time</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}