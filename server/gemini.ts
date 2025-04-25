import { GoogleGenerativeAI } from '@google/generative-ai';
import { TEMPLATES } from './templates';
import { State, TemplateType } from './types';

// Configure Gemini API
const API_KEY = process.env.GEMINI_API_KEY || '';
if (!API_KEY) {
  console.error('GEMINI_API_KEY environment variable is not set. Gemini API calls will fail.');
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Functions to handle prompt processing
export async function generatePrompt(state: State, template: TemplateType): Promise<State> {
  const promptTemplate = TEMPLATES[template] || TEMPLATES.general;
  const formattedTemplate = promptTemplate.replace('{topic}', state.prompt);
  
  try {
    const result = await model.generateContent(formattedTemplate);
    const text = result.response.text();
    
    state.prompt = text;
    state.refinement_count = 0;
    
    return state;
  } catch (error) {
    console.error('Error generating prompt:', error);
    throw new Error('Failed to generate prompt with Gemini API');
  }
}

export async function refinePrompt(state: State, additionalContext: string): Promise<State> {
  const refinementTemplate = (
    `Refine this detailed prompt by incorporating the extra context '${additionalContext}', preserving its comprehensive `
    + `structure and depth, suitable for a 500-2000 word response: '${state.prompt}'`
  );
  
  try {
    const result = await model.generateContent(refinementTemplate);
    const text = result.response.text();
    
    state.prompt = text;
    state.refinement_count += 1;
    
    return state;
  } catch (error) {
    console.error('Error refining prompt:', error);
    throw new Error('Failed to refine prompt with Gemini API');
  }
}

export async function testPrompt(prompt: string): Promise<string> {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error testing prompt:', error);
    throw new Error('Failed to test prompt with Gemini API');
  }
}
