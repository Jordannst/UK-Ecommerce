/**
 * Script untuk memastikan Vite menggunakan port yang benar
 * Exclude port 3001 karena digunakan oleh backend
 */

import net from 'net';

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.once('close', () => resolve(true));
      server.close();
    });
    server.on('error', () => resolve(false));
  });
}

async function findAvailableFrontendPort() {
  // Port yang ingin digunakan (prioritas)
  const preferredPorts = [3000, 3002, 3003, 3004, 5173];
  
  // Skip port 3001 (digunakan backend)
  const excludedPorts = [3001];
  
  for (const port of preferredPorts) {
    if (excludedPorts.includes(port)) continue;
    
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  
  // Jika semua port preferred tidak tersedia, cari port bebas (skip 3001)
  for (let port = 3005; port <= 3010; port++) {
    if (excludedPorts.includes(port)) continue;
    
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  
  // Fallback: return undefined dan biarkan Vite mencari sendiri
  return undefined;
}

async function main() {
  const port = await findAvailableFrontendPort();
  
  if (port) {
    // Set environment variable untuk Vite
    process.env.VITE_PORT = port.toString();
    console.log(`✅ Frontend akan menggunakan port: ${port}`);
    console.log(`   (Port 3001 di-reserve untuk backend)`);
  } else {
    console.log('⚠️  Tidak ada port yang tersedia. Vite akan mencari port secara otomatis.');
  }
}

main().catch(console.error);

