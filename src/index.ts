#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

const API_BASE_URL = "https://api.agentweb.live";

interface AgentWebConfig {
  apiKey: string;
}

class AgentWebServer {
  private server: Server;
  private config: AgentWebConfig;

  constructor(config: AgentWebConfig) {
    this.config = config;
    this.server = new Server(
      {
        name: "agentweb-mcp",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error("[MCP Error]", error);
    };

    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.getTools(),
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) =>
      this.handleToolCall(request)
    );
  }

  private getTools(): Tool[] {
    return [
      {
        name: "search_businesses",
        description:
          "Search for businesses in the AgentWeb directory. Search by text query, category, location (city/country or lat/lng with radius). Returns business info including name, address, phone, email, website, hours, and more.",
        inputSchema: {
          type: "object",
          properties: {
            q: {
              type: "string",
              description: "Text search query (business name, keywords, etc.)",
            },
            category: {
              type: "string",
              description: "Business category filter (e.g., 'restaurant', 'hotel')",
            },
            city: {
              type: "string",
              description: "City name for location filter",
            },
            country: {
              type: "string",
              description: "Country code (ISO 3166-1 alpha-2, e.g., 'US', 'GB')",
            },
            lat: {
              type: "number",
              description: "Latitude for geographic search (requires lng and radius_km)",
            },
            lng: {
              type: "number",
              description: "Longitude for geographic search (requires lat and radius_km)",
            },
            radius_km: {
              type: "number",
              description: "Search radius in kilometers (used with lat/lng)",
            },
            limit: {
              type: "number",
              description: "Maximum number of results to return (default: 10, max: 50)",
              default: 10,
            },
            offset: {
              type: "number",
              description: "Number of results to skip for pagination",
              default: 0,
            },
          },
        },
      },
      {
        name: "get_business",
        description:
          "Get full details for a specific business by its ID. Returns complete business information including all available fields.",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "The unique business ID from AgentWeb",
            },
          },
          required: ["id"],
        },
      },
      {
        name: "agentweb_health",
        description:
          "Check the health status of the AgentWeb API, including total number of businesses and countries available.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ];
  }

  private async makeApiRequest(
    endpoint: string,
    params: Record<string, any> = {}
  ): Promise<any> {
    const url = new URL(`${API_BASE_URL}${endpoint}`);

    // Add non-null params to query string
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    // Add API key
    url.searchParams.append("api_key", this.config.apiKey);

    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `AgentWeb API error (${response.status}): ${errorText}`
      );
    }

    return await response.json();
  }

  private async handleToolCall(request: any) {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case "search_businesses": {
          const data = await this.makeApiRequest("/v1/search", args);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        }

        case "get_business": {
          if (!args.id) {
            throw new Error("Business ID is required");
          }
          const data = await this.makeApiRequest(`/v1/business/${args.id}`);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        }

        case "agentweb_health": {
          const data = await this.makeApiRequest("/v1/health");
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `Error: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("AgentWeb MCP Server running on stdio");
  }
}

// Main entry point
async function main() {
  const apiKey = process.env.AGENTWEB_API_KEY || process.argv[2];

  if (!apiKey) {
    console.error("Error: AGENTWEB_API_KEY environment variable is required");
    console.error("Get your API key at: https://agentweb.live/#signup");
    console.error(
      "\nUsage: AGENTWEB_API_KEY=your_key npx agentweb-mcp"
    );
    console.error("   or: npx agentweb-mcp your_key");
    process.exit(1);
  }

  const server = new AgentWebServer({ apiKey });
  await server.run();
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
