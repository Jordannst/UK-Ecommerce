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
  // Port yang ingin digunakan (prioritas) - HARUS port 3000
  const preferredPorts = [3000];
  
  // Skip port 3001 (digunakan backend) dan 5173 (Vite default - tidak digunakan)
  const excludedPorts = [3001, 5173];
  
  // Cek port 3000 terlebih dahulu (wajib)
  if (await isPortAvailable(3000)) {
    return 3000;
  }
  
  // Jika port 3000 tidak tersedia, cari port alternatif (skip 3001 dan 5173)
  for (let port = 3002; port <= 3010; port++) {
    if (excludedPorts.includes(port)) continue;
    
    if (await isPortAvailable(port)) {
      console.warn(`⚠️  Port 3000 tidak tersedia. Menggunakan port ${port} sebagai alternatif.`);
      console.warn(`   Pastikan FRONTEND_URL di backend/.env disesuaikan dengan port ini.`);
      return port;
    }
  }
  
  // Fallback: return undefined dan biarkan Vite mencari sendiri
  console.error('❌ Port 3000 tidak tersedia dan tidak ada port alternatif yang tersedia.');
  console.error('   Silakan bebaskan port 3000 atau tutup aplikasi yang menggunakan port tersebut.');
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

