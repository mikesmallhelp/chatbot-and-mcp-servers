'use client';

import { useChat } from '@ai-sdk/react';
import { McpSidebar } from '@/components/McpSidebar';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { MessageInput } from '@/components/chat/MessageInput';

export default function Home() {
  const { messages, status, sendMessage } = useChat();

  const isLoading = status === 'streaming' || status === 'submitted';

  const handleSend = (message: string) => {
    sendMessage({ text: message });
  };

  return (
    <div className="flex h-screen">
      <McpSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b px-4 py-3">
          <h1 className="text-lg font-semibold">MCP Chatbot</h1>
        </header>

        <ChatWindow messages={messages} isLoading={isLoading} />

        <MessageInput onSend={handleSend} disabled={isLoading} />
      </div>
    </div>
  );
}
