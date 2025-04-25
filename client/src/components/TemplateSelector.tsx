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
      <label className="text-sm font-medium text-gray-700">Template Style:</label>
      <Select 
        value={value} 
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a template style" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {Object.entries(templateLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <p className="text-xs text-gray-500 mt-1">
        Select the type of prompt you want to generate
      </p>
    </div>
  );
}
