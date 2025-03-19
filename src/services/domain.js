import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';

/**
 * Resolve a Flow domain (.find or .fn) to a Flow address
 * @param {string} domain - Domain name (e.g., 'user.find' or 'user.fn')
 * @returns {Promise<object>} - Resolution result with address
 */
export async function resolveDomain(domain) {
  try {
    if (!domain) {
      throw new Error('Domain is required');
    }
    
    // Determine if it's a .find or .fn domain
    const isDotFind = domain.toLowerCase().endsWith('.find');
    const isDotFn = domain.toLowerCase().endsWith('.fn');
    
    if (!isDotFind && !isDotFn) {
      throw new Error('Unsupported domain type. Only .find and .fn domains are supported');
    }
    
    let address;
    
    if (isDotFind) {
      address = await resolveDotFindDomain(domain);
    } else if (isDotFn) {
      address = await resolveDotFnDomain(domain);
    }
    
    return {
      domain,
      address,
      network: fcl.config().get('flow.network')
    };
  } catch (error) {
    console.error("Error resolving domain:", error);
    throw new Error(`Failed to resolve domain ${domain}: ${error.message}`);
  }
}

/**
 * Resolve a .find domain to a Flow address
 * @param {string} domain - .find domain to resolve
 * @returns {Promise<string>} - Flow address
 */
async function resolveDotFindDomain(domain) {
  // FIND contracts are deployed at different addresses on each network
  let findContractAddress;
  const network = fcl.config().get('flow.network');
  
  if (network === 'mainnet') {
    findContractAddress = '0x097bafa4e0b48eef';
  } else if (network === 'testnet') {
    findContractAddress = '0x35717efbbce11c74';
  } else {
    throw new Error(`FIND is not supported on network: ${network}`);
  }
  
  // Extract name without .find suffix
  const name = domain.toLowerCase().replace('.find', '');
  
  const script = `
    import FIND from 0x${findContractAddress}
    
    pub fun main(name: String): Address? {
      return FIND.lookupAddress(name)
    }
  `;
  
  const result = await fcl.query({
    cadence: script,
    args: (arg, t) => [arg(name, t.String)]
  });
  
  if (!result) {
    throw new Error(`Domain ${domain} not found`);
  }
  
  return result;
}

/**
 * Resolve a .fn domain to a Flow address
 * @param {string} domain - .fn domain to resolve
 * @returns {Promise<string>} - Flow address
 */
async function resolveDotFnDomain(domain) {
  // Flowns contracts are deployed at different addresses on each network
  let flownsRegistryAddress;
  const network = fcl.config().get('flow.network');
  
  if (network === 'mainnet') {
    flownsRegistryAddress = '0x233eb012d34b0070';
  } else if (network === 'testnet') {
    flownsRegistryAddress = '0x95e019a17d0e23d7';
  } else {
    throw new Error(`Flowns is not supported on network: ${network}`);
  }
  
  // Extract name without .fn suffix
  const name = domain.toLowerCase().replace('.fn', '');
  
  const script = `
    import Flowns from 0x${flownsRegistryAddress}
    import Domains from 0x${flownsRegistryAddress}
    
    pub fun main(name: String): Address? {
      let prefix = "fn"
      let nameHash = Flowns.hash(name: name, tld: prefix)
      
      if let domain = Domains.getDomainRecord(nameHash: nameHash) {
        return domain.owner?.address
      }
      
      return nil
    }
  `;
  
  const result = await fcl.query({
    cadence: script,
    args: (arg, t) => [arg(name, t.String)]
  });
  
  if (!result) {
    throw new Error(`Domain ${domain} not found`);
  }
  
  return result;
}