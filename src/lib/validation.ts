import { isValidAddress } from '@alephium/web3'

/**
 * Validates an Alephium address format
 * @param address - The address to validate
 * @param fieldName - Name of the field for error messages (e.g., "destination address")
 * @throws Error if the address format is invalid
 */
export function validateAlephiumAddress(address: string, fieldName: string = 'address'): void {
  if (!address || typeof address !== 'string') {
    throw new Error(`Invalid ${fieldName}: address must be a non-empty string`)
  }

  if (address.trim() !== address) {
    throw new Error(`Invalid ${fieldName}: address contains leading or trailing whitespace`)
  }

  if (!isValidAddress(address)) {
    throw new Error(`Invalid ${fieldName}: '${address}' is not a valid Alephium address`)
  }
}
