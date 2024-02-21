import { Button } from '@mui/material'
import { SorobanContextType } from '@soroban-react/core'
import { FC } from 'react'

export interface IConnectButtonProps {
  sorobanContext: SorobanContextType
  label: string
}

export const ConnectButton: FC<IConnectButtonProps> = ({ sorobanContext, label }) => {
  const { connect } = sorobanContext
  const openConnectModal = async (): Promise<void> => {
    await connect()
  }

  return (
    <Button onClick={openConnectModal} variant="contained">
      {label}
    </Button>
  )
}
