import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';

// Import tool implementations
import { getFlowBalance } from '../services/balance.js';
import { getTokenBalance } from '../services/balance.js';
import { getTokenBalancesFromStorage } from '../services/token_storage.js';
import { findCadenceOwnedAccounts } from '../services/coa_account.js';
import { executeScript } from '../services/script.js';
import { sendTransaction } from '../services/transaction.js';
import { resolveDomain } from '../services/domain.js';
import { getAccountInfo, getAccountNFTs } from '../services/account.js';

// Import network configurations
import { networks } from '../config/networks.js';

// Configure FCL based on environment
const configureNetwork = (network = 'mainnet') => {
  network = network.toLowerCase();
  
  if (!networks[network]) {
    throw new Error(`Unsupported network: ${network}`);
  }
  
  const networkConfig = networks[network];
  const fclConfig = fcl.config()
    .put('accessNode.api', networkConfig.accessNode)
    .put('flow.network', network);
  
  // Configure contract addresses
  for (const [name, address] of Object.entries(networkConfig.contracts)) {
    fclConfig.put(`0x${name}`, address);
  }
  
  // Configure auditors if available
  if (networkConfig.auditors && networkConfig.auditors.length > 0) {
    fclConfig.put('flow.auditors', networkConfig.auditors);
  }
  
  return fclConfig;
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
        
      case 'get_token_balances_storage':
        result = await getTokenBalancesFromStorage(parameters.address);
        break;
        
      case 'find_coa_accounts':
        result = await findCadenceOwnedAccounts(parameters.address);
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
        
      case 'get_account_nfts':
        result = await getAccountNFTs(parameters.address);
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