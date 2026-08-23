import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

interface EthereumProvider {
  request(args: {
    method: string
    params?: unknown[]
  }): Promise<unknown>
  on?(event: string, handler: (...args: unknown[]) => void): void
  removeListener?(event: string, handler: (...args: unknown[]) => void): void
}

declare global {
  interface Window {
    ethereum?: EthereumProvider
  }
}

interface WalletState {
  address: string | null
  connected: boolean
  connecting: boolean
  connect: () => Promise<void>
  disconnect: () => void
}

const WalletContext = createContext<WalletState | null>(null)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      window.alert("MetaMask is not installed. Please install MetaMask first.")
      return
    }

    setConnecting(true)

    try {
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[]

      setAddress(accounts[0] ?? null)
    } catch (error) {
      console.error("Wallet connection failed:", error)
    } finally {
      setConnecting(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    // MetaMask does not provide a programmatic disconnect.
    // We simply clear the app's local connection state.
    setAddress(null)
  }, [])

  useEffect(() => {
    if (!window.ethereum) return

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[]
      setAddress(accounts?.[0] ?? null)
    }

    window.ethereum
      .request({ method: "eth_accounts" })
      .then((accounts) => {
        const list = accounts as string[]
        setAddress(list[0] ?? null)
      })
      .catch(() => {
        setAddress(null)
      })

    window.ethereum.on?.("accountsChanged", handleAccountsChanged)

    return () => {
      window.ethereum?.removeListener?.(
        "accountsChanged",
        handleAccountsChanged,
      )
    }
  }, [])

  const value = useMemo<WalletState>(
    () => ({
      address,
      connected: address !== null,
      connecting,
      connect,
      disconnect,
    }),
    [address, connecting, connect, disconnect],
  )

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWallet(): WalletState {
  const ctx = useContext(WalletContext)

  if (!ctx) {
    throw new Error("useWallet must be used within WalletProvider")
  }

  return ctx
}
