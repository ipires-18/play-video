import { format, addSeconds, startOfDay } from 'date-fns';

/**
 * Formata segundos em formato MM:SS usando date-fns
 * Exemplo: 125 segundos -> "2:05"
 */
export const formatTime = (seconds: number): string => {
  const baseDate = startOfDay(new Date());
  const dateWithSeconds = addSeconds(baseDate, Math.floor(seconds));
  return format(dateWithSeconds, 'm:ss');
};
