import { getAlphBalance } from '../lib'
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
    console.error('Error fetching balance:', (error as Error).message)
    process.exit(1)
  }
}

main()
