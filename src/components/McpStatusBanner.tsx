'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, Wrench } from 'lucide-react';

interface McpServer {
  name: string;
  status: 'connected' | 'error' | 'disconnected';
  toolCount: number;
  description: string;
  error?: string;
}

interface McpStatus {
  servers: McpServer[];
  totalTools: number;
}

export function McpStatusBanner() {
  const [status, setStatus] = useState<McpStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch('/api/mcp');
        if (!res.ok) throw new Error('Failed to fetch MCP status');
        const data = await res.json();
        setStatus(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div className="bg-muted/50 border-b px-4 py-3 flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">
          Connecting to MCP servers...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-3 flex items-center gap-2">
        <XCircle className="h-4 w-4 text-destructive" />
        <span className="text-sm text-destructive">
          MCP connection failed: {error}
        </span>
      </div>
    );
  }

  if (!status || status.servers.length === 0) {
    return (
      <div className="bg-muted/50 border-b px-4 py-3">
        <p className="text-sm text-muted-foreground">
          No MCP servers configured. Add servers to{' '}
          <code className="bg-muted px-1 py-0.5 rounded text-xs">mcp-servers.json</code>
          {' '}file.
        </p>
      </div>
    );
  }

  const connectedServers = status.servers.filter(s => s.status === 'connected');
  const errorServers = status.servers.filter(s => s.status === 'error');

  return (
    <div className="bg-muted/50 border-b px-4 py-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium flex items-center gap-1.5">
          <Wrench className="h-4 w-4" />
          MCP Servers:
        </span>

        {connectedServers.map(server => (
          <Badge
            key={server.name}
            variant="secondary"
            className="flex items-center gap-1"
          >
            <CheckCircle className="h-3 w-3 text-green-600" />
            {server.name}
            <span className="text-muted-foreground">
              ({server.toolCount} tools)
            </span>
          </Badge>
        ))}

        {errorServers.map(server => (
          <Badge
            key={server.name}
            variant="destructive"
            className="flex items-center gap-1"
          >
            <XCircle className="h-3 w-3" />
            {server.name}
          </Badge>
        ))}

        {status.totalTools > 0 && (
          <span className="text-xs text-muted-foreground ml-auto">
            {status.totalTools} tools available
          </span>
        )}
      </div>
    </div>
  );
}
