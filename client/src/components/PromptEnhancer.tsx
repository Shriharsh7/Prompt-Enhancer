import React, { useState } from 'react';
import { ChatSection } from '@/components/ChatSection';
import { ResponseSection } from '@/components/ResponseSection';
import { api } from '@/lib/api';
import { TemplateType, Message } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { WandSparkles } from 'lucide-react';

export function PromptEnhancer() {
  const { toast } = useToast();
  const [template, setTemplate] = useState<TemplateType>('general');
  const [conversation, setConversation] = useState<Message[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(false);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);

  const handleGeneratePrompt = async (input: string) => {
    if (!input.trim()) return;

    const isRefinement = conversation.some(msg => msg.type === 'bot');
    const newUserMsg: Message = { type: 'user', text: input };

    // Add the user message to the conversation
    setConversation(prev => [...prev, newUserMsg]);
    setIsLoadingPrompt(true);

    try {
      if (isRefinement) {
        // If we're refining, use the refine endpoint
        const result = await api.refinePrompt(
          currentPrompt,
          input,
          conversation.filter(msg => msg.type === 'bot').length
        );
        
        setCurrentPrompt(result.refined_prompt);
        
        // Update the conversation by replacing the last bot message
        setConversation(prev => {
          const newConversation = [...prev];
          const lastBotIndex = newConversation.map(m => m.type).lastIndexOf('bot');
          
          if (lastBotIndex !== -1) {
            newConversation[lastBotIndex] = { type: 'bot', text: result.refined_prompt };
          } else {
            newConversation.push({ type: 'bot', text: result.refined_prompt });
          }
          
          return newConversation;
        });
      } else {
        // Otherwise, generate a new prompt
        const result = await api.generatePrompt(input, template);
        
        setCurrentPrompt(result.prompt);
        setConversation(prev => [...prev, { type: 'bot', text: result.prompt }]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate prompt",
        variant: "destructive",
      });
      
      console.error('API error:', error);
    } finally {
      setIsLoadingPrompt(false);
    }
  };

  const handleTestPrompt = async () => {
    if (!currentPrompt) return;
    
    setIsLoadingResponse(true);
    setResponse('');
    
    try {
      const result = await api.testPrompt(currentPrompt);
      setResponse(result.response);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to test prompt",
        variant: "destructive",
      });
      
      console.error('API error:', error);
    } finally {
      setIsLoadingResponse(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <WandSparkles className="text-blue-400 h-5 w-5" />
            <h1 className="text-xl font-semibold text-gradient">Prompt Enhancer</h1>
          </div>
          <div>
            <span className="text-xs text-slate-400 hidden sm:inline">Powered by Gemini 2.0 Flash</span>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-950">
        <ChatSection
          conversation={conversation}
          template={template}
          onTemplateChange={setTemplate}
          onGeneratePrompt={handleGeneratePrompt}
          onTestPrompt={handleTestPrompt}
          isLoadingPrompt={isLoadingPrompt}
          isLoadingResponse={isLoadingResponse}
          hasPrompt={Boolean(currentPrompt)}
          className="lg:w-1/2"
        />
        
        <ResponseSection
          response={response}
          isLoadingResponse={isLoadingResponse}
          className="lg:w-1/2"
        />
      </main>
    </div>
  );
}
