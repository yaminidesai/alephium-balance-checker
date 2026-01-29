import { getAlphBalance, InvalidAddressError, NetworkError } from '../lib'
import { ONE_ALPH } from '@alephium/web3'

async function main() {
  const address = process.argv[2]

  if (!address) {
    console.error('Error: Please provide an Alephium address')
    process.exit(1)
  }

  try {
    const balanceRaw = await getAlphBalance(address)
    const balanceAlph = Number(balanceRaw) / Number(ONE_ALPH)
    console.log(`${balanceAlph} ALPH`)
  } catch (error) {
    if (error instanceof InvalidAddressError) {
      console.error(`Invalid address: ${error.message}`)
    } else if (error instanceof NetworkError) {
      console.error(`Network error: ${error.message}`)
    } else {
      console.error(`Unexpected error: ${(error as Error).message}`)
    }
    process.exit(1)
  }
}

main()
