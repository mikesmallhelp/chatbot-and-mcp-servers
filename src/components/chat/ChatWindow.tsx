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
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">Welcome to MCP Chatbot</h2>
          <p className="text-muted-foreground text-sm">
            You can give commands and use configured MCP servers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1" ref={scrollRef}>
      <div className="divide-y">
        {messages.map((message, index) => {
          const isLastMessage = index === messages.length - 1;
          const isAssistant = message.role === 'assistant';
          const showStreaming = isLoading && isLastMessage && isAssistant;

          return (
            <Message
              key={message.id}
              message={message}
              isStreaming={showStreaming}
            />
          );
        })}
      </div>
    </ScrollArea>
  );
}
