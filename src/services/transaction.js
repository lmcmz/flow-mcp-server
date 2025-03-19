import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';
import { resolveDomain } from './domain.js';
import { formatArguments, getFlowType } from './script.js';

/**
 * Send a transaction to the Flow blockchain
 * @param {string} transaction - Cadence transaction code
 * @param {string} signerAddress - Address of the transaction signer
 * @param {string} signerPrivateKey - Private key of the transaction signer
 * @param {Array} args - Transaction arguments
 * @param {number} gasLimit - Gas limit for the transaction
 * @returns {Promise<object>} - Transaction result
 */
export async function sendTransaction(
  transaction, 
  signerAddress, 
  signerPrivateKey, 
  args = [], 
  gasLimit = 1000
) {
  try {
    if (!transaction) {
      throw new Error('Transaction code is required');
    }
    
    if (!signerAddress) {
      throw new Error('Signer address is required');
    }
    
    if (!signerPrivateKey) {
      throw new Error('Signer private key is required');
    }
    
    // Resolve domain to address if needed
    if (signerAddress.includes('.find') || signerAddress.includes('.fn')) {
      const resolved = await resolveDomain(signerAddress);
      signerAddress = resolved.address;
    }
    
    // Ensure address starts with 0x
    if (!signerAddress.startsWith('0x')) {
      signerAddress = `0x${signerAddress}`;
    }
    
    // Process and format arguments
    const formattedArgs = await formatArguments(args);
    
    // Configure transaction authorization
    const authz = fcl.authz({
      keyId: 0, // Assuming index 0 key
      addr: signerAddress,
      signingFunction: async (signable) => {
        // This function signs the transaction with the provided private key
        // In a production environment, consider using a more secure key management solution
        const signature = await signWithPrivateKey(signerPrivateKey, signable.message);
        return {
          addr: signerAddress,
          keyId: 0,
          signature
        };
      }
    });
    
    // Send transaction
    const transactionId = await fcl.send([
      fcl.transaction(transaction),
      fcl.args(formattedArgs.map(a => fcl.arg(a.value, getFlowType(a.type)))),
      fcl.limit(gasLimit),
      fcl.proposer(authz),
      fcl.payer(authz),
      fcl.authorizations([authz])
    ]);
    
    // Wait for transaction to be sealed
    const result = await fcl.tx(transactionId).onceSealed();
    
    return {
      transactionId: result.transactionId,
      status: result.status === 4 ? 'SEALED' : 'PENDING',
      statusCode: result.status,
      events: result.events,
      network: fcl.config().get('flow.network')
    };
  } catch (error) {
    console.error("Error sending transaction:", error);
    throw new Error(`Failed to send transaction: ${error.message}`);
  }
}

/**
 * Sign a message with a private key
 * @param {string} privateKey - Private key in hex format
 * @param {string} message - Message to sign
 * @returns {Promise<string>} - Signature in hex format
 */
async function signWithPrivateKey(privateKey, message) {
  try {
    // Remove '0x' prefix if present
    if (privateKey.startsWith('0x')) {
      privateKey = privateKey.substring(2);
    }
    
    // In a real implementation, we would use a proper cryptographic library
    // For this prototype, we'll use a placeholder function
    // TODO: Implement actual signing logic
    
    // This is a simplified implementation and should be replaced with actual signing logic
    // const signature = await crypto.sign(privateKey, message);
    
    // For demonstration purposes only - this is not a real implementation
    const signature = "SIMULATED_SIGNATURE";
    
    console.warn("SECURITY WARNING: Using simulated signature. Implement proper signing logic for production use.");
    
    return signature;
  } catch (error) {
    console.error("Error signing message:", error);
    throw new Error(`Failed to sign message: ${error.message}`);
  }
}