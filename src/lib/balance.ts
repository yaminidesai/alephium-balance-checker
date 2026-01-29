import { NodeProvider } from '@alephium/web3'

const MAINNET_NODE_URL = 'https://node.mainnet.alephium.org'

/**
 * Get the ALPH balance for an address on Alephium mainnet
 * @param address - The Alephium address to check
 * @returns The balance in raw units (1 ALPH = 10^18 units)
 */
export async function getAlphBalance(address: string): Promise<bigint> {
  const nodeProvider = new NodeProvider(MAINNET_NODE_URL)
  const result = await nodeProvider.addresses.getAddressesAddressBalance(address)
  return BigInt(result.balance)
}
