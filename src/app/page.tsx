'use client';

import { useState, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { McpSidebar } from '@/components/McpSidebar';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { MessageInput } from '@/components/chat/MessageInput';

export default function Home() {
  const { messages, status, sendMessage, stop } = useChat();
  const [wasStopped, setWasStopped] = useState(false);
  const [maxSteps, setMaxSteps] = useState<number | null>(null);

  const isLoading = status === 'streaming' || status === 'submitted';

  // Fetch maxSteps from API
  useEffect(() => {
    async function fetchMaxSteps() {
      try {
        const res = await fetch('/api/mcp');
        if (res.ok) {
          const data = await res.json();
          setMaxSteps(data.maxSteps);
        }
      } catch {
        // Ignore errors
      }
    }
    fetchMaxSteps();
  }, []);

  // Calculate maxStepsReached based on current state
  const maxStepsReached = (() => {
    if (isLoading || wasStopped || maxSteps === null) return false;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant' && lastMessage.parts) {
      const toolCalls = lastMessage.parts.filter(part =>
        part.type.startsWith('tool-')
      ).length;
      return toolCalls >= maxSteps;
    }
    return false;
  })();

  const handleSend = (message: string) => {
    setWasStopped(false);
    sendMessage({ text: message });
  };

  const handleStop = () => {
    setWasStopped(true);
    stop();
  };

  return (
    <div className="flex h-screen">
      <McpSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b px-4 py-3">
          <h1 className="text-lg font-semibold">MCP Chatbot</h1>
        </header>

        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          onStop={handleStop}
          wasStopped={wasStopped}
          maxStepsReached={maxStepsReached}
        />

        <MessageInput onSend={handleSend} disabled={isLoading} />
      </div>
    </div>
  );
}
