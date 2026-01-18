import { z } from 'zod';

export const McpServerSchema = z.object({
  command: z.string(),
  args: z.array(z.string()).optional().default([]),
  env: z.record(z.string(), z.string()).optional(),
});

export const McpConfigSchema = z.object({
  maxSteps: z.number().optional().default(50),
  mcpServers: z.record(z.string(), McpServerSchema),
});

export type McpServer = z.infer<typeof McpServerSchema>;
export type McpConfig = z.infer<typeof McpConfigSchema>;

export interface McpServerStatus {
  name: string;
  status: 'connected' | 'error' | 'disconnected';
  toolCount: number;
  error?: string;
}

export interface McpTool {
  name: string;
  description?: string;
  inputSchema: Record<string, unknown>;
  serverName: string;
}
