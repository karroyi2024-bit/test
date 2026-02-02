
export interface IndicatorData {
  title: string;
  value: number;
  unit: string;
  change: number;
  achievement: number;
}

export interface MonthlyTrend {
  month: string;
  totalIncome: number;
  transportIncome: number;
  warehouseIncome: number;
  targetRate: number;
}

export interface WeeklyProductData {
  week: string;
  land: number;
  sea: number;
  air: number;
  rail: number;
  delayRate: number;
}

export interface RegionalPerformance {
  id: string;
  group: 'A' | 'B' | 'C' | 'D' | 'E';
  region: string;
  ytdAchievement: number;
  mtdAchievement: number;
  customerChange: number;
  momGrowth: number;
  yoyGrowth: number;
  managerRate: number;
  rank: number;
}

export enum SectionType {
  OVERVIEW = 'OVERVIEW',
  REGION = 'REGION'
}
