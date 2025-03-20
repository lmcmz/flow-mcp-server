import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';
import { resolveDomain } from './domain.js';

/**
 * Execute a Cadence script on the Flow blockchain
 * @param {string} script - Cadence script to execute 
 * @param {Array} args - Array of arguments for the script
 * @returns {Promise<object>} - Script execution result
 */
export async function executeScript(script, args = []) {
  try {
    if (!script) {
      throw new Error('Script is required');
    }
    
    // Process and format arguments
    const formattedArgs = await formatArguments(args);
    
    // Execute script with FCL
    const result = await fcl.query({
      cadence: script,
      args: (arg, t) => formattedArgs.map(a => arg(a.value, getFlowType(a.type)))
    });
    
    return {
      result,
      network: fcl.config().get('flow.network')
    };
  } catch (error) {
    console.error("Error executing script:", error);
    throw new Error(`Failed to execute script: ${error.message}`);
  }
}

/**
 * Format arguments for script execution
 * @param {Array} args - Raw arguments to format
 * @returns {Promise<Array>} - Formatted arguments
 */
export async function formatArguments(args) {
  // If args is not an array, make it one
  if (!Array.isArray(args)) {
    args = [];
  }
  
  // Process each argument
  const formattedArgs = [];
  
  for (const arg of args) {
    // If argument is not in the expected format, skip it
    if (!arg || typeof arg !== 'object' || !arg.type) {
      continue;
    }
    
    let value = arg.value;
    
    // If argument is an address, format it properly
    if (arg.type.toLowerCase() === 'address') {
      // If value looks like a domain, resolve it
      if (typeof value === 'string' && (value.includes('.find') || value.includes('.fn'))) {
        const resolved = await resolveDomain(value);
        value = resolved.address;
      }
      
      // Ensure address starts with 0x
      if (typeof value === 'string' && !value.startsWith('0x')) {
        value = `0x${value}`;
      }
    }
    
    formattedArgs.push({
      value,
      type: arg.type
    });
  }
  
  return formattedArgs;
}

/**
 * Get FCL type based on string type name
 * @param {string} typeName - Type name
 * @returns {Object} - FCL type
 */
export function getFlowType(typeName) {
  if (!typeName) {
    return t.String;
  }
  
  const typeNameLower = typeName.toLowerCase();
  
  switch (typeNameLower) {
    case 'address':
      return t.Address;
    case 'string':
      return t.String;
    case 'int':
    case 'int8':
    case 'int16':
    case 'int32':
    case 'int64':
    case 'int128':
    case 'int256':
      return t.Int;
    case 'uint':
    case 'uint8':
    case 'uint16':
    case 'uint32':
    case 'uint64':
    case 'uint128':
    case 'uint256':
      return t.UInt;
    case 'word8':
    case 'word16':
    case 'word32':
    case 'word64':
      return t.Word;
    case 'fix64':
      return t.Fix64;
    case 'ufix64':
      return t.UFix64;
    case 'bool':
    case 'boolean':
      return t.Bool;
    case 'array':
      return t.Array;
    case 'dictionary':
    case 'dict':
      return t.Dictionary;
    case 'optional':
      return t.Optional;
    case 'path':
      return t.Path;
    default:
      return t.String;
  }
}