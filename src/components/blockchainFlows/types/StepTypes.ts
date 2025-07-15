export interface Step {
  codeSnippet?: string;
  description: string;
  edges?: string[];
  updateNode?: {
    id: string;
    data: {
      status?: string;
      statusByStep?: Record<number, string>;
    };
  };
  label: string;
  nodes?: string[];
  title: string;
  what: string;
  why: string;
}

export interface StepData {
  description: string;
  label: string;
  link?: string;
  linkLabel?: string;
}

export interface StepHighlightMap {
  edges: string[];
  nodes: string[];
  updateNode?: {
    id: string;
    data: {
      status?: string;
      statusByStep?: Record<number, string>;
    };
  };
}
