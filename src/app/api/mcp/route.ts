import { mcpClient } from '@/lib/mcp/client';
import { getServerDescription } from '@/lib/mcp/config';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    logger.info('MCP status request received');

    const statuses = await mcpClient.initialize();
    const tools = mcpClient.getToolsList();

    const response = {
      servers: statuses.map(s => ({
        ...s,
        description: getServerDescription(s.name),
      })),
      tools: tools,
      totalTools: tools.length,
    };

    logger.info('MCP status response', response);

    return Response.json(response);
  } catch (error) {
    logger.error('MCP status error', { error });
    return new Response(
      JSON.stringify({ error: 'Failed to get MCP status' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
