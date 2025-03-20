import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';
import { formatArguments, getFlowType } from './script.js';
import { resolveDomain } from './domain.js';

/**
 * Send a transaction to the Flow blockchain
 * @param {Object} params - Transaction parameters
 * @param {string} params.transaction - Cadence transaction script
 * @param {Array} params.args - Transaction arguments
 * @param {string} params.signerId - Signer address (optional)
 * @param {string} params.authorization - Optional authorization function name or code
 * @returns {Promise<Object>} - Transaction result
 */
export async function sendTransaction({ transaction, args = [], signerId, authorization }) {
  try {
    if (!transaction) {
      throw new Error('Transaction script is required');
    }
    
    // Process and format arguments
    const formattedArgs = await formatArguments(args);
    
    // Set up transaction options
    const txOptions = {
      cadence: transaction,
      args: (arg, t) => formattedArgs.map(a => arg(a.value, getFlowType(a.type))),
      proposer: fcl.authz,
      payer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 1000
    };
    
    // If a specific signer is provided, resolve domain if needed
    if (signerId) {
      let address = signerId;
      
      // If value looks like a domain, resolve it
      if (typeof address === 'string' && (address.includes('.find') || address.includes('.fn'))) {
        const resolved = await resolveDomain(address);
        address = resolved.address;
      }
      
      // Ensure address starts with 0x
      if (typeof address === 'string' && !address.startsWith('0x')) {
        address = `0x${address}`;
      }
      
      // Use the address for signing
      // Note: In a production environment, you would likely integrate
      // with a proper signing service. This is a simplified implementation.
      txOptions.proposer = fcl.currentUser().authorization;
      txOptions.payer = fcl.currentUser().authorization;
      txOptions.authorizations = [fcl.currentUser().authorization];
    }
    
    // Send transaction
    const transactionId = await fcl.send([
      fcl.transaction(txOptions.cadence),
      fcl.args(txOptions.args),
      fcl.proposer(txOptions.proposer),
      fcl.payer(txOptions.payer),
      fcl.authorizations(txOptions.authorizations),
      fcl.limit(txOptions.limit),
    ]).then(fcl.decode);
    
    // Wait for transaction to be sealed
    const txResult = await fcl.tx(transactionId).onceSealed();
    
    return {
      transactionId,
      result: txResult,
      network: fcl.config().get('flow.network')
    };
  } catch (error) {
    console.error("Error sending transaction:", error);
    throw new Error(`Failed to send transaction: ${error.message}`);
  }
}

/**
 * Get a transaction by its ID
 * @param {string} transactionId - Transaction ID
 * @returns {Promise<Object>} - Transaction details
 */
export async function getTransaction(transactionId) {
  try {
    if (!transactionId) {
      throw new Error('Transaction ID is required');
    }
    
    // Ensure transaction ID starts with 0x if it's a string
    if (typeof transactionId === 'string' && !transactionId.startsWith('0x')) {
      transactionId = `0x${transactionId}`;
    }
    
    // Get transaction from FCL
    const txResult = await fcl.tx(transactionId).onceSealed();
    
    return {
      transactionId,
      result: txResult,
      network: fcl.config().get('flow.network')
    };
  } catch (error) {
    console.error("Error getting transaction:", error);
    throw new Error(`Failed to get transaction: ${error.message}`);
  }
}