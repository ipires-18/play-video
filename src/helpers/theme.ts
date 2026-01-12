import { JobType } from '../../types';

export interface Theme {
  barBg: string;
  textPrimary: string;
  progressBg: string;
  progressFill: string;
  dot: string;
}

/**
 * Retorna o tema baseado no tipo de job
 */
export const getTheme = (jobType: JobType): Theme => {
  const isCompany = jobType === 'company';
  return {
    barBg: 'bg-[#e9f2ee]', // Light greenish background
    textPrimary: 'text-[#4a5568]',
    progressBg: 'bg-[#d1d5db]',
    progressFill: isCompany ? 'bg-indigo-600' : 'bg-slate-400',
    dot: 'bg-[#10b981]', // Green dot
  };
};
