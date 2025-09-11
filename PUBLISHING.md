# Publishing Cookwith MCP Server

This guide covers how to publish the Cookwith MCP server to various registries.

## Prerequisites

1. **npm account**: Create an account at [npmjs.com](https://www.npmjs.com/)
2. **GitHub repository**: Set up the repository at `github.com/blaideinc/cookwith-mcp`
3. **MCP Registry account**: Register at the [MCP Registry](https://github.com/modelcontextprotocol/registry)

## Step 1: Prepare the Package

```bash
cd cookwith-mcp

# Install dependencies
npm install

# Build the TypeScript code
npm run build

# Test locally
npm start
```

## Step 2: Publish to npm

```bash
# Login to npm (if not already logged in)
npm login

# Publish the package
npm publish --access public

# Or if using a scoped package name (@cookwith/mcp-server)
npm publish --access public
```

## Step 3: Register with MCP Registry

The MCP Registry is maintained as a GitHub repository. To register your server:

1. **Fork the MCP Registry Repository**
   ```bash
   # Fork https://github.com/modelcontextprotocol/registry
   git clone https://github.com/YOUR_USERNAME/registry.git
   cd registry
   ```

2. **Add Your Server Entry**
   
   Create a new file at `servers/cookwith-mcp.json`:
   ```json
   {
     "name": "cookwith-mcp",
     "title": "Cookwith Recipe AI",
     "description": "AI-powered recipe generation and transformation tools",
     "author": "Cookwith Team",
     "homepage": "https://cookwith.co",
     "repository": "https://github.com/blaideinc/cookwith-mcp",
     "license": "MIT",
     "categories": ["cooking", "recipes", "ai", "food"],
     "runtime": "node",
     "package": {
       "npm": "@cookwith/mcp-server"
     },
     "tools": [
       {
         "name": "generate_recipe",
         "description": "Generate recipes from natural language"
       },
       {
         "name": "transform_recipe", 
         "description": "Transform existing recipes"
       }
     ],
     "installation": {
       "npm": {
         "global": true,
         "command": "npm install -g @cookwith/mcp-server"
       },
       "npx": {
         "command": "npx @cookwith/mcp-server"
       }
     },
     "configuration": {
       "claudeDesktop": {
         "command": "npx",
         "args": ["@cookwith/mcp-server"]
       },
       "vscode": {
         "command": "npx",
         "args": ["@cookwith/mcp-server"]
       }
     }
   }
   ```

3. **Submit a Pull Request**
   ```bash
   git add servers/cookwith-mcp.json
   git commit -m "Add cookwith-mcp server to registry"
   git push origin main
   ```
   
   Then create a pull request to the main MCP Registry repository.

## Step 4: Set Up GitHub Repository

1. **Create Repository**
   - Go to [github.com/new](https://github.com/new)
   - Name: `cookwith-mcp`
   - Description: "MCP server for AI-powered recipe generation and transformation"
   - Make it public

2. **Push Code**
   ```bash
   cd cookwith-mcp
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/blaideinc/cookwith-mcp.git
   git push -u origin main
   ```

3. **Add GitHub Actions** (optional)
   
   Create `.github/workflows/publish.yml`:
   ```yaml
   name: Publish to npm
   
   on:
     release:
       types: [created]
   
   jobs:
     publish:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
             registry-url: 'https://registry.npmjs.org'
         - run: npm ci
         - run: npm run build
         - run: npm publish --access public
           env:
             NODE_AUTH_TOKEN: ${{secrets.NPM_TOKEN}}
   ```

## Step 5: Test Installation

After publishing, test that users can install and use your server:

```bash
# Test npm installation
npm install -g @cookwith/mcp-server
cookwith-mcp

# Test npx usage
npx @cookwith/mcp-server

# Test with Claude Desktop
# Add to claude_desktop_config.json and restart Claude
```

## Step 6: Announce the Release

1. **MCP Community**
   - Post in the MCP Discord/Slack community
   - Share on the MCP forum

2. **Social Media**
   - Tweet about the release with #MCP #AI #Cooking tags
   - Share on LinkedIn

3. **Cookwith Blog**
   - Write a blog post about the MCP integration
   - Include examples and use cases

## Maintenance

### Updating the Package

1. Update version in `package.json`
2. Update `CHANGELOG.md` with changes
3. Build and test: `npm run build && npm test`
4. Publish: `npm publish`
5. Create GitHub release with same version tag

### Monitoring

- Check npm download stats: `npm info @cookwith/mcp-server`
- Monitor GitHub issues and pull requests
- Respond to user feedback in MCP community

## Environment Variables

For production deployment, you can configure:

- `COOKWITH_API_URL`: Override the default API endpoint
- `COOKWITH_USE_HTTP`: Set to "true" to use HTTP proxy mode
- `MCP_DEBUG`: Set to "true" for verbose logging

## Support Channels

- GitHub Issues: [github.com/blaideinc/cookwith-mcp/issues](https://github.com/blaideinc/cookwith-mcp/issues)
- Email: support@cookwith.co
- Discord: MCP Community Server
- Website: [cookwith.co](https://cookwith.co)