/**
 * Alephium Send CLI
 *
 * Sends ALPH from one wallet to another on the Alephium testnet.
 *
 * Usage:
 *   npx ts-node src/cli/send.ts <private-key> <destination-address> <amount-in-alph> [--dry-run]
 *
 * Arguments:
 *   private-key         - The sender's private key (hex string)
 *   destination-address - The recipient's Alephium address
 *   amount-in-alph      - Amount to send in ALPH (e.g., 1.5)
 *
 * Options:
 *   --dry-run           - Build transaction without submitting (preview mode)
 *
 * Example:
 *   npx ts-node src/cli/send.ts abc123...def <destination-address> 0.5
 *   npx ts-node src/cli/send.ts abc123...def <destination-address> 0.5 --dry-run
 *
 * Note: This CLI uses the Alephium TESTNET. Do not use mainnet private keys.
 */

import {
  sendAlph,
  DryRunResult,
  InvalidAddressError,
  InvalidAmountError,
  TransactionError
} from '../lib'
import { ONE_ALPH } from '@alephium/web3'

function isDryRunResult(result: string | DryRunResult): result is DryRunResult {
  return typeof result === 'object' && 'unsignedTx' in result
}

async function main() {
  const args = process.argv.slice(2)

  // Check for --dry-run flag
  const dryRunIndex = args.indexOf('--dry-run')
  const dryRun = dryRunIndex !== -1
  if (dryRun) {
    args.splice(dryRunIndex, 1)
  }

  const [privateKey, destinationAddress, amountStr] = args

  // Validate arguments
  if (!privateKey || !destinationAddress || !amountStr) {
    console.error('Error: Missing required arguments')
    console.error('')
    console.error('Usage: npx ts-node src/cli/send.ts <private-key> <destination-address> <amount-in-alph> [--dry-run]')
    console.error('')
    console.error('Arguments:')
    console.error('  private-key         - The sender\'s private key (hex string)')
    console.error('  destination-address - The recipient\'s Alephium address')
    console.error('  amount-in-alph      - Amount to send in ALPH (e.g., 1.5)')
    console.error('')
    console.error('Options:')
    console.error('  --dry-run           - Build transaction without submitting (preview mode)')
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

  if (dryRun) {
    console.log(`[DRY RUN] Building transaction to send ${amountAlph} ALPH to ${destinationAddress}...`)
  } else {
    console.log(`Sending ${amountAlph} ALPH to ${destinationAddress}...`)
  }

  try {
    const result = await sendAlph(
      { privateKey },
      destinationAddress,
      amountRaw,
      { dryRun }
    )

    if (isDryRunResult(result)) {
      console.log('')
      console.log('=== DRY RUN RESULT ===')
      console.log('Transaction built successfully (NOT submitted)')
      console.log('')
      console.log('Transaction Details:')
      console.log(`  From:        ${result.senderAddress}`)
      console.log(`  To:          ${result.destinationAddress}`)
      console.log(`  Amount:      ${amountAlph} ALPH (${result.amount} raw units)`)
      console.log(`  TX ID:       ${result.txId}`)
      console.log(`  Unsigned TX: ${result.unsignedTx.substring(0, 64)}...`)
      console.log('')
      console.log('To submit this transaction, run without --dry-run flag.')
    } else {
      console.log('Transaction submitted successfully!')
      console.log(`Transaction hash: ${result}`)
      console.log(`View on explorer: https://testnet.alephium.org/transactions/${result}`)
    }
  } catch (error) {
    if (error instanceof InvalidAddressError) {
      console.error(`Invalid address: ${error.message}`)
    } else if (error instanceof InvalidAmountError) {
      console.error(`Invalid amount: ${error.message}`)
    } else if (error instanceof TransactionError) {
      console.error(`Transaction failed: ${error.message}`)
    } else {
      console.error(`Unexpected error: ${(error as Error).message}`)
    }
    process.exit(1)
  }
}

main()
