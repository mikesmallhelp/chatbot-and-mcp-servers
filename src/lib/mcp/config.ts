import { McpConfigSchema, type McpConfig } from './types';
import fs from 'fs/promises';
import path from 'path';

const CONFIG_FILE = 'chatbot-and-mcp-servers-config.json';

export async function loadMcpConfig(): Promise<McpConfig> {
  const configPath = path.join(process.cwd(), CONFIG_FILE);

  try {
    const raw = await fs.readFile(configPath, 'utf-8');
    const parsed = JSON.parse(raw);
    const config = McpConfigSchema.parse(parsed);
    return config;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // Return empty config if file doesn't exist
      return { maxSteps: 50, mcpServers: {} };
    }
    throw error;
  }
}

export function getServerNames(config: McpConfig): string[] {
  return Object.keys(config.mcpServers);
}

export function getServerDescription(config: McpConfig, serverName: string): string {
  return config.mcpServers[serverName]?.description || serverName;
}
