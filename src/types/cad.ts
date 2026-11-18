export type PartKind =
  | 'enclosure'
  | 'phoneStand'
  | 'chassis'
  | 'box'
  | 'bracket'
  | 'raspberryPi';

export type MaterialFinish = 'charcoal' | 'slate' | 'aluminum' | 'resin';

export type CameraPreset = 'iso' | 'top' | 'front' | 'side';

export interface CadParams {
  length: number;
  width: number;
  height: number;
  wallThickness: number;
  holeDiameter: number;
  cornerRadius: number;
  clearance: number;
  angle: number;
  standoffCount: number;
  hasLid: boolean;
}

export interface ParamControlDef {
  key: keyof CadParams;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  description: string;
}

export interface GeometryCheckItem {
  id: string;
  label: string;
  status: 'pass' | 'warning' | 'question';
  detail: string;
}

export interface VersionSnapshot {
  version: string;
  label: string;
  originNote: string;
  promptOrChange: string;
  params: CadParams;
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  message: string;
  changedFields?: string[];
}

export interface VerifiedCase {
  id: PartKind;
  slug: string;
  title: string;
  provenance: string;
  summary: string;
  imagePath: string;
  imageAlt: string;
  originalPrompt: string;
  followUpPrompt: string;
  followUpSummary: string;
  components: string[];
  params: CadParams;
  versions: VersionSnapshot[];
  files: {
    stepName: string;
    stlName: string;
    stepSizeKb: number;
    stlTriangles: number;
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ToolPageConfig {
  id: PartKind;
  route: string;
  name: string;
  shortName: string;
  seoTitle: string;
  h1: string;
  seoDescription: string;
  targetTopic: string;
  caseStatus: 'Verified Repository Case' | 'Planned Parametric Template';
  summary: string;
  useCases: string[];
  supportedScope: string[];
  promptExample: string;
  followUpExample: {
    prompt: string;
    outcome: string;
    patch: Partial<CadParams>;
  };
  defaultParams: CadParams;
  controls: ParamControlDef[];
  steps: { title: string; detail: string }[];
  faqs: FaqItem[];
  relatedRoutes: { label: string; route: string; note: string }[];
}

export interface GuideArticle {
  id: string;
  category: string;
  readTime: string;
  title: string;
  summary: string;
  sections: {
    heading: string;
    body: string;
    specRows?: { label: string; value: string; note: string }[];
  }[];
  relatedToolRoute: string;
  relatedToolLabel: string;
}

export interface PageSeoMeta {
  title: string;
  description: string;
}
