import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wrench, CheckCircle, Loader2, XCircle } from 'lucide-react';

interface ToolCallCardProps {
  toolName: string;
  args?: Record<string, unknown>;
  result?: unknown;
  status: 'pending' | 'running' | 'completed' | 'error';
}

export function ToolCallCard({ toolName, args, result, status }: ToolCallCardProps) {
  // Parse tool name (format: serverName__toolName)
  const [serverName, actualToolName] = toolName.includes('__')
    ? toolName.split('__')
    : ['', toolName];

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />;
      case 'running':
        return <Loader2 className="h-3 w-3 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'error':
        return <XCircle className="h-3 w-3 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'Odottaa...';
      case 'running':
        return 'Suoritetaan...';
      case 'completed':
        return 'Valmis';
      case 'error':
        return 'Virhe';
    }
  };

  const getFriendlyDescription = () => {
    const descriptions: Record<string, string> = {
      browser_navigate: 'Navigoidaan selaimella',
      browser_snapshot: 'Otetaan kuvakaappaus',
      browser_click: 'Klikataan elementtiä',
      browser_type: 'Kirjoitetaan tekstiä',
      browser_scroll: 'Vieritetään sivua',
      browser_close: 'Suljetaan selain',
      read_file: 'Luetaan tiedostoa',
      write_file: 'Kirjoitetaan tiedostoon',
      list_directory: 'Listataan hakemisto',
    };

    return descriptions[actualToolName] || `Käytetään työkalua: ${actualToolName}`;
  };

  return (
    <Card className="p-3 my-2 bg-muted/30">
      <div className="flex items-start gap-2">
        <Wrench className="h-4 w-4 mt-0.5 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{getFriendlyDescription()}</span>
            {serverName && (
              <Badge variant="outline" className="text-xs">
                {serverName}
              </Badge>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getStatusIcon()}
              {getStatusText()}
            </div>
          </div>

          {args && Object.keys(args).length > 0 && status !== 'completed' && (
            <details className="mt-2">
              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                Näytä parametrit
              </summary>
              <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-x-auto">
                {JSON.stringify(args, null, 2)}
              </pre>
            </details>
          )}

          {result !== undefined && result !== null && status === 'completed' && (
            <details className="mt-2">
              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                Näytä tulos
              </summary>
              <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-x-auto max-h-32">
                {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    </Card>
  );
}
