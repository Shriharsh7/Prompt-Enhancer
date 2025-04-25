import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TextareaAutoSize } from '@/components/ui/textarea-auto-size';
import { Send, SparkleIcon, TestTubeIcon } from 'lucide-react';

interface PromptInputProps {
  onSubmit: (input: string) => void;
  onTest?: () => void;
  isRefinement: boolean;
  isLoadingPrompt: boolean;
  isLoadingTest: boolean;
  canTest: boolean;
}

export function PromptInput({
  onSubmit,
  onTest,
  isRefinement,
  isLoadingPrompt,
  isLoadingTest,
  canTest
}: PromptInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    if (!input.trim() || isLoadingPrompt) return;
    onSubmit(input);
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-4 bg-white border-t border-gray-200">
      <TextareaAutoSize
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder={isRefinement ? "Add more context or details to refine your prompt..." : "Enter your rough prompt idea..."}
        className="w-full p-3 border rounded-md mb-2 focus:border-primary-500 focus:ring-primary-500"
        disabled={isLoadingPrompt}
        minRows={2}
        maxRows={5}
      />
      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={!input.trim() || isLoadingPrompt}
          className="w-full"
          variant="default"
        >
          {isLoadingPrompt ? (
            <>
              <div className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {isRefinement ? 'Refining...' : 'Generating...'}
            </>
          ) : (
            <>
              {isRefinement ? (
                <>
                  <SparkleIcon className="mr-2 h-4 w-4" />
                  Refine Prompt
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Generate Prompt
                </>
              )}
            </>
          )}
        </Button>
        
        {canTest && (
          <Button
            onClick={onTest}
            disabled={isLoadingTest || isLoadingPrompt}
            className="w-full"
            variant="secondary"
          >
            {isLoadingTest ? (
              <>
                <div className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Testing...
              </>
            ) : (
              <>
                <TestTubeIcon className="mr-2 h-4 w-4" />
                Test with Gemini
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
