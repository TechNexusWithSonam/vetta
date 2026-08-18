import React from 'react';
import { 
  TrendingUp, 
  PhoneCall, 
  CalendarCheck, 
  DollarSign, 
  ArrowUpRight 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// Dummy data for the pipeline chart
const pipelineData = [
  { name: 'Mon', calls: 400, connects: 120, meetings: 10 },
  { name: 'Tue', calls: 300, connects: 98, meetings: 8 },
  { name: 'Wed', calls: 550, connects: 180, meetings: 15 },
  { name: 'Thu', calls: 450, connects: 140, meetings: 12 },
  { name: 'Fri', calls: 380, connects: 110, meetings: 9 },
  { name: 'Sat', calls: 150, connects: 40, meetings: 2 },
  { name: 'Sun', calls: 100, connects: 25, meetings: 1 },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1: Cost Saved */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">SDR Cost Saved</p>
              <h2 className="text-3xl font-bold text-slate-900">$48,200</h2>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <DollarSign className="text-emerald-600" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpRight className="text-emerald-500 mr-1" size={16} />
            <span className="text-emerald-600 font-medium">18% MoM</span>
            <span className="text-slate-400 ml-2">≈ 3.4 SDRs automated</span>
          </div>
        </div>

        {/* KPI 2: Connect Rate */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Connect Rate</p>
              <h2 className="text-3xl font-bold text-slate-900">41.2%</h2>
            </div>
            <div className="p-2 bg-indigo-50 rounded-lg">
              <TrendingUp className="text-indigo-600" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpRight className="text-emerald-500 mr-1" size={16} />
            <span className="text-emerald-600 font-medium">4.2pt</span>
            <span className="text-slate-400 ml-2">vs last week</span>
          </div>
        </div>

        {/* KPI 3: Meetings Booked */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Meetings Booked</p>
              <h2 className="text-3xl font-bold text-slate-900">37</h2>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <CalendarCheck className="text-blue-600" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpRight className="text-emerald-500 mr-1" size={16} />
            <span className="text-emerald-600 font-medium">9 this wk</span>
            <span className="text-slate-400 ml-2">added to CRM</span>
          </div>
        </div>

        {/* KPI 4: Live Conversations */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Live Conversations</p>
              <h2 className="text-3xl font-bold text-slate-900">312</h2>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg">
              <PhoneCall className="text-orange-600" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpRight className="text-emerald-500 mr-1" size={16} />
            <span className="text-emerald-600 font-medium">11%</span>
            <span className="text-slate-400 ml-2">from verified list</span>
          </div>
        </div>

      </div>

      {/* Main Content Grid (Chart + Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart Area */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Outbound Pipeline Metrics</h3>
            <select className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 block px-3 py-1.5">
              <option>This Week</option>
              <option>Last 30 Days</option>
              <option>This Quarter</option>
            </select>
          </div>
          
          {/* Recharts Implementation */}
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pipelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="calls" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCalls)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Latest Activity</h3>
          
          <div className="space-y-6">
            {/* Activity Item 1 */}
            <div className="flex items-start space-x-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <CalendarCheck size={14} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Meeting Booked: Marcus Webb</p>
                <p className="text-xs text-slate-500 mt-1">Routed to AE (Sarah Jenkins) • Orbit Inc.</p>
                <p className="text-xs text-slate-400 mt-1">10 mins ago</p>
              </div>
            </div>

            {/* Activity Item 2 */}
            <div className="flex items-start space-x-3">
              <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                <PhoneCall size={14} className="text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Live Bridge: Priya Nair</p>
                <p className="text-xs text-slate-500 mt-1">AI verified human • Brightwave</p>
                <p className="text-xs text-slate-400 mt-1">45 mins ago</p>
              </div>
            </div>

            {/* Activity Item 3 */}
            <div className="flex items-start space-x-3">
              <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <TrendingUp size={14} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Campaign Launched</p>
                <p className="text-xs text-slate-500 mt-1">Q3 SaaS Founders • 1,200 leads enriched</p>
                <p className="text-xs text-slate-400 mt-1">2 hours ago</p>
              </div>
            </div>
          </div>
          
          <button className="w-full mt-6 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            View All Logs
          </button>
        </div>

      </div>
    </div>
  );
}