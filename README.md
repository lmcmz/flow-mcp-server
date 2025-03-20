# Flow MCP Server

A Model Context Protocol (MCP) server for interacting with the Flow blockchain. This server enables AI assistants to access Flow blockchain data and perform operations through a standardized interface.

## Features

- Balance checking for Flow and fungible tokens
- Domain resolution for `.find` and `.fn` domains
- Script execution for reading blockchain data
- Transaction submission and monitoring
- Account information retrieval
- Flow configuration based on environment variables

## Installation

### Using npx (Recommended)

```bash
npx -y @outblock/flow-mcp-server --stdio
```

Or specify HTTP mode with a port:

```bash
npx -y @outblock/flow-mcp-server --port 3000
```

### Local Installation (For Development)

```bash
git clone https://github.com/lmcmz/flow-mcp-server.git
cd flow-mcp-server
npm install
npm run build
npm start
```

## Usage

### Running with npx

```bash
# Run in stdio mode (for AI assistant integration)
npx -y @outblock/flow-mcp-server --stdio

# Run as HTTP server on port 3000
npx -y @outblock/flow-mcp-server --port 3000

# Specify Flow network
npx -y @outblock/flow-mcp-server --port 3000 --network testnet
```

### Running Local Development Server

```bash
# Run in stdio mode
npm run build
npm start

# Run as HTTP server on port 3000
npm run build
PORT=3000 npm start

# For development with auto-reload
npm run dev
```

## Configuration

The server can be configured using environment variables:

- `PORT` - HTTP port to listen on (if not set, defaults to stdio mode)
- `FLOW_NETWORK` - Flow network to connect to (mainnet, testnet, emulator)
- `FLOW_ACCESS_NODE` - Custom Flow access node URL
- `LOG_LEVEL` - Logging level (debug, info, warn, error)

## Using with AI Assistants

When integrating with AI assistants like Claude, you can start the MCP server in stdio mode and connect it to your assistant's tool configuration.

Example Claude tool configuration:

```json
{
  "tools": [
    {
      "name": "flow-mcp-server",
      "command": "npx -y @outblock/flow-mcp-server --stdio"
    }
  ]
}
```

## HTTP API Endpoints

When running in HTTP mode, the following endpoints are available:

- `/sse` - Server-Sent Events endpoint for real-time updates
- `/messages` - POST endpoint for sending tool requests
- `/health` - Health check endpoint
- `/` - Server information

Example HTTP API call:

```bash
curl -X POST http://localhost:3000/messages \
  -H "Content-Type: application/json" \
  -d '{
    "tool_request": {
      "name": "get_balance",
      "parameters": {
        "address": "0x2d4c3caffbeab845",
        "network": "mainnet"
      }
    }
  }'
```

## Available Tools

- `get_balance` - Get Flow balance for an address
- `get_token_balance` - Get fungible token balance
- `get_account` - Get account information
- `resolve_domain` - Resolve a .find or .fn domain to an address
- `execute_script` - Execute a Cadence script
- `send_transaction` - Send a transaction to the blockchain
- `get_transaction` - Get transaction details by ID

## Version History

- **v0.1.1** - Bug fix for formatArguments import issue in transaction service
- **v0.1.0** - Initial release with basic Flow blockchain integration

## License

MIT