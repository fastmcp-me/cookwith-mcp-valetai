# Publishing Cookwith MCP to the MCP Registry

This guide covers publishing the cookwith-mcp server to the official MCP Registry using the `mcp-publisher` tool.

## Prerequisites

1. **npm account**: Required for publishing the npm package
2. **GitHub account**: Required for authentication (blaideinc organization)
3. **MCP Publisher CLI**: Install the publishing tool

## Step 1: Install MCP Publisher CLI

Choose one of these installation methods:

### Option A: Homebrew (macOS/Linux)
```bash
brew install mcp-publisher
```

### Option B: Download Pre-built Binary
Visit [MCP Registry Releases](https://github.com/modelcontextprotocol/registry/releases) and download the appropriate binary for your platform.

### Option C: Build from Source
```bash
git clone https://github.com/modelcontextprotocol/registry.git
cd registry
make publisher
# Binary will be at ./bin/mcp-publisher
```

## Step 2: Prepare the Package

```bash
cd cookwith-mcp

# Ensure package.json and server.json are configured
ls -la package.json server.json

# Build the TypeScript code
npm install
npm run build

# Test locally to ensure it works
npm start
```

## Step 3: Publish to npm First

The MCP Registry validates npm packages, so publish there first:

```bash
# Login to npm
npm login

# Publish the package (use --access public for scoped packages)
npm publish --access public
```

Wait a few minutes for npm to propagate the package.

## Step 4: Authenticate with MCP Registry

Since we're using the `io.github.blaideinc` namespace, authenticate with GitHub:

```bash
# Login with GitHub (you'll be redirected to browser)
mcp-publisher login github
```

This will:
1. Open your browser for GitHub OAuth
2. Verify you have access to the `blaideinc` organization
3. Store authentication credentials locally

## Step 5: Validate server.json

The `server.json` file is already configured with:
- **Namespace**: `io.github.blaideinc/cookwith-mcp`
- **Package**: NPM package `@cookwith/mcp-server`
- **Tools**: generate_recipe and transform_recipe

Validate it's correct:
```bash
# Check the configuration
cat server.json | jq .name
# Should output: "io.github.blaideinc/cookwith-mcp"
```

## Step 6: Publish to MCP Registry

```bash
# From the cookwith-mcp directory
mcp-publisher publish

# Or specify the path
mcp-publisher publish --path ./server.json
```

The publisher will:
1. Validate your authentication
2. Check namespace ownership (io.github.blaideinc)
3. Verify the npm package exists and is accessible
4. Register the server in the MCP Registry

## Step 7: Verify Publication

Check that your server appears in the registry:

```bash
# Search for your server
curl "https://registry.modelcontextprotocol.io/v0/servers?search=cookwith" | jq

# Get specific server details
curl "https://registry.modelcontextprotocol.io/v0/servers/io.github.blaideinc/cookwith-mcp" | jq
```

## Step 8: Test Installation

Users can now install your MCP server:

```bash
# Via npm
npm install -g @cookwith/mcp-server

# Via npx
npx @cookwith/mcp-server

# Via MCP Registry discovery
mcp list
mcp install io.github.blaideinc/cookwith-mcp
```

## Updating the Server

When you release updates:

1. **Update version** in `package.json`
2. **Update server.json** with new version
3. **Build and test**: `npm run build`
4. **Publish to npm**: `npm publish`
5. **Update registry**: `mcp-publisher publish`

## Troubleshooting

### Authentication Issues
```bash
# Clear cached credentials and re-login
mcp-publisher logout
mcp-publisher login github
```

### Package Not Found
- Ensure npm package is published and public
- Wait 5-10 minutes after npm publish for propagation
- Verify package name matches exactly in server.json

### Namespace Validation Failed
- For `io.github.blaideinc`, ensure you're logged in with an account that has access to the blaideinc organization
- The GitHub user must have write access to the organization

### Server Not Appearing in Registry
- Check the response from `mcp-publisher publish` for errors
- Verify with: `curl https://registry.modelcontextprotocol.io/v0/servers/io.github.blaideinc/cookwith-mcp`
- May take a few minutes to appear in search results

## Alternative: HTTP Endpoint Registration

If you want to register the HTTP endpoint directly (without npm):

1. Create a separate `server-http.json`:
```json
{
  "name": "io.github.blaideinc/cookwith-http",
  "description": "Cookwith MCP Server (HTTP endpoint)",
  "runtime": "http",
  "endpoint": "https://cookwith.co/api/mcp",
  ...
}
```

2. Publish: `mcp-publisher publish --path ./server-http.json`

## Support

- **MCP Registry Issues**: [github.com/modelcontextprotocol/registry/issues](https://github.com/modelcontextprotocol/registry/issues)
- **Cookwith MCP Issues**: [github.com/blaideinc/cookwith-mcp/issues](https://github.com/blaideinc/cookwith-mcp/issues)
- **Discord**: MCP Community Server
- **Email**: support@cookwith.co