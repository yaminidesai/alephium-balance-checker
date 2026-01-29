/**
 * Base error class for Alephium balance checker errors
 */
export class AlephiumError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AlephiumError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/**
 * Thrown when an invalid Alephium address is provided
 */
export class InvalidAddressError extends AlephiumError {
  constructor(message: string = 'Invalid Alephium address') {
    super(message)
    this.name = 'InvalidAddressError'
  }
}

/**
 * Thrown when an invalid amount is provided (zero, negative, etc.)
 */
export class InvalidAmountError extends AlephiumError {
  constructor(message: string = 'Invalid amount') {
    super(message)
    this.name = 'InvalidAmountError'
  }
}

/**
 * Thrown when a network operation fails (API calls, connectivity issues)
 */
export class NetworkError extends AlephiumError {
  public readonly cause?: Error

  constructor(message: string = 'Network operation failed', cause?: Error) {
    super(message)
    this.name = 'NetworkError'
    this.cause = cause
  }
}

/**
 * Thrown when a transaction operation fails (building, signing, submission)
 */
export class TransactionError extends AlephiumError {
  public readonly cause?: Error

  constructor(message: string = 'Transaction operation failed', cause?: Error) {
    super(message)
    this.name = 'TransactionError'
    this.cause = cause
  }
}
