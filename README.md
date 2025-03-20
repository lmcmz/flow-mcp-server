# Flow MCP Server

Model Context Protocol (MCP) server for Flow blockchain with direct RPC communication.

This server implements the Model Context Protocol and provides tools for interacting with the Flow blockchain directly through RPC calls. It can be used with AI assistants that support MCP.

## Features

- Get account balances (FLOW and tokens)
- Execute Flow scripts
- Send transactions
- Resolve domains to Flow addresses (.find and .fn)
- Interact with Flow contracts
- Full MCP compliance for AI agent integration

## Installation

### Option 1: Run directly with npx (recommended for quick use)

```bash
# Run in HTTP server mode
npx @outblock/flow-mcp-server

# Run in stdio mode (for AI agent integration)
npx @outblock/flow-mcp-server --stdio
```

### Option 2: Install locally for development

```bash
# Clone the repository
git clone https://github.com/lmcmz/flow-mcp-server.git
cd flow-mcp-server

# Install dependencies
npm install

# Create a .env file (optional)
cp .env.example .env
```

## Usage

### Option 1: Starting via npx

```bash
# Run in HTTP server mode on default port (3000)
npx @outblock/flow-mcp-server

# Run in HTTP server mode on custom port
npx @outblock/flow-mcp-server --port 8080

# Run in stdio mode (for AI agent integration)
npx @outblock/flow-mcp-server --stdio

# Specify Flow network
npx @outblock/flow-mcp-server --network testnet
```

### Option 2: Starting the local development server

```bash
# Run in development mode with hot reload
npm run dev

# Run in production mode
npm run start

# Build the server
npm run build

# Run with stdio mode directly
node src/index.js
```

### Environment Variables (optional)

Create a `.env` file with your configuration:

```
# Server configuration
PORT=3000

# Flow network configuration (mainnet or testnet)
FLOW_NETWORK=mainnet
FLOW_ACCESS_NODE=https://rest-mainnet.onflow.org

# Optional: Add your default keys for development
# FLOW_PRIVATE_KEY=
# FLOW_ADDRESS=
```

## Usage with AI assistants

The server implements the Model Context Protocol which allows it to be used with AI assistants that support MCP.

### Example usage with Claude

```
To use the Flow blockchain, I'll need to use a Flow MCP server. Please run:

npx @outblock/flow-mcp-server --stdio

Then I'll be able to check account balances, execute scripts, and interact with Flow contracts.
```

## API Endpoints

When running in HTTP mode, the following endpoints are available:

- `/sse` - SSE endpoint for real-time communication
- `/messages` - Endpoint for sending tool requests
- `/health` - Health check endpoint
- `/` - Server information

### Example HTTP API call

```bash
curl -X POST http://localhost:3000/messages \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "get_flow_balance",
    "parameters": {
      "address": "0x1654653399040a61",
      "network": "mainnet"
    }
  }'
```

## Available Tools

- `get_flow_balance` - Get FLOW balance for an address
- `get_token_balance` - Get token balance for an address
- `execute_script` - Execute a Cadence script
- `send_transaction` - Send a signed transaction to the Flow blockchain
- `resolve_domain` - Resolve a .find or .fn domain to a Flow address
- `get_account_info` - Get detailed information about a Flow account

## License

MIT