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

// 1. Get projectId (Using Reown's official public demo ID to bypass planLimits bug)
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694';

// 2. Create a metadata object
const metadata = {
  name: 'TrueServe',
  description: '100% Human Web3 Network',
  url: 'https://true-serve.vercel.app',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// 3. Set the networks
const networks = [celo, celoAlfajores]

// 4. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
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
    url: 'https://true-serve.vercel.app',
    icons: ['https://avatars.githubusercontent.com/u/37784886']
  },
  themeMode: 'light',
  features: {
    analytics: false,
    email: false,
    socials: []
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
