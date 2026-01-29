import { sendAlph } from '../src/lib/send'
import {
  NodeProvider,
  TransactionBuilder,
  publicKeyFromPrivateKey,
  addressFromPublicKey,
  sign,
  isValidAddress
} from '@alephium/web3'

jest.mock('@alephium/web3', () => ({
  NodeProvider: jest.fn(),
  TransactionBuilder: {
    from: jest.fn()
  },
  publicKeyFromPrivateKey: jest.fn(),
  addressFromPublicKey: jest.fn(),
  sign: jest.fn(),
  isValidAddress: jest.fn()
}))

const mockPublicKeyFromPrivateKey = publicKeyFromPrivateKey as jest.MockedFunction<typeof publicKeyFromPrivateKey>
const mockAddressFromPublicKey = addressFromPublicKey as jest.MockedFunction<typeof addressFromPublicKey>
const mockSign = sign as jest.MockedFunction<typeof sign>
const MockedNodeProvider = NodeProvider as jest.MockedClass<typeof NodeProvider>
const mockTransactionBuilderFrom = TransactionBuilder.from as jest.MockedFunction<typeof TransactionBuilder.from>
const mockIsValidAddress = isValidAddress as jest.MockedFunction<typeof isValidAddress>

describe('sendAlph', () => {
  const mockPrivateKey = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2'
  const mockPublicKey = '03abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab'
  const mockSenderAddress = '1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH'
  const mockDestinationAddress = '1FsroWmeJPBhcPjwo9khYfpCbPfcjcJPCwmRq4J9TvDoQ'
  const mockAmount = BigInt('1000000000000000000') // 1 ALPH
  const mockTxId = 'abc123def456abc123def456abc123def456abc123def456abc123def456abc1'
  const mockUnsignedTx = 'unsigned-tx-hex'
  const mockSignature = 'signature-hex'

  let mockBuildTransferTx: jest.Mock
  let mockPostTransactionsSubmit: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    // Default: address is valid
    mockIsValidAddress.mockReturnValue(true)

    // Setup default mock implementations
    mockPublicKeyFromPrivateKey.mockReturnValue(mockPublicKey)
    mockAddressFromPublicKey.mockReturnValue(mockSenderAddress)
    mockSign.mockReturnValue(mockSignature)

    // Mock buildTransferTx
    mockBuildTransferTx = jest.fn().mockResolvedValue({
      txId: mockTxId,
      unsignedTx: mockUnsignedTx
    })

    // Mock TransactionBuilder.from to return an object with buildTransferTx
    mockTransactionBuilderFrom.mockReturnValue({
      buildTransferTx: mockBuildTransferTx
    } as unknown as TransactionBuilder)

    // Mock postTransactionsSubmit
    mockPostTransactionsSubmit = jest.fn().mockResolvedValue({
      txId: mockTxId,
      fromGroup: 0,
      toGroup: 0
    })

    // Mock NodeProvider
    MockedNodeProvider.mockImplementation(() => ({
      transactions: {
        postTransactionsSubmit: mockPostTransactionsSubmit
      }
    }) as unknown as NodeProvider)
  })

  describe('successful transaction', () => {
    it('should send ALPH and return the transaction hash', async () => {
      const result = await sendAlph(
        { privateKey: mockPrivateKey },
        mockDestinationAddress,
        mockAmount
      )

      expect(result).toBe(mockTxId)
    })

    it('should validate destination address format', async () => {
      await sendAlph(
        { privateKey: mockPrivateKey },
        mockDestinationAddress,
        mockAmount
      )

      expect(mockIsValidAddress).toHaveBeenCalledWith(mockDestinationAddress)
    })

    it('should derive public key from private key', async () => {
      await sendAlph(
        { privateKey: mockPrivateKey },
        mockDestinationAddress,
        mockAmount
      )

      expect(mockPublicKeyFromPrivateKey).toHaveBeenCalledWith(mockPrivateKey)
    })

    it('should derive sender address from public key', async () => {
      await sendAlph(
        { privateKey: mockPrivateKey },
        mockDestinationAddress,
        mockAmount
      )

      expect(mockAddressFromPublicKey).toHaveBeenCalledWith(mockPublicKey)
    })

    it('should create NodeProvider with testnet URL', async () => {
      await sendAlph(
        { privateKey: mockPrivateKey },
        mockDestinationAddress,
        mockAmount
      )

      expect(MockedNodeProvider).toHaveBeenCalledWith('https://node.testnet.alephium.org')
    })

    it('should build transfer transaction with correct parameters', async () => {
      await sendAlph(
        { privateKey: mockPrivateKey },
        mockDestinationAddress,
        mockAmount
      )

      expect(mockBuildTransferTx).toHaveBeenCalledWith(
        {
          signerAddress: mockSenderAddress,
          destinations: [
            {
              address: mockDestinationAddress,
              attoAlphAmount: mockAmount.toString()
            }
          ]
        },
        mockPublicKey
      )
    })

    it('should sign the transaction with private key', async () => {
      await sendAlph(
        { privateKey: mockPrivateKey },
        mockDestinationAddress,
        mockAmount
      )

      expect(mockSign).toHaveBeenCalledWith(mockTxId, mockPrivateKey)
    })

    it('should submit signed transaction to the network', async () => {
      await sendAlph(
        { privateKey: mockPrivateKey },
        mockDestinationAddress,
        mockAmount
      )

      expect(mockPostTransactionsSubmit).toHaveBeenCalledWith({
        unsignedTx: mockUnsignedTx,
        signature: mockSignature
      })
    })
  })

  describe('invalid private key', () => {
    it('should throw an error when publicKeyFromPrivateKey fails', async () => {
      const errorMessage = 'Invalid private key format'
      mockPublicKeyFromPrivateKey.mockImplementation(() => {
        throw new Error(errorMessage)
      })

      await expect(
        sendAlph(
          { privateKey: 'invalid-key' },
          mockDestinationAddress,
          mockAmount
        )
      ).rejects.toThrow(errorMessage)

      // Verify no network calls were made
      expect(mockBuildTransferTx).not.toHaveBeenCalled()
      expect(mockPostTransactionsSubmit).not.toHaveBeenCalled()
    })
  })

  describe('invalid destination address format', () => {
    it('should throw an error for invalid address format before network calls', async () => {
      mockIsValidAddress.mockReturnValue(false)

      await expect(
        sendAlph(
          { privateKey: mockPrivateKey },
          'invalid-address',
          mockAmount
        )
      ).rejects.toThrow("Invalid destination address: 'invalid-address' is not a valid Alephium address")

      // Verify no SDK functions were called after validation
      expect(mockPublicKeyFromPrivateKey).not.toHaveBeenCalled()
      expect(MockedNodeProvider).not.toHaveBeenCalled()
      expect(mockBuildTransferTx).not.toHaveBeenCalled()
      expect(mockPostTransactionsSubmit).not.toHaveBeenCalled()
    })

    it('should throw an error for empty destination address', async () => {
      await expect(
        sendAlph(
          { privateKey: mockPrivateKey },
          '',
          mockAmount
        )
      ).rejects.toThrow('Invalid destination address: address must be a non-empty string')

      expect(mockPublicKeyFromPrivateKey).not.toHaveBeenCalled()
      expect(MockedNodeProvider).not.toHaveBeenCalled()
    })

    it('should throw an error for destination address with leading whitespace', async () => {
      await expect(
        sendAlph(
          { privateKey: mockPrivateKey },
          '  ' + mockDestinationAddress,
          mockAmount
        )
      ).rejects.toThrow('Invalid destination address: address contains leading or trailing whitespace')

      expect(mockPublicKeyFromPrivateKey).not.toHaveBeenCalled()
      expect(MockedNodeProvider).not.toHaveBeenCalled()
    })

    it('should throw an error for destination address with trailing whitespace', async () => {
      await expect(
        sendAlph(
          { privateKey: mockPrivateKey },
          mockDestinationAddress + '  ',
          mockAmount
        )
      ).rejects.toThrow('Invalid destination address: address contains leading or trailing whitespace')

      expect(mockPublicKeyFromPrivateKey).not.toHaveBeenCalled()
      expect(MockedNodeProvider).not.toHaveBeenCalled()
    })
  })

  describe('network errors', () => {
    it('should throw an error when buildTransferTx fails', async () => {
      const errorMessage = 'Failed to build transaction'
      mockBuildTransferTx.mockRejectedValue(new Error(errorMessage))

      await expect(
        sendAlph(
          { privateKey: mockPrivateKey },
          mockDestinationAddress,
          mockAmount
        )
      ).rejects.toThrow(errorMessage)

      expect(mockPostTransactionsSubmit).not.toHaveBeenCalled()
    })

    it('should throw an error when transaction submission fails', async () => {
      const errorMessage = 'Network error during submission'
      mockPostTransactionsSubmit.mockRejectedValue(new Error(errorMessage))

      await expect(
        sendAlph(
          { privateKey: mockPrivateKey },
          mockDestinationAddress,
          mockAmount
        )
      ).rejects.toThrow(errorMessage)
    })
  })

  describe('invalid amount', () => {
    it('should throw an error for zero amount before making network calls', async () => {
      await expect(
        sendAlph(
          { privateKey: mockPrivateKey },
          mockDestinationAddress,
          BigInt(0)
        )
      ).rejects.toThrow('Amount must be greater than zero')

      // Verify no SDK functions were called
      expect(mockIsValidAddress).not.toHaveBeenCalled()
      expect(mockPublicKeyFromPrivateKey).not.toHaveBeenCalled()
      expect(mockAddressFromPublicKey).not.toHaveBeenCalled()
      expect(MockedNodeProvider).not.toHaveBeenCalled()
      expect(mockTransactionBuilderFrom).not.toHaveBeenCalled()
      expect(mockBuildTransferTx).not.toHaveBeenCalled()
      expect(mockSign).not.toHaveBeenCalled()
      expect(mockPostTransactionsSubmit).not.toHaveBeenCalled()
    })

    it('should throw an error for negative amount before making network calls', async () => {
      await expect(
        sendAlph(
          { privateKey: mockPrivateKey },
          mockDestinationAddress,
          BigInt(-100)
        )
      ).rejects.toThrow('Amount must be greater than zero')

      // Verify no SDK functions were called
      expect(mockIsValidAddress).not.toHaveBeenCalled()
      expect(mockPublicKeyFromPrivateKey).not.toHaveBeenCalled()
      expect(mockAddressFromPublicKey).not.toHaveBeenCalled()
      expect(MockedNodeProvider).not.toHaveBeenCalled()
      expect(mockTransactionBuilderFrom).not.toHaveBeenCalled()
      expect(mockBuildTransferTx).not.toHaveBeenCalled()
      expect(mockSign).not.toHaveBeenCalled()
      expect(mockPostTransactionsSubmit).not.toHaveBeenCalled()
    })
  })
})
