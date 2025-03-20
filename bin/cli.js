#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Calculate the project root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('stdio', {
    type: 'boolean',
    describe: 'Run in stdio mode (for AI agent integration)',
    default: false
  })
  .option('port', {
    type: 'number',
    describe: 'HTTP server port',
    default: process.env.PORT || 3000
  })
  .option('network', {
    type: 'string',
    describe: 'Flow network to use (mainnet, testnet)',
    default: process.env.FLOW_NETWORK || 'mainnet'
  })
  .help()
  .alias('help', 'h')
  .version()
  .alias('version', 'v')
  .parse();

// If running in stdio mode, unset PORT to prevent HTTP server from starting
if (argv.stdio) {
  delete process.env.PORT;
  console.error('Starting Flow MCP server in stdio mode...');
} else {
  // Set PORT for HTTP server
  process.env.PORT = argv.port;
  console.error(`Starting Flow MCP server on port ${argv.port}...`);
}

// Set network configuration
process.env.FLOW_NETWORK = argv.network;

// Import and run the server
try {
  const { default: app } = await import('../src/index.js');
  
  if (!argv.stdio) {
    console.error(`Flow MCP server running on network: ${argv.network}`);
    console.error(`HTTP server available at: http://localhost:${argv.port}`);
  }
} catch (error) {
  console.error('Failed to start Flow MCP server:', error);
  process.exit(1);
}