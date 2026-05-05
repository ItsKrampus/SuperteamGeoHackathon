import { StrictMode, useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { RPC_URL } from './lib/solana'
import '@solana/wallet-adapter-react-ui/styles.css'
import './index.css'
import App from './App.jsx'
import { seedDemoData } from './lib/db/seed'

seedDemoData()

function Providers({ children }) {
  const endpoint = useMemo(() => RPC_URL, [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
)
