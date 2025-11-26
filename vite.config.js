import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'avoid-port-3001',
      configureServer(server) {
        server.httpServer?.once('listening', () => {
          const address = server.httpServer?.address()
          if (address && typeof address === 'object') {
            const port = address.port
            if (port === 3001) {
              console.error('\n❌ ERROR: Vite mencoba menggunakan port 3001!')
              console.error('   Port 3001 di-reserve untuk backend Express.')
              console.error('   Solusi: Bebaskan port 3000 atau restart dengan: npm run dev:all\n')
              server.close()
              process.exit(1)
            }
          }
        })
      }
    }
  ],
  server: {
    port: 3000, // Always use port 3000 for frontend
    strictPort: true, // Don't allow port switching - must use port 3000
    // Important: Port 3000 must be available for frontend
    // Backend uses port 3001, so no conflict
    host: true,
  },
})
