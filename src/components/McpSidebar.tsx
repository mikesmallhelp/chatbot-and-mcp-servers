'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2, ChevronDown, ChevronRight, Server, Wrench } from 'lucide-react';

interface McpTool {
  name: string;
  description: string;
  serverName: string;
}

interface McpServer {
  name: string;
  status: 'connected' | 'error' | 'disconnected';
  toolCount: number;
  error?: string;
}

interface McpStatus {
  servers: McpServer[];
  tools: McpTool[];
  totalTools: number;
}

export function McpSidebar() {
  const [status, setStatus] = useState<McpStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedServers, setExpandedServers] = useState<Set<string>>(new Set());

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

  const toggleServer = (serverName: string) => {
    setExpandedServers(prev => {
      const next = new Set(prev);
      if (next.has(serverName)) {
        next.delete(serverName);
      } else {
        next.add(serverName);
      }
      return next;
    });
  };

  const getToolsForServer = (serverName: string): McpTool[] => {
    return status?.tools.filter(t => t.serverName === serverName) || [];
  };

  if (loading) {
    return (
      <div className="w-64 border-r bg-muted/30 p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Connecting...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-64 border-r bg-muted/30 p-4">
        <div className="flex items-center gap-2 text-destructive">
          <XCircle className="h-4 w-4" />
          <span className="text-sm">Connection failed</span>
        </div>
      </div>
    );
  }

  if (!status || status.servers.length === 0) {
    return (
      <div className="w-64 border-r bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">
          No MCP servers configured.
        </p>
      </div>
    );
  }

  return (
    <div className="w-64 border-r bg-muted/30 flex flex-col h-full">
      <div className="p-3 border-b">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Server className="h-4 w-4" />
          MCP Servers
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {status.servers.map(server => {
          const isExpanded = expandedServers.has(server.name);
          const tools = getToolsForServer(server.name);
          const isConnected = server.status === 'connected';

          return (
            <div key={server.name} className="border-b">
              <button
                onClick={() => toggleServer(server.name)}
                className="w-full p-3 flex items-center gap-2 hover:bg-muted/50 transition-colors text-left"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}

                {isConnected ? (
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{server.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {server.toolCount} tools
                  </p>
                </div>
              </button>

              {isExpanded && isConnected && (
                <div className="bg-muted/20 px-3 pb-3">
                  {tools.length > 0 ? (
                    <ul className="space-y-1">
                      {tools.map(tool => (
                        <li
                          key={tool.name}
                          className="flex items-start gap-2 py-1 px-2 rounded text-xs hover:bg-muted/50"
                        >
                          <Wrench className="h-3 w-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground">{tool.name}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground px-2">No tools</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t text-xs text-muted-foreground">
        {status.totalTools} tools available
      </div>
    </div>
  );
}
