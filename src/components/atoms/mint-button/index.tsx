import { LoadingButton } from '@mui/lab'
import { IMintFunction } from 'interfaces/soroban/token'
import { FunctionComponent, useState } from 'react'
import { tokenAContract, tokenBContract } from 'shared/contracts'
import styles from './styles.module.scss'

interface IMintButton {
  account: string
  decimals: number
  tokenA: boolean
  onUpdate: () => void
}

const MintButton: FunctionComponent<IMintButton> = ({ account, decimals, tokenA, onUpdate }) => {
  const [isSubmitting, setSubmitting] = useState(false)
  const amount = BigInt(100 * 10 ** decimals)

  return (
    <LoadingButton
      onClick={async (): Promise<void> => {
        setSubmitting(true)
        const tx = tokenA
          ? await tokenAContract.mint({ to: account, amount: amount })
          : await tokenBContract.mint({ to: account, amount: amount })
        await tx.signAndSend()
        setSubmitting(false)
        onUpdate()
      }}
      color="primary"
      disableElevation
      loading={isSubmitting}
      size="small"
      className={styles.button}
    >
      Mint
    </LoadingButton>
  )
}

export { MintButton }
