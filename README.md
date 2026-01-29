# Alephium Balance Checker

A TypeScript library and CLI for interacting with the [Alephium](https://alephium.org/) blockchain. Check wallet balances and send ALPH tokens programmatically or via command line.

## Features

- **Balance Checking** — Query ALPH balances for any address on mainnet
- **Send ALPH** — Transfer tokens between wallets on testnet
- **TypeScript Support** — Fully typed API with exported interfaces
- **CLI Tools** — Both TypeScript and Bash CLI wrappers included
- **Comprehensive Tests** — Jest unit tests with mocked network calls

## Requirements

- Node.js >= 14.0.0
- npm >= 7.0.0

## Installation

```bash
git clone https://github.com/yourusername/alephium-balance-checker.git
cd alephium-balance-checker
npm install
```

## Usage

### Check Balance (Mainnet)

**As a Library:**
```typescript
import { getAlphBalance } from './src/lib'

const balance = await getAlphBalance('1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH')
console.log(`Balance: ${balance} raw units`)
// 1 ALPH = 10^18 raw units
```

**TypeScript CLI:**
```bash
npx ts-node src/cli/balance.ts <address>
```

**Bash CLI:**
```bash
./cli/balance.sh <address>
```

**Example:**
```bash
$ ./cli/balance.sh 1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH
0.0075 ALPH
```

### Send ALPH (Testnet)

**As a Library:**
```typescript
import { sendAlph, Wallet } from './src/lib'

const wallet: Wallet = { privateKey: 'your-private-key-hex' }
const txId = await sendAlph(wallet, 'destination-address', BigInt('1000000000000000000'))
console.log(`Transaction: ${txId}`)
```

**TypeScript CLI:**
```bash
npx ts-node src/cli/send.ts <private-key> <destination-address> <amount-in-alph>
```

**Bash CLI:**
```bash
./cli/send.sh <private-key> <destination-address> <amount-in-alph>
```

**Example:**
```bash
$ ./cli/send.sh abc123...def 1ABC...XYZ 0.5
Sending 0.5 ALPH to 1ABC...XYZ...
Transaction submitted successfully!
Transaction hash: abc123...
View on explorer: https://testnet.alephium.org/transactions/abc123...
```

## Network Configuration

| Function | Network | Node URL |
|----------|---------|----------|
| `getAlphBalance` | Mainnet | `https://node.mainnet.alephium.org` |
| `sendAlph` | Testnet | `https://node.testnet.alephium.org` |

> **Note:** The `sendAlph` function is configured for **testnet only**. This is intentional to prevent accidental loss of funds during development.

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npx jest --coverage

# Run specific test file
npx jest tests/balance.test.ts
```

**Test Coverage:**
- Balance checking with mocked responses
- Transaction building and submission
- Input validation (invalid addresses, amounts, keys)
- Error propagation from network calls

## Security Notes

⚠️ **Private Key Handling:**

- Never commit private keys to version control
- Never use mainnet private keys with this tool (testnet only for sends)
- Store private keys in environment variables or secure vaults
- The CLI accepts private keys as arguments — avoid using in shared terminal sessions

**Recommended for production:**
```bash
export ALPH_PRIVATE_KEY="your-key"
./cli/send.sh "$ALPH_PRIVATE_KEY" <destination> <amount>
```

## Project Structure

```
alephium-balance-checker/
├── src/
│   ├── lib/           # Core library functions
│   │   ├── balance.ts # getAlphBalance implementation
│   │   ├── send.ts    # sendAlph implementation
│   │   └── index.ts   # Public exports
│   └── cli/           # TypeScript CLI entry points
│       ├── balance.ts
│       └── send.ts
├── cli/               # Bash CLI wrappers
│   ├── balance.sh
│   └── send.sh
├── tests/             # Jest unit tests
│   ├── balance.test.ts
│   └── send.test.ts
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Built With

- [TypeScript](https://www.typescriptlang.org/) — Type-safe JavaScript
- [@alephium/web3](https://github.com/alephium/alephium-web3) — Alephium blockchain SDK
- [Jest](https://jestjs.io/) — Testing framework
- [ts-jest](https://kulshekhar.github.io/ts-jest/) — TypeScript preprocessor for Jest

## License

MIT License — see [LICENSE](LICENSE) for details.

---

**Disclaimer:** This project is for educational purposes. Always verify transactions on testnet before using similar code on mainnet. The authors are not responsible for any loss of funds.
