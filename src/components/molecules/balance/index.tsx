import { MintButton } from 'components/atoms'
import { IMintFunction, IToken } from 'interfaces/soroban/token'
import { FunctionComponent, SVGProps } from 'react'
import { Utils } from 'shared/utils'
import styles from './styles.module.scss'

interface IBalance {
  account: string
  token: IToken
  balance: bigint
  icon?: FunctionComponent<SVGProps<SVGSVGElement>>
  tokenA?: boolean
  mint?: boolean
  onUpdate: () => void
}

const Balance: FunctionComponent<IBalance> = ({
  account,
  token,
  balance,
  icon,
  tokenA,
  mint,
  onUpdate,
}): IBalance => {
  const Icon = icon

  return (
    <div className={styles.balance}>
      {Icon && <Icon />}
      <div className={styles.value}>
        <div>{Utils.formatAmount(balance, token.decimals)}</div>
        <div className={styles.code}>{token.symbol}</div>
      </div>
      {mint && (
        <div>
          <MintButton
            account={account}
            decimals={token.decimals}
            tokenA={tokenA}
            onUpdate={onUpdate}
          />
        </div>
      )}
    </div>
  )
}

export { Balance }
