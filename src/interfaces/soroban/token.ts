import { Address } from '@stellar/stellar-sdk'

interface IToken {
  symbol: string
  decimals: number
  balance?: bigint
}

interface IMintParams {
  to: Address
  amount: bigint
}

interface IMintOptions {
  signAndSend?: boolean
  fee?: number
}

interface IMintFunction {
  (params: IMintParams, options?: IMintOptions): Promise<void>
}

export type { IToken, IMintFunction }
