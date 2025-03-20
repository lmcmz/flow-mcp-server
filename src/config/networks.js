// Network configurations for Flow blockchain
export const networks = {
  mainnet: {
    accessNode: 'https://rest-mainnet.onflow.org',
    contracts: {
      NonFungibleToken: '0x1d7e57aa55817448',
      FungibleToken: '0xf233dcee88fe0abe',
      MetadataViews: '0x1d7e57aa55817448',
      NFTCatalog: '0x49a7cda3a1eecc29',
      NFTRetrieval: '0x49a7cda3a1eecc29',
      Find: '0x097bafa4e0b48eef',
      Flowns: '0x233eb012d34b0070',
      Domains: '0x233eb012d34b0070',
      FlowToken: '0x1654653399040a61',
      TransactionGeneration: '0xe52522745adf5c34',
      FlowFees: '0xf919ee77447b7497',
      StringUtils: '0xa340dc0a4ec828ab',
      HybridCustody: '0xd8a7e05a7ac670c0',
      ViewResolver: '0x1d7e57aa55817448',
      EVM: "0xe467b9dd11fa00df"
    },
    auditors: ['0xfd100e39d50a13e6']
  },
  testnet: {
    accessNode: 'https://rest-testnet.onflow.org',
    contracts: {
      NonFungibleToken: '0x631e88ae7f1d7c20',
      FungibleToken: '0x9a0766d93b6608b7',
      MetadataViews: '0x631e88ae7f1d7c20',
      NFTCatalog: '0x324c34e1c517e4db',
      NFTRetrieval: '0x324c34e1c517e4db',
      Find: '0xa16ab1d0abde3625',
      Flowns: '0xb05b2abb42335e88',
      Domains: '0xb05b2abb42335e88',
      FlowToken: '0x7e60df042a9c0868',
      FungibleToken: '0x9a0766d93b6608b7',
      TransactionGeneration: '0x830c495357676f8b',
      FlowFees: '0x912d5440f7e3769e',
      StringUtils: '0x31ad40c07a2a9788',
      HybridCustody: '0x294e44e1ec6993c6',
      ViewResolver: '0x631e88ae7f1d7c20',
      EVM: '0x8c5303eaa26202d6'
    },
    auditors: ['0xf78bfc12d0a786dc']
  }
}; 