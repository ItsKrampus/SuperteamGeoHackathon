import { createContext, useContext, useMemo } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { getProgram, getProvider } from '@/lib/anchor/program'

const AnchorContext = createContext(null)

export function AnchorProvider({ children }) {
  const { connection } = useConnection()
  const wallet = useWallet()

  const value = useMemo(() => {
    if (!wallet.publicKey) return { program: null, provider: null, wallet }
    const provider = getProvider(wallet, connection)
    const program = getProgram(wallet, connection)
    return { program, provider, wallet }
  }, [wallet, connection])

  return (
    <AnchorContext.Provider value={value}>{children}</AnchorContext.Provider>
  )
}

export function useAnchor() {
  const ctx = useContext(AnchorContext)
  if (!ctx) throw new Error('useAnchor must be inside AnchorProvider')
  return ctx
}
