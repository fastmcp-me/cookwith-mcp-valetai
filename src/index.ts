#!/usr/bin/env node

/**
 * Cookwith MCP Server - Standalone stdio implementation
 *
 * This server can run in two modes:
 * 1. stdio mode (default) - for Claude Desktop and other MCP clients
 * 2. HTTP proxy mode - connects to the hosted API endpoint
 */

import { stderr, stdin, stdout } from "node:process";
import readline from "node:readline";

// Configuration
const API_ENDPOINT =
  process.env.COOKWITH_API_URL || "https://cookwith.co/api/mcp";
const USE_HTTP_PROXY = process.env.COOKWITH_USE_HTTP === "true";

// Types
interface JsonRpcRequest {
  jsonrpc: "2.0";
  method: string;
  params?: any;
  id?: string | number | null;
}

interface JsonRpcResponse {
  jsonrpc: "2.0";
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id: string | number | null;
}

// Logger - writes to stderr to avoid interfering with stdio protocol
function log(level: "info" | "error" | "debug", message: string, data?: any) {
  if (process.env.MCP_DEBUG === "true" || level === "error") {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    stderr.write(`${logMessage}\n`);
    if (data) {
      stderr.write(`${JSON.stringify(data, null, 2)}\n`);
    }
  }
}

// HTTP Proxy Mode - forwards requests to the hosted endpoint
async function handleHttpProxy(
  request: JsonRpcRequest
): Promise<JsonRpcResponse | null> {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "cookwith-mcp/1.0.0",
      },
      body: JSON.stringify(request),
    });

    if (response.status === 204) {
      // No content for notifications
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    log("error", "HTTP proxy request failed", error);
    return {
      jsonrpc: "2.0",
      error: {
        code: -32603,
        message: error instanceof Error ? error.message : "Internal error",
      },
      id: request.id ?? null,
    };
  }
}

// Local Mode - handles requests directly (simplified version)
function handleLocalRequest(request: JsonRpcRequest): JsonRpcResponse | null {
  // Handle different methods
  switch (request.method) {
    case "initialize":
      return {
        jsonrpc: "2.0",
        result: {
          protocolVersion: request.params?.protocolVersion || "2025-03-26",
          capabilities: {
            tools: {},
          },
          serverInfo: {
            name: "cookwith-mcp",
            version: "1.0.0",
          },
        },
        id: request.id ?? null,
      };

    case "tools/list":
      return {
        jsonrpc: "2.0",
        result: {
          tools: [
            {
              name: "generate_recipe",
              description:
                "Generate a new recipe based on natural language instructions",
              inputSchema: {
                type: "object",
                properties: {
                  prompt: {
                    type: "string",
                    description:
                      "Natural language description of the desired recipe",
                    minLength: 1,
                    maxLength: 1000,
                  },
                  dietaryRestrictions: {
                    type: "array",
                    items: { type: "string" },
                    description: "Dietary restrictions",
                  },
                  allergies: {
                    type: "array",
                    items: { type: "string" },
                    description: "Ingredients to avoid",
                  },
                  calories: {
                    type: "string",
                    description: "Target calories per serving",
                  },
                  protein: {
                    type: "string",
                    description: "Target protein in grams",
                  },
                  servings: {
                    type: "number",
                    description: "Number of servings (1-20)",
                    minimum: 1,
                    maximum: 20,
                    default: 4,
                  },
                },
                required: ["prompt"],
              },
            },
            {
              name: "transform_recipe",
              description: "Transform or modify an existing recipe",
              inputSchema: {
                type: "object",
                properties: {
                  recipe: {
                    type: "object",
                    description: "The recipe to transform",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      ingredients: {
                        type: "array",
                        items: { type: "string" },
                      },
                      instructions: {
                        type: "array",
                        items: { type: "string" },
                      },
                      servings: { type: "number" },
                    },
                    required: [
                      "title",
                      "description",
                      "ingredients",
                      "instructions",
                      "servings",
                    ],
                  },
                  instructions: {
                    type: "string",
                    description: "How to transform the recipe",
                    minLength: 1,
                    maxLength: 1000,
                  },
                  calories: {
                    type: "string",
                    description: "New target calories",
                  },
                  protein: {
                    type: "string",
                    description: "New target protein",
                  },
                  servings: {
                    type: "number",
                    description: "New servings",
                    minimum: 1,
                    maximum: 20,
                  },
                },
                required: ["recipe", "instructions"],
              },
            },
          ],
        },
        id: request.id ?? null,
      };

    case "tools/call":
      // In local mode, forward to HTTP endpoint for actual recipe generation
      if (!USE_HTTP_PROXY) {
        log("info", "Local mode forwarding tool call to API", {
          tool: request.params?.name,
        });
        return handleHttpProxy(request) as any;
      }
      return {
        jsonrpc: "2.0",
        error: {
          code: -32601,
          message: "Tool execution requires HTTP proxy mode",
        },
        id: request.id ?? null,
      };

    case "notifications/initialized":
      // Notifications don't need responses
      return null;

    default:
      return {
        jsonrpc: "2.0",
        error: {
          code: -32601,
          message: `Method not found: ${request.method}`,
        },
        id: request.id ?? null,
      };
  }
}

// Main server loop
async function main() {
  log("info", "Starting Cookwith MCP Server", {
    mode: USE_HTTP_PROXY ? "HTTP Proxy" : "Hybrid",
    endpoint: USE_HTTP_PROXY ? API_ENDPOINT : "Local + API for tools",
  });

  // Create readline interface for stdio
  const rl = readline.createInterface({
    input: stdin,
    output: stdout,
    terminal: false,
  });

  // Handle incoming JSON-RPC requests
  rl.on("line", async (line) => {
    try {
      const request = JSON.parse(line) as JsonRpcRequest;
      log("debug", "Received request", {
        method: request.method,
        id: request.id,
      });

      let response: JsonRpcResponse | null;

      if (USE_HTTP_PROXY) {
        // Forward all requests to HTTP endpoint
        response = await handleHttpProxy(request);
      } else {
        // Handle locally with API fallback for tools
        response = await handleLocalRequest(request);
      }

      // Send response if there is one (notifications don't get responses)
      if (response) {
        stdout.write(JSON.stringify(response) + "\n");
        log("debug", "Sent response", { id: response.id });
      }
    } catch (error) {
      log("error", "Failed to process request", error);
      const errorResponse: JsonRpcResponse = {
        jsonrpc: "2.0",
        error: {
          code: -32700,
          message: "Parse error",
        },
        id: null,
      };
      stdout.write(JSON.stringify(errorResponse) + "\n");
    }
  });

  // Handle process termination
  process.on("SIGINT", () => {
    log("info", "Shutting down server");
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    log("info", "Shutting down server");
    process.exit(0);
  });

  // Keep process alive
  stdin.resume();
}

// Start the server
main().catch((error) => {
  log("error", "Server failed to start", error);
  process.exit(1);
});
