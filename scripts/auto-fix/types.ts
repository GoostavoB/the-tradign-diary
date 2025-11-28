export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ComputedStyles {
  color: string;
  backgroundColor: string;
  fontSize: string;
  fontWeight: string;
  textAlign: string;
  display: string;
  visibility: string;
  opacity: string;
  zIndex: string;
  position: string;
  padding: string;
  margin: string;
  border: string;
  borderRadius: string;
}

export interface ComponentNode {
  id: string;
  tagName: string;
  className: string;
  rect: Rect;
  styles: ComputedStyles;
  text?: string;
  children: string[]; // IDs of children
  parentId?: string;
  attributes: Record<string, string>;
}

export interface ComponentMap {
  [id: string]: ComponentNode;
}

export interface Issue {
  id: string;
  componentId: string;
  type: 'spacing' | 'alignment' | 'contrast' | 'typography' | 'layout' | 'responsiveness' | 'other';
  severity: 'low' | 'medium' | 'high';
  message: string;
  description: string; // Detailed cause
}

export interface CorrectionProposal {
  issueId: string;
  action: 'update_style' | 'update_structure' | 'other';
  targetFile?: string;
  targetLine?: number;
  codeChange?: string;
  description: string;
}

export interface AutoFixConfig {
  url: string;
  viewports: { width: number; height: number }[];
  headless: boolean;
}
