// Tool definitions following MCP specification format

export const toolDefinitions = [
  {
    name: "get_flow_balance",
    description: "Get the FLOW token balance for a Flow address",
    parameters: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description: "The Flow address to check (e.g., '0x1234...' or 'user.find')"
        },
        network: {
          type: "string", 
          description: "Network name (e.g., 'mainnet', 'testnet'). Defaults to mainnet."
        }
      },
      required: ["address"]
    }
  },
  
  {
    name: "get_token_balance",
    description: "Get the balance of a specific token for a Flow address",
    parameters: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description: "The Flow address to check (e.g., '0x1234...' or 'user.find')"
        },
        tokenIdentifier: {
          type: "string",
          description: "The identifier of the token (e.g., 'A.1654653399040a61.FlowToken.Vault', 'A.3c5959b568896393.FUSD.Vault')"
        },
        network: {
          type: "string", 
          description: "Network name (e.g., 'mainnet', 'testnet'). Defaults to mainnet."
        }
      },
      required: ["address", "tokenIdentifier"]
    }
  },
  
  {
    name: "get_token_balances_storage",
    description: "Get all token balances from storage for a Flow address",
    parameters: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description: "The Flow address to check (e.g., '0x1234...' or 'user.find')"
        },
        network: {
          type: "string", 
          description: "Network name (e.g., 'mainnet', 'testnet'). Defaults to mainnet."
        }
      },
      required: ["address"]
    }
  },
  
  {
    name: "execute_script",
    description: "Execute a Cadence script on the Flow blockchain",
    parameters: {
      type: "object",
      properties: {
        script: {
          type: "string",
          description: "The Cadence script to execute"
        },
        arguments: {
          type: "array",
          description: "Array of arguments to pass to the script",
          items: {
            type: "object",
            properties: {
              value: {
                type: "string",
                description: "The value of the argument"
              },
              type: {
                type: "string",
                description: "The type of the argument (e.g., 'Address', 'String', 'UInt64')"
              }
            },
            required: ["value", "type"]
          }
        },
        network: {
          type: "string", 
          description: "Network name (e.g., 'mainnet', 'testnet'). Defaults to mainnet."
        }
      },
      required: ["script"]
    }
  },
  
  {
    name: "resolve_domain",
    description: "Resolve a Flow domain (.find or .fn) to a Flow address",
    parameters: {
      type: "object",
      properties: {
        domain: {
          type: "string",
          description: "The domain to resolve (e.g., 'user.find' or 'user.fn')"
        },
        network: {
          type: "string", 
          description: "Network name (e.g., 'mainnet', 'testnet'). Defaults to mainnet."
        }
      },
      required: ["domain"]
    }
  },
  
  {
    name: "send_transaction",
    description: "Send a signed transaction to the Flow blockchain",
    parameters: {
      type: "object",
      properties: {
        transaction: {
          type: "string",
          description: "The Cadence transaction code"
        },
        arguments: {
          type: "array",
          description: "Array of arguments to pass to the transaction",
          items: {
            type: "object",
            properties: {
              value: {
                type: "string",
                description: "The value of the argument"
              },
              type: {
                type: "string",
                description: "The type of the argument (e.g., 'Address', 'String', 'UInt64')"
              }
            },
            required: ["value", "type"]
          }
        },
        signerPrivateKey: {
          type: "string",
          description: "The private key of the transaction signer. SECURITY: This is used only for transaction signing and is not stored."
        },
        signerAddress: {
          type: "string",
          description: "The Flow address of the transaction signer"
        },
        network: {
          type: "string", 
          description: "Network name (e.g., 'mainnet', 'testnet'). Defaults to mainnet."
        },
        gasLimit: {
          type: "number",
          description: "Optional gas limit for the transaction. Defaults to 1000."
        }
      },
      required: ["transaction", "signerPrivateKey", "signerAddress"]
    }
  },
  
  {
    name: "get_account_info",
    description: "Get detailed information about a Flow account",
    parameters: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description: "The Flow address to check (e.g., '0x1234...' or 'user.find')"
        },
        network: {
          type: "string", 
          description: "Network name (e.g., 'mainnet', 'testnet'). Defaults to mainnet."
        }
      },
      required: ["address"]
    }
  },
  
  {
    name: "find_coa_accounts",
    description: "Find Cadence Owned Accounts (COA) associated with Flow-EVM addresses",
    parameters: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description: "The Flow address to check for associated Cadence Owned Accounts (COA) for EVM integration"
        },
        network: {
          type: "string", 
          description: "Network name (e.g., 'mainnet', 'testnet'). Defaults to mainnet."
        }
      },
      required: ["address"]
    }
  },
  
  {
    name: "get_account_nfts",
    description: "Get NFT collections owned by a Flow account",
    parameters: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description: "The Flow address to check (e.g., '0x1234...' or 'user.find')"
        },
        network: {
          type: "string", 
          description: "Network name (e.g., 'mainnet', 'testnet'). Defaults to mainnet."
        }
      },
      required: ["address"]
    }
  }
];