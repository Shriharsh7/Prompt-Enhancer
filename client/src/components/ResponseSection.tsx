import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, CheckCheck, Bot } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { motion } from 'framer-motion';

interface ResponseSectionProps {
  response: string;
  isLoadingResponse: boolean;
  className?: string;
}

export function ResponseSection({ response, isLoadingResponse, className }: ResponseSectionProps) {
  const { copied, copyToClipboard } = useCopyToClipboard();

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="bg-slate-900 p-4 border-b border-slate-800">
        <h2 className="text-lg font-medium text-blue-300">Gemini Response</h2>
        <p className="text-sm text-slate-400">See how Gemini responds to your enhanced prompt</p>
      </div>
      
      <div className="flex-1 p-4 bg-slate-950 overflow-y-auto">
        {isLoadingResponse ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-800 border-t-blue-400"></div>
              <p className="mt-2 text-sm text-slate-400">Generating response...</p>
            </div>
          </div>
        ) : response ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="dark-card rounded-lg p-4"
          >
            <pre className="whitespace-pre-wrap text-sm overflow-x-auto font-sans text-slate-300">
              {response}
            </pre>
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(response)}
                disabled={copied}
                className="text-xs bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                {copied ? (
                  <>
                    <CheckCheck className="h-3.5 w-3.5 mr-1" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    <span>Copy response</span>
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-slate-800">
                <Bot className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-blue-300">No response yet</h3>
              <p className="mt-1 text-sm text-slate-400">
                Generate an enhanced prompt first, then test it with Gemini to see the response.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
