# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TypeScript project for interacting with the Alephium blockchain using the `@alephium/web3` SDK.

**Features:**
- **Balance Checking** - Query ALPH balances on Alephium mainnet
- **Send ALPH** - Transfer ALPH between wallets on Alephium testnet

## Commands

```bash
# Install dependencies
npm install

# Build TypeScript
npx tsc

# Run all tests
npx jest

# Run a single test file
npx jest tests/balance.test.ts

# Run tests with coverage report
npx jest --coverage
```

## Architecture

| Directory | Description |
|-----------|-------------|
| `src/lib/` | Core library functions (balance checking, sending ALPH) |
| `src/cli/` | TypeScript CLI entry points |
| `cli/` | Bash CLI wrapper scripts |
| `tests/` | Jest test files (must match `*.test.ts` pattern) |
| `dist/` | Compiled JavaScript output |

## Library Functions

### getAlphBalance

**Location:** `src/lib/balance.ts`

Fetches the ALPH balance for an address on **mainnet**.

```typescript
import { getAlphBalance } from './lib'

const balance = await getAlphBalance('1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH')
// Returns: bigint (balance in raw units, 1 ALPH = 10^18 units)
```

### sendAlph

**Location:** `src/lib/send.ts`

Sends ALPH from one wallet to another on **testnet**.

```typescript
import { sendAlph, Wallet } from './lib'

const wallet: Wallet = { privateKey: 'your-private-key-hex' }
const txId = await sendAlph(wallet, 'destination-address', BigInt('1000000000000000000'))
// Returns: string (transaction hash)
```

**Behavior:**
- Validates that amount > 0 before making any network calls
- Derives sender address from private key automatically
- Signs and submits the transaction to the Alephium testnet

> **Warning:** The `sendAlph` function uses the Alephium testnet. Do not use mainnet private keys.

## CLI Usage

### Check Balance (Mainnet)

Retrieves the ALPH balance for a given address.

**TypeScript CLI:**
```bash
npx ts-node src/cli/balance.ts <alephium-address>
```

**Bash Wrapper:**
```bash
./cli/balance.sh <alephium-address>
```

**Arguments:**
| Argument | Description |
|----------|-------------|
| `alephium-address` | The Alephium address to check |

**Example:**
```bash
./cli/balance.sh 1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH
# Output: 0.0075 ALPH
```

### Send ALPH (Testnet)

Sends ALPH from one wallet to another.

**TypeScript CLI:**
```bash
npx ts-node src/cli/send.ts <private-key> <destination-address> <amount-in-alph>
```

**Bash Wrapper:**
```bash
./cli/send.sh <private-key> <destination-address> <amount-in-alph>
```

**Arguments:**
| Argument | Description |
|----------|-------------|
| `private-key` | Sender's private key (hex string) |
| `destination-address` | Recipient's Alephium address |
| `amount-in-alph` | Amount to send in ALPH (e.g., `1.5`) |

**Example:**
```bash
./cli/send.sh abc123...def 1ABC...XYZ 0.5
# Output: Transaction hash and testnet explorer link
```

### Error Handling

Both CLI scripts include validation and error handling:

- **Missing arguments** - Displays usage instructions with argument descriptions
- **Invalid amount** - Rejects non-numeric, zero, or negative values with a clear error message
- **Invalid private key** - Throws an error before making network calls
- **Invalid address** - Propagates network error with descriptive message
- **Network errors** - Displays the error message from the Alephium node

## Tests

Test files are located in `tests/` and use Jest with ts-jest. All tests mock external dependencies to avoid real network calls.

### Test Files

**tests/balance.test.ts**
- Valid address returns correct balance (mocked NodeProvider)
- Invalid address throws appropriate error

**tests/send.test.ts**
- Successful transaction returns correct txId
- Verifies correct parameters passed to NodeProvider, TransactionBuilder, and sign
- Invalid private key throws error before network calls
- Invalid destination address error propagates correctly
- Zero/negative amount throws error before any network calls

### Running Tests

```bash
# Run all tests
npx jest

# Run tests in watch mode
npx jest --watch

# Run tests with coverage report
npx jest --coverage

# Run a specific test file
npx jest tests/send.test.ts
```
