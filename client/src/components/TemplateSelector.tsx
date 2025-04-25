import { useState } from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TemplateType } from '@/types';

interface TemplateSelectorProps {
  value: TemplateType;
  onChange: (value: TemplateType) => void;
  disabled?: boolean;
}

export function TemplateSelector({ value, onChange, disabled = false }: TemplateSelectorProps) {
  // Map the template types to more human-readable names
  const templateLabels: Record<TemplateType, string> = {
    general: "General",
    research: "Research Report",
    creative: "Creative Writing",
    tech: "Technical Explanation",
    technical_tutorial: "Technical Tutorial",
    business_case_study: "Business Case Study",
    narrative_essay: "Narrative Essay",
    code_documentation: "Code Documentation"
  };

  const handleValueChange = (newValue: string) => {
    onChange(newValue as TemplateType);
  };

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-blue-300">Template Style:</label>
      <Select 
        value={value} 
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-slate-200 focus:ring-blue-500 focus:ring-offset-slate-900">
          <SelectValue placeholder="Select a template style" />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
          <SelectGroup>
            {Object.entries(templateLabels).map(([key, label]) => (
              <SelectItem key={key} value={key} className="hover:bg-slate-700 focus:bg-slate-700 focus:text-slate-100">
                {label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <p className="text-xs text-slate-400 mt-1">
        Select the type of prompt you want to generate
      </p>
    </div>
  );
}
