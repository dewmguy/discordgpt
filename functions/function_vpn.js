// function_vpn.js
// requires wg and wg-quick config file saved to /etc/wireguard/wg0.conf

const { exec } = require('child_process');
const https = require('https');
const util = require('util');

const execPromise = util.promisify(exec);

const getPublicIP = async () => {
    return new Promise((resolve, reject) => {
        https.get('https://ipinfo.io/ip', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data.trim()));
        }).on('error', reject);
    });
};

const runCommand = async (command) => {
    try {
        const { stdout, stderr } = await execPromise(command);
        if (stderr) console.error(`stderr: ${stderr.trim()}`);
        return stdout.trim();
    }
    catch (error) {
        console.error(`Error running command: ${command}`);
        console.error(`stderr: ${error.stderr?.toString().trim() || error.message}`);
        return null;
    }
};

const isWireGuardRunning = async () => {
    try {
        const { stdout } = await execPromise('ip link show wg0');
        return stdout.includes('wg0');
    }
    catch (error) { return false; }
};


const function_vpn = async (command) => {
    switch (command) {
        case 'connect':
            if (!(await isWireGuardRunning())) {
                await runCommand('wg-quick up wg0');
                await new Promise(resolve => setTimeout(resolve, 2500));
                if (await isWireGuardRunning()) {
                    console.log('[function_vpn] Connected');
                    return true;
                }
                else {
                    console.log('[function_vpn] Failed to connect');
                    return false;
                }
            }
            else {
                console.log('[function_vpn] Already Connected');
                return true;
            }

        case 'status':
            const status = await isWireGuardRunning();
            console.log(`[function_vpn] Conection is ${status ? 'online' : 'offline'}.`);
            return status;

        case 'checkip':
            try {
                const ip = await getPublicIP();
                console.log(`[function_vpn] Current IP: ${ip}`);
                return ip ? true : false;
            }
            catch (error) {
                console.error('[function_vpn] Failed to fetch IP:', error);
                return false;
            }

        case 'disconnect':
            if (await isWireGuardRunning()) {
                await runCommand('wg-quick down wg0');
                await new Promise(resolve => setTimeout(resolve, 2500));
                if (!(await isWireGuardRunning())) {
                    console.log('[function_vpn] Disconnected');
                    return true;
                }
                else {
                    console.log('[function_vpn] Failed to disconnect.');
                    return false;
                }
            }
            else { return true; }

        default:
            return false;
    }
};

module.exports = { function_vpn };