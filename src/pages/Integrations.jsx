import React from 'react';
import { 
  Plug, 
  CheckCircle2, 
  Settings2,
  Zap,
  RefreshCcw
} from 'lucide-react';

export default function Integrations() {
  return (
    <div className="h-full flex flex-col space-y-6 max-w-7xl mx-auto w-full">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Integrations</h2>
          <p className="text-sm text-slate-500 mt-1">Connect your CRM, enrichment data providers, and calendars.</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            <RefreshCcw size={16} />
            <span>Sync All</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            <Zap size={16} />
            <span>Request Integration</span>
          </button>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-8">
        
        {/* HubSpot */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-orange-500 text-white font-bold text-lg flex items-center justify-center shadow-sm">
                  H
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">HubSpot</h3>
                  <span className="text-xs text-slate-500 font-medium">CRM & Pipeline</span>
                </div>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 size={12} className="mr-1" /> Connected
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Two-way sync. Write call outcomes, transcripts, meetings, and notes back to your contacts and deals automatically.
            </p>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-400 font-medium">137 records synced today</span>
            <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center">
              Configure <Settings2 size={14} className="ml-1" />
            </button>
          </div>
        </div>

        {/* Salesforce */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-sky-500 text-white font-bold text-lg flex items-center justify-center shadow-sm">
                  SF
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Salesforce</h3>
                  <span className="text-xs text-slate-500 font-medium">Enterprise CRM</span>
                </div>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 size={12} className="mr-1" /> Connected
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Push outbound activities, custom tasks, and booked discovery meetings straight into Salesforce objects.
            </p>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-400 font-medium">Enterprise sync active</span>
            <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center">
              Configure <Settings2 size={14} className="ml-1" />
            </button>
          </div>
        </div>

        {/* Apollo.io */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center shadow-sm">
                  A
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Apollo.io</h3>
                  <span className="text-xs text-slate-500 font-medium">Enrichment & Leads</span>
                </div>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 size={12} className="mr-1" /> Connected
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Pull targeted contact lists and instantly enrich them with verified business emails and direct-dial phone numbers.
            </p>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-400 font-medium">Waterfall active</span>
            <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center">
              Configure <Settings2 size={14} className="ml-1" />
            </button>
          </div>
        </div>

        {/* Clay */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-slate-800 text-white font-bold text-lg flex items-center justify-center shadow-sm">
                  Cl
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Clay</h3>
                  <span className="text-xs text-slate-500 font-medium">Data Waterfall</span>
                </div>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 size={12} className="mr-1" /> Connected
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Combine over 50+ data providers into a single waterfall to achieve maximum phone number and email match rates.
            </p>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-400 font-medium">95.7% match rate</span>
            <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center">
              Configure <Settings2 size={14} className="ml-1" />
            </button>
          </div>
        </div>

        {/* Google Calendar */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center shadow-sm">
                  G
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Google Calendar</h3>
                  <span className="text-xs text-slate-500 font-medium">Scheduling</span>
                </div>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 size={12} className="mr-1" /> Connected
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Auto-book meetings directly onto AE calendars and dispatch automated email calendar invites with Zoom links.
            </p>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-400 font-medium">OAuth token valid</span>
            <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center">
              Configure <Settings2 size={14} className="ml-1" />
            </button>
          </div>
        </div>

        {/* Zapier */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-orange-600 text-white font-bold text-lg flex items-center justify-center shadow-sm">
                  Z
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Zapier</h3>
                  <span className="text-xs text-slate-500 font-medium">Automation</span>
                </div>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 size={12} className="mr-1" /> Connected
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Trigger custom webhooks and connect Vetta seamlessly to over 6,000+ third-party tools with zero code.
            </p>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-400 font-medium">4 active zaps</span>
            <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center">
              Configure <Settings2 size={14} className="ml-1" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}