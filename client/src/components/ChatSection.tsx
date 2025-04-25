import React, { useRef, useEffect } from 'react';
import { Message, MessageLoadingIndicator } from '@/components/Message';
import { TemplateSelector } from '@/components/TemplateSelector';
import { PromptInput } from '@/components/PromptInput';
import { Message as MessageType, TemplateType } from '@/types';

interface ChatSectionProps {
  conversation: MessageType[];
  template: TemplateType;
  onTemplateChange: (template: TemplateType) => void;
  onGeneratePrompt: (input: string) => void;
  onTestPrompt: () => void;
  isLoadingPrompt: boolean;
  isLoadingResponse: boolean;
  hasPrompt: boolean;
  className?: string;
}

export function ChatSection({
  conversation,
  template,
  onTemplateChange,
  onGeneratePrompt,
  onTestPrompt,
  isLoadingPrompt,
  isLoadingResponse,
  hasPrompt,
  className
}: ChatSectionProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isRefinement = conversation.some(msg => msg.type === 'bot');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, isLoadingPrompt]);

  return (
    <div className={`flex flex-col border-r border-slate-800 h-full ${className}`}>
      <div className="bg-slate-900 p-4 border-b border-slate-800">
        <TemplateSelector 
          value={template} 
          onChange={onTemplateChange} 
          disabled={isRefinement || isLoadingPrompt}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-slate-950">
        {conversation.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md p-6 dark-card rounded-lg glass-effect">
              <h3 className="text-sm font-medium text-blue-300 mb-2">
                Welcome to Prompt Enhancer
              </h3>
              <p className="text-sm text-slate-300">
                Enter your rough prompt idea below, and I'll enhance it into a detailed, 
                structured prompt optimized for AI responses.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {conversation.map((message, index) => (
              <Message 
                key={index} 
                message={message} 
                isLatestBotMessage={
                  message.type === 'bot' && 
                  index === conversation.findLastIndex(m => m.type === 'bot')
                }
              />
            ))}
            {isLoadingPrompt && <MessageLoadingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <PromptInput
        onSubmit={onGeneratePrompt}
        onTest={onTestPrompt}
        isRefinement={isRefinement}
        isLoadingPrompt={isLoadingPrompt}
        isLoadingTest={isLoadingResponse}
        canTest={hasPrompt && !isLoadingPrompt}
      />
    </div>
  );
}
