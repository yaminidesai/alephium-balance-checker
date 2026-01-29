#!/bin/bash
#
# Alephium Send CLI
#
# Sends ALPH from one wallet to another on the Alephium testnet.
#
# Usage:
#   ./cli/send.sh <private-key> <destination-address> <amount-in-alph> [--dry-run]
#
# Arguments:
#   private-key         - The sender's private key (hex string)
#   destination-address - The recipient's Alephium address
#   amount-in-alph      - Amount to send in ALPH (e.g., 1.5)
#
# Options:
#   --dry-run           - Build transaction without submitting (preview mode)
#
# Examples:
#   ./cli/send.sh abc123...def 1ABC...XYZ 0.5
#   ./cli/send.sh abc123...def 1ABC...XYZ 0.5 --dry-run
#
# Prerequisites:
#   - Node.js installed
#   - Run 'npm install' in the project root first
#
# Note: This CLI uses the Alephium TESTNET. Do not use mainnet private keys.
#

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Check for --dry-run flag
DRY_RUN=""
ARGS=()
for arg in "$@"; do
  if [ "$arg" = "--dry-run" ]; then
    DRY_RUN="--dry-run"
  else
    ARGS+=("$arg")
  fi
done

# Validate required arguments (excluding --dry-run)
if [ ${#ARGS[@]} -lt 3 ]; then
  echo "Error: Missing required arguments"
  echo ""
  echo "Usage: ./cli/send.sh <private-key> <destination-address> <amount-in-alph> [--dry-run]"
  echo ""
  echo "Arguments:"
  echo "  private-key         - The sender's private key (hex string)"
  echo "  destination-address - The recipient's Alephium address"
  echo "  amount-in-alph      - Amount to send in ALPH (e.g., 1.5)"
  echo ""
  echo "Options:"
  echo "  --dry-run           - Build transaction without submitting (preview mode)"
  exit 1
fi

cd "$PROJECT_DIR" && npx ts-node src/cli/send.ts "${ARGS[0]}" "${ARGS[1]}" "${ARGS[2]}" $DRY_RUN
