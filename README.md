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
   # Using npm
   npm install
   
   # Using Bun (recommended)
   bun install
   ```

3. (Optional) Create a `.env` file with your configuration:
   ```
   PORT=3000
   FLOW_NETWORK=testnet  # Optional: defaults to 'mainnet' if not specified
   ```

   The server automatically uses the Flow mainnet by default. You only need to configure the environment if you want to use the testnet or a custom port.

## Usage

### Starting the server

```bash
# Run in development mode with hot reload
bun dev

# Run in production mode
bun start

# Build the server
bun run build
```

### Using NPX Command

You can run the MCP server directly using npx without installation:

```bash
# Run using npx
npx flow-mcp-server

# Specify network and port
npx flow-mcp-server --network testnet --port 3001

# Get help for all options
npx flow-mcp-server --help
```

Or install it globally:

```bash
# Install globally
npm install -g flow-mcp-server

# Run the globally installed version
flow-mcp-server
```

### Command Line Options

```
Options:
  -p, --port <port>          Port to run the server on (default: 3000)
  -n, --network <network>    Flow network to connect to (default: mainnet)
  -a, --access-node <url>    Custom Flow access node URL
  --stdio                    Run in stdio mode for direct integration
  -h, --help                 Show this help text
```

### Network Configuration

The server automatically configures FCL with the appropriate contract addresses for the selected network. The following networks are supported:

#### Mainnet
The mainnet configuration includes contract addresses for:
```javascript
{
  NonFungibleToken: '0x1d7e57aa55817448',
  FungibleToken: '0xf233dcee88fe0abe',
  MetadataViews: '0x1d7e57aa55817448',
  NFTCatalog: '0x49a7cda3a1eecc29',
  NFTRetrieval: '0x49a7cda3a1eecc29',
  Find: '0x097bafa4e0b48eef',
  Flowns: '0x233eb012d34b0070',
  Domains: '0x233eb012d34b0070',
  FlowToken: '0x1654653399040a61',
  TransactionGeneration: '0xe52522745adf5c34',
  FlowFees: '0xf919ee77447b7497',
  StringUtils: '0xa340dc0a4ec828ab',
  HybridCustody: '0xd8a7e05a7ac670c0',
  ViewResolver: '0x1d7e57aa55817448'
}
```

#### Testnet
The testnet configuration includes contract addresses for testnet environment.

You can also see the current network configuration by accessing the `/networks` endpoint.

### MCP Configuration

To configure an AI assistant to use Flow MCP, use the following configuration:

```json
{
  "mcpServers": {
    "flow-mcp": {
      "command": "npx",
      "args": ["-y", "flow-mcp-server", "--stdio"],
      "env": {
        "FLOW_NETWORK": "mainnet"  // Optional: defaults to 'mainnet', can be set to 'testnet'
      }
    }
  }
}
```

Or with direct HTTP API:

```json
{
  "mcpServers": {
    "flow-mcp": {
      "serverUrl": "http://localhost:3000",
      "env": {
        "FLOW_NETWORK": "mainnet"
      }
    }
  }
}
```

### Usage with AI assistants

The server implements the Model Context Protocol which allows it to be used with AI assistants that support MCP. It exposes various tools for interacting with the Flow blockchain.

## API Endpoints

- `/sse` - SSE endpoint for real-time communication
- `/messages` - Endpoint for sending tool requests
- `/health` - Health check endpoint
- `/` - Server information
- `/networks` - Network configuration information

## Available Tools

- `get_flow_balance` - Get FLOW balance for an address
- `get_token_balance` - Get token balance for an address
- `execute_script` - Execute a Cadence script
- `send_transaction` - Send a signed transaction to the Flow blockchain
- `resolve_domain` - Resolve a .find or .fn domain to a Flow address

## Publishing to npm

If you want to publish your own version of this package:

```bash
# Login to npm
npm login

# Publish the package
npm publish

# Update the package
npm version patch  # or minor or major
npm publish
```

## License

MIT