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

## Error Classes

**Location:** `src/lib/errors.ts`

The library uses typed error classes for precise error handling. All errors extend the base `AlephiumError` class.

| Error Class | When Thrown |
|-------------|-------------|
| `InvalidAddressError` | Address is empty, contains whitespace, or fails Alephium format validation |
| `InvalidAmountError` | Amount is zero or negative |
| `NetworkError` | API calls fail (balance fetch, connectivity issues) |
| `TransactionError` | Transaction building, signing, or submission fails |

**Usage:**
```typescript
import {
  getAlphBalance,
  InvalidAddressError,
  NetworkError
} from './lib'

try {
  const balance = await getAlphBalance(address)
} catch (error) {
  if (error instanceof InvalidAddressError) {
    // Handle invalid address
  } else if (error instanceof NetworkError) {
    // Handle network failure
    console.log(error.cause) // Original error preserved
  }
}
```

**Key Features:**
- `NetworkError` and `TransactionError` preserve the original error in the `cause` property
- All errors have descriptive messages suitable for logging
- CLI scripts catch these errors and display user-friendly messages without stack traces

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

### CLI Error Handling

Both CLI scripts catch typed errors and display user-friendly messages:

| Error Type | CLI Output |
|------------|------------|
| `InvalidAddressError` | `Invalid address: <message>` |
| `InvalidAmountError` | `Invalid amount: <message>` |
| `NetworkError` | `Network error: <message>` |
| `TransactionError` | `Transaction failed: <message>` |

- **Missing arguments** - Displays usage instructions with argument descriptions
- **Stack traces** - Never shown to users; only clean error messages are displayed
- **Exit codes** - All errors exit with code 1

## Tests

Test files are located in `tests/` and use Jest with ts-jest. All tests mock external dependencies to avoid real network calls.

### Test Files

**tests/balance.test.ts** (8 tests)
- Valid address returns correct balance (mocked NodeProvider)
- Invalid address throws `InvalidAddressError`
- Network failures throw `NetworkError` with original cause preserved

**tests/send.test.ts** (19 tests)
- Successful transaction returns correct txId
- Verifies correct parameters passed to NodeProvider, TransactionBuilder, and sign
- Invalid private key throws `TransactionError`
- Invalid destination address throws `InvalidAddressError`
- Zero/negative amount throws `InvalidAmountError`
- Build/sign/submit failures throw `TransactionError` with cause preserved
- All validation errors verified to occur before network calls

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
