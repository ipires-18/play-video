/**
 * Função utilitária para combinar classes CSS
 * Similar ao cn do shadcn/ui ou classnames
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
