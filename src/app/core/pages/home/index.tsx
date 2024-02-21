import { useSorobanReact } from '@soroban-react/core'
import { useAccount } from 'app/core/hooks/useAccount'
import classNames from 'classnames'
import { TokenAIcon, TokenBIcon } from 'components/icons'
import { NetworkData } from 'components/molecules'
import { AccountData, LiquidityActions } from 'components/organisms'
import { IReserves } from 'interfaces/soroban/liquidityPool'
import { IToken } from 'interfaces/soroban/token'
import { AssembledTransaction, i128, u32 } from 'liquidity-pool-contract'
import { useEffect, useState } from 'react'
import {
  liquidityPoolContract,
  shareTokenContract,
  tokenAContract,
  tokenBContract,
} from 'shared/contracts'
import { Utils } from 'shared/utils'
import styles from './styles.module.scss'

const Home = (): JSX.Element => {
  const sorobanContext = useSorobanReact()
  const account = sorobanContext.address ? sorobanContext.address : ''

  const [updatedAt, setUpdatedAt] = useState<number>(Date.now())
  const [tokenA, setTokenA] = useState<IToken>({
    symbol: '',
    decimals: 7,
  })
  const [tokenB, setTokenB] = useState<IToken>({
    symbol: '',
    decimals: 7,
  })
  const [shareToken, setShareToken] = useState<IToken>({
    symbol: '',
    decimals: 7,
  })
  const [reserves, setReserves] = useState<IReserves>({
    reservesA: BigInt(0),
    reservesB: BigInt(0),
  })
  const [totalShares, setTotalShares] = useState<bigint>(BigInt(0))

  useEffect(() => {
    ;(async () => {
      const tokenASymbol = await tokenAContract.symbol()
      const tokenADecimals = await tokenAContract.decimals()
      setTokenA((prevTokenA) => ({
        ...prevTokenA,
        symbol: tokenASymbol.result,
        decimals: tokenADecimals.result,
      }))
      const tokenBSymbol = await tokenBContract.symbol()
      const tokenBDecimals = await tokenBContract.decimals()
      setTokenB((prevTokenB) => ({
        ...prevTokenB,
        symbol: tokenBSymbol.result,
        decimals: tokenBDecimals.result,
      }))
      const shareTokenSymbol = await shareTokenContract.symbol()
      const shareTokenDecimals = await shareTokenContract.decimals()
      setShareToken((prevShareToken) => ({
        ...prevShareToken,
        symbol: shareTokenSymbol.result,
        decimals: shareTokenDecimals.result,
      }))
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      await liquidityPoolContract.getRsrvs().then((tx) =>
        setReserves({
          reservesA: tx.result[0],
          reservesB: tx.result[1],
        })
      )
      await liquidityPoolContract.getShares().then((tx) => setTotalShares(tx.result))
    })()

    if (account) {
      ;(async () => {
        await tokenAContract.balance({ id: account }).then((tx) =>
          setTokenA((prevTokenA) => ({
            ...prevTokenA,
            balance: tx.result as i128,
          }))
        )
        await tokenBContract.balance({ id: account }).then((tx) =>
          setTokenB((prevTokenB) => ({
            ...prevTokenB,
            balance: tx.result as i128,
          }))
        )
        await shareTokenContract.balance({ id: account }).then((tx) =>
          setShareToken((prevShareToken) => ({
            ...prevShareToken,
            balance: tx.result as i128,
          }))
        )
      })()
    }
  }, [account, updatedAt])

  return (
    <main>
      <header className={styles.header}>
        <h3>Liquidity Pool Dapp</h3>
        <NetworkData sorobanContext={sorobanContext} />
      </header>

      <div className={styles.content}>
        <AccountData
          sorobanContext={sorobanContext}
          tokenA={tokenA}
          tokenB={tokenB}
          shareToken={shareToken}
          onUpdate={(): void => setUpdatedAt(Date.now())}
        />
        <div className={styles.poolContent}>
          {sorobanContext.activeChain && (
            <>
              <div className={styles.poolName}>
                <div>
                  <TokenAIcon className={styles.tokenIcon} />
                  <TokenBIcon className={classNames(styles.tokenIcon, styles.tokenIconB)} />
                </div>
                <h1>
                  {tokenA.symbol} · {tokenB.symbol}
                </h1>
              </div>
              <div className={styles.poolDescription}>
                <div className={styles.item}>
                  <div className={styles.label}>Reserves</div>
                  <div className={styles.values}>
                    <div>
                      {Utils.formatAmount(reserves.reservesA, tokenA.decimals)} {tokenA.symbol}
                    </div>
                    <div>
                      {Utils.formatAmount(reserves.reservesB, tokenB.decimals)} {tokenB.symbol}
                    </div>
                  </div>
                </div>
                <div className={styles.item}>
                  <div className={styles.label}>Pool fees</div>
                  <div className={styles.values}>
                    <div>0.3%</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {account ? (
            <LiquidityActions
              account={account}
              tokenA={tokenA}
              tokenB={tokenB}
              shareToken={shareToken}
              reserves={reserves}
              totalShares={totalShares}
              onUpdate={(): void => setUpdatedAt(Date.now())}
            />
          ) : (
            <div className={styles.card}>
              <p>Please connect your wallet to start using the liquidity pool.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default Home
