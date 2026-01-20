import { User, Bot, Loader2, Square, StopCircle, AlertCircle } from 'lucide-react';
import { ToolCallCard } from './ToolCallCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { UIMessage } from 'ai';

interface MessageProps {
  message: UIMessage;
  isStreaming?: boolean;
  onStop?: () => void;
  wasStopped?: boolean;
  maxStepsReached?: boolean;
}

interface MessagePart {
  type: 'text' | 'tool';
  content?: string;
  tool?: {
    toolName: string;
    args: Record<string, unknown>;
    state: string;
    result?: unknown;
  };
}

export function Message({ message, isStreaming, onStop, wasStopped, maxStepsReached }: MessageProps) {
  const isUser = message.role === 'user';

  // Extract parts in order
  const parts: MessagePart[] = [];

  if (message.parts) {
    for (const part of message.parts) {
      if (part.type === 'text') {
        const text = (part as { type: 'text'; text: string }).text;
        if (text.trim()) {
          parts.push({ type: 'text', content: text });
        }
      } else if (part.type.startsWith('tool-')) {
        const toolPart = part as {
          type: string;
          toolName?: string;
          toolCallId?: string;
          state?: string;
          input?: unknown;
          output?: unknown;
        };
        if (toolPart.toolName) {
          parts.push({
            type: 'tool',
            tool: {
              toolName: toolPart.toolName,
              args: (toolPart.input as Record<string, unknown>) || {},
              state: toolPart.state || 'running',
              result: toolPart.output,
            },
          });
        }
      }
    }
  }

  // For user messages, show simple card
  if (isUser) {
    const textContent = parts.filter(p => p.type === 'text').map(p => p.content).join('');
    return (
      <div className="p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium mb-2">You</p>
            <Card className="p-3 bg-primary/5 border-primary/20">
              <p className="text-sm whitespace-pre-wrap">{textContent}</p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // For assistant messages, show each part in its own card
  return (
    <div className="p-4 bg-muted/30">
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <Bot className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium mb-2">Assistant</p>

          <div className="space-y-2">
            {parts.map((part, index) => (
              <div key={index}>
                {part.type === 'tool' && part.tool && (
                  <ToolCallCard
                    toolName={part.tool.toolName}
                    args={part.tool.args}
                    result={part.tool.result}
                    status={part.tool.state === 'result' || part.tool.state === 'output' ? 'completed' : 'running'}
                  />
                )}
                {part.type === 'text' && part.content && (
                  <Card className="p-3">
                    <p className="text-sm whitespace-pre-wrap">{part.content}</p>
                  </Card>
                )}
              </div>
            ))}

            {/* Loading indicator when streaming */}
            {isStreaming && (
              <Card className="p-3 border-dashed">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking and doing...</span>
                  </div>
                  {onStop && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onStop}
                      className="h-7 px-2 text-xs"
                    >
                      <Square className="h-3 w-3 mr-1" />
                      Stop
                    </Button>
                  )}
                </div>
              </Card>
            )}

            {/* Stopped indicator */}
            {wasStopped && (
              <Card className="p-3 border-orange-300 bg-orange-50 dark:bg-orange-950/20">
                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <StopCircle className="h-4 w-4" />
                  <span className="text-sm">Stopped by user</span>
                </div>
              </Card>
            )}

            {/* Max steps reached indicator */}
            {maxStepsReached && (
              <Card className="p-3 border-orange-300 bg-orange-50 dark:bg-orange-950/20">
                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">
                    Per-question step limit exceeded. If needed, update the limit in{' '}
                    <code className="bg-orange-100 dark:bg-orange-900/30 px-1 py-0.5 rounded text-xs">
                      chatbot-and-mcp-servers-config.json.
                    </code>
                  </span>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
