#!/bin/bash

set -e

NETWORK="$1"

SOROBAN_RPC_HOST="$2"

PATH=./target/bin:$PATH

if [[ -d "./.soroban/contracts" ]]; then
  echo "Found existing './.soroban/contracts' directory; already initialized."
  exit 0
fi

if [[ -f "./target/bin/soroban" ]]; then
  echo "Using soroban binary from ./target/bin"
elif command -v soroban &> /dev/null; then
  echo "Using soroban cli"
else
  echo "Building pinned soroban binary"
  cargo install_soroban
fi

if [[ "$SOROBAN_RPC_HOST" == "" ]]; then
  if [[ "$NETWORK" == "futurenet" ]]; then
    SOROBAN_RPC_HOST="https://rpc-futurenet.stellar.org"
    SOROBAN_RPC_URL="$SOROBAN_RPC_HOST"
  elif [[ "$NETWORK" == "testnet" ]]; then
    SOROBAN_RPC_HOST="https://soroban-testnet.stellar.org"
    SOROBAN_RPC_URL="$SOROBAN_RPC_HOST"
  else
     # assumes standalone on quickstart, which has the soroban/rpc path
    SOROBAN_RPC_HOST="http://localhost:8000"
    SOROBAN_RPC_URL="$SOROBAN_RPC_HOST/soroban/rpc"
  fi
else
  SOROBAN_RPC_URL="$SOROBAN_RPC_HOST"
fi

case "$1" in
futurenet)
  echo "Using Futurenet network with RPC URL: $SOROBAN_RPC_URL"
  SOROBAN_NETWORK_PASSPHRASE="Test SDF Future Network ; October 2022"
  ;;
testnet)
  echo "Using Testnet network with RPC URL: $SOROBAN_RPC_URL"
  SOROBAN_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
  ;;
standalone)
  echo "Using standalone network with RPC URL: $SOROBAN_RPC_URL"
  SOROBAN_NETWORK_PASSPHRASE="Standalone Network ; February 2017"
  ;;
*)
  echo "Usage: $0 standalone|futurenet|testnet [rpc-host]"
  exit 1
  ;;
esac

echo "Add the $NETWORK network to cli client"
soroban config network add \
  --rpc-url "$SOROBAN_RPC_URL" \
  --network-passphrase "$SOROBAN_NETWORK_PASSPHRASE" "$NETWORK"

echo "Add the $NETWORK network to shared config"
echo "{ \"network\": \"$NETWORK\", \"rpcUrl\": \"$SOROBAN_RPC_URL\", \"networkPassphrase\": \"$SOROBAN_NETWORK_PASSPHRASE\" }" > ./src/shared/config.json

if !(soroban config identity ls | grep token-admin 2>&1 >/dev/null); then
  echo "Create the token-admin identity"
  soroban config identity generate token-admin --network $NETWORK
fi
mkdir -p .soroban

# This will fail if the account already exists, but it'll still be fine.
echo "Fund token-admin account from friendbot"
soroban config identity fund token-admin --network $NETWORK

ARGS="--network $NETWORK --source token-admin"

WASM_PATH="./target/wasm32-unknown-unknown/release/"
TOKEN_PATH=$WASM_PATH"soroban_token_contract"
LIQUIDITY_POOL_PATH=$WASM_PATH"soroban_liquidity_pool_contract"

echo "Building token contract and optimizing contract"
soroban contract build --package soroban-token-contract
soroban contract optimize --wasm $TOKEN_PATH".wasm"

echo "Building liquidity pool contract and optimizing contract"
soroban contract build --package soroban-liquidity-pool-contract
soroban contract optimize --wasm $LIQUIDITY_POOL_PATH".wasm"

echo "Deploy the abundance token A contract"
TOKEN_A_ID="$(
  soroban contract deploy $ARGS \
    --wasm $TOKEN_PATH".optimized.wasm"
)"
echo "Contract deployed succesfully with ID: $TOKEN_A_ID"

echo "Deploy the abundance token B contract"
TOKEN_B_ID="$(
  soroban contract deploy $ARGS \
    --wasm $TOKEN_PATH".optimized.wasm"
)"
echo "Contract deployed succesfully with ID: $TOKEN_B_ID"

echo "Deploy the liquidity pool contract"
LIQUIDITY_POOL_ID="$(
  soroban contract deploy $ARGS \
    --wasm $LIQUIDITY_POOL_PATH".optimized.wasm"
)"
echo "Liquidity Pool contract deployed succesfully with ID: $LIQUIDITY_POOL_ID"

if [[ "$TOKEN_B_ID" < "$TOKEN_A_ID" ]]; then
  echo "Changing tokens order"
  OLD_TOKEN_A_ID=$TOKEN_A_ID
  TOKEN_A_ID=$TOKEN_B_ID
  TOKEN_B_ID=$OLD_TOKEN_A_ID
fi

echo "Initialize the abundance token A contract"
soroban contract invoke \
  $ARGS \
  --id "$TOKEN_A_ID" \
  -- \
  initialize \
  --symbol USDC \
  --decimal 7 \
  --name USDCoin \
  --admin token-admin


echo "Initialize the abundance token B contract"
soroban contract invoke \
  $ARGS \
  --id "$TOKEN_B_ID" \
  -- \
  initialize \
  --symbol BTC \
  --decimal 7 \
  --name Bitcoin \
  --admin token-admin

echo "Installing token wasm contract"
TOKEN_WASM_HASH="$(
  soroban contract install $ARGS \
    --wasm $TOKEN_PATH".optimized.wasm"
)"

echo "Initialize the liquidity pool contract"
soroban contract invoke \
  $ARGS \
  --id "$LIQUIDITY_POOL_ID" \
  -- \
  initialize \
  --token_wasm_hash "$TOKEN_WASM_HASH" \
  --token_a "$TOKEN_A_ID" \
  --token_b "$TOKEN_B_ID"

echo "Getting the share id"
SHARE_ID="$(soroban contract invoke \
  $ARGS \
  --id "$LIQUIDITY_POOL_ID" \
  -- \
  share_id
)"
echo "Share ID: ${SHARE_ID//\"/}"

echo "Generating bindings"
soroban contract bindings typescript \
  --network $NETWORK \
  --contract-id $TOKEN_A_ID \
  --output-dir ".soroban/contracts/token-a" \
  --overwrite || true
soroban contract bindings typescript \
  --network $NETWORK \
  --contract-id $TOKEN_B_ID \
  --output-dir ".soroban/contracts/token-b" \
  --overwrite || true
soroban contract bindings typescript \
  --network $NETWORK \
  --contract-id $SHARE_ID \
  --output-dir ".soroban/contracts/share-token" \
  --overwrite || true
soroban contract bindings typescript \
  --network $NETWORK \
  --contract-id $LIQUIDITY_POOL_ID \
  --output-dir ".soroban/contracts/liquidity-pool" \
  --overwrite || true

echo "Done"

