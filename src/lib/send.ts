import {
  NodeProvider,
  TransactionBuilder,
  publicKeyFromPrivateKey,
  addressFromPublicKey,
  sign
} from '@alephium/web3'

const TESTNET_NODE_URL = 'https://node.testnet.alephium.org'

/**
 * Wallet interface containing the private key for signing transactions
 */
export interface Wallet {
  privateKey: string
}

/**
 * Send ALPH from one wallet to another on the Alephium testnet
 *
 * @param senderWallet - The wallet containing the sender's private key
 * @param destinationAddress - The recipient's Alephium address
 * @param amount - The amount to send in raw units (1 ALPH = 10^18 units)
 * @returns The transaction hash (txId)
 * @throws Error if the transaction fails to build or submit
 */
export async function sendAlph(
  senderWallet: Wallet,
  destinationAddress: string,
  amount: bigint
): Promise<string> {
  // Validate amount before making any network calls
  if (amount <= 0n) {
    throw new Error('Amount must be greater than zero')
  }

  // Derive public key and address from the private key
  const publicKey = publicKeyFromPrivateKey(senderWallet.privateKey)
  const senderAddress = addressFromPublicKey(publicKey)

  // Create node provider and transaction builder for testnet
  const nodeProvider = new NodeProvider(TESTNET_NODE_URL)
  const txBuilder = TransactionBuilder.from(nodeProvider)

  // Build the unsigned transfer transaction
  const buildResult = await txBuilder.buildTransferTx(
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

  // Sign the transaction hash with the sender's private key
  const signature = sign(buildResult.txId, senderWallet.privateKey)

  // Submit the signed transaction to the network
  const submitResult = await nodeProvider.transactions.postTransactionsSubmit({
    unsignedTx: buildResult.unsignedTx,
    signature
  })

  return submitResult.txId
}
