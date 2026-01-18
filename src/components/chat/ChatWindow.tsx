'use client';

import { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Message } from './Message';
import type { UIMessage } from 'ai';

interface ChatWindowProps {
  messages: UIMessage[];
  isLoading?: boolean;
}

export function ChatWindow({ messages, isLoading }: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">Tervetuloa MCP Chatbottiin</h2>
          <p className="text-muted-foreground text-sm">
            Voit antaa komentoja ja käyttää konfiguroituja MCP-servereitä.
            Kokeile esimerkiksi pyytää avaamaan verkkosivu tai käsittelemään tiedostoja.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1" ref={scrollRef}>
      <div className="divide-y">
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}

        {isLoading && (
          <div className="p-4 bg-muted/30">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <div className="h-4 w-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Assistentti</p>
                <p className="text-sm text-muted-foreground">Ajattelee...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
