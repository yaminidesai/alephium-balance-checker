import { getAlphBalance } from '../src/lib/balance'
import { NodeProvider } from '@alephium/web3'

jest.mock('@alephium/web3', () => ({
  NodeProvider: jest.fn()
}))

const MockedNodeProvider = NodeProvider as jest.MockedClass<typeof NodeProvider>

describe('getAlphBalance', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return the balance for a valid address', async () => {
    const mockBalance = '1000000000000000000' // 1 ALPH in raw units
    const mockGetBalance = jest.fn().mockResolvedValue({ balance: mockBalance })

    MockedNodeProvider.mockImplementation(() => ({
      addresses: {
        getAddressesAddressBalance: mockGetBalance
      }
    }) as unknown as NodeProvider)

    const result = await getAlphBalance('1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH')

    expect(result).toBe(BigInt(mockBalance))
    expect(mockGetBalance).toHaveBeenCalledWith('1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH')
    expect(MockedNodeProvider).toHaveBeenCalledWith('https://node.mainnet.alephium.org')
  })

  it('should throw an error for an invalid address', async () => {
    const mockError = new Error('Invalid address format')
    const mockGetBalance = jest.fn().mockRejectedValue(mockError)

    MockedNodeProvider.mockImplementation(() => ({
      addresses: {
        getAddressesAddressBalance: mockGetBalance
      }
    }) as unknown as NodeProvider)

    await expect(getAlphBalance('invalid-address')).rejects.toThrow('Invalid address format')
    expect(mockGetBalance).toHaveBeenCalledWith('invalid-address')
  })
})
