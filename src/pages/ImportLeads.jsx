import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  ArrowLeft,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight,
  Download,
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { api, ApiError } from '../api';

// Columns the importer understands. Header (case-insensitive) -> lead field.
const FIELD_BY_HEADER = {
  email: 'email',
  'e-mail': 'email',
  'first name': 'firstName',
  firstname: 'firstName',
  first: 'firstName',
  'last name': 'lastName',
  lastname: 'lastName',
  last: 'lastName',
  company: 'company',
  organization: 'company',
  organisation: 'company',
  account: 'company',
  title: 'title',
  'job title': 'title',
  phone: 'phone',
  'phone number': 'phone',
  mobile: 'phone',
  'linkedin url': 'linkedinUrl',
  linkedin: 'linkedinUrl',
  linkedinurl: 'linkedinUrl'
};

const SAMPLE_COLUMNS = ['Email', 'First Name', 'Last Name', 'Company', 'Title', 'Phone', 'LinkedIn URL'];

const SAMPLE_CSV = [
  SAMPLE_COLUMNS.join(','),
  'priya.nair@brightwave.io,Priya,Nair,Brightwave,VP Sales,+15550192834,https://linkedin.com/in/priya-nair',
  'marcus.webb@orbit.inc,Marcus,Webb,Orbit Inc,Head of RevOps,+15559281123,https://linkedin.com/in/marcus-webb',
  'dana.liu@northwind.co,Dana,Liu,Northwind,SDR Lead,+15554438899,https://linkedin.com/in/dana-liu'
].join('\n');

const MAX_ROWS = 500;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function downloadSampleCsv() {
  const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'vetta-leads-import-sample.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Minimal RFC-4180-ish CSV parser (handles quoted fields, escaped quotes, CRLF). */
function parseCsv(text) {
  const rows = [];
  let field = '';
  let row = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\r') {
      // ignore
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += c;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((v) => v.trim() !== ''));
}

/** Parse a CSV file into lead objects + a report of what happened. */
function rowsToLeads(text) {
  const grid = parseCsv(text);
  if (grid.length < 2) {
    return { leads: [], headers: [], mapped: [], skippedNoEmail: 0, error: 'File needs a header row and at least one data row.' };
  }
  const headers = grid[0].map((h) => h.trim());
  const fields = headers.map((h) => FIELD_BY_HEADER[h.toLowerCase()] || null);
  if (!fields.includes('email')) {
    return { leads: [], headers, mapped: fields, skippedNoEmail: 0, error: 'No "Email" column found. Email is required.' };
  }

  const leads = [];
  let skippedNoEmail = 0;
  for (const r of grid.slice(1)) {
    const obj = { source: 'CSV_IMPORT' };
    fields.forEach((f, idx) => {
      if (!f) return;
      const val = (r[idx] ?? '').trim();
      if (val) obj[f] = val;
    });
    if (!obj.email || !EMAIL_RE.test(obj.email)) {
      skippedNoEmail += 1;
      continue;
    }
    leads.push(obj);
  }
  return { leads, headers, mapped: fields, skippedNoEmail, error: null };
}

