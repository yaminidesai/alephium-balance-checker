#!/bin/bash
#
# Alephium Balance Checker CLI
#
# Usage:
#   ./cli/balance.sh <alephium-address>
#
# Example:
#   ./cli/balance.sh 1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH
#
# Prerequisites:
#   - Node.js installed
#   - Run 'npm install' in the project root first
#

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

if [ -z "$1" ]; then
  echo "Error: Please provide an Alephium address"
  echo "Usage: ./cli/balance.sh <alephium-address>"
  exit 1
fi

cd "$PROJECT_DIR" && npx ts-node src/cli/balance.ts "$1"
