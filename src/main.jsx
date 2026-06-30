import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createAppKit } from '@reown/appkit/react'
import { WagmiProvider, http } from 'wagmi'
import { celo, celoAlfajores } from '@reown/appkit/networks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

import { BrowserRouter } from 'react-router-dom';

import './index.css'
import App from './App.jsx'

const queryClient = new QueryClient()

const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || 'f1aa267ec8d8048f7b9300d2517538ee';

const networks = [celo, celoAlfajores]

const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
  transports: {
    [celo.id]: http('https://forno.celo.org'),
    [celoAlfajores.id]: http('https://alfajores-forno.celo-testnet.org')
  }
})

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata: {
    name: 'TrueServe',
    description: '100% Human Web3 Network',
    url: window.location.origin,
    icons: ['https://avatars.githubusercontent.com/u/37784886']
  },
  themeMode: 'light',
  features: {
    analytics: false,
    email: false,
    socials: false
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)
