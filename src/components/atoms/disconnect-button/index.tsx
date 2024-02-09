import { Button } from '@mui/material'
import { FC } from 'react'

export interface IConnectButtonProps {
  label: string
  onClick: () => void
}

export const DisconnectButton: FC<IConnectButtonProps> = ({ label, onClick }) => {
  return (
    <Button onClick={onClick} variant="outlined">
      {label}
    </Button>
  )
}
