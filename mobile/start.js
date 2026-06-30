const os = require('os');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  const candidates = [];

  for (const name of Object.keys(interfaces)) {
    // Ignore virtual / WSL / Docker / VirtualBox adapters
    const isVirtual = /vEthernet|wsl|docker|virtual|vbox|vmware/i.test(name);
    if (isVirtual) continue;

    for (const net of interfaces[name]) {
      const isIPv4 = net.family === 'IPv4' || net.family === 4;
      if (isIPv4 && !net.internal) {
        candidates.push({ name, address: net.address });
      }
    }
  }

  if (candidates.length === 0) return null;

  // Prefer Wi-Fi or Ethernet adapter names
  const preferred = candidates.find(c => /wi-fi|wifi|ethernet|lan|wlan/i.test(c.name));
  return preferred ? preferred.address : candidates[0].address;
}

const localIp = getLocalIp();

if (localIp) {
  console.log(`\x1b[36m[Auto-IP] Detected active physical IP: ${localIp}\x1b[0m`);
  // Set the environment variable for Expo packager
  process.env.REACT_NATIVE_PACKAGER_HOSTNAME = localIp;

  // Write to .env.local for dynamic API URL in Expo app
  const envFilePath = path.join(__dirname, '.env.local');
  fs.writeFileSync(envFilePath, `EXPO_PUBLIC_API_URL=http://${localIp}:3000\n`);
  console.log(`\x1b[36m[Auto-IP] Saved API URL to .env.local\x1b[0m`);
} else {
  console.warn('\x1b[33m[Auto-IP] Warning: Could not detect any active physical network interfaces. Using localhost.\x1b[0m');
}

// Pass all arguments down to expo start (e.g. npm start -- --tunnel, --android, etc.)
const args = ['expo', 'start', ...process.argv.slice(2)];
console.log(`\x1b[36m[Auto-IP] Running: npx ${args.join(' ')}\x1b[0m`);

const child = spawn('npx', args, {
  stdio: 'inherit',
  shell: true,
  env: process.env
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
