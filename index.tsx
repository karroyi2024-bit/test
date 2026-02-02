
import { createApp, defineComponent, ref, computed, onMounted, watch } from 'vue';
import ECharts from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  VisualMapComponent,
  DatasetComponent
} from 'echarts/components';
import { 
  LayoutDashboard, Map as MapIcon, ChevronUp, ChevronDown, 
  AlertTriangle, Filter, Calendar, Warehouse, 
  Truck, RefreshCw 
} from 'lucide-vue-next';

import { MOCK_MONTHLY_TRENDS, MOCK_WEEKLY_DATA, generateRegionalData } from './mockData';
import { getManagementSummary } from './services/geminiService';
import { SectionType } from './types';

// Register ECharts modules
// Note: 'AreaChart' is not an export of echarts/charts. Use LineChart with areaStyle instead.
use([
  CanvasRenderer,
  BarChart,
  LineChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  VisualMapComponent,
  DatasetComponent
]);

const App = defineComponent({
  name: 'App',
  setup() {
    const activeTab = ref(SectionType.OVERVIEW);
    const org = ref('全国总部');
    const week = ref('2024-W12');
    const isLoadingSummary = ref(false);
    const summaryText = ref('');

    const latestMonthData = computed(() => MOCK_MONTHLY_TRENDS[MOCK_MONTHLY_TRENDS.length - 1]);
    const transportData = computed(() => generateRegionalData('transport'));
    const warehouseData = computed(() => generateRegionalData('warehouse'));

    const fetchSummary = async () => {
      isLoadingSummary.value = true;
      const context = activeTab.value === SectionType.OVERVIEW 
        ? `总体收入${latestMonthData.value.totalIncome.toFixed(2)}万(达成${latestMonthData.value.targetRate.toFixed(2)}%)，跨境运输占65%，亚洲仓占35%。`
        : `本月区域表现分化。深莞沪苏领跑，部分区域达成率偏低需关注。`;
      
      summaryText.value = await getManagementSummary(context);
      isLoadingSummary.value = false;
    };

    onMounted(fetchSummary);
    watch([activeTab, org, week], fetchSummary);

    const monthlyTrendOption = computed(() => ({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { top: 0, right: 0 },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: MOCK_MONTHLY_TRENDS.map(m => m.month) },
      yAxis: [
        { type: 'value', name: '万' },
        { type: 'value', name: '%', max: 140 }
      ],
      series: [
        { name: '总体收入', type: 'bar', data: MOCK_MONTHLY_TRENDS.map(m => m.totalIncome), itemStyle: { color: '#6366f1' }, barWidth: 20 },
        { name: '达成率 (%)', type: 'line', yAxisIndex: 1, data: MOCK_MONTHLY_TRENDS.map(m => m.targetRate), itemStyle: { color: '#f59e0b' } }
      ]
    }));

    const weeklyStructureOption = computed(() => ({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { top: 0, right: 0 },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: MOCK_WEEKLY_DATA.slice(-8).map(w => w.week) },
      yAxis: { type: 'value' },
      series: [
        { name: '海运', type: 'bar', stack: 'w', data: MOCK_WEEKLY_DATA.slice(-8).map(w => w.sea), itemStyle: { color: '#3b82f6' } },
        { name: '空运', type: 'bar', stack: 'w', data: MOCK_WEEKLY_DATA.slice(-8).map(w => w.air), itemStyle: { color: '#6366f1' } }
      ]
    }));

    return () => (
      // Corrected 'class' to 'className' to resolve TS errors in projects with React-based JSX types
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <header className="sticky top-0 z-30 bg-slate-900 text-white shadow-xl">
          <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-500 p-2 rounded-lg"><LayoutDashboard size={20} /></div>
              <h1 className="font-bold text-xl tracking-tight hidden md:block">跨境供应链智能中心</h1>
            </div>
            
            <nav className="flex bg-slate-800 p-1 rounded-xl h-10">
              <button 
                onClick={() => activeTab.value = SectionType.OVERVIEW} 
                className={[
                  'flex items-center gap-2 px-6 rounded-lg text-sm font-semibold transition-all', 
                  activeTab.value === SectionType.OVERVIEW ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'
                ].join(' ')}
              >
                概览
              </button>
              <button 
                onClick={() => activeTab.value = SectionType.REGION} 
                className={[
                  'flex items-center gap-2 px-6 rounded-lg text-sm font-semibold transition-all', 
                  activeTab.value === SectionType.REGION ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'
                ].join(' ')}
              >
                区域
              </button>
            </nav>

            <button className="bg-slate-800 px-4 py-2 rounded-xl text-sm"><RefreshCw size={14} /></button>
          </div>

          <div className="bg-slate-800/50 border-b border-slate-800">
            <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-slate-400" />
                <select 
                  value={org.value} 
                  onInput={(e: any) => org.value = e.target.value}
                  className="bg-slate-900 text-white text-sm rounded px-2 py-1 outline-none"
                >
                  <option value="全国总部">全国总部</option>
                  <option value="华南组织">华南组织</option>
                  <option value="华东组织">华东组织</option>
                  <option value="海外事业部">海外事业部</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-slate-400" />
                <select 
                  value={week.value} 
                  onInput={(e: any) => week.value = e.target.value}
                  className="bg-slate-900 text-white text-sm rounded px-2 py-1 outline-none"
                >
                  <option value="2024-W12">2024-W12 (当前)</option>
                  <option value="2024-W11">2024-W11</option>
                  <option value="2024-W10">2024-W10</option>
                </select>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-[1600px] mx-auto w-full p-6 md:p-8">
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6">
            <div className="font-bold text-indigo-900 mb-1 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
              AI 智能分析
            </div>
            {isLoadingSummary.value ? (
              <p className="text-indigo-400 text-sm italic">计算中...</p>
            ) : (
              <p className="text-indigo-800 text-sm leading-relaxed">{summaryText.value}</p>
            )}
          </div>

          {activeTab.value === SectionType.OVERVIEW ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: '总收入', val: latestMonthData.value.totalIncome, color: 'indigo', icon: LayoutDashboard },
                  { label: '运输收入', val: latestMonthData.value.transportIncome, color: 'blue', icon: Truck },
                  { label: '仓储收入', val: latestMonthData.value.warehouseIncome, color: 'teal', icon: Warehouse }
                ].map(stat => (
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm" key={stat.label}>
                    <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {stat.val.toFixed(2)} <span className="text-xs">万</span>
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold mb-4 text-slate-800">月度收入及达成趋势</h3>
                  <ECharts className="chart-container" option={monthlyTrendOption.value} autoresize />
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold mb-4 text-slate-800">周度运输结构分析</h3>
                  <ECharts className="chart-container" option={weeklyStructureOption.value} autoresize />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                 <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3">排名</th>
                        <th className="px-4 py-3">地区</th>
                        <th className="px-4 py-3 text-right">当月达成率</th>
                        <th className="px-4 py-3 text-right">环比增长</th>
                        <th className="px-4 py-3 text-center">状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transportData.value.map(item => (
                        <tr key={item.id} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            <span className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-full text-xs font-bold">
                              {item.rank}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-900">{item.region}</td>
                          <td className={`px-4 py-3 text-right font-bold ${item.mtdAchievement < 40 ? 'text-rose-500' : 'text-slate-900'}`}>
                            {item.mtdAchievement.toFixed(2)}%
                          </td>
                          <td className="px-4 py-3 text-right text-emerald-500 font-medium">
                            +{(Math.random() * 8 + 2).toFixed(2)}%
                          </td>
                          <td className="px-4 py-3 text-center">
                            {item.mtdAchievement < 40 ? <AlertTriangle size={16} className="text-rose-500 inline" /> : <div className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></div>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }
});

const app = createApp(App);
app.mount('#root');
