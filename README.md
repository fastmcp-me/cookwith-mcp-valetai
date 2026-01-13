[![Add to Cursor](https://fastmcp.me/badges/cursor_dark.svg)](https://fastmcp.me/MCP/Details/1618/cookwith)
[![Add to VS Code](https://fastmcp.me/badges/vscode_dark.svg)](https://fastmcp.me/MCP/Details/1618/cookwith)
[![Add to Claude](https://fastmcp.me/badges/claude_dark.svg)](https://fastmcp.me/MCP/Details/1618/cookwith)
[![Add to ChatGPT](https://fastmcp.me/badges/chatgpt_dark.svg)](https://fastmcp.me/MCP/Details/1618/cookwith)
[![Add to Codex](https://fastmcp.me/badges/codex_dark.svg)](https://fastmcp.me/MCP/Details/1618/cookwith)
[![Add to Gemini](https://fastmcp.me/badges/gemini_dark.svg)](https://fastmcp.me/MCP/Details/1618/cookwith)

# Cookwith MCP Server

An MCP (Model Context Protocol) server that provides AI-powered recipe generation and transformation tools using Cookwith's advanced culinary AI.

## Features

- **Recipe Generation**: Create custom recipes from natural language descriptions
- **Recipe Transformation**: Modify existing recipes based on dietary needs, serving sizes, or other requirements
- **Dietary Support**: Handle allergies, dietary restrictions, and nutritional goals
- **Smart Adaptations**: Adjust for calories, protein targets, and serving counts

## Installation

### Via MCP Registry

```bash
npx @modelcontextprotocol/create-server install @cookwith/mcp-server
```

### Via npm

```bash
npm install -g @cookwith/mcp-server
```

### For Claude Desktop

Add to your Claude Desktop configuration:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "cookwith": {
      "command": "npx",
      "args": ["@cookwith/mcp-server"]
    }
  }
}
```

## Available Tools

### `generate_recipe`

Generate a new recipe based on natural language instructions.

**Parameters:**
- `prompt` (string, required): Natural language description of the desired recipe
- `dietaryRestrictions` (array): Dietary restrictions (e.g., vegetarian, vegan, gluten-free)
- `allergies` (array): Ingredients to avoid due to allergies
- `dislikes` (array): Foods the user doesn't like
- `calories` (string): Target calories per serving
- `protein` (string): Target protein in grams per serving
- `servings` (number): Number of servings (1-20, default: 4)

**Example:**
```javascript
{
  "prompt": "A healthy pasta dish with lots of vegetables",
  "dietaryRestrictions": ["vegetarian"],
  "calories": "500",
  "servings": 2
}
```

### `transform_recipe`

Transform or modify an existing recipe based on instructions.

**Parameters:**
- `recipe` (object, required): The recipe to transform
  - `title` (string): Recipe title
  - `description` (string): Recipe description
  - `ingredients` (array): List of ingredients
  - `instructions` (array): Cooking instructions
  - `servings` (number): Number of servings
  - Additional optional fields for nutrition, timing, etc.
- `instructions` (string, required): How to transform the recipe
- `calories` (string): New target calories per serving
- `protein` (string): New target protein per serving
- `servings` (number): New number of servings

**Example:**
```javascript
{
  "recipe": {
    "title": "Classic Spaghetti Carbonara",
    "description": "Traditional Italian pasta dish",
    "ingredients": ["400g spaghetti", "200g guanciale", "4 eggs", "100g pecorino"],
    "instructions": ["Cook pasta", "Fry guanciale", "Mix eggs and cheese", "Combine"],
    "servings": 4
  },
  "instructions": "Make it vegetarian and reduce calories",
  "calories": "400"
}
```

## Usage Examples

### With Claude

Once configured, you can use natural language to interact with the tools:

```
"Generate a healthy dinner recipe for 2 people with chicken and vegetables, around 500 calories per serving"

"Transform this pasta recipe to be gluten-free and dairy-free"
```

### Programmatic Usage

```javascript
import { Client } from '@modelcontextprotocol/sdk';

const client = new Client({
  name: 'my-app',
  version: '1.0.0'
});

await client.connect('npx', ['@cookwith/mcp-server']);

// Generate a recipe
const result = await client.callTool('generate_recipe', {
  prompt: 'Quick and healthy breakfast',
  calories: '350',
  servings: 1
});
```

## Development

### Building from Source

```bash
git clone https://github.com/blaideinc/cookwith-mcp
cd cookwith-mcp
npm install
npm run build
```

### Running Locally

```bash
npm start
```

### Testing

```bash
npm test
```

## API Endpoint

The MCP server can also be accessed via HTTP at:
- Production: `https://cookwith.co/api/mcp`
- Development: `http://localhost:3000/api/mcp`

## License

MIT

## Support

- GitHub Issues: [https://github.com/blaideinc/cookwith-mcp/issues](https://github.com/blaideinc/cookwith-mcp/issues)
- Website: [https://cookwith.co](https://cookwith.co)

## About Cookwith

Cookwith is an AI-powered cooking platform that generates personalized recipes based on your preferences, dietary restrictions, and taste profile. Learn more at [cookwith.co](https://cookwith.co).