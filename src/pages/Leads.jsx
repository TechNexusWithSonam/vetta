import React from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert,
  Database
} from 'lucide-react';

// Mock data representing the enriched and scrubbed leads
const mockLeads = [
  { id: 1, name: 'Priya Nair', title: 'VP Sales', company: 'Brightwave', phone: '+1 (555) 019-2834', enrichment: 'Clay + Apollo', compliance: 'Verified' },
  { id: 2, name: 'Marcus Webb', title: 'RevOps', company: 'Orbit Inc', phone: '+1 (555) 928-1123', enrichment: 'FullEnrich', compliance: 'Verified' },
  { id: 3, name: 'Dana Liu', title: 'SDR Lead', company: 'Northwind', phone: '+1 (555) 443-8899', enrichment: 'Apollo', compliance: 'DNC List' },
  { id: 4, name: 'James Holden', title: 'Founder', company: 'Rocinante Data', phone: 'Invalid Line', enrichment: 'Pending', compliance: 'Failed' },
  { id: 5, name: 'Sarah Chen', title: 'Head of Sales', company: 'Nexus', phone: '+1 (555) 776-2311', enrichment: 'Clay', compliance: 'Verified' },
];

export default function Leads() {
  return (
    <div className="h-full flex flex-col space-y-6">
      
      {/* Top Action Bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search leads, companies, or titles..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            <Plus size={16} />
            <span>Import Leads</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        
        {/* Left Sidebar: ICP Builder */}
        <div className="w-80 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden shrink-0">
          <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center space-x-2">
            <Filter size={18} className="text-slate-600" />
            <h2 className="font-semibold text-slate-800">ICP Builder</h2>
          </div>
          
          <div className="p-5 overflow-y-auto space-y-5 flex-1">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
              <select className="w-full border border-slate-200 rounded-md py-2 px-3 text-sm text-slate-600 focus:ring-indigo-500 focus:border-indigo-500">
                <option>B2B SaaS</option>
                <option>Healthcare Tech</option>
                <option>Financial Services</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company Size</label>
              <select className="w-full border border-slate-200 rounded-md py-2 px-3 text-sm text-slate-600 focus:ring-indigo-500 focus:border-indigo-500">
                <option>50 - 200 Employees</option>
                <option>201 - 500 Employees</option>
                <option>500+ Employees</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Titles</label>
              <input 
                type="text" 
                defaultValue="VP Sales, RevOps, SDR Lead"
                className="w-full border border-slate-200 rounded-md py-2 px-3 text-sm text-slate-600 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-200">
              <label className="block text-sm font-medium text-slate-700 mb-3">Intent Signals</label>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                  <span className="text-sm text-slate-600">Recently Funded (Last 6 mo)</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                  <span className="text-sm text-slate-600">Actively Hiring SDRs</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                  <span className="text-sm text-slate-600">Using Competitor Tech</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <button className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
              Generate List
            </button>
          </div>
        </div>

        {/* Right Area: Data Grid */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="px-6 py-4">Prospect</th>
                  <th className="px-6 py-4">Company & Title</th>
                  <th className="px-6 py-4">Direct Dial</th>
                  <th className="px-6 py-4">Enrichment</th>
                  <th className="px-6 py-4">Compliance Gate</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {mockLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{lead.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900">{lead.company}</div>
                      <div className="text-xs text-slate-500">{lead.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-700">{lead.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        <Database size={12} className="mr-1" />
                        {lead.enrichment}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {lead.compliance === 'Verified' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={12} className="mr-1" />
                          Verified
                        </span>
                      )}
                      {lead.compliance === 'DNC List' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                          <ShieldAlert size={12} className="mr-1" />
                          DNC Blocked
                        </span>
                      )}
                      {lead.compliance === 'Failed' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          <XCircle size={12} className="mr-1" />
                          Invalid Line
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-sm text-slate-600">
            <div>Showing 1 to 5 of 312 leads</div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-slate-300 rounded-md hover:bg-slate-100 disabled:opacity-50" disabled>Previous</button>
              <button className="px-3 py-1 border border-slate-300 rounded-md hover:bg-slate-100 bg-white">Next</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}