import { SorobanRpc } from '@stellar/stellar-sdk'
import * as LiquidityPool from 'liquidity-pool-contract'
import * as ShareToken from 'share-token-contract'
import * as TokenA from 'token-a-contract'
import * as TokenB from 'token-b-contract'
import config from './config.json'

const { network, rpcUrl } = config

export const tokenAContract = new TokenA.Contract({
  rpcUrl,
  ...TokenA.networks[network as keyof typeof TokenA.networks],
})

export const tokenBContract = new TokenB.Contract({
  rpcUrl,
  ...TokenB.networks[network as keyof typeof TokenB.networks],
})

export const liquidityPoolContract = new LiquidityPool.Contract({
  rpcUrl,
  ...LiquidityPool.networks[network as keyof typeof LiquidityPool.networks],
})

export const shareTokenContract = new ShareToken.Contract({
  rpcUrl,
  ...ShareToken.networks[network as keyof typeof ShareToken.networks],
})

export const server = new SorobanRpc.Server(rpcUrl)
