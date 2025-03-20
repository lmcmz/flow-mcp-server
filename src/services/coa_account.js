import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';
import { resolveDomain } from './domain.js';

/**
 * Find Cadence Owned Accounts (COA) associated with Flow-EVM addresses
 * @param {string} address - Flow address or domain
 * @returns {Promise<object>} - COA account information for EVM integration
 */
export async function findCadenceOwnedAccounts(address) {
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

    // Simple script to just check for presence of COA
    const script = `
      import EVM from 0xEVM

      access(all) fun main(flowAddress: Address): String? {
          return getAuthAccount<auth(BorrowValue) &Account>(flowAddress)
              .storage.borrow<&EVM.CadenceOwnedAccount>(from: /storage/evm)
              ?.address()
              ?.toString()
              ?? nil
      }
    `;

    const evmAddress = await fcl.query({
      cadence: script,
      args: (arg, t) => [arg(address, t.Address)]
    });

    // Build response based on whether an EVM address was found
    return {
      address,
      hasCOA: evmAddress !== null,
      evmAddress: evmAddress || null,
      network: fcl.config().get('flow.network')
    };
  } catch (error) {
    console.error("Error finding Cadence Owned Accounts:", error);
    throw new Error(`Failed to find Cadence Owned Accounts: ${error.message}`);
  }
} 