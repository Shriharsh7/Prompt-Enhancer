import { type GenerateResponse, type RefineResponse, type TestResponse, type TemplateType } from '@/types';

const API_BASE_URL = '/api';

export const api = {
  async generatePrompt(prompt: string, template: TemplateType): Promise<GenerateResponse> {
    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, template }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to generate prompt: ${errorText}`);
    }

    return response.json();
  },

  async refinePrompt(
    prompt: string, 
    additionalInput: string, 
    refinementCount: number
  ): Promise<RefineResponse> {
    const response = await fetch(`${API_BASE_URL}/refine`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        additional_input: additionalInput,
        refinement_count: refinementCount,
        choice: 'add_context', // Required field for backend refine
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to refine prompt: ${errorText}`);
    }

    return response.json();
  },

  async testPrompt(prompt: string): Promise<TestResponse> {
    const response = await fetch(`${API_BASE_URL}/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to test prompt: ${errorText}`);
    }

    return response.json();
  }
};
