# AgentWeb MCP Server

MCP (Model Context Protocol) server for [AgentWeb.live](https://agentweb.live) — a free business directory API with 11M+ businesses across 195 countries.

## What It Does

This MCP server exposes AgentWeb's business directory API to AI assistants like Claude, enabling them to:
- Search for businesses by name, category, or location
- Get detailed business information (phone, email, hours, address, website)
- Access data from 11M+ businesses in 195 countries

## Installation

### Quick Start with npx

The easiest way to use this server is with `npx`:

```bash
npx agentweb-mcp
```

### Or Install Globally

```bash
npm install -g agentweb-mcp
agentweb-mcp
```

## Getting an API Key

You need a free API key from AgentWeb:

1. Visit [https://agentweb.live/#signup](https://agentweb.live/#signup)
2. Sign up with your email and name
3. Your API key will be sent to your email (format: `aw_live_...`)

## Configuration

### Claude Desktop

Add this to your `claude_desktop_config.json`:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "agentweb": {
      "command": "npx",
      "args": ["-y", "agentweb-mcp"],
      "env": {
        "AGENTWEB_API_KEY": "aw_live_your_key_here"
      }
    }
  }
}
```

### Cursor / Windsurf

Add to your MCP settings file:

```json
{
  "mcpServers": {
    "agentweb": {
      "command": "npx",
      "args": ["-y", "agentweb-mcp"],
      "env": {
        "AGENTWEB_API_KEY": "aw_live_your_key_here"
      }
    }
  }
}
```

### Alternative: Pass API Key as Argument

```json
{
  "mcpServers": {
    "agentweb": {
      "command": "npx",
      "args": ["-y", "agentweb-mcp", "aw_live_your_key_here"]
    }
  }
}
```

## Available Tools

### 1. `search_businesses`

Search for businesses in the AgentWeb directory.

**Parameters:**
- `q` (string, optional): Text search query (business name, keywords)
- `category` (string, optional): Business category (e.g., "restaurant", "hotel")
- `city` (string, optional): City name for location filter
- `country` (string, optional): Country code (ISO 3166-1 alpha-2, e.g., "US", "GB")
- `lat` (number, optional): Latitude for geographic search
- `lng` (number, optional): Longitude for geographic search
- `radius_km` (number, optional): Search radius in kilometers (use with lat/lng)
- `limit` (number, optional): Max results to return (default: 10, max: 50)
- `offset` (number, optional): Number of results to skip for pagination

**Note**: At least one of `q`, `category`, or `lat+lng` is required.

**Example queries:**
- "Find pizza restaurants in New York"
- "Search for hotels near latitude 40.7128, longitude -74.0060 within 5km"
- "List all cafes in London, GB"

### 2. `get_business`

Get full details for a specific business by ID.

**Parameters:**
- `id` (string, required): The unique business ID from AgentWeb

**Example:**
- "Get details for business ID abc123"

### 3. `agentweb_health`

Check the health status of the AgentWeb API.

**Parameters:** None

**Returns:** API status, total businesses count, and countries available.

## Example Usage

After configuring the server, you can ask Claude:

```
Find Italian restaurants in San Francisco
```

```
Search for dentists near me in Chicago
```

```
Get contact information for coffee shops in Seattle
```

## Development

### Build from Source

```bash
git clone <repository>
cd agentweb-mcp
npm install
npm run build
```

### Run in Development Mode

```bash
npm run dev
```

### Project Structure

```
agentweb-mcp/
├── src/
│   └── index.ts          # Main MCP server implementation
├── dist/                 # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── README.md
```

## API Documentation

For full API documentation, visit [AgentWeb API Docs](https://agentweb.live).

## Support

- **API Issues**: Contact AgentWeb support
- **MCP Server Issues**: Open an issue in this repository
- **Get API Key**: [https://agentweb.live/#signup](https://agentweb.live/#signup)

## License

MIT
