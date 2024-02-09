import {
  FREIGHTER_ID,
  FreighterModule,
  ISupportedWallet,
  StellarWalletsKit,
  WalletNetwork,
} from '@creit.tech/stellar-wallets-kit'
import { useEffect, useState } from 'react'
import { useAppContext } from '../context/appContext'

// returning the same object identity every time avoids unnecessary re-renders
const addressObject = {
  address: '',
  displayName: '',
}

const addressToHistoricObject = (address: string): typeof addressObject => {
  addressObject.address = address
  addressObject.displayName = `${address.slice(0, 4)}...${address.slice(-4)}`
  return addressObject
}

// Soroban is only supported on Futurenet right now
const FUTURENET_DETAILS = {
  network: 'FUTURENET',
  networkUrl: 'https://horizon-futurenet.stellar.org',
  networkPassphrase: 'Test SDF Future Network ; October 2022',
}

const STORAGE_WALLET_KEY = 'wallet'

type UseAccountType = {
  account: typeof addressObject | null
  network: string
  onConnect: () => void
  onDisconnect: () => void
  isLoading: boolean
}
export function useAccount(): UseAccountType {
  const { walletAddress, network, setWalletAddress, setNetwork } = useAppContext()

  const [isLoading, setIsLoading] = useState(false)

  // Update is not only Futurenet is available
  const [selectedNetwork] = useState(FUTURENET_DETAILS)
  // Setup swc, user will set the desired wallet on connect
  const kit = new StellarWalletsKit({
    network: WalletNetwork.FUTURENET,
    selectedWalletId: FREIGHTER_ID,
    modules: [new FreighterModule()],
  })

  const getWalletAddress = async (id: any): Promise<void> => {
    try {
      setIsLoading(true)
      // Set selected wallet, network, and public key
      kit.setWallet(id)
      const publicKey = await kit.getPublicKey()
      await kit.setNetwork(WalletNetwork.FUTURENET)

      // Short timeout to prevent blick on loading address
      setTimeout(() => {
        setWalletAddress(publicKey)
        localStorage.setItem(STORAGE_WALLET_KEY, id)
        setIsLoading(false)
      }, 500)
    } catch (error) {
      localStorage.removeItem(STORAGE_WALLET_KEY)
      setIsLoading(false)
      // console.error(`Wallet connection rejected error: ${error}`)
    }
  }

  useEffect(() => {
    setNetwork(FUTURENET_DETAILS.network)
  }, [setNetwork])

  // if the walletType is stored in local storage the first opening the page
  // will trigger autoconnect for users
  useEffect(() => {
    const storedWallet = localStorage.getItem(STORAGE_WALLET_KEY)
    // const walletType = Object.values(WalletType).includes(storedWallet as WalletType)

    if (!walletAddress && storedWallet) {
      const getAccount = async (): Promise<void> => {
        await getWalletAddress(storedWallet)
      }
      getAccount()
    }
  }, [walletAddress, getWalletAddress])

  const onConnect = async (): Promise<void> => {
    if (!walletAddress) {
      // See https://github.com/Creit-Tech/Stellar-Wallets-Kit/tree/main for more options
      await kit.openModal({
        onWalletSelected: async (option: ISupportedWallet) => {
          await getWalletAddress(option.id)
        },
      })
    }
  }

  const onDisconnect = (): void => {
    setWalletAddress('')
    localStorage.removeItem(STORAGE_WALLET_KEY)
    setIsLoading(false)
  }

  return {
    account: walletAddress ? addressToHistoricObject(walletAddress) : null,
    network,
    onConnect,
    onDisconnect,
    isLoading,
  }
}
