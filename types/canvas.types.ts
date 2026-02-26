export type ToolType = 'select' | 'text' | 'rect' | 'circle' | 'triangle' | 'line' | 'image' | 'pan';

export type FontWeight = 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
export type TextAlign = 'left' | 'center' | 'right' | 'justify';
export type LineCapType = 'butt' | 'round' | 'square';

export interface ElementProperties {
  id: string;
  type: string;
  name: string;
  visible: boolean;
  locked: boolean;
  // Position
  left: number;
  top: number;
  width: number;
  height: number;
  angle: number;
  scaleX: number;
  scaleY: number;
  // Style
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity: number;
  // Text specific
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: FontWeight;
  fontStyle?: string;
  textAlign?: TextAlign;
  lineHeight?: number;
  letterSpacing?: number;
  underline?: boolean;
  linethrough?: boolean;
  // Shadow
  shadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
}

export interface CanvasHistoryState {
  json: string;
  timestamp: number;
}

export interface CanvasViewport {
  zoom: number;
  panX: number;
  panY: number;
}
