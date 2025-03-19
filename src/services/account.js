import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';
import { resolveDomain } from './domain.js';
import { getFlowBalance } from './balance.js';

/**
 * Get detailed information about a Flow account
 * @param {string} address - Flow address or domain
 * @returns {Promise<object>} - Account information
 */
export async function getAccountInfo(address) {
  try {
    // Check if address is a domain and resolve if needed
    let resolvedDomain = null;
    if (address.includes('.find') || address.includes('.fn')) {
      resolvedDomain = await resolveDomain(address);
      address = resolvedDomain.address;
    }
    
    // Format address with leading 0x if needed
    if (!address.startsWith('0x')) {
      address = `0x${address}`;
    }

    // Get account information from the blockchain
    const account = await fcl.send([fcl.getAccount(address)]).then(fcl.decode);
    
    // Get account balance
    const balanceInfo = await getFlowBalance(address);
    
    // Get account contracts
    const contracts = {};
    for (const [name, contract] of Object.entries(account.contracts || {})) {
      contracts[name] = {
        name,
        source: contract,
        length: contract.length
      };
    }
    
    // Get account keys
    const keys = account.keys.map(key => ({
      index: key.index,
      publicKey: key.publicKey,
      signAlgo: key.signAlgo,
      hashAlgo: key.hashAlgo,
      weight: key.weight,
      sequenceNumber: key.sequenceNumber,
      revoked: key.revoked
    }));
    
    return {
      address: account.address,
      balance: balanceInfo.balance,
      keys: keys,
      contractCount: Object.keys(contracts).length,
      contracts: contracts,
      domain: resolvedDomain ? resolvedDomain.domain : null,
      network: fcl.config().get('flow.network')
    };
  } catch (error) {
    console.error("Error getting account info:", error);
    throw new Error(`Failed to get account info: ${error.message}`);
  }
}

/**
 * Get NFTs owned by a Flow account
 * @param {string} address - Flow address or domain
 * @returns {Promise<object>} - NFT collections owned by the account
 */
export async function getAccountNFTs(address) {
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

    // Script to find public capability paths in the account
    const script = `
      pub fun main(address: Address): [String] {
        let account = getAccount(address)
        let paths: [String] = []
        
        for path in account.capabilities.keys {
          if path.toString().contains("Collection") || path.toString().contains("NFT") {
            paths.append(path.toString())
          }
        }
        
        return paths
      }
    `;

    const paths = await fcl.query({
      cadence: script,
      args: (arg, t) => [arg(address, t.Address)]
    });

    return {
      address,
      nftCollections: paths,
      network: fcl.config().get('flow.network')
    };
  } catch (error) {
    console.error("Error getting account NFTs:", error);
    throw new Error(`Failed to get account NFTs: ${error.message}`);
  }
}