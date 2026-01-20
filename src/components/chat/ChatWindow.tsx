'use client';

import { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Message } from './Message';
import type { UIMessage } from 'ai';

interface ChatWindowProps {
  messages: UIMessage[];
  isLoading?: boolean;
  onStop?: () => void;
  wasStopped?: boolean;
  maxStepsReached?: boolean;
}

export function ChatWindow({ messages, isLoading, onStop, wasStopped, maxStepsReached }: ChatWindowProps) {
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
          <p className="text-muted-foreground text-sm mb-2">
            You can give commands and use configured MCP servers.
          </p>
          <p className="text-muted-foreground text-sm">
            The tool executes all possible tasks without asking for permission. You can stop the execution at any time using the Stop button.
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
          const showStopped = wasStopped && isLastMessage && isAssistant && !isLoading;
          const showMaxStepsReached = maxStepsReached && isLastMessage && isAssistant && !isLoading;

          return (
            <Message
              key={message.id}
              message={message}
              isStreaming={showStreaming}
              onStop={onStop}
              wasStopped={showStopped}
              maxStepsReached={showMaxStepsReached}
            />
          );
        })}
      </div>
    </ScrollArea>
  );
}
