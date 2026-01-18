import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { loadMcpConfig } from './config';
import { logger } from '../logger';
import type { McpServerStatus, McpTool, McpConfig } from './types';
import { tool } from 'ai';
import type { Tool } from 'ai';
import { z } from 'zod';

interface McpConnection {
  client: Client;
  transport: StdioClientTransport;
  serverName: string;
}

class McpClientManager {
  private connections: Map<string, McpConnection> = new Map();
  private tools: Map<string, McpTool> = new Map();
  private initialized = false;

  async initialize(): Promise<McpServerStatus[]> {
    if (this.initialized) {
      return this.getServerStatuses();
    }

    const config = await loadMcpConfig();
    const statuses: McpServerStatus[] = [];

    for (const [serverName, serverConfig] of Object.entries(config.mcpServers)) {
      try {
        logger.info(`Connecting to MCP server: ${serverName}`, serverConfig);

        // Build environment variables
        const envVars: Record<string, string> = {};
        for (const [key, value] of Object.entries(process.env)) {
          if (value !== undefined) {
            envVars[key] = value;
          }
        }
        if (serverConfig.env) {
          Object.assign(envVars, serverConfig.env);
        }

        const transport = new StdioClientTransport({
          command: serverConfig.command,
          args: serverConfig.args,
          env: serverConfig.env ? envVars : undefined,
        });

        const client = new Client(
          { name: 'mcp-chatbot', version: '1.0.0' },
          { capabilities: {} }
        );

        await client.connect(transport);

        // List available tools
        const toolsResult = await client.listTools();
        const toolCount = toolsResult.tools?.length || 0;

        // Store tools
        for (const mcpTool of toolsResult.tools || []) {
          this.tools.set(`${serverName}__${mcpTool.name}`, {
            name: mcpTool.name,
            description: mcpTool.description,
            inputSchema: mcpTool.inputSchema as Record<string, unknown>,
            serverName,
          });
        }

        this.connections.set(serverName, { client, transport, serverName });

        statuses.push({
          name: serverName,
          status: 'connected',
          toolCount,
        });

        logger.info(`Connected to ${serverName} with ${toolCount} tools`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Failed to connect to ${serverName}`, { error: errorMessage });

        statuses.push({
          name: serverName,
          status: 'error',
          toolCount: 0,
          error: errorMessage,
        });
      }
    }

    this.initialized = true;
    return statuses;
  }

  getServerStatuses(): McpServerStatus[] {
    const statuses: McpServerStatus[] = [];

    for (const [serverName, connection] of this.connections) {
      const toolCount = Array.from(this.tools.values())
        .filter(t => t.serverName === serverName).length;

      statuses.push({
        name: serverName,
        status: 'connected',
        toolCount,
      });
    }

    return statuses;
  }

  getToolsForAI(): Record<string, Tool> {
    const aiTools: Record<string, Tool> = {};

    for (const [toolKey, mcpTool] of this.tools) {
      const schema = mcpTool.inputSchema || {};
      const properties = (schema as { properties?: Record<string, unknown> }).properties || {};
      const required = (schema as { required?: string[] }).required || [];

      // Convert JSON Schema to Zod schema
      const zodSchema: Record<string, z.ZodTypeAny> = {};

      for (const [propName, propSchema] of Object.entries(properties)) {
        const prop = propSchema as { type?: string; description?: string };
        let zodType: z.ZodTypeAny;

        switch (prop.type) {
          case 'string':
            zodType = z.string();
            break;
          case 'number':
            zodType = z.number();
            break;
          case 'integer':
            zodType = z.number().int();
            break;
          case 'boolean':
            zodType = z.boolean();
            break;
          case 'array':
            zodType = z.array(z.unknown());
            break;
          case 'object':
            zodType = z.record(z.string(), z.unknown());
            break;
          default:
            zodType = z.unknown();
        }

        if (prop.description) {
          zodType = zodType.describe(prop.description);
        }

        if (!required.includes(propName)) {
          zodType = zodType.optional();
        }

        zodSchema[propName] = zodType;
      }

      aiTools[toolKey] = tool({
        description: mcpTool.description || `Tool from ${mcpTool.serverName}`,
        inputSchema: z.object(zodSchema),
        execute: async (args) => {
          return this.callTool(toolKey, args);
        },
      });
    }

    return aiTools;
  }

  async callTool(toolKey: string, args: Record<string, unknown>): Promise<unknown> {
    const mcpTool = this.tools.get(toolKey);
    if (!mcpTool) {
      throw new Error(`Tool not found: ${toolKey}`);
    }

    const connection = this.connections.get(mcpTool.serverName);
    if (!connection) {
      throw new Error(`Server not connected: ${mcpTool.serverName}`);
    }

    logger.info(`Calling tool: ${mcpTool.name}`, { serverName: mcpTool.serverName, args });

    try {
      const result = await connection.client.callTool({
        name: mcpTool.name,
        arguments: args,
      });

      logger.info(`Tool result: ${mcpTool.name}`, { result });

      // Extract text content from result
      if (result.content && Array.isArray(result.content)) {
        const textContent = result.content
          .filter((c): c is { type: 'text'; text: string } => c.type === 'text')
          .map(c => c.text)
          .join('\n');
        return textContent || result;
      }

      return result;
    } catch (error) {
      logger.error(`Tool call failed: ${mcpTool.name}`, { error });
      throw error;
    }
  }

  getToolsList(): { name: string; description: string; serverName: string }[] {
    return Array.from(this.tools.values()).map(t => ({
      name: t.name,
      description: t.description || '',
      serverName: t.serverName,
    }));
  }

  async disconnect(): Promise<void> {
    for (const [serverName, connection] of this.connections) {
      try {
        await connection.transport.close();
        logger.info(`Disconnected from ${serverName}`);
      } catch (error) {
        logger.error(`Error disconnecting from ${serverName}`, { error });
      }
    }
    this.connections.clear();
    this.tools.clear();
    this.initialized = false;
  }
}

// Singleton instance
export const mcpClient = new McpClientManager();
