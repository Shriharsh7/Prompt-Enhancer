// Import types from shared schema
import {
  TemplateType,
  GeneratePromptRequest,
  RefinePromptRequest,
  TestPromptRequest
} from '@shared/schema';

// State model
export interface State {
  prompt: string;
  refinement_count: number;
}

// Response types
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

export type {
  TemplateType,
  GeneratePromptRequest,
  RefinePromptRequest,
  TestPromptRequest
};
