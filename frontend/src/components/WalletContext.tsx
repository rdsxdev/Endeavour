import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

/*
 * Lightweight wallet context. This is a front-end simulation of a wallet
 * connection (no real web3 provider is bundled), but it mirrors the exact
 * shape a real connector (wagmi / viem) would expose so it can be swapped in
 * later without touching the UI.
 */

interface WalletState {
  address: string | null
  connected: boolean
  connecting: boolean
  connect: () => void
  disconnect: () => void
}

const WalletContext = createContext<WalletState | null>(null)

function randomAddress(): string {
  const hex = "0123456789abcdef"
  let a = "0x"
  for (let i = 0; i < 40; i++) a += hex[Math.floor(Math.random() * 16)]
  return a
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)

  const connect = useCallback(() => {
    setConnecting(true)
    // Simulate the wallet handshake latency.
    window.setTimeout(() => {
      setAddress(randomAddress())
      setConnecting(false)
    }, 900)
  }, [])

  const disconnect = useCallback(() => setAddress(null), [])

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
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  )
}

export function useWallet(): WalletState {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error("useWallet must be used within WalletProvider")
  return ctx
}
