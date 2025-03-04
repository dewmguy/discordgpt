const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2');

const function_sftp = async ({ filePath }) => {
  try {
    //console.log("[function_sftp] Function called");
    if (!filePath) { throw new Error('Missing filePath parameter'); }
    const requiredEnv = ['SFTP_HOST', 'SFTP_PORT', 'SFTP_USER', 'SFTP_PASS', 'SFTP_REMOTEPATH'];
    const missingEnv = requiredEnv.filter(envVar => !process.env[envVar]);
    if (missingEnv.length) { throw new Error(`Missing environment variables: ${missingEnv.join(', ')}`); }
    const port = parseInt(process.env.SFTP_PORT, 10);
    if (isNaN(port) || port < 1 || port > 65535) { throw new Error("Invalid SFTP port"); }
    const fileStat = await fs.promises.stat(filePath);
    if (!fileStat.isFile()) { throw new Error(`${filePath} is not a valid file.`); }
    const remoteDir = process.env.SFTP_REMOTEPATH;
    const remoteFilePath = path.posix.join(remoteDir, path.basename(filePath));
    const localFilePath = path.resolve(filePath);
    //console.log(`[function_sftp] Local Path: ${localFilePath}`);
    //console.log(`[function_sftp] Remote Path: ${remoteFilePath}`);
    return new Promise((resolve, reject) => {
      const conn = new Client();
      let isRejected = false;
      const safeReject = (error) => {
        if (!isRejected) {
          isRejected = true;
          conn.destroy();
          console.error(error);
          reject(error);
        }
      };
      conn.on('ready', () => {
        //console.log('[function_sftp] SFTP Connection established.');
        conn.sftp((error, sftp) => {
          if (error) return safeReject(new Error(`SFTP Initialization Error: ${error.message}`));
          //console.log(`[function_sftp] Uploading file: ${localFilePath} → ${remoteFilePath}`);
          sftp.fastPut(localFilePath, remoteFilePath, (error) => {
            if (error) return safeReject(new Error(`SFTP Upload Error: ${error.message}`));
            //console.log(`[function_sftp] Upload complete: ${remoteFilePath}`);
            sftp.stat(remoteFilePath, (statErr, stats) => {
              if (statErr) return safeReject(new Error(`SFTP Upload Verification Failed: ${statErr.message}`));
              //console.log(`[function_sftp] File uploaded successfully: ${remoteFilePath} (${stats.size} bytes)`);
              fs.promises.unlink(localFilePath).then(() => {
                //console.log(`[function_sftp] Local file deleted: ${localFilePath}`);
                conn.end();
                resolve(true);
              }).catch((error) => safeReject(new Error(`SFTP Failed to delete local file: ${error.message}`)));
            });
          });
        });
      });
      conn.on('error', (error) => safeReject(new Error(error)));
      conn.connect({ host: process.env.SFTP_HOST, port: port, username: process.env.SFTP_USER, password: process.env.SFTP_PASS });
    });    
  }
  catch (error) {
    console.error("[function_sftp]: ", error);
    return { error: error.message };
  }
};

module.exports = { function_sftp };