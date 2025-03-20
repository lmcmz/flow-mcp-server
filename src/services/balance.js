import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';
import { resolveDomain } from './domain.js';
import { getTokenBalancesFromStorage } from './token_storage.js';

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

    // Updated Cadence script based on FRW-web-next
    const script = `
      import FungibleToken from 0xf233dcee88fe0abe
      import FlowToken from 0x1654653399040a61

      access(all) fun main(address: Address): UFix64 {
        let account = getAccount(address)
        let vaultRef = account.capabilities.borrow<&{FungibleToken.Balance}>(/public/flowTokenBalance)
        ?? nil

        if vaultRef != nil {
          return vaultRef!.balance
        }
        
        return 0.0
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

    // Use getTokenBalancesFromStorage to get all token balances
    const allBalances = await getTokenBalancesFromStorage(address);
    
    // Look for the specific token in the results
    let balance = "0.0";
    if (allBalances && allBalances.balances) {
      // The token ID in storage typically matches the tokenIdentifier format without the last part (Vault)
      if (tokenIdentifier in allBalances.balances) {
        balance = allBalances.balances[tokenIdentifier];
      }
    }

    let tokenInfo = {
      symbol: contractName,
      name: contractName
    };
    
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