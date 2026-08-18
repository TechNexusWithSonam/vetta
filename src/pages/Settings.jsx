import React, { useState } from 'react';
import { 
  Palette, 
  ShieldCheck, 
  Users, 
  Plug, 
  Upload,
  Save,
  CheckCircle2,
  Lock
} from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('branding');

  return (
    <div className="h-full flex flex-col space-y-6 max-w-6xl mx-auto w-full">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Workspace Settings</h2>
        <p className="text-sm text-slate-500 mt-1">Manage your branding, compliance rules, and integrations.</p>
      </div>

      <div className="flex flex-1 gap-8 min-h-0">
        
        {/* Left Settings Navigation */}
        <div className="w-64 shrink-0 space-y-1">
          <button 
            onClick={() => setActiveTab('branding')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'branding' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Palette size={18} className={activeTab === 'branding' ? 'text-indigo-600' : 'text-slate-400'} />
            <span>White-Label Branding</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('compliance')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'compliance' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <ShieldCheck size={18} className={activeTab === 'compliance' ? 'text-indigo-600' : 'text-slate-400'} />
            <span>Compliance Gate</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('team')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'team' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Users size={18} className={activeTab === 'team' ? 'text-indigo-600' : 'text-slate-400'} />
            <span>Team & Roles (RBAC)</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('integrations')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'integrations' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Plug size={18} className={activeTab === 'integrations' ? 'text-indigo-600' : 'text-slate-400'} />
            <span>Integrations</span>
          </button>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-y-auto">
          
          {activeTab === 'branding' && (
            <div className="p-8">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">White-Label Branding</h3>
              
              <div className="space-y-8">
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Workspace Logo</label>
                  <div className="flex items-center space-x-6">
                    <div className="h-20 w-20 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shadow-sm">
                      <span className="text-xl font-bold text-indigo-600">ACME</span>
                    </div>
                    <button className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                      <Upload size={16} />
                      <span>Upload New Logo</span>
                    </button>
                    <p className="text-xs text-slate-400">PNG, JPG, or SVG. Max 2MB.</p>
                  </div>
                </div>

                <div className="border-t border-slate-200"></div>

                {/* Brand Colors */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Brand Colors</label>
                  <div className="grid grid-cols-2 gap-6 max-w-md">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Primary Color (Buttons, Active States)</label>
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded bg-indigo-600 border border-slate-200"></div>
                        <input type="text" defaultValue="#4F46E5" className="flex-1 border border-slate-300 rounded-md py-1.5 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Sidebar Background</label>
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded bg-slate-900 border border-slate-200"></div>
                        <input type="text" defaultValue="#0F172A" className="flex-1 border border-slate-300 rounded-md py-1.5 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200"></div>

                {/* Custom Domain */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Custom App Domain</label>
                  <div className="flex items-center space-x-3 max-w-md">
                    <input type="text" defaultValue="outbound.acmecorp.com" className="flex-1 border border-slate-300 rounded-md py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500" />
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 size={12} className="mr-1" /> Verified
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex justify-end">
                <button className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                  <Save size={16} />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="p-8">
              <div className="flex items-center space-x-2 mb-6 text-indigo-700">
                <Lock size={20} />
                <h3 className="text-lg font-semibold text-slate-800">Compliance Gate Rules</h3>
              </div>
              <p className="text-sm text-slate-500 mb-8">These settings are enforced at the platform level. No campaign can bypass these checks.</p>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-slate-50">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Strict DNC Scrubbing</h4>
                    <p className="text-xs text-slate-500 mt-1">Automatically drop numbers on Federal & State Do-Not-Call registries.</p>
                  </div>
                  <div className="relative inline-block w-12 mr-2 align-middle select-none">
                    <input type="checkbox" name="toggle" id="dnc-toggle" defaultChecked disabled className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-indigo-600 appearance-none cursor-not-allowed translate-x-6" />
                    <label htmlFor="dnc-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-indigo-600 cursor-not-allowed"></label>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Calling Window Enforcement</h4>
                    <p className="text-xs text-slate-500 mt-1">Restrict outbound dials to 8:00 AM - 9:00 PM prospect local time.</p>
                  </div>
                  <div className="relative inline-block w-12 mr-2 align-middle select-none">
                    <input type="checkbox" name="toggle" id="time-toggle" defaultChecked className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-slate-300 appearance-none cursor-pointer translate-x-6 border-indigo-600" />
                    <label htmlFor="time-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-slate-300 cursor-pointer bg-indigo-600"></label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Placeholders for other tabs */}
          {(activeTab === 'team' || activeTab === 'integrations') && (
            <div className="p-8 flex flex-col items-center justify-center h-full text-slate-400">
              <Plug size={48} className="mb-4 opacity-50" />
              <p>Content for {activeTab} goes here.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}