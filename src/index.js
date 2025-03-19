import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import SSE from 'express-sse';
import dotenv from 'dotenv';

import { handleToolCall } from './tools/handler.js';
import { toolDefinitions } from './tools/definitions.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize SSE for streaming responses
const sse = new SSE();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
app.get('/', (req, res) => {
  res.json({
    name: 'flow-mcp-server',
    version: '0.1.0',
    description: 'Model Context Protocol (MCP) server for Flow blockchain with direct RPC communication',
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
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
  console.log('Running in stdio mode. Use PORT env variable to enable HTTP server.');
  
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', async (data) => {
    try {
      const { tool, parameters } = JSON.parse(data);
      const result = await handleToolCall(tool, parameters);
      process.stdout.write(JSON.stringify({ result }) + '\n');
    } catch (error) {
      process.stdout.write(JSON.stringify({ error: error.message }) + '\n');
    }
  });
} else {
  // Start HTTP server
  app.listen(port, () => {
    console.log(`Flow MCP server listening on port ${port}`);
  });
}

export default app;