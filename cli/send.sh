#!/bin/bash
#
# Alephium Send CLI
#
# Sends ALPH from one wallet to another on the Alephium testnet.
#
# Usage:
#   ./cli/send.sh <private-key> <destination-address> <amount-in-alph>
#
# Arguments:
#   private-key         - The sender's private key (hex string)
#   destination-address - The recipient's Alephium address
#   amount-in-alph      - Amount to send in ALPH (e.g., 1.5)
#
# Example:
#   ./cli/send.sh abc123...def 1ABC...XYZ 0.5
#
# Prerequisites:
#   - Node.js installed
#   - Run 'npm install' in the project root first
#
# Note: This CLI uses the Alephium TESTNET. Do not use mainnet private keys.
#

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ]; then
  echo "Error: Missing required arguments"
  echo ""
  echo "Usage: ./cli/send.sh <private-key> <destination-address> <amount-in-alph>"
  echo ""
  echo "Arguments:"
  echo "  private-key         - The sender's private key (hex string)"
  echo "  destination-address - The recipient's Alephium address"
  echo "  amount-in-alph      - Amount to send in ALPH (e.g., 1.5)"
  exit 1
fi

cd "$PROJECT_DIR" && npx ts-node src/cli/send.ts "$1" "$2" "$3"
