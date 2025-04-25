import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Text copied to clipboard",
        duration: 2000,
      });
      
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
      
      return true;
    } catch (error) {
      console.error('Failed to copy text:', error);
      toast({
        title: "Error",
        description: "Failed to copy text to clipboard",
        variant: "destructive",
        duration: 3000,
      });
      
      return false;
    }
  }, [toast]);

  return { copied, copyToClipboard };
}
