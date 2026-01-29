import {
  NodeProvider,
  TransactionBuilder,
  publicKeyFromPrivateKey,
  addressFromPublicKey,
  sign
} from '@alephium/web3'
import { validateAlephiumAddress } from './validation'
import { InvalidAmountError, TransactionError } from './errors'

const TESTNET_NODE_URL = 'https://node.testnet.alephium.org'

/**
 * Wallet interface containing the private key for signing transactions
 */
export interface Wallet {
  privateKey: string
}

/**
 * Result returned when sendAlph is called with dryRun: true
 */
export interface DryRunResult {
  txId: string
  unsignedTx: string
  senderAddress: string
  destinationAddress: string
  amount: string
}

/**
 * Options for sendAlph function
 */
export interface SendAlphOptions {
  dryRun?: boolean
}

/**
 * Send ALPH from one wallet to another on the Alephium testnet
 *
 * @param senderWallet - The wallet containing the sender's private key
 * @param destinationAddress - The recipient's Alephium address
 * @param amount - The amount to send in raw units (1 ALPH = 10^18 units)
 * @param options - Optional settings (dryRun: boolean)
 * @returns The transaction hash (txId) or DryRunResult if dryRun is true
 * @throws InvalidAmountError if the amount is zero or negative
 * @throws InvalidAddressError if the destination address is invalid
 * @throws TransactionError if the transaction fails to build, sign, or submit
 */
export async function sendAlph(
  senderWallet: Wallet,
  destinationAddress: string,
  amount: bigint,
  options?: SendAlphOptions
): Promise<string | DryRunResult> {
  const dryRun = options?.dryRun ?? false

  // Validate inputs before making any network calls
  if (amount <= 0n) {
    throw new InvalidAmountError('Amount must be greater than zero')
  }

  validateAlephiumAddress(destinationAddress, 'destination address')

  // Derive public key and address from the private key
  let publicKey: string
  let senderAddress: string
  try {
    publicKey = publicKeyFromPrivateKey(senderWallet.privateKey)
    senderAddress = addressFromPublicKey(publicKey)
  } catch (error) {
    throw new TransactionError(
      'Failed to derive address from private key',
      error instanceof Error ? error : undefined
    )
  }

  // Create node provider and transaction builder for testnet
  const nodeProvider = new NodeProvider(TESTNET_NODE_URL)
  const txBuilder = TransactionBuilder.from(nodeProvider)

  // Build the unsigned transfer transaction
  let buildResult: { txId: string; unsignedTx: string }
  try {
    buildResult = await txBuilder.buildTransferTx(
      {
        signerAddress: senderAddress,
        destinations: [
          {
            address: destinationAddress,
            attoAlphAmount: amount.toString()
          }
        ]
      },
      publicKey
    )
  } catch (error) {
    throw new TransactionError(
      'Failed to build transaction',
      error instanceof Error ? error : undefined
    )
  }

  // If dry run, return transaction details without submitting
  if (dryRun) {
    return {
      txId: buildResult.txId,
      unsignedTx: buildResult.unsignedTx,
      senderAddress,
      destinationAddress,
      amount: amount.toString()
    }
  }

  // Sign the transaction hash with the sender's private key
  let signature: string
  try {
    signature = sign(buildResult.txId, senderWallet.privateKey)
  } catch (error) {
    throw new TransactionError(
      'Failed to sign transaction',
      error instanceof Error ? error : undefined
    )
  }

  // Submit the signed transaction to the network
  try {
    const submitResult = await nodeProvider.transactions.postTransactionsSubmit({
      unsignedTx: buildResult.unsignedTx,
      signature
    })
    return submitResult.txId
  } catch (error) {
    throw new TransactionError(
      'Failed to submit transaction',
      error instanceof Error ? error : undefined
    )
  }
}
