import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';
import { resolveDomain } from './domain.js';

/**
 * Get all token balances from storage for an address
 * @param {string} address - Flow address or domain
 * @returns {Promise<object>} - All token balances
 */
export async function getTokenBalancesFromStorage(address) {
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

    // Script based on FRW-web-next, optimized for Cadence 1.0
    const script = `
      import FungibleToken from 0xFungibleToken

      /// Queries for FT.Vault balance of all FT.Vaults in the specified account.
      ///
      access(all) fun main(address: Address): {String: UFix64} {
        // Get the account
        let account = getAuthAccount<auth(BorrowValue) &Account>(address)
        // Init for return value
        let balances: {String: UFix64} = {}
        // Track seen Types in array
        let seen: [String] = []
        // Assign the type we'll need
        let vaultType: Type = Type<@{FungibleToken.Vault}>()
        // Iterate over all stored items & get the path if the type is what we're looking for
        account.storage.forEachStored(fun (path: StoragePath, type: Type): Bool {
          if !type.isRecovered && (type.isInstance(vaultType) || type.isSubtype(of: vaultType)) {
            // Get a reference to the resource & its balance
            let vaultRef = account.storage.borrow<&{FungibleToken.Balance}>(from: path)!
            // Insert a new values if it's the first time we've seen the type
            if !seen.contains(type.identifier) {
              balances.insert(key: type.identifier, vaultRef.balance)
              seen.append(type.identifier)
            } else {
              // Otherwise just update the balance of the vault
              balances[type.identifier] = balances[type.identifier]! + vaultRef.balance
            }
          }
          return true
        })

        // Add available Flow Token Balance
        balances.insert(key: "availableFlowToken", account.availableBalance)

        return balances
      }
    `;

    const balances = await fcl.query({
      cadence: script,
      args: (arg, t) => [arg(address, t.Address)]
    });

    return {
      address,
      balances,
      network: fcl.config().get('flow.network')
    };
  } catch (error) {
    console.error("Error getting token balances from storage:", error);
    throw new Error(`Failed to get token balances from storage: ${error.message}`);
  }
} 