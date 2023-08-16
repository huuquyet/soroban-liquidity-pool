#!/bin/bash

set -e

NETWORK="$1"

SOROBAN_RPC_HOST="$2"

WASM_PATH="target/wasm32-unknown-unknown/release/"
VAULT_WASM=$WASM_PATH"soroban_vault_contract.optimized.wasm"
ABUNDANCE_WASM=$WASM_PATH"abundance_token.optimized.wasm"
TOKEN_WASM="contracts/vault/token/soroban_token_contract.wasm"


if [[ "$SOROBAN_RPC_HOST" == "" ]]; then
  # If soroban-cli is called inside the soroban-preview docker container,
  # it can call the stellar standalone container just using its name "stellar"
  if [[ "$IS_USING_DOCKER" == "true" ]]; then
    SOROBAN_RPC_HOST="http://stellar:8000"
    SOROBAN_RPC_URL="$SOROBAN_RPC_HOST"
  elif [[ "$NETWORK" == "futurenet" ]]; then
    SOROBAN_RPC_HOST="https://rpc-futurenet.stellar.org:443"
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
standalone)
  echo "Using standalone network with RPC URL: $SOROBAN_RPC_URL"
  SOROBAN_NETWORK_PASSPHRASE="Standalone Network ; February 2017"
  FRIENDBOT_URL="$SOROBAN_RPC_HOST/friendbot"
  ;;
futurenet)
  echo "Using Futurenet network with RPC URL: $SOROBAN_RPC_URL"
  SOROBAN_NETWORK_PASSPHRASE="Test SDF Future Network ; October 2022"
  FRIENDBOT_URL="https://friendbot-futurenet.stellar.org/"
  ;;
*)
  echo "Usage: $0 standalone|futurenet [rpc-host]"
  exit 1
  ;;
esac

echo Add the $NETWORK network to cli client
soroban config network add \
  --rpc-url "$SOROBAN_RPC_URL" \
  --network-passphrase "$SOROBAN_NETWORK_PASSPHRASE" "$NETWORK"

if !(soroban config identity ls | grep token-admin 2>&1 >/dev/null); then
  echo Create the token-admin identity
  soroban config identity generate token-admin
fi
TOKEN_ADMIN_SECRET="$(soroban config identity show token-admin)"
TOKEN_ADMIN_ADDRESS="$(soroban config identity address token-admin)"

mkdir -p .soroban

# This will fail if the account already exists, but it'll still be fine.
echo Fund token-admin account from friendbot
curl --silent -X POST "$FRIENDBOT_URL?addr=$TOKEN_ADMIN_ADDRESS" >/dev/null

ARGS="--network $NETWORK --source token-admin"


echo "Building contracts"
soroban contract build
echo "Optimizing contracts"
soroban contract optimize --wasm $WASM_PATH"soroban_vault_contract.wasm"
soroban contract optimize --wasm $WASM_PATH"abundance_token.wasm"


echo Deploy the vault contract
VAULT_ID="$(
  soroban contract deploy $ARGS \
    --wasm $VAULT_WASM
)"
echo "Vault contract deployed succesfully with ID: $VAULT_ID"

echo Deploy the abundance token A contract
ABUNDANCE_A_ID="$(
  soroban contract deploy $ARGS \
    --wasm $ABUNDANCE_WASM
)"
echo "Contract deployed succesfully with ID: $ABUNDANCE_A_ID"

echo "Initialize the abundance token A contract"
soroban contract invoke \
  $ARGS \
  --id "$ABUNDANCE_A_ID" \
  -- \
  initialize \
  --symbol USDC \
  --decimal 7 \
  --name USDCoin \
  --admin "$TOKEN_ADMIN_ADDRESS"


echo "Installing token wasm contract"
TOKEN_WASM_HASH="$(soroban contract install \
    $ARGS \
    --wasm $TOKEN_WASM
)"

echo "Initialize the vault contract"
soroban contract invoke \
  $ARGS \
  --wasm $VAULT_WASM \
  --id "$VAULT_ID" \
  -- \
  initialize \
  --token_wasm_hash "$TOKEN_WASM_HASH" \
  --token "$ABUNDANCE_A_ID"

echo "Fund the vault contract"
soroban contract invoke \
  $ARGS \
  --id "$ABUNDANCE_A_ID" \
  -- \
  mint \
  --to "$TOKEN_ADMIN_ADDRESS" \
  --amount 10000000000

soroban contract invoke \
  $ARGS \
  --wasm $VAULT_WASM \
  --id "$VAULT_ID" \
  -- \
  deposit \
  --from "$TOKEN_ADMIN_ADDRESS" \
  --amount 10000000000

echo "1000 USDC deposited to the vault contract"


echo "Getting the share id"
SHARE_ID="$(soroban contract invoke \
  $ARGS \
  --wasm $VAULT_WASM \
  --id "$VAULT_ID" \
  -- \
  share_id
)"
SHARE_ID=${SHARE_ID//\"/}
echo "Share ID: $SHARE_ID"


echo "Generating bindings"
soroban contract bindings typescript --wasm $ABUNDANCE_WASM --network $NETWORK --contract-id $ABUNDANCE_A_ID --contract-name token-a --output-dir ".soroban/contracts/token-a"
soroban contract bindings typescript --wasm contracts/vault/token/soroban_token_contract.wasm --network $NETWORK --contract-id $SHARE_ID --contract-name share-token --output-dir ".soroban/contracts/share-token"
soroban contract bindings typescript --wasm $VAULT_WASM --network $NETWORK --contract-id $VAULT_ID --contract-name vault --output-dir ".soroban/contracts/vault"

echo "Done"

