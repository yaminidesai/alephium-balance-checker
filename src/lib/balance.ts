import { NodeProvider } from '@alephium/web3'
import { validateAlephiumAddress } from './validation'
import { NetworkError } from './errors'
import { getMainnetNodeUrl } from './config'

/**
 * Get the ALPH balance for an address on Alephium mainnet
 * @param address - The Alephium address to check
 * @returns The balance in raw units (1 ALPH = 10^18 units)
 * @throws InvalidAddressError if the address format is invalid
 * @throws NetworkError if the balance fetch fails
 */
export async function getAlphBalance(address: string): Promise<bigint> {
  validateAlephiumAddress(address)

  const nodeProvider = new NodeProvider(getMainnetNodeUrl())

  try {
    const result = await nodeProvider.addresses.getAddressesAddressBalance(address)
    return BigInt(result.balance)
  } catch (error) {
    throw new NetworkError(
      `Failed to fetch balance for address: ${address}`,
      error instanceof Error ? error : undefined
    )
  }
}
