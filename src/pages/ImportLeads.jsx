import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, ArrowLeft, FileSpreadsheet, Database, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ImportLeads() {
  const navigate = useNavigate();
  const [importType, setImportType] = useState('csv');
  const [isImported, setIsImported] = useState(false);

  const handleCompleteImport = () => {
    setIsImported(true);
    setTimeout(() => {
      navigate('/leads');
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
          <h2 className="text-2xl font-bold text-slate-900">Import Leads</h2>
          <p className="text-sm text-slate-500">Upload CSV lists, sync Google Sheets, or pull directly from your CRM.</p>
        </div>
      </div>

      {isImported ? (
        <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-2xl text-center flex flex-col items-center justify-center space-y-3 my-auto">
          <CheckCircle2 size={48} className="text-emerald-600 animate-bounce" />
          <h3 className="text-xl font-bold text-emerald-900">Leads Imported Successfully!</h3>
          <p className="text-sm text-emerald-700">312 new records validated and added to queue. Redirecting to leads list...</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Tabs */}
          <div className="flex bg-white border border-slate-200 p-1 rounded-xl shadow-sm w-fit">
            <button 
              onClick={() => setImportType('csv')}
              className={`px-5 py-2 text-sm font-semibold rounded-lg transition-colors ${importType === 'csv' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              CSV / File Upload
            </button>
            <button 
              onClick={() => setImportType('crm')}
              className={`px-5 py-2 text-sm font-semibold rounded-lg transition-colors ${importType === 'crm' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Connected CRM / Sources
            </button>
          </div>

          {importType === 'csv' ? (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 space-y-6">
              
              {/* Dropzone Area */}
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center hover:border-indigo-500 transition-colors bg-slate-50/50 cursor-pointer flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 shadow-sm">
                  <Upload size={24} />
                </div>
                <h4 className="text-base font-bold text-slate-800 mb-1">Drag & drop your .csv file here</h4>
                <p className="text-xs text-slate-500 max-w-sm mb-4">Supports CSV, XLSX with automatic field mapping for Name, Phone, LinkedIn, Company, and Title.</p>
                <span className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-semibold text-xs rounded-lg shadow-sm">Browse files</span>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => navigate(-1)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCompleteImport}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm flex items-center space-x-2"
                >
                  <span>Process & Import Leads</span>
                  <ArrowRight size={16} />
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 space-y-6">
              <h4 className="font-bold text-slate-800 text-base mb-4">Select Source to Sync Leads From</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex items-center space-x-3 cursor-pointer hover:border-indigo-500 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-orange-500 text-white font-bold flex items-center justify-center">H</div>
                  <div>
                    <h5 className="font-bold text-sm text-slate-800">HubSpot</h5>
                    <p className="text-[11px] text-slate-500">Sync deals & contacts</p>
                  </div>
                </div>

                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex items-center space-x-3 cursor-pointer hover:border-indigo-500 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-sky-500 text-white font-bold flex items-center justify-center">SF</div>
                  <div>
                    <h5 className="font-bold text-sm text-slate-800">Salesforce</h5>
                    <p className="text-[11px] text-slate-500">Sync reports & lists</p>
                  </div>
                </div>

                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex items-center space-x-3 cursor-pointer hover:border-indigo-500 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center">A</div>
                  <div>
                    <h5 className="font-bold text-sm text-slate-800">Apollo.io</h5>
                    <p className="text-[11px] text-slate-500">Pull saved searches</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => navigate(-1)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCompleteImport}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm flex items-center space-x-2"
                >
                  <span>Sync from CRM</span>
                  <ArrowRight size={16} />
                </button>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}