import { FunctionComponent } from 'react'

import styles from './styles.module.scss'

import { SorobanContextType } from "@soroban-react/core";
import { ConnectButton } from "components/atoms"

import { Balance } from "components/molecules"
import { IToken } from "interfaces/soroban/token"
import { TokenAIcon, TokenLPIcon } from 'components/icons';
import { mint as mintA } from 'token-a-contract'

interface IAccountData {
    sorobanContext: SorobanContextType;
    tokenA: IToken;
    shareToken: IToken;
    onUpdate: () => void;
}

const AccountData: FunctionComponent<IAccountData> = ({ sorobanContext, tokenA, shareToken, onUpdate }) => {
    const account = sorobanContext.address
    return (
        <div className={styles.card}>
            <h3>Account balance</h3>
            {account ? (
                <BalanceData
                    account={account}
                    tokenA={tokenA}
                    shareToken={shareToken}
                    onUpdate={onUpdate}
                />
            ) : (
                <ConnectButton label='Connect Wallet' sorobanContext={sorobanContext} />
            )}
        </div>
    )
}

interface IBalanceData {
    tokenA: IToken;
    shareToken: IToken;
    account: string;
    onUpdate: () => void;
}

const BalanceData: FunctionComponent<IBalanceData> = ({ tokenA, shareToken, account, onUpdate }) => {
    return (
        <>
            <div className={styles.address}>
                {`${account.substring(0, 10)}...${account.substring(account.length - 10)}`}
            </div>
            <div className={styles.balances}>
                <Balance
                    account={account}
                    token={tokenA}
                    balance={tokenA.balance || BigInt(0)}
                    mint={mintA}
                    icon={TokenAIcon}
                    onUpdate={onUpdate}
                />
                <Balance
                    account={account}
                    token={shareToken}
                    balance={shareToken.balance || BigInt(0)}
                    icon={TokenLPIcon}
                    onUpdate={onUpdate}
                />
            </div>
        </>
    )
}

export { AccountData }
