import React, { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  PhoneCall, 
  Clock, 
  Calendar,
  BarChart2
} from 'lucide-react';

export default function Analytics() {
  const [timeframe, setTimeframe] = useState('30d');

  return (
    <div className="h-full flex flex-col space-y-6 max-w-7xl mx-auto w-full">
      
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Analytics</h2>
          <p className="text-sm text-slate-500 mt-1">Performance across campaigns, agents and time-of-day</p>
        </div>
        <div className="flex bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
          <button 
            onClick={() => setTimeframe('7d')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${timeframe === '7d' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            7d
          </button>
          <button 
            onClick={() => setTimeframe('30d')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${timeframe === '30d' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            30d
          </button>
          <button 
            onClick={() => setTimeframe('qtd')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${timeframe === 'qtd' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            QTD
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-6 min-h-0 overflow-y-auto pb-8">
        
        {/* Top Row: Charts & Tables */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Heatmap Chart */}
          <div className="flex-[1.4] bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800">Connect rate by hour</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">Best window: 10am–12pm local</p>
              </div>
              <BarChart2 size={18} className="text-slate-400" />
            </div>
            <div className="p-6 flex-1 flex flex-col justify-end">
              <div className="flex items-end gap-2 h-48 w-full">
                {/* Simulated Bar Chart with Brand Indigo & Orange accents */}
                <div className="flex-1 rounded-t-md bg-indigo-50 h-[42%]"></div>
                <div className="flex-1 rounded-t-md bg-indigo-50 h-[55%]"></div>
                <div className="flex-1 rounded-t-md bg-indigo-100 h-[68%]"></div>
                <div className="flex-1 rounded-t-md bg-gradient-to-b from-indigo-500 to-indigo-700 h-[92%] shadow-sm"></div>
                <div className="flex-1 rounded-t-md bg-gradient-to-b from-indigo-500 to-indigo-700 h-[98%] shadow-sm"></div>
                <div className="flex-1 rounded-t-md bg-indigo-100 h-[74%]"></div>
                <div className="flex-1 rounded-t-md bg-indigo-100 h-[88%]"></div>
                <div className="flex-1 rounded-t-md bg-indigo-100 h-[82%]"></div>
                <div className="flex-1 rounded-t-md bg-indigo-50 h-[70%]"></div>
                <div className="flex-1 rounded-t-md bg-indigo-50 h-[58%]"></div>
                <div className="flex-1 rounded-t-md bg-indigo-50 h-[40%]"></div>
              </div>
              <div className="flex justify-between text-xs text-slate-400 font-mono mt-3 pt-3 border-t border-slate-100">
                <span>8a</span><span>9a</span><span>10a</span><span>11a</span><span>12p</span><span>1p</span><span>2p</span><span>3p</span><span>4p</span><span>5p</span><span>6p</span>
              </div>
            </div>
          </div>

          {/* Top Campaigns Table */}
          <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Top campaigns</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <b className="block text-slate-800">Enterprise SaaS — Q2</b>
                      <span className="text-xs text-slate-500 mt-0.5 block">1,240 leads</span>
                    </td>
                    <td className="p-4 text-right">
                      <b className="block text-indigo-600">17.1%</b>
                      <span className="text-xs text-slate-500 mt-0.5 block">booking rate</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <b className="block text-slate-800">Logistics — Texas launch</b>
                      <span className="text-xs text-slate-500 mt-0.5 block">880 leads</span>
                    </td>
                    <td className="p-4 text-right">
                      <b className="block text-indigo-600">15.4%</b>
                      <span className="text-xs text-slate-500 mt-0.5 block">booking rate</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <b className="block text-slate-800">Healthtech — RevOps</b>
                      <span className="text-xs text-slate-500 mt-0.5 block">1,510 leads</span>
                    </td>
                    <td className="p-4 text-right">
                      <b className="block text-indigo-600">12.8%</b>
                      <span className="text-xs text-slate-500 mt-0.5 block">booking rate</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <b className="block text-slate-800">Fintech — re-engage</b>
                      <span className="text-xs text-slate-500 mt-0.5 block">1,190 leads</span>
                    </td>
                    <td className="p-4 text-right">
                      <b className="block text-indigo-600">11.2%</b>
                      <span className="text-xs text-slate-500 mt-0.5 block">booking rate</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bottom Row: Core KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm">
            <div className="flex items-center space-x-2 text-slate-600 mb-3">
              <Users size={16} />
              <span className="text-sm font-semibold">Leads processed</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">4,820</div>
            <div className="flex items-center text-xs font-semibold text-emerald-600">
              <TrendingUp size={14} className="mr-1" />
              <span>▲ 18%</span>
              <span className="text-slate-400 font-medium ml-1">MoM</span>
            </div>
          </div>

          <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm">
            <div className="flex items-center space-x-2 text-slate-600 mb-3">
              <PhoneCall size={16} />
              <span className="text-sm font-semibold">Calls dialed</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">3,940</div>
            <div className="flex items-center text-xs font-semibold text-emerald-600">
              <TrendingUp size={14} className="mr-1" />
              <span>▲ 22%</span>
              <span className="text-slate-400 font-medium ml-1">MoM</span>
            </div>
          </div>

          <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm">
            <div className="flex items-center space-x-2 text-slate-600 mb-3">
              <Clock size={16} />
              <span className="text-sm font-semibold">Talk time</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">214<span className="text-xl">h</span></div>
            <div className="flex items-center text-xs font-semibold text-emerald-600">
              <TrendingUp size={14} className="mr-1" />
              <span>▲ 31%</span>
              <span className="text-slate-400 font-medium ml-1">MoM</span>
            </div>
          </div>

          <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm">
            <div className="flex items-center space-x-2 text-slate-600 mb-3">
              <Calendar size={16} />
              <span className="text-sm font-semibold">Meetings booked</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">137</div>
            <div className="flex items-center text-xs font-semibold text-emerald-600">
              <TrendingUp size={14} className="mr-1" />
              <span>▲ 27%</span>
              <span className="text-slate-400 font-medium ml-1">MoM</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}