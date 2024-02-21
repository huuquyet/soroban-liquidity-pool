import { SorobanContextType } from '@soroban-react/core'
import { ConnectButton } from 'components/atoms'
import { FunctionComponent } from 'react'
import styles from './styles.module.scss'

interface INetworkDataProps {
  sorobanContext: SorobanContextType
}

const NetworkData: FunctionComponent<INetworkDataProps> = ({ sorobanContext }) => {
  const { activeChain } = sorobanContext
  return (
    <>
      {activeChain ? (
        <div className={styles.card}>{activeChain.name}</div>
      ) : (
        <ConnectButton label="Connect Wallet" sorobanContext={sorobanContext} />
      )}
    </>
  )
}
export { NetworkData }
