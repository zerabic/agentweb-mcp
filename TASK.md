# Build: AgentWeb MCP Server

Build an MCP (Model Context Protocol) server for AgentWeb.live — a business directory API.

## What is AgentWeb?
A free business directory API with 11M+ businesses across 195 countries. AI agents use it to find business info (phone, email, hours, location).

## API Reference
Base URL: https://api.agentweb.live

### Endpoints to expose as MCP tools:

1. **search_businesses** - `GET /v1/search`
   - Params: q (text query), category, city, country, lat, lng, radius_km, limit (default 10, max 50), offset
   - All params optional but at least q, category, or lat+lng required
   - Returns: { status, meta: { total_results, latency_ms }, results: [...] }

2. **get_business** - `GET /v1/business/{id}`
   - Get full details for a specific business by ID
   - Returns: full business object with all fields

3. **health** - `GET /v1/health`
   - Returns API health, total businesses, countries count

### Authentication
All requests need `api_key` query param or `Authorization: Bearer <key>` header.
Users get a key from https://agentweb.live/#signup or POST /v1/register with { email, name }.

## Requirements

1. TypeScript MCP server using `@modelcontextprotocol/sdk`
2. Package name: `agentweb-mcp`
3. Tools: `search_businesses`, `get_business`, `agentweb_health`
4. Config via env var `AGENTWEB_API_KEY` or passed as argument
5. Include proper package.json with bin entry so it works with `npx agentweb-mcp`
6. Include a README.md with:
   - What it does
   - Installation: `npx agentweb-mcp` 
   - Config example for Claude Desktop (claude_desktop_config.json)
   - Config example for Cursor/Windsurf
   - Getting an API key link
7. Include proper error handling (missing API key, API errors)
8. Use stdio transport (standard for MCP)
9. Make it clean, minimal, production-ready

## Example claude_desktop_config.json:
```json
{
  "mcpServers": {
    "agentweb": {
      "command": "npx",
      "args": ["-y", "agentweb-mcp"],
      "env": {
        "AGENTWEB_API_KEY": "aw_live_..."
      }
    }
  }
}
```

When completely finished, run: openclaw system event --text "Done: Built AgentWeb MCP server" --mode now
