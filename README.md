# MCP Chatbot

A chatbot application that integrates with Model Context Protocol (MCP) servers, allowing AI assistants to use external tools.

![UI Screenshot](doc/ui.png)

## Tech Stack

- TypeScript
- Next.js
- shadcn/ui
- Tailwind CSS
- Vercel AI SDK
- Vercel AI Gateway

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env.local`:
   ```
   AI_GATEWAY_API_KEY=your-api-key-here
   AI_GATEWAY_MODEL=anthropic/claude-sonnet-4.5
   ```

   The application uses [Vercel AI Gateway](https://vercel.com/docs/ai-gateway). Get your API key from the Vercel dashboard.

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Configuration

Edit `chatbot-and-mcp-servers-config.json` to configure MCP servers and settings:

```json
{
  "maxSteps": 50,
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/folder"]
    }
  }
}
```

### Configuration Options

| Option | Description |
|--------|-------------|
| `maxSteps` | Maximum tool calls per question (default: 50) |
| `mcpServers` | MCP server configurations |
| `command` | Command to start the MCP server |
| `args` | Command arguments |

## Contributing

Feature requests, bug reports, and other feedback are welcome via [GitHub Issues](https://github.com/mikesmallhelp/chatbot-and-mcp-servers/issues). Contributions are also welcome.

## Notes

Many language models bundle all tasks together and don't report intermediate steps. This doesn't apply to Anthropic's language models, which report what they're doing between steps.
