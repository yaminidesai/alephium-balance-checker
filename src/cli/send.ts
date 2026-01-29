/**
 * Alephium Send CLI
 *
 * Sends ALPH from one wallet to another on the Alephium testnet.
 *
 * Usage:
 *   npx ts-node src/cli/send.ts <private-key> <destination-address> <amount-in-alph>
 *
 * Arguments:
 *   private-key         - The sender's private key (hex string)
 *   destination-address - The recipient's Alephium address
 *   amount-in-alph      - Amount to send in ALPH (e.g., 1.5)
 *
 * Example:
 *   npx ts-node src/cli/send.ts abc123...def <destination-address> 0.5
 *
 * Note: This CLI uses the Alephium TESTNET. Do not use mainnet private keys.
 */

import { sendAlph } from '../lib'
import { ONE_ALPH } from '@alephium/web3'

async function main() {
  const [privateKey, destinationAddress, amountStr] = process.argv.slice(2)

  // Validate arguments
  if (!privateKey || !destinationAddress || !amountStr) {
    console.error('Error: Missing required arguments')
    console.error('')
    console.error('Usage: npx ts-node src/cli/send.ts <private-key> <destination-address> <amount-in-alph>')
    console.error('')
    console.error('Arguments:')
    console.error('  private-key         - The sender\'s private key (hex string)')
    console.error('  destination-address - The recipient\'s Alephium address')
    console.error('  amount-in-alph      - Amount to send in ALPH (e.g., 1.5)')
    process.exit(1)
  }

  // Parse and validate the amount
  const amountAlph = parseFloat(amountStr)
  if (isNaN(amountAlph) || amountAlph <= 0) {
    console.error('Error: Invalid amount. Please provide a positive number.')
    process.exit(1)
  }

  // Convert ALPH to raw units (1 ALPH = 10^18 units)
  const amountRaw = BigInt(Math.floor(amountAlph * Number(ONE_ALPH)))

  console.log(`Sending ${amountAlph} ALPH to ${destinationAddress}...`)

  try {
    const txId = await sendAlph(
      { privateKey },
      destinationAddress,
      amountRaw
    )

    console.log('Transaction submitted successfully!')
    console.log(`Transaction hash: ${txId}`)
    console.log(`View on explorer: https://testnet.alephium.org/transactions/${txId}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Error sending ALPH:', message)
    process.exit(1)
  }
}

main()
