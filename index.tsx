
import { createApp, defineComponent, ref, computed, onMounted, watch, h } from 'vue';
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
  LayoutDashboard, 
  AlertTriangle, 
  Filter, 
  Calendar, 
  Warehouse, 
  Truck, 
  RefreshCw 
} from 'lucide-vue-next';

import { MOCK_MONTHLY_TRENDS, MOCK_WEEKLY_DATA, generateRegionalData } from './mockData';
import { getManagementSummary } from './services/geminiService';
import { SectionType } from './types';

// Register ECharts modules
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
      legend: { top: 10, right: 10 },
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
      legend: { top: 10, right: 10 },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: MOCK_WEEKLY_DATA.slice(-8).map(w => w.week) },
      yAxis: { type: 'value' },
      series: [
        { name: '海运', type: 'bar', stack: 'w', data: MOCK_WEEKLY_DATA.slice(-8).map(w => w.sea), itemStyle: { color: '#3b82f6' } },
        { name: '空运', type: 'bar', stack: 'w', data: MOCK_WEEKLY_DATA.slice(-8).map(w => w.air), itemStyle: { color: '#6366f1' } }
      ]
    }));

    // Explicit render function using h() to bypass JSX issues
    return () => h('div', { class: 'min-h-screen bg-slate-50 flex flex-col' }, [
      // Header
      h('header', { class: 'sticky top-0 z-30 bg-slate-900 text-white shadow-xl' }, [
        h('div', { class: 'max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between border-b border-slate-800' }, [
          h('div', { class: 'flex items-center gap-4' }, [
            h('div', { class: 'bg-indigo-500 p-2 rounded-lg' }, [h(LayoutDashboard, { size: 20 })]),
            h('h1', { class: 'font-bold text-xl tracking-tight hidden md:block' }, '跨境供应链智能中心')
          ]),
          h('nav', { class: 'flex bg-slate-800 p-1 rounded-xl h-10' }, [
            h('button', { 
              onClick: () => activeTab.value = SectionType.OVERVIEW,
              class: [
                'flex items-center gap-2 px-6 rounded-lg text-sm font-semibold transition-all',
                activeTab.value === SectionType.OVERVIEW ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'
              ]
            }, '概览'),
            h('button', { 
              onClick: () => activeTab.value = SectionType.REGION,
              class: [
                'flex items-center gap-2 px-6 rounded-lg text-sm font-semibold transition-all',
                activeTab.value === SectionType.REGION ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'
              ]
            }, '区域')
          ]),
          h('button', { class: 'bg-slate-800 px-4 py-2 rounded-xl text-sm flex items-center justify-center hover:bg-slate-700 transition-colors' }, [h(RefreshCw, { size: 14 })])
        ]),
        h('div', { class: 'bg-slate-800/50 border-b border-slate-800' }, [
          h('div', { class: 'max-w-[1600px] mx-auto px-6 py-3 flex items-center gap-6' }, [
            h('div', { class: 'flex items-center gap-2' }, [
              h(Filter, { size: 14, class: 'text-slate-400' }),
              h('select', { 
                value: org.value, 
                onInput: (e: any) => org.value = e.target.value,
                class: 'bg-slate-900 text-white text-sm rounded px-3 py-1 outline-none border border-slate-700'
              }, [
                h('option', { value: '全国总部' }, '全国总部'),
                h('option', { value: '华南组织' }, '华南组织'),
                h('option', { value: '华东组织' }, '华东组织'),
                h('option', { value: '海外事业部' }, '海外事业部')
              ])
            ]),
            h('div', { class: 'flex items-center gap-2' }, [
              h(Calendar, { size: 14, class: 'text-slate-400' }),
              h('select', { 
                value: week.value, 
                onInput: (e: any) => week.value = e.target.value,
                class: 'bg-slate-900 text-white text-sm rounded px-3 py-1 outline-none border border-slate-700'
              }, [
                h('option', { value: '2024-W12' }, '2024-W12 (当前)'),
                h('option', { value: '2024-W11' }, '2024-W11'),
                h('option', { value: '2024-W10' }, '2024-W10')
              ])
            ])
          ])
        ])
      ]),

      // Main Content
      h('main', { class: 'flex-1 max-w-[1600px] mx-auto w-full p-6 md:p-8' }, [
        // AI Summary Section
        h('div', { class: 'bg-indigo-50 border border-indigo-100 rounded-xl p-5 mb-8 shadow-sm' }, [
          h('div', { class: 'font-bold text-indigo-900 mb-2 flex items-center gap-2' }, [
            h('div', { class: 'w-2 h-2 rounded-full bg-indigo-500 animate-pulse' }),
            'AI 智能管理分析'
          ]),
          isLoadingSummary.value 
            ? h('p', { class: 'text-indigo-400 text-sm italic animate-pulse' }, '正在根据最新供应链数据进行深度学习分析...')
            : h('p', { class: 'text-indigo-800 text-sm leading-relaxed font-medium' }, summaryText.value)
        ]),

        // Active Tab Rendering
        activeTab.value === SectionType.OVERVIEW 
          ? h('div', { class: 'space-y-8' }, [
              // Stats Cards
              h('div', { class: 'grid grid-cols-1 md:grid-cols-3 gap-6' }, [
                { label: '总收入 (MTD)', val: latestMonthData.value.totalIncome, icon: LayoutDashboard },
                { label: '运输收入 (MTD)', val: latestMonthData.value.transportIncome, icon: Truck },
                { label: '仓储收入 (MTD)', val: latestMonthData.value.warehouseIncome, icon: Warehouse }
              ].map(stat => h('div', { class: 'bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow', key: stat.label }, [
                h('div', { class: 'flex items-center gap-3 mb-4' }, [
                  h('div', { class: 'p-2 rounded-lg bg-indigo-50 text-indigo-600' }, [h(stat.icon, { size: 18 })]),
                  h('p', { class: 'text-sm text-slate-500 font-medium' }, stat.label)
                ]),
                h('p', { class: 'text-3xl font-bold text-slate-900' }, [
                  stat.val.toFixed(2),
                  h('span', { class: 'text-xs font-normal text-slate-400 ml-1' }, '万')
                ])
              ]))),
              // Charts
              h('div', { class: 'grid grid-cols-1 lg:grid-cols-2 gap-8' }, [
                h('div', { class: 'bg-white p-6 rounded-2xl border border-slate-200 shadow-sm' }, [
                  h('h3', { class: 'font-bold mb-6 text-slate-800' }, '月度收入及达成趋势'),
                  h(ECharts, { class: 'chart-container', option: monthlyTrendOption.value, autoresize: true })
                ]),
                h('div', { class: 'bg-white p-6 rounded-2xl border border-slate-200 shadow-sm' }, [
                  h('h3', { class: 'font-bold mb-6 text-slate-800' }, '周度运输结构分析 (海运 vs 空运)'),
                  h(ECharts, { class: 'chart-container', option: weeklyStructureOption.value, autoresize: true })
                ])
              ])
            ])
          : h('div', { class: 'bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm' }, [
              h('table', { class: 'w-full text-left text-sm' }, [
                h('thead', { class: 'bg-slate-50' }, [
                  h('tr', [
                    h('th', { class: 'px-6 py-4 font-bold text-slate-700' }, '排名'),
                    h('th', { class: 'px-6 py-4 font-bold text-slate-700' }, '地区'),
                    h('th', { class: 'px-6 py-4 text-right font-bold text-slate-700' }, '当月达成率'),
                    h('th', { class: 'px-6 py-4 text-right font-bold text-slate-700' }, '环比增长'),
                    h('th', { class: 'px-6 py-4 text-center font-bold text-slate-700' }, '状态')
                  ])
                ]),
                h('tbody', transportData.value.map(item => h('tr', { key: item.id, class: 'border-t border-slate-50 hover:bg-slate-50/80 transition-colors' }, [
                  h('td', { class: 'px-6 py-4' }, [
                    h('span', { class: 'w-6 h-6 flex items-center justify-center bg-slate-100 rounded-full text-xs font-bold text-slate-600' }, item.rank)
                  ]),
                  h('td', { class: 'px-6 py-4 font-semibold text-slate-900' }, item.region),
                  h('td', { class: [
                    'px-6 py-4 text-right font-bold',
                    item.mtdAchievement < 40 ? 'text-rose-500' : 'text-slate-900'
                  ] }, `${item.mtdAchievement.toFixed(2)}%`),
                  h('td', { class: 'px-6 py-4 text-right text-emerald-600 font-semibold' }, `+${(Math.random() * 8 + 2).toFixed(2)}%`),
                  h('td', { class: 'px-6 py-4 text-center' }, [
                    item.mtdAchievement < 40 
                      ? h(AlertTriangle, { size: 18, class: 'text-rose-500 inline' }) 
                      : h('div', { class: 'w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block ring-4 ring-emerald-50' })
                  ])
                ])))
              ])
            ])
      ])
    ]);
  }
});

const app = createApp(App);
app.mount('#root');
