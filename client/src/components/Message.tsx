import React from 'react';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { Message as MessageType } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Copy, CheckCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface MessageProps {
  message: MessageType;
  isLatestBotMessage: boolean;
}

export function Message({ message, isLatestBotMessage }: MessageProps) {
  const { copied, copyToClipboard } = useCopyToClipboard();
  const isUser = message.type === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg p-3 my-1.5 whitespace-pre-wrap",
          isUser 
            ? "bg-blue-900/40 border border-blue-800 text-blue-50" 
            : "dark-card shadow-md"
        )}
      >
        <div className={cn(
          "text-sm",
          message.type === 'bot' ? "font-mono text-slate-300" : "text-blue-100"
        )}>
          {message.text}
        </div>
        
        {message.type === 'bot' && (
          <div className="flex justify-end mt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-xs text-blue-400 hover:text-blue-300 hover:bg-slate-800"
              onClick={() => copyToClipboard(message.text)}
              disabled={copied}
            >
              {copied ? (
                <>
                  <CheckCheck className="h-3.5 w-3.5 mr-1" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  <span>Copy prompt</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Loading animation for when a bot message is being generated
export function MessageLoadingIndicator() {
  return (
    <div className="flex justify-start w-full">
      <div className="dark-card p-4 rounded-lg flex items-center space-x-2">
        <span className="inline-block w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
        <span className="inline-block w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
        <span className="inline-block w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
      </div>
    </div>
  );
}
