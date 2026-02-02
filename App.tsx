
import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart 
} from 'recharts';
import { 
  LayoutDashboard, Map, 
  ChevronUp, ChevronDown, AlertTriangle, 
  Filter, Calendar, Warehouse, Truck, RefreshCw 
} from 'lucide-react';
import { MOCK_MONTHLY_TRENDS, MOCK_WEEKLY_DATA, generateRegionalData } from './mockData';
import { getManagementSummary } from './services/geminiService';
import { SectionType, RegionalPerformance } from './types';

// Components
const StatCard = ({ title, value, unit, change, achievement, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600`}>
        <Icon size={24} />
      </div>
      <div className="text-right">
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <div className="flex items-baseline gap-1 mt-1 justify-end">
          <span className="text-2xl font-bold text-slate-900">{value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          <span className="text-xs text-slate-400 font-medium">{unit}</span>
        </div>
      </div>
    </div>
    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
      <div className="flex items-center gap-1">
        {change >= 0 ? (
          <ChevronUp size={16} className="text-emerald-500" />
        ) : (
          <ChevronDown size={16} className="text-rose-500" />
        )}
        <span className={`text-sm font-semibold ${change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
          {Math.abs(change).toFixed(2)}%
        </span>
        <span className="text-xs text-slate-400 ml-1">环比</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400">达成率</span>
        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full bg-${color}-500`} 
            style={{ width: `${Math.min(achievement, 100)}%` }} 
          />
        </div>
        <span className="text-xs font-bold text-slate-700">{achievement.toFixed(2)}%</span>
      </div>
    </div>
  </div>
);

const ManagementSummary = ({ text, loading }: { text: string; loading: boolean }) => (
  <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 mb-6 relative overflow-hidden">
    <div className="flex items-center gap-2 mb-2">
      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
      <span className="text-sm font-bold text-indigo-900">AI 管理小结</span>
    </div>
    {loading ? (
      <div className="space-y-2">
        <div className="h-4 bg-indigo-100 animate-pulse rounded w-3/4"></div>
        <div className="h-4 bg-indigo-100 animate-pulse rounded w-1/2"></div>
      </div>
    ) : (
      <p className="text-indigo-800 text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
    )}
  </div>
);

const RegionalTable = ({ data, title }: { data: RegionalPerformance[]; title: string }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          {title} <span className="text-xs font-normal text-slate-500">(按当月达成率排序)</span>
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
              <th className="px-4 py-3 whitespace-nowrap">排名</th>
              <th className="px-4 py-3 whitespace-nowrap">分组</th>
              <th className="px-4 py-3 whitespace-nowrap">地区</th>
              <th className="px-4 py-3 whitespace-nowrap">年累计达成</th>
              <th className="px-4 py-3 whitespace-nowrap">当月达成</th>
              <th className="px-4 py-3 whitespace-nowrap">客户数变化</th>
              <th className="px-4 py-3 whitespace-nowrap">月环比增长</th>
              <th className="px-4 py-3 whitespace-nowrap">同比实现额</th>
              <th className="px-4 py-3 whitespace-nowrap">经理参与率</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                    item.rank <= 3 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.rank}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-semibold text-slate-600">[{item.group}]</span>
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">{item.region}</td>
                <td className="px-4 py-3 font-semibold text-indigo-600">{item.ytdAchievement.toFixed(2)}%</td>
                <td className="px-4 py-3">
                   <div className="flex items-center gap-2">
                     <span className={`font-bold ${item.mtdAchievement < 20 ? 'text-rose-600' : 'text-slate-800'}`}>
                       {item.mtdAchievement.toFixed(2)}%
                     </span>
                     {item.mtdAchievement < 20 && <AlertTriangle size={14} className="text-rose-500 animate-bounce" />}
                   </div>
                </td>
                <td className="px-4 py-3">
                   <div className="flex items-center gap-2">
                     <span className={`font-medium ${item.customerChange < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                       {item.customerChange > 0 ? '+' : ''}{item.customerChange.toFixed(2)}
                     </span>
                     {item.customerChange < 0 && <AlertTriangle size={14} className="text-rose-500" />}
                   </div>
                </td>
                <td className="px-4 py-3 text-slate-600">￥{item.momGrowth.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}k</td>
                <td className="px-4 py-3 text-slate-600">￥{item.yoyGrowth.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}k</td>
                <td className="px-4 py-3">
                  <div className="w-24 flex items-center gap-2">
                    <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${item.managerRate}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">{item.managerRate.toFixed(2)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<SectionType>(SectionType.OVERVIEW);
  const [org, setOrg] = useState('全国总部');
  const [week, setWeek] = useState('2024-W12');
  
  const [overviewSummary, setOverviewSummary] = useState('');
  const [regionSummary, setRegionSummary] = useState('');
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [loadingRegion, setLoadingRegion] = useState(false);

  const transportData = useMemo(() => generateRegionalData('transport'), [week, org]);
  const warehouseData = useMemo(() => generateRegionalData('warehouse'), [week, org]);
  const latestMonthData = MOCK_MONTHLY_TRENDS[MOCK_MONTHLY_TRENDS.length - 1];

  useEffect(() => {
    const fetchSummaries = async () => {
      setLoadingOverview(true);
      const overviewContext = `总体收入${latestMonthData.totalIncome.toFixed(2)}万(达成${latestMonthData.targetRate.toFixed(2)}%)，跨境运输占65%，亚洲仓占35%。近期录单延迟率处于合理区间。`;
      const summary1 = await getManagementSummary(overviewContext);
      setOverviewSummary(summary1);
      setLoadingOverview(false);

      setLoadingRegion(true);
      const riskRegions = transportData.filter(d => d.mtdAchievement < 40 || d.customerChange < 0).map(d => d.region).slice(0, 3).join('、');
      const regionContext = `本月区域表现分化。风险点：${riskRegions || '暂无重大异常'} 出现达成率预警或客户流失。`;
      const summary2 = await getManagementSummary(regionContext);
      setRegionSummary(summary2);
      setLoadingRegion(false);
    };

    fetchSummaries();
  }, [latestMonthData, transportData]);

  // Chart Tooltip Formatter to ensure 2 decimal places
  const tooltipFormatter = (value: number, name: string) => {
    const formattedValue = typeof value === 'number' ? value.toFixed(2) : value;
    if (name.includes('%') || name.includes('达成率') || name.includes('延迟率')) {
      return [`${formattedValue}%`, name];
    }
    return [`${formattedValue}`, name];
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation & Filters */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white shadow-xl">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-500 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
              <LayoutDashboard size={20} />
            </div>
            <h1 className="font-bold text-xl tracking-tight hidden md:block">跨境供应链智能中心</h1>
          </div>
          
          <nav className="flex bg-slate-800 p-1 rounded-xl h-10">
            <button 
              onClick={() => setActiveTab(SectionType.OVERVIEW)}
              className={`flex items-center gap-2 px-6 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === SectionType.OVERVIEW ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <LayoutDashboard size={16} />
              总体概览
            </button>
            <button 
              onClick={() => setActiveTab(SectionType.REGION)}
              className={`flex items-center gap-2 px-6 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === SectionType.REGION ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Map size={16} />
              区域表现
            </button>
          </nav>

          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-xl text-slate-300 text-sm font-semibold transition-all active:scale-95">
              <RefreshCw size={14} />
              数据同步
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-slate-800/50 border-b border-slate-800 backdrop-blur-md">
          <div className="max-w-[1600px] mx-auto px-6 py-3 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                 <Filter size={14} />
                 业务组织
               </div>
               <select 
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg py-1.5 px-3 focus:ring-2 focus:ring-indigo-500 cursor-pointer min-w-[160px]"
               >
                 <option>全国总部</option>
                 <option>华南组织</option>
                 <option>华东组织</option>
                 <option>海外事业部</option>
               </select>
            </div>

            <div className="h-6 w-px bg-slate-700 hidden md:block"></div>

            <div className="flex items-center gap-3">
               <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                 <Calendar size={14} />
                 周期选择
               </div>
               <select 
                value={week}
                onChange={(e) => setWeek(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg py-1.5 px-3 focus:ring-2 focus:ring-indigo-500 cursor-pointer min-w-[160px]"
               >
                 <option>2024-W12 (当前)</option>
                 <option>2024-W11</option>
                 <option>2024-W10</option>
                 <option>2024-W09</option>
               </select>
            </div>

            <div className="ml-auto text-slate-500 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              实时计算中 / 更新于: 10:00:00
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full p-6 md:p-8">
        <header className="mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {activeTab === SectionType.OVERVIEW ? '跨境供应链总体经营概览' : '全球区域经营效能'}
          </h2>
          <p className="text-slate-500 mt-2 font-medium">
            当前筛选：<span className="text-indigo-600 font-bold">{org}</span> · <span className="text-indigo-600 font-bold">{week}</span>
          </p>
        </header>

        {activeTab === SectionType.OVERVIEW && (
          <div className="space-y-6">
            <ManagementSummary text={overviewSummary} loading={loadingOverview} />

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard 
                title="跨境供应链总体收入" 
                value={latestMonthData.totalIncome} 
                unit="万" 
                change={14.2} 
                achievement={latestMonthData.targetRate} 
                icon={LayoutDashboard} 
                color="indigo" 
              />
              <StatCard 
                title="跨境运输收入" 
                value={latestMonthData.transportIncome} 
                unit="万" 
                change={8.7} 
                achievement={latestMonthData.targetRate - 2} 
                icon={Truck} 
                color="blue" 
              />
              <StatCard 
                title="亚洲仓收入" 
                value={latestMonthData.warehouseIncome} 
                unit="万" 
                change={21.5} 
                achievement={latestMonthData.targetRate + 4} 
                icon={Warehouse} 
                color="teal" 
              />
            </div>

            {/* Monthly Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-lg font-bold text-slate-800">月度收入及达成趋势 (L12M)</h3>
                   <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-bold">单位: 万</span>
                </div>
                <div className="h-80 w-full">
                  <ResponsiveContainer>
                    <ComposedChart data={MOCK_MONTHLY_TRENDS}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={10} />
                      <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                      <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} domain={[0, 140]} />
                      <Tooltip 
                        formatter={tooltipFormatter}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
                      <Bar yAxisId="left" dataKey="totalIncome" name="总体收入" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={24} />
                      <Line yAxisId="right" type="monotone" dataKey="targetRate" name="达成率 (%)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#fff', stroke: '#f59e0b', strokeWidth: 2 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-lg font-bold text-slate-800">各板块收入贡献比 (L12M)</h3>
                   <span className="text-xs bg-slate-50 text-slate-500 px-2 py-1 rounded font-bold">趋势图</span>
                </div>
                <div className="h-80 w-full">
                  <ResponsiveContainer>
                    <AreaChart data={MOCK_MONTHLY_TRENDS}>
                      <defs>
                        <linearGradient id="colorTrans" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorWare" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                      <Tooltip formatter={tooltipFormatter} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
                      <Area type="monotone" dataKey="transportIncome" name="跨境运输" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTrans)" strokeWidth={2.5} />
                      <Area type="monotone" dataKey="warehouseIncome" name="亚洲仓" stroke="#14b8a6" fillOpacity={1} fill="url(#colorWare)" strokeWidth={2.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Weekly Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6">周度运输方式结构分析 (万)</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer>
                    <BarChart data={MOCK_WEEKLY_DATA.slice(-8)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                      <Tooltip formatter={tooltipFormatter} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
                      <Bar dataKey="sea" name="海运" stackId="a" fill="#3b82f6" />
                      <Bar dataKey="air" name="空运" stackId="a" fill="#6366f1" />
                      <Bar dataKey="land" name="陆运" stackId="a" fill="#60a5fa" />
                      <Bar dataKey="rail" name="铁运" stackId="a" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6">订单录入延迟率质量追踪 (24周)</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer>
                    <LineChart data={MOCK_WEEKLY_DATA}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={10} interval={2} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} unit="%" />
                      <Tooltip formatter={tooltipFormatter} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Line type="monotone" dataKey="delayRate" name="延迟率 (%)" stroke="#f43f5e" strokeWidth={2.5} dot={false} activeDot={{ r: 6, fill: '#f43f5e', stroke: '#fff' }} />
                      <Area type="monotone" dataKey="delayRate" fill="#f43f5e" fillOpacity={0.03} stroke="none" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === SectionType.REGION && (
          <div className="space-y-6">
            <ManagementSummary text={regionSummary} loading={loadingRegion} />

            <div className="grid grid-cols-1 gap-8 pb-12">
               <RegionalTable 
                title="国际运输板块 - 区域经营排行榜" 
                data={transportData} 
               />

               <RegionalTable 
                title="亚洲仓板块 - 仓储效能排行榜" 
                data={warehouseData} 
               />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
