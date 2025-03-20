// CLI utilities for flow-mcp-server
import { networks } from './config/networks.js';

/**
 * Parse command line arguments and return configuration
 * @returns {Object} Configuration object
 */
export function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    port: process.env.PORT || 3000,
    network: process.env.FLOW_NETWORK || 'mainnet',
    accessNode: process.env.FLOW_ACCESS_NODE,
    stdio: false,
    help: false,
    version: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--port':
      case '-p':
        config.port = parseInt(args[++i], 10);
        break;
      case '--network':
      case '-n':
        config.network = args[++i];
        break;
      case '--access-node':
      case '-a':
        config.accessNode = args[++i];
        break;
      case '--stdio':
        config.stdio = true;
        break;
      case '--help':
      case '-h':
        config.help = true;
        break;
      case '--version':
      case '-v':
        config.version = true;
        break;
    }
  }

  return config;
}

/**
 * Display help text for CLI usage
 */
export function showHelp() {
  // Get available network types from the networks configuration
  const availableNetworks = Object.keys(networks).join(', ');
  
  console.log(`
Flow MCP Server - Model Context Protocol for Flow blockchain

Usage: npx flow-mcp-server [options]

Options:
  -p, --port <port>          Port to run the server on (default: 3000)
  -n, --network <network>    Flow network to connect to (default: mainnet)
                             Available networks: ${availableNetworks}
  -a, --access-node <url>    Custom Flow access node URL
  --stdio                    Run in stdio mode for direct integration
  -h, --help                 Show this help text
  -v, --version              Show version information

Environment Variables:
  PORT                       Port to run the server on
  FLOW_NETWORK               Flow network to connect to
  FLOW_ACCESS_NODE           Custom Flow access node URL

Examples:
  npx flow-mcp-server
  npx flow-mcp-server --port 3001
  npx flow-mcp-server --network testnet
  npx flow-mcp-server --stdio
  `);
} 