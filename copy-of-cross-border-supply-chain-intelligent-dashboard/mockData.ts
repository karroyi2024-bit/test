
import { MonthlyTrend, WeeklyProductData, RegionalPerformance } from './types';

// Logistics Seasonality Multipliers (Dip in Feb for CNY, Peak in Q4)
const SEASONALITY = [0.95, 0.65, 1.05, 1.1, 1.08, 1.15, 1.12, 1.25, 1.35, 1.45, 1.75, 1.6];

export const MOCK_MONTHLY_TRENDS: MonthlyTrend[] = Array.from({ length: 12 }, (_, i) => {
  const baseTotal = 1500;
  const seasonalMultiplier = SEASONALITY[i];
  const noise = 1 + (Math.random() * 0.1 - 0.05);
  
  const totalIncome = baseTotal * seasonalMultiplier * noise;
  const transportIncome = totalIncome * 0.65; // Transport usually accounts for ~65%
  const warehouseIncome = totalIncome * 0.35;  // Warehousing ~35%
  
  // Achievement rates usually hover around 85-105%
  const targetRate = 88 + Math.random() * 18;

  return {
    month: `2024-${(i + 1).toString().padStart(2, '0')}`,
    totalIncome,
    transportIncome,
    warehouseIncome,
    targetRate,
  };
});

export const MOCK_WEEKLY_DATA: WeeklyProductData[] = Array.from({ length: 24 }, (_, i) => {
  const baseWeekly = 400;
  // Transport Mode Splits: Sea (45%), Air (25%), Land (20%), Rail (10%)
  return {
    week: `W${(i + 1).toString().padStart(2, '0')}`,
    land: baseWeekly * 0.20 * (0.9 + Math.random() * 0.2),
    sea: baseWeekly * 0.45 * (0.85 + Math.random() * 0.3),
    air: baseWeekly * 0.25 * (0.8 + Math.random() * 0.4),
    rail: baseWeekly * 0.10 * (0.95 + Math.random() * 0.1),
    // Order delay rates in logistics are usually low but sensitive, 0.5% - 4.5%
    delayRate: 0.8 + Math.random() * 3.2,
  };
});

export const REGIONS_METADATA = [
  { name: '深莞区', tier: 1 },
  { name: '沪苏区', tier: 1 },
  { name: '京津区', tier: 2 },
  { name: '浙闽区', tier: 1 },
  { name: '粤东区', tier: 2 },
  { name: '西南区', tier: 2 },
  { name: '华中区', tier: 2 },
  { name: '西北区', tier: 3 },
  { name: '香港区', tier: 1 },
  { name: '东南亚区', tier: 2 },
  { name: '欧美区', tier: 1 },
  { name: '中东区', tier: 2 },
  { name: '拉美区', tier: 3 },
  { name: '非南区', tier: 3 }
];

export const generateRegionalData = (type: 'transport' | 'warehouse'): RegionalPerformance[] => {
  return REGIONS_METADATA.map((meta, index) => {
    // Tier 1 regions perform better on average
    const tierBonus = meta.tier === 1 ? 15 : meta.tier === 2 ? 5 : -10;
    
    // Achievement Logic: 
    // Tier 1: 90-110%
    // Tier 3: 15-85% (higher risk of underperforming)
    const mtdBase = 70 + tierBonus + (Math.random() * 30);
    const mtdAchievement = Math.max(5, Math.min(120, mtdBase)); 

    return {
      id: `${type}-${index}`,
      group: (['A', 'B', 'C', 'D', 'E'][meta.tier - 1] || 'E') as any,
      region: meta.name,
      ytdAchievement: 82 + (Math.random() * 15) - (meta.tier * 2),
      mtdAchievement: mtdAchievement,
      // Customer change: Tier 1 usually positive, Tier 3 might be negative
      customerChange: (meta.tier === 1 ? 2 : -2) + (Math.random() * 10 - 5),
      momGrowth: (500 + Math.random() * 1000) * (4 - meta.tier),
      yoyGrowth: (1000 + Math.random() * 2000) * (4 - meta.tier),
      managerRate: 75 + Math.random() * 25,
      rank: 0 // Will be calculated after sort
    };
  })
  .sort((a, b) => b.mtdAchievement - a.mtdAchievement)
  .map((item, index) => ({ ...item, rank: index + 1 }));
};
