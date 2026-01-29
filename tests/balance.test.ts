import { getAlphBalance } from '../src/lib/balance'
import { InvalidAddressError, NetworkError } from '../src/lib/errors'
import { NodeProvider, isValidAddress } from '@alephium/web3'

jest.mock('@alephium/web3', () => ({
  NodeProvider: jest.fn(),
  isValidAddress: jest.fn()
}))

const MockedNodeProvider = NodeProvider as jest.MockedClass<typeof NodeProvider>
const mockIsValidAddress = isValidAddress as jest.MockedFunction<typeof isValidAddress>

describe('getAlphBalance', () => {
  const validAddress = '1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH'
  let mockGetBalance: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    // Default: address is valid
    mockIsValidAddress.mockReturnValue(true)

    // Setup mock NodeProvider
    mockGetBalance = jest.fn()
    MockedNodeProvider.mockImplementation(() => ({
      addresses: {
        getAddressesAddressBalance: mockGetBalance
      }
    }) as unknown as NodeProvider)
  })

  describe('valid address', () => {
    it('should return the balance for a valid address', async () => {
      const mockBalance = '1000000000000000000' // 1 ALPH in raw units
      mockGetBalance.mockResolvedValue({ balance: mockBalance })

      const result = await getAlphBalance(validAddress)

      expect(result).toBe(BigInt(mockBalance))
      expect(mockGetBalance).toHaveBeenCalledWith(validAddress)
      expect(MockedNodeProvider).toHaveBeenCalledWith('https://node.mainnet.alephium.org')
    })

    it('should validate address format before making network calls', async () => {
      mockGetBalance.mockResolvedValue({ balance: '0' })

      await getAlphBalance(validAddress)

      expect(mockIsValidAddress).toHaveBeenCalledWith(validAddress)
    })
  })

  describe('invalid address format', () => {
    it('should throw InvalidAddressError for an invalid address format', async () => {
      mockIsValidAddress.mockReturnValue(false)

      await expect(getAlphBalance('invalid-address')).rejects.toThrow(InvalidAddressError)
      await expect(getAlphBalance('invalid-address')).rejects.toThrow(
        "Invalid address: 'invalid-address' is not a valid Alephium address"
      )

      // Verify no network call was made
      expect(MockedNodeProvider).not.toHaveBeenCalled()
      expect(mockGetBalance).not.toHaveBeenCalled()
    })

    it('should throw InvalidAddressError for empty address', async () => {
      await expect(getAlphBalance('')).rejects.toThrow(InvalidAddressError)
      await expect(getAlphBalance('')).rejects.toThrow(
        'Invalid address: address must be a non-empty string'
      )

      expect(MockedNodeProvider).not.toHaveBeenCalled()
    })

    it('should throw InvalidAddressError for address with leading whitespace', async () => {
      await expect(getAlphBalance('  ' + validAddress)).rejects.toThrow(InvalidAddressError)
      await expect(getAlphBalance('  ' + validAddress)).rejects.toThrow(
        'Invalid address: address contains leading or trailing whitespace'
      )

      expect(MockedNodeProvider).not.toHaveBeenCalled()
    })

    it('should throw InvalidAddressError for address with trailing whitespace', async () => {
      await expect(getAlphBalance(validAddress + '  ')).rejects.toThrow(InvalidAddressError)
      await expect(getAlphBalance(validAddress + '  ')).rejects.toThrow(
        'Invalid address: address contains leading or trailing whitespace'
      )

      expect(MockedNodeProvider).not.toHaveBeenCalled()
    })
  })

  describe('network errors', () => {
    it('should throw NetworkError when balance fetch fails', async () => {
      mockGetBalance.mockRejectedValue(new Error('Connection refused'))

      await expect(getAlphBalance(validAddress)).rejects.toThrow(NetworkError)
      await expect(getAlphBalance(validAddress)).rejects.toThrow(
        `Failed to fetch balance for address: ${validAddress}`
      )
    })

    it('should include original error as cause in NetworkError', async () => {
      const originalError = new Error('Connection refused')
      mockGetBalance.mockRejectedValue(originalError)

      try {
        await getAlphBalance(validAddress)
        fail('Expected NetworkError to be thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(NetworkError)
        expect((error as NetworkError).cause).toBe(originalError)
      }
    })
  })
})
