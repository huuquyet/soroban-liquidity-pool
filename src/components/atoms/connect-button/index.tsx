import { Button } from '@mui/material'
import { FC } from 'react'

export interface IConnectButtonProps {
  label: string
  onClick: () => void
}

export const ConnectButton: FC<IConnectButtonProps> = ({ label, onClick }) => {
  return (
    <Button onClick={onClick} variant="contained">
      {label}
    </Button>
  )
}
