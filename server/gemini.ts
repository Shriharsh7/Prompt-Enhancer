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

/**
 * Cleans model output by removing explanatory text that may appear at the beginning.
 * Looks for common patterns like "Here's the refined prompt..." and "I've modified..." 
 */
function cleanModelOutput(text: string): string {
  // Common patterns in explanatory text from the model
  const patterns = [
    /^(Okay|Sure|Here|I've).*?(refined|enhanced|improved|modified|updated|adapted|created|generated|written).*?prompt.*?\n\n/i,
    /^(Here's|The following is|I've created|This is).*?(the refined|an enhanced|the improved).*?prompt.*?\n\n/i,
    /^(Based on|Incorporating|Adding|With|The).*?(input|feedback|context|additional information).*?\n\n/i,
    /^(Note:|Note that).*?\n\n/i
  ];
  
  let cleanedText = text;
  
  // Try to match and remove explanatory text at the beginning
  for (const pattern of patterns) {
    if (pattern.test(cleanedText)) {
      cleanedText = cleanedText.replace(pattern, '');
      // If we found a match, break early to avoid over-processing
      break;
    }
  }
  
  return cleanedText;
}

// Functions to handle prompt processing
export async function generatePrompt(state: State, template: TemplateType): Promise<State> {
  const promptTemplate = TEMPLATES[template] || TEMPLATES.general;
  const formattedTemplate = promptTemplate.replace('{topic}', state.prompt);
  
  try {
    const result = await model.generateContent(formattedTemplate);
    const text = result.response.text();
    
    // Clean the output to remove any explanatory text
    state.prompt = cleanModelOutput(text);
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
    + `structure and depth, suitable for a 500-2000 word response. IMPORTANT: Do not include any explanatory text at the beginning like "Here's the refined prompt". `
    + `Just output the refined prompt directly: '${state.prompt}'`
  );
  
  try {
    const result = await model.generateContent(refinementTemplate);
    const text = result.response.text();
    
    // Clean the output to remove any explanatory text that may still appear
    state.prompt = cleanModelOutput(text);
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
