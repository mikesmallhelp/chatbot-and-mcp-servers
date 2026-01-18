'use client';

import { useChat } from '@ai-sdk/react';
import { McpStatusBanner } from '@/components/McpStatusBanner';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { MessageInput } from '@/components/chat/MessageInput';

export default function Home() {
  const { messages, status, sendMessage } = useChat();

  const isLoading = status === 'streaming' || status === 'submitted';

  const handleSend = (message: string) => {
    sendMessage({ text: message });
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b px-4 py-3">
        <h1 className="text-lg font-semibold">MCP Chatbot</h1>
      </header>

      <McpStatusBanner />

      <ChatWindow messages={messages} isLoading={isLoading} />

      <MessageInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
}
