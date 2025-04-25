export type TemplateType = 
  | "general"
  | "research"
  | "creative"
  | "tech"
  | "technical_tutorial"
  | "business_case_study"
  | "narrative_essay"
  | "code_documentation";

export interface Message {
  type: 'user' | 'bot';
  text: string;
}

export interface GenerateResponse {
  prompt: string;
  refinement_count: number;
}

export interface RefineResponse {
  refined_prompt: string;
  refinement_count: number;
}

export interface TestResponse {
  response: string;
}
