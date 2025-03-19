import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';

// Import tool implementations
import { getFlowBalance } from '../services/balance.js';
import { getTokenBalance } from '../services/balance.js';
import { executeScript } from '../services/script.js';
import { sendTransaction } from '../services/transaction.js';
import { resolveDomain } from '../services/domain.js';
import { getAccountInfo } from '../services/account.js';

// Configure FCL based on environment
const configureNetwork = (network = 'mainnet') => {
  network = network.toLowerCase();
  
  if (network === 'testnet') {
    fcl.config()
      .put('accessNode.api', 'https://rest-testnet.onflow.org')
      .put('flow.network', 'testnet');
  } else if (network === 'mainnet') {
    fcl.config()
      .put('accessNode.api', 'https://rest-mainnet.onflow.org')
      .put('flow.network', 'mainnet');
  } else {
    throw new Error(`Unsupported network: ${network}`);
  }
};

/**
 * Handles MCP tool calls and routes them to appropriate implementations
 * @param {string} toolName - The name of the tool to call
 * @param {object} parameters - The parameters for the tool
 * @param {object} sse - Optional SSE instance for streaming responses
 * @returns {Promise<object>} - The result of the tool call
 */
export async function handleToolCall(toolName, parameters, sse) {
  // Configure network based on parameters
  const network = parameters?.network || 'mainnet';
  configureNetwork(network);
  
  // Emit start event if SSE is available
  if (sse) {
    sse.send({ event: 'start', tool: toolName });
  }
  
  try {
    let result;
    
    switch (toolName) {
      case 'get_flow_balance':
        result = await getFlowBalance(parameters.address);
        break;
        
      case 'get_token_balance':
        result = await getTokenBalance(
          parameters.address, 
          parameters.tokenIdentifier
        );
        break;
        
      case 'execute_script':
        result = await executeScript(
          parameters.script, 
          parameters.arguments || []
        );
        break;
        
      case 'send_transaction':
        result = await sendTransaction(
          parameters.transaction,
          parameters.signerAddress,
          parameters.signerPrivateKey,
          parameters.arguments || [],
          parameters.gasLimit || 1000
        );
        break;
        
      case 'resolve_domain':
        result = await resolveDomain(parameters.domain);
        break;
        
      case 'get_account_info':
        result = await getAccountInfo(parameters.address);
        break;
        
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
    
    // Emit success event if SSE is available
    if (sse) {
      sse.send({ event: 'success', tool: toolName, result });
    }
    
    return result;
  } catch (error) {
    // Emit error event if SSE is available
    if (sse) {
      sse.send({ event: 'error', tool: toolName, error: error.message });
    }
    
    throw error;
  }
}