export default function ImportLeads() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [importType, setImportType] = useState('csv');
  const [dragOver, setDragOver] = useState(false);

  const [file, setFile] = useState(null);
  const [parsed, setParsed] = useState(null); // { leads, headers, mapped, skippedNoEmail, error }
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(null); // { done, total }
  const [result, setResult] = useState(null); // { created, duplicates, failed, errors: [] }

  const reset = () => {
    setFile(null);
    setParsed(null);
    setResult(null);
    setProgress(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleFile = async (f) => {
    if (!f) return;
    setFile(f);
    setResult(null);
    try {
      const text = await f.text();
      setParsed(rowsToLeads(text));
    } catch {
      setParsed({ leads: [], headers: [], mapped: [], skippedNoEmail: 0, error: 'Could not read that file.' });
    }
  };

  const runImport = async () => {
    if (!parsed?.leads.length) return;
    const leads = parsed.leads.slice(0, MAX_ROWS);
    setImporting(true);
    setProgress({ done: 0, total: leads.length });
    const summary = { created: 0, duplicates: 0, failed: 0, errors: [] };

    for (let i = 0; i < leads.length; i++) {
      try {
        await api.leads.create(leads[i]);
        summary.created += 1;
      } catch (err) {
        if (err instanceof ApiError && err.statusCode === 409) {
          summary.duplicates += 1;
        } else {
          summary.failed += 1;
          const msg = err instanceof ApiError ? err.message : 'Request failed';
          if (summary.errors.length < 8) {
            summary.errors.push(`${leads[i].email}: ${Array.isArray(msg) ? msg.join(', ') : msg}`);
          }
        }
      }
      setProgress({ done: i + 1, total: leads.length });
    }

    setImporting(false);
    setResult(summary);
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
          <p className="text-sm text-slate-500">Upload a CSV of leads. Each row is created via the Leads API.</p>
        </div>
      </div>

      {result ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <CheckCircle2 size={44} className="text-emerald-600" />
            <h3 className="text-xl font-bold text-slate-900">Import finished</h3>
            <p className="text-sm text-slate-500">
              {result.created} created · {result.duplicates} skipped (already exist) · {result.failed} failed
            </p>
          </div>

          {result.errors.length > 0 && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              <p className="font-semibold mb-1">Some rows were rejected:</p>
              <ul className="list-disc list-inside space-y-0.5">
                {result.errors.map((e, i) => (
                  <li key={i} className="truncate">{e}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              onClick={reset}
              className="px-5 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-50 transition-colors"
            >
              Import another file
            </button>
            <button
              onClick={() => navigate('/app/leads')}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm flex items-center space-x-2"
            >
              <span>Go to leads</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex bg-white border border-slate-200 p-1 rounded-xl shadow-sm w-fit">
            <button
              onClick={() => setImportType('csv')}
              className={`px-5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                importType === 'csv' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              CSV Upload
            </button>
            <button
              onClick={() => setImportType('crm')}
              className={`px-5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                importType === 'crm' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Connected CRM
            </button>
          </div>

          {importType === 'csv' ? (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 space-y-6">
              <input
                ref={inputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />

              {file ? (
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <FileSpreadsheet size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{file.name}</p>
                      <p className="text-xs text-slate-500">
                        {(file.size / 1024).toFixed(1)} KB
                        {parsed && !parsed.error && (
                          <>
                            {' · '}
                            {parsed.leads.length} valid row{parsed.leads.length === 1 ? '' : 's'}
                            {parsed.skippedNoEmail > 0 && ` · ${parsed.skippedNoEmail} without a valid email`}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={reset}
                    disabled={importing}
                    className="p-2 text-slate-400 hover:text-slate-700 disabled:opacity-50"
                    title="Remove file"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => inputRef.current?.click()}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    handleFile(e.dataTransfer.files?.[0]);
                  }}
                  className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors cursor-pointer flex flex-col items-center justify-center ${
                    dragOver ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-300 bg-slate-50/50 hover:border-indigo-500'
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 shadow-sm">
                    <Upload size={24} />
                  </div>
                  <h4 className="text-base font-bold text-slate-800 mb-1">Drag &amp; drop your .csv file here</h4>
                  <p className="text-xs text-slate-500 max-w-sm mb-4">
                    Automatic field mapping for Email, Name, Phone, LinkedIn, Company and Title.
                  </p>
                  <span className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-semibold text-xs rounded-lg shadow-sm">
                    Browse files
                  </span>
                </div>
              )}

              {parsed?.error && (
                <div className="flex items-start space-x-2 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{parsed.error}</span>
                </div>
              )}

              {/* Parsed preview */}
              {parsed && !parsed.error && parsed.leads.length > 0 && (
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Preview — first {Math.min(5, parsed.leads.length)} of {parsed.leads.length}
                    {parsed.leads.length > MAX_ROWS && ` (first ${MAX_ROWS} will be imported)`}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="text-xs text-slate-500 border-b border-slate-100">
                          {['email', 'firstName', 'lastName', 'company', 'title', 'phone'].map((f) => (
                            <th key={f} className="px-4 py-2 font-semibold">{f}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsed.leads.slice(0, 5).map((l, i) => (
                          <tr key={i}>
                            {['email', 'firstName', 'lastName', 'company', 'title', 'phone'].map((f) => (
                              <td key={f} className="px-4 py-2 text-slate-700 truncate max-w-[10rem]">
                                {l[f] || <span className="text-slate-300">—</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Format reference + sample download */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h5 className="text-sm font-bold text-slate-800 flex items-center">
                      <FileSpreadsheet size={16} className="mr-2 text-indigo-600" />
                      Expected format
                    </h5>
                    <p className="text-xs text-slate-500 mt-1">
                      First row must be a header. <span className="font-semibold text-slate-600">Email</span> is required;
                      other columns are optional and any extra columns are ignored.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={downloadSampleCsv}
                    className="shrink-0 flex items-center space-x-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
                  >
                    <Download size={14} />
                    <span>Sample .csv</span>
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {SAMPLE_COLUMNS.map((col) => (
                    <span
                      key={col}
                      className="inline-flex items-center px-2 py-1 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-600"
                    >
                      {col}
                      {col === 'Email' && <span className="ml-1 text-rose-500">*</span>}
                    </span>
                  ))}
                </div>

                <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-900 text-slate-100 text-[11px] leading-relaxed p-3">
{SAMPLE_CSV}
                </pre>
              </div>

              {importing && progress && (
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Importing…</span>
                    <span>
                      {progress.done} / {progress.total}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 transition-all"
                      style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => navigate(-1)}
                  disabled={importing}
                  className="px-5 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={runImport}
                  disabled={importing || !parsed?.leads.length}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {importing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Importing…</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {parsed?.leads.length
                          ? `Import ${Math.min(parsed.leads.length, MAX_ROWS)} lead${
                              Math.min(parsed.leads.length, MAX_ROWS) === 1 ? '' : 's'
                            }`
                          : 'Import Leads'}
                      </span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 space-y-6">
              <h4 className="font-bold text-slate-800 text-base">Sync leads from a connected source</h4>
              <p className="text-sm text-slate-500">
                Connect a CRM under <button className="text-indigo-600 font-semibold" onClick={() => navigate('/app/integrations')}>Integrations</button>{' '}
                to sync contacts automatically. Direct CRM pull from this screen isn&apos;t available yet — use CSV upload.
              </p>
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => navigate(-1)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => navigate('/app/integrations')}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm flex items-center space-x-2"
                >
                  <span>Open Integrations</span>
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
