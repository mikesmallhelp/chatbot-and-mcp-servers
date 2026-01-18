import { streamText, stepCountIs } from 'ai';
import { mcpClient } from '@/lib/mcp/client';
import { loadMcpConfig } from '@/lib/mcp/config';
import { logger } from '@/lib/logger';

export const maxDuration = 60;

interface UIMessagePart {
  type: string;
  text?: string;
  toolName?: string;
  input?: unknown;
  output?: unknown;
}

interface UIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  parts?: UIMessagePart[];
  content?: string;
}

type MessageRole = 'user' | 'assistant' | 'system';

// Convert UI messages (with parts) to messages with content
function convertToCoreMessages(messages: UIMessage[]): { role: MessageRole; content: string }[] {
  return messages
    .filter((msg) => msg.role === 'user' || msg.role === 'assistant' || msg.role === 'system')
    .map((msg) => {
      // Extract text content from parts
      let content = msg.content || '';

      if (msg.parts && msg.parts.length > 0) {
        const textParts = msg.parts
          .filter((part) => part.type === 'text' && part.text)
          .map((part) => part.text as string);

        if (textParts.length > 0) {
          content = textParts.join('');
        }
      }

      return {
        role: msg.role as MessageRole,
        content,
      };
    });
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    logger.info('Chat request received', { messageCount: messages.length });

    // Convert UI messages to core messages
    const coreMessages = convertToCoreMessages(messages);

    // Load config
    const config = await loadMcpConfig();

    // Ensure MCP client is initialized
    await mcpClient.initialize();

    // Get tools from MCP servers
    const tools = mcpClient.getToolsForAI();
    const toolCount = Object.keys(tools).length;

    logger.info(`Using ${toolCount} tools from MCP servers`);

    const model = process.env.AI_GATEWAY_MODEL || 'openai/gpt-4o-mini';
    const systemPrompt = 'Never end sentences with a colon. Always use a period at the end of sentences.';

    // Log all prompts sent to LLM
    logger.info('System prompt', { system: systemPrompt });
    logger.info('Messages sent to LLM', { messages: coreMessages });

    const result = streamText({
      model,
      system: systemPrompt,
      messages: coreMessages,
      tools,
      stopWhen: stepCountIs(config.maxSteps),
      onFinish: ({ text, toolCalls, finishReason }) => {
        logger.info('Assistant response', {
          text,
          toolCalls: toolCalls?.map(tc => ({ name: tc.toolName })),
          finishReason,
        });
      },
      onStepFinish: ({ text, toolCalls }) => {
        logger.info('Step finished', {
          text,
          toolCalls: toolCalls?.map(tc => ({ name: tc.toolName })),
        });
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    logger.error('Chat API error', { error });
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
