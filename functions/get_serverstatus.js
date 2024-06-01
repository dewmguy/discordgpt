// get_serverstatus.js

const net = require('net');
const { Server } = require('@fabricio-191/valve-server-query');

const get_serverstatus = async ({ address, port, steam }) => {
  console.log("get_serverstatus function was called");
  try {
    const type = steam === 'true' ? 'steam' : 'web';
    console.log(`Checking ${type} server at ${address}:${port}`);
    
    if (type === 'steam') {
      const gamePort = port;
      console.log(`Attempting to query Steam server at ${address}:${gamePort}`);
      
      const server = await Server({ ip: `${address}`, port: gamePort, timeout: 5000 });
      const info = await server.getInfo();
      if(info) {
        const infoStringified = JSON.parse(JSON.stringify(info, (key, value) => typeof value === 'bigint' ? value.toString() : value ));
        console.log(infoStringified);
        return infoStringified;
      }
      else { return 'this game server appears to be down.'; }
    }

    return new Promise((resolve) => {
      const client = new net.Socket();
      
      client.setTimeout(5000);

      client.connect(port, address, () => {
        console.log('Connection successful');
        client.destroy();
        resolve({ status: "up", address, port });
      });

      client.on('error', (err) => {
        console.log('Connection failed:', err.message);
        resolve({ status: "down", address, port, error: err.message });
      });

      client.on('timeout', () => {
        console.log('Connection timeout');
        client.destroy();
        resolve({ status: "down", address, port, error: 'Connection timed out' });
      });
    });
  }
  catch (error) {
    console.log('Error occurred:', error.message);
    return { status: "down", address, port, error: error.message };
  }
};

module.exports = { get_serverstatus };

/*
{
  "name": "get_serverstatus",
  "description": "This function checks if a given web, game, or steam protocol game service at a given address and port is responding, including locally. Local servers include AzerothCore Warcraft (localhost:8085), Insurgency: Sandstorm (localhost:27131,Steam), Plex Media Server (192.168.1.11:32400), Valheim (localhost:2457,Steam), and Minecraft (localhost:25565).",
  "parameters": {
    "type": "object",
    "properties": {
      "address": {
        "type": "string",
        "description": "The server address to check.",
        "default": "127.0.0.1"
      },
      "port": {
        "type": "number",
        "description": "The port to check on the server.",
        "default": "80"
      },
      "steam": {
        "type": "string",
        "description": "If 'true' this will specify to the function that it should use a special steam protocol to verify the status of the given game server:port. Certain steam game servers, such as Insurgency, require the steam protocol. If 'false' this will use the standard connection method.",
        "default": "false",
        "enum": [
          "true",
          "false"
        ]
      }
    },
    "required": [
      "address",
      "port",
      "steam"
    ]
  }
}
*/