/**
 * Configuration for Alephium node URLs
 * URLs can be overridden via environment variables
 */

const DEFAULT_MAINNET_NODE_URL = 'https://node.mainnet.alephium.org'
const DEFAULT_TESTNET_NODE_URL = 'https://node.testnet.alephium.org'

/**
 * Get the mainnet node URL
 * Override with ALEPHIUM_MAINNET_NODE_URL environment variable
 */
export function getMainnetNodeUrl(): string {
  return process.env.ALEPHIUM_MAINNET_NODE_URL || DEFAULT_MAINNET_NODE_URL
}

/**
 * Get the testnet node URL
 * Override with ALEPHIUM_TESTNET_NODE_URL environment variable
 */
export function getTestnetNodeUrl(): string {
  return process.env.ALEPHIUM_TESTNET_NODE_URL || DEFAULT_TESTNET_NODE_URL
}
