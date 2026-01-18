import { cn } from '@/lib/utils';
import { User, Bot } from 'lucide-react';
import { ToolCallCard } from './ToolCallCard';
import type { UIMessage } from 'ai';

interface MessageProps {
  message: UIMessage;
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';

  // Extract text content from parts
  const textParts: string[] = [];
  const toolParts: Array<{
    toolName: string;
    args: Record<string, unknown>;
    state: string;
    result?: unknown;
  }> = [];

  if (message.parts) {
    for (const part of message.parts) {
      if (part.type === 'text') {
        textParts.push((part as { type: 'text'; text: string }).text);
      } else if (part.type.startsWith('tool-')) {
        // Handle tool parts - extract relevant info
        const toolPart = part as {
          type: string;
          toolName?: string;
          toolCallId?: string;
          state?: string;
          input?: unknown;
          output?: unknown;
        };
        if (toolPart.toolName) {
          toolParts.push({
            toolName: toolPart.toolName,
            args: (toolPart.input as Record<string, unknown>) || {},
            state: toolPart.state || 'running',
            result: toolPart.output,
          });
        }
      }
    }
  }

  const textContent = textParts.join('');

  return (
    <div
      className={cn(
        'flex gap-3 p-4',
        isUser ? 'bg-background' : 'bg-muted/30'
      )}
    >
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <p className="text-sm font-medium">
          {isUser ? 'Sinä' : 'Assistentti'}
        </p>

        {/* Tool invocations */}
        {toolParts.length > 0 && (
          <div className="space-y-1">
            {toolParts.map((tool, index) => (
              <ToolCallCard
                key={`${tool.toolName}-${index}`}
                toolName={tool.toolName}
                args={tool.args}
                result={tool.result}
                status={tool.state === 'result' || tool.state === 'output' ? 'completed' : 'running'}
              />
            ))}
          </div>
        )}

        {/* Text content */}
        {textContent && (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap">{textContent}</p>
          </div>
        )}
      </div>
    </div>
  );
}
