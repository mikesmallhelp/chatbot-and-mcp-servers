'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { McpSidebar } from '@/components/McpSidebar';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { MessageInput } from '@/components/chat/MessageInput';

export default function Home() {
  const { messages, status, sendMessage, stop } = useChat();
  const [wasStopped, setWasStopped] = useState(false);

  const isLoading = status === 'streaming' || status === 'submitted';

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

        <ChatWindow messages={messages} isLoading={isLoading} onStop={handleStop} wasStopped={wasStopped} />

        <MessageInput onSend={handleSend} disabled={isLoading} />
      </div>
    </div>
  );
}
