import classNames from 'classnames'
import { Utils } from 'shared/utils'
import { TokenAIcon, TokenBIcon } from 'components/icons'
import { NetworkData } from 'components/molecules'
import { LiquidityActions, AccountData } from 'components/organisms'
import { useAccount } from 'app/core/hooks/useAccount'
import { IReserves } from 'interfaces/soroban/liquidityPool'
import { IToken } from 'interfaces/soroban/token'
import {
  tokenAContract,
  tokenBContract,
  shareTokenContract,
  liquidityPoolContract,
} from '../../../../shared/contracts'
import styles from './styles.module.scss'

const Home = (): JSX.Element => {
  const { account, network, onConnect, onDisconnect } = useAccount()

  const [updatedAt, setUpdatedAt] = React.useState<number>(Date.now())
  const [tokenA, setTokenA] = React.useState<IToken>({
    symbol: '',
    decimals: 7,
  })
  const [tokenB, setTokenB] = React.useState<IToken>({
    symbol: '',
    decimals: 7,
  })
  const [shareToken, setShareToken] = React.useState<IToken>({
    symbol: '',
    decimals: 7,
  })
  const [reserves, setReserves] = React.useState<IReserves>({
    reservesA: BigInt(0),
    reservesB: BigInt(0),
  })
  const [totalShares, setTotalShares] = React.useState<bigint>(BigInt(0))

  React.useEffect(() => {
    Promise.all([
      tokenAContract.symbol(),
      tokenAContract.decimals(),
      tokenBContract.symbol(),
      tokenBContract.decimals(),
      shareTokenContract.symbol(),
      shareTokenContract.decimals(),
    ]).then(fetched => {
      setTokenA(prevTokenA => ({
        ...prevTokenA,
        symbol: fetched[0].result,
        decimals: fetched[1].result,
      }))
      setTokenB(prevTokenB => ({
        ...prevTokenB,
        symbol: fetched[2].result,
        decimals: fetched[3].result,
      }))
      setShareToken(prevShareToken => ({
        ...prevShareToken,
        symbol: fetched[4].result,
        decimals: fetched[5].result,
      }))
    })
  }, [])

  React.useEffect(() => {
    Promise.all([
      liquidityPoolContract.getRsrvs(),
      liquidityPoolContract.getShares(),
    ]).then(fetched => {
      setReserves({
        reservesA: fetched[0].result[0],
        reservesB: fetched[0].result[1],
      })
      setTotalShares(fetched[1].result)
    })
    if (account?.address) {
      Promise.all([
        tokenAContract.balance({ id: account.address }),
        tokenBContract.balance({ id: account.address }),
        shareTokenContract.balance({ id: account.address }),
      ]).then(fetched => {
        setTokenA(prevTokenA => ({
          ...prevTokenA,
          balance: fetched[0].result,
        }))
        setTokenB(prevTokenB => ({
          ...prevTokenB,
          balance: fetched[1].result,
        }))
        setShareToken(prevShareToken => ({
          ...prevShareToken,
          balance: fetched[2].result,
        }))
      })
    }
  }, [updatedAt, account])

  return (
    <main>
      <header className={styles.header}>
        <h3>Liquidity Pool Dapp</h3>
        <NetworkData
          network={network}
          account={account?.address || ''}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
        />
      </header>

      <div className={styles.content}>
        <AccountData
          account={account?.address || ''}
          tokenA={tokenA}
          tokenB={tokenB}
          shareToken={shareToken}
          onUpdate={(): void => setUpdatedAt(Date.now())}
          onWalletConnect={onConnect}
        />
        <div className={styles.poolContent}>
          {network && (
            <>
              <div className={styles.poolName}>
                <div>
                  <TokenAIcon className={styles.tokenIcon} />
                  <TokenBIcon
                    className={classNames(styles.tokenIcon, styles.tokenIconB)}
                  />
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
                      {Utils.formatAmount(reserves.reservesA, tokenA.decimals)}{' '}
                      {tokenA.symbol}
                    </div>
                    <div>
                      {Utils.formatAmount(reserves.reservesB, tokenB.decimals)}{' '}
                      {tokenB.symbol}
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
              account={account.address}
              tokenA={tokenA}
              tokenB={tokenB}
              shareToken={shareToken}
              reserves={reserves}
              totalShares={totalShares}
              onUpdate={(): void => setUpdatedAt(Date.now())}
            />
          ) : (
            <div className={styles.card}>
              <p>
                Please connect your wallet to start using the liquidity pool.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default Home
