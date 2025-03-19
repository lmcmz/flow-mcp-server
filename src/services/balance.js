import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';
import { resolveDomain } from './domain.js';

/**
 * Get FLOW token balance for an address
 * @param {string} address - Flow address or domain
 * @returns {Promise<object>} - Balance information
 */
export async function getFlowBalance(address) {
  try {
    // Check if address is a domain and resolve if needed
    if (address.includes('.find') || address.includes('.fn')) {
      const resolved = await resolveDomain(address);
      address = resolved.address;
    }
    
    // Format address with leading 0x if needed
    if (!address.startsWith('0x')) {
      address = `0x${address}`;
    }

    // Cadence script to get account balance
    const script = `
      import FlowToken from 0x1654653399040a61
      import FungibleToken from 0xf233dcee88fe0abe
      
      pub fun main(address: Address): UFix64 {
        let account = getAccount(address)
        let vaultRef = account.getCapability(/public/flowTokenBalance)
          .borrow<&FlowToken.Vault{FungibleToken.Balance}>()
          
        if vaultRef == nil {
          return 0.0
        }
        
        return vaultRef!.balance
      }
    `;

    const balance = await fcl.query({
      cadence: script,
      args: (arg, t) => [arg(address, t.Address)]
    });

    return {
      address,
      token: "FLOW",
      balance: balance.toString(),
      formattedBalance: balance.toString(),
      network: fcl.config().get('flow.network')
    };
  } catch (error) {
    console.error("Error getting FLOW balance:", error);
    throw new Error(`Failed to get FLOW balance: ${error.message}`);
  }
}

/**
 * Get balance of a specific token for an address
 * @param {string} address - Flow address or domain
 * @param {string} tokenIdentifier - Token identifier (e.g., 'A.1654653399040a61.FlowToken.Vault')
 * @returns {Promise<object>} - Token balance information
 */
export async function getTokenBalance(address, tokenIdentifier) {
  try {
    // Check if address is a domain and resolve if needed
    if (address.includes('.find') || address.includes('.fn')) {
      const resolved = await resolveDomain(address);
      address = resolved.address;
    }
    
    // Format address with leading 0x if needed
    if (!address.startsWith('0x')) {
      address = `0x${address}`;
    }

    // Parse token identifier parts
    const parts = tokenIdentifier.split('.');
    if (parts.length < 4) {
      throw new Error('Invalid token identifier format. Expected format: A.contractAddress.ContractName.ResourceName');
    }

    const contractAddress = parts[1];
    const contractName = parts[2];
    const resourceName = parts[3];

    // Construct public path for the token
    // This is a common pattern but may need adjustment for specific tokens
    const publicPath = `/public/${contractName.toLowerCase()}Balance`;

    // Create a Cadence script to fetch the token balance
    const script = `
      import ${contractName} from 0x${contractAddress}
      import FungibleToken from 0xf233dcee88fe0abe
      
      pub fun main(address: Address, publicPath: String): UFix64 {
        let account = getAccount(address)
        let vaultRef = account.getCapability(publicPath)
          .borrow<&${contractName}.Vault{FungibleToken.Balance}>()
          
        if vaultRef == nil {
          return 0.0
        }
        
        return vaultRef!.balance
      }
    `;

    const balance = await fcl.query({
      cadence: script,
      args: (arg, t) => [
        arg(address, t.Address),
        arg(publicPath, t.String)
      ]
    });

    // Get token metadata if available
    let tokenInfo = {
      symbol: contractName,
      name: contractName
    };
    
    try {
      // Try to get token metadata if available
      const metadataScript = `
        import ${contractName} from 0x${contractAddress}
        
        pub fun main(): {String: String} {
          let metadata: {String: String} = {}
          
          if ${contractName}.getVersion() != nil {
            metadata["version"] = ${contractName}.getVersion()!
          }
          
          if ${contractName}.getSymbol() != nil {
            metadata["symbol"] = ${contractName}.getSymbol()!
          }
          
          if ${contractName}.getName() != nil {
            metadata["name"] = ${contractName}.getName()!
          }
          
          return metadata
        }
      `;
      
      const metadata = await fcl.query({
        cadence: metadataScript,
        args: (arg, t) => []
      });
      
      if (metadata.symbol) {
        tokenInfo.symbol = metadata.symbol;
      }
      
      if (metadata.name) {
        tokenInfo.name = metadata.name;
      }
    } catch (error) {
      // If metadata can't be fetched, continue with default values
      console.warn("Could not fetch token metadata:", error.message);
    }

    return {
      address,
      tokenIdentifier,
      tokenInfo,
      balance: balance.toString(),
      formattedBalance: balance.toString(),
      network: fcl.config().get('flow.network')
    };
  } catch (error) {
    console.error("Error getting token balance:", error);
    throw new Error(`Failed to get ${tokenIdentifier} balance: ${error.message}`);
  }
}