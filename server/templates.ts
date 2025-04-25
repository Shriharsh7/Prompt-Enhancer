import { TemplateType } from './types';

// Verbose prompt templates with specialized categories
export const TEMPLATES: Record<TemplateType, string> = {
  "general": (
    "Generate a highly detailed and structured prompt based on the user input: '{topic}'. This prompt must be comprehensive, "
    + "including a clear instruction (e.g., 'Write', 'Explain', 'Describe'), specific details about the topic or task, guidance "
    + "on tone (e.g., informative, creative), audience (e.g., general public, experts), and any relevant constraints (e.g., word count "
    + "range of 500-2000 words), structured with numbered sections or bullet points where applicable, encouraging thorough exploration "
    + "of the subject matter without any brevity restrictions."
  ),
  "research": (
    "Generate a detailed prompt for a comprehensive research report on the topic: '{topic}', including sections for introduction, "
    + "methodology, findings, and conclusion, with a suggested word count range of 750-2000 words. The prompt must provide specific "
    + "instructions (e.g., 'Write', 'Analyze'), define the audience (e.g., academic or general with basic knowledge), set an informative "
    + "tone, include guidance on citing sources (where possible), and encourage a structured, in-depth exploration of the topic with "
    + "multiple subsections and detailed requirements."
  ),
  "creative": (
    "Generate an elaborate prompt for a creative story about '{topic}', specifying plot points, characters, and setting, "
    + "with a suggested length of 500-1500 words. The prompt must include a clear instruction (e.g., 'Write', 'Create'), "
    + "define a creative tone (e.g., adventurous, emotional), suggest a target audience (e.g., young adults, general readers), "
    + "and provide detailed guidance on structure (e.g., beginning, climax, resolution) and character development, encouraging "
    + "rich narrative depth without brevity constraints."
  ),
  "tech": (
    "Generate a detailed prompt to explain the concept of '{topic}', including its applications, implications, and technical details, "
    + "with a suggested word count range of 500-2000 words. The prompt must include a clear instruction (e.g., 'Explain', 'Describe'), "
    + "define an informative tone suitable for a technical audience with some background, provide guidance on using examples and diagrams "
    + "where applicable, and encourage a thorough breakdown of the topic without any brevity restrictions."
  ),
  "technical_tutorial": (
    "Generate a detailed prompt for a step-by-step technical tutorial on the topic: '{topic}', with a suggested word count range of "
    + "500-2000 words. The prompt must include a clear instruction (e.g., 'Create', 'Guide'), define an educational tone for beginners "
    + "with some technical knowledge, provide a structured format with numbered steps or sections (e.g., setup, execution, examples), "
    + "include practical examples or scenarios, and encourage a thorough, actionable explanation without brevity restrictions."
  ),
  "business_case_study": (
    "Generate a detailed prompt for a business case study on the topic: '{topic}', with a suggested word count range of 750-2000 words. "
    + "The prompt must include a clear instruction (e.g., 'Analyze', 'Evaluate'), define a professional tone for business professionals, "
    + "provide a structured format with sections (e.g., background, analysis, recommendations), include data-driven insights or hypothetical "
    + "metrics where applicable, and encourage a comprehensive exploration of the topic without brevity constraints."
  ),
  "narrative_essay": (
    "Generate a detailed prompt for a narrative essay on the topic: '{topic}', with a suggested length of 500-1500 words. The prompt "
    + "must include a clear instruction (e.g., 'Write', 'Narrate'), define a reflective or storytelling tone, suggest an audience (e.g., "
    + "general readers, students), provide guidance on a chronological structure (e.g., introduction, events, reflection), and encourage "
    + "a rich, personal narrative without brevity restrictions."
  ),
  "code_documentation": (
    "Generate a detailed prompt for documenting a code-related topic: '{topic}', with a suggested word count range of 500-1500 words. "
    + "The prompt must include a clear instruction (e.g., 'Document', 'Explain'), define a technical tone for developers, provide a "
    + "structured format with sections (e.g., overview, usage, examples), include pseudocode or function signatures where applicable, "
    + "and encourage a thorough explanation of the code's purpose and implementation without brevity restrictions."
  )
};
