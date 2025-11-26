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
    port: parseInt(process.env.VITE_PORT || process.env.PORT || '3000', 10),
    strictPort: false, // Allow port switching if port is not available
    // Note: If port 3000 is busy, Vite will try 3001 next by default
    // We prevent this in the plugin above - it will exit with error
    // Better solution: Free port 3000 before starting (via prefrontend script)
    host: true,
  },
})
