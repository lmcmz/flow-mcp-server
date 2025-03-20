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
      import NonFungibleToken from 0xNonFungibleToken
      
      access(all) fun main(_ address: Address): {String: Int} {
          let account = getAuthAccount<auth(BorrowValue) &Account>(address)
          let data: {String: Int} = {}
          let collectionType: Type = Type<@{NonFungibleToken.Collection}>()

          // Iterate over each public path
          account.storage.forEachStored(fun (path: StoragePath, type: Type): Bool {
              // Return early if the collection is broken or is not the type we're looking for
              if type.isRecovered || (!type.isInstance(collectionType) && !type.isSubtype(of: collectionType)) {
                  return true
              }
              if let collectionRef = account.storage.borrow<&{NonFungibleToken.Collection}>(from: path) {
                  // Return early if no Resolver found in the Collection
                  let ids: [UInt64]= collectionRef.getIDs()
                  data.insert(key: type.identifier, ids.length)
              }
              return true
          })
          return data
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