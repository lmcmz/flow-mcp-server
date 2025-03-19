# Flow MCP Server

Model Context Protocol (MCP) server for Flow blockchain with direct RPC communication.

This server implements the Model Context Protocol and provides tools for interacting with the Flow blockchain directly through RPC calls.

## Features

- Get account balances (FLOW and tokens)
- Execute Flow scripts
- Send transactions
- Resolve domains to Flow addresses
- Interact with Flow contracts
- Full MCP compliance for AI agent integration

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/lmcmz/flow-mcp-server.git
   cd flow-mcp-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your configuration:
   ```
   PORT=3000
   FLOW_ACCESS_NODE=https://rest-mainnet.onflow.org
   FLOW_NETWORK=mainnet
   ```

## Usage

### Starting the server

```bash
# Run in development mode with hot reload
npm run dev

# Run in production mode
npm run start

# Build the server
npm run build
```

### Usage with AI assistants

The server implements the Model Context Protocol which allows it to be used with AI assistants that support MCP. It exposes various tools for interacting with the Flow blockchain.

## API Endpoints

- `/sse` - SSE endpoint for real-time communication
- `/messages` - Endpoint for sending tool requests
- `/health` - Health check endpoint
- `/` - Server information

## Available Tools

- `get_flow_balance` - Get FLOW balance for an address
- `get_token_balance` - Get token balance for an address
- `execute_script` - Execute a Cadence script
- `send_transaction` - Send a signed transaction to the Flow blockchain
- `resolve_domain` - Resolve a .find or .fn domain to a Flow address

## License

MIT