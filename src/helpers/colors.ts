import React from 'react';
import { VideoControlsColors } from '../../types';

/**
 * Aplica cores customizadas via CSS variables em um elemento
 * Se colors não for fornecido ou estiver vazio, não aplica nada (usa cores nativas)
 */
export const applyControlColors = (
  element: HTMLElement | null,
  colors?: VideoControlsColors
): void => {
  if (!element || !colors) return;

  // Aplicar apenas as cores que foram fornecidas
  if (colors.controlBarBg) {
    element.style.setProperty('--video-control-bar-bg', colors.controlBarBg);

    // Criar versões com transparência para uso em overlays
    const controlBarBgRgb = hexToRgb(colors.controlBarBg);
    if (controlBarBgRgb) {
      element.style.setProperty(
        '--video-control-bar-bg-70',
        `rgba(${controlBarBgRgb.r}, ${controlBarBgRgb.g}, ${controlBarBgRgb.b}, 0.7)`
      );
      element.style.setProperty(
        '--video-control-bar-bg-90',
        `rgba(${controlBarBgRgb.r}, ${controlBarBgRgb.g}, ${controlBarBgRgb.b}, 0.9)`
      );
    }
  }

  if (colors.controlColor) {
    element.style.setProperty('--video-control-color', colors.controlColor);
  }

  if (colors.controlColorHover) {
    element.style.setProperty(
      '--video-control-color-hover',
      colors.controlColorHover
    );
  }

  if (colors.progressFill) {
    element.style.setProperty('--video-progress-fill', colors.progressFill);
  }

  if (colors.progressBg) {
    element.style.setProperty('--video-progress-bg', colors.progressBg);
  }
};

/**
 * Converte cor hexadecimal para RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Cria um objeto de estilo com as CSS variables aplicadas
 * Se colors não for fornecido ou estiver vazio, retorna objeto vazio para usar cores nativas
 */
export const getControlColorsStyle = (
  colors?: VideoControlsColors
): React.CSSProperties => {
  // Se colors não for fornecido, retorna objeto vazio para usar cores nativas (wkp-primary-*)
  if (!colors) {
    return {} as React.CSSProperties;
  }

  const style: Record<string, string> = {};

  // Aplicar apenas as cores que foram fornecidas
  if (colors.controlBarBg) {
    style['--video-control-bar-bg'] = colors.controlBarBg;

    // Criar versões com transparência para uso em overlays
    const controlBarBgRgb = hexToRgb(colors.controlBarBg);
    if (controlBarBgRgb) {
      style['--video-control-bar-bg-70'] =
        `rgba(${controlBarBgRgb.r}, ${controlBarBgRgb.g}, ${controlBarBgRgb.b}, 0.7)`;
      style['--video-control-bar-bg-90'] =
        `rgba(${controlBarBgRgb.r}, ${controlBarBgRgb.g}, ${controlBarBgRgb.b}, 0.9)`;
    }
  }

  if (colors.controlColor) {
    style['--video-control-color'] = colors.controlColor;
  }

  if (colors.controlColorHover) {
    style['--video-control-color-hover'] = colors.controlColorHover;
  }

  if (colors.progressFill) {
    style['--video-progress-fill'] = colors.progressFill;
  }

  if (colors.progressBg) {
    style['--video-progress-bg'] = colors.progressBg;
  }

  return style as React.CSSProperties;
};
