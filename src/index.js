import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import SSE from 'express-sse';
import dotenv from 'dotenv';
import * as fcl from '@onflow/fcl';

import { handleToolCall } from './tools/handler.js';
import { toolDefinitions } from './tools/definitions.js';

// Load environment variables
dotenv.config();

// Configure FCL based on environment variables
const network = process.env.FLOW_NETWORK || 'mainnet';
const accessNode = process.env.FLOW_ACCESS_NODE || (
  network === 'testnet' 
    ? 'https://rest-testnet.onflow.org' 
    : 'https://rest-mainnet.onflow.org'
);

fcl.config()
  .put('accessNode.api', accessNode)
  .put('flow.network', network);

console.error(`Flow network configured: ${network} (${accessNode})`);

// Initialize Express app and SSE
const app = express();
const port = process.env.PORT || 3000;
const sse = new SSE();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
app.get('/', (req, res) => {
  res.json({
    name: '@outblock/flow-mcp-server',
    version: '0.1.0',
    description: 'Model Context Protocol (MCP) server for Flow blockchain with direct RPC communication',
    network: fcl.config().get('flow.network')
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    network: fcl.config().get('flow.network')
  });
});

// SSE endpoint
app.get('/sse', (req, res) => {
  sse.init(req, res);
});

// MCP messages endpoint
app.post('/messages', async (req, res) => {
  const { tool, parameters } = req.body;
  
  if (!tool) {
    return res.status(400).json({ error: 'Tool name is required' });
  }
  
  try {
    const result = await handleToolCall(tool, parameters, sse);
    res.json({ result });
  } catch (error) {
    console.error('Error handling tool call:', error);
    res.status(500).json({ error: error.message });
  }
});

// MCP tools metadata endpoint
app.get('/tools', (req, res) => {
  res.json(toolDefinitions);
});

// Handle stdio mode if no PORT is set
if (!process.env.PORT) {
  console.error('Running in stdio mode. Use PORT env variable to enable HTTP server.');
  
  process.stdin.setEncoding('utf8');
  
  // Send tool definitions as first message to help AI know what tools are available
  process.stdout.write(JSON.stringify({ 
    event: 'init', 
    tools: toolDefinitions,
    network: fcl.config().get('flow.network')
  }) + '\\n');
  
  process.stdin.on('data', async (data) => {
    let parsed;
    try {
      parsed = JSON.parse(data);
    } catch (error) {
      process.stdout.write(JSON.stringify({ 
        error: 'Invalid JSON input', 
        details: error.message 
      }) + '\\n');
      return;
    }
    
    const { tool, parameters } = parsed;
    
    if (!tool) {
      process.stdout.write(JSON.stringify({ 
        error: 'Tool name is required'
      }) + '\\n');
      return;
    }
    
    try {
      const result = await handleToolCall(tool, parameters);
      process.stdout.write(JSON.stringify({ result }) + '\\n');
    } catch (error) {
      console.error('Error handling tool call:', error);
      process.stdout.write(JSON.stringify({ 
        error: error.message,
        stack: error.stack
      }) + '\\n');
    }
  });
  
  // Handle SIGTERM and SIGINT
  process.on('SIGTERM', () => {
    console.error('Received SIGTERM, shutting down...');
    process.exit(0);
  });
  
  process.on('SIGINT', () => {
    console.error('Received SIGINT, shutting down...');
    process.exit(0);
  });
} else {
  // Start HTTP server
  app.listen(port, () => {
    console.error(`Flow MCP server listening on port ${port}`);
    console.error(`Running on network: ${fcl.config().get('flow.network')}`);
  });
}

export default app;